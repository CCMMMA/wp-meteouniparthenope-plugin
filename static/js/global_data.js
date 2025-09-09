let apiBaseUrl = "https://api.meteo.uniparthenope.it";

let apiProdBaseUrl = "https://api.meteo.uniparthenope.it/products";

let apiAviableLanguage = {en: "en-US", it: "it-IT"};
let browserLanguage = navigator.language;
let language = browserLanguage.substring(0,2);
let apiUsageLanguage = language === 'it' ? apiAviableLanguage['it'] : apiAviableLanguage['en'];

let METEOUNIP_PLUGING_DIR = globalData['PLUGIN_DIR'];
let METEOUNIP_PLUGIN_LOADING_DIR = globalData['LOADING_DIR'];

let conColors = [
    "#FFFFFF",
    "#CCFFFF",
    "#3366FF",
    "#00CC00",
    "#FFFF00",
    "#FF3301",
    "#660033"
];

let mciColors = [
    "#FFFFFF",
    "#3366FF",
    "#00CC00",
    "#FFFF00",
    "#FF3301",
    "#660033"
];

let scmColors = [
    "#F8F0FD",
    "#E1CAFF",
    "#60F3F0",
    "#30FC4B",
    "#FEF400",
    "#FFA302",
    "#F60000",
    "#C0C0C0",

];

let sssColors = [
    "#1001F3",
    "#0076FF",
    "#04B6FF",
    "#AEFE00",
    "#FFFF00",
    "#FF9403",
    "#DB0200",
    "#DBADAC"
];

let sstColors = [
    "#140756",
    "#4141C7",
    "#206EEB",
    "#459CFB",
    "#7FB7F4",
    "#B5F1F5",
    "#D0FAC4",
    "#00D580",
    "#0FA609",
    "#82D718",
    "#D5ED05",
    "#FDFD26",
    "#F6D403",
    "#F3A000",
    "#FC6608",
    "#F60305",
    "#C00A18",
    "#680A06",
    "#720008",
    "#97009C",
    "#FF05FF",
    "#FDB0F9"

];

let tempColors = [
    "#2400d8",
    "#181cf7",
    "#2857ff",
    "#3d87ff",
    "#56b0ff",
    "#75d3ff",
    "#99eaff",
    "#bcf8ff",
    "#eaffff",
    "#ffffea",
    "#fff1bc",
    "#ffd699",
    "#ffff75",
    "#ff7856",
    "#ff3d3d",
    "#f72735",
    "#d8152f",
    "#a50021"
];

let windColors = [
    "#000033",
    "#0117BA",
    "#011FF3",
    "#0533FC",
    "#1957FF",
    "#3B8BF4",
    "#4FC6F8",
    "#68F5E7",
    "#77FEC6",
    "#92FB9E",
    "#A8FE7D",
    "#CAFE5A",
    "#EDFD4D",
    "#F5D03A",
    "#EFA939",
    "#FA732E",
    "#E75326",
    "#EE3021",
    "#BB2018",
    "#7A1610",
    "#641610"
];

let hsColors = [
    "#01FF84",
    "#00FFFF",
    "#00DDDD",
    "#6363FF",
    "#0000E1",
    "#840094",
    "#B5199D",
    "#D464C3",
    "#CE0000",
    "#FF0000",
    "#FFC300",
    "#FFF05A",
    "#D0D0D0",
    "#BABABA",
    "#A1A1A1",
    "#5A5A5A"
];

let lmColors = [
    "#00CE7B",
    "#00AA00",
    "#7BCE00",
    "#FFCE00",
    "#FF6D00",
    "#DC0000",
    "#A00000",
    "#DC84D1",
    "#B5199D",
    "#640078",
    "#DCDCDC",
    "#AAAAAA",
    "#6E6E6E",
    "#464646"
];

let fpColors = [
    "#70be77",
    "#589a25",
    "#90c233",
    "#e8cb3c",
    "#d27120",
    "#aa2f0c",
    "#751b07",
    "#bd82c6",
    "#8c2c8b",
    "#430d62",
    "#ddddd9",
    "#a1a19f",
    "#60605e",
    "#3a3a39"
];

let periodColors = [
    "#00CE7B",
    "#00AA00",
    "#7BCE00",
    "#FFCE00",
    "#FF6D00",
    "#DC0000",
    "#A00000",
    "#DC84D1",
    "#B5199D",
    "#640078",
    "#DCDCDC",
    "#AAAAAA",
    "#6E6E6E",
    "#464646"
];

let rhColors = [
    "#FF0000",
    "#FFFF00",
    "#00FF00",
    "#00FFFF",
    "#0078DC",
    "#FF00FF"
];

/*
let sweColors = [
    "#000000",
    "#DDA0DD",
    "#DA70D6",
    "#BA55D3",
    "#9932CC",
    "#9400D3"
];
*/

//new
let wn4Colors = [
    "#FFFFFF",
    "#F0FFFF",
    "#A7DCE7",
    "##51A5F4", 
    "#1FD178",
    "#15A000",
    "#E01500",
    "#A50000",
    "#FD01FF",
    "#FEA8FF",
    "#FD9500",
    "#F96401",
    "#AAABAB"

]

