import React, { useEffect, useState, useContext, memo, useRef } from "react";
import moment from "moment";
import CommonSpinner from "../common/CommonSpinner";
import MultiSelectWidget from "../common/MultiSelectWidget";
import GlobalContext from "../context/DonationContext";
import TotalDonationTypesLineChart from "../TotalDonationTypesLineChart";
import { Avatar, Col, DatePicker, Descriptions, Radio, Row, Select, Table, Tooltip, Typography } from "antd";
import { convertLowercaseFormat, currencyFormatter, getFullMonthName, sortByAmount, sortByDate, sortCommonName, sortDonorType } from "../../util";
import { FileSearchOutlined, LineChartOutlined, SearchOutlined, TableOutlined, UserOutlined } from "@ant-design/icons";
import ViewInvoiceModal from "./ViewInvoiceModal";
import DownloadChart from "../common/DownloadChart";
import { CompareTableData, ConstructedDonorData, disabledDate } from "../helper";
import CustomExportCsv from "../common/CustomExportCsv";
import { NoDataFound } from "../common/NoDataFound";
import DownloadInvoice from "../common/DownloadInvoice";
import CommonModal from "../common/CommonModal";
import CommonSearchBox from "../common/CommonSearchBox";

const { RangePicker } = DatePicker;

const { Option } = Select;

