import React, { useEffect, useState, useContext } from 'react';
import { Button, Col, Row, Select, Tabs, Modal, Table, Typography } from 'antd';
import { CANADA_VIEW, CONTINENT_VIEW, COUNTRY_VIEW, PRIMARY_LOCATION_VIEWS, SECONDARY_LOCATION_VIEWS, STATE_VIEW, USA_VIEW, MAP_VIEW, TABLE_VIEW } from '@/MembershipReportingV2/LocationReport/constants';
import GlobalContext from '@/MembershipReportingV2/context/MemberContext';
import Country from '@/MembershipReportingV2/LocationReport/views/Country';
import Continent from '@/MembershipReportingV2/LocationReport/views/Continent';
import State from '@/MembershipReportingV2/LocationReport/views/State';
import Region from '@/MembershipReportingV2/LocationReport/views/Region';
import CommonSpinner from '@/MembershipReportingV2/common/CommonSpinner';
import MultiSelectWidget from '../common/MultiSelectWidget';
import EditGroups from '../common/EditGroups';
import { AppstoreOutlined, ArrowDownOutlined, LeftOutlined, SaveOutlined, SettingOutlined } from '@ant-design/icons';
import CommonPieChart from '../common/CommonPieChart';
import CommonBarCharts from '../common/CommonBarCharts';
import ConfigWidget from './common/ConfigWidget';
import { getCustomFieldData, getDemographicsConfig, updateDemographicsConfig } from './service';
import _groupBy from 'lodash/groupBy';
import _map from 'lodash/map';
import { ResponsiveBar } from "@nivo/bar";
import TotalCountLabel from '../MemberChartWidget/TotalCountLabels';

const { Option } = Select;

let controller = new AbortController();
let signal = controller.signal;

