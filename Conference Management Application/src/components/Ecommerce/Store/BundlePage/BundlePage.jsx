import React, { useEffect, useMemo, useState } from 'react';
import { useParams } from 'react-router';
import { useHistory, Link, useLocation } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import _isEmpty from 'lodash/isEmpty';
import moment from 'moment';
import { Card, Tag, Button, Skeleton, Image, Spin, Radio, Divider, Tooltip } from 'antd';

import { useBundleInfo } from '../hooks/useBundleInfo';
import { useTags } from '../hooks/useTags';
import { useShoppingCart } from '../hooks/useShoppingCart';
import { useContentType } from '../hooks/useContentType';
import { useProductFilter } from '../hooks/useProductFilter';
import { getCheckoutRoute, getCheckoutPublicRoute, searchStateToParams, paramsToSearchState } from '../helpers';

import BundleProductRender from './BundleProductRender';
import BundleTextRender from './BundleTextRender';
import StoreHeader from '../components/StoreHeader';
import BundleChildRender from './BundleChildRender';
import BundleProductQuickView from './BundleProductQuickView';
import BundleProductQuickViewModal from './BundleProductQuickViewModal';
import Switch from '../../../Common/Switch';

import { ReactComponent as CartPlus } from '../../../../assets/icons/cartPlus.svg';
import { ReactComponent as Remove } from '../../../../assets/icons/remove.svg';
import { ReactComponent as PDF } from '../../../../assets/icons/pdf.svg';
import { ReactComponent as Book } from '../../../../assets/icons/book.svg';
import { ReactComponent as Left } from '../../../../assets/icons/left.svg';
import { ReactComponent as CartCheck } from '../../../../assets/icons/cartCheck.svg';
import { ReactComponent as List } from '../../../../assets/icons/list.svg';
import { ReactComponent as LinkIcon } from '../../../../assets/icons/link.svg';
import loader from '../../../../assets/images/loader.svg';
import { BookOutlined, GlobalOutlined } from '@ant-design/icons';
import { storeProductData, receiveModularUrlId } from '../../../../appRedux/actions';
import { useAccessList } from '../hooks/useAccessList';
import { useProducts } from '../hooks/useProducts';
import isEmpty from 'lodash/isEmpty';
import DirectLinkModel from '../components/DirectLinkModel';

