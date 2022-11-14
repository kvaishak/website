import React, { useState } from "react";
import useCurrentWidth from "../../customHooks/Resizer";
import Contact from "../Contact/contact";

import styles from "../Menu/menu.module.css";
import Link from "next/link";
import { ThemeChanger, ThemeChangerMobile } from "../Theme/theme";
import Image from "next/image";
import { useRouter } from "next/router";
import { useTheme } from "next-themes";

const mobileWidthCutOff = 700;

export default function Menu() {
  const [click, setClick] = useState(false);
  const { theme } = useTheme();
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

  const closeMobileMenu = () => {
    document.body.style.overflow = "visible";
    setClick(false);
  };

  const handleClick = () => {
    let overflowValue = click ? "visible" : "hidden";
    document.body.style.overflow = overflowValue;
    setClick(!click);
  };

  if (width > mobileWidthCutOff && click) {
    closeMobileMenu();
  }

  const navBtnClick = () => {
    if (click) {
      closeMobileMenu();
    }
  };

  const navigationContainerStyle = `${styles.container} ${
    click ? styles.click : ""
  }`;

  return (
    <div className={navigationContainerStyle}>
      <div className={styles.navContainer}>
        <div className={styles.homeContainer} onClick={navBtnClick}>
          <Link href="/">
            <div className={styles.logoContainer}>
              shak<span>.</span>
              {/* <Image
                priority
                src={`/icons/Logo.png`}
                height={20}
                width={20}
                alt="Theme-changer"
                // onClick={clickHander}
              /> */}
            </div>
          </Link>

          <div className={styles.MenuItemsContainer}>
            <Contact svg="chat" label="Let's Chat" shortcut="/" />

            <div className={styles.MenuIconContainer} onClick={handleClick}>
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
        </div>

        <div className={`${styles.itemsContainer} ${styles.center}`}>
          {navMenuItems.map((navMenu) => (
            <div
              key={navMenu.path}
              onClick={navBtnClick}
              className={styles.navMenuItemsContainer}
            >
              <Link href={navMenu.path}>
                <a
                  className={
                    navMenu.path === router.pathname ? styles.selected : ""
                  }
                >
                  {navMenu.label}
                </a>
              </Link>
            </div>
          ))}
        </div>
        <div className={`${styles.itemsContainer} ${styles.right}`}>
          <Contact svg="chat" label="Let's Chat" shortcut="/" />
          <ThemeChanger />
        </div>

        <div className={styles.mobileThemeContainer}>
          <ThemeChangerMobile />
        </div>
      </div>
    </div>
  );
}
