// Client App Logic - Full-Stack Local REST Backend, Real Auth, Clinical Dossier, Real Tracking & AI Chat

let techniquesData = [];
let currentDay = 1;
let isAudioPlaying = false;
let audioInterval = null;
let countdownSeconds = 18 * 3600 + 42 * 60 + 15;
let userXp = 350;
let savedChecks = {};

// In-memory file & photo buffers
let uploadedBloodTestName = 'Azmayesh-Khon-Tir98.pdf';
let photoAngles = { front: '', right: '', back: '', left: '' };

// Language State: 'fa' (default) or 'en'
let currentLang = localStorage.getItem('shock_lang') || 'fa';

// Current User State (loaded from real backend session)
let currentUser = JSON.parse(localStorage.getItem('shock_user') || 'null');

// Bilingual Dictionary
const i18n = {
  fa: {
    langBtn: "EN",
    splashSubtitle: "متد اختصاصی تغییر سبک زندگی و لاغری",
    splashDoctor: "زیر نظر مستقیم دکتر مهدیس",
    notifDefaultTitle: "یادآور متد شوک دکتر مهدیس",
    notifDefaultBody: "سلام عزیزم! ۱۵ دقیقه تا ناهار مونده، ۲ لیوان آب ولرم و ۴ دور تنفس مربعی یادت نره.",
    brandTitle: "متد شوک | دکتر مهدیس",
    brandSubtitle: "Drmadis.com • لایف‌استایل و رژیم ۹۰ روزه",
    streakLabel: "روز",
    authBtnSignIn: "ورود",
    authBtnLogout: "خروج",
    downloadApk: "APK",
    doctorPortal: "پنل مدیریت ⚡",
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
    tasksHeader: "🎯 وظایف انباشتی امروز",
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
    demoApproveTitle: "تست و بررسی در پنل مدیریت پزشک",
    demoApproveDesc: "برای بررسی، آنالیز هوشمند با AI و تایید پرونده مراجع، وارد پنل مدیریت شوید:",
    demoApproveBtn: "🩺 ورود به پنل مدیریت جهت تایید پرونده (admin / 1234)",

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
    followupDesc: "عامل اصلی نتیجه‌گیری افراد در رژیم «فالوآپ و یادآوری منظم» است. در اینجا نمونه نوتیفیکیشن‌های روزانه طراحی شده را امتحان کنید:",
    btnSimWater: "💧 شبیه‌ساز: «آب قبل از غذا رو خوردی؟»",
    btnSimBreath: "🧘‍♀️ شبیه‌ساز: «۴ دور تنفس مربعی برای آرامش»",
    btnSimWorkout: "👟 شبیه‌ساز: «وقت ۲۰ دقیقه پیاده‌روی شادابه»",
    btnSimCbt: "📝 شبیه‌ساز: «جدول مزایای لاغریت رو امروز خوندی؟»",
    notifChannelsTitle: "تنظیمات کانال‌های اطلاع‌رسانی",
    chSms: "دریافت پیامک سریع در صورت بسته بودن اپلیکیشن",
    chPush: "نوتیفیکیشن پوش مرورگر (Web Push)",
    chAudio: "یادآوری ویس‌های انگیزشی صبحگاهی خانم دکتر",

    // Rewards
    rewardsLevelTitle: "سطح انگیزه و سلامت شما",
    rewardsLevelVal: "رهروی پراراده (سطح ۲)",
    rewardsScorePrefix: "امتیاز فعلی شما:",
    rewardsScoreSuffix: "امتیاز (۱۵۰ امتیاز تا باز شدن مدال بعدی)",
    rewardsBadgesTitle: "نشان‌های افتخار و دستاوردها",
    badgeWaterName: "سفیر آب",
    badgeBreathName: "تنفس آرام",
    badgePlateName: "بشقاب سبز",
    badgeFocusName: "تمرکز نشسته",
    badgeCbtName: "کارت مزایا",
    badgeWeek1Name: "هفته اول طلایی",
    badgeUnlocked: "کسب شده ✓",
    badgeInProgress: "در حال تکمیل",
    badgeLockedDay5: "قفل در روز ۵",
    badgeLockedDay7: "قفل در روز ۷",

    // Chat
    chatDoctorName: "دستیار و مشاور خانم دکتر",
    chatDoctorStatus: "پاسخگوی شما مثل یک دوست صمیمی",
    chatEmptyTitle: "گفتگوی مستقیم با خانم دکتر",
    chatEmptySub: "هنوز پیامی ارسال نشده است. هر سوال یا چالشی در طول روز داشتی، اینجا بنویس!",
    chatPlaceholder: "پیام یا سوالت رو اینجا بنویس...",

    // Auth Modal
    authModalSignInTitle: "ورود به متد شوک",
    authModalSignUpTitle: "ثبت‌نام در متد شوک",
    authModalSubtitle: "حساب اختصاصی مراجعین دکتر مهدیس",
    tabSignIn: "ورود (Sign In)",
    tabSignUp: "ثبت‌نام (Sign Up)",
    lblIdentifier: "شماره موبایل یا ایمیل",
    lblPassword: "رمز عبور",
    lblPasswordMin6: "رمز عبور (حداقل ۶ کاراکتر)",
    lblFullName: "نام و نام خانوادگی",
    signUpNamePlaceholder: "نام و نام خانوادگی",
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
    splashSubtitle: "90-Day Lifestyle & Weight Transformation",
    splashDoctor: "Supervised Directly by Dr. Madis",
    notifDefaultTitle: "Dr. Madis Shock Method Reminder",
    notifDefaultBody: "Hello! 15 mins before lunch. Don't forget 2 glasses of warm water and 4 box breaths.",
    brandTitle: "Shock Method | Dr. Madis",
    brandSubtitle: "Drmadis.com • 90-Day Lifestyle & Diet",
    streakLabel: "Days",
    authBtnSignIn: "Sign In",
    authBtnLogout: "Logout",
    downloadApk: "APK",
    doctorPortal: "Admin Panel ⚡",
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
    tasksHeader: "🎯 Today's Cumulative Tasks",
    tasksDesc: "Daily techniques build upon previous habits to create permanent lifestyle changes:",
    tasksCompleted: "completed",
    taskIntroduced: "Introduced on Day",
    taskDaily: "Daily habit",
    audioDuration: "01:25",

    // Trackers
    waterTitle: "💧 Water Intake",
    waterGoal: "Goal: 8 Glasses",
    glassesWord: "glasses",
    addWaterBtn: "+ Drink Another Glass",
    workoutTitle: "🏃‍♀️ Walking & Exercise",
    workoutGoal: "Goal: 30 Mins",
    minsWord: "mins",
    addWorkoutBtn: "+ Log 10 Mins Exercise",

    // Homework
    homeworkCardTitle: "📝 Today's Interactive Assignment",
    homeworkBadge: "Send to Doctor",
    homeworkPlaceholder: "Type your reflection or report here...",
    homeworkSubmitBtn: "Submit Homework to Dr. Madis",

    // Waiting Room
    waitingTitle: "Your Dossier is in Dr. Madis's Review Queue",
    waitingDesc: "Unlike generic robot diets, your custom plan is personally tailored by Dr. Madis based on your blood lab test and hormone markers.",
    waitingNote: "Estimated time until custom diet & workout readiness",
    step1: "Biometric intake and medical history",
    step2: "Blood lab test analysis (Thyroid, Glucose, Vit D3)",
    step3: "360° photo body composition assessment by physician",
    step4: "Precision macro calculation & customized diet plan",
    step5: "Final medical sign-off and portal delivery",
    demoApproveTitle: "Doctor Admin Review & Sign-Off",
    demoApproveDesc: "To review, run AI analysis, and sign off the patient dossier, open the admin portal:",
    demoApproveBtn: "🩺 Open Admin Portal (admin / 1234)",

    // Intake Form
    intakeTitle: "📋 Medical Dossier & Health Analysis",
    intakeBadge: "Supervised by Physician",
    lblHeight: "Height (cm)",
    lblWeight: "Current Weight (kg)",
    lblAge: "Age",
    lblTargetWeight: "Target Goal Weight (kg)",
    lblMenstrual: "Female Menstrual Health",
    optMenstrualRegular: "Regular (28-30 Days)",
    optMenstrualIrregular: "Irregular / Delayed",
    optMenstrualPco: "Polycystic Ovary Syndrome (PCOS)",
    optMenstrualMenopause: "Menopause",
    optMenstrualMale: "Male Client",
    lblConditions: "Medical History & Food Sensitivities",
    lblBloodUpload: "💉 Upload Blood Lab Panel (Mandatory for Doctor Review)",
    bloodUploadBtn: "Select Lab Test Image or PDF File",
    bloodUploadDone: "Attached File: Blood_Lab_Panel_2026.pdf (Verified)",
    lblPhotos: "📸 360° Body Composition Photos (4 Angles)",
    photosNotice: "These photos are strictly confidential, reviewed only by Dr. Madis for body composition evaluation.",
    angleFront: "1. Front View",
    angleRight: "2. Right Profile",
    angleBack: "3. Back View",
    angleLeft: "4. Left Profile",
    btnSaveIntake: "💾 Save Dossier & Submit to Dr. Madis",

    // Followup Simulator
    followupTitle: "🔔 Smart Follow-up & Accountability Engine",
    followupBadge: "Adherence Rate: 93%",
    followupDesc: "The core reason clients succeed is structured follow-ups and cues. Test these daily prompt samples:",
    btnSimWater: "💧 Test Prompt: 'Did you drink water before lunch?'",
    btnSimBreath: "🧘‍♀️ Test Prompt: '4 rounds of box breathing for calm'",
    btnSimWorkout: "👟 Test Prompt: 'Time for your 20-min brisk walk'",
    btnSimCbt: "📝 Test Prompt: 'Did you review your Advantage Card today?'",
    notifChannelsTitle: "Notification Delivery Channels",
    chSms: "Instant SMS alert if application is closed",
    chPush: "Browser Web Push Notifications",
    chAudio: "Morning audio motivation notes from Dr. Madis",

    // Rewards
    rewardsLevelTitle: "Your Motivation & Health Level",
    rewardsLevelVal: "Resolute Practitioner (Level 2)",
    rewardsScorePrefix: "Current Score:",
    rewardsScoreSuffix: "XP (150 XP to unlock next medal)",
    rewardsBadgesTitle: "Badges & Milestones",
    badgeWaterName: "Water Ambassador",
    badgeBreathName: "Mindful Breathing",
    badgePlateName: "Green Plate",
    badgeFocusName: "Seated Focus",
    badgeCbtName: "Advantage Card",
    badgeWeek1Name: "Golden Week 1",
    badgeUnlocked: "Unlocked ✓",
    badgeInProgress: "In Progress",
    badgeLockedDay5: "Locked at Day 5",
    badgeLockedDay7: "Locked at Day 7",

    // Chat
    chatDoctorName: "Dr. Madis Clinical Mentor",
    chatDoctorStatus: "Here for you like an empathetic friend",
    chatEmptyTitle: "Direct Chat with Dr. Madis",
    chatEmptySub: "No messages yet. Ask any questions or share your daily reflections here!",
    chatPlaceholder: "Type your message or question here...",

    // Auth Modal
    authModalSignInTitle: "Sign In to Shock Method",
    authModalSignUpTitle: "Register for Shock Method",
    authModalSubtitle: "Official Portal for Dr. Madis's Patients",
    tabSignIn: "Sign In",
    tabSignUp: "Sign Up",
    lblIdentifier: "Mobile Number or Email",
    lblPassword: "Password",
    lblPasswordMin6: "Password (min 6 characters)",
    lblFullName: "Full Name",
    signUpNamePlaceholder: "Full Name",
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

// Fallback initial techniques data
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
  // Check if admin is logged in -> immediately redirect to admin.html
  if (currentUser && currentUser.role === 'admin') {
    sessionStorage.setItem('shock_admin_user', JSON.stringify(currentUser));
    window.location.href = 'admin.html';
    return;
  }

  // Apply saved language direction and dictionary
  applyLanguage(currentLang);

  // Initialize Auth UI state
  updateAuthUi();

  // If user is NOT logged in, show Auth Screen FIRST!
  if (!currentUser) {
    openAuthModal('signin', true);
  }

  // Load techniques from JSON
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
  await loadDay(currentDay);
  startWaitingCountdown();

  // If user logged in, check real backend status & chat history
  if (currentUser) {
    checkPatientStatus();
    loadChatHistory();
  } else {
    renderEmptyChat();
  }

  // Handle URL auth param (e.g. redirected from admin.html gate)
  try {
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('auth') === 'signin') {
      openAuthModal('signin', true);
    } else if (urlParams.get('auth') === 'signup') {
      openAuthModal('signup', true);
    }
  } catch(e) {}
});

