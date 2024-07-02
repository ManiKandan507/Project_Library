import { DownloadOutlined } from "@ant-design/icons"
import { Button } from "antd"
import React, { useEffect, useState } from "react"
import CommonModal from "../common/CommonModal"
import CommonSpinner from "../common/CommonSpinner"

const ViewInvoiceModal = ({
    showInvoiceModal,
    setShowInvoiceModal,
    reviewId,
    appDir,
    options,
    type,
}) => {
    const [invoiceDetails, setInvoiceDetails] = useState({ __html: "" })
    const [donationUser, setDonationUser] = useState([])
    const [invoiceLoading, setInvoiceLoading] = useState(false)
    const [downloadInvoice, setDownloadInvoice] = useState("")

    useEffect(() => {
        if (donationUser.length) {
            getDonorInvoice(donationUser).then(result => setInvoiceDetails(result))
        }
    }, [donationUser])

    useEffect(() => {
        if (reviewId?.length) {
            getDonoationDetails(reviewId)
        }
    }, [reviewId])

    const getDonorInvoice = async (donationUser) => {

        const uuidKey = Object.keys(donationUser[0]?.records[0]).includes('contact_uuid') ? 'uuid' : 'compuuid';
        const uuid = Object.keys(donationUser[0]?.records[0]).includes('contact_uuid') ? donationUser[0]?.records[0]?.contact_uuid : donationUser[0]?.records[0]?.company_uuid;

        let downloadInvoice = `https://www.xcdsystem.com/masterapp_summer2012/controllers/donation/download_invoice.cfm?${uuidKey}=${uuid}&appdir=dfi&ordernumber=${donationUser[0]?.records[0]?.order_number}`

        try {
            setInvoiceLoading(true)
            const response = await fetch(`https://www.xcdsystem.com/masterapp_summer2012/controllers/donation/download_invoice.cfm?${uuidKey}=${uuid}&appdir=dfi&ordernumber=${donationUser[0]?.records[0]?.order_number}&html=1`)
            const result = await response.text()
            if (result.length) {
                setInvoiceLoading(false)
                setDownloadInvoice(downloadInvoice)
                return { __html: result };
            }
        }
        catch (e) {
            setInvoiceLoading(false)
            console.log("error", e)
        }
    }

    const getDonoationDetails = async (reviewId) => {
        try {
            const response = await fetch(`${appDir}?module=donations&component=reports&function=see_donations_by_user&${Object.keys(reviewId[0])[0]}=${Object.values(reviewId[0])[0]}`, options)
            const result = await response.json()
            if (Object.keys(result).length) {
                setDonationUser([result])
            } else {
                setDonationUser([])
            }
        }
        catch (e) {
            console.log("error", e);
        }
    }

    const handleCancel = () => {
        setShowInvoiceModal(false)
        setInvoiceDetails({ __html: "" })
        setDownloadInvoice('')
    }

    return (
        <>
            {
                <CommonModal
                    open={showInvoiceModal}
                    title="Donation Invoice"
                    onCancel={handleCancel}
                    bodyStyle={{ height: '400px' }}
                    className={showInvoiceModal ? "donor-invoiceModals footer-content" : " footer-content"}
                    width={showInvoiceModal ? '40%' : '70%'}
                    footer={type === 'donation_tab' ? false : [<Button icon={<DownloadOutlined />} disabled={downloadInvoice === '' ? true : false} type="primary">
                        <a style={{color:"white"}} target='_blank' href={`${downloadInvoice}`}> Download</a></Button>]}
                >
                    <CommonSpinner loading={invoiceLoading}>
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }} >
                            <div dangerouslySetInnerHTML={invoiceDetails} />
                        </div>
                    </CommonSpinner>
                </CommonModal>
            }
        </>
    )

}
export default ViewInvoiceModal;