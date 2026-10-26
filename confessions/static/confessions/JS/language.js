const translations = {
  en: {
    // Navigation
    nav_home: "Home",
    nav_confession: "Confession",
    nav_profile: "Profile",
    nav_about_us: "About Us",
    nav_dark_mode: "Dark mode",
    nav_light_mode: "Light mode",
    nav_login: "Login",
    nav_logout: "Logout",
    nav_register: "Register",
    nav_main_navigation: "Main navigation",
    nav_open_menu: "Open navigation menu",
    nav_close_menu: "Close navigation menu",
    document_title: "Spill — Let it out, leave your name out.",
    aria_like_confession: "Like confession",
    aria_unlike_confession: "Unlike confession",
    aria_close_confession: "Close confession form",
    aria_edit_profile: "Edit profile",
    aria_latest_confessions: "Latest confessions",
    aria_confession_pages: "Confession pages",
    theme_switch_to_dark: "Switch to dark mode",
    theme_switch_to_light: "Switch to light mode",
    language_switch_to_km: "KM",
    language_switch_to_en: "EN",
    language_aria_switch_to_km: "Switch language to Khmer",
    language_aria_switch_to_en: "Switch language to English",
    footer_tagline: "Let it out, leave your name out.",
    footer_navigation: "Footer navigation",
    footer_rights:
      "Angkor University | Naing Vannath, In Nary, Tan Rithyvireak, Morm Sophearoth.",
    // Wall and Welcome page
    welcome_title: "Welcome to Spill",
    welcome_title_prefix: "Welcome ",
    welcome_title_suffix: " to Spill",
    welcome_intro:
      "A kind, anonymous place to share your thoughts, feelings, and experiences without attaching your name.",
    welcome_how:
      "Write what is on your mind, share it with the community, and read or react to the thoughts others have chosen to share.",
    btn_explore: "Explore Confessions",
    btn_share_thoughts: "Share Your Thoughts",
    about_kicker: "A little about Spill",
    about_title: "Anonymous Confession Platform - Spill",
    about_intro:
      "Spill is creating by using Python with Djago Framework and PostgreSQL",
    about_mission_title: "Our purpose",
    about_mission:
      "We created Spill to make it easier to express thoughts and experiences, read what others choose to share, and respond with care.",
    about_value_privacy_title: "Privacy first",
    about_value_privacy:
      "Confessions are shared anonymously on the wall, so the focus stays on the words.",
    about_value_kindness_title: "Kindness matters",
    about_value_kindness:
      "We encourage thoughtful sharing and respectful responses.",
    about_value_connection_title: "We are here together",
    about_value_connection:
      "A reaction or a kind comment can remind someone that they are not alone.",
    about_team_title: "The team behind Spill",
    about_team_jump: "Our Team Structure",
    about_back_top: "Back to top",
    about_team_intro:
      "Develop by students of Angkor University | Year3 Semester1 | Python Programming II Subject.",
    about_member_professor: "Khoeurt Sopha - Professor",
    about_member_leader: "Naing Vannath - Leader, Backend",
    about_member_in_nary: "In Nary - Frontend",
    about_member_tan: "Tan Rithyvireak - Frontend",
    about_member_morm: "Morm Sophearoth - Tester",
    // Confession Page & Modal
    modal_kicker: "This space is yours",
    modal_title: "Write Your Confession",
    label_your_confession: "Your confession",
    label_character_count: "Character count",
    error_inappropriate_language:
      "Please remove inappropriate language before posting.",
    compose_footer_hint: "Up to 1000 characters. Please keep it kind.",
    btn_post_anonymously: "Post anonymously",
    btn_floating_confess: "Confess",
    activity_kicker: "Together, one whisper at a time",//គួរតែលុចចោល
    activity_title: "Community activity",//គួរតែលុចចោល
    stat_whispers_shared: "Whispers shared",
    stat_community_reactions: "Community reactions",
    heading_latest_whispers: "Latest whispers",
    btn_newer_confessions: "Newer confessions",
    btn_older_confessions: "Older confessions",
    text_shared_count: "shared",
    empty_title: "The wall is quiet",
    empty_desc: "There are no whispers yet. Be the first to share one.",
    link_write_first: "Write the first whisper",
    link_login_write_first: "Log in to write the first whisper",
    // Confession Card & Reactions
    read_full_whisper: "Read full whisper",
    show_less: "Show less",
    btn_like: "Like",
    btn_unlike: "Unlike",
    btn_comment_reply: "Comment and Reply",
    btn_delete_confession: "Delete",
    delete_confession_confirm:
      "Are you sure you want to delete this confession?",
    delete_confession_error:
      "Could not delete this confession. Please try again.",
    comments_modal_kicker: "Conversation",
    comments_modal_title: "Comments and replies",
    comments_modal_close: "Close comments",
    placeholder_comment: "Write a comment...",
    placeholder_reply: "Write a reply...",
    btn_reply: "Reply",
    btn_post_comment: "Post",
    comments_empty: "No comments yet. Be the first!",
    comments_load_error: "Could not refresh comments. Please try again.",
    placeholder_confession: "Type your confession here... (keep it kind)",
    // Profile Page
    profile_kicker: "Your private space",
    label_email: "Email",
    label_username: "Username",
    label_member_since: "Member since",
    label_confirm_password: "Password confirmation",
    label_whispers_shared_profile: "Whispers shared",
    profile_privacy_note:
      "Your account details are private. Your confessions remain anonymous on the wall.",
    profile_history_title: "Your confession history",
    profile_empty_title: "Your story starts here",
    profile_empty_desc: "You have not shared a confession yet.",
    profile_first_whisper: "Write your first whisper",
    // Authentication (Login & Signup)
    login_title: "Welcome back",
    signup_title: "Create your account",
    btn_login: "Log in",
    btn_signup: "Sign up",
    label_password: "Password",
    no_account_prompt: "Don't have an account?",
    have_account_prompt: "Already have an account?",
    signup_here: "Sign up here",
    login_here: "Log in here",
    auth_eyebrow: "LET IT OUT, LEAVE YOUR NAME OUT.",
    auth_story_heading: "Some things feel lighter when shared.",
    auth_story_intro:
      "Make room for the thoughts you have been carrying around.",
    auth_note_label: "A NOTE TO SELF",
    auth_note_message: "You can be honest here.",
    auth_story_footer: "READ, WRITE, LET GO",
    login_kicker: "GOOD TO HAVE YOU BACK",
    login_intro: "Sign in and pick up where you left off.",
    signup_kicker: "YOUR SPACE STARTS HERE",
    signup_intro: "Just the basics. You can share when you are ready.",
    signup_username_optional:
      "Optional. Leave blank to auto-generate a username.",
    signup_password_similarity:
      "Your password can’t be too similar to your other personal information.",
    signup_password_min_length:
      "Your password must contain at least 8 characters.",
    signup_password_common: "Your password can’t be a commonly used password.",
    signup_password_numeric: "Your password can’t be entirely numeric.",
    signup_password_confirmation_hint:
      "Enter the same password as before, for verification.",
    profile_settings_title: "My Profile",
    profile_close_settings: "Close profile settings",
    profile_current_password: "Current password",
    profile_new_password: "New password",
    profile_current_password_hint: "Only needed if changing password",
    profile_new_password_hint: "Leave blank to keep current",
    profile_cancel: "Cancel",
    profile_save_changes: "Save changes",
  },
  km: {
    // Navigation
    nav_home: "ទំព័រដើម",
    nav_confession: "សារភាព",
    nav_profile: "គណនី",
    nav_about_us: "អំពីយើង",
    nav_dark_mode: "ផ្ទៃងងឹត",
    nav_light_mode: "ផ្ទៃភ្លឺ",
    nav_login: "ចូលគណនី",
    nav_logout: "ចាកចេញពីគណនី",
    nav_register: "ចុះឈ្មោះ",
    nav_main_navigation: "មីនុយរុករក",
    nav_open_menu: "បើកមីនុយរុករក",
    nav_close_menu: "បិទមីនុយរុករក",
    document_title: "Spill — បញ្ចេញអារម្មណ៍ ដោយមិនបង្ហាញឈ្មោះ។",
    aria_like_confession: "ចូលចិត្តសារសារភាព",
    aria_unlike_confession: "មិនចូលចិត្តសារសារភាព",
    aria_close_confession: "បិទទម្រង់សារសារភាព",
    aria_edit_profile: "កែសម្រួលគណនី",
    aria_latest_confessions: "សារសារភាពចុងក្រោយ",
    aria_confession_pages: "ទំព័រសារសារភាព",
    theme_switch_to_dark: "ប្ដូរទៅផ្ទៃងងឹត",
    theme_switch_to_light: "ប្ដូរទៅផ្ទៃភ្លឺ",
    language_switch_to_km: "ភាសាខ្មែរ",
    language_switch_to_en: "English",
    language_aria_switch_to_km: "ប្តូរភាសាទៅជាភាសាខ្មែរ",
    language_aria_switch_to_en: "ប្តូរភាសាទៅជាភាសាអង់គ្លេស",
    footer_tagline: "បញ្ចេញអារម្មណ៍ ដោយមិនបង្ហាញឈ្មោះ។",
    footer_navigation: "ការស្វែងរកផ្នែកខាងក្រោម",
    footer_rights:
      "សាកលវិទ្យាល័យអង្គរ | ណាំង វ៉ាន់ណាត់, អុិន ណារី, តាន់ រឹទ្ធីវីរៈ, ម៉ម សុភារ័ត្ន។",
    // Wall / Welcome Page
    welcome_title: "សូមស្វាគមន៍មកកាន់ Spill",
    welcome_title_prefix: "សូមស្វាគមន៍ ",
    welcome_title_suffix: " មកកាន់ Spill",
    welcome_intro:
      "ទីកន្លែងអនាមិក អាថ៌កំបាំង ដើម្បីចែករំលែកអារម្មណ៍ គំនិត និងបទពិសោធន៍របស់អ្នកដោយមិនបង្ហាញឈ្មោះ។",
    welcome_how:
      "សរសេរអ្វីដែលមានក្នុងចិត្ត ចែករំលែកជាមួយគ្នា និងអាន ឬប្រតិកម្មចំពោះគំនិតរបស់អ្នកដទៃ។",
    btn_explore: "ស្វែងរកសារសារភាព",
    btn_share_thoughts: "ចែករំលែកអារម្មណ៍របស់អ្នក",
    about_kicker: "ស្វែងយល់បន្តិចអំពី Spill",
    about_title: "វេទិការសារភាពបែបអនាមិក - Spill",
    about_intro:
      "Spill បង្កើតឡើងដោយប្រើប្រាស់ភាសា Python ជាមួយនិង Django Framework និង PostgeSQL",
    about_mission_title: "គោលបំណងរបស់យើង",
    about_mission:
      "យើងបង្កើត Spill ដើម្បីឱ្យការបញ្ចេញគំនិត និងបទពិសោធន៍ ការអានអ្វីដែលអ្នកដទៃចែករំលែក និងការឆ្លើយតបដោយការយកចិត្តទុកដាក់ កាន់តែងាយស្រួល។",
    about_value_privacy_title: "ឯកជនភាពជាចម្បង",
    about_value_privacy:
      "សារសារភាពត្រូវបានចែករំលែកដោយអនាមិក ដើម្បីផ្តោតលើខ្លឹមសារនៃសារ។",
    about_value_kindness_title: "សីលធម៌មានសារៈសំខាន់",
    about_value_kindness:
      "យើងលើកទឹកចិត្តឱ្យចែករំលែកដោយគិតគូរ និងឆ្លើយតបដោយការគោរព។",
    about_value_connection_title: "យើងនៅទីនេះជាមួយគ្នា",
    about_value_connection:
      "ប្រតិកម្ម ឬមតិយោបល់ដ៏ល្អមួយ អាចរំឭកនរណាម្នាក់ថាពួកគេមិននៅម្នាក់ឯងទេ។",
    about_team_title: "ក្រុមការងារនៅពីក្រោយ Spill",
    about_team_jump: "រចនាសម្ព័ន្ធក្រុមរបស់យើង",
    about_back_top: "ត្រឡប់ទៅខាងលើ",
    about_team_intro:
      "អភិវឌ្ឍន៍ដោយនិស្សិតសាកលវិទ្យាល័យអង្គរ | ឆ្នាំទី៣ | ឆមាស១ | មុខវិជ្ជា Python Programming II។",
    about_member_professor: "ខឿត សុផា - សាស្ត្រាចារ្យ",
    about_member_leader: "ណាំង វ៉ាន់ណាត់ - ប្រធានក្រុម, Backend",
    about_member_in_nary: "អុិន ណារី - Frontend",
    about_member_tan: "តាន់ រឹទ្ធីវីរៈ - Frontend",
    about_member_morm: "ម៉ម សុភារ័ត្ន - Tester",
    // Confession Page & Modal
    modal_kicker: "ទីកន្លែងនេះជារបស់អ្នក",
    modal_title: "សរសេរសារសារភាពរបស់អ្នក",
    label_your_confession: "សារសារភាពរបស់អ្នក",
    label_character_count: "ចំនួនតួអក្សរ",
    error_inappropriate_language: "សូមលុបពាក្យមិនសមរម្យចេញ មុនពេលបង្ហោះ។",
    compose_footer_hint: "អតិបរមា ១០០០ តួអក្សរ។ សូមរក្សាពាក្យសម្តីសមរម្យ។",
    btn_post_anonymously: "បង្ហោះជាអនាមិក",
    btn_floating_confess: "សារភាព",
    activity_kicker: "រួមគ្នា ម្តងមួយសារ",
    activity_title: "សកម្មភាពសហគមន៍",
    stat_whispers_shared: "សារដែលបានចែករំលែក",
    stat_community_reactions: "ប្រតិកម្មសហគមន៍",
    heading_latest_whispers: "សារសារភាពចុងក្រោយ",
    btn_newer_confessions: "សារសារភាពថ្មីជាង",
    btn_older_confessions: "សារសារភាពចាស់ជាង",
    text_shared_count: "បានចែករំលែក",
    empty_title: "ផ្ទាំងសារស្ងប់ស្ងាត់ណាស់",
    empty_desc: "មិនទាន់មានសារនៅឡើយទេ។ ក្លាយជាអ្នកដំបូងគេក្នុងការចែករំលែក។",
    link_write_first: "សរសេរសារដំបូងគេ",
    link_login_write_first: "ចូលប្រើដើម្បីសរសេរសារដំបូងគេ",
    // Confession Card & Reactions
    read_full_whisper: "អានសារពេញលេញ",
    show_less: "បង្រួមវិញ",
    btn_like: "ចូលចិត្ត",
    btn_unlike: "មិនចូលចិត្ត",
    btn_comment_reply: "មតិ និងឆ្លើយតប",
    btn_delete_confession: "លុប",
    delete_confession_confirm: "តើអ្នកប្រាកដថាចង់លុបសារសារភាពនេះឬ?",
    delete_confession_error: "មិនអាចលុបសារសារភាពនេះបានទេ។ សូមព្យាយាមម្តងទៀត។",
    comments_modal_kicker: "ការសន្ទនា",
    comments_modal_title: "មតិ និងការឆ្លើយតប",
    comments_modal_close: "បិទមតិ",
    placeholder_comment: "សរសេរមតិ...",
    placeholder_reply: "សរសេរចម្លើយ...",
    btn_reply: "ឆ្លើយតប",
    btn_post_comment: "បង្ហោះ",
    comments_empty: "មិនទាន់មានមតិទេ។ ក្លាយជាអ្នកដំបូង!",
    comments_load_error: "មិនអាចធ្វើបច្ចុប្បន្នភាពមតិបានទេ។ សូមព្យាយាមម្ដងទៀត។",
    placeholder_confession:
      "សរសេរសារសារភាពរបស់អ្នកនៅទីនេះ... (សូមរក្សាពាក្យសម្តីសមរម្យ)",
    // Profile Page
    profile_kicker: "ភាពឯកជនរបស់អ្នក",
    label_email: "អ៊ីមែល",
    label_username: "ឈ្មោះអ្នកប្រើប្រាស់",
    label_member_since: "ជាសមាជិកតាំងពី",
    label_confirm_password: "បញ្ជាក់ពាក្យសម្ងាត់",
    label_whispers_shared_profile: "សារដែលបានចែករំលែក",
    profile_privacy_note:
      "ព័ត៌មានគណនីរបស់អ្នកត្រូវបានរក្សាការសម្ងាត់។ សារសារភាពរបស់អ្នកនៅតែជាអនាមិកនៅលើផ្ទាំងសារ។",
    profile_history_title: "ប្រវត្តិសារសារភាពរបស់អ្នក",
    profile_empty_title: "ដំណើររឿងរបស់អ្នកចាប់ផ្តើមនៅទីនេះ",
    profile_empty_desc: "អ្នកមិនទាន់បានចែករំលែកសារសារភាពនៅឡើយទេ។",
    profile_first_whisper: "សរសេរសារដំបូងរបស់អ្នក",
    // Authentication (Login & Signup)
    login_title: "សូមស្វាគមន៍មកវិញ",
    signup_title: "បង្កើតគណនីរបស់អ្នក",
    btn_login: "ចូលប្រើ",
    btn_signup: "ចុះឈ្មោះ",
    label_password: "ពាក្យសម្ងាត់",
    no_account_prompt: "មិនទាន់មានគណនីមែនទេ?",
    have_account_prompt: "មានគណនីរួចហើយមែនទេ?",
    signup_here: "ចុះឈ្មោះនៅទីនេះ",
    login_here: "ចូលប្រើនៅទីនេះ",
    auth_eyebrow: "បញ្ចេញអារម្មណ៍ ដោយមិនបង្ហាញឈ្មោះ។",
    auth_story_heading: "ការចែករំលែកអាចធ្វើឱ្យអារម្មណ៍ស្រាលជាងមុន។",
    auth_story_intro: "ចែករំលែកគំនិតដែលអ្នកបានគិតទុកក្នុងចិត្ត។",
    auth_note_label: "សាររំលឹកខ្លួនឯង",
    auth_note_message: "អ្នកអាចនិយាយដោយស្មោះត្រង់នៅទីនេះ។",
    auth_story_footer: "អាន សរសេរ និងបញ្ចេញអារម្មណ៍",
    login_kicker: "រីករាយដែលអ្នកត្រឡប់មកវិញ",
    login_intro: "ចូលប្រើ ហើយបន្តពីកន្លែងដែលអ្នកបានផ្អាក។",
    signup_kicker: "ទីកន្លែងរបស់អ្នកចាប់ផ្តើមនៅទីនេះ",
    signup_intro: "បំពេញព័ត៌មានមូលដ្ឋាន។ អ្នកអាចចែករំលែកនៅពេលរួចរាល់។",
    signup_username_optional:
      "ជាជម្រើស។ ទុកចោលដើម្បីបង្កើតឈ្មោះអ្នកប្រើប្រាស់ដោយស្វ័យប្រវត្តិ។",
    signup_password_similarity:
      "ពាក្យសម្ងាត់មិនគួរស្រដៀងនឹងព័ត៌មានផ្ទាល់ខ្លួនផ្សេងទៀតរបស់អ្នកពេកទេ។",
    signup_password_min_length: "ពាក្យសម្ងាត់ត្រូវមានយ៉ាងតិច ៨ តួអក្សរ។",
    signup_password_common:
      "ពាក្យសម្ងាត់មិនគួរជាពាក្យសម្ងាត់ដែលគេប្រើញឹកញាប់ទេ។",
    signup_password_numeric: "ពាក្យសម្ងាត់មិនអាចមានតែលេខទាំងស្រុងបានទេ។",
    signup_password_confirmation_hint:
      "សូមបញ្ចូលពាក្យសម្ងាត់ដដែលម្តងទៀតដើម្បីផ្ទៀងផ្ទាត់។",
    profile_settings_title: "គណនីរបស់ខ្ញុំ",
    profile_close_settings: "បិទការកំណត់គណនី",
    profile_current_password: "ពាក្យសម្ងាត់បច្ចុប្បន្ន",
    profile_new_password: "ពាក្យសម្ងាត់ថ្មី",
    profile_current_password_hint: "ត្រូវការតែនៅពេលផ្លាស់ប្តូរពាក្យសម្ងាត់",
    profile_new_password_hint: "ទុកចោលដើម្បីរក្សាពាក្យសម្ងាត់បច្ចុប្បន្ន",
    profile_cancel: "បោះបង់",
    profile_save_changes: "រក្សាទុកការផ្លាស់ប្តូរ",
  },
};

