import React from "react";
import { NoDataFound } from "@/MembershipReportingV2/common/NoDataFound";
import { ArrowDownOutlined, ArrowUpOutlined } from "@ant-design/icons";
import { ResponsiveLine } from "@nivo/line";
import { useState } from "react";
import { useEffect } from "react";
import { customColor } from "../util/helper";

export const CompareSalesChart = ({dataSource, chartRef, type, dateFormat, primary_color="#1890ff"}) => {

    const [lineChartData, setLineChartData] = useState([]);

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
        let totalYears = slice.points.map((value) => {
            return value.data.years
        })

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
                        let valueY = Number.isInteger(value.data.y) ? value.data.y : (value.data.y).toFixed(2);
                        return (
                            <div key={index}>
                                <div key={index} className="d-flex">
                                    <div className="mt-1" style={{ height: '13px', width: '13px', backgroundColor: `${value.borderColor}` }}></div>
                                    <div className="pl-3">{value.data.x}</div>
                                    <div className="pl-1">{value.data.years}</div>
                                    <div className="pl-4" style={{ fontWeight: 'bold' }}>{type === "TOTAL_REVENUE" ? `$${valueY}` : valueY}</div>
                                    {(totalYears.length > 2 && percentage !== undefined) && <div  className="pl-5">{percentage === "NA" ? percentage : `${Math.abs(percentage)}%`} {Math.sign(percentage) === 1 || percentage === "NA" ? <ArrowUpOutlined style={{ color: 'green' }} /> : <ArrowDownOutlined style={{ color: 'red' }} />}</div>}
                                </div>
                            </div>
                        )
                    })}
                </div>
                {slice.points.map((value,index)=>{
                    percentage = value.data.percentage
                    return(
                        <div key={index}>
                            {(totalYears.length === 2 && percentage !== undefined) && <div className="pl-3 mt-3">{ percentage === "NA" ? percentage : `${Math.abs(percentage)}%`} {Math.sign(percentage) === 1 || percentage === "NA" ? <ArrowUpOutlined  style={{color: 'green'}} /> : <ArrowDownOutlined  style={{color:'red'}}/>}</div>}
                        </div>
                    )    
                })}
            </div>
        )
    }
    
    useEffect(() => {
        if(primary_color && dataSource.length > 0 ) {
            setLineChartData(customColor( primary_color, dataSource))
        }
    }, [primary_color, dataSource])

    return (
        <div style={{backgroundColor: 'white', height: '350px', marginTop: 30 }} ref={chartRef}>
            {dataSource.length > 0 ?
                <ResponsiveLine
                    data={lineChartData}
                    margin={{ top: 50, right: 180, bottom: 50, left: 60 }}
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
                    axisLeft={true}
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
                :
                <NoDataFound/>
            }
        </div>
    )
}