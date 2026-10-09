// ─────────────────────────────────────────────────────────────
// Prescription Template Mapper & Billing System – Type Definitions
// ─────────────────────────────────────────────────────────────

export interface CustomFont {
  id: string;
  name: string;
  base64Data: string; // Data URL (data:font/ttf;base64,...)
  format: 'ttf' | 'otf' | 'woff';
}

export interface BoundingField {
  id: string;
  name: string;        // Display label e.g. "Patient Name"
  key: string;         // Data key e.g. "patientName"
  x: number;           // px position relative to A4 canvas
  y: number;
  width: number;
  height: number;
  color: string;       // hex e.g. "#1e293b"
  fontFamily: string;  // standard or custom font name
  fontSize: number;    // px
}

export interface MedicineEntry {
  id: string;
  name: string;
  dosage: string;
  frequency: string;
  duration: string;
}

export interface PatientBillingData {
  patientName: string;
  age: string;
  gender: string;
  date: string;
  mobile: string;
  doctorName: string;
  medicines: MedicineEntry[];
  notes: string;
}

export interface TemplateConfig {
  backgroundImage: string | null; // Base64 data-URL of prescription image
  fields: BoundingField[];
  customFonts: CustomFont[];
}

// ─── A4 canvas dimensions (screen px) ────────────────────────
export const CANVAS_WIDTH  = 794;
export const CANVAS_HEIGHT = 1123;

// ─── PDF dimensions (points, ISO 216 A4) ─────────────────────
export const PDF_WIDTH  = 595.28;
export const PDF_HEIGHT = 841.89;

// ─── Preset field templates ──────────────────────────────────
export const PRESET_FIELDS: Omit<BoundingField, 'id'>[] = [
  { name: 'Patient Name', key: 'patientName', x: 40,  y: 180, width: 300, height: 32, color: '#1e293b', fontFamily: 'Arial', fontSize: 14 },
  { name: 'Age',          key: 'age',         x: 360, y: 180, width: 120, height: 32, color: '#1e293b', fontFamily: 'Arial', fontSize: 14 },
  { name: 'Gender',       key: 'gender',      x: 510, y: 180, width: 120, height: 32, color: '#1e293b', fontFamily: 'Arial', fontSize: 14 },
  { name: 'Date',         key: 'date',        x: 560, y: 80,  width: 180, height: 28, color: '#1e293b', fontFamily: 'Arial', fontSize: 12 },
  { name: 'Mobile',       key: 'mobile',      x: 40,  y: 230, width: 200, height: 28, color: '#1e293b', fontFamily: 'Arial', fontSize: 12 },
  { name: 'Doctor Name',  key: 'doctorName',  x: 40,  y: 80,  width: 240, height: 28, color: '#0e7490', fontFamily: 'Arial', fontSize: 13 },
  { name: 'Medicines',    key: 'medicines',   x: 40,  y: 300, width: 680, height: 300, color: '#1e293b', fontFamily: 'Arial', fontSize: 13 },
  { name: 'Notes',        key: 'notes',       x: 40,  y: 650, width: 680, height: 120, color: '#475569', fontFamily: 'Arial', fontSize: 12 },
  { name: 'Diagnosis',    key: 'diagnosis',   x: 260, y: 230, width: 300, height: 28, color: '#1e293b', fontFamily: 'Arial', fontSize: 12 },
  { name: 'Branch Name',  key: 'branchName',  x: 300, y: 80,  width: 240, height: 28, color: '#4A5D23', fontFamily: 'Arial', fontSize: 13 },
];

export const WEB_SAFE_FONTS = [
  'Arial',
  'Times New Roman',
  'Courier New',
  'Georgia',
  'Verdana',
  'Trebuchet MS',
  'Impact',
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
