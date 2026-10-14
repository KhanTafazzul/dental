// ─────────────────────────────────────────────────────────────
// WYSIWYG Prescription Template Mapper & Billing System Types
// ─────────────────────────────────────────────────────────────

export interface CustomFont {
  id: string;
  name: string;
  base64Data: string; // Base64 data string / Data URL
  format: 'ttf' | 'otf' | 'woff';
}

export interface BoundingField {
  id: string;
  name: string;        // Field display name, e.g. "Patient Name", "Age", "Medicines"
  key: string;         // Data key mapping
  x: number;           // Coordinate on A4 canvas
  y: number;
  width: number;       // Box width
  height: number;      // Box height
  color: string;       // Hex color string, e.g. "#1e293b"
  fontFamily: string;  // Web safe or uploaded custom font name
  fontSize: number;    // Font size in pixels
}

export interface MedicineEntry {
  id: string;
  name: string;
  dosage?: string;
  frequency?: string;
  duration?: string;
}

export interface PrintOptions {
  printBackground: boolean;
  printText: boolean;
}

export interface PatientBillingData {
  patientId?: string;
  patientName: string;
  email?: string;
  age: string;
  gender: string;
  date: string;
  mobile: string;
  doctorId?: string;
  doctorName?: string;
  doctorMobile?: string;
  doctorEmail?: string;
  doctorDegree?: string;
  doctorRegNo?: string;
  clinicName?: string;
  clinicAddress?: string;
  medicines: (MedicineEntry | string)[]; // Supports string or structured object
  notes?: string;
}

export interface TemplateConfig {
  backgroundImage: string | null; // Base64 string of blank prescription design
  fields: BoundingField[];
  customFonts: CustomFont[];
  printOptions?: PrintOptions;
}

// ISO 216 A4 Canvas Aspect Ratio Dimensions (Screen px)
export const CANVAS_WIDTH = 794;
export const CANVAS_HEIGHT = 1123;

// ISO 216 A4 Dimensions in PDF Points (72 points per inch)
export const PDF_WIDTH = 595.28;
export const PDF_HEIGHT = 841.89;

// Pre-installed Web-Safe Fonts
export const WEB_SAFE_FONTS = [
  'Arial',
  'Times New Roman',
  'Courier New',
  'Georgia',
  'Verdana',
  'Trebuchet MS',
  'Impact',
];

// Preset Fields for Quick Setup
export const PRESET_FIELDS: Omit<BoundingField, 'id'>[] = [
  { name: 'Patient Name',      key: 'patientName',   x: 40,  y: 160, width: 280, height: 32, color: '#1e293b', fontFamily: 'Arial', fontSize: 14 },
  { name: 'Age',               key: 'age',           x: 340, y: 160, width: 90,  height: 32, color: '#1e293b', fontFamily: 'Arial', fontSize: 14 },
  { name: 'Date',              key: 'date',          x: 450, y: 160, width: 140, height: 32, color: '#1e293b', fontFamily: 'Arial', fontSize: 14 },
  { name: 'Mobile',            key: 'mobile',        x: 40,  y: 200, width: 200, height: 30, color: '#1e293b', fontFamily: 'Arial', fontSize: 12 },
  { name: 'Patient Email',     key: 'email',         x: 260, y: 200, width: 220, height: 30, color: '#1e293b', fontFamily: 'Arial', fontSize: 12 },
  { name: 'Doctor Name',       key: 'doctorName',    x: 40,  y: 40,  width: 320, height: 36, color: '#0f766e', fontFamily: 'Arial', fontSize: 18 },
  { name: 'Doctor Mobile',     key: 'doctorMobile',  x: 40,  y: 80,  width: 220, height: 26, color: '#334155', fontFamily: 'Arial', fontSize: 11 },
  { name: 'Doctor Email',      key: 'doctorEmail',   x: 270, y: 80,  width: 250, height: 26, color: '#334155', fontFamily: 'Arial', fontSize: 11 },
  { name: 'Qualification',     key: 'doctorDegree',  x: 40,  y: 110, width: 320, height: 26, color: '#475569', fontFamily: 'Arial', fontSize: 11 },
  { name: 'Reg. Number',       key: 'doctorRegNo',   x: 40,  y: 135, width: 200, height: 24, color: '#64748b', fontFamily: 'Arial', fontSize: 10 },
  { name: 'Hospital / Clinic', key: 'clinicName',    x: 450, y: 40,  width: 300, height: 36, color: '#1e293b', fontFamily: 'Arial', fontSize: 18 },
  { name: 'Clinic Address',    key: 'clinicAddress', x: 450, y: 80,  width: 300, height: 36, color: '#64748b', fontFamily: 'Arial', fontSize: 10 },
  { name: 'Medicines',         key: 'medicines',     x: 40,  y: 260, width: 680, height: 340, color: '#1e293b', fontFamily: 'Arial', fontSize: 13 },
  { name: 'Clinical Notes',    key: 'notes',         x: 40,  y: 630, width: 680, height: 120, color: '#475569', fontFamily: 'Arial', fontSize: 12 },
];

export const createDefaultBillingData = (): PatientBillingData => ({
  patientName: '',
  age: '',
  gender: 'M',
  date: new Date().toLocaleDateString('en-IN'),
  mobile: '',
  email: '',
  doctorName: 'Dr. Doctor Name',
  doctorMobile: '+91 98765 43210',
  doctorEmail: 'doctor@dentalclinic.com',
  doctorDegree: 'BDS, MDS - Oral & Maxillofacial Surgery',
  doctorRegNo: 'REG-2024-8891',
  clinicName: 'HOSPITAL NAME',
  clinicAddress: 'Dental Care Center & Surgery, Main Road',
  medicines: [],
  notes: '',
});

export const DEFAULT_BILLING_DATA: PatientBillingData = createDefaultBillingData();

export const DEFAULT_PRINT_OPTIONS: PrintOptions = {
  printBackground: true,
  printText: true,
};

export const DEFAULT_TEMPLATE_CONFIG: TemplateConfig = {
  backgroundImage: null,
  fields: [],
  customFonts: [],
  printOptions: DEFAULT_PRINT_OPTIONS,
};
