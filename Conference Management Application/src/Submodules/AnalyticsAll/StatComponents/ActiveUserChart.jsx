import React, { useEffect } from 'react'
import { Tooltip, Badge } from 'antd';
import { useMonthlyActiveUser } from '@/AnalyticsAll/StatComponents/hooks/MonthlyActiveUserHook'
import ResponsiveLineChart from '@/AnalyticsAll/StatComponents/common/CustomLineChart'
import { lineChartData } from '@/AnalyticsAll/StatComponents/utils';
import CommonSpinner from '@/AnalyticsAll/StatComponents/common/CommonSpinner';
import { ReactComponent as Information } from "@/AnalyticsAll/NativeDashboards/ProductsAnalytics/assets/icons/Information.svg";
import _groupBy from 'lodash/groupBy';
import _map from 'lodash/map';

const ActiveUserChart = (props) => {
  const { params: { appdir }, dates } = props
  let { activeUser, ChartLoading } = useMonthlyActiveUser(appdir, dates);

  return (
    <>
      <div className="ml-2 d-flex">
        <div className="mr-2 card-title">{"MONTHLY ACTIVE USERS"}</div>
        <Tooltip title="Monthly Active Users" placement="right">
          <Information className='mb-3' style={{ width: "1.3rem" }} />
        </Tooltip>
      </div>
      <div className="d-flex ml-2">
        <Badge color={"var(--clr-green)"} style={{ fontSize: "13px", width: "15px", height: "16px" }} />
        <div className="ml-2 chartText" style={{ fontSize: "14px", color: "var(--clr-violet)" }}>
          No of Users
        </div>
      </div>
      <CommonSpinner loading={ChartLoading} >
        <ResponsiveLineChart
          data={lineChartData("active_user", activeUser, "No Of Users")}
          loading={ChartLoading}
          curve="linear"
          yFormat="<(5.0f"
          label="Users"
          colors={{ scheme: "set3" }}
          type="active_users"
        />
      </CommonSpinner>
    </>
  );
}

export default ActiveUserChart