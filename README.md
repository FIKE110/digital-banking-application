# 5ive — Digital Banking Application

5ive is a full-stack digital banking platform built with **Spring Boot**, **React**, **PostgreSQL**, **RabbitMQ** and **Redis**. It combines a customer banking web app with a complete admin back office (maker-checker approvals, KYC, cards, payments, roles & permissions, audit trail) and an event-driven notification/audit pipeline using the transactional outbox pattern.

![Architecture](ARCHITECTURE.png)

## Features

### Customer app (`customer-webapp`)
- Register, login (JWT + refresh), password reset via OTP
- Accounts: create NGN accounts, deposit simulation
- Send money (transfers) and pay bills — both require a **transaction PIN**
- Transaction PIN: create / change / reset via email OTP (`/pin/status`, `/pin/set`, `/pin/verify`, `/pin/forgot`, `/pin/reset`); locked after 5 failed attempts
- Beneficiaries, cards, transaction history, notifications, profile & settings (light/dark theme)
- KYC verification page (coming soon placeholder)
- Bank branding is configurable via env vars (`VITE_BANK_NAME`, `VITE_BANK_SUPPORT_EMAIL`, `VITE_BANK_WEBSITE`)

### Admin back office (`customer-webapp` admin routes)
- Dashboard with KPIs and charts
- Customers, accounts, KYC verifications, cards, beneficiaries, transactions, payments, limits
- Roles & permissions, administrator management, audit trail
- **Approvals (maker-checker)**: adjustments and destructive admin actions are submitted for approval and executed by a second admin with the `approve-admin-actions` permission. Users cannot approve their own requests.

### Backend services
- **core-app-service** (8081): REST API, security, business logic, admin features
- **email-service** (8090): RabbitMQ consumer, sends branded emails via MailHog/SMTP
- **audit-service** (8091): RabbitMQ consumer, persists audit logs
- **api-gateway-service** (8080): Spring Cloud Gateway entry point (optional; dev also proxies directly to 8080)

## Architecture

```
Client (customer-webapp:5173)
        │  /api/*  (Vite proxy or gateway)
        ▼
  api-gateway-service (8080)  ──►  core-app-service (8081)
                                        │ write data + outbox event in one tx
                                        ▼
                    PostgreSQL (banking_db) ──► RabbitMQ ──► email-service (8090)
                                                                   audit-service (8091)
```

- **Outbox pattern**: business transactions write both the data change and an event row to the `outbox` table atomically; services publish from the outbox to RabbitMQ, guaranteeing at-least-once delivery without distributed transactions.
- **Security**: Spring Security with JWT access/refresh tokens; RBAC via roles/permissions; `BCrypt`-hashed passwords and transaction PINs.
- **Audit**: outbox events (`USER_*`, `ADMIN_*`, etc.) are consumed by audit-service and are also queryable through the REST API (`/api/v1/audit`).

## Tech Stack

| Layer      | Technology |
|------------|------------|
| Backend    | Java 17, Spring Boot 4.1, Spring Security, Spring Data JPA, Spring Cloud Gateway |
| Frontend   | React 19, TypeScript, Vite, React Router |
| Database   | PostgreSQL 16 |
| Cache      | Redis 7 (sessions/OTP) |
| Messaging  | RabbitMQ (outbox → consumers) |
| Emails     | SMTP (MailHog in dev), `thymeleaf`-style templates with `{{placeholders}}` |
| Build      | Maven (multi-module), pnpm |

## Project Structure

```
├── common-lib          Shared DTOs, enums, constants, exception handling
├── core-data-lib       JPA entities & repositories (users, accounts, outbox, user_otps…)
├── core-lib            Domain logic (ledger, validation)
├── core-app-service    Main Spring Boot runtime (REST, security, services, admin APIs)
├── email-service       RabbitMQ consumer → SMTP email
├── audit-service       RabbitMQ consumer → audit log persistence
├── api-gateway-service Spring Cloud Gateway entry point
├── customer-webapp     React customer + admin frontend
└── docker-compose.yml  PostgreSQL, Redis, RabbitMQ, MailHog
```

