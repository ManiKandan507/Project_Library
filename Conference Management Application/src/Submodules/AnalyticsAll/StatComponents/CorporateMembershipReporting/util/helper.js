import moment from "moment";
import tinycolor from "tinycolor2";


/**
 * reportID
 * reportLabel
 * description
 * artworkLink
 * compareMode
 * showByConfig
 * dateTime
 *      startDate
 *      endDate
 *      dateTimeSelectionFormat
 *          # "date_range"[DEFAULT] - Show date range selector
 *          # "single_month_multi_year" - show 3 dropdowns (Start Month, Start Year, End Year) allow only if timeGroupBy=MONTH
 *          # "multi_year" - show 2 dropdowns (Start Year, End Year)
 *          # "date_picker_with_range" - Show dynamic date time picker with range selector 
 *      allowDateChange
 *      timeGroupBy
 *      showTimeGroupBy
 *      defaultGroupBy
 * chartTypes
 * showChartTypes
 * defaultChartType
 * visualizationType
 * showVisualizationType
 * defaultVisualizationType
 * category
 *      name
 *      category_id
 * tags
 * 
 */
const testReports = [
  {
    reportID: "SALESYTD",
    reportLabel: "Default Sales",
    description: "No of memberships sold in this year",
    artworkLink: "", //Card header image URL
    compareMode: false,
    showByConfig: true,
    dateTime: {
      startDate: {
        unit: "YEAR",
        date: "T",
      },
      endDate: {
        unit: "YEAR",
        date: "T",
      },
      allowDateChange: true,
      timeGroupBy: ["DATE", "WEEK", "YEAR", "QUARTER", "MONTH"],
      showTimeGroupBy: true,
      defaultGroupBy: "MONTH",
    },
    chartTypes: ["VOLUME", "REVENUE", "TABLE"],
    showChartTypes: true,
    defaultChartType: "VOLUME",
    visualizationType: ["SIMPLE", "DETAILED", "TABLE"],
    showVisualizationType: true,
    defaultVisualizationType: "SIMPLE",
    category: { name: "General", category_id: 1 },
    tags: ["Sales"]
  },
  {
    reportID: "SALESYTD",
    reportLabel: "Date Range Sales",
    description: "No of memberships sold in this year",
    artworkLink: "", //Card header image URL
    compareMode: true,
    showByConfig: true,
    dateTime: {
      startDate: {
        unit: "YEAR",
        date: "T",
      },
      endDate: {
        unit: "YEAR",
        date: "T",
      },
      allowDateChange: true,
      timeGroupBy: ["DATE", "WEEK", "YEAR", "QUARTER", "MONTH"],
      showTimeGroupBy: true,
      dateTimeSelectionFormat: "date_range",
      defaultGroupBy: "MONTH",
    },
    chartTypes: ["VOLUME", "REVENUE", "TABLE"],
    showChartTypes: true,
    defaultChartType: "VOLUME",
    visualizationType: ["SIMPLE", "TABLE"],
    showVisualizationType: true,
    defaultVisualizationType: "SIMPLE",
    category: { name: "General", category_id: 1 },
    tags: ["Sales"]
  },
  {
    reportID: "SALESYTD",
    reportLabel: "Single Month Multi Year Sales",
    description: "No of memberships sold in this year",
    artworkLink: "", //Card header image URL
    compareMode: true,
    showByConfig: true,
    dateTime: {
      startDate: {
        unit: "YEAR",
        date: "T",
      },
      endDate: {
        unit: "YEAR",
        date: "T",
      },
      allowDateChange: true,
      timeGroupBy: ["DATE", "WEEK", "YEAR", "QUARTER", "MONTH"],
      showTimeGroupBy: false,
      dateTimeSelectionFormat: "single_month_multi_year",
      defaultGroupBy: "MONTH",
    },
    chartTypes: ["VOLUME", "REVENUE", "TABLE"],
    showChartTypes: true,
    defaultChartType: "VOLUME",
    visualizationType: ["SIMPLE", "TABLE"],
    showVisualizationType: true,
    defaultVisualizationType: "SIMPLE",
    category: { name: "General", category_id: 1 },
    tags: ["Sales"]
  },
  {
    reportID: "SALESYTD",
    reportLabel: "Multi Year Sales",
    description: "No of memberships sold in this year",
    artworkLink: "", //Card header image URL
    compareMode: true,
    showByConfig: true,
    dateTime: {
      startDate: {
        unit: "YEAR",
        date: "T",
      },
      endDate: {
        unit: "YEAR",
        date: "T",
      },
      allowDateChange: true,
      timeGroupBy: ["DATE", "WEEK", "YEAR", "QUARTER", "MONTH"],
      showTimeGroupBy: false,
      dateTimeSelectionFormat: "multi_year",
      defaultGroupBy: "MONTH",
    },
    chartTypes: ["VOLUME", "REVENUE", "TABLE"],
    showChartTypes: true,
    defaultChartType: "VOLUME",
    visualizationType: ["SIMPLE", "DETAILED", "TABLE"],
    showVisualizationType: true,
    defaultVisualizationType: "SIMPLE",
    category: { name: "General", category_id: 1 },
    tags: ["Sales"]
  },
  {
    reportID: "SALESYTD",
    reportLabel: "Year To Date Sales",
    description: "No of memberships sold in this year",
    artworkLink: "", //Card header image URL
    compareMode: false,
    showByConfig: true,
    dateTime: {
      startDate: {
        unit: "YEAR",
        date: "T",
      },
      endDate: {
        unit: "YEAR",
        date: "T",
      },
      allowDateChange: true,
      timeGroupBy: ["DATE", "WEEK", "YEAR", "QUARTER", "MONTH"],
      showTimeGroupBy: false,
      defaultGroupBy: "MONTH",
    },
    chartTypes: ["VOLUME", "REVENUE", "TABLE"],
    showChartTypes: true,
    defaultChartType: "VOLUME",
    visualizationType: ["SIMPLE", "DETAILED", "TABLE"],
    showVisualizationType: false,
    defaultVisualizationType: "DETAILED",
    category: { name: "General", category_id: 1 },
    tags: ["Sales"]
  },
  {
    reportID: "LAST1YEAR",
    reportLabel: "Last 1 Full Year Sales",
    description: "Sales for last 1 full year",
    artworkLink: "", //Card header image URL
    compareMode: false,
    showByConfig: true,
    dateTime: {
      startDate: {
        unit: "YEAR",
        date: "T-1",
      },
      endDate: {
        unit: "YEAR",
        date: "T-1",
      },
      allowDateChange: true,
      showDateRange: false,
      timeGroupBy: ["QUARTER", "MONTH", "YEAR"],
      dateTimeSelectionFormat: "date_range",
      showTimeGroupBy: true,
      defaultGroupBy: "MONTH",
    },
    chartTypes: ["VOLUME", "REVENUE", "TABLE"],
    showChartTypes: true,
    defaultChartType: "VOLUME",
    visualizationType: ["SIMPLE", "DETAILED", "TABLE"],
    showVisualizationType: true,
    defaultVisualizationType: "SIMPLE",
    category: { name: "Executive", category_id: 2 },
    tags: ["Sales", "Revenue"]
  },
  {
    reportID: "LAST2YEARS",
    reportLabel: "Last 1 Year YoY",
    description: "Sales of last 12 months compared to previous 12 months",
    artworkLink: "", //Card header image URL
    compareMode: true,
    showByConfig: true,
    dateTime: {
      startDate: {
        unit: "MONTH",
        date: "T-11",
      },
      endDate: {
        unit: "MONTH",
        date: "T",
      },
      allowDateChange: true,
      timeGroupBy: ["QUARTER", "MONTH", "YEAR"],
      showTimeGroupBy: true,
      defaultGroupBy: "MONTH",
    },
    chartTypes: ["VOLUME", "REVENUE", "TABLE"],
    showChartTypes: true,
    defaultChartType: "VOLUME",
    visualizationType: ["SIMPLE", "TABLE"],
    showVisualizationType: true,
    defaultVisualizationType: "SIMPLE",
    category: { name: "General", category_id: 1 },
    tags: ["Growth", "Sales"]
  },
  {
    reportID: "CUSTOM",
    reportLabel: "Custom Report",
    description: "All reporting options for Power users",
    artworkLink: "", //Card header image URL,
    showByConfig: false,
    category: { name: "Pro User", category_id: 3 },
  },
  {
    reportID: "MULTIYEARANNUALREPORT",
    reportLabel: "Annual Sales Comparison",
    description: "Compare consecutive 12 month periods",
    artworkLink: "", //Card header image URL
    compareMode: true,
    showByConfig: true,
    dateTime: {
      startDate: {
        unit: "YEAR",
        date: "T-2",
      },
      endDate: {
        unit: "YEAR",
        date: "T-1",
      },
      dateTimeSelectionFormat: "single_month_multi_year",
      allowDateChange: true,
      timeGroupBy: ["MONTH", "YEAR"],
      showTimeGroupBy: true,
      defaultGroupBy: "MONTH",
    },
    chartTypes: ["VOLUME", "REVENUE", "TABLE"],
    showChartTypes: true,
    defaultChartType: "VOLUME",
    visualizationType: ["SIMPLE", "TABLE"],
    showVisualizationType: true,
    defaultVisualizationType: "SIMPLE",
    category: { name: "General", category_id: 1 },
    tags: ["Multi Year", "Sales"]
  },
]

