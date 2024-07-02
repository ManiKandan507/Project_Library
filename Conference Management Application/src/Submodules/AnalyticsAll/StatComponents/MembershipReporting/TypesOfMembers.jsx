import React, { useState } from 'react'
import { Button, Tabs } from 'antd'
import CurrentMembers from '@/MembershipReportingV2/MemberChartWidget/CurrentMembers';
import ExpiredMembers from '@/MembershipReportingV2/MemberChartWidget/ExpiredMembers';
import NewMembers from '@/MembershipReportingV2/MemberChartWidget/NewMembers';
import RenewMembers from '@/MembershipReportingV2/MemberChartWidget/RenewMembers';
import { isEmpty } from 'lodash';
import { useEffect } from 'react';
import { LeftOutlined } from '@ant-design/icons';
import { useContext } from 'react';
import GlobalContext from './context/MemberContext';
import EditGroups from './common/EditGroups';

const { TabPane } = Tabs
let controller = new AbortController();
let signal = controller.signal;

const TypesOfMembers = (props) => {

  const { groups_array } = props?.params
  const [activeTab, setActiveTab] = useState("currentmembers");
  const [memberSignal, setMemberSignal] = useState(props.signal)
  const {
    isGroups
  } = useContext(GlobalContext);

  const tabChange = (screen) => {
    controller.abort();
    controller = new AbortController();
    signal = controller.signal;
    if (screen === "currentmembers") {
      setMemberSignal(signal)
    }
    setActiveTab(screen)
  }

  const items = [
    {
      label: "Current Members",
      key: "currentmembers"
    },
    {
      label: "Expired Members",
      key: "expiredmembers"
    },
    {
      label: "New Members",
      key: "newmembers"
    },
    {
      label: "Renewing Members",
      key: "renewingMembers"
    },
  ]
  useEffect(() => {
    if (!isEmpty(props.renderChart.key)) {
      setActiveTab(props.renderChart.key)
    }
  }, [props.renderChart])
  return (
    <>
      <div className='ml-6 mr-6'>
        {/* <Button
          onClick={() => {
            props.showDistributionDashboard(false);
          }}
          icon={<LeftOutlined size={20} />}
          type="secondary"
        /> */}
        <div
          style={{
            display: "flex",
            flexDirection: "row",
            alignItems: "baseline",
            gap: "15px",
          }}
        >
          <div>
            <h2 className="sales-title primary-color" style={{ marginBottom: "0.1rem", marginTop: "0.1rem" }}>
              {props.renderChart.label}
            </h2>
            <p style={{ fontSize: "13px", marginBottom: 0 }}>
              {props.renderChart.description}
            </p>
          </div>
          <div className='ml-auto mr-0'>
            {!isGroups && <EditGroups groupsArray={groups_array} />}
          </div>
        </div>
        {/* <Tabs defaultActiveKey="currentmembers" onChange={tabChange} activeKey={activeTab} items={items} /> */}
        {activeTab === "currentmembers" &&
          <CurrentMembers {...props} type={"CURRENT_MEMBERS"} signal={memberSignal} color={"#0673b1"} />
        }
        {activeTab === "expiredmembers" &&
          <ExpiredMembers {...props} type={"EXPIRED_MEMBERS"} signal={signal} color={"#f5222d"} />
        }
        {activeTab === 'newmembers' &&
          <NewMembers {...props} type={"NEW_MEMBERS"} signal={signal} color={"#52c41a"} />
        }
        {activeTab === 'renewingMembers' &&
          <RenewMembers {...props} type={"RENEW_MEMBERS"} signal={signal} color={"#faad14"} />
        }
      </div>
    </>
  )
}

export default TypesOfMembers