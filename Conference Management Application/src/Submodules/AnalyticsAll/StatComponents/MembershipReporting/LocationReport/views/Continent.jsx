import React, { useEffect, useRef, useState, useContext, useCallback, memo } from 'react';
import { MAP_VIEW, LOCATION_INITIAL_STATE, TABLE_VIEW } from '@/MembershipReportingV2/LocationReport/constants';
import { hashMapCountryBasedData } from '@/MembershipReportingV2/LocationReport/helper';
import { getLocationDetails } from '@/MembershipReportingV2/LocationReport/service';
import _isEmpty from 'lodash/isEmpty';
import { Col, Row, Table } from 'antd';
import CommonSpinner from "@/MembershipReportingV2/common/CommonSpinner";
import GlobalContext from '@/MembershipReportingV2/context/MemberContext';
import CustomExportCsv from '@/MembershipReportingV2/common/CustomExportCsv';
import Map from '@/MembershipReportingV2/LocationReport/Map';
import MapModal from '@/MembershipReportingV2/LocationReport/views/Modal';
import { NoDataFound } from '@/MembershipReportingV2/common/NoDataFound';
import clickableColumnHeader from './../../common/ClickableColumnIcon';
import ClickableMemberCount from './../../common/ClickableMemberCount';

let controller = new AbortController();
let signal = controller.signal;
const Continent = (props) => {
    const mapRef = useRef()
    const { params: { source_hex, groups_array }, viewMode, selectedView, setInitialLoading, initialLoading } = props
    const { membersGroup } = useContext(GlobalContext);
    const [locationsInfo, setLocationsInfo] = useState([]);
    const [groupId, setGroupId] = useState([]);
    const [mapModalData, setMapModalData] = useState();

    const fetchLocation = async (source_hex, locationType, groupId) => {
        try {
            setInitialLoading(true)
            let result = await getLocationDetails({ source_hex, locationType, groupId, signal })
            let locationContinent = { ...LOCATION_INITIAL_STATE };
            if (result?.success) {
                if (locationType === "location_country") {
                    locationContinent = { ...locationContinent, ...hashMapCountryBasedData(result?.data) };
                }
            }
            setLocationsInfo(locationContinent);
            setInitialLoading(false)
        } catch (error) {
            console.log("error", error)
        }
    };

    useEffect(() => {
        if (groupId?.length) {
            fetchLocation(source_hex, "location_country", groupId)
        }
    }, [groupId])

    const renderMemberCount = () => {
        let totalMembers = 0;
        locationsInfo[selectedView]?.map(area => { totalMembers += area?.Members })
        return totalMembers;
    }

    const handleMapClick = useCallback((e) => {
        if (!_isEmpty(e.data)) {
            setMapModalData({ show: true, data: { Continent: e.data.Continent, Country: e.data.Country, Members: e.data.Members, dataSource: locationsInfo[selectedView] } })
        }
    }, [locationsInfo[selectedView]])

    const handleCancel = (e) => {
        setMapModalData({ show: false, data: {} })
    }

    const handleTableClick = useCallback((e) => {
        if (!_isEmpty(e)) {
            setMapModalData({ show: true, data: { Continent: e.Continent, Country: e.Country, Members: e.Members, dataSource: locationsInfo[selectedView] } })
        }
    }, [locationsInfo[selectedView]])

    const handleClick = () => {
        let countryData = [];
        locationsInfo[selectedView]?.map((data) => {
            countryData.push(data.Country)
        })
        setMapModalData({ show: true, data: { Country: countryData, Members: renderMemberCount(), isTotalMembers: true, dataSource: locationsInfo[selectedView] } })
    }

    useEffect(() => {
        let data = membersGroup?.map((data) => {
            return groups_array.find(item => item?.groupname.trim() === data.trim())?.groupid
        })
        setGroupId(data)
        controller.abort();
        controller = new AbortController();
        signal = controller.signal;
    }, [groups_array, membersGroup])

    const memberColumn = [
        {
            title: "WORLD REGION",
            dataIndex: "Continent",
            key: "Continent",
            className: "text-left",
            render: (_, data) => {
                return <div> {data.Continent} </div>
            },
        },
        {
            title: clickableColumnHeader("MEMBERS", 'common-header-icon'),
            dataIndex: "Members",
            key: "Members",
            className: "text-left",
            width: 150,
            render: (_, data) => {
                return <a onClick={() => handleTableClick(data)}> {data.Members} </a>
            },
        },
    ];

    const ContinentHeader = [
        { label: "WORLD REGION", key: "Continent" },
        { label: "MEMBERS", key: "Members" },
    ]

    const renderHeader = () => {
        return (
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
                        <div className='title' style={{ fontWeight: 100 }}> TOTAL CONTINENTS : <span className="menuValues py-1" style={{ color: "#0673b1" }}> {locationsInfo[selectedView]?.length}</span></div>
                    </Col>
                    {viewMode === TABLE_VIEW && <Col>
                        <CustomExportCsv
                            dataSource={locationsInfo[selectedView]}
                            Headers={ContinentHeader}
                            exportFileName={"Continent"}
                        />
                    </Col>}
                </Row>
            </div>
        )
    }

    const renderMapAndTable = () => {
        if (!membersGroup.length) {
            return <NoDataFound />
        }
        // if( viewMode === MAP_VIEW ){
        return (
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
        //     return <Table dataSource={locationsInfo[selectedView]} columns={memberColumn} scroll={{ y: 450 }} pagination={true} className='salesTable'/>
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
                    {renderMapAndTable()}
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

export default memo(Continent);