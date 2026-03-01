# Specification

## Summary
**Goal:** Build ChickNGo, a QR-based customer loyalty and management system for a chicken shop, runnable on XAMPP with Core PHP, mysqli, and vanilla HTML/CSS/JS.

**Planned changes:**
- Create `database.sql` with the `chickngo` database, four tables (users, customers, scans, offers), and a default hashed admin user (admin / admin123)
- Build a secure login/logout system (`login.php`, `logout.php`) with session validation via an `auth_check` include, inline error messages, and 30-minute idle session timeout
- Build the admin dashboard (`pages/dashboard.php`) with live summary cards: Total Customers, Today's Scans, and Total Points Issued
- Build Add Customer page (`pages/add_customer.php`) with Name and Mobile fields, duplicate mobile validation, unique customer_id generation (CUST + timestamp + random), PHP QR code generation saved to `/qrcodes/<customer_id>.png`, and printable QR card preview
- Build QR Scanner page (`pages/scan.php`) using html5-qrcode, AJAX customer lookup, and an Add Points (+10) button that updates the DB and inserts a scan record with a success animation
- Build Customer Management page (`pages/customers.php`) with a searchable (by mobile), paginated (10 per page) table showing Name, Mobile, Points, and QR thumbnail
- Build Offers Management page (`pages/offers.php`) with create, edit, and delete functionality for offers (Offer Name, Required Points, Reward Description) using modals or inline forms and prepared statements
- Apply a consistent modern SaaS theme across all pages: dark sidebar (#1f2933), orange accent (#ff6b00), white cards with soft shadows and rounded corners, top navbar, and mobile-responsive layout (min 375px); sidebar links to all pages with active item highlight

**User-visible outcome:** An admin can log in, register customers and generate their QR codes, scan QR codes to award loyalty points, manage offers, and view live dashboard analytics — all from a responsive, branded web interface running locally on XAMPP.
