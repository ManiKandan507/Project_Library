import React, { useState } from "react";
import { Button,  Divider, Input, Modal, Radio, Select } from "antd";
import { ReloadOutlined, SaveFilled } from "@ant-design/icons";
import { useContext } from "react";
import GlobalContext from "../context/MemberContext";
import { convertLowercaseFormat } from "../../util";
import _map from 'lodash/map';
import _groupBy from 'lodash/groupBy';
const { Option } = Select

const UniSelectWidget = ({ groupsArray, membersGroup, setSelectedMembersGroups }) => {
    
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


    const handleUnCheck = (e) => {
        if (selectedGroups.includes(e.target.value)) {
            const checkedValues = selectedGroups.filter((data) => data === e.target.value)
            setSelectedGroups(checkedValues)
        } else {
            setSelectedGroups((prev) => {
                return [e.target.value]
            })
        }
    }
    return (
        <>
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
                <Radio.Group onChange={(e) => handleUnCheck(e)} value={selectedGroups[0] ?? membersGroup[0]}>
                    {allGroups?.map((data, index) => {
                        return (
                            <div key={index} >
                                <Divider />
                                <Radio 
                                // checked={selectedGroups.includes(data.groupname) ? true : false} 
                                value={data.groupname} 
                                // onClick={(e) => handleUnCheck(e)}
                                 > {data?.groupname} </Radio>
                            </div>
                        )
                    })}
                    </Radio.Group>
                </div>
            </Modal>
        </>
    )
}
export default UniSelectWidget;