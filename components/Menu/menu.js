import React, { useState } from "react";
import useCurrentWidth from "../../styles/customHooks/Resizer";

import styles from "../Menu/menu.module.css";
import Link from "next/link";
import Theme from "../Theme/theme";
import Image from "next/image";
import { useRouter } from "next/router";
import { useTheme } from "next-themes";

export default function Menu() {
  const [click, setClick] = useState(false);
  const { theme, setTheme } = useTheme();
  let width = useCurrentWidth();
  const router = useRouter();

  const iconClassName = theme == "light" ? "" : "iconInvert";

  const navMenuItems = [
    {
      label: "Work",
      path: "/work",
    },
    {
      label: "Writings",
      path: "/writings",
    },
  ];

  return (
    <div className={styles.container}>
      <Link href="/">
        <div className={styles.homeContainer}>
          shak{" "}
          <Image
            priority
            className={iconClassName}
            src={`/icons/Corner.svg`}
            height={20}
            width={20}
            alt="Theme-changer"
            // onClick={clickHander}
          />
        </div>
      </Link>
      <div className={styles.itemsContainer}>
        {navMenuItems.map((navMenu) => (
          <Link key={navMenu.path} href={navMenu.path}>
            <a
              className={
                navMenu.path === router.pathname ? styles.selected : ""
              }
            >
              {navMenu.label}
            </a>
          </Link>
        ))}
      </div>
      <div className={styles.itemsContainer}>
        <div className={styles.menuButton}>
          <span>Let&apos;s chat</span>
        </div>
        <Theme />
      </div>

      <div className={styles.MenuIconContainer}>
        <Image
          priority
          className={iconClassName}
          src={`/icons/Menu.svg`}
          height={20}
          width={20}
          alt="Theme-changer"
          // onClick={clickHander}
        />
      </div>
    </div>
  );
}
