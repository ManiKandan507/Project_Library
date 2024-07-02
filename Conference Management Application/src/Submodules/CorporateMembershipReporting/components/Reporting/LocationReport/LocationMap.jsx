import React, { useEffect, useRef, useState } from 'react';
import { Select, Spin, Tabs, Typography } from 'antd';
import { CANADA_API_KEY, CANADA_VIEW, CONTINENT_VIEW, COUNTRY_VIEW, LOCATION_FILE_NAMES, LOCATION_MODAL, PAGE_SIZE, PRIMARY_LOCATION_VIEWS, SECONDARY_LOCATION_VIEWS, STATE_VIEW, USA_API_KEY, USA_VIEW, MAP_VIEW, TABLE_VIEW, USA_REGIONS_LIST, CANADA_REGIONS_LIST, REGION_VIEW} from '../../../constants';
import { useDispatch, useSelector } from 'react-redux';
import Map from './Map';
import CustomTable from '../Common/CustomTable';
import { fetchLocationCountryRequest, fetchLocationStateRequest, handleAllMembersExport, sendEmailRequest, showModal } from '../../../appRedux/actions/Reporting';
import { constructSelectedItem, getColumnsConfig } from './helper';
import _flattenDeep from 'lodash/flattenDeep';
import _isEmpty from 'lodash/isEmpty';
import MembersInfoModal from '../Common/MembersInfoModal';
import moment from 'moment';
import { getLegendColorMapping } from './helper';

