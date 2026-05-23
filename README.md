# WheelGo Frontend

WheelGo is a multi-tenant car rental platform created for the **Distributed Systems 2025/26** class. This repository contains the frontend part of the project. The frontend was built as a separate client application that communicates with the backend only through HTTP REST API calls.

The main frontend responsibility was to provide the user interface for tenants, customers, tenant admins, and super admins. It handles authentication, protected routing, tenant-specific navigation, booking workflows, payments, profile management, support tickets, reviews, and administration screens.

## How The Project Was Created

The project was created as a React single page application using Vite.

1. A new Vite React application was generated inside the `my-app` folder.
2. React Router was added for client-side routing.
3. Axios was added for communication with the backend REST API.
4. Context API was added for global authentication state and tenant settings.
5. The frontend was split into API modules, contexts, routes, reusable components, and pages.
6. The UI was built around the WheelGo domain: tenant login, tenant signup, car browsing, bookings, payments, admin dashboards, and super-admin tenant management.
7. Protected routes were added so each role only sees the pages it is allowed to access.
8. The app was connected to the backend through environment-based API configuration.

The frontend is located in:

```text
my-app/
```

The most important folders are:

```text
src/api/          Axios API modules
src/context/      React Context providers
src/pages/        Auth, user, admin, and super-admin pages
src/routes/       Protected route logic
src/components/   Shared modal components
src/utils/        Auth, currency, media, and validation helpers
```

## Technologies Used

- React 19
- Vite
- React Router
- Context API
- Axios
- Lucide React icons
- CSS and inline style objects

## Class Requirements And How The Frontend Supports Them

The full Distributed Systems project had these requirements:

1. Client-server architecture
2. HTTP/HTTPS communication
3. Minimum 20 backend endpoints
4. RESTful API with a backend framework
5. OOP programming
6. Swagger documentation
7. ORM and database
8. Authentication and authorization
9. Middleware
10. React frontend with Context API
11. Testing and CI/CD
12. Minimum 20 models and migrations
13. Project documentation
14. Project management
15. Git, pull requests, and code reviews
16. OpenAI integration
17. Caching
18. Background jobs
19. Multi-tenancy
20. Search and filtering

This repository mainly covers requirement **10: Frontend with React and Context API**, while also supporting the user-facing parts of authentication, authorization, multi-tenancy, REST communication, search/filtering, and project documentation.

Backend requirements such as ORM, Swagger, middleware, Redis, migrations, OpenAI, and background jobs are implemented and documented on the backend side, so they are only mentioned briefly here.

## Client-Server Architecture

The frontend and backend are independent applications.

The frontend does not access the database directly. It sends HTTP requests to the backend API and renders the returned data. This follows the client-server architecture required by the project.

The frontend API base URL is configured in Vite:

```text
VITE_API_URL=http://localhost:8080
```

If `VITE_API_URL` is not set, the frontend uses:

```text
http://localhost:8080
```

## Authentication And Tenant Flow

WheelGo is multi-tenant, meaning every company/tenant has its own slug. The slug is part of the login and signup flow.

Examples:

```text
/login/prishtina-rentals
/signup/prishtina-rentals
/t/prishtina-rentals/app
/t/prishtina-rentals/admin
```

The tenant slug tells the frontend and backend which tenant the user belongs to.

### Login Endpoint

The most important login endpoint is:

```http
POST /api/auth/login/{tenantSlug}
```

Frontend function:

```js
login(tenantSlug, email, password)
```

Request body:

```json
{
  "email": "user@example.com",
  "password": "Password123"
}
```

What the frontend does:

- Reads `tenantSlug` from the URL.
- Checks if the tenant exists through `/api/public/tenants/{tenantSlug}`.
- Sends the email and password to `/api/auth/login/{tenantSlug}`.
- Saves the returned authentication data in `sessionStorage`.
- Redirects the user based on role:
  - `SUPER_ADMIN` goes to `/superadmin/tenants`
  - `ADMIN` goes to `/t/{tenantSlug}/admin`
  - regular users go to `/t/{tenantSlug}/app`

This endpoint is important because it starts the authenticated session and connects the user to the correct tenant.

### Signup Endpoint

The most important signup endpoint is:

```http
POST /api/auth/signup/{tenantSlug}
```

Frontend function:

```js
signupTenant(tenantSlug, data)
```

Request body:

```json
{
  "firstName": "John",
  "lastName": "Smith",
  "phone": "+383 44 123 123",
  "email": "john@example.com",
  "password": "Password123"
}
```

What the frontend does:

