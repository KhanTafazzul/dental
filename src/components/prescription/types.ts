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

export interface PatientBillingData {
  patientId?: string;
  patientName: string;
  email?: string;
  age: string;
  gender: string;
  date: string;
  mobile: string;
  doctorName?: string;
  medicines: (MedicineEntry | string)[]; // Supports string or structured object
  notes?: string;
}

export interface TemplateConfig {
  backgroundImage: string | null; // Base64 string of blank prescription design
  fields: BoundingField[];
  customFonts: CustomFont[];
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
  { name: 'Patient Name', key: 'patientName', x: 40,  y: 160, width: 280, height: 32, color: '#1e293b', fontFamily: 'Arial', fontSize: 14 },
  { name: 'Age',          key: 'age',         x: 340, y: 160, width: 100, height: 32, color: '#1e293b', fontFamily: 'Arial', fontSize: 14 },
  { name: 'Date',         key: 'date',        x: 460, y: 160, width: 160, height: 32, color: '#1e293b', fontFamily: 'Arial', fontSize: 14 },
  { name: 'Mobile',       key: 'mobile',      x: 40,  y: 200, width: 220, height: 30, color: '#1e293b', fontFamily: 'Arial', fontSize: 12 },
  { name: 'Medicines',    key: 'medicines',   x: 40,  y: 270, width: 680, height: 320, color: '#1e293b', fontFamily: 'Arial', fontSize: 13 },
  { name: 'Clinical Notes', key: 'notes',     x: 40,  y: 620, width: 680, height: 120, color: '#475569', fontFamily: 'Arial', fontSize: 12 },
];

export const DEFAULT_BILLING_DATA: PatientBillingData = {
  patientName: '',
  age: '',
  gender: 'M',
  date: new Date().toLocaleDateString('en-IN'),
  mobile: '',
  doctorName: '',
  medicines: [],
  notes: '',
};

export const DEFAULT_TEMPLATE_CONFIG: TemplateConfig = {
  backgroundImage: null,
  fields: [],
  customFonts: [],
};
