import React from "react";
import DonationByCategory from "../DonationByCategory";
import DonationsByMonth from "../DonationsByMonth";
import RecentDonors from "../RecentDonors";
import SideMenu from "../SideMenu";
import DonationTab from "../DonationTab/index";
import DonorsTab from "../DonorTab/index";
import Demographics from "../DemographicsTab";
import Settings from  "../SettingsTab/index"

const StatProvider = {
    SIDE_MENU: {
        ComponentRef: SideMenu,
    },
    DONATION_BY_MONTH: {
        ComponentRef: DonationsByMonth,
    },
    DONATION_BY_CATEGORY: {
        ComponentRef: DonationByCategory
    },
    RECENT_DONORS: {
        ComponentRef: RecentDonors
    },
    DONATIONS: {
        ComponentRef: DonationTab
    },
    DONORS: {
        ComponentRef: DonorsTab
    },
    DEMOGRAPHICS: {
        ComponentRef: Demographics
    },
    SETTINGS: {
        ComponentRef: Settings
    }
};

const StatLoader = (props) => {
    let ToLoadRef;
    if (StatProvider.hasOwnProperty(props.statIdentifier)) {
        ToLoadRef = StatProvider[props.statIdentifier].ComponentRef;
    }
    if (ToLoadRef) {
        return <ToLoadRef params={props.params} signal={props.signal} handleExplore={props.handleExplore} handleDateChange={(data) => props.handleDateChange(data)} dates={props.dates} appDir={props.appDir} options={props.options} CategoryTypes={props.CategoryTypes} ></ToLoadRef>;
    } else {
        return <p>Error Loading.</p>;
    }
}

export default StatLoader;