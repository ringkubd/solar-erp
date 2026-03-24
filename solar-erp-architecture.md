# ☀️ SolarEdge ERP — Full System Architecture
### Solar & Electrical Substation Engineering Company
**Stack:** Laravel 11 · Next.js 14 · React Native · MySQL · Redis · Soketi · Meilisearch · Ollama**  
**Localization:** Bangla + English | **Currency:** BDT

---

## 1. 🗄️ DATABASE SCHEMA

### Core Tables

```sql
-- ────────────────────────────────────────
-- USERS & ACCESS CONTROL
-- ────────────────────────────────────────
CREATE TABLE users (
  id            BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  name          VARCHAR(100) NOT NULL,
  email         VARCHAR(150) NOT NULL UNIQUE,
  password      VARCHAR(255) NOT NULL,
  role          ENUM('admin','manager','engineer','accountant','sales') NOT NULL,
  employee_id   BIGINT UNSIGNED NULL,
  avatar        VARCHAR(255) NULL,
  locale        ENUM('en','bn') DEFAULT 'en',
  is_active     BOOLEAN DEFAULT TRUE,
  last_login_at TIMESTAMP NULL,
  created_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_role (role),
  INDEX idx_email (email)
);

CREATE TABLE permissions (
  id          BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  name        VARCHAR(100) NOT NULL UNIQUE,   -- e.g. "proposals.create"
  module      VARCHAR(50)  NOT NULL,
  description VARCHAR(255) NULL
);

CREATE TABLE role_permissions (
  role       ENUM('admin','manager','engineer','accountant','sales') NOT NULL,
  permission_id BIGINT UNSIGNED NOT NULL,
  PRIMARY KEY (role, permission_id),
  FOREIGN KEY (permission_id) REFERENCES permissions(id) ON DELETE CASCADE
);

-- ────────────────────────────────────────
-- CRM — LEADS & CLIENTS
-- ────────────────────────────────────────
CREATE TABLE leads (
  id              BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  source          ENUM('website','manual','referral','social','other') DEFAULT 'manual',
  full_name       VARCHAR(150) NOT NULL,
  company_name    VARCHAR(200) NULL,
  email           VARCHAR(150) NULL,
  phone           VARCHAR(30)  NOT NULL,
  address         TEXT NULL,
  district        VARCHAR(100) NULL,
  project_type    ENUM('solar','substation','electrical','amc','other') NOT NULL,
  load_kw         DECIMAL(10,2) NULL,
  budget_bdt      DECIMAL(15,2) NULL,
  stage           ENUM('new','contacted','survey','proposal_sent','negotiation','won','lost') DEFAULT 'new',
  assigned_to     BIGINT UNSIGNED NULL,
  expected_close  DATE NULL,
  lost_reason     VARCHAR(255) NULL,
  notes           TEXT NULL,
  created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (assigned_to) REFERENCES users(id) ON DELETE SET NULL,
  INDEX idx_stage (stage),
  INDEX idx_assigned (assigned_to),
  INDEX idx_project_type (project_type)
);

CREATE TABLE lead_activities (
  id          BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  lead_id     BIGINT UNSIGNED NOT NULL,
  user_id     BIGINT UNSIGNED NOT NULL,
  type        ENUM('call','email','meeting','note','stage_change','reminder') NOT NULL,
  note        TEXT NULL,
  scheduled_at TIMESTAMP NULL,
  completed_at TIMESTAMP NULL,
  created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (lead_id) REFERENCES leads(id) ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES users(id),
  INDEX idx_lead (lead_id),
  INDEX idx_scheduled (scheduled_at)
);

CREATE TABLE clients (
  id              BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  lead_id         BIGINT UNSIGNED NULL,
  company_name    VARCHAR(200) NOT NULL,
  trade_license   VARCHAR(100) NULL,
  tax_id          VARCHAR(100) NULL,
  billing_address TEXT NULL,
  site_address    TEXT NULL,
  district        VARCHAR(100) NULL,
  created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (lead_id) REFERENCES leads(id) ON DELETE SET NULL
);

CREATE TABLE client_contacts (
  id         BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  client_id  BIGINT UNSIGNED NOT NULL,
  name       VARCHAR(150) NOT NULL,
  role       VARCHAR(100) NULL,
  phone      VARCHAR(30)  NOT NULL,
  email      VARCHAR(150) NULL,
  is_primary BOOLEAN DEFAULT FALSE,
  FOREIGN KEY (client_id) REFERENCES clients(id) ON DELETE CASCADE
);

-- ────────────────────────────────────────
-- PROPOSALS
-- ────────────────────────────────────────
CREATE TABLE proposals (
  id              BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  proposal_no     VARCHAR(30) NOT NULL UNIQUE,  -- e.g. PROP-2025-0042
  lead_id         BIGINT UNSIGNED NOT NULL,
  client_id       BIGINT UNSIGNED NULL,
  template_type   ENUM('solar_rooftop','industrial_solar','substation','electrical','amc') NOT NULL,
  version         SMALLINT UNSIGNED DEFAULT 1,
  parent_id       BIGINT UNSIGNED NULL,         -- for version chain
  title           VARCHAR(255) NOT NULL,
  valid_until     DATE NOT NULL,
  currency        CHAR(3) DEFAULT 'BDT',
  subtotal        DECIMAL(15,2) NOT NULL DEFAULT 0,
  discount_pct    DECIMAL(5,2) DEFAULT 0,
  vat_pct         DECIMAL(5,2) DEFAULT 0,
  total_amount    DECIMAL(15,2) NOT NULL DEFAULT 0,
  status          ENUM('draft','sent','viewed','accepted','rejected','expired') DEFAULT 'draft',
  sent_at         TIMESTAMP NULL,
  viewed_at       TIMESTAMP NULL,
  responded_at    TIMESTAMP NULL,
  approved_by     BIGINT UNSIGNED NULL,
  approved_at     TIMESTAMP NULL,
  pdf_path        VARCHAR(255) NULL,
  ai_generated    BOOLEAN DEFAULT FALSE,
  notes           TEXT NULL,
  created_by      BIGINT UNSIGNED NOT NULL,
  created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (lead_id) REFERENCES leads(id),
  FOREIGN KEY (client_id) REFERENCES clients(id),
  FOREIGN KEY (parent_id) REFERENCES proposals(id) ON DELETE SET NULL,
  FOREIGN KEY (approved_by) REFERENCES users(id) ON DELETE SET NULL,
  FOREIGN KEY (created_by) REFERENCES users(id),
  INDEX idx_status (status),
  INDEX idx_lead (lead_id)
);

CREATE TABLE proposal_sections (
  id           BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  proposal_id  BIGINT UNSIGNED NOT NULL,
  sort_order   TINYINT UNSIGNED DEFAULT 0,
  title        VARCHAR(255) NOT NULL,
  content      LONGTEXT NULL,   -- rich text / HTML
  FOREIGN KEY (proposal_id) REFERENCES proposals(id) ON DELETE CASCADE
);

CREATE TABLE proposal_items (
  id           BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  proposal_id  BIGINT UNSIGNED NOT NULL,
  category     VARCHAR(100) NULL,   -- e.g. "Solar Panels", "Inverters"
  description  TEXT NOT NULL,
  brand        VARCHAR(100) NULL,
  model        VARCHAR(100) NULL,
  qty          DECIMAL(10,2) NOT NULL,
  unit         VARCHAR(30) NULL,
  unit_price   DECIMAL(15,2) NOT NULL,
  total_price  DECIMAL(15,2) GENERATED ALWAYS AS (qty * unit_price) STORED,
  sort_order   TINYINT UNSIGNED DEFAULT 0,
  FOREIGN KEY (proposal_id) REFERENCES proposals(id) ON DELETE CASCADE
);

CREATE TABLE proposal_solar_specs (
  id               BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  proposal_id      BIGINT UNSIGNED NOT NULL UNIQUE,
  system_size_kw   DECIMAL(10,2) NOT NULL,
  annual_gen_kwh   DECIMAL(12,2) NULL,
  panel_qty        INT NULL,
  panel_watt       INT NULL,
  inverter_brand   VARCHAR(100) NULL,
  inverter_kw      DECIMAL(10,2) NULL,
  battery_kwh      DECIMAL(10,2) NULL,
  avg_monthly_bill DECIMAL(12,2) NULL,
  monthly_savings  DECIMAL(12,2) NULL,
  payback_years    DECIMAL(5,2) NULL,
  roi_pct          DECIMAL(6,2) NULL,
  FOREIGN KEY (proposal_id) REFERENCES proposals(id) ON DELETE CASCADE
);

-- ────────────────────────────────────────
-- PROJECTS
-- ────────────────────────────────────────
CREATE TABLE projects (
  id              BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  project_no      VARCHAR(30) NOT NULL UNIQUE,
  proposal_id     BIGINT UNSIGNED NULL,
  client_id       BIGINT UNSIGNED NOT NULL,
  name            VARCHAR(255) NOT NULL,
  type            ENUM('solar','substation','electrical','amc','other') NOT NULL,
  status          ENUM('planning','active','on_hold','completed','cancelled') DEFAULT 'planning',
  start_date      DATE NULL,
  end_date        DATE NULL,
  budget_bdt      DECIMAL(15,2) NULL,
  contract_value  DECIMAL(15,2) NULL,
  site_address    TEXT NULL,
  district        VARCHAR(100) NULL,
  manager_id      BIGINT UNSIGNED NULL,
  description     TEXT NULL,
  created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (proposal_id) REFERENCES proposals(id) ON DELETE SET NULL,
  FOREIGN KEY (client_id) REFERENCES clients(id),
  FOREIGN KEY (manager_id) REFERENCES users(id) ON DELETE SET NULL,
  INDEX idx_status (status),
  INDEX idx_type (type)
);

CREATE TABLE project_milestones (
  id           BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  project_id   BIGINT UNSIGNED NOT NULL,
  title        VARCHAR(255) NOT NULL,
  description  TEXT NULL,
  planned_date DATE NULL,
  actual_date  DATE NULL,
  status       ENUM('pending','in_progress','done','delayed') DEFAULT 'pending',
  sort_order   TINYINT UNSIGNED DEFAULT 0,
  FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE
);

CREATE TABLE project_tasks (
  id           BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  project_id   BIGINT UNSIGNED NOT NULL,
  milestone_id BIGINT UNSIGNED NULL,
  parent_id    BIGINT UNSIGNED NULL,
  title        VARCHAR(255) NOT NULL,
  description  TEXT NULL,
  assigned_to  BIGINT UNSIGNED NULL,
  priority     ENUM('low','medium','high','critical') DEFAULT 'medium',
  status       ENUM('todo','in_progress','review','done','blocked') DEFAULT 'todo',
  start_date   DATE NULL,
  due_date     DATE NULL,
  completed_at TIMESTAMP NULL,
  created_by   BIGINT UNSIGNED NOT NULL,
  created_at   TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at   TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE,
  FOREIGN KEY (milestone_id) REFERENCES project_milestones(id) ON DELETE SET NULL,
  FOREIGN KEY (parent_id) REFERENCES project_tasks(id) ON DELETE SET NULL,
  FOREIGN KEY (assigned_to) REFERENCES users(id) ON DELETE SET NULL,
  INDEX idx_project_status (project_id, status),
  INDEX idx_assigned_due (assigned_to, due_date)
);

CREATE TABLE project_surveys (
  id              BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  project_id      BIGINT UNSIGNED NOT NULL UNIQUE,
  surveyed_by     BIGINT UNSIGNED NULL,
  survey_date     DATE NULL,
  roof_type       VARCHAR(100) NULL,
  roof_area_sqft  DECIMAL(10,2) NULL,
  shading_notes   TEXT NULL,
  existing_load_kw DECIMAL(10,2) NULL,
  grid_voltage    VARCHAR(50) NULL,
  load_schedule   JSON NULL,
  photos          JSON NULL,       -- array of file paths
  notes           TEXT NULL,
  FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE
);

-- ────────────────────────────────────────
-- INVOICES & BILLING
-- ────────────────────────────────────────
CREATE TABLE invoices (
  id              BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  invoice_no      VARCHAR(30) NOT NULL UNIQUE,
  project_id      BIGINT UNSIGNED NULL,
  client_id       BIGINT UNSIGNED NOT NULL,
  milestone_id    BIGINT UNSIGNED NULL,
  invoice_date    DATE NOT NULL,
  due_date        DATE NOT NULL,
  billing_type    ENUM('milestone','item') DEFAULT 'item',
  subtotal        DECIMAL(15,2) NOT NULL DEFAULT 0,
  discount_amt    DECIMAL(15,2) DEFAULT 0,
  vat_pct         DECIMAL(5,2) DEFAULT 0,
  vat_amount      DECIMAL(15,2) DEFAULT 0,
  total_amount    DECIMAL(15,2) NOT NULL DEFAULT 0,
  paid_amount     DECIMAL(15,2) DEFAULT 0,
  due_amount      DECIMAL(15,2) GENERATED ALWAYS AS (total_amount - paid_amount) STORED,
  status          ENUM('draft','sent','partial','paid','overdue','cancelled') DEFAULT 'draft',
  pdf_path        VARCHAR(255) NULL,
  notes           TEXT NULL,
  created_by      BIGINT UNSIGNED NOT NULL,
  created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE SET NULL,
  FOREIGN KEY (client_id) REFERENCES clients(id),
  INDEX idx_status (status),
  INDEX idx_due_date (due_date)
);

CREATE TABLE invoice_items (
  id           BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  invoice_id   BIGINT UNSIGNED NOT NULL,
  description  TEXT NOT NULL,
  qty          DECIMAL(10,2) NOT NULL,
  unit         VARCHAR(30) NULL,
  unit_price   DECIMAL(15,2) NOT NULL,
  total_price  DECIMAL(15,2) GENERATED ALWAYS AS (qty * unit_price) STORED,
  FOREIGN KEY (invoice_id) REFERENCES invoices(id) ON DELETE CASCADE
);

-- ────────────────────────────────────────
-- MONEY RECEIPTS
-- ────────────────────────────────────────
CREATE TABLE payments (
  id              BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  receipt_no      VARCHAR(30) NOT NULL UNIQUE,
  invoice_id      BIGINT UNSIGNED NOT NULL,
  client_id       BIGINT UNSIGNED NOT NULL,
  amount          DECIMAL(15,2) NOT NULL,
  payment_date    DATE NOT NULL,
  method          ENUM('cash','bank_transfer','cheque','mobile_banking','card','other') NOT NULL,
  bank_name       VARCHAR(100) NULL,
  transaction_ref VARCHAR(100) NULL,
  mobile_number   VARCHAR(30) NULL,
  notes           TEXT NULL,
  pdf_path        VARCHAR(255) NULL,
  created_by      BIGINT UNSIGNED NOT NULL,
  created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (invoice_id) REFERENCES invoices(id),
  FOREIGN KEY (client_id) REFERENCES clients(id),
  INDEX idx_invoice (invoice_id),
  INDEX idx_date (payment_date)
);

-- ────────────────────────────────────────
-- ACCOUNTING
-- ────────────────────────────────────────
CREATE TABLE accounts (
  id          BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  code        VARCHAR(20) NOT NULL UNIQUE,
  name        VARCHAR(150) NOT NULL,
  name_bn     VARCHAR(150) NULL,
  type        ENUM('asset','liability','equity','income','expense') NOT NULL,
  parent_id   BIGINT UNSIGNED NULL,
  is_system   BOOLEAN DEFAULT FALSE,
  description TEXT NULL,
  FOREIGN KEY (parent_id) REFERENCES accounts(id) ON DELETE SET NULL,
  INDEX idx_type (type)
);

CREATE TABLE journal_entries (
  id           BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  entry_no     VARCHAR(30) NOT NULL UNIQUE,
  date         DATE NOT NULL,
  description  TEXT NOT NULL,
  ref_type     VARCHAR(50) NULL,   -- 'invoice', 'payment', 'expense'
  ref_id       BIGINT UNSIGNED NULL,
  project_id   BIGINT UNSIGNED NULL,
  created_by   BIGINT UNSIGNED NOT NULL,
  created_at   TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_date (date),
  INDEX idx_ref (ref_type, ref_id)
);

CREATE TABLE journal_lines (
  id               BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  journal_entry_id BIGINT UNSIGNED NOT NULL,
  account_id       BIGINT UNSIGNED NOT NULL,
  debit            DECIMAL(15,2) DEFAULT 0,
  credit           DECIMAL(15,2) DEFAULT 0,
  description      TEXT NULL,
  FOREIGN KEY (journal_entry_id) REFERENCES journal_entries(id) ON DELETE CASCADE,
  FOREIGN KEY (account_id) REFERENCES accounts(id),
  INDEX idx_account (account_id)
);

-- ────────────────────────────────────────
-- INVENTORY & PROCUREMENT
-- ────────────────────────────────────────
CREATE TABLE vendors (
  id            BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  name          VARCHAR(200) NOT NULL,
  contact_name  VARCHAR(150) NULL,
  phone         VARCHAR(30)  NOT NULL,
  email         VARCHAR(150) NULL,
  address       TEXT NULL,
  district      VARCHAR(100) NULL,
  account_id    BIGINT UNSIGNED NULL,   -- AP ledger account
  notes         TEXT NULL,
  created_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (account_id) REFERENCES accounts(id) ON DELETE SET NULL
);

CREATE TABLE products (
  id           BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  sku          VARCHAR(50) NOT NULL UNIQUE,
  name         VARCHAR(255) NOT NULL,
  category     ENUM('solar_panel','inverter','battery','cable','structure','switchgear','transformer','consumable','other') NOT NULL,
  brand        VARCHAR(100) NULL,
  unit         VARCHAR(30) DEFAULT 'pcs',
  stock_qty    DECIMAL(12,2) DEFAULT 0,
  min_stock    DECIMAL(12,2) DEFAULT 0,
  unit_cost    DECIMAL(15,2) DEFAULT 0,
  description  TEXT NULL,
  created_at   TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at   TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_category (category)
);

CREATE TABLE purchase_orders (
  id           BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  po_no        VARCHAR(30) NOT NULL UNIQUE,
  vendor_id    BIGINT UNSIGNED NOT NULL,
  project_id   BIGINT UNSIGNED NULL,
  order_date   DATE NOT NULL,
  expected_date DATE NULL,
  status       ENUM('draft','sent','partial','received','cancelled') DEFAULT 'draft',
  subtotal     DECIMAL(15,2) DEFAULT 0,
  vat_amount   DECIMAL(15,2) DEFAULT 0,
  total_amount DECIMAL(15,2) DEFAULT 0,
  notes        TEXT NULL,
  created_by   BIGINT UNSIGNED NOT NULL,
  created_at   TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (vendor_id) REFERENCES vendors(id),
  FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE SET NULL
);

CREATE TABLE purchase_order_items (
  id          BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  po_id       BIGINT UNSIGNED NOT NULL,
  product_id  BIGINT UNSIGNED NOT NULL,
  qty         DECIMAL(12,2) NOT NULL,
  unit_price  DECIMAL(15,2) NOT NULL,
  received_qty DECIMAL(12,2) DEFAULT 0,
  FOREIGN KEY (po_id) REFERENCES purchase_orders(id) ON DELETE CASCADE,
  FOREIGN KEY (product_id) REFERENCES products(id)
);

CREATE TABLE stock_movements (
  id           BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  product_id   BIGINT UNSIGNED NOT NULL,
  type         ENUM('in','out','adjustment') NOT NULL,
  qty          DECIMAL(12,2) NOT NULL,
  ref_type     VARCHAR(50) NULL,   -- 'po','project_use','adjustment'
  ref_id       BIGINT UNSIGNED NULL,
  project_id   BIGINT UNSIGNED NULL,
  notes        TEXT NULL,
  created_by   BIGINT UNSIGNED NOT NULL,
  created_at   TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (product_id) REFERENCES products(id),
  INDEX idx_product (product_id),
  INDEX idx_date (created_at)
);

-- ────────────────────────────────────────
-- HR
-- ────────────────────────────────────────
CREATE TABLE employees (
  id           BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  user_id      BIGINT UNSIGNED NULL,
  emp_no       VARCHAR(20) NOT NULL UNIQUE,
  name         VARCHAR(150) NOT NULL,
  role         ENUM('engineer','technician','sales','accountant','manager','admin','other') NOT NULL,
  department   VARCHAR(100) NULL,
  phone        VARCHAR(30) NOT NULL,
  email        VARCHAR(150) NULL,
  nid          VARCHAR(50) NULL,
  join_date    DATE NOT NULL,
  salary_bdt   DECIMAL(12,2) NULL,
  is_active    BOOLEAN DEFAULT TRUE,
  created_at   TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
);

CREATE TABLE project_assignments (
  id          BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  project_id  BIGINT UNSIGNED NOT NULL,
  employee_id BIGINT UNSIGNED NOT NULL,
  role        VARCHAR(100) NULL,
  from_date   DATE NULL,
  to_date     DATE NULL,
  UNIQUE KEY uq_assign (project_id, employee_id),
  FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE,
  FOREIGN KEY (employee_id) REFERENCES employees(id)
);

-- ────────────────────────────────────────
-- WEBSITE CMS
-- ────────────────────────────────────────
CREATE TABLE cms_pages (
  id         BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  slug       VARCHAR(100) NOT NULL UNIQUE,
  title      VARCHAR(255) NOT NULL,
  title_bn   VARCHAR(255) NULL,
  content    LONGTEXT NULL,
  content_bn LONGTEXT NULL,
  meta_title VARCHAR(255) NULL,
  meta_desc  TEXT NULL,
  is_published BOOLEAN DEFAULT FALSE,
  updated_by BIGINT UNSIGNED NULL,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE project_portfolio (
  id           BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  title        VARCHAR(255) NOT NULL,
  title_bn     VARCHAR(255) NULL,
  type         ENUM('solar','substation','electrical') NOT NULL,
  client_name  VARCHAR(200) NULL,
  location     VARCHAR(150) NULL,
  capacity_kw  DECIMAL(10,2) NULL,
  completion_year YEAR NULL,
  description  TEXT NULL,
  description_bn TEXT NULL,
  images       JSON NULL,
  is_featured  BOOLEAN DEFAULT FALSE,
  sort_order   TINYINT UNSIGNED DEFAULT 0
);
```

