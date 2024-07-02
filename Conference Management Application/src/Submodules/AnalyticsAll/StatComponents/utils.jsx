import _forEach from 'lodash/forEach';
import _flatMap from 'lodash/flatMap';
import _map from 'lodash/map';
import _groupBy from 'lodash/groupBy';
import _uniq from 'lodash/uniq';
import _reduce from 'lodash/reduce';
import _orderBy from 'lodash/orderBy';
import _round from 'lodash/round';
import moment from 'moment';

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

export const getRoundValue = (value, points = 1) => {
  return _round(value, points)
}

export const formatDate = (dateString = "") => {
  return moment(dateString).format('DD/MM/YYYY');
}


export const lineChartData = (type, data = [], legends) => {
  let orderedData = [];
  if (data && data.length) {
    orderedData = _orderBy(data, ['YearOfAccess', (item) => parseInt(item.MonthOfAccess)], ['asc', 'asc']);
  }

  return ([
    {
      id: legends,
      color: "hsl(152, 70%, 50%)",
      data: constructData(type, orderedData),
    },
  ]);
}

const getMonthName = (MonthOfAccess) => {
  let month = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'July', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  let filterMonth = month[MonthOfAccess - 1];
  return filterMonth;
}


const getTotalCount = (data, key, type) => {
  let total = 0;
  if (type === 'active_user' || type === 'file_view') {
    let tempTotal = _reduce(data, (contactUUIDs, val) => {
      return [...contactUUIDs, ...val.contactUUIDs];
    }, []);
    total = _uniq(tempTotal)?.length ?? 0;
  } else if (type === 'active_month_user') {
    total = _reduce(data, (views, val) => {
      return views + val.product_views;
    }, 0);
  } else {
    total = _reduce(data, (tot, val) => {
      return tot + val.bandwidth;
    }, 0);
  }

  if (Math.sign(total) === -1) {
    total = 0;
  }

  return getRoundValue(total, 2);
};

const getBandWidthCount = (data, type, key) => {
  let totalBandWidthConsumed = null
  if (type === "file_view") {
    totalBandWidthConsumed = _reduce(data, (tot, val) => {
      return tot + val.bandwidth_consumed;;
    }, 0);
  }
  return `${getRoundValue(totalBandWidthConsumed, 2)} GB`;
}

const getFileViews = (data, type, key) => {
  let count = 0;
  let totalFileView = data.map((data) => {
    data.contactUUIDs.forEach((item) => {
      count = count + item.views;
    })
  });
  return count
}

export const constructData = (
  type,
  data,
  xAxisValue = 'x',
  yAxisValue = 'y',
  viewChartType = 'month',
  active,
) => {

  if (type === 'bandwidth' && viewChartType === 'day') {
    let dayAndMonth = _map(data, (list) => ({
      ...list,
      DayAndMonth: `${list.DayOfAccess} ${getMonthName(list.MonthOfAccess)}`
    }));

    let groupConstructData = _groupBy(dayAndMonth, 'DayAndMonth');

    let tempData = _map(groupConstructData, (data, key) => ({
      day: key,
      bandwidth: getRoundValue(_map(data, list => list.bandwidth)[0], 2)
    }));

    return tempData;
  }

  let monthAndYearData;
    if(active == "Month"){
      monthAndYearData= _map(data, (list) => ({
        ...list,
        MonthAndYear: `${getMonthName(list.MonthOfAccess)}`
      }));
    } else if(active == 'Year'){
      monthAndYearData= _map(data, (list) => ({
        ...list,
        MonthAndYear: `${list.YearOfAccess}`
      }));
    } else if (active == 'Quarter'){
      let quarterYear;
        monthAndYearData =_map(data,(list)=>{
          if(list.MonthOfAccess<=3){
            quarterYear= `Q1-${list.YearOfAccess}` 
          }
          else if(list.MonthOfAccess > 3 && list.MonthOfAccess <=6){
            quarterYear= `Q2-${list.YearOfAccess}`
          }
          else if(list.MonthOfAccess > 6 && list.MonthOfAccess <=9){
            quarterYear= `Q3-${list.YearOfAccess}`
          }
          else{
            quarterYear= `Q4-${list.YearOfAccess}`
          }
          return{...list,MonthAndYear: quarterYear}
        })
    } else {
      monthAndYearData=_map(data, (list) => ({
        ...list,
        MonthAndYear: `${getMonthName(list.MonthOfAccess)} - ${list.YearOfAccess}`
      }));
    }
  let groupByData = _groupBy(monthAndYearData, 'MonthAndYear');

  let constructedData = _map(groupByData, (data, key) => {
    let uniqueIdData = [];
    if (type === 'active_user' || type === "file_view") {
      uniqueIdData = _uniq(_flatMap(data, (item) => item.contactUUIDs));
    }
    return ({
      [xAxisValue]: key,
      [yAxisValue]: getTotalCount(data, key, type),
      contactUUIDs: uniqueIdData,
      bandwidthConsumed: getBandWidthCount(data, type),
      views: type === "file_view" ? getFileViews(data, key, type) : null,
    });
  });

  return constructedData;
}

