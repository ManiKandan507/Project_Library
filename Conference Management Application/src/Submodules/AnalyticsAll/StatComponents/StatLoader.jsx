import React from "react";
// Import all available stat components.
import BandWidthChart from "@/AnalyticsAll/StatComponents/BandWidthChart";
import ActiveUserChart from "@/AnalyticsAll/StatComponents/ActiveUserChart";
import Statistics from "@/AnalyticsAll/StatComponents/StatisticsInfo";
import { MostActiveUsers } from "@/AnalyticsAll/StatComponents/MostActiveUsers";
import { MostPopularFiles } from "@/AnalyticsAll/StatComponents/MostPopularFiles";
import { ActiveUserByMonthChart } from '@/AnalyticsAll/StatComponents/ActiveUserByMonthChart'
import { GlobalSummary } from '@/AnalyticsAll/StatComponents/GlobalSummary'
import FileChart from '@/AnalyticsAll/StatComponents/FileChart'

import { CurrentMembers } from "@/MembershipReportingV2/CurrentMembers";
import { MembershipSales } from "@/MembershipReportingV2/MembershipSales";
import { PopularMembershipTypes } from "@/MembershipReportingV2/PopularMembershipTypes";
import { RecentOrders } from "@/MembershipReportingV2/RecentOrders";
import SampleStat from '@/MembershipReportingV2/SampleStat';
import SideMenu from '@/MembershipReportingV2/SideMenu'
import TypesOfMembers from "@/MembershipReportingV2/TypesOfMembers";
import SalesActivity from "@/MembershipReportingV2/SalesActivity";
import SalesActivityLanding from "@/MembershipReportingV2/SalesActivityLanding";
import LocationMap from "@/MembershipReportingV2/LocationReport";
import Trend from "@/MembershipReportingV2/Trend";
import Transition from "@/MembershipReportingV2/Transition";
import MembershipDistributionLanding from "./MembershipReporting/MembershipDistributionLanding";

// Register imported stat components.
const StatProvider = {
    STATISTICS_INFO: {
        ComponentRef: Statistics,
    },
    ACTIVE_USER: {
        ComponentRef: ActiveUserChart,
    },
    BANDWIDTH_CHART: {
        ComponentRef: BandWidthChart,
    },
    MOST_ACTIVE_USERS: {
        ComponentRef: MostActiveUsers
    },
    MOST_POPULAR_FILES: {
        ComponentRef: MostPopularFiles
    },
    ACTIVE_USER_BY_MONTH: {
        ComponentRef: ActiveUserByMonthChart
    },
    FILE_INFO_SUMMARY: {
        ComponentRef: GlobalSummary
    },
    FILE_CHART: {
        ComponentRef: FileChart
    },
    SAMPLE_STAT: {
        ComponentRef: SampleStat,
    },
    SIDE_MENU: {
        ComponentRef: SideMenu,
    },
    CURRENT_TOTAL_MEMBERS: {
        ComponentRef: CurrentMembers,
    },
    MEMBERSHIP_SALES: {
        ComponentRef: MembershipSales,
    },
    POPULAR_MEMBERSHIP_TYPES: {
        ComponentRef: PopularMembershipTypes,
    },
    RECENT_ORDERS: {
        ComponentRef: RecentOrders,
    },
    TYPES_OF_MEMBERS: {
        ComponentRef: MembershipDistributionLanding,
    },
    SALES_ACTIVITY: {
        ComponentRef: SalesActivityLanding,
    },
    LOCATION:{
        ComponentRef: LocationMap,
    },
    TREND: {
        ComponentRef: Trend,
    },
    TRANSITION: {
        ComponentRef: Transition,
    }
};

const StatLoader = (props) => {
    console.log('props', props)
    let ToLoadRef;
    if (StatProvider.hasOwnProperty(props.statIdentifier)) {
        ToLoadRef = StatProvider[props.statIdentifier].ComponentRef;
    }
    if (ToLoadRef) {
        return <ToLoadRef params={props.params} signal={props.signal} handleExplore={props.handleExplore} handleDateChange={(data) => props.handleDateChange(data)} dates={props.dates} subChartConfig={props?.subChartConfig} loading={props.loading}></ToLoadRef>;
    } else {
        return <p>Error Loading...</p>;
    }
}

export default StatLoader;