---

## 2. 🔌 API STRUCTURE

### Base URL: `https://api.solarerp.com/v1`

### Auth
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/auth/login` | Email+password → JWT |
| POST | `/auth/logout` | Revoke token |
| POST | `/auth/refresh` | Refresh JWT |
| GET  | `/auth/me` | Current user profile |
| POST | `/auth/forgot-password` | Send reset link |

### CRM — Leads
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET    | `/leads` | List (filter: stage, assigned_to, date) |
| POST   | `/leads` | Create lead |
| GET    | `/leads/{id}` | Single lead + activities |
| PUT    | `/leads/{id}` | Update lead |
| PATCH  | `/leads/{id}/stage` | Move stage |
| DELETE | `/leads/{id}` | Soft delete |
| POST   | `/leads/{id}/activities` | Add activity/note |
| GET    | `/leads/{id}/proposals` | All proposals for lead |
| POST   | `/leads/import` | Bulk import CSV |

### CRM — Clients
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET    | `/clients` | List clients |
| POST   | `/clients` | Create client |
| GET    | `/clients/{id}` | Client + contacts + projects + invoices |
| PUT    | `/clients/{id}` | Update client |
| POST   | `/clients/{id}/contacts` | Add contact person |

### Proposals
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET    | `/proposals` | List proposals |
| POST   | `/proposals` | Create proposal |
| GET    | `/proposals/{id}` | Full proposal detail |
| PUT    | `/proposals/{id}` | Update draft |
| POST   | `/proposals/{id}/send` | Mark sent + email client |
| POST   | `/proposals/{id}/approve` | Manager approval |
| POST   | `/proposals/{id}/duplicate` | Clone as new version |
| GET    | `/proposals/{id}/pdf` | Download PDF |
| PATCH  | `/proposals/{id}/status` | Update status (accepted/rejected) |
| POST   | `/proposals/ai-generate` | AI auto-generate from load/budget |
| GET    | `/proposals/templates` | List templates |

### Projects
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET    | `/projects` | List projects |
| POST   | `/projects` | Create project |
| GET    | `/projects/{id}` | Full project detail |
| PUT    | `/projects/{id}` | Update project |
| GET    | `/projects/{id}/tasks` | Task list (Gantt data) |
| POST   | `/projects/{id}/tasks` | Create task |
| PUT    | `/projects/{id}/tasks/{taskId}` | Update task |
| GET    | `/projects/{id}/milestones` | Milestones |
| POST   | `/projects/{id}/milestones` | Create milestone |
| POST   | `/projects/{id}/survey` | Save survey data |
| GET    | `/projects/{id}/financials` | Revenue vs cost |
| POST   | `/projects/{id}/assign` | Assign employees |

### Invoices
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET    | `/invoices` | List invoices |
| POST   | `/invoices` | Create invoice |
| GET    | `/invoices/{id}` | Invoice detail |
| PUT    | `/invoices/{id}` | Update draft invoice |
| POST   | `/invoices/{id}/send` | Email to client |
| GET    | `/invoices/{id}/pdf` | Download PDF |
| POST   | `/invoices/{id}/payments` | Record payment |
| GET    | `/invoices/overdue` | Overdue invoices |

### Payments / Receipts
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET    | `/payments` | List all receipts |
| POST   | `/payments` | Create payment receipt |
| GET    | `/payments/{id}` | Receipt detail |
| GET    | `/payments/{id}/pdf` | Download receipt PDF |

### Accounting
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET    | `/accounts` | Chart of accounts |
| POST   | `/accounts` | Create account |
| GET    | `/journals` | General ledger |
| POST   | `/journals` | Manual journal entry |
| GET    | `/reports/profit-loss` | P&L (date range) |
| GET    | `/reports/balance-sheet` | Balance sheet |
| GET    | `/reports/cashbook` | Cash book |
| GET    | `/reports/project-profitability` | Per-project P&L |

### Inventory
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET    | `/products` | Stock list |
| POST   | `/products` | Add product |
| GET    | `/products/low-stock` | Items below minimum |
| POST   | `/purchase-orders` | Create PO |
| PATCH  | `/purchase-orders/{id}/receive` | Mark goods received |
| POST   | `/stock/adjust` | Manual adjustment |
| GET    | `/stock/movements` | Stock ledger |

### HR
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET    | `/employees` | Employee list |
| POST   | `/employees` | Create employee |
| GET    | `/employees/{id}` | Employee detail |
| GET    | `/employees/{id}/projects` | Assigned projects |

### Analytics
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET    | `/analytics/dashboard` | KPI summary |
| GET    | `/analytics/sales-funnel` | Lead → Deal conversion |
| GET    | `/analytics/revenue` | Revenue by month/project |
| GET    | `/analytics/project-progress` | All projects progress |
| GET    | `/analytics/cash-flow` | Monthly cash flow |

### AI
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST   | `/ai/proposal-generate` | Generate proposal from specs |
| POST   | `/ai/solar-sizing` | Suggest optimal system size |
| POST   | `/ai/cost-predict` | Predict project cost |
| POST   | `/ai/follow-up-suggest` | Smart follow-up message |
| POST   | `/ai/invoice-summarize` | Summarize invoice in Bangla/English |

### Public / Website
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET    | `/public/services` | Services list |
| GET    | `/public/portfolio` | Project portfolio |
| POST   | `/public/contact` | Contact form → lead capture |
| GET    | `/public/pages/{slug}` | CMS page content |

---

## 3. 🖥️ UI SCREEN BREAKDOWN

### Web (Next.js 14 — App Router)

#### Auth
- `/login` — Login form (EN/BN toggle)
- `/forgot-password` — Reset flow

#### Dashboard (`/dashboard`)
- KPI cards: Leads, Active Projects, Monthly Revenue, Overdue Invoices
- Sales funnel chart (Recharts)
- Cash flow graph
- Recent activities feed
- Tasks due today

#### CRM
- `/crm/leads` — Kanban board (drag & drop stages) + list view
- `/crm/leads/new` — Lead creation form
- `/crm/leads/[id]` — Lead detail: timeline, activities, linked proposals
- `/crm/clients` — Client list with search
- `/crm/clients/[id]` — Client 360: contacts, projects, invoices, communication history

#### Proposals
- `/proposals` — List with filters (status, type, date)
- `/proposals/new` — Step wizard:
  - Step 1: Select template & client
  - Step 2: Fill specs (solar sizing calc inline)
  - Step 3: Build equipment list
  - Step 4: ROI calculator
  - Step 5: Review & preview
- `/proposals/[id]` — Detail view with status badges, PDF preview, approval button
- `/proposals/[id]/edit` — Edit draft
- `/proposals/ai` — AI generator (input: load kW, budget BDT, type)

#### Projects
- `/projects` — List with status filters
- `/projects/new` — Create form (linked to won proposal)
- `/projects/[id]` — Tabbed:
  - Overview (map, summary, team)
  - Tasks (Gantt view + Kanban)
  - Survey & Design
  - Materials
  - Financials
  - Documents
- `/projects/[id]/tasks/[taskId]` — Task detail

#### Invoices & Finance
- `/invoices` — List (filter by status, client, date)
- `/invoices/new` — Create invoice
- `/invoices/[id]` — Invoice detail + payment history
- `/receipts` — All payment receipts
- `/receipts/[id]` — Receipt detail

#### Accounting
- `/accounting/chart-of-accounts` — Account tree
- `/accounting/journals` — Journal entries
- `/accounting/reports/profit-loss` — P&L report
- `/accounting/reports/balance-sheet`
- `/accounting/reports/cashbook`
- `/accounting/reports/project-profitability`

#### Inventory
- `/inventory/products` — Stock list + low stock alerts
- `/inventory/purchase-orders` — PO management
- `/inventory/movements` — Stock in/out history

#### HR
- `/hr/employees` — Employee directory
- `/hr/employees/[id]` — Profile + assignment history

#### Settings
- `/settings/users` — User management + role assignment
- `/settings/permissions` — Permission matrix
- `/settings/templates` — Proposal/invoice templates
- `/settings/accounts` — Chart of accounts setup
- `/settings/cms` — Website content management
- `/settings/localization` — Language/currency settings

---

### Mobile (React Native)

| Screen | Description |
|--------|-------------|
| Home | Dashboard with KPIs and quick actions |
| Leads | Scrollable lead list + quick stage update |
| Lead Detail | Activity log, add note/call |
| Projects | Active projects list |
| My Tasks | Personal task list with filter |
| Task Detail | Edit status, add comment, attach photo |
| Survey | Offline survey form (saves to SQLite → syncs) |
| Invoices | View + send |
| Camera Upload | Direct photo attach to project/survey |
| Notifications | Push notification center |

---

## 4. 📁 FOLDER STRUCTURE

### Laravel Backend
```
solar-erp-api/
├── app/
│   ├── Http/
│   │   ├── Controllers/
│   │   │   ├── Auth/
│   │   │   ├── CRM/
│   │   │   │   ├── LeadController.php
│   │   │   │   └── ClientController.php
│   │   │   ├── Proposal/
│   │   │   │   ├── ProposalController.php
│   │   │   │   └── ProposalTemplateController.php
│   │   │   ├── Project/
│   │   │   │   ├── ProjectController.php
│   │   │   │   ├── TaskController.php
│   │   │   │   └── SurveyController.php
│   │   │   ├── Finance/
│   │   │   │   ├── InvoiceController.php
│   │   │   │   ├── PaymentController.php
│   │   │   │   └── AccountingController.php
│   │   │   ├── Inventory/
│   │   │   │   ├── ProductController.php
│   │   │   │   └── PurchaseOrderController.php
│   │   │   ├── HR/
│   │   │   │   └── EmployeeController.php
│   │   │   ├── Analytics/
│   │   │   │   └── DashboardController.php
│   │   │   ├── AI/
│   │   │   │   └── AIController.php
│   │   │   └── Public/
│   │   │       └── PublicController.php
│   │   ├── Middleware/
│   │   │   ├── CheckRole.php
│   │   │   ├── CheckPermission.php
│   │   │   └── SetLocale.php
│   │   └── Requests/
│   │       ├── StoreLeadRequest.php
│   │       ├── StoreProposalRequest.php
│   │       └── ...
│   ├── Models/
│   │   ├── User.php
│   │   ├── Lead.php
│   │   ├── Client.php
│   │   ├── Proposal.php
│   │   ├── Project.php
│   │   ├── Invoice.php
│   │   ├── Payment.php
│   │   ├── JournalEntry.php
│   │   ├── Account.php
│   │   ├── Product.php
│   │   └── Employee.php
│   ├── Services/
│   │   ├── ProposalService.php          # sizing calc, PDF gen
│   │   ├── SolarSizingService.php       # ROI engine
│   │   ├── InvoiceService.php           # PDF, status updates
│   │   ├── AccountingService.php        # auto journal posting
│   │   ├── AIService.php                # Ollama integration
│   │   └── NotificationService.php
│   ├── Jobs/
│   │   ├── SendProposalEmail.php
│   │   ├── SendInvoiceEmail.php
│   │   ├── GenerateProposalPDF.php
│   │   └── SyncMeilisearch.php
│   ├── Events/
│   │   ├── ProposalViewed.php
│   │   ├── PaymentReceived.php
│   │   └── LeadStageChanged.php
│   ├── Listeners/
│   ├── Notifications/
│   │   ├── ProposalSentNotification.php
│   │   └── PaymentDueNotification.php
│   └── Policies/
│       ├── ProposalPolicy.php
│       └── ProjectPolicy.php
├── database/
│   ├── migrations/
│   └── seeders/
│       ├── ChartOfAccountsSeeder.php
│       ├── PermissionsSeeder.php
│       └── DemoDataSeeder.php
├── routes/
│   ├── api.php            # versioned: v1
│   ├── web.php            # webhook handlers
│   └── channels.php       # Soketi broadcast channels
├── config/
│   ├── ai.php             # Ollama endpoint config
│   └── solar.php          # VAT rate, BDT settings
└── lang/
    ├── en/
    └── bn/
