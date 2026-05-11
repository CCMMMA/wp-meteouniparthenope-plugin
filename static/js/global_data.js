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
        label: 'Wind Speed True',
        unit: 'kn',
        conversion: (val) => val * 1.94384,
        chartType: 'bar',
        color: 'rgb(54, 162, 235)'
    },
    'environment.wind.directionTrue': {
        label: 'Wind Direction True',
        unit: '°N',
        conversion: (val) => val * (180/Math.PI),
        chartType: 'line',
        color: 'rgb(255, 99, 132)',
        min: 0,
        max: 360
    },
    'environment.outside.temperature': {
        label: 'Outside Temperature',
        unit: '°C',
        conversion: (val) => val - 273.15,
        chartType: 'line',
        color: 'rgb(255, 159, 64)'
    },
    'environment.outside.relativeHumidity': {
        label: 'Outside Relative Humidity',
        unit: '%',
        conversion: (val) => val * 100,
        chartType: 'line',
        color: 'rgb(153, 102, 255)',
        min: 0,
        max: 100
    },
    'environment.outside.pressure': {
        label: 'Outside Pressure',
        unit: 'hPa',
        conversion: (val) => val / 100,
        chartType: 'line',
        color: 'rgb(75, 192, 192)'
    },
    'environment.outside.humidity': {
        label: 'Outside Humidity',
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
    },

    // ── Nuove entries ──────────────────────────────────────────────

    'environment.UV': {
        label: 'UV Index',
        unit: 'index',
        conversion: (val) => val,
        chartType: 'bar',
        color: 'rgb(238, 130, 238)',
        min: 0
    },
    'environment.inside.relativeHumidity': {
        label: 'Inside Relative Humidity',
        unit: '%',
        conversion: (val) => val * 100,
        chartType: 'line',
        color: 'rgb(179, 102, 255)',
        min: 0,
        max: 100
    },
    'environment.inside.temperature': {
        label: 'Inside Temperature',
        unit: '°C',
        conversion: (val) => val - 273.15,
        chartType: 'line',
        color: 'rgb(255, 205, 86)'
    },
    'environment.outside.evapoTranspiration.day': {
        label: 'Evapotranspiration Day',
        unit: 'mm',
        conversion: (val) => val,
        chartType: 'bar',
        color: 'rgb(60, 179, 113)',
        min: 0
    },
    'environment.outside.evapoTranspiration.month': {
        label: 'Evapotranspiration Month',
        unit: 'mm',
        conversion: (val) => val,
        chartType: 'bar',
        color: 'rgb(46, 139, 87)',
        min: 0
    },
    'environment.outside.evapoTranspiration.year': {
        label: 'Evapotranspiration Year',
        unit: 'mm',
        conversion: (val) => val,
        chartType: 'bar',
        color: 'rgb(34, 100, 60)',
        min: 0
    },
    'environment.outside.pressureTrend': {
        label: 'Pressure Trend',
        unit: 'hPa/h',
        conversion: (val) => val / 100,
        chartType: 'line',
        color: 'rgb(95, 192, 192)'
    },
    'environment.precipitation.rate': {
        label: 'Precipitation Rate',
        unit: 'mm/h',
        conversion: (val) => val,
        chartType: 'bar',
        color: 'rgb(70, 130, 180)',
        min: 0
    },
    'environment.rain.day': {
        label: 'Rain Day',
        unit: 'mm',
        conversion: (val) => val,
        chartType: 'bar',
        color: 'rgb(100, 160, 237)',
        min: 0
    },
    'environment.rain.month': {
        label: 'Rain Month',
        unit: 'mm',
        conversion: (val) => val,
        chartType: 'bar',
        color: 'rgb(80, 140, 210)',
        min: 0
    },
    'environment.rain.storm.total': {
        label: 'Rain Storm Total',
        unit: 'mm',
        conversion: (val) => val,
        chartType: 'bar',
        color: 'rgb(60, 110, 190)',
        min: 0
    },
    'environment.rain.year': {
        label: 'Rain Year',
        unit: 'mm',
        conversion: (val) => val,
        chartType: 'bar',
        color: 'rgb(40, 90, 170)',
        min: 0
    },
    'environment.solar.radiation': {
        label: 'Solar Radiation',
        unit: 'W/m²',
        conversion: (val) => val,
        chartType: 'line',
        color: 'rgb(255, 215, 0)',
        min: 0
    },
    'environment.sun.rise': {
        label: 'Sunrise',
        unit: 'time',
        conversion: (val) => val,
        chartType: 'line',
        color: 'rgb(255, 180, 50)'
    },
    'environment.sun.set': {
        label: 'Sunset',
        unit: 'time',
        conversion: (val) => val,
        chartType: 'line',
        color: 'rgb(255, 120, 50)'
    },
    'environment.weather.forecast.icon': {
        label: 'Weather Forecast Icon',
        unit: '',
        conversion: (val) => val,
        chartType: 'line',
        color: 'rgb(135, 206, 235)'
    },
    'environment.weather.forecast.ruleNumber': {
        label: 'Weather Forecast Rule Number',
        unit: '',
        conversion: (val) => val,
        chartType: 'line',
        color: 'rgb(100, 180, 220)'
    },
    'environment.wind.angleApparent': {
        label: 'Wind Angle Apparent',
        unit: '°',
        conversion: (val) => val * (180/Math.PI),
        chartType: 'line',
        color: 'rgb(255, 80, 120)',
        min: 0,
        max: 360
    },
    'environment.wind.speedApparent': {
        label: 'Wind Speed Apparent',
        unit: 'kn',
        conversion: (val) => val * 1.94384,
        chartType: 'bar',
        color: 'rgb(54, 130, 200)',
        min: 0
    },
    'environment.wind.speedAverage': {
        label: 'Wind Speed Average',
        unit: 'kn',
        conversion: (val) => val * 1.94384,
        chartType: 'bar',
        color: 'rgb(54, 100, 180)',
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
    'it_uniparthenope_meteo_ws1': {longitude: 14.2946362, latitude: 40.8564635},
    'it_uniparthenope_meteo_ws2': {longitude: 14.1857291, latitude: 40.7916162},
    'it_uniparthenope_meteo_ws3': {longitude: 14.1717236, latitude: 40.805184},
    'it_uniparthenope_meteo_ws4': {longitude: 14.47455, latitude: 40.71688},
    'it_uniparthenope_meteo_ws5': {longitude: 13.9843, latitude: 40.9723},
    'it_uniparthenope_meteo_ws6': {longitude: 14.2533, latitude: 40.8371},
    'it_uniparthenope_meteo_ws7': {longitude: 14.2154588, latitude: 40.823327},
    'it_uniparthenope_meteo_ws8': {longitude: 14.3637172, latitude: 40.6056503}
    //'urn:mrn:signalk:fqdn:ws9_meteo_uniparthenope_it': {longitude: 14.2804091, latitude: 40.856508},
}

const instrumentsNames = {
    'it_uniparthenope_meteo_ws1': "Centro Direzionale",
    'it_uniparthenope_meteo_ws2': "Gaiola",
    'it_uniparthenope_meteo_ws3': "Città della Scienza",
    'it_uniparthenope_meteo_ws4': "Marina di Stabia",
    'it_uniparthenope_meteo_ws5': "Castel Volturno",
    'it_uniparthenope_meteo_ws6': "Via Acton",
    //'urn:mrn:signalk:fqdn:ws7_meteo_uniparthenope_it': "",
    'it_uniparthenope_meteo_ws8': "Sant'Agata dei Due Golfi",
    //'urn:mrn:signalk:fqdn:ws9_meteo_uniparthenope_it': "",
}