//new 
let gpColors = [
    "#351B2F",
    "#411C3E",
    "#79217B",
    "#591F55",
    "#441C31",
    "#312C4C",
    "#131E73",
    "#2120AF",
    "#2220F1",
    "#1136E7",
    "#4DA1FE",
    "#5CC1E3",
    "#6BCFD2",
    "#92EB9E",
    "#73BA4F",
    "#7CBF40",
    "#B2B938",
    "#DCD06E",
    "#CCBA74",
    "#F7E979",
    "#CEAF5E",
    "#C36A2B",
    "#C03F22",
    "#EB5C4E",
    "#C32A22",
    "#A12329",
    "#671E26",
    "#481822",
    "#4D1D27",
    "#242129"

]

//new 
let wn2Colors = [
    "#02018a",
    "#303893",
    "#497cb5",
    "#6ca6ca",
    "#84bcd7",
    "#98cce0",
    "#a5d7e6",
    "#e4e4e4",
    "#fefabb",
    "#fee39c",
    "#fecc82",
    "#fdab64",
    "#f7724a",
    "#e74e37",
    "#ca2328"
]

// new 
let tspColors = [
    "#02017e",
    "#0400c0",
    "#1564d0",
    "#2582f0",
    "#50a4f4",
    "#77b9fa",
    "#96d1fa",
    "#b4f0fa",
    "#e5ffe5",
    "#befab4",
    "#1fce7b",
    "#17aa00",
    "#7bce00",
    "#cee702",
    "#ffff26",
    "#fece02",
    "#fd9c01",
    "#fd6401",
    "#fc0001",
    "#ce0201",
    "#a00001",
    "#800100",
    "#690301",
    "#a0786e",
    "#785045",
    "#5a352a",
    "#b4b5b5",
    "#818181",
    "#fd82ff",
    "#fd01ff",
    "#9a029b"
]

// new 
let precipitationColors = [
    "#e3d5ca",
    "#9fffff",
    "#65ffff",
    "#41c3ff",
    "#429bff",
    "#5a63ff",
    "#414aff",
    "#3cbb3c",
    "#a4d720",
    "#fee602",
    "#fec202",
    "#fd7d01",
    "#fb0001",
    "#c80300",
    "#d364c2",
    "#b5189d",
    "#840094",
    "#b4b4b4",
    "#8c8c8c",
    "#5a5a5a",
    "#323232",
    "#a47823",
    "#805201",
    "#643201",
    "#502300",
]

// new
let uhColors = [
    "#dadada",
    "#2ffffe",
    "#30ffc3",
    "#31ff54",
    "#7bff55",
    "#a1ff56",
    "#ffff56",
    "#fee052",
    "#fc9f4a",
    "#fd6245",
    "#fc2340",
    "#c64d96",
    "#fee3fd"
]

// new 
let s3Colors = [
    "#1630f6",
    "#2754f6",
    "#3571f6",
    "#428bf9",
    "#5cbff8",
    "#66d3f9",
    "#6fe4f0",
    "#77f4e9",
    "#78f6e6",
    "#7afae1",
    "#62c361",
    "#7fd199",
    "#8dde42",
    "#b0ee4f",
    "#d6fe5d",
    "#d6fe5b",
    "#f2fb53",
    "#fae64c",
    "#f6cd45",
    "#f2b13d",
    "#f0ab3b",
    "#ed9736",
    "#ec8031",
    "#ea662b",
    "#e84526",
    "#e83a24",
    "#e73623",
    "#c6291c",
    "#a12015",
    "#83170f",
    "#83170f"
]

// new 
let sst_Colors = [
    "#cbcbcb",
    "#0e0076",
    "#2d22bb",
    "#225aee",
    "#2a70ec",
    "#66a8f9",
    "#a7edf8",
    "#b2fca5",
    "#1cc364",
    "#149804",
    "#6ac804",
    "#c3e609",
    "#ffff21",
    "#fdc60a",
    "#fc8908",
    "#fc4b07",
    "#fb0007",
    "#5a0001",
    "#710001",
    "#fb00ff",
    "#fd93ff"
]

// new 
let cloudColors = [
    "#a8a8a8",
    "#dcdcdc",
    "#cdcdcd",
    "#bebebe",
    "#afafaf",
    "#a5a5a5",
    "#969696",
    "#727272",
    "#5a5a5a"
    
]

const chartColorFunctions = {
    clf: cloudcolor,
    t2c: tspCcolor,
    ws10n: windKnt2color,
    crh: precipitationcolor,
    rh2: rh2color,
    gph500: gp5color,
    gph850: gp8color,
    delta_wspd10: wn2color,
    ws10k: wn4color,
    crd: precipitationcolor,
    uh: uhcolor,
    con: con2color,
    mci: mci2color,
    scm: scm2color,
    sst: sstcolor,
    sss: s3color,
    sst: sst2color,
    hs: hs2color,
    lm: lm2color,
    fp: fp2color,
    period: period2color,
}

