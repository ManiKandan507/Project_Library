import React, { useEffect, useRef, useState, useContext, useCallback, memo } from 'react';
import { MAP_VIEW, LOCATION_INITIAL_STATE, CANADA_STATE_LIST, USA_STATE_LIST, TABLE_VIEW } from '@/MembershipReportingV2/LocationReport/constants';
import { hashMapStateBasedData } from '@/MembershipReportingV2/LocationReport/helper';
import Map from '@/MembershipReportingV2/LocationReport/Map';
import { getLocationDetails } from '@/MembershipReportingV2/LocationReport/service';
import { Col, Row, Table } from 'antd';
import _isEmpty from 'lodash/isEmpty';
import GlobalContext from '@/MembershipReportingV2/context/MemberContext';
import CustomExportCsv from '@/MembershipReportingV2/common/CustomExportCsv';
import MapModal from '@/MembershipReportingV2/LocationReport/views/Modal';
import { NoDataFound } from '@/MembershipReportingV2/common/NoDataFound';
import clickableColumnHeader from './../../common/ClickableColumnIcon';
import ClickableMemberCount from './../../common/ClickableMemberCount';

let controller = new AbortController();
let signal = controller.signal;
const Region = (props) =>{
    const mapRef = useRef()
    const { params: { source_hex, groups_array }, viewMode, selectedView, setInitialLoading, initialLoading} = props
    const { membersGroup } = useContext(GlobalContext);
    const [locationsInfo, setLocationsInfo] = useState([]);
    const [groupId, setGroupId] = useState([]);
    const [mapModalData, setMapModalData] = useState();

    const fetchLocation = async (source_hex, locationType, groupId, country, state) => {
        try{
<<<<<<< HEAD
=======
            // setLoading(true)
>>>>>>> 869aae639d685259d1760f9199b6e8e54991839b
            setInitialLoading(true)
            let result= await getLocationDetails({source_hex, locationType, groupId, country, state, signal})
            let locationState = {...LOCATION_INITIAL_STATE};
            if(result?.success){
                if(locationType === "location_state"){
                    locationState = { ...locationState, ...hashMapStateBasedData(result?.data) };
                }
            }
            setLocationsInfo(locationState);
            setInitialLoading(false)
<<<<<<< HEAD
=======
            // setLoading(false)
>>>>>>> 869aae639d685259d1760f9199b6e8e54991839b
        } catch(error){
            console.log("error",error)
        }
    };

    useEffect(()=>{
        if(groupId?.length){
            if(selectedView === 'USA_REGION_VIEW' ){
                fetchLocation(source_hex, "location_state", groupId, "United States", USA_STATE_LIST)
            }
            if(selectedView === 'CANADA_REGION_VIEW'){
                fetchLocation(source_hex, "location_state", groupId, "Canada", CANADA_STATE_LIST)
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
           setMapModalData({show: true, data:{State:e.data.State, Country:e.data.Country, Region:e.data.Region, Members:e.data.Members, dataSource:locationsInfo[selectedView]}})
        }
    },[locationsInfo[selectedView]])

    const handleCancel = (e) => {
        setMapModalData({show: false, data:{}})
    }

    const handleTableClick = useCallback((e) => {
        if(!_isEmpty(e)){
            setMapModalData({show: true, data:{State:e.State, Country:e.Country, Region:e.Region, Members:e.Members, dataSource:locationsInfo[selectedView]}})
        }
    },[locationsInfo[selectedView]])

    const handleClick = () => {
        let countryData;
        let stateData=[];
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
        controller.abort();
        controller = new AbortController();
        signal = controller.signal;
    },[groups_array, membersGroup])

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
            title: "REGION",
            dataIndex: "Region",
            key: "Region",
            className: "text-left",
            width:150,
            render: (_, data) => {
                return <div> {data.Region} </div>
            },
        },
        {
            title: clickableColumnHeader("MEMBERS", 'common-header-icon'),
            dataIndex: "Members",
            key: "Members",
            className: "text-left",
            width:150,
            render: (_, data) => {
                return <a onClick={() => handleTableClick(data)}> {data.Members} </a>
            },
        },
    ];

    const StateHeader = [
        { label: "COUNTRY", key: "Country" },
        { label: "REGION", key: "Region" },
        { label: "MEMBERS", key: "Members" },
    ]

    const renderHeader = () => {
        return(
            <div className='pl-2'>
                <ClickableMemberCount 
                    memberType="TOTAL MEMBERS"
                    handleClick={handleClick}
                    memberCount={renderMemberCount()}
                    color='#0673b1' 
                    className='py-1'
                />
                <Row gutter={16} className='mb-3'>
                    <Col flex={1}>
                        <div className='title' style={{ fontWeight: 100 }}> TOTAL REGION : <span className="menuValues py-1" style={{ color: "#0673b1"}}> {locationsInfo[selectedView]?.length} </span></div>
                    </Col>
                    {viewMode === TABLE_VIEW && <Col>
                        <CustomExportCsv
                            dataSource={locationsInfo[selectedView]}
                            Headers={StateHeader}
                            exportFileName={"Region"}
                        />
                    </Col>}
                </Row>
            </div>
        )
    }

    const renderMapAndTable = () =>{
        if(!membersGroup.length){
            return <NoDataFound />
        }
        // if(viewMode === MAP_VIEW){
            return(
                <div style={{ padding: "0% 5%" }}>
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
        // }
        // if(viewMode === TABLE_VIEW){
        //     return  <Table dataSource={locationsInfo[selectedView]} columns={memberColumn} scroll={{ y: 450 }} pagination={true} className='salesTable'/>
        // }
    }

    return (
<<<<<<< HEAD
=======
        // <CommonSpinner loading={loading}>
>>>>>>> 869aae639d685259d1760f9199b6e8e54991839b
        <div>
            {/* {renderHeader()} */}
            {!initialLoading && <div>
            <div style={{ marginBottom: "40px" }}>
<<<<<<< HEAD
                {renderMapAndTable()}
=======
                {viewMode === MAP_VIEW ? renderMapAndTable() :(
                    <div>
                        <Table dataSource={locationsInfo[selectedView]} columns={memberColumn} scroll={{ y: 300 }} pagination={true} className='salesTable'/>
                    </div>
                )}
>>>>>>> 869aae639d685259d1760f9199b6e8e54991839b
            </div>
            {mapModalData && <MapModal {...props} data={mapModalData} handleCancel={handleCancel} selectedView={selectedView} />}
            </div>}
        </div>
<<<<<<< HEAD
=======
        // </CommonSpinner>
>>>>>>> 869aae639d685259d1760f9199b6e8e54991839b
    );
}

export default memo(Region);