const otherReports = [


  {
    reportID: "MONTHLYREVENUEBYMEMBERSHIPYTD",
    reportLabel: "Monthly Revenue by Membership Type - Year to Date",
    description: "See the monthly sales by membership type of your current membership year",
    artworkLink: "", //Card header image URL
    compareMode: false,
    showByConfig: true,
    dateTime: {
      startDate: {
        unit: "YEAR",
        date: "T",
      },
      endDate: {
        unit: "YEAR",
        date: "T",
      },
      dateTimeSelectionFormat: "single_month_multi_year",
      allowDateChange: false,
      timeGroupBy: ["MONTH"],
      showTimeGroupBy: true,
      defaultGroupBy: "MONTH",
    },
    chartTypes: ["REVENUE", "TABLE"],
    showChartTypes: true,
    defaultChartType: "REVENUE",
    visualizationType: ["DETAILED", "TABLE"],
    showVisualizationType: true,
    defaultVisualizationType: "DETAILED",
    category: { name: "Current Sales By Membership Type", category_id: 5 },
    tags: ["Multi Year", "Sales"]
  },
  {
    reportID: "MONTHLYYREVENUEYTD",
    reportLabel: "Monthly Revenue - Membership Year to Date",
    description: "See the monthly sales by membership type of your current membership year",
    artworkLink: "", //Card header image URL
    compareMode: false,
    showByConfig: true,
    dateTime: {
      startDate: {
        unit: "YEAR",
        date: "T",
      },
      endDate: {
        unit: "YEAR",
        date: "T",
      },
      dateTimeSelectionFormat: "single_month_multi_year",
      allowDateChange: false,
      timeGroupBy: ["MONTH"],
      showTimeGroupBy: true,
      defaultGroupBy: "MONTH",
    },
    chartTypes: ["REVENUE", "TABLE"],
    showChartTypes: true,
    defaultChartType: "REVENUE",
    visualizationType: ["SIMPLE", "TABLE"],
    showVisualizationType: true,
    defaultVisualizationType: "SIMPLE",
    category: { name: "Current Sales By Membership Type", category_id: 5 },
    tags: ["Multi Year", "Sales"]
  },

]
export const salesConfigs = [
  //Current Sales by Volume and Revenue
  // {
  //   reportID: "MONTHLYREVENUEYTD",
  //   reportLabel: "Monthly Revenue - Year to Date",
  //   description: "See your monthly sales since the beginning of this year",
  //   artworkLink: "", //Card header image URL
  //   compareMode: false,
  //   showByConfig: true,
  //   dateTime: {
  //     startDate: {
  //       unit: "YEAR",
  //       date: "T",
  //     },
  //     endDate: {
  //       unit: "YEAR",
  //       date: "T",
  //     },
  //     dateTimeSelectionFormat: "single_month_multi_year", 
  //     allowDateChange: false,
  //     timeGroupBy: ["MONTH"],
  //     showTimeGroupBy: true,
  //     defaultGroupBy: "MONTH",
  //   },
  //   chartTypes: ["REVENUE", "TABLE"],
  //   showChartTypes: true,
  //   defaultChartType: "REVENUE",
  //   visualizationType: ["SIMPLE", "TABLE"],
  //   showVisualizationType: true,
  //   defaultVisualizationType: "SIMPLE",
  //   category: {name:"Current Sales by Volume and Revenue", category_id: 4},
  //   tags:["Current Year","Revenue"]
  // },
  // {
  //   reportID: "QUARTELYREVENUEYTD",
  //   reportLabel: "Quarterly Revenue - Year to Date",
  //   description: "See your quarterly sales since the beginning of the year",
  //   artworkLink: "", //Card header image URL
  //   compareMode: false,
  //   showByConfig: true,
  //   dateTime: {
  //     startDate: {
  //       unit: "YEAR",
  //       date: "T",
  //     },
  //     endDate: {
  //       unit: "YEAR",
  //       date: "T",
  //     },
  //     dateTimeSelectionFormat: "multi_year", 
  //     allowDateChange: false,
  //     timeGroupBy: ["QUARTER"],
  //     showTimeGroupBy: true,
  //     defaultGroupBy: "QUARTER",
  //   },
  //   chartTypes: ["REVENUE", "TABLE"],
  //   showChartTypes: true,
  //   defaultChartType: "REVENUE",
  //   visualizationType: ["SIMPLE", "TABLE"],
  //   showVisualizationType: true,
  //   defaultVisualizationType: "SIMPLE",
  //   category: {name:"Current Sales by Volume and Revenue", category_id: 4},
  //   tags:["Current Year","Revenue"]
  // },
  // {
  //   reportID: "MONTHLYMEMBERSHIPYTD",
  //   reportLabel: "Monthly Memberships Sold - Year to Date",
  //   description: "See your monthly sales since the beginning of this year",
  //   artworkLink: "", //Card header image URL
  //   compareMode: false,
  //   showByConfig: true,
  //   dateTime: {
  //     startDate: {
  //       unit: "YEAR",
  //       date: "T",
  //     },
  //     endDate: {
  //       unit: "YEAR",
  //       date: "T",
  //     },
  //     dateTimeSelectionFormat: "single_month_multi_year", 
  //     allowDateChange: false,
  //     timeGroupBy: ["MONTH"],
  //     showTimeGroupBy: true,
  //     defaultGroupBy: "MONTH",
  //   },
  //   chartTypes: ["VOLUME", "TABLE"],
  //   showChartTypes: true,
  //   defaultChartType: "VOLUME",
  //   visualizationType: ["SIMPLE", "TABLE"],
  //   showVisualizationType: true,
  //   defaultVisualizationType: "SIMPLE",
  //   category: {name:"Current Sales by Volume and Revenue", category_id: 4},
  //   tags:["Current Year","Volume"]
  // },
  // {
  //   reportID: "QUARTERLYMEMBERSHIPYTD",
  //   reportLabel: "Quarterly Memberships Sold - Year to Date",
  //   description: "See your quarterly sales since the beginning of the year",
  //   artworkLink: "", //Card header image URL
  //   compareMode: false,
  //   showByConfig: true,
  //   dateTime: {
  //     startDate: {
  //       unit: "YEAR",
  //       date: "T",
  //     },
  //     endDate: {
  //       unit: "YEAR",
  //       date: "T",
  //     },
  //     dateTimeSelectionFormat: "multi_year", 
  //     allowDateChange: false,
  //     timeGroupBy: ["QUARTER"],
  //     showTimeGroupBy: true,
  //     defaultGroupBy: "QUARTER",
  //   },
  //   chartTypes: ["VOLUME", "TABLE"],
  //   showChartTypes: true,
  //   defaultChartType: "VOLUME",
  //   visualizationType: ["SIMPLE", "TABLE"],
  //   showVisualizationType: true,
  //   defaultVisualizationType: "SIMPLE",
  //   category: {name:"Current Sales by Volume and Revenue", category_id: 4},
  //   tags:["Current Year","Volume"]
  // },
  // {
  //   reportID: "MONTHLYMEMBERSHIPTYPESYTD",
  //   reportLabel: "Monthly Memberships Sold - Membership Year to Date",
  //   description: "See the monthly sales by membership type of your current membership year",
  //   artworkLink: "", //Card header image URL
  //   compareMode: false,
  //   showByConfig: true,
  //   dateTime: {
  //     startDate: {
  //       unit: "YEAR",
  //       date: "T",
  //     },
  //     endDate: {
  //       unit: "YEAR",
  //       date: "T",
  //     },
  //     dateTimeSelectionFormat: "single_month_multi_year", 
  //     allowDateChange: true,
  //     timeGroupBy: ["MONTH"],
  //     showTimeGroupBy: true,
  //     defaultGroupBy: "MONTH",
  //   },
  //   chartTypes: ["VOLUME", "TABLE"],
  //   showChartTypes: true,
  //   defaultChartType: "VOLUME",
  //   visualizationType: ["DETAILED", "TABLE"],
  //   showVisualizationType: true,
  //   defaultVisualizationType: "DETAILED",
  //   category: {name:"Current Sales by Volume and Revenue", category_id: 4},
  //   tags:["Current Year","Volume", "Membership Types"]
  // },

  //Historical Sales
  // {
  //   reportID: "MONTHLYREVENUESALES",
  //   reportLabel: "Monthly Revenue Membership Year Comparison",
  //   description: "See how your monthly sales have differed over the last few membership years",
  //   artworkLink: "", //Card header image URL
  //   compareMode: true,
  //   showByConfig: true,
  //   dateTime: {
  //     startDate: {
  //       unit: "YEAR",
  //       date: "T-2",
  //     },
  //     endDate: {
  //       unit: "YEAR",
  //       date: "T",
  //     },
  //     dateTimeSelectionFormat: "single_month_multi_year", 
  //     allowDateChange: true,
  //     timeGroupBy: ["MONTH"],
  //     showTimeGroupBy: true,
  //     defaultGroupBy: "MONTH",
  //   },
  //   chartTypes: ["REVENUE", "TABLE"],
  //   showChartTypes: true,
  //   defaultChartType: "REVENUE",
  //   visualizationType: ["SIMPLE", "TABLE"],
  //   showVisualizationType: true,
  //   defaultVisualizationType: "SIMPLE",
  //   category: {name:"Historical Sales", category_id: 6},
  //   tags:["Multi Year","Revenue"]
  // },
  // {
  //   reportID: "QUARTERLYREVENUESALES",
  //   reportLabel: "Quarterly Revenue Annual Comparison",
  //   description: "See how your Quarterly sales have differed over the last few years",
  //   artworkLink: "", //Card header image URL
  //   compareMode: true,
  //   showByConfig: true,
  //   dateTime: {
  //     startDate: {
  //       unit: "YEAR",
  //       date: "T-2", 
  //     },
  //     endDate: {
  //       unit: "YEAR",
  //       date: "T",
  //     },
  //     dateTimeSelectionFormat: "multi_year", 
  //     allowDateChange: true,
  //     timeGroupBy: ["QUARTER"],
  //     showTimeGroupBy: true,
  //     defaultGroupBy: "QUARTER",
  //   },
  //   chartTypes: ["REVENUE", "TABLE"],
  //   showChartTypes: true,
  //   defaultChartType: "REVENUE",
  //   visualizationType: ["SIMPLE", "TABLE"],
  //   showVisualizationType: true,
  //   defaultVisualizationType: "SIMPLE",
  //   category: {name:"Historical Sales", category_id: 6},
  //   tags:["Multi Year","Revenue"]
  // },
  // {
  //   reportID: "MONTHLYMEMBERSHIPSALES",
  //   reportLabel: "Monthly Membership Sales Membership Year Comparison",
  //   description: "See how your monthly sales have differed over the last few membership years",
  //   artworkLink: "", //Card header image URL
  //   compareMode: true,
  //   showByConfig: true,
  //   dateTime: {
  //     startDate: {
  //       unit: "YEAR",
  //       date: "T-2",
  //     },
  //     endDate: {
  //       unit: "YEAR",
  //       date: "T",
  //     },
  //     dateTimeSelectionFormat: "single_month_multi_year", 
  //     allowDateChange: true,
  //     timeGroupBy: ["MONTH"],
  //     showTimeGroupBy: true,
  //     defaultGroupBy: "MONTH",
  //   },
  //   chartTypes: ["VOLUME", "TABLE"],
  //   showChartTypes: true,
  //   defaultChartType: "VOLUME",
  //   visualizationType: ["SIMPLE", "TABLE"],
  //   showVisualizationType: true,
  //   defaultVisualizationType: "SIMPLE",
  //   category: {name:"Historical Sales", category_id: 6},
  //   tags:["Multi Year","Volume"]
  // },
  // {
  //   reportID: "QUARTERLYMEMBERSHIPSALES",
  //   reportLabel: "Quarterly Membership Sales Annual Comparison",
  //   description: "See how your Quarterly sales have differed over the last few years",
  //   artworkLink: "", //Card header image URL
  //   compareMode: true,
  //   showByConfig: true,
  //   dateTime: {
  //     startDate: {
  //       unit: "YEAR",
  //       date: "T-2", 
  //     },
  //     endDate: {
  //       unit: "YEAR",
  //       date: "T",
  //     },
  //     dateTimeSelectionFormat: "multi_year",
  //     allowDateChange: true,
  //     timeGroupBy: ["QUARTER"],
  //     showTimeGroupBy: true,
  //     defaultGroupBy: "QUARTER",
  //   },
  //   chartTypes: ["VOLUME", "TABLE"],
  //   showChartTypes: true,
  //   defaultChartType: "VOLUME",
  //   visualizationType: ["SIMPLE", "TABLE"],
  //   showVisualizationType: true,
  //   defaultVisualizationType: "SIMPLE",
  //   category: {name:"Historical Sales", category_id: 6},
  //   tags:["Multi Year","Volume"]
  // },


  {
    reportID: "sales_revenue_summary_table",
    reportLabel: "Sales & Revenue Summary",
    description: "See summary of sales and revenue over the last few membership years",
    artworkLink: "", //Card header image URL
    compareMode: true,
    showByConfig: true,
    dateTime: {
      startDate: {
        unit: "YEAR",
        date: "T-2",
      },
      endDate: {
        unit: "YEAR",
        date: "T",
      },
      dateTimeSelectionFormat: "single_month_multi_year",
      allowDateChange: true,
      timeGroupBy: ["MONTH", "QUARTER"],
      showTimeGroupBy: true,
      defaultGroupBy: "MONTH",
    },
    chartTypes: ["TABLE"],//"TABLE"
    showChartTypes: false,
    defaultChartType: "TABLE",
    visualizationType: ["TABLE"],
    showVisualizationType: true,
    defaultVisualizationType: "TABLE",
    category: { name: "Historical Sales", category_id: 6 },
    tags: ["Multi Year", "Revenue", "Sales"]
  },

  {
    reportID: "monthly_quarterly_revenue",
    reportLabel: "Revenues",
    description: "See how your revenue have differed over the last few membership years",
    artworkLink: "", //Card header image URL
    compareMode: true,
    showByConfig: true,
    dateTime: {
      startDate: {
        unit: "YEAR",
        date: "T-2",
      },
      endDate: {
        unit: "YEAR",
        date: "T",
      },
      dateTimeSelectionFormat: "single_month_multi_year",
      allowDateChange: true,
      timeGroupBy: ["MONTH", "QUARTER"],
      showTimeGroupBy: true,
      defaultGroupBy: "MONTH",
    },
    chartTypes: ["REVENUE"],//"TABLE"
    showChartTypes: false,
    defaultChartType: "REVENUE",
    visualizationType: ["SIMPLE", "TABLE"],
    showVisualizationType: true,
    defaultVisualizationType: "SIMPLE",
    category: { name: "Historical Sales", category_id: 6 },
    tags: ["Multi Year", "Revenue"]
  },


  {
    reportID: "monthly_quarterly_mem_types_revenue",
    reportLabel: "Revenues by Membership Type",
    description: "See how your revenue have differed over the last few membership years",
    artworkLink: "", //Card header image URL
    compareMode: false,
    showByConfig: true,
    dateTime: {
      startDate: {
        unit: "YEAR",
        date: "T-2",
      },
      endDate: {
        unit: "YEAR",
        date: "T",
      },
      dateTimeSelectionFormat: "single_month_multi_year",
      allowDateChange: true,
      timeGroupBy: ["MONTH", "QUARTER"],
      showTimeGroupBy: true,
      defaultGroupBy: "MONTH",
    },
    chartTypes: ["REVENUE"],
    showChartTypes: false,
    defaultChartType: "REVENUE",
    visualizationType: ["DETAILED", "TABLE"],
    showVisualizationType: true,
    defaultVisualizationType: "DETAILED",
    category: { name: "Historical Sales", category_id: 6 },
    tags: ["Multi Year", "Revenue"]
  },
  {
    reportID: "monthly_quarterly_volume",
    reportLabel: "Membership Volume",
    description: "See how your sales volume have differed over the last few membership years",
    artworkLink: "", //Card header image URL
    compareMode: true,
    showByConfig: true,
    dateTime: {
      startDate: {
        unit: "YEAR",
        date: "T-2",
      },
      endDate: {
        unit: "YEAR",
        date: "T",
      },
      dateTimeSelectionFormat: "single_month_multi_year",
      allowDateChange: true,
      timeGroupBy: ["MONTH", "QUARTER"],
      showTimeGroupBy: true,
      defaultGroupBy: "MONTH",
    },
    chartTypes: ["VOLUME"],
    showChartTypes: false,
    defaultChartType: "VOLUME",
    visualizationType: ["SIMPLE", "TABLE"],
    showVisualizationType: true,
    defaultVisualizationType: "SIMPLE",
    category: { name: "Historical Sales", category_id: 6 },
    tags: ["Multi Year", "Volume"]
  },
  {
    reportID: "monthly_quarterly_volume_type",
    reportLabel: "Membership Volume by Membership Type",
    description: "See how your sales volume have differed over the last few membership years",
    artworkLink: "", //Card header image URL
    compareMode: false,
    showByConfig: true,
    dateTime: {
      startDate: {
        unit: "YEAR",
        date: "T-2",
      },
      endDate: {
        unit: "YEAR",
        date: "T",
      },
      dateTimeSelectionFormat: "single_month_multi_year",
      allowDateChange: true,
      timeGroupBy: ["MONTH", "QUARTER"],
      showTimeGroupBy: true,
      defaultGroupBy: "MONTH",
    },
    chartTypes: ["VOLUME"],
    showChartTypes: false,
    defaultChartType: "VOLUME",
    visualizationType: ["DETAILED", "TABLE"],
    showVisualizationType: true,
    defaultVisualizationType: "DETAILED",
    category: { name: "Historical Sales", category_id: 6 },
    tags: ["Multi Year", "Volume"]
  }


  //Current Sales By Membership Type
  // {
  //   reportID: "MONTHLYREVENUESALESBYMEMBERSHIPYTD",
  //   reportLabel: "Monthly Revenue by Membership Type - Year to Date",
  //   description: "See the monthly sales by membership type of your current membership year",
  //   artworkLink: "", //Card header image URL
  //   compareMode: false,
  //   showByConfig: true,
  //   dateTime: {
  //     startDate: {
  //       unit: "YEAR",
  //       date: "T",
  //     },
  //     endDate: {
  //       unit: "YEAR",
  //       date: "T",
  //     },
  //     dateTimeSelectionFormat: "date_range", 
  //     allowDateChange: false,
  //     timeGroupBy: ["MONTH"],
  //     showTimeGroupBy: true,
  //     defaultGroupBy: "MONTH",
  //   },
  //   chartTypes: ["REVENUE", "TABLE"],
  //   showChartTypes: true,
  //   defaultChartType: "REVENUE",
  //   visualizationType: ["DETAILED", "TABLE"],
  //   showVisualizationType: true,
  //   defaultVisualizationType: "DETAILED",
  //   category: {name:"Current Sales By Membership Type", category_id: 5},
  //   tags:["Current Year","Revenue", "Membership Types"]
  // },
  // {
  //   reportID: "QUARTELYREVENUEBYMEMBERSHIPYTD",
  //   reportLabel: "Quarterly Revenue by Membership Type - Year to Date",
  //   description: "See the quarterly sales by membership type of your current membership year",
  //   artworkLink: "", //Card header image URL
  //   compareMode: false,
  //   showByConfig: true,
  //   dateTime: {
  //     startDate: {
  //       unit: "YEAR",
  //       date: "T",
  //     },
  //     endDate: {
  //       unit: "YEAR",
  //       date: "T",
  //     },
  //     dateTimeSelectionFormat: "multi_year", 
  //     allowDateChange: false,
  //     timeGroupBy: ["QUARTER"],
  //     showTimeGroupBy: true,
  //     defaultGroupBy: "QUARTER",
  //   },
  //   chartTypes: ["REVENUE", "TABLE"],
  //   showChartTypes: true,
  //   defaultChartType: "REVENUE",
  //   visualizationType: ["DETAILED", "TABLE"],
  //   showVisualizationType: true,
  //   defaultVisualizationType: "DETAILED",
  //   category: {name:"Current Sales By Membership Type", category_id: 5},
  //   tags:["Current Year","Revenue", "Membership Types"]
  // },
  // {
  //   reportID: "MONTHLYREVENUEBYMEMBERSHIPTYPEYTD",
  //   reportLabel: "Monthly Revenue by Membership Type - Membership Year to Date",
  //   description: "See the monthly sales by membership type of your current membership year",
  //   artworkLink: "", //Card header image URL
  //   compareMode: false,
  //   showByConfig: true,
  //   dateTime: {
  //     startDate: {
  //       unit: "YEAR",
  //       date: "T",
  //     },
  //     endDate: {
  //       unit: "YEAR",
  //       date: "T",
  //     },
  //     dateTimeSelectionFormat: "single_month_multi_year", 
  //     allowDateChange: false,
  //     timeGroupBy: ["MONTH"],
  //     showTimeGroupBy: true,
  //     defaultGroupBy: "MONTH",
  //   },
  //   chartTypes: ["REVENUE", "TABLE"],
  //   showChartTypes: true,
  //   defaultChartType: "REVENUE",
  //   visualizationType: ["DETAILED", "TABLE"],
  //   showVisualizationType: true,
  //   defaultVisualizationType: "DETAILED",
  //   category: {name:"Current Sales By Membership Type", category_id: 5},
  //   tags:["Current Year","Revenue", "Membership Types"]
  // },
  // {
  //   reportID: "MONTHLYVOLUMESALESBYMEMBERSHIPYTD",
  //   reportLabel: "Monthly Memberships Sold by Membership Type Year to Date",
  //   description: "See the monthly sales by membership type of your current membership year",
  //   artworkLink: "", //Card header image URL
  //   compareMode: false,
  //   showByConfig: true,
  //   dateTime: {
  //     startDate: {
  //       unit: "YEAR",
  //       date: "T",
  //     },
  //     endDate: {
  //       unit: "YEAR",
  //       date: "T",
  //     },
  //     dateTimeSelectionFormat: "date_range", 
  //     allowDateChange: false,
  //     timeGroupBy: ["MONTH"],
  //     showTimeGroupBy: true,
  //     defaultGroupBy: "MONTH",
  //   },
  //   chartTypes: ["VOLUME", "TABLE"],
  //   showChartTypes: true,
  //   defaultChartType: "VOLUME",
  //   visualizationType: ["DETAILED", "TABLE"],
  //   showVisualizationType: true,
  //   defaultVisualizationType: "DETAILED",
  //   category: {name:"Current Sales By Membership Type", category_id: 5},
  //   tags:["Current Year","Volume", "Membership Types"]
  // },
  // {
  //   reportID: "QUARTERLYREVENUESALESBYMEMBERSHIPYTD",
  //   reportLabel: "Quarterly Memberships Sold by Membership Type Year to Date",
  //   description: "See the quarterly sales by membership type of your current membership year.",
  //   artworkLink: "", //Card header image URL
  //   compareMode: false,
  //   showByConfig: true,
  //   dateTime: {
  //     startDate: {
  //       unit: "YEAR",
  //       date: "T",
  //     },
  //     endDate: {
  //       unit: "YEAR",
  //       date: "T",
  //     },
  //     dateTimeSelectionFormat: "date_range", 
  //     allowDateChange: false,
  //     timeGroupBy: ["QUARTER"],
  //     showTimeGroupBy: true,
  //     defaultGroupBy: "QUARTER",
  //   },
  //   chartTypes: ["VOLUME", "TABLE"],
  //   showChartTypes: true,
  //   defaultChartType: "VOLUME",
  //   visualizationType: ["DETAILED", "TABLE"],
  //   showVisualizationType: true,
  //   defaultVisualizationType: "DETAILED",
  //   category: {name:"Current Sales By Membership Type", category_id: 5},
  //   tags:["Current Year","Volume", "Membership Types"]
  // },
  // {
  //   reportID: "MONTHLYMEMBERSHIPCURRENTYTD",
  //   reportLabel: "Monthly Memberships Sold by Membership Type - Membership Year to Date",
  //   description: "See the monthly sales by membership type of your current membership year",
  //   artworkLink: "", //Card header image URL
  //   compareMode: false,
  //   showByConfig: true,
  //   dateTime: {
  //     startDate: {
  //       unit: "YEAR",
  //       date: "T",
  //     },
  //     endDate: {
  //       unit: "YEAR",
  //       date: "T",
  //     },
  //     dateTimeSelectionFormat: "single_month_multi_year", 
  //     allowDateChange: true,
  //     timeGroupBy: ["MONTH"],
  //     showTimeGroupBy: true,
  //     defaultGroupBy: "MONTH",
  //   },
  //   chartTypes: ["VOLUME", "TABLE"],
  //   showChartTypes: true,
  //   defaultChartType: "VOLUME",
  //   visualizationType: ["DETAILED", "TABLE"],
  //   showVisualizationType: true,
  //   defaultVisualizationType: "DETAILED",
  //   category: {name:"Current Sales By Membership Type", category_id: 5},
  //   tags:["Membership Year","Volume", "Membership Types"]
  // },
];
export const lightenDarkenColor = (col, amt) => {
  var num = parseInt(col, 16);
  var r = (num >> 16) + amt;
  var b = ((num >> 8) & 0x00FF) + amt;
  var g = (num & 0x0000FF) + amt;
  var newColor = g | (b << 8) | (r << 16);
  return newColor.toString(16);
}
export const hexToHSLColor = (H) => {
  // Convert hex to RGB first
  let r = 0,
    g = 0,
    b = 0;
  if (H.length === 4) {
    r = "0x" + H[1] + H[1];
    g = "0x" + H[2] + H[2];
    b = "0x" + H[3] + H[3];
  } else if (H.length === 7) {
    r = "0x" + H[1] + H[2];
    g = "0x" + H[3] + H[4];
    b = "0x" + H[5] + H[6];
  }
  // Then to HSL
  r /= 255;
  g /= 255;
  b /= 255;
  let cmin = Math.min(r, g, b),
    cmax = Math.max(r, g, b),
    delta = cmax - cmin,
    h = 0,
    s = 0,
    l = 0;

  if (delta === 0) h = 0;
  else if (cmax === r) h = ((g - b) / delta) % 6;
  else if (cmax === g) h = (b - r) / delta + 2;
  else h = (r - g) / delta + 4;

  h = Math.round(h * 60);

  if (h < 0) h += 360;

  l = (cmax + cmin) / 2;
  s = delta === 0 ? 0 : delta / (1 - Math.abs(2 * l - 1));
  s = +(s * 100).toFixed(1);
  l = +(l * 100).toFixed(1);
  return "hsl(" + h + "," + s + "%," + l + "%)";
}

