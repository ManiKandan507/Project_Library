import React, { useEffect, useState } from 'react'
import { ResponsivePie } from '@nivo/pie';
import { stringToColour } from '../../util';


const CommonPieChart = ({ focusMode, focusModeData,  dataSource}) => {

    const [constructedData, setConstructedData] = useState([])

    useEffect(() => {
        if (dataSource?.length) {
            let filteredData = dataSource.map(group => {
                let color = stringToColour(group.customField);
                return {
                    "id": group.customField,
                    "label": group.customField,
                    "value": group.count,
                    "color": color
                }
            });
            setConstructedData(filteredData)
        }
    }, [dataSource])

    // const defaultTooltip = ({ data, value, color }) => {
    //     return (
    //         <div style={{ padding: 5, color: "#ffffff", background: "#222222" }}>
    //             <span>
    //                 {data.customField} : {value}
    //             </span>
    //         </div>
    //     )
    // }

    // const defaultColors = ({ data }) => {
    //     return data.color
    // }


    return (
        <div style={{ height: '400px', width: '100%', margin: 'auto' }}>
            <ResponsivePie
                data={constructedData}
                margin={{ top: 40, right: 80, bottom: 80, left: 80 }}
                startAngle={-3}
                padAngle={0.7}
                cornerRadius={3}
                activeOuterRadiusOffset={8}
                borderWidth={1}
                borderColor={{
                    from: 'color',
                    modifiers: [
                        [
                            'darker',
                            0.2
                        ]
                    ]
                }}
                arcLinkLabelsSkipAngle={10}
                arcLinkLabelsTextColor="#333333"
                arcLinkLabelsThickness={2}
                arcLinkLabelsColor={{ from: 'color' }}
                arcLabelsSkipAngle={10}
                onClick={(e) => focusMode(focusModeData)}
                arcLabelsTextColor={{
                    from: 'color',
                    modifiers: [
                        [
                            'darker',
                            2
                        ]
                    ]
                }}
            />
        </div>
    )
}

export default CommonPieChart