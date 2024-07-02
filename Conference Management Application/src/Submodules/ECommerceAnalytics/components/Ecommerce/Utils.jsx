import { UserOutlined } from '@ant-design/icons';
import { Avatar } from 'antd';
import _forEach from 'lodash/forEach';
import _flatMap from 'lodash/flatMap';
import _map from 'lodash/map';
import _groupBy from 'lodash/groupBy';
import _filter from 'lodash/filter';
import _uniq from 'lodash/uniq';
import _reduce from 'lodash/reduce';
import _orderBy from 'lodash/orderBy';

import { getRoundValue } from './Common/Utils';
import { handleEmptyValue } from '../../helpers/common';
import { ReactComponent as Home} from '../../assets/images/Home.svg';
import { ReactComponent as User} from '../../assets/images/User.svg';
import { ReactComponent as File} from '../../assets/images/File.svg';

export let offset = 0;
export let limit = 10;
export let PAGE_SIZE = 10;

export const tabItems = [
  {
    screen: "home",
    screenName: "Home",
    IconMenu: Home
  },
  // {
  //   screen: "bandwidth",
  //   screenName: "Bandwidth",
  // },
  {
    screen: "user",
    screenName: "User",
    IconMenu: User
  },
  {
    screen: "file",
    screenName: "File",
    IconMenu: File
  },
  // {
  //   screen: "product",
  //   screenName: "Product",
  // },
];

export const productDetailsColumn = [
  {
    title: 'Product Name',
    dataIndex: 'product_name',
    key: 'product_name',
    width: '50%',
    className: 'text-left',
    ellipsis: true
  },
  {
    title: 'Views',
    dataIndex: 'views',
    key: 'views',
    width: '50%',
    className: 'text-left',
  },
];

export const userColumns = [
  {
    title: 'User Name',
    dataIndex: 'user',
    key: 'user',
    className: 'text-left',
    render: (data) => {
      return (
        <div className="d-flex flex-row align-center">
          <Avatar size={40} alt="profile" icon={<UserOutlined />} src={data.profile_file} />
          <div style={{ marginLeft: '1rem', fontSize: '16px' }}>
            {data.firstname} {data.lastname}
          </div>
        </div>
      )
    }
  },
  {
    title: 'File Accessed',
    dataIndex: 'file_accessed',
    key: 'file_accessed',
    className: 'text-left',
    render: (data) => {
      return <div style={{ fontSize: '16px' }}>{data}</div>
    },
  },
];

export const fileColumns = [
  {
    title: 'Product Name',
    dataIndex: 'product_name',
    key: 'product_name',
    className: 'text-left',
    width: '60%',
    ellipsis: true,
  },
  {
    title: 'Type',
    dataIndex: 'file_type',
    key: 'file_type',
    className: 'text-left',
    render: (data) => {
      return <div>{data === 'Unknown' ? '' : data}</div>
    },
    width: '20%'
  },
  {
    title: 'Views',
    dataIndex: 'views',
    key: 'views',
    className: 'text-left',
  },
];

export const userData = (activeUserData) => {
  let constructData = _orderBy(_map(activeUserData, (data, index) => {
    return ({
      key: index,
      user: {
        firstname: data.Firstname,
        lastname: data.Lastname,
        profile_file: data.Picture
      },
      file_accessed: data.file_views,
    });
  }), ['file_accessed'], ['desc']);
  return constructData;
}

const getMonthName = (MonthOfAccess) => {
  let month = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'July', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  let filterMonth = month[MonthOfAccess - 1];
  return filterMonth;
}

export const displayLabel = (data) => {
  if (data.id === 'bandwidth') return `${data.value} GB`
  else if (data.id === 'user') return `${data.value} Users`
  else if (data.id === 'Others') return `${data.value} Other Files`
  else if (data.id === 'product views') return `${data.value} Products`
  else if (data.id === 'Video' || data.id === 'Image') return `${data.value} ${data.id}s`
  return `${data.value} ${data.id}`
}

const getTotalCount = (data, key, type) => {
  let total = 0;
  if (type === 'active_user') {
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

export const constructData = (
  type,
  data,
  xAxisValue = 'x',
  yAxisValue = 'y',
  viewChartType = 'month'
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

  let monthAndYearData = _map(data, (list) => ({
    ...list,
    MonthAndYear: `${getMonthName(list.MonthOfAccess)} - ${list.YearOfAccess}`
  }));

  let groupByData = _groupBy(monthAndYearData, 'MonthAndYear');

  let constructedData = _map(groupByData, (data, key) => {
    let uniqueIdData = [];
    if (type === 'active_user') {
      uniqueIdData = _uniq(_flatMap(data, (item) => item.contactUUIDs));
    }

    return ({
      [xAxisValue]: key,
      [yAxisValue]: getTotalCount(data, key, type),
      contactUUIDs: uniqueIdData
    });
  });

  return constructedData;
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
      if (_filter(uuids, val => val.product_id === file.product_id).length) {
        tempUuids = _map(uuids, val => {
          if (val.product_id === file.product_id) {
            return {
              ...val,
              views: val.views + file.views
            }
          }
          return { ...val };
        });
      } else {
        tempUuids = [ ...uuids, { ...file } ];
      }
      monthData[`${fileTypeKey}_data`] = tempUuids.sort((a, b) => (b.views - a.views));
    });
    total[month] = monthData;
    return total;
  }, {}), (fileData) => fileData);
  let orderedData = totalData.sort((a, b) => (new Date(a.month) - new Date(b.month)));
  return orderedData;
};

