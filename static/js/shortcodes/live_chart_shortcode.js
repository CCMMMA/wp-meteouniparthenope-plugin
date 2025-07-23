//Global variable for default values
let contextValue = "ws1";
let contexUrl = `meteo.urn:mrn:signalk:fqdn:${contextValue}_meteo_uniparthenope_it`;

(function($){
    let $realTimeSelect = $('#real-time-chart-select');
    $realTimeSelect.on('change',function(){
        mychart.destroy();
        mychart = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: [],
                datasets: [{
                    label: 'Wind speed',
                    data: [],
                    borderWidth: 1,
                    type: 'bar',
                    yAxisID: 'y',
                },
                {
                    label: 'Wind direction',
                    data: [],
                    borderWidth: 1,
                    type: 'line',
                    yAxisID: 'y1',
                }]
            },
            options: {
                plugins: {
                    title: {
                        display: true,
                        text: 'Custom Chart Title'
                    }
                },
                scales: {
                    x: {
                        type: 'time',
                        time: {
                            unit: 'minute'
                        }
                    },
                    y: {
                        title: {
                            display: true,
                            text: "kn"
                        },
                        type: 'linear',
                        display: true,
                        position: 'left',
                        beginAtZero: true
                    },
                    y1: {
                        title: {
                            display: true,
                            text: '°N'
                        },
                        type: 'linear',
                        display: true,
                        position: 'right',
                        min: 0,
                        max: 360
                    }
                }
            }
        });

        contextValue = this.value;
        let contexUrl = `meteo.urn:mrn:signalk:fqdn:${contextValue}_meteo_uniparthenope_it`;
        console.log(contexUrl);

        allWindSpeedData = [];
        allWindDirectionData = [];
        currentViewStart = 0;
        isFollowingLatest = true;

        ws.close();
        ws = new WebSocket("wss://signalk.meteo.uniparthenope.it/signalk/v1/stream?subscribe=none");
        
        getLiveData();
    });
})(jQuery);

const ctx = document.getElementById('myChart');

// Configurazione per lo scrolling
const THRESHOLD_POINTS = 10; // Soglia dopo la quale inizia lo scrolling
const VISIBLE_POINTS = 20;   // Numero di punti visibili quando si scrolla

// Array per memorizzare tutti i dati
let allWindSpeedData = [];
let allWindDirectionData = [];
let currentViewStart = 0;
let isFollowingLatest = true;

let mychart = new Chart(ctx, {
    type: 'bar',
    data: {
        labels: [],
        datasets: [{
            label: 'Wind speed',
            data: [],
            borderWidth: 1,
            type: 'bar',
            yAxisID: 'y',
        },
        {
            label: 'Wind direction',
            data: [],
            borderWidth: 1,
            type: 'line',
            yAxisID: 'y1',
        }]
    },
    options: {
        plugins: {
            title: {
                display: true,
                text: 'Custom Chart Title'
            }
        },
        scales: {
            x: {
                type: 'time',
                time: {
                    unit: 'minute'
                }
            },
            y: {
                title: {
                    display: true,
                    text: "kn"
                },
                type: 'linear',
                display: true,
                position: 'left',
                beginAtZero: true
            },
            y1: {
                title: {
                    display: true,
                    text: '°N'
                },
                type: 'linear',
                display: true,
                position: 'right',
                min: 0,
                max: 360
            }
        }
    }
});

// Funzione per aggiornare la visualizzazione del chart
function updateChartView() {
    const totalPoints = allWindSpeedData.length;
    
    if (totalPoints <= THRESHOLD_POINTS) {
        // Mostra tutti i dati se siamo sotto la soglia
        mychart.data.datasets[0].data = [...allWindSpeedData];
        mychart.data.datasets[1].data = [...allWindDirectionData];
        currentViewStart = 0;
    } else {
        // Modalità scrolling
        const endIndex = Math.min(currentViewStart + VISIBLE_POINTS, totalPoints);
        mychart.data.datasets[0].data = allWindSpeedData.slice(currentViewStart, endIndex);
        mychart.data.datasets[1].data = allWindDirectionData.slice(currentViewStart, endIndex);
    }
    
    mychart.update('active');
    updateControls();
}

// Funzione per aggiornare i controlli
function updateControls() {
    const totalPoints = allWindSpeedData.length;
    const scrollLeftBtn = document.getElementById('scrollLeft');
    const scrollRightBtn = document.getElementById('scrollRight');
    const goToLatestBtn = document.getElementById('goToLatest');
    const info = document.getElementById('info');
    
    // Aggiorna info
    const visibleCount = Math.min(VISIBLE_POINTS, totalPoints - currentViewStart);
    info.textContent = `Dati visualizzati: ${visibleCount}/${totalPoints}`;
    
    // Abilita/disabilita bottoni
    scrollLeftBtn.disabled = currentViewStart <= 0;
    scrollRightBtn.disabled = currentViewStart + VISIBLE_POINTS >= totalPoints;
    goToLatestBtn.disabled = isFollowingLatest;
}