/*
function swe2color(rh) {
    let index=0;

    // .5 2.5 5.5 8.5 11.5 15.5

    if (rh<.5) {
        index=0;
    } else if (rh>=.5 && rh<2.5) {
        index=1;
    } else if (rh>=2.5 && rh<5.5) {
        index=2;
    } else if (rh>=5.5 && rh<8.5) {
        index=3;
    } else if (rh>=8.5 && rh<11.5) {
        index=4;
    } else if (rh>=11.5) {
        index=5;
    }

    return sweColors[index];
}
*/

// new 
function cloudcolor(gen) {
    let index = 0;

    // 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9, 1.0

    if (gen < 0.2) {
        index = 0;
    } else if (gen >= 0.2 && gen < 0.3) {
        index = 1;
    } else if (gen >= 0.3 && gen < 0.4) {
        index = 2;
    } else if (gen >= 0.4 && gen < 0.5) {
        index = 3;
    } else if (gen >= 0.5 && gen < 0.6) {
        index = 4;
    } else if (gen >= 0.6 && gen < 0.7) {
        index = 5;
    } else if (gen >= 0.7 && gen < 0.8) {
        index = 6;
    } else if (gen >= 0.8 && gen < 0.9) {
        index = 7;
    } else if (gen >= 0.9 && gen < 1.0) {
        index = 8;
    } else if (gen >= 1.0) {
        index = 9;
    }

    return cloudColors[index];
    
}

// new 
function sstcolor(sst) {
    let index = 0;

    // 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30

    if (sst < 11) {
        index = 0;
    } else if (sst >= 11 && sst < 12) {
        index = 1;
    } else if (sst >= 12 && sst < 13) {
        index = 2;
    } else if (sst >= 13 && sst < 14) {
        index = 3;
    } else if (sst >= 14 && sst < 15) {
        index = 4;
    } else if (sst >= 15 && sst < 16) {
        index = 5;
    } else if (sst >= 16 && sst < 17) {
        index = 6;
    } else if (sst >= 17 && sst < 18) {
        index = 7;
    } else if (sst >= 18 && sst < 19) {
        index = 8;
    } else if (sst >= 19 && sst < 20) {
        index = 9;
    } else if (sst >= 20 && sst < 21) {
        index = 10;
    } else if (sst >= 21 && sst < 22) {
        index = 11;
    } else if (sst >= 22 && sst < 23) {
        index = 12;
    } else if (sst >= 23 && sst < 24) {
        index = 13;
    } else if (sst >= 24 && sst < 25) {
        index = 14;
    } else if (sst >= 25 && sst < 26) {
        index = 15;
    } else if (sst >= 26 && sst < 27) {
        index = 16;
    } else if (sst >= 27 && sst < 28) {
        index = 17;
    } else if (sst >= 28 && sst < 29) {
        index = 18;
    } else if (sst >= 29 && sst < 30) {
        index = 19;
    } else if (sst >= 30) {
        index = 20;
    }

    return sst_Colors[index];
    
} 

// new 
function s3color(sss) {
    let index = 0;

    //37.55, 37.60, 37.65, 37.70, 37.75, 37.80, 37.85, 37.90, 37.95, 38.00, 38.05, 38.10, 38.15, 38.20, 38.25, 38.30, 38.35, 38.40, 38.45, 38.50, 38.55, 38.60, 38.65, 38.70, 38.75, 38.80, 38.85, 38.90, 38.95, 39.00

    if (sss < 37.55) {
        index = 0;
    } else if (sss >= 37.55 && sss < 37.60) {
        index = 1;
    } else if (sss >= 37.60 && sss < 37.65) {
        index = 2;
    } else if (sss >= 37.65 && sss < 37.70) {
        index = 3;
    } else if (sss >= 37.70 && sss < 37.75) {
        index = 4;
    } else if (sss >= 37.75 && sss < 37.80) {
        index = 5;
    } else if (sss >= 37.80 && sss < 37.85) {
        index = 6;
    } else if (sss >= 37.85 && sss < 37.90) {
        index = 7;
    } else if (sss >= 37.90 && sss < 37.95) {
        index = 8;
    } else if (sss >= 37.95 && sss < 38.00) {
        index = 9;
    } else if (sss >= 38.00 && sss < 38.05) {
        index = 10;
    } else if (sss >= 38.05 && sss < 38.10) {
        index = 11;
    } else if (sss >= 38.10 && sss < 38.15) {
        index = 12;
    } else if (sss >= 38.15 && sss < 38.20) {
        index = 13;
    } else if (sss >= 38.20 && sss < 38.25) {
        index = 14;
    } else if (sss >= 38.25 && sss < 38.30) {
        index = 15;
    } else if (sss >= 38.30 && sss < 38.35) {
        index = 16;
    } else if (sss >= 38.35 && sss < 38.40) {
        index = 17;
    } else if (sss >= 38.40 && sss < 38.45) {
        index = 18;
    } else if (sss >= 38.45 && sss < 38.50) {
        index = 19;
    } else if (sss >= 38.50 && sss < 38.55) {
        index = 20;
    } else if (sss >= 38.55 && sss < 38.60) {
        index = 21;
    } else if (sss >= 38.60 && sss < 38.65) {
        index = 22;
    } else if (sss >= 38.65 && sss < 38.70) {
        index = 23;
    } else if (sss >= 38.70 && sss < 38.75) {
        index = 24;
    } else if (sss >= 38.75 && sss < 38.80) {
        index = 25;
    } else if (sss >= 38.80 && sss < 38.85) {
        index = 26;
    } else if (sss >= 38.85 && sss < 38.90) {
        index = 27;
    } else if (sss >= 38.90 && sss < 38.95) {
        index = 28;
    } else if (sss >= 38.95 && sss < 39.00) {
        index = 29;
    } else if (sss >= 39.00) {
        index = 30;
    }
    
    return s3Colors[index];
}

