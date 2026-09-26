// Seed content for static pages (about, contact, legal & policy pages) in
// English, Urdu and Arabic. Legal pages are templates, not legal advice.

export type SeedPage = { title: string; seoDescription: string; content: string }

const LEGAL_EN = `<div class="callout"><p><strong>Template.</strong> This page is a starting point, not legal advice. Have it reviewed by a qualified professional for your jurisdiction before launch.</p></div>`
const LEGAL_UR = `<div class="callout"><p><strong>نمونہ۔</strong> یہ صفحہ ایک ابتدائی خاکہ ہے، قانونی مشورہ نہیں۔ ویب سائٹ شائع کرنے سے پہلے اپنے دائرۂ اختیار کے کسی مستند قانونی ماہر سے اس کا جائزہ ضرور کروائیں۔</p></div>`
const LEGAL_AR = `<div class="callout"><p><strong>نموذج.</strong> هذه الصفحة نقطة انطلاق وليست استشارة قانونية. احرص على أن يراجعها مختص مؤهل في نطاق ولايتك القضائية قبل الإطلاق.</p></div>`

const DEMO_EN = `<div class="callout"><p><strong>Demo content</strong> — replace with your publication's real details.</p></div>`
const DEMO_UR = `<div class="callout"><p><strong>نمونہ مواد</strong> — اسے اپنی اشاعت کی اصل تفصیلات سے تبدیل کریں۔</p></div>`
const DEMO_AR = `<div class="callout"><p><strong>محتوى تجريبي</strong> — استبدله بالتفاصيل الحقيقية الخاصة بمنشورك.</p></div>`

const GOOGLE_ADS = "https://policies.google.com/technologies/ads"

export const pages: Record<
  "about" | "contact" | "privacy" | "terms" | "cookie-policy" | "editorial-policy" | "advertising-policy",
  { en: SeedPage; ur: SeedPage; ar: SeedPage }
