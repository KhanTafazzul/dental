export type SupportedLanguage = 'en' | 'hi' | 'ur' | 'bn' | 'ta' | 'te' | 'mr' | 'gu' | 'kn';

export interface LanguageOption {
  code: SupportedLanguage;
  name: string;
  nativeName: string;
  dir: 'ltr' | 'rtl';
}

export const SUPPORTED_LANGUAGES: LanguageOption[] = [
  { code: 'en', name: 'English', nativeName: 'English', dir: 'ltr' },
  { code: 'hi', name: 'Hindi', nativeName: 'हिंदी', dir: 'ltr' },
  { code: 'ur', name: 'Urdu', nativeName: 'اردو', dir: 'rtl' },
  { code: 'bn', name: 'Bengali', nativeName: 'বাংলা', dir: 'ltr' },
  { code: 'ta', name: 'Tamil', nativeName: 'தமிழ்', dir: 'ltr' },
  { code: 'te', name: 'Telugu', nativeName: 'తెలుగు', dir: 'ltr' },
  { code: 'mr', name: 'Marathi', nativeName: 'مراٹھی / मराठी', dir: 'ltr' },
  { code: 'gu', name: 'Gujarati', nativeName: 'ગુજરાતી', dir: 'ltr' },
  { code: 'kn', name: 'Kannada', nativeName: 'ಕನ್ನಡ', dir: 'ltr' }
];

