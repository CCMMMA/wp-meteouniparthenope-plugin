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

const instrumentsAvailableVariables = {
    'environment.wind.speedTrue': {
        label: 'Wind Speed',
        unit: 'kn',
        conversion: (val) => val * 1.94384,
        chartType: 'bar',
        color: 'rgb(54, 162, 235)'
    },
    'environment.wind.directionTrue': {
        label: 'Wind Direction',
        unit: '°N',
        conversion: (val) => val * (180/Math.PI),
        chartType: 'line',
        color: 'rgb(255, 99, 132)',
        min: 0,
        max: 360
    },
    'environment.outside.temperature': {
        label: 'Temperature',
        unit: '°C',
        conversion: (val) => val - 273.15,
        chartType: 'line',
        color: 'rgb(255, 159, 64)'
    },
    'environment.outside.relativeHumidity': {
        label: 'Relative Humidity',
        unit: '%',
        conversion: (val) => val * 100,
        chartType: 'line',
        color: 'rgb(153, 102, 255)',
        min: 0,
        max: 100
    },
    'environment.outside.pressure': {
        label: 'Pressure',
        unit: 'hPa',
        conversion: (val) => val / 100,
        chartType: 'line',
        color: 'rgb(75, 192, 192)'
    },
    'environment.outside.humidity': {
        label: 'Humidity',
        unit: '%',
        conversion: (val) => val * 100,
        chartType: 'line',
        color: 'rgb(153, 102, 255)',
        min: 0,
        max: 100
    },
    'environment.rain.rate': {
        label: 'Rain Rate',
        unit: 'mm/h',
        conversion: (val) => val,
        chartType: 'bar',
        color: 'rgb(100, 149, 237)',
        min: 0
    }
}

const instrumentsVariablesMaker = {
    'speedTrue': 'environment.wind.speedTrue',
    'directionTrue': 'environment.wind.directionTrue',
    'temperature': 'environment.outside.temperature',
    'relativeHumidity': 'environment.outside.relativeHumidity',
    'pressure': 'environment.outside.pressure',
    'humidity': 'environment.outside.humidity',
    'rate': 'environment.rain.rate'
}

const instrumentsLatLon = {
    'urn:mrn:signalk:fqdn:ws1_meteo_uniparthenope_it': {longitude: 14.2946362, latitude: 40.8564635},
    'urn:mrn:signalk:fqdn:ws2_meteo_uniparthenope_it': {longitude: 14.1857291, latitude: 40.7916162},
    'urn:mrn:signalk:fqdn:ws3_meteo_uniparthenope_it': {longitude: 14.1717236, latitude: 40.805184},
    'urn:mrn:signalk:fqdn:ws4_meteo_uniparthenope_it': {longitude: 14.47455, latitude: 40.71688},
    'urn:mrn:signalk:fqdn:ws5_meteo_uniparthenope_it': {longitude: 13.9843, latitude: 40.9723},
    'urn:mrn:signalk:fqdn:ws6_meteo_uniparthenope_it': {longitude: 14.2533, latitude: 40.8371},
    'urn:mrn:signalk:fqdn:ws7_meteo_uniparthenope_it': {longitude: 14.2154588, latitude: 40.823327},
    'urn:mrn:signalk:fqdn:ws8_meteo_uniparthenope_it': {longitude: 14.3637172, latitude: 40.6056503},
    'urn:mrn:signalk:fqdn:ws9_meteo_uniparthenope_it': {longitude: 14.2804091, latitude: 40.856508},
}

const instrumentsNames = {
    'urn:mrn:signalk:fqdn:ws1_meteo_uniparthenope_it': "Centro Direzionale",
    'urn:mrn:signalk:fqdn:ws2_meteo_uniparthenope_it': "Gaiola",
    'urn:mrn:signalk:fqdn:ws3_meteo_uniparthenope_it': "Città della Scienza",
    'urn:mrn:signalk:fqdn:ws4_meteo_uniparthenope_it': "Marina di Stabia",
    'urn:mrn:signalk:fqdn:ws5_meteo_uniparthenope_it': "Castel Volturno",
    'urn:mrn:signalk:fqdn:ws6_meteo_uniparthenope_it': "Via Acton",
    'urn:mrn:signalk:fqdn:ws7_meteo_uniparthenope_it': "",
    'urn:mrn:signalk:fqdn:ws8_meteo_uniparthenope_it': "Sant'Agata",
    'urn:mrn:signalk:fqdn:ws9_meteo_uniparthenope_it': "",
}