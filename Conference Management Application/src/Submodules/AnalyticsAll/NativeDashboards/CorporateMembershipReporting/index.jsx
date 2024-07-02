import React, { useState } from "react";
import { Row, Col, Tabs } from 'antd'
import "antd/dist/antd.css";
import StatLoader from '@/CorporateMembershipReportingV2/StatLoader';
import '@/AnalyticsAll/NativeDashboards/CorporateMembershipReporting/custom.css';
import { ReactComponent as MembersIcon } from '@/AnalyticsAll/NativeDashboards/CorporateMembershipReporting/assets/icons/Members.svg'
import { ReactComponent as SalesActivityIcon } from "@/AnalyticsAll/NativeDashboards/CorporateMembershipReporting/assets/icons/Sales-Activity.svg";
import { ReactComponent as LocationIcon } from "@/AnalyticsAll/NativeDashboards/CorporateMembershipReporting/assets/icons/Maps.svg";
import { ReactComponent as TrendIcon } from "@/AnalyticsAll/NativeDashboards/CorporateMembershipReporting/assets/icons/Trends.svg"
import { ReactComponent as HomeIcon } from '@/AnalyticsAll/NativeDashboards/CorporateMembershipReporting/assets/icons/Home.svg'
import { GlobalProvider } from "@/CorporateMembershipReportingV2/context/MemberContext";

const { TabPane } = Tabs;
let controller = new AbortController();
let signal = controller.signal;

const CorporateMembershipReportingDashboard = ({ staticConfig }) => {
    const [activeTab, setActiveTab] = useState("home")

    const tabItems = [
        {
            screen: "home",
            screenName: "Home",
            IconMenu: HomeIcon
        },
        {
            screen: "members",
            screenName: "Members",
            IconMenu: MembersIcon
        },
        {
            screen: "salesactivity",
            screenName: "Sales Activity",
            IconMenu: SalesActivityIcon
        },
        {
            screen: "location",
            screenName: "Location",
            IconMenu: LocationIcon
        },
        {
            screen: "trend",
            screenName: "Trend",
            IconMenu: TrendIcon
        },
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

    return (
        <div>
            <GlobalProvider config={staticConfig}>
                <Tabs
                    defaultActiveKey="home"
                    onChange={tabChange}
                    activeKey={activeTab}
                    size="small"
                >
                    {tabItems.map((tab) => {
                        const { IconMenu } = tab
                        return (
                            <TabPane
                                tab={<>{<IconMenu width="1.6rem" className="pr-2" style={{ fill: 'red' }} />}<span style={{ fontSize: "20px" }}>{tab.screenName}</span></>}
                                key={tab.screen}
                            >
                            </TabPane>
                        )
                    })}
                </Tabs>
                {activeTab === "home" &&
                    <div >
                        <Row>
                        <Col lg={4} md={24} sm={24} xs={24} style={{ backgroundColor: "#fcfcfc" }} className="pt-4">
                                <StatLoader statIdentifier={"SIDE_MENU"} params={staticConfig} signal={signal} />
                            </Col>
                            <Col lg={12} md={24} sm={24} xs={24} className="pt-4 px-2">
                                <StatLoader statIdentifier={"CURRENT_TOTAL_MEMBERS"} params={staticConfig} signal={signal} handleExplore={handleExplore}/>
                                <StatLoader statIdentifier={"MEMBERSHIP_SALES"} params={staticConfig} signal={signal} handleExplore={handleExplore}/>
                            </Col>
                            <Col lg={8} md={24} sm={24} xs={24} className="pt-4 px-2">
                                <StatLoader statIdentifier={"POPULAR_MEMBERSHIP_TYPES"} params={staticConfig} signal={signal} handleExplore={handleExplore}/>
                                <StatLoader statIdentifier={"RECENT_ORDERS"} params={staticConfig} signal={signal} />
                            </Col>
                        </Row>
                    </div>
                }
                {
                    activeTab === "members" &&
                    <div>
                        <Row>
                            <Col lg={24} md={24} sm={24} xs={24}  className="pt-1">
                                <StatLoader statIdentifier={"TYPES_OF_MEMBERS"} params={staticConfig} signal={signal} />
                            </Col>
                        </Row>
                    </div>
                }
                {
                    activeTab === "salesactivity" &&
                    <div>
                        <Row>
                            <Col lg={24} md={24} sm={24} xs={24} className="pt-1">
                                <StatLoader statIdentifier={"SALES_ACTIVITY"} params={staticConfig} />
                            </Col>
                        </Row>
                    </div>
                }
                {
                    activeTab === "location" &&
                    <div>
                        <Row>
                            <Col lg={24} md={24} sm={24} xs={24} className="pt-1">
                                <StatLoader statIdentifier={"LOCATION"} params={staticConfig} />
                            </Col>
                        </Row>
                    </div>
                }
                {
                    activeTab === "trend" &&
                    <div>
                        <Row>
                            <Col lg={24} md={24} sm={24} xs={24} className="pt-1">
                                <StatLoader statIdentifier={"TREND"} params={staticConfig} />
                            </Col>
                        </Row>
                    </div>
                }
            </GlobalProvider>
        </div>
    )
};

export default CorporateMembershipReportingDashboard;