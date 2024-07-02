import React, { useContext, useEffect, useState } from 'react'
import { Tabs } from 'antd'
import moment from 'moment';
import { SalesChartWidget } from '@/CorporateMembershipReportingV2/SalesChartWidget';
import GlobalContext from '@/CorporateMembershipReportingV2/context/MemberContext';
import { calculateMonthDays, get90PriorDate, getCurrentDate } from '@/AnalyticsAll/StatComponents/util';

const { TabPane } = Tabs

const SalesActivity = (props) => {
    const [activeTab, setActiveTab] = useState("salesByVolume");
    const { selectedOptions, setSelectedDates, setDefaultDates} = useContext(GlobalContext);

    useEffect(() => {
        if(selectedOptions === 'date' || selectedOptions === 'month'){
            setDefaultDates([moment().startOf('month').subtract(calculateMonthDays(2), "days"), moment()])
            setSelectedDates([get90PriorDate(), getCurrentDate()])
        } else if(selectedOptions === "year"){
            setDefaultDates([moment().subtract(1, 'year').startOf('year'), moment()])
            setSelectedDates([moment().startOf('year').subtract(1, "year").format('DD/MM/YYYY'), getCurrentDate()])
        } else if (selectedOptions === "week"){
            setDefaultDates([moment().startOf('month').subtract(calculateMonthDays(2), "days").startOf('week'), moment()])
            setSelectedDates([moment().startOf('month').subtract(calculateMonthDays(2), "days").startOf('week').format('DD/MM/YYYY'), getCurrentDate()])
            // setDefaultDates([moment().subtract(2, "months").startOf('week'), moment()])
            // setSelectedDates([moment().subtract(2, "months").startOf('week').format('DD/MM/YYYY'), getCurrentDate()])
        } else {
            setDefaultDates([moment().startOf('quarter').subtract(1, "quarter"), moment()])
            setSelectedDates([moment().startOf('quarter').subtract(1, "quarter").format('DD/MM/YYYY'),getCurrentDate()])
        }
    }, [selectedOptions])

    const tabChange = (screen) => {
        setActiveTab(screen)
    }
    
    const tabItems = [
        {
            screen: "salesByVolume",
            screenName: "Sales By Volume",
        },
        {
            screen: "salesByRevenue",
            screenName: "Sales By Revenue",
        },
        {
            screen: "reportTable",
            screenName: "Report Table",
        },
    ]

    return (
        <div className='ml-6 mr-6'>
            <Tabs defaultActiveKey="salesByVolume" onChange={tabChange} activeKey={activeTab}>
                {tabItems.map(tab => {
                    return (<TabPane className='sales-tab' tab={tab.screenName} key={tab.screen}></TabPane>)
                })}
            </Tabs>
            {activeTab === "salesByVolume" &&
                <SalesChartWidget {...props}  type={"TOTAL_MEMBERS"} activeTab={activeTab}/>
            }
            {activeTab === "salesByRevenue" &&
                <SalesChartWidget {...props} type={"TOTAL_REVENUE"} activeTab={activeTab} />
            }
            {activeTab === 'reportTable' &&
                <SalesChartWidget {...props}  type={'REPORT_TABLE'} />
            }
        </div>
    )
}

export default SalesActivity