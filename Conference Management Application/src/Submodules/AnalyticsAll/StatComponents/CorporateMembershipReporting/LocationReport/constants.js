export const SALES_BY_VOLUME = "1";
export const SALES_BY_REVENUE = "2";
export const NO_DATA_FOUND_TEXT = 'No Data Found';
export const PAGE_SIZE = 5;

export const CURRENT_MEMBERS_SCREEN = 'current_members';
export const EXPIRED_MEMBERS_SCREEN = 'expired_members';
export const NEW_MEMBERS_SCREEN = 'new_members';
export const RENEWING_MEMBERS_SCREEN = 'renewing_members';
export const SALES_ACTIVITY_SCREEN = 'sales_activity';
export const LOCATION_REPORT_SCREEN = 'location_report';
export const TREND_SCREEN = 'trends';

export const DEFAULT_DATE = 'DD/MM/YYYY';

//trend
export const GROUP_NAME = 'groupname'
export const COUNT_AT_BEGINING = 'countatbeginning';
export const MEMBERS_ON_ENDDATE = 'membersonenddate';
export const NEW_MEMBERS = 'newmembers';
export const TRANSITIONED_INTO = 'transitionedinto';
export const NO_CHANGE = 'nochange';
export const EXPIRED = 'expired';
export const TRANSITIONED_OUT = 'transitionedout';
export const EXIT_SOCIETY = 'exitsociety'

//sales activity
export const SALES_GROUP_NAME = "GroupName";
export const SALES_GROUP_ID = "GroupID";
export const SALES_NEW_MEMBERS = "NewMembers";
export const SALES_NEW_MEMBERS_UUIDS = "NewMemberUUIDs";
export const SALES_NEW_MEMBERS_REVENUE = "NewMembersRevenue";
export const RENEWING_MEMBERS = "RenewingMembers";
export const RENEWING_MEMBERS_UUIDS = "RenewMemberUUIDs"
export const RENEWING_MEMBERS_REVENUE = "RenewingMembersRevenue";
export const TOTAL_INVOICES = "TotalInvoices";
export const TOTAL_INVOICES_UUIDS = "MembersUUIDs"
export const TOTAL_REVENUE = "TotalRevenue";
export const VIEW_BY_DAY = "Day";
export const VIEW_BY_MONTH = "Month";
export const VIEW_BY_QUARTER = "Quarter";
export const VIEW_BY_YEAR = "Year";
export const VIEW_BY_ALL = "All";
export const VIEW_BY_FILTERS = {
  [VIEW_BY_DAY]: { disabled: false },
  [VIEW_BY_MONTH]: { disabled: false },
  [VIEW_BY_QUARTER]: { disabled: false },
  [VIEW_BY_YEAR]: { disabled: false }
};
export const TABLE_VIEWS = [VIEW_BY_ALL, VIEW_BY_MONTH, VIEW_BY_QUARTER, VIEW_BY_YEAR]

