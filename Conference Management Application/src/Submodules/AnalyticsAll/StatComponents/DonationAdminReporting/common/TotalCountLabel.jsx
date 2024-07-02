import React from "react";
import { currencyFormatter } from "../../util";

const TotalCountLabel = ({ bars,yScale, xScale, key, isVertical, type }) => {
    const labelYMargin = 28;

    const barValue = bars.map(({ data: { data, indexValue }, x, y, width, height }, i) => {
        const totalCount = data[key] && data[key] > 0 ? data[key] : "";

        return ({
            indexValue: indexValue,
            x:x,
            y:y,
            width: width,
            height: height,
            i:i,
            positionValue:totalCount
        })
    })

    return (
        <>{barValue.map(val => (
            <g
                transform={isVertical ? `translate(${val?.x}, ${yScale(val?.positionValue) - labelYMargin})` : `translate( ${xScale(val?.positionValue) - labelYMargin}, ${val?.y})`}
                key={`${val?.indexValue}-${val?.i}`}
            >
                {isVertical ?
                    <text
                    x={val?.width/2}
                    y={labelYMargin / 2}
                    style={{fontSize: 12}}
                    textAnchor="middle"
                    alignmentBaseline="central"
                    >
                        {currencyFormatter(val?.positionValue)}
                    </text> :
                    <text
                    x={70 / 2}
                    y={val?.height / 2}
                    style={{fontSize: 12}}
                    textAnchor='start'
                    alignmentBaseline="central"
                    >
                        { currencyFormatter(val?.positionValue)}
                    </text>
                }
            </g>
        ))}</>
    )
}
export default TotalCountLabel;