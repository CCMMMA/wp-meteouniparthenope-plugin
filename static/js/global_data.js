let apiBaseUrl = "https://api.meteo.uniparthenope.it";

let apiProdBaseUrl = "https://api.meteo.uniparthenope.it/products";

let apiAviableLanguage = {en: "en-US", it: "it-IT"};
let browserLanguage = navigator.language;
let language = browserLanguage.substring(0,2);
let apiUsageLanguage = language === 'it' ? apiAviableLanguage['it'] : apiAviableLanguage['en'];

let METEOUNIP_PLUGING_DIR = globalData['PLUGIN_DIR'];
let METEOUNIP_PLUGIN_LOADING_DIR = globalData['LOADING_DIR'];

const METEOUNIP_PLUGIN_DEFAULT_PLACE = "it000";
const METEOUNIP_PLUGIN_DEFAULT_PRODUCT = "wrf5";
const METEOUNIP_PLUGIN_DEFAULT_OUTPUT = "gen";
const METEOUNIP_PLUGIN_DEFAULT_HOURS = 0;
const METEOUNIP_PLUGIN_DEFAULT_STEP = 1;

const METEOUNIP_PLUGIN_IMAGES_URL = 'https://api.meteo.uniparthenope.it/products/resource/forecast';

function value2Color(value,steps,colors){
    if(value < steps[0]){
        return RGBtoHEX(colors[0]);
    }
    
    if(value >= steps[steps.length - 1]){
        return RGBtoHEX(colors[colors.length-1]);
    }

    var index = 0;

    for(var i=0; i<colors.length-1; i++){
        if(value >= steps[i] && value < steps[i+1]){
            index = i;
        }
    }

    return RGBtoHEX(colors[index]);
}

// Converte array RGBA in codice esadecimale
function RGBtoHEX(rgbaArray) {
    if (!Array.isArray(rgbaArray)) {
        throw new Error('Input deve essere un array di 4 elementi [R,G,B,A]');
    }
    
    const [r, g, b, a] = rgbaArray;
    
    // Converte ogni componente in esadecimale
    const toHex = (n) => {
        const hex = Math.round(n).toString(16);
        return hex.length === 1 ? '0' + hex : hex;
    };
    
    return `#${toHex(r)}${toHex(g)}${toHex(b)}${toHex(a)}`;
}

const forecastTableColumns = {
    aiq3: {
        descs: ["Mussel Contamination Index (#)"],
        table: {
            colspan: ["2"],
            vars: ["mci-min","mci-max"]
        },
        subtable: {
            vars: ["mci"],
            colspan: ["1"],
        }
    },
    rms3: {
        descs: ["Current Direction at the surface (°N)", "Current Speed at the surface (m/s)", "Surface salinity", "Surface temperature (°C)"],
        table: {
            vars: ["scd-min","scd-max","scm-min","scm-max","sss-min","sss-max","sst-min","sst-max"],
            colspan: ["2","2","2","2"]
        },
        subtable: {
            vars: ["scd","scm","sss","sst"],
            colspan: ["1","1","1","1"]
        }
    },
    wcm3: {
        descs: ["Number of particles","Status evaluation (n)"],
        table: {
            vars: ["con-min","con-max","sts-min","sts-max"],
            colspan: ["2","2"]
        },
        subtable: {
            vars: ["con","sts"],
            colspan: ["1","1"]
        }
    },
    wrf5: {
        descs: ["T °C", "Wind (kn)", "Rain (mm)", "Pressure (hPa)", "Humidity (%)"],
        table: {
            vars: ["t2c-min","t2c-max","winds","ws10n","crh","slp","rh2"],
            colspan: ["2","2","1","1","1"],
        },
        subtable: {
            vars: ["t2c","winds","ws10n","crh","slp","rh2"],
            colspan: ["1","2","1","1","1"],
        }
    },
    ww33: {
        descs: ["Mean wave direction surface (°N)", "Peak frequency (s-1)", "Significant wave height (m)", "Mean wave length(m)", "Mean period (s)"],
        table: {
            vars: ["dir-min","dir-max","fp-min","fp-max","hs-min","hs-max","lm-min","lm-max","period-min","period-max"],
            colspan: ["2","2","2","2","2"]
        },
        subtable: {
            vars: ["dir","fp","hs","lm","period"],
            colspan: ["1","1","1","1","1"]
        }
    }
};