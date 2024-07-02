import { FilterOutlined, SettingFilled } from "@ant-design/icons";
import { Badge, Button } from "antd";
import React from "react";
import { useContext } from "react";
import GlobalContext from "../context/MemberContext";

const EditGroups = (props) => {
    const { isGroups, setIsGroups, membersGroup } = useContext(GlobalContext)
    return (
        <>
            {!isGroups &&
                <div className="pt-1 pl-1">
                    <Badge count={membersGroup.length == props.groupsArray.length ? null : membersGroup.length}>
                        <Button onClick={() => setIsGroups(true)} type="primary" icon={<FilterOutlined />} >Filter Groups</Button>
                    </Badge>
                </div>
            }
        </>
    )
}
export default EditGroups;