const { Option } = Select;
export default function LocationMap({ sourceHex, screen, appdir }) {
    const mapRef = useRef()
    const exportTableRef = useRef();
    const dispatch = useDispatch();
    const { TabPane } = Tabs;
    const locationLoading = useSelector(({ reporting }) => reporting.loading) || false;
    const locationsInfo = useSelector(state => state.reporting.locationsInfo);
    const modalVisible = useSelector(({ reporting }) => reporting.showModal) || false;
    const [selectedViewData, setSelectedViewData] = useState([]);
    const [viewMode, setViewMode] = useState(MAP_VIEW);
    const [colormapping, setColormapping] = useState({});
    const [primaryView, setPrimaryView] = useState(COUNTRY_VIEW);
    const [secondaryView, setSecondaryView] = useState(STATE_VIEW);
    const [selectedView, setSelectedView] = useState(COUNTRY_VIEW);
    const [isSecondaryViewEnabled, setSecondaryViewEnabled] = useState(false);
    const [columnsConfig, setColumnsConfig] = useState({});
    const [tableData, setTableData] = useState([]);
    const [columns, setColumns] = useState([]);
    const [tableSelectedItem, setTableSelectedItem] = useState(0);
    const [modalSelectedItem, setModalSelectedItem] = useState({});
    const [modalTableData, setModalTableData] = useState([]);
    const [allLocationInfo, setAllLocationInfo] = useState([]);
    const [page, setPage] = useState(1);
    const [pageSize, setPageSize] = useState(PAGE_SIZE);
    const [paginationArray, setPaginationArray] = useState([0, PAGE_SIZE]);
    const [downloadCsv, setDownloadCsv] = useState(false);
    const [pageTotal, setPageTotal] = useState("");
    const dispatchCountryApi = (event) => {
        dispatch(fetchLocationCountryRequest({
            appdir,
            sourceHex,
            detailed: 1,
            country: event.data.Country,
            modal: true,
            offset: 0,
            limit: event.data.Members
        }));
        dispatch(showModal(false));
    }
    const dispatchStateAPI = (event, CurrentView=null) => {
        let states= event?.data?.State ?? null;
        if (
          CurrentView === REGION_VIEW &&
          event.data.Region &&
          [USA_API_KEY, CANADA_API_KEY].includes(event.data.Country)
        ) {
          //Parse state data from region data
          if (event.data.Country === USA_API_KEY) {
            states = USA_REGIONS_LIST[event.data.Region];
          }
          if (event.data.Country === CANADA_API_KEY) {
            states = CANADA_REGIONS_LIST[event.data.Region];
          }
        }
        dispatch(fetchLocationStateRequest({
            appdir,
            sourceHex,
            detailed: 1,
            countries: _flattenDeep([event.data.Country]),
            state: states,
            modal: true,
            offset: 0,
            limit: event.data.Members
        }));
    }
    const handlePrimaryViewChange = (e) => setPrimaryView(e);
    const handleSecondaryViewChange = (e) => setSecondaryView(e);
    const handleMemberInfo = (val, pageSize) => {
        setPage(val);
        setPageSize(pageSize);
        setPaginationArray([val * pageSize - pageSize, val * pageSize]);
    }
    const handleMemberValue = (data, isCountry, view, CurrentView=null) => {
        setModalSelectedItem(constructSelectedItem(data, view))
        if (isCountry) { dispatchCountryApi({ data }) }
        else { dispatchStateAPI({ data },CurrentView) }
    }
    const handleModalPagination = (val, pageSize) => {
        setModalTableData(locationsInfo[LOCATION_MODAL].slice(val * pageSize - pageSize, val * pageSize))
    }
    const handleMapClick = (e, CurrentView=null) => {
        if (!_isEmpty(e.data)) {
            if ('State' in e.data ||selectedView.includes("REGION_VIEW") ||selectedView.includes("STATE_VIEW") || selectedView === CONTINENT_VIEW) {
                dispatchStateAPI(e, CurrentView)
            } else {
                dispatchCountryApi(e)
            }
            setModalSelectedItem(constructSelectedItem(e.data, selectedView))
        }
    }
    useEffect(() => {
        dispatch(fetchLocationCountryRequest({ sourceHex, appdir }))
        dispatch(fetchLocationStateRequest({ sourceHex, appdir, countries: [USA_API_KEY, CANADA_API_KEY] }))
        setColumnsConfig(getColumnsConfig(handleMemberValue));
        return () => { localStorage.removeItem('mapsmaps'); }
    }, []);
    useEffect(() => {
        setColormapping(getLegendColorMapping(locationsInfo))
    }, [locationsInfo])
    useEffect(() => {
        if (!_isEmpty(locationsInfo) && modalVisible) {
            let locationDetails = locationsInfo[LOCATION_MODAL] || []
            setModalTableData(locationDetails.slice(0, PAGE_SIZE))
            setAllLocationInfo(locationDetails.map(lInfo => ({ ...lInfo, MemberJoinDate: moment(lInfo.MemberJoinDate).isValid() ? moment(lInfo.MemberJoinDate).format("MM/DD/YYYY") : '', })))
        }
    }, [modalVisible])
    useEffect(() => {
        if (downloadCsv && exportTableRef.current && selectedViewData.length) {
            setTimeout(() => {
                exportTableRef.current.link.click();
                setDownloadCsv(false)
            }, 20);
        }
    }, [downloadCsv]);
    useEffect(() => {
        if (primaryView === USA_VIEW || primaryView === CANADA_VIEW) {
            setSecondaryViewEnabled(true);
            setSelectedView(`${primaryView}_${secondaryView}`);
            setPage(1);
        } else {
            setSecondaryViewEnabled(false);
            setSelectedView(primaryView);
            setPage(1);
        }
        if (mapRef.current) {
            mapRef.current.refresh();
        }
    }, [primaryView, secondaryView])
    useEffect(() => { setPaginationArray([page * pageSize - pageSize, page * pageSize]) }, [page, pageSize])
    useEffect(() => {
        const tempData = locationsInfo[selectedView];
        let totalMembers = 0;
        tempData.map(area => { totalMembers += area.Members; })
        setPageTotal(`Total Members: ${totalMembers}`);
        if (tempData) {
            setSelectedViewData(tempData);
            setTableSelectedItem({ value: tempData.length });
            tempData.sort((a,b) => b.Members - a.Members)
            setTableData(tempData.slice(...paginationArray));
        }
        if (columnsConfig[selectedView]) {
            setColumns(columnsConfig[selectedView]);
        }
    }, [selectedView, locationsInfo, columnsConfig, paginationArray])
    const renderHeader = () => {
        return (
            <div className='d-flex justify-space-between px-2'>
                <div>
                    <Typography.Title level={5} className='mt-1 mr-2'>{pageTotal}</Typography.Title>
                </div>
                <div>
                    <Select onChange={handlePrimaryViewChange} defaultValue={primaryView} className='mr-5 mb-3' style={{ width: '150px' }}>
                        {PRIMARY_LOCATION_VIEWS.map(view => <Option key={view.value} value={view.value}>{view.label}</Option>)}
                    </Select>
                    {isSecondaryViewEnabled && <Select onChange={handleSecondaryViewChange} defaultValue={secondaryView} className='mr-5 mb-3' style={{ width: '150px' }}>
                        {SECONDARY_LOCATION_VIEWS.map(view => <Option key={view.value} value={view.value}>{view.label}</Option>)}
                    </Select>}
                </div>
            </div>
        )
    }
    return (
      <Spin spinning={locationLoading}>
        <div style={{ marginBottom: "40px" }}>
          {renderHeader()}
          <Tabs defaultActiveKey={viewMode} onChange={setViewMode}>
            <TabPane tab="Map View" key={MAP_VIEW} />
            <TabPane tab="Table View" key={TABLE_VIEW} />
          </Tabs>
          {viewMode == MAP_VIEW ? (
            <div style={{ padding: "0% 8%", height: 630 }}>
              <Map
                {...{
                  mapRef,
                  locationsInfo,
                  colormapping,
                  selectedView,
                  handleMapClick,
                }}
              />
            </div>
          ) : (
            <CustomTable
              columns={columns}
              selectedItem={tableSelectedItem}
              tableData={tableData}
              scroll={{ x: 768, y: 330 }}
              handleMemberInfo={handleMemberInfo}
              page={page}
              pageSize={pageSize}
              exportCsvInfo={{
                className: "my-0 ml-4",
                handleMemberDataExport: e => setDownloadCsv(e),
                fileName: { name: LOCATION_FILE_NAMES[selectedView] },
                memberData: selectedViewData,
                handleExportCsv: downloadCsv,
                screen: screen,
                exportTableRef: exportTableRef,
                headers: columnsConfig[selectedView],
              }}
            />
          )}
        </div>

        {modalVisible && (
          <MembersInfoModal
            fileName={{ name: LOCATION_FILE_NAMES[selectedView] }}
            selectedItem={modalSelectedItem}
            screen={screen}
            sourceHex={sourceHex}
            appdir={appdir}
            allLocationInfo={allLocationInfo}
            membersInfo={modalTableData}
            handleModalPagination={handleModalPagination}
            handleClose={() => {
              dispatch(handleAllMembersExport(false));
              dispatch(sendEmailRequest(false));
              dispatch(showModal(false));
            }}
            visible={modalVisible}
          />
        )}
      </Spin>
    );
}