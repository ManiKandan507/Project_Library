import React, { useEffect, useState } from "react";
import { Row, Col, Tabs, Card, Menu, Button, ConfigProvider } from 'antd'
import "antd/dist/antd.css";
import 'antd/dist/antd.variable.min.css';
import StatLoader from '@/AnalyticsAll/StatComponents/StatLoader';
import '@/AnalyticsAll/NativeDashboards/MembershipReporting/custom.css'
import { ReactComponent as MembersIcon } from '@/AnalyticsAll/NativeDashboards/MembershipReporting/assets/icons/Members.svg'
import { ReactComponent as SalesActivityIcon } from "@/AnalyticsAll/NativeDashboards/MembershipReporting/assets/icons/Sales-Activity.svg";
import { ReactComponent as LocationIcon } from "@/AnalyticsAll/NativeDashboards/MembershipReporting/assets/icons/Maps.svg";
import { ReactComponent as TrendIcon } from "@/AnalyticsAll/NativeDashboards/MembershipReporting/assets/icons/Trends.svg"
import { ReactComponent as HomeIcon } from '@/AnalyticsAll/NativeDashboards/MembershipReporting/assets/icons/Home.svg'
import { GlobalProvider } from "@/MembershipReportingV2/context/MemberContext";
import CommonCard from "../../StatComponents/MembershipReporting/common/CommonCard";
import { DollarOutlined, DotChartOutlined, HomeOutlined, MenuFoldOutlined, MenuUnfoldOutlined, PieChartOutlined, TeamOutlined } from "@ant-design/icons";
import SubMenu from "antd/lib/menu/SubMenu";

let controller = new AbortController();
let signal = controller.signal;

