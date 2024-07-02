import React, { createRef, useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { ResponsiveBar } from "@nivo/bar";
import _isEmpty from "lodash/isEmpty";
import { Spin } from "antd";

import TotalLabels from "../TotalLabels"
import NoDataFound from "../NoDataFound";
import { getMemberDetailsRequest, handleAllMembersExport, sendEmailRequest, showModal } from '../../../../appRedux/actions'
import MembersInfoModal from '../../Common/MembersInfoModal'
import { PAGE_SIZE } from "../../../../constants";
import { currencyFormatter } from "../../../../helpers/common";
import ChartHeader from "../ChartHeader";


const CustomResponsiveBarCanvas = ({
    data = [],
    keys = ["CountPerGroup"],
    margin = {},
    indexBy = "GroupName",
    borderColor = {},
    colors,
    tooltip,
    axisTop = null,
    axisRight = null,
    axisBottom = {},
    axisLeft = {},
    labelSkipWidth = 0,
    labelSkipHeight = 0,
    labelTextColor= "black",
    lineStyle="None",
    height = 500,
    className = "lineChart",
    customDateLayerConfig = {},
    enableLabel = false,
    sourceHex = '',
    memberLoading = false,
    screen = '',
    payload = {},
    appdir = '',
    chartHeaderData = {},
    loader = false
}) => {
    const chartRef = createRef();
    const dispatch = useDispatch();
    const [showMemberModal, setShowMemberModal] = useState(false)
    const [selectedItem, setSelectedItem] = useState({})
    const modalVisible = useSelector(({ reporting }) => reporting.showModal) || false
    const membersInfo = useSelector(({ reporting }) => reporting.membersInfo?.data)
    useEffect(() => {
        if (modalVisible) {
            setShowMemberModal(modalVisible)
        }
    }, [modalVisible])
    margin = {
        ...margin,
        top:margin["top"] ?? 50, 
        right:margin["right"] ?? 130, 
        bottom:margin["bottom"] ?? 100, 
        left:margin["left"] ?? 60 
    }
    borderColor = { 
        ...borderColor,
        from: borderColor["from"] ?? "color",
        modifiers: borderColor["modifiers"] ?? [["darker", 1.6]]
    } 
    axisBottom = {
        ...axisBottom,
        tickSize: axisBottom["tickSize"] ?? 5,
        tickPadding: axisBottom["tickPadding"] ?? 5,
        tickRotation: axisBottom["tickRotation"] ?? -21,
        legend: axisBottom["legend"] ?? "Groups",
        legendPosition: axisBottom["legendPosition"] ?? "middle",
        legendOffset: axisBottom["legendOffset"] ?? 80
    }
    axisLeft = {
        ...axisLeft,
        tickSize: axisLeft["tickSize"] ?? 1,
        tickPadding: axisLeft["tickPadding"] ?? 1,
        tickRotation: axisLeft["tickRotation"] ?? 0,
        legend: axisLeft["legend"] ?? "Number of Members",
        legendPosition: axisLeft["legendPosition"] ?? "middle",
        legendOffset: axisLeft["legendOffset"] ?? -40
    }
    customDateLayerConfig = {
        ...customDateLayerConfig,
        textAlign: customDateLayerConfig["textAlign"] ?? 'right',
        fontSize: customDateLayerConfig['fontSize'] ?? '20px',
        color: customDateLayerConfig["color"] ?? '#2a2a2a'
    }

    const defaultColors = ({ id, data }) => {
        return data["color"];
    }
    const defaultTooltip = ({ value, color, indexValue }) => (
         <div
            style={{
                padding: 5,
                color,
                background: "#222222",
            }}
        >
            <span>
                {indexValue} : {currencyFormatter(value, false)}
            </span>
        </div>
    )
    const handleClick = val => {
        setSelectedItem({ ...val, groupTitle: val.indexValue })
        dispatch(getMemberDetailsRequest({ screen, sourceHex, groupid: val.data.GroupID, detailed: 1, offset: 0, limit: PAGE_SIZE, ...payload }))
        dispatch(showModal(false))
    }
    chartHeaderData["downloadChart"] = {...chartHeaderData["downloadChart"], disabled: loader, chartRef }
    return (
    <div>
        <ChartHeader {...chartHeaderData}/>
        {loader ? (
            <Spin
                size="large"
                style={{
                    marginTop: "25%",
                    marginLeft: "50%",
                }}
            />
        ) : (<div>
                {_isEmpty(data) ? <NoDataFound /> :
                    <div>
                        <Spin spinning={memberLoading} size="large">
                            <div ref={chartRef} className={className ?? "lineChart"} style={{ height: height }} >
                                <ResponsiveBar
                                    data={data}
                                    onClick={handleClick}
                                    enableLabel={enableLabel}
                                    keys={keys}
                                    margin={margin}
                                    indexBy={indexBy}
                                    borderColor={borderColor}
                                    colors={colors ?? defaultColors}
                                    tooltip={tooltip ?? defaultTooltip}
                                    axisTop={axisTop}
                                    axisRight={axisRight}
                                    axisBottom={axisBottom}
                                    axisLeft={{
                                        format: value =>
                                            currencyFormatter(value, false)
                                    }}
                                    labelSkipWidth={labelSkipWidth}
                                    labelSkipHeight={labelSkipHeight}
                                    labelTextColor={labelTextColor}
                                    lineStyle={lineStyle}
                                    layers={["grid", "axes", "bars", (props) => TotalLabels({...props, onTotalLabelClick: handleClick,screen:screen
                                    }), "markers", "legends"]}
                                    legends={[
                                        {
                                            dataFrom: 'keys',
                                            data: data.map((item) => ({
                                                color: item.color,
                                                id: item.GroupID,
                                                label: item.GroupName,
                                                data: { ...item },
                                                value: item.CountPerGroup,
                                                indexValue: item.GroupName
                                            })),
                                            onClick: (d) => {
                                                handleClick(d)
                                            },
                                            anchor: 'bottom-right',
                                            direction: 'column',
                                            justify: false,
                                            translateX: 130,
                                            translateY: 0,
                                            itemsSpacing: 2,
                                            itemWidth: 100,
                                            itemHeight: 20,
                                            itemDirection: 'right-to-left',
                                            itemOpacity: 0.85,
                                            symbolSize: 20,
                                            effects: [
                                                {
                                                    on: 'hover',
                                                    style: {
                                                        itemOpacity: 1
                                                    }
                                                }
                                            ]
                                        }
                                    ]}
                                />
                            </div>
                        </Spin>
                        {showMemberModal && <MembersInfoModal fileName={chartHeaderData["downloadChart"]?.fileName} appdir={appdir} payload={payload} screen={screen} sourceHex={sourceHex} selectedItem={selectedItem} membersInfo={membersInfo} handleClose={() => {
                            dispatch(showModal(false))
                            setShowMemberModal(false)
                            dispatch(handleAllMembersExport(false));
                            dispatch(sendEmailRequest(false));
                        }} visible={showMemberModal} />}
                    </div>
                }
            </div>) 
        }
            
    </div>
    )
}

export default CustomResponsiveBarCanvas