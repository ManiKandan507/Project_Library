import React, { useState, useRef, useLayoutEffect, useMemo, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useHistory } from 'react-router-dom';
import _reduce from 'lodash/reduce';
import _groupBy from 'lodash/groupBy';
import _forEach from 'lodash/forEach';
import _map from 'lodash/map';
import _isEmpty from 'lodash/isEmpty';
import _filter from 'lodash/filter';
import moment from 'moment';
import { Card, Button, Spin, Divider, Tag, Tooltip, Avatar } from 'antd';
import { PlayCircleOutlined, PictureOutlined, FilePdfOutlined, UserOutlined, FileOutlined } from '@ant-design/icons';
import { useParams } from 'react-router';

import { useBundleInfo } from '../hooks/useBundleInfo';
import { useTags } from '../hooks/useTags';
import { useShoppingCart } from '../hooks/useShoppingCart';
import { FILE } from 'components/Common/constants';

import BundleProductCard from './BundleProductCard';

// import { ReactComponent as BundleRibbon } from '../../../../assets/graphics/bundleRibbon.svg';
import { ReactComponent as Remove } from '../../../../assets/icons/remove.svg';

import './bundle.css';
import isEmpty from 'lodash/isEmpty';
import { storeProductData } from '../../../../appRedux/actions';
import { useAccessList } from '../hooks/useAccessList';
import { useProducts } from '../hooks/useProducts';

