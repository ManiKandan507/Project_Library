export default (state, action) => {
    switch(action.type){
        case 'SET_GROUPS':
            return{
                ...state,
                membersGroup: action.payload,
                selectedMemberGroups: action.payload,
                selectedSalesGroups: action.payload,
                selectedLocationGroups:action.payload,
                selectedTrendGroups:action.payload
            };

        case 'SET_SELECTED_MEMBER_GROUPS':
            return{
                ...state,
                membersGroup: action.payload,
            };

        case 'SET_OPTIONS':
            return {
                ...state,
                selectedOptions:action.payload,
            }

        case 'SET_DATES':
            return {
                ...state,
                selectedDates:action.payload
            }

        case 'DEFAULT_DATES':
            return {
                ...state,
                defaultDates:action.payload
            }

        case 'LOADING':
            return {
                ...state,
                loading:action.payload
            }

        default: return state;
    }
} 