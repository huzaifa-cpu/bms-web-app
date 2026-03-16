export const ROUTES = {
  LOGIN: '/login',
  FORGOT_PASSWORD: '/forgot-password',
  RESET_OTP: '/reset-otp',
  RESET_PASSWORD: '/reset-password',
  NOT_AUTHORIZED: '/not-authorized',
  DASHBOARD: '/',

  // Approvals
  APPROVALS_PROVIDERS: '/approvals/providers',
  APPROVALS_PROVIDER_DETAIL: '/approvals/providers/:providerId',
  APPROVALS_LOCATIONS: '/approvals/locations',
  APPROVALS_LOCATION_DETAIL: '/approvals/locations/:locationId',
  APPROVALS_FACILITIES: '/approvals/facilities',
  APPROVALS_FACILITY_DETAIL: '/approvals/facilities/:facilityId',

  // Socials
  SOCIALS_TEAMS: '/socials/teams',
  SOCIALS_TEAM_NEW: '/socials/teams/new',
  SOCIALS_TEAM_EDIT: '/socials/teams/:teamId/edit',
  SOCIALS_GAMES: '/socials/games',
  SOCIALS_GAME_NEW: '/socials/games/new',
  SOCIALS_GAME_DETAIL: '/socials/games/:gameId',
  SOCIALS_GAME_EDIT: '/socials/games/:gameId/edit',
  SOCIALS_GAME_RESCHEDULE: '/socials/games/:gameId/reschedule',
  SOCIALS_GROUPS: '/socials/groups',
  SOCIALS_GROUP_NEW: '/socials/groups/new',
  SOCIALS_GROUP_DETAIL: '/socials/groups/:groupId',
  SOCIALS_GROUP_EDIT: '/socials/groups/:groupId/edit',

  // Bookings
  BOOKINGS: '/bookings',
  BOOKING_CREATE: '/bookings/create',
  BOOKING_DETAIL: '/bookings/:bookingId',

  // Disputes
  DISPUTES: '/disputes',
  DISPUTE_CREATE: '/disputes/create',
  DISPUTE_DETAIL: '/disputes/:disputeId',

  // Accounts
  SETTLEMENTS: '/accounts/settlements',
  SETTLEMENT_DETAIL: '/accounts/settlements/:settlementId',
  REFUNDS: '/accounts/refunds',

  // Subscriptions
  SUBSCRIPTION_PLANS: '/subscriptions/plans',
  SUBSCRIPTION_PLAN_NEW: '/subscriptions/plans/new',
  SUBSCRIPTION_PLAN_EDIT: '/subscriptions/plans/:planId/edit',
  SUBSCRIPTION_REQUESTS: '/subscriptions/requests',
  SUBSCRIPTION_REQUESTS_CREATE: '/subscriptions/requests/create',
  SUBSCRIPTION_REQUESTS_VIEW: '/subscriptions/requests/:id',

  // Notifications
  NOTIFICATIONS_COMPOSE: '/notifications/compose',
  NOTIFICATIONS_HISTORY: '/notifications/history',
  NOTIFICATION_DETAIL: '/notifications/history/:notificationId',

  // Reports
  REPORTS: '/reports',

  // User Management
  USERS: '/users',
  USER_NEW: '/users/new',
  USER_DETAIL: '/users/:userId',
  USER_EDIT: '/users/:userId/edit',
  ROLES: '/roles',
  ROLE_NEW: '/roles/new',
  ROLE_EDIT: '/roles/:roleId/edit',

  // Entity Management
  CONSUMERS: '/consumers',
  CONSUMER_DETAIL: '/consumers/:consumerId',
  CONSUMER_EDIT: '/consumers/:consumerId/edit',
  PROVIDERS: '/providers',
  PROVIDER_DETAIL: '/providers/:providerId',
  PROVIDER_EDIT: '/providers/:providerId/edit',
  EMPLOYEES: '/employees',
  EMPLOYEE_DETAIL: '/employees/:employeeId',
  EMPLOYEE_EDIT: '/employees/:employeeId/edit',
  LOCATIONS: '/locations',
  LOCATION_NEW: '/locations/create',
  LOCATION_DETAIL: '/locations/:locationId',
  LOCATION_EDIT: '/locations/:locationId/edit',
  FACILITIES: '/facilities',
  FACILITY_NEW: '/facilities/create',
  FACILITY_DETAIL: '/facilities/:facilityId',
  FACILITY_EDIT: '/facilities/:facilityId/edit',

  // Profile
  PROFILE: '/profile',

  // Configurations
  CONFIGURATIONS_SPORTS: '/configurations/sports',
  CONFIGURATIONS_SPORT_NEW: '/configurations/sports/new',
  CONFIGURATIONS_SPORT_EDIT: '/configurations/sports/:sportId/edit',
} as const
