import React from "react"
import { ResponsiveLine } from "@nivo/line"
import _orderBy from 'lodash/orderBy';
import _map from 'lodash/map';
import _groupBy from 'lodash/groupBy';
import _reduce from 'lodash/reduce';
import { getDateToConstruct } from "./helper";

export const CurrentSalesChart = ({ salesActivity, type ='', handleChartClick=()=>{}, domEl }) => {

    // const constructData = (data, xAxisValue = 'x', yAxisValue = 'y') => {

    //     let constructedData = _map(groupByData, (data, key) => {
    //         let total = 0;
    //         let TotalSales;
    //         let uniqueIdData = [];
    //         if(type === "TOTAL_REVENUE"){
    //             TotalSales = _reduce(data, (_, val) => { return total += val.TotalRevenue }, [])
    //         } else {
    //             TotalSales = _reduce(data, (_, val) => { return total += val.TotalInvoices }, []);
    //         }

    //         if(type === "TOTAL_REVENUE" || type === "TOTAL_MEMBERS"){
    //             data?.map((item) => {
    //                 uniqueIdData.push(...item.NewMemberUUIDs, ...item.RenewMemberUUIDs)
    //             })
    //         }
    //         return ({
    //             [xAxisValue]: key,
    //             [yAxisValue]: TotalSales,
    //             memberUUIDs : uniqueIdData,
    //             constructedData: data,
    //         })
    //     })
    //     return constructedData;
    // }

    // const lineChartData = () => {
    //     let salesMemData = [];
    //     if (salesActivity?.length) {
    //         salesMemData = _orderBy(salesActivity, ['YearOfInvoice', (item) => parseInt(item.MonthOfInvoice)], ['asc', 'asc']);
    //     }
    //     return ([
    //         {
    //             id: 'Membership Sales',
    //             color: "hsl(152, 70%, 50%)",
    //             data: constructData(getDateToConstruct(salesMemData))
    //         }
    //     ])
    // }

    // const barChartData = lineChartData()[0]?.data.map((data, i)=>{
    //     return ({...data, z: 0, yColor: "#eee",zColor:"hsl(273, 73%, 93%)"})
    // })

    return (
        <div ref={domEl} style={{ height: '450px' }}>
            <ResponsiveLine
                data={salesActivity}
                margin={{ top: 50, right: 110, bottom: 50, left: 60 }}
                xScale={{ type: 'point'}}
                yScale={{
                    type: 'linear',
                    stacked: true,
                    reverse: false
                }}
                enableGridX={false}
                enableGridY={false}
                yFormat="<(5.0f"
                colors={{ scheme: 'purple_orange' }}
                axisBottom={{
                    tickSize: 5,
                    tickPadding: 5,
                    tickRotation: -40,
                    legendPosition: "middle",
                    legendOffset: 60,
                }}
                axisLeft={true}
                pointSize={10}
                pointColor={{ theme: 'background' }}
                pointBorderWidth={2}
                pointBorderColor={{ from: 'serieColor' }}
                pointLabelYOffset={-12}
                useMesh={true}
                enableArea={true}
            />
        </div>
    )
}