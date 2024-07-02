import React from 'react'
import { ResponsiveBar } from '@nivo/bar'

const MembersByOccupation = () => {
    const data = [
        {
            "country": "AD",
            "hot dog": 109,
            "hot dogColor": "hsl(64, 70%, 50%)",
        },
        {
            "country": "AE",
            "burger": 182,
            "burgerColor": "hsl(217, 70%, 50%)",
        },
        {
            "country": "AF",
            "sandwich": 100,
            "sandwichColor": "hsl(45, 70%, 50%)",
        },
        {
            "country": "AG",
            "kebab": 59,
            "kebabColor": "hsl(292, 70%, 50%)",
        },
        {
            "country": "AI",
            "fries": 156,
            "friesColor": "hsl(114, 70%, 50%)",
        },
        {
            "country": "AL",
            "donut": 121,
            "donutColor": "hsl(87, 70%, 50%)"
        },
    ]

    return (
        <div>
            <div style={{ padding: "2% 5% 2% 5%" }}>
                <div style={{ fontWeight: 'bold', marginBottom: '10px' }} className='font-s15' >
                    MEMBERS BY OCCUPATION
                </div>
            </div>
            <div style={{ height: '400px', width: '100%', margin: 'auto' }}>
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
                    defs={[
                        {
                            id: 'dots',
                            type: 'patternDots',
                            background: 'inherit',
                            color: '#38bcb2',
                            size: 4,
                            padding: 1,
                            stagger: true
                        },
                        {
                            id: 'lines',
                            type: 'patternLines',
                            background: 'inherit',
                            color: '#eed312',
                            rotation: -45,
                            lineWidth: 6,
                            spacing: 10
                        }
                    ]}
                    fill={[
                        {
                            match: {
                                id: 'fries'
                            },
                            id: 'dots'
                        },
                        {
                            match: {
                                id: 'sandwich'
                            },
                            id: 'lines'
                        }
                    ]}
                    borderColor={{
                        from: 'color',
                        modifiers: [
                            [
                                'darker',
                                1.6
                            ]
                        ]
                    }}
                    axisTop={null}
                    axisRight={null}
                    axisBottom={{
                        tickSize: 5,
                        tickPadding: 5,
                        tickRotation: 0,
                        legend: 'country',
                        legendPosition: 'middle',
                        legendOffset: 32,
                        truncateTickAt: 0
                    }}
                    axisLeft={{
                        tickSize: 5,
                        tickPadding: 5,
                        tickRotation: 0,
                        legend: 'food',
                        legendPosition: 'middle',
                        legendOffset: -40,
                        truncateTickAt: 0
                    }}
                    labelSkipWidth={12}
                    labelSkipHeight={12}
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
                    role="application"
                    ariaLabel="Nivo bar chart demo"
                    barAriaLabel={e => e.id + ": " + e.formattedValue + " in country: " + e.indexValue}
                />
            </div>
        </div>
    )






}

export default MembersByOccupation;
