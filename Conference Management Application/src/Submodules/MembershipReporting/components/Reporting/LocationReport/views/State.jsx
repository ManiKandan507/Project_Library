import React, { useEffect, useRef, useState, useCallback, memo, createRef } from 'react';
import { MAP_VIEW, LOCATION_INITIAL_STATE, CANADA_STATE_LIST, USA_STATE_LIST, TABLE_VIEW } from '@/MembershipReporting/components/Reporting/LocationReport/constants';
import { hashMapStateBasedData } from '@/MembershipReporting/components/Reporting/LocationReport/helper';
import Map from '../Map'
import { getLocationDetails } from '@/MembershipReporting/components/Reporting/LocationReport/service';
import CommonSpinner from '@/MembershipReporting/components/Reporting/Common/CommonSpinner';
import _isEmpty from 'lodash/isEmpty';
import MapModal from './Modal';
import { Col, Row, Table } from 'antd';
import {CustomExportCsv} from '@/MembershipReporting/components/Reporting/Common/CustomExportCsv';
import moment from 'moment';
import { getMonthStartDate } from '@/MembershipReporting/util';

const State = (props) =>{
    const mapRef = useRef()
    const exportTableRef = useRef()
    const {groupsid:groups_array, sourceHex:source_hex , appdir, viewMode, membersGroup, selectedView } = props

    const [locationsInfo, setLocationsInfo] = useState([]);
    const [loading, setLoading] = useState(false);
    const [groupId, setGroupId] = useState([]);
    const [mapModalData, setMapModalData] = useState();
    const [downloadCsv, setDownloadCsv]=useState(false);

    const fetchLocation = async (source_hex, locationType, groupId, country, state) => {
        try{
            setLoading(true)
            let result= await getLocationDetails({source_hex, locationType, groupId, country, state})
            let locationState = {...LOCATION_INITIAL_STATE};
            if(result?.success){
                if(locationType === "location_state"){
                    locationState = { ...locationState, ...hashMapStateBasedData(result?.data) };
                }
            }
            setLocationsInfo(locationState);
            setLoading(false)
        } catch(error){
            console.log("error",error)
        }
    };

    useEffect(()=>{
        if(groupId?.length){
            if(selectedView === 'USA_STATE_VIEW'){
                fetchLocation(source_hex, "location_state", groupId, "United States", USA_STATE_LIST)
            }
            if(selectedView === 'CANADA_STATE_VIEW'){
                fetchLocation(source_hex, "location_state", groupId, "Canada",CANADA_STATE_LIST)
            }
        }
    },[groupId, selectedView])

    const renderMemberCount = () =>{
        let totalMembers = 0;
        locationsInfo[selectedView]?.map(area => { totalMembers += area?.Members})
        return totalMembers;
    }

    const handleMapClick = useCallback((e) => {
        if(!_isEmpty(e.data)){
            setMapModalData({show: true, data:{State:e.data.State, Country:e.data.Country, Members:e.data.Members, dataSource:locationsInfo[selectedView]}})
        }
    },[locationsInfo[selectedView]])

    const handleCancel = (e) => {
        setMapModalData({show: false, data:{}})
    }

    const handleTableClick = useCallback((e) => {
        if(!_isEmpty(e)){
            setMapModalData({show: true, data:{State:e.State, Country:e.Country, Members:e.Members, dataSource:locationsInfo[selectedView]}})
        }
    },[locationsInfo[selectedView]])

    const handleClick = () => {
        let countryData;
        let stateData = [];
        locationsInfo[selectedView]?.map((data)=>{
            countryData = data.Country
            stateData.push(data.State)
        })
        setMapModalData({show: true, data:{Country:countryData, State:stateData, Members:renderMemberCount(), isTotalMembers:true, dataSource:locationsInfo[selectedView]}})
    }

    useEffect(()=>{
        let data = membersGroup?.map((data)=>{
           return groups_array.find(item => item?.groupname.trim() === data.trim())?.groupid
        })
        setGroupId(data)
    },[groups_array, membersGroup])

    useEffect(() => {
        if (locationsInfo[selectedView]?.length > 0 && downloadCsv && exportTableRef.current) {
            setTimeout(() => {
                exportTableRef.current?.link.click();
                setDownloadCsv(false)
            }, 20);
        }
    }, [locationsInfo[selectedView], downloadCsv]);

    const handleMemberDataExport = () =>{
        setDownloadCsv(true)
    }

    const memberColumn = [
        {
            title: "COUNTRY",
            dataIndex: "Country",
            key: "Country",
            className: "text-left",
            render: (_, data) => {
                return <div> {data.Country} </div>
            },
        },
        {
            title: "STATE",
            dataIndex: "State",
            key: "State",
            className: "text-left",
            render: (_, data) => {
                return <div> {data.State} </div>
            },
        },
        {
            title: "MEMBERS",
            dataIndex: "Members",
            key: "Members",
            className: "text-left",
            render: (_, data) => {
                return <a onClick={() => handleTableClick(data)}> {data.Members} </a>
            },
        },
    ];

    const StateHeader = [
        { label: "COUNTRY", key: "Country" },
        { label: "STATE", key: "State" },
        { label: "MEMBERS", key: "Members" },
    ]

    const renderHeader = () => {
        return(
            <div>
                <div className='mb-3 title' style={{ fontWeight: 100 }}> TOTAL MEMBERS : <a className="menuValues py-1" style={{ color: "#0673b1"}} onClick={handleClick}> {renderMemberCount()} </a></div>
                <Row gutter={16} className='mb-3'>
                    <Col flex={1}>
                        <div className='title' style={{ fontWeight: 100 }}> TOTAL STATES : <span className="menuValues py-1" style={{ color: "#0673b1"}}> {locationsInfo[selectedView]?.length} </span></div>
                    </Col>
                    {viewMode === TABLE_VIEW && <Col>
                        <CustomExportCsv
                            memberData={locationsInfo[selectedView]}
                            headers={StateHeader}
                            fileName={{ name: "State", startDate:`${moment()}`}}
                            handleExportCsv={downloadCsv}
                            exportTableRef={exportTableRef}
                            handleMemberDataExport={handleMemberDataExport}
                        />
                    </Col>}
                </Row>
            </div>
        )
    }

    const renderMap = () =>{
        return(
            <div style={{ padding: "0% 8%" }}>
                <Map
                    {...{
                        mapRef,
                        locationsInfo,
                        selectedView,
                        handleMapClick,
                    }}
                />
            </div>
        )
    }

    return (
        <CommonSpinner loading={loading}>
            <div style={{ marginBottom: "40px" }}>
                {renderHeader()}
                {viewMode === MAP_VIEW ? renderMap() :(
                    <div>
                        <Table dataSource={locationsInfo[selectedView]?.sort((a, b) => b.Members - a.Members)} columns={memberColumn} scroll={{ y: 300 }} pagination={true} className='salesTable'/>
                    </div>
                )}
            </div>
            {mapModalData && <MapModal {...props} data={mapModalData} handleCancel={handleCancel} selectedView={selectedView} />}
        </CommonSpinner>
    );
}

export default memo(State);