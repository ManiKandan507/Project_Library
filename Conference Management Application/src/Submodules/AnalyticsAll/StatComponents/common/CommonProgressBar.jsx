import React from 'react'
import { Progress, Tag, Tooltip } from "antd";
import { ReactComponent as Information } from '@/AnalyticsAll/NativeDashboards/ProductsAnalytics/assets/icons/Information.svg';

const CommonProgressBar = (props) => {
  return (
    <>
      {Object.keys(props.statistics).length > 0 ? props.progressBarData(props.statistics).map((data => {
        return (
          <>
            <div className="mt-4">
              <div className='d-flex justify-space-between' style={{ flexWrap: "wrap" }}>
                <div className='d-flex'>
                  <div className="card-title">{data.title.toUpperCase()}</div>
                  <div className="ml-2">
                    <Tooltip title={data.title} placement="right" >
                      <Information style={{ width: "1.3rem" }} />
                    </Tooltip>
                  </div>
                </div>
              </div>
              {props.fileView && <div className='py-2'>
                <div className="text-left progrssBarValue" style={{ fontWeight: '700' }}> {data.current} / <span style={{ fontWeight: 'normal' }}>{data.max} {data.suffix}</span></div>
                <div className='float-right'>
                  <Tag color={data.color} style={{ borderRadius: "10px" }}>{`${(data.usedStorage)}%`}</Tag>
                </div>
              </div>}
              <div>
                <Progress
                  strokeColor={data.color}
                  percent={data.usedStorage}
                  format={() => {
                    return (
                      <div className='text-center' style={{ fontSize: '15px', fontWeight: 'bold' }}>
                        {`${data.current} ${data.max ? `/ ${data.max} ${data.suffix}` : `${data.suffix}`}`}
                      </div>
                    )
                  }}
                  strokeWidth={6}
                  showInfo={false}
                />
              </div>
            </div>
          </>
        )
      })) : null
      }
    </>
  )
}
export default CommonProgressBar