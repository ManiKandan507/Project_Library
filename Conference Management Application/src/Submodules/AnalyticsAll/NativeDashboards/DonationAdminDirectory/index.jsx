import React, { useState, useEffect } from "react";
import "antd/dist/antd.css";
import 'antd/dist/antd.variable.min.css';
import "./custom.css";
import { Col, Row, Tabs, ConfigProvider } from "antd";
import CommonCard from "../../StatComponents/DonationAdminReporting/common/CommonCards";
import StatLoader from "../../StatComponents/DonationAdminReporting/common/StatLoader";
import { GlobalProvider } from "../../StatComponents/DonationAdminReporting/context/DonationContext";
import CommonSpinner from "../../StatComponents/DonationAdminReporting/common/CommonSpinner";
import { DollarOutlined, HomeOutlined, PieChartOutlined, SettingOutlined, TeamOutlined } from "@ant-design/icons";

let controller = new AbortController();
let signal = controller.signal;

const DonationNativeDashboard = ({ staticConfig }) => {
    const [activeTab, setActiveTab] = useState("home")
    const [donationCategory, setDonationCategory] = useState([])
    const [loading, setLoading] = useState(false)

    const appDir = staticConfig.appDir

    const options = {
        method: 'GET',
        headers: {
            'Authorization' : staticConfig.jwt
        }
    }

    useEffect(() => {
        const root = document.documentElement;
        if (staticConfig.primary_color !== '')
            root?.style.setProperty("--custom_theme_color", `${staticConfig.primary_color}`);
    }, [staticConfig])

    useEffect(() => {
        getDonationCategory()
    }, [staticConfig])

    const getDonationCategory = async () => {
        try {
            setLoading(true)
            const result = await fetch(`${appDir}?module=donations&component=types_admin&function=see_donation_types`, options)
            const values = await result.json()
            if (values.length) {
                setLoading(false)
                setDonationCategory(values)
            }
        } catch (e) {
            setLoading(false)
            console.log("error", e);
        }
    }

    const Items = [
        {
            label: (
                <div className="d-flex align-center main-tab">
                    <HomeOutlined className="mr-1" />
                    <span style={{ fontSize: "18px" }}>Home</span>
                </div>
            ),
            key: 'home',
        },
        {
            label: (
                <div className="d-flex align-center main-tab">
                    <DollarOutlined className="mr-1" />
                    <div style={{ fontSize: "18px" }}>Donations</div>
                </div>
            ),
            key: 'donations',
        },
        {
            label: (
                <div className="d-flex align-center main-tab">
                    <TeamOutlined className="mr-1" />
                    <div style={{ fontSize: "18px" }}>Donors</div>
                </div>
            ),
            key: 'donors',
        },
        {
            label: (
                <div className="demographics-icon d-flex align-center main-tab">
                    <PieChartOutlined className=" mr-1" />
                    <div style={{ fontSize: "18px" }}>Demographics</div>
                </div>
            ),
            key: 'demographics',
        },
        {
            label: (
                <div className="d-flex align-center main-tab">
                    <SettingOutlined className="mr-1" />
                    <div style={{ fontSize: "18px" }}>Settings</div>
                </div>
            ),
            key: 'settings'
        }
    ]

    const tabChange = (screen) => {
        controller.abort();
        controller = new AbortController();
        signal = controller.signal;
        setActiveTab(screen)
    }

    const handleExplore = (e) => {
        setActiveTab(e)
    }

    ConfigProvider.config({
        theme: {
            primaryColor: `${staticConfig.primary_color}`,
        },
    });

    return (
        <CommonSpinner loading={loading}>
            <div>
                <GlobalProvider staticConfig={staticConfig} donationCategory={donationCategory} >
                    <Tabs
                        defaultActiveKey="home"
                        onChange={tabChange}
                        activeKey={activeTab}
                        size="small"
                        items={Items}
                    />
                    {activeTab === "home" &&
                        <div>
                            <Row>
                                <Col xl={4} lg={5} md={24} sm={24} xs={24} style={{ backgroundColor: "#fcfcfc" }} className="mt-2 mb-2 pl-2">
                                    <CommonCard className='sideMenuCard cardPadding'>
                                        <StatLoader statIdentifier={"SIDE_MENU"} params={staticConfig} signal={signal} appDir={appDir} options={options} CategoryTypes={donationCategory} />
                                    </CommonCard>
                                </Col>
                                <Col xl={20} lg={19} md={24} sm={24} xs={24} className="pt-2 px-2 mb-2">
                                    <Row className='mb-2'>
                                        <Col lg={24} md={24} sm={24} xs={24}>
                                            <CommonCard className='cardPadding'>
                                                <StatLoader statIdentifier={"DONATION_BY_MONTH"} params={staticConfig} signal={signal} appDir={appDir} options={options} handleExplore={handleExplore} />
                                            </CommonCard>
                                        </Col>
                                    </Row>
                                    <CommonCard className='cardPadding'>
                                        <Row>
                                            <Col xl={12} lg={24} md={24} sm={24} xs={24} className=" px-2">
                                                <StatLoader statIdentifier={"DONATION_BY_CATEGORY"} params={staticConfig} signal={signal} appDir={appDir} options={options} CategoryTypes={donationCategory} handleExplore={handleExplore} />
                                            </Col>
                                            <Col xl={12} lg={24} md={24} sm={24} xs={24} className="pl-3">
                                                <StatLoader statIdentifier={"RECENT_DONORS"} params={staticConfig} signal={signal} appDir={appDir} options={options} CategoryTypes={donationCategory} />
                                            </Col>
                                        </Row>
                                    </CommonCard>
                                </Col>
                            </Row>
                        </div>
                    }
                    {activeTab === 'donations' &&
                        <div>
                            <Row>
                                <Col className="w-100" >
                                    <StatLoader statIdentifier={"DONATIONS"} params={staticConfig} signal={signal} appDir={appDir} options={options} CategoryTypes={donationCategory} />
                                </Col>
                            </Row>
                        </div>
                    }
                    {activeTab === 'donors' &&
                        <div>
                            <Row>
                                <Col className="w-100" >
                                    <StatLoader statIdentifier={"DONORS"} params={staticConfig} signal={signal} appDir={appDir} options={options} CategoryTypes={donationCategory} />
                                </Col>
                            </Row>
                        </div>
                    }
                    {activeTab === 'demographics' &&
                        <div>
                            <Row>
                                <Col className="w-100">
                                    <StatLoader statIdentifier={"DEMOGRAPHICS"} params={staticConfig} signal={signal} appDir={appDir} options={options} CategoryTypes={donationCategory} />
                                </Col>
                            </Row>
                        </div>
                    }
                    {activeTab === 'settings' &&
                        <div>
                            <Row>
                                <Col className="w-100" >
                                    <StatLoader statIdentifier={"SETTINGS"} params={staticConfig} signal={signal} appDir={appDir} options={options} CategoryTypes={donationCategory} />
                                </Col>
                            </Row>
                        </div>
                    }
                </GlobalProvider>
            </div>
        </CommonSpinner>
    )
}
export default DonationNativeDashboard;