// new
function uhcolor(uh) {
    let index = 0;

    //15, 30, 45, 60, 75, 90, 105, 120, 135, 150, 165, 180, 195

    if (uh < 15) {
        index = 1;
    } else if (uh >= 15 && uh < 30) {
        index = 2;
    } else if (uh >= 30 && uh < 45) {
        index = 3;
    } else if (uh >= 45 && uh < 60) {
        index = 4;
    } else if (uh >= 60 && uh < 75) {
        index = 5;
    } else if (uh >= 75 && uh < 90) {
        index = 6;
    } else if (uh >= 90 && uh < 105) {
        index = 7;
    } else if (uh >= 105 && uh < 120) {
        index = 8;
    } else if (uh >= 120 && uh < 135) {
        index = 9;
    } else if (uh >= 135 && uh < 150) {
        index = 10;
    } else if (uh >= 150 && uh < 165) {
        index = 11;
    } else if (uh >= 165 && uh < 180) {
        index = 12;
    } else if (uh >= 180 && uh < 195) {
        index = 13;
    } else if (uh >= 195) {
        index = 14; 
    }

    return uhColors[index];
    

}

// new
function precipitationcolor(var_precipitation) {
    let index = 0
    // 0.4 0.6 1 3 5 7 10 15 20 25 30 40 50 60 70 80 90 100 125 150 175 200 250 300 350 

    if (var_precipitation < 0.4) {
        index = 0;
    } else if (var_precipitation >= 0.4 && var_precipitation < 0.6) {
        index = 1;
    } else if (var_precipitation >= 0.6 && var_precipitation < 1) {
        index = 2;
    } else if (var_precipitation >= 1 && var_precipitation < 3) {
        index = 3;
    } else if (var_precipitation >= 3 && var_precipitation < 5) {
        index = 4;
    } else if (var_precipitation >= 5 && var_precipitation < 7) {
        index = 5;
    } else if (var_precipitation >= 7 && var_precipitation < 10) {
        index = 6;
    } else if (var_precipitation >= 10 && var_precipitation < 15) {
        index = 7;
    } else if (var_precipitation >= 15 && var_precipitation < 20) {
        index = 8;
    } else if (var_precipitation >= 20 && var_precipitation < 25) {
        index = 9;
    } else if (var_precipitation >= 25 && var_precipitation < 30) {
        index = 10;
    } else if (var_precipitation >= 30 && var_precipitation < 40) {
        index = 11;
    } else if (var_precipitation >= 40 && var_precipitation < 50) {
        index = 12;
    } else if (var_precipitation >= 50 && var_precipitation < 60) {
        index = 13;
    } else if (var_precipitation >= 60 && var_precipitation < 70) {
        index = 14;
    } else if (var_precipitation >= 70 && var_precipitation < 80) {
        index = 15;
    } else if (var_precipitation >= 80 && var_precipitation < 90) {
        index = 16;
    } else if (var_precipitation >= 90 && var_precipitation < 100) {
        index = 17;
    } else if (var_precipitation >= 100 && var_precipitation < 125) {
        index = 18;
    } else if (var_precipitation >= 125 && var_precipitation < 150) {
        index = 19;
    } else if (var_precipitation >= 150 && var_precipitation < 175) {
        index = 20;
    } else if (var_precipitation >= 175 && var_precipitation < 200) {
        index = 21;
    } else if (var_precipitation >= 200 && var_precipitation < 250) {
        index = 22;
    } else if (var_precipitation >= 250 && var_precipitation < 300) {
        index = 23;
    } else if (var_precipitation >= 300 && var_precipitation < 350) {
        index = 24;
    } else if (var_precipitation >= 350) {
        index = 25;
    }

    return precipitationColors[index]
    
}

