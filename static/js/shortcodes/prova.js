/*
//
// da Alberto Greco il 03 luglio 2019
// modifiche apportate:
//
*****************************************************************
function box(container,type="minibox",place="com63049",prod="wrf5", hours=0, titolo="#nope");
    titolo  parametro opzionale aggiunto
            se specificato il titolo sarà usato l'oggetto il cui ID è riportato in "titolo"
                come area titolo
    la funzione è stata resa sincrona (entrambe le chiamate ajax) per consentire di calcolare
      le corrette dimensioni in tempo per poterle utilizzare in seguito.

function chart(container,place="com63049",prod="wrf5",output="gen", hours=0, step=1, titolo="#nope", riferimento="#nope");
    titolo  parametro opzionale aggiunto (vedi function box())

    riferimento
            parametro opzionale aggiunto
            se specificato fornirà l'altezza all'oggetto chart.
            Dovrà essere stata già calcolata al momento della creazione.

    sono state adeguate anche le seguenti funzioni:
    $.fn.MeteoUniparthenopeBox = function( place = "com63049", prod = "wrf5", hours=0, title="#nope" );
    $.fn.MeteoUniparthenopeDayBox = function( place = "com63049", prod = "wrf5", title="#nope" );
    $.fn.MeteoUniparthenopeCompactBox = function( place = "com63049", prod = "wrf5", title="#nope" );
    $.fn.MeteoUniparthenopeMiniBox = function(place = "com63049", prod = "wrf5", title="#nope" );
    $.fn.MeteoUniparthenopeChart = function( place = "com63049", prod = "wrf5", output="gen", hours=0, step=1, title="#nope", rif="#nope" );

*****************************************************************
*/

