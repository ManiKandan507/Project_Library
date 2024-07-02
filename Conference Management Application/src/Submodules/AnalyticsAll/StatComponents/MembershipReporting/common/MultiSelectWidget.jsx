import React, { useState } from "react";
import { Alert, Badge, Button, Checkbox, Divider, Input, Modal, Select } from "antd";
import { ReloadOutlined, SaveFilled, SettingFilled } from "@ant-design/icons";
import { useContext } from "react";
import GlobalContext from "../context/MemberContext";
import { convertLowercaseFormat } from "../../util";
import { useEffect } from "react";
import _map from 'lodash/map';
import _groupBy from 'lodash/groupBy';
const { Option } = Select

const MultiSelectWidget = ({ groupsArray, membersGroup, setSelectedMembersGroups }) => {

    const { isGroups, setIsGroups } = useContext(GlobalContext)

    const [onChangeMembersGroup, setOnChangeMembersGroup] = useState(membersGroup)
    const [allGroups, setAllGroups] = useState(groupsArray);
    const [selectedGroups, setSelectedGroups] = useState(() => {

        if (groupsArray.length === membersGroup.length) {
            return []
        } else {
            return membersGroup

        }
    })
    const [searchValue, setSearchValue] = useState('')
    const handleSaveGroups = () => {
        setSelectedMembersGroups(selectedGroups.length > 0 ? selectedGroups : allGroups.map(group => group.groupname))
        setSearchValue('')
        setIsGroups(false)
    }

    const handleOnChange = (groups) => {
        setOnChangeMembersGroup(groups)
    }

    const handleCancel = () => {
        setSearchValue('')
        setIsGroups(false)
    }

    const handleReset = () => {
        setSelectedGroups([])
    }


    const onGroupSearch = searchValue => {
        searchValue = searchValue.target.value;
        let searchResult = []
        if (searchValue) {
            searchResult = groupsArray?.filter((group) => { return convertLowercaseFormat(`${group.groupname}`).includes(convertLowercaseFormat(searchValue)) })
        } else {
            searchResult = groupsArray
        }
        setAllGroups(searchResult)
        setSearchValue(searchValue)
    }

    const constructedData = () => {
        const resultedData = groupsArray?.map((grp) => {
            let orderBy = groupsArray.includes(grp.groupname) ? 1 : 0;
            return {
                ...grp,
                orderBy
            }
        })
        const finalResult = _map(_groupBy(resultedData, 'orderBy'))
        const sortedData = finalResult?.length === 1 ? finalResult[0] : [...finalResult[1], ...finalResult[0]];
        return sortedData
    }

    // useEffect(() => {
    //     selectedGroups(constructedData())
    // }, [groupsArray, selectedGroups])



    const handleUnCheck = (e) => {
        if (selectedGroups.includes(e.target.value)) {
            const checkedValues = selectedGroups.filter((data) => data !== e.target.value)
            setSelectedGroups(checkedValues)
        } else {
            setSelectedGroups((prev) => {
                return [...prev, e.target.value]
            })
        }
    }
    return (
        <>
            {/* <div className="mt-3 mb-2 ml-2" style={isGroups ? { backgroundColor: "#dce9f7" } : { backgroundColor: "white" }} >
            {isGroups && <div className="mt-3" style={{ width: '100%' }}>
                <Select
                    mode="multiple"
                    allowClear
                    className="px-2 pt-2"
                    style={{ width: '100%' }}
                    placeholder="Please select group"
                    value={onChangeMembersGroup}
                    onChange={handleOnChange}
                >
                    {groupsArray?.map((data) => {
                        return <Option key={data.groupid} value={data?.groupname} label={data?.groupname}>{data?.groupname}</Option>
                    })}
                </Select>
            </div>}
            {onChangeMembersGroup.length ? '' :
                <div className="py-2 px-2">  <Alert message="Please select atleast one group" type="error" /></div>}
            <div style={{display: 'flex', justifyContent: 'flex-end'}}>
                {!isGroups ?
                    <div className="pt-1 pl-2 pr-3"><Badge count={membersGroup.length}><Button onClick={() => setIsGroups(true)} icon={<SettingFilled />} >Edit Groups</Button></Badge></div>
                    : <div className="pl-3 pt-2 pb-2"><Button onClick={handleSaveGroups} disabled={onChangeMembersGroup.length ? false : true} icon={<SaveFilled />}>Save Groups</Button></div>}
            </div>
        </div> */}
            <Modal
                open={isGroups}
                onCancel={handleCancel}
                width="40%"
                title="Filter Groups"
                className="checkbox-filter filter-modal"
                bodyStyle={{ height: 'calc(100vh - 300px)' }}
                maskClosable={false}
                footer={[
                    <Button type="primary" icon={<SaveFilled />} onClick={handleSaveGroups}>
                        Apply
                    </Button>,
                    <Button icon={<ReloadOutlined />} onClick={handleReset} >
                        Reset
                    </Button>
                ]}
            >
                <div className="search-input">
                    <Input
                        placeholder="Search Groups"
                        allowClear
                        value={searchValue}
                        onChange={onGroupSearch}
                    />
                </div>
                <div className="checkbox-padding scroll-container">
                    {allGroups?.map((data, index) => {
                        return (
                            <div key={index} >
                                <Divider />
                                <Checkbox checked={selectedGroups.includes(data.groupname) ? true : false} value={data.groupname} onClick={(e) => handleUnCheck(e)} > {data?.groupname} </Checkbox>
                            </div>
                        )
                    })}
                </div>
            </Modal>
        </>
    )
}
export default MultiSelectWidget;