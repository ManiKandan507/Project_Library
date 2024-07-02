// Import all available stat components.
import React from "react";
import { CurrentMembers } from "@/CorporateMembershipReportingV2/CurrentMembers";
import { MembershipSales } from "@/CorporateMembershipReportingV2/MembershipSales";
import { PopularMembershipTypes } from "@/CorporateMembershipReportingV2/PopularMembershipTypes";
import SideMenu from "@/CorporateMembershipReportingV2/SideMenu";
import TypesOfMembers from "@/CorporateMembershipReportingV2/TypesOfMembers";
import SalesActivity from "@/CorporateMembershipReportingV2/SalesActivity";
import LocationMap from "@/CorporateMembershipReportingV2/LocationReport";
import Trend from "@/CorporateMembershipReportingV2/Trend";

import { RecentOrders } from "@/MembershipReportingV2/RecentOrders";
import SampleStat from '@/MembershipReportingV2/SampleStat';

// Register imported stat components.

const StatProvider = {
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
        ComponentRef: TypesOfMembers,
    },
    SALES_ACTIVITY: {
        ComponentRef: SalesActivity,
    },
    LOCATION:{
        ComponentRef: LocationMap,
    },
    TREND: {
        ComponentRef: Trend,
    }
};


const StatLoader = (props) => {
    let ToLoadRef;
    if (StatProvider.hasOwnProperty(props.statIdentifier)) {
        ToLoadRef = StatProvider[props.statIdentifier].ComponentRef;
    }
    if (ToLoadRef) {
        return <ToLoadRef params={props.params} signal={props.signal} handleExplore={props.handleExplore}></ToLoadRef>;
    } else {
        return <p>Error Loading.</p>;
    }
}

export default StatLoader;


