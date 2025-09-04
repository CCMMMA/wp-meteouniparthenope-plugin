(function($){
    const queryString = window.location.search;
    const urlParams = new URLSearchParams(queryString);

    if(urlParams.size !== 0){
        console.log(urlParams);
        var dateAndTime = urlParams.get('date').split("Z");
        var date = dateAndTime[0];
        var time = dateAndTime[1];
        var product = urlParams.get('prod');
        var output = urlParams.get('output');
        
        //Date and time input
        let $controlSelectDate = $('#control-select-date');
        $controlSelectDate.val(date);
        let $controlSelectTime = $('#control-select-time');
        $controlSelectTime.val(time);

        //Product input


        //Output input
        let $controlSelectOutput = $('#control-select-output');
        $controlSelectOutput.val(""+output);

    }
    else{
        console.log("NESSUN PARAMETRO GET");
    }

})(jQuery)