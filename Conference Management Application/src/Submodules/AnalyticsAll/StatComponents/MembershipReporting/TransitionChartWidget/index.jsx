import React, { useState, useEffect, createRef, useContext, useRef } from 'react';
import GlobalContext from '@/MembershipReportingV2/context/MemberContext';
import { Row, Col, Radio, Select, Table, Modal, Typography, Button, Avatar, Input, Alert } from 'antd';
import CommonSpinner from '@/MembershipReportingV2/common/CommonSpinner';
import CommonDatePicker from '@/MembershipReportingV2/common/CommonDatePicker';
import { get90PriorDate, getCurrentDate, convertLowercaseFormat, currencyFormatter, sortName } from '@/AnalyticsAll/StatComponents/util';
import CustomExportCsv from '@/MembershipReportingV2/common/CustomExportCsv';
import DownloadChart from '@/MembershipReportingV2/common/DownloadChart';
import { CurrentTransitionChart } from "@/MembershipReportingV2/TransitionChartWidget/CurrentTransitionChart";
import { getMembersInfoByUuids } from '@/MembershipReportingV2/TransitionChartWidget/service';
import moment from 'moment';
import _map from 'lodash/map';
import _isEmpty from 'lodash/isEmpty';
import { ArrowRightOutlined, MailFilled, SearchOutlined, UserOutlined } from '@ant-design/icons';
import { HASH_DATA } from '@/MembershipReportingV2/TransitionChartWidget/Constants';
import { NoDataFound } from '@/MembershipReportingV2/common/NoDataFound';
import MultiSelectWidget from '../common/MultiSelectWidget';
import { ReactComponent as OpenInNewIcon } from "@/AnalyticsAll/NativeDashboards/MembershipReporting/assets/icons/OpenInNew.svg";
import { dateFormat } from '../../util';
import clickableColumnHeader from './../common/ClickableColumnIcon';
import EditGroups from '../common/EditGroups';
import UniSelectWidget from '../common/UniSelectWidget';
import CustomTableTransition from './CustomTableTransition';

