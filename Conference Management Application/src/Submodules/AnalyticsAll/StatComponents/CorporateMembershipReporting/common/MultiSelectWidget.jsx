import React, { useState } from "react";
import { Alert, Badge, Button, Select } from "antd";
import { SaveFilled, SettingFilled } from "@ant-design/icons";

const {Option} = Select;

const MultiSelectWidget = ({membersGroup,groupsArray,setSelectedMembersGroups}) =>{
    const [isGroups,setIsGroups] = useState(false)
    const [onChangeMembersGroup, setOnChangeMembersGroup] = useState(membersGroup)

    const handleOnClick = () => {
        setSelectedMembersGroups(onChangeMembersGroup)
        setIsGroups(false)
    }

    const handleOnChange= (groups) =>{ 
        setOnChangeMembersGroup(groups)
    }


    return (
        <div  style={isGroups ? {backgroundColor: "#dce9f7"} : {backgroundColor: "white"}} >
        { isGroups && <div className="mt-3" style={{width: '100%'}}>
            <Select
            mode="multiple"
            allowClear
            className="px-2 pt-2"
            style={{ width: '100%'}}
            placeholder="Please select group"
            value={onChangeMembersGroup}
            onChange={ handleOnChange}
            >
                {groupsArray?.map((data)=>{
                    return <Option key={data.groupid} value={data?.groupname} label={data?.groupname}>{data?.groupname}</Option>
                })}
            </Select>
        </div> }
        { onChangeMembersGroup.length ? '' :
            <div className="py-2 px-2">  <Alert  message="Please select atleast one group" type="error" /></div>}
        <div className="pb-4">
          {!isGroups ? 
          <div className="pt-4 pl-3 pr-3"><Badge count={membersGroup.length}><Button  onClick={()=>setIsGroups(true)} icon={<SettingFilled />} >Edit Groups</Button></Badge></div>
           : <div className="pl-3 pt-2"><Button onClick={handleOnClick} disabled={onChangeMembersGroup.length ? false : true} icon={<SaveFilled />}>Save Groups</Button></div>}
        </div>
        </div>
    )
}
export default MultiSelectWidget;