```

### Next.js Frontend
```
solar-erp-web/
├── app/
│   ├── (auth)/
│   │   └── login/
│   ├── (app)/
│   │   ├── dashboard/
│   │   ├── crm/
│   │   │   ├── leads/
│   │   │   └── clients/
│   │   ├── proposals/
│   │   ├── projects/
│   │   ├── invoices/
│   │   ├── receipts/
│   │   ├── accounting/
│   │   ├── inventory/
│   │   ├── hr/
│   │   └── settings/
│   └── public-site/   # public-facing pages
├── components/
│   ├── ui/            # shadcn/ui base
│   ├── crm/
│   ├── proposal/
│   │   ├── SolarSizingCalc.tsx
│   │   ├── ROICalculator.tsx
│   │   └── ProposalPDFPreview.tsx
│   ├── project/
│   │   └── GanttChart.tsx
│   ├── charts/
│   └── layout/
├── lib/
│   ├── api.ts         # Axios + React Query setup
│   ├── auth.ts
│   └── i18n.ts        # next-intl setup
├── stores/            # Zustand stores
├── hooks/
└── public/
    └── locales/
        ├── en.json
        └── bn.json
```

### React Native (Mobile)
```
solar-erp-mobile/
├── src/
│   ├── screens/
│   ├── components/
│   ├── navigation/
│   ├── services/
│   │   ├── api.ts
│   │   └── offlineSync.ts   # WatermelonDB
│   ├── stores/
│   └── utils/
├── android/
└── ios/
```

---

## 5. 🔄 EXAMPLE WORKFLOW: Lead → Proposal → Project → Invoice → Payment

```
1. LEAD CAPTURE
   Website contact form → POST /public/contact
   → Lead created (stage: "new")
   → Assigned to Sales rep
   → Notification sent via Soketi WebSocket

