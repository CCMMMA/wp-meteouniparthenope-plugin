(function($){
    let controlFormDateInput ={containerID: 'id-prova', dateInputID: 'control-select-date-prova', timeInputID: 'control-select-time-prova'};
    let prova = new ControlFormDate(controlFormDateInput);
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
    
    prova.appendInputDateClass("form-control");
    let $divDateContainer = $('<div>').attr('class','input-group mb-3');
    $divDateContainer.append(prova.getDateInput());
    $('#datetime-control-form').append($divDateContainer);
    
    prova.appendInputTimeClass("form-control");
    let $divTimeContainer = $('<div>').attr('class','input-group mb-3');
    $divTimeContainer.append(prova.getTimeInput());
    $('#datetime-control-form').append($divTimeContainer);
})(jQuery)