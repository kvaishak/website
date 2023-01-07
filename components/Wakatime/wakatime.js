import React from "react";
import { VictoryPie, VictoryContainer, VictoryLegend } from "victory";
import { useTheme } from "next-themes";
import style from "./wakatime.module.css";

const COLOR_RANGE = ["tomato", "orange", "gold", "cyan", "navy", "green"];
const DARK_MODE = "rgba(255, 255, 255, 0.9)";
const LIGHT_MODE = "rgb(55, 53, 47)";
const DATA_LIMIT = 6;

const Wakatime = ({ data }) => {
  const { theme, systemTheme } = useTheme();
  const isDarkMode =
    theme === "system" ? systemTheme === "dark" : theme === "dark";

  const formattedData = dataFormatter(data);
  const legendData = formatDataForLegend(formattedData);

  const textColor = isDarkMode ? DARK_MODE : LIGHT_MODE;

  // const chartEvents = eventConstructor();

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
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          width: "100%",
          flexWrap: "wrap",
        }}
      >
        <VictoryPie
          data={formattedData}
          colorScale={COLOR_RANGE}
          width={400}
          height={300}
          innerRadius={50}
          style={{
            data: {
              cursor: "pointer",
            },
            labels: {
              fill: textColor,
            },
          }}
          labels={({ datum }) => ``}
          // events={chartEvents}
          containerComponent={<VictoryContainer responsive={false} />}
        />

        <VictoryLegend
          width={400}
          height={300}
          x={125}
          y={50}
          orientation="vertical"
          gutter={20}
          data={legendData}
          style={{
            labels: {
              fill: textColor,
            },
          }}
          containerComponent={<VictoryContainer responsive={false} />}
        />
      </div>
    </div>
  );
};

function formatDataForLegend(data) {
  let dataForLegend = [];
  for (let i = 0; i < DATA_LIMIT; i++) {
    dataForLegend.push({
      name: `${data[i].x} : ${data[i].y} %`,
      symbol: {
        fill: COLOR_RANGE[i],
      },
    });
  }
  return dataForLegend;
}

function dataFormatter(sourceData) {
  const data = sourceData.data.map((datum) => ({
    x: datum.name,
    y: datum.percent,
  }));

  return data.slice(0, DATA_LIMIT);
}

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

export default Wakatime;
