import SalesByVolume from "@/MembershipReportingV2/SalesChartWidget/SalesByVolume"
import SalesbyRevenue from "@/MembershipReportingV2/SalesChartWidget/SalesByRevenue"
import ReportTable from "@/MembershipReportingV2/SalesChartWidget/ReportTable"

export const SalesChartWidget = (props) => {
    const { type } = props
    return (
        <div>
            {type === "TOTAL_MEMBERS" && <SalesByVolume {...props} />}
            {type === "TOTAL_REVENUE" && <SalesbyRevenue {...props} />}
            {type === "REPORT_TABLE" && <ReportTable {...props} />}
        </div>
    )
}