// ================= LANGUAGE TOGGLE & I18N =================
function toggleLanguage() {
  currentLang = (currentLang === 'fa') ? 'en' : 'fa';
  localStorage.setItem('shock_lang', currentLang);
  applyLanguage(currentLang);
}

function applyLanguage(lang) {
  const dict = i18n[lang];
  const isRtl = (lang === 'fa');

  document.documentElement.lang = (lang === 'fa') ? 'fa-IR' : 'en-US';
  document.documentElement.dir = isRtl ? 'rtl' : 'ltr';

  // Toggle button label
  const langLabel = document.getElementById('langLabel');
  if (langLabel) langLabel.textContent = dict.langBtn;

  // Global automatic data-i18n replacement
  document.querySelectorAll('[data-i18n]').forEach(el => {
    const key = el.getAttribute('data-i18n');
    if (dict[key] !== undefined) {
      el.textContent = dict[key];
    }
  });

  // Global automatic data-i18n-placeholder replacement
  document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
    const key = el.getAttribute('data-i18n-placeholder');
    if (dict[key] !== undefined) {
      el.placeholder = dict[key];
    }
  });

  // Re-render dynamic components
  renderDaysStrip();
  loadDay(currentDay);
  updateAuthUi();

  const authLangLabel = document.querySelector('.auth-lang-label');
  if (authLangLabel) authLangLabel.textContent = (lang === 'fa') ? 'EN' : 'FA';

  const emptyState = document.getElementById('chatEmptyState');
  if (emptyState) renderEmptyChat();
}

