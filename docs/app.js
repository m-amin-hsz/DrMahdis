// Client App Logic - Bilingual (FA/EN), Authentication (Sign In/Up/Out), Habit Stacking & Chat

let techniquesData = [];
let currentDay = 1;
let isAudioPlaying = false;
let audioInterval = null;
let countdownSeconds = 18 * 3600 + 42 * 60 + 15;
let userXp = 350;

// Language State: 'fa' (default) or 'en'
let currentLang = localStorage.getItem('shock_lang') || 'fa';

// Current User State
let currentUser = JSON.parse(localStorage.getItem('shock_user') || 'null');

// Bilingual Dictionary
const i18n = {
  fa: {
    langBtn: "EN",
    brandTitle: "متد شوک | دکتر مهدیس",
    brandSubtitle: "Drmadis.com • لایف‌استایل و رژیم ۹۰ روزه",
    streakLabel: "روز",
    authBtnSignIn: "ورود / ثبت‌نام",
    authBtnLogout: "خروج",
    downloadApk: "دانلود APK",
    doctorPortal: "پنل پزشک ⚡",
    installBannerTitle: "نصب اپلیکیشن Shock روی گوشی",
    installBannerSub: "دسترسی سریع، بدون نوار مرورگر و آفلاین",
    installBtn: "نصب سریع",
    downloadApkBtn: "دانلود APK",
    
    // Tabs
    tabToday: "برنامه امروز",
    tabWaiting: "صف پزشک",
    tabIntake: "پرونده سلامت",
    tabFollowup: "فالوآپ‌ها",
    tabRewards: "دستاوردها",
    tabChat: "چت همراه",

    // Day & Technique
    dayWord: "روز",
    techniquePrefix: "تکنیک روز",
    techniqueOf90: "از ۹۰",
    tasksHeader: "وظایف انباشتی امروز",
    tasksDesc: "تکنیک‌های هر روز به روزهای قبل اضافه می‌شوند تا سبک زندگی ماندگار شکل بگیرد:",
    tasksCompleted: "انجام شده",
    taskIntroduced: "معرفی شده در روز",
    taskDaily: "تداوم روزانه",
    audioDuration: "01:25",
    
    // Trackers
    waterTitle: "💧 آب مصرفی",
    waterGoal: "هدف: ۸ لیوان",
    glassesWord: "لیوان",
    addWaterBtn: "+ نوشیدن یک لیوان دیگر",
    workoutTitle: "🏃‍♀️ پیاده‌روی و تمرین",
    workoutGoal: "هدف: ۳۰ دقیقه",
    minsWord: "دقیقه",
    addWorkoutBtn: "+ ثبت ۱۰ دقیقه ورزش",

    // Homework
    homeworkCardTitle: "📝 تکلیف تعاملی امروز",
    homeworkBadge: "ارسال برای پزشک",
    homeworkPlaceholder: "پاسخ یا گزارش خود را اینجا بنویسید...",
    homeworkSubmitBtn: "ارسال تکلیف برای خانم دکتر",

    // Waiting Room
    waitingTitle: "پرونده شما در صف بررسی خانم دکتر است",
    waitingDesc: "برخلاف رژیم‌های رباتیک و بی‌کیفیت، رژیم اختصاصی شما بر اساس جواب آزمایش و ویژگی‌های هورمونی توسط شخص خانم دکتر تنظیم می‌شود.",
    waitingNote: "زمان تقریبی تا آماده‌سازی کامل رژیم غذایی و ورزشی",
    step1: "دریافت مشخصات بیومتریک و سابقه پزشکی",
    step2: "بررسی برگه آزمایش خون و فاکتورهای تیروئید و قند",
    step3: "آنالیز عکس‌های قبل و فرم بدنی توسط پزشک",
    step4: "محاسبه دقیق درشت‌مغذی‌ها و تنظیم پلن غذایی اختصاصی",
    step5: "تایید نهایی و بارگذاری در پنل مراجع",
    demoApproveTitle: "تست سریع در دمو (ویژه بررسی کارفرما)",
    demoApproveDesc: "برای اینکه بتوانید فوراً خروجی تایید پزشک را تست کنید، می‌توانید از این دکمه شبیه‌ساز استفاده کنید:",
    demoApproveBtn: "⚡ شبیه‌سازی تایید فوری رژیم توسط خانم دکتر",

    // Intake Form
    intakeTitle: "📋 پرونده پزشکی و آنالیز سلامت",
    intakeBadge: "زیر نظر پزشک",
    lblHeight: "قد (سانتی‌متر)",
    lblWeight: "وزن فعلی (کیلوگرم)",
    lblAge: "سن",
    lblTargetWeight: "وزن هدف (کیلوگرم)",
    lblMenstrual: "وضعیت چرخه قاعدگی بانوان",
    optMenstrualRegular: "کاملاً منظم (۲۸ تا ۳۰ روزه)",
    optMenstrualIrregular: "نامنظم / با تاخیر",
    optMenstrualPco: "دارای تنبلی تخمدان (PCOS)",
    optMenstrualMenopause: "یائسگی",
    optMenstrualMale: "مراجع آقا هستم",
    lblConditions: "سابقه بیماری‌ها و حساسیت‌ها",
    lblBloodUpload: "💉 آپلود برگه آزمایش خون (الزامی جهت بررسی پزشک)",
    bloodUploadBtn: "انتخاب تصویر یا فایل PDF آزمایش",
    bloodUploadDone: "فایل بارگذاری شده: Azmayesh-Khon-Tir98.pdf (تایید شده)",
    lblPhotos: "📸 تصاویر وضعیت بدنی (۴ زاویه روبرو، پشت و نیم‌رخ‌ها)",
    photosNotice: "این تصاویر صرفاً توسط خانم دکتر برای ارزیابی افتادگی و چربی موضعی مشاهده شده و کاملاً محرمانه است.",
    angleFront: "۱. نمای روبرو (Front)",
    angleRight: "۲. نیم‌رخ راست (Right)",
    angleBack: "۳. نمای پشت (Back)",
    angleLeft: "۴. نیم‌رخ چپ (Left)",
    btnSaveIntake: "💾 ذخیره پرونده و ارسال برای خانم دکتر",

    // Followup Simulator
    followupTitle: "🔔 موتور فالوآپ و پیگیری هوشمند",
    followupBadge: "نرخ پایبندی: ۹۳٪",
    followupDesc: "عامل اصلی نتیجه‌گیری افراد در رژیم «فالوآپ و یادآوری منظم» است. در اینجا نمونه نوتیفیکیشن‌های روزانه را امتحان کنید:",
    btnSimWater: "💧 شبیه‌ساز: «آب قبل از غذا رو خوردی؟»",
    btnSimBreath: "🧘‍♀️ شبیه‌ساز: «۴ دور تنفس مربعی برای آرامش»",
    btnSimWorkout: "👟 شبیه‌ساز: «وقت ۲۰ دقیقه پیاده‌روی شادابه»",
    btnSimCbt: "📝 شبیه‌ساز: «جدول مزایای لاغریت رو خوندی؟»",
    notifChannelsTitle: "تنظیمات کانال‌های اطلاع‌رسانی",
    chSms: "دریافت پیامک سریع در صورت بسته بودن اپلیکیشن",
    chPush: "نوتیفیکیشن پوش مرورگر (Web Push)",
    chAudio: "یادآوری ویس‌های انگیزشی صبحگاهی خانم دکتر",

    // Rewards
    rewardsLevelTitle: "سطح انگیزه و سلامت شما",
    rewardsLevelVal: "رهروی پراراده (سطح ۲)",
    rewardsScoreNote: "امتیاز فعلی شما: {xp} امتیاز (۱۵۰ امتیاز تا مدال بعدی)",
    rewardsBadgesTitle: "نشان‌های افتخار و دستاوردها",

    // Chat
    chatDoctorName: "دستیار و مشاور خانم دکتر",
    chatDoctorStatus: "پاسخگوی شما مثل یک دوست صمیمی",
    chatPlaceholder: "پیام یا سوالت رو اینجا بنویس...",

    // Auth Modal
    authModalSignInTitle: "ورود به متد شوک",
    authModalSignUpTitle: "ثبت‌نام در متد شوک",
    authModalSubtitle: "حساب اختصاصی مراجعین دکتر مهدیس",
    tabSignIn: "ورود (Sign In)",
    tabSignUp: "ثبت‌نام (Sign Up)",
    lblIdentifier: "شماره موبایل یا ایمیل",
    lblPassword: "رمز عبور",
    btnSubmitSignIn: "ورود به پنل کاربری",
    btnSubmitSignUp: "ایجاد حساب و آغاز متد شوک",
    noAccountPrompt: "حساب کاربری ندارید؟",
    haveAccountPrompt: "قبلاً ثبت‌نام کرده‌اید؟",
    linkSignUp: "ثبت‌نام کنید",
    linkSignIn: "وارد شوید",
    authSuccessLogin: "با موفقیت وارد شدید! خوش آمدید.",
    authSuccessRegister: "ثبت‌نام شما با موفقیت انجام شد! به متد شوک خوش آمدید.",
    authErrorLogin: "شماره یا رمز عبور اشتباه است."
  },

  en: {
    langBtn: "FA",
    brandTitle: "Shock Method | Dr. Madis",
    brandSubtitle: "Drmadis.com • 90-Day Lifestyle & Diet",
    streakLabel: "Days",
    authBtnSignIn: "Sign In / Register",
    authBtnLogout: "Logout",
    downloadApk: "Download APK",
    doctorPortal: "Doctor Portal ⚡",
    installBannerTitle: "Install Shock App on Your Phone",
    installBannerSub: "Fast, full-screen offline access without browser bar",
    installBtn: "Install Now",
    downloadApkBtn: "Download APK",

    // Tabs
    tabToday: "Today's Plan",
    tabWaiting: "Doctor Queue",
    tabIntake: "Health Dossier",
    tabFollowup: "Follow-ups",
    tabRewards: "Badges",
    tabChat: "Coach Chat",

    // Day & Technique
    dayWord: "Day",
    techniquePrefix: "Technique Day",
    techniqueOf90: "of 90",
    tasksHeader: "Today's Habit Stacking Tasks",
    tasksDesc: "Daily techniques stack on previous habits to build sustainable, permanent lifestyle changes:",
    tasksCompleted: "completed",
    taskIntroduced: "Introduced on Day",
    taskDaily: "Daily habit",
    audioDuration: "01:25",

    // Trackers
    waterTitle: "💧 Water Intake",
    waterGoal: "Goal: 8 Glasses",
    glassesWord: "Glasses",
    addWaterBtn: "+ Drink Another Glass",
    workoutTitle: "🏃‍♀️ Walking & Workout",
    workoutGoal: "Goal: 30 Mins",
    minsWord: "Mins",
    addWorkoutBtn: "+ Log 10 Mins Exercise",

    // Homework
    homeworkCardTitle: "📝 Today's Interactive Assignment",
    homeworkBadge: "Send to Doctor",
    homeworkPlaceholder: "Type your homework report or reflection here...",
    homeworkSubmitBtn: "Submit Homework to Dr. Madis",

    // Waiting Room
    waitingTitle: "Your Dossier is in Dr. Madis's Review Queue",
    waitingDesc: "Unlike generic robot-generated diet apps, your custom program is designed by Dr. Madis personally based on your blood lab work and hormonal profile.",
    waitingNote: "Estimated time until personalized meal & workout plan delivery",
    step1: "Intake of biometric data and medical history",
    step2: "Clinical review of blood tests, thyroid, and glucose",
    step3: "360° photo body composition assessment by doctor",
    step4: "Precision macronutrient calculation & custom diet design",
    step5: "Final approval and delivery to patient portal",
    demoApproveTitle: "Quick Demo Simulator (For Client Evaluation)",
    demoApproveDesc: "To test the instantaneous doctor approval flow right now, click this simulator button:",
    demoApproveBtn: "⚡ Simulate Immediate Doctor Approval",

    // Intake Form
    intakeTitle: "📋 Medical Dossier & Health Analysis",
    intakeBadge: "Supervised by Physician",
    lblHeight: "Height (cm)",
    lblWeight: "Current Weight (kg)",
    lblAge: "Age",
    lblTargetWeight: "Target Goal Weight (kg)",
    lblMenstrual: "Female Menstrual Cycle Health",
    optMenstrualRegular: "Regular (28-30 Days)",
    optMenstrualIrregular: "Irregular / Delayed",
    optMenstrualPco: "Polycystic Ovary Syndrome (PCOS)",
    optMenstrualMenopause: "Menopause",
    optMenstrualMale: "I am a male client",
    lblConditions: "Medical Conditions & Food Allergies",
    lblBloodUpload: "💉 Upload Blood Lab Test (Required for Doctor Review)",
    bloodUploadBtn: "Select Lab Test Image or PDF File",
    bloodUploadDone: "Attached File: Blood_Lab_Panel_2026.pdf (Verified)",
    lblPhotos: "📸 360° Body Composition Photos (4 Angles)",
    photosNotice: "These images are strictly private and viewed only by Dr. Madis to assess localized adipose and muscle tone.",
    angleFront: "1. Front View",
    angleRight: "2. Right Profile",
    angleBack: "3. Back View",
    angleLeft: "4. Left Profile",
    btnSaveIntake: "💾 Save Dossier & Submit to Dr. Madis",

    // Followup Simulator
    followupTitle: "🔔 Smart Follow-up & Accountability Engine",
    followupBadge: "Adherence Rate: 93%",
    followupDesc: "The core reason clients succeed is consistent follow-ups and cues. Test these daily push notification samples:",
    btnSimWater: "💧 Test Reminder: 'Did you drink 2 glasses of water?'",
    btnSimBreath: "🧘‍♀️ Test Reminder: '4 rounds of box breathing before food'",
    btnSimWorkout: "👟 Test Reminder: 'Time for your 20-min brisk walk'",
    btnSimCbt: "📝 Test Reminder: 'Review your Advantage Card today'",
    notifChannelsTitle: "Notification Delivery Channels",
    chSms: "Instant SMS delivery if app is closed",
    chPush: "Browser Web Push Notifications",
    chAudio: "Morning voice motivation notes from Dr. Madis",

    // Rewards
    rewardsLevelTitle: "Your Health & Motivation Level",
    rewardsLevelVal: "Resolute Practitioner (Level 2)",
    rewardsScoreNote: "Current Score: {xp} XP (150 XP to next badge)",
    rewardsBadgesTitle: "Badges & Milestones",

    // Chat
    chatDoctorName: "Dr. Madis Clinical Mentor",
    chatDoctorStatus: "Here for you like an empathetic friend",
    chatPlaceholder: "Type your question or daily reflection here...",

    // Auth Modal
    authModalSignInTitle: "Sign In to Shock Method",
    authModalSignUpTitle: "Register for Shock Method",
    authModalSubtitle: "Official Portal for Dr. Madis's Patients",
    tabSignIn: "Sign In",
    tabSignUp: "Sign Up",
    lblIdentifier: "Mobile Number or Email",
    lblPassword: "Password",
    btnSubmitSignIn: "Sign In to My Dashboard",
    btnSubmitSignUp: "Create Account & Start Shock Method",
    noAccountPrompt: "Don't have an account?",
    haveAccountPrompt: "Already registered?",
    linkSignUp: "Sign Up now",
    linkSignIn: "Sign In here",
    authSuccessLogin: "Successfully signed in! Welcome back.",
    authSuccessRegister: "Account created successfully! Welcome to Shock Method.",
    authErrorLogin: "Invalid credentials. Please check your phone/password."
  }
};

