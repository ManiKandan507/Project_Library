import React, { useEffect, useState } from "react"
import { getMonthName, getCurrentDate, getMonthStartDate } from "@/AnalyticsAll/StatComponents/util"
import { ResponsiveBar } from "@nivo/bar"
import { NoDataFound } from "@/MembershipReportingV2/common/NoDataFound"
import CommonSpinner from '@/MembershipReportingV2/common/CommonSpinner';
import moment from "moment";
import { Button, Empty } from "antd";
import { ReloadOutlined } from "@ant-design/icons";

export const NewMemberChart = ({ recentNewMember, loading, setIsReload, isApiFail}) => {

    const [ dataSource, setDataSource ]= useState([])

    useEffect(()=>{
        let constructedNewMem = [];
        let sortMonth = recentNewMember.sort((rec1, rec2) => rec1.JoinYear - rec2.JoinYear );
        sortMonth.map((data)=>{
            if(data.JoinMonth == moment(getCurrentDate(),"DD-MM-YYYY").format("MM")){
                constructedNewMem.push({...data, color:'#52C41A', textColor:'#FFFFFF', JoinMonth:`MTD`})
            } else{
                constructedNewMem.push({...data, color:"#e1f3d8", textColor:'#52C41A', JoinMonth:getMonthName(data.JoinMonth)})
            }
        })
       setDataSource(constructedNewMem)
    },[recentNewMember])
    
    const BarComponent = ({ bar }) => {
        return (
            <g transform={`translate(${bar.x},${bar.y})`}>
                <rect width={bar.width} height={bar.height} fill={bar.color} />
                <text x={bar.width / 2} y={bar.height - 10} textAnchor="middle" fill={ bar.key === 'Count.MTD' ? bar.height < 20 ? '#00000' : '#FFFFFF' : bar.data.data.textColor}> {bar.data.value} </text>
            </g>
        )
    }

    const handleReload = () =>{
        setIsReload(true)
    }

<<<<<<< HEAD
=======
    console.log("isApiFail----->",isApiFail);

>>>>>>> 869aae639d685259d1760f9199b6e8e54991839b
    return (
        <CommonSpinner loading={loading}>
            <div style={{height:'150px'}}>
                {!isApiFail && dataSource.length > 0 ? 
                <ResponsiveBar
                    height={150}
                    layout="vertical"
                    data={dataSource}
                    indexBy="JoinMonth"
                    margin={{ bottom: "20" }}
                    keys={['Count']}
                    colors = {dataSource.map(c => c.color)}
                    colorBy="indexValue"
                    enableGridX={false}
                    enableGridY={false}
                    axisLeft={''}
                    isInteractive={false}
                    barComponent={BarComponent}
                /> 
                 : 
                 <div className="norecords">
                    <Empty description={"No Records"} image={Empty.PRESENTED_IMAGE_SIMPLE} />
                 </div>}
                {isApiFail && <div style={{textAlign:'center', paddingRight: '30px', paddingTop:'34px'}}>
                    <Button 
                       type="link" 
                       icon={<ReloadOutlined/>} 
                       onClick={handleReload}
                    >
                        Reload
                    </Button>
                </div>}
            </div>
        </CommonSpinner>
    )
}