export const DPDP_TRANSLATIONS: Record<SupportedLanguage, {
  consentNoticeTitle: string;
  consentNoticeText: string;
  consentCheckboxLabel: string;
  privacyPolicyTitle: string;
  cookiePolicyTitle: string;
  termsTitle: string;
  dataController: string;
  dpoTitle: string;
  dpoEmail: string;
  rightsTitle: string;
  rightAccess: string;
  rightCorrection: string;
  rightErasure: string;
  rightWithdraw: string;
  sarTitle: string;
  submitRequest: string;
  privacyText: string;
  cookieText: string;
  termsText: string;
}> = {
  en: {
    consentNoticeTitle: "DPDP Act 2023 & DPDP Rules 2025 Notice",
    consentNoticeText: "We collect personal and clinical health data strictly for dental diagnosis, appointment booking, and treatment. In compliance with the Digital Personal Data Protection Act 2023 and Rules 2025, your data is processed securely with your explicit consent.",
    consentCheckboxLabel: "I consent to the collection, processing, and retention of my data under the DPDP Act 2023 & Rules 2025.",
    privacyPolicyTitle: "Digital Personal Data Protection & Privacy Policy",
    cookiePolicyTitle: "Cookie & Local Storage Policy",
    termsTitle: "Terms & Conditions of Service",
    dataController: "Data Fiduciary: Dental Clinic Network India",
    dpoTitle: "Data Protection Officer (DPO)",
    dpoEmail: "dpo@dentalclinic.in | Grievance Response SLA: 72 Hours",
    rightsTitle: "Your Rights as a Data Principal",
    rightAccess: "Right to access summary of personal data & processing history",
    rightCorrection: "Right to correct, update, or complete inaccurate data",
    rightErasure: "Right to request erasure (Right to be Forgotten) when treatment is completed",
    rightWithdraw: "Right to withdraw consent at any time without penalty",
    sarTitle: "Subject Access & Erasure Portal",
    submitRequest: "Submit Data Rights Request",
    privacyText: "Under Section 5 & 6 of DPDP Act 2023, data is gathered solely for healthcare services. We implement AES-256 encryption at rest and TLS 1.3 in transit. Storage period is restricted to clinical record mandates.",
    cookieText: "We use essential session cookies for authentication & security. Optional analytics cookies help optimize clinic scheduling. You may alter your cookie preferences at any time.",
    termsText: "By utilizing this portal, you agree to provide truthful clinical history. Diagnostic recommendations are rendered by certified dental practitioners under applicable Indian healthcare statutes."
  },
  hi: {
    consentNoticeTitle: "डिजिटल व्यक्तिगत डेटा संरक्षण अधिनियम 2023 एवं नियम 2025 सूचना",
    consentNoticeText: "हम केवल दंत चिकित्सा निदान, अपॉइंटमेंट बुकिंग और उपचार के लिए व्यक्तिगत और नैदानिक स्वास्थ्य डेटा एकत्र करते हैं। डीपीडीपी अधिनियम 2023 और नियम 2025 के अनुपालन में, आपका डेटा आपकी स्पष्ट सहमति के साथ सुरक्षित रूप से संसाधित किया जाता है।",
    consentCheckboxLabel: "मैं डीपीडीपी अधिनियम 2023 और नियम 2025 के तहत अपने डेटा के संग्रह, प्रसंस्करण और प्रतिधारण के लिए सहमति देता/देती हूं।",
    privacyPolicyTitle: "डिजिटल व्यक्तिगत डेटा संरक्षण और गोपनीयता नीति",
    cookiePolicyTitle: "कुकी और लोकल स्टोरेज नीति",
    termsTitle: "सेवा की शर्तें और नियम",
    dataController: "डेटा फिड्यूशरी: डेंटल क्लिनिक नेटवर्क इंडिया",
    dpoTitle: "डेटा सुरक्षा अधिकारी (DPO)",
    dpoEmail: "dpo@dentalclinic.in | शिकायत प्रतिक्रिया समय: 72 घंटे",
    rightsTitle: "डेटा प्रिंसिपल के रूप में आपके अधिकार",
    rightAccess: "व्यक्तिगत डेटा और प्रसंस्करण इतिहास तक पहुंच का अधिकार",
    rightCorrection: "गलत या अपूर्ण डेटा को सुधारने और अपडेट करने का अधिकार",
    rightErasure: "उपचार पूरा होने पर डेटा मिटाने (भूल जाने का अधिकार) का अनुरोध करने का अधिकार",
    rightWithdraw: "बिना किसी दंड के किसी भी समय सहमति वापस लेने का अधिकार",
    sarTitle: "डेटा अधिकार एवं मिटाने का पोर्टल",
    submitRequest: "डेटा अधिकार अनुरोध जमा करें",
    privacyText: "डीपीडीपी अधिनियम 2023 की धारा 5 और 6 के तहत, डेटा केवल स्वास्थ्य सेवाओं के लिए एकत्र किया जाता है। हम AES-256 एन्क्रिप्शन और TLS 1.3 सुरक्षा का उपयोग करते हैं।",
    cookieText: "हम प्रमाणीकरण और सुरक्षा के लिए आवश्यक कुकीज़ का उपयोग करते हैं। आप किसी भी समय अपनी कुकी प्राथमिकताओं को बदल सकते हैं।",
    termsText: "इस पोर्टल का उपयोग करके, आप सत्य नैदानिक इतिहास प्रदान करने के लिए सहमत होते हैं।"
  },
  ur: {
    consentNoticeTitle: "ڈیجیٹل پرسنل ڈیٹا پروٹیکشن ایکٹ 2023 اور رولز 2025 نوٹس",
    consentNoticeText: "ہم دانتوں کے علاج، اپائنٹمنٹ کی بکنگ اور تشخیصی مقاصد کے لیے آپ کا ذاتی اور طبی ڈیٹا جمع کرتے ہیں۔ ڈی پی ڈی پی ایکٹ 2023 اور رولز 2025 کے تحت آپ کی معلومات کو محفوظ اور آپ کی صریح رضامندی کے ساتھ استعمال کیا جاتا ہے۔",
    consentCheckboxLabel: "میں ڈی پی ڈی پی ایکٹ 2023 اور رولز 2025 کے تحت اپنے ڈیٹا کے جمع، پروسیسنگ اور محفوظ رکھنے کی رضامندی دیتا/دیتی ہوں۔",
    privacyPolicyTitle: "ڈیجیٹل پرسنل ڈیٹا پروٹیکشن اور پرائیویسی پالیسی",
    cookiePolicyTitle: "کوکیز اور لوکل اسٹوریج پالیسی",
    termsTitle: "خدمات کی شرائط و ضوابط",
    dataController: "ڈیٹا فڈوشری: ڈینٹل کلینک نیٹ ورک انڈیا",
    dpoTitle: "ڈیٹا پروٹیکشن آفیسر (DPO)",
    dpoEmail: "dpo@dentalclinic.in | شکایت کے جواب کا وقت: 72 گھنٹے",
    rightsTitle: "ڈیٹا پرنسپل کے طور پر آپ کے حقوق",
    rightAccess: "اپنے ذاتی ڈیٹا اور پروسیسنگ کی ہسٹری تک رسائی کا حق",
    rightCorrection: "غلط یا نامکمل معلومات کی تصحیح اور اپ ڈیٹ کا حق",
    rightErasure: "علاج مکمل ہونے پر ڈیٹا کو حذف کرنے (بھول جانے کا حق) کی درخواست کا حق",
    rightWithdraw: "کسی بھی وقت بغیر کسی جرمانے کے رضامندی واپس لینے کا حق",
    sarTitle: "ڈیٹا کے حقوق اور حذف کرنے کا پورٹل",
    submitRequest: "ڈیٹا کے حقوق کی درخواست جمع کریں",
    privacyText: "ڈی پی ڈی پی ایکٹ 2023 کی دفعہ 5 اور 6 کے تحت، ڈیٹا صرف صحت کی دیکھ بھال کی خدمات کے لیے جمع کیا جاتا ہے۔ ہم AES-256 انکرپشن استعمال کرتے ہیں۔",
    cookieText: "ہم تصدیق اور سیکورٹی کے لیے ضروری کوکیز استعمال کرتے ہیں۔ آپ کسی بھی وقت اپنی ترجیحات کو تبدیل کر سکتے ہیں۔",
    termsText: "اس پورٹل کا استعمال کرتے ہوئے، آپ سچی طبی معلومات فراہم کرنے پر رضامند ہوتے ہیں۔"
  },
  bn: {
    consentNoticeTitle: "ডিজিটাল ব্যক্তিগত ডেটা সুরক্ষা আইন ২০২৩ এবং বিধি ২০২৫ বিজ্ঞপ্তি",
    consentNoticeText: "আমরা শুধুমাত্র ডেন্টাল চিকিৎসা, অ্যাপয়েন্টমেন্ট বুকিং এবং চিকিৎসার জন্য ব্যক্তিগত ডেটা সংগ্রহ করি। ডিপিডিপি আইন ২০২৩ এবং বিধি ২০২৫ অনুযায়ী আপনার ডেটা সুরক্ষিতভাবে প্রক্রিয়া করা হয়।",
    consentCheckboxLabel: "আমি ডিপিডিপি আইন ২০২৩ এবং বিধি ২০২৫ এর অধীনে আমার ডেটা সংগ্রহের সম্মতি দিচ্ছি।",
    privacyPolicyTitle: "ডিজিটাল ব্যক্তিগত ডেটা সুরক্ষা ও গোপনীয়তা নীতি",
    cookiePolicyTitle: "কুকি ও লোকাল স্টোরেজ নীতি",
    termsTitle: "সেবার শর্তাবলী",
    dataController: "ডেটা ফিডুশিয়ারি: ডেন্টাল ক্লিনিক নেটওয়ার্ক ইন্ডিয়া",
    dpoTitle: "ডেটা সুরক্ষা কর্মকর্তা (DPO)",
    dpoEmail: "dpo@dentalclinic.in | অভিযোগ সমাধানের সময়: ৭২ ঘন্টা",
    rightsTitle: "ডেটা প্রিন্সিপাল হিসেবে আপনার অধিকার",
    rightAccess: "ব্যক্তিগত ডেটা অ্যাক্সেস করার অধিকার",
    rightCorrection: "ভুল তথ্য সংশোধন করার অধিকার",
    rightErasure: "চিকিৎসা শেষে ডেটা মুছে ফেলার অধিকার",
    rightWithdraw: "যেকোনো সময় সম্মতি প্রত্যাহার করার অধিকার",
    sarTitle: "ডেটা অধিকার পোর্টাল",
    submitRequest: "অনুরোধ জমা দিন",
    privacyText: "ডিপিডিপি আইন ২০২৩ এর অধীনে স্বাস্থ্যসেবার জন্য ডেটা সংগ্রহ করা হয়। আমরা AES-256 এনক্রিপশন ব্যবহার করি।",
    cookieText: "আমরা সুরক্ষার জন্য প্রয়োজনীয় কুকি ব্যবহার করি।",
    termsText: "এই পোর্টাল ব্যবহারের মাধ্যমে আপনি সঠিক স্বাস্থ্য তথ্য প্রদানের প্রতিশ্রুতি দিচ্ছেন।"
  },
  ta: {
    consentNoticeTitle: "டிஜிட்டல் தனிநபர் தரவு பாதுகாப்பு சட்டம் 2023 & விதிகள் 2025 அறிவிப்பு",
    consentNoticeText: "பல் சிகிச்சை, முன்பதிவு மற்றும் சிகிச்சைக்காக மட்டுமே உங்கள் தரவு சேகரிக்கப்படுகிறது. DPDP சட்டம் 2023 இன் படி உங்கள் தரவு பாதுகாப்பாக செயலாக்கப்படுகிறது.",
    consentCheckboxLabel: "DPDP சட்டம் 2023 இன் கீழ் எனது தரவைச் சேகரிக்க ஒப்புக்கொள்கிறேன்.",
    privacyPolicyTitle: "தனிநபர் தரவு பாதுகாப்பு மற்றும் தனியுரிமைக் கொள்கை",
    cookiePolicyTitle: "குக்கீ கொள்கை",
    termsTitle: "சேவை விதிகள் மற்றும் நிபந்தனைகள்",
    dataController: "தரவு அறங்காவலர்: டென்டல் கிளினிக் நெட்வொர்க் இந்தியா",
    dpoTitle: "தரவு பாதுகாப்பு அதிகாரி (DPO)",
    dpoEmail: "dpo@dentalclinic.in | பதில் நேரம்: 72 மணிநேரம்",
    rightsTitle: "தரவு முதன்மையாளராக உங்கள் உரிமைகள்",
    rightAccess: "தனிப்பட்ட தரவை அணுகும் உரிமை",
    rightCorrection: "தவறான தரவை திருத்தும் உரிமை",
    rightErasure: "தரவை நீக்கக் கோரும் உரிமை",
    rightWithdraw: "சம்மதத்தை திரும்பப் பெறும் உரிமை",
    sarTitle: "தரவு உரிமைகள் போர்டல்",
    submitRequest: "கோரிக்கையை சமர்ப்பிக்கவும்",
    privacyText: "DPDP சட்டத்தின் கீழ் சுகாதார சேவைகளுக்காக மட்டுமே தரவு சேகரிக்கப்படுகிறது.",
    cookieText: "பாதுகாப்பிற்கான அத்தியாவசிய குக்கீகளை நாங்கள் பயன்படுத்துகிறோம்.",
    termsText: "துல்லியமான மருத்துவ வரலாற்றை வழங்க ஒப்புக்கொள்கிறீர்கள்."
  },
  te: {
    consentNoticeTitle: "డిజిటల్ వ్యక్తిగత డేటా రక్షణ చట్టం 2023 & నిబంధనలు 2025 నోటీసు",
    consentNoticeText: "మా వద్ద మీ డేటా దంత వైద్య సేవలు మరియు నియామకాల కొరకు మాత్రమే సురక్షితంగా ప్రాసెస్ చేయబడుతుంది.",
    consentCheckboxLabel: "DPDP చట్టం 2023 కింద నా డేటా సేకరణకు నేను అంగీకరిస్తున్నాను.",
    privacyPolicyTitle: "డిజిటల్ వ్యక్తిగత డేటా రక్షణ మరియు గోప్యతా విధానం",
    cookiePolicyTitle: "కూకీ విధానం",
    termsTitle: "సేవా నిబంధనలు మరియు షరతులు",
    dataController: "డేటా ఫిడుషియరీ: డెంటల్ క్లినిక్ నెట్‌వర్క్ ఇండియా",
    dpoTitle: "డేటా రక్షణ అధికారి (DPO)",
    dpoEmail: "dpo@dentalclinic.in | ప్రతిస్పందన సమయం: 72 గంటలు",
    rightsTitle: "డేటా ప్రిన్సిపాల్‌గా మీ హక్కులు",
    rightAccess: "వ్యక్తిగత డేటాను యాక్సెస్ చేసే హక్కు",
    rightCorrection: "సమాచారాన్ని సరిదిద్దే హక్కు",
    rightErasure: "డేటాను తొలగించమని కోరే హక్కు",
    rightWithdraw: "సమ్మతిని వెనక్కి తీసుకునే హక్కు",
    sarTitle: "డేటా హక్కుల పోర్టల్",
    submitRequest: "అభ్యర్థనను సమర్పించండి",
    privacyText: "సమాచారం సురక్షిత సంకేతీకరణతో ప్రాసెస్ చేయబడుతుంది.",
    cookieText: "భద్రత కోసం అవసరమైన కూకీలను ఉపయోగిస్తాము.",
    termsText: "ఖచ్చితమైన వైద్య చరిత్రను అందించడానికి మీరు అంగీకరిస్తున్నారు."
  },
  mr: {
    consentNoticeTitle: "डिजिटल वैयक्तिक डेटा संरक्षण कायदा २०२३ आणि नियम २०२५ सूचना",
    consentNoticeText: "आम्ही केवळ दंत उपचार आणि अपॉइंटमेंट बुकिंगसाठी वैयक्तिक डेटा गोळा करतो. डीपीडीपी कायद्यानुसार डेटा सुरक्षित ठेवला जातो.",
    consentCheckboxLabel: "मी डीपीडीपी कायदा २०२३ अंतर्गत माझ्या डेटा संकलनास संमती देतो/देते.",
    privacyPolicyTitle: "डिजिटल वैयक्तिक डेटा संरक्षण व गोपनीयता धोरण",
    cookiePolicyTitle: "कुकी आणि लोकल स्टोरेज धोरण",
    termsTitle: "सेवा अटी व शर्ती",
    dataController: "डेटा फिड्युशिअरी: डेंटल क्लिनिक नेटवर्क इंडिया",
    dpoTitle: "डेटा संरक्षण अधिकारी (DPO)",
    dpoEmail: "dpo@dentalclinic.in | निवारण वेळ: ७२ तास",
    rightsTitle: "डेटा प्रिन्सिपल म्हणून तुमचे हक्क",
    rightAccess: "वैयक्तिक डेटा पाहण्याचा हक्क",
    rightCorrection: "चुकलेली माहिती दुरुस्त करण्याचा हक्क",
    rightErasure: "डेटा हटवण्याची विनंती करण्याचा हक्क",
    rightWithdraw: "संमती मागे घेण्याचा हक्क",
    sarTitle: "डेटा हक्क पोर्टल",
    submitRequest: "विनंती सबमिट करा",
    privacyText: "डेटा केवळ आरोग्य सेवेसाठी वापरला जातो.",
    cookieText: "सुरक्षिततेसाठी आवश्यक कुकीज वापरल्या जातात.",
    termsText: "अचूक वैद्यकीय माहिती देण्यास तुम्ही सहमत आहात."
  },
  gu: {
    consentNoticeTitle: "ડિજિટલ પર્સનલ ડેટા પ્રોટેક્શન એક્ટ ૨૦૨૩ અને નિયમો ૨૦૨૫ નોટિસ",
    consentNoticeText: "અમે ફક્ત ડેન્ટલ સારવાર અને એપોઇન્ટમેન્ટ માટે ડેટા એકત્રિત કરીએ છીએ. DPDP એક્ટ હેઠળ તમારો ડેટા સુરક્ષિત છે.",
    consentCheckboxLabel: "હું DPDP એક્ટ ૨૦૨૩ હેઠળ મારો ડેટા પ્રોસેસ કરવાની સંમતિ આપું છું.",
    privacyPolicyTitle: "ડિજિટલ પર્સનલ ડેટા પ્રોટેક્શન અને પ્રાઇવસી પોલિસી",
    cookiePolicyTitle: "કૂકી પોલિસી",
    termsTitle: "સેવાની શરતો",
    dataController: "ડેટા ફિડ્યુશિયરી: ડેન્ટલ ક્લિનિક નેટવર્ક ઇન્ડિયા",
    dpoTitle: "ડેટા પ્રોટેક્શન ઓફિસર (DPO)",
    dpoEmail: "dpo@dentalclinic.in | પ્રતિભાવ સમય: ૭૨ કલાક",
    rightsTitle: "ડેટા પ્રિન્સિપાલ તરીકે તમારા અધિકારો",
    rightAccess: "ડેટા મેળવવાનો અધિકાર",
    rightCorrection: "ડેટા સુધારવાનો અધિકાર",
    rightErasure: "ડેટા કાઢી નાખવાની વિનંતીનો અધિકાર",
    rightWithdraw: "સંમતિ પરત ખેંચવાનો અધિકાર",
    sarTitle: "ડેટા રાઇટ્સ પોર્ટલ",
    submitRequest: "વિનંતી સબમિટ કરો",
    privacyText: "ડેટા સુરક્ષિત એન્ક્રિપ્શન સાથે પ્રોસેસ થાય છે.",
    cookieText: "અમે જરૂરી કૂકીઝનો ઉપયોગ કરીએ છીએ.",
    termsText: "સાચી તબીબી માહિતી આપવા સંમત થાઓ છો."
  },
  kn: {
    consentNoticeTitle: "ಡಿಜಿಟಲ್ ವೈಯಕ್ತಿಕ ಡೇಟಾ ರಕ್ಷಣೆ ಕಾಯ್ದೆ 2023 & ನಿಯಮಗಳು 2025 ಸೂಚನೆ",
    consentNoticeText: "ಡೆಂಟಲ್ ಚಿಕಿತ್ಸೆ ಮತ್ತು ಅಪಾಯಿಂಟ್‌ಮೆಂಟ್ ಬುಕಿಂಗ್‌ಗಾಗಿ ಮಾತ್ರ ನಿಮ್ಮ ಡೇಟಾವನ್ನು ಸಂಗ್ರಹಿಸಲಾಗುತ್ತದೆ. DPDP ಕಾಯ್ದೆಯಡಿ ನಿಮ್ಮ ಡೇಟಾ ಸುರಕ್ಷಿತವಾಗಿದೆ.",
    consentCheckboxLabel: "DPDP ಕಾಯ್ದೆ 2023 ರ ಅಡಿಯಲ್ಲಿ ನನ್ನ ಡೇಟಾ ಸಂಗ್ರಹಣೆಗೆ ನಾನು ಸಮ್ಮತಿಸುತ್ತೇನೆ.",
    privacyPolicyTitle: "ಡಿಜಿಟಲ್ ವೈಯಕ್ತಿಕ ಡೇಟಾ ರಕ್ಷಣೆ ಮತ್ತು ಗೌಪ್ಯತಾ ನೀತಿ",
    cookiePolicyTitle: "ಕುಕಿ ನೀತಿ",
    termsTitle: "ಸೇವೆಯ ನಿಯಮಗಳು ಮತ್ತು ಷರತ್ತುಗಳು",
    dataController: "ಡೇಟಾ ಫಿಡುಷಿಯರಿ: ಡೆಂಟಲ್ ಕ್ಲಿನಿಕ್ ನೆಟ್‌ವರ್ಕ್ ಇಂಡಿಯಾ",
    dpoTitle: "ಡೇಟಾ ರಕ್ಷಣೆ ಅಧಿಕಾರಿ (DPO)",
    dpoEmail: "dpo@dentalclinic.in | ಪ್ರತಿಕ್ರಿಯೆ ಸಮಯ: 72 ಗಂಟೆಗಳು",
    rightsTitle: "ಡೇಟಾ ಪ್ರಿನ್ಸಿಪಾಲ್ ಆಗಿ ನಿಮ್ಮ ಹಕ್ಕುಗಳು",
    rightAccess: "ವೈಯಕ್ತಿಕ ಡೇಟಾವನ್ನು ವೀಕ್ಷಿಸುವ ಹಕ್ಕು",
    rightCorrection: "ಮಾಹಿತಿಯನ್ನು ತಿದ್ದುಪಡಿ ಮಾಡುವ ಹಕ್ಕು",
    rightErasure: "ಡೇಟಾ ಅಳಿಸಲು ವಿನಂತಿಸುವ ಹಕ್ಕು",
    rightWithdraw: "ಸಮ್ಮತಿಯನ್ನು ಹಿಂಪಡೆಯುವ ಹಕ್ಕು",
    sarTitle: "ಡೇಟಾ ಹಕ್ಕುಗಳ ಪೋರ್ಟಲ್",
    submitRequest: "ವಿನಂತಿಯನ್ನು ಸಲ್ಲಿಸಿ",
    privacyText: "ಆರೋಗ್ಯ ಸೇವೆಗಳಿಗಾಗಿ ಮಾತ್ರ ಡೇಟಾವನ್ನು ಬಳಸಲಾಗುತ್ತದೆ.",
    cookieText: "ಸುರಕ್ಷತೆಗಾಗಿ ಅಗತ್ಯ ಕುಕಿಗಳನ್ನು ಬಳಸಲಾಗುತ್ತದೆ.",
    termsText: "ನಿಖರವಾದ ವೈದ್ಯಕೀಯ ಮಾಹಿತಿಯನ್ನು ಒದಗಿಸಲು ನೀವು ಒಪ್ಪುತ್ತೀರಿ."
  }
};
