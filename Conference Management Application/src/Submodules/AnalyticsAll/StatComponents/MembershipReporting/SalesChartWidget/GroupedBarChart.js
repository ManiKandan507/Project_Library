import React from "react";
import { NoDataFound } from "@/MembershipReportingV2/common/NoDataFound";
import { ResponsiveBar } from "@nivo/bar";
import { useState, useEffect } from "react";

export const GroupedBarChart = ({dataSource, domEl, salesData}) => {

    const [selectedKeys, setSelectedKeys] = useState([]);
        
    let sortedDataSource = dataSource.sort((rec1, rec2)=>{
        rec1 = rec1.MonthOfInvoiceKey.split("-");
        rec2 = rec2.MonthOfInvoiceKey.split("-")
        return new Date(rec1[1], rec1[0], 1) - new Date(rec2[1], rec2[0], 1)
    });

    useEffect(() => {
        let yearOfInvoice = []
        let sortedData = salesData.sort((rec1, rec2)=>rec1.YearOfInvoice - rec2.YearOfInvoice);
        sortedData.map((sales)=>{
            yearOfInvoice.push(sales.YearOfInvoice)
            return sales
        })
        let year = [...new Set(yearOfInvoice)]
        setSelectedKeys(year)
    }, [salesData])

    return (
        <div style={{ height: '350px' }} ref={domEl}>
            {sortedDataSource.length > 0 ?
                <ResponsiveBar
                    data={sortedDataSource}
                    keys={selectedKeys}
                    indexBy='Month'
                    layout={"vertical"}
                    groupMode="grouped"
                    margin={{ top: 20, right: 100, bottom: 66, left: 60 }}
                    padding={0.3}
                    valueScale={{ type: 'linear' }}
                    indexScale={{ type: 'band', round: true }}
                    onMouseEnter={(_datum, event) => {
                        event.currentTarget.style.cursor = "pointer";
                    }}
                    colors={{ scheme: 'nivo' }}
                    axisTop={null}
                    axisRight={null}
                    axisBottom={{
                        tickSize: 5,
                        tickPadding: 5,
                        tickRotation: 0,
                        legendPosition: 'middle',
                        legendOffset: 32
                    }}
                    axisLeft={true}
                    labelTextColor={{
                        from: 'color',
                        modifiers: [
                            [
                                'darker',
                                1.6
                            ]
                        ]
                    }}
                    legends={[
                        {
                            dataFrom: 'keys',
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
                /> : <NoDataFound/> }
        </div>
    )
}