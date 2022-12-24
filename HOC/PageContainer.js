// Template for Containing the Header and the content and the footer for Normal Page

import React from "react";
import ClientOnly from "./ClientOnly";
import Head from "next/head";
import Footer from "../components/Footer/footer";
import util from "../styles/util.module.css";

const PageContainer = ({ children, title, description, clientOnly }) => {
  const pageTitle = title ? `${title} | Vaishak` : "Vaishak";

  const content = (
    <div className={util.container}>
      <Head>
        <title>{pageTitle}</title>
        <meta
          name="description"
          content={description ? description : "Vaishak Website"}
        />
        <meta name="og:title" content={pageTitle} />
        <meta
          name="og:description"
          content={description ? description : "Vaishak's Website"}
        />
        <meta
          property="og:image"
          content={`${
            process.env.VERCEL_URL ? "https://" + process.env.VERCEL_URL : ""
          }/api/og?title=${pageTitle}`}
        />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      {children}
      <Footer />
    </div>
  );

  return clientOnly === true ? (
    <ClientOnly>{content}</ClientOnly>
  ) : (
    <React.Fragment>{content}</React.Fragment>
  );
};

export default PageContainer;
