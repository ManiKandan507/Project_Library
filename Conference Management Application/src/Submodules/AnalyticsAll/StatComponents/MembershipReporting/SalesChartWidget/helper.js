import moment from 'moment';
import _groupBy from 'lodash/groupBy';
import _map from 'lodash/map';
import _sumBy from 'lodash/sumBy';
import _flattenDeep from 'lodash/flattenDeep';
import _sortBy from 'lodash/sortBy';
import _orderBy from 'lodash/orderBy';
import _reduce from 'lodash/reduce';
import { currencyFormatter, getMonthName, stringToColour } from '@/AnalyticsAll/StatComponents/util';
import { useState } from 'react';
import _ from 'lodash';
import { hexToHSLColor, themeColorShades } from '../util/helper';

export const addValuesInObj = (arr, keys) => {
    let returnObj = {};
    keys.map(key => { returnObj[key] = _sumBy(arr, key) })
    return returnObj
}

export const textToColour = (str) => {
    let hash = 0;
    for (var i = 0; i < str.length; i++) {
        hash = str.charCodeAt(i) + ((hash << 5) - hash);
    }
    let colour = '#';
    for (var i = 0; i < 3; i++) {
        var value = (hash >> (i * 8)) & 0xFF;
        colour += ('00' + value.toString(16)).substr(-2);
    }
    return colour;
}


export const combineAllArrays = (arr, keys) => {
    let returnObj = {};
    keys.map(key => { returnObj[key] = _flattenDeep(arr.map((o) => o[key])) })
    return returnObj
}

export const reverseDate = date => date.split('-').reverse().join("-");

export const monthDisplayKey = (date) => moment(reverseDate(date)).format('MMM-YYYY');

const getQuarter = (date) => Math.ceil((new Date(reverseDate(date)).getMonth() + 1) / 3);

export const getDataToConstruct = (dataSource) => {
    let constructedData = dataSource.map((member) => {
        const { MembersUUIDs, ...rest } = member
        if (member.MonthOfInvoice.length === 1) member.MonthOfInvoice = `0${member.MonthOfInvoice}`;
        if (member.DayOfInvoice.length === 1) member.DayOfInvoice = `0${member.DayOfInvoice}`;
        const DayOfInvoiceKey = `${member.DayOfInvoice}-${member.MonthOfInvoice}-${member.YearOfInvoice}`
        const FullDate = `${member.MonthOfInvoice}/${member.DayOfInvoice}/${member.YearOfInvoice}`
        const WeekOfInvoice = getWeekFromInvoiceDate(DayOfInvoiceKey)
        const QuarterOfInvoice = getQuarter(DayOfInvoiceKey)
        const MonthOfInvoice = `${getMonthName(member.MonthOfInvoice)} ${member.YearOfInvoice}`
        return {
            ...rest,
            DayOfInvoiceKey,
            WeekOfInvoiceKey: `${WeekOfInvoice}-${member.YearOfInvoice}`,
            MonthOfInvoiceKey: `${MonthOfInvoice}`,
            QuarterOfInvoiceKey: `Q${QuarterOfInvoice}-${member.YearOfInvoice}`,
            DateOfInvoice: new Date(FullDate)
        }
    }).sort((a, b) => a.DateOfInvoice - b.DateOfInvoice)
    return constructedData
}

export const getCompareSalesChartInfo = (dataSource) => {
    let constructedData = dataSource.map((data) => {
        if (data.MonthOfInvoice.length === 1) data.MonthOfInvoice = `0${data.MonthOfInvoice}`;
        const DayOfInvoiceKey = `${data.MonthOfInvoice}-${data.YearOfInvoice}`;
        const QuarterOfInvoice = getQuarter(DayOfInvoiceKey);
        const MonthOfInvoice = `${data.MonthOfInvoice}-${data.YearOfInvoice}`;
        return {
            ...data,
            MonthOfInvoiceKey: `${MonthOfInvoice}`,
            QuarterOfInvoice: `Q${QuarterOfInvoice}`,
            QuarterOfInvoiceKey: `Q${QuarterOfInvoice}-${data.YearOfInvoice}`,
            memberUUIDs: [...data.NewMemberUUIDs, ...data.RenewMemberUUIDs]
        }
    })
    return constructedData
}

export const getBarChartData = ({ data, type }) => {
    let constructedData = getCompareSalesChartInfo(data);
    let salesData = _map(_groupBy(constructedData, 'MonthOfInvoice'), (groupArr) => {
        let totalInvoices = type === "TOTAL_MEMBERS" ? 'TotalInvoices' : 'TotalRevenue';
        let barData = {};
        groupArr.map((data) => {
            barData[data.YearOfInvoice] = data[totalInvoices];
            barData['Month'] = getMonthName(data['MonthOfInvoice']);
            barData[`${data.YearOfInvoice} Color`] = stringToColour(data.YearOfInvoice);
            barData['MonthOfInvoiceKey'] = data['MonthOfInvoiceKey']
            return data
        })
        return barData;
    })
    return salesData
}

export const calculateQuarters = (salesData, type) => {
    const result = {
        q1: 0,
        q2: 0,
        q3: 0,
        q4: 0,
    }
    salesData.map(record => {
        let totalSales = type === 'TOTAL_MEMBERS' ? record.TotalInvoices : record.TotalRevenue;
        if (['01', '02', '03', '1', '2', '3'].includes(record.MonthOfInvoice)) {
            result['q1'] = result['q1'] + totalSales
        }
        else if (['04', '05', '06', '4', '5', '6'].includes(record.MonthOfInvoice)) {
            result['q2'] = result['q2'] + totalSales
        }
        else if (['07', '08', '09', '7', '8', '9'].includes(record.MonthOfInvoice)) {
            result['q3'] = result['q3'] + totalSales
        }
        else {
            result['q4'] = result['q4'] + totalSales
        }
        return record
    })
    return result
}

export const calculatePercentage = (currentYearSales, prevYearSales) => {
    let result = (((prevYearSales - currentYearSales) / prevYearSales * 100).toFixed(2));
    return !isNaN(result) ? Number(result) : 0
}

export const getPercentage = (currentYear, prevYear) => {
    const result = {
        Q1: 0,
        Q2: 0,
        Q3: 0,
        Q4: 0,
    }
    result['Q1'] = calculatePercentage(currentYear.q1, prevYear.q1)
    result['Q2'] = calculatePercentage(currentYear.q2, prevYear.q2)
    result['Q3'] = calculatePercentage(currentYear.q3, prevYear.q3)
    result['Q4'] = calculatePercentage(currentYear.q4, prevYear.q4)
    return result
}

export const getQuarterSalesPercentage = (data, type) => {
    const PREV_YEAR_RANGE = data.filter(sales => sales.YearType === "PREV_YEAR_RANGE");
    const CURRENT_DATE_RANGE = data.filter(sales => sales.YearType === "CURRENT_DATE_RANGE")

    let salesData = {
        currentYear: {
            ...calculateQuarters(CURRENT_DATE_RANGE, type)
        },
        prevYear: {
            ...calculateQuarters(PREV_YEAR_RANGE, type)
        },
    }
    let percentage = getPercentage(salesData.currentYear, salesData.prevYear)
    salesData = {
        ...salesData, percentage
    }
    return salesData
}

export const ConstructedQuarterSalesData = (salesData, type, constrcutedSalesInfo) => {
    let quarterPercentage = getQuarterSalesPercentage(constrcutedSalesInfo, type);
    let quarterSalesData = _map(_groupBy(salesData, 'QuarterOfInvoiceKey'), (groupArr) => {
        let quarterOfInvoice;
        let yearOfInvoice;
        groupArr.map((group) => {
            quarterOfInvoice = group.QuarterOfInvoice
            yearOfInvoice = group.YearOfInvoice
            return group
        })
        let total = 0;
        let totalSales;
        let QuarterPercentage = '';
        let percentage = groupArr.map(data => quarterPercentage.percentage[data.QuarterOfInvoice])
        percentage = [...new Set(percentage)].map((data) => {
            QuarterPercentage = data
        })

        if (type === "TOTAL_MEMBERS") {
            totalSales = _reduce(groupArr, (_, val) => { return total += val.TotalInvoices }, [])
        } else {
            totalSales = _reduce(groupArr, (_, val) => { return total += val.TotalRevenue }, [])
        }
        return {
            ...groupArr,
            TotalSales: totalSales,
            Percentage: QuarterPercentage,
            QuarterOfInvoice: quarterOfInvoice,
            YearOfInvoice: yearOfInvoice,
        }
    });
    return quarterSalesData
}

