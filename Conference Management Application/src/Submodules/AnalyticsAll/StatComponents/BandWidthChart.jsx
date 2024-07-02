import React from "react";
import { Badge, Tooltip } from 'antd';
import { useBandwithChart } from '@/AnalyticsAll/StatComponents/hooks/BandwithChartHook';
import ResponsiveLineChart from '@/AnalyticsAll/StatComponents/common/CustomLineChart'
import { lineChartData } from "@/AnalyticsAll/StatComponents/utils";
import CommonSpinner from "@/AnalyticsAll/StatComponents/common/CommonSpinner";
import { ReactComponent as Information } from "@/AnalyticsAll/NativeDashboards/ProductsAnalytics/assets/icons/Information.svg";

const BandwidthChart = props => {
  const {
    params: { appdir },
    dates,
    isFileTab = false,
  } = props;
  const { bandWidthUsageData, loading } = useBandwithChart(appdir, dates);

  const renderTitle = () => {
    if (!isFileTab) {
      return <div className="ml-2 d-flex">
        <div className="mr-2 card-title">{"MONTHLY BANDWIDTH USAGE"}</div>
        <Tooltip title="Monthly Bandwidth Usage" placement="right">
          <Information className='mb-3' style={{ width: "1.3rem" }} />
        </Tooltip>
      </div>
    }
    return null
  }

  const renderBadge = () => {
    if (!isFileTab) {
      return <div className="d-flex mt-1 ml-2">
        <Badge color={"var( --clr-purple)"} style={{ fontSize: "13px", width: "15px", height: "16px" }} className="badgeIcon" />
        <div className="ml-2 chartText">Bandwidth Usage</div>
      </div>
    }
    return null
  }

  return (
    <div className="mt-5">
      {renderTitle()}
      {renderBadge()}
      <CommonSpinner loading={loading} >
        <div
          ref={props.chartRef}
        >
          <ResponsiveLineChart
            data={lineChartData(
              "bandwidth",
              bandWidthUsageData,
              "bandwidth_usage"
            )}
            colors={{ scheme: "purple_orange" }}
            loading={loading}
            curve={"linear"}
            label="GB"
            type="bandwidth_usage"
          />
        </div>
      </CommonSpinner>
    </div>
  );
};

export default BandwidthChart;