function changeLanguage(lang, persist = true) {
  if (!Object.hasOwn(translations, lang)) {
    lang = "en";
  }

  document.documentElement.lang = lang;

  const items = document.querySelectorAll("[data-i18n]");
  items.forEach((item) => {
    const key = item.getAttribute("data-i18n");
    if (typeof translations[lang][key] === "string") {
      item.textContent = translations[lang][key];
    }
  });

  document.querySelectorAll("[data-i18n-placeholder]").forEach((item) => {
    const key = item.getAttribute("data-i18n-placeholder");
    if (typeof translations[lang][key] === "string") {
      item.setAttribute("placeholder", translations[lang][key]);
    }
  });

  document.querySelectorAll("[data-i18n-aria-label]").forEach((item) => {
    const key = item.getAttribute("data-i18n-aria-label");
    if (typeof translations[lang][key] === "string") {
      item.setAttribute("aria-label", translations[lang][key]);
    }
  });

  const themeLabel = document.querySelector(".theme-toggle-label");
  const themeToggle = document.getElementById("theme-toggle");
  if (themeLabel && themeToggle) {
    const isDark = document.documentElement.dataset.theme === "dark";
    const themeKey = isDark ? "nav_light_mode" : "nav_dark_mode";
    themeLabel.textContent = translations[lang][themeKey];
    themeToggle.setAttribute(
      "aria-label",
      translations[lang][
        isDark ? "theme_switch_to_light" : "theme_switch_to_dark"
      ],
    );
  }

  const languageToggle = document.getElementById("language-toggle");
  if (languageToggle) {
    const nextLang = lang === "en" ? "km" : "en";
    const languageKey =
      nextLang === "en" ? "language_switch_to_en" : "language_switch_to_km";
    languageToggle.textContent = translations[lang][languageKey];
    languageToggle.setAttribute(
      "aria-label",
      translations[lang][
        nextLang === "en"
          ? "language_aria_switch_to_en"
          : "language_aria_switch_to_km"
      ],
    );
  }

  const navToggle = document.getElementById("site-nav-toggle");
  if (navToggle) {
    const isOpen = navToggle.getAttribute("aria-expanded") === "true";
    navToggle.setAttribute(
      "aria-label",
      translations[lang][isOpen ? "nav_close_menu" : "nav_open_menu"],
    );
  }

  if (persist) {
    try {
      localStorage.setItem("selectedLanguage", lang);
    } catch (error) {
      console.warn("Unable to save the selected language.", error);
    }
  }

  document.dispatchEvent(new Event("app:languagechange"));
}

document.addEventListener("htmx:afterSwap", () => {
  changeLanguage(document.documentElement.lang, false);
});

document.addEventListener("DOMContentLoaded", () => {
  let savedLang = "en";
  try {
    savedLang = localStorage.getItem("selectedLanguage") || savedLang;
  } catch (error) {
    console.warn("Unable to read the saved language.", error);
  }
  changeLanguage(savedLang);

  const languageToggle = document.getElementById("language-toggle");
  if (languageToggle) {
    languageToggle.addEventListener("click", () => {
      changeLanguage(document.documentElement.lang === "en" ? "km" : "en");
    });
  }
});