// Fallback initial data in case offline or fetch delayed
const defaultTechniques = [
  {
    day: 1,
    title: "دو لیوان آب حیات‌بخش قبل از غذا",
    title_en: "Two Glasses of Water Before Main Meals",
    category: "هیدراتاسیون و هضم",
    category_en: "Hydration & Metabolic Prep",
    doctorQuote: "سلام عزیزم، به سفر تغییر سبک زندگیت خیلی خوش اومدی! اولین تکنیک ساده‌ترین اما قدرتمندترین کاره: قبل از ناهار و شام دو لیوان آب بنوش تا معده آماده هضم سالم بشه.",
    doctorQuote_en: "Welcome to your lifestyle transformation journey! Drink 2 glasses of warm water before lunch and dinner to prepare your digestion.",
    cumulativeTasks: [
      { id: "t1_water", text: "نوشیدن ۲ لیوان آب قبل از ناهار و شام", text_en: "Drink 2 glasses of water before lunch and dinner", dayAdded: 1 }
    ],
    homework: null,
    xp: 50
  },
  {
    day: 2,
    title: "تنفس مربعی؛ کنترل سیستم عصبی قبل از غذا",
    title_en: "Box Breathing: Nervous System Regulation",
    category: "تنظیم عصبی و کاهش کورتیزول",
    category_en: "Stress Relief & Cortisol Control",
    doctorQuote: "امروز قرار نیست رژیم سختی بگیری، فقط می‌خوایم مغزت رو از حالت استرس خارج کنیم. ۴ دور تنفس مربعی معجزه می‌کنه.",
    doctorQuote_en: "No rigid dieting today; 4 rounds of box breathing will bring your nervous system out of stress mode.",
    cumulativeTasks: [
      { id: "t1_water", text: "نوشیدن ۲ لیوان آب قبل از وعده اصلی", text_en: "Drink 2 glasses of water before main meals", dayAdded: 1 },
      { id: "t2_breath", text: "۴ دور تنفس مربعی قبل از شروع صرف غذا", text_en: "4 rounds of box breathing before meals", dayAdded: 2 }
    ],
    homework: null,
    xp: 60
  },
  {
    day: 3,
    title: "قانون بشقاب سبز؛ چینش فیبر و رنگ‌ها",
    title_en: "The Green Plate Method: High Fiber Layout",
    category: "ترکیب‌بندی بشقاب غذایی",
    category_en: "Plate Composition & Satiety",
    doctorQuote: "ببین قشنگم، از امروز بشقابت رو مثل یک بوم نقاشی ببین: نصف بشقاب باید سبزیجات و کاهو باشه، یک چهارم پروتئین و یک چهارم کربوهیدرات پیچیده.",
    doctorQuote_en: "Look at your plate like an art canvas: half vegetables, one-quarter lean protein, one-quarter complex carbs.",
    cumulativeTasks: [
      { id: "t1_water", text: "نوشیدن ۲ لیوان آب قبل از وعده اصلی", text_en: "Drink 2 glasses of water before meals", dayAdded: 1 },
      { id: "t2_breath", text: "۴ دور تنفس مربعی قبل از شروع صرف غذا", text_en: "4 rounds of box breathing", dayAdded: 2 },
      { id: "t3_plate", text: "چیدمان بشقاب با حداقل ۵۰ درصد سبزیجات و سالاد تازه", text_en: "50% fresh veggies and greens on plate", dayAdded: 3 }
    ],
    homework: {
      instruction: "از بشقاب ناهار یا شامت که قانون نیمه سبزیجات رو رعایت کردی عکس بگیر و در چت ارسال کن.",
      instruction_en: "Snap a photo of your lunch or dinner plate following the 50% veggies rule and send it in chat."
    },
    xp: 75
  },
  {
    day: 4,
    title: "غذا خوردن در حالت کاملاً نشسته و بدون حواس‌پرتی",
    title_en: "Mindful Seated Eating (Zero Screens)",
    category: "خوردن آگاهانه (Mindful Eating)",
    category_en: "Mindful Eating & Presence",
    doctorQuote: "سرپا غذا خوردن، جلوی تلویزیون یا با گوشی دست گرفتن بدترین دشمن وزنته! امروز تمرینمون اینه: فقط نشسته و با تمام حواس روی طعم و بافت غذا تمرکز کن.",
    doctorQuote_en: "Eating while standing or scrolling is your biggest barrier. Today: eat strictly seated without any screens.",
    cumulativeTasks: [
      { id: "t1_water", text: "نوشیدن ۲ لیوان آب قبل از وعده اصلی", text_en: "Drink 2 glasses of water before meals", dayAdded: 1 },
      { id: "t2_breath", text: "۴ دور تنفس مربعی قبل از شروع صرف غذا", text_en: "4 rounds of box breathing", dayAdded: 2 },
      { id: "t3_plate", text: "چیدمان بشقاب با حداقل ۵۰ درصد سبزیجات تازه", text_en: "50% fresh veggies on plate", dayAdded: 3 },
      { id: "t4_seated", text: "صرف غذا کاملاً در حالت نشسته و بدون نگاه به گوشی و نمایشگر", text_en: "Eat fully seated without phone/screens", dayAdded: 4 }
    ],
    homework: null,
    xp: 70
  },
  {
    day: 5,
    title: "تکلیف جدول مزایای لاغری (تکنیک شناختی CBT)",
    title_en: "CBT Advantage Card: Mental Immunity",
    category: "روانشناسی رفتار و تعهد درونی",
    category_en: "Behavioral Psychology & Commitment",
    doctorQuote: "امروز یک تمرین فوق‌العاده داریم: نوشتن کارت مزایا. باید حداقل ۵ دلیل شخصی بنویسی که چرا این رژیم برات حیاتیه، تا روزهای وسوسه بهت انگیزه بده.",
    doctorQuote_en: "Today write your personal Advantage Card with at least 5 deep reasons why reaching your ideal weight matters.",
    cumulativeTasks: [
      { id: "t1_water", text: "نوشیدن ۲ لیوان آب قبل از وعده اصلی", text_en: "Drink 2 glasses of water before meals", dayAdded: 1 },
      { id: "t2_breath", text: "۴ دور تنفس مربعی قبل از شروع صرف غذا", text_en: "4 rounds of box breathing", dayAdded: 2 },
      { id: "t3_plate", text: "چیدمان بشقاب با حداقل ۵۰ درصد سبزیجات تازه", text_en: "50% fresh veggies", dayAdded: 3 },
      { id: "t4_seated", text: "صرف غذا کاملاً در حالت نشسته و بدون حواس‌پرتی", text_en: "Eat seated without distractions", dayAdded: 4 },
      { id: "t5_card", text: "نوشتن و مرور جدول مزایای لاغری در طول روز", text_en: "Write and review your Advantage Card twice daily", dayAdded: 5 }
    ],
    homework: {
      instruction: "۳ دلیل طلایی و شخصی خودت برای لاغری رو در کادر زیر بنویس (مثلا: سبکی زانوها، پوشیدن لباس‌های دلخواه، سلامتی کبد).",
      instruction_en: "List 3 of your core reasons for weight loss (e.g. knee relief, fitting favorite clothes, reversing fatty liver)."
    },
    xp: 90
  }
];

