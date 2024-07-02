import React, { useContext, useEffect, useState } from "react";
import { Avatar, Col, ConfigProvider, DatePicker, Dropdown, Empty, Row, Select, Table, Tooltip, Typography } from "antd";
import CommonSpinner from "../common/CommonSpinner";
import { MailOutlined, SearchOutlined, UserOutlined } from "@ant-design/icons";
import { convertLowercaseFormat, currencyFormatter, sortCommonName, sortDonorType } from "../../util";
import { ReactComponent as Information } from '../../../NativeDashboards/DonationAdminDirectory/assets/icons/Information.svg';
import DonorModal from "./DonorModal";
import GlobalContext from "../context/DonationContext";
import MultiSelectWidget from "../common/MultiSelectWidget";
import moment from "moment";
import _map from 'lodash/map';
import { disabledDate } from "../helper";
import CommonSearchBox from "../common/CommonSearchBox";

const { RangePicker } = DatePicker;

const { Option } = Select;

const DonorsTab = (props) => {

    const [donorsDataList, setDonorsDataList] = useState([])
    const [dataSource, setDataSource] = useState([])
    const [tableData, setTableData] = useState([])
    const [loading, setLoading] = useState(false)
    const [showModal, setShowModal] = useState(false)
    const [donationIdTypes, setDonationIdTypes] = useState([])
    const [dateRange, setDateRange] = useState([
        // moment().subtract(6, 'month').startOf('month'), moment()
    ])
    const [datePickerOpen, setIsDatePickerOpen] = useState('')
    const [uuid, setUuid] = useState("")
    const [searchValue, setSearchValue] = useState("")
    const [donorType, setDonorType] = useState("All")
    const [filter, setFilter] = useState({
        searchValue: '',
        donorType: ''
    })
    const [totalAmount, setTotalAmount] = useState(0)
    const [withinValue, setWithinValue] = useState('LifeTime')


    const { config } = useContext(GlobalContext)
    const { appDir, options } = config
    const { CategoryTypes } = props;

    const { donationCategory, donationTypes, setSelectedDonationTypes } = useContext(GlobalContext)

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

    const getDonorsData = async (donationIdTypes, start_date, end_date) => {
        try {
            setLoading(true)
            const dateFilter = start_date && end_date ? `&start_date=${start_date}&end_date=${end_date}` : ""
            const response = await fetch(`${appDir}?module=donations&component=reports&function=see_distinct_donors${dateFilter}&donationids=[${donationIdTypes}]`, options)
            const result = await response.json()
            if (result.length || response?.status == 200) {
                setDataSource(result?.length ? result : [])
                setLoading(false)
            } else {
                setDataSource([])
                setLoading(false)
            }
        }
        catch (e) {
            console.log("error", e);
        }
    }

    const constructedDonorDetails = () => {
        const constructedData = donorsDataList.map((donor) => {
            let donationName = ''
            donationCategory.map((type) => {
                if (donor?.donation_id === type.donation_id) {
                    donationName = type.donation_name
                }
            })
            return {
                ...donor,
                donation_name: donationName
            }
        })
        return constructedData
    }

    const constructedDonorsData = (dataSource) => {
        const constructedData = dataSource.map((data) => {
            let donorName = Object.keys(data).includes("company_id") ? data?.company_name : `${data?.firstname} ${data?.lastname}`;
            let donorType = Object.keys(data).includes("company_id") ? "Corporate" : "Individual";

            return {
                ...data,
                donorName: donorName,
                donorType: donorType
            }
        })
        return constructedData
    }

    useEffect(() => {
        if (dataSource.length && donationCategory.length) {
            setDonorsDataList(constructedDonorsData(dataSource))
            setTableData(constructedDonorsData(dataSource))
        }
    }, [dataSource, donationCategory])


    const handleDonorModal = (uuid) => {
        setUuid([uuid])
        setShowModal(true)
    }

    const filteredData = () => {
        let filteredResult = []
        let tempData = filteredResult.length > 0 ? filteredResult : tableData
        if (filter.searchValue) {
            if (filter.donorType === 'Individual' || filter.donorType === 'Corporate') {
                filteredResult = tempData?.filter((mem) => { return convertLowercaseFormat(`${mem.donorName}`).includes(convertLowercaseFormat(filter.searchValue)) && mem.donorType === filter.donorType })
            } else {
                filteredResult = tempData?.filter((mem) => { return convertLowercaseFormat(`${mem.donorName}`).includes(convertLowercaseFormat(filter.searchValue)) })
            }
        } else if (filter.donorType) {
            if (filter.donorType === 'Individual') {
                filteredResult = tableData?.filter((value) => { return value.donorType === "Individual" })
            }
            if (filter.donorType === 'Corporate') {
                filteredResult = tableData?.filter((value) => { return value.donorType === "Corporate" })
            }
            if (filter.donorType === "All") {
                filteredResult = tableData
            }
        }
        else {
            filteredResult = tableData
        }
        setDonorsDataList(filteredResult)
    }

    useEffect(() => {
        filteredData()
    }, [tableData, filter])

    const handleDate = (dateStrings) => {
        setDateRange(dateStrings)
    }

    const handleOpenPop = (open) => {
        setIsDatePickerOpen(open)
    }

    const onMemberSearch = searchValue => {
        searchValue = searchValue.target.value;
        setFilter((prev) => ({
            ...prev,
            searchValue: searchValue
        }))
        setSearchValue(searchValue)
    };

    const totalDonationAmount = (donorsDataList) => {
        let totalAmount = 0;
        donorsDataList.forEach((data) => {
            totalAmount += data.amount;
        })
        return totalAmount;
    }

    useEffect(() => {
        if (donorsDataList.length) {
            setTotalAmount(totalDonationAmount(donorsDataList))
        }
    }, [donorsDataList])

    useEffect(() => {
        if (donationIdTypes?.length && withinValue !== 'CustomSelection') {
            if (dateRange?.length > 0 && withinValue === 'LifeTime') {
                getDonorsData(donationIdTypes, "", "")
            } else {
                getDonorsData(donationIdTypes, dateRange[0]?.format('MM-DD-YYYY'), dateRange[1]?.format('MM-DD-YYYY'))
            }
        }
    }, [donationIdTypes, dateRange, withinValue])

    useEffect(() => {
        if (!datePickerOpen && donationIdTypes.length && dateRange.length && withinValue === 'CustomSelection') {
            getDonorsData(donationIdTypes, dateRange[0].format('MM-DD-YYYY'), dateRange[1].format('MM-DD-YYYY'))
        }
    }, [donationIdTypes, datePickerOpen, dateRange, withinValue])

    const handleType = (e) => {
        setFilter((prev) => ({
            ...prev,
            donorType: e
        }))
        setDonorType(e)
    }

    const handleDonationRadio = (e) => {
        const value = e
        if (value === 'LifeTime') {
            setDateRange([''])
        } else {
            setDateRange([moment().subtract(6, 'month').startOf('month'), moment()])
        }
        setWithinValue(e)
    }

    const columnHeader = [
        {
            title: <Tooltip title='NAME'>NAME</Tooltip>,
            dataIndex: "donor",
            key: "donor",
            width: 8,
            className: "text-left",
            render: (_, data) => {
                const userName = Object.keys(data).includes("company_id") ? data?.company_name : `${data?.lastname}, ${data?.firstname}`
                return (
                    <div style={{ cursor: 'pointer' }} onClick={() => handleDonorModal(Object.keys(data).includes("company_uuid") ? { compuuid: data?.company_uuid } : { otheruuid: data.contact_uuid })}>
                        <Row style={{ flexWrap: "nowrap", alignItems: 'center' }}>
                            <Col>
                                <Avatar size={40} alt="profile" icon={<UserOutlined />} src={data?.picture} />
                            </Col>
                            <Col className="ml-3">
                                <div> {userName} </div>
                            </Col>
                        </Row>
                    </div>
                )
            },
            sorter: sortCommonName
        },
        {
            title: <Tooltip title='EMAIL'>EMAIL</Tooltip>,
            dataIndex: "Email",
            key: "Email",
            width: 8,
            className: "text-left",
            render: (_, data) => {
                return <div> {data?.donorType === "Individual" && data?.email ? data.email : '-'} </div>
            }
        },
        {
            title: <Tooltip title='DONOR TYPE'>DONOR TYPE</Tooltip>,
            dataIndex: "Donor Type",
            key: "Donor Type",
            width: 3,
            ellipsis: true,
            className: "text-left",
            render: (_, data) => {
                return <div> {data?.donorType} </div>
            },
            sorter: sortDonorType
        },
        {
            title: <Tooltip title='TOTAL DONATIONS'>TOTAL DONATIONS</Tooltip>,
            dataIndex: "total_amount",
            key: "total_amount",
            ellipsis: true,
            width: 3,
            render: (_, data) => {
                return <div> {currencyFormatter(data?.total_amount)} </div>
            },
            sorter: (a, b) => a.total_amount - b.total_amount
        },
        {
            title: <Tooltip title='TOTAL UNITS'>TOTAL UNITS</Tooltip>,
            dataIndex: 'total_donations',
            key: "total_donations",
            width: 2,
            ellipsis: true,
            render: (_, data) => {
                return <div> {data?.total_donations} </div>
            },
            sorter: (a, b) => a.total_donations - b.total_donations
        },
    ]

    const handleSendEmail = () => {
        const filteredDonors = donorsDataList.filter((donor) => donor?.donorType === 'Individual' && donor.email !== '')
        let reviewIds = _map(filteredDonors, "reviewid").join();
        window.parent.postMessage(
            { reviewIds, type: "Email" },
            "*"
        );
    }


    return (
        <div className="mh-100">
            <CommonSpinner loading={loading}>

                <div className="donor-image pt-3 pr-3 pl-3">
                    <MultiSelectWidget CategoryTypes={CategoryTypes} />
                    <>
                        {/* <div className='donors-modal mt-4 d-flex '>
                                <div className="mr-3 align-center d-flex" >
                                    <Typography className="modalTitle-wrapper pr-2">DONOR TYPE :</Typography>
                                    <div className="modal-values d-flex align-center" >
                                        <Select style={{ width: '130px' }} onChange={handleType} value={donorType} dropdownMatchSelectWidth={false} dropdownStyle={{ width: '150px' }} >
                                            <Option className="select-option" value={"All"}>All</Option>
                                            <Option className="select-option" value={"Individual"}>Individual</Option>
                                            <Option className="select-option" value={"Corporate"}>Corporate</Option>
                                        </Select>
                                    </div>
                                </div>
                                <div className="d-flex donationDonor-searchbox align-center" style={{ width: '100%' }}>
                                    <Input
                                        placeholder="Search Donors Name"
                                        allowClear
                                        value={searchValue}
                                        onChange={onMemberSearch}
                                        prefix={<SearchOutlined />}
                                    >
                                    </Input>
                                </div>
                            </div>
                            <Row align={"middle"} className="mt-3">
                                <Col flex={1}>
                                    <div className="mr-3 d-flex align-center" >
                                        <Typography className="modalTitle-wrapper pr-2">DONATED WITHIN :</Typography>
                                        <div>
                                            <Select className="mr-4" style={{ width: '150px' }} onChange={handleDonationRadio} value={withinValue} dropdownMatchSelectWidth={false} dropdownStyle={{ width: '150px' }} >
                                                <Option className="select-option" value={"LifeTime"}>Life Time</Option>
                                                <Option className="select-option" value={"Last6Months"}>Last 6 Months</Option>
                                                <Option className="select-option" value={"CustomSelection"}>Custom Selection</Option>
                                            </Select>
                                        </div>
                                        {withinValue === 'CustomSelection' ? <div className="dataPicker-suffix-donor">
                                            <RangePicker
                                                style={{ alignItems: "center" }}
                                                className='date-picker'
                                                value={dateRange}
                                                format='MM/DD/YYYY'
                                                onChange={handleDate}
                                                autoFocus={true}
                                                onOpenChange={handleOpenPop}
                                                clearIcon={false}
                                                disabledDate={disabledDate}
                                            />
                                        </div> : null}
                                    </div>
                                </Col>
                                <Col>
                                    <Tooltip placement="right" title={'Click to send emails to the visible donors below.'}>
                                        <Information style={{ width: "0.9rem" }} />
                                    </Tooltip>
                                </Col>
                                <Col className="ml-2">
                                    <Button icon={<MailOutlined />} onClick={handleSendEmail} >
                                        Send Email
                                    </Button>
                                </Col>
                            </Row> */}
                    </>
                    <div className="d-flex donors-header align-center ">
                        <div className="mr-3 d-flex align-center donor-rowHeader mt-3" style={{ width: "60%" }}>
                            <div className="d-flex align-center mr-2">
                                <Typography className="modalTitle-wrapper pr-2">DONATED WITHIN :</Typography>
                                <Select style={{ width: '150px' }} onChange={handleDonationRadio} value={withinValue} dropdownMatchSelectWidth={false} dropdownStyle={{ width: '150px' }} >
                                    <Option className="select-option" value={"LifeTime"}>Life Time</Option>
                                    <Option className="select-option" value={"Last6Months"}>Last 6 Months</Option>
                                    <Option className="select-option" value={"CustomSelection"}>Custom Selection</Option>
                                </Select>
                                {withinValue === 'CustomSelection' ? <div className="dataPicker-suffix-donor ml-3">
                                    <RangePicker
                                        style={{ alignItems: "center" }}
                                        className='date-picker'
                                        value={dateRange}
                                        format='MM/DD/YYYY'
                                        onChange={handleDate}
                                        autoFocus={true}
                                        onOpenChange={handleOpenPop}
                                        clearIcon={false}
                                        disabledDate={disabledDate}
                                    />
                                </div> : null}
                            </div>
                            <div className="align-center d-flex" style={
                                { marginLeft: "auto", marginRight: 0 }} >
                                <Typography className="modalTitle-wrapper pr-2">DONOR TYPE :</Typography>
                                <div className="modal-values d-flex align-center" >
                                    <Select style={{ width: '110px' }} onChange={handleType} value={donorType} dropdownMatchSelectWidth={false} dropdownStyle={{ width: '150px' }} >
                                        <Option className="select-option" value={"All"}>All</Option>
                                        <Option className="select-option" value={"Individual"}>Individual</Option>
                                        <Option className="select-option" value={"Corporate"}>Corporate</Option>
                                    </Select>
                                </div>
                            </div>
                        </div>

                        <div className="d-flex align-center donor-rowHeader mt-3" style={{ width: "40%" }}>
                            <>
                                {/* <div className="mr-3 align-center d-flex" >
                                        <Typography className="modalTitle-wrapper pr-2">DONOR TYPE :</Typography>
                                        <div className="modal-values d-flex align-center" >
                                            <Select style={{ width: '130px' }} onChange={handleType} value={donorType} dropdownMatchSelectWidth={false} dropdownStyle={{ width: '150px' }} >
                                                <Option className="select-option" value={"All"}>All</Option>
                                                <Option className="select-option" value={"Individual"}>Individual</Option>
                                                <Option className="select-option" value={"Corporate"}>Corporate</Option>
                                            </Select>
                                        </div>
                                    </div> */}
                            </>


                            <div className="align-center mr-3" style={{ marginRight: "auto", marginLeft: 0 }}>
                                <>
                                    {/* <Dropdown.Button
                                            icon={
                                                <Tooltip placement="top" title={"Click to send emails to the visible donors below."}>
                                                    <Information style={{ width: "0.9rem" }} />
                                                </Tooltip>
                                            }
                                            open={false}
                                            onClick={handleSendEmail}
                                        >
                                            <MailOutlined />
                                            Send Email
                                        </Dropdown.Button> */}
                                </>
                                <Dropdown.Button
                                    buttonsRender={([leftButton, rightButton]) => [
                                        React.cloneElement(leftButton),
                                        React.cloneElement(
                                            <Tooltip placement="top" title={"Click to send emails to the visible donors below."}>
                                                {rightButton}
                                            </Tooltip>
                                        ),
                                    ]}
                                    icon={<Information style={{ width: "0.9rem" }} />}
                                    open={false}
                                    onClick={handleSendEmail}
                                >
                                    <MailOutlined />
                                    Send Email
                                </Dropdown.Button>
                            </div>
                            <div className="d-flex donationDonor-searchbox align-center" style={{ width: '100%' }}>
                                <CommonSearchBox
                                    placeholder="Search Donors Name"
                                    allowClear
                                    value={searchValue}
                                    onChange={onMemberSearch}
                                    prefix={<SearchOutlined />}
                                />
                            </div>
                        </div>
                    </div>
                    {!loading && <>
                        {donorsDataList?.length ? <Table
                            dataSource={donorsDataList}
                            showSorterTooltip={false}
                            columns={columnHeader}
                            pagination={{
                                defaultPageSize: 100,
                                showSizeChanger: false,
                                //  pageSizeOptions: ['100', '200', '300']
                            }}
                            className='py-4 CurrentMemberTable'
                            scroll={{ y: 'calc(70vh)' }}
                            size='small'
                            bordered
                        /> : <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} className='py-10' />}
                    </>}
                    <DonorModal
                        appDir={appDir}
                        options={options}
                        showModal={showModal}
                        setShowModal={setShowModal}
                        donorId={uuid}
                        donationCategory={donationCategory}
                    />
                </div>

            </CommonSpinner>
        </div>
    )
}

export default DonorsTab