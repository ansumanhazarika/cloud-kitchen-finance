# SpiceBox Kitchen — Finance Hub

## Tech Stack
- **Frontend:** Single-file React 18 (CDN), Babel standalone (no build step)
- **Backend:** Google Apps Script (Sheets sync via doGet/doPost)
- **Storage:** Google Sheets + localStorage (offline cache)
- **Deploy:** GitHub Pages (auto-deploy on push to main)
- **Auth:** PIN-based (SHA-256, salt: spicebox_kitchen_salt)

## Architecture
- `index.html` — entire app (React + CSS-in-JS + logic)
- `apps-script-code.js` — Google Apps Script code (deployed separately in Google Sheets)
- No build step, no node_modules, no bundler

## Key URLs
- **Live site:** https://ansumanhazarika.github.io/cloud-kitchen-finance/
- **Repo:** https://github.com/ansumanhazarika/cloud-kitchen-finance

## Data Schema
id, date, dateTo, type, category, amount, commission, gst, deliveryCharge, netAmount, paidBy, note, status

## Business Details
- **People:** Rajesh, Priya (partners)
- **Income:** Direct Order, Zomato Order, Swiggy Order, Catering, Special Events
- **Expenses:** Raw Materials, Packaging, Gas, Electricity, Maid, Staff Salaries, Equipment, Marketing, Misc
- **Platform deductions:** Zomato & Swiggy orders have commission/GST deducted from gross
- **Staff:** Cook (Suresh), Helper (Ramu), Kitchen cleaner

## Conventions
- All styling is inline CSS-in-JS (no external stylesheets)
- Currency: INR
- Cache key prefix: sbk_
- Primary color: #d97706 (amber)
- Sync is debounced at 1.5s
