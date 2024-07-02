import React, { useEffect, useState } from "react";
import _map from 'lodash/map';
import _groupBy from 'lodash/groupBy';
import { currencyFormatter, getMonthName, stringToColour } from "../util";
import moment from "moment";
import { NoDataFound } from "./common/NoDataFound";
import { ResponsiveLine } from "@nivo/line";
import CompareChartLegend from "./common/CompareChartLegend";
import { Col, Row } from "antd";
import { customColor } from "./helper";

const DonationCategoryChart = ({ noDataFound, dataSource, CategoryTypes, chartRef, primaryColor }) => {

    const [constructedData, setConsturctedData] = useState([])
    const [lineChartData, setLineChartData] = useState([])

    useEffect(() => {
        if (dataSource?.length && CategoryTypes?.length) {
            setConsturctedData(chartDataConstructed())
        }
    }, [dataSource, CategoryTypes])

    useEffect(() => {
        if(primaryColor && constructedData.length > 0 ) {
            setLineChartData(customColor( primaryColor, constructedData))
        }
    }, [primaryColor, constructedData])

    const chartDataConstructed = () => {

        const constructChartData = dataSource.map((value) => {
            const monthOfInvoice = Number(moment(value.date, 'YYYY-MM-DD').format('MM'))
            return ({
                ...value,
                monthOfInvoice: monthOfInvoice,
                month: `${getMonthName(monthOfInvoice)}`
            })
        })

        const totalMonths = constructChartData.map((value) => {
            return value.monthOfInvoice
        });

        const monthArray = [...new Set(totalMonths)]

        const constructedData = _map(_groupBy(constructChartData, "donation_id"), (groupArr) => {
            let categoryName = ''
            groupArr.map((value) => {
                CategoryTypes.map((data) => {
                    if (value.donation_id === data.donation_id) {
                        categoryName = data.donation_name
                    }
                })
            })

            const groupedArray = _map(_groupBy(groupArr, 'monthOfInvoice'), (monthArr) => {
                let amount = 0;
                let monthName = '';
                let monthOfInvoice = ''
                monthArr.map((value) => {
                    amount += value.amount;
                    monthName = value.month
                    monthOfInvoice = value.monthOfInvoice
                })
                totalMonths.push(monthName)
                return ({
                    x: monthName,
                    y: amount,
                    monthOfInvoice: monthOfInvoice
                })
            })

            return ({
                id: categoryName,
                data: groupedArray,
            })
        })

        const result = constructedData.map((value) => {
            let monthData = [];
            value.data.forEach((val) => {
                monthArray.forEach((month) => {
                    if (month === val.monthOfInvoice) {
                        monthData.push(val)
                    } else {
                        monthData.push({
                            x: `${getMonthName(month)}`,
                            y: 0,
                            monthOfInvoice: month
                        })
                    }
                })
                return monthData.sort((a, b) => b.y - a.y)
            })

            return {
                id: value.id,
                data: monthData.filter((obj, index) => {
                    return index === monthData.findIndex(o => obj.monthOfInvoice === o.monthOfInvoice);
                }).sort((a, b) => a.monthOfInvoice - b.monthOfInvoice),
                // color: stringToColour(`${value.id}lineChrt`)
            }
        })

        return result
    }

    const CustomSymbol = ({ size, color, borderWidth, borderColor }) => {
        return (
            <g>
                <circle fill="#fff" r={size / 2} strokeWidth={borderWidth} stroke={borderColor} />
                <circle
                    r={size / 5}
                    strokeWidth={borderWidth}
                    stroke={borderColor}
                    fill={color}
                    fillOpacity={0.35}
                />
            </g>
        )
    }

    const customTooltip = ({ slice }) => (
        <div className="custom-tooltip">
            {slice.points.map((value, index) => (
                <Row key={index}>
                    <Col>
                        <div className="mt-1" style={{ height: '13px', width: '13px', backgroundColor: `${value.borderColor}` }}></div>
                    </Col>
                    <Col flex={1}>
                        <div style={{ whiteSpace: 'pre-wrap', maxWidth: '300px' }} className="pl-4">{value.serieId}</div>
                    </Col>
                    <Col>
                        <div className="pl-4" style={{ fontWeight: 'bold' }}>{currencyFormatter(value.data.y)}</div>
                    </Col>
                </Row>
            ))}
        </div>
    )

    return (
        <div ref={chartRef}>
            {(lineChartData.length > 0) ?
                <Row align='bottom' style={{ backgroundColor: 'white', width: '100%', height: '100%', paddingTop: '10px', paddingBottom: '10px' }}>
                    <Col lg={20} md={20} sm={20} xs={20} style={{ height: '350px' }} >
                        <ResponsiveLine
                            data={lineChartData}
                            margin={{ top: 50, right: 10, bottom: 50, left: 60 }}
                            xScale={{ type: 'point' }}
                            yScale={{
                                type: 'linear',
                                stacked: false,
                                reverse: false
                            }}
                            curve="monotoneX"
                            pointSymbol={CustomSymbol}
                            colors={{ datum: 'color' }}
                            pointSize={16}
                            pointBorderWidth={1}
                            pointBorderColor={{
                                from: 'color',
                                modifiers: [['darker', 0.3]],
                            }}
                            sliceTooltip={customTooltip}
                            axisBottom={true}
                            axisLeft={{
                                orient: 'left',
                                legend: 'Donations',
                                legendOffset: -45,
                                legendPosition: 'middle'
                            }}
                            useMesh={true}
                            enableSlices="x"
                        />
                    </Col>
                    <Col style={{ paddingBottom: '55px' }} lg={4} md={4} sm={4} xs={4}  >
                        <CompareChartLegend dataSource={lineChartData} />
                    </Col>
                </Row>
                :
                <div style={{ marginTop: '135px' }}>
                    {noDataFound && <NoDataFound />}
                </div>
            }
        </div>
    )
}
export default DonationCategoryChart;