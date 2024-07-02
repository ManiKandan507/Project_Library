import React from "react";
import { Tooltip } from 'antd'

const CompareChartLegend = (props) => {

    const { dataSource } = props;

    return (
        <>
            {dataSource?.map((item, index) => (
                <div key={index} style={{ gap: '3px', marginBottom:'3px'}} className="d-flex">
                    <div style={{backgroundColor: `${item?.color}`}} className="circle"></div>
                    <Tooltip title={item.id} placement={'topLeft'}>
                        <div style={{textAlign: 'left', width: '100%'}} className='mr-3 chartLegends chartLegendsNodes'>{item?.id}</div>
                    </Tooltip>
                </div>
            ))}
        </>
    )
}
export default CompareChartLegend;