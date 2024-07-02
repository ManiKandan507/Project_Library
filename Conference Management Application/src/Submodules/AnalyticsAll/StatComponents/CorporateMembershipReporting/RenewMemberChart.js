import React, { useEffect, useState } from "react"
import { ResponsiveBar } from "@nivo/bar"
import { getMonthName, getCurrentDate } from "@/AnalyticsAll/StatComponents/util"
import { NoDataFound } from "@/CorporateMembershipReportingV2/common/NoDataFound"
import CommonSpinner from '@/CorporateMembershipReportingV2/common/CommonSpinner';
import moment from "moment";
import { Button, Empty } from "antd";
import { ReloadOutlined } from "@ant-design/icons";

export const RenewMemberChart = ({ recentRenewMembers, loading, setRenewReload, isRenewApiFail }) => {
    
    const [dataSource, setDataSource] = useState([])

    useEffect(()=>{
        let constructedNewMem = [];
        let sortMonth = recentRenewMembers.sort((rec1, rec2) => rec1.RenewYear - rec2.RenewYear );
        sortMonth.forEach((data)=>{
                if(data.RenewMonth ==  moment(getCurrentDate(), "DD-MM-YYYY").format("MM")){
                    constructedNewMem.push({...data, color: "#FAAD14", textColor:'#FFFFFF', RenewMonth:`MTD`})
                } else{
                    constructedNewMem.push({...data, color: "#FFF8D1", textColor:'#FAAD14', RenewMonth:getMonthName(data.RenewMonth)})
                } 
        })
        setDataSource(constructedNewMem)
    },[recentRenewMembers])

    const BarComponent = ({ bar }) => {
        return (
            <g transform={`translate(${bar.x},${bar.y})`}>
                <rect width={bar.width} height={bar.height} fill={bar.color} />
                <text x={bar.width /2 } y={bar.height - 8} textAnchor="middle" fill={ bar.key === 'Count.MTD' ? bar.height < 20 ? '#00000' : '#FFFFFF' : bar.data.data.textColor}> {bar.data.value} </text>
            </g>
        )
    }

    const handleReload = () =>{
        setRenewReload(true)
    }

    return (
        <CommonSpinner loading={loading}>
            <div style={{height:'150px'}}>
                { !isRenewApiFail && dataSource?.length > 0 ? <ResponsiveBar
                    height={150}
                    layout="vertical"
                    data={dataSource}
                    indexBy="RenewMonth"
                    margin={{ bottom: "20" }}
                    keys={['Count']}
                    colors = {dataSource.map(c => c.color)}
                    colorBy="indexValue"
                    enableGridX={false}
                    enableGridY={false}
                    axisLeft={''}
                    isInteractive={false}
                    barComponent={BarComponent}
                /> :
                <div className="norecords">
                    <Empty description={"No Records"} image={Empty.PRESENTED_IMAGE_SIMPLE} />
                </div> }
                {isRenewApiFail && <div style={{textAlign:'center', paddingRight: '30px', paddingTop:'34px'}}>
                    <Button
                       type="link"
                       onClick={handleReload}
                       icon={<ReloadOutlined />}
                    >
                        Reload
                    </Button>
                </div>
                }
            </div>
        </CommonSpinner>
    )
}