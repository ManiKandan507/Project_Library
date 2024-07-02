import React, { useState, useEffect, useContext, useCallback, useRef } from "react";
import { Select, Row, Col, DatePicker, Button, Radio, Table, Modal, Typography, Input } from "antd";
import moment from "moment";
import _map from 'lodash/map';
import GlobalContext from '@/CorporateMembershipReportingV2/context/MemberContext';
import DownloadChart from '@/CorporateMembershipReportingV2/common/DownloadChart';
import CommonSpinner from '@/CorporateMembershipReportingV2/common/CommonSpinner';
import { NoDataFound } from '@/CorporateMembershipReportingV2/common/NoDataFound';
import MultiSelectWidget from '../common/MultiSelectWidget'
import CustomExportCsv from '@/CorporateMembershipReportingV2/common/CustomExportCsv';
import { getSalesTableData, getSalesByVolumeTableData, getTotalCount, SimpleSalesChart, getDateToConstruct } from '@/CorporateMembershipReportingV2/SalesChartWidget/helper';
import { MailFilled, SearchOutlined } from "@ant-design/icons";
import { getSalesActivityInfo, getMembersInfoByUuids } from '@/CorporateMembershipReportingV2/SalesChartWidget/service';
import { formatDate, convertLowercaseFormat, currencyFormatter } from '@/AnalyticsAll/StatComponents/util';
import { CurrentSalesChart } from '@/CorporateMembershipReportingV2/SalesChartWidget/CurrentSalesChart';
import { constructSalesActivity, mapBarData } from "./helper";
import { DetailedSalesChart } from "./DetailedSalesChart";

const { Option } = Select;
const { RangePicker } = DatePicker

