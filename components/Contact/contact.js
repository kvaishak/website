import styles from "./contact.module.css";
import React, { useEffect } from "react";
import Image from "next/image";
import * as Dialog from "@radix-ui/react-dialog";
import util from "../../styles/util.module.css";
import ContactContent from "./contactContent";
import * as Tooltip from "@radix-ui/react-tooltip";

export default function Contact({ label, shortcut }) {
  // var time = 0;

  // useEffect(() => {
  //   setInterval(function () {
  //     time++;
  //   }, 200);
  // }, []);

  // useEffect(() => {
  //   document.addEventListener("keypress", function (event) {
  //     if (event.key === shortcut) {
  //       document.getElementById("contactTrigger").click();
  //       time = 0;
  //     }
  //   });
  // });

  return (
    <Dialog.Root>
      <Dialog.Trigger asChild id="contactTrigger">
        <div className={styles.item}>
          <p className={styles.label}>{label}</p>
        </div>
      </Dialog.Trigger>
      <Dialog.Portal>
        <Dialog.Overlay className={styles.overlay} />
        <Dialog.Content
          className={styles.content}
          onOpenAutoFocus={(e) => e.preventDefault()}
        >
          <Dialog.Title className={styles.title}>Contact</Dialog.Title>
          <ContactContent inModal="true" />
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
