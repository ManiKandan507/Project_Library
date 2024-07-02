import React, { useState } from 'react'
import { Tabs } from 'antd'
import CurrentMembers from '@/CorporateMembershipReportingV2/MemberChartWidget/CurrentMembers';
import ExpiredMembers from '@/CorporateMembershipReportingV2/MemberChartWidget/ExpiredMembers';
import NewMembers from '@/CorporateMembershipReportingV2/MemberChartWidget/NewMembers';
import RenewMembers from '@/CorporateMembershipReportingV2/MemberChartWidget/RenewMembers';

const { TabPane } = Tabs
let controller = new AbortController();
let signal = controller.signal;

const TypesOfMembers = (props) => {
    const [activeTab, setActiveTab] = useState("currentmembers");
    const [memberSignal, setMemberSignal] = useState(props.signal)

    const tabChange = (screen) => {
        controller.abort();
        controller = new AbortController();
        signal = controller.signal;
        if(screen === "currentmembers"){
            setMemberSignal(signal)
        }
        setActiveTab(screen)
    }

    const tabItems = [
        {
            screen: "currentmembers",
            screenName: "Current Members",
        },
        {
            screen: "expiredmembers",
            screenName: "Expired Members",
        },
        {
            screen: "newmembers",
            screenName: "New Members",
        },
        {
            screen: "renewingMembers",
            screenName: "Renewing Members",
        }
    ]

    return (
        <div className='ml-6 mr-6'>
            <Tabs defaultActiveKey="currentmembers" onChange={tabChange} activeKey={activeTab}>
                {tabItems.map(tab => {
                    return (<TabPane className='member-tab' tab={tab.screenName} key={tab.screen}></TabPane>)
                })}
            </Tabs>
            {activeTab === "currentmembers" &&
                <CurrentMembers {...props} type={"CURRENT_MEMBERS"} signal={memberSignal} color={"#0673b1"}/>
            }
            {activeTab === "expiredmembers" &&
                <ExpiredMembers {...props} type={"EXPIRED_MEMBERS"} signal={signal}  color={"#f5222d"}/>
            }
            {activeTab === 'newmembers' &&
                <NewMembers {...props} type={"NEW_MEMBERS"} signal={signal} color={"#52c41a"}/>
            }
            {activeTab === 'renewingMembers' &&
                <RenewMembers {...props} type={"RENEW_MEMBERS"} signal={signal} color={"#faad14"}/>
            }
        </div>
    )
}

export default TypesOfMembers