// Initialize on Load
document.addEventListener('DOMContentLoaded', async () => {
  // Apply saved language direction and dictionary
  applyLanguage(currentLang);

  // Initialize Auth UI state
  updateAuthUi();

  // Load techniques
  try {
    const res = await fetch('data/techniques.json');
    if (res.ok) {
      techniquesData = await res.json();
    } else {
      techniquesData = defaultTechniques;
    }
  } catch (e) {
    techniquesData = defaultTechniques;
  }

  renderDaysStrip();
  loadDay(currentDay);
  startWaitingCountdown();
});

// ================= LANGUAGE TOGGLE & I18N =================
function toggleLanguage() {
  currentLang = (currentLang === 'fa') ? 'en' : 'fa';
  localStorage.setItem('shock_lang', currentLang);
  applyLanguage(currentLang);
  renderDaysStrip();
  loadDay(currentDay);
}

function applyLanguage(lang) {
  const dict = i18n[lang];
  const isRtl = (lang === 'fa');

  document.documentElement.lang = (lang === 'fa') ? 'fa-IR' : 'en-US';
  document.documentElement.dir = isRtl ? 'rtl' : 'ltr';

  // Toggle button label
  const langLabel = document.getElementById('langLabel');
  if (langLabel) langLabel.textContent = dict.langBtn;

  // Header texts
  const brandH1 = document.querySelector('.brand-text h1');
  if (brandH1) brandH1.textContent = dict.brandTitle;
  const brandP = document.querySelector('.brand-text p');
  if (brandP) brandP.textContent = dict.brandSubtitle;

  const streakCount = document.getElementById('streakCount');
  if (streakCount) streakCount.textContent = `5 ${dict.streakLabel}`;

  // Install banner
  const bannerTitle = document.querySelector('#installAppBanner div div div:first-child');
  if (bannerTitle) bannerTitle.textContent = dict.installBannerTitle;
  const bannerSub = document.querySelector('#installAppBanner div div div:last-child');
  if (bannerSub) bannerSub.textContent = dict.installBannerSub;
  const installBtn = document.getElementById('installAppBtn');
  if (installBtn) installBtn.textContent = dict.installBtn;

  // Bottom Tabs (Explicit IDs to prevent badge shift)
  const lToday = document.getElementById('navLabelToday');
  if (lToday) lToday.textContent = dict.tabToday;
  const lWaiting = document.getElementById('navLabelWaiting');
  if (lWaiting) lWaiting.textContent = dict.tabWaiting;
  const lIntake = document.getElementById('navLabelIntake');
  if (lIntake) lIntake.textContent = dict.tabIntake;
  const lFollowup = document.getElementById('navLabelFollowup');
  if (lFollowup) lFollowup.textContent = dict.tabFollowup;
  const lRewards = document.getElementById('navLabelRewards');
  if (lRewards) lRewards.textContent = dict.tabRewards;
  const lChat = document.getElementById('navLabelChat');
  if (lChat) lChat.textContent = dict.tabChat;

  // Update Auth Modal labels
  updateAuthModalLabels(dict);

  // Update Trackers
  const waterTitle = document.querySelector('.tracker-card:first-child .tracker-name');
  if (waterTitle) waterTitle.textContent = dict.waterTitle;
  const workoutTitle = document.querySelector('.tracker-card:last-child .tracker-name');
  if (workoutTitle) workoutTitle.textContent = dict.workoutTitle;

  // Update Chat
  const chatDocTitle = document.querySelector('#tab-chat div div div:first-child');
  if (chatDocTitle) chatDocTitle.textContent = dict.chatDoctorName;
  const chatDocSub = document.querySelector('#tab-chat div div div:last-child');
  if (chatDocSub) chatDocSub.textContent = dict.chatDoctorStatus;
  const chatInput = document.getElementById('chatInput');
  if (chatInput) chatInput.placeholder = dict.chatPlaceholder;
}