// Event listeners per i controlli
document.getElementById('scrollLeft').addEventListener('click', () => {
    if (currentViewStart > 0) {
        currentViewStart = Math.max(0, currentViewStart - 5);
        isFollowingLatest = false;
        updateChartView();
    }
});

document.getElementById('scrollRight').addEventListener('click', () => {
    const totalPoints = allWindSpeedData.length;
    if (currentViewStart + VISIBLE_POINTS < totalPoints) {
        currentViewStart = Math.min(totalPoints - VISIBLE_POINTS, currentViewStart + 5);
        if (currentViewStart + VISIBLE_POINTS >= totalPoints) {
            isFollowingLatest = true;
        }
        updateChartView();
    }
});

document.getElementById('goToLatest').addEventListener('click', () => {
    const totalPoints = allWindSpeedData.length;
    if (totalPoints > VISIBLE_POINTS) {
        currentViewStart = totalPoints - VISIBLE_POINTS;
    } else {
        currentViewStart = 0;
    }
    isFollowingLatest = true;
    updateChartView();
});

// Simulazione WebSocket (sostituisci con il tuo codice reale)
let ws = new WebSocket("wss://signalk.meteo.uniparthenope.it/signalk/v1/stream?subscribe=none");
function getLiveData(){
    if ("WebSocket" in window) {
        let count = 0;
        
        ws.onopen = function() {
            let subscription = {
                "context": contexUrl,
                "subscribe": [
                    {
                        "path": "*",
                        "period": 1000,
                        "policy": "fixed"
                    }
                ]
            }
            ws.send(JSON.stringify(subscription));
        };
    
        ws.onmessage = function (evt) {
            let received_msg = evt.data;
            //console.log(Date.now() + " message:" + received_msg);
    
            if (mychart) {
                let mydata = JSON.parse(received_msg);
                let updateChart = false;
                
                if (mydata.updates && Array.isArray(mydata.updates)) {
                    mydata.updates.forEach(update => {
                        //console.log(update.timestamp, update)
    
                        update.values.forEach(value => {
                            //console.log("ARRIVA IL VALUE:");
                            //console.log(value);
                            let y = value.value;
                            
                            if (value.path === "name") {
                                //console.log("name:" + y)
                                mychart.options.plugins.title.text = y
                                updateChart = true;
                            } else if (value.path === "environment.wind.speedTrue") {
                                // Aggiungi ai dati completi
                                allWindSpeedData.push({
                                    x: update.timestamp,
                                    y: y * 1.94384
                                });
                                updateChart = true;
                            } else if (value.path === "environment.wind.directionTrue") {
                                // Aggiungi ai dati completi
                                allWindDirectionData.push({
                                    x: update.timestamp,
                                    y: y * (180/Math.PI)
                                });
                                updateChart = true;
                            }
                        })
                    });
                }
                else{
                    console.log("No updates array found in message:", mydata);
                }
    
                
                if (updateChart === true) {
                    // Se stiamo seguendo gli ultimi dati, aggiorna la vista
                    if (isFollowingLatest) {
                        const totalPoints = allWindSpeedData.length;
                        if (totalPoints > THRESHOLD_POINTS) {
                            currentViewStart = Math.max(0, totalPoints - VISIBLE_POINTS);
                        }
                    }
                    
                    updateChartView();
    
                    /*
                    console.log(
                        'Updated ' + count + '\n' +
                        '\tTotal Data0: ' + allWindSpeedData.length + '\n' +
                        '\tTotal Data1: ' + allWindDirectionData.length + '\n' +
                        '\tVisible Data0: ' + mychart.data.datasets[0].data.length + '\n' +
                        '\tVisible Data1: ' + mychart.data.datasets[1].data.length
                    );
                    */
    
                    count++;
                    
                    // Mantieni solo gli ultimi 600 punti nei dati completi
                    if (count > 600) {
                        allWindSpeedData.splice(0, 1);
                        allWindDirectionData.splice(0, 1);
                        if (currentViewStart > 0) {
                            currentViewStart--;
                        }
                    }
                }
            }
        };
    
        ws.onclose = function() { 
            console.log("Connection is closed..."); 
        };
    } else { 
        alert("WebSocket NOT supported by your Browser!"); 
    }
}

getLiveData();