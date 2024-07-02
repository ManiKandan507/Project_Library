import { Col, Modal, Typography, Row, Avatar, Button, Input, Table, Select } from 'antd';
import React, { useState, useEffect, useRef } from 'react';
import { MailFilled, UserOutlined } from '@ant-design/icons';
import { sortName, convertLowercaseFormat, getMonthStartDate } from '@/MembershipReporting/util';
import moment from 'moment';
import {CustomExportCsv} from '@/MembershipReporting/components/Reporting/Common/CustomExportCsv';
import { COUNTRY_VIEW, CONTINENT_VIEW } from '@/MembershipReporting/components/Reporting/LocationReport/constants';
import CommonSpinner from '@/MembershipReporting/components/Reporting/Common/CommonSpinner';

const {Option} = Select
const MapModal = (props) => {
    const exportTableRef = useRef();
    const { sourceHex:source_hex, groupsid:groups_array, appdir,  data, handleCancel, selectedView, membersGroup } = props;

    const [memberDataSource, setMemberDataSource] = useState([]);
    const [memberLoading, setMemberLoading] = useState(true);
    const [selectedTableData, setSelectedTableData] = useState([]);
    const [searchValue, setSearchValue] = useState("");
    const [groupId, setGroupId] = useState([]);
    const [primaryValue, setPrimaryValue] = useState("");
    const [downloadCsv, setDownloadCsv] = useState(false);

    useEffect(()=>{
        if(data.show && groupId?.length){
            if(selectedView === COUNTRY_VIEW || selectedView === CONTINENT_VIEW){
                dispatchCountryApi(data?.data.Country)
            } else {
                dispatchStateAPI(data?.data.Country, data?.data.State)
            }
        }
    }, [data.show, groupId, selectedView, data.data])

    useEffect(() => {
        if (memberDataSource.length > 0 && downloadCsv && exportTableRef.current) {
            setTimeout(() => {
                exportTableRef.current?.link.click();
                setDownloadCsv(false)
            }, 20);
        }
    }, [memberDataSource, downloadCsv]);

    const MemberDetailsColumn = [
        {
            title:"ID",
            dataIndex: "ReviewIDThisCustID",
            key: "ReviewIDThisCustID",
            className: "text-left",
            render: (val) => {
                return (
                    <div>{val ? val : '-'}</div>
                )
            },
        },
        {
            title: "Name",
            dataIndex: "user",
            key: "user",
            className: "text-left",
            render: (_, data) => {
                return (
                    <div style={{ fontSize: '16px' }}>
                        <Row style={{ flexWrap: "nowrap" }}>
                            <Col flex={1}>
                                <Avatar size={40} alt="profile" icon={<UserOutlined/>} src={data?.Picture}/>
                            </Col>
                            <Col flex={4} className="ml-3">
                                <div>{data?.Firstname} {data?.Lastname}</div>
                            </Col>
                        </Row>
                    </div>
                )
            },
            sorter:sortName
        },
        {
            title: "State",
            dataIndex: "State",
            key: "State",
            className: "text-left",
            render: val =><div>{ val ? val : '-'} </div>,
        },
        {
            title: "City",
            dataIndex: "City",
            key: "City",
            className: "text-left",
            render: val =><div>{ val ? val : '-'} </div>,
        },
        {
            title: "Member Type",
            dataIndex: "GroupName",
            key: "GroupName",
            className: "text-left",
            render: val => <div> {val ? val : '-'} </div>
        },
        {
            title: "Joining Date",
            dataIndex: "MemberJoinDate",
            key: "MemberJoinDate",
            className: "text-left",
            render: date => (
                <div>
                    {moment(date).isValid() ? moment(date).format('DD/MM/YYYY') : "-"}
                </div>
            ),
        },
        {
            title: "Expiration Date",
            dataIndex: "ExpirationDate",
            key: "ExpirationDate",
            className: "text-left",
            render: date => (
                <div>
                    {moment(date).isValid() ? moment(date).format('DD/MM/YYYY') : "-"}
                </div>
            ),
        },
        {
            title: "Action",
            dataIndex: "action",
            key: "action",
            className: "text-left",
            render: (_,data) => {
                return  <Button target="_blank" href={`https://www.xcdsystem.com/${appdir}/admin/contacts/managecontacts/index.cfm?CFGRIDKEY=${data.ReviewIDThisCustID}`}> Manage </Button>
            },
        }
    ];

    const locationHeaders =[
        { label: "ID", key: "ReviewIDThisCustID" },
        { label: "Name", key: "user" },
        { label: "State", key: "State" },
        { label: "City", key: "City" },
        { label: "Member Type", key: "GroupName" },
        { label: "Joining Date", key: "MemberJoinDate" },
        { label: "Expiration Date", key: "ExpirationDate" },
    ]

    const onMemberSearch = searchValue => {
        searchValue = convertLowercaseFormat(searchValue.target.value);
        let searchResult = []
        if (searchValue) {
            searchResult = selectedTableData?.filter((mem) => { return convertLowercaseFormat(`${mem?.Firstname} ${mem?.Lastname}`).includes(searchValue.trim()) })
        } else {
            searchResult = selectedTableData
        }
        setSearchValue(searchValue)
        setMemberDataSource(searchResult)
    };

    const dispatchCountryApi = async(data) => {
        try{
            setMemberLoading(true)
            const dataSource = await fetch(`https://bm6uvz69il.execute-api.us-east-1.amazonaws.com/dev/api?module=dues&component=reports&function=location_country&source=${source_hex}&groupid=${groupId}&detailed=1&country=${data}`);
    
            const memberDetails = await dataSource.json();
            if(memberDetails?.success){
                setMemberDataSource(memberDetails.data)
                setSelectedTableData(memberDetails.data)
            }
            setMemberLoading(false)
        } catch(error){
            console.log("error",error)
        }
        return;
    }

    const dispatchStateAPI = async(Country, State) => {
        try{ 
            setMemberLoading(true)
            const stateInfo = await fetch (`https://bm6uvz69il.execute-api.us-east-1.amazonaws.com/dev/api?module=dues&component=reports&function=location_state&source=${source_hex}&groupid=${groupId}&detailed=1&country=${Country}&state=${State}`);

            const result = await stateInfo.json();
            if(result?.success){
                setMemberDataSource(result.data)
                setSelectedTableData(result.data)
            }
            setMemberLoading(false)
        } catch(error){
            console.log("error",error)
        }
        return;
    }
    
    useEffect(()=>{
        let data = membersGroup?.map((data)=>{
           return groups_array.find(item => item?.groupname.trim() === data.trim())?.groupid
        })
        setGroupId(data)
    },[groups_array, membersGroup])

    useEffect(()=>{
        if(data.show === false){
            setSearchValue("")
        }
    },[data.show])

    useEffect(()=>{
        let defaultValue;
        if(!data.data.isTotalMembers){
            if(selectedView === COUNTRY_VIEW){
                defaultValue = data?.data.Country
            } else if(selectedView === CONTINENT_VIEW){
                defaultValue = data?.data.Continent
            } else if(selectedView === 'CANADA_STATE_VIEW' || selectedView === 'USA_STATE_VIEW'){
                defaultValue = data?.data.State
            } else{
                defaultValue = data?.data.Region
            }
        } else {
            defaultValue = "All"
        }
        setPrimaryValue(defaultValue)
    },[selectedView, data.data])

    const handleSelect = (e) =>{
        setPrimaryValue(e)
        if(selectedView === COUNTRY_VIEW){
            dispatchCountryApi(e)
        } else if(selectedView === CONTINENT_VIEW ){
            data.data.dataSource.map((data)=>{
                if(e === data.Continent){
                    dispatchCountryApi(data.Country)
                }
                return data
            })
        } else if(selectedView === 'CANADA_REGION_VIEW' || selectedView === 'USA_REGION_VIEW' ){
            data.data.dataSource.map((reg)=>{
                if(e === reg.Region){
                    dispatchStateAPI(data?.data.Country, reg.State)
                }
                return data
            })
        } else {
            dispatchStateAPI(data?.data.Country, e)
        }
    }
    
    const handleMemberDataExport = () =>{
        setDownloadCsv(true)
    }

    const renderSelect = () =>{
        if(selectedView === COUNTRY_VIEW){
            return  <div className="mr-5" style={{ fontSize: "16px" }}>
                        <Typography> Country </Typography>
                        <Select style={{width:'130px'}} onChange={handleSelect} value={primaryValue} showSearch>
                            {data.data.dataSource?.map((data)=>{
                                return <Option key={data.key} value={data?.Country}>{data?.Country}</Option>
                            })}
                        </Select>
                    </div>
        }
        if(selectedView === CONTINENT_VIEW){
            return  <div className= "mr-5" style={{ fontSize: "16px" }}>
                        <Typography> Continent </Typography>
                        <Select style={{width:'130px'}} onChange={handleSelect} value={primaryValue} showSearch>
                            {data.data.dataSource?.map((data)=>{
                                return <Option key={data.key} value={data?.Continent}>{data?.Continent}</Option>
                            })}
                        </Select>
                    </div>
        }
        if(selectedView === 'CANADA_STATE_VIEW' || selectedView === 'USA_STATE_VIEW' ){
            return  (
                <div className='d-flex justify-space-around' style={{width:'310px'}}>
                    <div style={{fontSize: "16px"}}>
                        <Typography> Country </Typography>
                        <div style={{ fontWeight: 'bold' }}>{data.data.Country}</div>
                    </div>
                    <div style={{fontSize: "16px"}}>
                        <Typography> State </Typography>
                        <Select style={{width:'130px'}} onChange={handleSelect} value={primaryValue} showSearch>
                            {data.data.dataSource?.map((data)=>{
                                return <Option key={data.key} value={data?.State}>{data?.State}</Option>
                            })}
                        </Select>
                    </div>
                </div>
            )
        }
        if(selectedView === 'CANADA_REGION_VIEW' || selectedView === 'USA_REGION_VIEW' ){
            return  (
                <div className='d-flex justify-space-around' style={{width:'310px'}}>
                    <div style={{fontSize: "16px"}}>
                        <Typography> Country </Typography>
                        <div style={{ fontWeight: 'bold' }}>{data.data.Country}</div>
                    </div>
                    <div style={{fontSize: "16px"}}>
                        <Typography> Region </Typography>
                        <Select style={{width:'130px'}} onChange={handleSelect} value={primaryValue} showSearch>
                            {data.data.dataSource?.map((data)=>{
                                return <Option key={data.key} value={data?.Region}>{data?.Region}</Option>
                            })}
                        </Select>
                    </div>
                </div>
            )
        }
    }

    return (
        <Modal open={data.show} title="Member Details" footer={null} onCancel={handleCancel} width='80%'>
            <CommonSpinner loading={memberLoading}>
                <Row gutter={16} className='py-3'>
                    <Col flex={"110px"} style={{fontSize: "16px"}}>
                        <Typography>Total Count </Typography>
                        <div style={{ fontWeight: 'bold' }}>{memberDataSource?.length}</div>
                    </Col>
                    <Col>
                        {renderSelect()}
                    </Col>
                    <Col style={{ fontSize: "16px" }}>
                        <Typography>Report Type</Typography>
                        <div style={{ fontWeight: 'bold' }}>{'Location'}</div>
                    </Col>
                </Row>
                <Row gutter={16} className='py-3'>
                    <Col flex={3}> <Input placeholder="Search" className="mr-3" allowClear style={{ height: '34px' }}  value={searchValue} onChange={onMemberSearch}></Input> </Col>
                    <Col> <Button icon={<MailFilled height="15px" />}>Send Email</Button> </Col>
                    <Col>
                        <CustomExportCsv
                            memberData={memberDataSource?.map(data => {
                                return {
                                    ReviewIDThisCustID: data.ReviewIDThisCustID,
                                    user: `${data.Firstname} ${data.Lastname}`,
                                    State: data.State ? data.State : '-',
                                    City: data.City ? data.City : '-',
                                    GroupName: data.GroupName ? data.GroupName : '-',
                                    MemberJoinDate: moment(data.MemberJoinDate).format("DD/MM/YYYY"),
                                    ExpirationDate: moment(data.ExpirationDate).format("DD/MM/YYYY"),
                                };
                            })}
                            headers={locationHeaders}
                            fileName={{ name: "Location", startDate:`${moment()}`}}
                            handleExportCsv={downloadCsv}
                            exportTableRef={exportTableRef}
                            handleMemberDataExport={handleMemberDataExport}
                        />
                    </Col>
                </Row>
                <Table dataSource={memberDataSource} columns={MemberDetailsColumn} pagination={true} className='CurrentMemberTable' scroll={{ y: 300 }}/>
            </CommonSpinner>
        </Modal>
    )
}

export default MapModal;