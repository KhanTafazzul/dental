---
name: admistration-side-ui-degine-skill
description: Administration Portal UI/UX & Animation Design System. Design architecture for internal admin portals (Admin, Doctor, Reception/Capture, Finance) with Olive brand aesthetic (#4A5D23, #E4E7D3, #F4F6F0) and dynamic capsule sidebar navigation.
---

# Administration Portal: UI/UX & Animation Design System

This skill defines the design architecture, color system, typography rules, layout patterns, component structures, and motion specifications for internal administration portals (Admin, Doctor, Reception/Capture, Finance, Settings).

---

## 1. Global Design Language

### A. Color Palette (Olive Theme for Data)

The admin side requires high contrast for data readability, so we use a lighter background with Olive reserved for accents, active states, and primary banners.

- **App Background**: `#F4F6F0` (Soft, cool grey-green. Makes white data cards pop).
- **Card Background**: `#FFFFFF` (Pure white for all dashboard widgets and charts).
- **Primary Brand (Olive)**: `#4A5D23` (Used for active sidebar icons, primary buttons, chart lines).
- **Secondary Accent (Soft Sage)**: `#E4E7D3` (Used for active sidebar backgrounds, hover states on table rows).
- **Hero Banner Gradient**: Linear gradient from `#4A5D23` (Dark Olive) to `#6B823E` (Lighter Olive).
- **Text Primary**: `#2C3325` (Charcoal/Dark Green for metric numbers and headers).
- **Text Secondary**: `#8A9380` (Muted grey-green for table headers, chart labels, and subtitles).

### B. Typography

- **Headers & Large Metrics**: `Outfit` (Medium & Semi-Bold). Used for "Good Morning" text, metric numbers, and chart titles.
- **UI, Tables & Body**: `Plus Jakarta Sans` (Regular & Medium). Used for sidebar links, patient names in lists, timestamps, and data labels.

---

## 2. The Dynamic Sidebar (Capsule Navigation)

Core interactive element of the admin interface. A floating sidebar with outer margins (`margin: 16px`).

### Visual States

- **Collapsed State (The Capsule)**:
  - Shape: Tall, slender pill shape floating on the left side.
  - Dimensions: `width: 80px; height: calc(100vh - 32px); margin: 16px;`
  - Border Radius: `border-radius: 60px;`
  - Content: Icons only, centered.
- **Expanded State (The Rectangle)**:
  - Shape: Wide panel with rounded corners.
  - Dimensions: `width: 260px; height: calc(100vh - 32px); margin: 16px;`
  - Border Radius: `border-radius: 24px;`
  - Content: Icons + Text Labels fade in.

### CSS Animation Details

```css
.admin-sidebar {
  background-color: #ffffff;
  box-shadow: 4px 0 24px rgba(74, 93, 35, 0.05);
  overflow: hidden;
  transition:
    width 0.5s cubic-bezier(0.2, 0.8, 0.2, 1),
    border-radius 0.5s cubic-bezier(0.2, 0.8, 0.2, 1);
}

.admin-sidebar.expanded {
  width: 260px;
  border-radius: 24px;
}

.admin-sidebar.collapsed {
  width: 80px;
  border-radius: 60px;
}

.sidebar-text {
  transition:
    opacity 0.3s ease,
    transform 0.3s ease;
}

.admin-sidebar.collapsed .sidebar-text {
  opacity: 0;
  transform: translateX(-10px);
  pointer-events: none;
}
```

---

## 3. Page Layouts & UI Components

### A. Admin Dashboard (Main Overview)

- **Hero Banner**: Rounded rectangle (`border-radius: 20px`). Hero Banner Gradient (`#4A5D23` $\rightarrow$ `#6B823E`). White text ("Good Morning, Admin"). Flat vector illustration or subtle watermark pattern on the right.
- **Metric Cards (4 Columns)**: White cards (`border-radius: 16px`). Primary numbers in `Outfit Semi-Bold` (`#2C3325`). Trend indicators (`+15%`) in soft green/red pills.
- **Activity Chart**: Main line in Primary Olive (`#4A5D23`) with Soft Sage gradient fill underneath.
- **Appointments Table**: Clean table layout with colored status dots (Green = Confirmed, Yellow = Pending).

### B. Doctor Dashboard

- **Personalized Hero Banner**: "Good Morning, Dr. [Name]".
- **Daily Schedule View**: Timeline UI on right with pulsing Olive dot indicator.
- **Patient Queue**: Vertical list expanding a quick-view modal on click.

### C. Capture / Reception Page (Front Desk)

- **Live Queue Blocks**: Clear blocks for patients in clinic.
- **Status Pills**: "In Waiting Room" (Soft Sage), "In Chair 1" (Olive), "Checking Out" (Light Grey).
- **Quick Actions**: Prominent top buttons (+ New Walk-in, Collect Payment, Verify Insurance).

### D. Finance & Settings

- **Finance**: Monochromatic Olive pie charts (Dark Olive, Medium Olive, Soft Sage, Beige).
- **Settings**: Light grey background inputs that gain a 2px Primary Olive border on focus.

---

## 4. Micro-Animations for Data

1. **Card Stagger Fade-In**: Cascading load effect (`translateY(20px)` $\rightarrow$ `0`, `opacity: 0` $\rightarrow$ `1`, `0.4s ease-out`).
2. **Chart Line Draw**: SVG path `stroke-dashoffset` animated from total length to `0` (`1.2s ease-in-out`).
3. **Table Row Hover**: Background transition from `#FFFFFF` to `#FCFDFB` (`0.15s linear`).

# Administration & Staff-Only Internal Pages (11 Total)

(Restricted: Patients CANNOT access these pages. Only Clinic Admins, Doctors, Receptionists, and Helper Staff)

1. Admin Dashboard & Master Appointments Overview
   Route: /admin
   Access: Clinic Admins, Senior Staff
   Description: Global clinic health dashboard, today's top KPIs, quick appointment management, and urgent alerts.

2. Reception & Mobile Capture Console
   Route: /admin/capture
   Access: Receptionists, Front-Desk Staff, Helper Boys
   Description: Live clinic waiting room queue, patient QR scanner, and physical prescription slip camera capture.

3. Doctor Roster & Performance Management
   Route: /admin/doctors
   Access: Clinic Admins, Senior Doctors
   Description: Doctor profile management, shift schedules, vacation roster, daily consultation counts, and payout metrics.

4. Prescription Template Mapper & Billing Engine
   Route: /admin/prescription-mapper
   Access: Doctors, Clinic Admins
   Description: WYSIWYG prescription layout drag-and-drop editor, dynamic font manager, and silent PDF auto-printing.

5. Financial Analytics & Revenue Intelligence
   Route: /admin/finances
   Access: Clinic Admins, Finance Staff
   Description: P&L charts, revenue trends, branch comparison analytics, and profit tracking.

6. Billing & Patient Checkout
   Route: /admin/billing
   Access: Receptionists, Finance Staff
   Description: Invoice generation, payment collection, treatment billing, and receipt printing.

7. Doctor-to-Doctor Internal Chat Portal
   Route: /admin/doctor-chat
   Access: Licensed Doctors, Senior Dentists
   Description: Encrypted internal messaging portal for sharing patient cases, X-rays, and clinical consultations.

8. Clinic Inventory & Stock Management
   Route: /admin/inventory
   Access: Helper Boys, Store Managers, Receptionists
   Description: Medicine stock levels, GS1 barcode scanner receiving, batch tracking, and low-stock alerts.

9. Complaints & Ticket Resolution Center
   Route: /admin/complaints
   Access: Support Staff, Clinic Admins
   Description: Patient complaint logs, DPDP data request resolutions, and service inquiry management.

10. Patient Messaging & SMS Campaigns
    Route: /admin/messaging
    Access: Clinic Admins, Marketing Staff
    Description: Bulk SMS, WhatsApp reminder broadcasts, and patient outreach campaigns.

11. System & Clinic Settings
    Route: /admin/settings
    Access: Super Admins
    Description: Clinic operating hours, staff RBAC permissions, tax configurations, notification templates, and system UI settings.
    you have to redine these whole pages agian do not take anybit of currnt ui code write it again
