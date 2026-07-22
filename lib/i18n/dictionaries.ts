export type Locale = "fa" | "en";

export const DEFAULT_LOCALE: Locale = "fa";
export const LOCALE_STORAGE_KEY = "filmchi-locale";

export type Dictionary = {
  whoWatching: string;
  whoWatchingSub: string;
  gender: string;
  female: string;
  male: string;
  nonBinary: string;
  preferNotToSay: string;
  age: string;
  agePlaceholder: string;
  location: string;
  countryAndCity: string;
  useCurrentLocation: string;
  locating: string;
  tapToShareLocation: string;
  country: string;
  selectCountry: string;
  city: string;
  selectCountryForCities: string;
  continue: string;
  back: string;
  skip: string;
  finish: string;
  pressEnter: string;
  skipStory: string;
  ageSub: string;
  genderSub: string;
  locationSub: string;
  countrySub: string;
  citySub: string;
  weather: string;
  weatherSub: string;
  sunny: string;
  cloudy: string;
  rainy: string;
  snowy: string;
  howFeeling: string;
  howFeelingSub: string;
  happy: string;
  sad: string;
  romantic: string;
  thrill: string;
  chill: string;
  adventurous: string;
  nostalgic: string;
  anythingElse: string;
  anythingElseSub: string;
  yourStory: string;
  storyPlaceholder: string;
  whenWithWhom: string;
  whenWithWhomSub: string;
  watchTime: string;
  morning: string;
  morningHint: string;
  afternoon: string;
  afternoonHint: string;
  night: string;
  nightHint: string;
  watchingWith: string;
  alone: string;
  family: string;
  friends: string;
  partner: string;
  colleagues: string;
  findingFilms: string;
  findMyMovies: string;
  suggestionOf: string;
  startOver: string;
  nextMovie: string;
  findNewPicks: string;
  completeRequired: string;
  recommendFailed: string;
  somethingWrong: string;
  geoNotSupported: string;
  geoDenied: string;
  searchCountry: string;
  locationSearchSub: string;
  noCountryFound: string;
  markWatched: string;
  alreadyWatched: string;
  newResults: string;
  watchedResults: string;
  moviePosterAlt: string;
  langFa: string;
  langEn: string;
  theme: string;
  themeLight: string;
  themeDark: string;
  countries: Record<string, string>;
  ageWarningText: string;
  ageWarningGoBack: string;
  ageWarningContinue: string;
};

