import React, { useEffect } from "react";
import { Table } from "antd";
import { ArrowDownOutlined, ArrowUpOutlined } from "@ant-design/icons";
import moment from "moment/moment";
import { isEmpty } from "lodash";
import { useState } from "react";
import { currencyFormatter } from '@/AnalyticsAll/StatComponents/util';
const CompareSalesTableV1 = ({
  dataSource,
  type,
  pagination,
  scroll,
  className,
  bordered,
  startDate,
  viewBy,
  handleTableClick,
  setCompareTableData
}) => {

  const [updatedCompareSalesTable, setUpdatedCompareSalesTable] = useState([]);

  useEffect(() => {
    if (!isEmpty(type)) {
      let quarterDataSource = {};
      let monthDataSource = {};
      let finalDataSource = [];
      dataSource.map((data, index) => {
        if (viewBy == "month" || viewBy == "year") {
          if (
            isEmpty(monthDataSource) ||
            isEmpty(monthDataSource[data.NameOfMonth])
          ) {
            monthDataSource[data.NameOfMonth] = {
              [data.YearOfInvoice]: data,
            };
          } else {
            if (
              isEmpty(monthDataSource[data.NameOfMonth][data.YearOfInvoice])
            ) {
              monthDataSource[data.NameOfMonth] = {
                ...monthDataSource[data.NameOfMonth],
                [data.YearOfInvoice]: data,
              };
            } else {
              console.log("Error processing data", monthDataSource, data);
            }
          }
        }
        if (viewBy == "quarter") {
          if (
            isEmpty(quarterDataSource) ||
            isEmpty(quarterDataSource[data.Quarter])
          ) {
            quarterDataSource[data.Quarter] = {
              [data.YearOfInvoice]: data,
            };
          } else {
            if (isEmpty(quarterDataSource[data.Quarter][data.YearOfInvoice])) {
              quarterDataSource[data.Quarter] = {
                ...quarterDataSource[data.Quarter],
                [data.YearOfInvoice]: data,
              };
            } else {
              console.log("Error processing data", quarterDataSource, data);
            }
          }
        }

      });
      if (viewBy == "month" || viewBy == "year") {
        Object.entries(monthDataSource).map(([key, value]) => {
          finalDataSource.push({
            NameOfMonth: `${key}`,
            data: value,
          });
        });
      }
      if (viewBy == "quarter") {
        Object.entries(quarterDataSource).map(([key, value]) => {
          finalDataSource.push({
            Quarter: `${key}`,
            data: value,
          });
        });
      }
      setUpdatedCompareSalesTable(finalDataSource);
    }
  }, [viewBy, dataSource]);

  const compareSalesTableColumn = () => {
    const year = dataSource.map(val => {
      return val.YearOfInvoice;
    });

    const totalYears = [...new Set(year)];
    const salesYears =
      moment(startDate, "DD/MM/YYYY").format("MM") !==
        moment().startOf("year").format("MM")
        ? totalYears.length - 1
        : totalYears.length;
    let compareSalesColumn = [
      {
        title: <div className='primary-color'>MONTHS</div>,
        colspan: 3,
        width: "10%",
        dataIndex: "NameOfMonth",
        render: (data, row, index) => {
          const obj = {
            children: <div>{data}</div>,
            props: {},
          };
          return obj;
        },
      },
    ];
    compareSalesColumn.push(
      ...totalYears.map((year, index) => {
        return {
          title: <div className='primary-color'>{year}</div>,
          colspan: 0,
          dataIndex: "YearOfInvoice",
          render: (data, row, index) => {
            if (row.data?.[`${year}`]) {
              let tempRow = row.data?.[`${year}`];

              let text = tempRow.percent ?? "";
              const obj = {
                children: (
                  <>
                    {tempRow.TotalInvoices !== 0 || tempRow.TotalRevenue !== 0 ? <a onClick={() => handleTableClick(tempRow)}>
                      {type === "TOTAL_MEMBERS"
                        ? Math.round(tempRow.TotalInvoices)
                        : `${currencyFormatter(Math.round(tempRow.TotalRevenue))}`}
                    </a> : '-'}
                    {text !== "" && text !== "NA" && (
                      <>
                        &nbsp;(
                        {text !== "" && text !== "NA"
                          ? `${Math.abs(text).toFixed(2)}%`
                          : "-"}
                        {text !== "" && text !== "NA" ? (
                          Math.sign(text) === 1 ? (
                            <ArrowUpOutlined style={{ color: "green" }} />
                          ) : (
                            <ArrowDownOutlined style={{ color: "red" }} />
                          )
                        ) : (
                          ""
                        )}
                        )
                      </>
                    )}
                  </>
                ),
                props: {},
              };
              return obj;
            } else {
              return {};
            }
          },
        };
      })
    );
    return compareSalesColumn;
  };

  const compareQuarterTableColumn = () => {
    const year = dataSource.map(val => {
      return val.YearOfInvoice;
    });

    const totalYears = [...new Set(year)];
    const salesYears =
      moment(startDate, "DD/MM/YYYY").format("MM") !==
        moment().startOf("year").format("MM")
        ? totalYears.length - 1
        : totalYears.length;

    let compareSalesColumn = [
      {
        title: <div className='primary-color'>QUARTER</div>,
        colspan: 3,
        width: "10%",
        dataIndex: "Quarter",
        render: (data, row, index) => {
          const obj = {
            children: <div>{data}</div>,
            props: {},
          };
          return obj;
        },
      },
    ]

    compareSalesColumn.push(
      ...totalYears.map((year, index) => {
        return {
          title: <div className='primary-color'>{year}</div>,
          colspan: 0,
          dataIndex: "YearOfInvoice",
          render: (data, row, index) => {
            if (row.data?.[`${year}`]) {
              let tempRow = row.data?.[`${year}`];

              let text = tempRow.percent ?? "";
              const obj = {
                children: (
                  <>
                    <a onClick={() => handleTableClick(tempRow)}>
                      {type === "TOTAL_MEMBERS"
                        ? Math.round(tempRow.TotalInvoices)
                        : `$${currencyFormatter(Math.round(tempRow.TotalRevenue))}`}
                    </a>
                    {text !== "" && text !== "NA" && (
                      <>
                        &nbsp;(
                        {text !== "" && text !== "NA"
                          ? `${Math.abs(text)}%`
                          : "-"}
                        {text !== "" && text !== "NA" ? (
                          Math.sign(text) === 1 ? (
                            <ArrowUpOutlined style={{ color: "green" }} />
                          ) : (
                            <ArrowDownOutlined style={{ color: "red" }} />
                          )
                        ) : (
                          ""
                        )}
                        )
                      </>
                    )}
                  </>
                ),
                props: {},
              };
              return obj;
            } else {
              return {};
            }
          },
        };
      })
    );
    return compareSalesColumn;
  };

  useEffect(() => {
    if (updatedCompareSalesTable.length) {
      setCompareTableData(updatedCompareSalesTable)
    }
  }, [updatedCompareSalesTable])

  return (
    <div>
      <Table
        dataSource={updatedCompareSalesTable}
        columns={
          viewBy === "month" || viewBy === "year"
            ? compareSalesTableColumn()
            : compareQuarterTableColumn()
        }
        pagination={pagination}
        scroll={scroll}
        className={className}
        bordered={bordered}
      />
    </div>
  );
};

export default CompareSalesTableV1;
