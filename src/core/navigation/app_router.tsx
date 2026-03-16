import { lazy, Suspense } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { RouteGuard } from './route_guard'
import { ROUTES } from '../constants/routes'
import { AuthLayout } from '../ui/layouts/auth_layout'
import { AdminLayout } from '../ui/layouts/admin_layout'
import { Loader } from '../ui/components/loader'

// Auth pages
const LoginPage = lazy(() => import('../../features/auth/pages/login_page'))
const ForgotPasswordPage = lazy(() => import('../../features/auth/pages/forgot_password_page'))
const ResetOtpPage = lazy(() => import('../../features/auth/pages/reset_otp_page'))
const ResetPasswordPage = lazy(() => import('../../features/auth/pages/reset_password_page'))

// Dashboard
const DashboardPage = lazy(() => import('../../features/dashboard/pages/dashboard_page'))

// Approvals
const ApprovalsProvidersPage = lazy(() => import('../../features/approvals/pages/approvals_providers_page'))
const ApprovalsProviderDetailPage = lazy(() => import('../../features/approvals/pages/approvals_provider_detail_page'))
const ApprovalsLocationsPage = lazy(() => import('../../features/approvals/pages/approvals_locations_page'))
const ApprovalsLocationDetailPage = lazy(() => import('../../features/approvals/pages/approvals_location_detail_page'))
const ApprovalsFacilitiesPage = lazy(() => import('../../features/approvals/pages/approvals_facilities_page'))
const ApprovalsFacilityDetailPage = lazy(() => import('../../features/approvals/pages/approvals_facility_detail_page'))

// Socials
const TeamsListPage = lazy(() => import('../../features/socials/pages/teams_list_page'))
const TeamCreatePage = lazy(() => import('../../features/socials/pages/team_create_page'))
const TeamEditPage = lazy(() => import('../../features/socials/pages/team_edit_page'))
const GamesListPage = lazy(() => import('../../features/socials/pages/games_list_page'))
const GameCreatePage = lazy(() => import('../../features/socials/pages/game_create_page'))
const GameDetailPage = lazy(() => import('../../features/socials/pages/game_detail_page'))
const GameEditPage = lazy(() => import('../../features/socials/pages/game_edit_page'))
const GameReschedulePage = lazy(() => import('../../features/socials/pages/game_reschedule_page'))
const GroupsListPage = lazy(() => import('../../features/socials/pages/groups_list_page'))
const GroupCreatePage = lazy(() => import('../../features/socials/pages/group_create_page'))
const GroupDetailPage = lazy(() => import('../../features/socials/pages/group_detail_page'))
const GroupEditPage = lazy(() => import('../../features/socials/pages/group_edit_page'))

// Bookings
const BookingsListPage = lazy(() => import('../../features/bookings/pages/bookings_list_page'))
const CreateBookingPage = lazy(() => import('../../features/bookings/pages/create_booking_page'))
const BookingDetailPage = lazy(() => import('../../features/bookings/pages/booking_detail_page'))

// Disputes
const DisputesListPage = lazy(() => import('../../features/disputes/pages/disputes_list_page'))
const DisputeCreatePage = lazy(() => import('../../features/disputes/pages/dispute_create_page'))
const DisputeDetailPage = lazy(() => import('../../features/disputes/pages/dispute_detail_page'))

// Accounts
const SettlementsListPage = lazy(() => import('../../features/accounts/pages/settlements_list_page'))
const SettlementDetailPage = lazy(() => import('../../features/accounts/pages/settlement_detail_page'))

// Subscriptions
const PlansListPage = lazy(() => import('../../features/subscriptions/pages/plans_list_page'))
const PlanFormPage = lazy(() => import('../../features/subscriptions/pages/plan_form_page'))
const SubscriptionRequestsPage = lazy(() => import('../../features/subscriptions/pages/subscription_requests_page'))
const CreateSubscriptionRequestPage = lazy(() => import('../../features/subscriptions/pages/create_subscription_request_page'))
const ViewSubscriptionRequestPage = lazy(() => import('../../features/subscriptions/pages/view_subscription_request_page'))

// Notifications
const ComposePage = lazy(() => import('../../features/notifications/pages/compose_page'))
const NotificationsHistoryPage = lazy(() => import('../../features/notifications/pages/history_page'))
const NotificationDetailPage = lazy(() => import('../../features/notifications/pages/notification_detail_page'))

// Reports
const ReportsPage = lazy(() => import('../../features/reports/pages/reports_page'))

