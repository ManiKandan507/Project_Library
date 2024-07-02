export let offset = 0;
export let limit = 10;
export const PAGE_SIZE = 10;

export const LEGENDS_KEYS = {
    BY_MONTH: ['user'],
    BY_USERS: ['product views'],
    BANDWIDTH: ['bandwidth'],
    FILES: ['Others', 'Image', 'Video', 'PDF'],
  }
export const NO_DATA_FOUND_TEXT = 'No Data Found';
export const CURRENT_PAGE = 0;
export const ACTIVE_USER_DATA_LIMIT = 20;
export const DEFAULT_PRIMARY_COLOR = "#1890ff";

export const HOME_SCREEN = 'home';
export const BANDWIDTH_SCREEN = 'bandwidth';
export const USER_SCREEN = 'user';
export const FILE_SCREEN = 'file';
export const PRODUCT_SCREEN = 'product';

export const DEFAULT_DATE = 'DD/MM/YYYY';

//sales activity
export const VIEW_BY_DAY = "Day";
export const VIEW_BY_MONTH = "Month";
export const VIEW_BY_QUARTER = "Quarter";
export const VIEW_BY_YEAR = "Year";
export const VIEW_BY_ALL = "All";
export const VIEW_BY_FILTERS = {
  [VIEW_BY_DAY]: { disabled: false },
  [VIEW_BY_MONTH]: { disabled: false },
  // [VIEW_BY_QUARTER]: { disabled: false },
  // [VIEW_BY_YEAR]: { disabled: false }
};
export const TABLE_VIEWS = [VIEW_BY_ALL, VIEW_BY_MONTH, VIEW_BY_QUARTER, VIEW_BY_YEAR]



