import useBaseUrl from "@docusaurus/useBaseUrl";
import React from "react";
import { Navbar } from "@swmansion/t-rex-ui";

export default function NavbarWrapper(props) {
  const heroImages = {
    logo: useBaseUrl("/img/logo.svg"),
  };
  return <Navbar isAlgolia={false} isToggle={false} heroImages={heroImages} {...props} />;
}