export default function LocationMap(props) {
    const { params: { groups_array, source_hex, appdir } } = props
    const { TabPane } = Tabs;
    const { membersGroup, setSelectedMembersGroups, demographicsConfig, setDemographicsConfig, customFieldData, setCustomFieldData } = useContext(GlobalContext);
    const [viewMode, setViewMode] = useState(MAP_VIEW);
    const [primaryView, setPrimaryView] = useState(COUNTRY_VIEW);
    const [secondaryView, setSecondaryView] = useState(STATE_VIEW);
    const [selectedView, setSelectedView] = useState(COUNTRY_VIEW);
    const [isSecondaryViewEnabled, setSecondaryViewEnabled] = useState(false);
    const [initialLoading, setInitialLoading] = useState(false);
    const [configToggle, setConfigToggle] = useState(false);
    const [focusModeActive, setFocusModeActive] = useState(false);
    const [focusModeData, setFocusModeData] = useState([]);
    const [configData, setConfigData] = useState({});
    const [visibleCharts, setVisibleCharts] = useState([])
    const [configModalAfterClose, setConfigModalAfterClose] = useState(false)
    const [groupId, setGroupId] = useState([]);
    const [customLoading, setCustomLoading] = useState(false);
    const [updateLoading, setUpdateLoading] = useState(false);
    const [getLoading, setGetLoading] = useState(false);
    const [customFieldAPIData, setCustomFieldAPIData] = useState([]);
    const [constructedData, setConstructedData] = useState([])
    const [getConfigData, setGetConfigData] = useState([])
    const [isConfigUpdated, setIsConfigUpdated] = useState(false)

    useEffect(() => {
        if (Object.keys(demographicsConfig).length > 0) {
            const showableCharts = demographicsConfig.charts.filter(chart => chart.visible)
            setVisibleCharts(showableCharts)
            setConfigData(demographicsConfig)
        }
    }, [demographicsConfig])

    useEffect(() => {
        if (customFieldAPIData.length > 0) {
            setConstructedData(constructedCustomData(customFieldAPIData))
        }
    }, [customFieldAPIData])

    useEffect(() => {
        fetchConfigData(appdir)
    }, [appdir])

    useEffect(() => {
        if (Object.keys(getConfigData).length > 0) {
            setDemographicsConfig(getConfigData)
        }
    }, [getConfigData])

    useEffect(() => {
        let data = membersGroup?.map((data) => {
            return groups_array.find(item => item?.groupname.trim() === data.trim())?.groupid
        })
        setGroupId(data)
        controller.abort();
        controller = new AbortController();
        signal = controller.signal;
    }, [groups_array])

    useEffect(() => {
        if (visibleCharts.length > 0) {
            const customFields = [...new Set(visibleCharts.map(data => data.field))]
            fetchCustomFieldData(source_hex, groupId, customFields)
        }
    }, [groupId, visibleCharts])

    const handlePrimaryViewChange = (e) => {
        setPrimaryView(e)
        if (secondaryView !== STATE_VIEW && (e === CONTINENT_VIEW || e === COUNTRY_VIEW)) {
            setSecondaryView(STATE_VIEW)
        }
    };

    const fetchCustomFieldData = async (source_hex, groupId, customFields) => {
        try {
            setCustomLoading(true)
            let result = await getCustomFieldData(source_hex, groupId, customFields)
            if (result?.success) {
                setCustomFieldAPIData(result?.data);
            }
            setCustomLoading(false)
        } catch (error) {
            console.log("error", error)
        }
    };

    const fetchConfigData = async (appdir) => {
        try {
            setGetLoading(true)
            let result = await getDemographicsConfig(appdir)
            if (result?.success) {
                setGetConfigData(result?.data);
            }
            setGetLoading(false)
        } catch (error) {
            console.log("error", error)
        }
    }

    const updateConfigData = async (appdir, configData) => {
        try {
            setUpdateLoading(true)
            let result = await updateDemographicsConfig(appdir, configData)
            if (result.success) {
                setIsConfigUpdated(true)
            }
            setUpdateLoading(false)
        } catch (error) {
            console.log('error', error)
        }
    }

    const constructedCustomData = (customFieldAPIData) => {
        const customFields = [...new Set(visibleCharts.map(data => data.field))]
        const pushedArray = []
        const setData = customFields.map((customField) => {
            let salesData = _map(_groupBy(customFieldAPIData, customField), (groupArr) => {
                let customFieldName = ''
                groupArr.map((value) => {
                    customFieldName = value[customField]
                })
                return {
                    customField: customFieldName,
                    count: groupArr.length,
                    field: customField
                }
            })

            visibleCharts.map((value) => {
                if (value.field === customField) {
                    pushedArray.push({
                        ...value,
                        chartData: salesData.filter((value) => value.customField !== null && value.customField !== '' && value.customField !== 'undefined')
                    })
                }
            })

            return salesData
        })
        return pushedArray
    }

    const handleSecondaryViewChange = (e) => setSecondaryView(e);

    useEffect(() => {
        if (primaryView === USA_VIEW || primaryView === CANADA_VIEW) {
            setSecondaryViewEnabled(true);
            setSelectedView(`${primaryView}_${secondaryView}`);
        } else {
            setSecondaryViewEnabled(false);
            setSelectedView(primaryView);
        }
    }, [primaryView, secondaryView])

    const handleRenderButton = (value) => {
        setPrimaryView(value)
        setSelectedView(value)
    }

    const renderButton = () => {
        return (
            <div className='d-flex' style={{ gap: '25px', }} >
                <Button onClick={() => handleRenderButton("COUNTRY_VIEW")} size='middle' type={selectedView === "COUNTRY_VIEW" ? "primary" : "secondary"}>Country</Button>
                <Button onClick={() => handleRenderButton("CONTINENT_VIEW")} size='middle' type={selectedView === "CONTINENT_VIEW" ? "primary" : "secondary"}>Continent</Button>
            </div>
        )
    }

    const renderHeader = () => {
        return (
            <Row gutter={16} className="mt-2 map-dropdown" >
                <Col flex={1}>
                    <div className="float-right">
                        <Select onChange={handlePrimaryViewChange} defaultValue={primaryView} className='mx-3' style={{ width: '150px' }}>
                            {PRIMARY_LOCATION_VIEWS.map(view => <Option key={view.value} value={view.value}>{view.label}</Option>)}
                        </Select>
                        {isSecondaryViewEnabled && <Select onChange={handleSecondaryViewChange} defaultValue={secondaryView} className='mr-3 mb-3' style={{ width: '150px' }}>
                            {SECONDARY_LOCATION_VIEWS.map(view => <Option key={view.value} value={view.value}>{view.label}</Option>)}
                        </Select>}
                    </div>
                </Col>
            </Row>
        )
    }

    const tabItems = [
        {
            label: 'Map View',
            key: MAP_VIEW
        },
    ]

    const viewCompoonent = {
        COUNTRY_VIEW: Country,
        CONTINENT_VIEW: Continent,
        CANADA_STATE_VIEW: State,
        CANADA_REGION_VIEW: Region,
    }
    const RenderMap = viewCompoonent?.[selectedView];


    const focusMode = (data) => {
        setFocusModeActive(true)
        setFocusModeData([data])
    }

    const dataSource = [
        {
            key: '1',
            name: 'Mike',
            age: 32,
            address: '10 Downing Street',
        },
        {
            key: '2',
            name: 'John',
            age: 42,
            address: '10 Downing Street',
        },
    ];

    const sampleTColumns = (label) =>{
        
        const column = [
            {
                title: `${label}`,
                dataIndex: 'customField',
                key: 'customField',
            },
            {
                title: 'Count',
                dataIndex: 'count',
                key: 'count',
            },
        ];

        return column
    } 

    return (
        <CommonSpinner loading={getLoading || updateLoading || customLoading} className='initialLoader' >
            <div className='ml-6 mr-6' style={{ marginBottom: "40px" }}>
                <>
                    {/* {renderHeader()} */}
                </>
                <MultiSelectWidget groupsArray={groups_array} membersGroup={membersGroup} setSelectedMembersGroups={setSelectedMembersGroups} />

                <div style={{ paddingLeft: "25px" }}>
                    <div className='d-flex'>
                        <div className='d-flex pt-1 pr-3'>
                            <Button icon={<AppstoreOutlined />} size='middle'>Customize </Button>
                        </div>
                        <EditGroups groupsArray={groups_array} />
                    </div>
                    {!focusModeActive &&
                        <div className='pt-3 pr-3'>
                            <Button icon={<SettingOutlined />} size='middle' onClick={() => { setConfigToggle(pre => !pre) }} >Config</Button>
                        </div>
                    }
                </div>

                {!focusModeActive &&
                    <Row>
                        <Col className='ant-col-md-24 ant-col-lg-12 ant-col-xl-12 ant-col-xxl-12'>
                            <>
                                <div style={{ padding: "2% 5% 2% 5%" }}>
                                    <div style={{ fontWeight: 'bold', marginBottom: '10px' }} className='font-s15' >
                                        Member by Location
                                    </div>
                                    {renderButton()}
                                </div>
                                {/* {selectedView === COUNTRY_VIEW &&
                                    <Country {...props} viewMode={viewMode} setInitialLoading={setInitialLoading} initialLoading={initialLoading} selectedView={selectedView} />}
                                {selectedView === CONTINENT_VIEW &&
                                    <Continent {...props} viewMode={viewMode} setInitialLoading={setInitialLoading} initialLoading={initialLoading} selectedView={selectedView} />}
                                {(selectedView === 'CANADA_STATE_VIEW' || selectedView === 'USA_STATE_VIEW') &&
                                    <State {...props} viewMode={viewMode} setInitialLoading={setInitialLoading} initialLoading={initialLoading} selectedView={selectedView} />}
                                {(selectedView === 'CANADA_REGION_VIEW' || selectedView === 'USA_REGION_VIEW') &&
                                    <Region {...props} viewMode={viewMode} setInitialLoading={setInitialLoading} initialLoading={initialLoading} selectedView={selectedView} />} */}
                                <RenderMap {...props} viewMode={viewMode} setInitialLoading={setInitialLoading} initialLoading={initialLoading} selectedView={selectedView} />

                            </>
                        </Col>
                        {constructedData.map((data, index) => {
                            const span = index === constructedData.length - 1 && index % 2 !== 0 ? 24 : 12;
                            return <Col key={data.label} md={24} lg={span} xl={span} xxl={span}>
                                <div style={{ padding: "2% 5% 2% 5%" }}>
                                    <div style={{ fontWeight: 'bold', marginBottom: '10px' }} className='font-s15' >
                                        {data.label}
                                    </div>
                                </div>
                                {data.chart_display === "pie" &&
                                    < CommonPieChart focusMode={focusMode} focusModeData={data} dataSource={data?.chartData} />
                                }
                                {data.chart_display === "bar" &&
                                    < CommonBarCharts focusMode={focusMode} focusModeData={data} dataSource={data?.chartData} />
                                }
                            </Col>
                        })}
                    </Row>
                }

                {focusModeActive &&
                    <div>
                        <div className='mt-3 mb-3' style={{ marginLeft: "25px" }}>
                            <Button icon={<LeftOutlined />} onClick={() => { setFocusModeActive(false) }}>Back</Button>
                        </div>
                        <Row>
                            {focusModeData.map(data => {
                                return <Col key={data.label} span={12}>
                                    <div className='d-flex' style={{ padding: "2% 5% 2% 5%" }}>
                                        <div style={{ fontWeight: 'bold', marginBottom: '10px' }} className='font-s15' >
                                            {data.label}
                                        </div>
                                        <div className='ml-auto mr-0'>
                                            <Button icon={<ArrowDownOutlined />}>Download</Button>
                                        </div>
                                    </div>
                                    {data.chart_display === "pie" &&
                                        < CommonPieChart focusMode={focusMode} focusModeData={data} dataSource={data?.chartData} />
                                    }
                                    {data.chart_display === "bar" &&
                                        < CommonBarCharts focusMode={focusMode} focusModeData={data} dataSource={data?.chartData} />
                                    }
                                </Col>
                            })}
                            {focusModeData.map(data => {
                                return <Col span={12}>
                                    <div>
                                        <div className='ml-auto mr-0'>
                                            <Button icon={<ArrowDownOutlined />} >Export CSV</Button>
                                        </div>
                                        <div>
                                            <Table dataSource={data?.chartData} columns={sampleTColumns(data.label)} />
                                        </div>
                                    </div>
                                </Col>
                            })}
                        </Row>
                    </div>
                }

                {<Modal open={configToggle}
                    afterClose={() => {
                        setConfigModalAfterClose(pre => !pre)
                        setConfigData(demographicsConfig)
                    }}
                    title={"Set Config"}
                    onCancel={() => setConfigToggle(false)}
                    width={'60%'}
                    className='config-modal'
                    footer={<div className='text-center'>
                        <Button type='primary'
                            onClick={() => {
                                setDemographicsConfig(configData)
                                setConfigToggle(false)
                                updateConfigData(appdir, configData)
                            }}
                            icon={<SaveOutlined />}>
                            Save
                        </Button>
                    </div>}
                >
                    <div>
                        <ConfigWidget configModalAfterClose={configModalAfterClose} demographicsConfig={demographicsConfig} configData={configData} setConfigData={setConfigData} />
                    </div>
                </Modal>}

            </div>
        </CommonSpinner >
    );
}