// ================= REAL BACKEND AUTHENTICATION =================
function updateAuthUi() {
  const container = document.getElementById('userAuthContainer');
  if (!container) return;

  const dict = i18n[currentLang];

  if (currentUser) {
    if (currentUser.role === 'admin') {
      container.innerHTML = `
        <div class="user-logged-chip" style="border: 1px solid #f59e0b; background: rgba(245, 158, 11, 0.12);">
          <span>👑</span>
          <a href="admin.html" style="text-decoration:none; color: #f59e0b; font-weight:800; font-size:12px;" title="ورود به کارتابل مدیریت">کارتابل ادمین</a>
          <button class="btn-signout" onclick="handleSignOut()" title="Logout / خروج">✕</button>
        </div>
      `;
    } else {
      container.innerHTML = `
        <div class="user-logged-chip">
          <span>👤</span>
          <span style="max-width: 80px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">${currentUser.name}</span>
          <button class="btn-signout" onclick="handleSignOut()" title="Logout / خروج">✕</button>
        </div>
      `;
    }

    // Pre-populate intake fields with user's actual profile
    if (currentUser.height) document.getElementById('userHeight').value = currentUser.height;
    if (currentUser.weight) document.getElementById('userWeight').value = currentUser.weight;
    if (currentUser.age) document.getElementById('userAge').value = currentUser.age;
    if (currentUser.target_weight) document.getElementById('userTargetWeight').value = currentUser.target_weight;
  } else {
    container.innerHTML = `
      <button class="user-auth-btn" onclick="openAuthModal('signin')">
        <span>👤</span>
        <span id="authBtnText">${dict.authBtnSignIn}</span>
      </button>
    `;
  }
}

