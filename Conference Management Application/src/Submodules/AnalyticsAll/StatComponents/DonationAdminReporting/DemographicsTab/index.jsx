import React, { memo, useContext, useEffect, useState } from "react";
import { Avatar, Col, DatePicker, Divider, Row, Table, Typography, Tooltip } from "antd";
import moment from "moment";
import CommonPieChart from "./CommonPieChart";
import CommonSpinner from "../common/CommonSpinner";
import MultiSelectWidget from "../common/MultiSelectWidget";
import { convertLowercaseFormat, currencyFormatter } from "../../util";
import { FileSearchOutlined, SearchOutlined, UserOutlined } from "@ant-design/icons";
import GlobalContext from "../context/DonationContext";
import ViewInvoiceModal from "../DonationTab/ViewInvoiceModal";
import { disabledDate } from "../helper";
import CommonModal from "../common/CommonModal";
import CommonSearchBox from "../common/CommonSearchBox";


const { RangePicker } = DatePicker;

const RenderDonorsModal = memo(({
    appDir,
    options,
    showModal,
    setShowModal,
    tableClickData,
    donationCategory
}) => {

    const [dataSource, setDataSource] = useState([])
    const [donationData, setDonationData] = useState([])
    const [showInvoiceModal, setShowInvoiceModal] = useState(false)
    const [reviewId, setReviewId] = useState('')
    const [searchQuery, setSearchQuery] = useState('')
    const [constructedDataSource, setConstructedDataSource] = useState([])

    const handleCancel = () => {
        setShowModal(false)
    }

    useEffect(() => {
        setDataSource(tableClickData?.data)
        setDonationData(modalTableData(tableClickData, donationCategory))
        setConstructedDataSource(modalTableData(tableClickData, donationCategory))
    }, [tableClickData, donationCategory])

    const modalTableData = (tableClickData) => {
        const dataSource = tableClickData?.data?.map((data) => {
            let donationName = ''
            let donorFullName = Object.keys(data).includes('company_name') ? `${data?.company_name}` : `${data?.lastname}, ${data?.firstname} `
            donationCategory?.map((type) => {
                if (data?.donation_id === type?.donation_id) {
                    donationName = type?.donation_name
                }
            })
            return {
                ...data,
                donationName: donationName,
                fullName: donorFullName
            }
        })
        return dataSource
    }

    const handleViewInvoice = (id) => {
        setReviewId([id])
        setShowInvoiceModal(true)
    }

    const columnHeader = [
        {
            title: <Tooltip title="NAME">NAME</Tooltip>,
            key: 'name',
            dataIndex: 'name',
            width: 5,
            render: (_, data) => {
                const fullName = `${data?.firstname} ${data?.lastname}`
                return (
                    <div>
                        <Row style={{ flexWrap: "nowrap", alignItems: 'center' }}>
                            <Col>
                                <Avatar size={40} alt="profile" icon={<UserOutlined />} src={data?.picture} />
                            </Col>
                            <Col className="ml-3">
                                <div>{data?.fullName}</div>
                            </Col>
                        </Row>
                    </div>
                )
            }
        },
        {
            title: <Tooltip title="DONATION NAME">DONATION NAME</Tooltip>,
            key: 'donationName',
            dataIndex: 'donationName',
            width: 7,
            render: (_, data) => {
                return (
                    <div>{data?.donationName}</div>
                )
            }
        },
        {
            title: <Tooltip title="COUNTRY">COUNTRY</Tooltip>,
            key: 'country',
            dataIndex: 'country',
            ellipsis: true,
            width: 3,
            render: (_, data) => {
                return (
                    <div className="text-wrap">{data?.country}</div>
                )
            }
        },
        {
            title: <Tooltip title="AMOUNT">AMOUNT</Tooltip>,
            key: 'amount',
            dataIndex: 'amount',
            ellipsis: true,
            width: 2,
            render: (_, data) => {
                return (
                    <div>{currencyFormatter(data?.amount)}</div>
                )
            }
        },
        {
            title: <Tooltip title="VIEW INVOICE">VIEW INVOICE</Tooltip>,
            key: 'view',
            dataIndex: 'view',
            width: 2,
            ellipsis: true,
            render: (_, data) => {
                return (
                    <div>
                        <Tooltip title={'View Invoice'} >
                            <FileSearchOutlined style={{ fontSize: 20, cursor: 'pointer' }} className="mr-4" onClick={() => handleViewInvoice(Object.keys(data).includes('company_uuid') ? { compuuid: data?.company_uuid } : { otheruuid: data.contact_uuid })} />
                        </Tooltip>
                    </div>
                )
            }
        }
    ]

    const handleSearch = searchValue => {
        searchValue = searchValue.target.value;
        let searchResult = []
        if (searchValue) {
            searchResult = constructedDataSource.filter((donor) => { return convertLowercaseFormat(`${donor.fullName}`).includes(convertLowercaseFormat(searchValue)) })
        } else {
            searchResult = constructedDataSource;
        }
        setDonationData(searchResult)
        setSearchQuery(searchValue)
    }


    const renderSearch = () => {
        return (
            <div className="font-s16 ml-4  mt-8" style={{ width: "100%" }}>
                <CommonSearchBox
                    placeholder="Search Donors Name"
                    className=""
                    allowClear
                    value={searchQuery}
                    onChange={handleSearch}
                    prefix={<SearchOutlined />}
                />
            </div>
        )
    }


    return (
        <div>
            <CommonModal open={showModal}
                className="donation-modal"
                onCancel={handleCancel} title='DONOR DETAILS' footer={null} width='80%' >
                <div className='d-flex'>
                    <div className="ml-4" style={{ fontSize: "16px" }}>
                        <Typography className="modalTitle-wrapper pb-2">Type</Typography>
                        <div className="modalTitle-wrapper d-flex align-center" style={{ fontWeight: 'bold', height: '35px' }}>{tableClickData?.id}</div>
                    </div>
                    <div className="ml-4" style={{ fontSize: "16px" }}>
                        <Typography className="modalTitle-wrapper pb-2">Total Amount</Typography>
                        <div className="modalTitle-wrapper align-center d-flex align-center" style={{ fontWeight: 'bold', height: '35px' }}>{currencyFormatter(tableClickData?.value)}</div>
                    </div>
                    {renderSearch()}
                </div>
                <div className="mt-4">
                    <Table dataSource={donationData} columns={columnHeader}
                        pagination={{ defaultPageSize: 100, showSizeChanger: false }}
                        scroll={{ y: 'calc(50vh)' }}
                        size='small' className='CurrentMemberTable'
                        loading={donationData?.length ? false : true} />
                </div>
                <ViewInvoiceModal
                    showInvoiceModal={showInvoiceModal}
                    setShowInvoiceModal={setShowInvoiceModal}
                    reviewId={reviewId}
                    appDir={appDir}
                    options={options}
                />
            </CommonModal>
        </div >
    )
})