//new 
function tspCcolor(tsp) {
    let index = 0;
    // -14, -12, -10, -8, -6, -4, -2, 0, 2, 4, 6, 8, 10, 12, 14, 16, 18, 20, 22, 24, 26, 28, 30, 32, 34, 36, 38, 40, 42, 44

    if (tsp < -14) {
        index = 0;
    } else if (tsp >= -14 && tsp < -12) {
        index = 1; 
    } else if (tsp >= -12 && tsp < -10) {
        index = 2;
    } else if (tsp >= -10 && tsp < -8) {
        index = 3;
    } else if (tsp >= -8 && tsp < -6) {
        index = 4;
    } else if (tsp >= -6 && tsp < -4) {
        index = 5;
    } else if (tsp >= -4 && tsp < -2) {
        index = 6;
    } else if (tsp >= -2 && tsp < 0) {
        index = 7;
    } else if (tsp >= 0 && tsp < 2) {
        index = 8;
    } else if (tsp >= 2 && tsp < 4) {
        index = 9;
    } else if (tsp >= 4 && tsp < 6) {
        index = 10;
    } else if (tsp >= 6 && tsp < 8) {
        index = 11;
    } else if (tsp >= 8 && tsp < 10) {
        index = 12;
    } else if (tsp >= 10 && tsp < 12) {
        index = 13;
    } else if (tsp >= 12 && tsp < 14) {
        index = 14;
    } else if (tsp >= 14 && tsp < 16) {
        index = 15;
    } else if (tsp >= 16 && tsp < 18) {
        index = 16;
    } else if (tsp >= 18 && tsp < 20) {
        index = 17;
    } else if (tsp >= 20 && tsp < 22) {
        index = 18;
    } else if (tsp >= 22 && tsp < 24) {
        index = 19;
    } else if (tsp >= 24 && tsp < 26) {
        index = 20;
    } else if (tsp >= 26 && tsp < 28) {
        index = 21;
    } else if (tsp >= 28 && tsp < 30) {
        index = 22;
    } else if (tsp >= 30 && tsp < 32) {
        index = 23;
    } else if (tsp >= 32 && tsp < 34) {
        index = 24;
    } else if (tsp >= 34 && tsp < 36) {
        index = 25;
    } else if (tsp >= 36 && tsp < 38) {
        index = 26;
    } else if (tsp >= 38 && tsp < 40) {
        index = 27;
    } else if (tsp >= 40 && tsp < 42) {
        index = 28;
    } else if (tsp >= 42 && tsp < 44) {
        index = 29;
    } else if (tsp>=44) {
        index = 30;
    }
    
    return tspColors[index];


}

//new
function wn2color(wn2) {
    let index = 0;
    // -10 -8 -6 -4 -3 -2 -1 0 1 2 3 4 6 8 10

    if (wn2 < -10) {
        index = 0;
    } else if (wn2 >= -10 && wn2 < -8) {
        index = 1;
    } else if (wn2 >= -8 && wn2 < -6) {
        index = 2;
    } else if (wn2 >= -6 && wn2 < -4) {
        index = 3;
    } else if (wn2 >= -4 && wn2 < -3) {
        index = 4;
    } else if (wn2 >= -3 && wn2 < -2) {
        index = 5;
    } else if (wn2 >= -2 && wn2 < -1) {
        index = 6;
    } else if (wn2 >= -1 && wn2 < 0) {
        index = 7;
    } else if (wn2 >= 0 && wn2 < 1) {
        index = 8;
    } else if (wn2 >= 1 && wn2 < 2) {
        index = 9;
    } else if (wn2 >= 2 && wn2 < 3) {
        index = 10;
    } else if (wn2 >= 3 && wn2 < 4) {
        index = 11;
    } else if (wn2 >= 4 && wn2 < 6) {
        index = 12;
    } else if (wn2 >= 6 && wn2 < 8) {
        index = 13;
    } else if (wn2 >= 8 && wn2 < 10) {
        index = 14;
    } else if (wn2 >= 10) {
        index = 15;
    }

    return wn2Colors[index];

}

// new 
function gp8color(gp8) {
    let index = 0;

    if (gp8 < 104) {
        index = 0;
    } else if (gp8 >= 104 && gp8 < 108) {
        index = 1;
    } else if (gp8 >= 108 && gp8 < 112) {
        index = 2;
    } else if (gp8 >= 112 && gp8 < 116) {
        index = 3;
    } else if (gp8 >= 116 && gp8 < 120) {
        index = 4;
    } else if (gp8 >= 120 && gp8 < 124) {
        index = 5;
    } else if (gp8 >= 124 && gp8 < 128) {
        index = 6;
    } else if (gp8 >= 128 && gp8 < 132) {
        index = 7;
    } else if (gp8 >= 132 && gp8 < 136) {
        index = 8;
    } else if (gp8 >= 136 && gp8 < 140) {
        index = 9;
    } else if (gp8 >= 140 && gp8 < 144) {
        index = 10;
    } else if (gp8 >= 144 && gp8 < 148) {
        index = 11;
    } else if (gp8 >= 148 && gp8 < 152) {
        index = 12;
    } else if (gp8 >= 152 && gp8 < 156) {
        index = 13;
    } else if (gp8 >= 156 && gp8 < 160) {
        index = 14;
    } else if (gp8 >= 160 && gp8 < 164) {
        index = 15;
    } else if (gp8 >= 164 && gp8 < 168) {
        index = 16;
    } else if (gp8 >= 168 && gp8 < 172) {
        index = 17;
    } else if (gp8 >= 172 && gp8 < 176) {
        index = 18;
    } else if (gp8 >= 176 && gp8 < 180) {
        index = 19;
    } else if (gp8 >= 180 && gp8 < 184) {
        index = 20;
    } else if (gp8 >= 184 && gp8 < 188) {
        index = 21;
    } else if (gp8 >= 188 && gp8 < 192) {
        index = 22;
    } else if (gp8 >= 192 && gp8 < 196) {
        index = 23;
    } else if (gp8 >= 196 && gp8 < 200) {
        index = 24;
    } else if (gp8 >= 200 && gp8 < 204) {
        index = 25;
    } else if (gp8 >= 204 && gp8 < 208) {
        index = 26;
    } else if (gp8 >= 208 && gp8 < 212) {
        index = 27;
    } else if (gp8 >= 212 && gp8 < 216) {
        index = 28;
    } else if (gp8 >= 216 && gp8 < 220) {
        index = 29;
    } else if (gp8 >= 220) {
        index = 30;
    }

    return gpColors[index]
}