export const getYearSalesChart = ({ data, viewBy, type }) => {


    let quarterSalesData = _map(_groupBy(data, 'YearOfInvoice'), (groupArr) => {
        let yearOfInvoice;
        groupArr.map((group) => {
            yearOfInvoice = group.YearOfInvoice
            return group
        })
        let total = 0;
        let totalSales;
        let totalMembers = [];

        if (type === "TOTAL_MEMBERS") {
            totalSales = _reduce(groupArr, (_, val) => {
                totalMembers.push([...val.NewMemberUUIDs, ...val.RenewMemberUUIDs])
                return total += val.TotalInvoices
            }, [])
        } else {
            totalSales = _reduce(groupArr, (_, val) => {
                totalMembers.push([...val.NewMemberUUIDs, ...val.RenewMemberUUIDs])
                return total += val.TotalRevenue
            }, [])
        }
        return {
            TotalSales: totalSales,
            YearOfInvoice: yearOfInvoice,
            totalMembersUUIDS: totalMembers.flat(1)
        }
    });

    return quarterSalesData
}

export const getCompareTableSales = ({ data, start_date, end_date, viewBy, type }) => {
    const constructedQuarterData = getCompareSalesChartInfo(data);
    const constructedData = constructedQuarterData.map((sales) => {
        const MonthOfInvoice = `${sales.MonthOfInvoice}-${sales.YearOfInvoice}`;
        const NameOfMonth = getMonthName(sales.MonthOfInvoice)
        return {
            ...sales,
            MonthOfInvoiceKey: `${MonthOfInvoice}`,
            NameOfMonth: `${NameOfMonth}`
        }
    })

    const createdData = dataWithEmptyValues(start_date, end_date)

    const constructedDatas = createdData.map(emptyObj => {
        let available = constructedData.find(res => res.MonthOfInvoiceKey === emptyObj.MonthOfInvoiceKey);
        if (available) {
            return available
        } else {
            return emptyObj
        }
    })

    const sortedArray = constructedDatas.sort((a, b) => b.YearOfInvoice - a.YearOfInvoice)

    const PercentageData = _map(_groupBy(sortedArray, 'MonthOfInvoice'), (monthArr) => {
        let overAllPercentage = [];
        for (let i = 0; i < monthArr.length - 1; i++) {
            if (type === 'TOTAL_MEMBERS') {
                let eachPercentage = monthArr[i]?.TotalInvoices !== 0 ? (((monthArr[i]?.TotalInvoices - monthArr[i + 1]?.TotalInvoices) / monthArr[i]?.TotalInvoices * 100).toFixed(2)) : 'NA';
                overAllPercentage.push({
                    month: monthArr[i].MonthOfInvoice,
                    percentage: eachPercentage,
                    year: monthArr[i].YearOfInvoice
                })
            } else {
                let eachPercentage = monthArr[i]?.TotalRevenue !== 0 ? (((monthArr[i]?.TotalRevenue - monthArr[i + 1]?.TotalRevenue) / monthArr[i]?.TotalRevenue * 100).toFixed(2)) : 'NA';
                overAllPercentage.push({
                    month: monthArr[i].MonthOfInvoice,
                    percentage: eachPercentage,
                    year: monthArr[i].YearOfInvoice
                })
            }
        }
        return overAllPercentage
    }).flat(1)

    const constructedResultData = _map(_groupBy(constructedDatas, 'MonthOfInvoice'), (monthArr) => {
        return monthArr
    }).flat(1)


    const quarterSalesData = mulitYearQuarterData(constructedDatas, type)

    const quarterPercentage = _map(_groupBy(quarterSalesData, 'Quarter'), (groupArr) => {
        let allPercentage = [];
        for (let i = 0; i < groupArr.length - 1; i++) {
            let eachPercentage = groupArr[i]?.TotalSales !== 0 ? (((groupArr[i]?.TotalSales - groupArr[i + 1]?.TotalSales) / groupArr[i]?.TotalSales * 100).toFixed(2)) : 'NA';
            allPercentage.push({
                quarter: groupArr[i].Quarter,
                percentage: eachPercentage,
                year: groupArr[i].YearOfInvoice
            })
        }
        return allPercentage
    }).flat(1)

    const groupArray = _map(_groupBy(quarterSalesData, 'Quarter'), (groupArr) => {
        return groupArr
    }).flat(1)

    const quarterViewTableData = groupArray.map((sales) => {
        let percent = '';
        quarterPercentage.map((value) => {
            if (value.quarter === sales.Quarter && value.year === sales.YearOfInvoice) {
                percent = value.percentage
            }
        })
        return {
            ...sales,
            percent: percent
        }
    })

    const compareSalesTableData = constructedResultData.map((sale) => {
        let percent = '';
        PercentageData.map((value) => {
            if (value.month === sale.MonthOfInvoice && value.year === sale.YearOfInvoice) {
                percent = value.percentage
            }
        })
        return {
            ...sale,
            percent: percent
        }
    })

    const sortList = [];

    for (let i = 0; i <= 11; i++) {
        sortList.push(moment(start_date, 'DD/MM/YYYY').add(i, 'months').format('MM'))
    }

    const sortedObj = compareSalesTableData.sort((a, b) => {
        return (
            sortList.indexOf(a.MonthOfInvoice) - sortList.indexOf(b.MonthOfInvoice)
        );
    });

    let resultedArray = []

    if (viewBy === 'month') {
        resultedArray = sortedObj
    }
    if (viewBy === 'quarter') {
        resultedArray = quarterViewTableData
    }
    if (viewBy === 'year') {
        resultedArray = sortedObj
    }

    return resultedArray
}

