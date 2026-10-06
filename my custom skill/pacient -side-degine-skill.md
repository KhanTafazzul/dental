# Premium Dental Clinic: Technical Design & Animation Specs

## 1. Typography System

To achieve a premium, high-trust aesthetic, we are utilizing a two-font system.

### A. Headings & Display Text

- **Font Family:** `Outfit`, sans-serif (Google Fonts)
- **Fallback:** `system-ui`, `-apple-system`, `BlinkMacSystemFont`
- **Weights:**
  - Medium (500) - Subheadings and card titles.
  - Semi-Bold (600) - Main H1/H2 headers (e.g., "Exceptional Dental Care").
- **Usage:** Used exclusively for large, impactful text. It features subtle geometric curves that feel modern and approachable without losing professionalism.
- **CSS Variable:** `--font-display: 'Outfit', sans-serif;`

### B. Body Text & UI Elements

- **Font Family:** `Plus Jakarta Sans`, sans-serif (Google Fonts)
- **Fallback:** `Arial`, `sans-serif`
- **Weights:**
  - Regular (400) - Standard body text, paragraphs.
  - Medium (500) - Button text, navigation links, small UI labels.
- **Usage:** Highly legible at small sizes, making it perfect for dashboard data, appointment times, form inputs, and medical records.
- **CSS Variable:** `--font-ui: 'Plus Jakarta Sans', sans-serif;`

---

## 2. Deep Dive: Patient Page Designs

### A. Landing Page (Public-Facing)

- **Hero Section:** A split layout. Left side: High-contrast `Outfit` headings in Charcoal (`#2C3325`), with the keyword "Designed Around Your Smile" highlighted in Primary Olive (`#4A5D23`). Right side: A 3D rendered tooth or abstract ceramic shape floating over a Soft Sage (`#E4E7D3`) gradient blob.
- **Trust Metrics:** A floating pill-shaped container (border-radius: 50px) overlapping the hero bottom edge, featuring 3-4 stats (e.g., "10K+ Happy Patients") separated by subtle 1px vertical dividers.
- **Services Grid:** Modeled after the reference image. A 4-column CSS grid on desktop. Each card has a top-aligned image (border-radius: 24px) that fades to white at the bottom where the text sits. Background is Alabaster (`#FDFBF7`).
- **Footer:** Deep Olive background (`#3A491C`) with white text. Contains quick links, emergency contact numbers, and clinic hours.

### B. Patient Login / Sign-Up

- **Layout:** 50/50 split screen.
- **Visual Side:** A high-quality lifestyle image of a relaxed patient or abstract olive-toned natural shapes.
- **Functional Side:** Centered form container.
- **Input Fields:** Tall (56px height) inputs with placeholder text in `Plus Jakarta Sans`. The border is completely transparent resting, relying on a light grey background (`#F0F2EB`).
- **Actions:** Full-width primary Olive button for "Log In". Below, a clear "Or continue with" divider and ghost buttons for Google/Apple SSO.

### C. Patient Dashboard (Logged-In Hub)

- **Layout Structure:** A persistent sidebar navigation (Home, Appointments, Records, Billing) and a wide main content area. Background is Alabaster (`#FDFBF7`).
- **Hero Module (Next Appointment):** A standout Soft Sage card spanning the top. It highlights the upcoming visit in large text, showing a photo of the assigned doctor. Contains primary actions: "Check-in Online" (Olive button) and "Add to Calendar" (Ghost button).
- **Quick Actions Grid:** 4 square cards (150x150px) sitting below the hero module. Icons are centered, text below. E.g., "Book Visit", "Message Clinic".
- **Recent Activity:** A clean table layout. Columns: Date, Service, Doctor, Status. Status utilizes color-coded pill tags (e.g., Light Green background for "Completed", Light Yellow for "Upcoming").

### D. Interactive Booking Page (Wizard)

- **Progress Indicator:** A horizontal stepper at the top (1. Reason -> 2. Provider -> 3. Time -> 4. Confirm).
- **Provider Selection:** Cards displaying doctor headshots, names, and a short bio.
- **Calendar Selection UI:** A custom two-pane layout. Left pane: Interactive monthly calendar (inactive dates greyed out, selected date highlighted in Olive). Right pane: Available time slots rendered as a grid of pill-shaped buttons.
- **Summary & Payment:** A clean receipt-style breakdown of the visit intent, selected time, and any estimated copay (if applicable), followed by a final confirmation button.

### E. Medical Records & Invoices

- **Document List:** A list-group UI. Each row contains a document icon, the file name (e.g., "Post-Op Instructions - Root Canal"), date, and a "Download" icon button aligned to the right.