//Location 
export const LOCATION_MODAL = 'LOCATION_MODAL'
export const MAP_VIEW = "1"
export const TABLE_VIEW = "2" 
export const USA_STATE_LIST = ["WV","VT","CT","DE","NY","RI","NH","NJ","ME","MD","MA","PA","DC","IA","ND","SD","NE","OH","IL","IN","KS","KY","MI","MN","MO","WI", "LA","MS","NC","SC","TN","AR","FL","VA","PR","VI","GA","AL", "TX", "AZ", "OK", "NM", "MT","UT","CA","WA","AK","ID","WY","AS","OR","MP","HI","UM","NV","CO","GU"]
export const CANADA_STATE_LIST = ["BC", "AB", "SK", "MB",'ON', 'QC', 'NB', 'PE', 'NS', 'NL','YT', 'NT', 'NU']
export const USA_REGIONS_LIST = {
  // "Northeast": ["CT", 'ME', 'MA', "NH", "RI", "VT", "NJ", 'NY', 'PA'],
  // "Midwest": ['IL', 'IN', 'MI', 'OH', 'WI', 'IA', 'KS', 'MN', 'MO', 'NE', 'ND', 'SD'],
  // "South": ['DE', 'FL', 'GA', 'MD', 'NC', 'SC', 'AL', 'KY', 'MS', 'TN', 'VA', 'WV', 'AR', 'LA', 'OK', 'TX'],
  // "West": ['AZ', 'CO', 'ID', 'MT', 'NV', 'NM', 'UT', 'WY', 'AK', 'CA', 'HI', 'OR', 'WA']
  Northeast: ["WV","VT","CT","DE","NY","RI","NH","NJ","ME","MD","MA","PA","DC"],
  Midwest: ["IA","ND","SD","NE","OH","IL","IN","KS","KY","MI","MN","MO","WI"],
  Southeast: ["LA","MS","NC","SC","TN","AR","FL","VA","PR","VI","GA","AL"],
  Southwest: ["TX", "AZ", "OK", "NM"],
  West: ["MT","UT","CA","WA","AK","ID","WY","AS","OR","MP","HI","UM","NV","CO","GU"],
};
export const CANADA_REGIONS_LIST = {
  "Western Canada": ["BC", "AB", "SK", "MB"],
  "Eastern Canada": ['ON', 'QC', 'NB', 'PE', 'NS', 'NL'],
  "Northern Canada": ['YT', 'NT', 'NU']
}
export const CONTINENTS_BASED_COUNTRIES = {
  "Africa": ["Republic of Côte d'Ivoire", "Côte d'Ivoire", "Algeria", "Angola", "Benin", "Botswana", "Burkina Faso", "Burundi", "Cape Verde", "Cameroon", "Central African Republic", "Chad", "Comoros", "Congo", "Democratic Republic of the Congo", "Djibouti", "Egypt", "Equatorial Guinea", "Eritrea", "Eswatini", "Ethiopia", "Gabon", "Gambia", "Ghana", "Guinea", "Guinea-Bissau", "Ivory Coast", "Kenya", "Lesotho", "Liberia", "Libya", "Madagascar", "Malawi", "Mali", "Mauritania", "Mauritius", "Morocco", "Mozambique", "Namibia", "Niger", "Nigeria", "Rwanda", "Sao Tome and Principe", "Senegal", "Seychelles", "Sierra Leone", "Somalia", "South Africa", "South Sudan", "Sudan", "Tanzania", "Togo", "Tunisia", "Uganda", "Zambia", "Zimbabwe", "Canary Islands", "Ceuta", "French Southern and Antarctic Lands", "Madeira", "Mayotte", "Melilla", "Pelagie Islands", "Plazas de Soberania", "Reunion", "Saint Helena, Ascension and Tristan da Cunha", "Socotra Archipelago"],
  "Asia": ["Afghanistan", "Armenia", "Azerbaijan", "Bahrain", "Bangladesh", "Bhutan", "British Indian Ocean Territory", "Brunei", "Cambodia", "China", "Cyprus", "Egypt", "Georgia", "Hong Kong", "India", "Indonesia", "Iran", "Iraq", "Israel", "Japan", "Jordan", "Kazakhstan", "Kuwait", "Kyrgyzstan", "Laos", "Lebanon", "Macau", "Malaysia", "Maldives", "Mongolia", "Myanmar", "Nepal", "North Korea", "Oman", "Pakistan", "Palestine", "Philippines", "Qatar", "Russia", "Saudi Arabia", "Singapore", "South Korea", "Sri Lanka", "Syria", "Taiwan", "Tajikistan", "Thailand", "Timor-Leste/East Timor", "Turkey", "Turkmenistan", "United Arab Emirates", "Uzbekistan", "Vietnam", "Yemen"],
  "Europe": ["Czech Republic", "Albania", "Andorra", "Armenia", "Austria", "Azerbaijan", "Belarus", "Belgium", "Bosnia and Herzegovina", "Bulgaria", "Croatia", "Cyprus", "Czechia", "Denmark", "Estonia", "Finland", "France", "Georgia", "Germany", "Greece", "Hungary", "Iceland", "Ireland", "Italy", "Kazakhstan", "Latvia", "Liechtenstein", "Lithuania", "Luxembourg", "Malta", "Moldova", "Monaco", "Montenegro", "Netherlands", "North Macedonia", "Norway", "Poland", "Portugal", "Romania", "Russia", "San Marino", "Serbia", "Slovakia", "Slovenia", "Spain", "Sweden", "Switzerland", "Turkey", "Ukraine", "United Kingdom", "Vatican City", "Åland", "Channel Islands", "Faroe Islands", "Gibraltar", "Guernsey", "Isle of Man", "Jersey", "Kosovo", "Northern Cyprus", "Northern Ireland", "Svalbard"],
  "North America": ["United States","Antigua and Barbuda", "Bahamas", "Barbados", "Belize", "Canada", "Costa Rica", "Cuba", "Dominica", "Dominican Republic", "El Salvador", "Grenada", "Guatemala", "Haiti", "Honduras", "Jamaica", "Mexico", "Nicaragua", "Panama", "Saint Kitts and Nevis", "Saint Lucia", "Saint Vincent and the Grenadines", "Trinidad and Tobago", "United States of America", "Anguilla", "Aruba", "Bermuda", "Bonaire", "British Virgin Islands", "Cayman Islands", "Clipperton Island", "Curaçao", "Greenland", "Guadeloupe", "Martinique", "Montserrat", "Navassa Island", "Puerto Rico", "Saba", "Saint Barthélemy", "Saint Martin", "Saint Pierre and Miquelon", "Sint Eustatius", "Sint Maarten", "Turks and Caicos", "US Virgin Islands",],
  "Australia": ["Australia", "Fiji", "Kiribati", "Marshall Islands", "Micronesia", "Nauru", "New Zealand", "Palau", "Papua New Guinea", "Samoa", "Solomon Islands", "Tonga", "Tuvalu", "Vanuatu", "American Samoa", "Ashmore and Cartier Islands", "Baker Island", "Cook Islands", "Coral Sea Islands", "Easter Island", "French Polynesia", "Galapagos Islands", "Guam", "Howland Island", "Jarvis Island", "Johnston Atoll", "Kingman Reef", "Midway Atoll", "New Caledonia", "Niue", "Norfolk Island", "Northern Mariana Islands", "Palmyra Atoll", "Papua", "Pitcairn Islands", "San Andrés and Providencia", "Tokelau", "Wake Island", "Wallis and Futuna", "West Papua"],
  "South America": ["Argentina", "Bolivia", "Brazil", "Chile", "Colombia", "Ecuador", "Guyana", "Paraguay", "Peru", "Suriname", "Uruguay", "Venezuela", "Bouvet Island", "Falkland Islands", "French Guinea", "Nueva Esparta", "South Georgia and the South Sandwich Islands"]
}
export const USA_STATE_ABBEREVATION_LIST = {
  "AL": "Alabama", "AK": "Alaska","AS": "American Samoa","AZ": "Arizona", "AR": "Arkansas", "CA": "California","CO": "Colorado", "CT": "Connecticut", "DE": "Delaware", "DC": "District Of Columbia","FM": "Federated States Of Micronesia",
  "FL": "Florida", "GA": "Georgia", "GU": "Guam","HI": "Hawaii","ID": "Idaho", "IL": "Illinois", "IN": "Indiana", "IA": "Iowa","KS": "Kansas", "KY": "Kentucky", "LA": "Louisiana", "ME": "Maine","MH": "Marshall Islands", "MD": "Maryland","MA": "Massachusetts","MI": "Michigan","MN": "Minnesota", "MS": "Mississippi","MO": "Missouri","MT": "Montana", "NE": "Nebraska", "NV": "Nevada","NH": "New Hampshire","NJ": "New Jersey","NM": "New Mexico","NY": "New York", "NC": "North Carolina","ND": "North Dakota","MP": "Northern Mariana Islands", "OH": "Ohio","OK": "Oklahoma","OR": "Oregon", "PW": "Palau","PA": "Pennsylvania","PR": "Puerto Rico","RI": "Rhode Island","SC": "South Carolina","SD": "South Dakota", "TN": "Tennessee", "TX": "Texas", "UT": "Utah","VT": "Vermont","VI": "Virgin Islands","VA": "Virginia","WA": "Washington", "WV": "West Virginia", "WI": "Wisconsin", "WY": "Wyoming"
};
export const CANADA_STATE_ABBEREVATION_LIST = {
  "AB" : "Alberta", "BC":"British Columbia"  , "MB":"Manitoba", "NB":"New Brunswick","NL" : "Newfoundland and Labrador", "NT" : "Northwest Territories", "NS" : "Nova Scotia" , "NU": "Nunavut", "ON":"Ontario", "PE":"Prince Edward Island", "QC":"Quebec", "SK":"Saskatchewan", "YT":"Yukon"
}
export const COUNTRY_VIEW = "COUNTRY_VIEW";
export const STATE_VIEW = "STATE_VIEW";
export const CONTINENT_VIEW = "CONTINENT_VIEW";
export const USA_VIEW = "USA";
export const CANADA_VIEW = "CANADA";
export const REGION_VIEW = "REGION_VIEW";
export const PRIMARY_LOCATION_VIEWS = [
  { value: USA_VIEW, label: 'USA' },
  { value: CANADA_VIEW, label: 'Canada' },
  { value: CONTINENT_VIEW, label: 'Continent' },
  { value: COUNTRY_VIEW, label: 'Country' },
]
export const SECONDARY_LOCATION_VIEWS = [
  { value: STATE_VIEW, label: 'State' },
  { value: REGION_VIEW, label: 'Region' }
]
export const USA_API_KEY = "United States";
export const CANADA_API_KEY = "Canada";
export const LOCATION_FILE_NAMES = {
  [COUNTRY_VIEW]: 'location(country)',
  [CONTINENT_VIEW]: 'location(continent)',
  [`${USA_VIEW}_${STATE_VIEW}`]: 'location(usa-states)',
  [`${USA_VIEW}_${REGION_VIEW}`]: 'location(usa-regions)',
  [`${CANADA_VIEW}_${STATE_VIEW}`]: 'location(canada-states)',
  [`${CANADA_VIEW}_${REGION_VIEW}`]: 'location(canada-regions)'
}
export const LOCATION_INITIAL_STATE = {
  [COUNTRY_VIEW]: [],
  [CONTINENT_VIEW]: [],
  [`${USA_VIEW}_${STATE_VIEW}`]: [],
  [`${USA_VIEW}_${REGION_VIEW}`]: [],
  [`${CANADA_VIEW}_${STATE_VIEW}`]: [],
  [`${CANADA_VIEW}_${REGION_VIEW}`]: [],
  [LOCATION_MODAL]: [],
}