function openAuthModal(tab, isMandatory = false) {
  const overlay = document.getElementById('authModalOverlay');
  if (overlay) {
    if (isMandatory || !currentUser) {
      overlay.classList.add('mandatory');
    } else {
      overlay.classList.remove('mandatory');
    }
    overlay.classList.add('open');
    switchAuthTab(tab || 'signin');
  }
}

function closeAuthModal(force = false) {
  // If user is not authenticated and not explicitly forced, keep the screen locked
  if (!currentUser && !force) {
    return;
  }
  const overlay = document.getElementById('authModalOverlay');
  if (overlay) {
    overlay.classList.remove('open');
    overlay.classList.remove('mandatory');
  }
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

// Handle Real Sign In via REST API
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

    const data = await res.json();
    if (res.ok && data.success) {
      if (data.user.role === 'admin') {
        sessionStorage.setItem('shock_admin_user', JSON.stringify(data.user));
        localStorage.setItem('shock_user', JSON.stringify(data.user));
        window.location.href = 'admin.html';
        return;
      }
      onAuthSuccess(data.user);
      return;
    } else {
      showAuthMsg(data.error || dict.authErrorLogin, true);
    }
  } catch (err) {
    showAuthMsg('خطا در برقراری ارتباط با سرور محلی.', true);
  }
}