function updateAuthModalLabels(dict) {
  const tSignIn = document.getElementById('tabBtnSignIn');
  if (tSignIn) tSignIn.textContent = dict.tabSignIn;
  const tSignUp = document.getElementById('tabBtnSignUp');
  if (tSignUp) tSignUp.textContent = dict.tabSignUp;

  const btnSignInSubmit = document.getElementById('btnSignInSubmit');
  if (btnSignInSubmit) btnSignInSubmit.textContent = dict.btnSubmitSignIn;
  const btnSignUpSubmit = document.getElementById('btnSignUpSubmit');
  if (btnSignUpSubmit) btnSignUpSubmit.textContent = dict.btnSubmitSignUp;

  const txtNoAcc = document.getElementById('txtNoAccount');
  if (txtNoAcc) txtNoAcc.textContent = dict.noAccountPrompt;
  const lnkSignUp = document.getElementById('lnkGoSignUp');
  if (lnkSignUp) lnkSignUp.textContent = dict.linkSignUp;

  const txtHaveAcc = document.getElementById('txtHaveAccount');
  if (txtHaveAcc) txtHaveAcc.textContent = dict.haveAccountPrompt;
  const lnkSignIn = document.getElementById('lnkGoSignIn');
  if (lnkSignIn) lnkSignIn.textContent = dict.linkSignIn;
}