const Demographics = (props) => {
    const { donationCategory, donationTypes, config } = useContext(GlobalContext)
    const { appDir, options, primaryColor } = config
    const { CategoryTypes } = props;
    const [categoryId, setCategoryId] = useState([])
    const [donorDataList, setDonorDataList] = useState([])
    const [loading, setLoading] = useState(false)
    const [dateRange, setDateRange] = useState([moment().subtract(6, 'months').startOf('month'), moment()])
    const [showModal, setShowModal] = useState(false)
    const [tableClickData, setTableClickData] = useState('')
    const [isDatePickerOpen, setIsDatePickerOpen] = useState('')

    useEffect(() => {
        if (CategoryTypes?.length) {
            const APIIds = donationTypes.map((value) => {
                let ids = []
                CategoryTypes.map((type) => {
                    if (value === type.donation_name) {
                        ids.push(type.donation_id)
                    }
                })
                return ids
            }).flat(1)
            setCategoryId(APIIds)
        }
    }, [CategoryTypes, donationTypes])

    useEffect(() => {
        if (categoryId?.length) {
            getDonorDetails(categoryId, dateRange[0].format('MM-DD-YYYY'), dateRange[1].format('MM-DD-YYYY'))
        }
    }, [categoryId])

    useEffect(() => {
        if (!isDatePickerOpen && categoryId?.length) {
            getDonorDetails(categoryId, dateRange[0].format('MM-DD-YYYY'), dateRange[1].format('MM-DD-YYYY'))
        }
    }, [dateRange, isDatePickerOpen, categoryId])

    const getDonorDetails = async (categoryId, start_date, end_date) => {
        try {
            setLoading(true)
            const response = await fetch(`${appDir}?module=donations&component=reports&function=see_donations&start_date=${start_date}&end_date=${end_date}&donationids=[${categoryId}]&membership=true`, options)
            const result = await response.json()
            if (result?.length || response?.status == 200) {
                setDonorDataList(result?.length? result : [])
                setLoading(false)
            } else {
                setDonorDataList([])
                setLoading(false)
            }
        }
        catch (e) {
            setLoading(false)
            console.log("error", e);
        }
    }

    const handleDate = (dateStrings) => {
        setDateRange(dateStrings)
    }

    const handleOpenPop = (open) => {
        setIsDatePickerOpen(open)
    }

    return (
        <div className="mh-100">
            <CommonSpinner loading={loading}>

                <div className="pl-3 pr-3 pt-3">
                    <MultiSelectWidget
                        CategoryTypes={CategoryTypes}
                    />
                    <Row className="mt-4" align={'middle'}>
                        <Col>WITHIN :</Col>
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
                    </Row>
                    {!loading && <>
                        <div style={{ backgroundColor: 'white' }} className="divider-align bg-color mt-3">
                            <Divider orientation="left" plain>
                                <span className="demographics-title custom-theme-color">Donations by Entity Type</span>
                            </Divider>
                            <div className="w-100">
                                <CommonPieChart dataSource={donorDataList} type={'type'} columnTitle={'ENTITY TYPE'} setShowModal={setShowModal} setTableClickData={setTableClickData} primaryColor={primaryColor} loading={loading} />
                            </div>
                        </div>
                        <div className="divider-align bg-color">
                            <Divider orientation="left" plain>
                                <span className="demographics-title custom-theme-color">Donations by Country</span>
                            </Divider>
                            <div className="w-100" >
                                <CommonPieChart dataSource={donorDataList} type={'country'} columnTitle={'COUNTRY'} setShowModal={setShowModal} setTableClickData={setTableClickData} primaryColor={primaryColor} loading={loading} />
                            </div>
                        </div>
                        <div className="divider-align bg-color">
                            <Divider orientation="left" plain>
                                <span className="demographics-title custom-theme-color">Donations by Membership Category</span>
                            </Divider>
                            <div className="w-100">
                                <CommonPieChart dataSource={donorDataList} type={'membershipType'} columnTitle={'MEMBERSHIP CATEGORY'} setShowModal={setShowModal} setTableClickData={setTableClickData} primaryColor={primaryColor} loading={loading} />
                            </div>
                        </div>
                    </>}
                    {showModal && <RenderDonorsModal
                        appDir={appDir}
                        options={options}
                        showModal={showModal}
                        setShowModal={setShowModal}
                        tableClickData={tableClickData}
                        donationCategory={donationCategory}
                    />}
                </div>
            </CommonSpinner>
        </div>
    )
}
export default Demographics;