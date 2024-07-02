import moment from "moment";
import { getFullMonthName, getMonthName, hexToHSLColor, lightenDarkenColor, toTitleCase } from "../util";
import _map from 'lodash/map';
import _groupBy from 'lodash/groupBy';
import tinycolor from "tinycolor2";

export const ConstructedData = (dataSource) => {
    const constructData = dataSource?.map((data) => {
        const monthOfInvoice = Number(moment(data.date, 'YYYY-MM-DD').format('MM'));
        const monthAndYearOfInvoice = Number(moment(data.date, 'YYYY-MM-DD').format('YYYY'))
        return ({
            ...data,
            monthOfInvoice: `${monthOfInvoice}`,
            month: `${getMonthName(monthOfInvoice)}`,
            yearOfInvoice: `${monthAndYearOfInvoice}`
        }) 
    })
    return constructData;
}

export const ConstructedDonorData = (donorDetails, donationCategory) => {
    if(donorDetails?.length) {
        const resultedArray = donorDetails.map((donor) => {
            let donationName = '';
            let donorName = Object.keys(donor).includes("company_id") ? donor?.company_name : `${donor?.firstname} ${donor?.lastname}`;
            let donorType = Object.keys(donor).includes("company_id") ? "Corporate" : "Individual" ;

            donationCategory?.map((donation) => {
                if(donor.donation_id === donation.donation_id){
                    return donationName = donation.donation_name;
                }
            })
            return {
                ...donor,
                donationName: donationName,
                donorName: donorName,
                donorType: donorType
            }
        })
        return resultedArray
    }
}

export const CompareTableData = (dataSource, donationTypes) => {
    const constructData = ConstructedData(dataSource);
    const totalMonths = constructData.map((value) => {
        return value.monthOfInvoice 
    });

    const monthArray = [...new Set(totalMonths)]

    const donationName = constructData.map((value) => {
        let donationName = ''
        donationTypes.map((data) => {
            if(value.donation_id === data.donation_id){
                donationName = data.donation_name;
            }
        })
        return {
            ...value,
            donationName: donationName
        }
    })

    const monthTableData = [];

    const groupArray = _map(_groupBy(donationName , 'donation_id'), (groupArr) => {
        const groupByMonth = _map(_groupBy(groupArr, 'monthOfInvoice'), (monthArr) => {
            let totalAmount = 0;
            let monthName = '';
            let donationName = '';
            let yearOfInvoice = '';
            let donationId = '';
            monthArr.map((data) => {
                totalAmount += data.amount;
                monthName = data.monthOfInvoice;
                donationName = data.donationName;
                yearOfInvoice = data.yearOfInvoice;
                donationId = data.donation_id;
            })
            return {
                totalAmount: totalAmount,
                monthName: monthName,
                donationName: donationName,
                yearOfInvoice: yearOfInvoice,
                donationId: donationId,
                monthAndYear: `${toTitleCase(getFullMonthName(monthName))} ${yearOfInvoice}`
            }
        })

        return groupByMonth
    })

    groupArray.forEach((value) => {
        value.forEach((item) => {
            let donationName = item.donationName
            let yearOfInvoice = item.yearOfInvoice
            let donationId = item.donationId
            monthArray.forEach((val) => {
                if(item.monthName === val){
                    monthTableData.push(item)
                }else {
                    monthTableData.push({
                        totalAmount: 0,
                        monthName: val,
                        donationName: donationName,
                        yearOfInvoice: yearOfInvoice,
                        donationId: donationId,
                        monthAndYear: `${toTitleCase(getFullMonthName(val))} ${yearOfInvoice}`
                    })
                }
            })
        })
    })

    const filteredArray = _map(_groupBy(monthTableData, 'donationName'), (donationGroup) => {

        const resultedArray = donationGroup.sort((a,b) => b.totalAmount - a.totalAmount).filter((obj, index) => {
            return index === donationGroup.findIndex(o => obj.monthName === o.monthName);
        })
        return resultedArray
    }).flat(1)

    const monthGroupedArray = _map(_groupBy(filteredArray, 'monthName'), (monthArr) => {
        let monthTotalDonation = 0;
        let donation_ids = []
        monthArr.map((data) => {
            monthTotalDonation += data?.totalAmount;
            donation_ids.push(data?.donationId)
        })

        const constructData = monthArr.map((value) => {
            return {
                ...value,
                total_donation: monthTotalDonation,
                donation_ids: donation_ids
            }
        })

        return constructData
    }).flat(1)

    const sortedArray = monthGroupedArray.sort((a, b) => b.monthName - a.monthName);
    
    return sortedArray;
}

export const customColor = (primaryColor, constructedData) => {

    const tinyColor = tinycolor(`${primaryColor}`)

    const analogousColors = tinyColor.analogous();

    const complementaryColor = tinyColor.splitcomplement();

    const triad = tinyColor.triad();

    const tetrad = tinyColor.tetrad()

    const colorArray = [...triad, ...complementaryColor, ...analogousColors, ...tetrad].map((color) => {
        return lightenDarkenColor(color.toHex(), 20);
    })

    const filteredColor = [...new Set(colorArray)].filter((color) => color !== primaryColor);

    let indexvalue = 0;

    const constructData = constructedData?.map((data, i) => {
        if (i > filteredColor.length - 1) {
            indexvalue += 1
            if (indexvalue > filteredColor.length - 1) {
                indexvalue = 0
            }
        }
        else {
            indexvalue = i
        }

        return {
            ...data,
            color: hexToHSLColor(`#${filteredColor[indexvalue]}`),
        }
    })

    return constructData
}

export const disabledDate = (current) =>current && current > moment().endOf('day')