// ================= AUTHENTICATION (SIGN IN, SIGN UP, SIGN OUT) =================
function updateAuthUi() {
  const container = document.getElementById('userAuthContainer');
  if (!container) return;

  const dict = i18n[currentLang];

  if (currentUser) {
    container.innerHTML = `
      <div class="user-logged-chip">
        <span>👤</span>
        <span style="max-width: 80px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">${currentUser.name}</span>
        <button class="btn-signout" onclick="handleSignOut()" title="Logout / خروج">✕</button>
      </div>
    `;

    // Pre-populate intake fields with user's actual data
    if (currentUser.height) document.getElementById('userHeight').value = currentUser.height;
    if (currentUser.weight) document.getElementById('userWeight').value = currentUser.weight;
    if (currentUser.age) document.getElementById('userAge').value = currentUser.age;
    if (currentUser.target_weight) document.getElementById('userTargetWeight').value = currentUser.target_weight;
  } else {
    container.innerHTML = `
      <button class="user-auth-btn" onclick="openAuthModal('signin')">
        <span>👤</span>
        <span>${dict.authBtnSignIn}</span>
      </button>
    `;
  }
}

function openAuthModal(tab) {
  const overlay = document.getElementById('authModalOverlay');
  if (overlay) {
    overlay.classList.add('open');
    switchAuthTab(tab || 'signin');
  }
}

function closeAuthModal() {
  const overlay = document.getElementById('authModalOverlay');
  if (overlay) overlay.classList.remove('open');
  clearAuthMsg();
}

function switchAuthTab(tab) {
  clearAuthMsg();
  const dict = i18n[currentLang];
  const tabSignIn = document.getElementById('tabBtnSignIn');
  const tabSignUp = document.getElementById('tabBtnSignUp');
  const formSignIn = document.getElementById('signInForm');
  const formSignUp = document.getElementById('signUpForm');
  const title = document.getElementById('authModalTitle');

  if (tab === 'signup') {
    tabSignIn.classList.remove('active');
    tabSignUp.classList.add('active');
    formSignIn.classList.remove('active');
    formSignUp.classList.add('active');
    title.textContent = dict.authModalSignUpTitle;
  } else {
    tabSignUp.classList.remove('active');
    tabSignIn.classList.add('active');
    formSignUp.classList.remove('active');
    formSignIn.classList.add('active');
    title.textContent = dict.authModalSignInTitle;
  }
}

