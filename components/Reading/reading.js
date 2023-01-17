import React from "react";
import style from "./reading.module.css";

const Reading = () => {
  return (
    <div className={style.container}>
      <h2>Currently Reading</h2>
      <div className="blank"></div>
      <div
        id="literal-widget"
        handle="kvaishak"
        status="IS_READING"
        layout="list"
        className={style.booksContainer}
      ></div>
    </div>
  );
};

export default Reading;
