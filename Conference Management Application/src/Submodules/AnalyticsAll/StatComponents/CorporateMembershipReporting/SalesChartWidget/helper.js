import moment from 'moment';
import _groupBy from 'lodash/groupBy';
import _map from 'lodash/map';
import _sumBy from 'lodash/sumBy';
import _flattenDeep from 'lodash/flattenDeep';
import _sortBy from 'lodash/sortBy';
import _reduce from 'lodash/reduce';
import _orderBy from 'lodash/orderBy'
import {currencyFormatter, getMonthName } from '@/AnalyticsAll/StatComponents/util';
import { stringToColour } from '@/AnalyticsAll/StatComponents/util';

export const addValuesInObj = (arr, keys) => {
    let returnObj = {};
    keys.map(key => { returnObj[key] = _sumBy(arr, key) })
    return returnObj
}

export const combineAllArrays = (arr, keys) => {
    let returnObj = {};
    keys.map(key => { returnObj[key] = _flattenDeep(arr.map((o) => o[key])) })
    return returnObj
}

export const getDateToConstruct = (dataSource) =>{
    let constructedData = dataSource.map((member)=>{
        const { MembersUUIDs, ...rest } = member
        if (member.MonthOfInvoice.length === 1) member.MonthOfInvoice = `0${member.MonthOfInvoice}`;
        if (member.DayOfInvoice.length === 1) member.DayOfInvoice = `0${member.DayOfInvoice}`;
        const DayOfInvoiceKey = `${member.DayOfInvoice}-${member.MonthOfInvoice}-${member.YearOfInvoice}`
        const FullDate = `${member.MonthOfInvoice}/${member.DayOfInvoice}/${member.YearOfInvoice}`
        const WeekOfInvoice = getWeekOfInvoice(DayOfInvoiceKey)
        const MonthOfInvoice = getMonthName(member.MonthOfInvoice)
        const QuarterOfInvoice = getQuarter(DayOfInvoiceKey)
        return{
            ...rest,
            DayOfInvoiceKey,
            WeekOfInvoiceKey: `${WeekOfInvoice}-${member.YearOfInvoice}`,
            MonthOfInvoiceKey: `${MonthOfInvoice}-${member.YearOfInvoice}`,
            QuarterOfInvoiceKey: `Q${QuarterOfInvoice}-${member.YearOfInvoice}`,
            DateOfInvoice: new Date(FullDate)
        }
    }).sort((a,b)=> a.DateOfInvoice - b.DateOfInvoice)
    return constructedData
}