// new 
function gp5color(gp5) {
    let index = 0;
    // 496, 500, 504, 508, 512, 516, 520, 524, 528, 532, 536, 540, 544, 548, 552, 556, 560, 564, 568, 572, 576, 580, 584, 588, 592, 596, 600, 604, 608, 612.

    if (gp5 < 496) {
        index = 0;
    } else if (gp5 >= 496 && gp5 < 500) {
        index = 1;
    } else if (gp5 >= 500 && gp5 < 504) {
        index = 2;
    } else if (gp5 >= 504 && gp5 < 508) {
        index = 3;
    } else if (gp5 >= 508 && gp5 < 512) {
        index = 4;
    } else if (gp5 >= 512 && gp5 < 516) {
        index = 5;
    } else if (gp5 >= 516 && gp5 < 520) {
        index = 6;
    } else if (gp5 >= 520 && gp5 < 524) {
        index = 7;
    } else if (gp5 >= 524 && gp5 < 528) {
        index = 8;
    } else if (gp5 >= 528 && gp5 < 532) {
        index = 9;
    } else if (gp5 >= 532 && gp5 < 536) {
        index = 10;
    } else if (gp5 >= 536 && gp5 < 540) {
        index = 11;
    } else if (gp5 >= 540 && gp5 < 544) {
        index = 12;
    } else if (gp5 >= 544 && gp5 < 548) {
        index = 13;
    } else if (gp5 >= 548 && gp5 < 552) {
        index = 14;
    } else if (gp5 >= 552 && gp5 < 556) {
        index = 15;
    } else if (gp5 >= 556 && gp5 < 560) {
        index = 16;
    } else if (gp5 >= 560 && gp5 < 564) {
        index = 17;
    } else if (gp5 >= 564 && gp5 < 568) {
        index = 18;
    } else if (gp5 >= 568 && gp5 < 572) {
        index = 19;
    } else if (gp5 >= 572 && gp5 < 576) {
        index = 20;
    } else if (gp5 >= 576 && gp5 < 580) {
        index = 21;
    } else if (gp5 >= 580 && gp5 < 584) {
        index = 22;
    } else if (gp5 >= 584 && gp5 < 588) {
        index = 23;
    } else if (gp5 >= 588 && gp5 < 592) {
        index = 24;
    } else if (gp5 >= 592 && gp5 < 596) {
        index = 25;
    } else if (gp5 >= 596 && gp5 < 600) {
        index = 26;
    } else if (gp5 >= 600 && gp5 < 604) {
        index = 27;
    } else if (gp5 >= 604 && gp5 < 608) {
        index = 28;
    } else if (gp5 >= 608 && gp5 < 612) {
        index = 29;
    } else if (gp5 >= 612) {
        index = 30;
    }

    return gpColors[index];

}

// new 
function wn4color(wn4) {
    let index = 0;

    // 1 3 6 10 16 21 27 33 40 47 55 63 

    if (wn4 < 1) {
        index = 0;
    } else if (wn4 >= 1 && wn4 < 3) {
        index = 1;
    } else if (wn4 >= 3 && wn4 < 6) {
        index = 2;
    } else if (wn4 >= 6 && wn4 < 10) {
        index = 3;
    } else if (wn4 >= 10 && wn4 < 16) {
        index = 4;
    } else if (wn4 >= 16 && wn4 < 21) {
        index = 5;
    } else if (wn4 >= 21 && wn4 < 27) {
        index = 6;
    } else if (wn4 >= 27 && wn4 < 33) {
        index = 7;
    } else if (wn4 >= 33 && wn4 < 40) {
        index = 8;
    } else if (wn4 >= 40 && wn4 < 47) {
        index = 9;
    } else if (wn4 >= 47 && wn4 < 55) {
        index = 10;
    } else if (wn4 >= 55 && wn4 < 63) {
        index = 11;
    } else if (wn4 >= 63) {
        index = 12;
    }

    return wn4Colors[index];
}

function swe2color(rh) {
    let index=0;

    // .5 2.5 5.5 8.5 11.5 15.5

    if (rh<.5) {
        index=0;
    } else if (rh>=.5 && rh<2.5) {
        index=1;
    } else if (rh>=2.5 && rh<5.5) {
        index=2;
    } else if (rh>=5.5 && rh<8.5) {
        index=3;
    } else if (rh>=8.5 && rh<11.5) {
        index=4;
    } else if (rh>=11.5) {
        index=5;
    }

    return sweColors[index];
}

function rh2color(rh) {
    let index=0;

    // set clevs  20 40 60 80 99

    if (rh<20) {
        index=0;
    } else if (rh>=20 && rh<40) {
        index=1;
    } else if (rh>=40 && rh<60) {
        index=2;
    } else if (rh>=60 && rh<80) {
        index=3;
    } else if (rh>=80 && rh<99) {
        index=4;
    } else if (rh>=99 ) {
        index=5 ;
    }

    return rhColors[index];
}