## Getting Started

### Prerequisites
- Docker & Docker Compose
- Java 17+ (e.g. `$HOME/.sdkman/candidates/java/17.0.8-tem`)
- Maven 3.9+
- Node.js 20+ and pnpm

### 1. Start external services

```bash
cp .env.example .env
docker compose up -d
```

- PostgreSQL `banking_db` (user `banking` / `banking_pass`)
- Redis at `localhost:6379`
- RabbitMQ at `localhost:5672`, management UI at `http://localhost:15672`
- MailHog SMTP at `localhost:1025`, web UI at `http://localhost:8025`

### 2. Build the backend

```bash
export JAVA_HOME="$HOME/.sdkman/candidates/java/17.0.8-tem"
export PATH="$JAVA_HOME/bin:$HOME/.sdkman/candidates/maven/3.9.9/bin:$PATH"

mvn -pl common-lib,core-data-lib,core-lib,core-app-service -am install -DskipTests
mvn -pl email-service -am install -DskipTests
mvn -pl audit-service,api-gateway-service -am install -DskipTests
```

### 3. Run the services

```bash
java -jar core-app-service/target/core-app-service-1.0.0-SNAPSHOT.jar   # :8081
java -jar email-service/target/email-service-1.0.0-SNAPSHOT.jar         # :8090
java -jar audit-service/target/audit-service-1.0.0-SNAPSHOT.jar         # :8091
java -jar api-gateway-service/target/api-gateway-service-1.0.0-SNAPSHOT.jar  # :8080 (optional)
```

Tables are auto-created via `ddl-auto: update`.

### 4. Run the frontend

```bash
cd customer-webapp
cp .env.example .env   # VITE_BANK_NAME=5ive, etc.
pnpm install
pnpm dev               # http://localhost:5173 (proxies /api → :8080)
```

Production build + lint:

```bash
pnpm build   # tsc + vite build
pnpm lint    # oxlint
```

## Using the app

| What | How |
|------|-----|
| Customer account | Register at `http://localhost:5173/register`, verify email OTP from MailHog UI |
| Admin | Login at `/admin/login` — default super admin `system` / `PASSWORD` |
| Emails (OTP, receipts, alerts) | MailHog web UI at `http://localhost:8025` |
| API docs | Swagger/OpenAPI at `http://localhost:8081/api/v3/docs` (paths `/api/v1/**`) |

## API Overview (`/api/v1`)

- `auth/**` — register, login, refresh, forgot/reset password (public)
- `accounts/**`, `transfers/**`, `bills/**`, `cards/**`, `beneficiaries/**`, `ledger/**`, `notifications/**`, `profile/**`, `audit/**`
- `pin/**` — status, set, verify, forgot, reset (transaction PIN)
- `admin/**` — dashboard, customers, accounts, kyc, cards, beneficiaries, transactions, payments, limits, roles, admins, approvals, adjustments, audit trail (requires admin JWT + permissions)

All responses follow a consistent `ApiResponse` wrapper (`{ success, message, data, timestamp, path, statusCode }`).

## Configuration

- **Bank branding** (frontend): `customer-webapp/.env` → `VITE_BANK_NAME`, `VITE_BANK_TAGLINE`, `VITE_BANK_SUPPORT_EMAIL`, `VITE_BANK_WEBSITE`; also referenced in `src/config.ts` and `index.html`.
- **Bank branding** (emails): `email-service/src/main/resources/application.properties` → `app.bank.name`, `app.bank.support-email`, `app.bank.website`; templates use `{{bankName}}`, `{{supportEmail}}`, `{{website}}`.
- **Currency**: NGN only (no currency selection in account creation).

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md).

## Admin Default Credentials

- Super admin: `system` / `PASSWORD` (sign in at `/admin/login`)
- Change these in production.
