---
name: pacient-side-degine-skill
description: Premium Patient-Facing Technical Design & Animation Specs. Includes two-font typography system (Outfit & Plus Jakarta Sans), patient page design rules for all 13 patient routes, CSS float keyframes, fade-in-up scroll reveal, hover lift, and border draw micro-interactions.
---

# Premium Dental Clinic: Patient-Side Technical Design & Animation Specs

This skill defines the typography, visual guidelines, page layouts, animation keyframes, and micro-interactions for all **13 Patient-Facing Routes**.

---

## 1. Typography System

### A. Headings & Display Text

- **Font Family**: `Outfit`, sans-serif (Google Fonts)
- **Fallback**: `system-ui`, `-apple-system`, `BlinkMacSystemFont`
- **Weights**: Medium (500), Semi-Bold (600)
- **Usage**: Large impactful headers, display titles, card headings.
- **CSS Variable**: `--font-display: 'Outfit', sans-serif;`

### B. Body Text & UI Elements

- **Font Family**: `Plus Jakarta Sans`, sans-serif (Google Fonts)
- **Fallback**: `Arial`, `sans-serif`
- **Weights**: Regular (400), Medium (500)
- **Usage**: Paragraphs, button labels, navigation links, medical record entries.
- **CSS Variable**: `--font-ui: 'Plus Jakarta Sans', sans-serif;`

---

## 2. Patient Page Design Specs (13 Routes)

1. **Home / Main Landing Page (`/`)**: Split hero with Charcoal headings (`#2C3325`), Primary Olive (`#4A5D23`) keywords, 3D tooth graphic over Soft Sage (`#E4E7D3`) gradient blob. Floating pill container with trust metrics. 4-column services grid on Alabaster (`#FDFBF7`).
2. **Doctor Profile & Bio Page (`/doctor/[slug]`)**: Practitioner headshot, credentials, specialty chips, interactive consultation slot picker.
3. **Patient Account & History (`/account`)**: Logged-in hub with upcoming visit card, quick action grid (150x150px), past visit table with status pills.
4. **Family Health Hub (`/family`)**: Family member profile cards, health history tags, quick add family member drawer.
5. **Family Appointment Booking (`/family/book`)**: Multi-step wizard (Reason $\rightarrow$ Provider $\rightarrow$ Time $\rightarrow$ Confirm).
6. **Family Booking Confirmation (`/family/book/success`)**: Receipt-style confirmation summary with QR code check-in.
7. **Branch Location Page (`/hazara`)**: Location map, clinic hours, contact details, branch photos.
8. **Patient Support & Help Desk (`/support`)**: Searchable FAQ accordion, emergency hotline banner, support ticket form.
9. **DPDP Data Rights Center (`/dpdp`)**: Digital Personal Data Protection center for patient consent logs, data export, and erasure requests.
10. **Privacy Policy (`/privacy`)**: Structured legal privacy policy with sticky table of contents.
11. **Terms of Service (`/terms`)**: Consultation terms, appointment cancellation policies, payment terms.
12. **Patient Login (`/login`)**: 50/50 split screen view with lifestyle visual and tall ($56\text{px}$) inputs resting on `#F0F2EB`.
13. **Patient Registration (`/register`)**: New patient onboarding form with smooth focus borders.

---

## 3. Animation System & CSS Settings

### A. The "Float" (3D Hero Element)

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
  opacity: 0;
  animation: fadeInUp 0.8s cubic-bezier(0.2, 0.8, 0.2, 1) forwards;
}
```

### C. The "Hover Lift"

```css
.service-card {
  transition:
    transform 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94),
    box-shadow 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94);
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
}

.service-card:hover {
  transform: translateY(-8px);
  box-shadow: 0 12px 24px rgba(74, 93, 35, 0.12);
}
```

### D. The "Border Draw" (Form Inputs)

```css
.premium-input {
  background-color: #f0f2eb;
  border: 2px solid transparent;
  transition: all 0.3s ease;
  outline: none;
}

.premium-input:focus {
  border-color: #4a5d23;
  background-color: #ffffff;
  box-shadow: 0 0 0 4px rgba(74, 93, 35, 0.1);
}
```

---

## 4. Associated Design Skills

- `/ui-ux-pro-max-skill`
- `/motion-framer`
- `/minimalist-ui`
- `/design-taste-frontend`

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

and redisign ervrything do not usse from last or current degine redegine whole thing
