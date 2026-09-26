export type SeedTranslation = {
  title: string        // 40–90 chars, descriptive, no clickbait
  slug: string         // ASCII lowercase, hyphens only, regex ^[a-z0-9]+(?:-[a-z0-9]+)*$, <= 60 chars. For ur/ar use a short ASCII transliteration or English slug (e.g. "mustaqbil-ai-agents" or same as English) — must be unique within that language across all articles
  excerpt: string      // 120–220 chars, plain text
  content: string      // HTML body (see rules)
}
export type SeedArticle = {
  key: string                      // unique kebab id, also used as the demo image filename key
  category: "technology" | "ai" | "science" | "business" | "future" | "startups" | "gadgets" | "travel"
  author: "amara" | "daniel" | "layla"
  tags: string[]                   // tag slugs from the TAGS list below, 2–4 each
  featured?: boolean
  trending?: boolean
  editorsPick?: boolean
  daysAgo: number                  // publish date offset, distinct values 1..40
  primaryTopic: string
  translations: { en: SeedTranslation; ur?: SeedTranslation; ar?: SeedTranslation }
}

export const TAGS: { slug: string; en: string; ur: string; ar: string }[] = [
  { slug: "artificial-intelligence", en: "Artificial Intelligence", ur: "مصنوعی ذہانت", ar: "الذكاء الاصطناعي" },
  { slug: "machine-learning", en: "Machine Learning", ur: "مشین لرننگ", ar: "التعلم الآلي" },
  { slug: "robotics", en: "Robotics", ur: "روبوٹکس", ar: "الروبوتات" },
  { slug: "climate-tech", en: "Climate Tech", ur: "موسمیاتی ٹیکنالوجی", ar: "تقنيات المناخ" },
  { slug: "space", en: "Space", ur: "خلا", ar: "الفضاء" },
  { slug: "quantum-computing", en: "Quantum Computing", ur: "کوانٹم کمپیوٹنگ", ar: "الحوسبة الكمومية" },
  { slug: "cybersecurity", en: "Cybersecurity", ur: "سائبر سیکیورٹی", ar: "الأمن السيبراني" },
  { slug: "startups", en: "Startups", ur: "اسٹارٹ اپس", ar: "الشركات الناشئة" },
  { slug: "cloud-computing", en: "Cloud Computing", ur: "کلاؤڈ کمپیوٹنگ", ar: "الحوسبة السحابية" },
  { slug: "mobility", en: "Mobility", ur: "نقل و حمل", ar: "التنقل" },
  { slug: "health-tech", en: "Health Tech", ur: "صحت ٹیکنالوجی", ar: "التقنيات الصحية" },
  { slug: "semiconductors", en: "Semiconductors", ur: "سیمی کنڈکٹرز", ar: "أشباه الموصلات" },
]

const NOTICE_EN = `<div class="callout"><p><strong>Demo content.</strong> This article is sample text generated for demonstration. Replace it with original reporting before launch.</p></div>`
const NOTICE_UR = `<div class="callout"><p><strong>ڈیمو مواد۔</strong> یہ مضمون نمائش کے مقصد سے تیار کیا گیا نمونہ متن ہے۔ لانچ سے پہلے اسے اصل رپورٹنگ سے تبدیل کریں۔</p></div>`
const NOTICE_AR = `<div class="callout"><p><strong>محتوى تجريبي.</strong> هذه المقالة نص نموذجي أُنشئ لأغراض العرض. استبدله بتقارير أصلية قبل الإطلاق.</p></div>`