(function( $) {
    let languages = [ "en-US", "it-IT"]

    let apiBaseUrl="https://api.meteo.uniparthenope.it"
    let _language = (navigator.language || navigator.userLanguage).split("-")[0]



    let weatherIconUrl="images/";
    let loadingUrl="images/animated_progress_bar.gif";

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


    function pad(n, width, z) {
        z = z || '0';
        n = n + '';
        return n.length >= width ? n : new Array(width - n.length + 1).join(z) + n;
    }

    function dayOfWeek(date) {
        let year = date.substring(0, 4);
        let month = date.substring(4, 6);
        let day = date.substring(6, 8);

        let dayOfWeek = new Date(year + "-" + month + "-" + day).getDay();
        return isNaN(dayOfWeek) ? null : ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][dayOfWeek];
    };

    function monthOfYear(date) {
        let month = parseInt(date.substring(4, 6)) - 1;
        //console.log(month);
        return isNaN(month) ? null : ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"][month];
    };

    function formatDate(date) {
        let hours = date.getHours();
        let minutes = date.getMinutes();
        minutes = minutes < 10 ? '0'+minutes : minutes;
        let strTime = hours + ':' + minutes;
        return  date.getDate()+ "/" + (date.getMonth()+1)+ "/" + date.getFullYear() + "  " + strTime;
    }

    function box(container,type="minibox",place="com63049",prod="wrf5", hours=0, titolo="#nope")  {
        //console.log( "box:"+container );


        let baseName = container['selector'].replace("#","");


        //$("#"+container).empty();
        container.empty();


        let placeUrl=apiBaseUrl+"/places/"+place;


        let step=1;
        if (type == "minibox" || type == "compactbox" || type == "daybox") {
            step=24;
        }

        let timeseriesUrl = apiBaseUrl+"/products/"+prod+"/timeseries/"+place+"?hours="+hours+"&step="+step;
        console.log("placeUrl: "+placeUrl);
        console.log("timeseriesUrl: "+timeseriesUrl);

        let divBox=null;

        // Get the place data
        mio={"titolo": titolo};
        //$.getJSON( placeUrl, mio, function( placeData ) {
        $.ajax({
            url: placeUrl,
            async: false,
            success: function (placeData) {
            //console.log(placeData);

            // Create the main container
            divBox=$('<div>');
            divBox.attr('id',baseName+'_box');
            divBox.attr('class','box');

            // Append the title
            //divBox.append('<div class="title">'+placeData['long_name']['it']+'</div>');
                /*
                    if (titolo=="#nope"){
                        divBox.append('<div class="title">'+placeData['long_name']['it']+'</div>');
                    } else {
                        $(titolo).empty();
                        $(titolo).append('<div class="title">'+placeData['long_name']['it']+'</div>');
                    }
                */

            if (titolo !="#nope"){
                $(titolo).empty();
                $(titolo).append('<div class="title">'+placeData['long_name']['it']+'</div>');
            }

            // Append the loading div
            divBox.append('<div id="'+baseName+'loading"><img src="'+loadingUrl+'" width="100%"/></div>');

            let display = $("#"+baseName).css("display");

            let table = $('<table>');
            table.attr('id',baseName+'table');
            table.attr( 'width',"100%");
            table.attr( 'cellspacing','0');
            table.attr( 'cellpadding','0');
            table.attr( 'border','0');
            table.attr( 'style','display:'+display);

            //table.attr( 'style','display: none');
            if (prod==="wrf5") {
                if (type == "minibox") {
                    table.append('<tr class="legenda">' +
                        '<td width="60%" colspan="2" valign="top" align="left">Forecast</td>' +
                        '<td width="20%" valign="top" align="center">Wind</td>' +
                        '<td width="20%" valign="top" align="center">Sea</td>' +
                        '</tr>');
                } else if (type == "compactbox") {
                    table.append('<tr class="legenda">' +
                        '<td width="40%" colspan="2">Forecast</td>' +
                        '<td width="20%" colspan="2">Temp</td>' +
                        '<td width="20%">Wind</td>' +
                        '<td width="20%">Sea</td>' +
                        '</tr>');
                } else if (type == "daybox") {
                    table.append('<tr class="legenda">' +
                        '<td width="32%" colspan="2">Forecast</td>' +
                        '<td width="9%" class="tMin">T&nbsp;min &deg;C</td>' +
                        '<td width="9%" class="tMax">T&nbsp;max &deg;C</td>' +
                        '<td width="21%" colspan="2">Wind (kn)</td>' +
                        '<td width="28%">Rain (mm)</td>' +
                        '</tr>');
                } else {
                    table.append('<tr class="legenda">' +
                        '<td width="32%" colspan="2">Forecast</td>' +
                        '<td width="9%" class="press">Press (hPa)</td>' +
                        '<td width="9%" class="temp">Temp &deg;C</td>' +
                        '<td width="21%" colspan="2">Wind (kn)</td>' +
                        '<td width="28%">Rain (mm)</td>' +
                        '</tr>')
                }
            }
            divBox.append(table);

            // Create the ink container
            /*
            var divInk=$('<div>');
            divInk.attr('class','meteo.ink');
            divInk.append('<a href="http://meteo.uniparthenope.it" target="_blank" title="Meteo">CCMMMA: http://meteo.uniparthenope.it</a>');
            divInk.append('<br/>');
            divInk.append('&copy;2019 '+
                '<a href="http://meteo.uniparthenope.it/" title="Meteo siti web" target="_blank">'+
                '<b>meteo.uniparthenope.it</b> - <b>CCMMMA</b> Universit&agrave; Parthenope</a>');

            divBox.append(divInk);
            */
            container.append(divBox);

            //console.log("-----------------------------------");
            //$.getJSON( timeseriesUrl, function( data ) {
            $.ajax({
                url: timeseriesUrl,
                async: false,
                success: function (data) {
                let timeseriesData=data['timeseries'];
                console.log("-------------> "+timeseriesData);

                $.each( timeseriesData, function( key, val ) {

                    let year = val['dateTime'].substring(0, 4);
                    let month = val['dateTime'].substring(4, 6);
                    let day = val['dateTime'].substring(6, 8);
                    let hour = val['dateTime'].substring(9, 11);
                    let sDateTime = year + "-" + month + "-" + day + "T" + hour + ":00:00Z";

                    let dateTime = new Date(sDateTime);

                    let weekDayLabel=dayOfWeek(val['dateTime']);
                    let monthDay=monthOfYear(val['dateTime']) + "-" + val['dateTime'].substring(6,8);

                    let wIconUrl=weatherIconUrl+"/"+val['icon'];
                    let wTextLabel=val['text'];

                    let windLabel="";
                    let windBarbUrl="";

                    let seaWaveUrl="";
                    let waveLabel="";



                    let row='<tr>';

                    if (prod==="wrf5") {
                        if (type == "minibox") {
                            row += '  <td class="data" valign="top" align="center">';
                            row += '    <a href="' + val['link'] + '" target="_blank" class="day" title="Meteo ' + placeData['long_name']['it'] + ' - ' + weekDayLabel + ' ' + monthDay + '" >';
                            row += weekDayLabel + "<br/>" + monthDay;
                            row += '    </a>';
                            row += '  </td>';
                            row += '  <td class="data" valign="top" align="center">';
                            row += '      <img src="' + wIconUrl + '" width="16" height="16" alt="' + wTextLabel + '" title="' + wTextLabel + '" />';
                            row += '    <br/>' + val['t2c-min'] + '/' + val['t2c-max'];
                            row += '  </td>';
                            row += '  <td class="data"  align="center">';
                            row += '    <img src="' + windBarbUrl + '" alt="' + windLabel + '" title="' + windLabel + '" width="16" heigh="16" />';
                            row += '  </td>';
                            row += '  <td class="data"  align="center">';
                            row += '    <img src="' + seaWaveUrl + '" alt="' + waveLabel + '" title="' + waveLabel + '" width="16" heigh="16" />';
                            row += '  </td>';
                        } else if (type == "compactbox") {
                            row += '  <td class="data">'
                            row += '    <a href="' + val['link'] + '" target="_blank" class="day" title="Meteo ' + placeData['long_name']['it'] + ' - ' + weekDayLabel + ' ' + monthDay + '" >';
                            row += weekDayLabel + " " + monthDay;
                            row += '    </a>';
                            row += '  </td>';
                            row += '  <td class="data">';
                            row += '    <a href="' + val['link'] + '" target="_blank" class="day" title="Meteo ' + placeData['long_name']['it'] + ' - ' + weekDayLabel + ' ' + monthDay + '" >';
                            row += '      <img src="' + wIconUrl + '" width="16" height="16" alt="' + wTextLabel + '" title="' + wTextLabel + '" />';
                            row += '    </a>';
                            row += '  </td>';
                            row += '  <td class="data tmin">' + val['t2c-min'] + '</td>';
                            row += '  <td class="data tmax">' + val['t2c-max'] + '</td>';
                            row += '  <td class="data">';
                            row += '    <img src="' + windBarbUrl + '" alt="' + windLabel + '" title="' + windLabel + '" width="16" heigh="16" />';
                            row += '  </td>';
                            row += '  <td class="data">';
                            row += '    <img src="' + seaWaveUrl + '" alt="' + waveLabel + '" title="' + waveLabel + '" width="16" heigh="16" />';
                            row += '  </td>';
                        } else if (type == "daybox") {
                            row += '  <td class="data">'
                            row += '    <a href="' + val['link'] + '" target="_blank" class="day" title="Meteo ' + placeData['long_name']['it'] + ' - ' + weekDayLabel + ' ' + monthDay + '" >';
                            row += weekDayLabel + "<br/>" + monthDay;
                            row += '    </a>';
                            row += '  </td>';
                            row += '  <td class="data">';
                            row += '    <a href="' + val['link'] + '" target="_blank" class="day" title="Meteo ' + placeData['long_name']['it'] + ' - ' + weekDayLabel + ' ' + monthDay + '" >';
                            row += '      <img src="' + wIconUrl + '" class="weathericon" alt="' + wTextLabel + '" title="' + wTextLabel + '" />';
                            row += '    </a>';
                            row += '  </td>';
                            row += '  <td class="data tmin">' + val['t2c-min'] + '</td>';
                            row += '  <td class="data tmax">' + val['t2c-max'] + '</td>';
                            row += '  <td class="data">' + val['winds'] + '</td>';
                            row += '  <td class="data">' + val['ws10n'] + '</td>';
                            row += '  <td class="data">' + val['crh'] + '</td>';
                        } else {
                            row += '  <td class="data">'
                            row += '    <a href="' + val['link'] + '" target="_blank" class="day" title="Meteo ' + placeData['long_name']['it'] + ' - ' + formatDate(dateTime) + '" >';
                            row += formatDate(dateTime);
                            row += '    </a>';
                            row += '  </td>';
                            row += '  <td class="data">';
                            row += '    <a href="' + val['link'] + '" target="_blank" class="day" title="Meteo ' + placeData['long_name']['it'] + ' - ' + formatDate(dateTime) + '" >';
                            row += '      <img src="' + wIconUrl + '" class="weathericon" alt="' + wTextLabel + '" title="' + wTextLabel + '" />';
                            row += '    </a>';
                            row += '  </td>';
                            row += '  <td class="data press">' + val['slp'] + '</td>';
                            row += '  <td class="data temp">' + val['t2c'] + '</td>';
                            row += '  <td class="data">' + val['winds'] + '</td>';
                            row += '  <td class="data">' + val['ws10n'] + '</td>';
                            row += '  <td class="data">' + val['crh'] + '</td>';
                        }
                    }
                    row+='</tr>';
                    table.append(row);
                });
                $('#'+baseName+'loading').hide();
                $('#'+baseName+'table').show();
            }});
        }});
        return divBox;
    };

    function chart(container,place="com63049",prod="wrf5",output="gen", hours=0, step=1,  ncepDate=null, titleContainer=null)  {
        //console.log( "chart:"+container);
        if (titleContainer!=null) {
            console.log("title:" + titleContainer["selector"]);
        }

        if (ncepDate==null) {

            let dateTime = new Date();
            ncepDate = dateTime.getFullYear() + pad(dateTime.getMonth() + 1, 2) + pad(dateTime.getDate(), 2) + "Z" + "00" + "00";

        }

        let baseName=container["selector"].replace("#","");


        //$("#"+container).empty();
        container.empty();


        let placeUrl=apiBaseUrl+"/places/"+place;


        let timeseriesUrl=apiBaseUrl+"/products/"+prod+"/timeseries/"+place+"?hours="+hours+"&step="+step+"&date="+ncepDate;
        //console.log("placeUrl: "+placeUrl);
        //console.log("timeseriesUrl: "+timeseriesUrl);

        let divBox=null;

        // Get the place data
        $.getJSON( placeUrl, function( placeData ) {
            //console.log(placeData);

            // Create the main container
            divBox=$('<div>');
            divBox.attr('id',baseName+'-box');
            divBox.attr('class','box');

            // Append the title
            /*
            if (titleContainer==null){
              divBox.append('<div class="title">'+placeData['long_name']['it']+'</div>');
            } else {
                titleContainer.empty();
                titleContainer.append('<div class="title">'+placeData['long_name']['it']+'</div>');
            }

             */
            if (titleContainer!=null) {
                titleContainer.empty();
                titleContainer.append('<div class="title">'+placeData['long_name']['it']+'</div>');
            }

            let height=$("#"+baseName).css("height");
            // Append the loading div
            divBox.append('<div id="'+baseName+'-chart-loadingDiv"><img src="'+loadingUrl+'" width="100%"/></div>');
            divBox.append('<div id="'+baseName+'-chart-container-canvasDiv" style="height: '+height+'; width: inherit; display:none"></div>');

            // Create the ink container
            /*
            var divInk=$('<div>');
            divInk.attr('class','meteo.ink');
            divInk.append('<a href="http://meteo.uniparthenope.it" target="_blank" title="Meteo">CCMMMA: http://meteo.uniparthenope.it</a>');
            divInk.append('<br/>');
            divInk.append('&copy;2019 '+
                '<a href="http://meteo.uniparthenope.it/" title="Meteo siti web" target="_blank">'+
                '<b>meteo.uniparthenope.it</b> - <b>CCMMMA</b> Universit&agrave; Parthenope</a>');

            divBox.append(divInk);
            */
            container.append(divBox);

            //console.log("-----------------------------------");
            //console.log("Prod:"+prod);

            let title = "Forecast";
            let dataPoints = [];
            let dataPoints2 = [];
            let data=[];

            let axisY=null, axisY2=null, colorSet=null;

            if (prod==='wrf5') {
                if (output === "gen" || output === "tsp") {
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
                } else if (output==="wn1") {

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
                } else if (output==="crh") {
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
                } else if (output==="rh2") {
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
                } else if (output==="swe") {
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
                }
            } else if (prod==='wcm3') {
                if (output === "gen" || output === "con") {
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
            } else if (prod==='rms3') {
                if (output === "gen" || output === "scu") {
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
                } else if (output === "sst") {
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

                } else if (output === "sss") {
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

                } else if (output === "sts") {
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
                }

            } else if (prod==='ww33') {
                //console.log("ww33 -------------- ww33")
                if (output === "gen" || output === "hsd") {
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
                } else if (output === "lmd") {
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

                } else if (output === "fpd") {
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

                } else if (output === "ppd") {
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

                }
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


            let chart = new CanvasJS.Chart(baseName+"-chart-container-canvasDiv", options);




            $.getJSON( timeseriesUrl, function( data ) {
                let timeseriesData=data['timeseries'];
                //console.log("-------------> "+timeseriesData);

                $.each( timeseriesData, function( key, val ) {

                     let date = val.dateTime;
                     let year = date.substring(0, 4);
                     let month = date.substring(4, 6);
                     let day = date.substring(6, 8);
                    let hour = date.substring(9, 11);
                    let sDateTime = year + "-" + month + "-" + day + "T" + hour + ":00:00Z";

                    let dateTime = new Date(sDateTime);

                    if (prod==='wrf5') {
                        if (output === "gen" || output === "tsp") {

                            dataPoints2.push({
                                x: dateTime,
                                y: val.slp
                            });

                            dataPoints.push({
                                x: dateTime,
                                y: val.t2c,
                                color: temp2color(val.t2c)
                            });
                        } else if (output=="wn1") {

                            dataPoints.push({
                                x: dateTime,
                                y: val.ws10n,
                                color: windKnt2color(val.ws10n)
                            });

                            dataPoints2.push({
                                x: dateTime,
                                y: val.wd10
                            });
                        } else if (output=="crh") {

                            dataPoints.push({
                                x: dateTime,
                                y: val.crh
                            });

                            dataPoints2.push({
                                x: dateTime,
                                y: val.clf * 100
                            });
                        } else if (output=="rh2") {

                            dataPoints.push({
                                x: dateTime,
                                y: val.rh2,
                                color: rh2color(val.rh2)
                            });

                            dataPoints2.push({
                                x: dateTime,
                                y: val.wd10
                            });
                        } else if (output=="swe") {

                            dataPoints.push({
                                x: dateTime,
                                y: val.swe,
                                color: swe2color(val.swe)
                            });

                            dataPoints2.push({
                                x: dateTime,
                                y: val.wd10
                            });
                        }
                    } else if (prod==='wcm3') {
                        if (output === "gen" || output === "con") {

                            dataPoints.push({
                                x: dateTime,
                                y: val.con,
                                color: con2color(val.con)
                            });
                        }
                    } else if (prod==='rms3') {
                        if (output === "gen" || output === "scu") {
                            dataPoints.push({
                                x: dateTime,
                                y: val.scm,
                                color: scm2color(val.scm)
                            });

                            dataPoints2.push({
                                x: dateTime,
                                y: val.scd
                            });
                        } else if (output === "sst") {
                            dataPoints.push({
                                x: dateTime,
                                y: val.sst,
                                color: sst2color(val.sst)
                            });

                        } else if (output === "sss") {
                            dataPoints.push({
                                x: dateTime,
                                y: val.sss,
                                color: sss2color(val.sss)
                            });

                        } else if (output === "sts") {
                            dataPoints.push({
                                x: dateTime,
                                y: val.sst,
                                color: sst2color(val.sst)
                            });

                            dataPoints2.push({
                                x: dateTime,
                                y: val.sss
                            });
                        }
                    } else if (prod==='ww33') {
                        if (output === "gen" || output === "hsd") {
                            dataPoints.push({
                                x: dateTime,
                                y: val.hs,
                                color: hs2color(val.hs)
                            });

                            dataPoints2.push({
                                x: dateTime,
                                y: val.dir
                            });
                        } else if (output === "lmd") {
                            dataPoints.push({
                                x: dateTime,
                                y: val.lm,
                                color: lm2color(val.lm)
                            });

                            dataPoints2.push({
                                x: dateTime,
                                y: val.dir
                            });

                        } else if (output === "fpd") {
                            dataPoints.push({
                                x: dateTime,
                                y: val.fp,
                                color: fp2color(val.fp)
                            });

                            dataPoints2.push({
                                x: dateTime,
                                y: val.dir
                            });

                        } else if (output === "ppd") {
                            dataPoints.push({
                                x: dateTime,
                                y: val.period,
                                color: period2color(val.period)
                            });

                            dataPoints2.push({
                                x: dateTime,
                                y: val.dir
                            });
                        }
                    }
                });

                $('#'+baseName+'-chart-loadingDiv').hide();
                $('#'+baseName+'-chart-container-canvasDiv').show();
                chart.render();
            });
        });
        return divBox;
    };

    function plot(container,place="com63049",prod="wrf5",output="gen",ncepDate=null,
                  topBarImageId,
                  leftBarImageId,
                  rightBarImageId,
                  bottomBarImageId)  {
        //console.log( "plot");

        if (ncepDate==null) {
            if (prod != "rdr1" && prod != "rdr2") {
                let dateTime = new Date();
                ncepDate = dateTime.getFullYear() + pad(dateTime.getMonth() + 1, 2) + pad(dateTime.getDate(), 2) + "Z" + pad(dateTime.getHours(), 2) + "00";
            }
        }

        let _topBarImageId=topBarImageId;
        let _leftBarImageId=leftBarImageId;
        let _rightBarImageId=rightBarImageId;
        let _bottomBarImageId=bottomBarImageId;

        let baseName=container["selector"].replace("#","");

        //$("#"+container).empty();
        container.empty();

        // Create the main container
        let divPlot=$('<div>');
        divPlot.attr('id',baseName+'-plot-container');


        // Append the title
        divPlot.append(
            '<div id="'+baseName+'-plot-container-loadingDiv" class="plot-container-loadingDiv"><img src="'+loadingUrl+'"/></div>'+
            '<div id="'+baseName+'-plot-container-mapDiv" class="plot-container-mapDiv">'+
            '  <img id="'+baseName+'-plot-container-mapImage" style="width: 100%; height: 100%; display:none"/>'+
            '</div>'
        );



        container.append(divPlot);

        divPlot.update=function(place, prod, output, ncepDate) {

            //$("#plot").empty();
            let mapImageUrl=apiBaseUrl+"/products/"+prod+"/forecast/"+place+"/plot/image?date="+ncepDate+"&output="+output;
            let baseBarImageUrl=apiBaseUrl+"/products/"+prod+"/forecast/legend";
            //console.log("Plot:"+mapImageUrl);

            $('#'+baseName+'-plot-container-mapImage').hide();
            $('#'+baseName+'-plot-container-loadingDiv').show();



            $("#"+_topBarImageId).attr('src',baseBarImageUrl+"/top/"+output);
            $("#"+_leftBarImageId).attr('src',baseBarImageUrl+"/left/"+output);

            //console.log("update:"+"#"+_leftBarImageId + " --------- "+baseBarImageUrl+"/left/"+output);
            $('#'+baseName+'-plot-container-mapImage').attr('src',mapImageUrl);



            $("#"+_rightBarImageId).attr('src',baseBarImageUrl+"/right/"+output);
            $("#"+_bottomBarImageId).attr('src',baseBarImageUrl+"/bottom/"+output);

            $('#'+baseName+'-plot-container-loadingDiv').hide();
            $('#'+baseName+'-plot-container-mapImage').show();
        };
        divPlot.update(place,prod,output,ncepDate);
        return divPlot;
    };

    function Map(container,place="com63049",ncepDate=null,options=null)  {
        //console.log( "map:"+options);


        let _baseLink=window.location.href;
        let _mapName="muggles";

        let _customPrefix=null;
        let _noPopup=false;

        if (options!==null) {
            if ("language" in options) {
                _language=options["language"];
            }
            if ("mapName" in options) {
                _mapName=options["mapName"];
            }

            if ("baseLink" in options) {
                _baseLink=options["baseLink"];
            }

            if ("customPrefix" in options) {
                _customPrefix=options["customPrefix"];
            }

            if ("noPopup" in options && options["noPopup"]===true) {
                _noPopup=true;
            }
        }

        if (ncepDate==null) {

            let dateTime = new Date();
            ncepDate = dateTime.getFullYear() + pad(dateTime.getMonth() + 1, 2) + pad(dateTime.getDate(), 2) + "Z" + pad(dateTime.getHours(), 2) + "00";

        }



        let _map=null;
        let _controlLayers=null;
        let _center=new L.LatLng(40.85, 14.28);
        let _zoom = 5;
        let _domain="d00";
        let _prefix="";




        let baseName =container['selector'].replace("#","");

        //$("#"+container).empty();
        container.empty();

        // Create the main container
        let divMap=$('<div>');
        divMap.attr('id',baseName+'map-container');

        let height = $("#"+baseName).css("height");

        // Append the title
        divMap.append('<div id="'+baseName+'map-container-mapid" style="height: '+height+';position: inherit !important;"></div>');

        container.append(divMap);

        //Inizializzo la mappa
        _map = new L.Map(baseName+'map-container-mapid');

        let placeUrl=apiBaseUrl+"/places/"+place;
        //console.log("placeUrl:"+placeUrl);

        // Get the place data
        $.getJSON( placeUrl, function( placeData ) {


            //console.log(placeData['bbox']['coordinates']);
            //console.log("----------------");

            let marker0 = L.marker([placeData['bbox']['coordinates'][0][1], placeData['bbox']['coordinates'][0][0]]);
            let marker1 = L.marker([placeData['bbox']['coordinates'][1][1], placeData['bbox']['coordinates'][1][0]]);
            let marker2 = L.marker([placeData['bbox']['coordinates'][2][1], placeData['bbox']['coordinates'][2][0]]);

            let group = new L.featureGroup([marker0, marker1, marker2]);



            _center = new L.LatLng(placeData['cLat'], placeData['cLon']);

            //console.log(_center);
            _map.setView(_center, _zoom);

            _map.fitBounds(group.getBounds());
            _zoom = _map.getZoom();
            _center = _map.getBounds().getCenter();


            let overlayMaps = {};
            let baseMaps = {};

            let urlMap = apiBaseUrl+'/v2/maps/' + _mapName;
            //console.log("urlMap:" + urlMap);

            $.ajax({
                url: urlMap,
                async: true,
                success: function (dataMaps) {
                    //console.log("BEGIN");

                    $.each(dataMaps["baseMaps"], function (index, value) {  // To be sync
                        let baseMapName = Object.keys(value)[0];

                        //console.log(baseMapName + ":" + isActive);

                        let urlBaseMap = apiBaseUrl+'/v2/basemaps/' + baseMapName;
                        //console.log("urlBaseMap:" + urlBaseMap);

                        $.ajax({
                            url: urlBaseMap,
                            async: false,
                            success: function (dataBaseMap) {
                                let isActive = false;
                                let name = dataBaseMap["name"][_language];
                                let type = dataBaseMap["type"];
                                let extras = dataBaseMap["extras"];


                                console.log(name+":"+Cookies.get('baseMap'));
                                if (Cookies.get('baseMap')) {

                                    if ( name == Cookies.get('baseMap')) {
                                        //console.log(name + " is active!");
                                        isActive=true;
                                    }
                                } else {
                                    isActive=eval(value[baseMapName]);
                                }

                                switch (type) {
                                    case 'tiled':
                                        let url = dataBaseMap["url"];
                                        baseMaps[name] = L.tileLayer(url, extras);
                                        break;

                                    case 'navionics':
                                        //console.log("chartType:" + extras["chartType"]);
                                        extras["chartType"] = eval(extras["chartType"]);
                                        //console.log("chartType:" + extras["chartType"]);
                                        baseMaps[name] = new JNC.Leaflet.NavionicsOverlay(extras);
                                        break;
                                }
                                if (isActive == true) {
                                    baseMaps[name].addTo(_map);
                                    Cookies.set("baseMap",name);
                                }
                            }
                        });
                    });



                    //console.log("END");


                    // Evento sulla modifica dello zoom della mappa
                    _map.on('zoomend', function () {
                        _zoom = _map.getZoom();
                        change_domain(_mapName,_map.getBounds());
                    });

                    _map.on('moveend', function (e) {
                        _center = _map.getBounds().getCenter();
                        change_domain(_mapName,_map.getBounds());
                    });

                    _map.on('baselayerchange', function (e) {
                        //console.log("baselayerchange:"+e.name);
                        Cookies.set("baseMap",e.name);
                    });

                    _map.on('overlayadd', function (e) {
                        //console.log("overlayadd:"+e.name);
                        Cookies.set(e.name,true);
                    });

                    _map.on('overlayremove', function (e) {
                        //console.log("overlayremove:"+e.name);
                        Cookies.set(e.name,false);
                    });

                    let loadingControl = L.Control.loading({
                        spinjs: true
                    });
                    _map.addControl(loadingControl);


                    // Add the geojson layer to the layercontrol
                    //console.log("baseMaps:"+Object.keys(baseMaps));
                    //console.log("overlayMaps:"+Object.keys(overlayMaps));
                    _controlLayers = L.control.layers(baseMaps, overlayMaps, {collapsed: true}).addTo(_map);

                    /*****************************************/

                    divMap.update = function (place, ncepDate) {

                        change_domain(_mapName,_map.getBounds());
                    };

                    divMap.update(place, ncepDate);

                    console.log("divMap")
                    console.log(divMap)

                    return divMap;
                }
            });

            function change_domain(mapName, bounds) {
                //console.log("mapName: "+mapName);
                //console.log("_zoom:" + _zoom);

                let new_prefix=null;

                if (_customPrefix!=null) {
                    new_prefix=_customPrefix;
                } else {
                    if (_zoom >= 0 && _zoom <= 6) {
                        new_prefix = 'reg';
                    } else if (_zoom >= 7 && _zoom <= 10) {
                        new_prefix = 'prov';
                    } else {
                        new_prefix = 'com';
                    }
                }




                let new_domain = null;
                let boundsD01 = L.latLngBounds(L.latLng(27.64, -19.68), L.latLng(63.48, 34.80));
                let boundsD02 = L.latLngBounds(L.latLng(34.40, 3.58), L.latLng(47.83, 22.26));
                let boundsD03 = L.latLngBounds(L.latLng(39.15, 13.56), L.latLng(41.62, 16.31));


                if (boundsD03.contains(bounds)) {
                    new_domain = "d03";
                } else if (boundsD02.contains(bounds)) {
                    new_domain = "d02";
                } else {
                    new_domain = "d01";
                }

                //console.log("_domain: " + _domain+" "+" new_domain: "+new_domain);
                if (new_domain !== _domain) {
                    _domain = new_domain;
                    //console.log("Domain change! "+_domain);

                    let urlMap = apiBaseUrl+'/v2/maps/' + mapName;
                    //console.log("url:" + urlMap);

                    $.ajax({
                        url: urlMap,
                        async: true,
                        success: function (dataMaps) {
                            //console.log("BEGIN");


                            $.each(dataMaps["layers"], function (index, value) {
                                let layerName = Object.keys(value)[0];

                                //console.log(layerName + ":" + isActive);

                                let urlLayer = apiBaseUrl+'/v2/layers/' + layerName;
                                //console.log("url:" + urlLayer);

                                $.ajax({
                                    url: urlLayer,
                                    async: false,
                                    success: function (dataLayer) {
                                        let isActive = false;
                                        let name = dataLayer["name"][_language];
                                        let type = dataLayer["type"]
                                        let extras = dataLayer["extras"];

                                        let year = ncepDate.substring(0, 4);
                                        let month = ncepDate.substring(4, 6);
                                        let day = ncepDate.substring(6, 8);



                                        if (Cookies.get(name)) {
                                            isActive=eval(Cookies.get(name))
                                            //console.log(name +" is "+isActive)
                                        } else {
                                            //console.log(name + ": not defined;")
                                            isActive=eval(value[layerName]);
                                            //console.log("From API:"+isActive);
                                        }
                                        Cookies.set(name,isActive);


                                        let url = null;

                                        if ("url" in dataLayer) {
                                            url = dataLayer["url"];
                                            //console.log("url dataLayer:" + url);
                                            let newUrl = url.replace("{domain}", _domain);
                                            newUrl = newUrl.replace("{prefix}", _prefix);
                                            newUrl = newUrl.replace("{year}", year);
                                            newUrl = newUrl.replace("{month}", month);
                                            newUrl = newUrl.replace("{day}", day);
                                            newUrl = newUrl.replace("{domain}", _domain);
                                            newUrl = newUrl.replace("{ncepDate}", ncepDate);
                                            url = newUrl;
                                            //console.log("url dataLayer dopo la modifica:" + url);
                                        }


                                        let layerInstance=null;
                                        switch (type) {
                                            case 'wms':
                                                if (name in overlayMaps && overlayMaps[name] != null) {
                                                    //console.log("Removing:"+name);
                                                    _controlLayers.removeLayer(overlayMaps[name]);
                                                    _map.removeLayer(overlayMaps[name]);
                                                }

                                                //console.log("WMS: " + url);
                                                layerInstance = L.tileLayer.wms(url, extras);
                                                break;

                                            case 'velocity':
                                                if (name in overlayMaps && overlayMaps[name] != null) {
                                                    //console.log("Removing:"+name);
                                                    _controlLayers.removeLayer(overlayMaps[name]);
                                                    _map.removeLayer(overlayMaps[name]);
                                                }

                                                //console.log("VELOCITY:"+urlLayer);


                                                // load data (u, v grids) from somewhere (e.g. https://github.com/danwild/wind-js-server)
                                                $.ajax({
                                                    url: url,
                                                    async: false,
                                                    success: function (data) {

                                                        //console.log(url);

                                                        extras["data"] = data;

                                                        //console.log(extras);

                                                        layerInstance = L.velocityLayer(extras);
                                                        //console.log("layer:" + layerInstance);
                                                    }

                                                });
                                                break;

                                        }
                                        if (layerInstance != null) {
                                            //console.log("RICHIAMO IL LAYER: "+name);
                                            overlayMaps[name]=layerInstance;
                                            if (isActive) {
                                                //console.log("ATTIVO IL LAYER: "+name);
                                                _map.addLayer(overlayMaps[name]);
                                            }
                                            //console.log("AGGIUNGO IN OVERLAY IL LAYER: "+name);
                                            _controlLayers.addOverlay(overlayMaps[name], name);
                                        }
                                    }
                                });
                            });
                        }
                    });
                }

                //++++++
                //console.log("_prefix: " + _prefix+" "+" new_prefix: "+new_prefix);
                if (new_prefix !== _prefix) {
                    _prefix = new_prefix;
                    //console.log("Prefix change! "+_prefix);

                    let urlMap = apiBaseUrl+'/v2/maps/' + mapName;
                    //console.log("url:" + urlMap);

                    $.ajax({
                        url: urlMap,
                        async: true,
                        success: function (dataMaps) {
                            //console.log("BEGIN");


                            $.each(dataMaps["layers"], function (index, value) {
                                let layerName = Object.keys(value)[0];

                                //console.log(layerName + ":" + isActive);

                                let urlLayer = apiBaseUrl+'/v2/layers/' + layerName;
                                //console.log("url:" + urlLayer);

                                $.ajax({
                                    url: urlLayer,
                                    async: false,
                                    success: function (dataLayer) {
                                        let isActive = false;
                                        let name = dataLayer["name"][_language];
                                        let type = dataLayer["type"]
                                        let extras = dataLayer["extras"];

                                        let year = ncepDate.substring(0, 4);
                                        let month = ncepDate.substring(4, 6);
                                        let day = ncepDate.substring(6, 8);



                                        if (Cookies.get(name)) {
                                            isActive=eval(Cookies.get(name))
                                            //console.log(name +" is "+isActive)
                                        } else {
                                            //console.log(name + ": not defined;")
                                            isActive=eval(value[layerName]);
                                            //console.log("From API:"+isActive);
                                        }
                                        Cookies.set(name,isActive);


                                        let url = null;

                                        if ("url" in dataLayer) {
                                            url = dataLayer["url"];
                                            //console.log("url dataLayer:" + url);
                                            let newUrl = url.replace("{domain}", _domain);
                                            newUrl = newUrl.replace("{prefix}", _prefix);
                                            newUrl = newUrl.replace("{year}", year);
                                            newUrl = newUrl.replace("{month}", month);
                                            newUrl = newUrl.replace("{day}", day);
                                            newUrl = newUrl.replace("{domain}", _domain);
                                            newUrl = newUrl.replace("{ncepDate}", ncepDate);
                                            url = newUrl;
                                            //console.log("url dataLayer dopo la modifica:" + url);
                                        }


                                        let layerInstance=null;
                                        switch (type) {

                                            case 'icon':
                                                //console.log("Icon Type url: "+urlLayer);

                                                if (name in overlayMaps && overlayMaps[name] != null) {
                                                    //console.log("Removing:"+name);
                                                    _controlLayers.removeLayer(overlayMaps[name]);
                                                    _map.removeLayer(overlayMaps[name]);
                                                }

                                                $.ajax({
                                                    url:urlLayer,
                                                    async:false,
                                                    success: function(data){

                                                        let option_geojsonTileLayer = { clipTiles: true, };

                                                        let geojsonOptions_geojsonTileLayer = {
                                                            style: data["style"],
                                                            pointToLayer: function (features, latlng) {

                                                                //console.log(data)

                                                                let icon = features.properties.icon;
                                                                //console.log(icon)
                                                                //console.log(data["extras"]["icons"])

                                                                function getResourceName(url) {
                                                                    return url.substring(url.lastIndexOf('/')+1)
                                                                }


                                                                let iconObject = L.icon({
                                                                    iconUrl: weatherIconUrl+getResourceName(data["extras"]["icons"][icon]["url"]),
                                                                    iconRetinaUrl: weatherIconUrl+getResourceName(data["extras"]["icons"][icon]["url"]),
                                                                    iconSize: data["extras"]["icons"][icon]["iconSize"],
                                                                    iconAnchor: data["extras"]["icons"][icon]["iconAnchor"],
                                                                    popupAnchor: data["extras"]["icons"][icon]["popupAnchor"]
                                                                });

                                                                return L.marker(latlng,{icon: iconObject});
                                                            },
                                                            filter: function (features, layer) {
                                                                /*
                                                                console.log("_prefix:"+_prefix);
                                                                console.log("filter prefix:" + features.properties.id.startsWith(_prefix));
                                                                console.log("filter:" + features.properties.id);
                                                                */
                                                                /*
                                                                let index = features.properties.id.search(/[0-9]/);
                                                                let get_type = features.properties.id.substring(0, index);
                                                                return get_type == _prefix;
                                                                 */
                                                                /*

                                                                return features.properties.id.startsWith(_prefix);
                                                                */
                                                                return true;
                                                            },

                                                            onEachFeature: function (feature, layer) {

                                                                if (feature.properties) {
                                                                    if (_noPopup==true) {
                                                                        let link = _baseLink;
                                                                        $.each(data["extras"]["popup"], function (index, item) {
                                                                            if ("link" in item) {
                                                                                let value = feature.properties[item["property"]];
                                                                                if (link.endsWith("?")) {
                                                                                    link = link + value;
                                                                                } else {
                                                                                    var arr = link.split('?');
                                                                                    if (link.length > 1 && arr[1] !== '') {
                                                                                        link = link + "&" + value;
                                                                                    } else {
                                                                                        link = link + "?" + value;
                                                                                    }

                                                                                }
                                                                            }

                                                                        });

                                                                        layer.on('click', function (e) {
                                                                            window.open(link);
                                                                        });

                                                                    } else {
                                                                        let popupString =
                                                                            "<div class='popup'>" +
                                                                            "<table class='tg' style='undefined;table-layout: fixed; width: 230px'>" +
                                                                            "<colgroup>" +
                                                                            "<col style='width: 85px'>" +
                                                                            "<col style='width: 60px'>" +
                                                                            "</colgroup>";

                                                                        $.each(data["extras"]["popup"], function (index, item) {

                                                                            let value = feature.properties[item["property"]];
                                                                            if ("eval" in item) {
                                                                                let formula = item["eval"].replace(item["property"], "feature.properties." + item["property"]);
                                                                                value = eval(formula);
                                                                            }
                                                                            let unit = "";
                                                                            if ("unit" in item) {
                                                                                unit = item["unit"];
                                                                            }

                                                                            if ("link" in item) {
                                                                                let link = _baseLink;
                                                                                if (link.endsWith("?")) {
                                                                                    link = link + value;
                                                                                } else {
                                                                                    var arr = link.split('?');
                                                                                    if (link.length > 1 && arr[1] !== '') {
                                                                                        link = link + "&" + value;
                                                                                    } else {
                                                                                        link = link + "?" + value;
                                                                                    }

                                                                                }

                                                                                popupString +=
                                                                                    "<tr>" +
                                                                                    "<td class='tg-j0tj'></td>" +
                                                                                    "<td class='tg-j0tj'><a href='" + link + "'>" + item["name"][_language] + "</a></td>" +
                                                                                    "</tr>";
                                                                            } else {

                                                                                popupString +=
                                                                                    "<tr>" +
                                                                                    "<td class='tg-j0tj'>" + item["name"][_language] + "</td>" +
                                                                                    "<td class='tg-j0tj'>" + value + unit + "</td>" +
                                                                                    "</tr>";
                                                                            }
                                                                        });

                                                                        popupString +=
                                                                            "</table>" +
                                                                            "</div>";

                                                                        layer.bindPopup(popupString);
                                                                    }

                                                                }

                                                            }
                                                        };

                                                        //console.log("geoJSONTileLayer url:"+url)
                                                        //console.log(option_geojsonTileLayer)
                                                        //console.log(geojsonOptions_geojsonTileLayer);
                                                        layerInstance= new L.geoJSONTileLayer(url, geojsonOptions_geojsonTileLayer)
                                                        //layerInstance= new L.geoJSONTileLayer(url, option_geojsonTileLayer, geojsonOptions_geojsonTileLayer);
                                                    }
                                                });

                                                break;

                                        }
                                        if (layerInstance != null) {
                                            overlayMaps[name]=layerInstance;
                                            if (isActive) {
                                                _map.addLayer(overlayMaps[name]);
                                            }
                                            _controlLayers.addOverlay(overlayMaps[name], name);
                                        }
                                    }
                                });
                            });
                        }
                    });
                }
            }
        });
        this.map=_map;
    }

    function control(container,place="com63049",prod="wrf5",output="gen",dateTime=null)  {
        //console.log( "control:"+container );

        /*
        let _prod="wrf5";
        let _output="gen";
        let _place="com63049";
        let _ncepDate=null;
        */
        let _prod=prod;
        let _output=output;
        let _place=place;
        let _ncepDate=dateTime;

        let baseName=container['selector'].replace("#","");





        function update() {

            //console.log("UPDATE: place:"+_place+" prod:"+_prod+" output:"+_output+" ncepDate:"+_ncepDate);
            divControl.trigger( "update", [ _place, _prod, _output, _ncepDate, "#box" ] );

            /* ADD METHOD THAT UPDATE PLACE AND NCEPDATE OF MAP */



            //console.log("UPDATE MAP IN CONTROL: place:"+_place+" ncepDate:"+_ncepDate);
        }

        //$("#"+container).empty();
        container.empty();

        // Create the main container
        let divControl=$('<div>');
        divControl.attr('id',baseName+'control-container');

        // Append the title
        let controlsHtml='<fieldset>';
        if (place!=null) {
            controlsHtml+='<div class="ui-widget">'+
                '  <label for="control-container-places">Places: </label>'+
                '  <input id="'+baseName+'control-container-places">'+
                '</div>';
        }
        controlsHtml+='<div class="ui-widget">';


        if (_ncepDate!=null) {
            let sNcepDate =
                _ncepDate.substring(6, 8) + "/" +
                _ncepDate.substring(4, 6) + "/" +
                _ncepDate.substring(0, 4) + " " +
                _ncepDate.substring(9, 11) + ":" +
                _ncepDate.substring(11, 13)

            controlsHtml += '<div style="display: inline-block">' +
                '<label for="control-container-datetimepicker">UTC:</label><input type="text" value="' + sNcepDate + '" id="' + baseName + 'control-container-datetimepicker"/> ' +
                '</div>';
        }

        if (prod!=null) {
            controlsHtml+='<div style="display: inline-block">'+
                '<label for="control-container-product">Product:</label>'+
                '<select name="control-container-product" id="'+baseName+'control-container-product"></select> '+
                '</div>';
        }

        if (output!=null) {
            controlsHtml+='<div style="display: inline-block">'+
                '<label for="control-container-output">Output:</label>'+
                '<select name="control-container-output" id="'+baseName+'control-container-output"></select>'+
                '</div>';
        }

        controlsHtml+='</div>';
        controlsHtml+='</fieldset>';

        divControl.append(controlsHtml);


        container.append(divControl);


        $("#" + baseName + "control-container-product").selectmenu({
            change: function (event, ui) {
                _prod = ui.item.value;
                $.getJSON(apiBaseUrl + "/products/" + _prod, function (data) {
                    let outputs = data['outputs']['outputs'];

                    $("#" + baseName + "control-container-output").empty();

                    $.each(outputs, function (key, val) {
                        $("#" + baseName + "control-container-output").append('<option value="' + key + '">' + val[_language] + '</option>');
                    });

                    _output = "gen";
                    $('#' + baseName + 'control-container-output').val(_output);
                    $("#" + baseName + "control-container-output").selectmenu("refresh");

                    update();
                });
            }
        });


        $("#" + baseName + "control-container-output").selectmenu({
            change: function (event, ui) {
                _output = ui.item.value;
                update();
            }
        });



        $( "#"+baseName+"control-container-places" ).autocomplete({
            source: function( request, response ) {
                $.ajax( {
                    url: apiBaseUrl+"/places/search/byname/autocomplete",
                    dataType: "json",
                    data: {
                        term: request.term
                    },
                    success: function( data ) {
                        //console.log("data:"+data);
                        response( data );
                    },
                    error: function (  jqXHR,  textStatus,  errorThrown) {
                        console.log("Error:"+textStatus);
                    }

                } );
            },
            minLength: 2,
            select: function( event, ui ) {
                _place=ui.item.id;
                update();
            }
        } );

        console.log("control: _ncepDate:"+_ncepDate)
        if (_ncepDate!=null) {
            $("#" + baseName + "control-container-datetimepicker")
                .datetimepicker({
                    beforeShow: function () {
                        setTimeout(function () {
                            $('.ui-datepicker').css('z-index', 99999999999999);
                        }, 0);
                    },
                    showOtherMonths: true,
                    selectOtherMonths: true,
                    dateFormat: "dd/mm/yy",
                    timeFormat: 'HH:mm',
                    stepHour: 1,
                    stepMinute: 60,
                    addSliderAccess: true,
                    sliderAccessArgs: {touchonly: false},

                    onSelect: function (dateText) {
                        let dateTime = $('#' + baseName + 'control-container-datetimepicker').datetimepicker('getDate');
                        _ncepDate = dateTime.getFullYear() + pad(dateTime.getMonth() + 1, 2) + pad(dateTime.getDate(), 2) + "Z" + pad(dateTime.getHours(), 2) + pad(dateTime.getMinutes(), 2);

                        update();
                    },

                    setDate: new Date(
                        parseInt(_ncepDate.substring(0, 4)),
                        parseInt(_ncepDate.substring(4, 6)) - 1,
                        parseInt(_ncepDate.substring(6, 8)),
                        parseInt(_ncepDate.substring(9, 11)),
                        parseInt(_ncepDate.substring(11, 12))
                    )
                });
        }



        $.getJSON( apiBaseUrl+"/products", function( data ) {
            let products=data['products'];

            //console.log("products:"+products);

            $("#"+baseName+"control-container-product").empty();

            $.each( products, function( key, val ) {
                $("#"+baseName+"control-container-product").append('<option value="'+key+'">'+val['desc'][_language]+'</option>');
            });

            _prod=prod;
            $('#'+baseName+'control-container-product').val(_prod);
            $("#"+baseName+"control-container-product").selectmenu("refresh");

            $.getJSON( apiBaseUrl+"/products/"+_prod, function( data ) {
                let outputs=data['outputs']['outputs'];

                $("#"+baseName+"control-container-output").empty();

                $.each( outputs, function( key, val ) {
                    $("#"+baseName+"control-container-output").append('<option value="'+key+'">'+val[_language]+'</option>');
                });

                _output=output;
                $('#'+baseName+'control-container-output').val(_output);
                $("#"+baseName+"control-container-output").selectmenu("refresh");
            });

            //$('#'+baseName+'control-container-datetimepicker').datetimepicker('setDate', (new Date()) );
            //let dateTime=$('#'+baseName+'control-container-datetimepicker').datetimepicker('getDate');
            //_ncepDate=dateTime.getFullYear()+pad(dateTime.getMonth()+1,2)+pad(dateTime.getDate(),2)+"Z"+pad(dateTime.getHours(),2)+pad(dateTime.getMinutes(),2);

            _place=place;
            $.getJSON(apiBaseUrl+"/places/"+_place, function( data ) {
                $( "#"+baseName+"control-container-places" ).val(data['long_name']['it']);
            });

            update();

        });
        return divControl;
    };

    $.fn.MeteoUniparthenopeBox = function( place = "com63049", prod = "wrf5", hours=0, title="#nope" ) {

        return box(this, "", place, prod, hours, title);

    };

    $.fn.MeteoUniparthenopeDayBox = function( place = "com63049", prod = "wrf5", title="#nope" ) {

        return box(this, "daybox", place, prod, 0, title);

    };

    $.fn.MeteoUniparthenopeCompactBox = function( place = "com63049", prod = "wrf5", title="#nope" ) {

        return box(this, "compactbox", place, prod,0, title);

    };
    $.fn.MeteoUniparthenopeMiniBox = function(place = "com63049", prod = "wrf5", title="#nope" ) {

        return box(this, "minibox", place, prod, 0, title);

    };


    $.fn.MeteoUniparthenopeChart = function( place = "com63049", prod = "wrf5", output="gen", hours=0, step=1, ncepDate=null, titleContainer=null ) {

        return chart(this, place, prod, output, hours, step, ncepDate, titleContainer);

    };

    $.fn.MeteoUniparthenopePlot = function(place = "com63049", prod = "wrf5", output="gen", dateTime=null,topBarImageId,leftBarImageId,rightBarImageId,bottomBarImageId ) {

        return plot(this, place, prod, output, dateTime,topBarImageId,leftBarImageId,rightBarImageId,bottomBarImageId);

    };

    $.fn.MeteoUniparthenopeMap = function(place = "com63049",  dateTime=null,options=null) {

        return new Map(this, place, dateTime,options);

    };

    $.fn.MeteoUniparthenopeControl = function(place = "com63049", prod = "wrf5", output="gen", dateTime=null ) {

        return control(this, place, prod, output, dateTime);

    };


})( jQueryProtect); // Use jQuery protected.