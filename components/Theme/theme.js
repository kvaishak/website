import styles from "../Theme/theme.module.css";

import Image from "next/image";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";

import ClientOnly from "../../HOC/ClientOnly";

export default function Theme() {
  const { theme, setTheme } = useTheme();

  let isLightTheme = theme === "light";
  const iconType = isLightTheme ? "SunIcon" : "MoonIcon";
  const iconClassName = isLightTheme ? "" : "iconInvert";

  const clickHander = () => {
    if (isLightTheme) {
      setTheme("dark");
    } else {
      setTheme("light");
    }
  };

  return (
    <ClientOnly>
      <div className={styles.logoIcon}>
        <Image
          priority
          className={iconClassName}
          src={`/icons/${iconType}.svg`}
          height={20}
          width={20}
          alt="Theme-changer"
          onClick={clickHander}
        />
      </div>
    </ClientOnly>
  );
}