function showAuthMsg(msg, isError = true) {
  const el = document.getElementById('authMsg');
  el.className = isError ? 'auth-msg error' : 'auth-msg success';
  el.textContent = msg;
}

function clearAuthMsg() {
  const el = document.getElementById('authMsg');
  el.className = 'auth-msg';
  el.textContent = '';
}

// Handle Sign In (Tries server endpoint with graceful client fallback)
async function handleSignIn(e) {
  e.preventDefault();
  const identifier = document.getElementById('signInIdentifier').value.trim();
  const password = document.getElementById('signInPassword').value.trim();
  const dict = i18n[currentLang];

  try {
    const res = await fetch('/api/auth/signin', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ identifier, password })
    });

    if (res.ok) {
      const data = await res.json();
      onAuthSuccess(data.user);
      return;
    }
  } catch (err) {
    // Server offline or GitHub Pages: use client-side database
  }

  // Client-side local database fallback
  const localUsers = JSON.parse(localStorage.getItem('shock_registered_users') || '[]');
  const found = localUsers.find(u => u.identifier === identifier && u.password === password);

  if (found || (identifier === '09123456789' && password === '123456')) {
    const user = found || {
      id: 1,
      name: 'سارا محمدی',
      identifier: '09123456789',
      age: 31,
      height: 168,
      weight: 78,
      target_weight: 62
    };
    onAuthSuccess(user);
  } else {
    showAuthMsg(dict.authErrorLogin, true);
  }
}

// Handle Sign Up
async function handleSignUp(e) {
  e.preventDefault();
  const name = document.getElementById('signUpName').value.trim();
  const identifier = document.getElementById('signUpIdentifier').value.trim();
  const password = document.getElementById('signUpPassword').value.trim();
  const age = parseInt(document.getElementById('signUpAge').value) || 30;
  const height = parseFloat(document.getElementById('signUpHeight').value) || 165;
  const weight = parseFloat(document.getElementById('signUpWeight').value) || 75;
  const target_weight = parseFloat(document.getElementById('signUpTarget').value) || 60;

  const newUser = {
    id: Date.now(),
    name,
    identifier,
    password,
    age,
    height,
    weight,
    target_weight
  };

  try {
    const res = await fetch('/api/auth/signup', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newUser)
    });

    if (res.ok) {
      const data = await res.json();
      onAuthSuccess(data.user);
      return;
    }
  } catch (err) {
    // Server offline or GitHub Pages
  }

  // Save to client-side localStorage users registry
  const localUsers = JSON.parse(localStorage.getItem('shock_registered_users') || '[]');
  if (localUsers.some(u => u.identifier === identifier)) {
    showAuthMsg(currentLang === 'fa' ? 'این شماره یا ایمیل قبلاً ثبت‌نام شده است.' : 'This phone or email is already registered.', true);
    return;
  }

  localUsers.push(newUser);
  localStorage.setItem('shock_registered_users', JSON.stringify(localUsers));
  onAuthSuccess(newUser);
}

function onAuthSuccess(user) {
  currentUser = user;
  localStorage.setItem('shock_user', JSON.stringify(user));
  showAuthMsg(i18n[currentLang].authSuccessLogin, false);

  setTimeout(() => {
    closeAuthModal();
    updateAuthUi();
    triggerMockNotification('auth_done');
  }, 700);
}

function handleSignOut() {
  const confirmMsg = currentLang === 'fa' ? 'آیا مایل به خروج از حساب خود هستید؟' : 'Are you sure you want to sign out?';
  if (confirm(confirmMsg)) {
    currentUser = null;
    localStorage.removeItem('shock_user');
    updateAuthUi();
    loadDay(currentDay);
  }
}

// ================= DAY SELECTOR & HABIT STACKING =================
function renderDaysStrip() {
  const container = document.getElementById('daysStrip');
  container.innerHTML = '';
  const dict = i18n[currentLang];

  for (let i = 1; i <= 14; i++) {
    const chip = document.createElement('div');
    chip.className = `day-chip ${i === currentDay ? 'active' : ''} ${i < currentDay ? 'completed' : ''}`;
    chip.innerHTML = `
      <span class="chip-label">${dict.dayWord}</span>
      <span class="chip-num">${i}</span>
    `;
    chip.onclick = () => selectDay(i);
    container.appendChild(chip);
  }
}

function selectDay(dayNum) {
  currentDay = dayNum;
  renderDaysStrip();
  loadDay(dayNum);
}

function loadDay(dayNum) {
  const data = techniquesData.find(d => d.day === dayNum) || techniquesData[0] || defaultTechniques[0];
  const dict = i18n[currentLang];
  const isEn = (currentLang === 'en');

  // Title & Quotes
  document.getElementById('currentDayNum').textContent = data.day;
  document.getElementById('techniqueTitle').textContent = (isEn && data.title_en) ? data.title_en : data.title;
  document.getElementById('techniqueCategory').textContent = (isEn && data.category_en) ? data.category_en : data.category;
  
  const quote = (isEn && data.doctorQuote_en) ? data.doctorQuote_en : data.doctorQuote;
  document.getElementById('doctorQuote').textContent = `«${quote}»`;

  // Render Cumulative Tasks
  const taskListEl = document.getElementById('taskList');
  taskListEl.innerHTML = '';

  let completedCount = 0;
  const userPrefix = currentUser ? `user_${currentUser.id}_` : '';
  const savedChecks = JSON.parse(localStorage.getItem(`${userPrefix}day_${dayNum}_tasks`) || '{}');

  data.cumulativeTasks.forEach(task => {
    const isChecked = !!savedChecks[task.id];
    if (isChecked) completedCount++;

    const taskText = (isEn && task.text_en) ? task.text_en : task.text;

    const item = document.createElement('div');
    item.className = `task-item ${isChecked ? 'checked' : ''}`;
    item.innerHTML = `
      <div class="task-checkbox">${isChecked ? '✓' : ''}</div>
      <div class="task-content">
        <div class="task-label">${taskText}</div>
        <div class="task-sub">${dict.taskIntroduced} ${task.dayAdded} • ${dict.taskDaily}</div>
      </div>
    `;
    item.onclick = () => toggleTask(dayNum, task.id);
    taskListEl.appendChild(item);
  });

  document.getElementById('completedTasksRatio').textContent = `${completedCount} ${dict.techniqueOf90} ${data.cumulativeTasks.length} ${dict.tasksCompleted}`;

  // Render Homework
  const homeworkCard = document.getElementById('homeworkCard');
  if (data.homework) {
    homeworkCard.style.display = 'block';
    const hwText = (isEn && data.homework.instruction_en) ? data.homework.instruction_en : data.homework.instruction;
    document.getElementById('homeworkInstruction').textContent = hwText;
  } else {
    homeworkCard.style.display = 'none';
  }
}