2. CRM NURTURING
   Sales rep adds activities (call, meeting)
   → Stage moves: new → contacted → survey
   → Engineer assigned for site survey
   → Survey data saved: load 150 kW, roof 8,000 sqft

3. PROPOSAL GENERATION
   POST /ai/proposal-generate
   {load_kw: 150, budget_bdt: 8500000, type: "industrial_solar"}
   ↓
   AI (Ollama) returns: 150kW system, 375 × 400W panels,
   150kW inverter, payback 4.2 years, ROI 24%
   ↓
   Proposal created → manager approves
   → PDF generated → emailed to client
   → Stage: proposal_sent
   → ViewTracking pixel in email → PATCH /proposals/{id}/status (viewed)

4. NEGOTIATION → WON
   Client accepts → stage: won
   → Project created from proposal
   → Milestones: Design → Procurement → Installation → Testing → Handover

5. PROJECT EXECUTION
   Tasks assigned to engineers
   PO created for solar panels from vendor
   Stock movements tracked
   Survey & design docs attached

6. INVOICING
   Milestone 1 complete: POST /invoices
   {billing_type: "milestone", milestone_id: 12, amount: 2500000}
   → Invoice emailed → status: sent

7. PAYMENT
   Client pays via bank transfer
   POST /payments {invoice_id, amount: 2500000, method: "bank_transfer"}
   ↓
   Invoice status → paid
   Auto journal entry posted:
     DR: Bank Account         2,500,000
     CR: Accounts Receivable  2,500,000
   Receipt PDF generated and emailed
