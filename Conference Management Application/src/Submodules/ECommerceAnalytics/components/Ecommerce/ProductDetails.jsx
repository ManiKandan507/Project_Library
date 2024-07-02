import React, { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { productDetailsColumn } from './Utils';
import CardWrapper from "./Common/CardWrapper";
import CustomTable from "./Common/CustomTable";
import _map from 'lodash/map';
import moment from "moment";

import { fetchMostViewedProductsRequest } from "../../appRedux/actions";
import { get30PriorDate, getCurrentDate } from "./Common/Utils";
import { PAGE_SIZE } from "../../constants";
import HeaderContainer from "./Common/HeaderContainer";
import { formatDate } from "./Common/Utils";

const ProductDetails = ({ appdir }) => {
  const dispatch = useDispatch();

  const [page, setPage] = useState(1);
  const [dates, setDates] = useState([get30PriorDate(), getCurrentDate()]);

  const mostViewProductData = useSelector(
    (state) => state.reporting.mostViewProductData
  );

  const productLoading = useSelector(
    (state) => state.reporting.productLoading
  );

  useEffect(() => {
    dispatch(fetchMostViewedProductsRequest({
      appDir: appdir,
      startDate: dates[0],
      endDate: dates[1],
      limit: PAGE_SIZE,
      offset: 0
    }));
  }, [dates]);

  const handleDateChange = (value, dateStrings) => {
    setDates([
      dateStrings?.[0] ? formatDate(dateStrings?.[0]) : "",
      dateStrings?.[1] ? formatDate(dateStrings?.[1]) : ""
    ]);
  }

  const handlePagination = (val, pageSize) => {
    setPage(val);
    dispatch(fetchMostViewedProductsRequest({
      appDir: appdir,
      startDate: dates[0],
      endDate: dates[1],
      limit: PAGE_SIZE,
      offset: ((val - 1) * PAGE_SIZE)
    }));
  }

  return (
    <CardWrapper isNavigation={false}>
      <HeaderContainer
        screen="products"
        title="Product Views"
        handleDateChange={handleDateChange}
      />
      <div style={{ paddingTop: '2rem' }}>
        <CustomTable
          exportCsv={false}
          columns={productDetailsColumn}
          tableData={mostViewProductData?.products}
          bordered
          loading={productLoading}
          page={page}
          handlePagination={handlePagination}
          selectedItem={mostViewProductData}
        />
      </div>
    </CardWrapper>
  );
};

export default ProductDetails;