function toggleTask(dayNum, taskId) {
  const userPrefix = currentUser ? `user_${currentUser.id}_` : '';
  const savedChecks = JSON.parse(localStorage.getItem(`${userPrefix}day_${dayNum}_tasks`) || '{}');
  savedChecks[taskId] = !savedChecks[taskId];
  localStorage.setItem(`${userPrefix}day_${dayNum}_tasks`, JSON.stringify(savedChecks));

  loadDay(dayNum);

  if (savedChecks[taskId]) {
    userXp += 15;
    document.getElementById('userTotalXp').textContent = userXp;
    triggerMockNotification('task_done');
  }
}

// Audio Player Simulation
function toggleAudio() {
  const btn = document.getElementById('playBtn');
  const card = document.getElementById('audioCard');
  const timeEl = document.getElementById('audioTime');

  if (isAudioPlaying) {
    isAudioPlaying = false;
    btn.textContent = '▶';
    card.classList.remove('playing');
    clearInterval(audioInterval);
  } else {
    isAudioPlaying = true;
    btn.textContent = '⏸';
    card.classList.add('playing');

    let seconds = 0;
    audioInterval = setInterval(() => {
      seconds++;
      const mins = Math.floor(seconds / 60);
      const secs = seconds % 60;
      timeEl.textContent = `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
      if (seconds >= 85) {
        toggleAudio();
        timeEl.textContent = '01:25';
      }
    }, 1000);
  }
}

// Trackers
let waterGlasses = 3;
function addWater() {
  if (waterGlasses < 8) {
    waterGlasses++;
    updateWaterUi();
  }
}

function setWater(num) {
  waterGlasses = num;
  updateWaterUi();
}

function updateWaterUi() {
  document.getElementById('waterCount').textContent = waterGlasses;
  const icons = document.querySelectorAll('.water-glasses .glass-icon');
  icons.forEach((icon, idx) => {
    if (idx < waterGlasses) {
      icon.classList.add('filled');
    } else {
      icon.classList.remove('filled');
    }
  });
}

let workoutMins = 20;
function addWorkout(delta) {
  workoutMins = Math.min(30, workoutMins + delta);
  document.getElementById('workoutMins').textContent = workoutMins;
  document.getElementById('workoutProgressBar').style.width = `${(workoutMins / 30) * 100}%`;
}

// Waiting Room Countdown
function startWaitingCountdown() {
  const clock = document.getElementById('countdownClock');
  if (!clock) return;
  setInterval(() => {
    if (countdownSeconds > 0) {
      countdownSeconds--;
      const h = Math.floor(countdownSeconds / 3600);
      const m = Math.floor((countdownSeconds % 3600) / 60);
      const s = countdownSeconds % 60;
      clock.textContent = `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
    }
  }, 1000);
}

function simulateDoctorApproval() {
  const msg = currentLang === 'fa' 
    ? '🎉 تبریک! رژیم اختصاصی و برنامه ورزشی شما توسط خانم دکتر با موفقیت تایید و در پنل بارگذاری شد.'
    : '🎉 Congratulations! Your personalized diet and workout program was approved by Dr. Madis and is now live.';
  alert(msg);
  switchTab('tab-today', document.querySelectorAll('.nav-item')[0]);
}

// Switch Tabs
function switchTab(tabId, btn) {
  document.querySelectorAll('.tab-pane').forEach(el => el.classList.remove('active'));
  document.querySelectorAll('.nav-item').forEach(el => el.classList.remove('active'));

  const target = document.getElementById(tabId);
  if (target) target.classList.add('active');
  if (btn) btn.classList.add('active');
}

// Notifications Simulator
function triggerMockNotification(type) {
  const toast = document.getElementById('notifToast');
  const icon = document.getElementById('notifIcon');
  const title = document.getElementById('notifTitle');
  const body = document.getElementById('notifBody');
  const isFa = (currentLang === 'fa');

  if (type === 'water') {
    icon.textContent = '💧';
    title.textContent = isFa ? 'یادآور آب و هیدراتاسیون' : 'Hydration Reminder';
    body.textContent = isFa ? 'سلام عزیزم! ۱۵ دقیقه تا ناهار مونده، ۲ لیوان آب ولرم یادت نره.' : '15 mins before lunch! Remember your 2 glasses of warm water.';
  } else if (type === 'breath') {
    icon.textContent = '🧘‍♀️';
    title.textContent = isFa ? 'تکنیک تنفس مربعی' : 'Box Breathing Prompt';
    body.textContent = isFa ? 'قبل از شروع غذا، ۴ دور تنفس مربعی برای کاهش کورتیزول انجام بده.' : 'Perform 4 cycles of box breathing to lower mealtime cortisol.';
  } else if (type === 'workout') {
    icon.textContent = '👟';
    title.textContent = isFa ? 'وقت پیاده‌روی شاداب' : 'Walking Milestone';
    body.textContent = isFa ? '۲۰ دقیقه پیاده‌روی امروزت رو ثبت کردی؟ هر قدم تو رو نزدیک‌تر می‌کنه!' : 'Have you logged your 20-min brisk walk? Every step counts!';
  } else if (type === 'cbt') {
    icon.textContent = '📝';
    title.textContent = isFa ? 'کارت مزایای لاغری' : 'Advantage Card Prompt';
    body.textContent = isFa ? 'اگه الان هوس ریزه‌خواری داری، سریع کارت مزایایی که نوشتی رو بخون.' : 'Craving a snack? Open your Advantage Card and read your top reasons.';
  } else if (type === 'auth_done') {
    icon.textContent = '⚡';
    title.textContent = isFa ? 'ورود موفق' : 'Welcome!';
    body.textContent = isFa ? `خوش آمدید ${currentUser ? currentUser.name : ''}` : `Welcome back ${currentUser ? currentUser.name : ''}`;
  } else {
    icon.textContent = '🌟';
    title.textContent = isFa ? 'آفرین به اراده‌ت!' : 'Awesome work!';
    body.textContent = isFa ? 'تسک امروز ثبت شد و ۱۵ امتیاز دریافت کردی.' : 'Task logged! +15 energy XP added to your score.';
  }

  toast.classList.add('show');
  clearTimeout(window.notifTimeout);
  window.notifTimeout = setTimeout(() => {
    toast.classList.remove('show');
  }, 4000);
}