```

---

## 6. 📋 SAMPLE JSON

### Proposal JSON
```json
{
  "id": 42,
  "proposal_no": "PROP-2025-0042",
  "template_type": "industrial_solar",
  "version": 2,
  "title": "150kW Rooftop Solar System – ABC Textile Mills Ltd.",
  "client": {
    "id": 8,
    "company_name": "ABC Textile Mills Ltd.",
    "contact": { "name": "Mr. Karim Hossain", "phone": "+8801711-000000" }
  },
  "valid_until": "2025-09-30",
  "status": "sent",
  "solar_specs": {
    "system_size_kw": 150,
    "annual_generation_kwh": 195000,
    "panel_qty": 375,
    "panel_watt": 400,
    "panel_brand": "Canadian Solar",
    "inverter_brand": "Huawei SUN2000",
    "inverter_kw": 150,
    "avg_monthly_bill_bdt": 180000,
    "monthly_savings_bdt": 150000,
    "payback_years": 4.2,
    "roi_percent": 23.8,
    "co2_offset_kg_year": 146250
  },
  "items": [
    {
      "category": "Solar Panels",
      "description": "Canadian Solar CS6W-400MS 400W Mono PERC",
      "qty": 375, "unit": "pcs",
      "unit_price": 15000,
      "total_price": 5625000
    },
    {
      "category": "Inverter",
      "description": "Huawei SUN2000-150KTL-H1 String Inverter",
      "qty": 1, "unit": "pcs",
      "unit_price": 850000,
      "total_price": 850000
    },
    {
      "category": "Structure",
      "description": "Galvanized MS Structure (Rooftop Mounting)",
      "qty": 1, "unit": "lot",
      "unit_price": 600000,
      "total_price": 600000
    },
    {
      "category": "DC/AC Cabling",
      "description": "Solar DC Cable 6mm² + AC Panel Cable",
      "qty": 1, "unit": "lot",
      "unit_price": 250000,
      "total_price": 250000
    },
    {
      "category": "Installation & Civil",
      "description": "Installation, wiring, testing & commissioning",
      "qty": 1, "unit": "lot",
      "unit_price": 350000,
      "total_price": 350000
    }
  ],
  "financials": {
    "subtotal": 7675000,
    "discount_pct": 3,
    "discount_amt": 230250,
    "vat_pct": 7.5,
    "vat_amount": 556688,
    "total_amount": 8001438,
    "currency": "BDT"
  },
  "ai_generated": true,
  "created_at": "2025-07-15T10:30:00Z"
}
```

### Invoice JSON
```json
{
  "id": 101,
  "invoice_no": "INV-2025-0101",
  "project": {
    "id": 19,
    "project_no": "PROJ-2025-019",
    "name": "150kW Solar – ABC Textile Mills"
  },
  "client": {
    "id": 8,
    "company_name": "ABC Textile Mills Ltd.",
    "billing_address": "123 Industrial Area, Gazipur, Dhaka"
  },
  "milestone": {
    "id": 12,
    "title": "Supply of Materials & Equipment"
  },
  "invoice_date": "2025-08-01",
  "due_date": "2025-08-15",
  "billing_type": "milestone",
  "items": [
    {
      "description": "375 pcs Canadian Solar 400W Panels",
      "qty": 1, "unit": "lot",
      "unit_price": 5625000,
      "total_price": 5625000
    },
    {
      "description": "Huawei SUN2000-150KTL-H1 Inverter",
      "qty": 1, "unit": "pcs",
      "unit_price": 850000,
      "total_price": 850000
    }
  ],
  "financials": {
    "subtotal": 6475000,
    "discount_amt": 0,
    "vat_pct": 7.5,
    "vat_amount": 485625,
    "total_amount": 6960625,
    "paid_amount": 0,
    "due_amount": 6960625,
    "currency": "BDT"
  },
  "status": "sent",
  "created_at": "2025-08-01T09:00:00Z"
}
```

---

## 7. ⚡ OPTIMIZATION STRATEGY FOR 2000+ CONCURRENT USERS

### Application Layer
| Strategy | Implementation |
|----------|---------------|
| **Horizontal scaling** | Docker containers behind NGINX load balancer (round-robin or least-connections) |
| **PHP-FPM tuning** | `pm.max_children = 100`, `pm.start_servers = 20`, `pm.max_requests = 500` |
| **Stateless API** | JWT auth — no server-side sessions, scales freely |
| **Async jobs** | Laravel Horizon + Redis Queues for PDF gen, emails, AI calls |
| **WebSocket server** | Soketi (self-hosted, Pusher-compatible) — separate pod |

### Database Layer
| Strategy | Implementation |
|----------|---------------|
| **Read replicas** | MySQL 1 writer + 2 read replicas; route reads via `DB::connection('read')` |
| **Indexing** | Composite indexes on hot query paths (stage, assigned_to, due_date) |
| **Query caching** | Redis cache on analytics queries (TTL 5 min) |
| **Connection pooling** | ProxySQL for connection pooling (max 200 connections) |
| **Partitioning** | Partition `stock_movements` and `journal_lines` by month |

### Caching Strategy
```
L1 — Application: Laravel in-memory (route caching, config caching)
L2 — Redis:
  • Auth tokens: TTL 24h
  • Dashboard KPIs: TTL 5min
  • Product stock: TTL 30s
  • User permissions: TTL 1h