export const dictionaries: Record<Locale, Dictionary> = {
  fa: {
    whoWatching: "کی می‌خواد فیلم ببینه؟",
    whoWatchingSub: "کمی از خودت بگو تا فیلمچی پیشنهادها را دقیق‌تر کند.",
    gender: "جنسیت",
    female: "زن",
    male: "مرد",
    nonBinary: "غیردوگانه",
    preferNotToSay: "ترجیح می‌دهم نگویم",
    age: "سن",
    agePlaceholder: "مثلاً ۲۸",
    location: "موقعیت",
    countryAndCity: "کشور و شهر",
    useCurrentLocation: "موقعیت فعلی من",
    locating: "در حال یافتن موقعیت…",
    tapToShareLocation: "برای اشتراک‌گذاری موقعیت، گزینه بالا را بزن.",
    country: "کشور",
    selectCountry: "انتخاب کشور",
    city: "شهر",
    selectCountryForCities: "برای دیدن شهرها یک کشور انتخاب کن.",
    continue: "ادامه",
    back: "قبلی",
    skip: "رد کردن",
    finish: "تمام",
    pressEnter: "Enter را بزن تا بری مرحله بعد",
    skipStory: "رد کردن این مرحله",
    ageSub: "سنت چند ساله؟",
    genderSub: "یکی را انتخاب کن",
    locationSub: "یکی را انتخاب کن",
    countrySub: "کشورت را انتخاب کن",
    citySub: "شهرت را انتخاب کن",
    weather: "آب و هوا",
    weatherSub: "هوای الان چطوره؟",
    sunny: "صاف",
    cloudy: "ابری",
    rainy: "بارانی",
    snowy: "برفی",
    howFeeling: "حالت چطوره؟",
    howFeelingSub: "حال‌وهوایی که الان داری را انتخاب کن.",
    happy: "شاد",
    sad: "غمگین",
    romantic: "رمانتیک",
    thrill: "هیجان",
    chill: "آروم",
    adventurous: "ماجراجو",
    nostalgic: "نوستالژیک",
    anythingElse: "چیز دیگه‌ای؟",
    anythingElseSub:
      "اختیاری — یک داستان کوتاه یا جزئیات حال‌وهوا بنویس تا پیشنهادها بهتر شوند.",
    yourStory: "داستان تو",
    storyPlaceholder: "مثلاً روز سختی داشتم، چیزی گرم و بامزه می‌خوام…",
    whenWithWhom: "کی و با کی؟",
    whenWithWhomSub: "زمان روز و همراهانت نوع فیلم مناسب را مشخص می‌کنند.",
    watchTime: "زمان تماشا",
    morning: "صبح",
    morningHint: "نور نرم، شروع تازه",
    afternoon: "بعدازظهر",
    afternoonHint: "آرامش در روشنایی روز",
    night: "شب",
    nightHint: "چراغ‌ها خاموش، پرده بزرگ",
    watchingWith: "تماشا با",
    alone: "تنها",
    family: "خانواده",
    friends: "دوستان",
    partner: "پارتنر",
    colleagues: "همکاران",
    findingFilms: "در حال پیدا کردن فیلم‌ها…",
    findMyMovies: "پیدا کردن فیلم‌ها",
    suggestionOf: "پیشنهاد {current} از {total}",
    startOver: "شروع دوباره",
    nextMovie: "فیلم بعدی",
    findNewPicks: "پیشنهادهای جدید",
    completeRequired: "لطفاً همه فیلدهای لازم را پر کن.",
    recommendFailed: "نتوانستیم پیشنهادی بگیریم",
    somethingWrong: "مشکلی پیش آمد. دوباره تلاش کن.",
    geoNotSupported: "موقعیت‌یابی در این مرورگر پشتیبانی نمی‌شود.",
    geoDenied:
      "دسترسی به موقعیت ممکن نشد. لطفاً کشور و شهر را انتخاب کن.",
    searchCountry: "جستجوی کشور…",
    locationSearchSub: "کشورت را از لیست انتخاب کن یا جستجو کن.",
    noCountryFound: "کشوری یافت نشد.",
    markWatched: "قبلاً این فیلم رو دیدم",
    alreadyWatched: "دیده شده ✓",
    newResults: "نتایج جدید",
    watchedResults: "فیلم‌هایی که دیدی",
    moviePosterAlt: "پوستر {title}",
    langFa: "فارسی",
    langEn: "English",
    theme: "تم",
    themeLight: "روشن",
    themeDark: "تیره",
    ageWarningText: "برخی از فیلم‌های پیشنهادی ممکن است برای سن شما مناسب نباشند. آیا می‌خواهید ادامه دهید؟",
    ageWarningGoBack: "بازگشت",
    ageWarningContinue: "ادامه",
    countries: {
      "United States": "ایالات متحده",
      "United Kingdom": "بریتانیا",
      Canada: "کانادا",
      Germany: "آلمان",
      France: "فرانسه",
      Italy: "ایتالیا",
      Spain: "اسپانیا",
      Netherlands: "هلند",
      Sweden: "سوئد",
      Norway: "نروژ",
      Denmark: "دانمارک",
      Iran: "ایران",
      Turkey: "ترکیه",
      "United Arab Emirates": "امارات متحده عربی",
      India: "هند",
      Japan: "ژاپن",
      "South Korea": "کره جنوبی",
      Australia: "استرالیا",
      Brazil: "برزیل",
      Mexico: "مکزیک",
      Argentina: "آرژانتین",
      Egypt: "مصر",
      "South Africa": "آفریقای جنوبی",
      Russia: "روسیه",
      China: "چین",
    },
  },
  en: {
    whoWatching: "Who's watching?",
    whoWatchingSub: "Tell us a little about you so Filmchi can tune the picks.",
    gender: "Gender",
    female: "Female",
    male: "Male",
    nonBinary: "Non-binary",
    preferNotToSay: "Prefer not to say",
    age: "Age",
    agePlaceholder: "e.g. 28",
    location: "Location",
    countryAndCity: "Country & city",
    useCurrentLocation: "Use current location",
    locating: "Locating…",
    tapToShareLocation: "Tap above to share your location.",
    country: "Country",
    selectCountry: "Select country",
    city: "City",
    selectCountryForCities: "Select a country to see cities.",
    continue: "Continue",
    back: "Previous",
    skip: "Skip",
    finish: "Finish",
    pressEnter: "Press Enter to continue",
    skipStory: "Skip this step",
    ageSub: "How old are you?",
    genderSub: "Pick one",
    locationSub: "Pick one",
    countrySub: "Pick your country",
    citySub: "Pick your city",
    weather: "Weather",
    weatherSub: "What's the weather like?",
    sunny: "Sunny",
    cloudy: "Cloudy",
    rainy: "Rainy",
    snowy: "Snowy",
    howFeeling: "How are you feeling?",
    howFeelingSub: "Pick the mood that fits right now.",
    happy: "Happy",
    sad: "Sad",
    romantic: "Romantic",
    thrill: "Thrill",
    chill: "Chill",
    adventurous: "Adventurous",
    nostalgic: "Nostalgic",
    anythingElse: "Anything else?",
    anythingElseSub:
      "Optional — share a short story or mood detail to refine the picks.",
    yourStory: "Your story",
    storyPlaceholder: "e.g. Long day at work, need something warm and funny…",
    whenWithWhom: "When & with whom?",
    whenWithWhomSub: "Time of day and company shape the right kind of film.",
    watchTime: "Watch time",
    morning: "Morning",
    morningHint: "Soft light, fresh start",
    afternoon: "Afternoon",
    afternoonHint: "Daylight unwind",
    night: "Night",
    nightHint: "Lights down, big screen",
    watchingWith: "Watching with",
    alone: "Alone",
    family: "Family",
    friends: "Friends",
    partner: "Partner",
    colleagues: "Colleagues",
    findingFilms: "Finding films…",
    findMyMovies: "Find my movies",
    suggestionOf: "Suggestion {current} of {total}",
    startOver: "Start over",
    nextMovie: "Next movie",
    findNewPicks: "Find new picks",
    completeRequired: "Please complete all required fields.",
    recommendFailed: "Could not get recommendations",
    somethingWrong: "Something went wrong. Try again.",
    geoNotSupported: "Geolocation is not supported in this browser.",
    geoDenied:
      "Could not access your location. Please select country and city.",
    searchCountry: "Search country…",
    locationSearchSub: "Pick your country from the list or search for it.",
    noCountryFound: "No country found.",
    markWatched: "I've already seen this",
    alreadyWatched: "Watched ✓",
    newResults: "New picks",
    watchedResults: "Movies you've seen",
    moviePosterAlt: "{title} poster",
    langFa: "فارسی",
    langEn: "English",
    theme: "Theme",
    themeLight: "Light",
    themeDark: "Dark",
    ageWarningText: "Some of the suggested movies may not be suitable for your age. Do you want to continue?",
    ageWarningGoBack: "Go back",
    ageWarningContinue: "Continue",
    countries: {
      "United States": "United States",
      "United Kingdom": "United Kingdom",
      Canada: "Canada",
      Germany: "Germany",
      France: "France",
      Italy: "Italy",
      Spain: "Spain",
      Netherlands: "Netherlands",
      Sweden: "Sweden",
      Norway: "Norway",
      Denmark: "Denmark",
      Iran: "Iran",
      Turkey: "Turkey",
      "United Arab Emirates": "United Arab Emirates",
      India: "India",
      Japan: "Japan",
      "South Korea": "South Korea",
      Australia: "Australia",
      Brazil: "Brazil",
      Mexico: "Mexico",
      Argentina: "Argentina",
      Egypt: "Egypt",
      "South Africa": "South Africa",
      Russia: "Russia",
      China: "China",
    },
  },
};

export function formatMessage(
  template: string,
  vars: Record<string, string | number>,
): string {
  return Object.entries(vars).reduce(
    (text, [key, value]) => text.replaceAll(`{${key}}`, String(value)),
    template,
  );
}
