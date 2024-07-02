import React, { useState, useEffect, useMemo } from 'react'
import moment from 'moment';
import { Tooltip } from 'antd'
import _map from 'lodash/map';
import _groupBy from 'lodash/groupBy';
import { ArrowDownOutlined, ArrowUpOutlined } from '@ant-design/icons'
import CommonSpinner from '@/MembershipReportingV2/common/CommonSpinner';
import { ReactComponent as Information } from '@/AnalyticsAll/NativeDashboards/MembershipReporting/assets/icons/Information.svg';
import { getMonthStartDate, getMonthName, getRoundValue, currencyFormatter } from '@/AnalyticsAll/StatComponents/util';
import { NewMemberChart } from '@/MembershipReportingV2/NewMemberChart';
import { RenewMemberChart } from '@/MembershipReportingV2/RenewMemberChart';
import { useCurrentTotalMembersHook, useRecentNewMemberHook, useRecentRenewMemberHook, useExpiredTotalMemberHook, useLastMonthComparisonHook } from '@/MembershipReportingV2/hooks/Home';
import { addValuesInObj } from '@/MembershipReportingV2/SalesChartWidget/helper';
import { ErrorBoundary, ErrorFallback } from '@/MembershipReportingV2/common/errorBoundary';

const SideMenu = (props) => {
    const { params: { source_hex }, signal } = props

    const [newMemInfo, setNewMemInfo] = useState([])
    const [renewMemInfo, setRenewMemInfo] = useState([])
    const [salesCount, setSalesCount] = useState({ TotalInvoices: 0, TotalRevenue: 0 })
    const [isReload, setIsReload] = useState(false)
    const [isRenewReload, setRenewReload] = useState(false)

    let { currentTotalMembers, loading } = useCurrentTotalMembersHook(source_hex, signal)
    let { expiredTotalMembers, loading: expMemLoading } = useExpiredTotalMemberHook(source_hex, signal)
    let { lastMonthComparison, loading: salesRevenueLoading } = useLastMonthComparisonHook(source_hex, signal)
    let { recentNewMember, loading: recentNewMemLoading, isApiFail } = useRecentNewMemberHook(source_hex, getMonthStartDate(2), moment().format('DD/MM/YYYY'), signal, isReload, setIsReload)
    // let { recentNewMember, loading:recentNewMemLoading } = useRecentNewMemberHook(source_hex, startDate, endDate, signal, isReload, setIsReload)
    let { recentRenewMembers, loading: recentRenewMemLoading, isRenewApiFail } = useRecentRenewMemberHook(source_hex, getMonthStartDate(2), moment().format('DD/MM/YYYY'), signal, isRenewReload, setRenewReload)

    useEffect(() => {
        let dataSource = [];
        let membersMonth = []
        _map(_groupBy(recentNewMember, "JoinMonth"), (groupArr) => {
            let constructedData = _map(_groupBy(groupArr, "JoinMonth"), (monthArr) => {
                membersMonth.push(monthArr[0]["JoinMonth"])
                return {
                    ...addValuesInObj(monthArr, ["Count"]),
                    JoinMonth: monthArr[0]["JoinMonth"],
                    JoinYear: monthArr[0]["JoinYear"]
                }
            })
            dataSource.push(...constructedData)
            return groupArr
        })
        if (recentNewMember.length) {
            if (membersMonth.length !== 3) {
                membersMonth.push(membersMonth[1] + 1)
            }
            if (dataSource.length !== 3) {
                let existingDays = []
                for (var i = 0; i < dataSource.length; i++) {
                    existingDays[i] = dataSource[i]['JoinMonth'];
                }
                for (var i = 0; i < membersMonth.length; i++) {
                    if (existingDays.indexOf(parseInt(membersMonth[i])) < 0) {
                        dataSource.push({ Count: 0, JoinMonth: membersMonth[i], JoinYear: 2023 })
                    }
                }
            }
        }
        setNewMemInfo(dataSource)
    }, [recentNewMember])

    useEffect(() => {
        let dataSource = [];
        let membersMonth = [];
        _map(_groupBy(recentRenewMembers, "RenewMonth"), (groupArr) => {
            let constructedData = _map(_groupBy(groupArr, "RenewMonth"), (monthArr) => {
                membersMonth.push(monthArr[0]["RenewMonth"])
                return {
                    ...addValuesInObj(monthArr, ["Count"]),
                    RenewMonth: monthArr[0]["RenewMonth"],
                    RenewYear: monthArr[0]["RenewYear"]
                }
            })
            dataSource.push(...constructedData)
            return groupArr
        })
        if (recentRenewMembers.length) {
            if (membersMonth.length !== 3) {
                membersMonth.push(membersMonth[1] + 1)
            }
            if (dataSource.length !== 3) {
                let existingDays = []
                for (var i = 0; i < dataSource.length; i++) {
                    existingDays[i] = dataSource[i]['RenewMonth'];
                }
                for (var i = 0; i < membersMonth.length; i++) {
                    if (existingDays.indexOf(parseInt(membersMonth[i])) < 0) {
                        dataSource.push({ Count: 0, RenewMonth: membersMonth[i], RenewYear: 2023 })
                    }
                }
            }
        }
        setRenewMemInfo(dataSource)
    }, [recentRenewMembers])

    useEffect(() => {
        let totalSales;
        let totalRevenue;
        let Months = [];
        lastMonthComparison.totals?.map((data, key) => {
            Months.push(`${getMonthName(data.MonthOfInvoice)} ${data.YearOfInvoice}`)
            if (key === lastMonthComparison?.totals.length - 1) {
                totalSales = data?.TotalInvoices
                totalRevenue = data?.TotalRevenue
            }
            return data
        })
        setSalesCount({ TotalInvoices: totalSales, TotalRevenue: totalRevenue, priorTwoMonth: Months[0], priorOneMonth: Months[1] })
    }, [lastMonthComparison])


    const renderCurrentMember = useMemo(() => {
        return (
            <div className='pb-2'>
                <div className="d-flex title">
                    <div>{"ACTIVE MEMBERS"}</div>
                    <span className="ml-2">
                        <Tooltip title={"Total count of contacts in membership groups that are in good standing as of today (ie. expiration date greater than today)"} placement="right">
                            <Information style={{ width: "0.9rem" }} />
                        </Tooltip>
                    </span>
                </div>
                <div className="menuValues py-1" style={{ color: "#0673b1", textDecoration: "underline" }}>{currentTotalMembers.TotalMembers}</div>
            </div>
        )
    }, [currentTotalMembers?.TotalMembers]);

    const renderNewMember = useMemo(() => {
        let count = 0;
        newMemInfo?.forEach((data) => {
            count = count + data.Count
        })
        return (
            <div className='py-2'>
                <div className="d-flex title">
                    <div>{"NEW MEMBERS"}</div>
                    <span className="ml-2">
                        <Tooltip title={"Contacts who are new to the society. Their member join date is within the last 3 months."} placement="right">
                            <Information style={{ width: "0.9rem" }} />
                        </Tooltip>
                    </span>
                </div>
                <div className="menuValues py-1" style={{ color: "#52c41a", textDecoration: "underline" }}>{count}</div>
                <div className='py-4'>
                    <NewMemberChart recentNewMember={newMemInfo} loading={recentNewMemLoading} setIsReload={setIsReload} isApiFail={isApiFail} />
                </div>
            </div>
        )
    }, [recentNewMemLoading, newMemInfo])

    const renderRenewMember = useMemo(() => {
        let count = 0;
        renewMemInfo?.forEach((data) => {
            count = count + data.Count
        })
        return (
            <div className='py-2'>
                <div className="d-flex title">
                    <div>{"RENEWED MEMBERS"}</div>
                    <span className="ml-2">
                        <Tooltip title={"Contacts who have previously joined but renewed in the last 3 months by paying for a dues invoice."} placement="right">
                            <Information style={{ width: "0.9rem" }} />
                        </Tooltip>
                    </span>
                </div>
                <div className="menuValues py-1" style={{ color: "#faad14", textDecoration: "underline" }}>{count}</div>
                <div className='py-4'><RenewMemberChart recentRenewMembers={renewMemInfo} loading={recentRenewMemLoading} setRenewReload={setRenewReload} isRenewApiFail={isRenewApiFail} /></div>
            </div>
        )
    }, [renewMemInfo, recentRenewMemLoading])

    const renderExpiredMember = useMemo(() => {
        return (
            <div className='py-2'>
                <div className="d-flex title">
                    <div> {"EXPIRED MEMBERS"}</div>
                    <span className="ml-2">
                        <Tooltip title={"Contacts who are in membership groups that have an expiration date in the past (ie. yesterday or earlier)"} placement="right">
                            <Information style={{ width: "0.9rem" }} />
                        </Tooltip>
                    </span>
                </div>
                <div className="menuValues py-1" style={{ color: "#f5222d", textDecoration: "underline" }}>{expiredTotalMembers.TotalExpiredMembers}</div>
            </div>
        )
    }, [expiredTotalMembers?.TotalExpiredMembers])

    // const salesRevenue = useMemo(()=>{
    //     return (<>
    //         <div className="d-flex title mb-3 py-2">
    //             <div>{"LAST MONTH COMPARISON"}</div>
    //             <span className="ml-2">
    //                 <Tooltip title={`Comparing the last 2 full months: ${salesCount.priorTwoMonth} & ${salesCount.priorOneMonth}. Sales is the # of membership invoices. Revenue is the total amount purchased.`} placement="right">
    //                     <Information style={{ width: "0.9rem" }} />
    //                 </Tooltip>
    //             </span>
    //         </div>
    //         <CommonSpinner loading = {salesRevenueLoading}>
    //         <div className="title d-flex justify-space-between mb-3">
    //             <div>SALES</div>
    //             <div className='d-flex mr-7'>
    //                 <div className='mr-3'> {salesCount.TotalInvoices} </div>
    //                 <div> 
    //                     {lastMonthComparison?.invoice_percent_change > 0 ? <ArrowUpOutlined style={{ color: '#5ab33e' }} />:<ArrowDownOutlined style={{ color: '#f5222d' }} /> } {`${getRoundValue(lastMonthComparison?.invoice_percent_change, 2)}%`} 
    //                 </div>
    //             </div>
    //         </div>
    //         <div className="title d-flex justify-space-between">
    //             <div>REVENUE</div>
    //             <div className='d-flex mr-7'>
    //                 <div className='mr-3'>{currencyFormatter(salesCount.TotalRevenue)}</div>
    //                 <div> 
    //                     {lastMonthComparison?.revenue_percent_change > 0 ? <ArrowUpOutlined style={{ color: '#5ab33e' }} />:<ArrowDownOutlined style={{ color: '#f5222d' }} /> } {`${getRoundValue(lastMonthComparison?.revenue_percent_change, 2)}%`} 
    //                 </div>
    //             </div>
    //         </div>
    //     </CommonSpinner>
    //     </>
    //     )
    // }, [salesRevenueLoading, salesCount?.TotalInvoices, lastMonthComparison?.invoice_percent_change, lastMonthComparison?.revenue_percent_change, salesCount.priorOneMonth, salesCount.priorTwoMonth])


    return (
        <ErrorBoundary FallbackComponent={ErrorFallback}>
            <CommonSpinner loading={loading || recentNewMemLoading || recentRenewMemLoading || expMemLoading}>
                <div className="mb-4 ml-3">
                    <div className='mb-2'>
                        <div style={{ fontSize: 16, marginBottom: 12 }}>QUICK SUMMARY</div>
                        {renderCurrentMember}
                        {renderExpiredMember}
                        {renderNewMember}
                        {renderRenewMember}
                    </div>
                    <div className="mt-3 pb-3"></div>
                </div>
            </CommonSpinner>
        </ErrorBoundary>
    )
}

export default SideMenu