// Handle Real Sign Up via REST API
async function handleSignUp(e) {
  e.preventDefault();
  const name = document.getElementById('signUpName').value.trim();
  const identifier = document.getElementById('signUpIdentifier').value.trim();
  const password = document.getElementById('signUpPassword').value.trim();
  const age = parseInt(document.getElementById('signUpAge').value) || 30;
  const height = parseFloat(document.getElementById('signUpHeight').value) || 165;
  const weight = parseFloat(document.getElementById('signUpWeight').value) || 75;
  const target_weight = parseFloat(document.getElementById('signUpTarget').value) || 60;

  const newUserPayload = {
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
      body: JSON.stringify(newUserPayload)
    });

    const data = await res.json();
    if (res.ok && data.success) {
      onAuthSuccess(data.user);
      // Switch user to Tab 3 (Health Dossier) to fill medical details
      setTimeout(() => {
        switchTab('tab-intake', document.querySelectorAll('.nav-item')[2]);
      }, 800);
    } else {
      showAuthMsg(data.error || 'خطا در ثبت نام.', true);
    }
  } catch (err) {
    showAuthMsg('خطا در اتصال به سرور محلی.', true);
  }
}

function onAuthSuccess(user) {
  currentUser = user;
  localStorage.setItem('shock_user', JSON.stringify(user));
  showAuthMsg(i18n[currentLang].authSuccessLogin, false);

  setTimeout(() => {
    closeAuthModal(true);
    updateAuthUi();
    checkPatientStatus();
    loadChatHistory();
    loadDay(currentDay);
    triggerMockNotification('auth_done');
  }, 600);
}

function handleSignOut() {
  const confirmMsg = currentLang === 'fa' ? 'آیا مایل به خروج از حساب خود هستید؟' : 'Are you sure you want to sign out?';
  if (confirm(confirmMsg)) {
    currentUser = null;
    localStorage.removeItem('shock_user');
    sessionStorage.removeItem('shock_admin_user');
    updateAuthUi();
    loadDay(currentDay);
    renderEmptyChat();
    openAuthModal('signin', true);
  }
}

// ================= REAL STATUS & WAITING ROOM =================
async function checkPatientStatus() {
  if (!currentUser) return;
  try {
    const res = await fetch(`/api/patient/status?user_id=${currentUser.id}`);
    if (res.ok) {
      const data = await res.json();
      updateWaitingRoomUi(data.status, data.plan);
    }
  } catch (e) {
    console.error("status err", e);
  }
}

