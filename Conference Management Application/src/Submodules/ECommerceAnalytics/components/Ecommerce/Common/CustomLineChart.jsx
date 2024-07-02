import React from "react";
import { ResponsiveLine } from '@nivo/line'
import _every from 'lodash/every';

import NoDataFound from "./NoDataFound";

const ResponsiveLineChart = ({ data, curve = "linear", colors, yFormat, label, type }) => {

    const handleChartData = () => {
        let isChartEmpty = false;
        if (type === 'bandwidth_usage') {
            isChartEmpty = _every(data[0]?.data, { y: 0 })
        } else if (type === 'active_users') {
            isChartEmpty = _every(data[0], ['contactUUIDs', []])
        }
        return isChartEmpty;
    }

    return (
        <div style={{ height: '350px' }}>
            {handleChartData()
                ? <div className="d-flex justify-center align-center h-300">
                    <NoDataFound />
                </div>
                : <ResponsiveLine
                    data={data}
                    margin={{ top: 50, right: 130, bottom: 50, left: 60 }}
                    xScale={{ type: 'point' }}
                    yScale={{
                        type: 'linear',
                        stacked: true,
                        reverse: false
                    }}
                    curve={curve}
                    colors={colors}
                    yFormat={yFormat}
                    axisTop={null}
                    axisRight={null}
                    axisBottom={{
                        orient: 'bottom',
                        tickSize: 8,
                        tickPadding: 6,
                        tickRotation: -35,
                        legend: '',
                        legendOffset: 36,
                        legendPosition: 'middle'
                    }}
                    axisLeft={{
                        orient: 'left',
                        tickSize: 5,
                        tickPadding: 5,
                        tickRotation: 0,
                        legend: '',
                        legendOffset: -40,
                        legendPosition: 'middle'
                    }}
                    pointSize={10}
                    pointColor={{ theme: 'background' }}
                    pointBorderWidth={2}
                    pointBorderColor={{ from: 'serieColor' }}
                    pointLabelYOffset={-12}
                    useMesh={true}
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
                            itemOpacity: 0.75,
                            symbolSize: 12,
                            symbolShape: 'circle',
                            symbolBorderColor: 'rgba(0, 0, 0, .5)',
                            effects: [
                                {
                                    on: 'hover',
                                    style: {
                                        itemBackground: 'rgba(0, 0, 0, .03)',
                                        itemOpacity: 1
                                    }
                                }
                            ]
                        }
                    ]}
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
                                    {`${point.data.x}`}, {`${point.data.y} ${label}`}
                                </div>
                            </div>
                        )
                    }}
                />
            }
        </div>
    )
}

export default ResponsiveLineChart;