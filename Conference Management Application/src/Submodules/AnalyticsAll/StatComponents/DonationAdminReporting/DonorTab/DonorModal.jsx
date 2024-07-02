import React, { useEffect, useState } from "react";
import { Avatar, Badge, Button, Card, Col, Descriptions, Divider, Row, Statistic, Table, Tooltip } from "antd";
import { ArrowLeftOutlined, DownloadOutlined, FileSearchOutlined, UserOutlined } from "@ant-design/icons";
import { currencyFormatter } from "../../util";
import moment from "moment/moment";
import CommonModal from "../common/CommonModal";
import CommonSpinner from "../common/CommonSpinner";

const RenderInvoiceModal = ({
    setShowInvoiceModal,
    reviewId,
}) => {

    const appDir = `https://www.xcdsystem.com/masterapp_summer2012/controllers/donation/download_invoice.cfm`

    const [invoiceDetails, setInvoiceDetails] = useState({ __html: "" })
    const [downloadInvoice, setDownloadInvoice] = useState("")
    const [invoiceLoading, setInvoiceLoading] = useState(false)

    const getDonorInvoice = async (donationUser) => {

        const uuidKey = Object.keys(donationUser[0]).includes('contact_uuid') ? 'uuid' : 'compuuid';
        const uuid = Object.keys(donationUser[0]).includes('contact_uuid') ? donationUser[0]?.contact_uuid : donationUser[0]?.company_uuid;

        let downloadInvoice = `${appDir}?${uuidKey}=${uuid}&appdir=dfi&ordernumber=${donationUser[0]?.order_number}`

        try {
            setInvoiceLoading(true)
            const response = await fetch(`${appDir}?${uuidKey}=${uuid}&appdir=dfi&ordernumber=${donationUser[0]?.order_number}&html=1`)
            const result = await response.text()

            if (result?.length) {
                setInvoiceLoading(false)
                setDownloadInvoice(downloadInvoice)
                return { __html: result };
            }
        }
        catch (e) {
            setInvoiceLoading(false)
            console.log("e", e)
        }
    }

    useEffect(() => {
        if (reviewId?.length) {
            getDonorInvoice(reviewId).then(result => setInvoiceDetails(result))
        }
    }, [reviewId])

    const handleBack = () => {
        setShowInvoiceModal(false)
    }

    const handleCancel = () => {
        setInvoiceDetails({ __html: "" })
        setDownloadInvoice('')
    }
    return (
        <CommonSpinner loading={invoiceLoading} >
            <div className="d-flex align-center justify-space-between">
                <Button
                    style={{ paddingLeft: "0px" }}
                    onClick={handleBack}
                    icon={<ArrowLeftOutlined />}
                    type="text"
                >
                    Back
                </Button>
                <Button icon={<DownloadOutlined />} disabled={invoiceLoading} type="primary">
                    <a style={{ color: "white" }} target='_blank' href={`${downloadInvoice}`}> Download</a>
                </Button>
            </div>
            <div className="donor-invoiceModal" style={{ minHeight: '350px' }} dangerouslySetInnerHTML={invoiceDetails} />
        </CommonSpinner>
    )
}