export const getCompareDetailedTableSales = ({ data, start_date, end_date, viewBy, type }) => {
    const constructedQuarterData = getCompareSalesChartInfo(data);

    const constructedData = constructedQuarterData.map((sales) => {
        const MonthOfInvoice = `${sales.MonthOfInvoice}-${sales.YearOfInvoice}`;
        const NameOfMonth = getMonthName(sales.MonthOfInvoice)
        return {
            ...sales,
            MonthOfInvoiceKey: `${MonthOfInvoice}`,
            NameOfMonth: `${NameOfMonth}`
        }
    })

    let isDayExist = false
    for (let i = 0; i < constructedData.length; i++) {
        const dt = constructedData[i];
        if (dt.DayOfInvoice) {
            isDayExist = true;
            break;
        }
    }

    // const filteredDataJan = constructedQuarterData?.filter((value) => value.MonthOfInvoice === "01" && (value.YearOfInvoice === "2022" || value.YearOfInvoice === "2023")    )

    // let totalRevenue2022 = 0

    // let totalRevenue2023 = 0

    // filteredDataJan?.forEach((value) => {
    //     if(value.YearOfInvoice === "2022"){
    //         totalRevenue2022 += value.TotalRevenue
    //     }
    //     if(value.YearOfInvoice === "2023") {
    //         totalRevenue2023 += value.TotalRevenue
    //     }
    // })

    // console.log('totalRevenue2022', totalRevenue2022)
    // console.log('totalRevenue2023', totalRevenue2023)

    const createdData = dataWithEmptyValues(start_date, end_date, isDayExist)


    const constructedDatas = createdData.map(emptyObj => {
        let available = constructedData.filter(res =>
            res.DayOfInvoice === emptyObj.DayOfInvoice &&
            res.MonthOfInvoiceKey === emptyObj.MonthOfInvoiceKey);
        if (available.length > 0) {
            return {
                DayOfInvoice: emptyObj.DayOfInvoice,
                MonthOfInvoice: emptyObj.MonthOfInvoice,
                MonthOfInvoiceKey: emptyObj.MonthOfInvoiceKey,
                NameOfMonth: emptyObj.NameOfMonth,
                QuarterOfInvoice: emptyObj.QuarterOfInvoice,
                QuarterOfInvoiceKey: emptyObj.QuarterOfInvoiceKey,
                YearOfInvoice: emptyObj.YearOfInvoice,
                NewMemberUUIDs: available.map(res => res.NewMemberUUIDs).flat(),
                RenewMemberUUIDs: available.map(res => res.RenewMemberUUIDs).flat(),
                memberUUIDs: available.map(res => res.memberUUIDs).flat(),
                NewMembers: available.reduce((acc, currentValue) => { return acc + currentValue.NewMembers }, 0),
                NewMembersRevenue: available.reduce((acc, currentValue) => { return acc + currentValue.NewMembersRevenue }, 0),
                RenewingMembers: available.reduce((acc, currentValue) => { return acc + currentValue.RenewingMembers }, 0),
                RenewingMembersRevenue: available.reduce((acc, currentValue) => { return acc + currentValue.RenewingMembersRevenue }, 0),
                TotalInvoices: available.reduce((acc, currentValue) => { return acc + currentValue.TotalInvoices }, 0),
                TotalRevenue: available.reduce((acc, currentValue) => { return acc + currentValue.TotalRevenue }, 0),
                groups: available.sort((a, b) => b.DayOfInvoice - a.DayOfInvoice),
            }
        } else {
            return {
                ...emptyObj,
                groups: []
            }
        }
    })




    // const filteredDataJanDub = constructedDatas?.filter((value) => value.MonthOfInvoice === "01" && (value.YearOfInvoice === "2022" || value.YearOfInvoice === "2023")    )

    // let totalRevenueAfterDub2022 = 0

    // let totalRevenueAfterDub2023 = 0

    // filteredDataJanDub?.forEach((value) => {
    //     if(value.YearOfInvoice === "2022"){
    //         totalRevenueAfterDub2022 += value.TotalRevenue
    //     }
    //     if(value.YearOfInvoice === "2023") {
    //         totalRevenueAfterDub2023 += value.TotalRevenue
    //     }
    // })

    // console.log('totalRevenueAfterDub2022', totalRevenueAfterDub2022)
    // console.log('totalRevenueAfterDub2023', totalRevenueAfterDub2023)
    // console.log('filteredDataJanDub', filteredDataJanDub)
    // console.log('filteredDataJan', filteredDataJan)



    const monthConstructedData = _map(_groupBy(constructedDatas, 'MonthOfInvoiceKey'), (monthArr) => {
        let finalMonthObj = {
            MonthOfInvoice: monthArr[0].MonthOfInvoice,
            MonthOfInvoiceKey: monthArr[0].MonthOfInvoiceKey,
            NameOfMonth: monthArr[0].NameOfMonth,
            QuarterOfInvoice: monthArr[0].QuarterOfInvoice,
            QuarterOfInvoiceKey: monthArr[0].QuarterOfInvoiceKey,
            YearOfInvoice: monthArr[0].YearOfInvoice,
            NewMemberUUIDs: [],
            RenewMemberUUIDs: [],
            memberUUIDs: [],
            NewMembers: 0,
            NewMembersRevenue: 0,
            RenewingMembers: 0,
            RenewingMembersRevenue: 0,
            TotalInvoices: 0,
            TotalRevenue: 0,
            groups: []

        }
        monthArr.forEach((monthObj) => {
            monthObj.NewMemberUUIDs && monthObj.NewMemberUUIDs.length > 0 && finalMonthObj.NewMemberUUIDs.push(...monthObj.NewMemberUUIDs)
            monthObj.RenewMemberUUIDs && monthObj.RenewMemberUUIDs.length > 0 && finalMonthObj.RenewMemberUUIDs.push(...monthObj.RenewMemberUUIDs)
            monthObj.memberUUIDs && monthObj.memberUUIDs.length > 0 && finalMonthObj.memberUUIDs.push(...monthObj.memberUUIDs)
            if (monthObj.NewMembers) {
                finalMonthObj.NewMembers += monthObj.NewMembers
            }
            if (monthObj.NewMembersRevenue) {
                finalMonthObj.NewMembersRevenue += monthObj.NewMembersRevenue
            }
            if (monthObj.RenewingMembers) {
                finalMonthObj.RenewingMembers += monthObj.RenewingMembers
            }
            if (monthObj.RenewingMembersRevenue) {
                finalMonthObj.RenewingMembersRevenue += monthObj.RenewingMembersRevenue
            }
            if (monthObj.TotalInvoices) {
                finalMonthObj.TotalInvoices += monthObj.TotalInvoices
            }
            if (monthObj.TotalRevenue) {
                finalMonthObj.TotalRevenue += monthObj.TotalRevenue
            }

            monthObj.groups && monthObj.groups.length > 0 && finalMonthObj.groups.push(...monthObj.groups)
        })

        let finalGroups = _map(_groupBy(finalMonthObj.groups, 'GroupID'), (groupArr) => {
            if (groupArr.length > 0) {
                let finalgroupObj = {
                    DuesID: groupArr[0].DuesID,
                    GroupID: groupArr[0].GroupID,
                    GroupName: groupArr[0].GroupName,
                    MonthOfInvoice: groupArr[0].MonthOfInvoice,
                    MonthOfInvoiceKey: groupArr[0].MonthOfInvoiceKey,
                    Name: groupArr[0].Name,
                    NameOfMonth: groupArr[0].NameOfMonth,
                    QuarterOfInvoiceKey: groupArr[0].QuarterOfInvoiceKey,
                    YearOfInvoice: groupArr[0].YearOfInvoice,
                    QuarterOfInvoice: groupArr[0].QuarterOfInvoice,
                    NewMemberUUIDs: [],
                    NewMembers: 0,
                    NewMembersRevenue: 0,
                    RenewMemberUUIDs: [],
                    RenewingMembers: 0,
                    RenewingMembersRevenue: 0,
                    TotalInvoices: 0,
                    TotalRevenue: 0,
                    memberUUIDs: [],
                }
                groupArr.forEach((groupObj) => {
                    groupObj.NewMemberUUIDs && groupObj.NewMemberUUIDs.length > 0 && finalgroupObj.NewMemberUUIDs.push(...groupObj.NewMemberUUIDs)
                    if (groupObj.NewMembers) {
                        finalgroupObj.NewMembers += groupObj.NewMembers
                    }
                    if (groupObj.NewMembersRevenue) {
                        finalgroupObj.NewMembersRevenue += groupObj.NewMembersRevenue
                    }

                    groupObj.RenewMemberUUIDs && groupObj.RenewMemberUUIDs.length > 0 && finalgroupObj.RenewMemberUUIDs.push(...groupObj.RenewMemberUUIDs)
                    if (groupObj.RenewingMembers) {
                        finalgroupObj.RenewingMembers += groupObj.RenewingMembers
                    }
                    if (groupObj.RenewingMembersRevenue) {
                        finalgroupObj.RenewingMembersRevenue += groupObj.RenewingMembersRevenue
                    }

                    if (groupObj.TotalInvoices) {
                        finalgroupObj.TotalInvoices += groupObj.TotalInvoices
                    }
                    if (groupObj.TotalRevenue) {
                        finalgroupObj.TotalRevenue += groupObj.TotalRevenue
                    }

                    groupObj.memberUUIDs && groupObj.memberUUIDs.length > 0 && finalgroupObj.memberUUIDs.push(...groupObj.memberUUIDs)
                })
                return finalgroupObj
            }
            else {
                return {}
            }
        })

        finalMonthObj.groups = finalGroups
        return finalMonthObj

    })


    const sortedArray = monthConstructedData.sort((a, b) => b.YearOfInvoice - a.YearOfInvoice)

    const PercentageData = _map(_groupBy(sortedArray, 'MonthOfInvoice'), (monthArr) => {

        let overAllPercentage = [];
        for (let i = 0; i < monthArr.length - 1; i++) {
            if (type === 'TOTAL_MEMBERS') {
                let eachPercentage = monthArr[i]?.TotalInvoices !== 0 ? (((monthArr[i]?.TotalInvoices - monthArr[i + 1]?.TotalInvoices) / monthArr[i]?.TotalInvoices * 100).toFixed(2)) : 'NA';
                overAllPercentage.push({
                    month: monthArr[i].MonthOfInvoice,
                    percentage: eachPercentage,
                    year: monthArr[i].YearOfInvoice
                })
            } else {
                //TOTAL_REVENUE
                let eachPercentage = monthArr[i]?.TotalRevenue !== 0 ? (((monthArr[i]?.TotalRevenue - monthArr[i + 1]?.TotalRevenue) / monthArr[i]?.TotalRevenue * 100).toFixed(2)) : 'NA';
                overAllPercentage.push({
                    month: monthArr[i].MonthOfInvoice,
                    percentage: eachPercentage,
                    year: monthArr[i].YearOfInvoice
                })
            }
        }

        return overAllPercentage
    }).flat(1)



    const constructedResultData = _map(_groupBy(monthConstructedData, 'MonthOfInvoice'), (monthArr) => {
        return monthArr
    }).flat(1)


    const quarterSalesData = mulitYearQuarterData(monthConstructedData, type)

    const quarterPercentage = _map(_groupBy(quarterSalesData, 'Quarter'), (groupArr) => {
        let allPercentage = [];
        for (let i = 0; i < groupArr.length - 1; i++) {
            let eachPercentage = groupArr[i]?.TotalSales !== 0 ? (((groupArr[i]?.TotalSales - groupArr[i + 1]?.TotalSales) / groupArr[i]?.TotalSales * 100).toFixed(2)) : 'NA';
            allPercentage.push({
                quarter: groupArr[i].Quarter,
                percentage: eachPercentage,
                year: groupArr[i].YearOfInvoice
            })
        }
        return allPercentage
    }).flat(1)

    const groupArray = _map(_groupBy(quarterSalesData, 'Quarter'), (groupArr) => {
        return groupArr
    }).flat(1)

    const quarterViewTableData = groupArray.map((sales) => {
        let percent = '';
        quarterPercentage.map((value) => {
            if (value.quarter === sales.Quarter && value.year === sales.YearOfInvoice) {
                percent = value.percentage
            }
        })
        return {
            ...sales,
            percent: percent
        }
    })

    const compareSalesTableData = constructedResultData.map((sale) => {
        let percent = '';
        PercentageData.map((value) => {
            if (value.month === sale.MonthOfInvoice && value.year === sale.YearOfInvoice) {
                percent = value.percentage
            }
        })
        return {
            ...sale,
            percent: percent
        }
    })

    // const compareQuarterTableData = cons

    const sortList = [];

    for (let i = 0; i <= 11; i++) {
        sortList.push(moment(start_date, 'DD/MM/YYYY').add(i, 'months').format('MM'))
    }

    const sortedObj = compareSalesTableData.sort((a, b) => {
        return (
            sortList.indexOf(a.MonthOfInvoice) - sortList.indexOf(b.MonthOfInvoice)
        );
    });

    let resultedArray = []

    if (viewBy === 'month') {
        resultedArray = sortedObj
    }
    if (viewBy === 'quarter') {
        resultedArray = sortedObj
    }
    if (viewBy === 'year') {
        resultedArray = sortedObj
    }

    return resultedArray
}

