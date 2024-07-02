import React from 'react'
import { Avatar, Button, Tooltip } from 'antd'
import { ReactComponent as Information } from '@/AnalyticsAll/NativeDashboards/ProductsAnalytics/assets/icons/Information.svg';
import { useMostActiveUserHook } from '@/AnalyticsAll/StatComponents/hooks/MostActiveUserHook'
import { UserOutlined } from '@ant-design/icons';
import _filter from 'lodash/filter';
import _slice from 'lodash/slice';
import CommonTable from '@/AnalyticsAll/StatComponents/common/CommonTable';
import { sortName, sortNumbers } from '@/AnalyticsAll/StatComponents/utils';

export const MostActiveUsers = (props) => {
  const { params: { appdir }, dates } = props
  let { mostActiveUser, loading } = useMostActiveUserHook(appdir, dates)
  const userColumns = [
    {
      title: 'User',
      dataIndex: 'user',
      key: 'user',
      className: 'text-left',
      width: '75%',
      render: (_, data) => {
        return (
          <div className="d-flex flex-row align-center">
            <Avatar size={40} alt="profile" icon={<UserOutlined />} src={data?.Picture} />
            <div style={{ marginLeft: '1rem', fontSize: '16px' }}>
              {data?.Firstname} {data?.Lastname}
            </div>
          </div>
        )
      },
      
    },
    {
      title: 'Files',
      dataIndex: 'file_views',
      key: 'file_views',
      className: 'text-right',
      width: '25%',
  
    },
  ];

  return (
    <div className='mt-8' style={{ height: "356px" }}>
      <div className='d-flex'>
        <div className='mr-2 pb-3 card-title '>MOST ACTIVE USERS</div>
        <Tooltip title={"Most Active Users"} placement="right">
          <Information className='mb-5' style={{ width: "1.3rem" }} />
        </Tooltip>
      </div>
      <div>
        <CommonTable
          columns={userColumns}
          dataSource={_slice(_filter(mostActiveUser, (data) => data?.file_views > 0), 0, 10)}
          pagination={false}
          loading={loading}
          className='tableHeader table-bg-color'
        />
      </div>
      <div className='d-flex mt-1'>
        <Button className='exploreBtn' onClick={() => props.handleExplore('user')}><span style={{ textDecoration: 'underline' }}>Explore More</span></Button>
      </div>
    </div>
  )
}
