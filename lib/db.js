let sqlFn = null;
async function getSQL() {
  if (sqlFn) return sqlFn;
  try { const pg = await import('@vercel/postgres'); sqlFn = pg.sql; return sqlFn; } catch { return null; }
}
const mem = {};
async function ensureTable() {
  if (!process.env.POSTGRES_URL) return;
  try { const sql = await getSQL(); if (!sql) return; await sql`CREATE TABLE IF NOT EXISTS settings (key TEXT PRIMARY KEY, value TEXT NOT NULL);`; } catch(e){ console.warn('ensureTable:',e.message); }
}
export async function getConfig() {
  if (!process.env.POSTGRES_URL) return mem['config'] ? JSON.parse(mem['config']) : null;
  try { await ensureTable(); const sql=await getSQL(); if(!sql) return null; const {rows}=await sql`SELECT value FROM settings WHERE key='config'`; if(rows.length===0) return null; return JSON.parse(rows[0].value); } catch(e){ console.error('getConfig:',e.message); return null; }
}
export async function saveConfig(obj) {
  const val=JSON.stringify(obj);
  if (!process.env.POSTGRES_URL) { mem['config']=val; return; }
  try { await ensureTable(); const sql=await getSQL(); if(!sql) return; await sql`INSERT INTO settings(key,value) VALUES('config',${val}) ON CONFLICT(key) DO UPDATE SET value=${val}`; } catch(e){ console.error('saveConfig:',e.message); throw e; }
}
export async function getPassword() {
  if (process.env.ADMIN_PASSWORD) return process.env.ADMIN_PASSWORD;
  if (!process.env.POSTGRES_URL) return mem['admin_password']||'isft2026admin';
  try { await ensureTable(); const sql=await getSQL(); if(!sql) return 'isft2026admin'; const {rows}=await sql`SELECT value FROM settings WHERE key='admin_password'`; if(rows.length===0) return 'isft2026admin'; return rows[0].value; } catch(e){ console.warn('getPassword fallback:',e.message); return 'isft2026admin'; }
}
export async function savePassword(p) {
  if (!process.env.POSTGRES_URL) { mem['admin_password']=p; return; }
  try { await ensureTable(); const sql=await getSQL(); if(!sql) return; await sql`INSERT INTO settings(key,value) VALUES('admin_password',${p}) ON CONFLICT(key) DO UPDATE SET value=${p}`; } catch(e){ console.error('savePassword:',e.message); throw e; }
}

