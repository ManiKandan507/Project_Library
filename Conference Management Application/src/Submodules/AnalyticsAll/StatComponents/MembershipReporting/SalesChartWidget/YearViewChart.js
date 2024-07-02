import React, { useEffect, useState } from "react"
import { currencyFormatter, stringToColour } from "@/AnalyticsAll/StatComponents/util"
import { NoDataFound } from "@/MembershipReportingV2/common/NoDataFound"
import CommonBarChart from "../common/CommonBarChart"
import { customColor } from "../util/helper"
import TotalCountLabel from "../MemberChartWidget/TotalCountLabels";
import { ResponsiveBar } from "@nivo/bar";
import { Col, Row, Tooltip } from "antd"

const ChartLegends = (props) =>{
  
    const {dataSource} = props

    const legendData = dataSource.reverse()

     return(
          <>
          {legendData?.map((item, index)=>(
              <div key={index} className="d-flex justify-end">
                  <Tooltip title={item.YearOfInvoice}>
                    <div className='mr-3 chartLegends chartLegendsNodes'>{item.YearOfInvoice}</div>
                  </Tooltip>
                  <svg width='20' height='26'>
                    <rect width="15" height="15" style={{fill:`${item.color}`}} />
                  </svg>
              </div>
          ))}
          </>
      )
  }

const YearViewChart = ({ currentMembers, isvertical = false, chartRef, primary_color = "#1890ff", height, type }) => {

    const [constructedData, setConstructedData] = useState([])

    useEffect(() => {
        if (currentMembers?.length) {
            setConstructedData(customColor(primary_color, currentMembers))
        }
    }, [currentMembers])

    const defaultTooltip = ({ data, value, color }) => {
        return (
            <div style={{ padding: 5, color, background: "#222222" }}>
                {type === 'TOTAL_REVENUE' ? <span>
                    {data.YearOfInvoice} : ${currencyFormatter(value, false)}
                </span> :
                    <span>
                        {data.YearOfInvoice} : {currencyFormatter(value, false)}
                    </span>}
            </div>
        )
    }

    const defaultColors = ({ data }) => {
        return data.color
    }

    return (
        <div>
            {constructedData.length > 0 ? <Row align='bottom' style={{ backgroundColor: 'white', width: '100%', height: '100%', marginTop: '30px' }} >
                <Col lg={20} md={20} sm={20} xs={20} style={{ height: height? `${height}`:'400px' }} >
                    <ResponsiveBar
                        data={constructedData}
                        keys={['TotalSales']}
                        indexBy='YearOfInvoice'
                        layout={isvertical ? 'vertical' : 'horizontal'}
                        margin={{ top: 20, right: 50, bottom: 26, left: 60 }}
                        colors={defaultColors}
                        colorBy='indexValue'
                        onMouseEnter={(_datum, event) => {
                            event.currentTarget.style.cursor = "pointer";
                        }}
                        axisLeft={true}
                        axisBottom={true}
                        enableLabel={false}
                        enableGridX={false}
                        enableGridY={false}
                        tooltip={defaultTooltip}
                        layers={["grid", "axes", "bars", (props) => TotalCountLabel({ ...props, isVertical: isvertical, key: 'TotalSales', type: type }), "markers", "legends"]}
                        chartRef={chartRef}
                    />
                </Col>
                <Col style={{ paddingBottom: '20px' }} lg={4} md={4} sm={4} xs={4}  >
                    <ChartLegends dataSource={constructedData} />
                </Col>
            </Row> : <NoDataFound /> }
        </div>
    )
}

export default YearViewChart