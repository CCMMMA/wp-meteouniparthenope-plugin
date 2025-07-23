(function($){
    let controlFormDateInput ={containerID: 'id', dateInputID: 'control-select-date', timeInputID: 'control-select-time'};
    let controlFormDateObj = new ControlFormDate(controlFormDateInput);
    $divShortcodeRoot = $('#date_control_shortcode-root');
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
    
    controlFormDateObj.appendInputDateClass("form-control");
    let $divDateContainer = $('<div>').attr('class','input-group mb-3');
    $divDateContainer.append(controlFormDateObj.getDateInput());
    $('#datetime-control-form').append($divDateContainer);
    
    controlFormDateObj.appendInputTimeClass("form-control");
    let $divTimeContainer = $('<div>').attr('class','input-group mb-3');
    $divTimeContainer.append(controlFormDateObj.getTimeInput());
    $('#datetime-control-form').append($divTimeContainer);
})(jQuery)