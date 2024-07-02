import moment from "moment"
import _round from 'lodash/round';

export const calculateMonthDays = (noOfMonth) => {
    let totalDays = 0
    for (var i = 1; i <= noOfMonth; i++) {
        let NoOfDaysInTheMonth = moment(moment().subtract(i, "month").startOf("month").format('YYYY-MM')).daysInMonth()
        totalDays += NoOfDaysInTheMonth
    }
    return totalDays
}

export const get90PriorDate = () => {
    return moment().startOf('month').subtract(calculateMonthDays(2), "days").format('DD/MM/YYYY');
}

export const getCurrentDate = () =>{
    return moment(new Date()).format("DD/MM/YYYY");
}

export const getMonthStartDate = (start) => {
    return moment().startOf('month').subtract(start, "months").format('DD/MM/YYYY');
}

export const getMonthEndDate = (end) => {
    return moment().subtract(end, "months").endOf('month').format('DD/MM/YYYY');
}

export const getMonthName = (MonthOfAccess) => {
    let month = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JULY', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];
    let filterMonth = month[MonthOfAccess - 1];
    return filterMonth;
}

function hexToHSL(hex) {
    var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    let r = parseInt(result[1], 16);
    let g = parseInt(result[2], 16);
    let b = parseInt(result[3], 16);
    r /= 255
    g /= 255
    b /= 255;
    var max = Math.max(r, g, b), min = Math.min(r, g, b);
    var h, s, l = (max + min) / 2;
    if (max == min) {
        h = s = 0; // achromatic
    } else {
        var d = max - min;
        s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
        switch (max) {
            case r: h = (g - b) / d + (g < b ? 6 : 0); break;
            case g: h = (b - r) / d + 2; break;
            case b: h = (r - g) / d + 4; break;
        }
        h /= 6;
    }
    var HSL = new Object();
    HSL['h'] = h;
    HSL['s'] = s;
    HSL['l'] = l;
    return `hsl(${HSL['h'] * 100},${HSL['s'] * 100}%,${(HSL['l'] * 100) + 17}%)`;
}

export const stringToColour = (str) => {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
        hash = str.charCodeAt(i) + ((hash << 5) - hash);
    }
    let colour = "#";
    for (let i = 0; i < 3; i++) {
        const value = (hash >> (i * 8)) & 0xff;
        colour += ("00" + value.toString(16)).substr(-2);
    }
    let convertHextoHsl = hexToHSL(colour)
    let res = convertHextoHsl;
    return res;
};

export const currencyFormatter = (value, symbol = true) =>`${symbol ? "$" : ""}${Number(value??0).toLocaleString('en-US',{minimumFractionDigits: 0})}`;

export const sortGroupName = (rec1, rec2) => (`${rec1?.GroupName}`).localeCompare(`${rec2?.GroupName}`);
export const sortGroupname = (rec1, rec2) => (`${rec1?.Groupname}`).localeCompare(`${rec2?.Groupname}`);
export const sortMonthName = (rec1, rec2) => (`${rec1?.MonthName}`).localeCompare(`${rec2?.MonthName}`);
export const sortNumbers = (obj1, obj2, key) => {
    return obj1[key] > obj2[key] ? 1 : obj2[key] > obj1[key] ? -1 : 0
}
export const sortName = (rec1, rec2) => (`${rec1?.Firstname}, ${rec1?.Lastname}`).localeCompare(`${rec2?.Firstname}, ${rec2?.Lastname}`);
export const sortMemberGroupType = (rec1,rec2)=>(`${rec1.MemberGroupType}`).localeCompare(`${rec2.MemberGroupType}`);

export const formatDate = (dateString = "") => {
    return moment(dateString).format('DD/MM/YYYY');
}

export const currentMemberHeaders = [
    { label: `GROUP NAME(${getMonthStartDate(2)} - ${moment().format('DD/MM/YYYY')})`, key: "GroupName" },
    { label: "MEMBERS", key: "TotalCount" },
]

export const currentTotalMemberHeader = [
    { label: "ID", key: "id" },
    { label: "Name", key: "user" },
    { label: "Organization", key: "Company" },
    { label: "Member Type", key: "GroupName" },
    { label: "Joining Date", key: "MemberJoinDate" },
    { label: "Expiration Date", key: "ExpirationDate" },
]

export const convertLowercaseFormat = (stringValue) => {
    return stringValue?.toLowerCase().trim()
}
export const getRoundValue = (value, points = 1) =>{
    return _round(value, points)
}