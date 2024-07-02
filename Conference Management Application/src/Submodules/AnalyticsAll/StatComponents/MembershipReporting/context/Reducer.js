export default (state, action) => {
    switch (action.type) {
        case 'SET_GROUPS':
            return {
                ...state,
                membersGroup: action.payload,
                selectedMemberGroups: action.payload,
                selectedSalesGroups: action.payload,
                selectedLocationGroups: action.payload,
                selectedTrendGroups: action.payload
            };

        case 'SET_SELECTED_MEMBER_GROUPS':
            return {
                ...state,
                membersGroup: action.payload,
            };

        case 'SET_OPTIONS':
            return {
                ...state,
                selectedOptions: action.payload,
            }

        case 'SET_DATES':
            return {
                ...state,
                selectedDates: action.payload
            }

        case 'DEFAULT_DATES':
            return {
                ...state,
                defaultDates: action.payload
            }

        case 'LOADING':
            return {
                ...state,
                loading: action.payload
            }
        case 'HAS_COMPARE':
            return {
                ...state,
                hasCompare: action.payload
            }
        case 'IS_GROUPS':
            return {
                ...state,
                isGroups: action.payload
            }

        case 'MULTI_YEAR_DATES':
            return {
                ...state,
                multiYearDates: action.payload
            }

        case 'IS_PICKER_OPEN':
            return {
                ...state,
                isDatePickerOpen: action.payload
            }

        case 'IS_TOUCHED':
            return {
                ...state,
                isTouched: action.payload
            }

        case 'MULTI_YEAR':
            return {
                ...state,
                multiYear: action.payload
            }

        case 'DATE_ERROR':
            return {
                ...state,
                dateRangeError: action.payload
            }
        case 'VIEW_BY':
            return {
                ...state,
                viewBy: action.payload
            }
        case 'PRIMARY_COLOR':
            return {
                ...state,
                primaryColor: action.payload
            }
        case 'SET_SALES_DATES': {
            return {
                ...state,
                salesSelectedDates: action.payload
            }
        }
        case 'DEMOGRAPHICS_CONFIG':
            return {
                ...state,
                demographicsConfig: action.payload
            }
        case 'CUSTOM_FIELD_DATA':
            return {
                ...state,
                customFieldDatas: action.payload
            }

        default: return state;
    }
} 