const RenderMembersModal = memo(({
    showModal,
    setShowModal,
    appDir,
    options,
    categoryData,
    donationCategory
}) => {
    const [donorDetails, setDonorDetails] = useState([])
    const [constructedDonorData, setConstructedDonorData] = useState([])
    const [categorySelectData, setCategorySelectData] = useState([])
    const [selectedCategory, setSelectedCategory] = useState("")
    const [selectedTableData, setSelectedTableData] = useState([])
    const [categoryIds, setCategoryIds] = useState('')
    const [loading, setLoading] = useState(false)
    const [totalAmount, setTotalAmount] = useState(0)
    const [donorType, setDonorType] = useState("All")
    const [selectedTableCategory, setSelectedTableCategory] = useState('')
    const [showInvoiceModal, setShowInvoiceModal] = useState(false)
    const [reviewId, setReviewId] = useState('')
    const [searchQuery, setSearchQuery] = useState({
        searchValue: '',
        donorType: 'All'
    })



    const getUserDonorsDetails = async (start_date, end_date, categoryIds) => {
        try {
            setLoading(true)
            const result = await fetch(`${appDir}?module=donations&component=reports&function=see_donations&start_date=${start_date}&end_date=${end_date}&donationids=[${categoryIds}]&membership=true`, options)
            const values = await result.json();
            if (values.length || result.success==200) {
                setLoading(false)
                setDonorDetails(values?.length ? values: [])
            } else {
                setLoading(false)
                setDonorDetails([])
            }
        }
        catch (e) {
            setLoading(false)
            console.log("error", e);
        }
    }

    useEffect(() => {
        setConstructedDonorData(ConstructedDonorData(donorDetails, donationCategory))
    }, [donorDetails, donationCategory])

    useEffect(() => {
        if (categoryData?.type === 'TOTAL' || categoryData?.type === 'SUB_TOTAL') {
            setCategorySelectData(constructDonationType(categoryData))
        } else {
            setCategorySelectData(donationSelectionOption(selectedTableData, categoryData))
        }
    }, [selectedTableData, categoryData])

    useEffect(() => {
        setSelectedTableData(constructedDonorDetails(constructedDonorData, donorType, searchQuery))
    }, [constructedDonorData, donorType, searchQuery])

    useEffect(() => {
        setSelectedCategory(categoryData.DonationName)
        setCategoryIds(categoryData.donationId)
    }, [categoryData])

    useEffect(() => {
        if (showModal && categoryIds) {
            let startDate = categoryData?.startDate;
            let endDate = categoryData?.endDate;
            getUserDonorsDetails(startDate, endDate, categoryIds)
        }
    }, [categoryData, showModal, categoryIds])

    const constructDonationType = (categoryData) => {
        if (categoryData?.donationId?.length) {
            const resultedArray = categoryData?.donationId?.map((id) => {
                let donationName = '';
                let donationId = '';
                donationCategory?.map((donation) => {
                    if (id === donation?.donation_id) {
                        donationId = donation.donation_id;
                        donationName = donation.donation_name;
                    }
                })
                return {
                    donationId: donationId,
                    donationName: donationName
                }
            })
            resultedArray?.unshift({
                donationId: '',
                donationName: "All",
            })

            return resultedArray;
        }
    }

    const constructedDonorDetails = (constructedDonorData) => {

        let filteredResult = [];
        let totalAmount = 0;
        let tempData = filteredResult.length > 0 ? filteredResult : constructedDonorData;
        if (searchQuery.searchValue) {
            if (searchQuery.donorType === 'Individual' || searchQuery.donorType === 'Corporate') {
                filteredResult = tempData?.filter((donor) => { return convertLowercaseFormat(`${donor?.donorName}`).includes(convertLowercaseFormat(searchQuery.searchValue)) && donor.donorType === searchQuery.donorType })
            } else {
                filteredResult = tempData?.filter((donor) => { return convertLowercaseFormat(`${donor?.donorName}`).includes(convertLowercaseFormat(searchQuery.searchValue)) })
            }
        } else if (searchQuery.donorType) {
            if (searchQuery.donorType === 'Individual') {
                filteredResult = constructedDonorData?.filter((value) => { return value.donorType === "Individual" })
            }
            if (searchQuery.donorType === 'Corporate') {
                filteredResult = constructedDonorData?.filter((value) => { return value.donorType === 'Corporate' })
            }
            if (searchQuery.donorType === 'All') {
                filteredResult = constructedDonorData
            }
        } else {
            filteredResult = constructedDonorData;
        }
        filteredResult?.forEach((value) => {
            totalAmount += value?.amount
        })
        setTotalAmount(totalAmount)
        return filteredResult;
    }

    const donationSelectionOption = (categoryData) => {
        const startDate = moment(categoryData?.startDate, 'MM-DD-YYYY').format('M');
        const donationDetails = categoryData?.dataSource?.filter((value) => { return startDate === value?.monthName && value?.totalAmount > 0 })

        const donationType = donationDetails?.filter((obj, index) => {
            return index === donationDetails?.findIndex(o => obj?.donationName === o?.donationName);
        });

        donationType?.unshift({
            donationId: '',
            donationName: "All",
        })

        return donationType;
    }

    const DonorDetailsColumn = [
        {
            title: <Tooltip title='NAME'>NAME</Tooltip>,
            dataIndex: "donor",
            key: "donor",
            width: 13,
            className: "text-left",
            render: (_, data) => {
                return (
                    <div>
                        <Row style={{ flexWrap: "nowrap", alignItems: 'center' }}>
                            <Col>
                                <Avatar size={40} alt="profile" icon={<UserOutlined />} src={data?.picture} />
                            </Col>
                            <Col className="ml-3">
                                <div> {data?.donorName} </div>
                            </Col>
                        </Row>
                    </div>
                )
            },
        },
        {
            title: <Tooltip title='DONOR TYPE'>DONOR TYPE</Tooltip>,
            dataIndex: "Donor Type",
            key: "Donor Type",
            width: 6,
            ellipsis: true,
            className: "text-left",
            render: (_, data) => {
                return <div> {data?.donorType} </div>
            },
        },
        {
            title:
                <Tooltip title='DONATION TYPE'>DONATION TYPE</Tooltip>,
            dataIndex: "Donation Type",
            key: "Donation Type",
            width: 22,
            className: "text-left",
            render: (_, data) => {
                return <div> {data?.donationName} </div>
            },
        },
        {
            title: <Tooltip title='AMOUNT'>AMOUNT</Tooltip>,
            dataIndex: "amount",
            key: "amount",
            width: 5,
            ellipsis: true,
            render: (_, data) => {
                return <div> {currencyFormatter(data.amount)} </div>
            },
        },
        {
            title: <Tooltip title='VIEW INVOICE'>VIEW INVOICE</Tooltip>,
            dataIndex: 'view',
            key: 'view',
            width: 5,
            ellipsis: true,
            className: 'text-left',
            render: (_, data) => {
                return <div>
                    <Tooltip title={'View Invoice'} >
                        <FileSearchOutlined style={{ fontSize: 20, cursor: 'pointer' }} className="mr-4" onClick={() => handleViewInvoice(data?.donorType === 'Corporate' ? { compuuid: data?.company_uuid } : { otheruuid: data.contact_uuid })} />
                    </Tooltip>
                </div>
            }
        }
    ]

    const handleCancel = () => {
        setShowModal(false)
        setSelectedTableData([])
        setDonorDetails("")
        setCategoryIds("")
        setSelectedCategory("")
        setDonorType("All")
        setSearchQuery({
            searchValue: '',
            donorType: 'All'
        })
        setSelectedTableCategory('')
    }

    const handleViewInvoice = (id) => {
        setReviewId([id])
        setShowInvoiceModal(true)
    }

    const handleSelect = (e) => {
        setSelectedCategory(e)
        categoryData.dataSource.map((data) => {
            if (e === data.id) {
                setCategoryIds(data.donationId)
            }
            return data
        })
    }

    const handleTableSelect = (e) => {
        setSelectedTableCategory(e)
        if (e !== 'All') {
            donationCategory?.map((val) => {
                if (e === val.donation_name) {
                    setCategoryIds(val.donation_id)
                }
            })
        } else {
            setCategoryIds(categoryData?.donationId)
        }
    }

    const handleType = (e) => {
        setSearchQuery((prev) => ({
            ...prev,
            donorType: e
        }))
        setDonorType(e)
    }

    const onDonorSearch = searchValue => {
        searchValue = searchValue.target.value;
        setSearchQuery((prev) => ({
            ...prev,
            searchValue: searchValue
        }))
    }

    const renderSelect = () => {
        return <div className="mr-3 font-s16">
            <Typography className='pb-2' >Donation Type</Typography>
            <Select style={{ maxWidth: '230px' }} onChange={handleSelect} value={selectedCategory} showSearch dropdownMatchSelectWidth={false} dropdownStyle={{ width: '250px' }}>
                {categoryData?.dataSource?.map((data) => {
                    return <Option key={data.id} value={data?.id} className="select-option" >{data?.id}</Option>
                })}
            </Select>
        </div>
    }

    const renderTableSelect = () => {
        return <div className="mr-3 font-s16">
            <Typography className='modalTitle-wrapper pb-2' >Donation Type</Typography>
            <Select
                style={{ maxWidth: '230px' }}
                onChange={handleTableSelect}
                value={selectedTableCategory === '' ? 'All' : selectedTableCategory}
                showSearch
                dropdownMatchSelectWidth={false}
                dropdownStyle={{ width: '250px' }}>
                {categorySelectData?.map((data) => {
                    return <Option key={data.donationName} value={data?.donationName} className="select-option" >{data?.donationName}</Option>
                })}
            </Select>
        </div>
    }

    const renderDonorType = () => {
        return <div className="mr-3 font-s16" >
            <Typography className="modalTitle-wrapper pb-2">Donor Type</Typography>
            <Select
                style={{ width: '100px' }}
                onChange={handleType}
                value={searchQuery.donorType}
                dropdownMatchSelectWidth={false}
                dropdownStyle={{ width: '250px' }} >
                <Option className="select-option" value={"All"}>All</Option>
                <Option className="select-option" value={"Individual"}>Individual</Option>
                <Option className="select-option" value={"Corporate"}>Corporate</Option>
            </Select>
        </div>
    }

    const renderSearch = () => {
        // return <div className="ml-1 mt-8" style={{ width: '100%' }}>
        return <div className="mb-3" style={{ width: '100%' }}>
            <CommonSearchBox
                placeholder="Search Donors Name"
                allowClear
                value={searchQuery.searchValue}
                onChange={onDonorSearch}
                prefix={<SearchOutlined />}
            />
        </div>
    }

return (
    <CommonModal
        open={showModal}
        className="donation-modal"
        title="Donor Details"
        onCancel={handleCancel}
        footer={null} width='80%'
    >
        <div style={{ minHeight: "50vh" }}>
            <CommonSpinner loading={loading}>
                <>
                    {/* <div className='donors-modal d-flex mb-4'>
                            <div className="mr-3 font-s16" >
                                <Typography className="modalTitle-wrapper pb-2">Total Amount</Typography>
                                <div className="modalTitle-wrapper modal-values d-flex align-center">
                                    {currencyFormatter(totalAmount)}
                                </div>
                            </div>
                            <div className="mr-3 font-s16" >
                                <Typography className="modalTitle-wrapper pb-2">Month</Typography>
                                <div className="modalTitle-wrapper modal-values d-flex align-center" >{categoryData?.monthAndYear}</div>
                            </div>
                            {categoryData.type === 'CHART' &&
                                renderSelect()
                            }
                            {(categoryData.type === 'SUB_TOTAL' || categoryData.type === 'TOTAL') &&
                                renderTableSelect()
                            }
                            {renderDonorType()}
                            {renderSearch()}
                        </div> */}
                </>
                <>
                    {/* <div className='donors-modal d-flex mb-4'>
                                <div className="mr-3 font-s16" >
                                    <Typography className="modalTitle-wrapper pb-2">Total Amount</Typography>
                                    <div className="modalTitle-wrapper modal-values d-flex align-center">
                                        {currencyFormatter(totalAmount)}
                                    </div>
                                </div>
                                <div className="mr-3 font-s16" >
                                    <Typography className="modalTitle-wrapper pb-2">Month</Typography>
                                    <div className="modalTitle-wrapper modal-values d-flex align-center" >{categoryData?.monthAndYear}</div>
                                </div>
                                {categoryData.type === 'CHART' &&
                                    renderSelect()
                                }
                                {(categoryData.type === 'SUB_TOTAL' || categoryData.type === 'TOTAL') &&
                                    renderTableSelect()
                                }
                                {renderDonorType()}
                                {renderSearch()}
                            </div> */}
                </>
                <div className="description-donationHeader">
                    <Row>
                        <Col className="mr-3 mb-2">
                            <Descriptions bordered>
                                <Descriptions.Item label="TOTAL AMOUNT">
                                        {currencyFormatter(totalAmount)}
                                </Descriptions.Item>
                            </Descriptions>
                        </Col>
                        <Col className="mr-3 mb-4">
                            <Descriptions bordered>
                                <Descriptions.Item label="MONTH">
                                        {categoryData?.monthAndYear}
                                </Descriptions.Item>
                            </Descriptions>
                        </Col>
                        {categoryData.type === 'CHART' &&
                            <Col className="mr-3 mb-4">
                                <Descriptions className="Donation-dropdown" bordered>
                                    <Descriptions.Item label="DONATION TYPE">
                                        <Select style={{ width: '250px' }} onChange={handleSelect} value={selectedCategory} showSearch dropdownMatchSelectWidth={false}
                                            dropdownStyle={{ width: '250px' }}>
                                            {categoryData?.dataSource?.map((data) => {
                                                return <Option key={data.id} value={data?.id} className="select-option" >{data?.id}</Option>
                                            })}
                                        </Select>
                                    </Descriptions.Item>
                                </Descriptions>
                            </Col>
                        }
                        {(categoryData.type === 'SUB_TOTAL' || categoryData.type === 'TOTAL') &&
                            <Col className="mr-3 mb-4">
                                <Descriptions className="Donation-dropdown" bordered>
                                    <Descriptions.Item label="DONATION TYPE">
                                        <Select
                                            style={{ maxWidth: '250px' }}
                                            onChange={handleTableSelect}
                                            value={selectedTableCategory === '' ? 'All' : selectedTableCategory}
                                            showSearch
                                            dropdownMatchSelectWidth={false}
                                            dropdownStyle={{ width: '250px' }}>
                                            {categorySelectData?.map((data) => {
                                                return <Option key={data.donationName} value={data?.donationName} className="select-option" >{data?.donationName}</Option>
                                            })}
                                        </Select>
                                    </Descriptions.Item>
                                </Descriptions>
                            </Col>
                        }
                        <Col className="mr-3 mb-3">
                            <Descriptions className="Donation-dropdown" bordered>
                                <Descriptions.Item label="DONOR TYPE">
                                    <Select
                                        style={{ width: '100px' }}
                                        onChange={handleType}
                                        value={searchQuery.donorType}
                                        dropdownMatchSelectWidth={false}
                                        dropdownStyle={{ width: '100px' }} >
                                        <Option className="select-option" value={"All"}>All</Option>
                                        <Option className="select-option" value={"Individual"}>Individual</Option>
                                        <Option className="select-option" value={"Corporate"}>Corporate</Option>
                                    </Select>
                                </Descriptions.Item>
                            </Descriptions>
                        </Col>
                    </Row>
                    <Row>
                        {renderSearch()}
                    </Row>
                </div>

                {!loading &&
                    <Table dataSource={selectedTableData} columns={DonorDetailsColumn}
                        pagination={{ defaultPageSize: 100, showSizeChanger: false }}
                        scroll={{ y: 'calc(50vh)' }}
                        size='small' className='CurrentMemberTable' />
                }
                <ViewInvoiceModal
                    showInvoiceModal={showInvoiceModal}
                    setShowInvoiceModal={setShowInvoiceModal}
                    reviewId={reviewId}
                    appDir={appDir}
                    options={options}
                />
            </CommonSpinner>
        </div >
    </CommonModal >
)
})

