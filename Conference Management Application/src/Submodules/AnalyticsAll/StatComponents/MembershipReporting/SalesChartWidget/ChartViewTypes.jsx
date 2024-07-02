import React,{useState} from "react";
import { Tabs } from "antd";

const ChartViewTypes = ({showByConfig, showChartTypes, chartTypes, activeTab, setActiveTab}) => {

    const [tabItems] = useState(() => {
        if (showByConfig) {
            const tabs = chartTypes.map(chartType => {
                if (chartType === "VOLUME") {
                    return {
                        key: "salesByVolume",
                        label: "Sales By Volume",
                    };
                }
                if (chartType === "REVENUE") {
                    return {
                        key: "salesByRevenue",
                        label: "Sales By Revenue",
                    };
                }
                if (chartType === "TABLE") {
                    return {
                        key: "reportTable",
                        label: "Report Table",
                    };
                }
                return null;
            });
            return tabs;
        } else {
            return [
                {
                    label: "Sales By Volume",
                    key: "salesByVolume"
                },
                {
                    label: "Sales By Revenue",
                    key: "salesByRevenue"
                },
                {
                    label: "Report Table",
                    key: "reportTable"
                },
            ];
        }
    });

    const tabChange = screen => {
        setActiveTab(screen);
    };

    return (
        <>
            {showByConfig && !showChartTypes ? (
                <></>
            ) : (
                <Tabs
                    defaultActiveKey={activeTab}
                    onChange={tabChange}
                    activeKey={activeTab}
                    className='sales-activity-tab mt-2 '
                    items={tabItems}
                >
                    {/* {tabItems.map(tab => {
                        return (
                            <TabPane
                                className="sales-tab"
                                tab={tab.screenName}
                                key={tab.screen}
                            ></TabPane>
                        );
                    })} */}
                </Tabs>
            )}
        </>
    )
}

export default ChartViewTypes;