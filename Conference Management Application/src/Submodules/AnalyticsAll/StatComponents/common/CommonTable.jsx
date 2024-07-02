import { Table } from 'antd'
import React from 'react'

const CommonTable = (props) => {
    const {dataSource,columns,pagination,scroll,loading,className} = props
  return (
    <Table 
          dataSource={dataSource}
          columns={columns}
          pagination={pagination}
          scroll={scroll}
          loading={{spinning:loading,tip:"loading..."}}
          className={className}
          />
  )
}

export default CommonTable