function dismissNotification() {
  const toast = document.getElementById('notifToast');
  if (toast) toast.classList.remove('show');
}

// Intake Form & 360 Photos
function handleBloodTestUpload(event) {
  const file = event.target.files[0];
  if (file) {
    const isFa = (currentLang === 'fa');
    document.getElementById('bloodTestFilename').textContent = `${isFa ? 'فایل بارگذاری شد' : 'Uploaded'}: ${file.name}`;
    alert(isFa ? `فایل آزمایش (${file.name}) با موفقیت پیوست شد.` : `Lab file (${file.name}) uploaded successfully.`);
  }
}

function selectAnglePhoto(angle) {
  const input = document.createElement('input');
  input.type = 'file';
  input.accept = 'image/*';
  input.onchange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const previewEl = document.getElementById(`preview-${angle}`);
        previewEl.innerHTML = `<img src="${event.target.result}" style="width:100%;height:100%;object-fit:cover;">`;
      };
      reader.readAsDataURL(file);
    }
  };
  input.click();
}

function saveIntake(e) {
  e.preventDefault();
  const isFa = (currentLang === 'fa');
  alert(isFa ? 'اطلاعات سلامت، آزمایش خون و تصاویر زاویه‌ای شما برای بررسی خانم دکتر ذخیره شد.' : 'Health data, lab reports, and 360 photos saved for Dr. Madis.');
  switchTab('tab-waiting', document.querySelectorAll('.nav-item')[1]);
}

function submitHomework() {
  const val = document.getElementById('homeworkInput').value;
  const isFa = (currentLang === 'fa');
  if (!val.trim()) {
    alert(isFa ? 'لطفاً گزارش خود را بنویسید.' : 'Please enter your reflection before submitting.');
    return;
  }
  alert(isFa ? 'تکلیف با موفقیت به پرونده شما افزوده شد.' : 'Homework submitted to your dossier successfully.');
  document.getElementById('homeworkInput').value = '';
}

// Chat
function handleChatEnter(e) {
  if (e.key === 'Enter') sendChatMessage();
}

function sendChatMessage() {
  const input = document.getElementById('chatInput');
  const text = input.value.trim();
  if (!text) return;

  const chatContainer = document.getElementById('chatMessages');

  // User Bubble
  const userBubble = document.createElement('div');
  userBubble.className = 'chat-bubble user';
  userBubble.textContent = text;
  chatContainer.appendChild(userBubble);
  input.value = '';
  chatContainer.scrollTop = chatContainer.scrollHeight;

  // Coach Auto-reply
  setTimeout(() => {
    const doctorBubble = document.createElement('div');
    doctorBubble.className = 'chat-bubble doctor';
    const isFa = (currentLang === 'fa');
    
    if (text.includes('آب') || text.toLowerCase().includes('water')) {
      doctorBubble.textContent = isFa 
        ? 'آفرین! حتماً بطری آب رو همراهت داشته باش. هر لیوان آبی که می‌نوشی، سوخت تمیز برای کبد و چربی‌سوزیه 💧'
        : 'Keep that water bottle right by your side! Hydration accelerates metabolic lipid clearance 💧';
    } else if (text.includes('وزن') || text.toLowerCase().includes('weight')) {
      doctorBubble.textContent = isFa 
        ? 'اصلاً نگران نوسان‌های روزانه وزن نباش! احتباس آب و هورمون‌ها طبیعیه. مهم تداوم تکنیک‌هاست ❤️'
        : 'Daily weight fluctuations are completely normal due to water retention. Focus on habit consistency ❤️';
    } else {
      doctorBubble.textContent = isFa 
        ? 'پیامت رو ثبت کردم عزیزم. خانم دکتر در بررسی پرونده هفتگی این مورد رو لحاظ می‌کنند. پرقدرت ادامه بده!'
        : 'Note received! Dr. Madis will review this in your weekly case analysis. Keep up the great work!';
    }

    chatContainer.appendChild(doctorBubble);
    chatContainer.scrollTop = chatContainer.scrollHeight;
  }, 1000);
}

// Splash Screen Auto Dismiss
function dismissSplash() {
  const splash = document.getElementById('splashScreen');
  if (splash) {
    splash.classList.add('fade-out');
    setTimeout(() => {
      splash.style.display = 'none';
    }, 500);
  }
}

window.addEventListener('DOMContentLoaded', () => {
  setTimeout(dismissSplash, 1800);
});

// PWA Install Prompt
let deferredPrompt;
window.addEventListener('beforeinstallprompt', (e) => {
  e.preventDefault();
  deferredPrompt = e;
  const banner = document.getElementById('installAppBanner');
  if (banner) {
    banner.style.display = 'flex';
    document.getElementById('installAppBtn').onclick = async () => {
      banner.style.display = 'none';
      deferredPrompt.prompt();
      deferredPrompt = null;
    };
  }
});