export const themeColorShades = (primaryColor) => {
  const tinyColor = tinycolor(`${primaryColor}`)
  const analogousColors = tinyColor.analogous();
  const complementaryColor = tinyColor.splitcomplement();
  const triad = tinyColor.triad();
  const tetrad = tinyColor.tetrad()
  const colorArray = [...triad, ...complementaryColor, ...analogousColors, ...tetrad].map((color) => {
    return lightenDarkenColor(color.toHex(), 20);
  })
  const filteredColor = [...new Set(colorArray)].filter((color) => color !== primaryColor);
  return filteredColor;
}

export const customColor = (primaryColor, constructedData) => {
  const filteredColor = themeColorShades(primaryColor)
  let indexvalue = 0;
  const constructData = constructedData?.map((data, i) => {
    if (i > filteredColor.length - 1) {
      indexvalue += 1
      if (indexvalue > filteredColor.length - 1)
        indexvalue = 0
    }
    else
      indexvalue = i

    return {
      ...data,
      color: hexToHSLColor(`#${filteredColor[indexvalue]}`),
    }
  })

  return constructData
}

export const calculateDate = (timeConfig, type) => {
  // type - startDate, endDate
  // unit - YEAR, MONTH, QUARTER
  //Supported dateFormula formats:
  // T, T-n
  // T - current time
  // n - number of units
  // T+n => All future dates fall backs to the current date

  if (type === "startDate") {
    const dateFormula = timeConfig.date;
    if (timeConfig.unit === "YEAR") {
      if (dateFormula === "T") {
        //Current year
        return moment().startOf("year")
          .format("DD/MM/YYYY");
      } else if (dateFormula.includes("T-")) {
        // Previous year
        const unit = parseInt(dateFormula.split("T-")[1]);
        return moment(new Date())
          .subtract(unit, "years")
          .startOf("year")
          .format("DD/MM/YYYY");
      } else {
        return moment(new Date())
          .format("DD/MM/YYYY");
      }
    } else if (timeConfig.unit === "MONTH") {
      if (dateFormula === "T") {
        //Current month
        return moment().startOf("month")
          .format("DD/MM/YYYY");
      } else if (dateFormula.includes("T-")) {
        //Previous month
        const unit = parseInt(dateFormula.split("T-")[1]);
        return moment(new Date())
          .subtract(unit, "month")
          .startOf("month")
          .format("DD/MM/YYYY");
      } else {
        return moment(new Date())
          .format("DD/MM/YYYY");
      }
    } else if (timeConfig.unit === "QUARTER") {
      if (dateFormula === "T") {
        //Current Quarter
        return moment().startOf("quarter")
          .format("DD/MM/YYYY");
      } else if (dateFormula.includes("T-")) {
        //Previous Quarter
        const unit = parseInt(dateFormula.split("T-")[1]);
        return moment(new Date())
          .subtract(unit, "quarter")
          .startOf("quarter")
          .format("DD/MM/YYYY");
      } else {
        return moment(new Date())
          .format("DD/MM/YYYY");
      }
    }
  } else if (type === "endDate") {
    const dateFormula = timeConfig.date;
    if (timeConfig.unit === "YEAR") {
      if (dateFormula === "T") {
        //Current year -> This should be today's date
        return moment()
          .format("DD/MM/YYYY");
      } else if (dateFormula.includes("T-")) {
        // Previous year
        const unit = parseInt(dateFormula.split("T-")[1]);
        return moment(new Date())
          .subtract(unit, "years")
          .endOf("year")
          .format("DD/MM/YYYY");
      } else {
        // Next year
        return moment(new Date())
          .format("DD/MM/YYYY");
      }
    } else if (timeConfig.unit === "MONTH") {
      if (dateFormula === "T") {
        //Current month -> This should be today's date
        return moment()
          .format("DD/MM/YYYY");
      } else if (dateFormula.includes("T-")) {
        //Previous month
        const unit = parseInt(dateFormula.split("T-")[1]);
        return moment(new Date())
          .subtract(unit, "month")
          .endOf("month")
          .format("DD/MM/YYYY");
      } else {
        //Next month

        return moment(new Date())
          .format("DD/MM/YYYY");
      }
    } else if (timeConfig.unit === "QUARTER") {
      if (dateFormula === "T") {
        //Current Quarter -> This should be today's date
        return moment()
          .format("DD/MM/YYYY");
      } else if (dateFormula.includes("T-")) {
        //Previous Quarter
        const unit = parseInt(dateFormula.split("T-")[1]);
        return moment(new Date())
          .subtract(unit, "quarter")
          .endOf("quarter")
          .format("DD/MM/YYYY");
      } else {
        return moment(new Date())
          .format("DD/MM/YYYY");
      }
    }
  } else {
    return moment(new Date())
      .format("DD/MM/YYYY");
  }
};