export const barChartData = (type, data = [], axisValue) => {
  let orderedData = [];
  if (data && data.length) {
    orderedData = _orderBy(data, ['YearOfAccess', (item) => parseInt(item.MonthOfAccess)], ['asc', 'asc']);
  }

  return constructData(
    type,
    orderedData,
    axisValue.xAxisValue,
    axisValue.yAxisValue,
    axisValue.viewChartType
  )
}

export const currencyFormatter = (value, symbol = true) => `${symbol ? "$" : ""}${Number(value ?? 0).toLocaleString('en-US', { minimumFractionDigits: 0 })}`;

export const handleEmptyValue = value => value ? value : '-'

export const convertLowercaseFormat = (stringValue) => {
  return stringValue?.toLowerCase().trim()
}

export const searchBasedOnName = (members, searchValue) => {
  let nameBasedFilter = members?.filter((mem) => {
    return convertLowercaseFormat(`${mem?.Firstname}${mem?.Lastname}`).includes(searchValue.replaceAll(' ', ''))
  })
  return nameBasedFilter
}

export const searchBasedOnEmail = (members, searchValue) => {
  let emailBasedFilter = members?.filter((mem) => {
    return convertLowercaseFormat(mem?.Email).includes(searchValue)
  })
  return emailBasedFilter
}

export const sortName = (rec1, rec2) => (`${rec1?.Firstname}, ${rec1?.Lastname}`).localeCompare(`${rec2?.Firstname}, ${rec2?.Lastname}`);
export const sortColumnData = (obj1, obj2, key) => (`${obj1[key]}`).localeCompare(`${obj2[key]}`)
export const sortNumbers = (obj1, obj2, key) => {
  return obj1[key] > obj2[key] ? 1 : obj2[key] > obj1[key] ? -1 : 0
}

export const filesChartData = (filesData) => {
  const totalData = _map(_reduce(filesData, (total, data) => {
    let month = `${getMonthName(data.MonthOfAccess)} ${data.YearOfAccess}`;
    let monthData = total[month] ? { ...total[month] } : {};
    monthData.month = month;
    _forEach(data.file_details, (file) => {
      let fileTypeKey = file.file_type === 'Unknown' ? 'Others' : file.file_type;
      monthData[fileTypeKey] = (monthData[fileTypeKey] ?? 0) + file.views;
      let uuids = monthData[`${fileTypeKey}_data`] ?? [];
      let tempUuids = [];
      tempUuids = [...uuids, { ...file }];
      monthData[`${fileTypeKey}_data`] = tempUuids.sort((a, b) => (b.views - a.views));
    });

    total[month] = monthData;
    return total;

  }, {}), (fileData) => fileData);
  let orderedData = totalData.sort((a, b) => (new Date(a.month) - new Date(b.month)));
  return orderedData;
};