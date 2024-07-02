import React, { useEffect, useState } from "react";
import { ResponsiveBar } from "@nivo/bar";
import _forEach from "lodash/forEach";
import _every from "lodash/every";
import TotalLabels from "@/AnalyticsAll/StatComponents/common/TotalLabels"
import NoDataFound from "@/AnalyticsAll/StatComponents/common/NoDataFound";
import { currencyFormatter } from "@/AnalyticsAll/StatComponents/utils";
import DetailsModal from "@/AnalyticsAll/StatComponents/common/DetailsModal";

const CustomResponsiveBarChart = ({
  data = [],
  keys = ["CountPerGroup"],
  margin = {},
  indexBy = "GroupName",
  borderColor = {},
  colors,
  tooltip,
  axisTop = null,
  axisRight = null,
  axisBottom = {},
  axisLeft = {},
  labelSkipWidth = 0,
  labelSkipHeight = 10,
  labelTextColor = "yellow",
  lineStyle = "None",
  height = 500,
  className = "lineChart",
  customDateLayerConfig = {},
  enableLabel = false,
  sourceHex = '',
  memberLoading = false,
  screen = '',
  payload = {},
  appdir = '',
  chartHeaderData = {},
  loader = false,
  layers = [],
  label = () => { },
  handleClick = () => { },
  modelTitle = '',
  barChartData,
  tableColumnKey,
  tableData,
  tableLoading,
  paginationTotalCount = 0,
  handlePagination,
  page,
  handleonCloseModal = () => { },
  noDataLabel = "",
  showModal = false,
  chartRef,
  handlefilesChange = () => { },
  selectedFile,
  onFileSearch = () => { },
  fileMonth,
  isChartTable,
  active,
}) => {

  // const chartRef = createRef();
  const [selectedItem, setSelectedItem] = useState({})

  useEffect(() => {
    if (paginationTotalCount) {
      setSelectedItem({
        totalCount: paginationTotalCount
      })
    }
  }, [paginationTotalCount]);

  margin = {
    ...margin,
    top: margin["top"] ?? 50,
    right: margin["right"] ?? 130,
    bottom: margin["bottom"] ?? 100,
    left: margin["left"] ?? 60
  }
  borderColor = {
    ...borderColor,
    from: borderColor["from"] ?? "color",
    modifiers: borderColor["modifiers"] ?? [["darker", 1.6]]
  }
  axisBottom = {
    ...axisBottom,
    tickSize: axisBottom["tickSize"] ?? 8,
    tickPadding: axisBottom["tickPadding"] ?? 10,
    tickRotation: axisBottom["tickRotation"] ?? -21,
    legend: axisBottom["legend"] ?? "",
    legendPosition: axisBottom["legendPosition"] ?? "middle",
    legendOffset: axisBottom["legendOffset"] ?? 80
  }
  axisLeft = {
    ...axisLeft,
    tickSize: axisLeft["tickSize"] ?? 1,
    tickPadding: axisLeft["tickPadding"] ?? 1,
    tickRotation: axisLeft["tickRotation"] ?? 0,
    legend: axisLeft["legend"] ?? "Number of Members",
    legendPosition: axisLeft["legendPosition"] ?? "middle",
    legendOffset: axisLeft["legendOffset"] ?? -40
  }
  customDateLayerConfig = {
    ...customDateLayerConfig,
    textAlign: customDateLayerConfig["textAlign"] ?? 'right',
    fontSize: customDateLayerConfig['fontSize'] ?? '20px',
    color: customDateLayerConfig["color"] ?? '#2a2a2a'
  }

  const defaultColors = ({ id, data }) => {
    return data["color"];
  }

  const getTooltipText = (id, value) => {
    if (id === 'bandwidth') return 'GB'
    else if (id === 'user') return 'Users'
    else if (id === 'Others') return 'Other files'
    else if (id === 'product views') return `Product ${value > 1 ? 'Views' : 'View'}`
    else if (id === 'Video' || id === 'Image') return `${id}s`
    return `${id}`
  }

  const defaultTooltip = ({ value, color, indexValue, id, ...rest }) => {
    return (
      <div
        style={{
          padding: 5,
          color,
          background: "#222222",
        }}
      >
        <span>
          {indexValue} : {currencyFormatter(value, false)} {getTooltipText(id, value)}
        </span>
      </div>
    )
  }

  const handleBarChartData = () => {
    let isChartEmpty = false;
    _forEach(keys, (key) => {
      if (key === 'bandwidth') {
        isChartEmpty = _every(data, { bandwidth: 0 });
      } else if (key === 'user') {
        isChartEmpty = _every(data, { user: 0 });
      } else if (key === 'product views') {
        isChartEmpty = _every(data, { product: 0 });
      } else {
        isChartEmpty = _every(data, { PDF: 0, Image: 0, Video: 0, Others: 0 });
      }
    });
    return isChartEmpty;
  }

  // const handleClick = val => {
  //     // setSelectedItem({ ...val, groupTitle: val.indexValue })
  //     // dispatch(getMemberDetailsRequest({ screen, sourceHex, groupid: val.data.GroupID, detailed: 1, offset: 0, limit: PAGE_SIZE, ...payload }))
  //     dispatch(showModal(true))
  // }


  chartHeaderData["downloadChart"] = { ...chartHeaderData["downloadChart"], disabled: loader, chartRef }
  return (
    <div>
      {!data.length || handleBarChartData() ? (
        <div className="d-flex justify-center align-center h-500">
          <NoDataFound noDataLabel={noDataLabel} />
        </div>
      ) : (
        <div>
          <div
            ref={chartRef}
            className={className}
            style={{ height: height }}
          >
            <ResponsiveBar
              data={data}
              onClick={handleClick}
              enableLabel={enableLabel}
              keys={keys}
              margin={margin}
              indexBy={indexBy}
              borderColor={borderColor}
              colors={colors ?? defaultColors}
              tooltip={tooltip ?? defaultTooltip}
              axisTop={axisTop}
              axisRight={axisRight}
              axisBottom={axisBottom}
              padding={0.5}
              axisLeft={axisLeft}
              label={d => label(d)}
              labelSkipWidth={labelSkipWidth}
              labelSkipHeight={labelSkipHeight}
              labelTextColor={labelTextColor}
              lineStyle={lineStyle}
              layers={
                layers.length
                  ? layers
                  : [
                    "grid",
                    "axes",
                    "bars",
                    props =>
                      TotalLabels({
                        ...props,
                        onTotalLabelClick: handleClick,
                        screen: screen,
                      }),
                    "markers",
                    "legends",
                  ]
              }
            />
          </div>
          {showModal && (
            <DetailsModal
              fileName={chartHeaderData["downloadChart"]?.fileName}
              appdir={appdir}
              payload={payload}
              screen={screen}
              sourceHex={sourceHex}
              selectedItem={selectedItem}
              handleClose={() => {
                handleonCloseModal();
              }}
              visible={showModal}
              modelTitle={modelTitle}
              barChartData={barChartData}
              tableColumnKey={tableColumnKey}
              tableData={tableData}
              tableLoading={tableLoading}
              handlePagination={handlePagination}
              page={page}
              handlefilesChange={handlefilesChange}
              selectedFile={selectedFile}
              onFileSearch={onFileSearch}
              fileMonth={fileMonth}
              active={active}
              isChartTable= {isChartTable}
            />
          )}
        </div>
      )}
    </div>
  );
}

export default CustomResponsiveBarChart