import React from "react"
import { currencyFormatter } from "@/AnalyticsAll/StatComponents/util"
import { NoDataFound } from "@/CorporateMembershipReportingV2/common/NoDataFound"
import { ResponsiveSankey } from "@nivo/sankey";

export const CurrentTrendChart = ({ Trend = {}, domEl, handleChartClick = () => { }, ...props }) => {
  const { params: { groups_array } } = props

  return (
    <div className="lineChart" style={{ height: 600 }} ref={domEl}>
      {
        (!Trend?.nodes?.length) ? <NoDataFound /> :
          <ResponsiveSankey
            data={Trend}
            onClick={handleChartClick}
            sort="input"
            margin={{ top: 40, right: 180, bottom: 40, left: 180 }}
            align="justify"
            height="600"
            colors={node => node.color}
            nodeTooltip={node => (
              <b>
                {node.name} : {node.value}
              </b>
            )}
            nodeOpacity={1}
            nodeThickness={15}
            nodeInnerPadding={3}
            nodeSpacing={30}
            nodeBorderWidth={1}
            nodeBorderColor={{
              from: "color",
              modifiers: [["darker", 0.8]],
            }}
            linkOpacity={0.5}
            linkHoverOthersOpacity={0.1}
            enableLinkGradient={true}
            label={node => {
              return `${node.name} 
                  (${currencyFormatter(
                node.value,
                false
              )})
                  `;
            }}
            labelPosition="outside"
            labelOrientation="horizontal"
            labelPadding={5}
            labelTextColor={{ from: "color", modifiers: [["darker", 1]] }}
          />}
    </div>
  )
}