// User Management
const UsersListPage = lazy(() => import('../../features/user_management/pages/users_list_page'))
const UserCreatePage = lazy(() => import('../../features/user_management/pages/user_create_page'))
const UserDetailPage = lazy(() => import('../../features/user_management/pages/user_detail_page'))
const UserEditPage = lazy(() => import('../../features/user_management/pages/user_edit_page'))
const RolesListPage = lazy(() => import('../../features/user_management/pages/roles_list_page'))
const RoleFormPage = lazy(() => import('../../features/user_management/pages/role_form_page'))

// Entity Management
const ConsumersListPage = lazy(() => import('../../features/consumers/pages/consumers_list_page'))
const ConsumerDetailPage = lazy(() => import('../../features/consumers/pages/consumer_detail_page'))
const ConsumerEditPage = lazy(() => import('../../features/consumers/pages/consumer_edit_page'))
const ProvidersListPage = lazy(() => import('../../features/providers/pages/providers_list_page'))
const ProviderDetailPage = lazy(() => import('../../features/providers/pages/provider_detail_page'))
const ProviderEditPage = lazy(() => import('../../features/providers/pages/provider_edit_page'))
const EmployeesListPage = lazy(() => import('../../features/employees/pages/employees_list_page'))
const EmployeeDetailPage = lazy(() => import('../../features/employees/pages/employee_detail_page'))
const EmployeeEditPage = lazy(() => import('../../features/employees/pages/employee_edit_page'))
const LocationsListPage = lazy(() => import('../../features/locations/pages/locations_list_page'))
const LocationCreatePage = lazy(() => import('../../features/locations/pages/location_create_page'))
const LocationDetailPage = lazy(() => import('../../features/locations/pages/location_detail_page'))
const LocationEditPage = lazy(() => import('../../features/locations/pages/location_edit_page'))
const FacilitiesListPage = lazy(() => import('../../features/facilities/pages/facilities_list_page'))
const FacilityCreatePage = lazy(() => import('../../features/facilities/pages/facility_create_page'))
const FacilityDetailPage = lazy(() => import('../../features/facilities/pages/facility_detail_page'))
const FacilityEditPage = lazy(() => import('../../features/facilities/pages/facility_edit_page'))

// Profile
const ProfilePage = lazy(() => import('../../features/profile/pages/profile_page'))

// Configurations
const SportsListPage = lazy(() => import('../../features/configurations/pages/sports_list_page'))
const SportFormPage = lazy(() => import('../../features/configurations/pages/sport_form_page'))

// Not Authorized
const NotAuthorizedPage = lazy(() => import('../../features/auth/pages/not_authorized_page'))

const fallback = <Loader />