const DonorModal = ({
    appDir,
    options,
    showModal,
    setShowModal,
    donorId,
    donationCategory,
    dateRange
}) => {
    const [donorDetails, setDonorDetails] = useState([])
    const [donorInfo, setDonorInfo] = useState({})
    const [loading, setLoading] = useState("false")
    const [showInvoiceModal, setShowInvoiceModal] = useState(false)
    const [constructedDonor, setConstructedDonor] = useState([])
    const [donorUuid, setDonorUuid] = useState('')

    const getDonorDetails = async () => {
        try {
            setLoading(true)
            const response = await fetch(`${appDir}?module=donations&component=reports&function=see_donations_by_user&${Object.keys(donorId[0])[0]}=${Object.values(donorId[0])[0]}`, options)
            const result = await response.json()
            if (Object.keys(result).length) {
                setLoading(false)
                setDonorDetails(result)
            } else {
                setLoading(false)
                setDonorDetails([])
            }
        }
        catch (e) {
            console.log('error', e);
        }
    }

    useEffect(() => {
        let donorUsername = ''
        let donorImage = ''
        let donationCategory = ''
        constructedDonor.map((value) => {
            donorUsername = Object.keys(value).includes('company_name') ? `${value?.company_name}` : `${value?.firstname}, ${value?.lastname}`
            donorImage = value.picture
            donationCategory = value.donation_name
        })
        setDonorInfo({
            username: donorUsername,
            picture: donorImage,
            donation_name: donationCategory
        })
    }, [constructedDonor])

    useEffect(() => {
        if (donorId?.length) {
            getDonorDetails()
        }
    }, [donorId])

    const constructedDonorDetails = () => {
        const constructedData = donorDetails?.records?.map((donor) => {
            let donationName = ""
            donationCategory.map((type) => {
                if (donor.donation_id === type.donation_id) {
                    donationName = type.donation_name
                }
            })
            return {
                ...donor,
                donation_name: donationName
            }
        })
        return constructedData;
    }

    useEffect(() => {
        if (donorDetails?.records?.length && donationCategory?.length) {
            setConstructedDonor(constructedDonorDetails())
        }
    }, [donorDetails, donationCategory])

    const handleCancel = () => {
        setShowModal(false)
        setDonorDetails([])
        setDonorInfo({})
        setConstructedDonor([])
        setShowInvoiceModal(false)
    }

    const handleViewInvoice = (data) => {
        setDonorUuid([data])
        setShowInvoiceModal(true)
    }

    const columnHeader = [
        {
            title: 'DATE',
            DataIndex: 'date',
            key: 'key',
            className: 'text-left',
            width: "15%",
            render: (_, data) => {
                return <div>{data?.date}</div>
            }
        },
        {
            title: 'TYPE',
            DataIndex: 'donation_name',
            key: 'donation_name',
            className: 'text-left',
            width: "55%",
            render: (_, data) => {
                return <div>{data?.donation_name}</div>
            }
        },
        {
            title: 'AMOUNT',
            DataIndex: 'amount',
            key: 'amount',
            width: "20%",
            className: 'text-left',
            render: (_, data) => {
                return <div>{currencyFormatter(data?.amount)} ({data?.pay_method})</div>
            }
        },
        {
            title: 'VIEW',
            DataIndex: 'view invoice',
            key: 'view invoice',
            className: 'text-left',
            width: "10%",
            render: (_, data) => {
                return <div>
                    <Tooltip title={'View Invoice'} >
                        <FileSearchOutlined style={{ fontSize: 20, cursor: 'pointer' }} className="mr-4" onClick={() => handleViewInvoice(data)} />
                    </Tooltip>
                </div>
            }
        }

    ]

    return (
        <CommonModal
            open={showModal}
            title="Donor Details"
            onCancel={handleCancel}
            className={showInvoiceModal ? "donor-invoiceModals donation-modal" : "donation-modal"}
            footer={false}
            width={showInvoiceModal ? '40%' : '80%'}
            bodyStyle={{ minHeight: '400px' }}
        >
            <CommonSpinner loading={loading}>
                {!showInvoiceModal &&
                    <div className="w-100">
                        {Object.keys(donorDetails).length ?
                            <>
                                <div className="donor-image d-flex" style={{ gap: '15px' }}>
                                    <Avatar shape="square" size={120} alt="profile" icon={<UserOutlined />} src={donorInfo?.picture} />
                                    <div>
                                        <h1 style={{ fontWeight: '700' }}>{donorInfo?.username}</h1>
                                    </div>
                                </div>
                                <div>
                                    <div className="d-flex align-center flex-gap statistic-card mt-4 donorModal-cards">
                                        <div className="donorModal-card-width mb-4" >
                                            <Card bordered>
                                                <div style={{ padding: '16px' }} className="d-flex flex-column align-center align-self-center min-width-max ">
                                                    <Statistic
                                                        value={donorDetails?.most_recent_donation?.amount}
                                                        prefix="$"
                                                    />
                                                </div>
                                                <Divider style={{ width: '100%', minWidth: '50%', margin: '0px' }} />
                                                <div style={{ padding: '4px', textAlign: 'center' }}>
                                                    LAST DONATION: {moment(donorDetails?.most_recent_donation?.date, 'YYYY-MM-DD').format('MMM DD, YYYY')}
                                                </div>
                                            </Card>
                                        </div>
                                        <div className="donorModal-card-width mb-4" >
                                            <Card bordered>
                                                <div style={{ padding: '16px' }} className="d-flex flex-column align-center align-self-center min-width-max ">
                                                    <Statistic
                                                        value={donorDetails?.largest_donation?.amount}
                                                        prefix="$"
                                                    />
                                                </div>
                                                <Divider style={{ width: '100%', minWidth: '50%', margin: '0px' }} />
                                                <div style={{ padding: '4px', textAlign: 'center' }}>
                                                    LARGEST DONATION: {moment(donorDetails?.largest_donation?.date, 'YYYY-MM-DD').format('MMM DD, YYYY')}
                                                </div>
                                            </Card>
                                        </div>
                                        <div className=" donorModal-card-width mb-4" >
                                            <Badge.Ribbon text="Lifetime">
                                                <Card bordered>
                                                    <div style={{ padding: '16px' }} className="d-flex flex-column align-center align-self-center min-width-max ">
                                                        <Statistic
                                                            value={donorDetails?.lifetime_donation}
                                                            prefix="$"
                                                        />
                                                    </div>
                                                    <Divider style={{ width: '100%', minWidth: '50%', margin: '0px' }} />
                                                    <div style={{ padding: '4px', textAlign: 'center' }}>
                                                        FIRST DONATION:  {moment(donorDetails?.first_donation?.date, 'YYYY-MM-DD').format('MMM DD, YYYY')}
                                                    </div>
                                                </Card>
                                            </Badge.Ribbon>
                                        </div>
                                        <div className="donorModal-card-width mb-4" >
                                            <Card bordered>
                                                <div style={{ padding: '16px' }} className="d-flex flex-column align-center align-self-center min-width-max ">
                                                    <Statistic
                                                        value={donorDetails?.record_count}
                                                    />
                                                </div>
                                                <Divider style={{ width: '100%', minWidth: '50%', margin: '0px' }} />
                                                <div style={{ padding: '4px', textAlign: 'center' }}>
                                                    NUMBER OF DONATIONS
                                                </div>
                                            </Card>
                                        </div>
                                        <>
                                            {/* <div style={{ width: '50%' }} className="mb-4 " >
                                            <Card bordered >
                                                <div className="d-flex">
                                                    <div style={{ width: "50%", padding: '16px' }} className="d-flex flex-column align-center align-self-center min-width-max ">
                                                        <Statistic
                                                            value={donorDetails?.most_recent_donation?.amount}
                                                            prefix="$"
                                                        />
                                                        <div >
                                                            Last Donation: {moment(donorDetails?.most_recent_donation?.date, 'YYYY-MM-DD').format('MMM DD, YYYY')}
                                                        </div>
                                                    </div>
                                                    <Divider style={{ height: '105px', margin: '5px' }} type="vertical" />
                                                    <div style={{ width: "50%", padding: '16px' }} className="d-flex flex-column align-center align-self-center min-width-max ">
                                                        <Statistic
                                                            value={donorDetails?.largest_donation?.amount}
                                                            prefix="$"
                                                        />
                                                        <div>
                                                            Largest Donation: {moment(donorDetails?.largest_donation?.date, 'YYYY-MM-DD').format('MMM DD, YYYY')}
                                                        </div>
                                                    </div>
                                                </div>
                                            </Card>
                                        </div> */}
                                            {/* <div style={{ width: '50%' }} >
                                            <Card bordered >
                                                <div className="d-flex">
                                                    <div style={{ width: "50%", padding: '16px' }} className="d-flex flex-column align-center align-self-center min-width-max ">
                                                        <Statistic
                                                            value={donorDetails?.lifetime_donation}
                                                            prefix="$"
                                                        />
                                                        <div>
                                                            Lifetime
                                                        </div>
                                                        <Divider style={{ width: '50%', minWidth: '50%', backgroundColor: 'black', margin: '0px' }} />
                                                        <div>
                                                            First Donation:  {moment(donorDetails?.first_donation?.date, 'YYYY-MM-DD').format('MMM DD, YYYY')}
                                                        </div>
                                                    </div>
                                                    <Divider style={{ height: '105px', margin: '5px' }} type="vertical" />
                                                    <div style={{ width: "50%", padding: '16px' }} className="d-flex flex-column align-center align-self-center min-width-max ">
                                                        <Statistic
                                                            value={donorDetails?.record_count}
                                                        />
                                                        <div>
                                                            Number of Donations
                                                        </div>
                                                    </div>
                                                </div>
                                            </Card>
                                        </div> */}
                                        </>
                                    </div>
                                    <div className="donor-profile">
                                        <Divider orientation="left" plain>
                                            <span style={{ fontSize: '18px' }}>HISTORY</span>
                                        </Divider>
                                        <Row className="mb-4 description-donor-profile">
                                            <Col className="mr-4">
                                                <Descriptions bordered>
                                                    <Descriptions.Item label="AVERAGE">${donorDetails.avg_donation}</Descriptions.Item>
                                                </Descriptions>
                                            </Col>
                                            <Col>
                                                <Descriptions bordered>
                                                    <Descriptions.Item label="FREQUENCY">Every {donorDetails.donation_frequency_days} days</Descriptions.Item>
                                                </Descriptions>
                                            </Col>
                                        </Row>
                                        <>
                                            {/* <Descriptions style={{ width: '30%' }} className="mb-4" bordered>
                                                    <Descriptions.Item label="Average">${donorDetails.avg_donation}</Descriptions.Item>
                                                    <Descriptions.Item label="Frequency">Every {donorDetails.donation_frequency_days} days</Descriptions.Item>
                                                </Descriptions>
                                                <Row className="flex-gap mb-6">
                                                    <Col>
                                                        <div className="font-s16" >Average: ${donorDetails.avg_donation}</div>
                                                    </Col>
                                                    <Col>
                                                        <div className="font-s16" >Frequency: Every {donorDetails.donation_frequency_days} days</div>
                                                    </Col>
                                                </Row> */}
                                        </>
                                        <Table
                                            size="small"
                                            dataSource={constructedDonor}
                                            columns={columnHeader}
                                            bordered
                                            scroll={constructedDonor.length > 3 ? { y: 150 } : false}
                                            pagination={constructedDonor.length > 10 ? true : false}
                                        />
                                    </div>
                                </div>
                            </>
                            : <></>}
                    </div>
                }
                {showInvoiceModal && <RenderInvoiceModal
                    setShowInvoiceModal={setShowInvoiceModal}
                    reviewId={donorUuid}
                />}
            </CommonSpinner>
        </CommonModal>
    )
}
export default DonorModal;