import React, { useState, useRef, useLayoutEffect, useMemo, Fragment, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useParams } from 'react-router';
import { useHistory } from 'react-router-dom';
import moment from 'moment';

import { useShoppingCart } from '../hooks/useShoppingCart';
import { useTags } from '../hooks/useTags';

import { Card, Tag, Button, Spin, Popover, Alert, Divider, Tooltip, Avatar } from 'antd';
import {
	PlayCircleOutlined,
	PictureOutlined,
	FilePdfOutlined,
	UserOutlined,
	FileOutlined,
} from '@ant-design/icons';
import _isEmpty from 'lodash/isEmpty';

import { ReactComponent as Remove } from '../../../../assets/icons/remove.svg';

import { FILE } from 'components/Common/constants';

// import classNames from 'classnames';
import './bundle.css';
import { isEmpty } from 'lodash';
import { storeProductData, updatedProductCount } from '../../../../appRedux/actions';
import { useAccessList } from '../hooks/useAccessList';
import { useProducts } from '../hooks/useProducts';
import CommonQuantityCount from '../SelectionPage/CommonQuantity';

const BundleProductCard = ({
	product,
	price,
	heightChanged,
	collapseDuration,
	priceLoading,
	authorInfo = {},
	bundle
}) => {
	const dispatch = useDispatch();
	const history = useHistory();
	const { bundleId, moduleUrlId } = useParams();
	const [, tagsMap] = useTags();
	const [, products] = useProducts();
	const [, productAccessList] = useAccessList();
	const [collapsibleShow, setCollapsibleShow] = useState(false);
	const [collapsibleHeight, setCollapsibleHeight] = useState(0);
	const [selectedProduct, setSelectedProduct] = useState([])
	const collapsible = useRef();
	const showTags = !useSelector(
		state =>
			state.ecommerce.attendeeSettings?.attendeesiteadmin?.generalconfigobject?.hide_all_tags,
	);
	const storeConfig = useSelector(
		state => state.ecommerce.attendeeSettings?.attendeesiteadmin?.storeconfigobject,
	);

	const cartItems = useSelector(state => state.ecommerce.cartItems.InvoiceItemArray) ?? []

	const cartDetails = useSelector(state => state.ecommerce.cartItems);

	const updatedProduct = useSelector(state => state.ecommerce.updatedProductCount);

	const parentBundle = useMemo(() => products.find((prod) => product?.parentIds.includes(prod.id)), [products, product]);
	const grandParent = useMemo(() => products.find((prod) => parentBundle?.parentIds.includes(prod.id)), [products, parentBundle]);

	const publicationDate = useMemo(() => {
		if (product?.publicationDate) return product?.publicationDate
		else if (grandParent?.publicationDate) return grandParent?.publicationDate
		else if (parentBundle?.publicationDate) return parentBundle?.publicationDate
		else return null
	}, [product, parentBundle, grandParent]);

	const publicEmbed = useSelector(state => state.settings.publicEmbed);
	const [addToCart, , cart, removeFromCart] = useShoppingCart();
	const addedToCart = useMemo(() => cart.some(invoice => invoice.field_id === price?.fieldid), [
		cart,
	]);
	const { styling } = useSelector(({ loginInfo }) => loginInfo);

	const contentTypeCount = {};

	const showModal = () => {
		dispatch(storeProductData({ product, isVisible: true }));
	};

	useLayoutEffect(() => {
		// if (!collapsibleShow) return;
		// setCollapsibleHeight(collapsible.current.scrollHeight);
		// heightChanged(collapsible.current.scrollHeight);
		// setCollapsibleShow(false);
	});

	const actionClicked = (event, tempPrice, quantityCount, fieldType) => {
		event.stopPropagation();
		if (addedToCart) {
			removeFromCart(tempPrice)
			dispatch(updatedProductCount({ [product?.id]: 1 }))
		} else {
			addToCart(tempPrice, quantityCount, fieldType)
		}
	};

	useEffect(() => {
		if (Object.keys(cartDetails).length > 0) {
			if (cartItems?.length > 0) {
				const product = []
				cartItems.map((cart) => {
					product.push({
						valueid: cart.value_id,
						quantity: cart.quantity,
						type: cart.field_type
					})
				})
				setSelectedProduct(product)
			} else {
				setSelectedProduct([])
			}
		}
	}, [cartItems, cartDetails])

	useEffect(() => {
		if (Object.keys(product).length) {
			console.log('fieldType', product.fieldType)
			if (!updatedProduct[product?.id]) {
				dispatch(updatedProductCount({ [product?.id]: 1 }))
			}
		}
	}, [product])

	for (const file of product?.files || []) {
		//TODO: hide the file which has hide key
		let type = file?.type;
		if (type == '') {
			type = 'file';
		}
		if (contentTypeCount[type]) contentTypeCount[type]++;
		else contentTypeCount[type] = 1;
	}

	const handleAccess = (event) => {
		event.stopPropagation();
		const searchParams = new URLSearchParams({ openAccess: true, moduleUrlId });
		if (!product.childrenIds.length) {
			history.push(`/${publicEmbed ? 'public' : 'main'}/consumption/product/${product.id}?${searchParams}`);
			return null;
		}
		if (product.childrenIds.length > 0 && product?.parentIds?.length) {
			history.push(`/${publicEmbed ? 'public' : 'main'}/consumption/group/${bundleId}/${product?.parentIds[0]}/${product.id}?${searchParams}`);
		}
	};

	const renderAccessNow = () => (
		<Button
			className="gx-mt-2 gx-ml-auto gx-mb-0 button-secondary button-round"
			onClick={handleAccess}
			style={{ backgroundColor: "#469f46" }}
		>
			<div className="gx-px-3 buy-btn-content">
				Access Now
			</div>
		</Button>
	);

	const handleQuantityIncrement = (product) => {
		const maxCount = product.fieldType === 'multidrop' ? product.multidropMax : bundle.multidropMax
		if (updatedProduct?.[product.id] < maxCount) {
			const count = updatedProduct?.[product?.id] + 1
			dispatch(updatedProductCount({ [product?.id]: count }))
		}
	};

	const handleQuantityDecrement = (product) => {
		if (updatedProduct?.[product.id] > 1) {
			const count = updatedProduct?.[product?.id] - 1
			dispatch(updatedProductCount({ [product?.id]: count }))
		}
	};

	// const toggleCollapse = () => {
	// 	if (collapsibleHeight > 0) {
	// 		heightChanged(-collapsibleHeight);
	// 		setCollapsibleHeight(0);
	// 	} else setCollapsibleShow(true);
	// };

	const hasPrice = !priceLoading && price?.price_collection;

	const filteredArray = selectedProduct.filter((cart) => cart.valueid === price.valueid);

	console.log('filteredArray', filteredArray)

	console.log('product.id', product.id)

	console.log('product', product)

	console.log('bundle', bundle)

	return (
		<Card
			style={{
				borderLeft: `6px solid ${styling['primary-dark-color']}`,
				borderRadius: '5px',
			}}
			className="gx-my-2 card-padding-0 card shadow-1"
		>
			<div className="gx-pt-3 gx-px-4 gx-pb-2 bundle-card-wrapper">
				<div className="gx-d-flex gx-justify-content-between price-area-wrapper">
					<div className="gx-mr-2 gx-mb-2">
						<h2
							className="gx-mr-2 bundle-title gx-font-weight-semi-bold"
							style={{ display: 'inline' }}
						>
							{price?.price_collection?.primary.label ?? product.title}
						</h2>
					</div>
					<div className="more-info-btn">
						<div className="product-card-btn-wrapper">
							{/* description popover */}
							{product.description ? (
								<div>
									<div>
										<Button
											className="gx-ml-auto button-secondary gx-w-100"
											shape="round"
											onClick={showModal}
										>
											MORE INFO
										</Button>
									</div>
								</div>
							) : null}
						</div>
					</div>
				</div>
				<div>
					{publicationDate ? (
						<p className='gx-ml-2'>
							Publication Date:&nbsp;
							{moment(publicationDate).format('MM/DD/YYYY')}
						</p>
					) : null}
				</div>
				<div className="gx-mt-4">
					{!_isEmpty(authorInfo) ? (
						<div className="gx-mb-2 description-text gx-d-flex gx-align-items-center">
							<div>
								<Avatar
									size="medium"
									src={authorInfo.picture}
									icon={<UserOutlined />}
								/>
							</div>
							{authorInfo.fullname ? (
								<div className="gx-ml-2">{authorInfo.fullname}</div>
							) : null}
							{authorInfo.degrees ? <div>{`, ${authorInfo.degrees}`}</div> : null}
						</div>
					) : product.author_block ? (
						<div className="gx-d-flex gx-align-items-center">
							<div className="gx-ml-2">{product.author_block}</div>
						</div>
					) : null}
				</div>
				<div
					className={
						'gx-d-flex gx-align-items-end gx-justify-content-between price-area-wrapper'
					}
				>
					<div>
						{Object.keys(contentTypeCount).length ? (
							<div style={{ minWidth: '30rem' }} className="file-area-divider">
								<Divider orientation="left" plain>
									Includes
								</Divider>
								<div className="content-count bundle-text-content gx-d-flex gx-align-items-center gx-mb-2">
									{Object.entries(contentTypeCount).map(content => (
										<Fragment key={content[0]}>
											{content[0] === FILE.PDF ? (
												<span className="gx-ml-2">
													<FilePdfOutlined /> {content[1]}{' '}
													{content[0].toUpperCase().concat(content[1] > 1 ? 's' : '')}
												</span>
											) : null}
											{content[0] === FILE.VIDEO ? (
												<span className="gx-ml-2">
													<PlayCircleOutlined /> {content[1]} {content[0].concat(content[1] > 1 ? 's' : '')}
												</span>
											) : null}
											{content[0] === FILE.IMAGE ? (
												<span className="gx-ml-2">
													<PictureOutlined /> {content[1]} {content[0].concat(content[1] > 1 ? 's' : '')}
												</span>
											) : null}
											{content[0] === FILE.FILE ? (
												<span className="gx-ml-2">
													<FileOutlined /> {content[1]} {content[0].concat(content[1] > 1 ? 's' : '')}
												</span>
											) : null}
											<span className="gx-mr-2 gx-font-weight-bold"></span>
										</Fragment>
									))}
								</div>
							</div>
						) : null}
					</div>
					<div className="product-card-btn-wrapper gx-mb-1 gx-mt-3">
						<div className="product-price-details gx-d-flex gx-justify-content-center">
							{/* {price?.price_collection?.teaser && (
								<Tag className="teaser-tag">
									{price?.price_collection?.teaser?.price === 0
										? 'FREE'
										: `$${price?.price_collection?.teaser?.price}`}{' '}
									for members
								</Tag>
							)} */}
						</div>
						{!priceLoading ? (
							productAccessList.includes(product.id)
								? (<>{renderAccessNow()}</>)
								: hasPrice &&
								(price.user_has_open_access ? (
									<div>
										{/* <Tag className="gx-mb-0">
											{storeConfig?.free_for_members_message &&
												!isEmpty(storeConfig?.free_for_members_message)
												? `${storeConfig?.free_for_members_message}`
												: 'You already have access'}
										</Tag> */}
										<div className='gx-d-flex'>
											{renderAccessNow()}
										</div>
									</div>
								) : (
									<>
										{price.open_access_tease && price.open_access_tease.length > 0 && !product.exclude_open_access_tease_message && (
											<>
												<Tooltip title={price.open_access_tease.join(', ')}>
													<Tag className="gx-mb-0">
														{storeConfig?.open_access_tease_message &&
															!isEmpty(storeConfig?.open_access_tease_message)
															? `${storeConfig?.open_access_tease_message}`
															: 'Open access available for members'}
													</Tag>
												</Tooltip>
												<br />
												<br />
											</>
										)}
										<div className='gx-d-flex gx-align-items-center gx-mt-auto gx-ml-auto'>
											{((bundle?.fieldType === 'multidrop' || product?.fieldType === 'multidrop' ) && !filteredArray.length > 0) &&
												<div style={{ width: '100px'}}>
													<CommonQuantityCount
														quantityCount={updatedProduct?.[product.id]}
														handleQuantityDecrement={() => handleQuantityDecrement(product)}
														handleQuantityIncrement={() => handleQuantityIncrement(product)}
													/>
												</div>
											}
											{((bundle?.fieldType === 'multidrop' || product?.fieldType === 'multidrop' ) && filteredArray.length > 0) && <div className='gx-mr-3' style={{ fontSize: 16 }}>
												{filteredArray?.map((value) => {
													return <div style={{ width: '100px' }} >
														{`Quantity: ${value.quantity}`}
													</div>
												})}
											</div>}
											{/* {(bundle?.fieldType === 'multidrop' && filteredArray.length > 0) && <div className='gx-mr-3' style={{ fontSize: 16 }}>
												{filteredArray?.map((value) => {
													return <div>
														{`Quantity: ${value.quantity}`}
													</div>
												})}
											</div>} */}
											<Button
												className="button-primary gx-w-100"
												shape="round"
												onClick={(event) => actionClicked(event, price, updatedProduct, product.fieldType)}
											// onClick={() =>
											// 	addedToCart ? removeFromCart(price) : addToCart(price)
											// }
											>
												<div className="gx-d-flex gx-justify-content-center gx-align-items-center">
													{addedToCart ? (
														<p>
															<Remove
																className="gx-mr-2"
																style={{ width: '0.9em' }}
															/>
															Remove
														</p>
													) : (
														price?.price_collection && (
															<>
																<p className="gx-mb-0">
																	{price.price_collection.primary
																		.price === 0
																		? 'FREE'
																		: storeConfig?.buy_now_button_label &&
																			!isEmpty(
																				storeConfig?.buy_now_button_label,
																			)
																			? `${storeConfig?.buy_now_button_label} ($${price.price_collection.primary.price})`
																			: `BUY $${bundle.fieldType === 'multidrop' ? updatedProduct?.[product.id] * price.price_collection.primary.price : price.price_collection.primary.price}`}
																</p>
															</>
														)
													)}
												</div>
											</Button>
										</div>
									</>
								))
						) : (
							<Spin className="gx-ml-1" size="small" />
						)}
					</div>
				</div>
			</div>

			{/* contents of the product */}
			{/* <div
				ref={collapsible}
				style={{
					height: `${collapsibleHeight}px`,
					overflow: 'hidden',
					transition: `height ${collapseDuration}ms ease-in-out`,
				}}
			>
				{product.files?.map((file, index) => (
					<div
						key={index}
						className="gx-bg-light-grey gx-px-4 gx-py-3 gx-border-grey gx-border-top gx-d-flex gx-align-items-center"
					>
						{file.type === FILE.VIDEO && (
							<Video
								className="gx-my-auto gx-mr-3 fg-primary"
								style={{ width: '1.2rem' }}
							/>
						)}
						{file.type === FILE.PDF && (
							<PDF
								className="gx-my-auto gx-mr-3 fg-primary"
								style={{ width: '1.2rem' }}
							/>
						)}
						{file.type === FILE.IMAGE && (
							<Image
								className="gx-my-auto gx-mr-3 fg-primary"
								style={{ width: '1.2rem' }}
							/>
						)}
						{file.type === FILE.LINK && (
							<Link
								className="gx-my-auto gx-mr-3 fg-primary"
								style={{ width: '1.2rem' }}
							/>
						)}
						<div>
							<h4 className="gx-mb-1 fg-grey">{file.title}</h4>
							<p className="gx-mb-0">{file?.description}</p>
						</div>
						<Padlock className="fg-secondary gx-ml-3" style={{ width: '.8rem' }} />
					</div>
				))}
			</div> */}

			{/* {product.files?.length > 0 && (
				<div
					className={classNames(
						'gx-px-4',
						'gx-py-2',
						'gx-border-top',
						'gx-d-flex',
						'gx-align-items-center',
						{
							'gx-border-grey': collapsibleHeight > 0,
						},
					)}
				>
					<Button
						onClick={toggleCollapse}
						className="gx-mb-0 gx-p-0 fg-grey"
						type="link"
						icon={collapsibleHeight > 0 ? <CaretUpOutlined /> : <CaretDownOutlined />}
					>
						{collapsibleHeight > 0 ? 'Hide items' : 'Show items'} (
						{product.files?.length ?? 0})
					</Button>

					<div className="content-count gx-ml-3 gx-mr-3 gx-d-flex gx-align-items-center">
						{Object.entries(contentTypeCount).map(content => (
							<Fragment key={content[0]}>
								<span className="gx-mr-2">
									{content[1]} {content[0]}
								</span>
								<span className="gx-mr-2 gx-font-weight-bold">-</span>
							</Fragment>
						))}
					</div> */}

			{/* tags */}
			{/* <div>
						{showTags &&
							product.tagIds.map(
								tagId =>
									tagsMap[tagId] && (
										<Tag key={tagId} className="gx-mb-0 tag">
											{tagsMap[tagId]}
										</Tag>
									),
							)}
					</div>

					{hasPrice && (
						<Button
							onClick={() => (addedToCart ? removeFromCart(price) : addToCart(price))}
							className="gx-ml-auto gx-mb-0 button-secondary-outline button-round"
							shape="circle"
						>
							{addedToCart ? (
								<Remove style={{ width: '0.9rem', margin: '0.65em 0' }} />
							) : (
								<CartPlus className="cart-icon" />
							)}
						</Button>
					)}
				</div>
			)} */}
		</Card>
	);
};

export default BundleProductCard;
