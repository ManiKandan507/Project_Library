import React, { useEffect, useState } from "react";
import { Alert,Avatar,Card,Space } from "antd";

import { StarOutlined } from "@ant-design/icons";
import { isEmpty } from "lodash";
import TypesOfMembers from "./TypesOfMembers";

const MembershipDistributionLanding = props => {

  const [showDistributionChart, setShowDistributionChart] = useState(false);

  const [renderChart, setRenderChart] = useState(null);

  const handleShowChart = e => {
    setRenderChart({ ...e });
    setShowDistributionChart(true);
  };

  useEffect(() => {
    if (!isEmpty(props.subChartConfig.key)) {
      let tempChart = {}
      chartCards.forEach((item) => {
        if(item.key == props.subChartConfig.key){
          tempChart = {...item}
      }})
      if(!isEmpty(tempChart)){
        setRenderChart({ ...tempChart });
        setShowDistributionChart(true);
      }
    }
  }, [props.subChartConfig]);
  const chartCards = [
    {
      label: "Current Members",
      description: "View current members as of today",
      key: "currentmembers",
    },
    {
      label: "Expired Members",
      description: "View expired members within a date range",
      key: "expiredmembers",
    },
    {
      label: "New Members",
      description: "View new members within a date range",
      key: "newmembers",
    },
    {
      label: "Renewing Members",
      description: "View renewing members within a date range",
      key: "renewingMembers",
    },
  ];

  return (
    <>
      {showDistributionChart ? (
        <TypesOfMembers
          showDistributionDashboard={val => {
            setShowDistributionChart(val);
          }}
          renderChart={renderChart}
          {...props}
        />
      ) : (
        <>
          <Space
            direction="vertical"
            style={{
              display: "flex",
              paddingLeft: "3%",
              paddingRight: "3%",
              paddingTop: "1%",
            }}
          >
            <div style={{ paddingBottom: "1%" }}>
              <Alert
                message={
                  <div>Click on the card to view specific member report.</div>
                }
                type="info"
                showIcon
              />
            </div>

            <div>
              {chartCards.map((value, i) => {
                return (
                  <div key={i}>
                    <Card
                      style={{
                        marginLeft: "0.2%",
                        marginBottom: "0.5%",
                      }}
                      key={value.key}
                      size="small"
                      hoverable
                      bordered={true}
                      extra={
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                          }}
                        >
                          <StarOutlined style={{ paddingLeft: "5px" }} />
                        </div>
                      }
                      onClick={() => handleShowChart(value)}
                      title={
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                          }}
                        >
                          <div style={{ paddingRight: "10px" }}>
                            <Avatar
                              size={32}
                              shape="square"
                              style={{
                                backgroundColor: "#dbdbdb",
                                fontSize: 16,
                                width: 32,
                              }}
                            >
                              {value.label.charAt(0)}
                            </Avatar>
                          </div>
                          <strong>{value.label}</strong>
                        </div>
                      }
                    >
                      <p>{value.description}</p>
                    </Card>
                  </div>
                );
              })}
            </div>
          </Space>
        </>
      )}
    </>
  );
};

export default MembershipDistributionLanding;
