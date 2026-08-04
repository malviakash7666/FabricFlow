# FabricFlow - B2B Textile & Fabric Sourcing Marketplace

FabricFlow is a responsive, feature-rich B2B Textile Marketplace prototype designed to streamline procurement between garment manufacturers (Buyers) and textile mills (Suppliers). It combines a modern design system with AI-driven workflows to simplify fabric discovery, custom bidding, and inventory management.

---

## 🚀 Key Highlights & Modules

### 1. Buyer Experience (Procurement & Discovery)
* **Marketplace Catalog**: Search, browse, and filter fabrics dynamically by category, color, maximum price, and minimum order quantity (MOQ).
* **AI Sourcing Assistant**: Converse in natural language or utilize **voice-based mic assistance** (Speech-to-Text & Text-to-Speech) to source fabrics, ask Q&As, or generate comparative spec tables.
* **Wholesale Sourcing & Checkout**: Add bulk fabric orders (gated by supplier MOQ limits) to a sliding cart drawer and complete shipping parameters.
* **Procurement Sourcing Board (RFQ)**: Create custom requests for custom compositions or large volumes, allowing mills to compete for your orders.
* **Order Tracking Timeline**: Track sourcing requests in real-time through production and shipping stages (`Placed` ➔ `Accepted` ➔ `Preparing` ➔ `Ready for Dispatch` ➔ `Completed`).

### 2. Supplier Experience (Mill Administration)
* **Inventory Hub**: Full catalog CRUD capability (Add, Edit, Delete listings) with stock thresholds and active/inactive status toggles.
* **AI Autocomplete Spec Helper**: Enter a single sentence describing a fabric (e.g. *"soft charcoal wool under 400"*), and the AI automatically pre-fills the technical specifications (GSM, width, composition), suggested wholesale price, MOQ, and generates marketing copy.
* **Bidding Sourcing Board**: View open buyer RFQ procurement requests, submit bids (price, timeline, notes), and log won/lost quotes.
* **Incoming Orders Fullfillment**: Process incoming orders through production, log tracking details, and advance status steps.

---

## 🛠️ Technology Stack

| Layer | Technology | Details |
| :--- | :--- | :--- |
| **Frontend** | React 19, TypeScript, Vite | Fast HMR compiling, strict types |
| **Styling** | Tailwind CSS v4, Lucide Icons | Fluid grids, dark glassmorphism, responsive layout |
| **State & Routes** | Redux Toolkit, React Router DOM v7 | Unified authentication, cart, and dashboard navigation |
| **Backend** | Node.js, Express | Modular RESTful API router structure |
| **Database** | PostgreSQL, Sequelize ORM | Relational models, cascaded deletes, sync schemas |
| **AI Integration** | Hugging Face Inference API | Meta-Llama-3-8B-Instruct LLM with local regex heuristic fallbacks |

---

## 🔐 Login Credentials (Pre-seeded Data)

Use these accounts to test the buyer and supplier workflows:

| Role | Email | Password | Pre-seeded Profile details |
| :--- | :--- | :--- | :--- |
| **Buyer** | `buyer@fabricflow.com` | `Password123` | **Apex Garments Ltd** (Apparel Manufacturer in Mumbai) |
| **Supplier** | `supplier@fabricflow.com` | `Password123` | **Vardhman Textile Mills** (Textile Mill in Ahmedabad) |

---

## ⚙️ Installation & Local Setup

### 📦 Prerequisites
* [PostgreSQL](https://www.postgresql.org/) database running locally.
* Create a database named `FabricFlow`.
* Node.js (v18+) and npm installed.

### 1. Database & Backend Configuration
1. Navigate to the `backend` folder:
   ```bash
   cd backend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Configure the environment variables in `.env` (adjust DB port/password as needed):
   ```env
   NODE_ENV=development
   PORT=5000
   DB_USERNAME=postgres
   DB_PASSWORD=your_postgres_password
   DB_NAME=FabricFlow
   DB_HOST=localhost
   DB_PORT=5432
   DB_DIALECT=postgres
   ACCESS_TOKEN_SECRET=your_access_secret_key
   REFRESH_TOKEN_SECRET=your_refresh_secret_key
   HUGGINGFACE_API_KEY=your_optional_huggingface_api_token
   ```

### 2. Database Sync & Seeding
Populate the database with tables, accounts, profiles, and initial fabric products by running the custom seeder script:
```bash
node src/database/seed.js
```
*(Optional: If executing migrations in a deployment pipeline, run: `npx sequelize-cli db:migrate`)*

### 3. Start Backend Server
```bash
npm run dev
```
The backend server runs on `http://localhost:5000`.

### 4. Start Frontend Client
1. Open a new terminal and navigate to the `frontend` folder:
   ```bash
   cd ../frontend
   ```
2. Install client dependencies:
   ```bash
   npm install
   ```
3. Start the Vite React compiler:
   ```bash
   npm run dev
   ```
The client app runs on `http://localhost:5173`.

---

## 📁 Repository Structure

```
FabricFlow/
├── backend/
│   ├── src/
│   │   ├── database/       # Migrations, seeders, connection config, and Sequelize models
│   │   ├── middleware/     # JWT authentication and Role authorization handlers
│   │   ├── modules/        # API routes and controllers (ai, buyer, supplier, product, cart, orders, rfq)
│   │   └── utils/          # Token utilities and helper modules
│   ├── server.js           # Server initializer and database connections
│   └── package.json
│
├── frontend/
│   ├── src/
│   │   ├── components/     # Reusable blocks (AI Chat Panel)
│   │   ├── hooks/          # React hooks (useAuth, useCart)
│   │   ├── pages/          # Storefront, Onboarding, Login, and Dashboards
│   │   ├── services/       # Axios API integration connectors
│   │   ├── store/          # Redux Toolkit config and slice parameters
│   │   ├── App.tsx         # Route router guards
│   │   └── main.tsx
│   ├── package.json
│   └── vite.config.ts
└── README.md               # Main instructions file
```