const DonationTab = (props) => {

    const { config } = useContext(GlobalContext)
    const { appDir, options, primaryColor } = config
    const { CategoryTypes } = props

    const { donationCategory, donationTypes, setSelectedDonationTypes } = useContext(GlobalContext)

    const chartRef = useRef()

    const [loading, setLoading] = useState(false)
    const [dataSource, setDataSource] = useState([])
    const [donationIdTypes, setDonationIdTypes] = useState([])
    const [dateRange, setDateRange] = useState([moment().subtract(6, 'month').startOf('month'), moment()])
    const [datePickerOpen, setIsDatePickerOpen] = useState('')
    const [categoryData, setCategoryData] = useState([])
    const [showModal, setShowModal] = useState(false)
    const [chartDataSource, setChartDataSource] = useState([])
    const [activeTab, setActiveTab] = useState("chart")
    const [tableDataSource, setTableDataSource] = useState([])
    const [totalDonation, setTotalDonation] = useState(0)
    const [detailedTableData, setDetailedTableData] = useState([])
    const [showInvoiceModal, setShowInvoiceModal] = useState(false)
    const [reviewId, setReviewId] = useState('')
    const [noDataFound, setNoDataFound] = useState(false)


    useEffect(() => {
        const APIIds = donationTypes.map((value) => {
            let ids = []
            CategoryTypes.map((type) => {
                if (value === type.donation_name) {
                    ids.push(type.donation_id)
                }
            })
            return ids
        }).flat(1)
        setDonationIdTypes(APIIds)

    }, [donationTypes, CategoryTypes])

    const getDonationData = async (start_date, end_date, donationIdTypes) => {
        try {
            setLoading(true)
            const result = await fetch(`${appDir}?module=donations&component=reports&function=see_donations&start_date=${start_date}&end_date=${end_date}&donationids=[${donationIdTypes}]&membership=true`, options)
            const values = await result.json();
            if (values.length) {
                setNoDataFound(false)
                setLoading(false)
                setDataSource(values)
            } else {
                setNoDataFound(true)
                setLoading(false)
                setDataSource([])
            }
        }
        catch (e) {
            setNoDataFound(true)
            setLoading(false)
            console.log("error", e);
        }
    }

    useEffect(() => {
        if (donationIdTypes?.length) {
            getDonationData(dateRange[0].format('MM-DD-YYYY'), dateRange[1].format('MM-DD-YYYY'), donationIdTypes)
        }
    }, [donationIdTypes])

    useEffect(() => {
        if (!datePickerOpen && donationIdTypes?.length) {
            getDonationData(dateRange[0].format('MM-DD-YYYY'), dateRange[1].format('MM-DD-YYYY'), donationIdTypes)
        }
    }, [donationIdTypes, datePickerOpen, dateRange])

    useEffect(() => {
        if (activeTab === 'summaryTable' && (dataSource.length && donationCategory.length)) {
            const ConstructedData = CompareTableData(dataSource, donationCategory)
            setTableDataSource(ConstructedData)
        }
    }, [dataSource, activeTab, donationCategory])

    useEffect(() => {
        let totalDonatedAmount = 0;
        dataSource.map((data) => {
            totalDonatedAmount += data.amount;
        })
        setTotalDonation(totalDonatedAmount);
        setDetailedTableData(ConstructedDonorData(dataSource, donationCategory))
    }, [dataSource, donationCategory])


    const handleDate = (dateStrings) => {
        setDateRange(dateStrings)
    }

    const handleOpenPop = (open) => {
        setIsDatePickerOpen(open)
    }

    const handleTabClick = (e) => {
        setActiveTab(e.target.value)
    }

    const donationType = [...new Set(tableDataSource.map((value) => value.donationId))].filter((value) => value !== 'Total')

    const columnHeader = [
        {
            title: <Tooltip title={"MONTH"}>MONTH</Tooltip>,
            dataIndex: 'monthName',
            key: 'monthName',
            width: 3,
            ellipsis: true,
            render: (_, data, index) => {
                const obj = {
                    children: <div>{getFullMonthName(data?.monthName)} {data?.yearOfInvoice}</div>,
                    props: {}
                }
                for (let i = 0; i <= tableDataSource.length; i++) {
                    if (index % donationType.length === 0) {
                        obj.props.rowSpan = donationType.length;
                    }
                    if (index % donationType.length !== 0) {
                        obj.props.rowSpan = 0;
                    }
                }
                return obj
            }
        },
        {
            title: <Tooltip title={"DONATION NAME"}>DONATION NAME</Tooltip>,
            colspan: 0,
            width: 11,
            dataIndex: 'donationName',
            ellipsis: true,
            render: (data) => {
                const obj = {
                    children: <div className="text-wrap">{data}</div>,
                    props: {}
                }
                return obj
            }
        },
        {
            title: <Tooltip title={"AMOUNT"}>AMOUNT</Tooltip>,
            colspan: 0,
            dataIndex: 'totalAmount',
            width: 2,
            ellipsis: true,
            render: (_, data) => {
                const obj = {
                    children: data?.totalAmount === 0 ?
                        <>{currencyFormatter(data?.totalAmount)}</> :
                        <div className="clickable-column custom-theme-color" onClick={() => handleTableClick(data, 'AMOUNT')}>
                            {currencyFormatter(data?.totalAmount)}
                        </div>,
                    props: {}
                }
                return obj
            }
        },
        {
            title: <Tooltip title={"SUB TOTAL"}>SUB TOTAL</Tooltip>,
            dataIndex: 'total_donation',
            key: 'total_donation',
            width: 2,
            ellipsis: true,
            hidden: donationType.length === 1,
            render: (_, data, index) => {
                const obj = {
                    children: <div className="clickable-column custom-theme-color" onClick={() => handleTableClick(data, 'SUB_TOTAL')} style={{ fontSize: '15px', position: 'absolute', bottom: '0px' }}>{currencyFormatter(data?.total_donation)}</div>,
                    props: {}
                }
                for (let i = 0; i <= tableDataSource.length; i++) {
                    if (index % donationType.length === 0) {
                        obj.props.rowSpan = donationType.length;
                    }
                    if (index % donationType.length !== 0) {
                        obj.props.rowSpan = 0;
                    }
                }
                return obj
            }
        }
    ].filter(col => !col.hidden)

    const DonorDetailsColumn = [
        {
            title: <Tooltip title={"DATE"}>DATE</Tooltip>,
            dataIndex: "Date",
            key: "Date",
            width: 4.5,
            ellipsis: true,
            className: "text-left",
            render: (_, data) => {
                return <div> {data?.date} </div>
            },
            sorter: sortByDate
        },
        {
            title: <Tooltip title={"NAME"}>NAME</Tooltip>,
            dataIndex: "donor",
            key: "donor",
            width: 9,
            ellipsis: true,
            className: "text-left",
            render: (_, data) => {
                const userName = Object.keys(data).includes("company_id") ? data?.company_name : `${data?.lastname}, ${data?.firstname}`
                return (
                    <div>
                        <Row style={{ flexWrap: "nowrap", alignItems: 'center' }}>
                            <Col>
                                <Avatar size={40} alt="profile" icon={<UserOutlined />} src={data?.picture} />
                            </Col>
                            <Col className="ml-3">
                                <div className="text-wrap"> {userName} </div>
                            </Col>
                        </Row>
                    </div>
                )
            },
            sorter: sortCommonName
        },
        {
            title: <Tooltip title={"DONOR TYPE"}>DONOR TYPE</Tooltip>,
            dataIndex: "Donor Type",
            key: "Donor Type",
            width: 4,
            ellipsis: true,
            className: "text-left",
            render: (_, data) => {
                return <div className="text-wrap"> {data?.donorType} </div>
            },
            sorter: sortDonorType
        },
        {
            title: <Tooltip title={"DONATION TYPE"}>DONATION TYPE</Tooltip>,
            dataIndex: "Donation Type",
            key: "Donation Type",
            width: 7,
            ellipsis: true,
            className: "text-left",
            render: (_, data) => {
                return <div className="text-wrap"> {data?.donationName} </div>
            },
        },
        {
            title: <Tooltip title={"AMOUNT"}>AMOUNT</Tooltip>,
            dataIndex: "amount",
            key: "amount",
            width: 3,
            ellipsis: true,
            render: (_, data) => {
                return <div> {currencyFormatter(data.amount)} </div>
            },
            sorter: sortByAmount
        },
        {
            title: <Tooltip title={"ORDER / PAY METHOD"}>ORDER / PAY METHOD</Tooltip>,
            dataIndex: "Payment Method",
            key: "Payment Method",
            width: 5,
            ellipsis: true,
            className: "text-left",
            render: (_, data) => {
                return <div>
                    <div className="text-wrap">
                        {data.order_number}
                    </div>
                    <div>
                        ({data?.pay_method})
                    </div>
                </div>
            },
        },
        {
            title: <Tooltip title={"VIEW / DOWNLOAD"}>VIEW / DOWNLOAD</Tooltip>,
            dataIndex: 'view',
            key: 'view',
            width: 4,
            ellipsis: true,
            className: 'text-left',
            render: (_, data) => {
                let reviewId = data?.donorType === 'Corporate' ? { compuuid: data?.company_uuid } : { otheruuid: data.contact_uuid };
                return <div className="text-center" >
                    <Tooltip title={'View Invoice'} >
                        <FileSearchOutlined style={{ fontSize: 20, cursor: 'pointer' }} className="mr-4" onClick={() => handleViewInvoice(reviewId)} />
                    </Tooltip>
                    <DownloadInvoice reviewId={reviewId} appDir={appDir} options={options} />
                </div>
            }
        }
    ]

    const handleViewInvoice = (id) => {
        setReviewId([id])
        setShowInvoiceModal(true)
    }

    const handleTableClick = (value, columnType) => {
        let date = value?.monthName;
        setShowModal(true)
        setCategoryData({
            DonationName: value?.donationName,
            TotalAmount: value?.totalAmount,
            startDate: moment(date, 'MM-YYYY').startOf('month').format('MM-DD-YYYY'),
            endDate: moment(date, 'MM-YYYY').endOf('month').format('MM-DD-YYYY'),
            monthAndYear: `${getFullMonthName(value?.monthName)} ${value?.yearOfInvoice}`,
            donationId: columnType === 'AMOUNT' ? value?.donationId : value?.donation_ids,
            CurrentdonationId: value?.donationId,
            dataSource: tableDataSource,
            type: columnType
        })
    }

    const handleTableTotalClick = (columnType) => {
        setShowModal(true)
        setCategoryData({
            startDate: dateRange[0],
            endDate: dateRange[1],
            TotalAmount: totalDonation,
            donationId: donationType,
            type: columnType,
            dataSource: tableDataSource,
            monthAndYear: `${moment(dateRange[0]).format('MMM-YYYY')} - ${moment(dateRange[1]).format('MMM-YYYY')}`
        })
    }

    const handleChartClick = (point) => {
        let date = point?.data?.monthAndYear;
        setShowModal(true)
        setCategoryData({
            DonationName: point?.id,
            TotalAmount: point?.data?.y,
            startDate: moment(date, 'MM-YYYY').startOf('month').format('MM-DD-YYYY'),
            endDate: moment(date, 'MM-YYYY').endOf('month').format('MM-DD-YYYY'),
            monthAndYear: `${point?.data?.x}`,
            donationId: point?.data?.donationId,
            dataSource: chartDataSource,
            type: 'CHART'
        })
    }

    const donationByCategoryHeaders = [
        { label: "MONTH", key: "MonthName" },
        { label: "DONATION NAME", key: "DonationName" },
        { label: "AMOUNT($)", key: "TotalAmount" }
    ]

    const detailedTableHeaders = [
        { label: 'DATE', key: 'date' },
        { label: 'DONOR TYPE', key: 'DonorType' },
        { label: 'ContactID', key: 'ContactID' },
        { label: 'CompID', key: 'CompID' },
        { label: 'NAME', key: 'Name' },
        { label: 'Email', key: 'Email' },
        { label: 'DONATION TYPE', key: 'DonationType' },
        { label: 'AMOUNT($)', key: 'Amount' },
        { label: 'OrderNumber', key: 'OrderNumber' },
        { label: 'Paymethod', key: 'Paymethod' }
    ]

    return (
        <div className="mh-100">
            <CommonSpinner loading={loading}>
                
                    <div className="pl-3 pr-3 pt-3 modal-height">
                        <MultiSelectWidget
                            CategoryTypes={CategoryTypes}
                        />
                        <Row className="mt-3" align={'middle'}>
                            <Col className="side-menu-title">WITHIN :</Col>
                            <Col className="dataPicker-suffix">
                                <RangePicker
                                    className='date-picker ml-3'
                                    value={dateRange}
                                    format='MM/DD/YYYY'
                                    onChange={handleDate}
                                    onOpenChange={handleOpenPop}
                                    clearIcon={false}
                                    disabledDate={disabledDate}
                                />
                            </Col>
                            <Col className="ml-3 side-menu-title" >TOTAL DONATION : </Col>
                            {totalDonation !== '' && dataSource.length ?
                                <>
                                    <Col className="menuValues custom-theme-color ml-1 mr-1" >{currencyFormatter(totalDonation)}</Col>
                                    <Col flex={1} style={{ fontSize: '15px', fontWeight: 'bold' }} >- {dataSource.length} units</Col>
                                </>
                                :
                                <Col className="ml-2" flex={1}>
                                    Loading...
                                </Col>
                            }
                            <Col className="donation-radioGroups pr-3" >
                                <Radio.Group value={activeTab} onChange={handleTabClick}>
                                    <Radio.Button value='chart'>
                                        <LineChartOutlined className="pr-1" />Chart
                                    </Radio.Button>
                                    <Radio.Button value='summaryTable'>
                                        <TableOutlined className="pr-1" />Summary Table
                                    </Radio.Button>
                                    <Radio.Button value='detailedTable'>
                                        <TableOutlined className="pr-1" />Detailed Table
                                    </Radio.Button>
                                </Radio.Group>
                            </Col>
                            {dataSource?.length ?
                                <>
                                    {activeTab === 'chart' && <Col className="stay-right donation-downloadBtn">
                                        <DownloadChart chartRef={chartRef} fileName={{ name: "Donation Category" }} />
                                    </Col>}
                                </> : <></>
                            }
                            {tableDataSource?.length ?
                                <>
                                    {activeTab === 'summaryTable' && <Col className="stay-right donation-downloadBtn">
                                        <CustomExportCsv
                                            dataSource={tableDataSource.map(data => {
                                                return {
                                                    MonthName: ` ${getFullMonthName(data.monthName)} ${data.yearOfInvoice}`,
                                                    DonationName: data.donationName,
                                                    TotalAmount: data.totalAmount,
                                                }
                                            })}
                                            Headers={donationByCategoryHeaders}
                                            exportFileName={`donation-details-${dateRange[0].format('MM-DD-YYYY')}-to-${dateRange[1].format('MM-DD-YYYY')}`}
                                        />
                                    </Col>}
                                </> : <></>
                            }
                            {detailedTableData?.length ?
                                <>
                                    {activeTab === 'detailedTable' && <Col className="donation-downloadBtn">
                                        <CustomExportCsv
                                            dataSource={detailedTableData.map((data) => {
                                                return {
                                                    Date: data.date,
                                                    DonorType: data.donorType,
                                                    ContactId: data.contact_pretty_id ? data.contact_pretty_id : '-',
                                                    CompID: data.company_pretty_id ? data.company_pretty_id : '-',
                                                    Name: Object.keys(data).includes("company_id") ? data?.company_name : `${data?.lastname}, ${data?.firstname}`,
                                                    Email: data.email ?? "-",
                                                    DonationType: data.donationName,
                                                    Amount: data.amount,
                                                    OrderNumber: data.order_number,
                                                    Paymethod: data?.pay_method
                                                }
                                            })}
                                            Header={detailedTableHeaders}
                                            exportFileName={`donation-details-${dateRange[0].format('MM-DD-YYYY')}-to-${dateRange[1].format('MM-DD-YYYY')}`}
                                        />
                                    </Col>}
                                </> : <></>
                            }
                        </Row>
                        {!loading && <>
                        {activeTab === 'chart' && <div>
                            {dataSource.length ?
                                <TotalDonationTypesLineChart dataSource={dataSource} donationTypes={CategoryTypes} handleChartClick={handleChartClick} setChartDataSource={setChartDataSource} chartRef={chartRef} primaryColor={primaryColor} /> :
                                <>
                                    {noDataFound && <NoDataFound />}
                                </>
                            }
                        </div>}
                        {activeTab === 'summaryTable' && <div className="pt-6 donation-table">
                            {tableDataSource.length ?
                                <Table
                                    dataSource={tableDataSource}
                                    columns={columnHeader}
                                    pagination={false}
                                    scroll={{ y: 550 }}
                                    className='compareSalesTable pb-3'
                                    bordered={true}
                                    size='small'
                                    summary={() => (
                                        <Table.Summary>
                                            <Table.Summary.Row>
                                                <Table.Summary.Cell index={0}
                                                    colSpan={donationType.length === 1 ? 2 : 3}
                                                ><div style={{ textAlign: 'right', fontStyle: 'italic', fontSize: '15px' }}>Total Donation Amount</div></Table.Summary.Cell>
                                                <Table.Summary.Cell index={3}>
                                                    <div onClick={() => handleTableTotalClick('TOTAL')} className="custom-theme-color" style={{ cursor: 'pointer', fontSize: '16px' }}>{currencyFormatter(totalDonation)}</div>
                                                </Table.Summary.Cell>
                                            </Table.Summary.Row>
                                        </Table.Summary>
                                    )}
                                /> :
                                <>
                                    {noDataFound && <NoDataFound />}
                                </>
                            }
                        </div>}
                        {activeTab === 'detailedTable' && <div className="pt-6">
                            {DonorDetailsColumn.length ?
                                <Table
                                    showSorterTooltip={false}
                                    dataSource={detailedTableData}
                                    columns={DonorDetailsColumn}
                                    pagination={{ defaultPageSize: 100, showSizeChanger: false }}
                                    scroll={{ y: 'calc(90vh)' }}
                                    className='pb-3'
                                    bordered={true}
                                    size='small'
                                /> : <>
                                    {noDataFound && <NoDataFound />}
                                </>
                            }
                        </div>}
                        </>}
                        <RenderMembersModal
                            showModal={showModal}
                            setShowModal={setShowModal}
                            appDir={appDir}
                            options={options}
                            categoryData={categoryData}
                            donationCategory={donationCategory}
                        />
                        <ViewInvoiceModal
                            showInvoiceModal={showInvoiceModal}
                            setShowInvoiceModal={setShowInvoiceModal}
                            reviewId={reviewId}
                            appDir={appDir}
                            options={options}
                            type={'donation_tab'}
                        />
                    </div>
            </CommonSpinner>
        </div>
    )
}

export default DonationTab;