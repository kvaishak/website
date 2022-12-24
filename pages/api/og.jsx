import { ImageResponse } from "@vercel/og";

export const config = {
  runtime: "experimental-edge",
};

export default function handler(req) {
  try {
    const { searchParams } = new URL(req.url);

    // ?title=<title>
    const hasTitle = searchParams.has("title");
    const title = hasTitle
      ? searchParams.get("title")?.slice(0, 100)
      : "Vaishak Kaippanchery";

    // ?description=<description>
    const hasDescription = searchParams.has("description");
    const description = hasDescription
      ? searchParams.get("description")?.slice(0, 100)
      : "";

    return new ImageResponse(
      (
        <div
          style={{
            height: "100%",
            width: "100%",
            display: "flex",
            textAlign: "center",
            alignItems: "center",
            justifyContent: "center",
            flexDirection: "column",
            flexWrap: "nowrap",
            backgroundColor: "white",
            backgroundImage:
              "radial-gradient(circle at 25px 25px, lightgray 2%, transparent 0%), radial-gradient(circle at 75px 75px, lightgray 2%, transparent 0%)",
            backgroundSize: "100px 100px",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              alignContent: "center",
              justifyContent: "center",
              justifyItems: "center",
            }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              alt="Vercel"
              height={200}
              src="data:image/svg+xml,%3Csvg width='80' height='80' viewBox='0 0 80 80' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M15.0355 28.4589C16.2213 30.5273 18.8638 31.2359 20.9253 30.0382L21.9851 29.4224C23.4438 28.575 23.9442 26.7085 23.105 25.245V25.245C21.9325 23.2005 23.4086 20.6526 25.7654 20.6526H50.8789C54.7205 20.6526 57.1271 24.8049 55.2173 28.1382L42.6285 50.1108C41.4628 52.1454 38.5282 52.1449 37.3633 50.1099V50.1099C36.5264 48.6479 34.6586 48.1477 33.2031 48.9958L32.0993 49.639C30.0569 50.829 29.3575 53.4442 30.5331 55.4949L35.6564 64.4318C37.5777 67.7832 42.4117 67.7828 44.3324 64.431L70.0877 19.486C71.9979 16.1527 69.5914 12 65.7495 12H14.2297C10.3875 12 7.98108 16.1534 9.89199 19.4867L15.0355 28.4589Z' fill='%2333CC66'/%3E%3C/svg%3E"
              style={{ margin: "0 30px" }}
              width={232}
            />
          </div>
          <div
            style={{
              fontSize: 60,
              fontStyle: "normal",
              letterSpacing: "-0.025em",
              color: "black",
              marginTop: 30,
              padding: "0 120px",
              lineHeight: 1.4,
              whiteSpace: "pre-wrap",
            }}
          >
            {title}
          </div>
          <div
            style={{
              fontSize: 35,
              fontStyle: "normal",
              letterSpacing: "-0.025em",
              color: "grey",
              marginTop: 10,
              padding: "0 120px",
              lineHeight: 1.4,
              whiteSpace: "pre-wrap",
            }}
          >
            {description}
          </div>
        </div>
      ),
      {
        width: 1200,
        height: 630,
      }
    );
  } catch (e) {
    console.log(`${e.message}`);
    return new Response(`Failed to generate the image`, {
      status: 500,
    });
  }
}