export function AppRouter() {
  return (
    <Suspense fallback={fallback}>
      <Routes>
        {/* Public auth routes */}
        <Route element={<AuthLayout />}>
          <Route path={ROUTES.LOGIN} element={<LoginPage />} />
          <Route path={ROUTES.FORGOT_PASSWORD} element={<ForgotPasswordPage />} />
          <Route path={ROUTES.RESET_OTP} element={<ResetOtpPage />} />
          <Route path={ROUTES.RESET_PASSWORD} element={<ResetPasswordPage />} />
          <Route path={ROUTES.NOT_AUTHORIZED} element={<NotAuthorizedPage />} />
        </Route>

        {/* Protected admin routes */}
        <Route element={<RouteGuard />}>
          <Route element={<AdminLayout />}>
            {/* Dashboard */}
            <Route path={ROUTES.DASHBOARD} element={<DashboardPage />} />

            {/* Approvals */}
            <Route element={<RouteGuard requiredPermission={['APPROVALS_PROVIDERS', 'VIEW']} />}>
              <Route path={ROUTES.APPROVALS_PROVIDERS} element={<ApprovalsProvidersPage />} />
              <Route path={ROUTES.APPROVALS_PROVIDER_DETAIL} element={<ApprovalsProviderDetailPage />} />
            </Route>

            <Route element={<RouteGuard requiredPermission={['APPROVALS_LOCATIONS', 'VIEW']} />}>
              <Route path={ROUTES.APPROVALS_LOCATIONS} element={<ApprovalsLocationsPage />} />
              <Route path={ROUTES.APPROVALS_LOCATION_DETAIL} element={<ApprovalsLocationDetailPage />} />
            </Route>

            <Route element={<RouteGuard requiredPermission={['APPROVALS_FACILITIES', 'VIEW']} />}>
              <Route path={ROUTES.APPROVALS_FACILITIES} element={<ApprovalsFacilitiesPage />} />
              <Route path={ROUTES.APPROVALS_FACILITY_DETAIL} element={<ApprovalsFacilityDetailPage />} />
            </Route>

            {/* Socials */}
            <Route element={<RouteGuard requiredPermission={['TEAMS', 'VIEW']} />}>
              <Route path={ROUTES.SOCIALS_TEAMS} element={<TeamsListPage />} />
              <Route path={ROUTES.SOCIALS_TEAM_NEW} element={<TeamCreatePage />} />
              <Route path={ROUTES.SOCIALS_TEAM_EDIT} element={<TeamEditPage />} />
            </Route>
            <Route element={<RouteGuard requiredPermission={['GAMES', 'VIEW']} />}>
              <Route path={ROUTES.SOCIALS_GAMES} element={<GamesListPage />} />
              <Route path={ROUTES.SOCIALS_GAME_NEW} element={<GameCreatePage />} />
              <Route path={ROUTES.SOCIALS_GAME_DETAIL} element={<GameDetailPage />} />
              <Route path={ROUTES.SOCIALS_GAME_EDIT} element={<GameEditPage />} />
              <Route path={ROUTES.SOCIALS_GAME_RESCHEDULE} element={<GameReschedulePage />} />
            </Route>
            <Route element={<RouteGuard requiredPermission={['GROUPS', 'VIEW']} />}>
              <Route path={ROUTES.SOCIALS_GROUPS} element={<GroupsListPage />} />
              <Route path={ROUTES.SOCIALS_GROUP_NEW} element={<GroupCreatePage />} />
              <Route path={ROUTES.SOCIALS_GROUP_DETAIL} element={<GroupDetailPage />} />
              <Route path={ROUTES.SOCIALS_GROUP_EDIT} element={<GroupEditPage />} />
            </Route>

            {/* Bookings */}
            <Route element={<RouteGuard requiredPermission={['BOOKINGS', 'VIEW']} />}>
              <Route path={ROUTES.BOOKINGS} element={<BookingsListPage />} />
              <Route path={ROUTES.BOOKING_CREATE} element={<CreateBookingPage />} />
              <Route path={ROUTES.BOOKING_DETAIL} element={<BookingDetailPage />} />
            </Route>

            {/* Disputes */}
            <Route element={<RouteGuard requiredPermission={['DISPUTES', 'VIEW']} />}>
              <Route path={ROUTES.DISPUTES} element={<DisputesListPage />} />
              <Route path={ROUTES.DISPUTE_CREATE} element={<DisputeCreatePage />} />
              <Route path={ROUTES.DISPUTE_DETAIL} element={<DisputeDetailPage />} />
            </Route>

            {/* Accounts */}
            <Route element={<RouteGuard requiredPermission={['SETTLEMENTS', 'VIEW']} />}>
              <Route path={ROUTES.SETTLEMENTS} element={<SettlementsListPage />} />
              <Route path={ROUTES.SETTLEMENT_DETAIL} element={<SettlementDetailPage />} />
            </Route>

            {/* Subscriptions */}
            <Route element={<RouteGuard requiredPermission={['SUBSCRIPTIONS_PLANS', 'VIEW']} />}>
              <Route path={ROUTES.SUBSCRIPTION_PLANS} element={<PlansListPage />} />
              <Route path={ROUTES.SUBSCRIPTION_PLAN_NEW} element={<PlanFormPage />} />
              <Route path={ROUTES.SUBSCRIPTION_PLAN_EDIT} element={<PlanFormPage />} />
            </Route>
            <Route element={<RouteGuard requiredPermission={['SUBSCRIPTIONS_REQUESTS', 'VIEW']} />}>
              <Route path={ROUTES.SUBSCRIPTION_REQUESTS} element={<SubscriptionRequestsPage />} />
              <Route path={ROUTES.SUBSCRIPTION_REQUESTS_VIEW} element={<ViewSubscriptionRequestPage />} />
            </Route>
            <Route element={<RouteGuard requiredPermission={['SUBSCRIPTIONS_REQUESTS', 'CREATE']} />}>
              <Route path={ROUTES.SUBSCRIPTION_REQUESTS_CREATE} element={<CreateSubscriptionRequestPage />} />
            </Route>

            {/* Notifications */}
            <Route element={<RouteGuard requiredPermission={['NOTIFICATIONS', 'COMPOSE']} />}>
              <Route path={ROUTES.NOTIFICATIONS_COMPOSE} element={<ComposePage />} />
            </Route>
            <Route element={<RouteGuard requiredPermission={['NOTIFICATIONS', 'VIEW_HISTORY']} />}>
              <Route path={ROUTES.NOTIFICATIONS_HISTORY} element={<NotificationsHistoryPage />} />
              <Route path={ROUTES.NOTIFICATION_DETAIL} element={<NotificationDetailPage />} />
            </Route>

            {/* Reports */}
            <Route element={<RouteGuard requiredPermission={['REPORTS', 'VIEW']} />}>
              <Route path={ROUTES.REPORTS} element={<ReportsPage />} />
            </Route>

            {/* User Management */}
            <Route element={<RouteGuard requiredPermission={['USERS', 'VIEW']} />}>
              <Route path={ROUTES.USERS} element={<UsersListPage />} />
              <Route path={ROUTES.USER_DETAIL} element={<UserDetailPage />} />
            </Route>
            <Route element={<RouteGuard requiredPermission={['USERS', 'UPDATE']} />}>
              <Route path={ROUTES.USER_NEW} element={<UserCreatePage />} />
              <Route path={ROUTES.USER_EDIT} element={<UserEditPage />} />
            </Route>
            <Route element={<RouteGuard requiredPermission={['ROLES', 'VIEW']} />}>
              <Route path={ROUTES.ROLES} element={<RolesListPage />} />
            </Route>
            <Route element={<RouteGuard requiredPermission={['ROLES', 'UPDATE']} />}>
              <Route path={ROUTES.ROLE_NEW} element={<RoleFormPage />} />
              <Route path={ROUTES.ROLE_EDIT} element={<RoleFormPage />} />
            </Route>

            {/* Entity Management */}
            <Route element={<RouteGuard requiredPermission={['CONSUMERS', 'VIEW']} />}>
              <Route path={ROUTES.CONSUMERS} element={<ConsumersListPage />} />
              <Route path={ROUTES.CONSUMER_DETAIL} element={<ConsumerDetailPage />} />
              <Route path={ROUTES.CONSUMER_EDIT} element={<ConsumerEditPage />} />
            </Route>
            <Route element={<RouteGuard requiredPermission={['PROVIDERS', 'VIEW']} />}>
              <Route path={ROUTES.PROVIDERS} element={<ProvidersListPage />} />
              <Route path={ROUTES.PROVIDER_DETAIL} element={<ProviderDetailPage />} />
              <Route path={ROUTES.PROVIDER_EDIT} element={<ProviderEditPage />} />
            </Route>
            <Route element={<RouteGuard requiredPermission={['EMPLOYEES', 'VIEW']} />}>
              <Route path={ROUTES.EMPLOYEES} element={<EmployeesListPage />} />
              <Route path={ROUTES.EMPLOYEE_DETAIL} element={<EmployeeDetailPage />} />
              <Route path={ROUTES.EMPLOYEE_EDIT} element={<EmployeeEditPage />} />
            </Route>
            <Route element={<RouteGuard requiredPermission={['LOCATIONS', 'VIEW']} />}>
              <Route path={ROUTES.LOCATIONS} element={<LocationsListPage />} />
              <Route path={ROUTES.LOCATION_NEW} element={<LocationCreatePage />} />
              <Route path={ROUTES.LOCATION_DETAIL} element={<LocationDetailPage />} />
              <Route path={ROUTES.LOCATION_EDIT} element={<LocationEditPage />} />
            </Route>
            <Route element={<RouteGuard requiredPermission={['FACILITIES', 'VIEW']} />}>
              <Route path={ROUTES.FACILITIES} element={<FacilitiesListPage />} />
              <Route path={ROUTES.FACILITY_NEW} element={<FacilityCreatePage />} />
              <Route path={ROUTES.FACILITY_DETAIL} element={<FacilityDetailPage />} />
              <Route path={ROUTES.FACILITY_EDIT} element={<FacilityEditPage />} />
            </Route>

            {/* Configurations */}
            <Route element={<RouteGuard requiredPermission={['CONFIGURATIONS_SPORTS', 'VIEW']} />}>
              <Route path={ROUTES.CONFIGURATIONS_SPORTS} element={<SportsListPage />} />
            </Route>
            <Route element={<RouteGuard requiredPermission={['CONFIGURATIONS_SPORTS', 'CREATE']} />}>
              <Route path={ROUTES.CONFIGURATIONS_SPORT_NEW} element={<SportFormPage />} />
            </Route>
            <Route element={<RouteGuard requiredPermission={['CONFIGURATIONS_SPORTS', 'UPDATE']} />}>
              <Route path={ROUTES.CONFIGURATIONS_SPORT_EDIT} element={<SportFormPage />} />
            </Route>

            {/* Profile */}
            <Route path={ROUTES.PROFILE} element={<ProfilePage />} />
          </Route>
        </Route>

        {/* Fallback */}
        <Route path="*" element={<Navigate to={ROUTES.DASHBOARD} replace />} />
      </Routes>
    </Suspense>
  )
}