const MembershipReportingDashboard = ({ staticConfig }) => {
    const [activeTab, setActiveTab] = useState("home")
    const [subMenuKey, setSubMenuKey] = useState('')
    const [loading, setLoading] = useState(false)

    const onMenuItemClick = (e) => {
        // controller.abort();
        // controller = new AbortController();
        // signal = controller.signal;
        setSubMenuKey(e.keyPath.length > 1 ? e.keyPath[0] : "")
        setLoading(true)
        setTimeout(() => {
            setActiveTab(e.keyPath[e.keyPath.length - 1])
            setLoading(false)
        }, [1000])
    }

    const horizontalItems = [
        {
            label: 'Home',
            key: 'home',
            icon: <HomeOutlined width="1.6rem" className="pr-2" />,
        },
        {
            label: 'Sales',
            key: 'salesactivity',
            icon: <DollarOutlined width="1.6rem" className="pr-2" />,
            //   onTitleClick: (e) => onMenuItemClick({key:e.key, keyPath:[e.key]}),
            children: [
                {
                    label: "Sales & Revenue Summary",
                    key: "sales_revenue_summary_table"
                },
                {
                    label: 'Revenues',
                    key: 'monthly_quarterly_revenue',
                },
                {
                    label: 'Revenues by Membership Type',
                    key: 'monthly_quarterly_mem_types_revenue',
                },
                {
                    label: 'Membership Volume',
                    key: 'monthly_quarterly_volume',
                },
                {
                    label: 'Membership Volume by Membership Type',
                    key: 'monthly_quarterly_volume_type',
                }
            ]
        },
        {
            label: 'Membership Distribution',
            key: 'members',
            icon: <TeamOutlined width="1.6rem" className="pr-2" />,
            // onTitleClick: (e) => onMenuItemClick({key:e.key, keyPath:[e.key]}),
            children: [
                {
                    label: "Current Members",
                    key: 'currentmembers',
                },
                {
                    label: "Expired Members",
                    key: 'expiredmembers',
                },
                {

                    label: "New Members",
                    key: 'newmembers',
                },
                {
                    label: "Renewed Members",
                    key: 'renewingMembers',
                },
            ]
        },
        {
            label: 'Demographics',
            key: 'location',
            icon: <PieChartOutlined width="1.6rem" className="pr-2" />,
            onTitleClick: (e) => onMenuItemClick({ key: e.key, keyPath: [e.key] }),
            // children: [
            //     {
            //         label: "Location/Geography/Nationality",
            //         key: 'location_geography',
            //     },
            //     {
            //         label: "Custom Field Demographic",
            //         key: 'custom_field_demographic',
            //     }
            // ]
        },
        {
            label: 'Analytics',
            key: 'analytics',
            icon: <DotChartOutlined width="1.6rem" className="pr-2" />,
            // onTitleClick: (e) => onMenuItemClick({ key: e.key, keyPath: [e.key] }),
            children: [
                // {
                //     label: "Membership Growth/Loss/Retention",
                //     key: 'membership_growth',
                // },
                {
                    label: "Membership Upgrades/Downgrades",
                    key: 'member_transition',
                },
                // {
                //     label: "Predicted Revenues for Next Membership Year",
                //     key: 'predicted_revenue',
                // },
                // {
                //     label: "Participation and Engagement",
                //     key: 'participation_engagement',
                // }
            ]
        }

    ];


    const getItem = (label, key, icon, children, type) => {
        return {
            key,
            icon,
            children,
            label,
            type,
        };
    }

    const tabChange = (screen) => {
        controller.abort();
        controller = new AbortController();
        signal = controller.signal;
        setActiveTab(screen)
    }

    const handleExplore = (e) => {
        setActiveTab(e)
    }
    const [collapsed, setCollapsed] = useState(false);
    const toggleCollapsed = () => {
        setCollapsed(!collapsed);
    };

    // useEffect(() => {
    //     const root = document.documentElement;
    //     if (staticConfig.primary_color !== ''){
    //         root?.style.setProperty("--custom_theme_color", `${staticConfig.primary_color}`);
    //     }
    // }, [staticConfig])

    console.log('primary_color', staticConfig.primary_color)

    ConfigProvider.config({
        theme: {
            primaryColor: `${staticConfig.primary_color ? staticConfig.primary_color : "#1890ff"}`,
        },
    });
    return (
        <div>
            <GlobalProvider config={staticConfig}>
                <Row>
                    <Col lg={collapsed ? 2 : 4} md={24} sm={24} xs={24} style={{ backgroundColor: "#fcfcfc" }} className="mt-4 mb-2">
                        <>
                            <Button
                                type="primary"
                                onClick={toggleCollapsed}
                                style={{
                                    marginBottom: 5,
                                    marginLeft: 22
                                }}
                                size="small"
                            >
                                {collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
                            </Button>
                            <Menu
                                defaultSelectedKeys={activeTab}
                                mode="inline"
                                theme="light"
                                inlineCollapsed={collapsed}
                                items={horizontalItems}
                                onClick={onMenuItemClick}
                                style={{ fontSize: '16px' }}
                            />
                        </>
                    </Col>
                    <Col lg={collapsed ? 22 : 20} md={24} sm={24} xs={24} style={{ backgroundColor: "#fcfcfc" }} className="mt-2 mb-2">
                        <>
                            {/* <Tabs
                        defaultActiveKey="home"
                        onChange={tabChange}
                        activeKey={activeTab}
                        size="small"
                        items={Items}
                    /> */}
                            {/* <Menu
                        defaultSelectedKeys={activeTab}
                        // defaultOpenKeys={['home']}
                        selectedKeys={[activeTab]}
                        mode="inline"
                        theme="light"
                        inlineCollapsed={collapsed}
                        items={horizontalItems}
                        onClick={onMenuItemClick}
                        style={{fontSize :'16px'}}
                    /> */}


                            {/* <Menu mode="horizontal" onClick={onMenuItemClick}>
                        <Menu.Item key="home" icon={<HomeIcon width="1.6rem" className="pr-2" />}>Home</Menu.Item>
                        <Menu.SubMenu key="salesactivity" onTitleClick={onMenuItemClick} icon={<SalesActivityIcon width="1.6rem" className="pr-2" />} title="Sales">
                        <Menu.Item key="sales1"> Sales1 </Menu.Item>
                        <Menu.Item key="sales2"> Sales2 </Menu.Item>
                        </Menu.SubMenu>
                        <Menu.SubMenu title="Demographic">
                        <Menu.Item key="some_key1">Location 1</Menu.Item>
                        <Menu.Item key="some_key2">Location 2</Menu.Item>
                        </Menu.SubMenu>
                    </Menu> */}
                        </>

                        {activeTab === "home" &&
                            <div >
                                <Row>
                                    <Col lg={5} md={24} sm={24} xs={24} style={{ backgroundColor: "#fcfcfc" }} className="mt-2 mb-2 pl-2">
                                        <CommonCard className='sideMenuCard cardPadding'>
                                            <StatLoader statIdentifier={"SIDE_MENU"} params={staticConfig} signal={signal} />
                                        </CommonCard>
                                    </Col>
                                    <Col lg={19} md={24} sm={24} xs={24} className="pt-2 px-2 mb-2">
                                        <Row className='mb-2'>
                                            <Col lg={24} md={24} sm={24} xs={24}>
                                                <CommonCard className='cardPadding'>
                                                    <StatLoader statIdentifier={"CURRENT_TOTAL_MEMBERS"} params={staticConfig} signal={signal} handleExplore={handleExplore} />
                                                </CommonCard>
                                            </Col>
                                        </Row>
                                        <CommonCard className='cardPadding'>
                                            <Row>
                                                <Col lg={24} md={24} sm={24} xs={24} className=" px-2">
                                                    <StatLoader statIdentifier={"MEMBERSHIP_SALES"} params={staticConfig} signal={signal} handleExplore={handleExplore} />
                                                </Col>
                                                {/* <Col lg={12} md={24} sm={24} xs={24} className="pl-3">
                                            <StatLoader statIdentifier={"RECENT_ORDERS"} params={staticConfig} signal={signal} />
                                        </Col> */}
                                            </Row>
                                        </CommonCard>
                                    </Col>
                                </Row>
                            </div>
                        }
                        {/* <StatLoader statIdentifier={"POPULAR_MEMBERSHIP_TYPES"} params={staticConfig} signal={signal} handleExplore={handleExplore}/> */}
                        {
                            activeTab === "members" &&
                            <div>
                                <Row>
                                    <Col lg={24} md={24} sm={24} xs={24} className="pt-1">
                                        <StatLoader statIdentifier={"TYPES_OF_MEMBERS"} params={staticConfig} signal={signal} subChartConfig={{ key: subMenuKey }} />
                                    </Col>
                                </Row>
                            </div>
                        }
                        {
                            activeTab === "salesactivity" &&
                            <div>
                                <Row>
                                    <Col lg={24} md={24} sm={24} xs={24} className="pt-1">
                                        <StatLoader statIdentifier={"SALES_ACTIVITY"} params={staticConfig} subChartConfig={{ key: subMenuKey }} loading={loading} />
                                    </Col>
                                </Row>
                            </div>
                        }
                        {
                            activeTab === "location" &&
                            <div>
                                <Row>
                                    <Col lg={24} md={24} sm={24} xs={24} className="pt-1">
                                        <StatLoader statIdentifier={"LOCATION"} params={staticConfig} subChartConfig={{ key: subMenuKey }} />
                                    </Col>
                                </Row>
                            </div>
                        }
                        {
                            activeTab === "trend" &&
                            <div>
                                <Row>
                                    <Col lg={24} md={24} sm={24} xs={24} className="pt-1">
                                        <StatLoader statIdentifier={"TREND"} params={staticConfig} subChartConfig={{ key: subMenuKey }} />
                                    </Col>
                                </Row>
                            </div>
                        }
                        {
                            (activeTab === "transition" || activeTab==="analytics") &&
                            <div>
                                <Row>
                                    <Col lg={24} md={24} sm={24} xs={24} className="pt-1">
                                        <StatLoader statIdentifier={"TRANSITION"} params={staticConfig} subChartConfig={{ key: subMenuKey }} />
                                    </Col>
                                </Row>
                            </div>
                        }
                    </Col>
                </Row>
            </GlobalProvider>
        </div>
    )
};

export default MembershipReportingDashboard;