> = {
  // ---------------------------------------------------------------------------
  about: {
    en: {
      title: "About FutureSphere",
      seoDescription:
        "Learn about FutureSphere, a multilingual publication explaining technology, science, AI, business and the future clearly in English, Urdu and Arabic.",
      content: `${DEMO_EN}
<h2>Who we are</h2>
<p><strong>FutureSphere</strong> is a digital publication that explains technology, science, artificial intelligence, business and the ideas shaping our future — clearly, accurately and without hype. FutureSphere is published by [Company legal name].</p>
<h2>Our mission</h2>
<p>Big changes are often described in jargon that shuts most people out. Our mission is to make those changes understandable, so readers can make better decisions about their work, their money and their lives.</p>
<ul>
<li><strong>Clarity first:</strong> we explain the “why” and the “so what”, not just the headline.</li>
<li><strong>Evidence over excitement:</strong> we separate what is proven from what is promised.</li>
<li><strong>Context:</strong> we connect new developments to the people and industries they affect.</li>
</ul>
<h2>What we cover</h2>
<ul>
<li><strong>Technology</strong> — the products, platforms and infrastructure people rely on every day.</li>
<li><strong>Science</strong> — research findings explained with their limits and uncertainties.</li>
<li><strong>Artificial intelligence</strong> — how AI systems work, where they help and where they fall short.</li>
<li><strong>Business</strong> — the companies, markets and strategies behind innovation.</li>
<li><strong>The future</strong> — long-term trends in energy, cities, work and society.</li>
</ul>
<h2>Three languages, one standard</h2>
<p>We publish in <strong>English</strong>, <strong>Urdu</strong> and <strong>Arabic</strong>. Translated and adapted articles are reviewed so they read naturally in each language, and every edition follows the same editorial standards.</p>
<h2>Our standards</h2>
<p>We aim to be accurate, fair and transparent. We correct mistakes openly, label sponsored content clearly and keep advertising separate from journalism. Read our <a href="/en/editorial-policy">editorial policy</a> to learn how we research, source and correct our work.</p>
<h2>Get in touch</h2>
<p>We welcome story ideas, feedback and corrections. Visit our <a href="/en/contact">contact page</a> or email <a href="mailto:hello@example.com">hello@example.com</a>.</p>`,
    },
    ur: {
      title: "FutureSphere کے بارے میں",
      seoDescription:
        "FutureSphere کے بارے میں جانیے: ٹیکنالوجی، سائنس، مصنوعی ذہانت، کاروبار اور مستقبل کو اردو، انگریزی اور عربی میں آسان انداز میں سمجھانے والا ادارہ۔",
      content: `${DEMO_UR}
<h2>ہم کون ہیں</h2>
<p><strong>FutureSphere</strong> ایک ڈیجیٹل اشاعت ہے جو ٹیکنالوجی، سائنس، مصنوعی ذہانت، کاروبار اور ہمارے مستقبل کی تشکیل کرنے والے خیالات کو صاف، درست اور مبالغے سے پاک انداز میں بیان کرتی ہے۔ FutureSphere کو [کمپنی کا قانونی نام] شائع کرتا ہے۔</p>
<h2>ہمارا مقصد</h2>
<p>بڑی تبدیلیوں کو اکثر ایسی مشکل اصطلاحات میں بیان کیا جاتا ہے جو زیادہ تر لوگوں کی سمجھ سے باہر ہوتی ہیں۔ ہمارا مقصد ان تبدیلیوں کو قابلِ فہم بنانا ہے تاکہ قارئین اپنے کام، مالی معاملات اور زندگی کے بارے میں بہتر فیصلے کر سکیں۔</p>
<ul>
<li><strong>وضاحت سب سے پہلے:</strong> ہم صرف خبر نہیں بتاتے بلکہ یہ بھی سمجھاتے ہیں کہ یہ کیوں اہم ہے اور اس کا اثر کیا ہوگا۔</li>
<li><strong>جوش نہیں، شواہد:</strong> ہم ثابت شدہ حقائق کو محض دعووں اور وعدوں سے الگ رکھتے ہیں۔</li>
<li><strong>سیاق و سباق:</strong> ہم نئی پیش رفت کو ان لوگوں اور صنعتوں سے جوڑتے ہیں جن پر اس کا اثر پڑتا ہے۔</li>
</ul>
<h2>ہم کن موضوعات پر لکھتے ہیں</h2>
<ul>
<li><strong>ٹیکنالوجی</strong> — وہ مصنوعات، پلیٹ فارم اور بنیادی ڈھانچہ جن پر لوگ روزانہ انحصار کرتے ہیں۔</li>
<li><strong>سائنس</strong> — تحقیقی نتائج، ان کی حدود اور غیر یقینی پہلوؤں سمیت۔</li>
<li><strong>مصنوعی ذہانت</strong> — AI نظام کیسے کام کرتے ہیں، کہاں مددگار ہیں اور کہاں ناکام رہتے ہیں۔</li>
<li><strong>کاروبار</strong> — جدت کے پیچھے کارفرما کمپنیاں، منڈیاں اور حکمتِ عملیاں۔</li>
<li><strong>مستقبل</strong> — توانائی، شہروں، روزگار اور معاشرے کے طویل المدتی رجحانات۔</li>
</ul>
<h2>تین زبانیں، ایک معیار</h2>
<p>ہم <strong>انگریزی</strong>، <strong>اردو</strong> اور <strong>عربی</strong> میں شائع کرتے ہیں۔ ترجمہ شدہ اور ڈھالے گئے مضامین کا جائزہ لیا جاتا ہے تاکہ وہ ہر زبان میں فطری محسوس ہوں، اور ہر ایڈیشن ایک جیسے ادارتی معیارات پر عمل کرتا ہے۔</p>
<h2>ہمارے معیارات</h2>
<p>ہماری کوشش ہے کہ ہم درست، منصفانہ اور شفاف رہیں۔ ہم اپنی غلطیوں کی کھلے عام تصحیح کرتے ہیں، سپانسر شدہ مواد پر واضح لیبل لگاتے ہیں اور اشتہارات کو صحافت سے الگ رکھتے ہیں۔ ہم تحقیق، حوالہ جات اور تصحیح کیسے کرتے ہیں، یہ جاننے کے لیے ہماری <a href="/ur/editorial-policy">ادارتی پالیسی</a> پڑھیں۔</p>
<h2>ہم سے رابطہ کریں</h2>
<p>ہم خبروں کے آئیڈیاز، آراء اور تصحیحات کا خیرمقدم کرتے ہیں۔ ہمارا <a href="/ur/contact">رابطہ صفحہ</a> دیکھیں یا <a href="mailto:hello@example.com">hello@example.com</a> پر ای میل کریں۔</p>`,
    },
    ar: {
      title: "عن FutureSphere",
      seoDescription:
        "تعرّف على FutureSphere، منصة متعددة اللغات تشرح التقنية والعلوم والذكاء الاصطناعي والأعمال والمستقبل بوضوح بالعربية والإنجليزية والأردية.",
      content: `${DEMO_AR}
<h2>من نحن</h2>
<p><strong>FutureSphere</strong> منصة نشر رقمية تشرح التقنية والعلوم والذكاء الاصطناعي والأعمال والأفكار التي تصوغ مستقبلنا، بوضوح ودقة وبعيدًا عن التهويل. تصدر FutureSphere عن [الاسم القانوني للشركة].</p>
<h2>رسالتنا</h2>
<p>كثيرًا ما تُروى التحولات الكبرى بلغة اصطلاحية معقدة تُقصي معظم الناس. رسالتنا أن نجعل هذه التحولات مفهومة، ليتمكن القرّاء من اتخاذ قرارات أفضل في عملهم وأموالهم وحياتهم.</p>
<ul>
<li><strong>الوضوح أولًا:</strong> لا نكتفي بالعنوان، بل نشرح لماذا يهم الخبر وما الذي يترتب عليه.</li>
<li><strong>الأدلة قبل الحماس:</strong> نميّز بين ما ثبت فعلًا وما هو مجرد وعود.</li>
<li><strong>السياق:</strong> نربط كل تطور جديد بالناس والقطاعات التي يمسّها.</li>
</ul>
<h2>ما الذي نغطيه</h2>
<ul>
<li><strong>التقنية</strong> — المنتجات والمنصات والبنى التحتية التي يعتمد عليها الناس يوميًا.</li>
<li><strong>العلوم</strong> — نتائج الأبحاث مشروحةً مع حدودها وجوانب عدم اليقين فيها.</li>
<li><strong>الذكاء الاصطناعي</strong> — كيف تعمل أنظمته، وأين تفيد، وأين تقصر.</li>
<li><strong>الأعمال</strong> — الشركات والأسواق والاستراتيجيات التي تقف وراء الابتكار.</li>
<li><strong>المستقبل</strong> — الاتجاهات بعيدة المدى في الطاقة والمدن والعمل والمجتمع.</li>
</ul>
<h2>ثلاث لغات ومعيار واحد</h2>
<p>ننشر بـ<strong>الإنجليزية</strong> و<strong>الأردية</strong> و<strong>العربية</strong>. تخضع المقالات المترجمة والمكيّفة للمراجعة حتى تُقرأ بسلاسة في كل لغة، وتلتزم كل النسخ بالمعايير التحريرية نفسها.</p>
<h2>معاييرنا</h2>
<p>نسعى إلى الدقة والإنصاف والشفافية. نصحّح أخطاءنا علنًا، ونضع علامة واضحة على المحتوى المموّل، ونفصل الإعلانات عن العمل الصحفي. اطّلع على <a href="/ar/editorial-policy">سياستنا التحريرية</a> لتعرف كيف نبحث ونوثّق مصادرنا ونصحّح عملنا.</p>
<h2>تواصل معنا</h2>
<p>نرحّب بأفكار القصص والملاحظات والتصحيحات. زر <a href="/ar/contact">صفحة التواصل</a> أو راسلنا على <a href="mailto:hello@example.com">hello@example.com</a>.</p>`,
    },
  },

  // ---------------------------------------------------------------------------
  contact: {
    en: {
      title: "Contact Us",
      seoDescription:
        "Contact FutureSphere for general questions, editorial feedback and corrections, advertising enquiries or privacy requests. Email addresses and details.",
      content: `${DEMO_EN}
<p>We read every message we receive. To help us reply quickly, please use the address that best matches your request.</p>
<table>
<caption>How to reach FutureSphere</caption>
<thead><tr><th>Topic</th><th>Email</th></tr></thead>
<tbody>
<tr><td>General questions and feedback</td><td><a href="mailto:hello@example.com">hello@example.com</a></td></tr>
<tr><td>Editorial feedback and corrections</td><td><a href="mailto:editors@example.com">editors@example.com</a></td></tr>
<tr><td>Advertising enquiries</td><td><a href="mailto:hello@example.com?subject=Advertising">hello@example.com</a></td></tr>
<tr><td>Privacy and data requests</td><td><a href="mailto:hello@example.com?subject=Privacy%20request">hello@example.com</a></td></tr>
</tbody>
</table>
<h2>General enquiries</h2>
<p>For questions about FutureSphere, story ideas or feedback on the site, email <a href="mailto:hello@example.com">hello@example.com</a>.</p>
<h2>Editorial feedback and corrections</h2>
<p>If you believe something we published is inaccurate, email <a href="mailto:editors@example.com">editors@example.com</a>. Please include:</p>
<ul>
<li>the link to the article;</li>
<li>the specific sentence or claim you are concerned about;</li>
<li>any evidence or sources that support the correction.</li>
</ul>
<p>You can read how we handle corrections in our <a href="/en/editorial-policy">editorial policy</a>.</p>
<h2>Advertising</h2>
<p>For advertising enquiries, email <a href="mailto:hello@example.com?subject=Advertising">hello@example.com</a> with “Advertising” in the subject line. Please review our <a href="/en/advertising-policy">advertising policy</a> first.</p>
<h2>Privacy requests</h2>
<p>To access, correct or delete your personal data, or to unsubscribe from the newsletter, email <a href="mailto:hello@example.com?subject=Privacy%20request">hello@example.com</a>. See our <a href="/en/privacy">privacy policy</a> for details.</p>
<h2>Response times</h2>
<p>Our goal is to reply to most messages within a few working days. This is an aim rather than a guarantee — busy news periods and complex requests can take longer. Correction requests are prioritised.</p>
<h2>Postal address</h2>
<p>[Company legal name], [Registered address]</p>`,
    },
    ur: {
      title: "ہم سے رابطہ کریں",
      seoDescription:
        "عمومی سوالات، ادارتی آراء اور تصحیحات، اشتہارات یا رازداری سے متعلق درخواستوں کے لیے FutureSphere سے رابطہ کریں۔ ای میل پتے اور تفصیلات یہاں ہیں۔",
      content: `${DEMO_UR}
<p>ہم ہر موصول ہونے والا پیغام پڑھتے ہیں۔ جلد جواب کے لیے براہِ کرم وہ پتہ استعمال کریں جو آپ کی درخواست سے سب سے زیادہ مطابقت رکھتا ہو۔</p>
<table>
<caption>FutureSphere سے رابطے کے ذرائع</caption>
<thead><tr><th>موضوع</th><th>ای میل</th></tr></thead>
<tbody>
<tr><td>عمومی سوالات اور آراء</td><td><a href="mailto:hello@example.com">hello@example.com</a></td></tr>
<tr><td>ادارتی آراء اور تصحیحات</td><td><a href="mailto:editors@example.com">editors@example.com</a></td></tr>
<tr><td>اشتہارات سے متعلق استفسارات</td><td><a href="mailto:hello@example.com?subject=Advertising">hello@example.com</a></td></tr>
<tr><td>رازداری اور ڈیٹا سے متعلق درخواستیں</td><td><a href="mailto:hello@example.com?subject=Privacy%20request">hello@example.com</a></td></tr>
</tbody>
</table>
<h2>عمومی استفسارات</h2>
<p>FutureSphere کے بارے میں سوالات، خبروں کے آئیڈیاز یا ویب سائٹ سے متعلق آراء کے لیے <a href="mailto:hello@example.com">hello@example.com</a> پر ای میل کریں۔</p>
<h2>ادارتی آراء اور تصحیحات</h2>
<p>اگر آپ کے خیال میں ہماری شائع کردہ کوئی بات غلط ہے تو <a href="mailto:editors@example.com">editors@example.com</a> پر ای میل کریں۔ براہِ کرم ان باتوں کو شامل کریں:</p>
<ul>
<li>مضمون کا لنک؛</li>
<li>وہ مخصوص جملہ یا دعویٰ جس پر آپ کو اعتراض ہے؛</li>
<li>تصحیح کے حق میں کوئی ثبوت یا حوالہ۔</li>
</ul>
<p>ہم تصحیحات کیسے کرتے ہیں، یہ ہماری <a href="/ur/editorial-policy">ادارتی پالیسی</a> میں دیکھیں۔</p>
<h2>اشتہارات</h2>
<p>اشتہارات سے متعلق استفسار کے لیے <a href="mailto:hello@example.com?subject=Advertising">hello@example.com</a> پر ای میل کریں اور موضوع میں “Advertising” لکھیں۔ براہِ کرم پہلے ہماری <a href="/ur/advertising-policy">اشتہاری پالیسی</a> ملاحظہ کر لیں۔</p>
<h2>رازداری سے متعلق درخواستیں</h2>
<p>اپنے ذاتی ڈیٹا تک رسائی، اس کی درستی یا اسے حذف کروانے، یا نیوز لیٹر سے دستبردار ہونے کے لیے <a href="mailto:hello@example.com?subject=Privacy%20request">hello@example.com</a> پر ای میل کریں۔ تفصیلات کے لیے ہماری <a href="/ur/privacy">رازداری کی پالیسی</a> دیکھیں۔</p>
<h2>جواب کا وقت</h2>
<p>ہماری کوشش ہوتی ہے کہ زیادہ تر پیغامات کا جواب چند کاروباری دنوں میں دے دیں۔ یہ ایک ہدف ہے، ضمانت نہیں — مصروف خبروں کے دنوں میں یا پیچیدہ درخواستوں میں زیادہ وقت لگ سکتا ہے۔ تصحیح کی درخواستوں کو ترجیح دی جاتی ہے۔</p>
<h2>ڈاک کا پتہ</h2>
<p>[کمپنی کا قانونی نام]، [رجسٹرڈ پتہ]</p>`,
    },
    ar: {
      title: "اتصل بنا",
      seoDescription:
        "تواصل مع FutureSphere للأسئلة العامة والملاحظات التحريرية والتصحيحات واستفسارات الإعلان وطلبات الخصوصية. عناوين البريد الإلكتروني والتفاصيل.",
      content: `${DEMO_AR}
<p>نقرأ كل رسالة تصلنا. ولكي نتمكن من الرد بسرعة، يُرجى استخدام العنوان الأنسب لطلبك.</p>
<table>
<caption>طرق التواصل مع FutureSphere</caption>
<thead><tr><th>الموضوع</th><th>البريد الإلكتروني</th></tr></thead>
<tbody>
<tr><td>الأسئلة العامة والملاحظات</td><td><a href="mailto:hello@example.com">hello@example.com</a></td></tr>
<tr><td>الملاحظات التحريرية والتصحيحات</td><td><a href="mailto:editors@example.com">editors@example.com</a></td></tr>
<tr><td>استفسارات الإعلان</td><td><a href="mailto:hello@example.com?subject=Advertising">hello@example.com</a></td></tr>
<tr><td>طلبات الخصوصية والبيانات</td><td><a href="mailto:hello@example.com?subject=Privacy%20request">hello@example.com</a></td></tr>
</tbody>
</table>
<h2>الاستفسارات العامة</h2>
<p>للأسئلة المتعلقة بـFutureSphere أو لاقتراح قصص أو إبداء ملاحظات على الموقع، راسلنا على <a href="mailto:hello@example.com">hello@example.com</a>.</p>
<h2>الملاحظات التحريرية والتصحيحات</h2>
<p>إذا رأيت أن شيئًا مما نشرناه غير دقيق، فراسلنا على <a href="mailto:editors@example.com">editors@example.com</a>، ويُرجى أن تذكر:</p>
<ul>
<li>رابط المقال؛</li>
<li>الجملة أو المعلومة المحددة التي تعترض عليها؛</li>
<li>أي أدلة أو مصادر تدعم التصحيح.</li>
</ul>
<p>يمكنك معرفة طريقة تعاملنا مع التصحيحات في <a href="/ar/editorial-policy">سياستنا التحريرية</a>.</p>
<h2>الإعلان</h2>
<p>لاستفسارات الإعلان، راسلنا على <a href="mailto:hello@example.com?subject=Advertising">hello@example.com</a> مع كتابة “Advertising” في عنوان الرسالة. يُرجى الاطلاع أولًا على <a href="/ar/advertising-policy">سياسة الإعلان</a>.</p>
<h2>طلبات الخصوصية</h2>
<p>للاطلاع على بياناتك الشخصية أو تصحيحها أو حذفها، أو لإلغاء الاشتراك في النشرة البريدية، راسلنا على <a href="mailto:hello@example.com?subject=Privacy%20request">hello@example.com</a>. راجع <a href="/ar/privacy">سياسة الخصوصية</a> لمزيد من التفاصيل.</p>
<h2>مدة الرد</h2>
<p>نهدف إلى الرد على معظم الرسائل خلال بضعة أيام عمل. هذا هدف نسعى إليه وليس التزامًا مضمونًا، فقد تستغرق فترات الأخبار المزدحمة والطلبات المعقدة وقتًا أطول. ونعطي طلبات التصحيح الأولوية.</p>
<h2>العنوان البريدي</h2>
<p>[الاسم القانوني للشركة]، [العنوان المسجّل]</p>`,
    },
  },

  // ---------------------------------------------------------------------------
  privacy: {
    en: {
      title: "Privacy Policy",
      seoDescription:
        "How FutureSphere collects, uses and protects personal data: cookies, consent-based analytics and ads, newsletter sign-ups, comments and your rights.",
      content: `${LEGAL_EN}
<p><em>Last updated: [Effective date]</em></p>
<p>This policy explains what personal data FutureSphere collects, why, and the choices you have. FutureSphere is operated by [Company legal name], [Registered address] (“we”, “us”). Questions: <a href="mailto:hello@example.com">hello@example.com</a>.</p>
<h2>Cookies and browser storage</h2>
<p>We use a small number of necessary cookies (<strong>fs_consent</strong>, <strong>fs_country</strong> and, for signed-in staff only, <strong>fs_session</strong>) and two browser-only settings (<strong>theme</strong> and <strong>article-size</strong>). Full details are in our <a href="/en/cookie-policy">cookie policy</a>.</p>
<h2>Analytics</h2>
<p>With your consent where required, we use <strong>Google Analytics 4</strong> with IP anonymisation to understand readership in aggregate, such as which articles are popular.</p>
<p>We also run a first-party view counter that <strong>stores no cookies</strong>. It records one view per article per day using a one-way hash of your IP address, user agent and a secret salt that rotates daily. Raw IP addresses are never stored, and hashes cannot be linked across days.</p>
<h2>Advertising</h2>
<p>With your consent where required, <strong>Google AdSense</strong> may set cookies and show personalised or non-personalised ads. Learn how Google uses data in <a href="${GOOGLE_ADS}" rel="noopener noreferrer">Google's advertising policy</a>.</p>
<h2>Newsletter</h2>
<p>If you subscribe, we store your email address, preferred language, where you signed up and the relevant timestamps. Every email includes an unsubscribe link, and you can ask us to erase your data at any time via <a href="mailto:hello@example.com">hello@example.com</a>. We do not share or sell your newsletter data.</p>
<h2>Comments</h2>
<p>When you comment, we store your name, an optional email address (never published), your comment and a salted hash of your IP address to help prevent abuse. All comments are moderated before they appear.</p>
<h2>How we use data</h2>
<ul>
<li>to run, secure and improve the site;</li>
<li>to remember your privacy choices and display preferences;</li>
<li>to send the newsletter you asked for;</li>
<li>to publish and moderate comments and prevent abuse;</li>
<li>to measure readership and show ads, where you have allowed it.</li>
</ul>
<p>Where the law requires a legal basis, we rely on your consent (for optional analytics and advertising, and the newsletter) and our legitimate interests (for security and abuse prevention). [Confirm legal bases with counsel.]</p>
<h2>Sharing</h2>
<p>We do not sell personal data. Data is processed by our hosting and database providers to operate the site, and by Google for analytics and advertising where you have allowed it. We may disclose data if required by law.</p>
<h2>Retention</h2>
<p>Cookie lifetimes are listed in our cookie policy. Newsletter data is kept while you are subscribed or until you ask us to erase it. Comment data is kept for [Retention period].</p>
<h2>Your rights</h2>
<p>Depending on where you live, you may have the right to access, correct or delete your data, to object to or restrict certain processing, and to withdraw consent at any time. You can also complain to your local data protection supervisory authority. To make a request, email <a href="mailto:hello@example.com">hello@example.com</a>.</p>
<h2>Your choices</h2>
<p>You can change your privacy choices at any time via the <strong>Cookie settings</strong> link in the footer.</p>
<h2>Changes</h2>
<p>We may update this policy and will change the date above when we do.</p>`,
    },
    ur: {
      title: "رازداری کی پالیسی",
      seoDescription:
        "FutureSphere ذاتی ڈیٹا کیسے جمع، استعمال اور محفوظ کرتا ہے: کوکیز، رضامندی پر مبنی تجزیات اور اشتہارات، نیوز لیٹر، تبصرے اور آپ کے حقوق۔",
      content: `${LEGAL_UR}
<p><em>آخری تازہ کاری: [نفاذ کی تاریخ]</em></p>
<p>یہ پالیسی بتاتی ہے کہ FutureSphere کون سا ذاتی ڈیٹا جمع کرتا ہے، کیوں کرتا ہے اور آپ کے پاس کیا اختیارات ہیں۔ FutureSphere کو [کمپنی کا قانونی نام]، [رجسٹرڈ پتہ] (“ہم”) چلاتا ہے۔ سوالات کے لیے: <a href="mailto:hello@example.com">hello@example.com</a>۔</p>
<h2>کوکیز اور براؤزر اسٹوریج</h2>
<p>ہم چند ضروری کوکیز (<strong>fs_consent</strong>، <strong>fs_country</strong> اور صرف سائن اِن کرنے والے عملے کے لیے <strong>fs_session</strong>) اور دو ایسی ترتیبات استعمال کرتے ہیں جو صرف آپ کے براؤزر میں رہتی ہیں (<strong>theme</strong> اور <strong>article-size</strong>)۔ مکمل تفصیل ہماری <a href="/ur/cookie-policy">کوکی پالیسی</a> میں موجود ہے۔</p>
<h2>تجزیات (اینالیٹکس)</h2>
<p>جہاں ضروری ہو وہاں آپ کی رضامندی کے بعد، ہم IP کو گمنام بنانے کی سہولت کے ساتھ <strong>Google Analytics 4</strong> استعمال کرتے ہیں تاکہ مجموعی طور پر قارئین کے رجحانات سمجھ سکیں، مثلاً کون سے مضامین زیادہ پڑھے جاتے ہیں۔</p>
<p>ہم اپنا ایک ویو کاؤنٹر بھی چلاتے ہیں جو <strong>کوئی کوکی محفوظ نہیں کرتا</strong>۔ یہ ہر مضمون کے لیے روزانہ ایک ویو ریکارڈ کرتا ہے، جس کے لیے آپ کے IP ایڈریس، یوزر ایجنٹ اور روزانہ بدلنے والے ایک خفیہ “سالٹ” کا یک طرفہ ہیش بنایا جاتا ہے۔ اصل IP ایڈریس کبھی محفوظ نہیں کیے جاتے، اور مختلف دنوں کے ہیش آپس میں جوڑے نہیں جا سکتے۔</p>
<h2>اشتہارات</h2>
<p>جہاں ضروری ہو وہاں آپ کی رضامندی کے بعد، <strong>Google AdSense</strong> کوکیز لگا سکتا ہے اور ذاتی نوعیت کے یا غیر ذاتی اشتہارات دکھا سکتا ہے۔ Google ڈیٹا کیسے استعمال کرتا ہے، یہ <a href="${GOOGLE_ADS}" rel="noopener noreferrer">Google کی اشتہاری پالیسی</a> میں پڑھیں۔</p>
<h2>نیوز لیٹر</h2>
<p>اگر آپ سبسکرائب کرتے ہیں تو ہم آپ کا ای میل پتہ، پسندیدہ زبان، سائن اپ کی جگہ اور متعلقہ اوقات محفوظ کرتے ہیں۔ ہر ای میل میں ان سبسکرائب کا لنک ہوتا ہے، اور آپ کسی بھی وقت <a href="mailto:hello@example.com">hello@example.com</a> کے ذریعے اپنا ڈیٹا حذف کرنے کی درخواست کر سکتے ہیں۔ ہم نیوز لیٹر کا ڈیٹا نہ کسی سے شیئر کرتے ہیں اور نہ فروخت کرتے ہیں۔</p>
<h2>تبصرے</h2>
<p>جب آپ تبصرہ کرتے ہیں تو ہم آپ کا نام، اختیاری ای میل پتہ (جو کبھی شائع نہیں ہوتا)، آپ کا تبصرہ اور غلط استعمال کی روک تھام کے لیے آپ کے IP ایڈریس کا “سالٹڈ” ہیش محفوظ کرتے ہیں۔ تمام تبصرے شائع ہونے سے پہلے جانچے جاتے ہیں۔</p>
<h2>ہم ڈیٹا کیسے استعمال کرتے ہیں</h2>
<ul>
<li>ویب سائٹ چلانے، محفوظ رکھنے اور بہتر بنانے کے لیے؛</li>
<li>آپ کی رازداری کی ترجیحات اور ڈسپلے کی ترتیبات یاد رکھنے کے لیے؛</li>
<li>وہ نیوز لیٹر بھیجنے کے لیے جس کی آپ نے درخواست کی؛</li>
<li>تبصرے شائع کرنے، ان کی نگرانی کرنے اور غلط استعمال روکنے کے لیے؛</li>
<li>آپ کی اجازت کی صورت میں قارئین کی پیمائش اور اشتہارات دکھانے کے لیے۔</li>
</ul>
<p>جہاں قانون کسی قانونی بنیاد کا تقاضا کرتا ہے، وہاں ہم آپ کی رضامندی (اختیاری تجزیات، اشتہارات اور نیوز لیٹر کے لیے) اور اپنے جائز مفادات (سیکیورٹی اور غلط استعمال کی روک تھام کے لیے) پر انحصار کرتے ہیں۔ [قانونی بنیادوں کی تصدیق قانونی مشیر سے کریں۔]</p>
<h2>ڈیٹا کی شراکت</h2>
<p>ہم ذاتی ڈیٹا فروخت نہیں کرتے۔ ویب سائٹ چلانے کے لیے ڈیٹا ہمارے ہوسٹنگ اور ڈیٹا بیس فراہم کنندگان کے ذریعے پراسیس ہوتا ہے، اور آپ کی اجازت کی صورت میں تجزیات اور اشتہارات کے لیے Google کے ذریعے۔ قانون کے تقاضے پر ہم ڈیٹا ظاہر کر سکتے ہیں۔</p>
<h2>ڈیٹا کتنی دیر رکھا جاتا ہے</h2>
<p>کوکیز کی مدت ہماری کوکی پالیسی میں درج ہے۔ نیوز لیٹر کا ڈیٹا اس وقت تک رکھا جاتا ہے جب تک آپ سبسکرائب رہیں یا اسے حذف کرنے کی درخواست نہ کریں۔ تبصروں کا ڈیٹا [مدتِ محفوظگی] تک رکھا جاتا ہے۔</p>
<h2>آپ کے حقوق</h2>
<p>آپ کے ملک یا علاقے کے لحاظ سے آپ کو یہ حقوق حاصل ہو سکتے ہیں: اپنے ڈیٹا تک رسائی، اس کی درستی یا اسے حذف کروانا، بعض طرح کی پراسیسنگ پر اعتراض کرنا یا اسے محدود کروانا، اور کسی بھی وقت اپنی رضامندی واپس لینا۔ آپ اپنے مقامی ڈیٹا پروٹیکشن کے نگران ادارے کے پاس شکایت بھی درج کروا سکتے ہیں۔ درخواست کے لیے <a href="mailto:hello@example.com">hello@example.com</a> پر ای میل کریں۔</p>
<h2>آپ کے اختیارات</h2>
<p>آپ فوٹر میں موجود <strong>کوکی ترتیبات</strong> کے لنک سے کسی بھی وقت اپنی رازداری کی ترجیحات بدل سکتے ہیں۔</p>
<h2>تبدیلیاں</h2>
<p>ہم اس پالیسی میں ترمیم کر سکتے ہیں، اور ایسا کرنے پر اوپر دی گئی تاریخ بدل دیں گے۔</p>`,
    },
    ar: {
      title: "سياسة الخصوصية",
      seoDescription:
        "كيف تجمع FutureSphere البيانات الشخصية وتستخدمها وتحميها: ملفات الارتباط، والتحليلات والإعلانات بالموافقة، والنشرة البريدية، والتعليقات، وحقوقك.",
      content: `${LEGAL_AR}
<p><em>آخر تحديث: [تاريخ السريان]</em></p>
<p>توضح هذه السياسة البيانات الشخصية التي تجمعها FutureSphere، وسبب جمعها، والخيارات المتاحة لك. تُدار FutureSphere من قِبل [الاسم القانوني للشركة]، [العنوان المسجّل] (“نحن”). للاستفسارات: <a href="mailto:hello@example.com">hello@example.com</a>.</p>
<h2>ملفات الارتباط وتخزين المتصفح</h2>
<p>نستخدم عددًا محدودًا من ملفات الارتباط الضرورية (<strong>fs_consent</strong> و<strong>fs_country</strong>، و<strong>fs_session</strong> لفريق العمل المسجّل دخوله فقط)، وإعدادين يُحفظان في متصفحك فقط (<strong>theme</strong> و<strong>article-size</strong>). تجد التفاصيل الكاملة في <a href="/ar/cookie-policy">سياسة ملفات الارتباط</a>.</p>
<h2>التحليلات</h2>
<p>بعد موافقتك حيثما كان ذلك مطلوبًا، نستخدم <strong>Google Analytics 4</strong> مع إخفاء هوية عنوان IP لفهم أنماط القراءة بصورة إجمالية، مثل المقالات الأكثر رواجًا.</p>
<p>ونشغّل أيضًا عدّاد مشاهدات خاصًا بنا <strong>لا يخزّن أي ملفات ارتباط</strong>. يسجّل هذا العدّاد مشاهدة واحدة لكل مقال في اليوم، باستخدام تجزئة أحادية الاتجاه لعنوان IP ووكيل المستخدم و«ملح» سرّي يتغيّر يوميًا. لا تُخزَّن عناوين IP الأصلية مطلقًا، ولا يمكن ربط التجزئات عبر الأيام المختلفة.</p>
<h2>الإعلانات</h2>
<p>بعد موافقتك حيثما كان ذلك مطلوبًا، قد تضع <strong>Google AdSense</strong> ملفات ارتباط وتعرض إعلانات مخصّصة أو غير مخصّصة. اطّلع على كيفية استخدام Google للبيانات في <a href="${GOOGLE_ADS}" rel="noopener noreferrer">سياسة Google الإعلانية</a>.</p>
<h2>النشرة البريدية</h2>
<p>عند اشتراكك، نخزّن بريدك الإلكتروني ولغتك المفضلة ومصدر الاشتراك والتواريخ ذات الصلة. تتضمن كل رسالة رابطًا لإلغاء الاشتراك، ويمكنك في أي وقت طلب محو بياناتك عبر <a href="mailto:hello@example.com">hello@example.com</a>. لا نشارك بيانات النشرة البريدية ولا نبيعها.</p>
<h2>التعليقات</h2>
<p>عند التعليق، نخزّن اسمك وبريدك الإلكتروني الاختياري (الذي لا يُنشر أبدًا) ونص تعليقك وتجزئة مملّحة لعنوان IP الخاص بك للمساعدة في منع إساءة الاستخدام. تخضع جميع التعليقات للمراجعة قبل ظهورها.</p>
<h2>كيف نستخدم البيانات</h2>
<ul>
<li>لتشغيل الموقع وتأمينه وتحسينه؛</li>
<li>لتذكّر خيارات الخصوصية وتفضيلات العرض الخاصة بك؛</li>
<li>لإرسال النشرة البريدية التي طلبتها؛</li>
<li>لنشر التعليقات ومراجعتها ومنع إساءة الاستخدام؛</li>
<li>لقياس القراءة وعرض الإعلانات، إذا سمحت بذلك.</li>
</ul>
<p>حيثما يشترط القانون أساسًا قانونيًا، نعتمد على موافقتك (للتحليلات والإعلانات الاختيارية والنشرة البريدية) وعلى مصالحنا المشروعة (للأمن ومنع إساءة الاستخدام). [تحقّق من الأسس القانونية مع مستشار قانوني.]</p>
<h2>مشاركة البيانات</h2>
<p>لا نبيع البيانات الشخصية. تُعالَج البيانات لدى مزوّدي الاستضافة وقواعد البيانات لدينا لتشغيل الموقع، ولدى Google لأغراض التحليلات والإعلانات إذا سمحت بذلك. وقد نفصح عن البيانات إذا اقتضى القانون ذلك.</p>
<h2>مدة الاحتفاظ</h2>
<p>مدد صلاحية ملفات الارتباط مذكورة في سياسة ملفات الارتباط. نحتفظ ببيانات النشرة البريدية ما دمت مشتركًا أو إلى أن تطلب محوها. ونحتفظ ببيانات التعليقات لمدة [مدة الاحتفاظ].</p>
<h2>حقوقك</h2>
<p>بحسب مكان إقامتك، قد يحق لك الاطلاع على بياناتك أو تصحيحها أو حذفها، والاعتراض على بعض أوجه المعالجة أو تقييدها، وسحب موافقتك في أي وقت. ويمكنك أيضًا تقديم شكوى إلى الجهة الرقابية المختصة بحماية البيانات في بلدك. لتقديم طلب، راسلنا على <a href="mailto:hello@example.com">hello@example.com</a>.</p>
<h2>خياراتك</h2>
<p>يمكنك تغيير خيارات الخصوصية في أي وقت عبر رابط <strong>إعدادات ملفات الارتباط</strong> في تذييل الصفحة.</p>
<h2>التغييرات</h2>
<p>قد نحدّث هذه السياسة، وسنغيّر التاريخ أعلاه عند ذلك.</p>`,
    },
  },

  // ---------------------------------------------------------------------------
  terms: {
    en: {
      title: "Terms of Use",
      seoDescription:
        "The terms for using FutureSphere: acceptable use, copyright, comment licensing and moderation, third-party links, disclaimers and governing law.",
      content: `${LEGAL_EN}
<p><em>Last updated: [Effective date]</em></p>
<p>These terms govern your use of FutureSphere, operated by [Company legal name], [Registered address]. By using the site you agree to them. If you do not agree, please do not use the site.</p>
<h2>Acceptable use</h2>
<p>You agree not to:</p>
<ul>
<li>use the site for anything unlawful, fraudulent or harmful;</li>
<li>attempt to gain unauthorised access to the site, its systems or its admin area;</li>
<li>disrupt the site, including by sending malware or excessive automated requests;</li>
<li>scrape or republish our content in bulk without written permission;</li>
<li>impersonate others or misrepresent your affiliation with anyone.</li>
</ul>
<h2>Intellectual property</h2>
<p>Unless stated otherwise, articles, images, graphics and the FutureSphere name and design are owned by or licensed to [Company legal name] and are protected by copyright and other laws. You may share links and short quotations with clear attribution and a link to the original. Any other reproduction requires our written permission.</p>
<h2>Comments</h2>
<p>You keep ownership of your comments. By submitting one, you grant us a non-exclusive, royalty-free, worldwide licence to publish, display, store and edit it for length or clarity on FutureSphere and related channels.</p>
<p>All comments are moderated before they appear. We may decline or remove any comment, for example if it is abusive, off-topic, misleading, spam or infringes someone else's rights. You are responsible for what you post.</p>
<h2>Links to third-party sites</h2>
<p>We link to external websites for reference and context. We do not control them and are not responsible for their content, availability or privacy practices.</p>
<h2>Disclaimers</h2>
<p>Our content is for general information only. It is not financial, investment, legal, medical or other professional advice. Although we work hard to be accurate, the site is provided “as is”, and we do not guarantee that it will always be complete, current or available.</p>
<h2>Limitation of liability</h2>
<p>[Limitation of liability clause — to be drafted by a qualified professional for your jurisdiction.]</p>
<h2>Changes to these terms</h2>
<p>We may update these terms from time to time. We will change the date above, and continued use of the site after changes means you accept the updated terms.</p>
<h2>Governing law</h2>
<p>These terms are governed by the laws of [Governing law jurisdiction], and disputes will be handled by the courts of [Courts / venue].</p>
<h2>Contact</h2>
<p>Questions about these terms? Email <a href="mailto:hello@example.com">hello@example.com</a>.</p>`,
    },
    ur: {
      title: "شرائطِ استعمال",
      seoDescription:
        "FutureSphere کے استعمال کی شرائط: مناسب استعمال، کاپی رائٹ، تبصروں کا لائسنس اور نگرانی، بیرونی لنکس، دستبرداری اور نافذ العمل قانون۔",
      content: `${LEGAL_UR}
<p><em>آخری تازہ کاری: [نفاذ کی تاریخ]</em></p>
<p>یہ شرائط FutureSphere کے استعمال پر لاگو ہوتی ہیں، جسے [کمپنی کا قانونی نام]، [رجسٹرڈ پتہ] چلاتا ہے۔ ویب سائٹ استعمال کر کے آپ ان شرائط سے اتفاق کرتے ہیں۔ اگر آپ متفق نہیں ہیں تو براہِ کرم ویب سائٹ استعمال نہ کریں۔</p>
<h2>مناسب استعمال</h2>
<p>آپ اس بات پر اتفاق کرتے ہیں کہ آپ:</p>
<ul>
<li>ویب سائٹ کو کسی غیر قانونی، دھوکہ دہی پر مبنی یا نقصان دہ مقصد کے لیے استعمال نہیں کریں گے؛</li>
<li>ویب سائٹ، اس کے نظاموں یا ایڈمن حصے تک غیر مجاز رسائی کی کوشش نہیں کریں گے؛</li>
<li>میلویئر یا حد سے زیادہ خودکار درخواستوں کے ذریعے ویب سائٹ میں خلل نہیں ڈالیں گے؛</li>
<li>تحریری اجازت کے بغیر ہمارا مواد بڑی مقدار میں اسکریپ یا دوبارہ شائع نہیں کریں گے؛</li>
<li>کسی اور کا روپ نہیں دھاریں گے اور کسی سے اپنی وابستگی کے بارے میں غلط بیانی نہیں کریں گے۔</li>
</ul>
<h2>دانشورانہ ملکیت</h2>
<p>جب تک کچھ اور نہ بتایا جائے، مضامین، تصاویر، گرافکس اور FutureSphere کا نام اور ڈیزائن [کمپنی کا قانونی نام] کی ملکیت یا اس کے لائسنس میں ہیں اور کاپی رائٹ اور دیگر قوانین کے تحت محفوظ ہیں۔ آپ واضح حوالے اور اصل مضمون کے لنک کے ساتھ لنکس اور مختصر اقتباسات شیئر کر سکتے ہیں۔ اس کے علاوہ کسی بھی طرح کی نقل کے لیے ہماری تحریری اجازت ضروری ہے۔</p>
<h2>تبصرے</h2>
<p>آپ کے تبصروں کی ملکیت آپ ہی کے پاس رہتی ہے۔ تبصرہ جمع کرا کر آپ ہمیں ایک غیر خصوصی، بلا معاوضہ اور عالمی لائسنس دیتے ہیں کہ ہم اسے FutureSphere اور متعلقہ ذرائع پر شائع، ظاہر اور محفوظ کر سکیں اور طوالت یا وضاحت کی خاطر اس میں ترمیم کر سکیں۔</p>
<p>تمام تبصرے شائع ہونے سے پہلے جانچے جاتے ہیں۔ ہم کسی بھی تبصرے کو مسترد یا حذف کر سکتے ہیں، مثلاً اگر وہ توہین آمیز، غیر متعلق، گمراہ کن یا اسپام ہو، یا کسی اور کے حقوق کی خلاف ورزی کرتا ہو۔ آپ اپنی شائع کردہ بات کے خود ذمہ دار ہیں۔</p>
<h2>بیرونی ویب سائٹس کے لنکس</h2>
<p>ہم حوالے اور سیاق و سباق کے لیے بیرونی ویب سائٹس کے لنک دیتے ہیں۔ یہ ویب سائٹس ہمارے اختیار میں نہیں، اور ہم ان کے مواد، دستیابی یا رازداری کے طریقوں کے ذمہ دار نہیں ہیں۔</p>
<h2>دستبرداری</h2>
<p>ہمارا مواد صرف عمومی معلومات کے لیے ہے۔ یہ مالی، سرمایہ کاری، قانونی، طبی یا کسی اور پیشہ ورانہ نوعیت کا مشورہ نہیں۔ اگرچہ ہم درستی کی بھرپور کوشش کرتے ہیں، ویب سائٹ “جیسی ہے” کی بنیاد پر فراہم کی جاتی ہے، اور ہم ضمانت نہیں دیتے کہ یہ ہمیشہ مکمل، تازہ ترین یا دستیاب رہے گی۔</p>
<h2>ذمہ داری کی حد</h2>
<p>[ذمہ داری کی حد سے متعلق شق — آپ کے دائرۂ اختیار کے کسی مستند ماہر سے تیار کروائیں۔]</p>
<h2>شرائط میں تبدیلیاں</h2>
<p>ہم وقتاً فوقتاً ان شرائط میں ترمیم کر سکتے ہیں۔ ایسی صورت میں ہم اوپر دی گئی تاریخ بدل دیں گے، اور تبدیلیوں کے بعد ویب سائٹ کا استعمال جاری رکھنے کا مطلب ہوگا کہ آپ نئی شرائط قبول کرتے ہیں۔</p>
<h2>نافذ العمل قانون</h2>
<p>یہ شرائط [نافذ العمل قانون کا دائرۂ اختیار] کے قوانین کے تابع ہیں، اور تنازعات کا فیصلہ [عدالتیں / مقام] کی عدالتیں کریں گی۔</p>
<h2>رابطہ</h2>
<p>ان شرائط کے بارے میں سوالات کے لیے <a href="mailto:hello@example.com">hello@example.com</a> پر ای میل کریں۔</p>`,
    },
    ar: {
      title: "شروط الاستخدام",
      seoDescription:
        "شروط استخدام FutureSphere: الاستخدام المقبول، وحقوق النشر، وترخيص التعليقات ومراجعتها، وروابط المواقع الخارجية، وإخلاء المسؤولية، والقانون الحاكم.",
      content: `${LEGAL_AR}
<p><em>آخر تحديث: [تاريخ السريان]</em></p>
<p>تحكم هذه الشروط استخدامك لـFutureSphere التي تديرها [الاسم القانوني للشركة]، [العنوان المسجّل]. باستخدامك الموقع فإنك توافق على هذه الشروط، وإن لم توافق عليها فيُرجى عدم استخدامه.</p>
<h2>الاستخدام المقبول</h2>
<p>توافق على ألا تقوم بما يلي:</p>
<ul>
<li>استخدام الموقع لأي غرض غير قانوني أو احتيالي أو ضار؛</li>
<li>محاولة الوصول غير المصرّح به إلى الموقع أو أنظمته أو منطقة الإدارة فيه؛</li>
<li>تعطيل الموقع، بما في ذلك إرسال برمجيات خبيثة أو طلبات آلية مفرطة؛</li>
<li>جمع محتوانا آليًا أو إعادة نشره بكميات كبيرة دون إذن كتابي؛</li>
<li>انتحال شخصية الآخرين أو تقديم معلومات مضللة عن انتمائك لأي جهة.</li>
</ul>
<h2>الملكية الفكرية</h2>
<p>ما لم يُذكر خلاف ذلك، فإن المقالات والصور والرسومات واسم FutureSphere وتصميمه مملوكة لـ[الاسم القانوني للشركة] أو مرخّصة لها، ومحمية بموجب قوانين حقوق النشر وغيرها. يمكنك مشاركة الروابط والاقتباسات القصيرة مع الإشارة الواضحة إلى المصدر ووضع رابط للأصل، وأي نسخ آخر يتطلب إذنًا كتابيًا منا.</p>
<h2>التعليقات</h2>
<p>تظل ملكية تعليقاتك لك. وبإرسالك تعليقًا، تمنحنا ترخيصًا غير حصري ومجانيًا وعالميًا لنشره وعرضه وتخزينه وتحريره لأغراض الإيجاز أو الوضوح على FutureSphere والقنوات المرتبطة بها.</p>
<p>تخضع جميع التعليقات للمراجعة قبل ظهورها، ويحق لنا رفض أي تعليق أو حذفه، مثلًا إذا كان مسيئًا أو خارج الموضوع أو مضللًا أو رسالة مزعجة أو ينتهك حقوق الآخرين. وأنت مسؤول عمّا تنشره.</p>
<h2>روابط المواقع الخارجية</h2>
<p>نضع روابط لمواقع خارجية للإحالة وتوفير السياق. لا نتحكم في هذه المواقع، ولسنا مسؤولين عن محتواها أو توفرها أو ممارساتها المتعلقة بالخصوصية.</p>
<h2>إخلاء المسؤولية</h2>
<p>محتوانا لأغراض المعلومات العامة فقط، ولا يُعد استشارة مالية أو استثمارية أو قانونية أو طبية أو أي استشارة مهنية أخرى. ورغم حرصنا الشديد على الدقة، يُقدَّم الموقع «كما هو»، ولا نضمن أن يكون دائمًا كاملًا أو محدّثًا أو متاحًا.</p>
<h2>حدود المسؤولية</h2>
<p>[بند حدود المسؤولية — يُصاغ من قِبل مختص مؤهل في نطاق ولايتك القضائية.]</p>
<h2>التغييرات على هذه الشروط</h2>
<p>قد نحدّث هذه الشروط من حين لآخر، وسنغيّر التاريخ أعلاه عند ذلك. ويعني استمرارك في استخدام الموقع بعد التغييرات قبولك للشروط المحدّثة.</p>
<h2>القانون الحاكم</h2>
<p>تخضع هذه الشروط لقوانين [الولاية القضائية للقانون الحاكم]، وتختص محاكم [المحاكم / مكان التقاضي] بالنظر في أي نزاعات.</p>
<h2>التواصل</h2>
<p>لديك أسئلة حول هذه الشروط؟ راسلنا على <a href="mailto:hello@example.com">hello@example.com</a>.</p>`,
    },
  },

  // ---------------------------------------------------------------------------
  "cookie-policy": {
    en: {
      title: "Cookie Policy",
      seoDescription:
        "Which cookies and browser storage FutureSphere uses, why, how long they last, and how to change your analytics and advertising choices at any time.",
      content: `${LEGAL_EN}
<p><em>Last updated: [Effective date]</em></p>
<p>Cookies are small text files a website stores in your browser. Browser storage (localStorage) is similar but stays on your device and is not sent to our servers. This page lists exactly what FutureSphere uses. For how we handle personal data more broadly, see our <a href="/en/privacy">privacy policy</a>.</p>
<h2>Necessary cookies</h2>
<p>These are required for the site to work and to respect your choices. They are always active.</p>
<table>
<caption>Necessary cookies</caption>
<thead><tr><th>Name</th><th>Purpose</th><th>Duration</th></tr></thead>
<tbody>
<tr><td>fs_consent</td><td>Stores your privacy choices so we don't ask again on every visit.</td><td>180 days</td></tr>
<tr><td>fs_country</td><td>Stores a country code derived from our hosting provider's geolocation header. Used only to decide whether a consent banner is required.</td><td>30 days</td></tr>
<tr><td>fs_session</td><td>Keeps staff signed in to the admin area. Set only for staff who sign in; httpOnly, so it cannot be read by page scripts.</td><td>7 days</td></tr>
</tbody>
</table>
<h2>Browser storage</h2>
<table>
<caption>localStorage keys</caption>
<thead><tr><th>Key</th><th>Purpose</th></tr></thead>
<tbody>
<tr><td>theme</td><td>Remembers your light or dark mode preference.</td></tr>
<tr><td>article-size</td><td>Remembers your preferred reading text size.</td></tr>
</tbody>
</table>
<p>These values are stored only in your browser.</p>
<h2>Analytics cookies (optional)</h2>
<p>With your consent where required, we use <strong>Google Analytics 4</strong> with IP anonymisation to produce aggregated readership statistics. Google sets its own cookies for this purpose.</p>
<p>Our own view counter does <strong>not</strong> use cookies. It counts one view per article per day using a one-way hash of your IP address, user agent and a daily-rotating secret salt. Raw IP addresses are never stored, and hashes cannot be linked across days.</p>
<h2>Advertising cookies (optional)</h2>
<p>With your consent where required, <strong>Google AdSense</strong> may set cookies to show personalised or non-personalised ads and to measure their performance. See <a href="${GOOGLE_ADS}" rel="noopener noreferrer">how Google uses cookies in advertising</a>.</p>
<h2>When we ask for consent</h2>
<p>We use the <strong>fs_country</strong> cookie to work out whether the law in your region requires a consent banner. Where consent is required, optional analytics and advertising cookies are not set until you agree.</p>
<h2>Changing your choices</h2>
<ul>
<li>Use the <strong>Cookie settings</strong> link in the footer at any time to review or change your choices.</li>
<li>You can also block or delete cookies and clear site data in your browser settings. Blocking necessary cookies may affect how the site works.</li>
</ul>
<h2>Contact</h2>
<p>Questions about cookies? Email <a href="mailto:hello@example.com">hello@example.com</a>.</p>`,
    },
    ur: {
      title: "کوکی پالیسی",
      seoDescription:
        "FutureSphere کون سی کوکیز اور براؤزر اسٹوریج استعمال کرتا ہے، کیوں، کتنی مدت کے لیے، اور آپ تجزیات و اشتہارات کی ترجیحات کیسے بدل سکتے ہیں۔",
      content: `${LEGAL_UR}
<p><em>آخری تازہ کاری: [نفاذ کی تاریخ]</em></p>
<p>کوکیز چھوٹی ٹیکسٹ فائلیں ہیں جو کوئی ویب سائٹ آپ کے براؤزر میں محفوظ کرتی ہے۔ براؤزر اسٹوریج (localStorage) بھی اسی طرح کی چیز ہے، مگر یہ آپ کے آلے پر ہی رہتی ہے اور ہمارے سرورز کو نہیں بھیجی جاتی۔ اس صفحے پر بالکل وہی چیزیں درج ہیں جو FutureSphere استعمال کرتا ہے۔ ذاتی ڈیٹا کے بارے میں مجموعی معلومات کے لیے ہماری <a href="/ur/privacy">رازداری کی پالیسی</a> دیکھیں۔</p>
<h2>ضروری کوکیز</h2>
<p>یہ کوکیز ویب سائٹ کے کام کرنے اور آپ کی ترجیحات کا احترام کرنے کے لیے ضروری ہیں، اس لیے ہمیشہ فعال رہتی ہیں۔</p>
<table>
<caption>ضروری کوکیز</caption>
<thead><tr><th>نام</th><th>مقصد</th><th>مدت</th></tr></thead>
<tbody>
<tr><td>fs_consent</td><td>آپ کی رازداری کی ترجیحات محفوظ کرتی ہے تاکہ ہر بار آپ سے دوبارہ نہ پوچھا جائے۔</td><td>180 دن</td></tr>
<tr><td>fs_country</td><td>ہمارے ہوسٹنگ فراہم کنندہ کے جغرافیائی ہیڈر سے حاصل کردہ ملک کا کوڈ محفوظ کرتی ہے۔ اس کا واحد مقصد یہ طے کرنا ہے کہ آیا رضامندی کا بینر دکھانا ضروری ہے۔</td><td>30 دن</td></tr>
<tr><td>fs_session</td><td>عملے کو ایڈمن حصے میں سائن اِن رکھتی ہے۔ صرف سائن اِن کرنے والے عملے کے لیے لگتی ہے؛ httpOnly ہونے کی وجہ سے صفحے کی اسکرپٹس اسے پڑھ نہیں سکتیں۔</td><td>7 دن</td></tr>
</tbody>
</table>
<h2>براؤزر اسٹوریج</h2>
<table>
<caption>localStorage کی کلیدیں</caption>
<thead><tr><th>کلید</th><th>مقصد</th></tr></thead>
<tbody>
<tr><td>theme</td><td>لائٹ یا ڈارک موڈ کے بارے میں آپ کی پسند یاد رکھتی ہے۔</td></tr>
<tr><td>article-size</td><td>مطالعے کے لیے آپ کا پسندیدہ متن کا سائز یاد رکھتی ہے۔</td></tr>
</tbody>
</table>
<p>یہ معلومات صرف آپ کے براؤزر میں محفوظ رہتی ہیں۔</p>
<h2>تجزیاتی کوکیز (اختیاری)</h2>
<p>جہاں ضروری ہو وہاں آپ کی رضامندی کے بعد، ہم مجموعی قارئین کے اعداد و شمار کے لیے IP کو گمنام بنانے کی سہولت کے ساتھ <strong>Google Analytics 4</strong> استعمال کرتے ہیں۔ اس مقصد کے لیے Google اپنی کوکیز لگاتا ہے۔</p>
<p>ہمارا اپنا ویو کاؤنٹر کوکیز استعمال <strong>نہیں</strong> کرتا۔ یہ آپ کے IP ایڈریس، یوزر ایجنٹ اور روزانہ بدلنے والے خفیہ سالٹ کے یک طرفہ ہیش کے ذریعے ہر مضمون کا روزانہ ایک ویو گنتا ہے۔ اصل IP ایڈریس کبھی محفوظ نہیں ہوتے، اور مختلف دنوں کے ہیش آپس میں جوڑے نہیں جا سکتے۔</p>
<h2>اشتہاری کوکیز (اختیاری)</h2>
<p>جہاں ضروری ہو وہاں آپ کی رضامندی کے بعد، <strong>Google AdSense</strong> ذاتی نوعیت کے یا غیر ذاتی اشتہارات دکھانے اور ان کی کارکردگی ناپنے کے لیے کوکیز لگا سکتا ہے۔ دیکھیں کہ <a href="${GOOGLE_ADS}" rel="noopener noreferrer">Google اشتہارات میں کوکیز کیسے استعمال کرتا ہے</a>۔</p>
<h2>ہم رضامندی کب مانگتے ہیں</h2>
<p>ہم <strong>fs_country</strong> کوکی کے ذریعے یہ معلوم کرتے ہیں کہ آیا آپ کے علاقے کا قانون رضامندی کا بینر دکھانے کا تقاضا کرتا ہے۔ جہاں رضامندی ضروری ہو، وہاں اختیاری تجزیاتی اور اشتہاری کوکیز آپ کی منظوری کے بغیر نہیں لگائی جاتیں۔</p>
<h2>اپنی ترجیحات کیسے بدلیں</h2>
<ul>
<li>فوٹر میں موجود <strong>کوکی ترتیبات</strong> کے لنک سے کسی بھی وقت اپنی ترجیحات دیکھیں یا بدلیں۔</li>
<li>آپ اپنے براؤزر کی ترتیبات میں کوکیز کو بلاک یا حذف کر سکتے ہیں اور ویب سائٹ کا ڈیٹا صاف کر سکتے ہیں۔ ضروری کوکیز بلاک کرنے سے ویب سائٹ کی کارکردگی متاثر ہو سکتی ہے۔</li>
</ul>
<h2>رابطہ</h2>
<p>کوکیز کے بارے میں سوالات کے لیے <a href="mailto:hello@example.com">hello@example.com</a> پر ای میل کریں۔</p>`,
    },
    ar: {
      title: "سياسة ملفات الارتباط",
      seoDescription:
        "ملفات الارتباط وتخزين المتصفح التي تستخدمها FutureSphere، وسبب استخدامها، ومدة بقائها، وكيف تغيّر خيارات التحليلات والإعلانات في أي وقت.",
      content: `${LEGAL_AR}
<p><em>آخر تحديث: [تاريخ السريان]</em></p>
<p>ملفات الارتباط (الكوكيز) ملفات نصية صغيرة يخزّنها الموقع في متصفحك. أما تخزين المتصفح (localStorage) فمشابه لها، لكنه يبقى على جهازك ولا يُرسَل إلى خوادمنا. تسرد هذه الصفحة بدقة ما تستخدمه FutureSphere. ولمعرفة طريقة تعاملنا مع البيانات الشخصية عمومًا، راجع <a href="/ar/privacy">سياسة الخصوصية</a>.</p>
<h2>ملفات الارتباط الضرورية</h2>
<p>هذه الملفات لازمة لعمل الموقع واحترام خياراتك، ولذلك تبقى مفعّلة دائمًا.</p>
<table>
<caption>ملفات الارتباط الضرورية</caption>
<thead><tr><th>الاسم</th><th>الغرض</th><th>المدة</th></tr></thead>
<tbody>
<tr><td>fs_consent</td><td>يحفظ خيارات الخصوصية الخاصة بك حتى لا نسألك مجددًا في كل زيارة.</td><td>180 يومًا</td></tr>
<tr><td>fs_country</td><td>يحفظ رمز الدولة المستخلص من ترويسة تحديد الموقع الجغرافي لدى مزوّد الاستضافة. يُستخدم فقط لتحديد ما إذا كان عرض شريط الموافقة مطلوبًا.</td><td>30 يومًا</td></tr>
<tr><td>fs_session</td><td>يُبقي فريق العمل مسجّلين في منطقة الإدارة. لا يُعيَّن إلا لمن يسجّل الدخول منهم؛ وهو من نوع httpOnly فلا يمكن لنصوص الصفحة البرمجية قراءته.</td><td>7 أيام</td></tr>
</tbody>
</table>
<h2>تخزين المتصفح</h2>
<table>
<caption>مفاتيح localStorage</caption>
<thead><tr><th>المفتاح</th><th>الغرض</th></tr></thead>
<tbody>
<tr><td>theme</td><td>يتذكّر تفضيلك للوضع الفاتح أو الداكن.</td></tr>
<tr><td>article-size</td><td>يتذكّر حجم نص القراءة المفضّل لديك.</td></tr>
</tbody>
</table>
<p>تُحفظ هذه القيم في متصفحك فقط.</p>
<h2>ملفات ارتباط التحليلات (اختيارية)</h2>
<p>بعد موافقتك حيثما كان ذلك مطلوبًا، نستخدم <strong>Google Analytics 4</strong> مع إخفاء هوية عنوان IP لإعداد إحصاءات قراءة إجمالية، وتضع Google ملفات الارتباط الخاصة بها لهذا الغرض.</p>
<p>أما عدّاد المشاهدات الخاص بنا فـ<strong>لا</strong> يستخدم ملفات الارتباط؛ إذ يحتسب مشاهدة واحدة لكل مقال في اليوم باستخدام تجزئة أحادية الاتجاه لعنوان IP ووكيل المستخدم و«ملح» سرّي يتغيّر يوميًا. لا تُخزَّن عناوين IP الأصلية مطلقًا، ولا يمكن ربط التجزئات عبر الأيام المختلفة.</p>
<h2>ملفات ارتباط الإعلانات (اختيارية)</h2>
<p>بعد موافقتك حيثما كان ذلك مطلوبًا، قد تضع <strong>Google AdSense</strong> ملفات ارتباط لعرض إعلانات مخصّصة أو غير مخصّصة وقياس أدائها. اطّلع على <a href="${GOOGLE_ADS}" rel="noopener noreferrer">كيفية استخدام Google لملفات الارتباط في الإعلانات</a>.</p>
<h2>متى نطلب موافقتك</h2>
<p>نستخدم ملف الارتباط <strong>fs_country</strong> لمعرفة ما إذا كان القانون في منطقتك يشترط عرض شريط الموافقة. وحيثما كانت الموافقة مطلوبة، لا تُعيَّن ملفات ارتباط التحليلات والإعلانات الاختيارية إلا بعد موافقتك.</p>
<h2>تغيير خياراتك</h2>
<ul>
<li>استخدم رابط <strong>إعدادات ملفات الارتباط</strong> في تذييل الصفحة في أي وقت لمراجعة خياراتك أو تغييرها.</li>
<li>يمكنك أيضًا حظر ملفات الارتباط أو حذفها ومسح بيانات الموقع من إعدادات متصفحك. وقد يؤثر حظر الملفات الضرورية في طريقة عمل الموقع.</li>
</ul>
<h2>التواصل</h2>
<p>لديك أسئلة حول ملفات الارتباط؟ راسلنا على <a href="mailto:hello@example.com">hello@example.com</a>.</p>`,
    },
  },

  // ---------------------------------------------------------------------------
  "editorial-policy": {
    en: {
      title: "Editorial Policy",
      seoDescription:
        "FutureSphere's editorial standards: independence, fact-checking, sourcing, corrections, conflicts of interest, sponsored content labels and AI use.",
      content: `${DEMO_EN}
<p>Readers trust us to explain complex subjects accurately. This policy sets out the standards every FutureSphere article is expected to meet, in every language we publish.</p>
<h2>Independence</h2>
<p>Our editors decide what we cover and how. Advertisers, sponsors, investors and sources have no right to review, approve or change our journalism before or after publication.</p>
<h2>Accuracy and fact-checking</h2>
<ul>
<li>Facts, figures, quotes and technical claims are checked against reliable sources before publication.</li>
<li>We distinguish clearly between reporting, analysis and opinion.</li>
<li>We explain uncertainty — early research, forecasts and company claims are described as such.</li>
<li>Translated articles are reviewed for accuracy as well as fluency.</li>
</ul>
<h2>Sourcing</h2>
<p>We prefer primary sources: original research papers, official data, court and regulatory filings, and people with direct knowledge. We link to sources wherever possible. We use anonymous sources only when there is no other way to report important information, and we explain why.</p>
<h2>Corrections</h2>
<p>When we get something wrong, we fix it openly.</p>
<ol>
<li><strong>How to request a correction:</strong> email <a href="mailto:editors@example.com">editors@example.com</a> with the article link, the claim in question and any supporting evidence.</li>
<li><strong>Review:</strong> an editor reviews every request.</li>
<li><strong>How corrections are marked:</strong> significant errors are corrected with a note at the end of the article explaining what changed, and the article's “Updated” date is refreshed. We do not silently change facts.</li>
<li><strong>Minor fixes</strong> such as typos may be corrected without a note.</li>
</ol>
<h2>Conflicts of interest</h2>
<p>Writers and editors must disclose any financial or personal interest related to a story. Where a conflict exists, they step back from the story or the interest is disclosed clearly to readers. We do not accept gifts or payment in exchange for coverage.</p>
<h2>Sponsored content</h2>
<p>Paid or sponsored content is always clearly labelled as sponsored and kept visually distinct from editorial articles. Ads are handled under our <a href="/en/advertising-policy">advertising policy</a>.</p>
<h2>Use of AI tools</h2>
<p>AI tools may assist with research, translation or early drafting. Every article is reviewed, fact-checked and approved by a human editor before publication, and we never auto-publish AI-generated content. Editors remain fully responsible for everything we publish.</p>
<h2>Bylines and accountability</h2>
<p>Bylines identify the real, accountable people responsible for an article. <em>Note: the author bylines currently shown on this demo site are fictional demo profiles and must be replaced with real authors before launch.</em></p>
<h2>Contact</h2>
<p>Questions about our standards? Email <a href="mailto:editors@example.com">editors@example.com</a>.</p>`,
    },
    ur: {
      title: "ادارتی پالیسی",
      seoDescription:
        "FutureSphere کے ادارتی معیارات: خودمختاری، حقائق کی جانچ، حوالہ جات، تصحیحات، مفادات کا ٹکراؤ، سپانسر شدہ مواد کے لیبل اور AI کا استعمال۔",
      content: `${DEMO_UR}
<p>قارئین ہم پر بھروسا کرتے ہیں کہ ہم پیچیدہ موضوعات کو درست انداز میں سمجھائیں گے۔ یہ پالیسی ان معیارات کو بیان کرتی ہے جن پر FutureSphere کا ہر مضمون، ہر زبان میں، پورا اترنا چاہیے۔</p>
<h2>خودمختاری</h2>
<p>ہم کیا اور کیسے شائع کریں، یہ فیصلہ ہمارے مدیران کرتے ہیں۔ مشتہرین، سپانسرز، سرمایہ کاروں یا ذرائع کو اشاعت سے پہلے یا بعد میں ہماری صحافت کا جائزہ لینے، اسے منظور کرنے یا بدلنے کا کوئی حق نہیں۔</p>
<h2>درستی اور حقائق کی جانچ</h2>
<ul>
<li>حقائق، اعداد و شمار، اقتباسات اور تکنیکی دعووں کو اشاعت سے پہلے معتبر ذرائع سے جانچا جاتا ہے۔</li>
<li>ہم خبر، تجزیے اور رائے میں واضح فرق رکھتے ہیں۔</li>
<li>ہم غیر یقینی پہلوؤں کی وضاحت کرتے ہیں — ابتدائی تحقیق، پیش گوئیوں اور کمپنیوں کے دعووں کو اسی حیثیت میں پیش کیا جاتا ہے۔</li>
<li>ترجمہ شدہ مضامین کو روانی کے ساتھ ساتھ درستی کے لیے بھی جانچا جاتا ہے۔</li>
</ul>
<h2>حوالہ جات اور ذرائع</h2>
<p>ہم بنیادی ذرائع کو ترجیح دیتے ہیں: اصل تحقیقی مقالے، سرکاری اعداد و شمار، عدالتی اور ریگولیٹری دستاویزات، اور وہ افراد جنہیں براہِ راست معلومات حاصل ہوں۔ جہاں ممکن ہو ہم ذرائع کا لنک دیتے ہیں۔ گمنام ذرائع صرف اسی وقت استعمال کیے جاتے ہیں جب اہم معلومات تک پہنچنے کا کوئی اور راستہ نہ ہو، اور ہم اس کی وجہ بھی بتاتے ہیں۔</p>
<h2>تصحیحات</h2>
<p>جب ہم سے غلطی ہوتی ہے تو ہم کھلے عام اس کی اصلاح کرتے ہیں۔</p>
<ol>
<li><strong>تصحیح کی درخواست کیسے کریں:</strong> مضمون کے لنک، متعلقہ دعوے اور کسی معاون ثبوت کے ساتھ <a href="mailto:editors@example.com">editors@example.com</a> پر ای میل کریں۔</li>
<li><strong>جائزہ:</strong> ہر درخواست کا جائزہ ایک مدیر لیتا ہے۔</li>
<li><strong>تصحیح کی نشاندہی کیسے ہوتی ہے:</strong> اہم غلطیوں کی تصحیح کے ساتھ مضمون کے آخر میں ایک نوٹ شامل کیا جاتا ہے جس میں تبدیلی کی وضاحت ہوتی ہے، اور مضمون کی “تازہ کاری” کی تاریخ بدل دی جاتی ہے۔ ہم خاموشی سے حقائق تبدیل نہیں کرتے۔</li>
<li><strong>معمولی اصلاحات</strong>، جیسے ہجے کی غلطیاں، بغیر نوٹ کے درست کی جا سکتی ہیں۔</li>
</ol>
<h2>مفادات کا ٹکراؤ</h2>
<p>لکھاریوں اور مدیران کے لیے لازم ہے کہ کسی خبر سے متعلق اپنا ہر مالی یا ذاتی مفاد ظاہر کریں۔ مفادات کے ٹکراؤ کی صورت میں وہ اس خبر سے الگ ہو جاتے ہیں یا قارئین کو اس مفاد سے واضح طور پر آگاہ کیا جاتا ہے۔ ہم کوریج کے بدلے تحائف یا معاوضہ قبول نہیں کرتے۔</p>
<h2>سپانسر شدہ مواد</h2>
<p>معاوضہ یا سپانسرشپ پر مبنی مواد پر ہمیشہ واضح طور پر “سپانسر شدہ” کا لیبل ہوتا ہے اور اسے ادارتی مضامین سے بصری طور پر الگ رکھا جاتا ہے۔ اشتہارات ہماری <a href="/ur/advertising-policy">اشتہاری پالیسی</a> کے تحت آتے ہیں۔</p>
<h2>AI ٹولز کا استعمال</h2>
<p>AI ٹولز تحقیق، ترجمے یا ابتدائی مسودہ تیار کرنے میں مدد دے سکتے ہیں۔ ہر مضمون اشاعت سے پہلے کسی انسانی مدیر کے جائزے، حقائق کی جانچ اور منظوری سے گزرتا ہے، اور ہم AI سے تیار کردہ مواد کبھی خودکار طور پر شائع نہیں کرتے۔ ہماری ہر اشاعت کی مکمل ذمہ داری مدیران پر ہے۔</p>
<h2>بائی لائن اور جوابدہی</h2>
<p>بائی لائن ان حقیقی اور جوابدہ افراد کی نشاندہی کرتی ہے جو کسی مضمون کے ذمہ دار ہیں۔ <em>نوٹ: اس نمونہ ویب سائٹ پر اس وقت دکھائی جانے والی مصنفین کی بائی لائنز فرضی نمونہ پروفائلز ہیں، جنہیں اشاعت سے پہلے حقیقی مصنفین سے بدلنا ضروری ہے۔</em></p>
<h2>رابطہ</h2>
<p>ہمارے معیارات کے بارے میں سوالات کے لیے <a href="mailto:editors@example.com">editors@example.com</a> پر ای میل کریں۔</p>`,
    },
    ar: {
      title: "السياسة التحريرية",
      seoDescription:
        "معايير FutureSphere التحريرية: الاستقلالية، والتحقق من الحقائق، والمصادر، والتصحيحات، وتضارب المصالح، ووسم المحتوى المموّل، واستخدام الذكاء الاصطناعي.",
      content: `${DEMO_AR}
<p>يثق القرّاء بأننا سنشرح لهم الموضوعات المعقدة بدقة. تحدد هذه السياسة المعايير التي يُنتظر أن يلتزم بها كل مقال في FutureSphere، وبكل لغة ننشر بها.</p>
<h2>الاستقلالية</h2>
<p>محرّرونا هم من يقرّرون ما نغطيه وكيف نغطيه. ولا يحق للمعلنين أو الرعاة أو المستثمرين أو المصادر مراجعة عملنا الصحفي أو إقراره أو تغييره، لا قبل النشر ولا بعده.</p>
<h2>الدقة والتحقق من الحقائق</h2>
<ul>
<li>نتحقق من الحقائق والأرقام والاقتباسات والادعاءات التقنية من مصادر موثوقة قبل النشر.</li>
<li>نفصل بوضوح بين الخبر والتحليل والرأي.</li>
<li>نوضّح جوانب عدم اليقين، فنقدّم الأبحاث الأولية والتوقعات وادعاءات الشركات على حقيقتها.</li>
<li>نراجع المقالات المترجمة للتأكد من دقتها لا من سلاستها فحسب.</li>
</ul>
<h2>المصادر</h2>
<p>نفضّل المصادر الأولية: الأوراق البحثية الأصلية، والبيانات الرسمية، والوثائق القضائية والتنظيمية، والأشخاص الذين يملكون معرفة مباشرة. ونضع روابط للمصادر كلما أمكن. ولا نلجأ إلى المصادر المجهّلة إلا حين لا توجد وسيلة أخرى لنقل معلومات مهمة، ونوضح سبب ذلك.</p>
<h2>التصحيحات</h2>
<p>عندما نخطئ، نصحّح الخطأ بشفافية.</p>
<ol>
<li><strong>كيف تطلب تصحيحًا:</strong> راسلنا على <a href="mailto:editors@example.com">editors@example.com</a> مرفقًا رابط المقال والمعلومة المعنية وأي أدلة داعمة.</li>
<li><strong>المراجعة:</strong> يراجع أحد المحرّرين كل طلب.</li>
<li><strong>كيف نُظهر التصحيح:</strong> تُصحَّح الأخطاء الجوهرية مع إضافة ملاحظة في نهاية المقال توضح ما الذي تغيّر، ويُحدَّث تاريخ «آخر تحديث» للمقال. لا نغيّر الحقائق بصمت.</li>
<li><strong>الإصلاحات البسيطة</strong> مثل الأخطاء الإملائية قد تُصحَّح دون ملاحظة.</li>
</ol>
<h2>تضارب المصالح</h2>
<p>على الكتّاب والمحرّرين الإفصاح عن أي مصلحة مالية أو شخصية تتصل بالقصة. وعند وجود تضارب، يتنحّون عن القصة أو يُفصَح عن المصلحة للقرّاء بوضوح. ولا نقبل الهدايا أو المدفوعات مقابل التغطية.</p>
<h2>المحتوى المموّل</h2>
<p>يحمل المحتوى المدفوع أو المموّل دائمًا وسمًا واضحًا يبيّن أنه مموّل، ويُميَّز بصريًا عن المقالات التحريرية. أما الإعلانات فتخضع لـ<a href="/ar/advertising-policy">سياسة الإعلان</a> لدينا.</p>
<h2>استخدام أدوات الذكاء الاصطناعي</h2>
<p>قد تساعد أدوات الذكاء الاصطناعي في البحث أو الترجمة أو إعداد المسودات الأولى. ويخضع كل مقال قبل نشره لمراجعة محرّر بشري وتدقيقه وموافقته، ولا ننشر أبدًا محتوى مولَّدًا بالذكاء الاصطناعي بصورة تلقائية. ويتحمّل المحرّرون المسؤولية الكاملة عن كل ما ننشره.</p>
<h2>أسماء الكتّاب والمساءلة</h2>
<p>يدل اسم الكاتب على الأشخاص الحقيقيين الخاضعين للمساءلة والمسؤولين عن المقال. <em>ملاحظة: أسماء الكتّاب الظاهرة حاليًا على هذا الموقع التجريبي ملفات تعريف وهمية لأغراض العرض، ويجب استبدالها بكتّاب حقيقيين قبل الإطلاق.</em></p>
<h2>التواصل</h2>
<p>لديك أسئلة حول معاييرنا؟ راسلنا على <a href="mailto:editors@example.com">editors@example.com</a>.</p>`,
    },
  },

  // ---------------------------------------------------------------------------
  "advertising-policy": {
    en: {
      title: "Advertising Policy",
      seoDescription:
        "How FutureSphere handles advertising: clear “Advertisement” labels, strict separation from editorial, honest ad placement and how to contact us.",
      content: `${LEGAL_EN}
<p><em>Last updated: [Effective date]</em></p>
<p>Advertising helps keep FutureSphere free to read. This policy explains how we display ads while protecting our readers and our editorial independence.</p>
<h2>Clear labelling</h2>
<p>Every ad on FutureSphere is clearly labelled <strong>“Advertisement”</strong>, so you can always tell paid messages apart from our journalism.</p>
<h2>Separation from editorial</h2>
<ul>
<li>Advertisers have no influence over what we cover or what we say.</li>
<li>Our editorial team does not write, edit or endorse ads.</li>
<li>Ads are visually distinct from articles and are never styled to look like editorial content.</li>
</ul>
<p>Our commitment to independence is described in our <a href="/en/editorial-policy">editorial policy</a>.</p>
<h2>Sponsored content</h2>
<p>We never publish sponsored or paid content without a clear label. If a piece is paid for, it says so prominently.</p>
<h2>Honest ad placement</h2>
<ul>
<li>Ads are never placed in a way designed to encourage accidental clicks — for example, right next to buttons, menus or links.</li>
<li>We never ask or encourage readers to click on ads.</li>
<li>Ads do not cover content or prevent you from reading an article.</li>
</ul>
<h2>Ad personalisation and your choices</h2>
<p>We use <strong>Google AdSense</strong>. With your consent where required, Google may use cookies to show personalised or non-personalised ads. Learn more in <a href="${GOOGLE_ADS}" rel="noopener noreferrer">Google's advertising policy</a> and our <a href="/en/cookie-policy">cookie policy</a>. You can change your choices at any time via the <strong>Cookie settings</strong> link in the footer.</p>
<h2>Reporting an ad</h2>
<p>If you see an ad that seems misleading, offensive or inappropriate, email <a href="mailto:hello@example.com?subject=Ad%20report">hello@example.com</a> with the page link and, if possible, a screenshot.</p>
<h2>Advertising with us</h2>
<p>For advertising enquiries, email <a href="mailto:hello@example.com?subject=Advertising">hello@example.com</a> with “Advertising” in the subject line. All advertising remains subject to this policy.</p>`,
    },
    ur: {
      title: "اشتہاری پالیسی",
      seoDescription:
        "FutureSphere اشتہارات کو کیسے سنبھالتا ہے: واضح “اشتہار” لیبل، ادارتی مواد سے مکمل علیحدگی، دیانت دارانہ اشتہاری جگہیں اور ہم سے رابطے کا طریقہ۔",
      content: `${LEGAL_UR}
<p><em>آخری تازہ کاری: [نفاذ کی تاریخ]</em></p>
<p>اشتہارات کی بدولت FutureSphere سب کے لیے مفت دستیاب ہے۔ یہ پالیسی بتاتی ہے کہ ہم اپنے قارئین اور اپنی ادارتی خودمختاری کا تحفظ کرتے ہوئے اشتہارات کیسے دکھاتے ہیں۔</p>
<h2>واضح لیبل</h2>
<p>FutureSphere پر ہر اشتہار پر واضح طور پر <strong>“اشتہار”</strong> لکھا ہوتا ہے، تاکہ آپ ہمیشہ معاوضہ شدہ پیغامات اور ہماری صحافت میں فرق کر سکیں۔</p>
<h2>ادارتی مواد سے علیحدگی</h2>
<ul>
<li>مشتہرین کا اس پر کوئی اثر نہیں کہ ہم کن موضوعات پر لکھتے ہیں یا کیا کہتے ہیں۔</li>
<li>ہماری ادارتی ٹیم اشتہارات نہ لکھتی ہے، نہ ان میں ترمیم کرتی ہے اور نہ ان کی توثیق کرتی ہے۔</li>
<li>اشتہارات بصری طور پر مضامین سے الگ ہوتے ہیں اور انہیں کبھی ادارتی مواد جیسا نہیں بنایا جاتا۔</li>
</ul>
<p>خودمختاری سے متعلق ہمارا عزم ہماری <a href="/ur/editorial-policy">ادارتی پالیسی</a> میں بیان کیا گیا ہے۔</p>
<h2>سپانسر شدہ مواد</h2>
<p>ہم کوئی بھی سپانسر شدہ یا معاوضہ شدہ مواد واضح لیبل کے بغیر شائع نہیں کرتے۔ اگر کسی تحریر کے لیے معاوضہ دیا گیا ہو تو یہ بات نمایاں طور پر بتائی جاتی ہے۔</p>
<h2>دیانت دارانہ اشتہاری جگہیں</h2>
<ul>
<li>اشتہارات کبھی اس طرح نہیں لگائے جاتے کہ ان پر غلطی سے کلک ہو جائے — مثلاً بٹنوں، مینیو یا لنکس کے بالکل ساتھ۔</li>
<li>ہم قارئین سے کبھی اشتہارات پر کلک کرنے کو نہیں کہتے اور نہ اس کی ترغیب دیتے ہیں۔</li>
<li>اشتہارات مواد کو نہیں ڈھانپتے اور نہ مضمون پڑھنے میں رکاوٹ بنتے ہیں۔</li>
</ul>
<h2>ذاتی نوعیت کے اشتہارات اور آپ کے اختیارات</h2>
<p>ہم <strong>Google AdSense</strong> استعمال کرتے ہیں۔ جہاں ضروری ہو وہاں آپ کی رضامندی کے بعد، Google ذاتی نوعیت کے یا غیر ذاتی اشتہارات دکھانے کے لیے کوکیز استعمال کر سکتا ہے۔ مزید جاننے کے لیے <a href="${GOOGLE_ADS}" rel="noopener noreferrer">Google کی اشتہاری پالیسی</a> اور ہماری <a href="/ur/cookie-policy">کوکی پالیسی</a> دیکھیں۔ آپ فوٹر میں موجود <strong>کوکی ترتیبات</strong> کے لنک سے کسی بھی وقت اپنی ترجیحات بدل سکتے ہیں۔</p>
<h2>کسی اشتہار کی شکایت</h2>
<p>اگر آپ کو کوئی اشتہار گمراہ کن، ناگوار یا نامناسب لگے تو صفحے کے لنک اور اگر ممکن ہو تو اسکرین شاٹ کے ساتھ <a href="mailto:hello@example.com?subject=Ad%20report">hello@example.com</a> پر ای میل کریں۔</p>
<h2>ہمارے ساتھ تشہیر</h2>
<p>اشتہارات سے متعلق استفسار کے لیے <a href="mailto:hello@example.com?subject=Advertising">hello@example.com</a> پر ای میل کریں اور موضوع میں “Advertising” لکھیں۔ تمام اشتہارات اس پالیسی کے تابع رہتے ہیں۔</p>`,
    },
    ar: {
      title: "سياسة الإعلان",
      seoDescription:
        "كيف تتعامل FutureSphere مع الإعلانات: وسم واضح بكلمة «إعلان»، وفصل صارم عن المحتوى التحريري، ومواضع عرض نزيهة، وطريقة التواصل معنا.",
      content: `${LEGAL_AR}
<p><em>آخر تحديث: [تاريخ السريان]</em></p>
<p>تساعد الإعلانات على إبقاء FutureSphere متاحة للقراءة مجانًا. توضح هذه السياسة كيف نعرض الإعلانات مع حماية قرّائنا واستقلالنا التحريري.</p>
<h2>وسم واضح</h2>
<p>يحمل كل إعلان على FutureSphere وسمًا واضحًا بكلمة <strong>«إعلان»</strong>، حتى تتمكن دائمًا من التمييز بين الرسائل المدفوعة وعملنا الصحفي.</p>
<h2>الفصل عن المحتوى التحريري</h2>
<ul>
<li>لا تأثير للمعلنين على ما نغطيه أو ما نقوله.</li>
<li>لا يكتب فريقنا التحريري الإعلانات ولا يحرّرها ولا يروّج لها.</li>
<li>تتميّز الإعلانات بصريًا عن المقالات، ولا تُصمَّم أبدًا لتبدو كمحتوى تحريري.</li>
</ul>
<p>نوضح التزامنا بالاستقلالية في <a href="/ar/editorial-policy">سياستنا التحريرية</a>.</p>
<h2>المحتوى المموّل</h2>
<p>لا ننشر أبدًا محتوى مموّلًا أو مدفوعًا دون وسم واضح. وإذا كانت المادة مدفوعة الأجر، فإننا نذكر ذلك بشكل بارز.</p>
<h2>مواضع عرض نزيهة</h2>
<ul>
<li>لا تُوضع الإعلانات أبدًا بطريقة تشجّع على النقر عليها عن غير قصد، كأن توضع ملاصقة للأزرار أو القوائم أو الروابط.</li>
<li>لا نطلب من القرّاء أبدًا النقر على الإعلانات ولا نشجّعهم على ذلك.</li>
<li>لا تحجب الإعلانات المحتوى ولا تمنعك من قراءة المقال.</li>
</ul>
<h2>تخصيص الإعلانات وخياراتك</h2>
<p>نستخدم <strong>Google AdSense</strong>. وبعد موافقتك حيثما كان ذلك مطلوبًا، قد تستخدم Google ملفات الارتباط لعرض إعلانات مخصّصة أو غير مخصّصة. اعرف المزيد في <a href="${GOOGLE_ADS}" rel="noopener noreferrer">سياسة Google الإعلانية</a> و<a href="/ar/cookie-policy">سياسة ملفات الارتباط</a> لدينا. ويمكنك تغيير خياراتك في أي وقت عبر رابط <strong>إعدادات ملفات الارتباط</strong> في تذييل الصفحة.</p>
<h2>الإبلاغ عن إعلان</h2>
<p>إذا رأيت إعلانًا يبدو مضللًا أو مسيئًا أو غير لائق، فراسلنا على <a href="mailto:hello@example.com?subject=Ad%20report">hello@example.com</a> مرفقًا رابط الصفحة، ولقطة شاشة إن أمكن.</p>
<h2>الإعلان معنا</h2>
<p>لاستفسارات الإعلان، راسلنا على <a href="mailto:hello@example.com?subject=Advertising">hello@example.com</a> مع كتابة “Advertising” في عنوان الرسالة. وتخضع جميع الإعلانات لهذه السياسة.</p>`,
    },
  },
}
