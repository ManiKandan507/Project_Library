import SalesByVolume from "@/CorporateMembershipReportingV2/SalesChartWidget/SalesByVolume"
import SalesbyRevenue from "@/CorporateMembershipReportingV2/SalesChartWidget/SalesByRevenue"
import ReportTable from "@/CorporateMembershipReportingV2/SalesChartWidget/ReportTable"

export const SalesChartWidget = (props) => {
    const { type } = props
    return (
        <div>
            { type === "TOTAL_MEMBERS" && <SalesByVolume {...props}/> }
            { type === "TOTAL_REVENUE" && <SalesbyRevenue {...props}/> }
            { type === "REPORT_TABLE" && <ReportTable {...props}/> }
        </div>
    )
}