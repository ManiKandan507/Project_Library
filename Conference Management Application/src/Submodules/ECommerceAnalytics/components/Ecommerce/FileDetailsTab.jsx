import React, { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import _map from 'lodash/map';
import _reduce from 'lodash/reduce';
import _slice from 'lodash/slice'

import CustomResponsiveBarCanvas from "./Common/ResponsiveBarCanvas";
import RenderCard from "./Common/RenderCard";
import { filesChartData, displayLabel } from "./Utils";
import {
  fetchFilesStatisticsDataRequest,
  fetchMonthlyFilesDataRequest,
  showModal
} from "../../appRedux/actions";
import { get30PriorDate, getCurrentDate } from "./Common/Utils";
import { PAGE_SIZE, CURRENT_PAGE, LEGENDS_KEYS } from "../../constants";
import HeaderContainer from "./Common/HeaderContainer";
import CardWrapper from "./Common/CardWrapper";
import { formatDate } from "./Common/Utils";

const FileDetailsTab = ({ appdir, primary_color }) => {

  const dispatch = useDispatch();

  const [dates, setDates] = useState([get30PriorDate(), getCurrentDate()]);
  const [fileBarChartData, setFileBarChartData] = useState({});
  const [dataSource, setDataSource] = useState([]);
  const [totalData, setTotalData] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);

  const fileStatisticData = useSelector(
    (state) => state.reporting.fileStatisticData
  )

  const monthlyFilesViewData = useSelector(
    (state) => state.reporting.monthlyFilesViewData
  )

  const fileChartLoading = useSelector(
    (state) => state.reporting.fileChartLoading
  )

  const activeUserLoading = useSelector(
    (state) => state.reporting.activeUserLoading
  );

  useEffect(() => {
    dispatch(fetchFilesStatisticsDataRequest({ appDir: appdir }));
  }, [])

  useEffect(() => {
    dispatch(fetchMonthlyFilesDataRequest({
      appDir: appdir,
      startDate: dates[0],
      endDate: dates[1],
    }))
  }, [dates]);

  const handleDateChange = (date, dateStrings) => {
    setDates([
      dateStrings?.[0] ? formatDate(dateStrings?.[0]) : "",
      dateStrings?.[1] ? formatDate(dateStrings?.[1]) : ""
    ]);
  }

  const handleBarChart = (chartData) => {
    if (chartData?.data) {
      setDataSource(_slice(chartData?.data[`${chartData.id}_data`], CURRENT_PAGE, PAGE_SIZE));
      setTotalData(chartData?.data[`${chartData.id}_data`]);
    }
    setFileBarChartData(chartData);
    dispatch(showModal(true));
  }

  const handlePagination = (val) => {
    setCurrentPage(val);
    const startIdx = ((val - 1) * PAGE_SIZE);
    const remaining = (totalData.length - ((val - 1) * PAGE_SIZE));
    const limit = totalData.length > (startIdx + PAGE_SIZE) ? (startIdx + PAGE_SIZE) : (startIdx + remaining);
    setDataSource(_slice(totalData, ((val - 1) * PAGE_SIZE), limit));
  }


  const TotalLabels = ({ bars, yScale }) => {
    const labelMargin = 20;
    let total = 0;
    return _map(bars, ({ data: { data, indexValue }, x, width }, i) => {
      total = _reduce(_map(LEGENDS_KEYS.FILES, key => data[key]), (tot, val) => {
        return val ? tot + val : tot;
      }, 0);
      return (
        <g
          transform={`translate(${x}, ${yScale(total) - labelMargin})`}
          key={`${indexValue}-${i}`}
        >
          <text
            className="bar-total-label"
            x={width / 2}
            y={labelMargin / 2}
            textAnchor="middle"
          >
            {`${total} File Views`}
          </text>
        </g>
      );
    });
  };

  const handleonCloseModal = () => {
    setCurrentPage(1)
  }

  return (
    <div>
      <RenderCard type="files" isSubContent data={fileStatisticData} primary_color={primary_color} />
      <div style={{ marginTop: '3rem' }}>
        <CardWrapper isNavigation={false}>
            <HeaderContainer
              title="File Views"
              screen="files"
              handleDateChange={handleDateChange}
            />
          <CustomResponsiveBarCanvas
            data={filesChartData(monthlyFilesViewData)}
            appdir={appdir}
            indexBy="month"
            axisBottom={{ legendOffset: 50 }}
            axisLeft={{ legend: 'views' }}
            keys={LEGENDS_KEYS.FILES}
            colors={{ scheme: 'nivo' }}
            margin={{ top: 80, right: 130, bottom: 80, left: 80 }}
            enableLabel
            layers={["grid", "axes", "bars", TotalLabels, "markers", "legends", "annotations"]}
            loader={fileChartLoading}
            label={displayLabel}
            handleClick={handleBarChart}
            modelTitle="File Views"
            barChartData={fileBarChartData}
            tableData={dataSource}
            tableLoading={activeUserLoading}
            paginationTotalCount={totalData?.length}
            tableColumnKey="file"
            handlePagination={handlePagination}
            page={currentPage}
            handleonCloseModal={handleonCloseModal}
          />
        </CardWrapper>
      </div>
    </div>
  );

};

export default FileDetailsTab;