export const HASH_DATA = {
  [CURRENT_MEMBERS_SCREEN]: "Current Members",
  [EXPIRED_MEMBERS_SCREEN]: "Expired Members",
  [NEW_MEMBERS_SCREEN]: "New Members",
  [RENEWING_MEMBERS_SCREEN]: "Renewing Members",
  [SALES_ACTIVITY_SCREEN]: "Sales Activity",
  [TREND_SCREEN]: "Trends",
  [LOCATION_REPORT_SCREEN]: "Location",

  [GROUP_NAME]: "Group Name",
  [COUNT_AT_BEGINING]: "Count at Beginning",
  [MEMBERS_ON_ENDDATE]: "Members as of End Date",
  [NEW_MEMBERS]: "New Members",
  [TRANSITIONED_INTO]: "Transitioned Into",
  [NO_CHANGE]: "No Change",
  [EXPIRED]: "Membership Expired",
  [TRANSITIONED_OUT]: "Transitioned Out",
  [EXIT_SOCIETY]: "Exit Society",

  [SALES_GROUP_NAME]: "Member Type",
  [SALES_NEW_MEMBERS]: "New",
  [SALES_NEW_MEMBERS_UUIDS]: "New",
  [SALES_NEW_MEMBERS_REVENUE]: "New Revenue",
  [RENEWING_MEMBERS_UUIDS]: "Renewing",
  [RENEWING_MEMBERS]: "Renewing",
  [RENEWING_MEMBERS_REVENUE]: "Renewing Revenue",
  [TOTAL_INVOICES]: "Total",
  [TOTAL_INVOICES_UUIDS]: "Total",
  [TOTAL_REVENUE]: "Total Revenue",
};