---

## 3. Animation System & CSS Settings

Animations must be smooth and purposeful to reduce anxiety and enhance the premium feel.

### A. The "Float" (3D Hero Element)

- **Where to use:** On the 3D rendered tooth or dental tools in the hero section of the landing page.
- **How it works:** A continuous, infinite loop that slowly moves the element up and down to create a weightless effect.
- **CSS / Keyframes:**

  ```css
  @keyframes float {
    0% {
      transform: translateY(0px);
    }
    50% {
      transform: translateY(-20px);
    }
    100% {
      transform: translateY(0px);
    }
  }

  .hero-3d-element {
    animation: float 6s ease-in-out infinite;
  }
  ```

### B. The "Fade-In-Up" (Scroll Reveal)

- **Where to use:** Headings, service cards, and dashboard modules as they enter the viewport or on initial page load.
- **How it works:** Elements start slightly lower and transparent, sliding up into position while becoming fully opaque.
- **CSS / Keyframes:**

  ```css
  @keyframes fadeInUp {
    0% {
      opacity: 0;
      transform: translateY(30px);
    }
    100% {
      opacity: 1;
      transform: translateY(0);
    }
  }

  .reveal-element {
    opacity: 0; /* Starts hidden */
    animation: fadeInUp 0.8s cubic-bezier(0.2, 0.8, 0.2, 1) forwards;
  }
  /* Add animation-delay inline for staggering multiple cards */
  ```

### C. The "Hover Lift" (Service & Dashboard Cards)

- **Where to use:** Service cards on the landing page, Quick Action cards in the dashboard.
- **How it works:** When a user hovers over a clickable card, it smoothly lifts off the page and casts a wider, softer shadow.
- **CSS Settings:**

  ```css
  .service-card {
    transition:
      transform 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94),
      box-shadow 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94);
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05); /* Resting shadow */
  }

  .service-card:hover {
    transform: translateY(-8px);
    box-shadow: 0 12px 24px rgba(74, 93, 35, 0.12); /* Soft olive shadow */
  }
  ```

### D. The "Border Draw" (Form Inputs)

- **Where to use:** Login, Sign-up, and Booking form input fields.
- **How it works:** Instead of a jarring color change, a colored border (Primary Olive) gently fades/transitions in when the user clicks to type.
- **CSS Settings:**

  ```css
  .premium-input {
    background-color: #f0f2eb;
    border: 2px solid transparent;
    transition: all 0.3s ease;
    outline: none;
  }

  .premium-input:focus {
    border-color: #4a5d23; /* Primary Olive */
    background-color: #ffffff;
    box-shadow: 0 0 0 4px rgba(74, 93, 35, 0.1); /* Olive glow */
  }
  ```

### These pages you have to change or redegine

# Patient-Facing Pages & Routes (13 Total)

1. Home / Main Landing Page
   Route: /
   Description: Homepage with online appointment booking, treatment services list, branch locator, and reviews.

2. Doctor Profile & Bio Page
   Route: /doctor/[slug]
   Description: Individual profile page for clinic doctors showing qualifications, specialties, and direct booking.

3. Patient Account & History
   Route: /account
   Description: Patient portal showing past appointments, prescription records, and billing receipts.

4. Family Health Hub
   Route: /family
   Description: Management dashboard for adding and managing family member profiles.

5. Family Appointment Booking
   Route: /family/book
   Description: Dedicated booking flow for family members.

6. Family Booking Confirmation
   Route: /family/book/success
   Description: Confirmation screen after booking a family member's appointment.

7. Branch Location Page (Hazara Branch)
   Route: /hazara
   Description: Branch page with address, Google maps link, operating hours, and contact details.

8. Patient Support & Help Desk
   Route: /support
   Description: Help center with FAQs, emergency numbers, and support ticket submission.

9. DPDP Data Rights Center
   Route: /dpdp
   Description: Digital Personal Data Protection center for patient data access and erasure requests.

10. Privacy Policy
    Route: /privacy
    Description: Detailed privacy policy for handling patient medical records and personal data.

11. Terms of Service
    Route: /terms
    Description: Clinic consultation policies, appointment rules, and terms of service.

12. Patient Login
    Route: /login
    Description: Patient sign-in page via Mobile OTP or Password.

13. Patient Registration
    Route: /register
    Description: New patient sign-up and onboarding form.

### what skill you have to use are

/ui-ux-pro-max-skill
/motion-framer
/minimalist-ui
/design-taste-frontend
and redisign ervrything do not usse from last or current degine redegine whole thing
