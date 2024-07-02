import React, { useContext, useEffect, useState } from "react";
import SalesActivity from "./SalesActivity";
import { Alert, Avatar, Card, Col, Collapse, Divider, List, Row, Space, Tag, Tooltip } from "antd";
import { calculateDate, salesConfigs } from "./util/helper";
import { config } from "react-transition-group";
import _groupBy from "lodash/groupBy";
import _sortBy from "lodash/sortBy";
import { BarChartOutlined, BorderOutlined, CaretRightOutlined, DollarOutlined, LineChartOutlined, StarOutlined, TableOutlined } from "@ant-design/icons";
import { stringToColour } from "../util";
import { textToColour } from "./SalesChartWidget/helper";
import moment from "moment";
import { isEmpty } from "lodash";
import GlobalContext from "./context/MemberContext";

const { Meta } = Card;
const { Panel } = Collapse;
const SalesActivityLanding = props => {
  const [showSalesActivityChart, setShowSalesActivityChart] = useState(false);
  const [chartConfig, setChartConfig] = useState(null);

  const parseConfigShowChart = reportConfig => {
    const parsedConfig = parseSalesActivityChartConfig(reportConfig);
    setChartConfig(parsedConfig);
    setShowSalesActivityChart(true);
  };

  const parseSalesActivityChartConfig = config => {
    return {
      ...config,
      dateTime: {
        ...config.dateTime,
        startDate: config?.dateTime?.startDate ? calculateDate(config.dateTime.startDate, "startDate") : "",
        endDate: config?.dateTime?.endDate ? calculateDate(config.dateTime.endDate, "endDate") : "",
      },
    };
  };

  const constructedData = salesConfigs.map((val) => {
    let icons = []

    if (val.compareMode) {
      icons.push(<LineChartOutlined />)
    }
    if (!val.compareMode) {
      icons.push(<BarChartOutlined />)
    }
    if (val.chartTypes && val.chartTypes.includes('TABLE')) {
      icons.push(<TableOutlined />)
    }
    if (val.chartTypes && val.chartTypes.includes('REVENUE')) {
      icons.push(<DollarOutlined />)
    }

    return {
      ...val,
      categoryName: val.category.name,
      categoryID: val.category.category_id,
      actionIcons: icons
    }
  })

  useEffect(() => {
    if (!isEmpty(props.subChartConfig.key)) {
      let tempConfig = {}
      constructedData.forEach((item) => {
        if (item.reportID == props.subChartConfig.key) {
          tempConfig = { ...item }
        }
      })
      if (!isEmpty(tempConfig)) {
        parseConfigShowChart(tempConfig)
      }
    }
  }, [props.subChartConfig])
  const categoryGroupedData = _groupBy(_sortBy(constructedData, 'categoryID'), 'categoryName')

  const categoryName = Object.keys(categoryGroupedData)

  const [activeCollapse, setActiveCollapse] = useState(categoryName[0]);
  const onCollapseChange = (key, config) => {
    //TODO: retain the collapse whenever the user comes back to the dashboard
    // console.log("onCollapseChange",key,config)
  }

  return (
    <>
      {showSalesActivityChart ? (
        <SalesActivity
          showSalesDashboard={val => {
            setShowSalesActivityChart(val);
          }}
          {...props}
          config={chartConfig}
        />
      ) : (
        <>
          <Space
            direction="vertical"
            className="d-flex"
            style={{ paddingLeft: "3%", paddingRight: "3%", paddingTop: "1%" }}
          >
            <div style={{ paddingBottom: "1%" }}>
              <Alert message={<div>
                Click on the categories to view specific sales charts.
                <br />
                <strong>Current Year </strong> shows the chart from {moment(new Date(new Date().getFullYear(), 0, 1)).format("MMM-DD-YYYY")} till today ({moment().format(
                  "MMM-DD-YYYY"
                )}).
                <br />
                <strong>Membership Year</strong> can be customized to accommodate mid-year memberships by adjusting the chart accordingly.
                <br />
                You can mark the chart as a favorite to have it displayed at the top.
              </div>} type="info" showIcon
              />

            </div>
            {categoryName.map((config, index) => {
              return (
                <div key={index}>
                  <>
                    {/* <Collapse
                  style={{
                    boxShadow: "2px 4px 12px 3px rgba(208, 216, 243, 3.6)",
                  }}
                  expandIcon={({ isActive }) => (
                    <CaretRightOutlined rotate={isActive ? 90 : 0} />
                  )}
                  key={index}
                  onChange={ev=> onCollapseChange(ev,config)}
                  defaultActiveKey={[0]}
                > */}
                    {/* <Panel header={<div>{config}</div>} key={index}> */}
                  </>
                  {categoryGroupedData[config].map((value, i) => {
                    return (
                      <div key={i}>
                        <Card
                          style={{
                            marginLeft: "0.2%",
                            marginBottom: "0.5%",
                          }}
                          key={i}
                          size="small"
                          hoverable
                          bordered={true}
                          extra={
                            <div className="d-flex align-center">
                              {value.tags && (
                                <>
                                  {value.tags.map((tag, ind) => {
                                    return (
                                      <Tag
                                        color={textToColour(
                                          `${tag.toLowerCase()}`
                                        )}
                                        key={ind}
                                      >
                                        {tag}
                                      </Tag>
                                    );
                                  })}
                                </>
                              )}
                              <StarOutlined style={{ paddingLeft: "5px" }} />
                            </div>
                          }
                          onClick={() => parseConfigShowChart(value)}
                          title={
                            <div className="d-flex align-center">
                              <div style={{ paddingRight: "10px" }}>
                                {value.artworkLink ? (
                                  <img src={`${value.artworkLink}`} />
                                ) : (
                                  <Avatar
                                    size={32}
                                    shape="square"
                                    style={{
                                      backgroundColor: "#dbdbdb",
                                      fontSize: 16,
                                      width: 32,
                                    }}
                                  >
                                    {value.reportLabel.charAt(0)}
                                  </Avatar>
                                )}
                              </div>
                              <strong>{value.reportLabel}</strong>
                            </div>
                          }
                        >
                          <p>{value.description}</p>
                        </Card>
                      </div>
                    );
                  })}
                  {/* </Panel> */}
                  {/* </Collapse> */}
                </div>
              );
            })}
          </Space>
        </>
      )}
    </>
  );
};

export default SalesActivityLanding;
