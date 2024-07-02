import React, { useEffect, useState } from 'react';

import { Divider, Table, Popconfirm, Col, Row } from 'antd';
import moment from 'moment';
import { useSelector, useDispatch } from 'react-redux';
import { ReactComponent as ItemIcon } from '../../assets/icons/item.svg';
import { ReactComponent as AmountIcon } from '../../assets/icons/amount.svg';
import { ReactComponent as CrossWhiteIcon } from '../../assets/icons/crosswhite.svg';
import { ReactComponent as PaymentsIcon } from '../../assets/icons/payments.svg';
import { formatPayment } from './helpers/helper';
import { MinusOutlined, PlusOutlined } from '@ant-design/icons';
import { useShoppingCart } from '../Ecommerce/Store/hooks/useShoppingCart';
import CommonQuantityCount from '../Ecommerce/Store/SelectionPage/CommonQuantity';
import { updatedProductCount } from '../../appRedux/actions';

var hash = require('object-hash');

const RegistrationItems = props => {
	const [invoiceItemArray, setInvoiceItemArray] = useState([]);
	const [ addToCart ] = useShoppingCart()
	const dispatch = useDispatch()

	const updatedProduct = useSelector(state => state.ecommerce.updatedProductCount);

	// antd data need unique key or else create duplicate issue, looping over array to create unique key for each row
	useEffect(() => {
		if (props?.cartProcessView) {
			return;
		}
		let uniqueInvoiceItemArray = [];

		for (let i = 0; i < props.cartItems?.InvoiceItemArray?.length; i++) {
			let curr = props.cartItems?.InvoiceItemArray[i];
			curr['key'] = i;
			uniqueInvoiceItemArray.push(curr);
		}
		setInvoiceItemArray(uniqueInvoiceItemArray);
	}, []);

	useEffect(() => {
		if (props?.cartProcessView) {
			return;
		}
		let uniqueInvoiceItemArray = [];

		for (let i = 0; i < props.cartItems?.InvoiceItemArray?.length; i++) {
			let curr = props.cartItems?.InvoiceItemArray[i];
			curr['key'] = i;
			uniqueInvoiceItemArray.push(curr);
		}
		setInvoiceItemArray(uniqueInvoiceItemArray);
	}, [props.cartItems?.InvoiceItemArray]);

	useEffect(() => {
		props.cartItems.InvoiceItemArray.forEach((item) => {
			// if(item.field_type === "multidrop") {
				dispatch(updatedProductCount({[item?.value_id]: item?.invoice_item_count}))
			// }
		})
	}, [])

	const handleQuantityDecrement = (record) => {
		if (updatedProduct?.[record.value_id] > 1) {
			const count = updatedProduct?.[record?.value_id] - 1
			dispatch(updatedProductCount({[record?.value_id] : count}))
		}
	};

	const handleQuantityIncrement = (record) => {
		if (updatedProduct?.[record.value_id] < record.multidropMax) {
			const count = updatedProduct?.[record?.value_id] + 1
			dispatch(updatedProductCount({[record?.value_id] : count}))
		}
	};

	const paymentItemsColumns = [
		{
			title: (
				<div className="gx-text-center">
					<PaymentsIcon className="fg-primary-dark-light" style={{ width: '1.5rem' }} />
				</div>
			),
			width:
				props?.width < props?.mobileThreshold && props?.module == 'registration'
					? ''
					: '12%',
		},
		{
			title: (
				<div className="fg-primary">
					{props.languageObject?.payments_header ?? 'Payments'}
				</div>
			),
			width: '40%',
			render: record => {
				return (
					<div key={record.payment_id}>
						<div>Payment Type: {record.method}</div>
						<div>Order Number: {record.order_number}</div>
					</div>
				);
			},
		},
		{
			width: '23%',
			render: record => {
				return (
					<div className={record?.date_paid ? '' : 'fg-primary'}>
						{record.date_paid
							? moment(record.date_paid).format('MMM DD, YYYY')
							: props.languageObject?.non_processed_payment ?? 'Not Processed'}
					</div>
				);
			},
		},
		{
			width: '30%',
			render: record => {
				return <div className="gx-text-center">${formatPayment(record?.amount)}</div>;
			},
		},
		{
			width: '10%',
			render: record => {
				return (
					!record?.date_paid && (
						<div></div>
						// <Popconfirm
						// 	title="Are you sure you want to remove this item?"
						// 	okText="Yes"
						// 	cancelText="No"
						// 	onConfirm={event => {
						// 		props.onDeletePayment(record?.payment_id);
						// 	}}
						// >
						// 	<CrossWhiteIcon
						// 		className="fg-primary-dark-light"
						// 		style={{ width: '1em' }}
						// 	/>
						// </Popconfirm>
					)
				);
			},
		},
	];

	const invoiceItemsColumns = [
		{
			title: (
				<div className="gx-text-center">
					<ItemIcon className="fg-primary-dark-light" style={{ width: '1.2rem' }} />
				</div>
			),
			width:
				props?.width < props?.mobileThreshold && props?.module == 'registration'
					? ''
					: '12%',
		},
		{
			title: (
				<div className="fg-primary">
					{props.languageObject?.invoice_items_header ?? 'Items'}
				</div>
			),
			width: '49%',
			render: record => {
				return <div>{record?.invoice_description}</div>
				// return <Row className='gx-align-items-center'>
				// 	<Col  flex={1}>
				// 		{record?.invoice_description}
				// 	</Col>
				// 	{/* {record?.field_type === "multidrop" &&  */}
				// 	{/* <Col>
				// 	    <CommonQuantityCount 
				// 		    handleQuantityDecrement={() => handleQuantityDecrement(record)} 
				// 			handleQuantityIncrement={() => handleQuantityIncrement(record)}
				// 			quantityCount={updatedProduct?.[record.value_id]}
				// 		/>
				// 	</Col> */}
				// 	{/* } */}
				// </Row>;
			},
		},
		{
			width: '19%',
			render: record => {
				return (
					<div>
						<CommonQuantityCount
							handleQuantityDecrement={() => handleQuantityDecrement(record)}
							handleQuantityIncrement={() => handleQuantityIncrement(record)}
							quantityCount={updatedProduct?.[record.value_id]}
						/>
					</div>
				)
			}
		},
		{
			title: (
				<div className="fg-primary gx-text-center">
					{props.languageObject?.invoice_amount_header ?? 'Amount'}
				</div>
			),
			width: '30%',
			render: record => {
				return <div className="gx-text-center">${formatPayment(record?.amount)}</div>;
			},
		},
		{
			width: '10%',
			render: record => {
				return (
					record?.required === 0 && (
						<div>
							{!props?.blockDelete && (
								<Popconfirm
									title="Are you sure you want to remove this item?"
									okText="Yes"
									cancelText="No"
									onConfirm={event => {
										props.onDelete({
											fieldId: record?.field_id,
											invoiceId: record?.invoice_id,
										});
									}}
								>
									<CrossWhiteIcon
										className="fg-primary-dark-light"
										style={{ width: '1em' }}
									/>
								</Popconfirm>
							)}
						</div>
					)
				);
			},
		},
	];

	const bottomColumn = [
		{
			title: (
				<div className="gx-text-center">
					<AmountIcon className="fg-primary-dark-light" style={{ width: '1.2rem' }} />{' '}
				</div>
			),
			width:
				props?.width < props?.mobileThreshold && props?.module == 'registration'
					? ''
					: '12%',
		},
		{
			title: (
				<div className="fg-primary">
					{props.languageObject?.net_owing_header ?? 'Amount Owing:'}
				</div>
			),
			width: props?.cartProcessView ? '48%' : '68%',
			render: record => {
				return (
					<div key={record.payment_id}>
						<div>Payment Type: {record.method}</div>
						<div>Order Number: {record.order_number}</div>
					</div>
				);
			},
		},
		{
			title: <div className="gx-text-center">${formatPayment(props.cartItems.NetOwing)}</div>,
			width: '30%',
			render: record => {
				return (
					<div className="gx-text-center">${formatPayment(props.cartItems.NetOwing)}</div>
				);
			},
		},
		{
			width: '10%',
			render: record => {
				return <div></div>;
			},
		},
	];

	const locale = {
		emptyText: <p style={{ size: '0000.1px' }}></p>,
	};

	const sortArray = obj => {
		obj.sort(function (a, b) {
			return parseFloat(b.amount) - parseFloat(a.amount);
		});
	};
	if (props.cartItems?.InvoiceItemArray?.length) {
		sortArray(props.cartItems.InvoiceItemArray);
	}

	return (
		<div>
			{props.cartItems.InvoiceItemArray && (
				<div>
					{props.cartItems.InvoiceItemArray.length > 0 ? (
						<div>
							<Table
								rowKey="invoice_id"
								columns={invoiceItemsColumns}
								dataSource={
									invoiceItemArray.length
										? invoiceItemArray
										: props.cartItems.InvoiceItemArray
								}
								pagination={false}
								key={hash(props.cartItems.InvoiceItemArray)}
							/>
							{props.cartItems.TotalNetAmount > 0 && (
								<div className="gx-d-flex gx-align-items-end">
									{props?.width < props?.mobileThreshold &&
										props?.module === 'registration' ? (
										''
									) : (
										<div
											className="gx-text-center"
											style={{ padding: '0px 16px', width: '12%' }}
										></div>
									)}

									<div
										style={{
											width: '68%',
											padding: '0px 16px',
										}}
									>
										<strong>
											{props.languageObject?.total_invoiced_header ??
												'Net Invoiced:'}
										</strong>
									</div>
									<div
										style={{
											padding: '0px 16px',
											width: '30%',
										}}
										className="gx-text-center"
									>
										<Divider />
										<strong>
											${formatPayment(props.cartItems.TotalNetAmount)}
										</strong>
									</div>
									<div style={{ padding: '0px 16px', width: '10%' }}></div>
								</div>
							)}
						</div>
					) : (
						<div>
							{
								<div>
									<div
										style={{
											textAlign: 'center',
											color: 'rgba(0, 0, 0, 0.25)',
										}}
									>
										Cart Empty
									</div>
									<Divider />
								</div>
							}
						</div>
					)}

					{props.cartItems.PaymentItemsArray.length > 0 && (
						<Table
							rowKey="payment_id"
							columns={paymentItemsColumns}
							dataSource={props.cartItems.PaymentItemsArray}
							pagination={false}
						/>
					)}

					<Table
						rowKey=""
						columns={bottomColumn}
						dataSource={''}
						pagination={false}
						locale={locale}
					/>
				</div>
			)}
		</div>
	);
};

export default RegistrationItems;