export const articles: SeedArticle[] = [
  // 1 ─────────────────────────────────────────────────────────────
  {
    key: "ai-agents-explained",
    category: "ai",
    author: "amara",
    tags: ["artificial-intelligence", "machine-learning", "cloud-computing"],
    featured: true,
    daysAgo: 1,
    primaryTopic: "AI agents",
    translations: {
      en: {
        title: "How AI Agents Plan, Act, and Check Their Own Work",
        slug: "how-ai-agents-plan-act-and-check-their-work",
        excerpt:
          "AI agents do more than answer a single prompt: they pursue a goal step by step. Here is how the core loop works, where it breaks, and why guardrails matter.",
        content: `${NOTICE_EN}
<h2>From chatbot to agent</h2>
<p>A conventional chatbot answers one message at a time. An AI agent is given a goal instead, and it decides for itself which steps to take to reach that goal. Under the hood, most agents still rely on a large language model, but the model is wrapped in a loop that lets it plan, call external tools, read the results, and try again when something goes wrong.</p>
<p>That loop is the important idea. A single model response can be impressive, yet it has no way to confirm that a booking went through or that a spreadsheet formula actually works. An agent can check, because it treats each action as an experiment whose outcome feeds the next decision.</p>
<h2>The core loop: plan, act, observe</h2>
<p>Most agent designs, whatever their branding, follow a similar cycle. The details vary, but the broad stages look like this:</p>
<ol>
<li><strong>Plan:</strong> the model breaks the goal into smaller tasks and chooses the next one.</li>
<li><strong>Act:</strong> it calls a tool, such as a search function, a calculator, a code runner, or an internal company API.</li>
<li><strong>Observe:</strong> the tool's output is added to the agent's working memory.</li>
<li><strong>Reflect:</strong> the model decides whether the goal is met, whether to continue, or whether to change course.</li>
</ol>
<p>A simplified version of that loop in TypeScript might look like the sketch below. Real systems add error handling, logging, and permission checks, but the skeleton is surprisingly small.</p>
<pre><code class="language-ts">type Step = { thought: string; tool?: string; input?: unknown }

async function runAgent(goal: string, maxSteps = 5) {
  const history: Step[] = []
  for (let i = 0; i &lt; maxSteps; i++) {
    const step = await planNextStep(goal, history)
    if (!step.tool) return step.thought // final answer
    const result = await callTool(step.tool, step.input)
    history.push({ ...step, input: result })
  }
  return "Stopped: step limit reached"
}</code></pre>
<p>Notice the step limit. Without it, an agent that misreads a result can keep trying indefinitely, spending compute and possibly repeating actions that have side effects. Bounding the loop is one of the simplest safety measures a developer can add.</p>
<h3>Memory and context</h3>
<p>Agents need some way to remember what they have already done. Short-term memory is usually the conversation history passed back into the model on each step. Longer tasks may use a separate store, such as a database of notes or a vector index, so the agent can retrieve relevant facts without overflowing the model's context window. Where that processing happens also matters; our explainer on <a href="/en/technology/edge-computing-explained">edge computing</a> looks at why some workloads move closer to the user.</p>
<h2>Where agents struggle</h2>
<p>The same flexibility that makes agents useful also makes them unpredictable. A model can misunderstand a tool's output, invent a parameter that does not exist, or confidently report success after a silent failure. Each extra step is another chance for a small mistake to compound.</p>
<blockquote><p>An agent is only as trustworthy as the checks placed around its actions. The model proposes; the surrounding software should verify.</p><cite>FutureSphere analysis</cite></blockquote>
<p>For that reason, careful teams tend to give agents narrow permissions, require human approval for irreversible actions like payments or deletions, and keep detailed logs so that every decision can be reviewed later. Identity practices such as those described in our guide to <a href="/en/technology/passkeys-explained-password-free-sign-in">passkeys</a> are increasingly relevant as agents act on behalf of real accounts.</p>
<p>Much of the current engineering effort focuses less on raw model intelligence and more on reliability: clearer tool descriptions, structured outputs that software can validate, and evaluation suites that test whether an agent completes realistic tasks from start to finish. Progress on those unglamorous details is likely to matter more to everyday users than any single benchmark score.</p>
<p>For now, the most practical way to think about an AI agent is as a capable but junior assistant: fast, tireless, and helpful with well-defined work, yet in need of clear boundaries and a second pair of eyes.</p>`,
      },
      ur: {
        title: "اے آئی ایجنٹس کیسے منصوبہ بناتے، عمل کرتے اور اپنے کام کی جانچ کرتے ہیں",
        slug: "how-ai-agents-plan-act-and-check-their-work",
        excerpt:
          "اے آئی ایجنٹ صرف ایک سوال کا جواب نہیں دیتے بلکہ قدم بہ قدم کسی مقصد کی طرف بڑھتے ہیں۔ جانیے ان کا بنیادی چکر کیسے چلتا ہے اور انہیں محفوظ رکھنے کے لیے کن حدود کی ضرورت ہے۔",
        content: `${NOTICE_UR}
<h2>چیٹ بوٹ سے ایجنٹ تک</h2>
<p>عام چیٹ بوٹ ایک وقت میں ایک پیغام کا جواب دیتا ہے، جبکہ اے آئی ایجنٹ کو ایک مقصد دیا جاتا ہے اور وہ خود طے کرتا ہے کہ وہاں تک پہنچنے کے لیے کون سے قدم اٹھانے ہیں۔ زیادہ تر ایجنٹ اب بھی بڑے لسانی ماڈل پر چلتے ہیں، مگر اس ماڈل کو ایک ایسے چکر میں رکھا جاتا ہے جو اسے منصوبہ بنانے، ٹولز استعمال کرنے اور نتائج دیکھ کر دوبارہ کوشش کرنے دیتا ہے۔</p>
<h2>بنیادی چکر: منصوبہ، عمل، مشاہدہ</h2>
<p>مختلف ایجنٹس کی تفصیلات الگ ہو سکتی ہیں، لیکن ان کا ڈھانچہ عموماً ملتا جلتا ہے:</p>
<ol>
<li><strong>منصوبہ:</strong> ماڈل مقصد کو چھوٹے کاموں میں تقسیم کرتا ہے۔</li>
<li><strong>عمل:</strong> وہ کوئی ٹول استعمال کرتا ہے، جیسے سرچ، کیلکولیٹر یا کوڈ چلانے والا نظام۔</li>
<li><strong>مشاہدہ:</strong> ٹول کا نتیجہ ایجنٹ کی یادداشت میں شامل ہو جاتا ہے۔</li>
<li><strong>غور:</strong> ماڈل فیصلہ کرتا ہے کہ کام مکمل ہوا یا راستہ بدلنا ہے۔</li>
</ol>
<p>اس چکر پر قدموں کی ایک حد رکھنا ضروری ہے، ورنہ کسی نتیجے کو غلط سمجھنے والا ایجنٹ بار بار کوشش کرتا رہ سکتا ہے۔</p>
<h3>یادداشت اور سیاق</h3>
<p>ایجنٹ کو یاد رکھنا ہوتا ہے کہ وہ پہلے کیا کر چکا ہے۔ مختصر یادداشت عموماً گفتگو کی تاریخ ہوتی ہے، جبکہ طویل کاموں کے لیے الگ ڈیٹا بیس استعمال کیا جا سکتا ہے۔ یہ پروسیسنگ کہاں ہوتی ہے، اس پر ہمارا مضمون <a href="/ur/technology/edge-computing-explained">ایج کمپیوٹنگ</a> روشنی ڈالتا ہے۔</p>
<h2>ایجنٹ کہاں مشکل میں پڑتے ہیں</h2>
<p>ایجنٹ کسی ٹول کا نتیجہ غلط سمجھ سکتا ہے، ایسا پیرامیٹر گھڑ سکتا ہے جو موجود ہی نہ ہو، یا ناکامی کے باوجود کامیابی کا اعلان کر سکتا ہے۔ ہر اضافی قدم کے ساتھ چھوٹی غلطی کے بڑھنے کا امکان بھی بڑھتا ہے۔</p>
<blockquote><p>ایجنٹ اتنا ہی قابلِ اعتماد ہے جتنی اس کے اعمال کے گرد رکھی گئی جانچ۔ ماڈل تجویز دیتا ہے، باقی سافٹ ویئر کو تصدیق کرنی چاہیے۔</p><cite>فیوچر اسفیئر تجزیہ</cite></blockquote>
<p>اسی لیے محتاط ٹیمیں ایجنٹس کو محدود اجازتیں دیتی ہیں، ادائیگی جیسے ناقابلِ واپسی کاموں کے لیے انسانی منظوری لازمی رکھتی ہیں، اور ہر فیصلے کا ریکارڈ محفوظ کرتی ہیں۔ شناخت کے جدید طریقے، جیسے <a href="/ur/technology/passkeys-explained-password-free-sign-in">پاس کیز</a>، یہاں بھی اہم ہو جاتے ہیں۔</p>
<p>فی الحال اے آئی ایجنٹ کو ایک تیز رفتار مگر نوآموز معاون سمجھنا بہتر ہے: واضح کاموں میں مددگار، مگر حدود اور نگرانی کا محتاج۔</p>`,
      },
      ar: {
        title: "كيف يخطط وكلاء الذكاء الاصطناعي وينفذون ويراجعون عملهم بأنفسهم",
        slug: "how-ai-agents-plan-act-and-check-their-work",
        excerpt:
          "لا يكتفي وكيل الذكاء الاصطناعي بالإجابة عن سؤال واحد، بل يسعى نحو هدف عبر خطوات متتالية. نشرح هنا الحلقة الأساسية التي يعمل بها، والحدود التي تجعله أكثر أمانًا.",
        content: `${NOTICE_AR}
<h2>من روبوت المحادثة إلى الوكيل</h2>
<p>يرد روبوت المحادثة التقليدي على رسالة واحدة في كل مرة، أما وكيل الذكاء الاصطناعي فيُمنح هدفًا ويقرر بنفسه الخطوات اللازمة لبلوغه. تعتمد معظم الوكلاء على نموذج لغوي كبير، لكن هذا النموذج يوضع داخل حلقة تتيح له التخطيط واستدعاء الأدوات الخارجية وقراءة النتائج ثم المحاولة من جديد عند الخطأ.</p>
<p>هذه الحلقة هي جوهر الفكرة؛ فالإجابة المنفردة لا تستطيع التأكد من نجاح حجز أو صحة معادلة في جدول بيانات، بينما يستطيع الوكيل التحقق لأنه يتعامل مع كل إجراء كتجربة تغذي قراره التالي.</p>
<h2>الحلقة الأساسية: خطط، نفّذ، راقب</h2>
<p>تختلف التفاصيل من نظام لآخر، لكن المراحل العامة متشابهة:</p>
<ol>
<li><strong>التخطيط:</strong> يقسم النموذج الهدف إلى مهام أصغر ويختار أولاها.</li>
<li><strong>التنفيذ:</strong> يستدعي أداة مثل البحث أو الآلة الحاسبة أو بيئة لتشغيل الشيفرة.</li>
<li><strong>المراقبة:</strong> تُضاف نتيجة الأداة إلى ذاكرة العمل.</li>
<li><strong>المراجعة:</strong> يقرر النموذج هل تحقق الهدف أم ينبغي تغيير المسار.</li>
</ol>
<p>ومن أبسط إجراءات الأمان وضع حد أقصى لعدد الخطوات، حتى لا يستمر وكيل أساء فهم نتيجة ما في المحاولة بلا نهاية.</p>
<h3>الذاكرة والسياق</h3>
<p>يحتاج الوكيل إلى تذكر ما أنجزه. الذاكرة القصيرة غالبًا هي سجل المحادثة، أما المهام الطويلة فقد تستعين بقاعدة بيانات منفصلة لاسترجاع المعلومات المهمة. ويؤثر مكان المعالجة أيضًا، وهو ما نتناوله في مقالنا عن <a href="/ar/technology/edge-computing-explained">الحوسبة الطرفية</a>.</p>
<h2>أين يتعثر الوكلاء؟</h2>
<p>قد يسيء الوكيل فهم مخرجات أداة، أو يخترع معاملًا غير موجود، أو يعلن النجاح رغم فشل صامت. وكل خطوة إضافية تمنح الخطأ الصغير فرصة للتضخم.</p>
<blockquote><p>الوكيل جدير بالثقة بقدر ما تحيط بأفعاله من ضوابط؛ النموذج يقترح، والبرمجيات المحيطة به يجب أن تتحقق.</p><cite>تحليل فيوتشر سفير</cite></blockquote>
<p>لهذا تمنح الفرق الحذرة الوكلاء صلاحيات محدودة، وتشترط موافقة بشرية على الإجراءات التي لا يمكن التراجع عنها كالمدفوعات، وتحتفظ بسجلات مفصلة لكل قرار. كما تزداد أهمية أساليب التحقق من الهوية الحديثة مثل <a href="/ar/technology/passkeys-explained-password-free-sign-in">مفاتيح المرور</a> عندما يعمل الوكيل باسم حسابات حقيقية.</p>
<p>في الوقت الحالي، يمكن النظر إلى الوكيل كمساعد سريع ومجتهد لكنه مبتدئ: مفيد في المهام الواضحة، لكنه يحتاج إلى حدود صريحة وعين ثانية تراجع عمله.</p>`,
      },
    },
  },

  // 2 ─────────────────────────────────────────────────────────────
  {
    key: "small-language-models",
    category: "ai",
    author: "daniel",
    tags: ["artificial-intelligence", "machine-learning", "semiconductors"],
    trending: true,
    daysAgo: 3,
    primaryTopic: "On-device language models",
    translations: {
      en: {
        title: "Why Smaller Language Models Are Moving Onto Everyday Devices",
        slug: "smaller-language-models-on-everyday-devices",
        excerpt:
          "Compact language models are starting to run directly on phones and laptops. Here is how they are made smaller, what they do well, and where their limits still are.",
        content: `${NOTICE_EN}
<h2>Bigger is not always better</h2>
<p>For several years, progress in language models was often described in terms of size: more parameters, more training data, more computing power. That approach produced remarkably capable systems, but it also produced models that need data-center hardware to run. A parallel line of work asks a different question: how much useful capability can fit on a device that sits in your pocket?</p>
<p>Smaller language models, sometimes called compact or on-device models, are designed for exactly that. They will not match the broadest cloud models on every task, yet for summarizing a message, drafting a reply, or understanding a voice command, they can be good enough while offering real advantages in speed, cost, and privacy.</p>
<h2>How models are made smaller</h2>
<p>Engineers use a toolbox of techniques, often in combination:</p>
<ul>
<li><strong>Distillation:</strong> a large "teacher" model generates examples that a smaller "student" model learns to imitate.</li>
<li><strong>Quantization:</strong> numbers inside the model are stored with fewer bits, shrinking memory use and speeding up arithmetic, usually at some cost in accuracy.</li>
<li><strong>Pruning:</strong> connections that contribute little are removed.</li>
<li><strong>Careful data selection:</strong> training on cleaner, more focused data can help a smaller model perform above its size.</li>
</ul>
<p>None of these is free. Aggressive quantization can make a model more likely to stumble on unusual inputs, and a distilled student may inherit its teacher's blind spots. Much of the craft lies in deciding which trade-offs matter for a given product.</p>
<h3>The hardware side</h3>
<p>Modern phones and laptops increasingly include dedicated neural processing units, blocks of silicon tuned for the matrix math that models depend on. These chips are designed to run such workloads more efficiently than a general-purpose processor, which helps with battery life. The broader shift toward specialized and customizable chip designs is part of the story told in our look at <a href="/en/technology/risc-v-open-instruction-set-architectures">RISC-V and open instruction sets</a>.</p>
<h2>Why run a model locally?</h2>
<p>Running on the device changes the experience in several ways. Responses can arrive without a round trip to a server, which makes features feel instant. Data such as personal messages can stay on the phone, which reduces exposure. And once a model ships, each additional query costs the developer nothing in cloud fees.</p>
<blockquote><p>The most interesting question is no longer which model is largest, but which model is right-sized for the job in front of it.</p><cite>FutureSphere analysis</cite></blockquote>
<p>There are downsides too. Devices have limited memory, so only one or two models may fit at once. Updating a model means shipping a large download. And a small model is more likely to lack niche knowledge, so many products use a hybrid approach: handle simple requests locally and send harder ones to the cloud, ideally with the user's knowledge.</p>
<h2>What it means for developers</h2>
<p>For app builders, compact models open up features that were previously too expensive or too slow. They also pair naturally with agent-style designs, where a small local model handles routine steps and escalates only when needed; our explainer on <a href="/en/ai/how-ai-agents-plan-act-and-check-their-work">how AI agents work</a> covers that loop in more detail.</p>
<p>The likely outcome is not a winner-takes-all contest between big and small models, but a layered system in which each size does the work it is best suited for.</p>`,
      },
      ur: {
        title: "چھوٹے لسانی ماڈلز روزمرہ آلات پر کیوں منتقل ہو رہے ہیں",
        slug: "smaller-language-models-on-everyday-devices",
        excerpt:
          "مختصر لسانی ماڈلز اب براہِ راست فونز اور لیپ ٹاپس پر چلنے لگے ہیں۔ یہ مضمون بتاتا ہے کہ انہیں چھوٹا کیسے بنایا جاتا ہے، وہ کن کاموں میں اچھے ہیں اور ان کی حدود کیا ہیں۔",
        content: `${NOTICE_UR}
<h2>بڑا ہمیشہ بہتر نہیں</h2>
<p>کئی برسوں تک لسانی ماڈلز کی ترقی کو زیادہ پیرامیٹرز، زیادہ ڈیٹا اور زیادہ کمپیوٹنگ طاقت سے ناپا جاتا رہا۔ اس سے نہایت قابل نظام بنے، مگر انہیں چلانے کے لیے ڈیٹا سینٹر درکار ہوتا ہے۔ ایک متوازی سوچ یہ پوچھتی ہے کہ جیب میں رکھے آلے پر کتنی مفید صلاحیت سما سکتی ہے؟</p>
<p>چھوٹے ماڈلز ہر کام میں بڑے کلاؤڈ ماڈلز کا مقابلہ نہیں کرتے، لیکن پیغام کا خلاصہ، مختصر جواب کا مسودہ یا آواز کے حکم کو سمجھنے جیسے کاموں کے لیے کافی ہو سکتے ہیں، اور رفتار، لاگت اور رازداری کے فوائد بھی دیتے ہیں۔</p>
<h2>ماڈلز کو چھوٹا کیسے کیا جاتا ہے</h2>
<ul>
<li><strong>ڈسٹلیشن:</strong> ایک بڑا "استاد" ماڈل مثالیں بناتا ہے جن کی نقل ایک چھوٹا "شاگرد" ماڈل سیکھتا ہے۔</li>
<li><strong>کوانٹائزیشن:</strong> ماڈل کے اعداد کم بٹس میں محفوظ کیے جاتے ہیں، جس سے میموری بچتی ہے مگر درستگی کچھ کم ہو سکتی ہے۔</li>
<li><strong>پروننگ:</strong> کم اہم کنکشنز ہٹا دیے جاتے ہیں۔</li>
<li><strong>منتخب ڈیٹا:</strong> صاف اور مرکوز ڈیٹا پر تربیت چھوٹے ماڈل کو بہتر بنا سکتی ہے۔</li>
</ul>
<p>ان میں سے ہر طریقے کے ساتھ کوئی نہ کوئی سمجھوتہ جڑا ہے، اور اصل مہارت یہ طے کرنے میں ہے کہ کسی خاص پروڈکٹ کے لیے کون سا سمجھوتہ قابلِ قبول ہے۔</p>
<h3>ہارڈویئر کا کردار</h3>
<p>جدید فونز اور لیپ ٹاپس میں اب خصوصی نیورل پروسیسنگ یونٹس شامل ہوتے ہیں جو ماڈلز کے حساب کتاب کو زیادہ مؤثر انداز میں چلانے کے لیے بنائے جاتے ہیں، اور اس سے بیٹری بھی کم خرچ ہوتی ہے۔</p>
<h2>آلے پر ماڈل چلانے کے فائدے اور نقصانات</h2>
<p>جواب سرور تک جائے بغیر فوراً مل سکتا ہے، ذاتی پیغامات فون پر ہی رہتے ہیں، اور ہر اضافی سوال پر کلاؤڈ کا خرچ نہیں آتا۔ دوسری طرف آلے کی میموری محدود ہے، ماڈل اپ ڈیٹ کرنے کے لیے بڑی ڈاؤن لوڈ درکار ہوتی ہے، اور چھوٹے ماڈل میں مخصوص معلومات کی کمی ہو سکتی ہے۔</p>
<blockquote><p>اب اہم سوال یہ نہیں کہ سب سے بڑا ماڈل کون سا ہے، بلکہ یہ کہ سامنے موجود کام کے لیے مناسب سائز کا ماڈل کون سا ہے۔</p><cite>فیوچر اسفیئر تجزیہ</cite></blockquote>
<p>اسی لیے بہت سی مصنوعات ملا جلا طریقہ اپناتی ہیں: آسان درخواستیں آلے پر اور مشکل درخواستیں کلاؤڈ پر۔ یہ ماڈلز <a href="/ur/ai/how-ai-agents-plan-act-and-check-their-work">اے آئی ایجنٹس</a> کے ساتھ بھی خوب جچتے ہیں، جہاں چھوٹا ماڈل معمول کے قدم سنبھالتا ہے اور ضرورت پڑنے پر ہی بڑے ماڈل سے مدد لیتا ہے۔</p>`,
      },
      ar: {
        title: "لماذا تنتقل نماذج اللغة الصغيرة إلى أجهزتنا اليومية؟",
        slug: "smaller-language-models-on-everyday-devices",
        excerpt:
          "بدأت نماذج لغوية مدمجة تعمل مباشرة على الهواتف والحواسيب المحمولة. نشرح كيف تُصغَّر هذه النماذج، وفيمَ تتفوق، وأين تبقى حدودها واضحة للمستخدمين والمطورين.",
        content: `${NOTICE_AR}
<h2>الأكبر ليس دائمًا الأفضل</h2>
<p>لسنوات طويلة قيس تقدم النماذج اللغوية بالحجم: مزيد من المعاملات والبيانات وقدرة الحوسبة. أنتج هذا النهج أنظمة لافتة، لكنه أنتج أيضًا نماذج تحتاج إلى عتاد مراكز البيانات. وفي المقابل يطرح اتجاه آخر سؤالًا مختلفًا: ما مقدار القدرة المفيدة التي يمكن أن يتسع لها جهاز في جيبك؟</p>
<p>لن تضاهي النماذج الصغيرة أكبر النماذج السحابية في كل مهمة، لكنها قد تكفي لتلخيص رسالة أو صياغة رد قصير أو فهم أمر صوتي، مع مزايا حقيقية في السرعة والتكلفة والخصوصية.</p>
<h2>كيف تُصغَّر النماذج؟</h2>
<ul>
<li><strong>التقطير:</strong> يولّد نموذج كبير "معلّم" أمثلة يتعلم نموذج "تلميذ" أصغر محاكاتها.</li>
<li><strong>التكميم:</strong> تُخزَّن الأرقام داخل النموذج بعدد أقل من البتات، فيقل استهلاك الذاكرة مع احتمال خسارة بعض الدقة.</li>
<li><strong>التقليم:</strong> تُزال الوصلات قليلة الأثر.</li>
<li><strong>انتقاء البيانات:</strong> التدريب على بيانات أنظف وأكثر تركيزًا قد يرفع أداء النموذج الصغير.</li>
</ul>
<p>لا تأتي أي من هذه التقنيات بلا ثمن، وتكمن البراعة في اختيار التنازلات المناسبة لكل منتج.</p>
<h3>دور العتاد</h3>
<p>تضم الهواتف والحواسيب الحديثة بشكل متزايد وحدات معالجة عصبية مخصصة لعمليات المصفوفات التي تعتمد عليها النماذج، وهي مصممة لتنفيذها بكفاءة أعلى من المعالج العام، ما يساعد على إطالة عمر البطارية.</p>
<h2>لماذا التشغيل على الجهاز؟</h2>
<p>قد تصل الاستجابة دون رحلة إلى الخادم، وتبقى البيانات الشخصية على الهاتف، ولا يدفع المطور رسوم سحابة مقابل كل استعلام إضافي. في المقابل، ذاكرة الجهاز محدودة، وتحديث النموذج يتطلب تنزيلًا كبيرًا، وقد يفتقر النموذج الصغير إلى معارف متخصصة.</p>
<blockquote><p>لم يعد السؤال الأهم: أي نموذج هو الأكبر؟ بل: أي نموذج بالحجم المناسب للمهمة التي بين أيدينا؟</p><cite>تحليل فيوتشر سفير</cite></blockquote>
<p>لذلك تعتمد منتجات كثيرة نهجًا هجينًا: الطلبات البسيطة محليًا والأصعب عبر السحابة. وتنسجم هذه النماذج أيضًا مع تصميم <a href="/ar/ai/how-ai-agents-plan-act-and-check-their-work">وكلاء الذكاء الاصطناعي</a>، إذ يتولى نموذج محلي صغير الخطوات الروتينية ولا يستعين بالنموذج الأكبر إلا عند الحاجة.</p>
<p>النتيجة المرجحة ليست منافسة يفوز فيها طرف واحد، بل منظومة متعددة الطبقات يؤدي فيها كل حجم ما يناسبه.</p>`,
      },
    },
  },

  // 3 ─────────────────────────────────────────────────────────────
  {
    key: "multimodal-robot-learning",
    category: "ai",
    author: "layla",
    tags: ["artificial-intelligence", "robotics", "machine-learning"],
    editorsPick: true,
    daysAgo: 6,
    primaryTopic: "Robot learning",
    translations: {
      en: {
        title: "Teaching Robots with Multimodal AI: From Language to Motion",
        slug: "teaching-robots-with-multimodal-ai",
        excerpt:
          "Multimodal AI models that link images, text, and movement could make teaching a robot a new task feel more like explaining than programming. Here is how, and what is still missing.",
        content: `${NOTICE_EN}
<h2>Why robots are hard to teach</h2>
<p>Software lives in a tidy world of text and numbers. Robots do not. A robot arm in a warehouse has to cope with shiny packaging, awkward shapes, changing light, and people walking past. Traditionally, each new task required engineers to write detailed instructions or collect large amounts of task-specific training data, which made robots powerful in narrow roles but slow to adapt.</p>
<p>Multimodal AI models, which learn from combinations of images, text, and sometimes sensor or motion data, offer a different route. The hope is that a robot could understand an instruction like "put the red mug on the top shelf" by connecting words to what its cameras see and to movements it already knows how to make.</p>
<h2>How the pieces fit together</h2>
<p>Research systems differ, but many share a layered structure:</p>
<ol>
<li><strong>Perception:</strong> vision models identify objects, surfaces, and their positions.</li>
<li><strong>Language grounding:</strong> the instruction is linked to specific things in the scene.</li>
<li><strong>Planning:</strong> the task is broken into steps such as reach, grasp, lift, and place.</li>
<li><strong>Control:</strong> low-level software turns each step into motor commands, often many times per second.</li>
</ol>
<p>Large models tend to be most useful in the upper layers, where flexibility matters. The lowest control layer usually remains specialized, because it must react in milliseconds and cannot afford to be vague.</p>
<h3>Learning from demonstration</h3>
<p>One popular training approach is to have a person guide a robot through a task, either physically or through remote control, and record everything. Models trained on many such demonstrations can learn general patterns of manipulation. Simulation helps too: virtual environments let robots practise thousands of variations safely, although behaviour that works in simulation does not always transfer cleanly to the real world.</p>
<h2>The gaps that remain</h2>
<p>Despite striking research demonstrations, several challenges keep general-purpose robots out of most homes and workplaces. Reliability is the biggest. A system that succeeds most of the time may still be unacceptable if its failures involve dropping fragile goods or bumping into people.</p>
<ul>
<li><strong>Safety:</strong> physical mistakes can cause real harm, so testing standards are demanding.</li>
<li><strong>Speed and cost:</strong> large models can be slow and power-hungry to run on board, which is one reason the compact models discussed in <a href="/en/ai/smaller-language-models-on-everyday-devices">our look at smaller language models</a> are relevant here.</li>
<li><strong>Data:</strong> good demonstration data is expensive and slow to collect.</li>
</ul>
<blockquote><p>In robotics, a clever plan is worth little if the grip slips. Progress will be measured in boring reliability, not viral videos.</p><cite>FutureSphere analysis</cite></blockquote>
<p>For companies building robots, the practical path often involves narrow pilots in controlled environments before any broader rollout, a pattern we explore in <a href="/en/startups/how-hardware-startups-de-risk-pilots">how hardware startups reduce risk</a>.</p>
<p>There is also a question of how robots should ask for help. A system that recognizes its own uncertainty and pauses to check with a person is often more valuable than one that pushes ahead confidently, and designing that behaviour is an active area of work.</p>
<p>Multimodal AI will not make robots general-purpose overnight. It does, however, make it plausible that teaching a robot a new task could one day feel more like explaining it to a colleague than programming a machine.</p>`,
      },
      ar: {
        title: "تعليم الروبوتات بالذكاء الاصطناعي متعدد الوسائط: من اللغة إلى الحركة",
        slug: "teaching-robots-with-multimodal-ai",
        excerpt:
          "تسعى نماذج الذكاء الاصطناعي التي تجمع بين الصور والنصوص وبيانات الحركة إلى جعل تعليم الروبوت مهمة جديدة أقرب إلى الشرح منه إلى البرمجة. إليك كيف يعمل ذلك وما الذي ينقصه.",
        content: `${NOTICE_AR}
<h2>لماذا يصعب تعليم الروبوتات؟</h2>
<p>تعيش البرمجيات في عالم مرتب من النصوص والأرقام، أما الروبوت فيواجه عالمًا فوضويًا: عبوات لامعة وأشكال غير منتظمة وإضاءة متغيرة وأشخاص يمرون بجانبه. وكانت كل مهمة جديدة تتطلب تقليديًا تعليمات مفصلة أو كميات كبيرة من بيانات التدريب الخاصة بها.</p>
<p>تقدم النماذج متعددة الوسائط، التي تتعلم من الصور والنصوص وأحيانًا من بيانات الحركة، طريقًا مختلفًا. فالأمل أن يفهم الروبوت أمرًا مثل "ضع الكوب الأحمر على الرف العلوي" عبر ربط الكلمات بما تراه كاميراته وبالحركات التي يتقنها.</p>
<h2>كيف تتكامل الأجزاء؟</h2>
<ol>
<li><strong>الإدراك:</strong> تتعرف نماذج الرؤية على الأشياء ومواقعها.</li>
<li><strong>ربط اللغة بالمشهد:</strong> يُربط الأمر بعناصر محددة أمام الروبوت.</li>
<li><strong>التخطيط:</strong> تُقسَّم المهمة إلى خطوات كالوصول والإمساك والرفع والوضع.</li>
<li><strong>التحكم:</strong> تحوّل برمجيات منخفضة المستوى كل خطوة إلى أوامر للمحركات بسرعة عالية.</li>
</ol>
<p>تفيد النماذج الكبيرة غالبًا في الطبقات العليا حيث المرونة مهمة، بينما تبقى طبقة التحكم الدنيا متخصصة لأنها يجب أن تستجيب في أجزاء من الثانية.</p>
<h3>التعلم من العرض العملي</h3>
<p>من الأساليب الشائعة أن يوجّه إنسان الروبوت خلال مهمة ما، يدويًا أو عن بُعد، مع تسجيل كل شيء. كما تتيح المحاكاة التدرب على آلاف الحالات بأمان، مع أن ما ينجح افتراضيًا لا ينتقل دائمًا بسلاسة إلى الواقع.</p>
<h2>الفجوات المتبقية</h2>
<p>الموثوقية هي التحدي الأكبر؛ فالنظام الذي ينجح في أغلب الأحيان قد يظل غير مقبول إذا كانت أخطاؤه تعني إسقاط بضائع هشة أو الاصطدام بالناس. وتضاف إلى ذلك متطلبات السلامة الصارمة وتكلفة جمع بيانات التدريب الجيدة. كما أن تشغيل النماذج الكبيرة على متن الروبوت قد يكون بطيئًا ومستهلكًا للطاقة، وهو ما يجعل <a href="/ar/ai/smaller-language-models-on-everyday-devices">نماذج اللغة الصغيرة</a> وثيقة الصلة بهذا المجال.</p>
<blockquote><p>في عالم الروبوتات، لا قيمة لخطة ذكية إذا انزلقت القبضة. سيُقاس التقدم بالموثوقية المملة لا بالمقاطع المنتشرة.</p><cite>تحليل فيوتشر سفير</cite></blockquote>
<p>لن يجعل الذكاء الاصطناعي متعدد الوسائط الروبوتات عامة الأغراض بين ليلة وضحاها، لكنه يجعل من المعقول أن يصبح تعليم الروبوت مهمة جديدة يومًا ما أشبه بشرحها لزميل في العمل.</p>`,
      },
    },
  },

  // 4 ─────────────────────────────────────────────────────────────
  {
    key: "passkeys-explained",
    category: "technology",
    author: "daniel",
    tags: ["cybersecurity", "cloud-computing"],
    trending: true,
    daysAgo: 2,
    primaryTopic: "Passkeys",
    translations: {
      en: {
        title: "Passkeys Explained: How Password-Free Sign-In Actually Works",
        slug: "passkeys-explained-password-free-sign-in",
        excerpt:
          "Passkeys replace a shared secret with a cryptographic key kept on your device. Here is how they work, why they resist phishing, and what happens if you lose your phone.",
        content: `${NOTICE_EN}
<h2>The trouble with passwords</h2>
<p>Passwords ask people to do something humans are bad at: invent long, unique secrets for dozens of services and remember all of them. In practice, many people reuse passwords or pick predictable ones, and even strong passwords can be handed over to a convincing fake login page. Every service that stores password data also becomes a target.</p>
<p>Passkeys are an attempt to remove the shared secret altogether. Built on open standards developed by industry groups, they let you sign in using the same action you already use to unlock your device, such as a fingerprint, a face scan, or a PIN.</p>
<h2>How a passkey works</h2>
<p>A passkey relies on public-key cryptography. When you create one for a website, your device generates a pair of mathematically linked keys:</p>
<ul>
<li>The <strong>private key</strong> stays on your device or in your password manager and is never sent to the website.</li>
<li>The <strong>public key</strong> is stored by the website. It can verify signatures but cannot be used to create them.</li>
</ul>
<p>When you sign in, the website sends a random challenge. Your device asks you to confirm with your biometric or PIN, then signs the challenge with the private key. The site checks the signature with the public key. Nothing reusable crosses the network.</p>
<h3>Why phishing gets harder</h3>
<p>Each passkey is tied to the specific website that created it. If a fake site with a lookalike address asks for a signature, your device will not offer the real site's passkey, because the domains do not match. This built-in check is one of the main reasons security teams are interested in the technology.</p>
<table>
<caption>Passwords and passkeys compared</caption>
<thead><tr><th scope="col">Aspect</th><th scope="col">Passwords</th><th scope="col">Passkeys</th></tr></thead>
<tbody>
<tr><td>What the site stores</td><td>A hashed secret that can be attacked if leaked</td><td>A public key that is not useful to attackers on its own</td></tr>
<tr><td>Phishing resistance</td><td>Low; users can type it into fake sites</td><td>High; bound to the real domain</td></tr>
<tr><td>What the user remembers</td><td>The password itself</td><td>Nothing new; uses device unlock</td></tr>
<tr><td>Recovery</td><td>Reset via email or text message</td><td>Depends on sync and account recovery options</td></tr>
</tbody>
</table>
<h2>Practical questions</h2>
<p>The most common concern is losing a device. Many platforms synchronize passkeys across a user's devices through an encrypted cloud account, so a new phone can restore them. Others let you keep a passkey on a hardware security key. Services generally still offer a recovery route, and the strength of that fallback matters, because attackers will aim at the weakest path in.</p>
<p>Travellers and remote workers who switch between devices and networks often, a group covered in our guide to <a href="/en/travel/digital-nomad-visas-practical-guide">digital nomad visas</a>, may find it worth setting up passkeys on more than one device before they leave home.</p>
<blockquote><p>Passkeys do not make accounts invincible. They move the weak point from the user's memory to the account recovery process, which is a better place to defend.</p><cite>FutureSphere analysis</cite></blockquote>
<p>Passkeys also matter for automated software. As <a href="/en/ai/how-ai-agents-plan-act-and-check-their-work">AI agents</a> begin to act on people's behalf, clear and verifiable ways of proving identity become more important, not less.</p>
<p>Adoption is gradual, and passwords are likely to coexist with passkeys for years. But for anyone offered the option, turning it on is one of the simpler steps toward stronger account security.</p>`,
      },
      ur: {
        title: "پاس کیز کی وضاحت: پاس ورڈ کے بغیر سائن اِن دراصل کیسے کام کرتا ہے",
        slug: "passkeys-explained-password-free-sign-in",
        excerpt:
          "پاس کیز مشترکہ خفیہ لفظ کی جگہ آپ کے آلے پر محفوظ کرپٹوگرافک چابی استعمال کرتی ہیں۔ جانیے یہ کیسے کام کرتی ہیں، فشنگ کو کیوں مشکل بناتی ہیں اور آلہ گم ہو جائے تو کیا ہوتا ہے۔",
        content: `${NOTICE_UR}
<h2>پاس ورڈز کا مسئلہ</h2>
<p>پاس ورڈز ہم سے ایک ایسا کام چاہتے ہیں جس میں انسان کمزور ہیں: درجنوں سروسز کے لیے لمبے اور منفرد خفیہ الفاظ بنانا اور یاد رکھنا۔ عملاً لوگ ایک ہی پاس ورڈ بار بار استعمال کرتے ہیں، اور مضبوط پاس ورڈ بھی کسی جعلی لاگ اِن صفحے پر درج کیا جا سکتا ہے۔</p>
<p>پاس کیز مشترکہ راز کو ہی ختم کرنے کی کوشش ہیں۔ کھلے معیارات پر مبنی یہ طریقہ آپ کو اسی عمل سے سائن اِن کرنے دیتا ہے جس سے آپ اپنا فون کھولتے ہیں، جیسے فنگر پرنٹ، چہرہ یا پن۔</p>
<h2>پاس کی کیسے کام کرتی ہے</h2>
<ul>
<li><strong>نجی چابی</strong> آپ کے آلے یا پاس ورڈ مینیجر میں رہتی ہے اور کبھی ویب سائٹ کو نہیں بھیجی جاتی۔</li>
<li><strong>عوامی چابی</strong> ویب سائٹ کے پاس محفوظ ہوتی ہے اور صرف دستخط کی تصدیق کر سکتی ہے۔</li>
</ul>
<p>سائن اِن کے وقت ویب سائٹ ایک بے ترتیب چیلنج بھیجتی ہے۔ آپ کا آلہ آپ سے تصدیق لے کر نجی چابی سے اس پر دستخط کرتا ہے، اور ویب سائٹ عوامی چابی سے اسے جانچتی ہے۔ نیٹ ورک پر کوئی دوبارہ قابلِ استعمال راز نہیں جاتا۔</p>
<h3>فشنگ کیوں مشکل ہو جاتی ہے</h3>
<p>ہر پاس کی اسی ویب سائٹ سے بندھی ہوتی ہے جس نے اسے بنایا۔ ملتے جلتے پتے والی جعلی سائٹ کو آپ کا آلہ اصل سائٹ کی پاس کی پیش ہی نہیں کرے گا۔</p>
<table>
<caption>پاس ورڈ اور پاس کی کا موازنہ</caption>
<thead><tr><th scope="col">پہلو</th><th scope="col">پاس ورڈ</th><th scope="col">پاس کی</th></tr></thead>
<tbody>
<tr><td>سائٹ کیا محفوظ کرتی ہے</td><td>ہیش شدہ راز</td><td>عوامی چابی</td></tr>
<tr><td>فشنگ سے تحفظ</td><td>کم</td><td>زیادہ</td></tr>
<tr><td>صارف کو کیا یاد رکھنا ہے</td><td>پاس ورڈ</td><td>کچھ نیا نہیں</td></tr>
</tbody>
</table>
<h2>عملی سوالات</h2>
<p>سب سے عام فکر آلہ گم ہونے کی ہے۔ بہت سے پلیٹ فارم پاس کیز کو خفیہ کردہ کلاؤڈ اکاؤنٹ کے ذریعے آپ کے دوسرے آلات تک پہنچا دیتے ہیں، جبکہ کچھ لوگ ہارڈویئر سیکیورٹی کی استعمال کرتے ہیں۔ بحالی کا متبادل راستہ بھی مضبوط ہونا چاہیے کیونکہ حملہ آور ہمیشہ کمزور ترین راستہ ڈھونڈتے ہیں۔</p>
<blockquote><p>پاس کیز اکاؤنٹ کو ناقابلِ تسخیر نہیں بناتیں، بلکہ کمزور نقطے کو صارف کی یادداشت سے ہٹا کر اکاؤنٹ بحالی کے عمل تک لے جاتی ہیں، جس کا دفاع نسبتاً آسان ہے۔</p><cite>فیوچر اسفیئر تجزیہ</cite></blockquote>
<p>جیسے جیسے <a href="/ur/ai/how-ai-agents-plan-act-and-check-their-work">اے آئی ایجنٹس</a> لوگوں کی جانب سے کام کرنے لگے ہیں، شناخت ثابت کرنے کے واضح طریقے اور بھی اہم ہو گئے ہیں۔ اگر آپ کو پاس کی کا اختیار ملے تو اسے فعال کرنا اکاؤنٹ کی حفاظت کی طرف ایک آسان قدم ہے۔</p>`,
      },
      ar: {
        title: "شرح مفاتيح المرور: كيف يعمل تسجيل الدخول من دون كلمات مرور؟",
        slug: "passkeys-explained-password-free-sign-in",
        excerpt:
          "تستبدل مفاتيح المرور السر المشترك بمفتاح تشفيري محفوظ على جهازك. نوضح طريقة عملها، ولماذا تجعل التصيد الاحتيالي أصعب، وماذا يحدث إذا فقدت هاتفك.",
        content: `${NOTICE_AR}
<h2>مشكلة كلمات المرور</h2>
<p>تطلب كلمات المرور من الناس أمرًا لا يجيده البشر: ابتكار أسرار طويلة وفريدة لعشرات الخدمات وتذكرها جميعًا. وفي الواقع يكرر كثيرون كلمة المرور نفسها أو يختارون كلمات سهلة التخمين، بل قد تُسلَّم كلمة مرور قوية إلى صفحة دخول مزيفة مقنعة.</p>
<p>تحاول مفاتيح المرور إلغاء السر المشترك من الأساس. فهي مبنية على معايير مفتوحة، وتتيح لك تسجيل الدخول بالطريقة نفسها التي تفتح بها جهازك: بصمة الإصبع أو التعرف على الوجه أو رمز PIN.</p>
<h2>كيف يعمل مفتاح المرور؟</h2>
<ul>
<li><strong>المفتاح الخاص</strong> يبقى على جهازك أو في مدير كلمات المرور، ولا يُرسل إلى الموقع أبدًا.</li>
<li><strong>المفتاح العام</strong> يحفظه الموقع، ويستطيع التحقق من التوقيعات دون أن يتمكن من إنشائها.</li>
</ul>
<p>عند تسجيل الدخول يرسل الموقع تحديًا عشوائيًا، فيطلب جهازك تأكيدك ثم يوقّع التحدي بالمفتاح الخاص، ويتحقق الموقع من التوقيع بالمفتاح العام. لا يعبر الشبكة أي سر يمكن إعادة استخدامه.</p>
<h3>لماذا يصبح التصيد أصعب؟</h3>
<p>يرتبط كل مفتاح مرور بالموقع الذي أنشأه. فإذا طلب موقع مزيف بعنوان مشابه توقيعًا، لن يعرض جهازك مفتاح الموقع الحقيقي لأن النطاقين مختلفان.</p>
<table>
<caption>مقارنة بين كلمات المرور ومفاتيح المرور</caption>
<thead><tr><th scope="col">الجانب</th><th scope="col">كلمة المرور</th><th scope="col">مفتاح المرور</th></tr></thead>
<tbody>
<tr><td>ما يخزنه الموقع</td><td>سر مُجزّأ قد يُهاجَم إذا تسرب</td><td>مفتاح عام لا يفيد المهاجم وحده</td></tr>
<tr><td>مقاومة التصيد</td><td>منخفضة</td><td>مرتفعة</td></tr>
<tr><td>ما يتذكره المستخدم</td><td>كلمة المرور نفسها</td><td>لا شيء جديد</td></tr>
</tbody>
</table>
<h2>أسئلة عملية</h2>
<p>أكثر المخاوف شيوعًا هو فقدان الجهاز. تزامن منصات كثيرة مفاتيح المرور بين أجهزة المستخدم عبر حساب سحابي مشفر، بينما يفضل آخرون مفتاح أمان مادي. وتبقى هناك عادةً وسيلة لاستعادة الحساب، ويجب أن تكون قوية لأن المهاجمين يستهدفون أضعف الطرق.</p>
<blockquote><p>لا تجعل مفاتيح المرور الحسابات منيعة تمامًا، لكنها تنقل نقطة الضعف من ذاكرة المستخدم إلى إجراءات الاستعادة، وهي موضع أسهل في الدفاع.</p><cite>تحليل فيوتشر سفير</cite></blockquote>
<p>ومع بدء <a href="/ar/ai/how-ai-agents-plan-act-and-check-their-work">وكلاء الذكاء الاصطناعي</a> بالعمل نيابة عن الناس، تزداد أهمية الطرق الواضحة القابلة للتحقق لإثبات الهوية. وإذا عُرض عليك خيار مفاتيح المرور، فتفعيله خطوة بسيطة نحو حماية أقوى لحسابك.</p>`,
      },
    },
  },

  // 5 ─────────────────────────────────────────────────────────────
  {
    key: "edge-computing-explained",
    category: "technology",
    author: "amara",
    tags: ["cloud-computing", "semiconductors", "artificial-intelligence"],
    daysAgo: 8,
    primaryTopic: "Edge computing",
    translations: {
      en: {
        title: "Edge Computing Explained: Why Processing Is Moving Closer to Data",
        slug: "edge-computing-explained",
        excerpt:
          "Edge computing shifts some work away from distant data centers and onto devices and nearby servers. Here is what that means for latency, bandwidth, privacy, and system design.",
        content: `${NOTICE_EN}
<h2>What "the edge" means</h2>
<p>In the classic cloud model, devices collect data and send it to large, centralized data centers for processing. Edge computing moves some of that work closer to where data is produced: onto the device itself, into a local gateway, or into small server sites located near users, such as those run by telecom operators.</p>
<p>The idea is not to replace the cloud, but to split the work sensibly. Tasks that need instant responses or involve large volumes of raw data happen nearby, while heavier analysis, long-term storage, and coordination stay in central facilities.</p>
<h2>Why move computing outward</h2>
<p>Several pressures push workloads toward the edge:</p>
<ul>
<li><strong>Latency:</strong> physical distance adds delay. For a factory robot or a vehicle, waiting for a distant server can be unacceptable.</li>
<li><strong>Bandwidth:</strong> streaming raw video from thousands of cameras is expensive; analyzing it locally and sending only summaries is cheaper.</li>
<li><strong>Privacy and regulation:</strong> keeping sensitive data on site can simplify compliance.</li>
<li><strong>Resilience:</strong> local systems can keep working if the network connection drops.</li>
</ul>
<p>Not every workload benefits, however. Tasks that run occasionally, can tolerate delay, or need large amounts of shared data are often simpler and cheaper to run centrally.</p>
<h3>A layered picture</h3>
<table>
<caption>Where different workloads tend to run</caption>
<thead><tr><th scope="col">Layer</th><th scope="col">Typical location</th><th scope="col">Good for</th></tr></thead>
<tbody>
<tr><td>Device</td><td>Phone, sensor, camera, vehicle</td><td>Instant reactions, private data</td></tr>
<tr><td>Local edge</td><td>Gateway or on-site server</td><td>Aggregating many devices, filtering data</td></tr>
<tr><td>Regional edge</td><td>Small data center near users</td><td>Low-latency services for a city or region</td></tr>
<tr><td>Central cloud</td><td>Large data centers</td><td>Training models, archives, global coordination</td></tr>
</tbody>
</table>
<p>Many real deployments use several of these layers at once. A retail store, for example, might analyze camera feeds on a local server to monitor shelf stock, then send daily summaries to the cloud for company-wide planning.</p>
<h2>AI at the edge</h2>
<p>Machine learning is a major driver. Running an AI model directly on a device, as described in our explainer on <a href="/en/ai/smaller-language-models-on-everyday-devices">smaller language models</a>, is the most extreme form of edge computing. Specialized chips make this more practical, though they must work within tight power and heat limits.</p>
<p>Health devices are another example. A <a href="/en/gadgets/inside-wearable-health-sensors">wearable sensor</a> may process heart-rate signals on the wrist and only sync results to a phone later, which saves battery and keeps raw data local.</p>
<blockquote><p>The edge is less a place than a decision: for each piece of data, where is the cheapest, fastest, and safest place to act on it?</p><cite>FutureSphere analysis</cite></blockquote>
<p>The trade-offs are real. Thousands of small sites are harder to manage, update, and secure than a few large ones. Hardware in the field can be stolen or tampered with, and software updates must reach devices that may be offline for days. Good edge systems therefore invest heavily in remote management and automatic security patches.</p>
<p>For most organizations, the question is not whether to use the edge or the cloud, but how to divide responsibilities between them so that each does what it does best.</p>`,
      },
      ur: {
        title: "ایج کمپیوٹنگ کی وضاحت: پروسیسنگ ڈیٹا کے قریب کیوں منتقل ہو رہی ہے",
        slug: "edge-computing-explained",
        excerpt:
          "ایج کمپیوٹنگ کچھ کام بڑے ڈیٹا سینٹرز سے ہٹا کر آلات اور مقامی سرورز تک لے آتی ہے۔ جانیے اس سے تاخیر، بینڈوڈتھ اور رازداری پر کیا اثر پڑتا ہے اور اس کے چیلنجز کیا ہیں۔",
        content: `${NOTICE_UR}
<h2>"ایج" سے کیا مراد ہے</h2>
<p>روایتی کلاؤڈ ماڈل میں آلات ڈیٹا جمع کر کے دور دراز ڈیٹا سینٹرز کو بھیجتے ہیں۔ ایج کمپیوٹنگ اس کام کا کچھ حصہ اس جگہ کے قریب لے آتی ہے جہاں ڈیٹا پیدا ہوتا ہے: خود آلے پر، کسی مقامی گیٹ وے میں، یا صارفین کے قریب چھوٹے سرور مراکز میں۔</p>
<p>مقصد کلاؤڈ کو ختم کرنا نہیں بلکہ کام کو سمجھداری سے بانٹنا ہے۔ فوری ردِعمل والے کام قریب ہوتے ہیں، جبکہ بھاری تجزیہ اور طویل مدتی ذخیرہ مرکزی مراکز میں رہتا ہے۔</p>
<h2>کمپیوٹنگ باہر کی طرف کیوں جا رہی ہے</h2>
<ul>
<li><strong>تاخیر:</strong> فاصلہ وقت بڑھاتا ہے، اور فیکٹری روبوٹ یا گاڑی کے لیے انتظار ناقابلِ قبول ہو سکتا ہے۔</li>
<li><strong>بینڈوڈتھ:</strong> ہزاروں کیمروں کی ویڈیو بھیجنے کے بجائے مقامی تجزیہ کر کے صرف خلاصہ بھیجنا سستا ہے۔</li>
<li><strong>رازداری:</strong> حساس ڈیٹا کو مقامی رکھنا قواعد کی پابندی آسان بنا سکتا ہے۔</li>
<li><strong>پائیداری:</strong> نیٹ ورک منقطع ہونے پر بھی مقامی نظام چلتا رہ سکتا ہے۔</li>
</ul>
<h3>تہہ دار تصویر</h3>
<table>
<caption>مختلف کام عموماً کہاں چلتے ہیں</caption>
<thead><tr><th scope="col">تہہ</th><th scope="col">مقام</th><th scope="col">کس کام کے لیے موزوں</th></tr></thead>
<tbody>
<tr><td>آلہ</td><td>فون، سینسر، گاڑی</td><td>فوری ردِعمل، ذاتی ڈیٹا</td></tr>
<tr><td>مقامی ایج</td><td>گیٹ وے یا مقامی سرور</td><td>کئی آلات کا ڈیٹا یکجا کرنا</td></tr>
<tr><td>مرکزی کلاؤڈ</td><td>بڑے ڈیٹا سینٹرز</td><td>ماڈلز کی تربیت، طویل مدتی ذخیرہ</td></tr>
</tbody>
</table>
<h2>ایج پر مصنوعی ذہانت</h2>
<p>کسی اے آئی ماڈل کو براہِ راست آلے پر چلانا، جیسا کہ ہمارے مضمون <a href="/ur/ai/smaller-language-models-on-everyday-devices">چھوٹے لسانی ماڈلز</a> میں بیان ہوا، ایج کمپیوٹنگ کی سب سے واضح شکل ہے۔ اسی طرح ایک <a href="/ur/gadgets/inside-wearable-health-sensors">پہننے والا صحت سینسر</a> دل کی دھڑکن کے سگنلز کلائی پر ہی پروسیس کر سکتا ہے۔</p>
<blockquote><p>ایج کوئی جگہ کم اور ایک فیصلہ زیادہ ہے: ہر ڈیٹا کے لیے سب سے سستا، تیز اور محفوظ مقام کون سا ہے؟</p><cite>فیوچر اسفیئر تجزیہ</cite></blockquote>
<p>البتہ ہزاروں چھوٹے مقامات کو سنبھالنا، اپ ڈیٹ کرنا اور محفوظ رکھنا چند بڑے مراکز کے مقابلے میں مشکل ہے۔ اس لیے اچھے ایج نظام ریموٹ مینجمنٹ اور خودکار سیکیورٹی اپ ڈیٹس پر خاص توجہ دیتے ہیں۔</p>`,
      },
      ar: {
        title: "شرح الحوسبة الطرفية: لماذا تقترب المعالجة من مصدر البيانات؟",
        slug: "edge-computing-explained",
        excerpt:
          "تنقل الحوسبة الطرفية جزءًا من العمل من مراكز البيانات البعيدة إلى الأجهزة والخوادم القريبة. نشرح أثر ذلك على زمن الاستجابة وعرض النطاق والخصوصية وتصميم الأنظمة.",
        content: `${NOTICE_AR}
<h2>ماذا نعني بـ"الطرف"؟</h2>
<p>في النموذج السحابي التقليدي تجمع الأجهزة البيانات وترسلها إلى مراكز بيانات كبيرة ومركزية لمعالجتها. أما الحوسبة الطرفية فتنقل جزءًا من هذا العمل إلى مكان أقرب إلى مصدر البيانات: إلى الجهاز نفسه، أو إلى بوابة محلية، أو إلى مواقع خوادم صغيرة قريبة من المستخدمين.</p>
<p>الهدف ليس الاستغناء عن السحابة، بل توزيع العمل بحكمة؛ فالمهام التي تحتاج إلى استجابة فورية تُنفَّذ قريبًا، بينما يبقى التحليل الثقيل والتخزين طويل الأمد في المراكز الكبرى.</p>
<h2>لماذا تتجه الحوسبة نحو الأطراف؟</h2>
<ul>
<li><strong>زمن الاستجابة:</strong> المسافة تضيف تأخيرًا قد لا يحتمله روبوت في مصنع أو مركبة على الطريق.</li>
<li><strong>عرض النطاق:</strong> تحليل الفيديو محليًا وإرسال الملخصات فقط أرخص من بث كل اللقطات.</li>
<li><strong>الخصوصية:</strong> إبقاء البيانات الحساسة في موقعها قد يسهّل الالتزام باللوائح.</li>
<li><strong>المرونة:</strong> تستطيع الأنظمة المحلية مواصلة العمل عند انقطاع الشبكة.</li>
</ul>
<h3>صورة متعددة الطبقات</h3>
<table>
<caption>أين تعمل أحمال العمل المختلفة عادةً</caption>
<thead><tr><th scope="col">الطبقة</th><th scope="col">الموقع المعتاد</th><th scope="col">مناسبة لـ</th></tr></thead>
<tbody>
<tr><td>الجهاز</td><td>هاتف أو مستشعر أو مركبة</td><td>الاستجابة الفورية والبيانات الخاصة</td></tr>
<tr><td>الطرف المحلي</td><td>بوابة أو خادم في الموقع</td><td>تجميع بيانات أجهزة كثيرة وتصفيتها</td></tr>
<tr><td>السحابة المركزية</td><td>مراكز بيانات كبيرة</td><td>تدريب النماذج والأرشفة</td></tr>
</tbody>
</table>
<h2>الذكاء الاصطناعي على الأطراف</h2>
<p>يمثل تشغيل نموذج ذكاء اصطناعي على الجهاز مباشرة، كما في مقالنا عن <a href="/ar/ai/smaller-language-models-on-everyday-devices">نماذج اللغة الصغيرة</a>، أقصى أشكال الحوسبة الطرفية. ومثال آخر هو <a href="/ar/gadgets/inside-wearable-health-sensors">المستشعر الصحي القابل للارتداء</a> الذي يعالج إشارات نبض القلب على المعصم ثم يزامن النتائج لاحقًا.</p>
<blockquote><p>الطرف ليس مكانًا بقدر ما هو قرار: ما أرخص وأسرع وأأمن مكان للتعامل مع كل جزء من البيانات؟</p><cite>تحليل فيوتشر سفير</cite></blockquote>
<p>لكن إدارة آلاف المواقع الصغيرة وتحديثها وتأمينها أصعب من إدارة عدد قليل من المراكز الكبيرة، لذلك تستثمر الأنظمة الجيدة في الإدارة عن بُعد والتحديثات الأمنية التلقائية. والسؤال في النهاية ليس الاختيار بين الطرف والسحابة، بل كيفية تقسيم الأدوار بينهما.</p>`,
      },
    },
  },

  // 6 ─────────────────────────────────────────────────────────────
  {
    key: "risc-v-open-chips",
    category: "technology",
    author: "layla",
    tags: ["semiconductors", "startups"],
    daysAgo: 12,
    primaryTopic: "RISC-V",
    translations: {
      en: {
        title: "RISC-V and the Case for Open Instruction Set Architectures",
        slug: "risc-v-open-instruction-set-architectures",
        excerpt:
          "RISC-V is an openly published instruction set that anyone can implement. Here is what that means, why chip designers care, and which obstacles still stand in the way.",
        content: `${NOTICE_EN}
<h2>What an instruction set is</h2>
<p>Every processor speaks a language made of basic instructions: add these numbers, load this value from memory, jump to that part of the program. The full list of those instructions, along with rules for how they behave, is called an instruction set architecture, or ISA. Software compiled for one ISA generally cannot run on a chip built for another without translation.</p>
<p>For decades, most widely used ISAs have been proprietary. Companies that want to design chips using them typically need a license, and the owner decides how the architecture evolves. RISC-V takes a different approach: its specification is openly published and can be implemented without paying licensing fees for the ISA itself.</p>
<h2>Why openness matters</h2>
<p>An open ISA does not mean chips are free. Designing, verifying, and manufacturing a processor remains expensive and difficult. What changes is who is allowed to participate and how much they can customize.</p>
<ul>
<li><strong>Customization:</strong> RISC-V is modular, with a small base set of instructions and optional extensions. Designers can add their own specialized instructions, for example to accelerate AI or signal processing.</li>
<li><strong>Lower barriers:</strong> universities, startups, and smaller companies can experiment without negotiating licenses first.</li>
<li><strong>Longevity:</strong> because no single vendor controls the specification, organizations may feel less exposed to changes in one company's strategy.</li>
</ul>
<h3>Where it shows up first</h3>
<p>Open architectures often appear first in places users never see: microcontrollers inside storage devices, sensors, and power management chips. These roles value low cost and customization more than compatibility with a large existing app ecosystem.</p>
<p>Interest in running AI efficiently on small devices, a theme in our piece on <a href="/en/ai/smaller-language-models-on-everyday-devices">smaller language models</a>, has added another reason to explore custom instructions tailored to specific workloads.</p>
<h2>The obstacles</h2>
<p>The biggest hurdle is software. Operating systems, compilers, libraries, and applications must all be ported and optimized, and that work takes years. Progress has been steady, but mature ecosystems built around established architectures have a considerable head start.</p>
<p>Fragmentation is another worry. If every designer adds different extensions, software might not run consistently across RISC-V chips. The community addresses this through standard profiles, which define common sets of features that software can rely on.</p>
<blockquote><p>Open standards rarely win by being free. They win when enough people build on them that the ecosystem becomes the reason to stay.</p><cite>FutureSphere analysis</cite></blockquote>
<p>For hardware founders, an open ISA can remove one layer of cost and dependency, though the path from design to production still demands the careful staging described in <a href="/en/startups/how-hardware-startups-de-risk-pilots">how hardware startups reduce risk</a>.</p>
<p>Whether RISC-V becomes a mainstream choice for phones and laptops remains an open question. What seems clear is that it has already changed conversations about who gets to shape the foundations of computing.</p>`,
      },
    },
  },

  // 7 ─────────────────────────────────────────────────────────────
  {
    key: "quantum-error-correction",
    category: "science",
    author: "layla",
    tags: ["quantum-computing", "semiconductors"],
    editorsPick: true,
    daysAgo: 5,
    primaryTopic: "Quantum error correction",
    translations: {
      en: {
        title: "Quantum Error Correction Basics: Why Fragile Qubits Need Backup",
        slug: "quantum-error-correction-basics",
        excerpt:
          "Qubits are easily disturbed, so useful quantum computers will need error correction. This explainer shows how spreading information across many qubits can protect it.",
        content: `${NOTICE_EN}
<h2>Fragile by nature</h2>
<p>Quantum computers store information in qubits, which can exist in combinations of states rather than simply zero or one. That property is what could make them powerful for certain problems, such as simulating molecules. It is also what makes them fragile. Tiny disturbances from heat, stray electromagnetic fields, or imperfect control pulses can nudge a qubit's state and introduce errors.</p>
<p>In ordinary computers, errors are rare and easy to correct. A classical bit can be copied, and if one copy flips, a majority vote reveals the right answer. Quantum information is trickier: it cannot be copied in the usual way, and simply measuring a qubit disturbs it.</p>
<h2>The core trick: spreading information out</h2>
<p>Quantum error correction gets around these limits by encoding one piece of information, called a logical qubit, across many physical qubits. The information lives in the relationships between them rather than in any single one.</p>
<p>Extra helper qubits then check those relationships repeatedly. These checks, often called syndrome measurements, reveal whether an error has probably occurred and roughly where, without revealing the protected information itself.</p>
<ol>
<li>Encode the logical qubit across a group of physical qubits.</li>
<li>Measure parity checks using helper qubits.</li>
<li>Decode the pattern of check results with classical software to infer the likely error.</li>
<li>Correct or keep track of the error, then repeat the cycle continuously.</li>
</ol>
<h3>Why the threshold matters</h3>
<p>Error correction only helps if the physical qubits are already good enough. If each operation introduces too many errors, adding more qubits simply adds more noise. Below a certain error rate, known as the threshold, larger codes should suppress errors more effectively. Much experimental work aims to show that behaviour convincingly and consistently.</p>
<p>Different codes exist. The surface code, which arranges qubits in a grid and checks neighbours, is widely studied because it tolerates relatively high error rates and suits chips where qubits mainly interact with their nearest neighbours. Other codes promise lower overhead but may need more complex connections.</p>
<table>
<caption>Physical versus logical qubits</caption>
<thead><tr><th scope="col">Feature</th><th scope="col">Physical qubit</th><th scope="col">Logical qubit</th></tr></thead>
<tbody>
<tr><td>What it is</td><td>A single hardware element</td><td>Information encoded across many physical qubits</td></tr>
<tr><td>Error behaviour</td><td>Prone to frequent errors</td><td>Errors suppressed if hardware is below threshold</td></tr>
<tr><td>Cost</td><td>One device</td><td>Many devices plus fast classical processing</td></tr>
</tbody>
</table>
<h2>The engineering challenge</h2>
<p>The overhead is significant. Depending on the code and hardware quality, a single reliable logical qubit may require many physical qubits, and useful algorithms may need many logical qubits. That is one reason practical, large-scale quantum computers are generally expected to take considerable time to build.</p>
<p>Decoding is also demanding. Check results arrive continuously and must be interpreted fast enough to keep up, so the classical processors doing this work often sit physically close to the quantum hardware. It is a specialized version of the logic behind <a href="/en/technology/edge-computing-explained">edge computing</a>: process data where it is created. Custom chip designs, including those based on open architectures like <a href="/en/technology/risc-v-open-instruction-set-architectures">RISC-V</a>, may play a part in building such control systems.</p>
<blockquote><p>Error correction is where quantum computing stops being a physics demonstration and becomes an engineering discipline.</p><cite>FutureSphere analysis</cite></blockquote>
<p>For readers following the field, the milestones worth watching are less about headline qubit counts and more about whether logical qubits get measurably better as they get bigger. That trend, if it holds, is what would turn fragile prototypes into dependable machines.</p>`,
      },
      ur: {
        title: "کوانٹم ایرر کریکشن کی بنیادی باتیں: نازک کیوبٹس کو حفاظت کیوں درکار ہے",
        slug: "quantum-error-correction-basics",
        excerpt:
          "کیوبٹس معمولی خلل سے بھی غلطی کا شکار ہو جاتے ہیں۔ یہ مضمون سادہ انداز میں بتاتا ہے کہ کوانٹم ایرر کریکشن معلومات کو کئی کیوبٹس میں پھیلا کر کیسے محفوظ رکھتی ہے۔",
        content: `${NOTICE_UR}
<h2>فطرتاً نازک</h2>
<p>کوانٹم کمپیوٹر معلومات کو کیوبٹس میں محفوظ کرتے ہیں، جو صرف صفر یا ایک کے بجائے حالتوں کے امتزاج میں رہ سکتے ہیں۔ یہی خصوصیت انہیں بعض مسائل، جیسے مالیکیولز کی نقل، کے لیے طاقتور بنا سکتی ہے، اور یہی انہیں نازک بھی بناتی ہے۔ حرارت، برقی مقناطیسی خلل یا کنٹرول کی معمولی خامی بھی غلطیاں پیدا کر سکتی ہے۔</p>
<p>عام کمپیوٹر میں بٹ کی نقل بنا کر اکثریتی رائے سے درست جواب معلوم کیا جا سکتا ہے، مگر کوانٹم معلومات کی اس طرح نقل نہیں بنائی جا سکتی، اور کیوبٹ کی پیمائش خود اسے متاثر کر دیتی ہے۔</p>
<h2>بنیادی ترکیب: معلومات کو پھیلانا</h2>
<p>کوانٹم ایرر کریکشن ایک "منطقی کیوبٹ" کو کئی طبعی کیوبٹس میں پھیلا دیتی ہے، تاکہ معلومات کسی ایک کیوبٹ میں نہیں بلکہ ان کے باہمی تعلق میں رہیں۔</p>
<ol>
<li>منطقی کیوبٹ کو طبعی کیوبٹس کے ایک گروپ میں انکوڈ کیا جاتا ہے۔</li>
<li>مددگار کیوبٹس کے ذریعے باقاعدہ جانچ کی جاتی ہے۔</li>
<li>کلاسیکی سافٹ ویئر ان نتائج سے ممکنہ غلطی کا اندازہ لگاتا ہے۔</li>
<li>غلطی درست کی جاتی ہے یا اس کا حساب رکھا جاتا ہے، اور یہ چکر مسلسل دہرایا جاتا ہے۔</li>
</ol>
<h3>حد کیوں اہم ہے</h3>
<p>یہ طریقہ تبھی کارآمد ہے جب طبعی کیوبٹس پہلے سے کافی اچھے ہوں۔ اگر ہر عمل بہت زیادہ غلطیاں پیدا کرے تو مزید کیوبٹس صرف مزید شور لاتے ہیں۔ ایک خاص حد سے نیچے، بڑے کوڈز غلطیوں کو زیادہ مؤثر طریقے سے دبا سکتے ہیں۔</p>
<h2>انجینئرنگ کا چیلنج</h2>
<p>ایک قابلِ اعتماد منطقی کیوبٹ کے لیے بہت سے طبعی کیوبٹس درکار ہو سکتے ہیں، اسی لیے بڑے پیمانے کے عملی کوانٹم کمپیوٹرز بنانے میں کافی وقت لگنے کی توقع کی جاتی ہے۔ جانچ کے نتائج کو تیزی سے سمجھنا بھی ضروری ہے، اس لیے کلاسیکی پروسیسرز کوانٹم ہارڈویئر کے قریب رکھے جاتے ہیں، جو <a href="/ur/technology/edge-computing-explained">ایج کمپیوٹنگ</a> جیسی سوچ ہے۔</p>
<blockquote><p>ایرر کریکشن وہ مقام ہے جہاں کوانٹم کمپیوٹنگ طبیعیات کا مظاہرہ نہیں رہتی بلکہ انجینئرنگ کا شعبہ بن جاتی ہے۔</p><cite>فیوچر اسفیئر تجزیہ</cite></blockquote>
<p>اس میدان پر نظر رکھنے والوں کے لیے اہم سوال کیوبٹس کی تعداد نہیں بلکہ یہ ہے کہ کیا منطقی کیوبٹس بڑے ہونے کے ساتھ واضح طور پر بہتر ہوتے جاتے ہیں۔ یہی رجحان نازک تجرباتی مشینوں کو قابلِ اعتماد کمپیوٹرز میں بدل سکتا ہے۔</p>`,
      },
      ar: {
        title: "أساسيات تصحيح الأخطاء الكمومية: لماذا تحتاج الكيوبتات الهشة إلى حماية؟",
        slug: "quantum-error-correction-basics",
        excerpt:
          "تتأثر الكيوبتات بأدنى اضطراب، لذا ستحتاج الحواسيب الكمومية المفيدة إلى تصحيح الأخطاء. يشرح هذا المقال كيف يحمي توزيعُ المعلومات على كيوبتات كثيرة تلك المعلومات.",
        content: `${NOTICE_AR}
<h2>هشاشة بطبيعتها</h2>
<p>تخزن الحواسيب الكمومية المعلومات في كيوبتات يمكن أن توجد في تراكب من الحالات بدلًا من صفر أو واحد فقط. هذه الخاصية قد تمنحها قوة في مسائل معينة مثل محاكاة الجزيئات، لكنها أيضًا سبب هشاشتها؛ فالحرارة أو المجالات الكهرومغناطيسية الشاردة أو نبضات التحكم غير الدقيقة قد تغيّر حالة الكيوبت وتسبب أخطاء.</p>
<p>في الحواسيب التقليدية يمكن نسخ البت، وإذا انقلبت نسخة واحدة يكشف تصويت الأغلبية الإجابة الصحيحة. أما المعلومات الكمومية فلا يمكن نسخها بالطريقة المعتادة، كما أن قياس الكيوبت يغيّر حالته.</p>
<h2>الفكرة الأساسية: توزيع المعلومات</h2>
<p>يتجاوز تصحيح الأخطاء الكمومية هذه القيود بترميز معلومة واحدة، تسمى "الكيوبت المنطقي"، عبر عدد من الكيوبتات المادية، بحيث تعيش المعلومة في العلاقات بينها لا في كيوبت بعينه.</p>
<ol>
<li>يُرمَّز الكيوبت المنطقي عبر مجموعة من الكيوبتات المادية.</li>
<li>تُجرى فحوص تماثل متكررة باستخدام كيوبتات مساعدة.</li>
<li>يفسر برنامج تقليدي نمط النتائج لاستنتاج الخطأ المحتمل.</li>
<li>يُصحَّح الخطأ أو يُتتبَّع، ثم تتكرر الدورة باستمرار.</li>
</ol>
<h3>لماذا تهم العتبة؟</h3>
<p>لا ينفع التصحيح إلا إذا كانت الكيوبتات المادية جيدة بما يكفي. فإذا أدخلت كل عملية أخطاء كثيرة، فإن إضافة كيوبتات جديدة تعني ضجيجًا إضافيًا فقط. أما تحت معدل خطأ معين يسمى العتبة، فيُتوقع أن تكبح الرموز الأكبر الأخطاء بفعالية أكبر.</p>
<h2>التحدي الهندسي</h2>
<p>قد يتطلب كيوبت منطقي واحد موثوق عددًا كبيرًا من الكيوبتات المادية، ولهذا يُتوقع عمومًا أن يستغرق بناء حواسيب كمومية عملية واسعة النطاق وقتًا طويلًا. كما يجب تفسير نتائج الفحوص بسرعة، لذلك توضع المعالجات التقليدية قرب العتاد الكمومي، وهي فكرة قريبة من منطق <a href="/ar/technology/edge-computing-explained">الحوسبة الطرفية</a>.</p>
<blockquote><p>تصحيح الأخطاء هو النقطة التي تتوقف عندها الحوسبة الكمومية عن كونها عرضًا فيزيائيًا لتصبح تخصصًا هندسيًا.</p><cite>تحليل فيوتشر سفير</cite></blockquote>
<p>لمن يتابع هذا المجال، فالمعيار الأهم ليس عدد الكيوبتات المعلن، بل ما إذا كانت الكيوبتات المنطقية تتحسن بوضوح كلما كبرت. هذا الاتجاه، إن استمر، هو ما قد يحوّل النماذج الأولية الهشة إلى آلات يمكن الاعتماد عليها.</p>`,
      },
    },
  },

  // 8 ─────────────────────────────────────────────────────────────
  {
    key: "solid-state-batteries",
    category: "gadgets",
    author: "daniel",
    tags: ["climate-tech", "mobility", "semiconductors"],
    trending: true,
    daysAgo: 4,
    primaryTopic: "Solid-state batteries",
    translations: {
      en: {
        title: "Solid-State Batteries: What Could Change for Phones and Cars",
        slug: "solid-state-batteries-phones-and-cars",
        excerpt:
          "Solid-state batteries swap the liquid electrolyte for a solid one. Here is why that could mean more energy and better safety, and why manufacturing them at scale is still hard.",
        content: `${NOTICE_EN}
<h2>What makes a battery solid-state</h2>
<p>Most rechargeable batteries in phones, laptops, and electric vehicles today are lithium-ion cells with a liquid or gel electrolyte. The electrolyte is the medium that lets lithium ions travel between the two electrodes as the battery charges and discharges. It works well, but it is flammable and places limits on which electrode materials can be used safely.</p>
<p>A solid-state battery replaces that liquid with a solid electrolyte, typically a ceramic, glass, or specialized polymer. The change sounds small, yet it could open the door to different chemistry, including electrodes made largely of lithium metal, which can in principle store more energy in the same space.</p>
<h2>The potential benefits</h2>
<p>Researchers and manufacturers point to several possible advantages, although each depends on solving hard engineering problems:</p>
<ul>
<li><strong>Energy density:</strong> more energy per kilogram or per litre could mean longer range for vehicles or slimmer devices.</li>
<li><strong>Safety:</strong> solid electrolytes are generally less flammable than liquid ones.</li>
<li><strong>Charging speed:</strong> some designs may tolerate faster charging, though this varies widely.</li>
<li><strong>Lifespan:</strong> in theory, fewer unwanted side reactions could slow degradation.</li>
</ul>
<table>
<caption>Conventional lithium-ion and solid-state cells compared (general characteristics)</caption>
<thead><tr><th scope="col">Characteristic</th><th scope="col">Liquid-electrolyte lithium-ion</th><th scope="col">Solid-state (in development)</th></tr></thead>
<tbody>
<tr><td>Electrolyte</td><td>Liquid or gel</td><td>Ceramic, glass, or polymer</td></tr>
<tr><td>Fire risk</td><td>Managed with safety systems</td><td>Generally expected to be lower</td></tr>
<tr><td>Manufacturing maturity</td><td>Very mature, large scale</td><td>Early, mostly pilot lines</td></tr>
<tr><td>Cost today</td><td>Well understood</td><td>Uncertain and higher</td></tr>
</tbody>
</table>
<h2>Why they are not everywhere yet</h2>
<p>Making solid-state cells reliably at scale is difficult. Solid materials do not flow into gaps the way liquids do, so maintaining close contact between layers as the battery expands and contracts during use is a persistent challenge. Tiny metal filaments, known as dendrites, can still form in some designs and cause short circuits.</p>
<p>Manufacturing is another hurdle. Many solid electrolytes are sensitive to moisture or require precise, high-temperature processing. Scaling from laboratory samples to millions of consistent cells requires new equipment and processes, which takes time and investment.</p>
<h3>Small devices first?</h3>
<p>One plausible path is for solid-state technology to appear first in smaller products, where cells are tiny and premium pricing is easier to absorb. Wearables are a natural candidate, since the <a href="/en/gadgets/inside-wearable-health-sensors">sensors packed into a smartwatch</a> compete with the battery for limited space. Vehicles demand far larger volumes and strict durability, which raises the bar considerably.</p>
<blockquote><p>Battery breakthroughs are announced in laboratories but decided in factories. The real test is whether a design can be made cheaply, consistently, and safely by the million.</p><cite>FutureSphere analysis</cite></blockquote>
<p>Better batteries also matter beyond gadgets. Storing electricity efficiently is central to a grid with more variable renewable power, which is one reason energy planners also study complementary options such as <a href="/en/future/small-modular-reactors-explained">small modular reactors</a>.</p>
<p>For now, the sensible expectation is gradual improvement rather than an overnight switch. Liquid lithium-ion cells continue to get better too, so solid-state designs are chasing a moving target.</p>`,
      },
      ur: {
        title: "سالڈ اسٹیٹ بیٹریاں: فونز اور گاڑیوں کے لیے کیا کچھ بدل سکتا ہے",
        slug: "solid-state-batteries-phones-and-cars",
        excerpt:
          "سالڈ اسٹیٹ بیٹریاں مائع الیکٹرولائٹ کی جگہ ٹھوس مواد استعمال کرتی ہیں۔ جانیے اس سے زیادہ توانائی اور بہتر حفاظت کی امید کیوں ہے، اور بڑے پیمانے پر تیاری ابھی مشکل کیوں ہے۔",
        content: `${NOTICE_UR}
<h2>سالڈ اسٹیٹ بیٹری کیا ہے</h2>
<p>آج کے فونز، لیپ ٹاپس اور برقی گاڑیوں کی زیادہ تر بیٹریاں لیتھیم آئن سیلز ہیں جن میں مائع یا جیل الیکٹرولائٹ ہوتا ہے۔ یہی الیکٹرولائٹ چارجنگ کے دوران لیتھیم آئنز کو دونوں الیکٹروڈز کے درمیان سفر کرنے دیتا ہے۔ یہ اچھا کام کرتا ہے مگر آتش گیر ہے اور استعمال ہونے والے مواد کو محدود کرتا ہے۔</p>
<p>سالڈ اسٹیٹ بیٹری میں اس مائع کی جگہ سیرامک، شیشے یا خاص پولیمر جیسا ٹھوس الیکٹرولائٹ ہوتا ہے، جو لیتھیم دھات جیسے الیکٹروڈز کا راستہ کھول سکتا ہے جو اصولاً کم جگہ میں زیادہ توانائی رکھ سکتے ہیں۔</p>
<h2>ممکنہ فوائد</h2>
<ul>
<li><strong>زیادہ توانائی:</strong> گاڑیوں کی طویل رینج یا پتلے آلات۔</li>
<li><strong>حفاظت:</strong> ٹھوس الیکٹرولائٹ عموماً کم آتش گیر ہوتے ہیں۔</li>
<li><strong>تیز چارجنگ:</strong> کچھ ڈیزائن اس کی اجازت دے سکتے ہیں، اگرچہ یہ ڈیزائن پر منحصر ہے۔</li>
</ul>
<table>
<caption>روایتی اور سالڈ اسٹیٹ سیلز کا عمومی موازنہ</caption>
<thead><tr><th scope="col">خصوصیت</th><th scope="col">مائع لیتھیم آئن</th><th scope="col">سالڈ اسٹیٹ (زیرِ تیاری)</th></tr></thead>
<tbody>
<tr><td>الیکٹرولائٹ</td><td>مائع یا جیل</td><td>سیرامک، شیشہ یا پولیمر</td></tr>
<tr><td>تیاری کی پختگی</td><td>بہت پختہ</td><td>ابتدائی مرحلہ</td></tr>
<tr><td>موجودہ لاگت</td><td>معلوم اور مستحکم</td><td>غیر یقینی اور زیادہ</td></tr>
</tbody>
</table>
<h2>یہ ابھی ہر جگہ کیوں نہیں</h2>
<p>ٹھوس مواد مائع کی طرح خلا کو نہیں بھرتے، اس لیے استعمال کے دوران بیٹری کے پھیلنے اور سکڑنے پر تہوں کے درمیان قریبی رابطہ برقرار رکھنا مشکل ہوتا ہے۔ کچھ ڈیزائنز میں دھات کے باریک ریشے بھی بن سکتے ہیں جو شارٹ سرکٹ کا سبب بنتے ہیں۔ لیبارٹری سے لاکھوں یکساں سیلز تک پہنچنے کے لیے نئی مشینری اور وقت درکار ہے۔</p>
<h3>پہلے چھوٹے آلات؟</h3>
<p>ایک ممکنہ راستہ یہ ہے کہ یہ ٹیکنالوجی پہلے چھوٹی مصنوعات میں آئے، جیسے اسمارٹ واچز، جہاں <a href="/ur/gadgets/inside-wearable-health-sensors">صحت کے سینسرز</a> اور بیٹری محدود جگہ کے لیے مقابلہ کرتے ہیں۔</p>
<blockquote><p>بیٹری کی کامیابیوں کا اعلان لیبارٹری میں ہوتا ہے مگر فیصلہ فیکٹری میں۔</p><cite>فیوچر اسفیئر تجزیہ</cite></blockquote>
<p>بہتر بیٹریاں بجلی کے گرڈ کے لیے بھی اہم ہیں، اور توانائی کے منصوبہ ساز <a href="/ur/future/small-modular-reactors-explained">چھوٹے ماڈیولر ری ایکٹرز</a> جیسے متبادل بھی دیکھ رہے ہیں۔ فی الحال اچانک تبدیلی کے بجائے بتدریج بہتری کی توقع رکھنا زیادہ معقول ہے۔</p>`,
      },
      ar: {
        title: "بطاريات الحالة الصلبة: ما الذي قد يتغير في الهواتف والسيارات؟",
        slug: "solid-state-batteries-phones-and-cars",
        excerpt:
          "تستبدل بطاريات الحالة الصلبة الإلكتروليت السائل بمادة صلبة. نشرح لماذا قد يعني ذلك طاقة أكبر وأمانًا أفضل، ولماذا يظل تصنيعها على نطاق واسع أمرًا صعبًا.",
        content: `${NOTICE_AR}
<h2>ما الذي يجعل البطارية "صلبة"؟</h2>
<p>معظم البطاريات القابلة للشحن في الهواتف والحواسيب والسيارات الكهربائية اليوم خلايا ليثيوم أيون تحتوي على إلكتروليت سائل أو هلامي. هذا الإلكتروليت هو الوسط الذي تنتقل عبره أيونات الليثيوم بين القطبين أثناء الشحن والتفريغ. يؤدي عمله جيدًا، لكنه قابل للاشتعال ويقيّد المواد التي يمكن استخدامها بأمان.</p>
<p>أما بطارية الحالة الصلبة فتستبدل السائل بإلكتروليت صلب من السيراميك أو الزجاج أو بوليمر خاص. قد يبدو التغيير بسيطًا، لكنه قد يفتح الباب أمام كيمياء مختلفة، منها أقطاب من معدن الليثيوم يمكنها نظريًا تخزين طاقة أكبر في الحجم نفسه.</p>
<h2>المزايا المحتملة</h2>
<ul>
<li><strong>كثافة الطاقة:</strong> مدى أطول للمركبات أو أجهزة أنحف.</li>
<li><strong>الأمان:</strong> الإلكتروليتات الصلبة أقل قابلية للاشتعال عمومًا.</li>
<li><strong>سرعة الشحن:</strong> قد تحتمل بعض التصاميم شحنًا أسرع، مع تفاوت كبير بينها.</li>
</ul>
<table>
<caption>مقارنة عامة بين الخلايا التقليدية وخلايا الحالة الصلبة</caption>
<thead><tr><th scope="col">الخاصية</th><th scope="col">ليثيوم أيون بإلكتروليت سائل</th><th scope="col">الحالة الصلبة (قيد التطوير)</th></tr></thead>
<tbody>
<tr><td>الإلكتروليت</td><td>سائل أو هلام</td><td>سيراميك أو زجاج أو بوليمر</td></tr>
<tr><td>نضج التصنيع</td><td>ناضج جدًا</td><td>مرحلة مبكرة</td></tr>
<tr><td>التكلفة الحالية</td><td>معروفة</td><td>غير مؤكدة وأعلى</td></tr>
</tbody>
</table>
<h2>لماذا لم تنتشر بعد؟</h2>
<p>لا تنساب المواد الصلبة إلى الفراغات كما تفعل السوائل، لذا يصعب الحفاظ على تلامس وثيق بين الطبقات مع تمدد البطارية وانكماشها. وقد تتكون في بعض التصاميم خيوط معدنية دقيقة تسبب قصرًا كهربائيًا. كما أن الانتقال من عينات مخبرية إلى ملايين الخلايا المتماثلة يتطلب معدات وعمليات جديدة ووقتًا واستثمارًا.</p>
<h3>الأجهزة الصغيرة أولًا؟</h3>
<p>من المسارات المحتملة أن تظهر هذه التقنية أولًا في المنتجات الصغيرة مثل الساعات الذكية، حيث تتنافس <a href="/ar/gadgets/inside-wearable-health-sensors">المستشعرات الصحية</a> مع البطارية على مساحة محدودة.</p>
<blockquote><p>تُعلن اختراقات البطاريات في المختبرات، لكن الحكم عليها يصدر في المصانع.</p><cite>تحليل فيوتشر سفير</cite></blockquote>
<p>وتهم البطاريات الأفضل الشبكة الكهربائية أيضًا، ولهذا يدرس مخططو الطاقة خيارات مكملة مثل <a href="/ar/future/small-modular-reactors-explained">المفاعلات النووية الصغيرة المعيارية</a>. أما التوقع المعقول حاليًا فهو تحسن تدريجي لا تحول مفاجئ.</p>`,
      },
    },
  },

  // 9 ─────────────────────────────────────────────────────────────
  {
    key: "small-modular-reactors",
    category: "future",
    author: "amara",
    tags: ["climate-tech", "startups"],
    daysAgo: 10,
    primaryTopic: "Small modular reactors",
    translations: {
      en: {
        title: "Small Modular Reactors Explained: Promise, Trade-offs, and Timelines",
        slug: "small-modular-reactors-explained",
        excerpt:
          "Small modular reactors aim to build nuclear power from factory-made parts rather than giant one-off projects. Here is what they promise, what they cost, and why caution is wise.",
        content: `${NOTICE_EN}
<h2>A different way to build nuclear power</h2>
<p>Conventional nuclear power plants are enormous construction projects. Each one is largely built on site, and large projects of this kind have often faced delays and cost overruns. Small modular reactors, or SMRs, aim to change the model: build smaller reactors, make many of their components in factories, and ship them to the site for assembly.</p>
<p>"Small" is relative. An SMR is still a serious industrial facility, but it is designed to produce a fraction of the output of a traditional large reactor. Several units can be installed side by side as demand grows.</p>
<h2>The case for SMRs</h2>
<p>Supporters highlight several potential advantages:</p>
<ul>
<li><strong>Factory production:</strong> repeating the same design many times could, in theory, bring costs down through learning and standardization.</li>
<li><strong>Flexible siting:</strong> smaller units might fit locations where a large plant would not, such as former coal plant sites with existing grid connections.</li>
<li><strong>Passive safety:</strong> many designs rely on natural processes like gravity and convection to cool the reactor in an emergency, reducing reliance on pumps and operator action.</li>
<li><strong>Steady output:</strong> like other nuclear plants, SMRs could provide low-carbon electricity regardless of weather.</li>
</ul>
<p>Rising electricity demand, including from data centers and the spread of <a href="/en/technology/edge-computing-explained">distributed computing</a>, has added to interest in reliable low-carbon sources.</p>
<h2>The trade-offs</h2>
<table>
<caption>SMRs and large reactors: general trade-offs</caption>
<thead><tr><th scope="col">Factor</th><th scope="col">Large conventional reactor</th><th scope="col">Small modular reactor</th></tr></thead>
<tbody>
<tr><td>Construction approach</td><td>Mostly built on site</td><td>More components made in factories</td></tr>
<tr><td>Output per unit</td><td>Very high</td><td>Lower, scaled by adding units</td></tr>
<tr><td>Cost certainty</td><td>Historically difficult</td><td>Unproven until many units are built</td></tr>
<tr><td>Regulatory experience</td><td>Extensive</td><td>Still developing for new designs</td></tr>
</tbody>
</table>
<p>The central challenge is economic. Factory production only pays off with volume, but early projects must be built before that volume exists. The first units of any new design are likely to be expensive, and investors must judge how quickly costs might fall.</p>
<h3>Fuel, waste, and regulation</h3>
<p>Some SMR designs use conventional fuel, while others need more specialized fuel types whose supply chains are still limited. Like all nuclear technologies, SMRs produce radioactive waste that must be managed for long periods. Regulators also need to evaluate each new design carefully, which takes time, especially for technologies that differ significantly from existing reactors.</p>
<blockquote><p>The promise of SMRs rests on a manufacturing bet: that nuclear plants can be built more like products than projects.</p><cite>FutureSphere analysis</cite></blockquote>
<p>SMRs are not the only answer to reliable clean power. Improved storage, including the <a href="/en/gadgets/solid-state-batteries-phones-and-cars">next generation of batteries</a>, along with stronger grids and smarter demand management, will also play roles. Most energy planners expect a mix rather than a single winner.</p>
<p>Timelines deserve caution. Plans and proposals are common, but the true measure of progress will be reactors that are built on budget, licensed, and operating reliably. Watching those first projects closely is the best way to judge whether the model works.</p>`,
      },
      ur: {
        title: "چھوٹے ماڈیولر ری ایکٹرز کی وضاحت: امکانات، سمجھوتے اور وقت کا تعین",
        slug: "small-modular-reactors-explained",
        excerpt:
          "چھوٹے ماڈیولر ری ایکٹرز جوہری بجلی گھروں کو فیکٹری میں بنے پرزوں سے تیار کرنے کا خیال پیش کرتے ہیں۔ یہ مضمون ان کے فوائد، معاشی چیلنجز اور محتاط توقعات کا جائزہ لیتا ہے۔",
        content: `${NOTICE_UR}
<h2>جوہری توانائی کا نیا طریقہ</h2>
<p>روایتی جوہری بجلی گھر بہت بڑے تعمیراتی منصوبے ہوتے ہیں جو زیادہ تر موقع پر ہی بنائے جاتے ہیں، اور ایسے منصوبوں کو اکثر تاخیر اور لاگت میں اضافے کا سامنا رہا ہے۔ چھوٹے ماڈیولر ری ایکٹرز، یا ایس ایم آرز، کا خیال یہ ہے کہ ری ایکٹر چھوٹے ہوں، ان کے بہت سے پرزے فیکٹری میں بنیں اور پھر موقع پر جوڑے جائیں۔</p>
<p>"چھوٹا" ایک نسبتی لفظ ہے۔ ایس ایم آر اب بھی ایک سنجیدہ صنعتی تنصیب ہے، مگر اس کی پیداوار بڑے ری ایکٹر کا ایک حصہ ہوتی ہے، اور ضرورت بڑھنے پر کئی یونٹ ساتھ ساتھ لگائے جا سکتے ہیں۔</p>
<h2>حمایت میں دلائل</h2>
<ul>
<li><strong>فیکٹری میں تیاری:</strong> ایک ہی ڈیزائن کو بار بار بنانے سے اصولاً لاگت کم ہو سکتی ہے۔</li>
<li><strong>مقام کی لچک:</strong> چھوٹے یونٹ ایسی جگہوں پر بھی آ سکتے ہیں جہاں بڑا پلانٹ ممکن نہ ہو۔</li>
<li><strong>غیر فعال حفاظت:</strong> کئی ڈیزائن ہنگامی حالت میں کششِ ثقل اور قدرتی بہاؤ سے ٹھنڈک پر انحصار کرتے ہیں۔</li>
<li><strong>مستحکم پیداوار:</strong> موسم سے قطع نظر کم کاربن بجلی۔</li>
</ul>
<h2>سمجھوتے</h2>
<table>
<caption>ایس ایم آرز اور بڑے ری ایکٹرز: عمومی موازنہ</caption>
<thead><tr><th scope="col">پہلو</th><th scope="col">بڑا ری ایکٹر</th><th scope="col">چھوٹا ماڈیولر ری ایکٹر</th></tr></thead>
<tbody>
<tr><td>تعمیر</td><td>زیادہ تر موقع پر</td><td>زیادہ پرزے فیکٹری میں</td></tr>
<tr><td>فی یونٹ پیداوار</td><td>بہت زیادہ</td><td>کم، یونٹ بڑھا کر اضافہ</td></tr>
<tr><td>لاگت کی یقینی</td><td>تاریخی طور پر مشکل</td><td>کئی یونٹ بننے تک غیر ثابت شدہ</td></tr>
</tbody>
</table>
<p>اصل چیلنج معاشی ہے۔ فیکٹری کی تیاری تبھی فائدہ دیتی ہے جب تعداد زیادہ ہو، مگر ابتدائی منصوبے اس تعداد سے پہلے بنانے پڑتے ہیں، اس لیے پہلے یونٹ مہنگے ہونے کا امکان ہے۔</p>
<h3>ایندھن، فضلہ اور ضوابط</h3>
<p>کچھ ڈیزائن خاص قسم کا ایندھن چاہتے ہیں جس کی فراہمی ابھی محدود ہے۔ تمام جوہری ٹیکنالوجیز کی طرح ان سے بھی تابکار فضلہ بنتا ہے، اور ہر نئے ڈیزائن کی ریگولیٹری جانچ میں وقت لگتا ہے۔</p>
<blockquote><p>ایس ایم آرز کا وعدہ ایک صنعتی شرط پر ٹکا ہے: کیا جوہری پلانٹس کو منصوبوں کے بجائے مصنوعات کی طرح بنایا جا سکتا ہے؟</p><cite>فیوچر اسفیئر تجزیہ</cite></blockquote>
<p>قابلِ اعتماد صاف توانائی کا واحد حل یہی نہیں۔ <a href="/ur/gadgets/solid-state-batteries-phones-and-cars">بہتر بیٹریاں</a>، مضبوط گرڈ اور طلب کا بہتر انتظام بھی اہم کردار ادا کریں گے۔</p>`,
      },
      ar: {
        title: "شرح المفاعلات النووية الصغيرة المعيارية: الوعود والمقايضات والجداول الزمنية",
        slug: "small-modular-reactors-explained",
        excerpt:
          "تسعى المفاعلات الصغيرة المعيارية إلى بناء الطاقة النووية من أجزاء تُصنع في المصانع بدل المشاريع العملاقة. نستعرض وعودها وتحدياتها الاقتصادية وأسباب الحذر في التوقعات.",
        content: `${NOTICE_AR}
<h2>طريقة مختلفة لبناء الطاقة النووية</h2>
<p>المحطات النووية التقليدية مشاريع إنشائية ضخمة يُبنى معظمها في الموقع، وكثيرًا ما واجهت مشاريع من هذا النوع تأخيرات وتجاوزات في التكاليف. تهدف المفاعلات الصغيرة المعيارية إلى تغيير هذا النموذج: مفاعلات أصغر، تُصنع كثير من مكوناتها في المصانع، ثم تُنقل إلى الموقع لتجميعها.</p>
<p>كلمة "صغيرة" نسبية؛ فالمفاعل الصغير يظل منشأة صناعية جادة، لكنه مصمم لإنتاج جزء من قدرة المفاعل الكبير، ويمكن تركيب عدة وحدات متجاورة مع نمو الطلب.</p>
<h2>حجج المؤيدين</h2>
<ul>
<li><strong>الإنتاج في المصانع:</strong> تكرار التصميم نفسه قد يخفض التكاليف نظريًا عبر التعلم والتوحيد.</li>
<li><strong>مرونة المواقع:</strong> قد تناسب الوحدات الصغيرة أماكن لا تتسع لمحطة كبيرة.</li>
<li><strong>الأمان السلبي:</strong> تعتمد تصاميم كثيرة على الجاذبية والحمل الحراري الطبيعي للتبريد في الطوارئ.</li>
<li><strong>إنتاج ثابت:</strong> كهرباء منخفضة الكربون بغض النظر عن الطقس.</li>
</ul>
<h2>المقايضات</h2>
<table>
<caption>المفاعلات الصغيرة والكبيرة: مقارنة عامة</caption>
<thead><tr><th scope="col">العامل</th><th scope="col">المفاعل الكبير</th><th scope="col">المفاعل الصغير المعياري</th></tr></thead>
<tbody>
<tr><td>أسلوب البناء</td><td>في الموقع غالبًا</td><td>مكونات أكثر من المصانع</td></tr>
<tr><td>القدرة لكل وحدة</td><td>عالية جدًا</td><td>أقل، وتُزاد بإضافة وحدات</td></tr>
<tr><td>وضوح التكلفة</td><td>صعب تاريخيًا</td><td>غير مثبت حتى تُبنى وحدات كثيرة</td></tr>
</tbody>
</table>
<p>التحدي الأساسي اقتصادي؛ فالإنتاج في المصانع لا يؤتي ثماره إلا مع الكميات الكبيرة، لكن المشاريع الأولى يجب أن تُبنى قبل وجود تلك الكميات، لذا يُرجَّح أن تكون الوحدات الأولى مكلفة.</p>
<h3>الوقود والنفايات والتنظيم</h3>
<p>تحتاج بعض التصاميم إلى أنواع خاصة من الوقود ما زالت سلاسل إمدادها محدودة، وتنتج هذه المفاعلات نفايات مشعة تتطلب إدارة طويلة الأمد، كما يستغرق تقييم كل تصميم جديد وقتًا لدى الجهات التنظيمية.</p>
<blockquote><p>يقوم وعد المفاعلات الصغيرة على رهان صناعي: أن تُبنى المحطات النووية كمنتجات لا كمشاريع.</p><cite>تحليل فيوتشر سفير</cite></blockquote>
<p>ليست هذه المفاعلات الحل الوحيد للطاقة النظيفة الموثوقة؛ إذ ستؤدي <a href="/ar/gadgets/solid-state-batteries-phones-and-cars">البطاريات الأحدث</a> والشبكات الأقوى وإدارة الطلب أدوارًا مهمة أيضًا. والمقياس الحقيقي للتقدم سيكون مفاعلات تُبنى ضمن الميزانية وتعمل بموثوقية.</p>`,
      },
    },
  },

  // 10 ────────────────────────────────────────────────────────────
  {
    key: "low-orbit-satellite-internet",
    category: "science",
    author: "layla",
    tags: ["space", "cloud-computing"],
    daysAgo: 14,
    primaryTopic: "Satellite internet",
    translations: {
      en: {
        title: "How Low-Orbit Satellite Internet Works, and Where It Falls Short",
        slug: "how-low-orbit-satellite-internet-works",
        excerpt:
          "Large constellations of low-orbit satellites aim to bring fast internet to places cables do not reach. Here is how the system works and which trade-offs come with it.",
        content: `${NOTICE_EN}
<h2>Why orbit height matters</h2>
<p>Satellite internet is not new. For years, most consumer services relied on satellites in very high orbits, tens of thousands of kilometres above the equator. At that height a satellite appears fixed in the sky, which keeps ground antennas simple, but signals must travel a long way up and back. The resulting delay is noticeable in video calls and online games.</p>
<p>Low Earth orbit systems place satellites much closer to the ground. The shorter distance cuts delay considerably. The catch is that a low satellite races across the sky and is only overhead for a few minutes, so a service needs large numbers of satellites, known as a constellation, to provide continuous coverage.</p>
<h2>How a connection works</h2>
<ol>
<li>A user terminal, often a flat electronically steered antenna, tracks satellites as they pass overhead.</li>
<li>The satellite relays the signal to a ground station connected to the wider internet or, in some designs, passes it to other satellites using laser links first.</li>
<li>Traffic is handed from one satellite to the next as they move, ideally without the user noticing.</li>
</ol>
<p>Electronically steered antennas are a key enabler. Instead of physically turning, they shift their beam direction using many tiny antenna elements, which lets them follow fast-moving satellites without moving parts.</p>
<h3>Who benefits most</h3>
<p>The clearest use case is places poorly served by fibre or mobile networks: rural areas, islands, ships, aircraft, and disaster zones where ground infrastructure is damaged. For remote workers who travel, including those exploring <a href="/en/travel/digital-nomad-visas-practical-guide">digital nomad visas</a>, satellite service can widen the range of livable locations, though availability and licensing vary by country.</p>
<h2>The limitations</h2>
<p>Capacity is shared. Each satellite covers an area and splits its bandwidth among users there, so performance can dip in busy areas. Weather, obstructions such as trees, and the power needs of the terminal also affect the experience.</p>
<p>There are wider concerns too. Large constellations add to the growing number of objects in orbit, raising questions about collision risk and long-term space sustainability. Astronomers have raised concerns that bright satellites can interfere with telescope observations, and operators have experimented with ways to reduce reflectivity.</p>
<blockquote><p>Low-orbit internet solves a geography problem, but it creates a stewardship problem in orbit that no single operator can solve alone.</p><cite>FutureSphere analysis</cite></blockquote>
<p>Satellite links also pair well with local processing. Because bandwidth is precious, remote sites may analyze data on location and send only results, an approach described in our explainer on <a href="/en/technology/edge-computing-explained">edge computing</a>.</p>
<p>For most urban users with good fibre, satellite internet is unlikely to be the first choice. For many others, it is becoming a genuine option rather than a last resort.</p>`,
      },
      ur: {
        title: "کم مدار والا سیٹلائٹ انٹرنیٹ کیسے کام کرتا ہے اور اس کی حدود کیا ہیں",
        slug: "how-low-orbit-satellite-internet-works",
        excerpt:
          "کم بلندی پر گردش کرنے والے سیٹلائٹس کے بڑے جھرمٹ دور دراز علاقوں تک تیز انٹرنیٹ پہنچانے کی کوشش کر رہے ہیں۔ جانیے یہ نظام کیسے چلتا ہے اور اس کے ساتھ کون سے سوالات جڑے ہیں۔",
        content: `${NOTICE_UR}
<h2>مدار کی بلندی کیوں اہم ہے</h2>
<p>سیٹلائٹ انٹرنیٹ نیا نہیں۔ برسوں تک زیادہ تر سروسز بہت اونچے مدار میں موجود سیٹلائٹس استعمال کرتی رہیں، جو زمین سے دیکھنے پر ایک جگہ ٹھہرے نظر آتے ہیں۔ مگر سگنل کو بہت لمبا سفر طے کرنا پڑتا ہے، جس سے ویڈیو کالز اور آن لائن گیمز میں تاخیر محسوس ہوتی ہے۔</p>
<p>کم مدار کے نظام سیٹلائٹس کو زمین کے کہیں زیادہ قریب رکھتے ہیں، جس سے تاخیر نمایاں طور پر کم ہو جاتی ہے۔ مسئلہ یہ ہے کہ کم بلندی والا سیٹلائٹ تیزی سے آسمان پار کر جاتا ہے، اس لیے مسلسل کوریج کے لیے بہت سے سیٹلائٹس کا جھرمٹ درکار ہوتا ہے۔</p>
<h2>کنکشن کیسے بنتا ہے</h2>
<ol>
<li>صارف کا ٹرمینل، جو اکثر ایک چپٹا اینٹینا ہوتا ہے، برقی طور پر رخ بدل کر گزرتے سیٹلائٹس کا پیچھا کرتا ہے۔</li>
<li>سیٹلائٹ سگنل کو انٹرنیٹ سے جڑے زمینی اسٹیشن تک پہنچاتا ہے، یا بعض نظاموں میں پہلے لیزر کے ذریعے دوسرے سیٹلائٹس کو بھیجتا ہے۔</li>
<li>سیٹلائٹس کے حرکت کرنے پر کنکشن ایک سے دوسرے کو منتقل ہوتا رہتا ہے۔</li>
</ol>
<h3>سب سے زیادہ فائدہ کسے</h3>
<p>دیہی علاقے، جزیرے، بحری جہاز اور آفت زدہ علاقے، جہاں فائبر یا موبائل نیٹ ورک کمزور ہوں، اس ٹیکنالوجی کے سب سے واضح صارف ہیں۔ البتہ دستیابی اور لائسنسنگ ہر ملک میں مختلف ہے۔</p>
<h2>حدود</h2>
<p>ہر سیٹلائٹ اپنی بینڈوڈتھ اپنے علاقے کے صارفین میں بانٹتا ہے، اس لیے مصروف علاقوں میں رفتار کم ہو سکتی ہے۔ موسم اور درخت بھی تجربے پر اثر ڈالتے ہیں۔ بڑے جھرمٹ مدار میں اشیاء کی تعداد بڑھاتے ہیں، جس سے ٹکراؤ کے خطرے اور فلکیاتی مشاہدات پر اثر کے سوالات اٹھتے ہیں۔</p>
<blockquote><p>کم مدار کا انٹرنیٹ جغرافیے کا مسئلہ حل کرتا ہے، مگر مدار میں نگہداشت کا ایسا مسئلہ پیدا کرتا ہے جسے کوئی ایک ادارہ اکیلے حل نہیں کر سکتا۔</p><cite>فیوچر اسفیئر تجزیہ</cite></blockquote>
<p>چونکہ بینڈوڈتھ قیمتی ہے، دور دراز مقامات اکثر ڈیٹا کا تجزیہ وہیں کر کے صرف نتائج بھیجتے ہیں، جیسا کہ ہمارے مضمون <a href="/ur/technology/edge-computing-explained">ایج کمپیوٹنگ</a> میں بیان کیا گیا ہے۔</p>`,
      },
    },
  },

  // 11 ────────────────────────────────────────────────────────────
  {
    key: "startup-unit-economics",
    category: "business",
    author: "daniel",
    tags: ["startups", "cloud-computing"],
    editorsPick: true,
    daysAgo: 7,
    primaryTopic: "Unit economics",
    translations: {
      en: {
        title: "Startup Unit Economics: How to Read CAC, LTV, and Payback Period",
        slug: "startup-unit-economics-cac-ltv-payback",
        excerpt:
          "Fast growth can hide a broken model if each customer costs more than they return. This guide explains acquisition cost, lifetime value, and payback with a simple hypothetical example.",
        content: `${NOTICE_EN}
<h2>Why unit economics come first</h2>
<p>A startup can grow quickly and still be heading for trouble. If each new customer costs more to acquire and serve than they will ever pay, growth simply accelerates the losses. Unit economics is the practice of looking at the business one customer, or one order, at a time to see whether the basic model makes sense.</p>
<p>The core metrics are simple to define but easy to misuse. Understanding what each one measures, and what it leaves out, helps founders and investors avoid comforting illusions.</p>
<h2>The key metrics</h2>
<h3>Customer acquisition cost (CAC)</h3>
<p>CAC is the total spent on sales and marketing in a period divided by the number of new customers won in that period. A common mistake is counting only advertising spend and ignoring salaries, tools, and agency fees, which makes acquisition look cheaper than it is.</p>
<h3>Lifetime value (LTV)</h3>
<p>LTV estimates the gross profit a typical customer generates over their relationship with the company. Using gross profit rather than revenue matters: a customer paying for a large subscription while consuming nearly as much in cloud or support costs is worth far less than the headline price suggests. For AI-heavy products, the cost of running models is a growing factor, one reason some teams explore <a href="/en/ai/smaller-language-models-on-everyday-devices">smaller, cheaper models</a>.</p>
<h3>Payback period</h3>
<p>Payback is the number of months it takes for a customer's gross profit to cover their acquisition cost. It matters for cash: even a healthy LTV-to-CAC ratio can strain a company whose money is tied up for a long time before it returns.</p>
<table>
<caption>An illustrative example (hypothetical numbers)</caption>
<thead><tr><th scope="col">Metric</th><th scope="col">Value</th><th scope="col">How it is calculated</th></tr></thead>
<tbody>
<tr><td>Monthly price</td><td>50</td><td>Set by the pricing plan</td></tr>
<tr><td>Gross margin</td><td>70%</td><td>Revenue minus direct serving costs</td></tr>
<tr><td>Monthly gross profit</td><td>35</td><td>50 × 70%</td></tr>
<tr><td>CAC</td><td>700</td><td>Sales and marketing spend ÷ new customers</td></tr>
<tr><td>Payback period</td><td>20 months</td><td>700 ÷ 35</td></tr>
</tbody>
</table>
<p>In this made-up case, the company needs twenty months of retained revenue to break even on each customer. If many customers leave before then, the model does not work, however impressive the sign-up numbers look.</p>
<h2>Common traps</h2>
<ul>
<li><strong>Blended averages:</strong> combining cheap organic customers with expensive paid ones can hide a channel that loses money.</li>
<li><strong>Optimistic churn assumptions:</strong> early customers are often more loyal than later ones, so lifetime estimates based on them may be too generous.</li>
<li><strong>Ignoring expansion and contraction:</strong> upgrades improve LTV; downgrades and discounts reduce it.</li>
<li><strong>Short time windows:</strong> a few good months do not establish a durable pattern.</li>
</ul>
<blockquote><p>Unit economics will not tell you whether a startup is a good idea, but it will tell you quickly whether the current version of the business can pay for itself.</p><cite>FutureSphere analysis</cite></blockquote>
<p>Hardware businesses face extra layers, such as inventory, manufacturing yields, and warranty costs, which make careful staging even more important; our piece on <a href="/en/startups/how-hardware-startups-de-risk-pilots">how hardware startups reduce risk</a> covers that side.</p>
<p>The healthiest approach is to treat these numbers as questions rather than scores. Each metric points to a lever, such as pricing, retention, channel mix, or serving costs, that the team can test and improve.</p>`,
      },
      ur: {
        title: "اسٹارٹ اپ یونٹ اکنامکس: سی اے سی، ایل ٹی وی اور پے بیک کو کیسے سمجھیں",
        slug: "startup-unit-economics-cac-ltv-payback",
        excerpt:
          "تیز رفتار ترقی بھی نقصان چھپا سکتی ہے اگر ہر نیا گاہک اپنی لاگت پوری نہ کرے۔ یہ رہنما گاہک کے حصول کی لاگت، لائف ٹائم ویلیو اور پے بیک مدت کو ایک فرضی مثال سے سمجھاتا ہے۔",
        content: `${NOTICE_UR}
<h2>یونٹ اکنامکس پہلے کیوں</h2>
<p>ایک اسٹارٹ اپ تیزی سے بڑھ کر بھی مشکل کی طرف جا سکتا ہے۔ اگر ہر نیا گاہک حاصل کرنے اور اسے خدمت دینے پر اس سے زیادہ خرچ ہو جتنا وہ کبھی ادا کرے گا، تو ترقی صرف نقصان کو تیز کرتی ہے۔ یونٹ اکنامکس کاروبار کو ایک گاہک کی سطح پر دیکھنے کا طریقہ ہے۔</p>
<h2>بنیادی پیمانے</h2>
<h3>گاہک کے حصول کی لاگت (CAC)</h3>
<p>کسی مدت میں سیلز اور مارکیٹنگ پر کل خرچ کو اسی مدت کے نئے گاہکوں کی تعداد سے تقسیم کیا جاتا ہے۔ صرف اشتہارات گننا اور تنخواہیں یا ٹولز نظرانداز کرنا ایک عام غلطی ہے۔</p>
<h3>لائف ٹائم ویلیو (LTV)</h3>
<p>یہ اندازہ ہے کہ ایک عام گاہک پورے تعلق کے دوران کتنا مجموعی منافع دے گا۔ آمدنی کے بجائے منافع دیکھنا ضروری ہے، کیونکہ کلاؤڈ اور سپورٹ کی لاگت بھی شامل ہوتی ہے۔ اے آئی پر مبنی مصنوعات میں ماڈل چلانے کا خرچ اہم ہوتا جا رہا ہے، اسی لیے کچھ ٹیمیں <a href="/ur/ai/smaller-language-models-on-everyday-devices">چھوٹے اور سستے ماڈلز</a> آزماتی ہیں۔</p>
<h3>پے بیک مدت</h3>
<p>یہ وہ مہینے ہیں جن میں گاہک کا منافع اس کے حصول کی لاگت پوری کر دیتا ہے۔</p>
<table>
<caption>ایک فرضی مثال (مفروضہ اعداد)</caption>
<thead><tr><th scope="col">پیمانہ</th><th scope="col">قدر</th><th scope="col">حساب</th></tr></thead>
<tbody>
<tr><td>ماہانہ قیمت</td><td>50</td><td>قیمت کا منصوبہ</td></tr>
<tr><td>مجموعی مارجن</td><td>70%</td><td>آمدنی منفی براہِ راست لاگت</td></tr>
<tr><td>ماہانہ مجموعی منافع</td><td>35</td><td>50 × 70%</td></tr>
<tr><td>CAC</td><td>700</td><td>مارکیٹنگ خرچ ÷ نئے گاہک</td></tr>
<tr><td>پے بیک</td><td>20 ماہ</td><td>700 ÷ 35</td></tr>
</tbody>
</table>
<p>اس فرضی مثال میں اگر بہت سے گاہک بیس ماہ سے پہلے چھوڑ جائیں تو ماڈل کامیاب نہیں ہوتا، چاہے سائن اپ کتنے ہی متاثر کن ہوں۔</p>
<h2>عام غلطیاں</h2>
<ul>
<li>سستے اور مہنگے چینلز کا ملا جلا اوسط، جو نقصان والے چینل کو چھپا دیتا ہے۔</li>
<li>ابتدائی وفادار گاہکوں کی بنیاد پر حد سے زیادہ پُرامید اندازے۔</li>
<li>چند اچھے مہینوں کو پائیدار رجحان سمجھ لینا۔</li>
</ul>
<blockquote><p>یونٹ اکنامکس یہ نہیں بتاتی کہ خیال اچھا ہے یا نہیں، مگر جلد بتا دیتی ہے کہ کاروبار کا موجودہ ماڈل اپنا خرچ اٹھا سکتا ہے یا نہیں۔</p><cite>فیوچر اسفیئر تجزیہ</cite></blockquote>
<p>ان اعداد کو اسکور کے بجائے سوال سمجھیں۔ ہر پیمانہ کسی ایسے پہلو کی طرف اشارہ کرتا ہے، جیسے قیمت، گاہکوں کو برقرار رکھنا یا خدمت کی لاگت، جسے ٹیم آزما کر بہتر بنا سکتی ہے۔</p>`,
      },
      ar: {
        title: "اقتصاديات الوحدة للشركات الناشئة: كيف تقرأ تكلفة الاكتساب والقيمة الدائمة",
        slug: "startup-unit-economics-cac-ltv-payback",
        excerpt:
          "قد يخفي النمو السريع نموذجًا معطوبًا إذا كان كل عميل يكلف أكثر مما يعيده. يشرح هذا الدليل تكلفة اكتساب العميل وقيمته الدائمة وفترة الاسترداد بمثال افتراضي بسيط.",
        content: `${NOTICE_AR}
<h2>لماذا تأتي اقتصاديات الوحدة أولًا؟</h2>
<p>قد تنمو شركة ناشئة بسرعة وهي تتجه نحو المتاعب؛ فإذا كان اكتساب كل عميل جديد وخدمته يكلفان أكثر مما سيدفعه يومًا، فإن النمو يسرّع الخسائر فحسب. واقتصاديات الوحدة هي النظر إلى النشاط التجاري عميلًا تلو الآخر لمعرفة ما إذا كان النموذج الأساسي منطقيًا.</p>
<h2>المقاييس الأساسية</h2>
<h3>تكلفة اكتساب العميل (CAC)</h3>
<p>هي إجمالي الإنفاق على المبيعات والتسويق في فترة ما مقسومًا على عدد العملاء الجدد في الفترة نفسها. ومن الأخطاء الشائعة حساب الإعلانات وحدها وتجاهل الرواتب والأدوات، ما يجعل الاكتساب يبدو أرخص من حقيقته.</p>
<h3>القيمة الدائمة للعميل (LTV)</h3>
<p>تقدّر إجمالي الربح الذي يحققه العميل المعتاد طوال علاقته بالشركة. والمهم هنا استخدام الربح الإجمالي لا الإيرادات، لأن تكاليف السحابة والدعم تُقتطع منها. وفي المنتجات المعتمدة على الذكاء الاصطناعي تزداد أهمية تكلفة تشغيل النماذج، ولهذا تجرّب بعض الفرق <a href="/ar/ai/smaller-language-models-on-everyday-devices">نماذج أصغر وأقل تكلفة</a>.</p>
<h3>فترة الاسترداد</h3>
<p>هي عدد الأشهر اللازمة كي يغطي ربح العميل تكلفة اكتسابه، وهي مهمة للسيولة النقدية.</p>
<table>
<caption>مثال توضيحي (أرقام افتراضية)</caption>
<thead><tr><th scope="col">المقياس</th><th scope="col">القيمة</th><th scope="col">طريقة الحساب</th></tr></thead>
<tbody>
<tr><td>السعر الشهري</td><td>50</td><td>خطة التسعير</td></tr>
<tr><td>هامش الربح الإجمالي</td><td>70%</td><td>الإيراد ناقص تكاليف الخدمة المباشرة</td></tr>
<tr><td>الربح الإجمالي الشهري</td><td>35</td><td>50 × 70%</td></tr>
<tr><td>CAC</td><td>700</td><td>إنفاق التسويق ÷ العملاء الجدد</td></tr>
<tr><td>فترة الاسترداد</td><td>20 شهرًا</td><td>700 ÷ 35</td></tr>
</tbody>
</table>
<p>في هذا المثال المفترض، إذا غادر كثير من العملاء قبل عشرين شهرًا فإن النموذج لا ينجح مهما بدت أرقام التسجيل مبهرة.</p>
<h2>أخطاء شائعة</h2>
<ul>
<li>المتوسطات المختلطة التي تخفي قناة تسويق خاسرة.</li>
<li>افتراضات متفائلة عن بقاء العملاء مبنية على العملاء الأوائل الأكثر ولاءً.</li>
<li>اعتبار بضعة أشهر جيدة نمطًا دائمًا.</li>
</ul>
<blockquote><p>لن تخبرك اقتصاديات الوحدة إن كانت الفكرة جيدة، لكنها ستخبرك سريعًا إن كانت النسخة الحالية من النشاط قادرة على تمويل نفسها.</p><cite>تحليل فيوتشر سفير</cite></blockquote>
<p>الأفضل أن تُعامل هذه الأرقام كأسئلة لا كدرجات؛ فكل مقياس يشير إلى رافعة يمكن للفريق اختبارها وتحسينها، مثل التسعير أو الاحتفاظ بالعملاء أو تكاليف الخدمة.</p>`,
      },
    },
  },

  // 12 ────────────────────────────────────────────────────────────
  {
    key: "hardware-startup-pilots",
    category: "startups",
    author: "amara",
    tags: ["startups", "robotics", "climate-tech"],
    daysAgo: 16,
    primaryTopic: "Hardware startups",
    translations: {
      en: {
        title: "From Prototype to Pilot: How Hardware Startups Reduce Risk",
        slug: "how-hardware-startups-de-risk-pilots",
        excerpt:
          "Hardware mistakes are slow and expensive to fix, so smart founders move through staged prototypes and pilots. Here is what each stage is for and what a useful pilot looks like.",
        content: `${NOTICE_EN}
<h2>Why hardware is different</h2>
<p>Software startups can release an update overnight. Hardware startups cannot. Once a device is manufactured and shipped, a design flaw may require a costly recall or a new production run. Components have lead times, factories have minimum orders, and certification can take months. Every mistake is more expensive and slower to fix.</p>
<p>For founders building robots, energy devices, medical tools, or climate hardware, the central challenge is to learn as much as possible before committing large sums to production. The usual answer is a staged path from prototype to pilot to scale.</p>
<h2>The stages</h2>
<ol>
<li><strong>Proof of concept:</strong> a rough build that shows the core idea can work at all.</li>
<li><strong>Looks-like and works-like prototypes:</strong> separate models for appearance and function, later merged.</li>
<li><strong>Engineering validation:</strong> testing whether the design meets its specifications reliably.</li>
<li><strong>Pilot deployment:</strong> a small number of units used by real customers in real conditions.</li>
<li><strong>Production ramp:</strong> scaling manufacturing while monitoring quality closely.</li>
</ol>
<p>Each stage is designed to answer specific questions. Skipping ahead is tempting when investors or customers are eager, but it often means discovering problems at the most expensive possible moment.</p>
<h3>What a good pilot looks like</h3>
<p>A useful pilot has clear success criteria agreed in advance: uptime, maintenance needs, user satisfaction, or measurable savings. It runs long enough to reveal wear and seasonal effects, and it includes the customer's operations staff, not just enthusiastic champions. Robotics companies, for instance, often learn that the environment matters as much as the robot: floors, lighting, wireless coverage, and workflows all affect results.</p>
<p>Pilots also test the business model. How long does installation take? Who fixes the unit when it fails? Those answers feed directly into the <a href="/en/business/startup-unit-economics-cac-ltv-payback">unit economics</a> that determine whether a hardware company can survive at scale.</p>
<h2>Reducing risk along the way</h2>
<ul>
<li><strong>Design for manufacturing early:</strong> involving manufacturing partners during design can avoid parts that are hard to produce.</li>
<li><strong>Avoid single-source components where possible:</strong> supply disruptions can halt production.</li>
<li><strong>Use standard platforms:</strong> off-the-shelf modules and open architectures such as <a href="/en/technology/risc-v-open-instruction-set-architectures">RISC-V</a> can reduce licensing and custom development.</li>
<li><strong>Plan certification from the start:</strong> safety and radio approvals shape the design.</li>
</ul>
<p>Financing strategy follows the same logic. Raising money in step with milestones, rather than all at once, lets founders show evidence at each stage and negotiate from a stronger position.</p>
<blockquote><p>In hardware, the cheapest time to fix a problem is before anyone has ordered a single part.</p><cite>FutureSphere analysis</cite></blockquote>
<p>Climate hardware adds its own twist. Devices such as heat pumps, battery systems, or industrial sensors often go into buildings and infrastructure with long replacement cycles, so customers are cautious. Demonstrating reliability through well-run pilots can matter more than any sales pitch.</p>
<p>None of this guarantees success, but a disciplined, staged approach turns unknowns into knowns one step at a time, which is ultimately what investors and customers are paying for.</p>`,
      },
    },
  },

  // 13 ────────────────────────────────────────────────────────────
  {
    key: "wearable-health-sensors",
    category: "gadgets",
    author: "amara",
    tags: ["health-tech", "machine-learning", "semiconductors"],
    trending: true,
    daysAgo: 9,
    primaryTopic: "Wearable health sensors",
    translations: {
      en: {
        title: "Inside Wearable Health Sensors: What They Measure and What They Miss",
        slug: "inside-wearable-health-sensors",
        excerpt:
          "Smartwatches and fitness bands infer health signals from light, motion, and temperature. Here is how those sensors work, where they help, and how seriously to take the numbers.",
        content: `${NOTICE_EN}
<h2>A lab on the wrist</h2>
<p>Smartwatches, fitness bands, and smart rings pack a surprising amount of sensing into a small space. Most can estimate heart rate and track movement, and many offer features such as sleep analysis, blood oxygen estimates, or skin temperature trends. Understanding how these sensors work helps explain both their usefulness and their limits.</p>
<h2>The main sensors</h2>
<h3>Optical heart-rate sensing</h3>
<p>The green or red lights on the back of many wearables are part of a technique called photoplethysmography. The device shines light into the skin and measures how much is reflected back. As blood pulses through vessels, the amount of absorbed light changes slightly, and algorithms turn those changes into a heart-rate estimate.</p>
<p>Accuracy depends on fit, skin characteristics, movement, and temperature. During vigorous exercise, arm motion can create noise that software must filter out, which is why readings can lag or jump.</p>
<h3>Motion, temperature, and electrical signals</h3>
<ul>
<li><strong>Accelerometers and gyroscopes</strong> measure movement and orientation, supporting step counts, workout detection, and sleep estimates.</li>
<li><strong>Temperature sensors</strong> track changes relative to a personal baseline rather than precise body temperature.</li>
<li><strong>Electrical sensors</strong> on some devices can record a single-lead heart rhythm when the user touches an electrode, a simpler version of a clinical ECG.</li>
</ul>
<h2>From raw signals to insights</h2>
<p>Raw sensor data is noisy, so machine learning models play a big role. They estimate sleep stages, flag possible irregular rhythms, and personalize baselines. Much of this processing now happens on the device itself, a practical example of <a href="/en/technology/edge-computing-explained">edge computing</a> that saves battery and keeps raw data local.</p>
<p>Power is a constant constraint. Every sensor reading and every calculation drains a tiny battery, so designers balance sampling frequency against battery life. Advances in battery chemistry, such as those discussed in our explainer on <a href="/en/gadgets/solid-state-batteries-phones-and-cars">solid-state batteries</a>, could ease that tension over time.</p>
<table>
<caption>What common wearable sensors are good and less good at</caption>
<thead><tr><th scope="col">Sensor</th><th scope="col">Useful for</th><th scope="col">Common limitations</th></tr></thead>
<tbody>
<tr><td>Optical (PPG)</td><td>Resting heart rate, long-term trends</td><td>Motion noise, sensitivity to fit</td></tr>
<tr><td>Accelerometer</td><td>Activity and sleep patterns</td><td>Estimates sleep stages indirectly</td></tr>
<tr><td>Temperature</td><td>Relative changes over time</td><td>Not a medical thermometer</td></tr>
<tr><td>Electrical (ECG)</td><td>Spot rhythm checks</td><td>Requires user action, limited leads</td></tr>
</tbody>
</table>
<blockquote><p>A wearable is best at noticing change in the person wearing it, and weakest when asked to act like a hospital device.</p><cite>FutureSphere analysis</cite></blockquote>
<p>That distinction matters. Some wearable features have received regulatory clearance for specific uses in some countries, but most metrics are intended for general wellness. A worrying reading is a reason to consult a clinician, not a diagnosis, and a normal reading does not rule out a problem.</p>
<p>Privacy deserves attention as well. Health data is personal and sensitive, so it is worth reviewing what a device shares, with whom, and whether data can be exported or deleted.</p>
<p>Used thoughtfully, wearables can encourage healthy habits and prompt timely conversations with doctors. Their real strength lies in long-term trends, not in any single number on the screen.</p>`,
      },
      ur: {
        title: "پہننے والے صحت سینسرز کے اندر: یہ کیا ناپتے ہیں اور کیا نظرانداز کرتے ہیں",
        slug: "inside-wearable-health-sensors",
        excerpt:
          "اسمارٹ واچز اور فٹنس بینڈز روشنی، حرکت اور درجہ حرارت کے سینسرز سے صحت کے اشارے اخذ کرتے ہیں۔ جانیے یہ کیسے کام کرتے ہیں اور ان کے نتائج کو کس حد تک سنجیدہ لینا چاہیے۔",
        content: `${NOTICE_UR}
<h2>کلائی پر ایک چھوٹی لیب</h2>
<p>اسمارٹ واچز، فٹنس بینڈز اور اسمارٹ رنگز چھوٹی سی جگہ میں حیرت انگیز حد تک سینسرز سمو لیتے ہیں۔ زیادہ تر دل کی دھڑکن کا اندازہ لگاتے اور حرکت ریکارڈ کرتے ہیں، جبکہ کئی نیند اور جلد کے درجہ حرارت کے رجحانات بھی دکھاتے ہیں۔</p>
<h2>اہم سینسرز</h2>
<h3>روشنی سے دل کی دھڑکن</h3>
<p>بہت سے آلات کی پشت پر موجود سبز یا سرخ روشنیاں جلد میں روشنی ڈال کر واپس آنے والی روشنی ناپتی ہیں۔ خون کے بہاؤ کے ساتھ جذب ہونے والی روشنی تھوڑی بدلتی ہے، اور الگورتھم اسے دل کی دھڑکن کے اندازے میں بدل دیتے ہیں۔ درستگی کا انحصار آلے کی فٹنگ، حرکت اور درجہ حرارت پر ہوتا ہے۔</p>
<ul>
<li><strong>ایکسلرومیٹر اور جائروسکوپ</strong> حرکت اور سمت ناپ کر قدموں اور نیند کا اندازہ لگاتے ہیں۔</li>
<li><strong>درجہ حرارت کے سینسر</strong> درست جسمانی درجہ حرارت کے بجائے ذاتی معمول سے تبدیلی دکھاتے ہیں۔</li>
<li><strong>برقی سینسر</strong> بعض آلات میں صارف کے چھونے پر دل کی دھڑکن کا سادہ ریکارڈ لیتے ہیں۔</li>
</ul>
<h2>خام سگنل سے نتیجے تک</h2>
<p>خام ڈیٹا میں شور بہت ہوتا ہے، اس لیے مشین لرننگ ماڈلز نیند کے مراحل کا اندازہ لگانے اور ذاتی معمول طے کرنے میں بڑا کردار ادا کرتے ہیں۔ یہ پروسیسنگ اب اکثر آلے پر ہی ہوتی ہے، جو <a href="/ur/technology/edge-computing-explained">ایج کمپیوٹنگ</a> کی عملی مثال ہے۔ بیٹری ہمیشہ ایک رکاوٹ رہتی ہے، اور <a href="/ur/gadgets/solid-state-batteries-phones-and-cars">سالڈ اسٹیٹ بیٹریوں</a> جیسی پیش رفت وقت کے ساتھ اس دباؤ کو کم کر سکتی ہے۔</p>
<table>
<caption>عام سینسرز کی خوبیاں اور حدود</caption>
<thead><tr><th scope="col">سینسر</th><th scope="col">کس کام کا</th><th scope="col">عام حدود</th></tr></thead>
<tbody>
<tr><td>روشنی والا سینسر</td><td>آرام کی حالت میں دھڑکن</td><td>حرکت سے شور</td></tr>
<tr><td>ایکسلرومیٹر</td><td>سرگرمی اور نیند کے رجحانات</td><td>نیند کا بالواسطہ اندازہ</td></tr>
<tr><td>درجہ حرارت</td><td>وقت کے ساتھ تبدیلی</td><td>طبی تھرمامیٹر نہیں</td></tr>
</tbody>
</table>
<blockquote><p>پہننے والا آلہ اپنے صارف میں تبدیلی محسوس کرنے میں بہترین اور اسپتال کے آلے کی جگہ لینے میں کمزور ترین ہے۔</p><cite>فیوچر اسفیئر تجزیہ</cite></blockquote>
<p>زیادہ تر پیمانے عمومی صحت و تندرستی کے لیے ہیں۔ تشویشناک ریڈنگ ڈاکٹر سے مشورے کی وجہ ہے، تشخیص نہیں، اور نارمل ریڈنگ کسی مسئلے کو خارج نہیں کرتی۔ صحت کا ڈیٹا حساس ہے، اس لیے یہ دیکھنا بھی ضروری ہے کہ آلہ کون سا ڈیٹا کس کے ساتھ شیئر کرتا ہے۔</p>`,
      },
      ar: {
        title: "داخل المستشعرات الصحية القابلة للارتداء: ماذا تقيس وما الذي يفوتها",
        slug: "inside-wearable-health-sensors",
        excerpt:
          "تستنتج الساعات الذكية وأساور اللياقة مؤشرات صحية من الضوء والحركة والحرارة. نشرح كيف تعمل هذه المستشعرات، وأين تفيد، وإلى أي حد ينبغي أن نثق بأرقامها.",
        content: `${NOTICE_AR}
<h2>مختبر صغير على المعصم</h2>
<p>تجمع الساعات الذكية وأساور اللياقة والخواتم الذكية عددًا مدهشًا من المستشعرات في مساحة صغيرة. معظمها يقدّر نبض القلب ويتتبع الحركة، وكثير منها يعرض تحليلًا للنوم أو تقديرات لأكسجين الدم أو اتجاهات حرارة الجلد.</p>
<h2>المستشعرات الرئيسية</h2>
<h3>قياس النبض بالضوء</h3>
<p>الأضواء الخضراء أو الحمراء في ظهر كثير من الأجهزة جزء من تقنية تُعرف بتخطيط التحجم الضوئي؛ إذ يسلط الجهاز ضوءًا على الجلد ويقيس ما ينعكس منه. ومع تدفق الدم في الأوعية تتغير كمية الضوء الممتص قليلًا، فتحوّل الخوارزميات هذه التغيرات إلى تقدير للنبض. وتتأثر الدقة بإحكام الارتداء والحركة ودرجة الحرارة.</p>
<ul>
<li><strong>مقاييس التسارع والجيروسكوب</strong> ترصد الحركة والاتجاه لحساب الخطوات وتقدير النوم.</li>
<li><strong>مستشعرات الحرارة</strong> تتابع التغير مقارنةً بخط أساس شخصي لا حرارة الجسم الدقيقة.</li>
<li><strong>المستشعرات الكهربائية</strong> في بعض الأجهزة تسجل نظم القلب عند لمس المستخدم لقطب معين.</li>
</ul>
<h2>من الإشارة الخام إلى الاستنتاج</h2>
<p>البيانات الخام مليئة بالتشويش، لذلك تؤدي نماذج التعلم الآلي دورًا كبيرًا في تقدير مراحل النوم وضبط خطوط الأساس الشخصية. ويجري كثير من هذه المعالجة على الجهاز نفسه، وهو مثال عملي على <a href="/ar/technology/edge-computing-explained">الحوسبة الطرفية</a>. وتبقى البطارية قيدًا دائمًا، وقد تخفف تطورات مثل <a href="/ar/gadgets/solid-state-batteries-phones-and-cars">بطاريات الحالة الصلبة</a> هذا الضغط مع الوقت.</p>
<table>
<caption>نقاط قوة المستشعرات الشائعة وحدودها</caption>
<thead><tr><th scope="col">المستشعر</th><th scope="col">مفيد في</th><th scope="col">حدود شائعة</th></tr></thead>
<tbody>
<tr><td>الضوئي</td><td>نبض الراحة والاتجاهات الطويلة</td><td>التشويش الناتج عن الحركة</td></tr>
<tr><td>مقياس التسارع</td><td>أنماط النشاط والنوم</td><td>تقدير غير مباشر لمراحل النوم</td></tr>
<tr><td>الحرارة</td><td>التغيرات النسبية</td><td>ليس ميزان حرارة طبيًا</td></tr>
</tbody>
</table>
<blockquote><p>يتفوق الجهاز القابل للارتداء في ملاحظة التغير لدى من يرتديه، ويضعف حين يُطلب منه أن يؤدي دور جهاز المستشفى.</p><cite>تحليل فيوتشر سفير</cite></blockquote>
<p>معظم هذه المقاييس مخصصة للعافية العامة؛ فالقراءة المقلقة سبب لاستشارة الطبيب لا تشخيص، والقراءة الطبيعية لا تنفي وجود مشكلة. كما أن البيانات الصحية حساسة، فمن المفيد مراجعة ما يشاركه الجهاز ومع من.</p>`,
      },
    },
  },

  // 14 ────────────────────────────────────────────────────────────
  {
    key: "digital-nomad-visas",
    category: "travel",
    author: "daniel",
    tags: ["startups", "cloud-computing", "cybersecurity"],
    daysAgo: 20,
    primaryTopic: "Remote work abroad",
    translations: {
      en: {
        title: "Digital Nomad Visas: A Practical Guide to Working Remotely Abroad",
        slug: "digital-nomad-visas-practical-guide",
        excerpt:
          "Many countries now offer visas aimed at remote workers. This guide covers the common requirements, the tax questions to ask early, and the tech habits that keep work running smoothly.",
        content: `${NOTICE_EN}
<h2>What a digital nomad visa is</h2>
<p>Remote work has made it possible for many people to do their jobs from almost anywhere with a reliable connection. Traditional tourist visas, however, often do not permit work, and regular work visas usually assume a local employer. Digital nomad visas, offered by a growing number of countries, aim to fill that gap by allowing foreigners to live in the country for an extended period while working for employers or clients elsewhere.</p>
<p>Rules vary widely between countries and change frequently, so this guide focuses on general patterns rather than specific requirements. Always check official government sources before making plans.</p>
<h2>Common requirements</h2>
<p>Although the details differ, many programmes ask for similar things:</p>
<ul>
<li><strong>Proof of remote income:</strong> evidence of employment or client work outside the host country, often with a minimum income level.</li>
<li><strong>Health insurance:</strong> coverage valid in the host country for the length of the stay.</li>
<li><strong>Background check:</strong> a criminal record certificate from your home country or country of residence.</li>
<li><strong>Documents:</strong> a valid passport and accommodation details, sometimes with translated or certified copies.</li>
</ul>
<p>Fees, processing times, and the permitted length of stay also vary. Some visas can be renewed; others are strictly time-limited.</p>
<h3>Taxes and legal questions</h3>
<p>Taxes are the area where people most often get caught out. Spending a long time in a country can affect where you are considered tax resident, depending on local rules and any agreements between countries. Some programmes come with specific tax arrangements; others do not. Speaking with a qualified tax adviser before moving is a sensible step.</p>
<h2>Practical preparation</h2>
<p>Beyond paperwork, working remotely abroad depends on dependable technology. Connectivity is the foundation, and in more remote locations <a href="/en/science/how-low-orbit-satellite-internet-works">low-orbit satellite internet</a> may widen the options, subject to local availability.</p>
<ol>
<li><strong>Secure your accounts:</strong> set up strong sign-in methods such as <a href="/en/technology/passkeys-explained-password-free-sign-in">passkeys</a> on more than one device, and store recovery codes safely.</li>
<li><strong>Back up to the cloud:</strong> keep work files synchronized so that a lost laptop is an inconvenience rather than a disaster.</li>
<li><strong>Be careful on public Wi-Fi:</strong> use trusted networks and your employer's recommended security tools.</li>
<li><strong>Check your employer's policies:</strong> some companies restrict where staff can work for legal or security reasons.</li>
</ol>
<blockquote><p>The visa gets you through the border. Reliable connectivity, sound security habits, and clear tax planning are what make the arrangement sustainable.</p><cite>FutureSphere analysis</cite></blockquote>
<p>Founders and freelancers make up a large part of the remote-work community, and some find that time abroad exposes them to new markets and startup networks. Others discover that time-zone differences with clients or teammates are harder to manage than expected.</p>
<p>It often helps to treat the first few months as a trial: start with a single destination, build a routine, and only then decide whether a longer stay or a move elsewhere makes sense.</p>`,
      },
    },
  },
]
