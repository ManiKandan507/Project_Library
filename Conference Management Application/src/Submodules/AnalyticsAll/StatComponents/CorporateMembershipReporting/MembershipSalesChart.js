import React, { useEffect, useState } from "react"
import _orderBy from 'lodash/orderBy';
import _groupBy from 'lodash/groupBy';
import { ResponsiveLine } from "@nivo/line"
import { getMonthName } from '@/AnalyticsAll/StatComponents/util';
import { NoDataFound } from "@/CorporateMembershipReportingV2/common/NoDataFound";
import _map  from 'lodash/map';
import { ArrowDownOutlined, ArrowUpOutlined } from "@ant-design/icons";
import { customColor } from "./util/helper";

export const MembershipSalesChart = ({ salesActivity, chartRef, primary_color="#1890ff" }) => {
    
    const [salesActivityDataSource, setSalesActivityDataSource] = useState([]);
    const [lineChartData, setLineChartData] = useState([]);
    let constrcutedDataSource = (salesData, xAxisValue='x', yAxisValue ='y' ) =>{
        let constructedData = _map(salesData, (data) => {
            return ({
                [xAxisValue]: `${getMonthName(data.PaidMonth)}`,
                [yAxisValue]: data.TotalInvoices,
                percentage: data.Percentage,
                monthAndYear:`${getMonthName(data.PaidMonth)} - ${data.PaidYear}`
            })
        })
        return constructedData
    }

    const salesActivityChart = () => {
        let salesMemData = [];
        let yearData = [];
        let years;

        if (salesActivity?.length) {
            salesMemData = _orderBy(salesActivity, ['PaidYear', (item) => parseInt(item.PaidMonth)], ['asc', 'asc']);
        }

        let constructedSalesActivityData = _map(_groupBy(salesMemData, "PaidMonth"),(monthArr)=>{
            if(monthArr.length === 1){
                monthArr.map((arr)=>{
                    return(monthArr.push({
                        Period: '1_YEAR_BEFORE',
                        PaidMonth: arr.PaidMonth,
                        PaidYear: arr.PaidYear - 1,
                        TotalInvoices: 0,
                    }))
                })
            }

            return monthArr?.map((monthDatas) => {
                let percentage = monthArr[1].TotalInvoices !== 0 ? (((monthArr[1].TotalInvoices - monthArr[0].TotalInvoices)/monthArr[1].TotalInvoices * 100).toFixed(2)) :'NA';
                let salesPercentage = {...monthDatas, Percentage: percentage}
                return salesPercentage
            })
        }).flat(1);

        let sortedSalesData = constructedSalesActivityData.sort((rec1, rec2) => rec1.PaidYear - rec2.PaidYear)

        return _map(_groupBy(sortedSalesData,"Period"),(groupArr)=>{
            _map(_groupBy(groupArr, 'PaidYear'),(yearArr)=>{
                yearArr.map((data) => {
                    yearData.push(data.PaidYear)
                    return data
                })
            })
            let constructedYearData = [...new Set(yearData)]
            for (let i = 0; i < constructedYearData.length-1; i += 1 ) {
                for (let j = i + 1; j < constructedYearData.length; j += 2) {
                    years = `${constructedYearData[i]}-${constructedYearData[j]}`
                }
            }
            return ({
                id: years,
                data: constrcutedDataSource(groupArr),
            })
        }).flat(1)
    }

    useEffect(()=>{
        setSalesActivityDataSource([...new Map(salesActivityChart().map(item => [item.id, item])).values()])
    },[salesActivity])

    useEffect(() => {
        if(primary_color && salesActivityDataSource.length > 0 ) {
            setLineChartData(customColor( primary_color, salesActivityDataSource))
        }
    }, [primary_color, salesActivityDataSource])
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

    const customTooltip = ({slice}) =>{
        let percentage;
        return (
            <div
                className="d-flex"
                style={{
                    background: 'white',
                    padding: '7px 12px',
                    border: '1px solid #ccc',
                }}
            >   
                <div>
                    {slice.points.map((value, index)=>{
                        percentage = value.data.percentage
                        return (
                            <div key={index} className="d-flex">
                                <div className="mt-1" style={{height: '13px', width: '13px', backgroundColor:`${value.borderColor}`}}></div>
                                <div className="pl-4">{value.data.monthAndYear}</div>
                                <div className="pl-4" style={{fontWeight:'bold'}}>{value.data.y}</div>
                            </div>
                        )
                    })}
                </div>
                <div className= 'pl-3 mt-3'> 
                    { percentage === "NA" ? percentage : `${Math.abs(percentage)} %`} 
                    { Math.sign(percentage) === 1 || percentage === "NA" ? <ArrowUpOutlined  style={{color: 'green'}} /> : <ArrowDownOutlined  style={{color:'red'}} />}
                </div>
            </div>
        )
    }

    return (
        <div>
            {salesActivity.length > 0 ?
            <div style={{ height: '350px' }} ref={chartRef}>
                <ResponsiveLine
                    data={lineChartData}
                    margin={{ top: 50, right: 110, bottom: 50, left: 60 }}
                    xScale={{ type: 'point' }}
                    yScale={{
                        type: 'linear',
                        stacked: false,
                        reverse: false
                    }}
                    curve="monotoneX"
                    colors={{ datum: 'color' }}
                    pointSymbol={CustomSymbol}
                    pointSize={16}
                    pointBorderWidth={1}
                    pointBorderColor={{
                        from: 'color',
                        modifiers: [['darker', 0.3]],
                    }}
                    axisBottom={true}
                    axisLeft={{
                        orient: 'left',
                        legend: 'Total Memberships',
                        legendOffset: -45,
                        legendPosition: 'middle'
                    }}
                    useMesh={true}
                    enableSlices="x"
                    sliceTooltip={customTooltip}
                    legends={[
                        { 
                            anchor: 'bottom-right',
                            direction: 'column',
                            justify: false,
                            translateX: 100,
                            translateY: 0,
                            itemsSpacing: 0,
                            itemDirection: 'left-to-right',
                            itemWidth: 80,
                            itemHeight: 20,
                            symbolSize: 12,
                            symbolShape: 'circle',
                        }
                    ]}
                />
                </div>
                :
                <div style={{marginTop:  '135px'}}>
                    <NoDataFound/>
                </div>
            }
        </div>
    )
}