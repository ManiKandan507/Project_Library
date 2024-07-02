import "@/AnalyticsAll/App.css";

import ProductsAnalyticsDashboard from "@/AnalyticsAll/NativeDashboards/ProductsAnalytics";
import MembershipReportingDashboard from "@/AnalyticsAll/NativeDashboards/MembershipReporting";
import DefaultDashboard from "@/AnalyticsAll/NativeDashboards/Default";
import "@/AnalyticsAll/NativeDashboards/MembershipReporting/assets/css/utility.min.css";
import CorporateMembershipReportingDashboard from '@/AnalyticsAll/NativeDashboards/CorporateMembershipReporting';
import DonationNativeDashboard from './NativeDashboards/DonationAdminDirectory/index';
import GroupManagementNativeDashboard from "./NativeDashboards/GroupManagement";

// Register Native Dashboards.

const nativeDashboards = {
  default: DefaultDashboard,
  ProductsAnalytics: ProductsAnalyticsDashboard,
  MembershipReporting: MembershipReportingDashboard,
  CorporateMembershipReporting:CorporateMembershipReportingDashboard,
  DonationAdminReporting: DonationNativeDashboard,
  GroupManagement: GroupManagementNativeDashboard
};
function App({ staticConfig }) {
  const RenderDashboard = nativeDashboards[staticConfig.dashboard || "default"];
  return (
      <div className="App">
        <RenderDashboard staticConfig={staticConfig} />
      </div>
  );
}

export default App;
