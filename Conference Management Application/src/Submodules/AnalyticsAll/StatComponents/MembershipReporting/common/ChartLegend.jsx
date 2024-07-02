import React from "react";
import {Tooltip} from 'antd'

const ChartLegends = (props) =>{
  
  const {dataSource} = props

  const legendsData = dataSource?.sort((rec1, rec2) =>
    rec1.GroupName.localeCompare(rec2.GroupName));

   return(
        <>
        {legendsData?.map((item, index)=>(
            <div key={index} className="d-flex justify-end">
                <Tooltip title={item.GroupName}>
                  <div className='mr-3 chartLegends chartLegendsNodes'>{item.GroupName}</div>
                </Tooltip>
                <svg width='20' height='26'>
                  <rect width="15" height="15" style={{fill:`${item.color}`}} />
                </svg>
            </div>
        ))}
        </>
    )
}
export default ChartLegends;