const BundlePage = () => {
	const [selectedBundle, setSelectedBundle] = useState({});
	const [filterByPrice] = useProductFilter();
	const history = useHistory();
	const location = useLocation();
	const { moduleUrlId, bundleId } = useParams();
	const [, productAccessList] = useAccessList();
	const publicEmbed = useSelector(state => state.settings.publicEmbed);
	const id = parseInt(bundleId);
	const showTags = !useSelector(
		state =>
			state.ecommerce.attendeeSettings?.attendeesiteadmin?.generalconfigobject?.hide_all_tags,
	);
	const storeConfig = useSelector(
		state => state.ecommerce.attendeeSettings?.attendeesiteadmin?.storeconfigobject,
	);
	const productShareConfig = useSelector(
		state =>
			state.ecommerce.attendeeSettings?.attendeesiteadmin?.generalconfigobject?.product_share_config,
	);
	const [tagsLoading, tagsMap, getDisplayTagIds] = useTags();
	const [addToCart, cartCount, cart, removeFromCart] = useShoppingCart();
	const [
		bundle,
		children,
		bundlePrice,
		childrenPrices,
		totalPrice,
		bundleSavings,
		savingsPercentage,
		pricesLoading,
		bundlePrintPrice,
	] = useBundleInfo(id);

	console.log('children', children)

	const [, products] = useProducts();
	const dispatch = useDispatch();
	const VIEWS = [
		{ key: 'QUICK', label: 'Quick View', value: 0, disableOnMobile: false, Icon: List },
		{ key: 'LIST', label: 'List', value: 1, disableOnMobile: true, Icon: List },
	];
	const searchParams = paramsToSearchState(location.search);
	const [cardView, setCardView] = useState(1);
	const [selectedPrice, setSelectedPrice] = useState(() => {
		// default selected price - Preference give to Digital Price
		if (bundlePrice?.isFetched && bundlePrintPrice?.isFetched) {
			if (
				cart.some(
					invoice => invoice.field_id === bundlePrice?.fieldid && !invoice.print_price,
				)
			) {
				return bundlePrice;
			} else if (
				cart.some(
					invoice =>
						invoice.field_id === bundlePrintPrice?.fieldid && invoice.print_price,
				)
			) {
				return bundlePrintPrice;
			} else if (
				bundlePrintPrice?.price_collection?.primary &&
				!bundlePrice?.price_collection?.primary
			) {
				//Only print price available
				return bundlePrintPrice;
			} else {
				// default Digital Price
				return bundlePrice;
			}
		}
		// default Digital Price
		return bundlePrice;
	});
	const [typeLoading, CONTENT, getContentTypes, getFascadeContentTypes] = useContentType();
	const [addedToCart, setAddedToCart] = useState(
		cart.some(invoice => invoice.field_id === selectedPrice?.fieldid),
	);
	const { styling } = useSelector(({ loginInfo }) => loginInfo);
	useEffect(() => {
		if (!pricesLoading) {
			filterByPrice();
		}
	}, [pricesLoading]);

	const handleSelectBundle = selectedData => {
		setSelectedBundle(selectedData);
	};

	const checkout = () => {
		history.push(
			publicEmbed ? getCheckoutPublicRoute(moduleUrlId) : getCheckoutRoute(moduleUrlId),
		);
	};

	const parentProduct = useMemo(() => products.find((prod) => bundle?.parentIds?.includes(prod.id)), [products, bundle]);

	useEffect(() => {
		setAddedToCart(cart.some(invoice => invoice.field_id === selectedPrice?.fieldid));
	}, [cart, selectedPrice]);

	useEffect(() => {
		dispatch(receiveModularUrlId({ moduleUrlId }))
	}, [moduleUrlId])

	const loading = !bundle || tagsLoading || typeLoading || pricesLoading;

	const fascadeContentTypes = bundle ? getFascadeContentTypes(bundle) : new Set();
	const contentTypes = bundle ? getContentTypes(bundle) : new Set();

	const handleSwitch = (value) => {
		setCardView(value);
	}

	const handleCancel = () => {
		dispatch(storeProductData({ isVisible: false }));
	};

	const handleAccess = (event, cProduct) => {
		event.stopPropagation();
		const searchParams = new URLSearchParams({ openAccess: true, moduleUrlId });
		if (selectedBundle?.title && cProduct?.parentIds?.length) {
			history.push(`/${publicEmbed ? 'public' : 'main'}/consumption/group/${cProduct?.parentIds[0]}/${cProduct.id}?${searchParams}`);
		} else {
			history.push(`/${publicEmbed ? 'public' : 'main'}/consumption/selection/${cProduct.id}?${searchParams}`);
		}
	};

	const renderAccessNow = () => (
		<Button
			className="gx-mt-2 gx-ml-auto gx-mb-0 button-secondary button-round"
			onClick={(e) => handleAccess(e, bundle)}
			style={{ backgroundColor: "#469f46" }}
		>
			<div className="gx-px-3 buy-btn-content">
				Access Now
			</div>
		</Button>
	);

	const handleProduct = () => {
		history.push(
			`../bundle/${parentProduct.id}?${searchStateToParams(searchParams)}`
		);
	}

	if (loading)
		return (
			<div className="loader">
				<img src={loader} />
			</div>
		);

	const renderPriceSection = tempPrice =>
		tempPrice?.user_has_open_access || productAccessList.includes(bundle.id) ? (
			<div>
				{/* <Tag className="gx-mb-0">
					{storeConfig?.free_for_members_message &&
						!_isEmpty(storeConfig?.free_for_members_message)
						? `${storeConfig?.free_for_members_message}`
						: 'You already have access'}
				</Tag> */}
				<div className='gx-d-flex'>
					{renderAccessNow()}
				</div>
			</div>
		) : (
			<>
				{productAccessList.includes(bundle.id)
					? <>{renderAccessNow()}</>
					: !tempPrice?.price_collection?.primary && tempPrice?.isFetched ? (
						<></>
					) : (
						<>
							<div>
								{tempPrice?.price_collection?.primary ? (
									<div className="gx-d-flex gx-align-items-center">
										<h4 className="fg-grey gx-mr-2 gx-mb-0">Price:</h4>
										<h2 className="gx-mr-2 gx-mb-0">
											{tempPrice.price_collection.primary.price === 0
												? 'FREE'
												: `$${tempPrice.price_collection.primary.price}`}
										</h2>
										<div className="product-price-details">
											{tempPrice?.open_access_tease &&
												tempPrice.open_access_tease.length > 0 ? (
												bundle.exclude_open_access_tease_message ? <></> : <>
													<Tooltip
														title={tempPrice.open_access_tease.join(', ')}
													>
														<Tag className="teaser-tag gx-mb-0">
															{storeConfig?.open_access_tease_message &&
																!_isEmpty(
																	storeConfig?.open_access_tease_message,
																)
																? `${storeConfig?.open_access_tease_message}`
																: 'Open access available for members'}
														</Tag>
													</Tooltip>
												</>
											) : (
												// teaser price
												tempPrice?.price_collection?.teaser && (
													<Tag className="teaser-tag gx-mb-0">
														{tempPrice?.price_collection?.teaser?.price ===
															0
															? 'FREE'
															: `$${tempPrice?.price_collection?.teaser?.price}`}{' '}
														for members
													</Tag>
												)
											)}
										</div>
									</div>
								) : (
									<Spin className="gx-ml-1" size="small" />
								)}
							</div>
							<div className="gx-mt-3">
								<Button
									onClick={() =>
										addedToCart ? removeFromCart(tempPrice) : addToCart(tempPrice)
									}
									className="button-primary"
									size="large"
									shape="round"
									style={{ height: 'auto' }}
								>
									<div className="gx-d-flex gx-justify-content-center gx-align-items-center gx-px-2 gx-py-1">
										{addedToCart ? (
											<Remove className="gx-mr-2" style={{ width: '1em' }} />
										) : (
											<CartPlus className="gx-mr-2" style={{ width: '1.2em' }} />
										)}

										{tempPrice?.price_collection && (
											<h4 className="gx-mb-0 gx-text-white">
												{addedToCart ? 'Remove from Cart' : `Add to Cart`}
											</h4>
										)}
									</div>
								</Button>
							</div>
						</>
					)}

				{!_isEmpty(tempPrice?.rowtext) && (
					<div className="product-price-details">
						<Tag className="teaser-tag gx-mt-2 gx-mr-2">{tempPrice.rowtext}</Tag>
					</div>
				)}
			</>
		);

	// const bundleChildren = [
	// 	{
	// 		"id": 23524,
	// 		"title": "Women in Deep Foundations Calendar - International Shipping",
	// 		"publicationDate": "",
	// 		"parentIds": [
	// 			23263
	// 		],
	// 		"childrenIds": [],
	// 		"tagIds": [],
	// 		"categoryId": 3106,
	// 		"category": "Merchandise",
	// 		"files": [],
	// 		"customFields": [],
	// 		"show": false,
	// 		"sourceTagIds": [],
	// 		"digitalgood": false,
	// 		"date_added": "2024-01-16",
	// 		"print_price": false,
	// 		"author_block": "",
	// 		"author_info_array": [],
	// 		"hide_product": false,
	// 		"hide_card_only": false,
	// 		"exclude_open_access_tease_message": false,
	// 		"fieldType": "multidrop",
	// 		"multidropMax": 6
	// 	},
	// 	{
	// 		"id": 23523,
	// 		"title": "Women in Deep Foundations Calendar - US Shipping",
	// 		"publicationDate": "",
	// 		"parentIds": [
	// 			23263
	// 		],
	// 		"childrenIds": [],
	// 		"tagIds": [],
	// 		"categoryId": 3106,
	// 		"category": "Merchandise",
	// 		"files": [],
	// 		"customFields": [],
	// 		"show": false,
	// 		"sourceTagIds": [],
	// 		"digitalgood": false,
	// 		"date_added": "2024-01-16",
	// 		"print_price": false,
	// 		"author_block": "",
	// 		"author_info_array": [],
	// 		"hide_product": false,
	// 		"hide_card_only": false,
	// 		"exclude_open_access_tease_message": false,
	// 		"fieldType": "multidrop",
	// 		"multidropMax": 6,
	// 		"isFiltered": true
	// 	}
	// ]

	return (
		<main className="container">
			<div className="gx-mb-4 gx-d-flex">
				<Link
					to={
						publicEmbed
							? `/public/ecommerce/${moduleUrlId}/selection${history.location.search}`
							: `/main/ecommerce/${moduleUrlId}/selection`
					}
				>
					<div className="gx-d-flex gx-align-items-center">
						<Left style={{ width: '1em' }} />
						<span className="gx-ml-1 gx-text-black">Back</span>
					</div>
				</Link>
				<Button
					disabled={parseInt(cartCount) > 0 ? false : true}
					onClick={checkout}
					className="gx-ml-auto button-primary"
					shape="round"
				>
					<div className="gx-d-flex gx-justify-content-center gx-align-items-center">
						<CartCheck className="gx-mr-2" style={{ width: '1.2em' }} />
						<p className="gx-mb-0">My Shopping Cart ({cartCount})</p>
					</div>
				</Button>
			</div>

			<main className="gx-d-lg-flex">
				<section style={{ flexBasis: '100%' }}>
					<Card className="gx-position-sticky card shadow-2" style={{ top: '2em' }}>
						{/* product category */}
						<div className="gx-d-flex gx-justify-content-between card-list-details">
							<div className="gx-pt-4">
								<span className="category-ribbon" style={{ cursor: 'pointer' }}>
									{parentProduct ? (
										<Tooltip
											title={
												parentProduct?.title.length > 100 &&
												parentProduct?.title
											}
										>
											<div
												className={
													parentProduct?.title?.length > 100
														? 'truncateTitle'
														: ''
												}
												onClick={handleProduct}
											>
												{parentProduct?.title}
											</div>
										</Tooltip>
									) : (
										<div>{bundle?.category}</div>
									)}
								</span>

								{/* {bundle?.image
										? <Image
											className="gx-mb-3 gx-mt-3 card-image"
											alt="placeholder"
											src={
												bundle?.image ||
												require('../../../../assets/images/product-placeholder.png')
											}
											// style={{ maxHeight: '8em' }}
											preview={false}
										/>
										: null
									} */}

								{/* tags */}
								{showTags &&
									getDisplayTagIds(bundle).map(
										tagId =>
											tagsMap[tagId] && (
												<Tag key={tagId} className="tag">
													{tagsMap[tagId]}
												</Tag>
											),
									)}

								{/* title */}
								{/* <h2 className="gx-mb-2 gx-font-weight-semi-bold">{bundle.title}</h2> */}
								<h1>{bundle.title}</h1>
								{/* description */}
								{bundle.description && (
									<p
										dangerouslySetInnerHTML={{
											__html: bundle.description,
										}}
										className="gx-mb-0"
									/>
								)}

								{bundle.sourceId && fascadeContentTypes.size >= 2 && (
									<>
										<hr />
										<div className="gx-d-flex gx-align-items-center">
											<h4 className="gx-mr-3 gx-mb-0 fg-grey">Format:</h4>
											<Radio.Group className="gx-d-flex gx-align-items-center">
												{fascadeContentTypes.has(CONTENT.DIGITAL) && (
													<Radio.Button
														onClick={() =>
															contentTypes.has(CONTENT.PRINT) &&
															history.push(`./${bundle.sourceId}`)
														}
														value="digital"
														className="radio-button-left gx-mb-0"
													>
														<div className="gx-d-flex gx-align-items-center">
															<PDF
																className="gx-mr-2"
																style={{ width: '1.2em' }}
															/>
															<p className="gx-mb-0">Digital</p>
														</div>
													</Radio.Button>
												)}
												{fascadeContentTypes.has(CONTENT.PRINT) && (
													<Radio.Button
														onClick={() =>
															contentTypes.has(CONTENT.DIGITAL) &&
															history.push(`./${bundle.sourceId}`)
														}
														value="print"
														className="radio-button-right gx-mb-0"
													>
														<div className="gx-d-flex gx-align-items-center">
															<Book
																className="gx-mr-2"
																style={{ width: '1.2em' }}
															/>
															<p className="gx-mb-0">Print</p>
														</div>
													</Radio.Button>
												)}
											</Radio.Group>
										</div>
									</>
								)}
							</div>
							<div className="bundlePrice gx-d-flex gx-flex-column gx-align-items-center gx-ml-5">
								{bundlePrice?.isFetched &&
									bundlePrintPrice?.isFetched &&
									bundlePrice?.price_collection?.primary &&
									bundlePrintPrice?.price_collection?.primary ? (
									// Both prices available
									<>
										<Radio.Group
											className="gx-d-flex gx-align-items-center gx-mb-2"
											defaultValue={() => {
												return selectedPrice.print_price
													? 'print'
													: 'digital';
											}}
											disabled={addedToCart ? true : false}
										>
											<Radio.Button
												onClick={() => setSelectedPrice(bundlePrice)}
												value="digital"
												className="radio-button-left gx-mb-0"
											>
												<div className="gx-d-flex gx-align-items-center">
													<GlobalOutlined
														className="gx-mr-2"
														style={{ width: '1.2em' }}
													/>
													<p className="gx-mb-0">Digital</p>
												</div>
											</Radio.Button>

											<Radio.Button
												onClick={() => setSelectedPrice(bundlePrintPrice)}
												value="print"
												className="radio-button-right gx-mb-0"
											>
												<div className="gx-d-flex gx-align-items-center">
													<BookOutlined
														className="gx-mr-2"
														style={{ width: '1.2em' }}
													/>
													<p className="gx-mb-0">Print</p>
												</div>
											</Radio.Button>
										</Radio.Group>

										<>{renderPriceSection(selectedPrice)}</>
									</>
								) : (
									<>
										{bundlePrintPrice?.isFetched &&
											bundlePrintPrice?.price_collection?.primary &&
											bundlePrice.isFetched &&
											!bundlePrice?.price_collection?.primary ? (
											// Print Price available and digital price NOT available
											// Show Print icon
											<>
												<Tag
													style={{
														borderLeft: `6px solid ${styling['primary-dark-color']}`,
														borderRadius: '5px',
													}}
												>
													<BookOutlined /> Print Version
												</Tag>
												{renderPriceSection(bundlePrintPrice)}
											</>
										) : (
											<>{renderPriceSection(bundlePrice)}</>
										)}
									</>
								)}
							</div>
						</div>
						<div>
							{bundle?.publicationDate ? (
								<p className="gx-ml-2 gx-mt-2">
									Publication Date:&nbsp;
									{moment(bundle?.publicationDate).format('MM/DD/YYYY')}
								</p>
							) : parentProduct?.publicationDate ? (
								<p>
									Publication Date:&nbsp;
									{moment(parentProduct?.publicationDate).format('MM/DD/YYYY')}
								</p>
							) : null}

							{
							productShareConfig && <DirectLinkModel
								base_url={`${productShareConfig.base_url}?pubid=${id}&bundle=1`}
								className='ant-footer-button-hide'
							>
								{
								productShareConfig &&
									(children.length > 0) & !isEmpty(productShareConfig) &&
									productShareConfig.base_url && (
										<div
											className="gx-d-flex gx-justify-items-center"
											onClick={event => {
												// window.open(
												// 	`${productShareConfig.base_url}?pubid=${id}&bundle=1`,
												// );
												event.stopPropagation();
												event.preventDefault();
											}}
											style={{ maxWidth: '5.7rem' }}
										>
											<LinkIcon className="gx-mr-2  gx-pointer" style={{ width: '1.2em', fill: 'lightgray' }} />
											<p className="gx-pointer" style={{ padding: 0, margin: 0 }}>{productShareConfig.display_text ?? 'Direct Link'}{' '}</p>
										</div>
									)}
							</DirectLinkModel>
							}
						</div>
					</Card>
				</section>
			</main>
			{!selectedBundle?.title && (
				<div className="gx-d-flex gx-justify-content-end">
					<Switch views={VIEWS} value={cardView} handleSwitch={handleSwitch} />
				</div>
			)}
			<main>
				<section>
					{contentTypes.has(CONTENT.PRINT) ? (
						<Card className="card shadow-1">
							<h1 className="gx-text-center gx-font-weight-bold">Contents</h1>
							<div className="gx-d-flex gx-align-items-center gx-mb-2">
								<hr className="divider gx-flex-1 gx-m-0" />
								<p className="gx-m-0 gx-mx-2  gx-text-grey">*</p>
								<hr className="divider gx-flex-1 gx-m-0" />
							</div>
							{children?.map(child => (
								<BundleTextRender key={child.id} product={child} />
							))}
						</Card>
					) : selectedBundle?.title ? (
						<BundleChildRender
							product={selectedBundle}
							handleSelectBundle={handleSelectBundle}
							handleAccess={handleAccess}
						/>
					) : (
						<>
							{/* {children?.length
									? <>
										<div className="gx-d-flex gx-align-items-end">
											<h1 className="gx-mb-0 gx-mr-2">{bundle.title}</h1>
										</div>
										<hr
											style={{
												background: 'lightgray',
											}}
										/>
									</>
									: null
								} */}
							{cardView === 1 ? (
								children?.map(child => (
									<BundleProductRender
										key={child.id}
										product={child}
										handleSelectBundle={handleSelectBundle}
										bundle={bundle}
										productType={products}
									/>
								))
							) : (
								<div>
									<Card className="shadow-1 gx-mt-4">
										{children.map(child => {
											return (
												<div>
													<BundleProductQuickView
														productChildId={child.id}
														product={child}
													/>
												</div>
											);
										})}
									</Card>
								</div>
							)}
						</>
					)}
				</section>
				<BundleProductQuickViewModal
					selectedBundle={selectedBundle}
					handleCancel={handleCancel}
				/>
			</main>
		</main>
	);
};

export default BundlePage;
