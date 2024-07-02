import React, { useState, useEffect, useContext } from 'react'
import { Row, Col, Table, Button, Select, Modal, Typography,Input  } from 'antd'
import { MailFilled, SearchOutlined } from '@ant-design/icons';
import _flattenDeep from "lodash/flattenDeep";
import _groupBy from "lodash/groupBy";
import  _map  from 'lodash/map';
import CommonSpinner from '@/CorporateMembershipReportingV2/common/CommonSpinner';
import {convertLowercaseFormat, currencyFormatter, sortGroupName } from '@/AnalyticsAll/StatComponents/util';
import CustomExportCsv from '@/CorporateMembershipReportingV2/common/CustomExportCsv';
import GlobalContext from '@/CorporateMembershipReportingV2/context/MemberContext';
import { getMembersInfoByUuids, getSalesActivityInfo } from '@/CorporateMembershipReportingV2/SalesChartWidget/service';
import { addValuesInObj, combineAllArrays } from '@/CorporateMembershipReportingV2/SalesChartWidget/helper';
import MultiSelectWidget from '../common/MultiSelectWidget';

const { Option } = Select;

const ReportTable = (props) =>{
    const { membersGroup, setSelectedMembersGroups, selectedOptions, setSelectedOptions, selectedDates} = useContext(GlobalContext);

    const { params: { groups_array, appdir } } = props

    const groupid = groups_array.map((data) => {
        return data.groupid
    })

    const [tableSource, setTableSource ] = useState([])
    const [loading, setLoading] = useState(false);
    const [showModal, setShowModal] = useState(false);
    const [chartCount, setChartCount] = useState();
    const [searchValue, setSearchValue] = useState("");
    const [selectedTableData, setSelectedTableData] = useState([]);
    const [memberDetails, setMemberDetails] = useState([])
    const [tableDataSource, setTableDataSource]= useState([])
    const [salesActivity, setSalesActivity ] =useState([])
    const [revenueCount, setRevenueCount] = useState()
    const [modalLoading, setModalLoading] = useState(false)

    const fetchSalesInfo = async (appdir, groupid, start_date, end_date) => {
        try{
            setLoading(true)
            let result = await getSalesActivityInfo(appdir, groupid, start_date, end_date)
            if (result?.success) {
                setSalesActivity(result.data)
            }
            setLoading(false)
        } catch(error){
            console.log("error",error)
        }
    };

    useEffect(() => {
        fetchSalesInfo(appdir, groupid, selectedDates[0], selectedDates[1])
    }, [])

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
            dataIndex: "Company",
            key: "Company",
            className: "text-left",
            render: (_, data) => {
                return <div> {data.Companyname ? data.Companyname : '-'} </div>
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

    const reportTableHeader = [
        { label: "ID", key: "id" },
        { label: "Organization", key: "Company" },
    ]


    const handleMemberDataBasedSelectedGroups = () => {
        let membershipGroupData ;

        membershipGroupData = membersGroup.map((data) => {
            return tableSource.filter(item => item?.GroupName.trim() === data.trim())
        }).flat();

        setTableDataSource(membershipGroupData);
    }
    
    useEffect(() => {
        handleMemberDataBasedSelectedGroups()
    }, [tableSource, membersGroup])

    useEffect(() => {
        if (salesActivity?.length) {
            let constructedDataSource = _map(_groupBy(salesActivity, "GroupID"), (groupArr) => {
                let UUIDObj = combineAllArrays(groupArr, ["NewMemberUUIDs", "RenewMemberUUIDs"]);
                return {
                    GroupID: groupArr[0]["GroupID"],
                    GroupName: groupArr[0]["GroupName"],
                    ...addValuesInObj(groupArr, ["TotalInvoices", "TotalRevenue", "NewMembers",  "RenewingMembers", "RenewingMembersRevenue",  "NewMembersRevenue"]),
                    ...UUIDObj,
                    MembersUUIDs: _flattenDeep(Object.values(UUIDObj)),
                }
            })
            setTableDataSource(constructedDataSource);
            setTableSource(constructedDataSource);
        }
    }, [salesActivity])

    const handleSendEmail = () => {
        let reviewIds = _map(memberDetails, "CompIDThisConfID").join();
        window.parent.postMessage(
            { reviewIds, type: "Email"},
            "*"
        );
    }

    const handleReportTableClick = (data, Members) =>{
        let TotalCount;
        let TotalRevenue;
        let UUIDS;
        if(Members === 'newMembers'){
            TotalCount = data.NewMembers;
            TotalRevenue = data.NewMembersRevenue;
            UUIDS = data.NewMemberUUIDs;
        } else if(Members === 'renewMembers'){
            TotalCount = data.RenewingMembers;
            TotalRevenue = data.RenewingMembersRevenue;
            UUIDS = data.RenewMemberUUIDs;
        } else {
            TotalCount = data.TotalInvoices;
            TotalRevenue = data.TotalRevenue;
            UUIDS = data.MembersUUIDs;
        }
        fetchSalesDetails(UUIDS, appdir)
        setChartCount(TotalCount)
        setRevenueCount(TotalRevenue)
        setShowModal(true)
    }

    const handleCancel = () => {
        setShowModal(false)
        setSearchValue("")
        setSelectedTableData([])
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

    const handleDateClick = () =>{
        fetchSalesInfo(appdir, groupid, selectedDates[0], selectedDates[1])
    }

    const handleChange = (e) => {
        setSelectedOptions(e)
    }

    const memberTypeColumn = [
        {
            title: "MEMBER TYPE",
            dataIndex: "GroupName",
            key: "GroupName",
            children: [
                {
                    title: '',
                    dataIndex: 'GroupName',
                    width:150,
                    fixed:'left',
                    className: "text-left",
                    render: (_, data) => {
                        return <div>{data.GroupName}</div>
                    }

                },
            ],
            sorter: sortGroupName,
        },
        {
            title: "TOTAL",
            dataIndex: "TotalInvoices",
            key: "TotalInvoices",
            children: [
                {
                    title: 'MEMBERS',
                    dataIndex: 'TotalInvoices',
                    className: "text-left",
                    render: (_, data) => {
                        let text = data.TotalInvoices;
                        if(!data.TotalInvoices){
                           return text 
                        }
                        return <a onClick={() => handleReportTableClick(data)}>{text}</a>
                    },
                },
                {
                    title: 'REVENUE',
                    dataIndex: 'TotalRevenue',
                    className: "text-left",
                    render: (_, data) => {
                        return <div>{currencyFormatter(data.TotalRevenue)}</div>
                    },
                },
            ],
        },

        {
            title: "NEW",
            dataIndex: "NewMembers",
            key: "NewMembers",
            children: [
                {
                    title: 'MEMBERS',
                    dataIndex: 'NewMembers',
                    className: "text-left",
                    render: (_, data) => {
                        let text = data.NewMembers;
                        if(!data.NewMembers){
                           return text 
                        }
                        return <a onClick={() => handleReportTableClick(data, 'newMembers')}>{text}</a>
                    }
                },
                {
                    title: 'REVENUE',
                    dataIndex: 'NewMembersRevenue',
                    className: "text-left",
                    render: (_, data) => {
                        return <div>{currencyFormatter(data.NewMembersRevenue)}</div>
                    }
                },
            ]
        },
        {
            title: "RENEWING",
            dataIndex: "RenewingMembers",
            key: "RenewingMembers",
            children: [
                {
                    title: 'MEMBERS',
                    dataIndex: 'RenewingMembers',
                    className: "text-left",
                    render: (_, data) => {
                        let text = data.RenewingMembers;
                        if(!data.RenewingMembers){
                           return text 
                        }
                        return <a onClick={() => handleReportTableClick(data, 'renewMembers')}>{text}</a>
                    }
                },
                {
                    title: 'REVENUE',
                    dataIndex: 'RenewingMembersRevenue',
                    className: "text-left",
                    render: (_, data) => {
                        return <div>{currencyFormatter(data.RenewingMembersRevenue)}</div>
                    }
                },
            ]
        },
    ];

    const reportTableHeaders =[
        { label: "MEMBER TYPE", key: "GroupName" },
        { label: "TOTAL MEMBERS", key: "TotalInvoices"},
        { label: "TOTAL REVENUE", key:'TotalRevenue'},
        { label: "NEW MEMBERS", key: "NewMembers" },
        { label: "NEW MEMBERS REVENUE", key:"NewMembersRevenue"},
        { label: "RENEWING MEMBERS", key:"RenewingMembers" }, 
        { label: "RENEWING MEMBERS REVENUE", key:"RenewingMembersRevenue"}
    ]
    
    const renderActionBar = () => {
        return (
            <>
                <Row gutter={16} className='mt-4 mb-2 row-gap'>
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
                    <Col flex={3}>
                        <div className='d-flex'>
                            <Button icon={<SearchOutlined/>} onClick={handleDateClick}>Search</Button>
                        </div>
                    </Col>
                    <Col>
                        <CustomExportCsv
                            dataSource={tableDataSource}
                            Headers={reportTableHeaders}
                            exportFileName="Report Table"
                        /> 
                    </Col>
                </Row>
            </>
        )
    }

    const reportTable = () => {
        return (
            <Table 
                dataSource={tableDataSource} 
                columns={memberTypeColumn} 
                pagination={false} 
                className='salesReportTable py-3' 
                scroll={{ x: 1200, y: 300 }} 
                summary={(tableData) => {
                    let totalMembers = 0;
                    let totalRevenue = 0;
                    let totalNewMembers = 0;
                    let totalNewMemRevenue= 0;
                    let totalRenewMem = 0;
                    let totalRenewMemRevenue = 0;
                    tableData.forEach((data) => {
                      totalMembers += data.TotalInvoices;
                      totalRevenue += data.TotalRevenue;
                      totalNewMembers += data.NewMembers;
                      totalNewMemRevenue +=data.NewMembersRevenue;
                      totalRenewMem +=data.RenewingMembers;
                      totalRenewMemRevenue+=data.RenewingMembersRevenue;
                    });
                    return (
                      <Table.Summary fixed>
                        <Table.Summary.Row style={{backgroundColor:"#F9F9F9"}}>
                          <Table.Summary.Cell index={0} className='text-left'><div style={{ color: "#0673b1", fontWeight:'bold'}}>TOTAL</div></Table.Summary.Cell>
                          <Table.Summary.Cell index={1} className='text-left'>
                            <Typography>{totalMembers}</Typography>
                          </Table.Summary.Cell>
                          <Table.Summary.Cell index={2} className='text-left'>
                            <Typography>{currencyFormatter(totalRevenue)}</Typography>
                          </Table.Summary.Cell>
                          <Table.Summary.Cell index={3} className='text-left'>
                            <Typography>{totalNewMembers}</Typography>
                          </Table.Summary.Cell>
                          <Table.Summary.Cell index={4} className='text-left'>
                            <Typography>{currencyFormatter(totalNewMemRevenue)}</Typography>
                          </Table.Summary.Cell>
                          <Table.Summary.Cell index={5} className='text-left'>
                            <Typography>{totalRenewMem}</Typography>
                          </Table.Summary.Cell>
                          <Table.Summary.Cell index={6} className='text-left'>
                            <Typography>{currencyFormatter(totalRenewMemRevenue)}</Typography>
                          </Table.Summary.Cell>
                        </Table.Summary.Row>
                      </Table.Summary>
                    );
                  }}
            />
        )
    }

    const renderMemberModal = () => {
        return (
            <div>
                <Modal visible={showModal} title="Member Details" onCancel={handleCancel} footer={null} width='80%'>
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
                                        Company: data.Companyname ? data.Companyname : '-',
                                    };
                                })}
                                Headers={reportTableHeader}
                                exportFileName={"Report Table"}
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
                {reportTable() }
            </div>}
            {renderMemberModal()}
        </CommonSpinner>
    )
}
export default ReportTable