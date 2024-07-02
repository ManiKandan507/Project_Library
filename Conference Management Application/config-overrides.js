const path = require('path');
const { override, addWebpackAlias } = require('customize-cra');

module.exports = override(
  addWebpackAlias({
    ['@/AnalyticsAll']: path.resolve(__dirname, './src/Submodules/AnalyticsAll'),
    ['@/MembershipReporting']: path.resolve(__dirname, './src/Submodules/MembershipReporting'),
    ['@/CorporateMembershipReporting']: path.resolve(__dirname, './src/Submodules/CorporateMembershipReporting'),
    ['@/DirectoryAdmin']: path.resolve(__dirname, './src/Submodules/DirectoryAdmin'),
    ['@/MapMarker']: path.resolve(__dirname, './src/Submodules/MapMarker'),
    ['@/ECommerceAnalytics']: path.resolve(__dirname, './src/Submodules/ECommerceAnalytics'),
    ['@/ECommerceProductsFromCSV']: path.resolve(__dirname, './src/Submodules/ECommerceProductsFromCSV'),
    ['@/JoinMailingList']: path.resolve(__dirname, './src/Submodules/JoinMailingList'),
    ['@/Notifications']: path.resolve(__dirname, './src/Submodules/Notifications'),
    ['@/SyncECommerceProducts']: path.resolve(__dirname, './src/Submodules/Notifications'),
    ['@/WizardConfToEcommerce']: path.resolve(__dirname, './src/Submodules/WizardConfToEcommerce'),
    ['@/MembershipReportingV2']: path.resolve(__dirname, './src/Submodules/AnalyticsAll/StatComponents/MembershipReporting'),
    ['@/CorporateMembershipReportingV2']: path.resolve(__dirname, './src/Submodules/AnalyticsAll/StatComponents/CorporateMembershipReporting'),
    ['@/DonationAdminReporting']: path.resolve(__dirname, './src/Submodules/AnalyticsAll/StatComponents/DonationAdminReporting'),
    ['@/EventSystemConfig']: path.resolve(__dirname, "./src/Submodules/EventSystemConfig")
  })
);
