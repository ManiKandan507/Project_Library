import React, { useState } from "react";
import { useEffect } from "react";
import { Tooltip } from "antd";
import { DownloadOutlined } from "@ant-design/icons";

const DownloadInvoice = ({ reviewId, appDir, options }) => {

    const [donorDetails, setDonorDetails] = useState([])
    const [download, setDownload] = useState('')

    useEffect(() => {
        if (reviewId !== '') {
            const key = Object.keys(reviewId)[0];
            const  value = Object.values(reviewId)[0];
            getDonorInvoice(key, value)
        }
    }, [reviewId])

    useEffect(() => {
        if(donorDetails.length) {
            setDownload(downloadLink(donorDetails))
        }
    }, [donorDetails])

    const getDonorInvoice = async (key, value) => {
        try {
            const response = await fetch(`${appDir}?module=donations&component=reports&function=see_donations_by_user&${key}=${value}`, options)
            const result = await response.json()
            if (result?.length) {
                setDonorDetails(result)
            } else {
                setDonorDetails([])
            }
        }
        catch (e) {
            console.log("error", e);
        }
    }

    const downloadLink = (donorDetails) => {
        const uuidKey = Object.keys(donorDetails[0]).includes('contact_uuid') ? 'uuid' : 'compuuid';
        const uuid = Object.keys(donorDetails[0]).includes('contact_uuid') ? donorDetails[0]?.contact_uuid : donorDetails[0]?.company_uuid;

        let downloadInvoice = `https://www.xcdsystem.com/masterapp_summer2012/controllers/donation/download_invoice.cfm?${uuidKey}=${uuid}&appdir=dfi&ordernumber=${donorDetails[0]?.order_number}`
        
        return downloadInvoice;
    }


    return (
        <>
        <Tooltip title={"Download invoice"}>
            <a target='_blank' style={{ color: '#000000' }} href={`${download}`}>
                <DownloadOutlined style={{ fontSize: 20, cursor: 'pointer' }} />
            </a>
        </Tooltip>
        </>
    )
}

export default DownloadInvoice;