const mulitYearQuarterData = (salesData, type) => {
    let constructedData = _map(_groupBy(salesData, "QuarterOfInvoiceKey"), (groupArr, key) => {
        let quarterOfInvoice;
        let yearOfInvoice;
        groupArr.map((group) => {
            quarterOfInvoice = group.QuarterOfInvoice
            yearOfInvoice = group.YearOfInvoice
            return group
        })
        let total = 0;
        let totalSales;
        let memberUUIDs = []
        if (type === "TOTAL_MEMBERS") {
            totalSales = _reduce(groupArr, (_, val) => {
                memberUUIDs.push(val.memberUUIDs)
                return total += val.TotalInvoices
            }, [])

        } else {
            totalSales = _reduce(groupArr, (_, val) => {
                memberUUIDs.push(val.memberUUIDs)
                return total += val.TotalRevenue
            }, [])
        }
        let totalInvoiceCount = 0;
        let totalRevenueCount = 0;
        let totalInvoices = _reduce(groupArr, (_, val) => { return totalInvoiceCount += val.TotalInvoices }, []);
        let totalRevenue = _reduce(groupArr, (_, val) => { return totalRevenueCount += val.TotalRevenue }, []);
        return {
            ...groupArr,
            TotalSales: totalSales,
            QuarterOfInvoice: quarterOfInvoice,
            YearOfInvoice: yearOfInvoice,
            memberUUIDs: memberUUIDs.flat(1),
            TotalInvoices: totalInvoices,
            TotalRevenue: totalRevenue
        }
    })
    let resultedData = _map(constructedData, (sales, key) => {
        return ({
            Quarter: sales?.QuarterOfInvoice,
            TotalSales: sales.TotalSales,
            YearOfInvoice: sales.YearOfInvoice,
            memberUUIDs: sales.memberUUIDs,
            TotalInvoices: sales.TotalInvoices,
            TotalRevenue: sales.TotalRevenue
        })
    });
    return resultedData
}


export const dataWithEmptyValues = (start_date, end_date, isDayExist = false) => {
    let startDate = moment(start_date, 'DD/MM/YYYY');
    let endDate = moment(end_date, 'DD/MM/YYYY');
    let dates = [];
    let datee = moment(startDate, 'DD/MM/YYYY');
    if (isDayExist) {
        while (datee <= endDate) {
            let quarter = getQuarter(`${datee.format("MM")}-${datee.format('YYYY')}`)
            dates.push({
                DayOfInvoice: `${datee.format("D")}`,
                MonthOfInvoice: `${datee.format("MM")}`,
                YearOfInvoice: `${datee.format('YYYY')}`,
                TotalInvoices: 0,
                TotalRevenue: 0,
                MonthOfInvoiceKey: `${datee.format('MM-YYYY')}`,
                NameOfMonth: `${getMonthName(datee.format('MM'))}`,
                QuarterOfInvoice: `Q${quarter}`,
                QuarterOfInvoiceKey: `Q${quarter}-${datee.format('YYYY')}`
            });
            datee = moment(datee, 'DD/MM/YYYY').add(1, 'day')
        }
        return dates
    } else {
        endDate.subtract(1, "month");
        let month = moment(startDate, 'DD/MM/YYYY').subtract(1, 'month');
        while (month <= endDate) {
            month.add(1, "month");
            let quarter = getQuarter(`${month.format("MM")}-${month.format('YYYY')}`)
            dates.push({
                MonthOfInvoice: `${month.format("MM")}`,
                YearOfInvoice: `${month.format('YYYY')}`,
                TotalInvoices: 0,
                TotalRevenue: 0,
                MonthOfInvoiceKey: `${month.format('MM-YYYY')}`,
                NameOfMonth: `${getMonthName(month.format('MM'))}`,
                QuarterOfInvoice: `Q${quarter}`,
                QuarterOfInvoiceKey: `Q${quarter}-${month.format('YYYY')}`
            });
        }
        return dates
    }
}

