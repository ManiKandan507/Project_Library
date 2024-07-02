import React, { useEffect, useRef, useState, useContext, useCallback, memo } from 'react';
import { MAP_VIEW, LOCATION_INITIAL_STATE, TABLE_VIEW } from '@/MembershipReportingV2/LocationReport/constants';
import { hashMapCountryBasedData } from '@/MembershipReportingV2/LocationReport/helper';
import { getLocationDetails } from '@/MembershipReportingV2/LocationReport/service';
import _isEmpty from 'lodash/isEmpty';
import { Col, Row, Table } from 'antd';
import Map from '@/MembershipReportingV2/LocationReport/Map';
import GlobalContext from '@/MembershipReportingV2/context/MemberContext';
import MapModal from '@/MembershipReportingV2/LocationReport/views/Modal';
import CustomExportCsv from '@/MembershipReportingV2/common/CustomExportCsv';
import { NoDataFound } from '@/MembershipReportingV2/common/NoDataFound';
import clickableColumnHeader from './../../common/ClickableColumnIcon';
import ClickableMemberCount from './../../common/ClickableMemberCount';

let controller = new AbortController();
let signal = controller.signal;
const Country = (props) => {
    const mapRef = useRef()
    const { params: { source_hex, groups_array }, viewMode, selectedView, setInitialLoading, initialLoading } = props
    const { membersGroup } = useContext(GlobalContext);
    const [locationsInfo, setLocationsInfo] = useState([]);
<<<<<<< HEAD
=======
    // const [loading, setLoading] = useState(false);
>>>>>>> 869aae639d685259d1760f9199b6e8e54991839b
    const [groupId, setGroupId] = useState([]);
    const [mapModalData, setMapModalData] = useState();
    const [locationList, setLocationList] = useState([])
    const [countryList, setCountryList] = useState([])

    const fetchLocation = async (source_hex, locationType, groupId) => {
        try {
            setInitialLoading(true)
            let result = await getLocationDetails({ source_hex, locationType, groupId, signal })
            let locationCountry = { ...LOCATION_INITIAL_STATE };
            if (result?.success) {
                if (locationType === "location_country") {
                    locationCountry = { ...locationCountry, ...hashMapCountryBasedData(result?.data) };
                }
                setLocationList(result?.data)
            }
            setLocationsInfo(locationCountry);
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

    useEffect(() => {
        if(locationList.length > 0) {
            const list = locationList.map((data) => data.Country)
            setCountryList(list)
        }
    }, [locationList])

    const handleMapClick = useCallback((e) => {
        if (!_isEmpty(e.data)) {
            setMapModalData({ show: true, data: { Country: e.data.Country, Members: e.data.Members, dataSource: locationsInfo[selectedView] } })
        }
    }, [locationsInfo[selectedView]])

    const renderMemberCount = () => {
        let totalMembers = 0;
        locationsInfo[selectedView]?.map(area => { totalMembers += area?.Members; })
        return totalMembers;
    }

    const handleCancel = (e) => {
        setMapModalData({ show: false, data: {} })
    }

    const handleTableClick = useCallback((e) => {
        if (!_isEmpty(e)) {
            setMapModalData({ show: true, data: { Country: e.Country, Members: e.Members, dataSource: locationsInfo[selectedView] } })
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
            title: "COUNTRY",
            dataIndex: "Country",
            key: "Country",
            className: "text-left",
            render: (_, data) => {
                return <div> {data.Country} </div>
            },
        },
        {
            title: clickableColumnHeader("MEMBERS", "common-header-icon"),
            dataIndex: "Members",
            key: "Members",
            className: "text-left",
            width: 150,
            render: (_, data) => {
                return <a onClick={() => handleTableClick(data)}> {data.Members} </a>
            },
        },
    ];

    const CountryHeader = [
        { label: "COUNTRY", key: "Country" },
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
                        <div className='title' style={{ fontWeight: 100 }}> TOTAL COUNTRIES : <span className="menuValues py-1" style={{ color: "#0673b1" }}> {locationsInfo[selectedView]?.length}</span></div>
                    </Col>
                    {viewMode === TABLE_VIEW && <Col>
                        <CustomExportCsv
                            dataSource={locationsInfo[selectedView]}
                            Headers={CountryHeader}
                            exportFileName={"Country"}
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
                <div style={{ marginBottom: "40px" }} >
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

export default memo(Country);