function hs2color(hs) {
    let index=0;


    if (hs<0.1) {
        index=0;
    } else if (hs>=0.1 && hs<0.3) {
        index=1;
    } else if (hs>=0.3 && hs<0.5) {
        index=2;
    } else if (hs>=0.5 && hs<0.8) {
        index=3;
    } else if (hs>=0.8 && hs<1.25) {
        index=4;
    } else if (hs>=1.25 && hs<1.6) {
        index=5;
    } else if (hs>=1.6 && hs<2) {
        index=6;
    } else if (hs>=2 && hs<2.5) {
        index=7;
    } else if (hs>=2.5 && hs<3) {
        index=8;
    } else if (hs>=3 && hs<4) {
        index=9;
    } else if (hs>=4 && hs<5) {
        index=10;
    } else if (hs>=5 && hs<6) {
        index=11;
    } else if (hs>=6 && hs<7) {
        index=12;
    } else if (hs>=7 && hs<8) {
        index=13;
    } else if (hs>=8 && hs<9) {
        index=14;
    } else if (hs>=9 ) {
        index=15 ;
    }

    return hsColors[index];
}

function lm2color(lm) {
    let index=0;


    if (lm<10) {
        index=0;
    } else if (lm>=10 && lm<20) {
        index=1;
    } else if (lm>=20 && lm<30) {
        index=2;
    } else if (lm>=30 && lm<40) {
        index=3;
    } else if (lm>=40 && lm<50) {
        index=4;
    } else if (lm>=50 && lm<60) {
        index=5;
    } else if (lm>=60 && lm<70) {
        index=6;
    } else if (lm>=70 && lm<80) {
        index=7;
    } else if (lm>=80 && lm<90) {
        index=8;
    } else if (lm>=90 && lm<100) {
        index=9;
    } else if (lm>=100 && lm<110) {
        index=10;
    } else if (lm>=110 && lm<120) {
        index=11;
    } else if (lm>=120 && lm<130) {
        index=12;
    } else if (lm>=130 ) {
        index=13 ;
    }

    return lmColors[index];
}

function fp2color(fp) {
    let index = 0;

    // 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14

    if (fp < 2) {
        index = 0;
    } else if (fp >= 2 && fp < 3) {
        index = 1;
    } else if (fp >= 3 && fp < 4) {
        index = 2;
    } else if (fp >= 4 && fp < 5) {
        index = 3;
    } else if (fp >= 5 && fp < 6) {
        index = 4;
    } else if (fp >= 6 && fp < 7) {
        index = 5;
    } else if (fp >= 7 && fp < 8) {
        index = 6;
    } else if (fp >= 8 && fp < 9) {
        index = 7;
    } else if (fp >= 9 && fp < 10) {
        index = 8;
    } else if (fp >= 10 && fp < 11) {
        index = 9;
    } else if (fp >= 11 && fp < 12) {
        index = 10;
    } else if (fp >= 12 && fp < 13) {
        index = 11;
    } else if (fp >= 13 && fp < 14) {
        index = 12;
    } else if (fp >= 14) {
        index = 13;
    }
    
    return fpColors[index];
}

function period2color(period) {
    let index=0;

    // 0 2 3 4 5 6 7 8 9 10 11 12 13 14
    if (period<2) {
        index=0;
    } else if (period>=2 && period<3) {
        index=1;
    } else if (period>=3 && period<4) {
        index=2;
    } else if (period>=4 && period<5) {
        index=3;
    } else if (period>=5 && period<6) {
        index=4;
    } else if (period>=6 && period<7) {
        index=5;
    } else if (period>=7 && period<8) {
        index=6;
    } else if (period>=8 && period<9) {
        index=7;
    } else if (period>=9 && period<10) {
        index=8;
    } else if (period>=10 && period<11) {
        index=9;
    } else if (period>=11 && period<12) {
        index=10;
    } else if (period>=12 && period<13) {
        index=11;
    } else if (period>=13 && period<14) {
        index=12;
    } else if (period>=14 ) {
        index=13 ;
    }

    return periodColors[index];
}

function sss2color(sss) {
    let index=0;

    // 37.5 37.75 38 38.25 38.5 38.75 39
    if (sss<37.5) {
        index=0;
    } else if (sss>=37.5 && sss<37.5) {
        index=1;
    } else if (sss>=37.75 && sss<38) {
        index=2;
    } else if (sss>=38 && sss<38.25) {
        index=3;
    } else if (sss>=38.25 && sss<38.5) {
        index=4;
    } else if (sss>=38.5 && sss<38.75) {
        index=5;
    } else if (sss>=38.75 && sss<39) {
        index=6;
    } else if (sss>=39 ) {
        index=7 ;
    }

    return sssColors[index];
}