export const getMultiYearSalesChart = ({ data, viewBy, type, start_date, end_date }) => {
    let constructedSalesInfo = getCompareSalesChartInfo(data)
    const dates = dataWithEmptyValues(start_date, end_date)

    const constructedDatas = dates.map(emptyObj => {
        let available = constructedSalesInfo.find(res => res.MonthOfInvoiceKey === emptyObj.MonthOfInvoiceKey);
        if (available) {
            return available
        } else {
            return emptyObj
        }
    })

    const quarterSalesData = mulitYearQuarterData(constructedDatas, type)/* .sort((rec1, rec2) => rec2.YearOfInvoice - rec1.YearOfInvoice); */

    const QuarterPercentage = _map(_groupBy(quarterSalesData, 'Quarter'), (groupArr) => {
        let allPercentage = [];
        for (let i = 0; i < groupArr.length - 1; i++) {
            let eachPercentage = groupArr[i]?.TotalSales !== 0 ? (((groupArr[i + 1]?.TotalSales - groupArr[i]?.TotalSales) / groupArr[i + 1]?.TotalSales * 100).toFixed(2)) : 'NA';
            allPercentage.push({
                quarter: groupArr[i].Quarter,
                percentage: eachPercentage,
                year: groupArr[i].YearOfInvoice
            })
        }
        return allPercentage
    }).flat(1)

    const mulitYearQuarterSalesData = (salesData, xAxisValue = 'x', yAxisValue = 'y') => {
        let constructedData = _map(_groupBy(salesData, "QuarterOfInvoiceKey"), (groupArr, key) => {
            let quarterOfInvoice;
            let yearOfInvoice;
            groupArr.map((group) => {
                quarterOfInvoice = group.QuarterOfInvoice
                yearOfInvoice = group.YearOfInvoice
                return group
            })
            let total = 0;
            let totalSales;
            if (type === "TOTAL_MEMBERS") {
                totalSales = _reduce(groupArr, (_, val) => { return total += val.TotalInvoices }, [])
            } else {
                totalSales = _reduce(groupArr, (_, val) => { return total += val.TotalRevenue }, [])
            }
            let totalInvoiceCount = 0;
            let totalRevenueCount = 0;
            let totalInvoices = _reduce(groupArr, (_, val) => { return totalInvoiceCount += val.TotalInvoices }, []);
            let totalRevenue = _reduce(groupArr, (_, val) => { return totalRevenueCount += val.TotalRevenue }, []);
            // if (type === "TOTAL_MEMBERS") {
            //     totalInvoices = _reduce(groupArr, (_, val) => { return totalInvoiceCount += val.TotalInvoices }, [])
            // } else {
            //     totalRevenue = _reduce(groupArr, (_, val) => { return totalRevenueCount += val.TotalRevenue }, [])
            // }
            return {
                ...groupArr,
                TotalSales: totalSales,
                QuarterOfInvoice: quarterOfInvoice,
                YearOfInvoice: yearOfInvoice,
                TotalInvoices: totalInvoices,
                TotalRevenue: totalRevenue
            }
        })
        let resultedData = _map(constructedData, (sales, key) => {
            let percent;
            QuarterPercentage.map((value) => {
                if (value.quarter === sales.QuarterOfInvoice && `${(Number(value.year) + 1)}` === sales.YearOfInvoice) {
                    percent = value.percentage
                }
            })
            return ({
                [xAxisValue]: sales?.QuarterOfInvoice,
                [yAxisValue]: sales.TotalSales,
                years: sales.YearOfInvoice,
                percentage: percent,
                TotalInvoices: sales.TotalInvoices,
                TotalRevenue: sales.TotalRevenue
            })
        });
        return resultedData
    }

    const mulitYearPercentage = _map(_groupBy(constructedDatas, 'MonthOfInvoice'), (monthArr, key) => {
        let overAllPercentage = []
        for (let i = 0; i < monthArr.length - 1; i++) {
            if (type === 'TOTAL_MEMBERS') {
                let eachPercentage = monthArr[i]?.TotalInvoices !== 0 ? (((monthArr[i + 1]?.TotalInvoices - monthArr[i]?.TotalInvoices) / monthArr[i + 1]?.TotalInvoices * 100).toFixed(2)) : 'NA';
                overAllPercentage.push({
                    month: monthArr[i].MonthOfInvoice,
                    percentage: eachPercentage,
                    year: monthArr[i].YearOfInvoice
                })
            } else {
                let eachPercentage = monthArr[i]?.TotalRevenue !== 0 ? (((monthArr[i + 1]?.TotalRevenue - monthArr[i]?.TotalRevenue) / monthArr[i + 1]?.TotalRevenue * 100).toFixed(2)) : 'NA';
                overAllPercentage.push({
                    month: monthArr[i].MonthOfInvoice,
                    percentage: eachPercentage,
                    year: monthArr[i].YearOfInvoice
                })
            }
        }
        return overAllPercentage
    }).flat(1)

    const constructCompareSalesData = (salesData, xAxisValue = 'x', yAxisValue = 'y') => {

        salesData.sort((rec1, rec2) => rec1.YearOfInvoice - rec2.YearOfInvoice)

        let constructedData = _map(salesData, (sales, key) => {
            let salesValue = `${getMonthName(sales.MonthOfInvoice)}`;
            let percent;
            mulitYearPercentage.map((value) => {
                if (value.month === sales.MonthOfInvoice && `${(Number(value.year) + 1)}` === sales.YearOfInvoice) {
                    percent = value.percentage
                }
            })
            if (type === 'TOTAL_MEMBERS') {
                return ({
                    [xAxisValue]: salesValue,
                    [yAxisValue]: sales.TotalInvoices,
                    years: sales.YearOfInvoice,
                    percentage: percent
                })
            } else {
                return ({
                    [xAxisValue]: salesValue,
                    [yAxisValue]: sales.TotalRevenue,
                    years: sales.YearOfInvoice,
                    percentage: percent
                })
            }
        })
        return constructedData;
    }

    const splitIntoChunk = (arr, chunk) => {
        let splittedData = []
        for (let i = 0; i < arr.length; i += chunk) {
            let tempArray;
            tempArray = arr.slice(i, i + chunk);
            splittedData.push(tempArray.map((val) => {
                let maxYear = Math.max(...tempArray.map(o => Number(o.YearOfInvoice)))
                let minYear = Math.min(...tempArray.map(o => Number(o.YearOfInvoice)))
                let legendsDate

                if (minYear === maxYear) {
                    if (tempArray.length !== 12 && moment(start_date, 'DD/MM/YYYY').format('MM') !== moment().startOf('year').format('MM')) {
                        legendsDate = `${maxYear} - ${moment(maxYear, 'YYYY').add(1, 'year').format('YY')}`
                    } else {
                        legendsDate = `${maxYear}`
                    }
                } else {
                    legendsDate = `${minYear} - ${moment(maxYear, 'YYYY').format('YY')}`
                }

                return ({
                    ...val,
                    yearData: minYear === maxYear ? `${maxYear}` : `${minYear} - ${moment(maxYear, 'YYYY').format('YY')}`,
                    year: `${maxYear}`
                })
            }))
        }
        return splittedData.flat(1)
    }

    const splittedArray = splitIntoChunk(constructedDatas, 12)

    const currentMonth = `${moment().format('MM')}`
    const currentYear = `${moment().format('YYYY')}`

    const filteredData = splittedArray.filter((value) =>
        ((value.MonthOfInvoice <= currentMonth && value.YearOfInvoice <= currentYear) || (value.MonthOfInvoice > currentMonth && value.YearOfInvoice < currentYear)))

    const sortedArray = filteredData.sort((rec1, rec2) => rec1.YearOfInvoice - rec2.YearOfInvoice)

    const QuarterViewChart = () => {
        return _map(_groupBy(sortedArray, 'yearData'), (groupArr, key) => {
            let yearData;
            let year;
            groupArr.map(data => {
                yearData = data.yearData
                year = data.year
            })
            return ({
                id: `${yearData}`,
                data: mulitYearQuarterSalesData(groupArr),
                year: `${year}`
            })
        })
    }

    const multiLineChart = () => {
        return _map(_groupBy(sortedArray, 'yearData'), (groupArr, key) => {
            let yearData;
            let year;
            groupArr.map(data => {
                yearData = data.yearData
                year = data.year
            })
            return ({
                id: `${yearData}`,
                data: constructCompareSalesData(groupArr),
                year: `${year}`
            })
        })
    }

    let multiYearSalesDataSource = []
    if (viewBy === 'month') {
        multiYearSalesDataSource = multiLineChart().sort((rec1, rec2) => rec2.year - rec1.year);
    }

    if (viewBy === 'quarter') {
        multiYearSalesDataSource = QuarterViewChart().sort((rec1, rec2) => rec2.year - rec1.year);
    }
    if (viewBy === 'year') {
        multiYearSalesDataSource = multiLineChart().sort((rec1, rec2) => rec2.year - rec1.year);
    }

    return multiYearSalesDataSource.reverse()
}

