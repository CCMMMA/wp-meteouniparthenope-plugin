(function($){
    let controlFormDateInput ={containerID: 'id', dateInputID: 'control-select-date', timeInputID: 'control-select-time'};
    let controlFormDateObj = new ControlFormDate(controlFormDateInput);
    $divShortcodeRoot = $('#date_control_shortcode-root');
    $divShortcodeRoot.append(controlFormDateObj.getContainer());
    
    $divDateControl = $('<div>').attr('id','date-control-form-container');
    $divDateControl.append('<div id="datetime-control-container" class="container-fluid" style="display: visible">'+
                                '<div class="row">'+
                                    '<div class="col">'+
                                        '<div class="card text-center">'+
                                            '<div class="card-header text-center">'+
                                                '<h3 class="card-title">Try it out!</h3>'+
                                            '</div>'+
                                            '<div class="card-body">'+
                                                '<form id="datetime-control-form">'+
                                                    
                                                '</form>'+
                                            '</div>'+
                                        '</div>'+
                                    '</div>'+
                                '</div>'+
                           '</div>');

    $divShortcodeRoot.append($divDateControl);
    
    let nowDate = new Date();
    let maxDate = new Date(nowDate);
    maxDate.setDate(maxDate.getDate() + 4);
    let maxMonth = ((maxDate.getMonth() + 1) < 10 ? '0' + (maxDate.getMonth() + 1) : (maxDate.getMonth() + 1));
    let maxDay = (maxDate.getDate() < 10 ? '0' + maxDate.getDate() : maxDate.getDate());
    let maxDateString = maxDate.getFullYear() + '-' + maxMonth + '-' + maxDay;
    controlFormDateObj.setInputDateAttribute('max', maxDateString);
    
    
    controlFormDateObj.appendInputDateClass("form-control");
    let $divDateContainer = $('<div>').attr('class','input-group mb-3');
    $divDateContainer.append(controlFormDateObj.getDateInput());
    $('#datetime-control-form').append($divDateContainer);
    
    controlFormDateObj.appendInputTimeClass("form-control");
    let $divTimeContainer = $('<div>').attr('class','input-group mb-3');
    $divTimeContainer.append(controlFormDateObj.getTimeInput());
    $divTimeContainer.append(controlFormDateObj.getPrevButton());
    $divTimeContainer.append(controlFormDateObj.getNextButton());
    $('#datetime-control-form').append($divTimeContainer);
    
    let $controlForms = controlFormDateObj.getCombinedInputs();
    $controlForms.change(function(){
        const currentDate = $('#'+controlFormDateInput.dateInputID).val();
        if(currentDate >= maxDateString){
            const currentTime = $('#'+controlFormDateInput.timeInputID).val();
            if(currentTime === "23:00"){
                controlFormDateObj.getNextButton().prop("disabled",true);
            }
            else {
                controlFormDateObj.getNextButton().prop("disabled",false);
            }
        }
    });

})(jQuery)