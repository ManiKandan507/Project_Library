import React, { useEffect, useState } from 'react'
import { ResponsiveBar } from '@nivo/bar'
import TotalCountLabel from '../MemberChartWidget/TotalCountLabels'
import { stringToColour } from '../../util'
import CommonSpinner from './CommonSpinner'

const CommonBarCharts = ({ focusMode, focusModeData, dataSource }) => {


    const [constructedData, setConstructedData] = useState([])

    useEffect(() => {
        if (dataSource?.length) {
            let filteredData = dataSource.map(group => {
                group["color"] = stringToColour(group.customField);
                return group;
            });
            setConstructedData(filteredData)
        }
    }, [dataSource])

    const defaultTooltip = ({ data, value, color }) => {
        return (
            <div style={{ padding: 5, color: "#ffffff", background: "#222222" }}>
                <span>
                    {data.customField} : {value}
                </span>
            </div>
        )
    }

    const defaultColors = ({ data }) => {
        return data.color
    }

    return (
        <div>
            {/* <CommonSpinner loading={constructedData.length > 0 ? false : true} > */}
                <div style={{ height: '400px', width: '100%', margin: 'auto' }}>
                    <ResponsiveBar
                        data={constructedData}
                        keys={['count']}
                        indexBy="customField"
                        margin={{ top: 50, right: 130, bottom: 50, left: 60 }}
                        padding={0.3}
                        layout="horizontal"
                        colors={defaultColors}
                        valueScale={{ type: 'linear' }}
                        indexScale={{ type: 'band', round: true }}
                        tooltip={defaultTooltip}
                        onClick={(e) => focusMode(focusModeData)}
                        layers={["grid", "axes", "bars", (props) => TotalCountLabel({ ...props, isVertical: false, key: 'count' }), "markers", "legends"]}
                        aaxisLeft={true}
                        axisBottom={true}
                        enableLabel={false}
                        enableGridX={false}
                        enableGridY={false}
                        labelSkipWidth={12}
                        labelSkipHeight={12}
                    />
                </div>
            {/* </CommonSpinner> */}
            {/* <div style={{ height: '400px', width: '100%', margin: 'auto' }}>
                <ResponsiveBar
                    data={data}
                    keys={[
                        'hot dog',
                        'burger',
                        'sandwich',
                        'kebab',
                        'fries',
                        'donut'
                    ]}
                    indexBy="country"
                    margin={{ top: 50, right: 130, bottom: 50, left: 60 }}
                    padding={0.3}
                    layout="horizontal"
                    valueScale={{ type: 'linear' }}
                    indexScale={{ type: 'band', round: true }}
                    colors={{ scheme: 'nivo' }}
                    onClick={(e) => focusMode(focusModeData)}
                    aaxisLeft={true}
                    axisBottom={ true}
                    enableLabel={false}
                    enableGridX={false}
                    enableGridY={false}
                    labelSkipWidth={12}
                    labelSkipHeight={12}
                    legends={[
                        {
                            dataFrom: 'keys',
                            anchor: 'bottom-right',
                            direction: 'column',
                            justify: false,
                            translateX: 120,
                            translateY: 0,
                            itemsSpacing: 2,
                            itemWidth: 100,
                            itemHeight: 20,
                            itemDirection: 'left-to-right',
                            itemOpacity: 0.85,
                            symbolSize: 20,
                            effects: [
                                {
                                    on: 'hover',
                                    style: {
                                        itemOpacity: 1
                                    }
                                }
                            ]
                        }
                    ]}
                />
            </div> */}
        </div>
    )
}

export default CommonBarCharts