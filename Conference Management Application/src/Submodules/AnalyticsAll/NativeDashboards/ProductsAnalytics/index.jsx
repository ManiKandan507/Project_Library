import React, { useState, useEffect } from "react";
import StatLoader from '@/AnalyticsAll/StatComponents/StatLoader';

import "antd/dist/antd.css";
import { Tabs, Row, Col } from "antd";
import '@/AnalyticsAll/NativeDashboards/ProductsAnalytics/custom.css'
import { ReactComponent as Home } from '@/AnalyticsAll/NativeDashboards/ProductsAnalytics/assets/icons/Home.svg'
import { ReactComponent as User } from '@/AnalyticsAll/NativeDashboards/ProductsAnalytics/assets/icons/User.svg';
import { ReactComponent as File } from '@/AnalyticsAll/NativeDashboards/ProductsAnalytics/assets/icons/File.svg';
import { formatDate, get90PriorDate, getCurrentDate } from "@/AnalyticsAll/StatComponents/utils";
import CommonDatePicker from "@/AnalyticsAll/StatComponents/common/CommonDatePicker";

const ProductsAnalyticsDashboard = ({ staticConfig }) => {
   const [dates, setDates] = useState([get90PriorDate(), getCurrentDate()])
   const [activeTab, setActiveTab] = useState("home")
   const { TabPane } = Tabs;

   const tabItems = [
      {
         screen: "home",
         screenName: "Home",
         IconMenu: Home
      },
      {
         screen: "user",
         screenName: "User",
         IconMenu: User
      },
      {
         screen: "file",
         screenName: "File",
         IconMenu: File
      },
   ];

   const tabChange = (screen) => {
      setActiveTab(screen)
   }

   const handleDate = (value, dateStrings) => {
      setDates([
         dateStrings?.[0] ? formatDate(dateStrings?.[0]) : "",
         dateStrings?.[1] ? formatDate(dateStrings?.[1]) : ""
      ]);
   }

   const handleExplore = (e) => {
      setActiveTab(e)
   }

   useEffect(() => {
      const element = document.documentElement;
      if (element) {
        let primary_color = staticConfig.primary_color;
        let header_bg = staticConfig.header_bg;
        if(primary_color)element.style.setProperty('--primary_color', primary_color); 
        if(header_bg)element.style.setProperty('--header_bg', header_bg); 
      }
    }, [staticConfig])
   return (
      <>
         <div>
            <Tabs
               defaultActiveKey="home"
               onChange={tabChange}
               activeKey={activeTab}
               size="small"
               style={{"background-color":"var(--header_bg)"}}
              
            >
               {tabItems.map((tab) => {
                  const { IconMenu } = tab
                  return (
                     <TabPane
                        tab={<>{<IconMenu width="1.6rem" className="pr-2" style={{ fill: 'red' }} />}<span className='userTabs'>{tab.screenName}</span></>}
                        key={tab.screen}
                     >
                     </TabPane>
                  )
               })}
            </Tabs>
         </div>
         <div>
            {activeTab === "home" &&
               <div >
                  <Row>
                     <Col xl={5} lg={6} md={24} sm={24} xs={24} className="pt-4 bg-color">
                        <StatLoader statIdentifier={"STATISTICS_INFO"} params={staticConfig} dates={dates} />
                     </Col>
                     <Col xl={10} lg={9} md={24} sm={24} xs={24} className="px-2 py-4 chart-color">
                        <div className="mr-3 mb-1 tableChart" style={{ textAlign: "right" }}>
                           <CommonDatePicker handleDate={handleDate} dates={dates} />
                        </div>
                        <StatLoader statIdentifier={"ACTIVE_USER"} params={staticConfig} dates={dates} />
                        <StatLoader statIdentifier={"BANDWIDTH_CHART"} params={staticConfig} dates={dates} />
                     </Col>
                     <Col xl={9} lg={9} md={24} sm={24} xs={24} className='px-4 py-4 bg-color'>
                        <StatLoader statIdentifier={"MOST_ACTIVE_USERS"} params={staticConfig} dates={dates} handleExplore={handleExplore} />
                        <StatLoader statIdentifier={"MOST_POPULAR_FILES"} params={staticConfig} dates={dates} handleExplore={handleExplore} />
                     </Col>
                  </Row>
               </div>
            }
            {
               activeTab === "user" &&
               <div>
                  <StatLoader statIdentifier={"ACTIVE_USER_BY_MONTH"} params={staticConfig} dates={dates} />
               </div>
            }
            {
               activeTab === "file" &&
               <div className={window.innerHeight > 768 ? "h-100" : ""}>
                  <Row>
                     <Col xl={5} lg={6} sm={24} md={24} xs={24} className={`pt-4 bg-color`} style={{ height: window.innerHeight > 768 ? window.innerHeight : "" }}>
                        <StatLoader statIdentifier={"FILE_INFO_SUMMARY"} params={staticConfig} dates={dates} />
                     </Col>
                     <Col xl={19} lg={18} sm={24} md={24} xs={24}>
                        <StatLoader statIdentifier={"FILE_CHART"} params={staticConfig} dates={dates} />
                     </Col>
                  </Row>
               </div>
            }
         </div>
      </>
   )
}


export default ProductsAnalyticsDashboard;