- Reads `tenantSlug` from the URL.
- Verifies that the tenant exists.
- Blocks signup for reserved tenants such as `super-admin-tenant`.
- Validates required fields.
- Validates email format.
- Validates password rules: at least 8 characters, 1 uppercase letter, and 1 number.
- Sends the signup request to `/api/auth/signup/{tenantSlug}`.
- Saves the returned authentication data.
- Redirects the new user to `/t/{tenantSlug}/app`.

This endpoint is important because it allows customers to create accounts inside a specific tenant.

## Context API Usage

The project uses React Context API for global state.

### AuthContext

`AuthContext` manages:

- Login
- Signup
- Logout
- Current user
- User role
- Token storage
- Tenant slug
- Super-admin impersonation state

Authentication data is stored in `sessionStorage` under:

```text
wheelgo_auth
```

The token is attached to protected API requests as:

```http
Authorization: Bearer <token>
```

### TenantSettingsContext

`TenantSettingsContext` loads tenant-specific settings such as currency and applies them across the UI. This is used when showing vehicle prices, booking totals, payments, and tenant-specific admin views.

## API Communication

Axios is used for all API calls.

There are two Axios setups:

- `authApi.js` for public login, signup, and tenant validation.
- `http.js` for protected API calls.

The protected Axios client automatically:

- Adds the bearer token.
- Adds `X-Tenant-Slug` when the current route contains `/t/{tenantSlug}`.
- Redirects to login if the backend reports an expired or invalid session.

This keeps tenant requests separated and supports the multi-tenancy requirement.

## Main Frontend Routes

Authentication routes:

```text
/login
/login/:tenantSlug
/signup/:tenantSlug
```

Super-admin route:

```text
/superadmin/tenants
```

Tenant admin routes:

```text
/t/:tenantSlug/admin
/t/:tenantSlug/admin/locations
/t/:tenantSlug/admin/vehicles
/t/:tenantSlug/admin/vehicle-categories
/t/:tenantSlug/admin/vehicle-images
/t/:tenantSlug/admin/users
/t/:tenantSlug/admin/bookings
/t/:tenantSlug/admin/reviews
/t/:tenantSlug/admin/payments
/t/:tenantSlug/admin/promotions
/t/:tenantSlug/admin/addons
/t/:tenantSlug/admin/maintenance
/t/:tenantSlug/admin/support
```

Tenant user routes:

```text
/t/:tenantSlug/app
/t/:tenantSlug/bookings
/t/:tenantSlug/reviews
/t/:tenantSlug/payments
/t/:tenantSlug/settings
/t/:tenantSlug/profile
/t/:tenantSlug/support
```

## Role-Based UI Access

The frontend uses `ProtectedRoute` to control access.

- `SUPER_ADMIN` can access the super-admin tenants page.
- `ADMIN` and `SUPER_ADMIN` can access tenant admin pages.
- `USER`, `ADMIN`, and `SUPER_ADMIN` can access tenant user pages.
- Non-authenticated users are redirected to login.
- Users cannot access another tenant's pages unless they are super admins.

## User Interface Overview

The UI is built around three main experiences.

### 1. Authentication UI

The login and signup pages use a dark WheelGo branded card layout. They show the tenant slug or tenant name, validate user input, and show errors returned from the backend.

Login includes:

- Email input
- Password input
- Tenant validation
- Signup link for tenant users
- Role-based redirect after login

Signup includes:

- First name
- Last name
- Phone number
- Email
- Password
- Confirm password
- Tenant validation
- Password rule validation

### 2. User Dashboard

The customer side lets users browse and rent vehicles.

Main features:

- Vehicle search
- Location filtering
- Featured vehicle section
- Vehicle cards with images, category, location, year, transmission, fuel type, status, and daily price
- Vehicle details modal
- Image gallery
- Reviews for a vehicle
- Add-ons selection
- Booking date selection
- Driver license verification check before booking
- Payment form for card or cash payment
- Navigation to bookings, payments, reviews, settings, profile, and support

### 3. Tenant Admin Dashboard

The tenant admin side is used by companies to manage their rental business.

Admin pages include:

- Dashboard statistics
- Vehicles
- Locations
- Vehicle categories
- Vehicle images
- Users
- Bookings
- Reviews
- Payments
- Promotions
- Add-ons
- Maintenance
- Support tickets

The admin UI uses a sidebar layout, tenant-specific navigation, tables, forms, modals, status badges, and confirmation dialogs.

### 4. Super Admin Tenants Page

The super admin can manage tenants from `/superadmin/tenants`.

Features:

- View all tenants
- Create tenant
- Edit tenant
- Delete tenant
- Set tenant plan
- Configure currency, timezone, logo URL, and theme color
- Create the first tenant admin
- Start tenant impersonation