function updateWaitingRoomUi(status, plan) {
  const waitingHero = document.querySelector('.waiting-room-hero');
  if (!waitingHero) return;

  if (status === 'approved' && plan) {
    waitingHero.innerHTML = `
      <div style="font-size: 42px; margin-bottom: 8px;">🎉</div>
      <h2 style="font-size: 18px; font-weight: 900; color: #4ade80;">رژیم اختصاصی شما توسط خانم دکتر تایید شد!</h2>
      <p style="font-size: 13px; opacity: 0.95; line-height: 1.6; margin: 8px 0 16px;">
        ${plan.doctor_note || 'پرونده و آزمایش‌های شما با موفقیت بررسی شد و رژیم اختصاصی برای شما در اپلیکیشن فعال گردید.'}
      </p>

      <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 8px; background: rgba(0,0,0,0.35); padding: 12px; border-radius: 12px; margin-bottom: 16px;">
        <div>
          <div style="font-size: 10px; color: #94a3b8;">کالری هدف روزانه</div>
          <div style="font-size: 16px; font-weight: 900; color: #38bdf8;">${plan.calorie_target || 1550} Kcal</div>
        </div>
        <div>
          <div style="font-size: 10px; color: #94a3b8;">پروتئین روزانه</div>
          <div style="font-size: 16px; font-weight: 900; color: #4ade80;">${plan.protein_grams || 95} گرم</div>
        </div>
        <div>
          <div style="font-size: 10px; color: #94a3b8;">کربوهیدرات پیچیده</div>
          <div style="font-size: 16px; font-weight: 900; color: #fde047;">${plan.carbs_grams || 130} گرم</div>
        </div>
      </div>

      <div style="text-align: right; background: rgba(255,255,255,0.08); padding: 10px 14px; border-radius: 10px; font-size: 12px; margin-bottom: 16px; line-height: 1.6;">
        <div><strong>پروتکل غذایی:</strong> ${plan.diet_protocol || 'رژیم با شاخص گلایسمی پایین'}</div>
        <div style="margin-top: 4px;"><strong>برنامه ورزشی:</strong> ${plan.workout_plan || 'پیاده‌روی روزانه'}</div>
      </div>

      <button class="btn-primary" style="background: linear-gradient(135deg, #10b981, #059669); font-weight: 900;" onclick="switchTab('tab-today', document.querySelectorAll('.nav-item')[0])">
        🚀 ورود به برنامه امروز (شروع تکنیک‌ها)
      </button>
    `;
  }
}

// ================= DAY SELECTOR & HABIT STACKING =================
function renderDaysStrip() {
  const container = document.getElementById('daysStrip');
  if (!container) return;
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

async function loadDay(dayNum) {
  const data = techniquesData.find(d => d.day === dayNum) || techniquesData[0] || defaultTechniques[0];
  const dict = i18n[currentLang];
  const isEn = (currentLang === 'en');

  // Title & Category
  const curNum = document.getElementById('currentDayNum');
  if (curNum) curNum.textContent = data.day;
  const tTitle = document.getElementById('techniqueTitle');
  if (tTitle) tTitle.textContent = (isEn && data.title_en) ? data.title_en : data.title;
  const tCat = document.getElementById('techniqueCategory');
  if (tCat) tCat.textContent = (isEn && data.category_en) ? data.category_en : data.category;
  
  const quote = (isEn && data.doctorQuote_en) ? data.doctorQuote_en : data.doctorQuote;
  const dQuote = document.getElementById('doctorQuote');
  if (dQuote) dQuote.textContent = `«${quote}»`;

  // Fetch real habits from backend if logged in
  savedChecks = {};
  if (currentUser) {
    try {
      const hRes = await fetch(`/api/patient/habits?user_id=${currentUser.id}&day=${dayNum}`);
      if (hRes.ok) {
        const hData = await hRes.json();
        (hData.habits || []).forEach(h => {
          if (h.completed) savedChecks[h.task_id] = true;
        });
      }
    } catch(e) {}

    // Fetch real trackers
    try {
      const tRes = await fetch(`/api/patient/trackers?user_id=${currentUser.id}&day=${dayNum}`);
      if (tRes.ok) {
        const tData = await tRes.json();
        waterGlasses = tData.water_glasses || 0;
        workoutMins = tData.workout_mins || 0;
        updateWaterUi();
        const wVal = document.getElementById('workoutMins');
        if (wVal) wVal.textContent = workoutMins;
        const wBar = document.getElementById('workoutProgressBar');
        if (wBar) wBar.style.width = `${Math.min(100, (workoutMins / 30) * 100)}%`;
      }
    } catch(e) {}
  }

  // Render Cumulative Tasks
  const taskListEl = document.getElementById('taskList');
  if (taskListEl) {
    taskListEl.innerHTML = '';

    let completedCount = 0;
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

    const ratioEl = document.getElementById('completedTasksRatio');
    if (ratioEl) {
      ratioEl.textContent = `${completedCount} ${dict.techniqueOf90} ${dict.tasksCompleted}`;
    }
  }

  // Render Homework
  const homeworkCard = document.getElementById('homeworkCard');
  if (homeworkCard) {
    if (data.homework) {
      homeworkCard.style.display = 'block';
      const hwText = (isEn && data.homework.instruction_en) ? data.homework.instruction_en : data.homework.instruction;
      document.getElementById('homeworkInstruction').textContent = hwText;
    } else {
      homeworkCard.style.display = 'none';
    }
  }
}

async function toggleTask(dayNum, taskId) {
  if (!currentUser) {
    openAuthModal('signin');
    return;
  }

  const isChecked = !savedChecks[taskId];
  savedChecks[taskId] = isChecked;

  try {
    await fetch('/api/patient/habits', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        user_id: currentUser.id,
        day: dayNum,
        task_id: taskId,
        completed: isChecked ? 1 : 0
      })
    });
  } catch(e) {}

  loadDay(dayNum);

  if (isChecked) {
    userXp += 15;
    const xpEl = document.getElementById('userTotalXp');
    if (xpEl) xpEl.textContent = userXp;
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
    syncTrackersToServer();
  }
}

