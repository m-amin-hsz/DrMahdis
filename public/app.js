// Client App Logic - Habit Stacking, Audio Player, Waiting Room, Gamification & Chat

let techniquesData = [];
let currentDay = 1;
let isAudioPlaying = false;
let audioInterval = null;
let countdownSeconds = 18 * 3600 + 42 * 60 + 15; // 18 hours, 42 mins, 15 secs
let userXp = 350;

// Fallback initial data in case fetch is delayed or offline
const defaultTechniques = [
  {
    day: 1,
    title: "دو لیوان آب حیات‌بخش قبل از غذا",
    category: "هیدراتاسیون و هضم",
    doctorQuote: "سلام عزیزم، به سفر تغییر سبک زندگیت خیلی خوش اومدی! اولین تکنیک ساده‌ترین اما قدرتمندترین کاره: قبل از ناهار و شام دو لیوان آب بنوش تا معده آماده هضم سالم بشه.",
    cumulativeTasks: [
      { id: "t1_water", text: "نوشیدن ۲ لیوان آب قبل از ناهار و شام", dayAdded: 1 }
    ],
    homework: null,
    xp: 50
  },
  {
    day: 2,
    title: "تنفس مربعی؛ کنترل سیستم عصبی قبل از غذا",
    category: "تنظیم عصبی و کاهش کورتیزول",
    doctorQuote: "امروز قرار نیست رژیم سختی بگیری، فقط می‌خوایم مغزت رو از حالت استرس خارج کنیم. ۴ دور تنفس مربعی معجزه می‌کنه.",
    cumulativeTasks: [
      { id: "t1_water", text: "نوشیدن ۲ لیوان آب قبل از وعده اصلی", dayAdded: 1 },
      { id: "t2_breath", text: "۴ دور تنفس مربعی قبل از شروع صرف غذا", dayAdded: 2 }
    ],
    homework: null,
    xp: 60
  },
  {
    day: 3,
    title: "قانون بشقاب سبز؛ چینش فیبر و رنگ‌ها",
    category: "ترکیب‌بندی بشقاب غذایی",
    doctorQuote: "ببین قشنگم، از امروز بشقابت رو مثل یک بوم نقاشی ببین: نصف بشقاب باید سبزیجات و کاهو باشه، یک چهارم پروتئین و یک چهارم کربوهیدرات پیچیده.",
    cumulativeTasks: [
      { id: "t1_water", text: "نوشیدن ۲ لیوان آب قبل از وعده اصلی", dayAdded: 1 },
      { id: "t2_breath", text: "۴ دور تنفس مربعی قبل از شروع صرف غذا", dayAdded: 2 },
      { id: "t3_plate", text: "چیدمان بشقاب با حداقل ۵۰ درصد سبزیجات و سالاد تازه", dayAdded: 3 }
    ],
    homework: {
      instruction: "از بشقاب ناهار یا شامت که قانون نیمه سبزیجات رو رعایت کردی عکس بگیر و در چت ارسال کن."
    },
    xp: 75
  },
  {
    day: 4,
    title: "غذا خوردن در حالت کاملاً نشسته و بدون حواس‌پرتی",
    category: "خوردن آگاهانه (Mindful Eating)",
    doctorQuote: "سرپا غذا خوردن، جلوی تلویزیون یا با گوشی دست گرفتن بدترین دشمن وزنته! امروز تمرینمون اینه: فقط نشسته و با تمام حواس روی طعم و بافت غذا تمرکز کن.",
    cumulativeTasks: [
      { id: "t1_water", text: "نوشیدن ۲ لیوان آب قبل از وعده اصلی", dayAdded: 1 },
      { id: "t2_breath", text: "۴ دور تنفس مربعی قبل از شروع صرف غذا", dayAdded: 2 },
      { id: "t3_plate", text: "چیدمان بشقاب با حداقل ۵۰ درصد سبزیجات تازه", dayAdded: 3 },
      { id: "t4_seated", "text": "صرف غذا کاملاً در حالت نشسته و بدون نگاه به گوشی و نمایشگر", dayAdded: 4 }
    ],
    homework: null,
    xp: 70
  },
  {
    day: 5,
    title: "تکلیف جدول مزایای لاغری (تکنیک شناختی CBT)",
    category: "روانشناسی رفتار و تعهد درونی",
    doctorQuote: "امروز یک تمرین فوق‌العاده داریم: نوشتن کارت مزایا. باید حداقل ۵ دلیل شخصی بنویسی که چرا این رژیم برات حیاتیه، تا روزهای وسوسه بهت انگیزه بده.",
    cumulativeTasks: [
      { id: "t1_water", text: "نوشیدن ۲ لیوان آب قبل از وعده اصلی", dayAdded: 1 },
      { id: "t2_breath", text: "۴ دور تنفس مربعی قبل از شروع صرف غذا", dayAdded: 2 },
      { id: "t3_plate", text: "چیدمان بشقاب با حداقل ۵۰ درصد سبزیجات تازه", dayAdded: 3 },
      { id: "t4_seated", text: "صرف غذا کاملاً در حالت نشسته و بدون حواس‌پرتی", dayAdded: 4 },
      { id: "t5_card", "text": "نوشتن و مرور جدول مزایای لاغری در طول روز", dayAdded: 5 }
    ],
    homework: {
      instruction: "۳ دلیل طلایی و شخصی خودت برای لاغری رو در کادر زیر بنویس (مثلا: سبکی زانوها، پوشیدن لباس‌های قدیمی، شادابی پوست)."
    },
    xp: 90
  },
  {
    day: 6,
    title: "تکنیک ۲۰ بار جویدن و قرار دادن قاشق روی میز",
    category: "سرعت هضم و سیگنال سیری",
    doctorQuote: "عجله برای چی عزیزم؟ بین هر لقمه قاشق و چنگال رو بذار روی میز، لقمه‌ت رو ۲۰ بار بجو تا مغزت فرصت دریافت پیام سیری رو پیدا کنه.",
    cumulativeTasks: [
      { id: "t1_water", text: "نوشیدن ۲ لیوان آب قبل از وعده اصلی", dayAdded: 1 },
      { id: "t2_breath", text: "۴ دور تنفس مربعی قبل از شروع صرف غذا", dayAdded: 2 },
      { id: "t3_plate", text: "چیدمان بشقاب با حداقل ۵۰ درصد سبزیجات تازه", dayAdded: 3 },
      { id: "t4_seated", text: "صرف غذا کاملاً در حالت نشسته و بدون حواس‌پرتی", dayAdded: 4 },
      { id: "t5_card", text: "مرور جدول مزایای لاغری", dayAdded: 5 },
      { id: "t6_chew", text: "جویدن ۲۰ باره لقمه‌ها و رها کردن قاشق بین هر لقمه", dayAdded: 6 }
    ],
    homework: null,
    xp: 80
  },
  {
    day: 7,
    title: "جشن پایان هفته اول و چک‌این ارزیابی",
    category: "سنجش پیشرفت و وزن‌کشی",
    doctorQuote: "یک هفته فوق‌العاده رو با هم تموم کردیم! بدنت الان سبک‌تر و پرانرژی‌تره. امروز صبح ناشتا وزن و دور کمرت رو ثبت کن تا دستاورد این هفته‌ت رو جشن بگیریم.",
    cumulativeTasks: [
      { id: "t1_water", text: "نوشیدن ۲ لیوان آب قبل از وعده اصلی", dayAdded: 1 },
      { id: "t2_breath", text: "۴ دور تنفس مربعی قبل از شروع صرف غذا", dayAdded: 2 },
      { id: "t3_plate", text: "چیدمان بشقاب با حداقل ۵۰ درصد سبزیجات تازه", dayAdded: 3 },
      { id: "t4_seated", text: "صرف غذا کاملاً در حالت نشسته و بدون حواس‌پرتی", dayAdded: 4 },
      { id: "t5_card", text: "مرور جدول مزایای لاغری", dayAdded: 5 },
      { id: "t6_chew", text: "جویدن ۲۰ باره لقمه‌ها و رها کردن قاشق", dayAdded: 6 },
      { id: "t7_checkin", text: "ثبت وزن و دور ناف جدید در اپلیکیشن", dayAdded: 7 }
    ],
    homework: {
      instruction: "وزن جدید امروزت رو وارد کن تا در نمودار پیشرفتت ثبت بشه."
    },
    xp: 120
  }
];

