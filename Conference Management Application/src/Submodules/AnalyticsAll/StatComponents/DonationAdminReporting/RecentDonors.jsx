import { Avatar, Table, Tag, Tooltip } from "antd";
import moment from "moment";
import React, { useState, useEffect, useContext } from "react";
import CommonSpinner from "./common/CommonSpinner";
import { ReactComponent as Information } from "../../NativeDashboards/DonationAdminDirectory/assets/icons/Information.svg";
import { currencyFormatter } from "../util";
import { CreditCardOutlined, FileProtectOutlined, UserOutlined } from "@ant-design/icons";
import GlobalContext from "./context/DonationContext";

const RecentDonors = ({ CategoryTypes }) => {
    const { config } = useContext(GlobalContext)
    const { appDir, options } = config
    const [dataSource, setDataSource] = useState([])
    const [loading, setLoading] = useState(false)
    const [donationCategory, setDonationCategory] = useState([])
    const [tableDataSource, setTableDataSource] = useState([])

    useEffect(() => {
        if (CategoryTypes?.length) {
            setDonationCategory(constructDonationId(CategoryTypes))
        }
    }, [CategoryTypes])

    useEffect(() => {
        if (donationCategory.length) {
            getRecentDonors(moment().subtract(2, 'month').format('MM-DD-YYYY'), moment().format('MM-DD-YYYY'), donationCategory)
        }
    }, [donationCategory])

    useEffect(() => {
        if (dataSource.length) {
            setTableDataSource(constructDonation(dataSource))
        }
    }, [dataSource])

    const constructDonationId = () => {
        const donationIds = CategoryTypes.map((category) => {
            return category.donation_id
        })
        return donationIds
    }

    const getRecentDonors = async (start_date, end_date, donationCategory) => {
        try {
            setLoading(true)
            const result = await fetch(`${appDir}?module=donations&component=reports&function=see_donations&start_date=${start_date}&end_date=${end_date}&donationids=[${donationCategory}]&membership=true`, options)
            const values = await result.json();
            if (values.length || result?.status == 200) {
                setLoading(false)
                setDataSource(values?.length ? values : [])
            }
        }
        catch (e) {
            console.log("error", e);
            setLoading(false)
        }
    }

    const constructDonation = () => {
        const constructedData = dataSource.map((data) => {
            let donationName = ''
            CategoryTypes.map((value) => {
                if (data.donation_id === value.donation_id) {
                    donationName = value.donation_name
                }
            })
            return {
                ...data,
                donationName: donationName
            }
        }).sort((a, b) => new Date(b.date) - new Date(a.date)).slice(0, 10)

        return constructedData
    }

    const userColumn = [
        {
            title: 'NAME',
            dataIndex: 'firstname',
            key: 'firstname',
            width: 30,
            render: (_, data) => {
                const fullName = Object.keys(data).includes('company_name') ? data.company_name : `${data.firstname} ${data.lastname}`
                return <div className="d-flex text-left" >
                    <div className="pt-1">
                        <Avatar size={40} alt="profile" className="mr-2" icon={<UserOutlined />} src={data.Picture} />
                    </div>
                    <div className="d-flex recentDonor-nameHolder flex-column flex-wrap">
                        <Tooltip title={fullName}>
                            <div className="mb-1 recentDonor-name"> {fullName} </div>
                        </Tooltip>
                        <div>
                            <Tag className="d-flex align-center donor-tags br-5" >
                                {data.pay_method.toLowerCase().includes("card") && <span className="pr-1">
                                    <CreditCardOutlined />
                                </span>}
                                {data.pay_method.toLowerCase().includes("check") && <span className="pr-1">
                                    <FileProtectOutlined />
                                </span>}
                                {data.pay_method}
                            </Tag>
                        </div>
                    </div>
                </div >
            }
        },
        {
            title: 'DONATION CATEGORY',
            dataindex: 'donationName',
            key: 'donationName',
            width: 30,
            render: (_, data) => {
                return <Tooltip title={data.donationName}>
                    <div className="text-left recentDonor-category">{data.donationName}</div>
                </Tooltip>

            }
        },
        {
            title: 'DATE',
            dataIndex: 'date',
            key: 'date',
            width: 13,
            render: (_, data) => {
                return <div className="text-left">{data.date}</div>
            }
        },
        {
            title: <Tooltip title='DONATION'>DONATION</Tooltip>,
            dataIndex: 'amount',
            key: 'amount',
            width: 12,
            ellipsis: true,
            render: (_, data) => {
                return <div className="text-left">{currencyFormatter(data.amount)}</div>
            }
        }
    ]

    return (
        <div>
            <CommonSpinner loading={loading}>
                <div className="py-4">
                    <div className="d-flex title py-2">
                        <div>{"RECENT DONORS"}</div>
                        <span className="ml-2">
                            <Tooltip title={"10 most recent donors"} placement="right">
                                <Information style={{ width: "0.9rem" }} />
                            </Tooltip>
                        </span>
                    </div>
                    <div className='py-2'>
                        <Table
                            dataSource={tableDataSource}
                            columns={userColumn}
                            pagination={false}
                            className="memberTables custom-theme-table-header-color"
                            scroll={{ y: 300 }}
                            rowKey={({ ReviewID }) => ReviewID}
                            size="small"
                        />
                    </div>
                </div>
            </CommonSpinner>
        </div>
    )
}
export default RecentDonors;