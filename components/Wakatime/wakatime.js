import React from "react";
import { VictoryPie, VictoryContainer, Bar } from "victory";
import { useTheme } from "next-themes";
import style from "./wakatime.module.css";

const Wakatime = ({ data }) => {
  const { theme, systemTheme } = useTheme();
  const isDarkMode =
    theme === "system" ? systemTheme === "dark" : theme === "dark";

  const formattedData = dataFormatter(data);
  const textColor = isDarkMode ? "rgba(255, 255, 255, 0.9)" : "rgb(55, 53, 47)";
  const chartEvents = eventConstructor();

  return (
    <div className={style.container}>
      <h2>Wakatime</h2>
      <div className="blank"></div>
      <div className="text">
        This graph displays how I spent my coding time throughout the course of
        the previous week, tracked through{" "}
        <a
          target="_blank"
          rel="noopener noreferrer"
          className="link"
          href="https://wakatime.com/"
        >
          Wakatime
        </a>
        . If the graph seems broken, that indicates I didn&apos;t code last week
        and was instead having fun.
      </div>
      <div className="blank"></div>
      <div style={{ display: "flex", justifyContent: "center", width: "100%" }}>
        <VictoryPie
          data={formattedData}
          colorScale={["tomato", "orange", "gold", "cyan", "navy"]}
          width={400}
          height={300}
          innerRadius={50}
          style={{
            parent: {
              padding: "30px 0",
            },
            data: {
              cursor: "pointer",
            },
            labels: {
              fill: textColor,
            },
          }}
          events={chartEvents}
          containerComponent={<VictoryContainer responsive={false} />}
        />
      </div>
    </div>
  );
};

function eventConstructor() {
  return [
    {
      target: "data",
      eventHandlers: {
        onMouseOver: () => {
          return [
            {
              target: "data",
              mutation: ({ style }) => {
                return { style: { ...style, stroke: "#181a1b" } };
              },
            },
            {
              target: "labels",
              mutation: ({ style, datum }) => {
                return {
                  style: { ...style, fill: "#33cc66" },
                  text: `${datum.y}%`,
                };
              },
            },
          ];
        },
        onMouseOut: () => {
          return [
            {
              target: "data",
              mutation: ({ style }) => {
                return { style: { ...style, stroke: "none" } };
              },
            },
            {
              target: "labels",
              mutation: ({ datum }) => {
                return { text: datum.x };
              },
            },
          ];
        },
      },
    },
  ];
}

function dataFormatter(sourceData) {
  const data = sourceData.data.map((datum) => ({
    x: datum.name,
    y: datum.percent,
  }));

  return data.slice(0, 5);
}

export default Wakatime;
