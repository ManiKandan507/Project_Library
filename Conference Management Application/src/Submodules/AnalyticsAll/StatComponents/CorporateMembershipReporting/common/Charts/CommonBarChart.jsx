import React from "react";
import { ResponsiveBar } from "@nivo/bar";
import { Col, Row } from "antd";
import ChartLegends from './ChartLegend';

const CommonBarChart = ({
    data,
    keys,
    indexBy,
    layout,
    margin,
    colors,
    colorBy,
    onClick,
    axisLeft,
    axisBottom,
    enableLabel,
    enableGridX,
    enableGridY,
    tooltip,
    layers,
    legendData,
    chartRef,
    domEl,
    height
}) => {

    return(
        <div id="domEl" ref={chartRef} >
            <Row style={{backgroundColor: 'white', width: '100%', height: '100%'}} >
                <Col lg={18} md={18} sm={18} xs={18} style={{height:'360px'}} >
                    <ResponsiveBar
                        data={data} 
                        keys={keys}
                        indexBy={indexBy}
                        onMouseEnter={(_datum, event) => {
                            event.currentTarget.style.cursor = "pointer";
                        }}
                        layout={layout}
                        margin={margin}
                        colors={colors}
                        colorBy={colorBy}
                        onClick={onClick}
                        axisLeft={axisLeft}
                        axisBottom={axisBottom}
                        enableLabel={enableLabel}
                        enableGridX={enableGridX}
                        enableGridY={enableGridY}
                        tooltip={tooltip}
                        layers={layers}
                    />
                </Col>
                <Col  style={{alignSelf: 'center'}} lg={6} md={6} sm={6} xs={6}  >
                    <ChartLegends dataSource={legendData} />
                </Col>
            </Row>
        </div>
    )
}
export default CommonBarChart