import React, { useEffect, useState } from "react"
import { currencyFormatter, stringToColour } from "@/AnalyticsAll/StatComponents/util"
import { NoDataFound } from "@/MembershipReportingV2/common/NoDataFound"
import TotalCountLabel from "./TotalCountLabels"
import CommonBarChart from "../common/CommonBarChart"
import { customColor } from "../util/helper"

<<<<<<< HEAD
export const MembersChart = ({ currentMembers, isvertical = false, handleChartClick = () => { }, chartRef, primary_color="#1890ff", height}) => {
=======
export const MembersChart = ({ currentMembers, isvertical = false, handleChartClick = () => { }, chartRef , height, primary_color}) => {

>>>>>>> 869aae639d685259d1760f9199b6e8e54991839b
    const [constructedData, setConstructedData] = useState([])

    useEffect(() => {
        if (currentMembers?.length) {
            // let filteredData = currentMembers.map(memberGroup => {
            //     memberGroup["color"] = stringToColour(memberGroup.GroupName);
            //     return memberGroup;
            // });
            // setConstructedData(filteredData)
            setConstructedData(customColor(primary_color, currentMembers))

        }
    }, [currentMembers])

    const defaultTooltip = ({ data, value, color }) => {
        return (
            <div style={{ padding: 5, color: "#ffffff", background: "#222222" }}>
                <span>
                    {data.GroupName} : {currencyFormatter(value, false)}
                </span>
            </div>
        )
    }   

    const defaultColors = ({ data }) => {
        return data.color
    }

    return (
        <div>
            {constructedData.length > 0 ?
                <div >
                    <CommonBarChart
                        data={constructedData}
                        keys={['TotalCount']}
                        indexBy='GroupName'
                        layout={isvertical ? 'vertical' : 'horizontal'}
                        margin={{ top: 20, right: 50, bottom: 26, left: 60 }}
                        colors={defaultColors}
                        colorBy='indexValue'
                        onClick={handleChartClick}
                        axisLeft={isvertical ? true : ''}
                        axisBottom={isvertical ? '' : true}
                        enableLabel={false}
                        enableGridX={false}
                        enableGridY={false}
                        tooltip={defaultTooltip}
                        layers={["grid", "axes", "bars", (props) => TotalCountLabel({ ...props, isVertical: isvertical, key:'TotalCount' }), "markers", "legends"]}
                        legendData={constructedData}
                        chartRef={chartRef}
                        height={height}
                    />
                </div>
                : <NoDataFound />}
        </div>
    )
}