// Initialize
document.addEventListener('DOMContentLoaded', async () => {
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

// Render the 7-day strip (and preview of 90 days)
function renderDaysStrip() {
  const container = document.getElementById('daysStrip');
  container.innerHTML = '';

  for (let i = 1; i <= 14; i++) {
    const chip = document.createElement('div');
    chip.className = `day-chip ${i === currentDay ? 'active' : ''} ${i < currentDay ? 'completed' : ''}`;
    chip.innerHTML = `
      <span class="chip-label">روز</span>
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

// Load technique for selected day
function loadDay(dayNum) {
  const data = techniquesData.find(d => d.day === dayNum) || techniquesData[0];

  document.getElementById('currentDayNum').textContent = data.day;
  document.getElementById('techniqueTitle').textContent = data.title;
  document.getElementById('techniqueCategory').textContent = data.category;
  document.getElementById('doctorQuote').textContent = `«${data.doctorQuote}»`;

  // Render Cumulative Habit Stacking Tasks
  const taskListEl = document.getElementById('taskList');
  taskListEl.innerHTML = '';

  let completedCount = 0;
  const savedChecks = JSON.parse(localStorage.getItem(`day_${dayNum}_tasks`) || '{}');

  data.cumulativeTasks.forEach(task => {
    const isChecked = !!savedChecks[task.id];
    if (isChecked) completedCount++;

    const item = document.createElement('div');
    item.className = `task-item ${isChecked ? 'checked' : ''}`;
    item.innerHTML = `
      <div class="task-checkbox">${isChecked ? '✓' : ''}</div>
      <div class="task-content">
        <div class="task-label">${task.text}</div>
        <div class="task-sub">معرفی شده در روز ${task.dayAdded} • تداوم روزانه</div>
      </div>
    `;
    item.onclick = () => toggleTask(dayNum, task.id, item);
    taskListEl.appendChild(item);
  });

  document.getElementById('completedTasksRatio').textContent = `${completedCount} از ${data.cumulativeTasks.length} انجام شده`;

  // Render Homework if present
  const homeworkCard = document.getElementById('homeworkCard');
  if (data.homework) {
    homeworkCard.style.display = 'block';
    document.getElementById('homeworkInstruction').textContent = data.homework.instruction;
  } else {
    homeworkCard.style.display = 'none';
  }
}

function toggleTask(dayNum, taskId, el) {
  const savedChecks = JSON.parse(localStorage.getItem(`day_${dayNum}_tasks`) || '{}');
  savedChecks[taskId] = !savedChecks[taskId];
  localStorage.setItem(`day_${dayNum}_tasks`, JSON.stringify(savedChecks));

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

// Waiting Room Countdown (6 to 24 hours simulation)
function startWaitingCountdown() {
  const clock = document.getElementById('countdownClock');
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
  alert('🎉 تبریک! رژیم اختصاصی و برنامه ورزشی شما توسط خانم دکتر با موفقیت تایید و در پنل بارگذاری شد.');
  switchTab('tab-today', document.querySelectorAll('.nav-item')[0]);
}

// Switch Bottom Tabs
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

  if (type === 'water') {
    icon.textContent = '💧';
    title.textContent = 'یادآور آب و هیدراتاسیون';
    body.textContent = 'سلام عزیزم! ۱۵ دقیقه تا ناهار مونده، ۲ لیوان آب ولرم یادت نره تا هضم بهتری داشته باشی.';
  } else if (type === 'breath') {
    icon.textContent = '🧘‍♀️';
    title.textContent = 'تکنیک تنفس مربعی';
    body.textContent = 'قبل از شروع غذا، ۴ دور تنفس مربعی انجام بده تا هورمون‌های استرست فروکش کنند.';
  } else if (type === 'workout') {
    icon.textContent = '👟';
    title.textContent = 'وقت پیاده‌روی شاداب';
    body.textContent = '۲۰ دقیقه پیاده‌روی امروزت رو ثبت کردی؟ هر قدم تو رو به هدف نزدیک‌تر می‌کنه!';
  } else if (type === 'cbt') {
    icon.textContent = '📝';
    title.textContent = 'کارت مزایای لاغری';
    body.textContent = 'اگه الان هوس ریزه‌خواری داری، سریع کارت مزایایی که نوشتی رو باز کن و دلیلات رو بخون.';
  } else {
    icon.textContent = '🌟';
    title.textContent = 'آفرین به اراده‌ت!';
    body.textContent = 'تسک امروز ثبت شد و ۱۵ امتیاز انرژی دریافت کردی.';
  }

  toast.classList.add('show');
  setTimeout(() => {
    toast.classList.remove('show');
  }, 4000);
}

// Intake Form & 360 Photos
function handleBloodTestUpload(event) {
  const file = event.target.files[0];
  if (file) {
    document.getElementById('bloodTestFilename').textContent = `فایل بارگذاری شد: ${file.name} (آماده تحلیل پزشک)`;
    alert(`فایل آزمایش خون (${file.name}) با موفقیت بارگذاری شد.`);
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
  alert('اطلاعات سلامت، آزمایش خون و تصاویر زاویه‌ای شما با رمزنگاری ایمن برای خانم دکتر ارسال شد.');
  switchTab('tab-waiting', document.querySelectorAll('.nav-item')[1]);
}

function submitHomework() {
  const val = document.getElementById('homeworkInput').value;
  if (!val.trim()) {
    alert('لطفاً گزارش یا پاسخ تکلیف خود را بنویسید.');
    return;
  }
  alert('تکلیف شما با موفقیت برای خانم دکتر ارسال شد و به پرونده افزوده گردید.');
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

  // Friendly Coach Auto-reply
  setTimeout(() => {
    const doctorBubble = document.createElement('div');
    doctorBubble.className = 'chat-bubble doctor';
    
    if (text.includes('آب') || text.includes('تشنگی')) {
      doctorBubble.textContent = 'آفرین! حتماً بطری آب رو همراهت داشته باش. هر لیوان آبی که می‌نوشی، مثل سوخت تمیز برای کبد و چربی‌سوزیه 💧';
    } else if (text.includes('وزن') || text.includes('استپ')) {
      doctorBubble.textContent = 'اصلاً نگران نوسان‌های روزانه وزن نباش! احتباس آب، نمک و هورمون‌ها کاملاً طبیعیه. مهم اینه که تکنیک‌ها رو پیوسته ادامه بدی؛ نتیجه قطعیه ❤️';
    } else {
      doctorBubble.textContent = 'پیامت رو ثبت کردم عزیزم. خانم دکتر در بررسی پرونده هفتگی این مورد رو دقیق لحاظ می‌کنند. پرقدرت ادامه بده، ما کنارتیم!';
    }

    chatContainer.appendChild(doctorBubble);
    chatContainer.scrollTop = chatContainer.scrollHeight;
  }, 1000);
}

// Splash Screen auto-dismissal
function dismissSplash() {
  const splash = document.getElementById('splashScreen');
  if (splash) {
    splash.classList.add('fade-out');
    setTimeout(() => {
      splash.style.display = 'none';
    }, 500);
  }
}

// Auto hide splash after 1.8 seconds
window.addEventListener('DOMContentLoaded', () => {
  setTimeout(dismissSplash, 1800);
});

if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('sw.js').then((reg) => {
      console.log('Service Worker registered successfully:', reg.scope);
    }).catch((err) => {
      console.log('Service Worker registration failed:', err);
    });
  });
}

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
      const { outcome } = await deferredPrompt.userChoice;
      console.log(`User response to install: ${outcome}`);
      deferredPrompt = null;
    };
  }
});


