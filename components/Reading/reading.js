import React from "react";
import style from "./reading.module.css";

const Reading = ({ data }) => {
  const variables = {
    handle: "kvaishak",
    readingStatus: "IS_READING",
    layout: "list",
    limit: 20,
  };

  const formatter = new Intl.ListFormat("en", {
    style: "short",
    type: "conjunction",
  });

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
      >
        {data &&
          data.map((book) => (
            <div key={book.id} className={style.literalBookItem}>
              <a
                href={`https://literal.club/${variables.handle}/book/${book.slug}?utm_source=${variables.handle}&utm_medium=widget`}
                target="_blank"
                rel="noreferrer"
              >
                <div className={style.literalBookItem__inner}>
                  <div className={style.literalBookItem__image}>
                    <div className={style.literalBookItem__imageCover__outer}>
                      <img src={book.cover} alt={book.title} />
                    </div>
                  </div>
                  <div className={style.literalBookItem__info}>
                    <div className={style.literalBookItem__title}>
                      {book.title}
                    </div>
                    <div className={style.literalBookItem__authors}>
                      {formatter.format(book.authors.map((a) => a.name))}
                    </div>
                  </div>
                </div>
              </a>
            </div>
          ))}
      </div>
    </div>
  );
};

export default Reading;
