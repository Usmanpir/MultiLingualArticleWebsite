/** Reference data for the development seed. All people below are fictional demo profiles. */

export const LANGUAGES = [
  { code: "en", name: "English", nativeName: "English", locale: "en_US", direction: "LTR" as const, isDefault: true, sortOrder: 0 },
  { code: "ur", name: "Urdu", nativeName: "اردو", locale: "ur_PK", direction: "RTL" as const, isDefault: false, sortOrder: 1 },
  { code: "ar", name: "Arabic", nativeName: "العربية", locale: "ar_AR", direction: "RTL" as const, isDefault: false, sortOrder: 2 },
]

export const CATEGORY_COLORS = {
  technology: "#22d3ee",
  ai: "#a78bfa",
  science: "#34d399",
  business: "#fbbf24",
  future: "#f472b6",
  startups: "#fb923c",
  gadgets: "#60a5fa",
  travel: "#2dd4bf",
} as const

type L = { name: string; description: string }
export const CATEGORIES: { slug: keyof typeof CATEGORY_COLORS; en: L; ur: L; ar: L }[] = [
  {
    slug: "technology",
    en: { name: "Technology", description: "The platforms, infrastructure and tools quietly reshaping everyday life." },
    ur: { name: "ٹیکنالوجی", description: "وہ پلیٹ فارم، انفراسٹرکچر اور اوزار جو روزمرہ زندگی کو خاموشی سے بدل رہے ہیں۔" },
    ar: { name: "التقنية", description: "المنصات والبنية التحتية والأدوات التي تعيد تشكيل الحياة اليومية بهدوء." },
  },
  {
    slug: "ai",
    en: { name: "Artificial Intelligence", description: "Clear explanations of machine learning, AI agents and their real-world trade-offs." },
    ur: { name: "مصنوعی ذہانت", description: "مشین لرننگ، اے آئی ایجنٹس اور ان کے حقیقی فوائد و نقصانات کی واضح وضاحت۔" },
    ar: { name: "الذكاء الاصطناعي", description: "شروحات واضحة لتعلم الآلة ووكلاء الذكاء الاصطناعي ومقايضاتهم الواقعية." },
  },
  {
    slug: "science",
    en: { name: "Science", description: "Research and discoveries, explained without the hype." },
    ur: { name: "سائنس", description: "تحقیق اور دریافتیں، مبالغہ آرائی کے بغیر۔" },
    ar: { name: "العلوم", description: "الأبحاث والاكتشافات، مشروحة بلا مبالغة." },
  },
  {
    slug: "business",
    en: { name: "Business", description: "How technology changes markets, work and strategy." },
    ur: { name: "کاروبار", description: "ٹیکنالوجی منڈیوں، کام اور حکمتِ عملی کو کیسے بدلتی ہے۔" },
    ar: { name: "الأعمال", description: "كيف تغيّر التقنية الأسواق والعمل والاستراتيجية." },
  },
  {
    slug: "future",
    en: { name: "Future", description: "Long-range thinking about cities, energy, space and society." },
    ur: { name: "مستقبل", description: "شہروں، توانائی، خلا اور معاشرے کے بارے میں دور رس سوچ۔" },
    ar: { name: "المستقبل", description: "تفكير بعيد المدى حول المدن والطاقة والفضاء والمجتمع." },
  },
  {
    slug: "startups",
    en: { name: "Startups", description: "Building companies: product, funding and the economics behind them." },
    ur: { name: "اسٹارٹ اپس", description: "کمپنیاں بنانا: پروڈکٹ، سرمایہ کاری اور ان کے پیچھے معاشیات۔" },
    ar: { name: "الشركات الناشئة", description: "بناء الشركات: المنتج والتمويل والاقتصاد الذي يقف وراءها." },
  },
  {
    slug: "gadgets",
    en: { name: "Gadgets", description: "Devices worth understanding — what they do and what they don't." },
    ur: { name: "گیجٹس", description: "وہ آلات جنہیں سمجھنا ضروری ہے — وہ کیا کرتے ہیں اور کیا نہیں۔" },
    ar: { name: "الأجهزة", description: "أجهزة تستحق الفهم — ما الذي تفعله وما الذي لا تفعله." },
  },
  {
    slug: "travel",
    en: { name: "Travel", description: "Mobility, remote work and the technology of getting around." },
    ur: { name: "سفر", description: "نقل و حرکت، ریموٹ کام اور سفر کی ٹیکنالوجی۔" },
    ar: { name: "السفر", description: "التنقل والعمل عن بُعد وتقنيات السفر." },
  },
]

type AuthorL = { jobTitle: string; bio: string }
export const AUTHORS: { key: "amara" | "daniel" | "layla"; name: string; slug: string; en: AuthorL; ur: AuthorL; ar: AuthorL }[] = [
  {
    key: "amara",
    name: "Amara Vance",
    slug: "amara-vance",
    en: { jobTitle: "Technology Editor (demo)", bio: "Fictional demo profile. Replace with a real author's biography — describe genuine experience only." },
    ur: { jobTitle: "ٹیکنالوجی ایڈیٹر (نمونہ)", bio: "فرضی نمونہ پروفائل۔ کسی حقیقی مصنف کے تعارف سے تبدیل کریں — صرف حقیقی تجربہ بیان کریں۔" },
    ar: { jobTitle: "محررة التقنية (تجريبي)", bio: "ملف تجريبي خيالي. استبدله بسيرة كاتب حقيقي — واذكر الخبرة الحقيقية فقط." },
  },
  {
    key: "daniel",
    name: "Daniel Okoro",
    slug: "daniel-okoro",
    en: { jobTitle: "Science & Future Writer (demo)", bio: "Fictional demo profile used to illustrate author pages and Person structured data." },
    ur: { jobTitle: "سائنس و مستقبل نگار (نمونہ)", bio: "فرضی نمونہ پروفائل جو مصنف کے صفحات کی مثال کے لیے استعمال ہوا ہے۔" },
    ar: { jobTitle: "كاتب العلوم والمستقبل (تجريبي)", bio: "ملف تجريبي خيالي لتوضيح صفحات الكتّاب والبيانات المنظمة." },
  },
  {
    key: "layla",
    name: "Layla Haddad",
    slug: "layla-haddad",
    en: { jobTitle: "Business Correspondent (demo)", bio: "Fictional demo profile. Real bylines should link to accountable, identifiable people." },
    ur: { jobTitle: "کاروباری نامہ نگار (نمونہ)", bio: "فرضی نمونہ پروفائل۔ حقیقی بائی لائن قابلِ شناخت اور جواب دہ افراد کی ہونی چاہیے۔" },
    ar: { jobTitle: "مراسلة الأعمال (تجريبي)", bio: "ملف تجريبي خيالي. يجب أن تشير أسماء الكتّاب الحقيقية إلى أشخاص معروفين ومسؤولين." },
  },
]