const BundleProductRender = ({ product, heightChanged, handleSelectBundle = () => { }, bundle }) => {
	console.log('BundleProductRender')
	const dispatch = useDispatch();
	const history = useHistory();

	const [showing, setShowing] = useState(0);
	const collapsible = useRef();
	const [collapsibleShow, setCollapsibleShow] = useState(false);
	const [authorInfo, setAuthorInfo] = useState({});
	const [collapsibleHeight, setCollapsibleHeight] = useState(0);
	const [addToCart, , cart, removeFromCart] = useShoppingCart();
	const [, tagsMap] = useTags();
	const [, products] = useProducts();
	const [, productAccessList] = useAccessList();
	const [
		,
		children,
		productPrice,
		,
		totalPrice,
		,
		savingsPercentage,
		pricesLoading,
	] = useBundleInfo(product.id);
	const { moduleUrlId, bundleId } = useParams();
	const grandParent = useMemo(() => {
		let parent = products.find((prod) => parseInt(prod.id, 10) === parseInt(bundleId, 10));
		if (parent?.parentIds?.length) {
			parent = products.find((prod) => parent?.parentIds?.includes(prod.id));
		}
		return parent;
	}, [products]);

	const publicationDate = useMemo(() => {
		if (product?.publicationDate) return product?.publicationDate
		else if (grandParent?.publicationDate) return grandParent?.publicationDate
		else if (!product?.parentIds?.includes(bundleId)) {
			const parentBundle = products.find((prod) => product?.parentIds?.includes(prod.id));
			return parentBundle?.publicationDate ? parentBundle?.publicationDate : null;
		} else return null;
	}, [product, products]);

	const showTags = !useSelector(
		state =>
			state.ecommerce.attendeeSettings?.attendeesiteadmin?.generalconfigobject?.hide_all_tags,
	);
	const storeConfig = useSelector(
		state => state.ecommerce.attendeeSettings?.attendeesiteadmin?.storeconfigobject,
	);
	const publicEmbed = useSelector(state => state.settings.publicEmbed);
	const { styling } = useSelector(({ loginInfo }) => loginInfo);

	const showingIncrement = 3;
	const collapseDuration = 400; // transition duration in miliseconds

	const addedToCart = useMemo(
		() => cart.some(invoice => invoice.field_id === productPrice?.fieldid),
		[cart],
	);

	const showModal = () => {
		dispatch(storeProductData({ product, isVisible: true }));
	};

	useEffect(() => {
		if (product && product?.author_info_array && product?.author_info_array?.length) {
			let presenter = product.author_info_array.find((author) => author.presenter);
			setAuthorInfo(presenter)
		}
	}, [product])

	useLayoutEffect(() => {
		if (!collapsibleShow) return;
		setCollapsibleHeight(collapsible.current.scrollHeight);
		heightChanged && heightChanged(collapsible.current.scrollHeight); // optional chaining not allowed here for some reason
		setCollapsibleShow(false);
	});

	const constructItemCount = () => {
		let constructedChild = [...children];
		if (product?.files?.length &&
			(!product?.parentIds?.length // to allow the grandParent from the restriction
				|| (product?.parentIds?.length && !product?.childrenIds?.length) // to allow the products from the restriction
				|| (product?.parentIds?.includes(parseInt(bundleId, 10)) && // to check the bundle with single child
					product?.childrenIds?.length > 1)
			)
		) {
			constructedChild = [product, ...children];
		}
		let stateCount = _reduce(
			constructedChild,
			(total, child) => {
				let contents = _groupBy(child?.files, 'type');
				let temp = { ...total };
				_forEach(contents, (content, key) => {
					if (key == '') {
						temp['file'] = (total['file'] || 0) + content.length;
					} else {
						temp[key] = (total[key] || 0) + content.length;
					}
				});
				return _isEmpty(contents) ? total : temp;
			},
			{},
		);
		return stateCount;
	};
	const productCount = useMemo(constructItemCount, [product, children]);

	const handleAccess = (event) => {
		event.stopPropagation();
		if (product?.parentIds?.length) {
			const searchParams = new URLSearchParams({ openAccess: true, moduleUrlId });
			history.push(`/${publicEmbed ? 'public' : 'main'}/consumption/group/${product.parentIds[0]}/${product.id}?${searchParams}`);
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

	if (product.childrenIds.length === 0) {
		// indiv product
		return (
			<BundleProductCard
				key={product.id}
				product={product}
				price={productPrice}
				heightChanged={delta => heightChanged?.(delta)}
				collapseDuration={collapseDuration}
				priceLoading={pricesLoading}
				authorInfo={authorInfo}
				bundle={bundle}
			/>
		);
	}

	const productTitle = (
		<h2 className="gx-mb-2 gx-mr-2 bundle-title gx-font-weight-semi-bold">{product.title}</h2>
	);
	const hasPrice = !pricesLoading && productPrice?.price_collection;

	return (
		<div className="gx-my-3">
			<Card
				style={{
					borderLeft: `6px solid ${styling['primary-dark-color']}`,
					borderRadius: '5px',
				}}
				className="gx-mb-0 card-padding-0 shadow-2"
			>
				{/* {hasPrice && <BundleRibbon className="bundle-ribbon" />} */}
				<div className="bundle-card-wrapper">
					<div className="gx-px-4 gx-pt-3 gx-pb-2 gx-d-flex gx-justify-content-between bundle-card-content">
						{productTitle}
						<div className="more-info-btn">
							<div className="product-card-btn-wrapper">
								{/* description popover */}
								{product.description ? (
									<div>
										<Button
											className="gx-ml-auto button-secondary gx-w-100"
											shape="round"
											onClick={showModal}
										>
											MORE INFO
										</Button>
									</div>
								) : null}
							</div>
						</div>
					</div>
					<div>
						{publicationDate ? (
							<p className='gx-ml-4'>
								Publication Date:&nbsp;
								{moment(publicationDate).format('MM/DD/YYYY')}
							</p>
						) : null}
					</div>
					<div
						className={
							'gx-mx-4 gx-mb-2 gx-d-flex gx-align-items-end gx-justify-content-between bundle-card-content'
						}
					>
						<div>
							{Object.keys(productCount).length ||
								(children.length && !productAccessList?.includes(product.id)) ? (
								<div style={{ minWidth: '30rem' }} className="file-area-divider">
									<Divider orientation="left" plain>
										Includes
									</Divider>
									<div className="bundle-text-content">
										{Object.keys(productCount).length ? (
											<div>
												<span>
													{_map(productCount, (count, key) => {
													  let fileName = count > 1 && key !== FILE.PDF ? key.concat("s") : key;
														return(
														<span key={key}>
															{key === FILE.PDF && (
																<span className="gx-ml-2">
																	<FilePdfOutlined /> {count}{' '}
																	{fileName?.toUpperCase()?.concat(count > 1 ? 's' : '')}
																</span>
															)}
															{key === FILE.VIDEO && (
																<span className="gx-ml-2">
																	<PlayCircleOutlined /> {count}{' '}
																	{fileName}
																</span>
															)}
															{key === FILE.IMAGE && (
																<span className="gx-ml-2">
																	<PictureOutlined /> {count}{' '}
																	{fileName}
																</span>
															)}
															{key === FILE.FILE && (
																<span className="gx-ml-2">
																	<FileOutlined /> {count}{' '}
																	{fileName}
																</span>
															)}
														</span>
													)})}
												</span>
											</div>
										) : null}
										{children && !productAccessList?.includes(product.id) ? (
											<div className="gx-mt-3">
												<Button
													size={'small'}
													onClick={() => {
														handleSelectBundle(product);
													}}
												>
													Browse Content
												</Button>
											</div>
										) : null}
									</div>
								</div>
							) : null}
							<div>
								{!_isEmpty(authorInfo)
									? (<div className="gx-mb-2 gx-mt-2 description-text gx-d-flex gx-align-items-center">
										<div><Avatar size="medium" src={authorInfo.picture} icon={<UserOutlined />} /></div>
										{authorInfo.fullname ? <div className='gx-ml-2'>{authorInfo.fullname}</div> : null}
										{authorInfo.degrees ? <div>{`, ${authorInfo.degrees}`}</div> : null}
									</div>)
									: product.author_block ? (
										<div className='gx-d-flex gx-align-items-center'>
											<div className='gx-ml-2'>{product.author_block}</div>
										</div>
									) : null}
							</div>
						</div>
						<div className="primary-red-btn">
							<div className="product-card-btn-wrapper gx-mb-1 gx-mt-3">
								<div className="product-price-details gx-d-flex gx-justify-content-center">
									{/* {productPrice?.price_collection?.teaser && (
									<Tag className="teaser-tag">
										{productPrice?.price_collection?.teaser?.price === 0
											? 'FREE'
											: `$${productPrice?.price_collection?.teaser?.price}`}{' '}
										for members
									</Tag>
								)} */}
								</div>
								{productAccessList.includes(product.id)
									? (<>{renderAccessNow()}</>)
									: hasPrice &&
									(productPrice.user_has_open_access ? (
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
											{productPrice.open_access_tease &&
												productPrice.open_access_tease.length > 0 && !product.exclude_open_access_tease_message && (
													<>
														<Tooltip
															title={productPrice.open_access_tease.join(
																', ',
															)}
														>
															<Tag className="gx-mb-0">
																{storeConfig?.open_access_tease_message &&
																	!isEmpty(
																		storeConfig?.open_access_tease_message,
																	)
																	? `${storeConfig?.open_access_tease_message}`
																	: 'Open access available for members'}
															</Tag>
														</Tooltip>
														<br />
														<br />
													</>
												)}
											<Button
												className="button-primary gx-w-100"
												shape="round"
												onClick={e =>
													addedToCart
														? removeFromCart(productPrice)
														: addToCart(productPrice)
												}
											>
												<div className="gx-d-flex gx-justify-content-center gx-align-items-center">
													{pricesLoading ? (
														<Spin
															className="gx-ml-1 gx-mt-2"
															size="small"
														/>
													) : addedToCart ? (
														<p>
															<Remove
																className="gx-mr-2"
																style={{ width: '0.9em' }}
															/>
															Remove
														</p>
													) : (
														productPrice?.price_collection && (
															<>
																<p className="gx-mb-0">
																	{productPrice.price_collection
																		.primary.price === 0
																		? 'FREE'
																		: storeConfig?.buy_now_button_label &&
																			!isEmpty(
																				storeConfig?.buy_now_button_label,
																			)
																			? `${storeConfig?.buy_now_button_label} ($${productPrice.price_collection.primary.price})`
																			: `BUY $${productPrice.price_collection.primary.price}`}
																</p>

																{/* {productPrice.price_collection.primary.price !== totalPrice && (
														<>
															<h4 className="gx-mr-3 gx-text-strikethrough gx-text-grey gx-mb-0">
																${totalPrice}
															</h4>
															<Tag className="gx-mb-0 bundle-tag">
																Save {savingsPercentage}%
															</Tag>
														</>
													)} */}
															</>
														)
													)}
												</div>
											</Button>
										</>
									))}
							</div>
						</div>
					</div>
				</div>
			</Card>

			{/* {children && (
				<>
					<div
						ref={collapsible}
						className="bundle-children gx-pl-4 gx-mr-4 gx-ml-4"
						style={{
							height: `${collapsibleHeight}px`,
							overflow: 'hidden',
							transition: `height ${collapseDuration}ms ease-in-out`,
						}}
					>
						{children.slice(0, showing).map(child => (
							<BundleProductRender
								key={child.id}
								product={child}
								heightChanged={delta =>
									setCollapsibleHeight(height => height + delta)
								}
							/>
						))}
					</div> */}

			{/* <Card className="card-border-bottom-radius card-padding-0 gx-px-4 gx-py-2 gx-m-0 shadow-2"> */}
			{/* {showing < children.length && (
							<Button
								onClick={() => {
									setCollapsibleShow(true);
									setShowing(showing =>
										Math.min(showing + showingIncrement, children.length),
									);
								}}
								type="link"
								className="gx-mb-0 fg-grey gx-px-0 gx-mr-4"
								icon={<CaretDownOutlined />}
							>
								<p className="underline gx-d-inline-block gx-ml-2">
									Show {showing > 0 ? 'More' : 'Products'} (
									{children.length - showing})
								</p>
							</Button>
						)}
						{showing > 0 && (
							<Button
								onClick={() => {
									heightChanged && heightChanged(-collapsibleHeight);
									setCollapsibleHeight(0);
									setTimeout(() => setShowing(0), collapseDuration); // wait for closing transition to end b4 removing elements frm dom
								}}
								type="link"
								className="gx-mb-0 fg-grey gx-px-0"
								icon={<CaretUpOutlined />}
							>
								<p className="underline gx-d-inline-block gx-ml-2">Hide all</p>
							</Button>
						)} */}

			{/* tags */}
			{/* {showTags &&
							product.tagIds.map(
								tagId =>
									tagsMap[tagId] && (
										<Tag className="tag" key={tagId}>
											{tagsMap[tagId]}
										</Tag>
									),
							)} */}
			{/* </Card> */}
			{/* </>
			)} */}
		</div>
	);
};

export default BundleProductRender;
