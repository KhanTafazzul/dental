Administration Portal: UI/UX & Animation Design System
This document outlines the design architecture for the internal administration portals (Admin, Doctor, Reception/Capture, and Finance). It adapts the clean, data-heavy layout of the reference dashboard into the premium "Olive" brand aesthetic, featuring the custom dynamic capsule sidebar.

1. Global Design Language
   A. Color Palette (Olive Theme for Data)
   The admin side requires high contrast for data readability, so we use a lighter background with Olive reserved for accents, active states, and primary banners.
   App Background: #F4F6F0 (A very soft, cool grey-green. Makes white data cards pop).
   Card Background: #FFFFFF (Pure white for all dashboard widgets and charts).
   Primary Brand (Olive): #4A5D23 (Used for active sidebar icons, primary buttons, chart lines).
   Secondary Accent (Soft Sage): #E4E7D3 (Used for active sidebar backgrounds, hover states on table rows).
   Hero Banner Gradient: Linear gradient from #4A5D23 (Dark Olive) to #6B823E (Lighter Olive).
   Text Primary: #2C3325 (Charcoal/Dark Green for metric numbers and headers).
   Text Secondary: #8A9380 (Muted grey-green for table headers, chart labels, and subtitles).
   B. Typography
   Headers & Large Metrics: Outfit (Medium & Semi-Bold). Used for the "Good Morning" text, large metric numbers (e.g., "30/85"), and chart titles.
   UI, Tables & Body: Plus Jakarta Sans (Regular & Medium). Used for sidebar links, patient names in lists, timestamps, and data labels.
2. The Dynamic Sidebar (Capsule Navigation)
   This is the core interactive element of the admin interface. It is a "floating" sidebar (it has margins around it, not touching the exact edge of the screen).
   Visual States
   Collapsed State (The Capsule):
   Shape: A tall, slender pill shape floating on the left side.
   Dimensions: width: 80px; height: calc(100vh - 32px); margin: 16px;
   Border Radius: border-radius: 60px; (Creates the perfect capsule/pill shape).
   Content: Only the icons are visible, perfectly centered.
   Expanded State (The Rectangle):
   Shape: A wide panel with nicely rounded corners.
   Dimensions: width: 260px; height: calc(100vh - 32px); margin: 16px;
   Border Radius: border-radius: 24px; (Soft rectangle).
   Content: Icons + Text Labels fade in.
   Animation Details (CSS)
   To achieve the "very smooth" fluid transition between a capsule and a rectangle, we animate the width and border-radius simultaneously using a spring-like cubic-bezier.

.admin-sidebar {
background-color: #FFFFFF;
box-shadow: 4px 0 24px rgba(74, 93, 35, 0.05); /_ Soft olive shadow _/
overflow: hidden;
/_ The Magic Transition _/
transition: width 0.5s cubic-bezier(0.2, 0.8, 0.2, 1),
border-radius 0.5s cubic-bezier(0.2, 0.8, 0.2, 1);
}

/_ Expanded State (Default) _/
.admin-sidebar.expanded {
width: 260px;
border-radius: 24px;
}

/_ Collapsed State (Capsule) _/
.admin-sidebar.collapsed {
width: 80px;
border-radius: 60px;
}

/_ Text Fade Animation _/
.sidebar-text {
transition: opacity 0.3s ease, transform 0.3s ease;
}
.admin-sidebar.collapsed .sidebar-text {
opacity: 0;
transform: translateX(-10px);
pointer-events: none;
}

3. Page Layouts & UI Components
   Based heavily on the layout structure of the provided reference image.
   A. Admin Dashboard (Main Overview)
   Hero Banner: A wide, rounded rectangle (border-radius: 20px) at the top. Background is the Hero Banner Gradient (Olive). Text is white ("Good Morning, Admin"). Include a flat vector illustration of the clinic or a subtle watermark pattern on the right side of the banner.
   Metric Cards (4 Columns): White cards (border-radius: 16px). E.g., Appointments, Revenue, New Patients. The primary number uses Outfit Semi-Bold in Charcoal. The small trend indicator (e.g., "+15%") is a soft green or light red pill.
   Activity Chart: A wide card containing a line chart or bar chart.
   Design: The main line is Primary Olive (#4A5D23) with a soft, semi-transparent Soft Sage gradient fill underneath it.
   Upcoming Appointments List: A clean table layout. The "Status" column uses small colored dots (Green = Confirmed, Yellow = Pending).
   B. Doctor Dashboard
   Focus: Geared toward schedule management.
   Hero Banner: Similar to Admin, but personalized ("Good Morning, Dr. [Name]").
   Daily Schedule View: A timeline UI on the right side (like the "Top Departments" section in the reference). Current time is indicated by a pulsing Olive dot.
   Patient Queue: A vertical list of patients waiting. Clicking a patient expands a quick-view modal showing their chief complaint and last visit date.
   C. Capture / Reception Page (Front Desk)
   Focus: Speed and live updates.
   Live Queue System: Large, easily readable blocks representing patients currently in the clinic.
   Status Pills: "In Waiting Room" (Soft Sage), "In Chair 1" (Olive), "Checking Out" (Light Grey).
   Quick Actions: Large, prominent buttons at the top right: + New Walk-in, Collect Payment, Verify Insurance.
   D. Finance & Settings
   Finance: Dominated by data tables and pie charts.
   Pie Chart Colors: Use a monochromatic Olive scale (Dark Olive, Medium Olive, Soft Sage, Beige) to maintain the premium feel rather than standard bright primary colors.
   Settings: Forms use the exact same logic as the patient side: light grey background inputs that gain a 2px Primary Olive border smoothly on focus.
4. Specific Animations for Data
   Aside from the Sidebar Capsule animation, use these micro-interactions to make the dashboard feel premium and responsive:
   A. Card Stagger Fade-In
   When the dashboard loads, the metric cards and charts shouldn't appear instantly. They should cascade in.
   Setting: translateY(20px) to 0, opacity 0 to 1.
   Timing: 0.4s ease-out.
   Usage: Delay the first card by 0.1s, the second by 0.2s, the chart by 0.3s. This creates a beautiful "waterfall" loading effect.
   B. Chart Line Draw
   When navigating to the Admin or Finance dashboard, the SVG line in the main revenue/activity chart should draw itself from left to right.
   Setting: Animate the stroke-dashoffset property of the SVG path from its total length down to 0.
   Timing: 1.2s ease-in-out.
   Usage: Applied to the primary Olive data lines on all line graphs.
   C. Table Row Hover
   To help users track data across wide tables without losing their place.
   Setting: Background color transitions from #FFFFFF to #FCFDFB (an extremely subtle off-white/sage tint).
   Timing: 0.15s linear.
   Usage: Applied to all <tr> elements in the patient lists and finance tables.
