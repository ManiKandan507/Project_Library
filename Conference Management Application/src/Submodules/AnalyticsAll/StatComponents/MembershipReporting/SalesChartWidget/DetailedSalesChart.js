import React, { useState, useEffect } from "react"
import { currencyFormatter, stringToColour } from "@/AnalyticsAll/StatComponents/util";
import CommonBarChart from "../common/CommonBarChart";
import TotalCountLabel from "../MemberChartWidget/TotalCountLabels";

export const DetailedSalesChart = ({ salesActivity, handleChartClick = () => { }, groups_array, membersGroup, dataSource, chartRef, type }) => {

    const formatGroupName = (value = "") => {
        return `${value.replace(/[^A-Z0-9]/gi, "_").toLowerCase()}`;
    };

    const [allGroupMap, setAllGroupMap] = useState({});
    const [selectedKeys, setSelectedKeys] = useState({});
    const [chartColorData, setChartColorsData] = useState();
    const [groupChartData, setGroupChartData] = useState();
    const [legendData, setLegendData] = useState()

    useEffect(() => {
        let groupDict = {};
        for (const group in groups_array) {
            groupDict[groups_array[group].groupid] =
                groups_array[group].groupname;
        }
        setAllGroupMap(groupDict)
    }, [groups_array])

    useEffect(() => {
        let groupName = {};
        for (const group in groups_array) {
            groupName[formatGroupName(groups_array[group].groupname)] =
                groups_array[group].groupname;
        }
        setGroupChartData(groupName)
    }, [groups_array])

    useEffect(() => {
        let groupName = [];
        membersGroup.map((data, key) => {
            salesActivity.map((sales) => {
                let name = formatGroupName(membersGroup[key])
                if (sales[`${name}Title`] === data) {
                    groupName.push(name)
                }
            })
            return data
        })
        let names = [...new Set(groupName)]
        setSelectedKeys(names.reverse())
    }, [membersGroup, salesActivity])

    useEffect(() => {
        let colorData = {};
        for (const key in allGroupMap) {
            colorData[formatGroupName(allGroupMap[key])] = stringToColour(allGroupMap[key]);
        }
        setChartColorsData(colorData);
    }, [allGroupMap]);

    useEffect(() => {
        let legendData = [];
        dataSource.forEach(group => {
            let id = group.GroupID
            let GroupName = group.GroupName;
            let color = groupColors[GroupName.toLowerCase().replace(/(\s|\()/g,"_").
            replace(/\)/,"")]
            // let color = stringToColour(group.GroupName)
            legendData.push({ id, GroupName, color })
        })
        let MembersIds = legendData.map(member => member.id)
        let data = legendData.filter(({ id }, index) => !MembersIds.includes(id, index + 1))
        setLegendData(data)
    }, [dataSource])

    const defaultTooltip = ({ id, data, value, color }) => {
        return (
            <div style={{ padding: 5, color, background: "#222222" }}>
                <span> {groupChartData[id]} : {currencyFormatter(value, false)} </span>
            </div>
        )
    }

    const groupColors = {}
    salesActivity.forEach(data => {
        Object.entries(data).forEach(object => {
            if (object[0].includes("Color")) {
                const group = object[0].replace(/(_*|_*Color|Color)$/, '')
                groupColors[group] = object[1]
            }
        })
    })

    const getCustomColors = ({ id }) => {
        const groupName = id.replace(/_*$/,"")
        return groupColors[groupName];
        // return chartColorData[id];
    };

    return (
        <div>
            <>
                {/* <CommonBarCharts
                data={salesActivity}
                keys={selectedKeys}
                indexBy={'date'}
                layout={"vertical"}
                margin={{ top: 20, right: 0, bottom: 66, left: 60 }}
                colors={getCustomColors}
                colorBy="indexValue"
                onClick={handleChartClick}
                axisLeft={true}
                axisBottom={{
                    tickSize: 5,
                    tickPadding: 5,
                    tickRotation: -40,
                    legendPosition: "middle",
                    legendOffset: 60,
                }}
                enableLabel={false}
                enableGridX={false}
                enableGridY={false}
                tooltip={defaultTooltip}
                chartRef={chartRef}
                domEl={chartRef}
                layers={["grid", "axes", "bars", (props) => TotalCountLabel({ ...props, isVertical:true, key:'total', type: type }), "markers", "legends"]}
                legendData={legendData} >
            </CommonBarCharts> */}
            </>
            <CommonBarChart
                data={salesActivity}
                keys={selectedKeys}
                indexBy={'date'}
                layout={"vertical"}
                margin={{ top: 20, right: 0, bottom: 66, left: 60 }}
                colors={getCustomColors}
                colorBy="indexValue"
                onClick={handleChartClick}
                axisLeft={{
                    tickSize: 5,
                    tickPadding: 5,
                    tickRotation: 0,
                    format: value => `$${value}`
                }}
                axisBottom={{
                    tickSize: 5,
                    tickPadding: 5,
                    tickRotation: -40,
                    legendPosition: "middle",
                    legendOffset: 60,
                }}
                enableLabel={false}
                enableGridX={false}
                enableGridY={false}
                tooltip={defaultTooltip}
                chartRef={chartRef}
                domEl={chartRef}
                layers={["grid", "axes", "bars", (props) => TotalCountLabel({ ...props, isVertical: true, key: 'total', type: type }), "markers", "legends"]}
                legendData={legendData}
            />
        </div>
    )
}