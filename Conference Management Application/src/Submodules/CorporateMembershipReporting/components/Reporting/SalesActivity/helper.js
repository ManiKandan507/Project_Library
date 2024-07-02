// Functions used to construct and manipulate the sales activity API data.
import _sumBy from "lodash/sumBy";
import _flattenDeep from "lodash/flattenDeep";
import _map from "lodash/map";
import _groupBy from "lodash/groupBy";
import _sortBy from "lodash/sortBy";
import _find from "lodash/find";
import moment from "moment";
import * as dayjs from 'dayjs';
import quarterOfYear from "dayjs/plugin/quarterOfYear";
import { stringToColour } from "../../../helpers/common";
import { SALES_GROUP_NAME, TOTAL_REVENUE, VIEW_BY_DAY, VIEW_BY_MONTH, VIEW_BY_QUARTER, VIEW_BY_YEAR } from "../../../constants";
dayjs.extend(quarterOfYear);

export const formatGroupName = (value = "") => {
  return `${value.replace(/[^A-Z0-9]/gi, "_").toLowerCase()}`;
};
// Computes the sum of the values in array of objects.
export const addValuesInObj = (arr, keys) => {
  let returnObj = {};
  keys.map(key => { returnObj[key] = _sumBy(arr, key) })
  return returnObj
}
// Merge all the array values using particular key of objects in array.
export const combineAllArrays = (arr, keys) => {
  let returnObj = {};
  keys.map(key => { returnObj[key] = _flattenDeep(arr.map((o) => o[key])) })
  return returnObj
}
const getQuarter = (date) => Math.ceil((new Date(reverseDate(date)).getMonth() + 1) / 3);
// 13-12-2021 => 2021-12-13 Year is the first priority for sorting.
// 12-2021 is invalid date on moment.
export const reverseDate = date => date.split('-').reverse().join("-");
// parseDate - will find the 'DayOfInvoiceKey'(22-10-2021) from given index
const parseDate = (data, index) => dayjs(reverseDate(data[index]['DayOfInvoiceKey']));
// checks the given date is start of the year, month, or quarter
const isSameStartOf = (dayObj, time) => dayObj.startOf(time).isSame(dayObj.startOf('day'))
// checks the given date is end of the year, month, or quarter
const isSameEndOf = (dayObj, time) => dayObj.endOf(time).isSame(dayObj.endOf('day'))

const getPartialFlagsObj = ({ selectedDate, APIDate, isStart }) => {
  // if the date pickers year and year got from API are not same the recieved data was not partial.
  let equalYears = selectedDate.year() === APIDate.year();
  let sameYear = isStart ? isSameStartOf(selectedDate, 'year') : isSameEndOf(selectedDate, 'year');
  let sameQuarter = isStart ? isSameStartOf(selectedDate, 'quarter') : isSameEndOf(selectedDate, 'quarter');
  let sameMonth = isStart ? isSameStartOf(selectedDate, 'month') : isSameEndOf(selectedDate, 'month');
  let partialMonth = equalYears && !(sameYear || sameQuarter || sameMonth);
  let partialQuarter = equalYears && !(sameYear || sameQuarter);
  let partialYear = equalYears && !(sameYear);
  return { partialMonth, partialQuarter, partialYear }
}
const addPartialFlags = (data, dateRange) => {
  const { startDate: s, endDate: e } = dateRange; // Date got from Date Picker.
  const startDate = dayjs(s.format('YYYY-MM-DD')); // changing moment to day-js.
  const endDate = dayjs(e.format('YYYY-MM-DD'));
  let sortedData = _sortBy(data, (o) => reverseDate(o['DayOfInvoiceKey']));
  const endIndex = sortedData.length - 1;
  sortedData.splice(0, 1, {
    ...sortedData[0],
    ...getPartialFlagsObj({
      selectedDate: startDate,
      APIDate: parseDate(sortedData, 0),
      isStart: true,
    })
  });
  sortedData.splice(endIndex, 1, {
    ...sortedData[endIndex],
    ...getPartialFlagsObj({
      selectedDate: endDate,
      APIDate: parseDate(sortedData, endIndex).add(1, 'day'),
      isStart: false,
    })
  });
  return sortedData
}

