import React, { useState } from "react";
import { Radio } from "antd";
import { AreaChartOutlined, LineChartOutlined, TableOutlined } from "@ant-design/icons";

const VisualizationType = ({
    active,
    setActive,
    hasCompare,
    showByConfig,
    showVisualizationType,
    visualizationType }) => {

    const handleViewChange = (e) => {
        setActive(e.target.value)
    }

    return (
        <>
            {showByConfig ? (
                showVisualizationType ? (
                    <Radio.Group value={active} onChange={handleViewChange}>
                        {visualizationType.includes("SIMPLE") && (
                            <Radio.Button value="simple"><LineChartOutlined /> Chart</Radio.Button>
                        )}

                        {visualizationType.includes("DETAILED") &&
                            hasCompare !== true && (
                                <Radio.Button value="detailed"><AreaChartOutlined /> Detailed Chart</Radio.Button>
                        )}

                        {visualizationType.includes("TABLE") && (
                            <Radio.Button value="table"><TableOutlined /> Table</Radio.Button>
                        )}
                    </Radio.Group>
                ) : (
                    <></>
                )
            ) : (
                <Radio.Group value={active} onChange={handleViewChange}>
                    <Radio.Button value="simple"><LineChartOutlined /> Chart</Radio.Button>
                    {hasCompare !== true && (
                        <Radio.Button value="detailed"><AreaChartOutlined /> Detailed Chart</Radio.Button>
                    )}
                    <Radio.Button value="table"><TableOutlined /> Table</Radio.Button>
                </Radio.Group>
            )}
        </>
    )
}
export default VisualizationType;