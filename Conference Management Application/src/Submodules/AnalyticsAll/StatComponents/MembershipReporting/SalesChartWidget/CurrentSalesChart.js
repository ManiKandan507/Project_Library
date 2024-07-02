import React from "react"
import { ResponsiveLine } from "@nivo/line"

export const CurrentSalesChart = ({ salesActivity, chartRef, type }) => {
    let salesType = type === "TOTAL_REVENUE" ? 'Total Revenue' : 'Total Members';
    return (
        <div>
            {
                <div ref={chartRef} style={{ backgroundColor: 'white',height: '450px' }}>
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
                        axisLeft={{
                            orient: 'left',
                            legend: salesType,
                            legendOffset: -45,
                            legendPosition: 'middle'
                        }}
                        pointSize={10}
                        pointColor={{ theme: 'background' }}
                        pointBorderWidth={2}
                        pointBorderColor={{ from: 'serieColor' }}
                        pointLabelYOffset={-12}
                        useMesh={true}
                        enableArea={true}
                        tooltip={({ point }) => {
                            return (
                                <div
                                    style={{
                                        background: 'white',
                                        padding: '8px 12px',
                                        border: '1px solid #ccc',
                                        borderRadius: 10
                                    }}
                                >
                                    <div style={{ fontSize: 14, fontWeight: 'bold' }}>
                                        {`${point.data.x}`}, {type === 'TOTAL_REVENUE' ? `$ ${point.data.y}` : `${point.data.y}`}
                                    </div>
                                </div>
                            )
                        }}
                    />
                </div>
            }
        </div>

    )
}