import { createApi } from '@reduxjs/toolkit/query/react'
import { baseQueryWithReauth } from './base_query'

export const apiSlice = createApi({
  reducerPath: 'api',
  baseQuery: baseQueryWithReauth,
  keepUnusedDataFor: 0, // Disable caching - always refetch data on component mount
  refetchOnMountOrArgChange: true, // Always refetch when component mounts
  tagTypes: [
    'Providers',
    'Locations',
    'Facilities',
    'Bookings',
    'Disputes',
    'Settlements',
    'Users',
    'Roles',
    'Consumers',
    'Employees',
    'SubscriptionPlans',
    'ProviderSubscriptions',
    'SubscriptionRequests',
    'Notifications',
    'Reports',
    'Dashboard',
    'AuditLogs',
    'Profile',
    'Teams',
    'Games',
    'Groups',
    'Sports',
  ],
  endpoints: () => ({}),
})
