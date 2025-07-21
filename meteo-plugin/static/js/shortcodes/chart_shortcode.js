let placeID = chartData['place_id'];
let longNameIT = chartData['long_name_it'];
let chartHours = 0;
let chartStep = 1;

let loadedChart = {};

(function($){
    $(document).ready(function() {
        let $loadingDiv = $('<div>').attr('class','loading-gif');
        $loadingDiv.attr('id','loading-div');
        let $loadingGif = $('<img>').attr('id','loading-gif');
        let hour = new Date().getHours();
        let gif = hour >=7 && hour < 19 ? "day_loading.gif" : "night_loading.gif";
        $loadingGif.attr('src',METEOUNIP_PLUGIN_LOADING_DIR + "/" + gif);
        $loadingDiv.append($loadingGif);

        let $chartDiv = $('#chart');
        $chartDiv.append($loadingDiv);

        let $chartBoxCanvaJS = $('#chart-container-canvasDiv');
        let product;
        let output;
        let ncepDate;
        
        $('#generate-button').on('click',function(){
            $chartBoxCanvaJS.empty();
            
            let $selectProduct = $('#control-select-product');
            product = $selectProduct.val();
            if(product == "aiq3")
                return;

            let $selectOutput = $('#control-select-output');
            output = $selectOutput.val();
            
            ncepDate = formatDateForMeteoAPI(null,null);

            chartHours = 0;
            chartStep = 1;
            
            $('#chart-box').hide()
            $loadingDiv.show();
            var key =  product + "-" + output + "-" + ncepDate;
            if( !(key in loadedChart)){
                drawChart(product,output,ncepDate);
            }
            else{
                loadedChart[key].render();
            }
            $loadingDiv.hide();
            $('#chart-box').show();
        });
        $('#chart-collapse').on('shown.bs.collapse',function(){
            var key =  product + "-" + output + "-" + ncepDate;
            if( key in loadedChart){
                loadedChart[key].render();
            }
        });
        /*
        $('#chart-collapse').on('hidden.bs.collapse', function(){
            $('#chart-box').hide();
        });
        */
    });

    function drawChart(product, output, ncepDate){
        let title = "Forecast";
        let dataPoints = [];
        let dataPoints2 = [];
        let data=[];

        let axisY=null, axisY2=null, colorSet=null;
        switch(product){
            case "wrf5":
                switch(output){
                    case "gen" || "tsp":
                        title="Pressure and Temperature";
                        axisY = {
                            title: "Sea Level Pressure (hPa)",
                            includeZero: false,
                            suffix: " hPa"
                        };
                        axisY2 = {
                            title: "Temperature (°C)",
                            includeZero: false,
                            suffix: " °C"
                        };
                        data.push({
                            name: "t2c",
                            type: "column",
                            axisYType: "secondary",
                            yValueFormatString: "#0.## °C",
                            dataPoints: dataPoints
                        });
                        data.push({
                            name: "slp",
                            type: "line",
                            yValueFormatString: "##.# hPa",
                            dataPoints: dataPoints2
                        });
                        break;
                    case "wn1":
                        title="Wind Speed and Direction at 10m";
                        axisY = {
                            title: "Wind Speed at 10m (knt)",
                            includeZero: false,
                            suffix: " knt"
                        };
                        axisY2 = {
                            title: "Wind Direction at 10m (°N)",
                            maximum: 360,
                            interval: 45,
                            includeZero: true,
                            suffix: " °"
                        };
                        data.push({
                            name: "ws",
                            type: "column",
                            yValueFormatString: "##.# knt",
                            dataPoints: dataPoints
                        });
                        data.push({
                            name: "wd",
                            type: "line",
                            axisYType: "secondary",
                            yValueFormatString: "#0.## °",
                            dataPoints: dataPoints2
                        });
                        break;
                    case "crh":
                        title="Clouds and Rain";
                        axisY= {
                            title: "Hourly cumulated rain (mm)",
                            includeZero: false,
                            suffix: " °"
                        };
                        axisY2 = {
                            title: "Cloud fraction (%)",
                            includeZero: false,
                            maximum: 100,
                            suffix: " %"
                        };
                        data.push({
                            name: "crh",
                            type: "column",
                            yValueFormatString: "##.# mm",
                            dataPoints: dataPoints
                        });
                        data.push({
                            name: "crf",
                            type: "line",
                            axisYType: "secondary",
                            yValueFormatString: "#0.## %",
                            dataPoints: dataPoints2
                        });
                        break;
                    case "rh2":
                        title="Relative Humidity at 2m";
                        axisY= {
                            title: "Relative Humidity at 2m (%)",
                            includeZero: false,
                            maximum: 100,
                            suffix: "%"
                        };
                        axisY2 = {
                            title: "Wind Direction at 10m (°N)",
                            maximum: 360,
                            interval: 45,
                            includeZero: true,
                            suffix: " °"
                        };
                        data.push({
                            name: "rh2",
                            type: "column",
                            yValueFormatString: "#0.## %",
                            dataPoints: dataPoints
                        });
                        data.push({
                            name: "wd",
                            type: "line",
                            axisYType: "secondary",
                            yValueFormatString: "#0.## °",
                            dataPoints: dataPoints2
                        });
                        break;
                    case "swe":
                        title="Hourly cumulated snow fall";
                        axisY= {
                            title: "Hourly cumulated snow fall (cm)",
                            includeZero: false,
                            suffix: "cm"
                        };
                        axisY2 = {
                            title: "Wind Direction at 10m (°N)",
                            maximum: 360,
                            interval: 45,
                            includeZero: true,
                            suffix: " °"
                        };
                        data.push({
                            name: "rh2",
                            type: "column",
                            yValueFormatString: "#0.## %",
                            dataPoints: dataPoints
                        });
                        data.push({
                            name: "wd",
                            type: "line",
                            axisYType: "secondary",
                            yValueFormatString: "#0.## °",
                            dataPoints: dataPoints2
                        });
                        break;
                }
                break;
            case "wcm3":
                if( output === "gen" || output === "con"){
                    title = "Particle concentration";
                    axisY = {
                        title: "Number of Particles (#)",
                        includeZero: false,
                        suffix: ""
                    };
                    data.push({
                        name: "con",
                        type: "column",
                        yValueFormatString: "##.# ",
                        dataPoints: dataPoints
                    });
                }
                break;
            case "rms3":
                switch(output){
                    case "gen":
                    case "scu":
                        title="Surface current";
                        axisY = {
                            title: "Current Speed at the surface (m/s)",
                            includeZero: false,
                            suffix: " m/s"
                        };
                        axisY2 = {
                            title: "Current Direction at the surface (°N)",
                            maximum: 360,
                            interval: 45,
                            includeZero: true,
                            suffix: " °"
                        };
                        data.push({
                            name: "scm",
                            type: "column",
                            yValueFormatString: "##.# m/s",
                            dataPoints: dataPoints
                        });
                        data.push({
                            name: "scd",
                            type: "line",
                            axisYType: "secondary",
                            yValueFormatString: "#0.## °",
                            dataPoints: dataPoints2
                        });
                        break;
                    case "sst":
                        title="Surface temperature";
                        axisY = {
                            title: "Surface temperature (°C)",
                            includeZero: false,
                            suffix: " °C"
                        };
                        data.push({
                            name: "sst",
                            type: "column",
                            yValueFormatString: "##.# °C",
                            dataPoints: dataPoints
                        });
                        break;
                    case "sss":
                        title="Surface salinity";
                        axisY = {
                            title: "Surface salinity (1/1000)",
                            includeZero: false,
                            suffix: " "
                        };
                        data.push({
                            name: "sss",
                            type: "line",
                            yValueFormatString: "##.# ",
                            dataPoints: dataPoints
                        });
                        break;
                    case "sts":
                        title = "Surface temperature and salinity";
                        axisY = {
                            title: "Surface temperature (°C)",
                            includeZero: false,
                            suffix: " °C"
                        };
                        axisY2 = {
                            title: "Surface salinity (1/1000)",
                            includeZero: false,
                            suffix: " "
                        };
                        data.push({
                            name: "sst",
                            type: "column",
                            yValueFormatString: "##.# °C",
                            dataPoints: dataPoints
                        });
                        data.push({
                            name: "sss",
                            type: "line",
                            axisYType: "secondary",
                            yValueFormatString: "#0.## ",
                            dataPoints: dataPoints2
                        });
                        break;
                }
                break;
            case "ww33":
                switch(output){
                    case "gen":
                    case "hsd":
                        title = "Significant wave height and direction";
                        axisY = {
                            title: "Significant wave height (m)",
                            includeZero: false,
                            suffix: " m"
                        };
                        axisY2 = {
                            title: "Mean wave direction surface (°N)",
                            maximum: 360,
                            interval: 45,
                            includeZero: true,
                            suffix: " °"
                        };
                        data.push({
                            name: "hs",
                            type: "column",
                            yValueFormatString: "##.# m",
                            dataPoints: dataPoints
                        });
                        data.push({
                            name: "dir",
                            type: "line",
                            axisYType: "secondary",
                            yValueFormatString: "#0.## °",
                            dataPoints: dataPoints2
                        });
                        break;
                    case "lmd":
                        title = "Mean wave length and direction";
                        axisY = {
                            title: "Mean wave length (m)",
                            includeZero: false,
                            suffix: " m"
                        };
                        axisY2 = {
                            title: "Mean wave direction surface (°N)",
                            maximum: 360,
                            interval: 45,
                            includeZero: true,
                            suffix: " °"
                        };
                        data.push({
                            name: "lm",
                            type: "column",
                            yValueFormatString: "##.# m",
                            dataPoints: dataPoints
                        });
                        data.push({
                            name: "dir",
                            type: "line",
                            axisYType: "secondary",
                            yValueFormatString: "#0.## °",
                            dataPoints: dataPoints2
                        });
                        break;
                    case "fpd":
                        title = "Peak frequency and direction";
                        axisY = {
                            title: "Peak frequency (s-1)",
                            includeZero: false,
                            suffix: " s-1"
                        };
                        axisY2 = {
                            title: "Mean wave direction surface (°N)",
                            maximum: 360,
                            interval: 45,
                            includeZero: true,
                            suffix: " °"
                        };
                        data.push({
                            name: "fp",
                            type: "line",
                            yValueFormatString: "##.# s-1",
                            dataPoints: dataPoints
                        });
                        data.push({
                            name: "dir",
                            type: "line",
                            axisYType: "secondary",
                            yValueFormatString: "#0.## °",
                            dataPoints: dataPoints2
                        });
                        break;
                    case "ppd":
                        title = "Mean period and direction";
                        axisY = {
                            title: "Mean period (s)",
                            includeZero: false,
                            suffix: " s"
                        };
                        axisY2 = {
                            title: "Mean wave direction surface (°N)",
                            maximum: 360,
                            interval: 45,
                            includeZero: true,
                            suffix: " °"
                        };
                        data.push({
                            name: "period",
                            type: "column",
                            yValueFormatString: "##.# s",
                            dataPoints: dataPoints
                        });
                        data.push({
                            name: "dir",
                            type: "line",
                            axisYType: "secondary",
                            yValueFormatString: "#0.## °",
                            dataPoints: dataPoints2
                        });
                        break;
                }
                break;
            default:
                console.log("Product not allowed");
                break;
        }

        let options= {
            animationEnabled: true,
            theme: "light2",
            title: {
                text: title
            },
            axisX: {
                valueFormatString: "DD MMM, HHZ"
            },
            axisY: axisY,
            axisY2: axisY2,

            data: data
        };

        let chart = new CanvasJS.Chart("chart-container-canvasDiv", options);
        let timeseriesUrl = apiBaseUrl+"/products/"+product+"/timeseries/"+chartData['place_id']+"?hours="+chartHours+"&step="+chartStep+"&date="+ncepDate;
        $.getJSON(timeseriesUrl, function(data){
            let timeseriesChartData = data['timeseries'];
            $.each( timeseriesChartData, function(key, val){
                let date = val.dateTime;
                let year = date.substring(0, 4);
                let month = date.substring(4, 6);
                let day = date.substring(6, 8);
                let hour = date.substring(9, 11);
                let sDateTime = year + "-" + month + "-" + day + "T" + hour + ":00:00Z";

                let dateTime = new Date(sDateTime);
                switch(product){
                    case "wrf5":
                        switch(output){
                            case "gen" || "tsp":
                                dataPoints2.push({
                                    x: dateTime,
                                    y: val.slp
                                });
                                dataPoints.push({
                                    x: dateTime,
                                    y: val.t2c,
                                    color: temp2color(val.t2c)
                                });
                                break;
                            case "wn1":
                                dataPoints.push({
                                    x: dateTime,
                                    y: val.ws10n,
                                    color: windKnt2color(val.ws10n)
                                });
                                dataPoints2.push({
                                    x: dateTime,
                                    y: val.wd10
                                });
                                break;
                            case "crh":
                                dataPoints.push({
                                    x: dateTime,
                                    y: val.crh
                                });

                                dataPoints2.push({
                                    x: dateTime,
                                    y: val.clf * 100
                                });
                                break;
                            case "rh2":
                                dataPoints.push({
                                    x: dateTime,
                                    y: val.rh2,
                                    color: rh2color(val.rh2)
                                });
                                dataPoints2.push({
                                    x: dateTime,
                                    y: val.wd10
                                });
                                break;
                            case "swe":
                                dataPoints.push({
                                    x: dateTime,
                                    y: val.swe,
                                    color: swe2color(val.swe)
                                });
                                dataPoints2.push({
                                    x: dateTime,
                                    y: val.wd10
                                });
                                break;
                        }
                        break;
                    case "wcm3":
                        if( output === "gen" || output === "con"){
                            dataPoints.push({
                                x: dateTime,
                                y: val.con,
                                color: con2color(val.con)
                            });
                        }
                        break;
                    case "rms3":
                        switch(output){
                            case "gen":
                            case "scu":
                                dataPoints.push({
                                    x: dateTime,
                                    y: val.scm,
                                    color: scm2color(val.scm)
                                });
                                dataPoints2.push({
                                    x: dateTime,
                                    y: val.scd
                                });
                                break;
                            case "sst":
                                dataPoints.push({
                                    x: dateTime,
                                    y: val.sst,
                                    color: sst2color(val.sst)
                                });
                                break;
                            case "sss":
                                dataPoints.push({
                                    x: dateTime,
                                    y: val.sss,
                                    color: sss2color(val.sss)
                                });
                                break;
                            case "sts":
                                dataPoints.push({
                                    x: dateTime,
                                    y: val.sst,
                                    color: sst2color(val.sst)
                                });
                                dataPoints2.push({
                                    x: dateTime,
                                    y: val.sss,
                                    color: sss2color(val.sss)
                                });
                                break;
                        }
                        break;
                    case "ww33":
                        switch(output){
                            case "gen":
                            case "hsd":
                                dataPoints.push({
                                    x: dateTime,
                                    y: val.hs,
                                    color: hs2color(val.hs)
                                });

                                dataPoints2.push({
                                    x: dateTime,
                                    y: val.dir
                                });
                                break;
                            case "lmd":
                                dataPoints.push({
                                    x: dateTime,
                                    y: val.lm,
                                    color: lm2color(val.lm)
                                });
                                dataPoints2.push({
                                    x: dateTime,
                                    y: val.dir
                                });
                                break;
                            case "fpd":
                                dataPoints.push({
                                    x: dateTime,
                                    y: val.fp,
                                    color: fp2color(val.fp)
                                });

                                dataPoints2.push({
                                    x: dateTime,
                                    y: val.dir
                                });
                                break;
                            case "ppd":
                                dataPoints.push({
                                    x: dateTime,
                                    y: val.period,
                                    color: period2color(val.period)
                                });
                                dataPoints2.push({
                                    x: dateTime,
                                    y: val.dir
                                });
                                break;
                        }
                        break;
                    default:
                        
                        break;
                }
            });
            chart.render();
        });
        var key =  product + "-" + output + "-" + ncepDate;
        loadedChart[key] = chart;
    };
    
    function formatDateForMeteoAPI(dateValue, timeValue){
        // Se non vengono passati parametri, usa i valori correnti dagli input
        if (!dateValue) {
            dateValue = $('#control-select-date').val();
        }
        if (!timeValue) {
            timeValue = $('#control-select-time').val();
        }
        
        // Verifica che i valori siano validi
        if (!dateValue || !timeValue) {
            console.error('Data o ora non valide');
            return null;
        }
        
        // Estrae anno, mese, giorno dalla data (formato YYYY-MM-DD)
        const dateParts = dateValue.split('-');
        const year = dateParts[0];
        const month = dateParts[1];
        const day = dateParts[2];
        
        // Estrae l'ora dal tempo (formato HH:MM)
        const timeParts = timeValue.split(':');
        const hour = timeParts[0];
        
        // Compone il formato finale: yyyymmddZhh00
        const formattedDateTime = year + month + day + 'Z' + hour + '00';
        
        return formattedDateTime;
    }

})(jQuery);

let conColors = [
    "#FFFFFF",
    "#CCFFFF",
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
    "#000033",
    "#641610"
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

let sweColors = [
    "#000000",
    "#DDA0DD",
    "#DA70D6",
    "#BA55D3",
    "#9932CC",
    "#9400D3"
];

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
    let index=0;

    // 37.5 37.75 38 38.25 38.5 38.75 39
    if (fp<37.5) {
        index=0;
    } else if (fp>=37.5 && fp<37.5) {
        index=1;
    } else if (fp>=37.75 && fp<38) {
        index=2;
    } else if (fp>=38 && fp<38.25) {
        index=3;
    } else if (fp>=38.25 && fp<38.5) {
        index=4;
    } else if (fp>=38.5 && fp<38.75) {
        index=5;
    } else if (fp>=38.75 && fp<39) {
        index=6;
    } else if (fp>=39 ) {
        index=7 ;
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