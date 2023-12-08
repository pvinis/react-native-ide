import child_process from "child_process";
import { promisify } from "util";
import readline from "readline";
import path from "path";
import { ANDROID_HOME } from "./android";

const asyncExec = promisify(child_process.exec);

interface SdkRepositoryEntry {
  path: string;
  version: string;
  description: string;
  location?: string;
}

export interface AndroidImageEntry extends SdkRepositoryEntry {
  apiLevel: number;
}

// Example image path: "system-images;android-31;default;x86_64"
function getApiLevelFromImagePath(imagePath: string): number {
  return parseInt(imagePath.split(";")[1].split("-")[1]);
}

async function runSdkManagerList() {
  const { stdout } = await asyncExec("sdkmanager --list");
  return stdout;
}

function filterOtherEntries(entry: SdkRepositoryEntry) {
  return entry.path.startsWith("system-images");
}

function mapToImageEntry(imageEntry: SdkRepositoryEntry) {
  return { ...imageEntry, apiLevel: getApiLevelFromImagePath(imageEntry.path) };
}

async function getInstalledAndroidSdkEntries(): Promise<
  [SdkRepositoryEntry[], SdkRepositoryEntry[]]
> {
  const stdout = await runSdkManagerList();
  const rawTable = stdout.split("Installed packages:")[1];
  const [parsedInstalled, parsedAvailable] = rawTable.split("Available Packages:").map((rawText) =>
    rawText
      .split("\n")
      .filter((line) => !!line.length)
      .slice(2)
      .map((line) => line.split("|").map((cell) => cell.trim()))
  );

  const installedEntries = parsedInstalled.map((installed) => ({
    path: installed[0],
    version: installed[1],
    description: installed[2],
    location: installed[3],
  }));

  const availableEntries = parsedAvailable.map((available) => ({
    path: available[0],
    version: available[1],
    description: available[2],
  }));

  return [installedEntries, availableEntries];
}

export async function getAndroidSystemImages(): Promise<
  [AndroidImageEntry[], AndroidImageEntry[]]
> {
  const [installedEntries, availableEntries] = await getInstalledAndroidSdkEntries();
  const installedImages = installedEntries
    .filter(filterOtherEntries)
    .map(mapToImageEntry)
    .filter((image) => !!image.apiLevel);

  const availableImages = availableEntries
    .filter(filterOtherEntries)
    .map(mapToImageEntry)
    .filter((image) => !!image.apiLevel);

  return [installedImages, availableImages];
}

export async function installSystemImages(
  sysImagePaths: string[],
  onLine?: (line: string) => void
): Promise<void> {
  return new Promise<void>((resolve, reject) => {
    const downloadProcess = child_process.spawn(
      `sdkmanager ${sysImagePaths.map((imgPath) => `"${imgPath}"`).join(" ")}`,
      {
        shell: true,
      }
    );

    if (onLine) {
      const rl = readline.createInterface({
        input: downloadProcess.stdout,
      });

      rl.on("line", onLine);
    }

    downloadProcess.on("exit", (code) => {
      if (code !== 0) {
        reject(new Error(`Command exited with code ${code}`));
      } else {
        resolve();
      }
    });

    downloadProcess.on("error", (err) => {
      reject(err);
    });
  });
}

export async function removeSystemImages(sysImagePaths: string[]) {
  const removalPromises = sysImagePaths.map((sysImagePath) => {
    const pathToRemove = path.join(ANDROID_HOME, sysImagePath);
    console.log(`Removing directory ${pathToRemove}`);
    asyncExec(`rm -rf ${pathToRemove}`);
  });
  return Promise.all(removalPromises);
}