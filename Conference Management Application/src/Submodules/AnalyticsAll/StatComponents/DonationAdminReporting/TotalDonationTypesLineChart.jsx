import React, { useEffect, useState } from "react";
import _map from 'lodash/map';
import _groupBy from 'lodash/groupBy';
import { getMonthName, stringToColour } from "../util";
import moment from "moment";
import { NoDataFound } from "./common/NoDataFound";
import { ResponsiveLine } from "@nivo/line";
import { Col, Row } from "antd";
import CompareChartLegend from "./common/CompareChartLegend";
import { customColor } from "./helper";

const TotalDonationTypesLineChart = ({ dataSource, donationTypes, chartRef, handleChartClick = () => {}, setChartDataSource, primaryColor }) => {

    const [constructedData, setConsturctedData] = useState([])
    const [lineChartData, setLineChartData] = useState([])

    useEffect(() => {
        if(dataSource.length && donationTypes.length ){  
            setConsturctedData(chartDataConstructed())
            setChartDataSource(chartDataConstructed())
        }
    },[dataSource, donationTypes])

    useEffect(() => {
        if(constructedData.length > 0 && primaryColor) {
            setLineChartData(customColor(primaryColor, constructedData))
        }
    }, [constructedData, primaryColor])

    const chartDataConstructed = () => {

        const constructChartData = dataSource.map((value) => {
            const monthOfInvoice = Number(moment(value.date, 'YYYY-MM-DD').format('MM'))
            const yearOfInvoice = Number(moment(value.date, 'YYYY-MM-DD').format('YYYY'))
            return ({
                ...value,
                monthOfInvoice: monthOfInvoice,
                month: `${getMonthName(monthOfInvoice)}`,
                yearOfInvoice: `${yearOfInvoice}`,
                monthAndYearOfInvoice: `${monthOfInvoice}-${yearOfInvoice}`
            })
        })

        const totalMonths = constructChartData.map((value) => {
            return value.monthOfInvoice 
        });

        const totalMonthAndYear = constructChartData.map((value) => {
            return value.monthAndYearOfInvoice
        })

        const monthAndYearArray = [...new Set(totalMonthAndYear)]

        const constructedData = _map(_groupBy(constructChartData, "donation_id"), (groupArr) => {
            let categoryName = ''
            let donationId = ''
            groupArr.map((value) => {
                donationTypes.map((data) => {
                    if(value.donation_id === data.donation_id){
                        categoryName = data.donation_name
                        donationId = data.donation_id
                    }
                })
            })

            const groupedArray = _map(_groupBy(groupArr, 'monthAndYearOfInvoice'), (monthArr)=>{
                let amount = 0;
                let monthName = '';
                let monthOfInvoice = ''
                let donationId = ''
                let yearOfInvoice = ''
                let monthAndYear = ''
                monthArr.map((value) => {
                    amount += value.amount;
                    monthName = value.month
                    monthOfInvoice = value.monthOfInvoice
                    donationId = value.donation_id
                    yearOfInvoice = value.yearOfInvoice
                    monthAndYear = value.monthAndYearOfInvoice
                })
                totalMonths.push(monthName)
                return ({
                    x: moment(monthAndYear, 'MM-YYYY').format('MMM-YYYY'),
                    y: amount,
                    monthOfInvoice: `${monthOfInvoice}`,
                    donationId: donationId,
                    yearOfInvoice: yearOfInvoice,
                    monthAndYear: monthAndYear
                })    
            })
            
            return ({
                id: categoryName,
                data: groupedArray,
                donationId: donationId
            })
        })

        const result = constructedData.map((value) => {
            let monthData = [];
            value.data.forEach((val)=> {
                monthAndYearArray.forEach((month) => {
                    if(month === val.monthAndYear) {
                        monthData.push({
                            ...val,
                            monthAndYear: `${val.monthAndYear}`
                        })
                    }else{
                        monthData.push({
                            x: `${moment(month, 'MM-YYYY').format('MMM-YYYY')}`,
                            y: 0,
                            monthOfInvoice: moment(month, 'MM-YYYY').format('M'),
                            donationId: val.donationId,
                            monthAndYear: month,
                            yearOfInvoice: moment(month, 'MM-YYYY').format('YYYY')
                        })
                    }
                })
                return monthData.sort((a,b) => b.y - a.y)
            })

            return {
                id: value.id,
                data: monthData.filter((obj, index) => {
                    return index === monthData.findIndex(o => obj.monthAndYear === o.monthAndYear);
                }).sort((a, b) => a.monthOfInvoice - b.monthOfInvoice).sort((a,b) => a.yearOfInvoice - b.yearOfInvoice),
                donationId : value.donationId,
                color: stringToColour(`${value.id}lineChrt`)
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
    )}

    return (
        <div ref={chartRef}>
            {lineChartData.length > 0 ?
                <Row align='bottom' style={{ backgroundColor: 'white', width: '100%', height: '100%', paddingTop: '10px', paddingBottom: '10px' }}>
                    <Col lg={20} md={20} sm={20} xs={20}  style={{ height: '350px' }} >
                        <ResponsiveLine
                            data={lineChartData}
                            margin={{ top: 50, right: 24, bottom: 50, left: 60 }}
                            xScale={{ type: 'point' }}
                            yScale={{
                                type: 'linear',
                                stacked: false,
                                reverse: false
                            }}
                            curve="monotoneX"
                            pointSymbol={CustomSymbol}
                            pointSize={16}
                            pointBorderWidth={1}
                            colors={{ datum: 'color' }}
                            pointBorderColor={{
                                from: 'color',
                                modifiers: [['darker', 0.3]],
                            }}
                            axisBottom={true}
                            useMesh={true}
                            onClick={handleChartClick}
                        />
                    </Col>
                    <Col style={{ paddingBottom: '55px' }} lg={4} md={4} sm={4} xs={4}  >
                        <CompareChartLegend dataSource={lineChartData} />
                    </Col>
                </Row>
                :
                <div style={{ marginTop: '135px' }}>
                    <NoDataFound />
                </div>
            }
        </div>
    )
}
export default TotalDonationTypesLineChart;