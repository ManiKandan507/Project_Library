import React, { createRef, useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { ResponsiveBar } from "@nivo/bar";
import _isEmpty from "lodash/isEmpty";
import _forEach from "lodash/forEach";
import _every from "lodash/every";
import { Spin } from "antd";

import TotalLabels from "../TotalLabels"
import NoDataFound from "../NoDataFound";
import { handleAllMembersExport, sendEmailRequest, showModal } from '../../../../appRedux/actions'
import DetailsModal from '../../Common/DetailsModal'
import { PAGE_SIZE } from "../../../../constants";
import { currencyFormatter } from "../../../../helpers/common";

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
    labelSkipHeight = 10,
    labelTextColor = "black",
    lineStyle = "None",
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
    loader = false,
    layers = [],
    label = () => { },
    handleClick = () => { },
    modelTitle = '',
    barChartData,
    tableColumnKey,
    tableData,
    tableLoading,
    paginationTotalCount = 0,
    handlePagination,
    page,
    handleonCloseModal = () => {},
    noDataLabel = ""
}) => {

    const chartRef = createRef();
    const dispatch = useDispatch();
    const [selectedItem, setSelectedItem] = useState({})
    const modalVisible = useSelector(({ reporting }) => reporting.showModal) || false

    useEffect(() => {
        if (paginationTotalCount) {
            setSelectedItem({
                totalCount: paginationTotalCount
            })
        }
    }, [paginationTotalCount]);

    margin = {
        ...margin,
        top: margin["top"] ?? 50,
        right: margin["right"] ?? 130,
        bottom: margin["bottom"] ?? 100,
        left: margin["left"] ?? 60
    }
    borderColor = {
        ...borderColor,
        from: borderColor["from"] ?? "color",
        modifiers: borderColor["modifiers"] ?? [["darker", 1.6]]
    }
    axisBottom = {
        ...axisBottom,
        tickSize: axisBottom["tickSize"] ?? 8,
        tickPadding: axisBottom["tickPadding"] ?? 10,
        tickRotation: axisBottom["tickRotation"] ?? -21,
        legend: axisBottom["legend"] ?? "",
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

    const getTooltipText = (id, value) => {
        if (id === 'bandwidth') return 'GB'
        else if (id === 'user') return 'Users'
        else if (id === 'Others') return 'Other files'
        else if (id === 'product views') return `Product ${value > 1 ? 'Views' : 'View'}`
        else if (id === 'Video' || id === 'Image') return `${id}s`
        return `${id}`
    }

    const defaultTooltip = ({ value, color, indexValue, id, ...rest }) => {
        return (
            <div
                style={{
                    padding: 5,
                    color,
                    background: "#222222",
                }}
            >
                <span>
                    {indexValue} : {currencyFormatter(value, false)} {getTooltipText(id, value)}
                </span>
            </div>
        )
    }

    const handleBarChartData = () => {
        let isChartEmpty = false;
        _forEach(keys, (key) => {
            if (key === 'bandwidth') {
                isChartEmpty = _every(data, { bandwidth: 0 });
            } else if (key === 'user') {
                isChartEmpty = _every(data, { user: 0 });
            } else if (key === 'product views') {
                isChartEmpty = _every(data, { product: 0 });
            } else {
                isChartEmpty = _every(data, { PDF: 0, Image: 0, Video: 0, Others: 0 });
            }
        });
        return isChartEmpty;
    }

    // const handleClick = val => {
    //     // setSelectedItem({ ...val, groupTitle: val.indexValue })
    //     // dispatch(getMemberDetailsRequest({ screen, sourceHex, groupid: val.data.GroupID, detailed: 1, offset: 0, limit: PAGE_SIZE, ...payload }))
    //     dispatch(showModal(true))
    // }

    chartHeaderData["downloadChart"] = { ...chartHeaderData["downloadChart"], disabled: loader, chartRef }
    return (
        <div>
            {loader ? (
                <div className="d-flex justify-center align-center h-500">
                    <Spin size="large" />
                </div>
            ) : (
                <div>
                    {_isEmpty(data) || handleBarChartData()
                        ? <div className="d-flex justify-center align-center h-500">
                                <NoDataFound noDataLabel={noDataLabel} />
                        </div>
                        : <div>
                            <Spin spinning={memberLoading || loader} size="large">
                                <div ref={chartRef} className={className} style={{ height: height }} >
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
                                        padding={0.5}
                                        axisLeft={axisLeft}
                                        label={(d) => label(d)}
                                        labelSkipWidth={labelSkipWidth}
                                        labelSkipHeight={labelSkipHeight}
                                        labelTextColor={labelTextColor}
                                        lineStyle={lineStyle}
                                        layers={layers.length ? layers : ["grid", "axes", "bars", (props) => TotalLabels({
                                            ...props, onTotalLabelClick: handleClick, screen: screen
                                        }), "markers", "legends"]}
                                        legends={[
                                            {
                                                dataFrom: 'keys',
                                                // data: data.map((item) => ({
                                                //     color: item.color,
                                                //     id: item.GroupID,
                                                //     label: item.GroupName,
                                                //     data: { ...item },
                                                //     value: item.CountPerGroup,
                                                //     indexValue: item.GroupName
                                                // })),
                                                // onClick: (d) => {
                                                //     handleClick(d)
                                                // },
                                                anchor: 'bottom-right',
                                                direction: 'column',
                                                justify: false,
                                                translateX: 130,
                                                translateY: 0,
                                                itemsSpacing: 2,
                                                itemWidth: 100,
                                                itemHeight: 20,
                                                itemDirection: 'left-to-right',
                                                itemOpacity: 0.85,
                                                symbolSize: 15,
                                                symbolShape: 'circle',
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
                            {modalVisible && <DetailsModal
                                fileName={chartHeaderData["downloadChart"]?.fileName}
                                appdir={appdir}
                                payload={payload}
                                screen={screen}
                                sourceHex={sourceHex}
                                selectedItem={selectedItem}
                                handleClose={() => {
                                    dispatch(showModal(false))
                                    handleonCloseModal()
                                }}
                                visible={modalVisible}
                                modelTitle={modelTitle}
                                barChartData={barChartData}
                                tableColumnKey={tableColumnKey}
                                tableData={tableData}
                                tableLoading={tableLoading}
                                handlePagination={handlePagination}
                                page={page}
                            />}
                        </div>
                    }
                </div>
            )}

        </div>
    )
}

export default CustomResponsiveBarCanvas