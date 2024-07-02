import { PieChartFilled } from "@ant-design/icons";
import { Progress, Tag, Tooltip } from "antd"
import { useEffect } from "react";
import { useState } from "react";
import { ReactComponent as Information } from '@/AnalyticsAll/NativeDashboards/ProductsAnalytics/assets/icons/Information.svg';
import { ReactComponent as Summary } from '@/AnalyticsAll/NativeDashboards/ProductsAnalytics/assets/icons/Summary.svg';
import CommonSpinner from "@/AnalyticsAll/StatComponents/common/CommonSpinner";
import { useFileDetails } from "@/AnalyticsAll/StatComponents/hooks/FileDetailsHook";
import { useStatistics } from "@/AnalyticsAll/StatComponents/hooks/StatisticsHook";
import { getRoundValue } from "@/AnalyticsAll/StatComponents/utils";

export const GlobalSummary = (props) => {
  const { params: { appdir } } = props
  const [constructData, setConstructData] = useState([])
  const { fileDetails } = useFileDetails(appdir)
  const { statistics, loading } = useStatistics(appdir)

  useEffect(() => {
    if (Object.keys(fileDetails).length > 0)
      setConstructData(filesCardData(fileDetails))
  }, [fileDetails])

  const filesCardData = (data) => [
    {
      title: 'FILES',
      value: data.total_files,
      size: `${getRoundValue(data.total_files_size, 2)} GB`
    },
    {
      title: 'VIDEOS',
      value: data.total_videos,
      size: `${getRoundValue(data.total_videos_size, 2)} GB`
    },
    {
      title: 'PDFs',
      value: data.total_pdfs,
      size: `${getRoundValue(data.total_pdfs_size, 2)} GB`
    },
    {
      title: 'IMAGES',
      value: data.total_images,
      size: `${getRoundValue(data.total_images_size, 2)} GB`
    },
    {
      title: 'OTHER FILES',
      value: data.total_unknowns,
      size: `${getRoundValue(data.total_unknowns_size, 2)} GB`
    },
  ];

  const getPercentage = (statistics) => {
    let used = ((statistics.total_storage - statistics.total_utilized_storage) / statistics.total_storage) * 100
    return { usedStorage: 100 - used }
  }

  const renderTitle = () => {
    return <div className="d-flex py-2 ml-2">
      <div className="globalSummary card-title">
        GLOBAL SUMMARY
      </div>
      <div className="ml-2">
        <Information style={{ width: "1.3rem" }} />
      </div>
    </div>
  }

  const renderFileTypes = () => {
    return <div className="d-flex justify-space-between ml-2" style={{ flexWrap: "wrap" }} >
      {constructData.length > 0
        ? constructData.map((data, index) => {
          return (
            <div
              key={index}
              className="text-left py-3"
              style={{ width: "130px" }}
            >
              <div className="card-title">
                {" "}
                {data.title}
                <span className="ml-2">
                  {data.title !== 'OTHER FILES' && <Tooltip title={data.title} placement="right">
                    <Information style={{ width: "1.3rem" }} />
                  </Tooltip>}
                </span>
              </div>
              <div className="cardValues"> {data.value.toLocaleString()} </div>
              <div className="pieChartFilled">
                <PieChartFilled />
                {data.size}
              </div>
            </div>  
          );
        })
        : null}
    </div>
  }

  const renderProgressBar = () => {
    return <Progress
      strokeColor={Math.trunc(getPercentage(statistics).usedStorage.toFixed(2)) >= 80 ? 'red' : 'green'}
      percent={getPercentage(statistics).usedStorage.toFixed(2)}
      format={() => {
        return (
          <div className='text-center' style={{ fontSize: '15px', fontWeight: 'bold' }}>
            {`${getRoundValue((statistics.total_utilized_storage), 2)} ${statistics.total_storage ? `/ ${statistics.total_storage} ${'GB'}` : `${'GB'}`}`}
          </div>
        )
      }}
      strokeWidth={6}
      showInfo={false}
    />
  }

  const renderTotalStorage = () => {
    if (Object.keys(statistics).length > 0) {
      return <div className="mt-4 ml-2">
        <div className='d-flex'>
          <div className="card-title">{'TOTAL STORAGE LEFT'}</div>
          <div className="ml-2">
            <Tooltip title={"Total Storage Left"} placement="right" >
              <Information style={{ width: "1.3rem" }} />
            </Tooltip>
          </div>
        </div>
        <div className='py-2'>
          <div className="text-left progrssBarValue" style={{ fontWeight: '700' }}> {`${getRoundValue((statistics.total_utilized_storage), 2)}`} / <span style={{ fontWeight: 'normal' }}>{`${statistics.total_storage}`} {'GB'}</span></div>
          <div className='float-right'>
            <Tag color={Math.trunc(getPercentage(statistics).usedStorage.toFixed(2)) >= 80 ? 'red' : 'green'} style={{ borderRadius: "10px" }} className="mr-auto">{`${(getPercentage(statistics).usedStorage.toFixed(2))}%`}</Tag>
          </div>
        </div>
        <div>
          {renderProgressBar()}
        </div>
      </div>
    }
    return null
  }

  return (
    <CommonSpinner loading={loading} className="spinning">
      <div className="mx-2">
        {renderTitle()}
        {renderTotalStorage()}
        {renderFileTypes()}
      </div>
    </CommonSpinner>
  );
}