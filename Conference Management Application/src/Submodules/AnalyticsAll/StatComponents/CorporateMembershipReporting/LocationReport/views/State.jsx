import React, { useEffect, useRef, useState, useContext, useCallback, memo } from 'react';
import { MAP_VIEW, LOCATION_INITIAL_STATE, CANADA_STATE_LIST, USA_STATE_LIST, TABLE_VIEW, USA_STATE_ABBEREVATION_LIST, CANADA_STATE_ABBEREVATION_LIST } from '@/CorporateMembershipReportingV2/LocationReport/constants';
import _isEmpty from 'lodash/isEmpty';
import { Col, Row, Table } from 'antd';
import { hashMapStateBasedData } from '@/CorporateMembershipReportingV2/LocationReport/helper';
import { getLocationDetails } from '@/CorporateMembershipReportingV2/LocationReport/service';
import Map from '@/CorporateMembershipReportingV2/LocationReport/Map';
import CommonSpinner from "@/CorporateMembershipReportingV2/common/CommonSpinner";
import GlobalContext from '@/CorporateMembershipReportingV2/context/MemberContext';
import MapModal from '@/CorporateMembershipReportingV2/LocationReport/views/Modal';
import CustomExportCsv from '@/CorporateMembershipReportingV2/common/CustomExportCsv';

let controller = new AbortController();
let signal = controller.signal;
const State = (props) =>{
    const mapRef = useRef()
    const { params: { groups_array, appdir }, viewMode, selectedView, initialLoading, setInitialLoading } = props
    const { membersGroup } = useContext(GlobalContext);
    const [locationsInfo, setLocationsInfo] = useState([]);
    const [loading, setLoading] = useState(false);
    const [groupId, setGroupId] = useState([]);
    const [mapModalData, setMapModalData] = useState();

    const fetchLocation = async (appdir, locationType, groupId, country, state) => {
        try{
            // setLoading(true)
            setInitialLoading(true)
            let result= await getLocationDetails({appdir, locationType, groupId, country, state, signal})
            let locationState = {...LOCATION_INITIAL_STATE};
            if(result?.success){
                if(locationType === "location_state"){
                    locationState = { ...locationState, ...hashMapStateBasedData(result?.data) };
                }
            }
            setLocationsInfo(locationState);
            setInitialLoading(false)
            // setLoading(false)
        } catch(error){
            console.log("error",error)
        }
    };

    useEffect(()=>{
        if(groupId?.length){
            if(selectedView === 'USA_STATE_VIEW'){
                fetchLocation(appdir, "location_state", groupId, "United States", USA_STATE_LIST)
            }
            if(selectedView === 'CANADA_STATE_VIEW'){
                fetchLocation(appdir, "location_state", groupId, "Canada",CANADA_STATE_LIST)
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
            title: "STATE",
            dataIndex: "State",
            key: "State",
            width: 150,
            className: "text-left",
            render: (_, data) => {
                let states = selectedView === 'USA_STATE_VIEW' ? USA_STATE_ABBEREVATION_LIST[data.State] : CANADA_STATE_ABBEREVATION_LIST[data.State];
                return <div> {states ? states : data.State}</div>
            },
        },
        {
            title: "MEMBERS",
            dataIndex: "Members",
            key: "Members",
            width:150,
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
                            dataSource={locationsInfo[selectedView]}
                            Headers={StateHeader}
                            exportFileName={"State"}
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
        // <CommonSpinner loading={loading} className='initialLoader'>
        <div>
            {renderHeader()}
            {!initialLoading && <div>
             <div style={{ marginBottom: "40px" }}>
                 {viewMode === MAP_VIEW ? renderMap() :(
                     <div>
                         <Table dataSource={locationsInfo[selectedView]} columns={memberColumn} scroll={{ y: 300 }} pagination={true} className='salesTable'/>
                     </div>
                 )}
             </div>
             {mapModalData && <MapModal {...props} data={mapModalData} handleCancel={handleCancel} selectedView={selectedView} />}
             </div>}
        </div>
        // </CommonSpinner>
    );
}

export default memo(State);