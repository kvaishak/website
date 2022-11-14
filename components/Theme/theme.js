import styles from "../Theme/theme.module.css";

import Image from "next/image";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";

import ClientOnly from "../../HOC/ClientOnly";

export const ThemeChanger = () => {
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
};

// Mobile Theme
export const ThemeChangerMobile = () => {
  const { theme, setTheme } = useTheme();
  let isLightChecked = theme == "light" ? "checked" : null;
  let isDarkChecked = theme == "dark" ? "checked" : null;
  let isAutoChecked = theme == "system" ? "checked" : null;

  return (
    <ClientOnly>
      <div className={styles.tabs}>
        <input
          className={styles.input}
          type="radio"
          id="radio-1"
          name="tabs"
          onChange={() => setTheme("light")}
          checked={isLightChecked}
        />
        <label className={styles.tab} htmlFor="radio-1">
          Light
        </label>
        <input
          className={styles.input}
          type="radio"
          id="radio-2"
          name="tabs"
          onChange={() => setTheme("dark")}
          checked={isDarkChecked}
        />
        <label className={styles.tab} htmlFor="radio-2">
          Dark
        </label>
        <input
          className={styles.input}
          type="radio"
          id="radio-3"
          name="tabs"
          onChange={() => setTheme("system")}
          checked={isAutoChecked}
        />
        <label className={styles.tab} htmlFor="radio-3">
          Auto
        </label>
        <span className={styles.glider}></span>
      </div>
    </ClientOnly>
  );
};
