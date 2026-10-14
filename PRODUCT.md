# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users
Primary: makers, hobbyists and engineering students in India buying sensors, development boards, IoT modules, robotics kits and accessories for their own projects. Carts are small, buyers are price-sensitive, and they usually arrive knowing roughly which part they need. Many shop on phones.

Secondary: the store owner and staff, who use the admin panel to manage products, categories, stock, orders, customers and store settings.

## Product Purpose
Zetra Electronics is an online store for electronic components in India. It exists so a maker can find the right part, trust that it is genuine, pay with Razorpay and get it delivered quickly with a proper invoice. Success is a buyer finding the part, understanding it from its specs and datasheet, and checking out without friction.

## Positioning
Four promises together: genuine, tested parts; fast shipping across India; clear technical specs and datasheets on every product; fair pricing with a GST invoice on every order.

## Operating Context
- Storefront: home, catalog with category and price filters, search, product detail with specs and datasheet, cart, checkout with Indian address and PIN-code lookup, Razorpay payment, order success, order tracking, invoice download, profile, auth (email/password and Google), email verification, password reset, help, contact, privacy, terms.
- Admin (ADMIN role only): dashboard with stats and sales chart, products (create, edit, delete, image upload), categories with subcategories, inventory, orders with fulfilment and tracking URL, customers, store settings (GST, shipping, hero content, contact details, social links).
- Currency is INR. Taxes are GST. Addresses are Indian.

## Capabilities and Constraints
- Next.js 16 App Router, React 19, Tailwind CSS 4, Zustand, lucide-react, framer-motion, recharts. Backend is a NestJS REST API; the frontend must keep its API contracts.
- Store contact details, hero content and social links come from admin settings and may be empty. Empty settings must never be replaced with invented values.
- There is no wishlist, no reviews and no analytics tracking today.

## Brand Commitments
- Name: Zetra Electronics.
- Logo: blue script "Zetra" inside a red ring, file apps/web/public/logo.png (transparent PNG). Keep it.
- Colors: build around the logo's blue; the red ring is a sparing accent.
- Tagline: "Electrify Your Needs With Us".

## Evidence on Hand
- Logo file only. No product photography library, testimonials, customer counts, ratings or press exist. Do not fabricate any of them.

## Product Principles
1. The part is the hero: specs, stock and price must be readable at a glance.
2. Trust is earned with facts (genuine parts, GST invoice, real contact details), never with invented proof.
3. Mobile checkout must be as fast as desktop.
4. Admin is a tool: speed and density over expression.

## Accessibility & Inclusion
Target WCAG 2.2 AA across storefront and admin, including linked form labels, keyboard access, reduced motion and reduced transparency support.
