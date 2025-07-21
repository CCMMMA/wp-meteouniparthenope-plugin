(function($){
    let controlFormDateInput ={containerID: 'id-prova', dateInputID: 'control-select-date-prova', timeInputID: 'control-select-time-prova'};
    let prova = new ControlFormDate(controlFormDateInput);
    $divShortcodeRoot = $('#date_control_shortcode-root');
    $divShortcodeRoot.append(prova.getContainer());
    $divDateControl = $('<div>').attr('id','date-control-form-container');
    $divDateControl.append('<div id="datetime-control-container" class="container-fluid" style="display: visible">'+
                                '<div class="row">'+
                                    '<div class="col">'+
                                        '<div class="card">'+
                                            '<div class="card-body">'+
                                                '<label for="input-group mb-3">Date and time:</label>'+
                                                '<div class="input-group mb-3">'+
                                                    '<input class="form-control" type="date" id="control-select-date">'+
                                                '</div>'+
                                                '<div class="input-group mb-3">'+
                                                    '<select class="form-control" id="control-select-time"></select>'+
                                                '</div>'+
                                            '</div>'+
                                            '<button type="button" class="btn btn-outline-primary" id="try-it-out-button">Try it out!</button>'+
                                        '</div>'+
                                    '</div>'+
                                '</div>'+
                           '</div>');


    $divShortcodeRoot.append($divDateControl);

    // Funzione per popolare la select delle ore
    function populateTimeSelect() {
        const timeSelect = $('#control-select-time');
        timeSelect.empty(); // Pulisce eventuali opzioni esistenti
        
        // Crea le opzioni dalle 00:00 alle 23:00
        for (let hour = 0; hour < 24; hour++) {
            const hourFormatted = hour.toString().padStart(2, '0');
            const timeValue = hourFormatted + ':00';
            const option = $('<option></option>')
                .attr('value', timeValue)
                .text(timeValue);
            timeSelect.append(option);
        }
    };
    populateTimeSelect();

    // Funzione per impostare data e ora correnti
    function setCurrentDateTime() {
        const now = new Date();
        
        // Imposta la data corrente nel campo date
        const year = now.getFullYear();
        const month = (now.getMonth() + 1).toString().padStart(2, '0');
        const day = now.getDate().toString().padStart(2, '0');
        const currentDate = `${year}-${month}-${day}`;  
        
        $('#control-select-date').val(currentDate);
        
        // Imposta l'ora corrente nella select
        const currentHour = now.getHours().toString().padStart(2, '0');
        const currentTime = currentHour + ':00';
        
        $('#control-select-time').val(currentTime);
    }
    setCurrentDateTime();
})(jQuery)