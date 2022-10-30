import styles from "../Theme/theme.module.css";

import Image from "next/image";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";

export default function Theme() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  let isLightTheme = theme == "light" ? true : false;
  const iconType = isLightTheme ? "SunIcon" : "MoonIcon";
  const iconClassName = isLightTheme ? "" : "iconInvert";

  const clickHander = () => {
    if (isLightTheme) {
      setTheme("dark");
    } else {
      setTheme("light");
    }
  };

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return null;
  }

  return (
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
  );
}
