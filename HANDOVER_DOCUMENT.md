# Zetra Electronics — Deployment Handover Document

**Prepared by:** The Ark Tech  
**Date:** May 2026  
**Website:** https://zetraelectronics.com  
**Document Version:** 1.0

---

## Table of Contents

1. [Project Overview](#1-project-overview)
2. [System Architecture](#2-system-architecture)
3. [Access Credentials](#3-access-credentials)
4. [Customer-Facing Website](#4-customer-facing-website)
5. [Admin Panel — Complete Guide](#5-admin-panel--complete-guide)
6. [How to Add & Manage Products](#6-how-to-add--manage-products)
7. [How to Manage Orders](#7-how-to-manage-orders)
8. [Settings Configuration](#8-settings-configuration)
9. [Customer Workflow (End-to-End)](#9-customer-workflow-end-to-end)
10. [Complete Feature List](#10-complete-feature-list)
11. [Technical Infrastructure](#11-technical-infrastructure)

---

## 1. Project Overview

Zetra Electronics is a full-stack e-commerce platform built for selling electronic components online in India. It includes a customer-facing storefront and a complete admin panel for managing the business.

**What the platform does:**
- Customers can browse products, add to cart, and pay online via Razorpay (UPI, Cards, NetBanking)
- Admin can manage products, categories, orders, customers, and store settings
- Orders are tracked from placement to delivery with courier tracking support
- PDF invoices are automatically generated for every order
- GST, shipping fees, and tax calculations are handled automatically

---

## 2. System Architecture

```
┌─────────────────────────────────────────────────────────┐
│                   CUSTOMER / ADMIN BROWSER               │
└──────────────────────────┬──────────────────────────────┘
                           │ HTTPS
┌──────────────────────────▼──────────────────────────────┐
│           NEXT.JS FRONTEND  (Port 3000)                  │
│     zetraelectronics.com  →  served via PM2              │
└──────────────────────────┬──────────────────────────────┘
                           │ Internal API calls
┌──────────────────────────▼──────────────────────────────┐
│           NESTJS BACKEND API  (Port 4000)                │
│         zetraelectronics.com/api  →  served via PM2      │
└──────────────────────────┬──────────────────────────────┘
                           │
┌──────────────────────────▼──────────────────────────────┐
│           POSTGRESQL DATABASE  (Port 5432)               │
│               Database: zetra_db                         │
└─────────────────────────────────────────────────────────┘
```

**Hosting:** Hostinger VPS — IP: 187.127.140.206  
**Domain:** zetraelectronics.com  
**Process Manager:** PM2 (keeps both services running 24/7)  
**Database:** PostgreSQL

---

## 3. Access Credentials

> **IMPORTANT:** Change all passwords after receiving this document.

### Website Admin Panel
| Field | Value |
|-------|-------|
| URL | https://zetraelectronics.com/admin |
| Email | admin@zetraelectronics.com |
| Password | *(provided separately)* |
| Role | ADMIN (full access) |

### VPS Server Access (SSH)
| Field | Value |
|-------|-------|
| Host | 187.127.140.206 |
| Username | root |
| Password | *(provided separately)* |
| SSH Command | `ssh root@187.127.140.206` |

### GitHub Repository
| Field | Value |
|-------|-------|
| URL | https://github.com/sherwynjoel/Tech-uc-e-commerce |
| Branch | main |

### Database (PostgreSQL)
| Field | Value |
|-------|-------|
| Host | localhost (on VPS only) |
| Database | zetra_db |
| User | zetra |
| Password | *(in `/home/zetra/Tech-uc-e-commerce/apps/api/.env`)* |

---

## 4. Customer-Facing Website

### All Public Pages

| Page | URL | Description |
|------|-----|-------------|
| Homepage | `/` | Hero section, featured products, category grid |
| All Products | `/products` | Full product catalog with filters and search |
| Product Detail | `/products/{id}` | Product images, specs, add to cart |
| Shopping Cart | `/cart` | View and edit cart items |
| Checkout | `/checkout` | Address, payment, order placement |
| Order Success | `/checkout/success` | Confirmation after payment |
| Track Orders | `/track-order` | Customer's order history and status |
| Login | `/login` | Email/password and Google login |
| Register | `/register` | New customer account creation |
| Forgot Password | `/forgot-password` | Password reset request |
| Contact | `/contact` | Contact form |
| Help | `/help` | FAQ page |
| Privacy Policy | `/privacy` | Privacy policy |
| Terms of Service | `/terms` | Terms and conditions |

### Navigation Features
- **Top bar (desktop):** Store phone, email, Track Order link, Help Center
- **All Categories dropdown:** Shows all categories added by admin — dynamically loaded
- **Search bar:** Live search across all products by name
- **Cart icon:** Shows item count badge
- **Login / My Account:** Authentication buttons
- **Mobile menu:** Full hamburger menu with all categories and account links

---

## 5. Admin Panel — Complete Guide

### Accessing the Admin Panel

1. Go to: **https://zetraelectronics.com/admin**
2. Log in with your admin email and password
3. You will be automatically redirected to the dashboard

> Only accounts with **ADMIN** role can access `/admin`. Regular customer accounts will be redirected away.

---

### 5.1 Dashboard (`/admin`)

The dashboard shows a real-time overview of the business:

| Card | What it shows |
|------|--------------|
| Total Revenue | Sum of all completed order payments |
| Total Orders | Number of all orders placed |
| Active Products | Number of products currently in catalog |
| Total Users | Number of registered customer accounts |

**Sales Chart:** A line graph showing revenue over recent days/weeks.

**Recent Orders:** A table of the latest orders with status, customer, and amount — click any row to view order details.

---

### 5.2 Products (`/admin/products`)

Shows a table of all products with:
- Product image thumbnail
- Product name and category
- Price and stock count
- Edit / Delete buttons

**Sorting:** Click column headers (Name, Price, Stock) to sort ascending or descending.

---

### 5.3 Orders (`/admin/orders`)

Full list of all customer orders. Each row shows:
- Order ID (e.g., #00001)
- Date and time (Indian timezone)
- Customer name, phone, city/state
- Order status with color badge
- Total amount
- Tracking URL (if added)

**Order Status Colors:**
- 🟡 **PENDING** — Payment received, not yet shipped
- 🔵 **SHIPPED** — Dispatched with courier
- 🟢 **DELIVERED** — Customer received the order
- 🔴 **CANCELLED** — Order was cancelled

**Actions on each order:**
1. **View** — Opens full order details page
2. **Print** — Opens a printable address label for the courier
3. **Invoice** — Downloads a PDF invoice
4. **Fulfill** — Opens a panel to update status and add tracking URL

---

### 5.4 Customers (`/admin/customers`)

Lists all registered users with:
- Customer name and email
- Account role (CUSTOMER / ADMIN)
- Total number of orders placed
- Account creation date

---

### 5.5 Inventory (`/admin/inventory`)

Two tabs:

**Products Tab:**
- Search products by name
- Filter by category, min/max price, min/max stock
- Stock levels below 10 units are highlighted in **red** as a low-stock warning

**Categories Tab:**
- Create new categories (name + optional description)
- Delete existing categories
- Categories here appear in the storefront navigation and product filters

---

### 5.6 Settings (`/admin/settings`)

Configure your entire store from this page. See [Section 8](#8-settings-configuration) for full details.

---

## 6. How to Add & Manage Products

### Adding a New Product

1. Go to **Admin → Products** (`/admin/products`)
2. Click **"Add Product"** button (top right)
3. Fill in the product form:

| Field | Description | Example |
|-------|-------------|---------|
| **Name** | Product title | "Arduino Uno R3" |
| **Description** | What the product is | "Microcontroller board based on ATmega328P..." |
| **Price (₹)** | Selling price | 599 |
| **Shipping Cost (₹)** | Per-item shipping (0 = free) | 50 |
| **Category** | Select from your categories | "Development Boards" |
| **Stock** | Units available | 100 |
| **Image** | Upload product photo (JPG/PNG) | — |
| **Datasheet** | URL to PDF datasheet (optional) | https://... |
| **Specs** | Technical specifications as JSON | `{"Voltage": "5V", "RAM": "2KB"}` |

4. Click **Save** — product is immediately live on the storefront

### Editing a Product

1. Go to **Admin → Products**
2. Click the **Edit** (pencil) icon on any product row
3. Update any fields
4. Click **Save**

### Deleting a Product

1. Go to **Admin → Products**
2. Click the **Delete** (trash) icon on the product row
3. Confirm the deletion

> **Note:** Deleting a product will remove it from the catalog. It will still appear in past orders (order history is preserved).

### Managing Categories

1. Go to **Admin → Inventory** → Categories tab
2. Enter a category name (and optional description)
3. Click **Add Category**

Categories automatically appear in:
- The storefront navigation dropdown
- Product filter sidebar on `/products` page
- The homepage category grid

To delete a category, click the delete icon next to it. This does **not** delete the products in that category — their category field will remain but the category won't appear in navigation.

### Uploading Product Images

- Supported formats: JPG, PNG, WebP
- Recommended size: **800×800px** (square)
- Images are stored on the server at `/uploads/`
- You can also use an external image URL (e.g., from Unsplash or your CDN)

### Adding Technical Specifications

Specs are stored as JSON. Use this format:

```json
{
  "Operating Voltage": "5V",
  "Clock Speed": "16 MHz",
  "Flash Memory": "32 KB",
  "Digital I/O Pins": "14",
  "Analog Input Pins": "6"
}
```

These display as a table on the product page under "Technical Specifications."

### Adding a Datasheet

Enter the full URL to the PDF datasheet in the **Datasheet** field. A "Download Datasheet PDF" button will appear on the product page.

---

## 7. How to Manage Orders

### Order Lifecycle

```
Customer places order
        ↓
   PENDING  ← Payment received, awaiting shipment
        ↓
   SHIPPED  ← Dispatched, tracking URL added
        ↓
  DELIVERED ← Customer confirmed delivery
```

### Fulfilling an Order (Shipping)

1. Go to **Admin → Orders**
2. Find the order (PENDING status)
3. Click the **Fulfill** button on that order row
4. In the panel that opens:
   - Change **Status** to **SHIPPED**
   - Paste the **Courier Tracking URL** (from India Post, Delhivery, Bluedart, etc.)
5. Click **Save** / **Update**

The customer can then:
- See the status change to "Shipped" on their Track Order page
- Click the tracking link to follow their shipment

### Printing an Address Label

1. Click the **Print** button on any order row
2. A new window opens with a formatted shipping label
3. Print it from your browser (Ctrl+P)

The label includes:
- FROM: Zetra Electronics
- TO: Customer name, phone, full address, PIN code
- Order ID and date

### Downloading an Invoice

Click the **Invoice** button on any order row. A PDF invoice is automatically generated with:
- Order ID and date
- Customer billing address
- Itemized product list with quantities and prices
- Subtotal, shipping cost, GST amount, and total

### Cancelling an Order

On the order detail page (`/admin/orders/{id}`), you can change the status to **CANCELLED**.

---

## 8. Settings Configuration

Go to **Admin → Settings** (`/admin/settings`).

All settings auto-load when you open the page. After making changes, click **Save Settings** (floating button, bottom right).

### Store Information
| Setting | Description |
|---------|-------------|
| Store Phone | Phone number shown in navbar and footer |
| Support Email | Email shown in navbar and footer; receives contact form messages |
| Store Address | Physical address shown in footer |

### Tax Configuration
| Setting | Description |
|---------|-------------|
| GST Percentage | Tax rate applied to all orders (default: 18%) |

### Shipping Configuration
| Setting | Description |
|---------|-------------|
| Free Shipping Threshold | Minimum order value (₹) for free shipping |
| Standard Shipping Fee | Flat shipping fee (₹) charged if threshold not met |

**Example:** If threshold = ₹500 and flat fee = ₹60:
- Order ₹499 → customer pays ₹60 shipping
- Order ₹500+ → free shipping

### Homepage Hero
| Setting | Description |
|---------|-------------|
| Hero Subtext | Tagline below the main heading on homepage |
| Hero Banner Image | Image shown on the right side of the hero section |

### Social Media Links
| Setting | Description |
|---------|-------------|
| Instagram URL | Full URL (e.g., `https://instagram.com/zetraelectronics`) |
| Twitter/X URL | Full URL |
| LinkedIn URL | Full URL |

These appear as icons in the website footer.

---

## 9. Customer Workflow (End-to-End)

### Step 1: Account Creation
1. Customer visits `/register`
2. Enters name, email, password
3. Account is created and logged in automatically
4. *(Optional)* Verify email via link sent to inbox

### Step 2: Browsing Products
- Browse by category (navbar dropdown or homepage category grid)
- Search by product name (search bar)
- Filter by category, price range on `/products` page
- Click any product to view full details, specs, and datasheet

### Step 3: Adding to Cart
- Click **Add to Cart** on product card or product detail page
- Cart icon in navbar shows item count
- Go to `/cart` to review, update quantities, or remove items

### Step 4: Checkout
1. Go to `/checkout`
2. Fill in shipping address:
   - First Name, Last Name, Phone
   - Street Address
   - PIN Code → **City and State auto-fill from PIN code**
3. Review Order Summary (right side):
   - Items, subtotal, shipping fee, GST, **final total**
4. Click **Place Order**
5. A confirmation modal shows the address — verify and confirm
6. Razorpay payment screen opens (UPI, Cards, NetBanking)
7. Complete payment
8. Redirected to `/checkout/success` with order confirmation

### Step 5: Tracking the Order
1. Go to `/track-order` (must be logged in)
2. All orders are listed with status
3. Visual progress bar shows: Placed → Shipped → Delivered
4. Click courier tracking link (once admin marks as shipped)
5. Download PDF invoice for any order

---

## 10. Complete Feature List

### Customer Features
- [x] Browse products by category
- [x] Search products by keyword
- [x] Filter products by price range
- [x] View product details, specifications, datasheet
- [x] Add / remove / update cart items
- [x] Persistent cart (synced across devices when logged in)
- [x] Guest cart preserved on login
- [x] Checkout with Indian address form
- [x] Auto PIN code lookup (city/state auto-fill)
- [x] Razorpay payment (UPI, Cards, NetBanking)
- [x] Order confirmation page
- [x] Order tracking with visual progress
- [x] Courier tracking link
- [x] PDF invoice download
- [x] Google OAuth login
- [x] Email/password login with forgot password flow
- [x] Order cancellation
- [x] Dark mode support
- [x] Fully mobile responsive
- [x] Fast loading (Lighthouse optimized)

### Admin Features
- [x] Dashboard analytics (revenue, orders, users, products)
- [x] Sales chart visualization
- [x] Add / edit / delete products
- [x] Product image upload
- [x] Technical specifications per product
- [x] Datasheet PDF link per product
- [x] Manage product categories
- [x] View all customer orders
- [x] Update order status (Pending → Shipped → Delivered)
- [x] Add courier tracking URL to orders
- [x] Print address labels
- [x] Download order invoices
- [x] View customer list
- [x] Inventory management with low-stock alerts
- [x] Store settings (phone, email, address, tax, shipping)
- [x] Homepage hero image and text customization
- [x] Social media links management

### Technical Features
- [x] SEO optimized (meta tags, sitemap.xml, robots.txt)
- [x] JSON-LD structured data (Google rich results)
- [x] Security headers (CSP, HSTS, X-Frame-Options)
- [x] JWT authentication
- [x] Rate limiting (5 logins/min, 3 password resets/min)
- [x] Account lockout after 10 failed login attempts
- [x] Image optimization (WebP/AVIF via Next.js)
- [x] Static asset caching (1 year)

---

## 11. Technical Infrastructure

### Technology Stack

| Layer | Technology | Version |
|-------|------------|---------|
| Frontend | Next.js (React) | 15 |
| Backend | NestJS | 11 |
| Database | PostgreSQL | — |
| ORM | Prisma | 5.22 |
| Styling | Tailwind CSS | 4 |
| Auth | JWT + Firebase Auth | — |
| Payments | Razorpay | — |
| Process Manager | PM2 | — |
| Hosting | Hostinger VPS | Ubuntu |

### Database Models

| Table | Description |
|-------|-------------|
| `User` | Customer and admin accounts |
| `Product` | Product catalog with specs, images |
| `Category` | Product categories |
| `CartItem` | Shopping cart items per user |
| `Order` | Customer orders with payment info |
| `OrderItem` | Individual items within each order |
| `SystemSetting` | Store configuration key-value pairs |

### API Structure

The backend API runs at port 4000 and is accessed internally by the frontend.

| Controller | Base Path | Key Endpoints |
|-----------|-----------|---------------|
| Auth | `/auth` | register, login, Google OAuth, password reset |
| Products | `/products` | CRUD + image upload |
| Orders | `/orders` | create, verify payment, fulfill, invoice PDF |
| Cart | `/cart` | add, remove, sync |
| Categories | `/categories` | create, list, delete |
| Settings | `/settings` | get all, update by key |
| Analytics | `/analytics` | dashboard stats, sales chart |
| Contact | `/contact` | send contact form email |

### Environment Variables

Located at `/home/zetra/Tech-uc-e-commerce/apps/api/.env` on the VPS:

```
DATABASE_URL=postgresql://...
JWT_SECRET=...
RAZORPAY_KEY_ID=...
RAZORPAY_KEY_SECRET=...
FRONTEND_URL=https://zetraelectronics.com
SMTP_HOST=...
SMTP_USER=...
SMTP_PASS=...
```

---

## Support & Contact

**Developer:** The Ark Tech  
**Website:** https://thearktech.in  
**Email:** *(contact your developer)*

---

*This document was prepared as part of the project delivery for Zetra Electronics. All credentials marked as "provided separately" will be delivered via a secure channel.*