export const compareSalesChart = ({ data, invoiceKey, type }) => {
    let constrcutedSalesInfo = getCompareSalesChartInfo(data)

    const constructCompareSalesData = (salesData, xAxisValue = 'x', yAxisValue = 'y') => {
        let constructedDatas;

        if (invoiceKey === 'QuarterOfInvoiceKey') {
            constructedDatas = ConstructedQuarterSalesData(salesData, type, constrcutedSalesInfo);
        } else {
            constructedDatas = salesData
        }

        let constructedData = _map(constructedDatas, (sales, key) => {
            let salesValue = invoiceKey === "QuarterOfInvoiceKey" ? sales?.QuarterOfInvoice : `${getMonthName(sales.MonthOfInvoice)}`;
            return ({
                [xAxisValue]: salesValue,
                [yAxisValue]: sales.TotalSales,
                percentage: sales.Percentage,
                years: sales.YearOfInvoice,
            })
        });
        return constructedData
    }

    const lineChartData = () => {
        let salesMemData = [];

        if (constrcutedSalesInfo?.length) {
            salesMemData = _orderBy(constrcutedSalesInfo, ['YearOfInvoice', (item) => parseInt(item.MonthOfInvoice)], ['asc', 'asc']);
        }

        let constructedSalesActivityData = _map(_groupBy(salesMemData, "MonthOfInvoice"), (monthArr) => {
            let totalSales;
            let percentage;
            if (invoiceKey === "MonthOfInvoiceKey") {
                return monthArr.map((monthDatas) => {
                    if (type === "TOTAL_MEMBERS") {
                        percentage = monthArr[0]?.TotalInvoices !== 0 ? (((monthArr[0]?.TotalInvoices - monthArr[1]?.TotalInvoices) / monthArr[0]?.TotalInvoices * 100).toFixed(2)) : 'NA';
                        totalSales = monthDatas.TotalInvoices;
                    } else {
                        percentage = monthArr[0]?.TotalInvoices !== 0 ? (((monthArr[0]?.TotalRevenue - monthArr[1]?.TotalRevenue) / monthArr[0]?.TotalRevenue * 100).toFixed(2)) : 'NA';
                        totalSales = monthDatas.TotalRevenue;
                    }


                    let salesPercentage = { ...monthDatas, Percentage: percentage, TotalSales: totalSales }
                    return salesPercentage
                });
            } else {
                return monthArr
            }
        }).flat(1);

        let sortedSalesData = constructedSalesActivityData.sort((rec1, rec2) => rec1.MonthOfInvoice - rec2.MonthOfInvoice).sort((rec1, rec2) => rec1.YearOfInvoice - rec2.YearOfInvoice);

        return _map(_groupBy(sortedSalesData, "YearType"), (groupArr, key) => {
            let yearData = [...new Set(sortedSalesData.map(data => data.YearOfInvoice))]
            let prevYearRange = yearData.length > 2 ? `${yearData[0]}-${yearData[1]}` : `${yearData[0]}`;
            let currentYearRange = yearData.length > 2 ? `${yearData[1]}-${yearData[2]}` : `${yearData[1]}`;

            let legendData = key === 'CURRENT_DATE_RANGE' ? currentYearRange : prevYearRange;
            return ({
                id: `${legendData}`,
                data: constructCompareSalesData(groupArr)
            })
        })
    }
    let compareSalesDataSource = lineChartData()
    return compareSalesDataSource
}

export const getSalesTableData = (members, groups_array, invoiceKey) => {

    let constructedData = members

    let yearmonth = [...new Set(constructedData.map(member => member[invoiceKey]))]
    let months = [...new Set(members.map(member => member.MonthOfInvoice))].sort((a, b) => a - b)

    let result = _map(_groupBy(constructedData, "GroupID"), ((groupArr, groupId) => {
        let result = {
            months,
            yearmonth,
            groupId,
            groupName: groups_array.find(ga => ga.groupid === Number(groupId))?.groupname
        };
        _map(_groupBy(groupArr, `${invoiceKey}`), ((group, month) => {
            let UUIDObj = combineAllArrays(group, ["NewMemberUUIDs", "RenewMemberUUIDs"]);
            let memberUUIDs = _flattenDeep(Object.values(UUIDObj));

            let groupResult = {
                TotalInvoices: 0,
                TotalRevenue: 0,
                memberUUIDs,
            }
            _map(group, gp => {
                groupResult['TotalInvoices'] = groupResult['TotalInvoices'] + gp['TotalInvoices']
                groupResult['TotalRevenue'] = groupResult['TotalRevenue'] + gp['TotalRevenue']
            })
            result[month] = groupResult;
            return groupResult
        }))
        return result
    }));

    return result
}

export const getSalesByVolumeTableData = (datasource, type) => {
    const salesTableHeaders = [
        { label: "MEMBERSHIP", key: "groupName" },
    ]
    let tableData = datasource.map(data => {
        let result = {}
        data.yearmonth?.map(mon => {
            if (data[mon]) {
                if (type === "TOTAL_MEMBERS") {
                    result[mon] = `${data[mon].TotalInvoices}`
                }
                else {
                    result[mon] = `${data[mon].TotalRevenue}` /* `${currencyFormatter(data[mon].TotalRevenue)}` */
                }
            }
            salesTableHeaders.push({
                label: type === 'TOTAL_MEMBERS' ? `${(mon)}` : `${(mon)} ($)`,
                key: mon
            })
            return mon;
        })
        return {
            groupName: data.groupName,
            ...result
        }
    })
    const uniqTableHeaders = [...new Map(salesTableHeaders.map(item =>
        [item["key"], item])).values()];
    return {
        columns: uniqTableHeaders,
        data: tableData
    }
}

export const getTotalCount = (data, month, type) => {
    let TotalCount = 0;
    data?.map((gp) => {
        if (type === 'revenue') {
            let text = gp[month]?.TotalRevenue;
            if (!gp[month]?.TotalRevenue) {
                return text
            }
            TotalCount += text
        } else {
            let text = gp[month]?.TotalInvoices;
            if (!gp[month]?.TotalInvoices) {
                return text
            }
            TotalCount += text
        }
        return gp
    })
    return TotalCount
}

const getDateLabel = (barView, viewKey) => {
    let date = '';
    switch (barView) {
        case "date": date = moment(reverseDate(viewKey)).format('DD-MM-YYYY'); break;
        case "week": date = `${viewKey}`; break;
        case "month": date = `${monthDisplayKey(viewKey)}`; break;
        case "quarter": date = `${viewKey}`; break;
        case "year": date = `${viewKey}`; break;
        default: break;
    }
    return ({ date });
}

export const formatGroupName = (value = "") => {
    return `${value.replace(/[^A-Z0-9]/gi, "_").toLowerCase()}`;
};

const getWeekFromInvoiceDate = (day) => {
    const date = new Date(reverseDate(day));
    const firstDayOfYear = new Date(date.getFullYear(), 0, 1);
    const pastDaysOfYear = (date - firstDayOfYear) / (24 * 60 * 60 * 1000);
    const week = Math.ceil((pastDaysOfYear + firstDayOfYear.getDay()) / 7);
    return week;
}

