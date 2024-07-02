import React from "react";
import { getFullMonthName } from "../../util";

const ChartLegends = (props) => {

  const { dataSource } = props


  const legendsData = dataSource
  // ?.sort((a, b) => b.monthOfInvoice - a.monthOfInvoice)

  // ?.sort((rec1, rec2) => rec1.month.localeCompare(rec2.month));
  // console.log("dataSource",dataSource);

  return (
    <>
      {legendsData?.map((item, index) => (
        <div key={index} className="d-flex justify-end">
          <div className='mr-3 chartLegends chartLegendsNodes'>{getFullMonthName(item.monthOfInvoice)}</div>
          <svg width='20' height='26'>
            <rect width="15" height="15" style={{ fill: `${item.color}` }} />
          </svg>
        </div>
      ))}
    </>
  )
}
export default ChartLegends;