let controller = new AbortController();
let signal = controller.signal;
export const TransitionChartWidget = (props) => {
    const { membersGroup, setSelectedMembersGroups, isGroups } = useContext(GlobalContext);
    const chartReference = createRef()

    const domEl = useRef()

    const chartRef = useRef()

    const { params: { source_hex, groups_array, appdir } } = props;
    const [memberTableData, setMemberTableData] = useState([]);
    const [dates, setDates] = useState([moment(get90PriorDate(), 'DD-MM-YYYY').format('MM/DD/YYYY'), moment(getCurrentDate(), 'DD-MM-YYYY').format('MM/DD/YYYY')]);
    const [dataSource, setDataSource] = useState([]);
    const [tableDataSource, setTableDataSource] = useState([])
    const [loading, setLoading] = useState(false)
    const [active, setActive] = useState("chart");
    const [memberDetails, setMemberDetails] = useState([]);
    const [showModal, setShowModal] = useState(false);
    const [selectedItem, setSelectedItem] = useState({})
    const [selectedTableData, setSelectedTableData] = useState([])
    const [searchValue, setSearchValue] = useState('')
    const [totalValues, setTotalValues] = useState({ start: 0, end: 0 })
    const [groupId, setGroupId] = useState([])
    const [memberModal, setMemberModal] = useState(false)
    const [isDatePickerOpen, setIsDatePickerOpen] = useState('')
    const [isTouched, setIsTouched] = useState(false)

    const getTransitionInfo = async (source_hex, groupId, start_date, end_date) => {
        const baseApi = "https://bm6uvz69il.execute-api.us-east-1.amazonaws.com/dev/api";
        try {
            setLoading(true)
            const response = await fetch(
                `${baseApi}?module=dues&component=reports&function=member_transition&source=${source_hex}&groupid=${groupId}&start_date=${start_date}&end_date=${end_date}`, {signal}
            );
            const data = await response?.json();
            setDataSource(data?.data)
            setLoading(false)
            const tableKeys = Object.keys(data?.data?.tableData)
            const tableData = []
            tableKeys.forEach((val) => {
                tableData.push(data?.data?.tableData[val])
            })
            setTableDataSource(tableData)
            return data
        } catch (error) {
            console.log("error", error)
        }
    };

    useEffect(() => {
        if (groupId?.length) {
            getTransitionInfo(source_hex, groupId[0], moment(dates[0], 'MM-DD-YYYY').format('YYYY'), moment(dates[1], 'MM-DD-YYYY').format('YYYY'))
        }
    }, [groupId])

    const handleMemberClick = (data, key) => {
        let groupInfo = dataSource?.tableDataUUIDs[data.groupname] || [];
        if (groupInfo[key]?.length > 0) {
            setSelectedItem({
                ...data,
                UUIDs: groupInfo[key],
                groupTitle: data.groupname,
                value: groupInfo[key].length,
                isTable: true,
                selectedValue: HASH_DATA[key],
            });
        }
        setShowModal(true)
        fetchMemberDetails(groupInfo[key], source_hex)
    }

    const DownloadMemberInfo = ({ data, keyVal }) => {
        return Number(data[keyVal]) ? (<a onClick={() => handleMemberClick(data, keyVal)}>{currencyFormatter(data[keyVal], false)}</a>) : 0;
    };


    const transitionColumn = [
        {
            title: "Group Name",
            dataIndex: "groupname",
            key: "groupname",
            className: "text-left",
            fixed:'left',
            width:300,
            render: (_, data) => {
                return <div> {data.groupname} </div>
            },
        },
        {
            title: clickableColumnHeader("Count at Beginning", "trends-column-header"),
            dataIndex: 'countatbeginning',
            key: 'countatbeginning',
            className: "text-left",
            render: (_, data) => {
                return <DownloadMemberInfo data={data} keyVal={'countatbeginning'} />
            },

        },
        {
            title: clickableColumnHeader("Member as of End Date", "trends-column-header"),
            dataIndex: "membersonenddate",
            key: "membersonenddate",
            className: "text-left",
            render: (_, data) => {
                return <DownloadMemberInfo data={data} keyVal={'membersonenddate'} />
            },

        },
        {
            title: clickableColumnHeader("New Members", "trends-column-header"),
            dataIndex: "newmembers",
            key: "newmembers",
            className: "text-left",
            render: (_, data) => {
                return <DownloadMemberInfo data={data} keyVal={'newmembers'} />
            },
        },
        {
            title: clickableColumnHeader("Transitioned Into", "trends-column-header"),
            dataIndex: "transitionedinto",
            key: "transitionedinto",
            className: "text-left",
            render: (_, data) => {
                return <DownloadMemberInfo data={data} keyVal={'transitionedinto'} />
            },
        },
        {
            title: clickableColumnHeader("No Changes","trends-column-header"),
            dataIndex: "nochange",
            key: "nochange",
            className: "text-left",
            render: (_, data) => {
                return <DownloadMemberInfo data={data} keyVal={'nochange'} />
            },
        },
        {
            title: clickableColumnHeader("Membership Expired", "trends-column-header"),
            dataIndex: "expired",
            key: "expired",
            className: "text-left",
            render: (_, data) => {
                return <DownloadMemberInfo data={data} keyVal={'expired'} />
            },
        },
        {
            title: clickableColumnHeader("Transitioned Out", "trends-column-header"),
            dataIndex: "transitionedout",
            key: "transitionedout",
            className: "text-left",
            render: (_, data) => {
                return <DownloadMemberInfo data={data} keyVal={'transitionedout'} />
            },
        },
        {
            title: clickableColumnHeader("Exit Society", "trends-column-header"),
            dataIndex: "exitsociety",
            key: "exitsociety",
            className: "text-left",
            render: (_, data) => {
                return <DownloadMemberInfo data={data} keyVal={'exitsociety'} />
            },
        },
    ]

    const MemberDetailsColumn = [
        {
            title: "ID",
            dataIndex: "ReviewIDThisCustID",
            key: "ReviewIDThisCustID",
            className: "text-left",
            width:5,
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
            width: 15,
            render: (_, data) => {
                return (
                    <div style={{ fontSize: '16px' }}>
                        <Row style={{ flexWrap: "nowrap", alignItems: 'center' }}>
                            <Col>
                                <Avatar size={40} alt="profile" icon={<UserOutlined />} src={data?.Picture} />
                            </Col>
                            <Col className="ml-3">
                                <div>{data?.Firstname} {data?.Lastname}</div>
                            </Col>
                        </Row>
                    </div>
                )
            },
            sorter: sortName
        },
        {
            title: "Organization",
            dataIndex: "Company",
            key: "Company",
            className: "text-left",
            width:13,
            render: val => <div>{val ? val : '-'} </div>,
        },
        {
            title: "Email",
            dataIndex: "Email",
            key: "Email",
            className: "text-left",
            width:12,
            render: val => <div> {val ? val : '-'} </div>
        },
        {
            title: "Joining Date",
            dataIndex: "MemberJoinDate",
            key: "MemberJoinDate",
            className: "text-left",
            width: 8,
            render: date => (<div>{moment(date).isValid() ? dateFormat(date) : "-"}</div>),
        },
        {
            title: "Expiration Date",
            dataIndex: "ExpirationDate",
            key: "ExpirationDate",
            className: "text-left",
            width: 8,
            render: date => (<div>{moment(date).isValid() ? dateFormat(date) : "-"}</div>),
        },
        {
            title: "Action",
            dataIndex: "action",
            key: "action",
            className: "text-left",
            width: 7,
            render: (_, data) => {
                return <Button target="_blank" href={`https://www.xcdsystem.com/${appdir}/admin/contacts/managecontacts/index.cfm?CFGRIDKEY=${data.ReviewIDThisCustID}`}> Manage </Button>
            },
        }
    ];

    const currentTrendHeaders = [
        { label: "Group Name", key: "groupname" },
        { label: "Count at Beginning", key: "countatbeginning" },
        { label: "Member as of End Date", key: "membersonenddate" },
        { label: "New Members", key: "newmembers" },
        { label: "Transitioned Into", key: "transitionedinto" },
        { label: "No Changes", key: "nochange" },
        { label: "Membership Expired", key: "expired" },
        { label: "Transitioned Out", key: "transitionedout" },
        { label: "Exit Society", key: "exitsociety" },
    ]

    const totalMemberHeader = [
        { label: "ID", key: "id" },
        { label: "Name", key: "user" },
        { label: "Organization", key: "Company" },
        { label: "Email", key: "Email" },
        { label: "Joining Date", key: "MemberJoinDate" },
        { label: "Expiration Date", key: "ExpirationDate" },
    ]

    useEffect(() => {
        let data = membersGroup?.map((data) => {
            return groups_array?.find(item => item?.groupname.trim() === data.trim())?.groupid
        })
        setGroupId(data)
        controller.abort();
        controller = new AbortController();
        signal = controller.signal;
    }, [groups_array, membersGroup])

    const fetchMemberDetails = async (uuids, sourceHex) => {
        try {
            setLoading(true)
            let result = await getMembersInfoByUuids(uuids, sourceHex)
            if (result?.success) {
                setMemberDetails(result?.data)
                setSelectedTableData(result?.data)
            }
            setLoading(false)
        } catch (error) {
            console.log("error", error)
        }
    }

    const handleDate = (value, dateStrings) => {
        setIsTouched(true)
        setDates([dateStrings?.[0], dateStrings?.[1]]);
    }

    useEffect(() => {
        let totalBeginning = 0;
        let totalEnd = 0;
        if (dataSource?.tableData) {
            _map(dataSource.tableData, (val) => {
                totalBeginning += val['countatbeginning'];
                totalEnd += val["membersonenddate"];
            })
        }
        setTotalValues({ start: totalBeginning, end: totalEnd });
    }, [dataSource])

    const handleSendEmail = () => {
        let reviewIds = _map(memberDetails, "ReviewIDThisCustID").join();
        window.parent.postMessage(
            { reviewIds, type: "Email"},
            "*"
        );
    }

    const handleViewChange = (e) => {
        setActive(e.target.value)
    }

    const handleChartClick = (chartData) => {
        let icon = "targetLinks" in chartData || "sourceLinks" in chartData;
        const { UUIDs, targetLinks, sourceLinks } = chartData;
        let uuid = [];
        if (!_isEmpty(targetLinks)) {
            uuid = targetLinks.map(data => data.UUIDs);
        } else if (!_isEmpty(sourceLinks)) {
            uuid = sourceLinks.map(data => data.UUIDs);
        } else {
            uuid = UUIDs;
        }
        uuid = [].concat.apply([], uuid);
        setSelectedItem({
            ...chartData,
            UUIDs: uuid,
            groupTitle: chartData.source ? chartData.source.name : chartData.name,
            isTable: false,
            icon: !icon,
        });
        fetchMemberDetails(uuid, source_hex)
        setShowModal(true)
    }

    const handleCountClick = (membersData) => {
        let UUIDs = [];
        let totalCount = 0;
        _map(dataSource.tableDataUUIDs, (data)=>{
            if (membersData === "TotalEndCount"){
                UUIDs.push(...data.membersonenddate)
                totalCount += data.membersonenddate.length
            } else {
                UUIDs.push(...data.countatbeginning)
                totalCount += data.countatbeginning.length
            }
        })
        setSelectedItem({
            UUIDs:UUIDs,
            value:totalCount,
            isTable: false,
        });
        fetchMemberDetails(UUIDs, source_hex)
        setMemberModal(true)
    }

    const groupTitleDate = (title, date, endDate) => {
        return <div>
            <div>{title}</div>
            <div>{date} {endDate?.length ? <ArrowRightOutlined /> : ''} {endDate} </div>
        </div>
    }

    const getGroupName = () => {
        let leftSide = "";
        let rightSide = "";
        let middleIcon = "";
        const { isTable, groupTitle, source, target, selectedValue, icon } = selectedItem;

        if (isTable) {
            leftSide = groupTitleDate(groupTitle, dates[0]);
            rightSide = groupTitleDate(selectedValue,dates[1]);
        } else {
            if (!_isEmpty(source) || !_isEmpty(target)) {
                leftSide = groupTitleDate(source.name, dates[0]);
                rightSide = groupTitleDate(target.name, dates[1]);
            } else {
                leftSide = groupTitleDate(groupTitle,dates[0], dates[1]);
            }
        }

        if (isTable) {
            middleIcon = `: `;
        } else if (icon) {
            middleIcon = (<ArrowRightOutlined style={{ fontSize: "15px", marginLeft: "10px", marginRight: "10px" }} />);
        }

        return (
            <span style={{display: 'flex', flexDirection:'row'}}>
                <div>
                    {leftSide}
                </div>
                <div>
                    {middleIcon} 
                </div>
                <div>
                    {rightSide}
                </div>
            </span>
        );
    };

    const handleCancel = () => {
        setShowModal(false)
        setMemberModal(false)
        setSelectedTableData([])
        setSearchValue("")
    }

    useEffect(()=>{
        if(isDatePickerOpen === false && isTouched === true){
            getTransitionInfo(source_hex, groupId[0], moment(dates[0], 'MM-DD-YYYY').format('YYYY'), moment(dates[1], 'MM-DD-YYYY').format('YYYY'))
            setIsTouched(false)
        }
    },[isDatePickerOpen, isTouched])

    const onMemberSearch = searchValue => {
        searchValue = searchValue.target.value;
        let searchResult = []
        if (searchValue) {
            searchResult = selectedTableData?.filter((mem) => { return convertLowercaseFormat(`${mem?.Firstname} ${mem?.Lastname}`).includes(convertLowercaseFormat(searchValue)) })
        } else {
            searchResult = selectedTableData
        }
        setSearchValue(searchValue)
        setMemberDetails(searchResult)
    };

    const handleOpenPop = (open) =>{
        setIsDatePickerOpen(open)
    }

    const renderActionBar = () => {
        return (
            <div className='pt-2 pl-2'>
                <Row gutter={16} className='mb-3 mt-3 row-gap'>
                    <Col  flex={3}>
                        <div
                        style={{
                            display: "flex",
                            flexDirection: "row",
                            alignItems: "baseline",
                            gap: "15px",
                        }}
                        >
                        <div>
                            <h2 className="sales-title primary-color" style={{ marginBottom: "0.1rem", marginTop: "0.1rem" }}>
                            Membership Upgrades/Downgrades
                            </h2>
                            <p style={{ fontSize: "13px", marginBottom: 0 }}>
                            Member transition history over the period
                            </p>
                        </div>
                        <div className='ml-auto mr-0'>
                            {!isGroups && <EditGroups groupsArray={groups_array} />}
                        </div>

                        {isGroups && (
                        <UniSelectWidget
                            groupsArray={groups_array}
                            membersGroup={membersGroup}
                            setSelectedMembersGroups={setSelectedMembersGroups}
                        />
                        )}
                        </div>
                    </Col>
                </Row>

                <Row gutter={16} className='mb-3 mt-3 row-gap'>
                    <Col  flex={3}>
                        <span className="title">BETWEEN</span> : <CommonDatePicker handleDate={handleDate} handleOpenPop={handleOpenPop} pickerType={'year'} />
                    </Col>
                    <Col>
                        <Radio.Group
                            value={active}
                            onChange={handleViewChange}
                        >
                            <Radio.Button value='chart'>Chart</Radio.Button>
                            <Radio.Button value='table'>Table</Radio.Button>
                        </Radio.Group>
                    </Col>
                    {active === "table" ? <Col>
                        <CustomExportCsv
                            dataSource={tableDataSource}
                            Headers={currentTrendHeaders}
                            exportFileName={"trend"}
                        />
                    </Col> :
                        <Col>
                            <DownloadChart chartRef={chartRef} fileName={{ name: "Current Trend", startDate: dateFormat(dates[0]), endDate: dateFormat(dates[1]) }} />
                        </Col>
                    }
                </Row>
                <Row gutter={16} className='mb-3 mt-5'>
                    <Col className="title" style={{ paddingRight: '0px' }}> Total Members <span>{`(As of ${dateFormat(dates[0])})`} : </span><a style={{ fontWeight: "bold"}} onClick={handleCountClick}>{totalValues.start}</a>
                    </Col>
                    <Col flex={3} style={{ paddingLeft: '0px' }}><OpenInNewIcon style={{ height: '48%', marginTop:'2px', fill: '#1890ff' }} /></Col>
                    <Col className="title" style={{ paddingRight: '0px' }} > Total Members <span>{`(As of ${dateFormat(dates[1])})`} : </span><a style={{ fontWeight: "bold" }} onClick={() => handleCountClick("TotalEndCount")}>{totalValues.end}</a>
                    </Col>
                    <Col style={{ paddingLeft: '0px' }}><OpenInNewIcon style={{ height: '48%',marginTop:'2px', fill: '#1890ff' }} /></Col>
                </Row>
            </div>
        )
    }
    const expandedRowRender = (record) => {
        const columnsTransitionIn = [
          {
            title: '',
            dataIndex: 'group_name',
            key: 'group_name',
            render: text => (
              <div className="text-left">
                {text}
              </div>
            ),
          },
          {
            title: '',
            dataIndex: 'members',
            key: 'members',
            // render: (text, data) => {
            //   console.log("text, data columnsTransitionIn",text, data);
            //   return <DownloadNestedMemberInfo data={data.parentRow} keyVal={'transitioned_in_details'} groupName={data.group_name} />;
            // },
          },
        ];
      
      
        const columnsTransitionOut = [
          {
            title: '',
            dataIndex: 'group_name',
            key: 'group_name',
            render: text => (
              <div className="text-left">
                {text}
              </div>
            ),
          },
          {
            title: '',
            dataIndex: 'members',
            key: 'members',
            // render: (text, data) => {
            //   console.log("text, data columnsTransitionOut",text, data);
            //   return <DownloadMemberInfo data={data} keyVal={'members'} nestedTableKey={"transitioned_out_details"}  groupData={data} />;
            // },
          },
        ];
      
      
        let transitionInData = []
        for (const key in record.transitioned_in_details){
          if(record.transitioned_in_details[key]>0){
            transitionInData.push({
                group_name: `${key}`,
                members: record.transitioned_in_details[key],
                parentRow: record
              })
          }
        }
      
      
        let transitionOutData =[]
        
        for (const key in record.transitioned_out_details){
          if(record.transitioned_out_details[key] > 0){
      
            transitionOutData.push({
              group_name: `${key}`,
              members: record.transitioned_out_details[key],
              parentRow: record
            })
          }
          }
      
        return (
          <div style={{ display:"flex", justifyContent: 'space-between',  paddingLeft:"5%", paddingRight:"5%", }}>
             <div style={{ flex: '1', marginRight: '1%' }}>
            {transitionInData.length > 0 && (
              <>
                <Alert message= {<> Transitioned Into <strong>{`${record.groupname} (${record.transitionedinto})`} </strong> </>} type="success" />
                <Table
                  columns={columnsTransitionIn}
                  size={"small"}
                  dataSource={transitionInData}
                  pagination={false}
                />
                <br />
              </>
            )}
            </div>
             <div style={{ flex: '1', marginRight: '1%' }}>
            {transitionOutData.length > 0 && (
              <>
                <Alert message={<> Transitioned Out of <strong>{`${record.groupname} (${record.transitionedout})`} </strong> </>} type="error" />
                <Table
                  columns={columnsTransitionOut}
                  size={"small"}
                  dataSource={transitionOutData}
                  pagination={false}
                />
                <br />
              </>
            )}
             </div>
            {transitionOutData.length == 0 &&transitionInData.length == 0 && (<p>Nothing to show here</p>) }
          </div>
        );
      }
    const handleMemberInfo = (val, pageSize) => {
        setMemberTableData(dataSource.slice(val * pageSize - pageSize, val * pageSize))
      }
    const renderChartAndTable = () => {
        if(!membersGroup.length){
            return <NoDataFound />
        }
        if (active === "chart") {
            return <CurrentTransitionChart Transition={dataSource} {...props} chartRef={chartRef} handleChartClick={handleChartClick} />
        }
        if (active === "table") {
            return (<div className="py-2" style={{ width: "100%" }}>

            <CustomTableTransition
                exportCsv={true}
                scroll={{ x: 1500, y: 450 }}
                columns={transitionColumn}
                tableData={tableDataSource}
                selectedItem={selectedItem}
                pagination={false}
                handleMemberInfo={(e, size) => handleMemberInfo(e, size)}
                expandRowRender = {{expandedRowRender}}
                rowKey={"groupname"}
              />
                {/* <Table
                    dataSource={tableDataSource}
                    columns={trendColumn}
                    pagination={false}
                    className='salesTable'
                    scroll={{ x: 1500, y: 450 }} 
                /> */}
            </div>)
        }
    }

    const renderMemberModal = () => {
        return (
            <div>
                <Modal open={showModal ? showModal : memberModal} title="Member Details" onCancel={handleCancel} footer={null} width='80%'>
                    <Row gutter={16} className='py-3'>
                        {showModal && <Col className="mr-5" style={{ fontSize: "16px" }}>
                            <Typography>Group Name</Typography>
                            <div style={{ fontWeight: 'bold' }}>{getGroupName()}</div>
                        </Col>}
                        <Col flex={'130px'} style={{ fontSize: "16px" }}>
                            <Typography>Total Count</Typography>
                            <div style={{ fontWeight: 'bold' }}>{selectedItem?.value}</div>
                        </Col>
                        <Col style={{ fontSize: "16px" }}>
                            <Typography>Report Type</Typography>
                            <div style={{ fontWeight: 'bold' }}>{"Trends"}</div>
                        </Col>
                    </Row>
                    <Row gutter={16} className='py-3'>
                        <Col flex={3}> <Input placeholder="Search" className="mr-3" allowClear style={{ height: '34px' }} value={searchValue} onChange={onMemberSearch}></Input> </Col>
                        <Col> <Button icon={<MailFilled height="15px" />} onClick={handleSendEmail}> Send Email </Button> </Col>
                        <Col>
                            <CustomExportCsv
                                dataSource={memberDetails?.map(data => {
                                    return {
                                        user: `${data.Firstname} ${data.Lastname}`,
                                        id: data.ReviewIDThisCustID,
                                        Company: data.Company ? data.Company : '-',
                                        Email: data.Email ? data.Email : '-',
                                        MemberJoinDate: moment(data.MemberJoinDate).isValid() ? dateFormat(data.MemberJoinDate) : '',
                                        ExpirationDate: moment(data.ExpirationDate).isValid() ? dateFormat(data.ExpirationDate) : '',
                                    };
                                })}
                                Headers={totalMemberHeader}
                                exportFileName={"Trend"}
                            />
                        </Col>
                    </Row>
                    <Table dataSource={memberDetails} columns={MemberDetailsColumn} pagination={true} className='CurrentMemberTable' scroll={{ y: 450 }} loading={loading} />
                </Modal>
            </div>
        )
    }

    return (
        <CommonSpinner loading={loading}>
            {/* <MultiSelectWidget 
                groupsArray={groups_array}
                membersGroup={membersGroup}
                setSelectedMembersGroups={setSelectedMembersGroups}
            /> */}
            {renderActionBar()}
            {!loading && <div>
            {renderChartAndTable()}
            </div>}
            {renderMemberModal()}
        </CommonSpinner>
    )
}