export const compareTableData = (compareSalesDataSource, invoiceKey, type) => {
    const constructData = compareSalesDataSource.map((sale) => {
        const MonthOfInvoice = getMonthName(sale.MonthOfInvoice);
        const MonthAndYearInvoice = `${sale.MonthOfInvoice} - ${sale.YearOfInvoice}`
        const QuaterOfInvoice = getQuarter(MonthAndYearInvoice)
        return {
            ...sale,
            MonthOfInvoiceKey: `${MonthOfInvoice}`,
            QuarterAndYearInvoice: `Q${QuaterOfInvoice} - ${sale.YearOfInvoice}`,
            QuarterOfInvoiceKey: `Q${QuaterOfInvoice}`
        }
    })

    const constructedData = _map(_groupBy(constructData, "MonthOfInvoice"), (groupArr) => {
        let YearOfInvoiceKey = `${groupArr["0"]?.MonthOfInvoice} - ${groupArr["0"]?.YearOfInvoice}`
        let percent;
        if (type === "TOTAL_MEMBERS") {
            percent = groupArr[1]?.TotalInvoices !== 0 ? ((groupArr[1]?.TotalInvoices - groupArr[0]?.TotalInvoices) / groupArr[1]?.TotalInvoices * 100).toFixed(2) : "NA";
        }
        else {

            percent = groupArr[1]?.TotalRevenue !== 0 ? ((groupArr[1]?.TotalRevenue - groupArr[0]?.TotalRevenue) / groupArr[1]?.TotalRevenue * 100).toFixed(2) : "NA"
        }
        let MonthData = groupArr.map((sales) => {
            return { ...sales, Percent: percent }
        })
        return ({ YearOfInvoice: YearOfInvoiceKey, MonthData })
    })

    constructedData.sort((a, b) => {
        a = a.YearOfInvoice.split("-");
        b = b.YearOfInvoice.split("-")
        return new Date(b[1], b[0], 1) - new Date(a[1], a[0], 1)
    });

    const DataSources = constructedData.map((src) => {
        return src.MonthData
    }).flat(1)

    let quarterPercentage = getQuarterSalesPercentage(constructData, type);

    const ConstructQuarterData = _map(_groupBy(constructData, "QuarterAndYearInvoice"), (groupArr) => {
        let totalSales;
        let total = 0;
        let QuarterPercentage;
        let percentage = groupArr.map(data => quarterPercentage.percentage[data.QuarterOfInvoiceKey])
        let constructedPercentage = [...new Set(percentage)].map((data) => {
            QuarterPercentage = data
        })
        if (type === "TOTAL_MEMBERS") {

            totalSales = _reduce(groupArr, (_, val) => { return total += val.TotalInvoices }, [])
        }
        else {

            totalSales = _reduce(groupArr, (_, val) => { return total += val.TotalRevenue }, [])
        }

        const SalesTotal = groupArr.map((sale) => {
            return {
                ...sale,
                TotalSales: totalSales,
                Percent: QuarterPercentage
            }
        })

        const filteredArray = [...new Map(SalesTotal.map(item => [item.YearOfInvoice, item])).values()]

        return filteredArray

    }).flat(1)

    ConstructQuarterData.sort((a, b) => a.QuarterOfInvoiceKey.localeCompare(b.QuarterOfInvoiceKey))

    if (invoiceKey === "QuarterOfInvoiceKey") {
        return ConstructQuarterData
    }
    else {
        return DataSources
    }
}

export const getMultiYearTableData = ({ data, start_date, end_date }) => {
    let startDate = moment(start_date, 'DD/MM/YYYY');
    let endDate = moment(end_date, 'DD/MM/YYYY');

    let dates = [];
    endDate.subtract(1, "month");
    let month = moment(startDate, 'DD/MM/YYYY').subtract(1, 'month');
    while (month <= endDate) {
        month.add(1, "month");
        dates.push({
            MonthOfInvoice: `${month.format("MM")}`,
            YearOfInvoice: `${month.format('YYYY')}`,
            TotalInvoices: 0,
            TotalRevenue: 0,
            MonthOfInvoiceKey: `${month.format('MM-YYYY')}`,
            RenewMemberUUIDs: [],
            NewMemberUUIDs: [],
            NewMembers: 0,
            NewMembersRevenue: 0,
            RenewingMembers: 0,
            RenewingMembersRevenue: 0
        });
    }

    const constructedDatas = dates.map(emptyObj => {
        let available = data.find(res => res.MonthOfInvoiceKey === emptyObj.MonthOfInvoiceKey);
        if (available) {
            return available
        } else {
            return emptyObj
        }
    })

    const addValues = (arr, keys) => {
        let returnObj = {};
        keys.map(key => {
            if (key === 'NewMembers' || key === 'RenewingMembers') {
                returnObj['Members'] = _sumBy(arr, key)
            }
            if (key === 'NewMembersRevenue' || key === 'RenewingMembersRevenue') {
                returnObj['Revenue'] = _sumBy(arr, key)
            }
        })
        return returnObj
    }

    const currentMonth = `${moment().format('MM')}`
    const currentYear = `${moment().format('YYYY')}`

    const filteredData = constructedDatas.filter((value) =>
        ((value.MonthOfInvoice <= currentMonth && value.YearOfInvoice <= currentYear) || (value.MonthOfInvoice > currentMonth && value.YearOfInvoice < currentYear)))

    const getPercentage = (members) => {
        let salesData = _map(_groupBy(filteredData, 'YearOfInvoice'), (groupArr, key) => {
            return {
                ...groupArr, totalMembersCount: _sumBy(groupArr, members), years: key
            }
        }).sort((rec1, rec2) => rec2.years - rec1.years)
        let salesPercent = {}
        let totalPercent = {}
        for (let i = 0; i < salesData.length; i++) {
            salesPercent = ((salesData[i + 1]?.totalMembersCount - salesData[i]?.totalMembersCount) / salesData[i]?.totalMembersCount * 100).toFixed(2);
            let year = salesData[i]?.years;
            totalPercent = {
                ...totalPercent, [year]: salesPercent
            }
        }
        return totalPercent
    }

    let newMemberData = _map(_groupBy(filteredData, 'YearOfInvoice'), (groupArr, key) => {
        let UUIDObj = combineAllArrays(groupArr, ["NewMemberUUIDs"])
        return {
            YearOfInvoice: groupArr[0]["YearOfInvoice"],
            Type: 'NEW',
            ...addValues(groupArr, ["NewMembers", "NewMembersRevenue"]),
            ...UUIDObj,
            salesPercentage: getPercentage('NewMembers')[key],
            revenuePercentage: getPercentage('NewMembersRevenue')[key]
        }
    }).sort((rec1, rec2) => rec2.YearOfInvoice - rec1.YearOfInvoice)

    let renewedMemberData = _map(_groupBy(filteredData, 'YearOfInvoice'), (groupArr, key) => {
        let UUIDObj = combineAllArrays(groupArr, ["RenewMemberUUIDs"])
        return {
            YearOfInvoice: groupArr[0]['YearOfInvoice'],
            Type: 'RENEWING',
            ...addValues(groupArr, ["RenewingMembers", "RenewingMembersRevenue"]),
            ...UUIDObj,
            salesPercentage: getPercentage('RenewingMembers')[key],
            revenuePercentage: getPercentage('RenewingMembersRevenue')[key]
        }
    }).sort((rec1, rec2) => rec2.YearOfInvoice - rec1.YearOfInvoice)

    let totalMembersData = newMemberData.map((val, key) => {
        let totalMember;
        let totalRevenue;
        let salesPercentage;
        let revenuePercentage;
        let totalMembersUUIDS;

        renewedMemberData.map((data) => {
            if (val.YearOfInvoice === data.YearOfInvoice) {
                totalMember = val.Members + data.Members
                totalRevenue = val.Revenue + data.Revenue
                totalMembersUUIDS = [...val.NewMemberUUIDs, ...data.RenewMemberUUIDs]
                salesPercentage = ((Number(val.salesPercentage) + Number(data.salesPercentage)) / 2).toFixed(2)
                revenuePercentage = ((Number(val.revenuePercentage) + Number(data.revenuePercentage)) / 2).toFixed(2)
            }
        })

        return {
            YearOfInvoice: val.YearOfInvoice,
            Type: 'TOTAL',
            Members: totalMember,
            Revenue: totalRevenue,
            TotalMemberUUIDs: totalMembersUUIDS,
            salesPercentage: salesPercentage,
            revenuePercentage: revenuePercentage
        }
    }).sort((rec1, rec2) => rec2.YearOfInvoice - rec1.YearOfInvoice)

    let salesYears = newMemberData.map((val) => {
        return val.YearOfInvoice
    })

    // setSalesYears(salesYears)

    let compareTableData = [...newMemberData, ...renewedMemberData, ...totalMembersData]

    return compareTableData
}

