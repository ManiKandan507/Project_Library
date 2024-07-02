import React, { useEffect, useState } from "react";
import moment from "moment";
import _map from 'lodash/map';
import _groupBy from 'lodash/groupBy';
import { getMonthName } from "../util";
import CommonSpinner from "./common/CommonSpinner";
import { ResponsiveBar } from "@nivo/bar";

const RecentDonorsChart = ({recentDonors, loading}) => {

    const [dataSource, setDataSource] = useState([])

    const constructedData = recentDonors.map((value) => {
        const monthOfInvoice = Number(moment(value.date, 'YYYY-MM-DD').format('MM'))
        return ({
            ...value,
            monthOfInvoice: monthOfInvoice,
            month: `${getMonthName(monthOfInvoice)}`
        })
    })
    
    const groupedData = _map(_groupBy(constructedData, "monthOfInvoice"), (groupArr) => {
        let month = ''
        let monthOfInvoice = ''
        groupArr.map((val) => {
            month = val.month
            monthOfInvoice = val.monthOfInvoice
        })
        return ({
            monthOfInvoice: monthOfInvoice,
            month: month,
            count: groupArr.length
        })
    })

    useEffect(() => {
        let constructedChartData = [] 
        groupedData.map((data) => {
            if(data.monthOfInvoice.toString() === moment().format("M")){
                constructedChartData.push({...data, color:'#52C41A', textColor:'#FFFFFF', JoinMonth:`MTD`})
            } else{
                constructedChartData.push({...data, color:"#e1f3d8", textColor:'#52C41A'})
            }
        })
        setDataSource(constructedChartData)
    },[recentDonors])

    const BarComponent = ({ bar }) => {
        return (
            <g transform={`translate(${bar.x},${bar.y})`}>
                <rect width={bar.width} height={bar.height} fill={bar.color} />
                <text x={bar.width / 2} y={bar.height - 10} textAnchor="middle" fill={ bar.key === 'Count.MTD' ? bar.height < 20 ? '#00000' : '#FFFFFF' : bar.data.data.textColor}>  </text>
            </g>
        )
    }

    return (
        <CommonSpinner loading={loading}>
             <div className="mt-10" style={{height:'400px'}}>
                <ResponsiveBar
                    height={250}
                    layout="vertical"
                    data={dataSource}
                    indexBy="month"
                    margin={{ bottom: "20" }}
                    keys={['count']}
                    colors = {dataSource.map(c => c.color)}
                    colorBy="indexValue"
                    enableGridX={false}
                    enableGridY={false}
                    axisLeft={true}
                    isInteractive={false}
                    barComponent={BarComponent}
                /> 
            </div>
        </CommonSpinner>
    )
}
export default RecentDonorsChart;