export const getSalesTableData = (members, groups_array,invoiceKey) => {

    let constructedData = members

    let yearmonth = [...new Set(constructedData.map(member => member[invoiceKey]))]
    let result = _map(_groupBy(constructedData, "GroupID"), ((groupArr, groupId) => {
        let result = {
            yearmonth,
            groupId,
            groupName:  groups_array.find(ga => ga.groupid === Number(groupId))?.groupname
        };
         _map(_groupBy(groupArr, `${invoiceKey}`), ((group, month) => {
            let UUIDObj = combineAllArrays(group, ["NewMemberUUIDs", "RenewMemberUUIDs"]);
            let memberUUIDs= _flattenDeep(Object.values(UUIDObj));

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
             if(data[mon]){
                if(type === "TotalMembers"){
                    result[mon] = `${data[mon].TotalInvoices}`
                }
                else{
                    result[mon] = `${currencyFormatter(data[mon].TotalRevenue)}`
                }
             }
             salesTableHeaders.push({
                label: `Period - ${mon}`,
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

export const getTotalCount = (data, month, type) =>{
    let TotalCount = 0;
    data?.map((gp)=> {
        if(type === 'revenue'){
            let text = gp[month]?.TotalRevenue;
            if(!gp[month]?.TotalRevenue){
                return text 
            }
            TotalCount += text
        } else{
            let text = gp[month]?.TotalInvoices;
            if(!gp[month]?.TotalInvoices){
                return text 
            }
            TotalCount += text
        }
        return gp
    })
    return TotalCount
}

export const reverseDate = date => date.split('-').reverse().join("-");

export const monthDisplayKey = (date) => moment(reverseDate(date)).format('MMM-YYYY');

const getDateLabel = (barView, viewKey) => {
    let date = '';
    switch (barView) {
        case "date": date = moment(reverseDate(viewKey)).format('DD-MMM-YYYY'); break;
        case "week": date = `${viewKey}`; break;
        case "month": date = `${monthDisplayKey(viewKey)}`; break;
        case "quarter": date = `${viewKey}`; break;
        case "year": date = `${viewKey}`; break;
    }
    return ({ date });
}

export const formatGroupName = (value = "") => {
    return `${value.replace(/[^A-Z0-9]/gi, "_").toLowerCase()}`;
};

export const getQuarter = (date) => Math.ceil((new Date(reverseDate(date)).getMonth() + 1) / 3);

export const getWeekOfInvoice = (day) => {
    const date = new Date(reverseDate(day));
    const firstDayOfYear = new Date(date.getFullYear(), 0, 1);
    const pastDaysOfYear = (date - firstDayOfYear) / (24 * 60 * 60 * 1000);
    const weekNumber = Math.ceil((pastDaysOfYear + firstDayOfYear.getDay()) / 7);
    return weekNumber;    
}

export const constructSalesActivity = (sales, dateRange) => {
    const constructedData = sales.map((sale) => {
      const { MembersUUIDs, ...rest } = sale
      if (sale.MonthOfInvoice.length === 1) sale.MonthOfInvoice = `0${sale.MonthOfInvoice}`;
      if (sale.DayOfInvoice.length === 1) sale.DayOfInvoice = `0${sale.DayOfInvoice}`;
      const DayOfInvoiceKey = `${sale.DayOfInvoice}-${sale.MonthOfInvoice}-${sale.YearOfInvoice}`;
      const QuarterOfInvoice = getQuarter(DayOfInvoiceKey);
      const WeekOfInvoice = getWeekOfInvoice(DayOfInvoiceKey);
      return {
        ...rest,
        DayOfInvoiceKey,
        QuarterOfInvoice,
        WeekOfInvoice,
        QuarterOfInvoiceKey: `Q${QuarterOfInvoice}-${sale.YearOfInvoice}`,
        MonthOfInvoiceKey: `${sale.MonthOfInvoice}-${sale.YearOfInvoice}`,
        WeekOfInvoiceKey: `${WeekOfInvoice}-${sale.YearOfInvoice}`,
        MembersUUIDs: [...sale.NewMemberUUIDs, ...sale.RenewMemberUUIDs]
      }
    })
    return constructedData;
  }

export const SimpleSalesChart = ({data, invoiceKey, type =''}) => {

    const constructData = (data, xAxisValue = 'x', yAxisValue = 'y') => {
        
        let groupedData = data;

        let groupByData = _groupBy(groupedData, `${invoiceKey}`)

        let constructedData = _map(groupByData, (data, key) => {
            let total = 0;
            let TotalSales;
            let uniqueIdData = [];
            if(type === "TOTAL_REVENUE"){
                TotalSales = _reduce(data, (_, val) => { return total += val.TotalRevenue }, [])
            } else {
                TotalSales = _reduce(data, (_, val) => { return total += val.TotalInvoices }, []);
            }

            if(type === "TOTAL_REVENUE" || type === "TOTAL_MEMBERS"){
                data?.map((item) => {
                    uniqueIdData.push(...item.NewMemberUUIDs, ...item.RenewMemberUUIDs)
                })
            }
            return ({
                [xAxisValue]: `${key}`,
                [yAxisValue]: TotalSales,
                memberUUIDs : uniqueIdData,
                constructedData: data,
            })
        })
        return constructedData;
    } 

    const lineChartData = () => {
        let salesMemData = [];
        if (data?.length) {
            salesMemData = _orderBy(data, ['YearOfInvoice', (item) => parseInt(item.MonthOfInvoice)], ['asc', 'asc']);
        }
        return ([
            {
                id: 'Membership Sales',
                color: "hsl(152, 70%, 50%)",
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
    groupArr.forEach(group => {
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
        barData[`${groupName}Color`] = stringToColour(groupName);
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
   })),
(e) => reverseDate(e.sortKey));