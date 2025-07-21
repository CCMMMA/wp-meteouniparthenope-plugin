(function($){
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

        container.empty();

        let placeUrl=apiBaseUrl+"/places/"+place;

        let timeseriesUrl=apiBaseUrl+"/products/"+prod+"/timeseries/"+place+"?hours="+hours+"&step="+step+"&date="+ncepDate;
        //console.log("placeUrl: "+placeUrl);
        //console.log("timeseriesUrl: "+timeseriesUrl);s

        let divBox=null;

        // Get the place data
        $.getJSON( placeUrl, function( placeData ) {

            // Create the main container
            divBox=$('<div>');
            divBox.attr('id',baseName+'-box');
            divBox.attr('class','box');

            // Append the title
            if (titleContainer!=null) {
                titleContainer.empty();
                titleContainer.append('<div class="title">'+placeData['long_name']['it']+'</div>');
            }

            let height=$("#"+baseName).css("height");
            // Append the loading div
            divBox.append('<div id="'+baseName+'-chart-loadingDiv"><img src="'+loadingUrl+'" width="100%"/></div>');
            divBox.append('<div id="'+baseName+'-chart-container-canvasDiv" style="height: '+height+'; width: inherit; display:none"></div>');

            container.append(divBox);

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
})(jQuery);