import React, { useContext, useState, useEffect } from "react";
import { Col, Row, Tooltip } from "antd";
import moment from "moment";
import { ReactComponent as Information } from '../../NativeDashboards/DonationAdminDirectory/assets/icons/Information.svg';
import CommonSpinner from "./common/CommonSpinner";
import { currencyFormatter, getRoundValue } from "../util";
import { ArrowDownOutlined, ArrowUpOutlined } from "@ant-design/icons";
import GlobalContext from "./context/DonationContext";

const SideMenu = ({ CategoryTypes }) => {
    const { config } = useContext(GlobalContext)
    const { appDir, options } = config
    const [totalDonation, setTotalDonation] = useState([])
    const [loading, setLoading] = useState(false)
    const [yearTotalDonors, setYearTotalDonors] = useState([])
    const [donationCategory, setDonationCategory] = useState([])
    const [noDataFound, setNoDataFound] = useState({
        totalDonationAndRecentDonor: true,
        comparsionData: true,
    })

    useEffect(() => {
        if (CategoryTypes?.length) {
            setDonationCategory(constructDonationId(CategoryTypes))
        }
    }, [CategoryTypes])

    useEffect(() => {
        if (donationCategory.length) {
            getRecentTotalDonors(moment().startOf('year').format('MM-DD-YYYY'), moment().endOf('month').format('MM-DD-YYYY'), donationCategory)
            getYearsTotalDonors(moment().subtract(12, 'month').format('MM-DD-YYYY'), moment().format('MM-DD-YYYY'), donationCategory)
        }
    }, [donationCategory])

    const constructDonationId = () => {
        const donationIds = CategoryTypes.map((category) => {
            return category.donation_id
        })
        return donationIds
    }

    const getRecentTotalDonors = async (start_date, end_date, donationCategory) => {
        try {
            setLoading(true)
            const result = await fetch(`${appDir}?module=donations&component=reports&function=see_donations&start_date=${start_date}&end_date=${end_date}&donationids=[${donationCategory}]&membership=true`, options)
            const values = await result.json();
            if (values?.length || result?.status == 200) {
                setNoDataFound(pre => ({ ...pre, totalDonationAndRecentDonor:values?.length ? false : true }))
                setLoading(false)
                setTotalDonation(values?.length ? values : [])
            }
        }
        catch (e) {
            setNoDataFound(pre => ({ ...pre, totalDonationAndRecentDonor: true }))
            setLoading(false)
            console.log("error", e);
        }
    }

    const getYearsTotalDonors = async (start_date, end_date, donationCategory) => {
        try {
            setLoading(true)
            const result = await fetch(`${appDir}?module=donations&component=reports&function=see_donations&start_date=${start_date}&end_date=${end_date}&donationids=[${donationCategory}]&membership=true`, options)
            const values = await result.json();
            if (values?.length || result?.status == 200) {
                setLoading(false)
                setYearTotalDonors(values?.length ? values : [])
            }
        }
        catch (e) {
            setLoading(false)
            console.log("error", e)
        }
    }

    const recentDonationRevenue = () => {
        let totalDonationRevenue = 0
        let yearToDateDonation = 0
        let start_date = moment().subtract(6, 'month').startOf('month').format("YYYY-MM-DD")
        totalDonation.map((value) => {
            if (start_date < value.date) {
                totalDonationRevenue += value.amount
            }
            yearToDateDonation += value.amount
        })

        return (
            <div>
                <div>
                    <div className='pb-2'>
                        <div className="d-flex side-menu-title">
                            <div>{"RECENT TOTAL DONATIONS"}
                                <span className="ml-2">
                                    <Tooltip title={"Sum total dollars of donations in last 6 months"} placement="right">
                                        <Information style={{ width: "0.9rem" }} />
                                    </Tooltip>
                                </span>
                            </div>
                        </div>
                        <div className="menuValues py-1 side-menu-donation custom-theme-color">{currencyFormatter(totalDonationRevenue)}</div>
                    </div>
                    <div className='pb-2'>
                        <div className="d-flex side-menu-title">
                            <div>{"YEAR TO DATE"}
                                <span className="ml-2">
                                    <Tooltip title={"Year to date sum total of donation revenue"} placement="right">
                                        <Information style={{ width: "0.9rem" }} />
                                    </Tooltip>
                                </span>
                            </div>
                        </div>
                        <div className="menuValues py-1 side-menu-donation custom-theme-color">{currencyFormatter(yearToDateDonation)}</div>

                    </div>
                </div>
            </div>
        )
    }

    const recentDonors = () => {
        let start_date = moment().subtract(6, 'month').endOf('month').format("YYYY-MM-DD")
        let recentDonors = []
        totalDonation.map((value) => {
            if (start_date < value.date) {
                recentDonors.push(value)
            }
        })

        return (
            <div className='py-2'>
                <div className="d-flex side-menu-title">
                    <div >{"RECENT DONORS"}
                        <span className="ml-2">
                            <Tooltip title={"Total number of individuals/companies who have donated in last 6 months."} placement="right">
                                <Information style={{ width: "0.9rem" }} />
                            </Tooltip>
                        </span>
                    </div>
                </div>
                <div className="menuValues py-1" style={{ color: "#52c41a", textDecoration: "underline" }}>{recentDonors.length}</div>
            </div>
        )
    }

    const monthComparison = () => {

        let firstHalfDonors = [];
        let firstHalfDonations = 0;
        let secondHalfDonors = [];
        let secondHalfDonations = 0;
        let middleMonth = moment().subtract(6, 'month').startOf('month').format('YYYY-MM-DD')
        if (yearTotalDonors.length) {
            yearTotalDonors.map((value) => {
                if (middleMonth < value.date) {
                    secondHalfDonors.push(value)
                    secondHalfDonations += value.amount;
                } else {
                    firstHalfDonors.push(value)
                    firstHalfDonations += value.amount;
                }
            })
        }

        const getComparePercentage = ((Number(secondHalfDonations) - Number(firstHalfDonations)) / Number(secondHalfDonations) * 100)

        return (
            <div className="py-2">
                <div className="d-flex title">
                    <div >{"LAST 6 MONTH COMPARISON"}
                        <span className="ml-2">
                            <Tooltip title={"Compare donation amounts from last 6 months to 6 months before that."} placement="right">
                                <Information style={{ width: "0.9rem" }} />
                            </Tooltip>
                        </span>
                    </div>
                </div>
                <div className="py-2">
                    <Row>
                        <Col span={7} className="mr-2" style={{ textOverflow: "ellipsis", overflow: "hidden" }} >
                            <Tooltip title={"DONORS"}>
                                DONORS
                            </Tooltip>
                        </Col>
                        <Col className="mr-2" span={6}>
                            {secondHalfDonors.length}
                        </Col>
                        <Col>
                            {(secondHalfDonors.length || firstHalfDonors.length) ?
                                <div style={{ minWidth: "55px" }}>
                                    {secondHalfDonors.length > firstHalfDonors.length ?
                                        <ArrowUpOutlined style={{ color: '#5ab33e' }} /> :
                                        <ArrowDownOutlined style={{ color: '#f5222d' }} />}
                                    {`${getRoundValue(156, 2)}%`}
                                </div>
                                : ''}
                        </Col>
                    </Row>
                    <Row wrap={false}>
                        <Col span={7} className="mr-2" style={{ textOverflow: "ellipsis", overflow: "hidden" }}>
                            <Tooltip title={"DONATIONS"}>
                                DONATIONS
                            </Tooltip>
                        </Col>
                        <Col className="mr-2" span={6}>
                            {currencyFormatter(secondHalfDonations)}
                        </Col>
                        <Col>
                            {(secondHalfDonations !== 0 || firstHalfDonations !== 0) ? <div>
                                {secondHalfDonations > firstHalfDonations ? <ArrowUpOutlined style={{ color: '#5ab33e' }} /> : <ArrowDownOutlined style={{ color: '#f5222d' }} />} {`${getRoundValue(Math.abs(getComparePercentage), 2)}%`}
                            </div> : ''}
                        </Col>
                    </Row>
                </div>
            </div>
        )
    }

    return (
        <>
            <CommonSpinner loading={loading}>
                <div className="mb-4 ml-3">
                    <div className='mb-2'>
                        {recentDonationRevenue()}
                        {recentDonors()}
                        {monthComparison()}
                    </div>
                </div>
            </CommonSpinner>
        </>
    )
}
export default SideMenu;