import React, { useEffect, useState } from "react";
import moment from "moment";
import _map from 'lodash/map';
import _groupBy from 'lodash/groupBy'
import { currencyFormatter, getMonthName, hexToHSLColor, lightenDarkenColor, stringToColour } from "../util";
import { ResponsiveBar } from "@nivo/bar";
import { NoDataFound } from './common/NoDataFound'
import { Col, Row } from "antd";
import ChartLegends from "./common/ChartLegend";
import TotalCountLabel from "./common/TotalCountLabel";
import { customColor } from "./helper";

const DonationMonthChart = ({ noDataFound, dataSource, isvertical, chartRef, primaryColor }) => {

    const [constructedData, setConstructedData] = useState([])
    const [barChartData, setBarChartData] = useState([])

    const chartDataConstructed = () => {
        const constructedData = dataSource.map((value) => {
            const date = moment(value.date, 'YYYY-MM-DD');
            const monthOfInvoice = Number(date.format('MM'))
            const yearOfInvoice = Number(date.format('YYYY'))
            return ({
                ...value,
                monthOfInvoice: monthOfInvoice,
                yearOfInvoice: yearOfInvoice,
                month: `${getMonthName(monthOfInvoice)}`
            })
        })

        const groupedData = _map(_groupBy(constructedData, 'monthOfInvoice'), (groupArr) => {
            let month = ''
            let monthOfInvoice = ''
            let totalDonations = 0
            // let color = ''
            let yearOfInvoice = ''
            groupArr.map((val) => {
                month = val.month
                monthOfInvoice = val.monthOfInvoice
                totalDonations += val.amount
                yearOfInvoice = val.yearOfInvoice
                // color = stringToColour(`get${val.month.toLowerCase()}lightcolor`);
            })
            return ({
                monthOfInvoice: monthOfInvoice,
                month: month,
                totalDonations: totalDonations,
                totalDonors: groupArr.length,
                // color: color,
                yearOfInvoice: yearOfInvoice
            })
        })
        return groupedData
    }


    useEffect(() => {
        if (dataSource) {
            setConstructedData(chartDataConstructed())
        }
    }, [dataSource])

    useEffect(() => {
        if (primaryColor, constructedData?.length > 0) {
            setBarChartData(customColor(primaryColor, constructedData))
        }
    }, [primaryColor, constructedData])

    const defaultTooltip = ({ data, value, color }) => {
        return (
            <div style={{ padding: 5, color: 'white', background: "#222222" }}>
                <span>
                    {data.month} {data.yearOfInvoice} : {currencyFormatter(value)}
                </span>
            </div>
        )
    }

    const defaultColors = ({ data }) => {
        return data.color
    }
    return (
        <div ref={chartRef}>
            {!noDataFound > 0 ?
                <Row align='bottom' style={{ backgroundColor: 'white', width: '100%', height: '100%', paddingTop: '10px', paddingBottom: '10px' }} >
                    <Col lg={18} md={18} sm={18} xs={18} style={{ height: '360px' }} >
                        <ResponsiveBar
                            data={barChartData}
                            keys={['totalDonations']}
                            indexBy='month'
                            layout={isvertical ? 'vertical' : 'horizontal'}
                            margin={{ top: 20, right: 55, bottom: 26, left: isvertical === true ? 50 : 20 }}
                            colors={defaultColors}
                            colorBy='indexValue'
                            axisLeft={isvertical ? true : ''}
                            axisBottom={isvertical ? '' : true}
                            enableLabel={false}
                            enableGridX={false}
                            enableGridY={false}
                            tooltip={defaultTooltip}
                            layers={["grid", "axes", "bars", (props) => TotalCountLabel({ ...props, isVertical: isvertical, key: 'totalDonations' }), "markers", "legends"]}
                        />
                    </Col>
                    <Col style={{ paddingBottom: '10px', paddingRight: '10px' }} lg={6} md={6} sm={6} xs={6}  >
                        <ChartLegends dataSource={barChartData} />
                    </Col>
                </Row>
                :
                <NoDataFound />
            }
        </div>
    )
}
export default DonationMonthChart;