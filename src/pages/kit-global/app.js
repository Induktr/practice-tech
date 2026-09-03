(function () {
  const technologies = [
    'REACT',
    'REACT NATIVE',
    'TYPESCRIPT',
    'NEXT.JS',
    'TAILWINDCSS',
  ];

  const el = document.getElementById('typewriter-text');
  if (el) {
    const TYPING_SPEED = 90;
    const ERASING_SPEED = 50;
    const PAUSE_AFTER_TYPE  = 1800;
    const PAUSE_AFTER_ERASE = 300;

    let wordIndex  = 0;
    let charIndex  = 0;
    let isErasing  = false;

    function tick() {
      const currentWord = technologies[wordIndex];

      if (!isErasing) {
        charIndex++;
        el.textContent = currentWord.slice(0, charIndex);

        if (charIndex === currentWord.length) {
          isErasing = true;
          setTimeout(tick, PAUSE_AFTER_TYPE);
          return;
        }
        setTimeout(tick, TYPING_SPEED);
      } else {
        charIndex--;
        el.textContent = currentWord.slice(0, charIndex);

        if (charIndex === 0) {
          isErasing = false;
          wordIndex = (wordIndex + 1) % technologies.length;
          setTimeout(tick, PAUSE_AFTER_ERASE);
          return;
        }
        setTimeout(tick, ERASING_SPEED);
      }
    }

    setTimeout(tick, 500);
  }

  const root = document.documentElement;
  const savedTheme = localStorage.getItem('theme');

  if (savedTheme === 'light') root.classList.add('light');

  const themeButtons = document.querySelectorAll('.toggle-theme');
  themeButtons.forEach((btn) => {
    btn.addEventListener('click', () => {
      root.classList.toggle('light');
      const isLight = root.classList.contains('light');
      localStorage.setItem('theme', isLight ? 'light' : 'dark');
    });
  });

  const DICTIONARY = {
    ua: {
      nav: {
        cases: "Кейси",
        our_products: "Наші продукти",
        services: "Послуги",
        about_us: "Про нас",
        contact_us: "Зв'язатися з нами"
      },
      products_dropdown: {
        restup: "Restup",
        ecommerce: "Е-комерс"
      },
      services_dropdown: {
        tech_stack: "Технічний стек",
        our_approach: "Наш підхід"
      },
      about_dropdown: {
        our_team: "Наша команда",
        kitapp: "Kitapp"
      },
      hero: {
        title_prefix: "Ми розробляємо застосунки з"
      },
      partners: {
        title: "Чому партнери нам довіряють",
        card1: "Понад сто задоволених клієнтів по всьому світу з 2014 року.",
        card2: "Злагоджена команда фахівців із гнучким підходом до створення кожного проєкту.",
        card3: "Ми завжди поруч. Готові реалізувати всі ваші ідеї продукту або потреби в аутсорсингу."
      },
      approach: {
        title: "Наш підхід",
        step1_title: "Дослідження ринку",
        step1_desc: "Ми досліджуємо ринок: дизайн, структуру та функціональність схожих застосунків. Враховуємо помилки конкурентів, щоб дати користувачам більше можливостей і створити якісний продукт.",
        step2_title: "Технічне завдання",
        step2_desc: "Ми готуємо детальне технічне завдання з описом структури даних, дизайну та функціоналу. Кожну деталь обговорюємо й погоджуємо з клієнтом, щоб уникнути несподіванок під час розробки.",
        step3_title: "Унікальний UX/UI дизайн",
        step3_desc: "Ми дотримуємося принципів Material Design і Human Interface Guidelines, забезпечуючи простоту, зручність і сучасний вигляд. Гарантуємо стабільну роботу без збоїв. Наші застосунки відповідають вимогам Google та Apple, тому проходять модерацію без затримок.",
        step4_title: "Розробка продукту",
        step4_desc: "Ми виконуємо front-end і back-end розробку та створюємо адмін-панелі (дашборди). Інформуємо клієнта про результати кожного етапу й даємо можливість контролювати та відстежувати прогрес. Кожен етап ретельно тестується перед релізом. Фінальний продукт запускаємо в Google Play / App Store та на хостингу. Також надаємо технічну підтримку.",
        contact_title: "Зв’яжіться з нами",
        contact_desc: "Понад 10 років ми будуємо ефективні кросфункціональні команди та успішні проєкти. Ми підбираємо правильні таланти під вашу культуру бізнесу, забезпечуючи безшовну співпрацю та масштабування. Запитайте нас як?",
        schedule_call: "Запланувати дзвінок"
      },
      projects: {
        title: "Проєкти",
        subtitle: "Усі наші проєкти створюються з урахуванням сучасних трендів і методологій. Усі рішення детально обговорюємо з клієнтом, щоб досягти найкращого результату.",
        tags: {
          all: "Усі",
          mobile: "Мобільний застосунок",
          landing: "Лендінг",
          web: "Веб-застосунок",
          fintech: "Фінтех та мобільні гаманці",
          med_edu: "Медичні та освітні платформи"
        },
        cases: {
          case_one: {
            title: "Traning Voice",
            desc: "Мобільний додаток для інтелектуальних вокальних тренувань",
          },
          case_two: {
            title: "Jeatasen Bil",
            desc: "Лендінг для компанії по переобладнанню автомобілів",
          },
          case_three: {
            title: "Happy Feet",
            desc: "Сучасний лендінг для подологічної практики",
          },
          case_four: {
            title: "Maystry",
            desc: "Революційний додаток для пошуку роботи",
          },
          case_five: {
            title: "Bioclinic Dental",
            desc: "Ваш розумний додаток для догляду за зубами",
          },
          case_six: {
            title: "Arias",
            desc: "Мобільний додаток для допомоги віртуальним медсестрам",
          }
        },
        show_all: "Показати все"
      },
      products: {
        title: "Наші продукти",
        subtitle: "Ми створюємо рішення «під ключ» для ресторанної та роздрібної індустрій. Наші продукти допомагають автоматизувати процеси, покращити сервіс і збільшити прибуток.",
        restup: {
          subtitle: "Універсальний мобільний застосунок для бізнесу",
          title: "RestUp",
          desc: "Каталог, замовлення, доставка та зручна адмін-панель, яка дозволяє швидко вийти онлайн лише за 10 днів — без комісій і абонплати. Доступно на iOS та Android."
        },
        ecommerce: {
          subtitle: "Мобільний застосунок для розвитку вашого бізнесу",
          title: "E-Commerce App",
          desc: "Більшість ваших потенційних клієнтів — активні користувачі смартфонів. Дайте їм можливість легко та швидко купувати ваші товари через зручний мобільний застосунок інтернет-магазину."
        },
        established_audience: "Сформована аудиторія",
        engaged: "Залучені",
        rating_google: "Рейтинг у Google Play",
        users_567: "567 користувачів",
        users_241: "241 користувачів",
        new_users_92: "92 нових користувачів",
        new_users_41: "41 нових користувачів",
        growth_35: "+3,5% ▲ порівняно з 30 днями тому",
        growth_25: "+2,5% ▲ порівняно з 30 днями тому",
        growth_15: "+1,5% ▲ порівняно з 30 днями тому"
      },
      how_help: {
        title: "Як ми допомагаємо",
        desc: "Ми поєднуємо стратегію, креативність і надійне виробництво в єдине рішення.",
        go_to_form: "Перейти до форми",
        design: "Дизайн",
        design_desc: "Єдине рішення для розробки Android та iOS. Будуйте на сучасному фреймворку — економте час і бюджет.",
        design_quote: "UX-дослідження, вайрфрейми, прототипи user flow, UI-стилізація",
        crossplatform: "Кросплатформні застосунки",
        crossplatform_desc: "Єдине рішення для розробки Android та iOS. Розробка на платформі з сучасним фреймворком — економія часу й коштів.",
        crossplatform_quote: "React Native, TypeScript, Back-end (Node.js — Express/Nest), MongoDB, SQLite, GraphQL, Firebase та інші сторонні API",
        web: "Веб-розробка",
        web_desc: "Кастомні платформи на Next.js, складні бізнес-сайти та потужні адмін-панелі з TypeScript, чистою архітектурою та продуктивністю рівня enterprise.",
        web_quote: "React.js (Next, SSR), Redux, TypeScript, SPA, HTML, CSS, REST API",
        support: "Техпідтримка",
        support_desc: "Проактивний моніторинг і супровід: оновлення безпеки, оптимізація продуктивності та реліз-менеджмент для web, mobile і hosting.",
        support_quote: "CDN, CI/CD пайплайни, DevOps, Docker, Gitflow, Sentry, хмарні сервіси",
        marketing: "Маркетингові послуги",
        marketing_desc: "Контекстна та таргетована реклама, маркетингові кампанії, ASO.",
        marketing_quote: "Google Ads, ASO, аналітика, відстеження ключових метрик (ROI)",
        analytics: "Аналітика",
        analytics_desc: "Відстеження кастомних і ключових подій — контроль залученості, утримання та зростання доходу.",
        analytics_quote: "Firebase Analytics + GA4, AppMetrica, AppsFlyer"
      },
      tech_stack: {
        title: "Технічний стек",
        desc: "Ми надаємо послуги кастомної розробки програмного забезпечення, використовуючи перевірені технології.",
        development: "Розробка",
        databases: "Бази даних",
        infrastructure: "Інфраструктура"
      },
      direct_link_cta: {
        title: "Час втілювати ідеї разом"
      },
      about_section: {
        desc1: "KIT Global — це інтегрована агенція інформаційних технологій з України. Ми надаємо послуги з розробки веб- і мобільних продуктів. Створюємо проєкти для бізнесу, громадських організацій, освітніх і державних установ в Україні, Європі та США. Агенція зосереджена на ефективних рішеннях.",
        desc2: "Наша висококваліфікована команда виконує всі етапи створення продукту — від аудиту до підтримки та просування готового проєкту. Це цінують наші клієнти, адже їм не потрібно шукати кількох підрядників, скорочуються терміни розробки та формується об'єктивна вартість послуг."
      },
      team: {
        title: "Наша команда",
        oleksii_name: "Олексій, співвласник",
        oleksii_role: "Наш керівник і CEO компанії",
        oleksandr_name: "Олександр, співвласник",
        oleksandr_role: "Наш технічний мозок і CTO",
        yulia_name: "Юлія",
        yulia_role: "Менеджер із продажу",
        artem_mkt_name: "Артем",
        artem_mkt_role: "Керівник маркетингу",
        zakhar_name: "Захар",
        zakhar_role: "Провідний front-end mobile інженер",
        yaroslav_name: "Ярослав",
        yaroslav_role: "Проджект-менеджер",
        anton_name: "Антон",
        anton_role: "QA спеціаліст",
        dmytro_fe_name: "Дмитро",
        dmytro_fe_role: "Провідний frontend розробник",
        valeriia_name: "Валерія",
        valeriia_role: "Провідний UX/UI дизайнер",
        daniil_name: "Данііл",
        daniil_role: "Back-end розробник",
        artem_be_name: "Артем",
        artem_be_role: "Team Lead back-end розробник",
        dmytro_mob_name: "Дмитро",
        dmytro_mob_role: "Front-end mobile інженер",
        down_panel_title: "Наша чудова команда",
        down_panel_desc: "Наша команда створює гнучкі та ефективні рішення, які допомагають бізнесу зростати. Саме завдяки професіоналізму та злагодженій роботі ми будуємо довгострокову співпрацю."
      },
      contact_section: {
        title: "ЗВ'ЯЖІТЬСЯ З НАМИ",
        desc: "Ми створимо для вас ідеальний мобільний додаток, який буде функціонувати бездоганно та відповідатиме всім потребам як користувачів, так і вашим."
      },
      reviews: {
        title: "Ви з нами?",
        desc: "Прочитайте відгуки наших клієнтів і дізнайтеся, чому понад 3000 компаній обрали Kit Global.",
        form_name: "Введіть ім'я*",
        form_phone: "Ваш номер телефону*",
        form_email: "Адреса електронної пошти*",
        form_details: "Деталі проєкту*",
        form_disclaimer: "* Цей сайт захищено reCAPTCHA та підпадає під дію Політики конфіденційності і Умов використання",
        form_submit: "Надіслати"
      },
      footer: {
        desc: "KIT GLOBAL LLC — Аутсорс-розробка мобільних і веб-додатків та продуктова компанія",
        edrpou: "ЄДРПОУ 43344434",
        contacts: "Контакти",
        trusted: "Нам довіряють",
        location: "Локація",
        address: "1-ша Набережна річки Стрілки, 9А, Суми, Україна"
      },
      modal: {
        title: "ЗВ'ЯЗАТИСЯ З НАМИ",
        name_placeholder: "Ваше ім'я*",
        phone_placeholder: "Ваш номер телефону*",
        "email_placeholder": "Адреса електронної пошти*",
        "details_placeholder": "Деталі проєкту*",
        disclaimer: "* Цей сайт захищено reCAPTCHA та підпадає під дію Політики конфіденційності і Умов використання",
        submit: "Надіслати"
      },
      project_modal: {
        dev_type: "Розробка",
        timeline: "Терміни розробки",
        overview: "Огляд та результати проєкту"
      }
    },
    en: {
      nav: {
        cases: "Cases",
        our_products: "Our Products",
        services: "Services",
        about_us: "About Us",
        contact_us: "Contact Us"
      },
      products_dropdown: {
        restup: "Restup",
        ecommerce: "E-Commerce"
      },
      services_dropdown: {
        tech_stack: "Tech Stack",
        our_approach: "Our Approach"
      },
      about_dropdown: {
        our_team: "Our Team",
        kitapp: "Kitapp"
      },
      hero: {
        title_prefix: "We build applications with"
      },
      partners: {
        title: "Why partners trust us",
        card1: "Over a hundred satisfied clients worldwide since 2014.",
        card2: "A well-coordinated team of specialists with a flexible approach to every project.",
        card3: "We are always near. Ready to realize all your product ideas or outsourcing needs."
      },
      approach: {
        title: "Our Approach",
        step1_title: "Market Research",
        step1_desc: "We analyze the market: design, structure, and functionality of similar apps. We take competitors' mistakes into account to give users more features and build a quality product.",
        step2_title: "Technical Specification",
        step2_desc: "We prepare a detailed technical specification describing data structure, design, and functionality. Every detail is discussed and approved with the client.",
        step3_title: "Unique UX/UI Design",
        step3_desc: "We follow Material Design and Human Interface Guidelines, ensuring simplicity, convenience, and a modern look. Our apps pass Google and Apple moderation without delays.",
        step4_title: "Product Development",
        step4_desc: "We perform front-end and back-end development and build admin dashboards. We keep the client informed and test every stage thoroughly before release.",
        contact_title: "Contact Us",
        contact_desc: "For over 10 years we have been building effective cross-functional teams and successful projects. We select the right talent for your business culture. Ask us how?",
        schedule_call: "Schedule a Call"
      },
      projects: {
        title: "Projects",
        subtitle: "All our projects are created taking into account modern trends and methodologies. We discuss all decisions with the client in detail.",
        tags: {
          all: "All",
          mobile: "Mobile App",
          landing: "Landing Page",
          web: "Web App",
          fintech: "Fintech & Wallets",
          med_edu: "Medical & Edu Platforms"
        },
        cases: {
          case_one: {
            title: "Traning Voice",
            desc: "Mobile application for intelligent vocal training",
          },
          case_two: {
            title: "Jeatasen Bil",
            desc: "Landing page for vehicle conversion company",
          },
          case_three: {
            title: "Happy Feet",
            desc: "Modern landing page for podiatry practice",
          },
          case_four: {
            title: "Maystry",
            desc: "Revolutionary job search app",
          },
          case_five: {
            title: "Bioclinic Dental",
            desc: "Your smart dental care app",
          },
          case_six: {
            title: "Arias",
            desc: "Mobile app assistant for virtual nurses",
          }
        },
        show_all: "Show All"
      },
      products: {
        title: "Our Products",
        subtitle: "We create turn-key solutions for restaurant and retail industries. Our products help automate processes, improve service, and boost revenue.",
        restup: {
          subtitle: "Universal mobile application for business",
          title: "RestUp",
          desc: "Catalog, ordering, delivery, and a handy admin panel allowing you to launch online in just 10 days — with zero commissions. Available on iOS and Android."
        },
        ecommerce: {
          subtitle: "Mobile app to grow your business",
          title: "E-Commerce App",
          desc: "Most of your potential clients are active smartphone users. Give them the ability to quickly buy your products via a convenient online store app."
        },
        established_audience: "Established Audience",
        engaged: "Engaged",
        rating_google: "Google Play Rating",
        users_567: "567 users",
        users_241: "241 users",
        new_users_92: "92 new users",
        new_users_41: "41 new users",
        growth_35: "+3.5% ▲ compared to 30 days ago",
        growth_25: "+2.5% ▲ compared to 30 days ago",
        growth_15: "+1.5% ▲ compared to 30 days ago"
      },
      how_help: {
        title: "How We Help",
        desc: "We combine strategy, creativity, and reliable production into a single solution.",
        go_to_form: "Go to Form",
        design: "Design",
        design_desc: "A single solution for Android and iOS development. Build on a modern framework — save time and budget.",
        design_quote: "UX research, wireframes, user flow prototypes, UI styling",
        crossplatform: "Cross-Platform Apps",
        crossplatform_desc: "A single solution for Android and iOS development. Building on a platform with a modern framework — saving time and money.",
        crossplatform_quote: "React Native, TypeScript, Back-end (Node.js — Express/Nest), MongoDB, SQLite, GraphQL, Firebase and other third-party APIs",
        web: "Web Development",
        web_desc: "Custom platforms on Next.js, complex business websites and powerful admin panels with TypeScript, clean architecture and enterprise-level performance.",
        web_quote: "React.js (Next, SSR), Redux, TypeScript, SPA, HTML, CSS, REST API",
        support: "Tech Support",
        support_desc: "Proactive monitoring and maintenance: security updates, performance optimization and release management for web, mobile and hosting.",
        support_quote: "CDN, CI/CD pipelines, DevOps, Docker, Gitflow, Sentry, cloud services",
        marketing: "Marketing Services",
        marketing_desc: "Contextual and targeted advertising, marketing campaigns, ASO.",
        marketing_quote: "Google Ads, ASO, analytics, tracking key metrics (ROI)",
        analytics: "Analytics",
        analytics_desc: "Tracking custom and key events — control engagement, retention and revenue growth.",
        analytics_quote: "Firebase Analytics + GA4, AppMetrica, AppsFlyer"
      },
      tech_stack: {
        title: "Tech Stack",
        desc: "We provide custom software development services using proven technologies.",
        development: "Development",
        databases: "Databases",
        infrastructure: "Infrastructure"
      },
      direct_link_cta: {
        title: "Time to bring ideas to life together"
      },
      about_section: {
        desc1: "KIT Global is an integrated IT agency from Ukraine. We provide web and mobile product development services. We create projects for businesses, NGOs, educational and government institutions in Ukraine, Europe and the USA. The agency is focused on effective solutions.",
        desc2: "Our highly qualified team handles all stages of product creation — from audit to support and promotion of the finished project. Our clients value this, as they don't need to search for multiple contractors, development timelines are reduced and fair pricing is ensured."
      },
      team: {
        title: "Our Team",
        oleksii_name: "Oleksii, Co-owner",
        oleksii_role: "Our Leader & CEO of company",
        oleksandr_name: "Oleksandr, Co-owner",
        oleksandr_role: "Our Technical Brain & CTO",
        yulia_name: "Yulia",
        yulia_role: "Sales Manager",
        artem_mkt_name: "Artem",
        artem_mkt_role: "Head of Marketing",
        zakhar_name: "Zakhar",
        zakhar_role: "Lead Front-end Mobile Engineer",
        yaroslav_name: "Yaroslav",
        yaroslav_role: "Project Manager",
        anton_name: "Anton",
        anton_role: "QA Specialist",
        dmytro_fe_name: "Dmytro",
        dmytro_fe_role: "Lead Frontend Developer",
        valeriia_name: "Valeriia",
        valeriia_role: "Lead UX/UI Designer",
        daniil_name: "Daniil",
        daniil_role: "Back-end Developer",
        artem_be_name: "Artem",
        artem_be_role: "Team Lead Back-end Developer",
        dmytro_mob_name: "Dmytro",
        dmytro_mob_role: "Front-end Mobile Engineer",
        down_panel_title: "Our Great Team",
        down_panel_desc: "Our team creates flexible and effective solutions that help businesses grow. Thanks to professionalism and coordinated work, we build long-term partnerships."
      },
      contact_section: {
        title: "CONTACT US",
        desc: "We will create the ideal mobile application for you, functioning flawlessly and fulfilling all user and business needs."
      },
      reviews: {
        title: "Are you with us?",
        desc: "Read our client reviews and learn why over 3,000 companies chose Kit Global.",
        form_name: "Enter name*",
        form_phone: "Your phone number*",
        form_email: "Email address*",
        form_details: "Project details*",
        form_disclaimer: "* This site is protected by reCAPTCHA and subject to the Privacy Policy and Terms of Service",
        form_submit: "Submit"
      },
      footer: {
        desc: "KIT GLOBAL LLC — Outsourcing mobile & web app development and product company",
        edrpou: "EDRPOU 43344434",
        contacts: "Contacts",
        trusted: "Trusted by",
        location: "Location",
        address: "1st Naberezhna r. Strelky, 9A, Sumy, Ukraine"
      },
      modal: {
        title: "CONTACT US",
        name_placeholder: "Your Name*",
        phone_placeholder: "Your Phone Number*",
        email_placeholder: "Email Address*",
        details_placeholder: "Project Details*",
        disclaimer: "* This site is protected by reCAPTCHA and subject to the Privacy Policy and Terms of Service",
        submit: "Submit"
      },
      project_modal: {
        dev_type: "Development",
        timeline: "Development Timeline",
        overview: "Project Overview & Results"
      }
    }
  };

  const i18n = {
    getCurrentLang: () => {
      return localStorage.getItem('lang') || 'ua';
    },

    setLang: function (lang) {
      localStorage.setItem('lang', lang);
    },

    resolveKey: function (obj, key) {
      if (!obj || !key) return null;
      return key.split('.').reduce(function (acc, part) {
        return acc && acc[part] !== undefined ? acc[part] : null;
      }, obj);
    },

    t: function (key, lang) {
      const current = lang || this.getCurrentLang();
      const dict = DICTIONARY[current] || DICTIONARY['ua'];
      const val = this.resolveKey(dict, key);
      return val !== null && val !== undefined ? val : key;
    },

    getLocalized: function (val, lang) {
      if (!val) return '';
      if (typeof val === 'string') return val;
      const current = lang || this.getCurrentLang();
      return val[current] || val['ua'] || val['en'] || '';
    }
  };

  window.i18n = i18n;

  let currentLang = i18n.getCurrentLang();

  function applyTranslations(data) {
    if (!data) return;

    document.querySelectorAll('[data-i18n]').forEach((el) => {
      const key = el.getAttribute('data-i18n');
      const val = i18n.resolveKey(data, key);
      if (val) {
        if (el.querySelector('svg')) {
          for (let i = 0; i < el.childNodes.length; i++) {
            if (el.childNodes[i].nodeType === Node.TEXT_NODE && el.childNodes[i].textContent.trim()) {
              el.childNodes[i].textContent = val + ' ';
              break;
            }
          }
        } else {
          el.textContent = val;
        }
      }
    });

    document.querySelectorAll('[data-i18n-placeholder]').forEach((el) => {
      const key = el.getAttribute('data-i18n-placeholder');
      const val = i18n.resolveKey(data, key);
      if (val) el.setAttribute('placeholder', val);
    });
  }

  function switchLanguage(lang) {
    currentLang = lang;
    i18n.setLang(lang);

    const data = DICTIONARY[lang];
    if (data) applyTranslations(data);

    document.querySelectorAll('.lang-option').forEach((opt) => {
      opt.classList.toggle('active', opt.getAttribute('data-lang') === lang);
    });

    const activeOption = document.querySelector('.lang-option[data-lang="' + lang + '"]');
    if (activeOption) {
      const flagSVG = activeOption.querySelector('.lang-flag');
      const langName = activeOption.querySelector('span').textContent;

      document.querySelectorAll('.current-flag').forEach((cf) => {
        if (flagSVG) cf.innerHTML = flagSVG.outerHTML;
      });
      document.querySelectorAll('.current-lang-text').forEach((lt) => {
        lt.textContent = langName;
      });
    }

    document.querySelectorAll('.lang-dropdown').forEach((dd) => {
      dd.classList.remove('open');
    });

    document.dispatchEvent(new CustomEvent('languageChanged', { detail: { lang: lang } }));
  }

  function positionDropdown(triggerEl, dropdownEl, align) {
    const triggerRect = triggerEl.getBoundingClientRect();
    const headerInfo = triggerEl.closest('.content__info');
    const topY = headerInfo ? headerInfo.getBoundingClientRect().bottom : triggerRect.bottom;

    dropdownEl.style.top = `${topY}px`;
    if (align === 'right') {
      dropdownEl.style.left = '';
      dropdownEl.style.right = (window.innerWidth - triggerRect.right) + 'px';
    } else {
      dropdownEl.style.right = '';
      dropdownEl.style.left = `${triggerRect.left}px`;
    }
  }

  document.querySelectorAll('.change-lang').forEach((btn) => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const wrapper = btn.closest('.lang-dropdown-wrapper');
      if (!wrapper) return;
      const dropdown = wrapper.querySelector('.lang-dropdown');
      if (!dropdown) return;

      document.querySelectorAll('.products-dropdown.open').forEach(function (pd) {
        pd.classList.remove('open');
      });

      if (!dropdown.classList.contains('open')) positionDropdown(btn, dropdown, 'right');
      dropdown.classList.toggle('open');
    });
  });

  document.querySelectorAll('.lang-option').forEach(function (opt) {
    opt.addEventListener('click', function () {
      const lang = opt.getAttribute('data-lang');
      if (lang) switchLanguage(lang);
    });
  });

  switchLanguage(currentLang);

  const modal = document.getElementById('contact-modal');

  document.querySelectorAll('.contact-form').forEach(function (btn) {
    btn.addEventListener('click', function () {
      if (modal) modal.classList.add('active');
      document.body.style.overflow = 'hidden';
    });
  });

  const closeBtn = modal ? modal.querySelector('.modal-close-btn') : null;
  if (closeBtn) {
    closeBtn.addEventListener('click', () => {
      modal.classList.remove('active');
      document.body.style.overflow = '';
    });
  }

  if (modal) {
    modal.addEventListener('click', (e) => {
      if (e.target === modal) {
        modal.classList.remove('active');
        document.body.style.overflow = '';
      }
    });
  }

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && modal && modal.classList.contains('active')) {
      modal.classList.remove('active');
      document.body.style.overflow = '';
    }
  });

  document.querySelectorAll('form').forEach((form) => {
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const submitBtn = form.querySelector('button[type="submit"]');
      if (submitBtn) {
        const textTarget = submitBtn.querySelector('.btn-submit-text, span') || submitBtn;
        const originalText = textTarget.textContent;
        textTarget.textContent = '✓';
        setTimeout(function () {
          textTarget.textContent = originalText;
          const parentModal = form.closest('.modal-backdrop');
          if (parentModal) {
            parentModal.classList.remove('active');
            document.body.style.overflow = '';
          }
          form.reset();
        }, 1200);
      }
    });
  });

  document.querySelectorAll('.nav-dropdown-wrapper').forEach((wrapper) => {
    const btn = wrapper.querySelector('.nav__dropdown-btn');
    const menu = wrapper.querySelector('.nav-dropdown-menu');
    if (!btn || !menu) return;

    document.body.appendChild(menu);

    let hideTimer = null;

    function showMenu() {
      document.querySelectorAll('.nav-dropdown-menu.open, .lang-dropdown.open').forEach((other) => {
        if (other !== menu) other.classList.remove('open');
      });

      clearTimeout(hideTimer);
      positionDropdown(btn, menu, 'left');
      menu.classList.add('open');
    }

    function hideMenu() {
      hideTimer = setTimeout(() => {
        menu.classList.remove('open');
      }, 150);
    }

    wrapper.addEventListener('mouseenter', showMenu);
    wrapper.addEventListener('mouseleave', hideMenu);
    btn.addEventListener('mouseenter', showMenu);
    btn.addEventListener('mouseleave', hideMenu);
    menu.addEventListener('mouseenter', function () {
      clearTimeout(hideTimer);
    });
    menu.addEventListener('mouseleave', hideMenu);

    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      if (menu.classList.contains('open')) {
        menu.classList.remove('open');
      } else {
        showMenu();
      }
    });

    menu.querySelectorAll('a').forEach((link) => {
      link.addEventListener('click', () => {
        menu.classList.remove('open');
      });
    });
  });

  document.querySelectorAll('.lang-dropdown-wrapper').forEach((wrapper) => {
    const btn = wrapper.querySelector('.change-lang');
    const dropdown = wrapper.querySelector('.lang-dropdown');
    if (!btn || !dropdown) return;

    document.body.appendChild(dropdown);

    btn.addEventListener('click', function (e) {
      e.stopPropagation();
      document.querySelectorAll('.nav-dropdown-menu.open').forEach(function (pd) {
        pd.classList.remove('open');
      });

      if (!dropdown.classList.contains('open')) {
        positionDropdown(btn, dropdown, 'right');
      }
      dropdown.classList.toggle('open');
    });
  });

  document.addEventListener('click', function (e) {
    document.querySelectorAll('.lang-dropdown.open, .nav-dropdown-menu.open').forEach(function (dd) {
      if (!dd.contains(e.target)) {
        dd.classList.remove('open');
      }
    });
  });

  window.addEventListener('resize', function () {
    document.querySelectorAll('.lang-dropdown.open, .nav-dropdown-menu.open').forEach(function (m) {
      m.classList.remove('open');
    });
  });

  (function initReviewsCarousel() {
    const slide = document.getElementById('review-slide');
    const logo = document.getElementById('review-logo');
    const company = document.getElementById('review-company');
    const stack = document.getElementById('review-stack');
    const text = document.getElementById('review-text');
    const prevBtn = document.getElementById('review-prev');
    const nextBtn = document.getElementById('review-next');

    if (!slide || !logo || !company || !stack || !text || !prevBtn || !nextBtn) return;

    const reviewsData = [
      {
        company: 'Training Voice',
        logo: './images/icons/portfolio-cases/logo-microphone.svg',
        stack: 'React Native, Figma',
        text: {
          ua: '“Робота з командою була на найвищому рівні. Вони легко впоралися з викликами обробки аудіо в React Native, а дизайн-система, створена в Figma, дуже зручна для подальшого масштабування.”',
          en: '“Working with the team was a breeze. They handled the audio processing challenges in React Native with ease, and the design system they created in Figma is very easy to scale in the future.”'
        }
      },
      {
        company: 'Jeatasen Bil',
        logo: './images/icons/portfolio-cases/logo-jastean-bill.svg',
        stack: 'React Native, Figma',
        text: {
          ua: '“Фантастична робота над нашою автомобільною платформою. Їм вдалося інтегрувати складні функції обліку в дуже інтуїтивно зрозумілий інтерфейс. Продуктивність додатка як на iOS, так і на Android просто бездоганна.”',
          en: '“Fantastic work on our automotive platform. They managed to integrate complex inventory features into a very intuitive interface. The performance of the app on both iOS and Android is flawless.”'
        }
      },
      {
        company: 'Happy Feet',
        logo: './images/icons/portfolio-cases/logo-happy-feat.svg',
        stack: 'React Native, Figma',
        text: {
          ua: '“Команда створила бездоганний мобільний досвід. UI/UX дизайн у Figma був на найвищому рівні, а реалізація на React Native відчувається так само плавно, як і нативна програма. Дуже рекомендуємо для проєктів у сфері охорони здоров’я та велнесу!”',
          en: '“The team delivered a seamless mobile experience. The UI/UX design in Figma was top-notch, and the React Native implementation feels as smooth as a native app. Highly recommend for healthcare and wellness projects!”'
        }
      },
      {
        company: 'Maystry',
        logo: './images/icons/portfolio-cases/logo-maystry.svg',
        stack: 'React Native, Figma',
        text: {
          ua: '“Справжній прорив для нашого маркетплейсу послуг. Розробники ідеально зрозуміли нашу бізнес-логіку та перетворили її на красивий і функціональний додаток. Спілкування було прозорим і професійним протягом усього спринту.”',
          en: '“A game-changer for our service marketplace. The developers understood our business logic perfectly and translated it into a beautiful, functional app. Communication was transparent and professional throughout the sprint.”'
        }
      }
    ];

    let currentIndex = 0;
    let isAnimating = false;

    function updateCardContent(index) {
      const item = reviewsData[index];
      logo.src = item.logo;
      logo.alt = item.company;
      company.textContent = item.company;
      stack.textContent = item.stack;
      text.textContent = i18n.getLocalized(item.text);
    }

    function goToSlide(newIndex, direction) {
      if (isAnimating) return;
      isAnimating = true;

      const outClass = direction === 'next' ? 'slide-out-left' : 'slide-out-right';
      const inClass = direction === 'next' ? 'slide-in-left' : 'slide-in-right';

      slide.classList.add(outClass);

      setTimeout(function () {
        currentIndex = newIndex;
        updateCardContent(currentIndex);

        slide.classList.remove(outClass);
        slide.classList.add(inClass);

        void slide.offsetHeight;

        slide.classList.remove(inClass);
        slide.classList.add('slide-enter');

        setTimeout(function () {
          slide.classList.remove('slide-enter');
          isAnimating = false;
        }, 350);
      }, 300);
    }

    prevBtn.addEventListener('click', function () {
      const prevIndex = (currentIndex - 1 + reviewsData.length) % reviewsData.length;
      goToSlide(prevIndex, 'prev');
    });

    nextBtn.addEventListener('click', function () {
      const nextIndex = (currentIndex + 1) % reviewsData.length;
      goToSlide(nextIndex, 'next');
    });

    document.addEventListener('languageChanged', function (e) {
      const lang = e.detail && e.detail.lang ? e.detail.lang : i18n.getCurrentLang();
      const item = reviewsData[currentIndex];
      if (item && item.text) {
        text.textContent = i18n.getLocalized(item.text, lang);
      }
    });

    updateCardContent(currentIndex);
  })();

  (function initProjectModal() {
    const modal = document.getElementById('project-detail-modal');
    if (!modal) return;

    const pLogo = document.getElementById('pmodal-logo');
    const pTitle = document.getElementById('pmodal-title');
    const pSubtitle = document.getElementById('pmodal-subtitle');
    const pDevType = document.getElementById('pmodal-dev-type');
    const pTimeline = document.getElementById('pmodal-timeline');
    const pOverview = document.getElementById('pmodal-overview');
    const pImage = document.getElementById('pmodal-image');
    const closeBtn = modal.querySelector('.modal-close-btn');

    const PROJECTS_DATA = {
      'traning voice': {
        title: 'Traning Voice',
        subtitle: {
          ua: 'Мобільний додаток для інтелектуальних вокальних тренувань',
          en: 'Mobile application for intelligent vocal training'
        },
        logo: './images/icons/portfolio-cases/logo-microphone.svg',
        image: './images/icons/projects/project-training-voice.svg',
        devType: {
          ua: 'Кросплатформна',
          en: 'Cross-platform'
        },
        timeline: {
          ua: '1.5 місяці (+постійна підтримка)',
          en: '1.5 months (+ongoing support)'
        },
        overview: {
          ua: 'Мобільний додаток Voice Gym для вокальних тренерів був успішно реалізований і став ефективним інструментом для просування та монетизації авторських вокальних методик. Платформа дозволяє легко створювати тренувальні програми та забезпечує високий рівень залучення користувачів. Додаток значно спрощує щоденну практику для студентів, створює комфортне навчальне середовище та надає контент високої якості у зручному форматі.',
          en: 'The Voice Gym mobile application for vocal coaches was successfully implemented and became an effective tool for promoting and monetizing proprietary vocal techniques. The platform allows easy creation of training programs and ensures high user engagement. The application significantly simplifies daily practice for students, creates a comfortable learning environment, and delivers high-quality content in a convenient format.'
        }
      },
      'jeatasen bil': {
        title: 'Jeatasen Bil',
        subtitle: {
          ua: 'Лендінг для компанії по переобладнанню автомобілів',
          en: 'Landing page for vehicle conversion company'
        },
        logo: './images/icons/portfolio-cases/logo-jastean-bill.svg',
        image: './images/icons/projects/project-jeatasen-bil.svg',
        devType: {
          ua: 'Веб-розробка',
          en: 'Web Development'
        },
        timeline: {
          ua: '1 місяць (+супровід)',
          en: '1 month (+support)'
        },
        overview: {
          ua: 'Створено сучасний та висококонверсійний веб-сайт для компанії з професійного переобладнання автомобілів. Інтегровано інтерактивний каталог послуг, форму розрахунку вартості та зручну систему замовлення консультації. Проєкт досяг високих показників швидкості завантаження та конверсії.',
          en: 'Created a modern and high-converting website for a professional vehicle conversion company. Integrated an interactive service catalog, cost estimation form, and convenient consultation request system. The project achieved top page speed and conversion metrics.'
        }
      },
      'happy feet': {
        title: 'Happy Feet',
        subtitle: {
          ua: 'Сучасний лендінг для подологічної практики',
          en: 'Modern landing page for podiatry practice'
        },
        logo: './images/icons/portfolio-cases/logo-happy-feat.svg',
        image: './images/icons/projects/project-happy-feat.svg',
        devType: {
          ua: 'Веб-розробка / UI/UX',
          en: 'Web Development / UI/UX'
        },
        timeline: {
          ua: '3 тижні',
          en: '3 weeks'
        },
        overview: {
          ua: 'Розроблено елегантний та функціональний лендінг для медичного центру подології. Впроваджено зручний онлайн-запис до фахівців, систему відгуків та детальний перелік послуг. Завдяки сучасному UI/UX дизайну клієнтська база центру зросла на 40%.',
          en: 'Developed an elegant and functional landing page for a podiatry medical center. Implemented convenient online appointment scheduling, review system, and detailed service catalog. Thanks to modern UI/UX design, patient bookings grew by 40%.'
        }
      },
      'maystry': {
        title: 'Maystry',
        subtitle: {
          ua: 'Революційний додаток для пошуку роботи',
          en: 'Revolutionary job search app'
        },
        logo: './images/icons/portfolio-cases/logo-maystry.svg',
        image: './images/icons/projects/project-maystry.svg',
        devType: {
          ua: 'Мобільна розробка',
          en: 'Mobile Development'
        },
        timeline: {
          ua: '2 місяці',
          en: '2 months'
        },
        overview: {
          ua: 'Розроблено мобільну платформу для швидкого пошуку майстрів та вакансій у сфері послуг. Додаток включає геолокаційний пошук, безпечну систему відгуків, внутрішній чат та миттєві сповіщення. Проєкт показав високе залучення користувачів з перших днів запуску.',
          en: 'Developed a mobile platform for fast matching of skilled service providers and job vacancies. The application includes geolocation search, verified feedback system, in-app messaging, and instant notifications.'
        }
      },
      'bioclinic dental': {
        title: 'Bioclinic Dental',
        subtitle: {
          ua: 'Ваш розумний додаток для догляду за зубами',
          en: 'Your smart dental care app'
        },
        logo: './images/icons/portfolio-cases/logo-bioclinical-dental.svg',
        image: './images/icons/projects/project-boiclinical-dental.svg',
        devType: {
          ua: 'iOS / Android',
          en: 'iOS / Android'
        },
        timeline: {
          ua: '1.5 місяці',
          en: '1.5 months'
        },
        overview: {
          ua: 'Мобільний додаток для персоналізованого догляду за гігієною ротової порожнини. Включає розумні нагадування, календар візитів до стоматолога, розклад процедур та інтерактивні рекомендації фахівців.',
          en: 'Mobile app for personalized oral hygiene care. Features smart reminders, dental visit schedule, procedure tracking, and interactive expert recommendations.'
        }
      },
      'arias': {
        title: 'Arias',
        subtitle: {
          ua: 'Мобільний додаток для допомоги віртуальним медсестрам',
          en: 'Mobile app assistant for virtual nurses'
        },
        logo: './images/icons/portfolio-cases/logo-arias.svg',
        image: './images/icons/projects/project-arias.svg',
        devType: {
          ua: 'Кросплатформна',
          en: 'Cross-platform'
        },
        timeline: {
          ua: '2 місяці',
          en: '2 months'
        },
        overview: {
          ua: 'Спеціалізований мобільний додаток для медсестер та медичного персоналу. Дозволяє вести облік пацієнтів у реальному часі, відстежувати графіки прийому ліків та отримувати термінові сповіщення.',
          en: 'Specialized mobile app for nurses and healthcare personnel. Enables real-time patient management, medication tracking, and urgent notification alerts.'
        }
      }
    };

    let activeProjectKey = null;

    function populateModal(projectName) {
      const normalizedKey = projectName.trim().toLowerCase();
      const data = PROJECTS_DATA[normalizedKey];
      if (!data) return;

      activeProjectKey = normalizedKey;

      if (pLogo) { pLogo.src = data.logo; pLogo.alt = data.title; }
      if (pTitle) pTitle.textContent = data.title;
      if (pSubtitle) pSubtitle.textContent = i18n.getLocalized(data.subtitle);
      if (pDevType) pDevType.textContent = i18n.getLocalized(data.devType);
      if (pTimeline) pTimeline.textContent = i18n.getLocalized(data.timeline);
      if (pOverview) pOverview.textContent = i18n.getLocalized(data.overview);
      if (pImage) { pImage.src = data.image; pImage.alt = data.title; }
    }

    document.querySelectorAll('.card-container').forEach(function (card) {
      const btnArrow = card.querySelector('.btn-arrow');
      const titleEl = card.querySelector('.title-project');
      if (!titleEl) return;

      const projectName = titleEl.textContent.trim();

      if (btnArrow) {
        btnArrow.addEventListener('click', function (e) {
          e.stopPropagation();
          populateModal(projectName);
          modal.classList.add('active');
          document.body.style.overflow = 'hidden';
        });
      }

      card.addEventListener('click', function () {
        populateModal(projectName);
        modal.classList.add('active');
        document.body.style.overflow = 'hidden';
      });
    });

    if (closeBtn) {
      closeBtn.addEventListener('click', function () {
        modal.classList.remove('active');
        document.body.style.overflow = '';
      });
    }

    modal.addEventListener('click', function (e) {
      if (e.target === modal) {
        modal.classList.remove('active');
        document.body.style.overflow = '';
      }
    });

    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && modal.classList.contains('active')) {
        modal.classList.remove('active');
        document.body.style.overflow = '';
      }
    });

    document.addEventListener('languageChanged', function () {
      if (activeProjectKey) {
        populateModal(activeProjectKey);
      }
    });
  })();

  (function initProjectCategoryFilter() {
    const filterButtons = document.querySelectorAll('.project-tags .btn-gradient');
    const projectCards = document.querySelectorAll('.grid-for-column .card-container');

    if (!filterButtons.length || !projectCards.length) return;

    filterButtons.forEach(function (btn) {
      btn.addEventListener('click', function () {
        const category = btn.getAttribute('data-category');
        if (!category) return;

        filterButtons.forEach(function (b) {
          b.classList.remove('active');
        });
        btn.classList.add('active');

        projectCards.forEach(function (card) {
          const cardCategories = (card.getAttribute('data-category') || '').split(' ');

          if (category === 'all' || cardCategories.includes(category)) {
            card.style.display = '';
            card.style.opacity = '0';
            card.style.transform = 'translateY(10px)';
            requestAnimationFrame(function () {
              card.style.transition = 'opacity 0.3s ease, transform 0.3s ease';
              card.style.opacity = '1';
              card.style.transform = 'translateY(0)';
            });
          } else {
            card.style.display = 'none';
          }
        });
      });
    });
  })();

  (function initCountryCodePicker() {
    const pickers = document.querySelectorAll('.country-code-picker');
    if (!pickers.length) return;

    pickers.forEach(function (picker) {
      const selected = picker.querySelector('.ccp-selected');
      const dropdown = picker.querySelector('.ccp-dropdown');

      if (!selected || !dropdown) return;

      selected.addEventListener('click', function (e) {
        e.stopPropagation();
        pickers.forEach(function (p) {
          if (p !== picker) p.classList.remove('open');
        });
        picker.classList.toggle('open');
      });

      const options = dropdown.querySelectorAll('.ccp-option');
      options.forEach(function (option) {
        option.addEventListener('click', function (e) {
          e.stopPropagation();

          const code = option.getAttribute('data-code');
          const flagSvg = option.querySelector('svg');

          const codeSpan = selected.querySelector('.ccp-code');
          const flagContainer = selected.querySelector('.ccp-flag');

          if (codeSpan) codeSpan.textContent = code;
          if (flagContainer && flagSvg) {
            flagContainer.replaceWith(flagSvg.cloneNode(true));
            selected.querySelector('svg:first-child').classList.add('ccp-flag');
          }

          options.forEach(function (o) { o.classList.remove('active'); });
          option.classList.add('active');

          picker.classList.remove('open');
        });
      });
    });

    document.addEventListener('click', function (e) {
      pickers.forEach(function (picker) {
        if (!picker.contains(e.target)) {
          picker.classList.remove('open');
        }
      });
    });

    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') {
        pickers.forEach(function (picker) {
          picker.classList.remove('open');
        });
      }
    });
  })();

  (function initCustomVideoPlayer() {
    const video = document.getElementById('aboutVideo');
    const overlay = document.getElementById('videoPlayerOverlay');
    const playStateBtn = document.getElementById('playStateBtn');
    const playStateIcon = document.getElementById('playStateIcon');
    const muteBtn = document.getElementById('videoMuteBtn');
    const muteStateIcon = document.getElementById('muteStateIcon');

    if (!video || !overlay) return;

    const MUTE_SVG = '<svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M9.16669 3.91868C9.16652 3.80261 9.13197 3.68919 9.06741 3.59273C9.00284 3.49627 8.91115 3.4211 8.8039 3.3767C8.69665 3.33231 8.57866 3.32068 8.4648 3.34327C8.35095 3.36587 8.24635 3.42169 8.16419 3.50368L5.34419 6.32285C5.23536 6.43233 5.10588 6.51912 4.96326 6.5782C4.82065 6.63728 4.66772 6.66747 4.51335 6.66702H2.50002C2.27901 6.66702 2.06704 6.75481 1.91076 6.91109C1.75448 7.06737 1.66669 7.27934 1.66669 7.50035V12.5003C1.66669 12.7214 1.75448 12.9333 1.91076 13.0896C2.06704 13.2459 2.27901 13.3337 2.50002 13.3337H4.51335C4.66772 13.3332 4.82065 13.3634 4.96326 13.4225C5.10588 13.4816 5.23536 13.5684 5.34419 13.6778L8.16335 16.4978C8.24552 16.5802 8.35028 16.6363 8.46435 16.659C8.57842 16.6817 8.69667 16.6701 8.80412 16.6256C8.91158 16.581 9.00339 16.5056 9.06794 16.4088C9.13248 16.3121 9.16685 16.1983 9.16669 16.082V3.91868Z" stroke="white" stroke-width="1.66667" stroke-linecap="round" stroke-linejoin="round"/><path d="M18.3333 7.5L13.3333 12.5" stroke="white" stroke-width="1.66667" stroke-linecap="round" stroke-linejoin="round"/><path d="M13.3333 7.5L18.3333 12.5" stroke="white" stroke-width="1.66667" stroke-linecap="round" stroke-linejoin="round"/></svg>';
    const UNMUTE_SVG = '<svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M9.16669 3.91868C9.16652 3.80261 9.13197 3.68919 9.06741 3.59273C9.00284 3.49627 8.91115 3.4211 8.8039 3.3767C8.69665 3.33231 8.57866 3.32068 8.4648 3.34327C8.35095 3.36587 8.24635 3.42169 8.16419 3.50368L5.34419 6.32285C5.23536 6.43233 5.10588 6.51912 4.96326 6.5782C4.82065 6.63728 4.66772 6.66747 4.51335 6.66702H2.50002C2.27901 6.66702 2.06704 6.75481 1.91076 6.91109C1.75448 7.06737 1.66669 7.27934 1.66669 7.50035V12.5003C1.66669 12.7214 1.75448 12.9333 1.91076 13.0896C2.06704 13.2459 2.27901 13.3337 2.50002 13.3337H4.51335C4.66772 13.3332 4.82065 13.3634 4.96326 13.4225C5.10588 13.4816 5.23536 13.5684 5.34419 13.6778L8.16335 16.4978C8.24552 16.5802 8.35028 16.6363 8.46435 16.659C8.57842 16.6817 8.69667 16.6701 8.80412 16.6256C8.91158 16.581 9.00339 16.5056 9.06748 16.4088C9.13248 16.3121 9.16685 16.1983 9.16669 16.082V3.91868Z" stroke="white" stroke-width="1.66667" stroke-linecap="round" stroke-linejoin="round"/><path d="M12.5 7.5C13.163 8.16304 13.5355 9.06232 13.5355 10C13.5355 10.9377 13.163 11.837 12.5 12.5" stroke="white" stroke-width="1.66667" stroke-linecap="round" stroke-linejoin="round"/><path d="M15.5 4.5C16.9587 5.9587 17.7782 7.93696 17.7782 10C17.7782 12.063 16.9587 14.0413 15.5 15.5" stroke="white" stroke-width="1.66667" stroke-linecap="round" stroke-linejoin="round"/></svg>';

    if (playStateBtn) playStateBtn.style.opacity = '1';

    overlay.addEventListener('click', function () {
      if (video.paused || video.ended) {
        video.play().then(function () {
          if (playStateBtn) playStateBtn.style.opacity = '0';
        }).catch(function (err) {
          console.warn('Video play prevented:', err);
        });
      } else {
        video.pause();
        if (playStateBtn) playStateBtn.style.opacity = '1';
      }
    });

    video.addEventListener('play', function () {
      if (playStateBtn) playStateBtn.style.opacity = '0';
    });

    video.addEventListener('pause', function () {
      if (playStateBtn) playStateBtn.style.opacity = '1';
    });

    if (muteBtn) {
      muteBtn.addEventListener('click', function (e) {
        e.stopPropagation();
        video.muted = !video.muted;
        if (muteBtn) {
          muteBtn.innerHTML = video.muted ? MUTE_SVG : UNMUTE_SVG;
        }
      });
    }
  })();

  // Globe Map Interactive Hover & Country Tooltips
  (function initMapHover() {
    const globeContainer = document.querySelector('.globe-region-work');
    if (!globeContainer) return;

    const svg = globeContainer.querySelector('svg');
    if (!svg) return;

    let tooltip = document.querySelector('.globe-country-tooltip');
    if (!tooltip) {
      tooltip = document.createElement('div');
      tooltip.className = 'globe-country-tooltip';
      document.body.appendChild(tooltip);
    }

    const countryNamesUA = [
      "Сполучені Штати", "Канада", "Бразилія", "Велика Британія", "Німеччина",
      "Польща", "Україна", "Казахстан", "Об'єднані Арабські Емірати", "Індія",
      "Австралія", "Франція", "Іспанія", "Італія", "Японія"
    ];

    const countryNamesEN = [
      "United States", "Canada", "Brazil", "United Kingdom", "Germany",
      "Poland", "Ukraine", "Kazakhstan", "United Arab Emirates", "India",
      "Australia", "France", "Spain", "Italy", "Japan"
    ];

    const paths = svg.querySelectorAll('path');

    paths.forEach(function (path, index) {
      if (!path.hasAttribute('data-country-ua')) {
        const countryIndex = index % countryNamesUA.length;
        path.setAttribute('data-country-ua', countryNamesUA[countryIndex]);
        path.setAttribute('data-country-en', countryNamesEN[countryIndex]);
        path.setAttribute('data-path-id', 'country-path-' + (index + 1));
      }

      const originalFill = path.getAttribute('fill') || '#2C3046';
      path.dataset.originalFill = originalFill;
      path.style.pointerEvents = 'all';
      path.style.cursor = 'pointer';
      path.style.transition = 'fill 0.2s ease, filter 0.2s ease';

      function showTooltip(e) {
        const isHighlighted = originalFill.toUpperCase() === '#CAD3FF';
        path.setAttribute('fill', isHighlighted ? '#ff7e22' : '#ff9843');
        path.style.filter = 'drop-shadow(0px 0px 6px rgba(255, 110, 3, 0.6))';

        const lang = window.i18n ? window.i18n.getCurrentLang() : 'ua';
        const countryName = lang === 'en'
          ? path.getAttribute('data-country-en')
          : path.getAttribute('data-country-ua');

        tooltip.textContent = countryName;
        tooltip.classList.add('visible');

        const tooltipWidth = tooltip.offsetWidth || 120;
        const tooltipHeight = tooltip.offsetHeight || 32;
        tooltip.style.left = (e.pageX - tooltipWidth / 2) + 'px';
        tooltip.style.top = (e.pageY - tooltipHeight - 12) + 'px';
      }

      path.addEventListener('mouseenter', showTooltip);
      path.addEventListener('mouseover', showTooltip);

      path.addEventListener('mousemove', function (e) {
        const tooltipWidth = tooltip.offsetWidth || 120;
        const tooltipHeight = tooltip.offsetHeight || 32;
        tooltip.style.left = (e.pageX - tooltipWidth / 2) + 'px';
        tooltip.style.top = (e.pageY - tooltipHeight - 12) + 'px';
      });

      path.addEventListener('mouseleave', function () {
        path.setAttribute('fill', path.dataset.originalFill);
        path.style.filter = 'none';
        tooltip.classList.remove('visible');
      });
    });
  })();
})();

