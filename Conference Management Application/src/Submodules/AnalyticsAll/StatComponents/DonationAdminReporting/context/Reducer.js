export default (state, action) => {
    switch (action.type) {
        case 'CATEGORY_IDS':
            return {
                ...state,
                donationCategory: action.payload
            }

        case 'DONATION_TYPES':
            return {
                ...state,
                donationTypes: action.payload
            }

        case 'SET_SELECTED_CATEGORY_IDS':
            return {
                ...state,
                donationTypes: action.payload
            }

        case 'SET_FILTERED_CATEGORY':
            return {
                ...state,
                filteredCategory: action.payload
            }

        case 'SET_DONATION_CATEGORY_DATA':
            return {
                ...state,
                donationCategoryData: action.payload
            }

        case 'SELECTED_DONATION':
            return {
                ...state,
                selectedDonation: action.payload
            }

        case 'ORDER_CATEGORY':
            return {
                ...state,
                orderCategory: action.payload
            }

        case 'SHOW_CATEGORY_FILTER':
            return {
                ...state,
                showCategoryFilter: action.payload
            }

        case 'SET_SHOW_MORE':
            return {
                ...state,
                showMore: action.payload
            }

        case 'STATIC_CONFIG':
            return {
                ...state,
                config: {
                    appDir: action.payload.appDir,
                    options: {
                        method: 'GET',
                        headers: {
                            'Authorization': action.payload.Authorization,
                            'Cookie': action.payload.Cookie
                        }
                    },
                    primaryColor: action.payload.primary_color
                }
            }
    }
}