L3 — CDN (CloudFlare):
  • Public website pages
  • Static assets (proposal PDFs after generation)
```

### Search
- **Meilisearch** indexes: `leads`, `clients`, `projects`, `products`
- Typo-tolerant instant search, sub-50ms responses
- Updated via queue jobs on record change

### AI Integration (Ollama)
- Run Ollama on dedicated GPU server (separate from API)
- Request queued via Redis — AI responses async
- Cache similar proposal specs (hash input → Redis) to avoid regeneration

### Frontend
- Next.js 14 App Router with RSC (server components reduce JS bundle)
- React Query for data fetching with stale-while-revalidate
- Code splitting per module — lazy load accounting, reports
- Image optimization via `next/image`

### Mobile Offline-First
- WatermelonDB (SQLite) for offline storage
- Background sync when connectivity restored
- Conflict resolution: server-wins with local queue

### Infrastructure (Production)
```
                        [CloudFlare CDN]
                              │
                        [NGINX LB]
                      /         \
               [API Pod 1]  [API Pod 2]  ...
                      \         /
                   [Redis Cluster]
                         │
            [MySQL Primary] → [Replica ×2]
                         │
              [Meilisearch]  [Soketi]
                         │
                   [Ollama GPU Server]
```

**Estimated capacity at this setup:** 3,000–5,000 concurrent users with < 200ms p95 response time.

---

## 📋 QUICK START CHECKLIST

- [ ] Run `php artisan migrate` + seed chart of accounts
- [ ] Configure `.env`: DB, Redis, Soketi, Meilisearch, Ollama endpoint
- [ ] Run `php artisan horizon` for queue workers
- [ ] Set up `cron` for `php artisan schedule:run` (overdue invoice alerts, reminders)
- [ ] Configure Meilisearch indexes: `php artisan scout:import`
- [ ] Install Ollama + pull model: `ollama pull llama3` (or `mistral`)
- [ ] Build Next.js: `npm run build`
- [ ] Set `NEXT_PUBLIC_LOCALE=bn` for Bangla-first deployment

---

*System designed for SolarEdge ERP v1.0 — Bangla + English | BDT | Solar & Substation*
