(function($){
    let controlFormDateInput = {
        containerID: 'id', 
        dateInputID: 'control-select-date', 
        timeInputID: 'control-select-time'
    };
    let controlFormDateObj = new ControlFormDate(controlFormDateInput);
    
    $divShortcodeRoot = $('#date_control_shortcode-root');
    $divShortcodeRoot.append(controlFormDateObj.getContainer());
    
    $divDateControl = $('<div>').attr('id','date-control-form-container');
    $divDateControl.append('<div id="datetime-control-container" class="container-fluid" style="display: visible">'+
        '<div class="row">'+
        '<div class="col">'+
        '<div class="card text-center">'+
        '<div class="card-body">'+
        '<form id="datetime-control-form">'+
        '</form>'+
        '</div>'+
        '</div>'+
        '</div>'+
        '</div>'+
        '</div>');
    $divShortcodeRoot.append($divDateControl);
    
    let nowDate = controlFormDateObj.getInternalUTCDate();
    let maxDate = new Date(nowDate);
    maxDate.setDate(maxDate.getDate() + 4);
    let maxMonth = ((maxDate.getMonth() + 1) < 10 ? '0' + (maxDate.getMonth() + 1) : (maxDate.getMonth() + 1));
    let maxDay = (maxDate.getDate() < 10 ? '0' + maxDate.getDate() : maxDate.getDate());
    let maxDateString = maxDate.getFullYear() + '-' + maxMonth + '-' + maxDay;
    
    controlFormDateObj.setInputDateAttribute('max', maxDateString);
    controlFormDateObj.appendInputDateClass("form-control");
    
    // Aggiungere la label e styling per il campo data
    controlFormDateObj.appendDateLabelClass("form-label mb-0");
    let $divDateRow = $('<div>').attr('class','d-flex align-items-center mb-3');
    let $divDateLabelCol = $('<div>').css({
        'flex': '0 0 auto',
        'margin-right': '15px'
    });
    let $divDateInputCol = $('<div>').css('flex', '1');
    
    controlFormDateObj.getDateLabel().css({
        'line-height': '38px',
        'height': '38px',
        'display': 'flex',
        'align-items': 'center'
    });
    
    $divDateLabelCol.append(controlFormDateObj.getDateLabel());
    $divDateInputCol.append(controlFormDateObj.getDateInput());
    $divDateRow.append($divDateLabelCol);
    $divDateRow.append($divDateInputCol);
    $('#datetime-control-form').append($divDateRow);
    
    controlFormDateObj.appendInputTimeClass("form-control");
    
    // Aggiungere la label e styling per il campo time con i nuovi pulsanti
    controlFormDateObj.appendTimeLabelClass("form-label mb-0");
    let $divTimeRow = $('<div>').attr('class','d-flex align-items-center mb-3');
    let $divTimeLabelCol = $('<div>').css({
        'flex': '0 0 auto',
        'margin-right': '15px'
    });
    let $divTimeInputCol = $('<div>').css('flex', '1');
    let $divTimeInputGroup = $('<div>').attr('class','input-group');
    
    controlFormDateObj.getTimeLabel().css({
        'line-height': '38px',
        'height': '38px',
        'display': 'flex',
        'align-items': 'center'
    });
    
    // Costruire il layout: [-1d][-1h][00][06]<select>[12][18][+1h][+1d]
    $divTimeInputGroup.append(controlFormDateObj.getPrevDayButton());
    $divTimeInputGroup.append(controlFormDateObj.getPrevButton());
    $divTimeInputGroup.append(controlFormDateObj.getTime00Button());
    $divTimeInputGroup.append(controlFormDateObj.getTime06Button());
    $divTimeInputGroup.append(controlFormDateObj.getTimeInput());
    $divTimeInputGroup.append(controlFormDateObj.getTime12Button());
    $divTimeInputGroup.append(controlFormDateObj.getTime18Button());
    $divTimeInputGroup.append(controlFormDateObj.getNextButton());
    $divTimeInputGroup.append(controlFormDateObj.getNextDayButton());
    
    $divTimeLabelCol.append(controlFormDateObj.getTimeLabel());
    $divTimeInputCol.append($divTimeInputGroup);
    $divTimeRow.append($divTimeLabelCol);
    $divTimeRow.append($divTimeInputCol);
    $('#datetime-control-form').append($divTimeRow);
    
    let $controlForms = controlFormDateObj.getCombinedInputs();
    $controlForms.change(function(){
        const currentDate = $('#'+controlFormDateInput.dateInputID).val();
        const currentTime = $('#'+controlFormDateInput.timeInputID).val();
        
        // Disabilita il pulsante +1d se siamo alla data massima
        if(currentDate >= maxDateString){
            controlFormDateObj.getNextDayButton().prop("disabled", true);
        } else {
            controlFormDateObj.getNextDayButton().prop("disabled", false);
        }
        
        // Disabilita il pulsante +1h se siamo alla data massima e all'ultima ora
        if(currentDate >= maxDateString){
            if(currentTime === "23:00"){
                controlFormDateObj.getNextButton().prop("disabled", true);
            }
            else {
                controlFormDateObj.getNextButton().prop("disabled", false);
            }
        } else {
            controlFormDateObj.getNextButton().prop("disabled", false);
        }
    });
})(jQuery)