Impersonation allows a super admin to enter a tenant admin area and act as that tenant's admin. The UI displays an impersonation banner and provides a stop impersonation action.

## Important API Areas Used By The Frontend

The frontend consumes many backend endpoints. The most important groups are:

Authentication:

```text
POST /api/auth/login/{tenantSlug}
POST /api/auth/signup/{tenantSlug}
GET  /api/public/tenants/{tenantSlug}
```

Super admin:

```text
GET    /api/super-admin/tenants
POST   /api/super-admin/tenants
PATCH  /api/super-admin/tenants/{id}
DELETE /api/super-admin/tenants/{id}
GET    /api/super-admin/tenants/currencies
POST   /api/super-admin/impersonation/start/{tenantSlug}
POST   /api/super-admin/impersonation/stop
```

User vehicle and booking flow:

```text
GET   /api/v1/vehicles
GET   /api/v1/addons
POST  /api/v1/bookings
GET   /api/v1/bookings/me
PATCH /api/v1/bookings/{id}/cancel
```

Payments:

```text
POST  /api/v1/payments/pay
GET   /api/v1/payments/me
GET   /api/v1/payments/booking/{bookingId}
PATCH /api/v1/admin/payments/{paymentId}/confirm
PATCH /api/v1/admin/payments/{paymentId}/refund
```

Reviews:

```text
POST /api/v1/reviews
GET  /api/v1/reviews/me
GET  /api/v1/reviews/vehicles/{vehicleId}
GET  /api/v1/admin/reviews
```

Support:

```text
GET   /api/v1/support/tickets/me
POST  /api/v1/support/tickets
GET   /api/v1/support/tickets/{ticketId}/messages
POST  /api/v1/support/tickets/{ticketId}/messages
GET   /api/v1/admin/support/tickets
PATCH /api/v1/admin/support/tickets/{ticketId}
```

Profile and driver license:

```text
GET  /api/user-profile/me
PUT  /api/user-profile/me
GET  /api/driver-license/me
PUT  /api/driver-license/me
POST /api/driver-license/me/verify
POST /api/driver-license/me/front-image
POST /api/driver-license/me/back-image
```

Tenant admin management:

```text
GET    /api/v1/admin/vehicles
POST   /api/v1/admin/vehicles
PATCH  /api/v1/admin/vehicles/{id}
DELETE /api/v1/admin/vehicles/{id}
GET    /api/v1/admin/locations
GET    /api/v1/admin/vehicle-categories
GET    /api/v1/admin/vehicle-images
GET    /api/v1/admin/users
GET    /api/v1/admin/bookings
GET    /api/v1/admin/payments
GET    /api/v1/admin/addons
GET    /api/v1/admin/promotions
GET    /api/v1/admin/maintenances
```

## Search And Filtering

The frontend supports search and filtering in several areas.

Examples:

- Vehicle search on the user dashboard.
- Location filtering for vehicle browsing.
- Admin keyword search for vehicles, locations, categories, users, bookings, payments, and maintenance records.

Search values are sent to the backend as query parameters, for example:

```text
GET /api/v1/vehicles?keyword=bmw
GET /api/v1/admin/vehicles?keyword=audi
```

## Multi-Tenancy In The Frontend

The frontend supports multi-tenancy through:

- Tenant slug in the URL.
- Tenant-specific login and signup.
- Tenant validation before login/signup.
- `X-Tenant-Slug` header on protected tenant routes.
- Tenant-specific admin and user pages.
- Tenant settings such as currency, timezone, theme color, and logo URL.

This ensures that users, admins, vehicles, bookings, and payments are handled inside the correct tenant context.

## Running The Frontend

Install dependencies:

```bash
cd my-app
npm install
```

Create or update `.env`:

```bash
VITE_API_URL=http://localhost:8080
```

Start the development server:

```bash
npm run dev
```

Build for production:

```bash
npm run build
```

Preview production build:

```bash
npm run preview
```

Run linting:

```bash
npm run lint
```

## Development Notes

- The frontend expects the backend to be running before login, signup, dashboard, booking, and admin pages can load real data.
- The backend must provide the tenant slugs used in the URL.
- The login route without a slug tries to redirect to the last used tenant slug.
- Authentication is session-based on the frontend, so closing the browser session clears the stored auth data.
- Reserved tenant slugs are protected from normal signup.
- Vehicle booking requires driver license verification before the user can continue.

## Summary

This frontend implements the client side of the WheelGo distributed system. It uses React, Context API, protected routing, Axios, and tenant-aware URLs to provide a complete interface for customers, tenant admins, and super admins. The backend remains responsible for the REST API, database, Swagger documentation, ORM models, caching, OpenAI module, background jobs, and other server-side requirements.
