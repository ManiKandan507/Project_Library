import React, { useEffect, useState } from "react"
import { currencyFormatter, stringToColour } from "@/AnalyticsAll/StatComponents/util"
import { NoDataFound } from "@/CorporateMembershipReportingV2/common/NoDataFound"
import TotalCountLabel from "./TotalCountLabel"
import CommonBarChart from './../common/Charts/CommonBarChart';

export const MembersChart = ({ currentMembers, isvertical = false, handleChartClick=()=>{}, chartRef, primary_color="#1890ff", height,domEl }) => {

    const [constructedData, setConstructedData] = useState([])
    
    useEffect(() => {
        if (currentMembers?.length) {
            let filteredData = currentMembers.map(memberGroup => {
                memberGroup["color"] = stringToColour(memberGroup.GroupName);
                return memberGroup;
            });
            setConstructedData(filteredData)
        }
    }, [currentMembers])

    const defaultTooltip =({ data, value, color })=>{
        return(
            <div style={{ padding: 5,color,background: "#222222"}}>
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
                <div>
                    <CommonBarChart
                        data={constructedData}
                        keys={['CountPerGroup']}
                        indexBy="GroupName"
                        layout={isvertical ? "vertical" : "horizontal"}
                        margin={{ top: 30, right: 120, bottom: 26, left: 40 }}
                        colors={defaultColors}
                        colorBy="indexValue"
                        onClick={handleChartClick}
                        axisLeft={isvertical ? true : false}
                        axisBottom={isvertical ? false : true}
                        enableLabel={false}
                        enableGridX={false}
                        enableGridY={false}
                        tooltip={defaultTooltip}
                        layers={["grid","axes","bars",(props) => TotalCountLabel({...props, isVertical: isvertical}), "markers","legends"]}
                        legendData={constructedData}
                        domEl={domEl}
                        chartRef={chartRef}
                        height={height}
                    />
                </div> :
            <NoDataFound/>}
        </div>
    )
}