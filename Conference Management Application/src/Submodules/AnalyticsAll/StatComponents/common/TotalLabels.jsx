import React from "react";
import { currencyFormatter } from "@/AnalyticsAll/StatComponents/utils";

const TotalLabels = ({ bars, yScale, key = "CountPerGroup", currency = false, onTotalLabelClick = () => { }, screen }) => {
  // space between top of stacked bars and total label
  const labelMargin = 28;
  return bars.map(({ data: { data, indexValue }, x, width }, i) => {
    // sum of all the bar values in a stacked bar
    const total = data[key] && data[key] > 0 ? data[key] : "";
    return (
      <g
        transform={`translate(${x}, ${yScale(total) - labelMargin})`}
        key={`${indexValue}-${i}`}
      >
        <text
          // add any class to the label here
          className="bar-total-label"
          x={width / 2}
          y={labelMargin / 2}
          textAnchor="middle"
          alignmentBaseline="central"
          // add any style to the label here
          style={{
            fill: "rgb(51, 51, 51)"
          }}
        // onClick={() => onTotalLabelClick((screen === SALES_ACTIVITY_SCREEN) ? data.date : { data, value: data.CountPerGroup, indexValue: data.GroupName })}
        >
          {`${currency ? currencyFormatter(total) : currencyFormatter(total, false)}`}
        </text>
      </g>
    );
  });
};

export default TotalLabels