export const constructSalesActivity = (sales, dateRange) => {
    const constructedData = sales.map((sale) => {
        const { MembersUUIDs, ...rest } = sale
        if (sale.MonthOfInvoice.length === 1) sale.MonthOfInvoice = `0${sale.MonthOfInvoice}`;
        if (sale.DayOfInvoice.length === 1) sale.DayOfInvoice = `0${sale.DayOfInvoice}`;
        const DayOfInvoiceKey = `${sale.DayOfInvoice}-${sale.MonthOfInvoice}-${sale.YearOfInvoice}`;
        const FullDate = `${sale.MonthOfInvoice}/${sale.DayOfInvoice}/${sale.YearOfInvoice}`
        const QuarterOfInvoice = getQuarter(DayOfInvoiceKey);
        const WeekOfInvoice = getWeekFromInvoiceDate(DayOfInvoiceKey);

        return {
            ...rest,
            DayOfInvoiceKey,
            QuarterOfInvoice,
            WeekOfInvoice,
            QuarterOfInvoiceKey: `Q${QuarterOfInvoice}-${sale.YearOfInvoice}`,
            MonthOfInvoiceKey: `${sale.MonthOfInvoice}-${sale.YearOfInvoice}`,
            WeekOfInvoiceKey: `${WeekOfInvoice}-${sale.YearOfInvoice}`,
            MembersUUIDs: [...sale.NewMemberUUIDs, ...sale.RenewMemberUUIDs],
            DateOfInvoice: new Date(FullDate)
        }
    }).sort((a, b) => a.DateOfInvoice - b.DateOfInvoice)
    return constructedData;
}

export const simpleSalesChart = ({ data, invoiceKey, type = '' }) => {

    const constructData = (data, xAxisValue = 'x', yAxisValue = 'y') => {

        let groupedData = data

        let groupByData = _groupBy(groupedData, `${invoiceKey}`)

        let constructedData = _map(groupByData, (data, key) => {
            let total = 0;
            let TotalSales;
            let uniqueIdData = [];
            if (type === "TOTAL_REVENUE") {
                TotalSales = _reduce(data, (_, val) => { return total += val.TotalRevenue }, [])
            } else {
                TotalSales = _reduce(data, (_, val) => { return total += val.TotalInvoices }, []);
            }

            if (type === "TOTAL_REVENUE" || type === "TOTAL_MEMBERS") {
                data?.map((item) => {
                    uniqueIdData.push(...item.NewMemberUUIDs, ...item.RenewMemberUUIDs)
                })
            }
            return ({
                [xAxisValue]: `${key}`,
                [yAxisValue]: TotalSales,
                memberUUIDs: uniqueIdData,
                constructedData: data,
            })
        })
        return constructedData;
    }

    const lineChartData = () => {
        let salesMemData = [];
        if (data?.length) {
            salesMemData = _orderBy(data, ['YearOfInvoice', (item) => parseInt(item.MonthOfInvoice)], ['asc', 'asc'])
        }
        return ([
            {
                id: 'Membership Sales',
                color: 'hsl(152, 70%, 50%)',
                data: constructData(salesMemData)
            }
        ])
    }
    return lineChartData();
}

export const constructBarChartData = ({ isIncreasingBarValue, groupArr, barValueKey, barView, viewKey }) => {
    let barData = getDateLabel(barView, viewKey);
    let barTotal = 0;
    let memberUUIDs = [];
    let indexvalue = 0;
    const element = document.querySelector('.primary-color');
    let primaryThemeColor;
    if (element)
        primaryThemeColor = window.getComputedStyle(element).getPropertyValue('color')
    const filteredColor = themeColorShades(primaryThemeColor)
    const groupNames = [...new Set(groupArr.map(data => data.GroupName))];
    const groupColors = {};

    groupNames.forEach((data, index) => {
        if (index > filteredColor.length - 1) {
            indexvalue += 1
            if (indexvalue > filteredColor.length - 1)
                indexvalue = 0
        }
        else
            indexvalue = index
        groupColors[data] = hexToHSLColor(`#${filteredColor[indexvalue]}`)
    })

    groupArr.forEach((group, index) => {
        const groupName = formatGroupName(group["GroupName"]);
        const barValue = group[barValueKey];
        barTotal += Number(barValue ?? 0);
        if (isIncreasingBarValue) {
            barData[groupName] = barData[groupName] ? barData[groupName] + barValue : barValue;
            barData[`${groupName}revenue`] = barData[`${groupName}revenue`] ? barData[`${groupName}revenue`] + group["TotalRevenue"] : group["TotalRevenue"];
        } else {
            barData[groupName] = barValue;
            barData[`${groupName}revenue`] = group["TotalRevenue"];
        }
        barData[`${groupName}Title`] = group["GroupName"];
        barData[`${groupName}Color`] = groupColors[group.GroupName]
        // barData[`${groupName}Color`] = stringToColour(groupName);
        barData[`${groupName}UUIDS`] = [...(barData[`${groupName}UUIDS`] ?? []), ...group.RenewMemberUUIDs, ...group.NewMemberUUIDs];
        memberUUIDs.push(...group.RenewMemberUUIDs, ...group.NewMemberUUIDs)
    })

    barData['sortKey'] = viewKey;
    barData["overAllRevenue"] = addValuesInObj(groupArr, ["TotalRevenue"])["TotalRevenue"];
    barData['allUUIDs'] = _flattenDeep(memberUUIDs);
    barData["total"] = barTotal;
    return barData;
}

export const mapBarData = ({ data, invoiceKey, ...rest }) => _sortBy(_map(_groupBy(data, invoiceKey),
    (groupArr, viewKey) => constructBarChartData({
        groupArr,
        viewKey,
        ...rest
    })));
// (e) => {reverseDate(e.sortKey)});

export const compareSalesTableData = (members, groups_array, invoiceKey) => {
    let constructedData = members
    let yearmonth = [...new Set(constructedData.map(member => member['YearOfInvoice']))]
    let months = [...new Set(members.map(member => getMonthName(member.MonthOfInvoice)))].sort((a, b) => a - b)

    let result = _map(_groupBy(constructedData, `${invoiceKey}`), ((group, month) => {
        let UUIDObj = combineAllArrays(group, ["NewMemberUUIDs", "RenewMemberUUIDs"]);
        let memberUUIDs = _flattenDeep(Object.values(UUIDObj));
        let result = {
            months,
            yearmonth,
            period: month,
            TotalInvoices: 0,
            TotalRevenue: 0,
            memberUUIDs
        };
        _map(group, gp => {
            result['TotalInvoices'] = result['TotalInvoices'] + gp['TotalInvoices']
            result['TotalRevenue'] = result['TotalRevenue'] + gp['TotalRevenue']
        })
        return result
    }));
    return result
    // let result = _map(_groupBy(constructedData, "YearType"), ((groupArr) => {
    //     let result = {
    //         months,
    //         yearmonth,
    //     };
    //      _map(_groupBy(groupArr, `${invoiceKey}`), ((group, month) => {
    //         let UUIDObj = combineAllArrays(group, ["NewMemberUUIDs", "RenewMemberUUIDs"]);
    //         let memberUUIDs= _flattenDeep(Object.values(UUIDObj));
    //         let groupResult = {
    //             TotalInvoices: 0,
    //             TotalRevenue: 0,
    //             period: month,
    //             memberUUIDs,
    //         }
    //         _map(group, gp => {
    //             groupResult['TotalInvoices'] = groupResult['TotalInvoices'] + gp['TotalInvoices']
    //             groupResult['TotalRevenue'] = groupResult['TotalRevenue'] + gp['TotalRevenue']
    //         })
    //         result[month] = groupResult;
    //         return groupResult
    //     }))
    //     return result
    // }));    return result
}


export const percentageCalculation = (value1 = 0, value2) => {
    const getPercentage = ((value1 - value2) / value2) * 100
    return getPercentage.toFixed(2)
};