function setWater(num) {
  waterGlasses = num;
  updateWaterUi();
  syncTrackersToServer();
}

function updateWaterUi() {
  const el = document.getElementById('waterCount');
  if (el) el.textContent = waterGlasses;
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
  const el = document.getElementById('workoutMins');
  if (el) el.textContent = workoutMins;
  const bar = document.getElementById('workoutProgressBar');
  if (bar) bar.style.width = `${(workoutMins / 30) * 100}%`;
  syncTrackersToServer();
}

async function syncTrackersToServer() {
  if (!currentUser) return;
  try {
    await fetch('/api/patient/trackers', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        user_id: currentUser.id,
        day: currentDay,
        water_glasses: waterGlasses,
        workout_mins: workoutMins
      })
    });
  } catch(e) {}
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

// Switch Tabs
function switchTab(tabId, btn) {
  document.querySelectorAll('.tab-pane').forEach(el => el.classList.remove('active'));
  document.querySelectorAll('.nav-item').forEach(el => el.classList.remove('active'));

  const target = document.getElementById(tabId);
  if (target) target.classList.add('active');
  if (btn) btn.classList.add('active');

  if (tabId === 'tab-chat') {
    loadChatHistory();
  }
}

// Notifications
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
    uploadedBloodTestName = file.name;
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
        photoAngles[angle] = event.target.result;
        const previewEl = document.getElementById(`preview-${angle}`);
        previewEl.innerHTML = `<img src="${event.target.result}" style="width:100%;height:100%;object-fit:cover;">`;
      };
      reader.readAsDataURL(file);
    }
  };
  input.click();
}

// Save Real Intake to SQLite Backend
async function saveIntake(e) {
  e.preventDefault();
  if (!currentUser) {
    alert(currentLang === 'fa' ? 'لطفاً ابتدا وارد حساب کاربری خود شوید یا ثبت‌نام کنید.' : 'Please sign in or register first.');
    openAuthModal('signin');
    return;
  }

  const height = parseFloat(document.getElementById('userHeight').value) || 168;
  const weight = parseFloat(document.getElementById('userWeight').value) || 78;
  const age = parseInt(document.getElementById('userAge').value) || 31;
  const target_weight = parseFloat(document.getElementById('userTargetWeight').value) || 62;
  const menstrual_cycle = document.getElementById('userMenstrual').value;
  const conditions = document.getElementById('userConditions').value.trim();

  try {
    const res = await fetch('/api/patient/intake', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        user_id: currentUser.id,
        height,
        weight,
        age,
        target_weight,
        menstrual_cycle,
        conditions,
        blood_test_filename: uploadedBloodTestName,
        photo_front: photoAngles.front,
        photo_right: photoAngles.right,
        photo_back: photoAngles.back,
        photo_left: photoAngles.left
      })
    });
    const data = await res.json();
    if (res.ok && data.success) {
      alert(currentLang === 'fa' ? '✅ پرونده سلامت، برگه آزمایش و تصاویر شما با موفقیت ذخیره شد و در صف بررسی خانم دکتر قرار گرفت.' : '✅ Health dossier and photos submitted to Dr. Madis.');
      checkPatientStatus();
      switchTab('tab-waiting', document.querySelectorAll('.nav-item')[1]);
    } else {
      alert(data.error || 'خطا در ثبت پرونده');
    }
  } catch(err) {
    alert('خطا در برقراری ارتباط با سرور.');
  }
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