export const constructSalesActivity = (sales, dateRange) => {
  const constructedData = sales.map((sale) => {
    const { MembersUUIDs, ...rest } = sale
    // "05" instead of "5" to make sorting easy.
    if (sale.MonthOfInvoice.length === 1) sale.MonthOfInvoice = `0${sale.MonthOfInvoice}`;
    if (sale.DayOfInvoice.length === 1) sale.DayOfInvoice = `0${sale.DayOfInvoice}`;
    const DayOfInvoiceKey = `${sale.DayOfInvoice}-${sale.MonthOfInvoice}-${sale.YearOfInvoice}`;
    const QuarterOfInvoice = getQuarter(DayOfInvoiceKey);
    return {
      ...rest,
      DayOfInvoiceKey,
      QuarterOfInvoice,
      QuarterOfInvoiceKey: `Q${QuarterOfInvoice}-${sale.YearOfInvoice}`,
      MonthOfInvoiceKey: `${sale.MonthOfInvoice}-${sale.YearOfInvoice}`,
      MembersUUIDs: [...sale.NewMemberUUIDs, ...sale.RenewMemberUUIDs]
    }
  })
  let returnData = addPartialFlags(constructedData, dateRange);
  return returnData;
}
// 12-2021 to Jan-2021 for diplay.
export const monthDisplayKey = (date) => moment(reverseDate(date)).format('MMM-YYYY')
// X-axis label consturction.
const getDateLabel = (barView, viewKey, partialObj) => {
  const { partialMonth, partialQuarter, partialYear } = partialObj;
  let date = '';
  switch (barView) {
    case VIEW_BY_DAY: date = moment(reverseDate(viewKey)).format('DD-MMM-YYYY'); break;
    case VIEW_BY_MONTH: date = partialMonth ? `* ${monthDisplayKey(viewKey)}` : monthDisplayKey(viewKey); break;
    case VIEW_BY_QUARTER: date = partialQuarter ? `* ${viewKey}` : viewKey; break;
    case VIEW_BY_YEAR: date = partialYear ? `* ${viewKey}` : viewKey; break;
  }
  return ({ date });
}
export const constructBarChartData = ({ isIncreasingBarValue, groupArr, barValueKey, barView, viewKey }) => {
  let partialMonth = _find(groupArr, 'partialMonth')
  let partialYear = _find(groupArr, 'partialYear')
  let partialQuarter = _find(groupArr, 'partialQuarter')
  let barData = getDateLabel(barView, viewKey, { partialMonth, partialYear, partialQuarter, });
  let barTotal = 0;
  let memberUUIDs = [];
  groupArr.forEach(group => {
    const groupName = formatGroupName(group[SALES_GROUP_NAME]);
    const barValue = group[barValueKey];
    barTotal += Number(barValue ?? 0);
    if (isIncreasingBarValue) {
      barData[groupName] = barData[groupName] ? barData[groupName] + barValue : barValue;
      barData[`${groupName}revenue`] = barData[`${groupName}revenue`] ? barData[`${groupName}revenue`] + group[TOTAL_REVENUE] : group[TOTAL_REVENUE];
    } else {
      barData[groupName] = barValue;
      barData[`${groupName}revenue`] = group[TOTAL_REVENUE];
    }
    barData[`${groupName}Title`] = group[SALES_GROUP_NAME];
    barData[`${groupName}Color`] = stringToColour(groupName);
    barData[`${groupName}UUIDS`] = [...(barData[`${groupName}UUIDS`] ?? []), ...group.MembersUUIDs];
    memberUUIDs.push(group.MembersUUIDs)
  })
  barData['sortKey'] = viewKey;
  barData["overAllRevenue"] = addValuesInObj(groupArr, [TOTAL_REVENUE])[TOTAL_REVENUE];
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