const SalesByVolume = (props) =>{
    const domEl = useRef()

    const { params: { groups_array, appdir } } = props
    const { membersGroup, setSelectedMembersGroups, selectedOptions, setSelectedOptions, selectedDates, setSelectedDates, defaultDates, setDefaultDates } = useContext(GlobalContext);

    const groupid = groups_array.map((data) => {
        return data.groupid
    })

    const [memberCount, setMemberCount] = useState()
    const [active, setActive] = useState("simple");
    const [loading, setLoading] =useState(false);
    const [dataSource, setDataSource] =useState([]);
    const [uuid, setUuid] = useState([]);
    const [memberDetails, setMemberDetails] = useState([]);
    const [showModal, setShowModal] = useState(false);
    const [salesModal, setSalesModal] = useState(false);
    const [chartCount, setChartCount] = useState();
    const [searchValue, setSearchValue] = useState("");
    const [selectedTableData, setSelectedTableData] = useState([]);
    const [revenueCount, setRevenueCount] = useState();
    const [tableDataSource, setTableDataSource] =useState([]);
    const [tableSource, setTableSource]=useState([]);
    const [sourceData, setSourceData]=useState([]);
    const [modalLoading, setModalLoading] = useState(false)
    const [filteredBarChartData, setFilteredBarChartData]=useState([])
    const [simpleChartData, setSimpleChartData] = useState([])

    const fetchSalesInfo = async (appdir, groupid, start_date, end_date) => {
        try{
            setLoading(true)
            let result = await getSalesActivityInfo(appdir, groupid, start_date, end_date)
            if (result?.success) {
                if(result?.data){
                    let sales = result.data
                    if(sales?.length){
                        setDataSource(sales)
                        setSourceData(sales)
                    }
                }
            }
            setLoading(false)
        } catch(error){
            console.log("error",error)
        }
    };

    useEffect(() => {
        fetchSalesInfo(appdir, groupid, selectedDates[0], selectedDates[1])
    }, [])
    
    useEffect(() => {
        if (dataSource.length) {
          let barView = "date";
          let isIncreasingBarValue = true;
          let invoiceKey = 'DayOfInvoiceKey';
          switch (selectedOptions) {
            case "date": {
              barView = "date";
              isIncreasingBarValue = false;
              invoiceKey = 'DayOfInvoiceKey';
              break;
            }
            case "week": {
              barView = "week";
              isIncreasingBarValue = true;
              invoiceKey = 'WeekOfInvoiceKey';
              break;
            }
            case "month": {
              barView = "month";
              isIncreasingBarValue = true;
              invoiceKey = 'MonthOfInvoiceKey';
              break;
            }
            case "quarter": {
              barView = "quarter";
              isIncreasingBarValue = true;
              invoiceKey = 'QuarterOfInvoiceKey';
              break;
            }
            case "year": {
              barView = "year";
              isIncreasingBarValue = true;
              invoiceKey = 'YearOfInvoice';
              break;
            }
            default:{
                break;
            }
          }
          if(active === 'detailed'){
              setFilteredBarChartData(mapBarData({
                data: constructSalesActivity(dataSource),
                invoiceKey,
                barView,
                isIncreasingBarValue,
                barValueKey: props.activeTab === "salesByVolume" ? "TotalInvoices": "TotalRevenue",
              }));
          }
          if(active === 'simple'){
              setSimpleChartData(SimpleSalesChart({
                data:getDateToConstruct(dataSource),
                invoiceKey,
                barView
              }))
          }
          if(active === 'table'){
            setTableDataSource(fetchSalesDetails(
                getDateToConstruct(dataSource),
                groups_array,
                invoiceKey
            ))
            setTableSource(getSalesTableData(
                getDateToConstruct(dataSource), 
                groups_array,
                invoiceKey
            ))
          }
        }
      }, [dataSource, props.activeTab, selectedOptions, active]);

    const fetchSalesDetails = async (uuids, appdir) => {
        try {
            setModalLoading(true)
            let result = await getMembersInfoByUuids(uuids, appdir)
            if (result?.success) {
                setMemberDetails(result?.data)
                setSelectedTableData(result?.data)
            }
            setModalLoading(false)
        } catch (error) {
            console.log("error", error)
        }
    }

    const disabledPeriods = (current) => {
        let period;
        switch (selectedOptions) {
            case "date":
                period = current && current > moment().endOf('day');
                break;
            case "month":
                period = current && current > moment().endOf('month');
                break;
            case "week":
                period = current && current > moment().endOf('week');
                break;
            case "quarter":
                period = current && current > moment().endOf('quarter');
                break;
            case "year":
                period = current && current > moment().endOf('year');
                break;
            default : 
                break;
        }
        return period;
    }

    const handleMemberDataBasedSelectedGroups = () => {
        let totalCount = 0;
        let membershipGroupData ;

        if(active === "table"){
            membershipGroupData = membersGroup.map((data) => {
                return tableSource?.filter(item => item?.groupName.trim() === data.trim())
            }).flat();

            membershipGroupData.map((data) => {
                membershipGroupData[0].yearmonth.map((month) => {
                    if(data[month]?.TotalInvoices){
                        totalCount += data[month]?.TotalInvoices
                    } 
                    return month;
                })
                return data;
            })
            setTableDataSource(membershipGroupData);
        } else {
            membershipGroupData = membersGroup.map((data) => {
                return sourceData?.filter(item => item?.GroupName.trim() === data.trim())
            }).flat();

            membershipGroupData?.forEach((data) => {
                totalCount += data.TotalInvoices
            })
            setDataSource(membershipGroupData);
        }
        setMemberCount(totalCount)
    }

    const MemberDetailsColumn=[
        {
            title: "ID",
            dataIndex: "id",
            key: "id",
            className: "text-left",
            width: "8%",
            render: (_, data) => {
                return <div> {data.CompIDThisConfID} </div>
            },
        },
        {
            title: "Organization",
            dataIndex: "Companyname",
            key: "Companyname",
            className: "text-left",
            render: (_, data) => {
                return (
                    <div style={{ fontSize: '16px' }}> {data?.Companyname}
                    </div>
                )
            },
        },
        {
            title: "Action",
            dataIndex: "action",
            key: "action",
            className: "text-left",
            width: "9%",
            render: (_,data) => {
               return  <Button target="_blank" href={`https://www.xcdsystem.com/${appdir}/admin/company/managecompanies/index.cfm?CFGRIDKEY=${data.CompID}&view=profile`}> Manage </Button>
            },
        }
    ]

    const salesByVolumeHeader = [
        { label: "ID", key: "id" },
        { label: "Organization", key: "Company" },
    ]


    useEffect(() => {
        handleMemberDataBasedSelectedGroups()
    }, [sourceData, tableSource, active, membersGroup])
    
    // useEffect(()=>{
    //     if(dataSource?.length && active === 'table'){
    //         setTableDataSource(getSalesTableData([...dataSource], groups_array))
    //         setTableSource(getSalesTableData([...dataSource], groups_array))
    //     }
    // },[dataSource, active, selectedOptions])

    useEffect(()=>{
        let memberUuids = [];
        if(active === 'table'){
            tableDataSource.map((data) =>{
                tableDataSource[0].months?.map((month)=>{
                    if(data[month]?.memberUUIDs){
                        memberUuids.push(...data[month]?.memberUUIDs)
                    }
                })
            })
        } else{
            dataSource?.map((data)=>{
                memberUuids.push(...data?.NewMemberUUIDs, ...data?.RenewMemberUUIDs)
            })
        }
        setUuid(memberUuids)
    },[dataSource])

    const handleSendEmail = () =>{
        let reviewIds = _map(memberDetails, "CompIDThisConfID").join();
        window.parent.postMessage(
            { reviewIds, type: "Email"},
            "*"
        );
    }

    const handleTableClick = (data) =>{
        fetchSalesDetails(data.memberUUIDs, appdir)
        setChartCount(data.TotalInvoices)
        setRevenueCount(data.TotalRevenue)
        setShowModal(true)
    }

    const getColumn = () => {
        if(!tableDataSource.length){
            return []
        }
        let monthYear = tableDataSource[0]?.yearmonth;
        let columns = monthYear?.map((month) => {
            return {
                title: `${moment(month,"DD/MM/YYYY").format("MM/DD/YYYY")}`,
                className: "text-left",
                render: (_,data) => {
                    let text = data[month]?.TotalInvoices ? data[month]?.TotalInvoices : '-';
                    if(!data[month]?.TotalInvoices){
                        return text 
                    }
                    return <a onClick={() => handleTableClick(data[month])}>{text}</a>
                }
              }
        })
        return columns;
    }

    const salesColumn = [
        {
            title: "MEMBERSHIP",
            dataIndex: "membership",
            key: "membership",
            className: "text-left",
            children: [
                {
                    title: '',
                    dataIndex: 'groupName',      
                    width:150,
                    fixed:'left',
                },
            ],
        },
        {
            title: "PERIOD",
            dataIndex: "period",
            key: "period",
            children: getColumn()
        },
    ];

    const handleCountClick = () =>{
        let totalCount = 0;
        let totalRevenue = 0 ;
        fetchSalesDetails(uuid, appdir)
        dataSource.forEach((data)=>{
            totalCount += data.TotalInvoices
            totalRevenue +=data.TotalRevenue
        })
        setChartCount(totalCount)
        setRevenueCount(totalRevenue)
        setSalesModal(true)
    }

    const handleChartClick = (chartData) => {
        const { id, data } = chartData
        let uuids = data[`${id}UUIDS`];
        fetchSalesDetails(uuids, appdir)
        setChartCount(chartData.value)
        setRevenueCount(data.overAllRevenue)
        setShowModal(true)
    }

    const handleChange = (e) => {
        setSelectedOptions(e)
    }

    const handleCancel = () => {
        setShowModal(false)
        setSearchValue("")
        setSelectedTableData([])
        setSalesModal(false)
    }

    const onMemberSearch = searchValue => {
        searchValue = convertLowercaseFormat(searchValue.target.value);
        let searchResult = []
        if (searchValue) {
            searchResult = selectedTableData?.filter((mem) => { return convertLowercaseFormat(`${mem?.Companyname}`).includes(searchValue.trim()) })
        } else {
            searchResult = selectedTableData
        }
        setSearchValue(searchValue)
        setMemberDetails(searchResult)
    };

    const handleDate = useCallback((value, dateStrings) => {
        if (selectedOptions === "date") {
            setSelectedDates([
                formatDate(dateStrings?.[0]),
                formatDate(dateStrings?.[1])
            ])
            setDefaultDates([
                moment(dateStrings?.[0]),
                moment(dateStrings?.[1])
            ])
        } else if (selectedOptions === "week") {
            setSelectedDates([
                formatDate(moment(value?.[0]).startOf("weeks")),
                formatDate(moment(value?.[1]).endOf("weeks"))
            ])
            setDefaultDates([
                moment(value?.[0]).startOf("weeks"),
                moment(value?.[1]).endOf("weeks")
            ])
        } else if (selectedOptions === "quarter") {
            setSelectedDates([
                formatDate(moment(value?.[0])),
                formatDate(moment(value?.[1]).add(2, 'months').endOf('months'))
            ])
            setDefaultDates([
                moment(value?.[0]),
                moment(value?.[1]).add(2, 'months').endOf('months')
            ])
        } else if (selectedOptions === "year") {
            setSelectedDates([
                formatDate(dateStrings?.[0]),
                formatDate(moment(dateStrings?.[1]).endOf('year'))
            ]);
            setDefaultDates([
                moment(dateStrings?.[0]),
                moment(dateStrings?.[1]).endOf('year')
            ]);
        } else {
            setSelectedDates([
                formatDate(dateStrings?.[0]),
                formatDate(moment(dateStrings?.[1]).endOf('months'))
            ]);
            setDefaultDates([
                moment(dateStrings?.[0]),
                moment(dateStrings?.[1]).endOf('months')
            ]);
        }
    }, [selectedDates]);

    const handleDateClick = () =>{
        fetchSalesInfo(appdir, groupid, selectedDates[0], selectedDates[1])
    }

    const handleViewChange = (e) => {
        setActive(e.target.value)
    }
    
    const renderActionBar = () => {
        return (
            <>
               <div className='mt-3' style={{ fontWeight: 100 }}>{"TOTAL MEMBERS"} : <a className='menuValues member-count' onClick={handleCountClick}>{memberCount}</a></div>
                <Row gutter={16} className='mt-4 mb-2 row-gap' >
                    <Col>
                        <div className='title mr-2'>
                            <Select defaultValue={selectedOptions} style={{ width: 100 }} onChange={handleChange}>
                                <Option value="date">Date</Option>
                                <Option value="week">Week</Option>
                                <Option value='month'>Month</Option>
                                <Option value='quarter'>Quarter</Option>
                                <Option value='year'>Year</Option>
                            </Select>
                        </div>
                    </Col>
                    <Col>
                         <div>
                            {selectedOptions === "date" && <RangePicker
                                picker='date'
                                value={defaultDates}
                                onChange={handleDate}
                                disabledDate={disabledPeriods}
                                format={'MM/DD/YYYY'}
                                allowClear={false}
                            />
                            }
                            {selectedOptions === "week" && <RangePicker
                                picker='week'
                                value={defaultDates}
                                onChange={handleDate}
                                format={'MM/DD/YYYY'}
                                disabledDate={disabledPeriods}
                                allowClear={false}
                            />
                            }
                            {selectedOptions === "month" && <RangePicker
                                picker='month'
                                value={defaultDates}
                                onChange={handleDate}
                                format={'MM/DD/YYYY'}

                                disabledDate={disabledPeriods}
                                allowClear={false}
                            />
                            }

                            {selectedOptions === "quarter" && < RangePicker
                                picker="quarter"
                                value={defaultDates}
                                onChange={handleDate}
                                format={'MM/DD/YYYY'}

                                disabledDate={disabledPeriods}
                                allowClear={false}
                            />
                            }
                            {selectedOptions === "year" && <RangePicker
                                picker='year'
                                value={defaultDates}
                                onChange={handleDate}
                                format={'MM/DD/YYYY'}

                                disabledDate={disabledPeriods}
                                allowClear={false}
                            />
                            }
                        </div>
                    </Col>
                    <Col flex={3}>
                        <div className='d-flex'>
                            <Button icon={<SearchOutlined/>} onClick={handleDateClick}>Search</Button>
                        </div> 
                    </Col>
                    <Col>
                        <Radio.Group value={active} onChange={handleViewChange}>
                            <Radio.Button value='simple'>Simple</Radio.Button>
                            <Radio.Button value='detailed'>Detailed</Radio.Button>
                            <Radio.Button value='table'>Table</Radio.Button>
                        </Radio.Group>
                    </Col>
                    {active === "table" && tableDataSource.length ? 
                        <Col>
                        <CustomExportCsv
                                dataSource={getSalesByVolumeTableData(tableDataSource,"TotalMembers").data}
                                Headers={getSalesByVolumeTableData(tableDataSource, "TotalMembers").columns}
                                exportFileName={'TOTAL MEMBERS'}
                            />
                        </Col> :
                        <Col>
                          <DownloadChart domEl={domEl} fileName={{ name: 'TOTAL MEMBERS', startDate: defaultDates[0].format('MM/DD/YYYY'), endDate: defaultDates[1].format('MM/DD/YYYY') }} />
                        </Col> 
                    }
                </Row>
            </>
        )
    }

    const renderChart = () => {
        if(!dataSource?.length){
            return <NoDataFound/>
        }
        if (active === 'simple') {
            return <CurrentSalesChart salesActivity={simpleChartData} handleChartClick={handleChartClick} domEl={domEl}/>
        }
        if (active === 'detailed') {
            return <DetailedSalesChart salesActivity={filteredBarChartData} handleChartClick={handleChartClick} groups_array={groups_array} membersGroup={membersGroup} dataSource={dataSource} domEl={domEl} />
        }
    }
console.log('tableDataSource', tableDataSource)
console.log('salesColumn', salesColumn)
    const renderTable = () =>{
        if(!tableDataSource?.length){
            return <NoDataFound/>
        }
        if (active === "table") {
            return <div className="py-2" >
                <Table 
                    dataSource={tableDataSource} 
                    columns={salesColumn} 
                    pagination={false} 
                    summary={(tableData) => {
                        let totalCount=[];
                        tableData[0]?.yearmonth.forEach((month) => {
                            totalCount.push(getTotalCount(tableData, month, 'invoice'))
                        })
                        return (
                            <Table.Summary fixed>
                                <Table.Summary.Row style={{backgroundColor:"#F9F9F9"}}>
                                    <Table.Summary.Cell index={0} className='text-left'><div style={{ color: "#0673b1", fontWeight:'bold'}}>TOTAL</div></Table.Summary.Cell>
                                    {totalCount.map((data)=>{
                                        return (<Table.Summary.Cell className='text-left'>
                                          <Typography>{data}</Typography>
                                        </Table.Summary.Cell>)
                                    })}
                                </Table.Summary.Row>
                            </Table.Summary>
                        );
                    }}
                    className='salesReportTable' 
                    scroll={{ x: 1200, y: 300 }}
                />
            </div>
        }
    }

    const renderMemberModal = () => {
        return (
            <div>
                <Modal visible={showModal ? showModal : salesModal} title="Member Details" onCancel={handleCancel} footer={null} width='80%'>
                    <div className='d-flex'>
                        <div className="ml-3" style={{ fontSize: "16px" }}>
                            <Typography>Total Count </Typography>
                            <div style={{ fontWeight: 'bold' }}>{chartCount}</div>
                        </div>
                        <div className="ml-5" style={{ fontSize: "16px" }}>
                            <Typography>Total Revenue</Typography>
                            <div style={{ fontWeight: 'bold' }}>{currencyFormatter(revenueCount)}</div>
                        </div>
                        <div className="ml-5" style={{ fontSize: "16px" }}>
                            <Typography>Report Type</Typography>
                            <div style={{ fontWeight: 'bold' }}>{'Sales Activity'}</div>
                        </div>
                    </div>
                    <Row gutter={16} className='py-3'>
                        <Col flex={3}> <Input placeholder="Search" className="mr-3" allowClear style={{ height: '34px' }} value={searchValue} onChange={onMemberSearch}></Input> </Col>
                        <Col> <Button icon={<MailFilled height="15px" />} onClick={handleSendEmail}> Send Email </Button> </Col>
                        <Col>
                            <CustomExportCsv
                                dataSource={memberDetails?.map(data => {
                                    return {
                                        id: data.CompIDThisConfID,
                                        Company: data.Companyname? data.Companyname:'-',
                                    };
                                })}
                                Headers={salesByVolumeHeader}
                                exportFileName={"TOTAL MEMBERS"}
                            />
                        </Col>
                    </Row>
                    <Table dataSource={memberDetails} columns={MemberDetailsColumn} pagination={true} className='CurrentMemberTable' scroll={{ y: 300 }} loading={modalLoading} size="small"/>
                </Modal>
            </div>
        )
    }

    return (
        <CommonSpinner loading={loading} className='initialLoader'>
            <MultiSelectWidget 
                membersGroup={membersGroup}
                groupsArray={groups_array}
                setSelectedMembersGroups={setSelectedMembersGroups}
            />
                {renderActionBar()}
            {!loading && <div>
                {active !== "table" && renderChart()}
                {active === "table" && renderTable()}
            </div>}
            {renderMemberModal()}
        </CommonSpinner>
    )
}
export default SalesByVolume