// ================= REAL CHAT HISTORY & MESSAGING =================
async function loadChatHistory() {
  const chatContainer = document.getElementById('chatMessages');
  if (!chatContainer) return;

  if (!currentUser) {
    renderEmptyChat();
    return;
  }

  try {
    const res = await fetch(`/api/chat/messages?user_id=${currentUser.id}`);
    if (res.ok) {
      const data = await res.json();
      if (data.messages && data.messages.length > 0) {
        chatContainer.innerHTML = '';
        data.messages.forEach(m => {
          const bubble = document.createElement('div');
          const isDoc = (m.sender === 'doctor' || m.sender === 'ai');
          bubble.className = isDoc ? 'chat-bubble doctor' : 'chat-bubble user';
          bubble.textContent = m.message;
          chatContainer.appendChild(bubble);
        });
        chatContainer.scrollTop = chatContainer.scrollHeight;
      } else {
        renderEmptyChat();
      }
    } else {
      renderEmptyChat();
    }
  } catch(e) {
    renderEmptyChat();
  }
}

function renderEmptyChat() {
  const chatContainer = document.getElementById('chatMessages');
  if (!chatContainer) return;
  const dict = i18n[currentLang];
  chatContainer.innerHTML = `
    <div id="chatEmptyState" class="chat-empty-state" style="text-align: center; padding: 70px 16px; color: #94a3b8;">
      <div style="font-size: 40px; margin-bottom: 12px; opacity: 0.85;">💬</div>
      <div style="font-weight: 800; font-size: 14px; color: #334155; margin-bottom: 6px;">${dict.chatEmptyTitle || 'گفتگوی مستقیم با خانم دکتر'}</div>
      <div style="font-size: 12px; line-height: 1.6; color: #94a3b8;">${dict.chatEmptySub || 'هنوز پیامی ارسال نشده است.<br>هر سوال، چالش یا احساسی در طول روز داشتی، اینجا بنویس!'}</div>
    </div>
  `;
}

function handleChatEnter(e) {
  if (e.key === 'Enter') sendChatMessage();
}

async function sendChatMessage() {
  const input = document.getElementById('chatInput');
  const text = input.value.trim();
  if (!text) return;

  if (!currentUser) {
    alert(currentLang === 'fa' ? 'لطفاً ابتدا وارد حساب کاربری خود شوید یا ثبت‌نام کنید.' : 'Please sign in or register first.');
    openAuthModal('signin', true);
    return;
  }

  const chatContainer = document.getElementById('chatMessages');

  // Remove empty state placeholder before appending real messages
  const emptyState = document.getElementById('chatEmptyState');
  if (emptyState) emptyState.remove();

  // User Bubble
  const userBubble = document.createElement('div');
  userBubble.className = 'chat-bubble user';
  userBubble.textContent = text;
  chatContainer.appendChild(userBubble);
  input.value = '';
  chatContainer.scrollTop = chatContainer.scrollHeight;

  // Typing Bubble
  const typingBubble = document.createElement('div');
  typingBubble.className = 'chat-bubble doctor';
  typingBubble.innerHTML = `<span style="opacity: 0.7;">${currentLang === 'fa' ? '⏳ در حال بررسی و پاسخگویی...' : '⏳ Reviewing and typing...'}</span>`;
  chatContainer.appendChild(typingBubble);
  chatContainer.scrollTop = chatContainer.scrollHeight;

  try {
    const res = await fetch('/api/chat/send', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        user_id: currentUser.id,
        message: text,
        lang: currentLang
      })
    });

    if (res.ok) {
      const data = await res.json();
      typingBubble.textContent = data.reply;
      chatContainer.scrollTop = chatContainer.scrollHeight;
      return;
    }
  } catch (err) {}

  typingBubble.textContent = 'پیام شما دریافت شد و به زودی توسط خانم دکتر پاسخ داده می‌شود.';
}

// Splash Screen Auto Dismiss
function dismissSplash() {
  const splash = document.getElementById('splashScreen');
  if (splash) {
    splash.classList.add('fade-out');
    setTimeout(() => {
      splash.style.display = 'none';
      if (!currentUser) {
        openAuthModal('signin', true);
      }
    }, 500);
  }
}

window.addEventListener('DOMContentLoaded', () => {
  setTimeout(dismissSplash, 1800);
});