export const DEFAULT_CONFIG = {
  site: {
    admissionUrl:'https://sam.isft.uz/uz/greenwich/admission',
    newsUrl:'https://sam.isft.uz/uz/news/195',
    mainSiteUrl:'https://sam.isft.uz/uz',
    phone:'55 518-70-70', phoneLink:'tel:+998555187070', phoneFull:'+998 55 518-70-70',
    address1:{uz:'Samarqand shahar',ru:'г. Самарканд',en:'Samarkand city'},
    address2:{uz:"Mirzo Bedil ko'chasi, 24-uy",ru:'ул. Мирзо Бедил, 24',en:'Mirzo Bedil street, 24'},
    website:'sam.isft.uz', websiteUrl:'https://sam.isft.uz',
    email:'info@isft.uz', countdownDate:'2026-09-01T09:00:00'
  },
  hero: {
    badge:{uz:'RASMIY HAMKORLIK 2026',ru:'ОФИЦИАЛЬНОЕ ПАРТНЁРСТВО 2026',en:'OFFICIAL PARTNERSHIP 2026'},
    title:'DUAL DEGREE', year:'2026',
    subtitle:'ISFT Samarqand × University of Greenwich',
    features:[
      {icon:'fa-graduation-cap',text:{uz:'2 ta xalqaro diplom bir vaqtda',ru:'2 международных диплома одновременно',en:'2 international degrees at once'}},
      {icon:'fa-globe-americas',text:{uz:"Britaniya & O'zbekiston diplomi",ru:'Британский и узбекский диплом',en:'British & Uzbek degree'}},
      {icon:'fa-briefcase',text:{uz:'Global karyera imkoniyatlari',ru:'Глобальные карьерные возможности',en:'Global career opportunities'}}
    ],
    ctaText:{uz:"Ro'yxatdan o'ting",ru:'Зарегистрироваться',en:'Register Now'}
  },
  prices: {
    title:{uz:'Kontrakt Narxi',ru:'Стоимость обучения',en:'Tuition Fee'},
    amount:'$4,500',
    period:{uz:'yilda bir marta',ru:'в год',en:'per year'},
    years:{uz:'4 yil davomida',ru:'в течение 4 лет',en:'over 4 years'},
    note:{uz:'1 yil IFP (poydevor) + 3 yil bakalavriat — jami 4 yil',ru:'1 год IFP (фундаментальный) + 3 года бакалавриат — итого 4 года',en:'1 year IFP (foundation) + 3 years bachelor — total 4 years'}
  },
  countdown: {
    title:{uz:'Qabul Boshlanishiga',ru:'До Начала Приёма',en:'Admission Starts In'},
    subtitle:{uz:'Ariza topshirish uchun qolgan vaqt',ru:'Оставшееся время для подачи заявки',en:'Time remaining to apply'}
  },
  faculties: {
    title:{uz:"Ta'lim Yo'nalishlari",ru:'Образовательные Программы',en:'Academic Programs'},
    subtitle:{uz:"ISFT × University of Greenwich — 6 ta bakalavriat yo'nalishi",ru:'ISFT × Университет Гринвич — 6 программ бакалавриата',en:'ISFT × University of Greenwich — 6 bachelor programs'},
    duration:{uz:'4 yil (1 yil IFP + 3 yil)',ru:'4 года (1 год IFP + 3 года)',en:'4 years (1 year IFP + 3 years)'},
    items:[
      {icon:'fa-chart-bar',badge:'BSc (Hons)',title:{uz:'Buxgalteriya hisobi va moliya',ru:'Бухгалтерский учёт и финансы',en:'Accounting and Finance'},programs:[{name:{uz:"ISFT diplomi (O'zbekiston)",ru:'Диплом ISFT (Узбекистан)',en:'ISFT Diploma (Uzbekistan)'},price:''},{name:{uz:'University of Greenwich diplomi (Buyuk Britaniya)',ru:'Диплом Гринвич (Великобритания)',en:'University of Greenwich Degree (UK)'},price:''}]},
      {icon:'fa-briefcase',badge:'BSc (Hons)',title:{uz:'Biznes boshqaruvi',ru:'Управление бизнесом',en:'Business Management'},programs:[{name:{uz:"ISFT diplomi (O'zbekiston)",ru:'Диплом ISFT (Узбекистан)',en:'ISFT Diploma (Uzbekistan)'},price:''},{name:{uz:'University of Greenwich diplomi (Buyuk Britaniya)',ru:'Диплом Гринвич (Великобритания)',en:'University of Greenwich Degree (UK)'},price:''}]},
      {icon:'fa-bullhorn',badge:'BSc (Hons)',title:{uz:'Raqamli marketing va reklama',ru:'Цифровой маркетинг и реклама',en:'Digital Marketing & Advertising'},programs:[{name:{uz:"ISFT diplomi (O'zbekiston)",ru:'Диплом ISFT (Узбекистан)',en:'ISFT Diploma (Uzbekistan)'},price:''},{name:{uz:'University of Greenwich diplomi (Buyuk Britaniya)',ru:'Диплом Гринвич (Великобритания)',en:'University of Greenwich Degree (UK)'},price:''}]},
      {icon:'fa-globe',badge:'BSc (Hons)',title:{uz:'Xalqaro biznes',ru:'Международный бизнес',en:'International Business'},programs:[{name:{uz:"ISFT diplomi (O'zbekiston)",ru:'Диплом ISFT (Узбекистан)',en:'ISFT Diploma (Uzbekistan)'},price:''},{name:{uz:'University of Greenwich diplomi (Buyuk Britaniya)',ru:'Диплом Гринвич (Великобритания)',en:'University of Greenwich Degree (UK)'},price:''}]},
      {icon:'fa-microchip',badge:'BEng (Hons)',title:{uz:'Kompyuter muhandisligi',ru:'Компьютерная инженерия',en:'Computer Engineering'},programs:[{name:{uz:"ISFT diplomi (O'zbekiston)",ru:'Диплом ISFT (Узбекистан)',en:'ISFT Diploma (Uzbekistan)'},price:''},{name:{uz:'University of Greenwich diplomi (Buyuk Britaniya)',ru:'Диплом Гринвич (Великобритания)',en:'University of Greenwich Degree (UK)'},price:''}]},
      {icon:'fa-piggy-bank',badge:'BSc (Hons)',title:{uz:'Moliya va investitsiya banki',ru:'Финансы и инвестиционный банкинг',en:'Finance & Investment Banking'},programs:[{name:{uz:"ISFT diplomi (O'zbekiston)",ru:'Диплом ISFT (Узбекистан)',en:'ISFT Diploma (Uzbekistan)'},price:''},{name:{uz:'University of Greenwich diplomi (Buyuk Britaniya)',ru:'Диплом Гринвич (Великобритания)',en:'University of Greenwich Degree (UK)'},price:''}]}
    ]
  },
  about: {
    tag:{uz:'Hamkorlik haqida',ru:'О партнёрстве',en:'About Partnership'},
    title:{uz:"O'zbekistonda Britaniya diplomi",ru:'Британский диплом в Узбекистане',en:'British Degree in Uzbekistan'},
    subtitle:{uz:"ISFT Samarqand va University of Greenwich strategik hamkorligi asosida ikki darajali ta'lim dasturi ishga tushdi.",ru:'На основе стратегического партнёрства ISFT Самарканд и Университета Гринвич запущена программа двойного диплома.',en:'Based on the strategic partnership between ISFT Samarkand and University of Greenwich, a dual degree program has been launched.'},
    paragraphs:[
      {uz:"Mazkur hamkorlik doirasida talabalar O'zbekistonda — ISFT Samarqand filialida tahsil olgan holda, bir vaqtning o'zida ikkita rasmiy diplom — ISFT diplomi va Buyuk Britaniyaning University of Greenwich diplomi — ga ega bo'ladilar.",ru:'В рамках данного партнёрства студенты, обучаясь в Узбекистане в ISFT Самарканд, одновременно получают два официальных диплома — диплом ISFT и диплом Университета Гринвич.',en:'Within this partnership, students studying in Uzbekistan at ISFT Samarkand simultaneously receive two official degrees — an ISFT diploma and a University of Greenwich diploma.'},
      {uz:"Ta'lim 4 yil davomida Samarqandda amalga oshiriladi: 1 yil xalqaro poydevor (IFP) va 3 yil bakalavriat. Barcha o'quv dasturlari University of Greenwich standartlari asosida.",ru:'Обучение проходит в Самарканде в течение 4 лет: 1 год подготовительной программы (IFP) и 3 года бакалавриата. Все программы по стандартам Университета Гринвич.',en:'Education takes place in Samarkand over 4 years: 1 year of Foundation Program (IFP) and 3 years of bachelor degree. All programs follow University of Greenwich standards.'}
    ],
    uniName:'University of Greenwich',
    uniDesc:{uz:"1890-yilda tashkil etilgan, London va Kentda joylashgan yetakchi Britaniya davlat universiteti.",ru:'Ведущий британский государственный университет, основанный в 1890 году, в Лондоне и Кенте.',en:'A leading British public university founded in 1890, located in London and Kent.'},
    uniBadge:{uz:'135+ yillik tarix',ru:'135+ лет истории',en:'135+ years of history'}
  },
  steps: {
    title:{uz:'Dual Degree — Qadamma-qadam',ru:'Dual Degree — Шаг за шагом',en:'Dual Degree — Step by Step'},
    items:[
      {num:'01',title:{uz:"Ro'yxatdan o'ting",ru:'Зарегистрируйтесь',en:'Register'},desc:{uz:"ISFT Samarqand filialiga onlayn ariza topshiring.",ru:'Подайте онлайн-заявку в ISFT Самарканд.',en:'Submit an online application to ISFT Samarkand.'}},
      {num:'02',title:{uz:"1-yil: Xalqaro Poydevor (IFP)",ru:'1-й год: Подготовительная программа (IFP)',en:'Year 1: Foundation Program (IFP)'},desc:{uz:"Birinchi yil xalqaro poydevor dasturida tahsil olasiz. Bu dastur sizi University of Greenwich bakalavriat dasturiga tayyorlaydi.",ru:'В первый год вы учитесь по подготовительной программе для поступления на бакалавриат Университета Гринвич.',en:'In the first year you study the Foundation Program to prepare for the University of Greenwich bachelor degree.'}},
      {num:'03',title:{uz:"2–4 yil: Bakalavriat",ru:'2–4 год: Бакалавриат',en:'Years 2–4: Bachelor Degree'},desc:{uz:"Keyingi 3 yilda tanlagan yo'nalishingiz bo'yicha bakalavriat ta'lim olasiz. Barcha darslar Samarqandda.",ru:'Следующие 3 года вы получаете образование по выбранному направлению в Самарканде.',en:'The next 3 years you receive education in your chosen field in Samarkand.'}},
      {num:'04',title:{uz:"Ikki diplom qo'lga kiriting",ru:'Получите два диплома',en:'Receive Two Degrees'},desc:{uz:"ISFT diplomi (O'zbekiston) va University of Greenwich diplomi (Buyuk Britaniya) — ikkisi ham rasmiy tan olingan.",ru:'Диплом ISFT (Узбекистан) и диплом Университета Гринвич (Великобритания) — оба официально признаны.',en:'ISFT diploma (Uzbekistan) and University of Greenwich diploma (UK) — both officially recognized.'}}
    ]
  },
  advantages: {
    title:{uz:'Nima uchun Dual Degree?',ru:'Почему Dual Degree?',en:'Why Dual Degree?'},
    items:[
      {icon:'🎓',title:{uz:'Ikki rasmiy diplom',ru:'Два официальных диплома',en:'Two official degrees'},desc:{uz:"ISFT va University of Greenwich — bitta o'qish jarayonida.",ru:'ISFT и Университет Гринвич — оба диплома в одном процессе.',en:'ISFT and University of Greenwich — both degrees in one process.'}},
      {icon:'🌍',title:{uz:'Xorijga chiqmay',ru:'Без выезда за рубеж',en:'Without going abroad'},desc:{uz:"Barcha ta'lim Samarqandda — o'z oilang yonida.",ru:'Всё обучение в Самарканде — рядом с семьёй.',en:'All education in Samarkand — near your family.'}},
      {icon:'📚',title:{uz:'Britaniya standartlari',ru:'Британские стандарты',en:'British standards'},desc:{uz:"University of Greenwich o'quv dasturlari va baholash tizimi.",ru:'Учебные программы и система оценивания Университета Гринвич.',en:'University of Greenwich curricula and assessment system.'}},
      {icon:'💼',title:{uz:'Global karyera',ru:'Глобальная карьера',en:'Global career'},desc:{uz:"Britaniya diplomi bilan dunyo bo'ylab ish topish osonlashadi.",ru:'С британским дипломом найти работу по всему миру проще.',en:'With a British degree, finding work worldwide becomes easier.'}},
      {icon:'💰',title:{uz:"$4,500/yil — 4 yil",ru:'$4,500/год — 4 года',en:'$4,500/year — 4 years'},desc:{uz:"4 yil davomida $4,500/yil — ikki diplom uchun bitta to'lov.",ru:'4 года по $4,500/год — один платёж за два диплома.',en:'4 years at $4,500/year — one payment for both degrees.'}},
      {icon:'🏆',title:{uz:'135+ yillik nufuz',ru:'135+ лет престижа',en:'135+ years of prestige'},desc:{uz:"University of Greenwich — 1890-yildan buyon xalqaro tan olingan.",ru:'Университет Гринвич — международно признан с 1890 года.',en:'University of Greenwich — internationally recognized since 1890.'}}
    ]
  },
  stats: {
    title:{uz:'ISFT × Greenwich',ru:'ISFT × Greenwich',en:'ISFT × Greenwich'},
    subtitle:{uz:'Raqamlarda',ru:'В цифрах',en:'In Numbers'},
    items:[
      {icon:'fa-graduation-cap',number:'6',label:{uz:"Bakalavriat yo'nalishi",ru:'Программ бакалавриата',en:'Bachelor programs'}},
      {icon:'fa-calendar',number:'4',label:{uz:"Yillik ta'lim",ru:'Года обучения',en:'Years of study'}},
      {icon:'fa-dollar-sign',number:'$4,500',label:{uz:"Yillik to'lov",ru:'В год',en:'Per year'}},
      {icon:'fa-university',number:'1890',label:{uz:'Greenwich asos yili',ru:'Год основания Greenwich',en:'Greenwich founded'}}
    ]
  },
  contact: {
    title:{uz:"Biz Bilan Bog'laning",ru:'Свяжитесь с нами',en:'Contact Us'},
    subtitle:{uz:'Savollaringizga javob berishga tayyormiz',ru:'Готовы ответить на ваши вопросы',en:'Ready to answer your questions'}
  },
  cta: {
    title:{uz:'Kelajagingizni Bugun Boshlang!',ru:'Начните Своё Будущее Сегодня!',en:'Start Your Future Today!'},
    text:{uz:"ISFT × University of Greenwich Dual Degree — O'zbekistonda Britaniya sifatidagi ta'lim. $4,500/yil, 4 yil, 2 diplom.",ru:'ISFT × Университет Гринвич Dual Degree — британское качество образования в Узбекистане. $4,500/год, 4 года, 2 диплома.',en:'ISFT × University of Greenwich Dual Degree — British quality education in Uzbekistan. $4,500/year, 4 years, 2 degrees.'},
    btn1:{uz:'Ariza topshirish',ru:'Подать заявку',en:'Apply Now'},
    btn2:'55 518-70-70'
  },
  social: {
    title:{uz:"Biz Bilan Bog'laning",ru:'Свяжитесь с нами',en:'Connect With Us'},
    subtitle:{uz:'Ijtimoiy tarmoqlarda va rasmiy saytimizda',ru:'В социальных сетях и на официальном сайте',en:'On social media and our official website'},
    mainBtnText:{uz:"Asosiy Saytga O'tish",ru:'На Главный Сайт',en:'Visit Main Site'},
    openText:{uz:'Ochish',ru:'Открыть',en:'Open'},
    items:[
      {id:'facebook',icon:'fab fa-facebook-f',name:'Facebook',url:'https://www.facebook.com/p/ISFT-Samarqand-61569613530481/'},
      {id:'instagram',icon:'fab fa-instagram',name:'Instagram',url:'https://www.instagram.com/isft_samarqand/'},
      {id:'telegram',icon:'fab fa-telegram-plane',name:'Telegram',url:'https://t.me/samarqand_isft'},
      {id:'youtube',icon:'fab fa-youtube',name:'YouTube',url:'https://www.youtube.com/@isft_samarqand'},
      {id:'linkedin',icon:'fab fa-linkedin-in',name:'LinkedIn',url:'https://www.linkedin.com/company/linkedin.com-company-isft-institute/'}
    ]
  },
  footer: {
    desc:{uz:"International School of Finance Technology — O'zbekistonning yetakchi moliya va texnologiya instituti. University of Greenwich rasmiy hamkori. Samarqand filiali.",ru:'International School of Finance Technology — ведущий институт Узбекистана. Официальный партнёр Университета Гринвич. Самаркандский филиал.',en:"International School of Finance Technology — Uzbekistan's leading finance and technology institute. Official partner of University of Greenwich. Samarkand branch."},
    quickLinksTitle:{uz:'Tezkor Havolalar',ru:'Быстрые ссылки',en:'Quick Links'},
    programsTitle:{uz:"Ta'lim Dasturlari",ru:'Учебные программы',en:'Programs'},
    contactTitle:{uz:"Aloqa Ma'lumotlari",ru:'Контактная информация',en:'Contact Info'},
    visitSite:{uz:"Asosiy saytga o'tish",ru:'На главный сайт',en:'Visit main website'},
    rights:{uz:'Barcha huquqlar himoyalangan.',ru:'Все права защищены.',en:'All rights reserved.'},
    privacy:{uz:'Maxfiylik siyosati',ru:'Политика конфиденциальности',en:'Privacy Policy'},
    terms:{uz:'Foydalanish shartlari',ru:'Условия использования',en:'Terms of Use'},
    quickLinks:[
      {label:{uz:'Biz haqimizda',ru:'О нас',en:'About Us'},url:'https://sam.isft.uz/uz/about'},
      {label:{uz:'Abituriyentlarga',ru:'Абитуриентам',en:'For Applicants'},url:'https://sam.isft.uz/uz/applicants'},
      {label:{uz:'Talabalarga',ru:'Студентам',en:'For Students'},url:'https://sam.isft.uz/uz/students'},
      {label:{uz:'Yangiliklar',ru:'Новости',en:'News'},url:'https://sam.isft.uz/uz/news'},
      {label:{uz:'Savol-Javob',ru:'Вопрос-Ответ',en:'FAQ'},url:'https://sam.isft.uz/uz/faq'}
    ],
    programs:[
      {label:{uz:'Bakalavriat',ru:'Бакалавриат',en:'Bachelor'},url:'https://sam.isft.uz/uz/applicants'},
      {label:{uz:'Doktorantura',ru:'Докторантура',en:'Doctoral'},url:'https://sam.isft.uz/uz/activity/scientific/doctoral'},
      {label:{uz:'ACCA Dasturi',ru:'Программа ACCA',en:'ACCA Program'},url:'https://sam.isft.uz/uz/about/acca'},
      {label:{uz:'Xalqaro Dasturlar',ru:'Международные программы',en:'International Programs'},url:'https://sam.isft.uz/uz/activity/international'}
    ]
  }
};
