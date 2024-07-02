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

export const getCurrentDate = () => {
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

export const getFullMonthName = (MonthOfAccess) => {
    let month = ['JANUARY', 'FEBURARY', 'MARCH', 'APRIL', 'MAY', 'JUNE', 'JULY', 'AUGUST', 'SEPTEMBER', 'OCTOBER', 'NOVEMBER', 'DECEMBER'];
    let filterMonth = month[MonthOfAccess - 1];
    return filterMonth;
}

export const toTitleCase = (str = '') => {
    return str.replace(
        /\w\S*/g,
        function (txt) {
            return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
        }
    );
}

export function hexToHSL(hex) {
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

export const stringToColourHSL = (str) => {

    let hash = 0;
    for (let i = 0; i < str.length; i++) {
        hash = str.charCodeAt(i) + ((hash << 5) - hash);
    }
    let colour = "#";
    for (let i = 0; i < 3; i++) {
        const value = (hash >> (i * 8)) & 0xff;
        colour += ("00" + value.toString(16)).substr(-2);
    }

    return colour;
};

export const stringToColorHex = (str) => {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
        hash = str.charCodeAt(i) + ((hash << 5) - hash);
    }
    let colour = "#";
    for (let i = 0; i < 3; i++) {
        const value = (hash >> (i * 8)) & 0xff;
        colour += ("00" + value.toString(16)).substr(-2);
    }
    return colour;
}

export const hexToHSLColor = (H) => {
    // Convert hex to RGB first
    let r = 0,
        g = 0,
        b = 0;
    if (H.length === 4) {
        r = "0x" + H[1] + H[1];
        g = "0x" + H[2] + H[2];
        b = "0x" + H[3] + H[3];
    } else if (H.length === 7) {
        r = "0x" + H[1] + H[2];
        g = "0x" + H[3] + H[4];
        b = "0x" + H[5] + H[6];
    }
    // Then to HSL
    r /= 255;
    g /= 255;
    b /= 255;
    let cmin = Math.min(r, g, b),
        cmax = Math.max(r, g, b),
        delta = cmax - cmin,
        h = 0,
        s = 0,
        l = 0;

    if (delta === 0) h = 0;
    else if (cmax === r) h = ((g - b) / delta) % 6;
    else if (cmax === g) h = (b - r) / delta + 2;
    else h = (r - g) / delta + 4;

    h = Math.round(h * 60);

    if (h < 0) h += 360;

    l = (cmax + cmin) / 2;
    s = delta === 0 ? 0 : delta / (1 - Math.abs(2 * l - 1));
    s = +(s * 100).toFixed(1);
    l = +(l * 100).toFixed(1);

    return "hsl(" + h + "," + s + "%," + l + "%)";
}

export const lightenDarkenColor = (col, amt) => {
    var num = parseInt(col, 16);
    var r = (num >> 16) + amt;
    var b = ((num >> 8) & 0x00FF) + amt;
    var g = (num & 0x0000FF) + amt;
    var newColor = g | (b << 8) | (r << 16);
    return newColor.toString(16);
  }

// extract the values from an rgb color code into an array
function formatter(str) {
    const onlyNums = RegExp("\\D+", "gmi");
    const removeWhitespace = RegExp("\\/s/g", "gmi");

    const str1 = str.replace(onlyNums, " ");
    const str2 = str1.replace(removeWhitespace, "");

    const first = str2.split(" ")[1];
    const second = str2.split(" ")[2];
    const third = str2.split(" ")[3];

    return [first, second, third];
}

export const withBaseStringToColour = (str, baseColor) => {
    const baseRgb = hexToRgb(baseColor);
    let hash = 0;
    let newStr = `${str}${str}${str}`;
    for (let i = 0; i < newStr.length; i++) {
        hash = newStr.charCodeAt(i) + ((hash << 5) - hash);
    }

    const hashValue = Math.abs(hash);
    const maxHash = Math.pow(2, 32) - 1;
    const hue = (hashValue % maxHash) / maxHash; // Normalize hash value to be between 0 and 1

    const newRgb = hslToRgb(hue, 0.5, 0.5); // You can adjust saturation and lightness as needed
    const combinedRgb = combineColors(baseRgb, newRgb);
    const newHex = rgbToHex(combinedRgb.r, combinedRgb.g, combinedRgb.b);

    return newHex;

    function hexToRgb(hex) {
        const bigint = parseInt(hex.slice(1), 16);
        const r = (bigint >> 16) & 255;
        const g = (bigint >> 8) & 255;
        const b = bigint & 255;
        return { r, g, b };
    }

    function rgbToHex(r, g, b) {
        return (
            '#' +
            ('00' + r.toString(16)).slice(-2) +
            ('00' + g.toString(16)).slice(-2) +
            ('00' + b.toString(16)).slice(-2)
        );
    }

    function hslToRgb(h, s, l) {
        let r, g, b;

        if (s === 0) {
            r = g = b = l; // Achromatic
        } else {
            const hue2rgb = (p, q, t) => {
                if (t < 0) t += 1;
                if (t > 1) t -= 1;
                if (t < 1 / 6) return p + (q - p) * 6 * t;
                if (t < 1 / 2) return q;
                if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
                return p;
            };

            const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
            const p = 2 * l - q;

            r = hue2rgb(p, q, h + 1 / 3);
            g = hue2rgb(p, q, h);
            b = hue2rgb(p, q, h - 1 / 3);
        }

        return [Math.round(r * 255), Math.round(g * 255), Math.round(b * 255)];
    }

    function combineColors(color1, color2) {
        // Combine colors by taking the average of each component
        const result = {
            r: Math.round((color1.r + color2[0]) / 2),
            g: Math.round((color1.g + color2[1]) / 2),
            b: Math.round((color1.b + color2[2]) / 2),
        };

        return result;
    }
};

export const currencyFormatter = (value, symbol = true) => `${symbol ? "$" : ""}${Number(value ?? 0).toLocaleString('en-US', { minimumFractionDigits: 0 })}`;

export const sortGroupName = (rec1, rec2) => (`${rec1?.GroupName}`).localeCompare(`${rec2?.GroupName}`);
export const sortGroupname = (rec1, rec2) => (`${rec1?.Groupname}`).localeCompare(`${rec2?.Groupname}`);
export const sortMonthName = (rec1, rec2) => (`${rec1?.MonthName}`).localeCompare(`${rec2?.MonthName}`);
export const sortNumbers = (obj1, obj2, key) => {
    return obj1[key] > obj2[key] ? 1 : obj2[key] > obj1[key] ? -1 : 0
}
export const sortName = (rec1, rec2) => (`${rec1?.Firstname}, ${rec1?.Lastname}`).localeCompare(`${rec2?.Firstname}, ${rec2?.Lastname}`);

export const sortCommonName = (rec1, rec2) => (`${rec1?.lastname}, ${rec1.firstname}`).localeCompare(`${rec2?.lastname}, ${rec2.firstname}`)

export const sortMemberGroupType = (rec1, rec2) => (`${rec1.MemberGroupType}`).localeCompare(`${rec2.MemberGroupType}`);

export const sortDonorType = (rec1, rec2) => (`${rec1.donorType}`).localeCompare(`${rec2.donorType}`);

export const sortByDate = (rec1, rec2) => (new Date(rec1.date) - new Date(rec2.date));

export const sortByAmount = (rec1, rec2) => (rec1.amount - rec2.amount);

export const formatDate = (dateString = "") => {
    return moment(dateString).format('DD/MM/YYYY');
}

export const dateFormat = (date) =>{
    return moment(date).format('MM/DD/YYYY') 
}

export const currentMemberHeaders = [
    { label: `GROUP NAME (${moment().startOf('month').subtract(2, "months").format('MM/DD/YYYY')} - ${moment().format('MM/DD/YYYY')})`, key: "GroupName" },
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
    return stringValue?.toLowerCase()
}
export const getRoundValue = (value, points = 1) => {
    return _round(value, points)
}