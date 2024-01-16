import React from "react";
import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import * as Switch from "@radix-ui/react-switch";

import "./shared/Dropdown.css";
import { useModal } from "../providers/ModalProvider";

import DiagnosticView from "../views/DiagnosticView";
import AndroidImagesView from "../views/AndroidImagesView";
import ManageDevicesView from "../views/ManageDevicesView";

interface SettingsDropdownProps {
  children: React.ReactNode;
}

function SettingsDropdown({ children }: SettingsDropdownProps) {
  const { openModal } = useModal();
  return (
    <DropdownMenu.Root>
      <DropdownMenu.Trigger asChild>
        <div>{children}</div>
      </DropdownMenu.Trigger>

      <DropdownMenu.Portal>
        <DropdownMenu.Content className="dropdown-menu-content">
          <DropdownMenu.Item
            className="dropdown-menu-item"
            onSelect={() => {
              // @ts-ignore TODO fix this
              openModal("Diagnostics", <DiagnosticView />);
            }}>
            Run diagnostics...
          </DropdownMenu.Item>
          <DropdownMenu.Item
            className="dropdown-menu-item"
            onSelect={() => {
              // TODO: handle this one
            }}>
            Clean rebuild (purge build cache)
          </DropdownMenu.Item>
          <DropdownMenu.Separator className="dropdown-menu-separator" />
          <DropdownMenu.Item
            className="dropdown-menu-item"
            onSelect={() => {
              // @ts-ignore TODO fix this
              openModal("Manage Android SDKs", <AndroidImagesView />);
            }}>
            Manage Android SDKs...
          </DropdownMenu.Item>
          <DropdownMenu.Item
            className="dropdown-menu-item"
            onSelect={() => {
              openModal("Manage Devices", <ManageDevicesView />);
            }}>
            Manage devices...
          </DropdownMenu.Item>
          <DropdownMenu.Arrow className="dropdown-menu-arrow" />
        </DropdownMenu.Content>
      </DropdownMenu.Portal>
    </DropdownMenu.Root>
  );
}

export default SettingsDropdown;