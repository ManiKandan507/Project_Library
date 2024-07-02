import { Col, Modal, Typography, Row, Button, Input, Table, Select } from 'antd';
import React, { useState, useEffect, useContext } from 'react';
import { MailFilled } from '@ant-design/icons';
import { convertLowercaseFormat } from '@/AnalyticsAll/StatComponents/util';
import GlobalContext from '@/CorporateMembershipReportingV2/context/MemberContext';
import CustomExportCsv from '@/CorporateMembershipReportingV2/common/CustomExportCsv';
import { COUNTRY_VIEW, CONTINENT_VIEW } from '@/CorporateMembershipReportingV2/LocationReport/constants';
import CommonSpinner from '@/CorporateMembershipReportingV2/common/CommonSpinner';
import _map from 'lodash/map';

const {Option} = Select
const MapModal = (props) => {
    const { params: { groups_array, appdir }, data, handleCancel, selectedView } = props
    const { membersGroup} = useContext(GlobalContext);
    const [memberDataSource, setMemberDataSource] = useState([]);
    const [memberLoading, setMemberLoading] = useState(true);
    const [selectedTableData, setSelectedTableData] = useState([]);
    const [searchValue, setSearchValue] = useState("");
    const [groupId, setGroupId] = useState([]);
    const [primaryValue, setPrimaryValue] = useState("");

    useEffect(()=>{
        if(data.show && groupId?.length){
            if(selectedView === COUNTRY_VIEW || selectedView === CONTINENT_VIEW){
                dispatchCountryApi(data?.data.Country)
            } else {
                dispatchStateAPI(data?.data.Country, data?.data.State)
            }
        }
    }, [data.show, groupId, selectedView, data.data])

    const MemberDetailsColumn = [
        {
            title:"ID",
            dataIndex: "CompIDThisConfID",
            key: "CompIDThisConfID",
            className: "text-left",
            width:'8%', 
            render: (val) => {
                return (
                    <div>{val ? val : '-'}</div>
                )
            },
        },
        {
            title: "Organization",
            dataIndex: "Companyname",
            key: "Companyname",
            className: "text-left",
            render: (_, data) => {
                return (
                    <div style={{ fontSize: '16px' }}>
                        <div>{data?.Companyname}</div>
                    </div>
                )
            },
        },
        {
            title: "State",
            dataIndex: "State",
            key: "State",
            width:'10%', 
            className: "text-left",
            render: val =><div>{ val ? val : '-'} </div>,
        },
        {
            title: "Action",
            dataIndex: "action",
            key: "action",
            className: "text-left",
            width:'9%', 
            render: (_,data) => {
                return <Button
                target="_blank"
                href={`https://www.xcdsystem.com/${appdir}/admin/company/managecompanies/index.cfm?CFGRIDKEY=${data.CompID}&view=profile`}
              >
                Manage
              </Button>
            },
        }
    ];

    const locationHeaders =[
        { label: "ID", key: "id" },
        { label: "Organization", key: "Company" },
        { label: "State", key: "State" },
    ]

    const onMemberSearch = searchValue => {
        searchValue = convertLowercaseFormat(searchValue.target.value);
        let searchResult = []
        if (searchValue) {
            searchResult = selectedTableData?.filter((mem) => { return convertLowercaseFormat(`${mem?.Companyname}`).includes(searchValue.trim()) })
        } else {
            searchResult = selectedTableData
        }
        setSearchValue(searchValue)
        setMemberDataSource(searchResult)
    };

    const dispatchCountryApi = async(data) => {
        try{
            setMemberLoading(true)
            const dataSource = await fetch(`https://bm6uvz69il.execute-api.us-east-1.amazonaws.com/dev/api?module=dues&component=corp_reports&function=corp_location_country&appdir=${appdir}&groupid=${groupId}&detailed=1&country=${data}`);
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
            const stateInfo = await fetch (`https://bm6uvz69il.execute-api.us-east-1.amazonaws.com/dev/api?module=dues&component=corp_reports&function=corp_location_state&appdir=${appdir}&groupid=${groupId}&detailed=1&country=${Country}&state=${State}`);

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

    const handleSendEmail = () => {
        let reviewIds = _map(memberDataSource, "CompIDThisConfID").join();
        window.parent.postMessage(
            { reviewIds, type: "Email"},
            "*"
        );
    }

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
        <Modal visible={data.show} title="Member Details" footer={null} onCancel={handleCancel} width='80%'>
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
                    <Col> <Button icon={<MailFilled height="15px" />} onClick={handleSendEmail}>Send Email</Button> </Col>
                    <Col>
                        <CustomExportCsv
                            dataSource={memberDataSource?.map(data => {
                                return {
                                    id: data.CompIDThisConfID,
                                    Company:data.Companyname?data.Companyname:'-',
                                    State: data.State ? data.State : '-',
                                };
                            })}
                            Headers={locationHeaders}
                            exportFileName={"Location"}
                        />
                    </Col>
                </Row>
                <Table dataSource={memberDataSource} columns={MemberDetailsColumn} pagination={true} className='CurrentMemberTable' scroll={{ y: 300 }} size="small"/>
            </CommonSpinner>
        </Modal>
    )
}

export default MapModal;