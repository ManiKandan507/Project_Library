import React from "react";

const TotalCountLabel = ({bars, xScale, yScale, key = 'CountPerGroup', isVertical}) =>{
    const labelYMargin = 28;

    return bars.map(({data:{data,indexValue}, x, y ,width, height}, i)=>{
        const positionValue = data[key] && data[key] > 0 ? data[key] : "";
        return(
            <g
               transform={isVertical ? `translate(${x}, ${yScale(positionValue) - labelYMargin})` : `translate(${xScale(positionValue) - labelYMargin}, ${y})`}
               key={`${indexValue}-${i}`}
            >
                {isVertical ? 
                   <text
                    x={width/2}
                    y={labelYMargin/2}
                    style={{fontSize:12}}
                    textAnchor="middle"
                    alignmentBaseline="central"
                   >
                    {positionValue}
                   </text> :
                   <text
                    x={70/2}
                    y={height/2}
                    style={{fontSize: 12}}
                    textAnchor="start"
                    alignmentBaseline="central"
                   >
                    {positionValue}
                   </text>
                }

            </g>
        )
     })

}
export default TotalCountLabel