function sst2color(sst) {
    let index=0;

    // 10 11 12 13 14 15 16 17 18 19 20 21 22 23 24 25 26 27 28 29 30
    if (sst<10) {
        index=0;
    } else if (sst>=10 && sst<11) {
        index=1;
    } else if (sst>=11 && sst<12) {
        index=2;
    } else if (sst>=12 && sst<13) {
        index=3;
    } else if (sst>=13 && sst<14) {
        index=4;
    } else if (sst>=14 && sst<15) {
        index=5;
    } else if (sst>=15 && sst<16) {
        index=6;
    } else if (sst>=16 && sst<17) {
        index=6;
    } else if (sst>=17 && sst<18) {
        index=6;
    } else if (sst>=18 && sst<19) {
        index=6;
    } else if (sst>=19 && sst<20) {
        index=6;
    } else if (sst>=20 && sst<21) {
        index=6;
    } else if (sst>=21 && sst<22) {
        index=6;
    } else if (sst>=22 && sst<23) {
        index=6;
    } else if (sst>=23 && sst<24) {
        index=6;
    } else if (sst>=24 && sst<25) {
        index=6;
    } else if (sst>=25 && sst<26) {
        index=6;
    } else if (sst>=26 && sst<27) {
        index=6;
    } else if (sst>=27 && sst<28) {
        index=6;
    } else if (sst>=28 && sst<29) {
        index=6;
    } else if (sst>=29 && sst<30) {
        index=6;
    } else if (sst>=30 ) {
        index=7 ;
    }

    return sstColors[index];
}

function con2color(conc) {
    let index=0;

    // 1 18 230 700 4600 46000
    if (conc<18) {
        index=0;
    } else if (conc>=18 && conc<230) {
        index=1;
    } else if (conc>=230 && conc<700) {
        index=2;
    } else if (conc>=700 && conc<4600) {
        index=3;
    } else if (conc>=4600 && conc<46000) {
        index=4;
    } else if (conc>=46000 ) {
        index=5 ;
    }

    return conColors[index];
}

function mci2color(mci) {
    return mciColors[mci];
}

function scm2color(scm) {
    let index=0;

    // 0.1 0.2 0.3 0.4 0.5 0.6 0.7
    if (scm<0.1) {
        index=0;
    } else if (scm>=.1 && scm<.2) {
        index=1;
    } else if (scm>=.2 && scm<.3) {
        index=2;
    } else if (scm>=.3 && scm<.4) {
        index=3;
    } else if (scm>=.4 && scm<.5) {
        index=4;
    } else if (scm>=.5 && scm<.6) {
        index=5;
    } else if (scm>=.6 && scm<.7) {
        index=5;
    } else if (scm>=.7 ) {
        index=8;
    }

    return scmColors[index];
}

function temp2color(temp) {
    let index=0;

    // -40 -30 -20 -15 -10 -5 0 3 6 9 12 15 18 21 25 30 40 50
    if (temp>=-40 && temp<-30) {
        index=0;
    } else if (temp>=-30 && temp<-20) {
        index=1;
    } else if (temp>=-20 && temp<-15) {
        index=2;
    } else if (temp>=-15 && temp<-10) {
        index=3;
    } else if (temp>=-10 && temp<-5) {
        index=4;
    } else if (temp>=-5 && temp<0) {
        index=5;
    } else if (temp>=0 && temp<3) {
        index=6;
    } else if (temp>=3 && temp<6) {
        index=7;
    } else if (temp>=6 && temp<9) {
        index=8;
    } else if (temp>=9 && temp<12) {
        index=9;
    } else if (temp>=12 && temp<15) {
        index=10;
    } else if (temp>=15 && temp<18) {
        index=11;
    } else if (temp>=18 && temp<21) {
        index=12;
    } else if (temp>=21 && temp<25) {
        index=13;
    } else if (temp>=25 && temp<30) {
        index=14;
    } else if (temp>=30 && temp<40) {
        index=15;
    } else if (temp>=40 && temp<50) {
        index=16;
    } else if (temp>=50 ) {
        index=17;
    }

    return tempColors[index];
}

function windKnt2color(ws) {
    let index=0;

    if (ws>=0 && ws<1) {
        index=0;
    } else if (ws>=1 && ws<3) {
        index=1;
    } else if (ws>=3 && ws<5) {
        index=2;
    } else if (ws>=5 && ws<7) {
        index=3;
    } else if (ws>=7 && ws<9) {
        index=4;
    } else if (ws>=9 && ws<11) {
        index=5;
    } else if (ws>=11 && ws<15) {
        index=6;
    } else if (ws>=15 && ws<17) {
        index=7;
    } else if (ws>=17 && ws<19) {
        index=8;
    } else if (ws>=19 && ws<21) {
        index=9;
    } else if (ws>=21 && ws<23) {
        index=10;
    } else if (ws>=23 && ws<25) {
        index=11;
    } else if (ws>=25 && ws<27) {
        index=12;
    } else if (ws>=27 && ws<30) {
        index=13;
    } else if (ws>=30 && ws<35) {
        index=14;
    } else if (ws>=35 && ws<40) {
        index=15;
    } else if (ws>=40 && ws<45) {
        index=16;
    } else if (ws>=45 && ws<50) {
        index=17;
    } else  {
        index=18;
    }

    // 0 1 3 5 7 9 11 13 15 17 19 21 23 25 27 30 35 40 45 50

    return windColors[index+1];
}