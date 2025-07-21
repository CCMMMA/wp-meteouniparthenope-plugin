let apiBaseUrl = "https://api.meteo.uniparthenope.it";

let apiProdBaseUrl = "https://api.meteo.uniparthenope.it/products";

let apiAviableLanguage = {en: "en-US", it: "it-IT"};
let browserLanguage = navigator.language;
let language = browserLanguage.substring(0,2);
let apiUsageLanguage = language === 'it' ? apiAviableLanguage['it'] : apiAviableLanguage['en'];

let METEOUNIP_PLUGING_DIR = globalData['PLUGIN_DIR'];
let METEOUNIP_PLUGIN_LOADING_DIR = globalData['LOADING_DIR'];