export const progressBarData = (data) => {
  const {
    current_month_bandwidth,
    current_month_active_users,
    max_monthly_bandwidth,
    max_monthly_users
  } = data;
  return [
    {
      title: "Monthly Active Users",
      percentage: (current_month_bandwidth / max_monthly_bandwidth * 100),
      current: getRoundValue(current_month_bandwidth, 2),
      max: max_monthly_bandwidth,
      suffix: 'GB',
      color:'red'
    },
    {
      title: "Monthly Bandwidth",
      percentage: (current_month_active_users / max_monthly_users * 100),
      current: current_month_active_users,
      max: max_monthly_users,
      suffix: 'Users',
      color:'green'
    },
  ];
}

export const cardData = (data) => [
  {
    title: 'Total Products',
    value: data.total_products,
  },
  {
    title: 'Total Files',
    value: data.total_files,
  },
  {
    title: 'Total Storage',
    value: `${getRoundValue(data.total_utilized_storage, 2)} ${data.total_storage ? `/ ${data.total_storage} GB` : 'GB'}`,
  },
];

export const filesCardData = (data) => [
  {
    title: 'Total Files',
    value: data.total_files,
    size: `Size ${getRoundValue(data.total_files_size, 2)} GB`
  },
  {
    title: 'Total Images',
    value: data.total_images,
    size: `Size ${getRoundValue(data.total_images_size, 2)} GB`
  },
  {
    title: 'Total PDF',
    value: data.total_pdfs,
    size: `Size ${getRoundValue(data.total_pdfs_size, 2)} GB`,
  },
  {
    title: 'Total Video',
    value: data.total_videos,
    size: `Size ${getRoundValue(data.total_videos_size, 2)} GB`
  },
  {
    title: 'Total Other Files',
    value: data.total_unknowns,
    size: `Size ${getRoundValue(data.total_unknowns_size, 2)} GB`
  }
];

export const tableColumns = (tableColumnKey, appdir) => {

  const defaultColumns = [
    {
      title: 'Profile',
      dataIndex: "Picture",
      key: "picture",
      render: (data) => {
        return <Avatar size={40} alt="profile" icon={<UserOutlined />} src={data} />
      }
    },
    {
      label: "First Name",
      title: 'First name',
      dataIndex: "Firstname",
      key: "firstname",
      render: val => <span>{handleEmptyValue(val)}</span>,
    },
    {
      title: 'Last Name',
      dataIndex: "Lastname",
      label: "Last Name",
      key: "Lastname",
      render: val => <span>{handleEmptyValue(val)}</span>,
    },
    {
      title: 'Organization',
      dataIndex: "Company",
      label: "Organization",
      key: "Company",
      render: val => <span>{handleEmptyValue(val)}</span>,
    },
  ];

  const fileColumns = [
    {
      title: 'Product Name',
      dataIndex: "product_label",
      label: "Product Name",
      key: "ProductName",
      className: 'text-left',
      width: tableColumnKey === 'By_User' ? '65%' : '75%',
      ellipsis: true,
    },
    {
      title: 'Views',
      dataIndex: "views",
      label: "views",
      key: "views",
    },
  ];


  const byMonthColumns = [
    {
      title: 'Total Product Views',
      label: "Total Product Views",
      dataIndex: "product_views",
      key: "TotalViews",
    },
    {
      title: 'E-mail',
      dataIndex: "Email",
      label: "E-mail",
      key: "Email",
      render: val => <span>{handleEmptyValue(val)}</span>,
    },
    {
      title: 'Contact ID',
      dataIndex: "ReviewIDThisCustID",
      label: "Contact ID",
      key: "ReviewIDThisCustID",
      render: val => <span>{handleEmptyValue(val)}</span>,
    },
  ];

  const productIDcolumns = [
    {
      title: 'Product ID',
      dataIndex: "product_id",
      label: "Product ID",
      key: "ProductID",
    },
  ]

  const actionColumn = [
    {
      title: 'Action',
      dataIndex: "ReviewIDThisCustID",
      key: "",
      // render: custId =>
      //   appdir && custId ? (
      //     <a
      //       target="_blank"
      //       href={`https://www.xcdsystem.com/${appdir}/admin/contacts/managecontacts/index.cfm?CFGRIDKEY=${custId}`}
      //     >
      //       Manage
      //     </a>
      //   ) : (
      //     "-"
      //   ),
      render: custId => (
        <a
          target="_blank"
          href={`https://www.xcdsystem.com/${appdir}/admin/contacts/managecontacts/index.cfm?CFGRIDKEY=${custId}`}
        >
          {tableColumnKey === 'By_User' ? 'View Product' : 'Manage'}
        </a>
      ),
    },
  ];

  let constructedColumn = [];
  if (tableColumnKey === 'file') {
    constructedColumn = [...fileColumns];
  } else if (tableColumnKey === 'By_Month') {
    constructedColumn = [...defaultColumns, ...byMonthColumns, ...actionColumn];
  } else if (tableColumnKey === 'By_User') {
    constructedColumn = [
      ..._filter(fileColumns, (data) => data.key === 'ProductName'),
      ...productIDcolumns,
      ...actionColumn
    ];
  }
  return constructedColumn;
}