// Template for Containing the Header and the content and the footer for Normal Page

import React from "react";
import ClientOnly from "./ClientOnly";
import Head from "next/head";
import Footer from "../components/Footer/footer";
import util from "../styles/util.module.css";

const PageContainer = ({ children, title, description, clientOnly }) => {
  const pageTitle = title ? title : "Vaishak Kaippanchery";
  const pageDescription = description
    ? description
    : "Welcome to my virtual haven on the internet!";
  const pageURL = process.env.PUBLIC_DEPLOYED_URL
    ? process.env.PUBLIC_DEPLOYED_URL
    : "https://kvaishak.com";
  const imageURL = `${pageURL}/api/og?title=${pageTitle}&description=${pageDescription}`;

  const headerContent = (
    <Head>
      <title>{pageTitle}</title>
      <meta name="description" content={pageDescription} />
      <meta name="og:title" content={pageTitle} />
      <meta name="og:description" content={pageDescription} />
      <meta property="og:image" content={imageURL} />
      {/* Twitter OG Tags */}
      <meta name="twitter:card" content="summary_large_image"></meta>
      <meta name="twitter:title" content={pageTitle} />
      <meta name="twitter:site" content="@kvaishark" />
      <meta name="twitter:description" content={pageDescription} />
      <meta name="twitter:image" content={imageURL} />
      <link rel="icon" href="/favicon.ico" />
    </Head>
  );

  const content = (
    <div className={util.container}>
      {children}
      <Footer />
    </div>
  );

  return clientOnly === true ? (
    <React.Fragment>
      {headerContent}
      <ClientOnly>{content}</ClientOnly>
    </React.Fragment>
  ) : (
    <React.Fragment>
      {headerContent}
      {content}
    </React.Fragment>
  );
};

export default PageContainer;
