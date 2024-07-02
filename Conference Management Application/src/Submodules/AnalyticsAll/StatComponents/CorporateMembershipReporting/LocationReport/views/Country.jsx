import React, { useEffect, useRef, useState, useContext, useCallback, memo } from 'react';
import { MAP_VIEW, LOCATION_INITIAL_STATE, TABLE_VIEW } from '@/CorporateMembershipReportingV2/LocationReport/constants';
import { hashMapCountryBasedData } from '@/CorporateMembershipReportingV2/LocationReport/helper';
import { getLocationDetails } from '@/CorporateMembershipReportingV2/LocationReport/service';
import _isEmpty from 'lodash/isEmpty';
import { Col, Row, Table } from 'antd';
import Map from '@/CorporateMembershipReportingV2/LocationReport/Map';
import CommonSpinner from "@/CorporateMembershipReportingV2/common/CommonSpinner";
import GlobalContext from '@/CorporateMembershipReportingV2/context/MemberContext';
import MapModal from '@/CorporateMembershipReportingV2/LocationReport/views/Modal';
import CustomExportCsv from '@/CorporateMembershipReportingV2/common/CustomExportCsv';

let controller = new AbortController();
let signal = controller.signal;
const Country = (props) =>{
    const mapRef = useRef()
    const { params: { groups_array, appdir}, viewMode, selectedView, setInitialLoading, initialLoading } = props
    const { membersGroup } = useContext(GlobalContext);
    const [locationsInfo, setLocationsInfo] = useState([]);
    const [loading, setLoading] = useState(false);
    const [groupId, setGroupId] = useState([]);
    const [mapModalData, setMapModalData] = useState();

    const fetchLocation = async (appdir, locationType, groupId) => {
        try{
            // setLoading(true)
            setInitialLoading(true)
            let result= await getLocationDetails({appdir, locationType, groupId, signal})
            let locationCountry = {...LOCATION_INITIAL_STATE};
            if(result?.success){
                if(locationType === "location_country"){
                    locationCountry = { ...locationCountry, ...hashMapCountryBasedData(result?.data) };
                }
            }
            setLocationsInfo (locationCountry);
            setInitialLoading(false)
            // setLoading(false)
        } catch(error){
            console.log("error",error)
        }
    };

    useEffect(()=>{
        if(groupId?.length){
            fetchLocation(appdir, "location_country", groupId)
        }
    },[groupId])

    const handleMapClick = useCallback((e) => {
        if(!_isEmpty(e.data)){
           setMapModalData({show: true, data:{Country:e.data.Country, Members:e.data.Members, dataSource:locationsInfo[selectedView]}})
        }
    },[locationsInfo[selectedView]])

    const renderMemberCount = () =>{
        let totalMembers = 0;
        locationsInfo[selectedView]?.map(area => { totalMembers += area?.Members; })
        return totalMembers;
    }

    const handleCancel = (e) => {
        setMapModalData({show: false, data:{}})
    }

    const handleTableClick = useCallback((e) => {
        if(!_isEmpty(e)){
            setMapModalData({show: true, data:{Country:e.Country, Members:e.Members, dataSource:locationsInfo[selectedView]}})
        }
    },[locationsInfo[selectedView]])

    const handleClick = () =>{
        let countryData = [];
        locationsInfo[selectedView]?.map((data)=>{
            countryData.push(data.Country)
        })

        setMapModalData({show: true, data:{Country:countryData, Members:renderMemberCount(), isTotalMembers:true, dataSource:locationsInfo[selectedView]}})
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
            title: "MEMBERS",
            dataIndex: "Members",
            key: "Members",
            className: "text-left",
            render: (_, data) => {
                return <a onClick={() => handleTableClick(data)}> {data.Members} </a>
            },
        },
    ];

    const CountryHeader =[
        { label: "COUNTRY", key: "Country" },
        { label: "MEMBERS", key: "Members" },
    ]

    const renderHeader = ()=>{
        return(
            <div>
                <div className='mb-3 title' style={{ fontWeight: 100 }}> TOTAL MEMBERS : <a className="menuValues py-1" style={{ color: "#0673b1"}} onClick={handleClick}> {renderMemberCount()} </a></div>
                <Row gutter={16} className='mb-3'>
                    <Col flex={1}>
                        <div className='title' style={{ fontWeight: 100 }}> TOTAL COUNTRIES : <span className="menuValues py-1" style={{ color: "#0673b1"}}> {locationsInfo[selectedView]?.length}</span></div>
                    </Col>
                    {viewMode === TABLE_VIEW && <Col>
                        <CustomExportCsv
                            dataSource={locationsInfo[selectedView]}
                            Headers={CountryHeader}
                            exportFileName={"Country"}
                        />
                    </Col> }
                </Row>
            </div>
        )
    }

    const renderMap = () => {
        return(
            <div style={{ padding: "0% 8%"}}>
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
        {!initialLoading && 
            <div>   
            <div style={{ marginBottom: "40px" }}>
                {viewMode === MAP_VIEW ? renderMap() :(
                    <div>
                        <Table dataSource={locationsInfo[selectedView]} columns={memberColumn} scroll={{ y: 300 }} pagination={true} className='salesTable'/>
                    </div>
                )}
            </div>
            {mapModalData && <MapModal {...props} data={mapModalData} handleCancel={handleCancel} selectedView={selectedView} />}
            </div>
            }
        </div>
        // </CommonSpinner>
    );
}

export default memo(Country);