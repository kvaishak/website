import React from "react";
import style from "./articlesList.module.css";

const ArticlesList = ({ data }) => {
  return (
    <div className={style.container}>
      <div className={style.gap}>&nbsp;</div>
      <p>
        A curated list of written content, including articles, Twitter links,
        blogs, and more, that I personally enjoyed reading.
      </p>
      <div className={style.gap}>&nbsp;</div>

      {data &&
        data.map((article) => (
          <div key={article.link} className={style.articlesItem}>
            <a href={article.link} target="_blank" rel="noreferrer">
              <div>
                <div className={style.articlesItem__title}>
                  {article.title} <span className={style.externalIcon}>↗</span>
                </div>
                <div className={style.articlesItem__authors}>
                  {article.author}
                </div>
              </div>
            </a>
          </div>
        ))}
    </div>
  );
};

export default ArticlesList;
