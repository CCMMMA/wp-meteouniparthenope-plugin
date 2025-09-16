class ControlFormDate {
    static get defaults() {
        return {
            containerID: 'date-control-form-container',
            dateInputID: 'control-select-date',
            timeInputID: 'control-select-time',
            prevButtonID: 'control-prev-hour',
            nextButtonID: 'control-next-hour',
            dateLabelID: 'control-date-label',
            timeLabelID: 'control-time-label'
        };
    }

    constructor(inputs = {}) {
        this.containerID = inputs.containerID || ControlFormDate.defaults.containerID;
        this.dateInputID = inputs.dateInputID || ControlFormDate.defaults.dateInputID;
        this.timeInputID = inputs.timeInputID || ControlFormDate.defaults.timeInputID;
        this.prevButtonID = inputs.prevButtonID || ControlFormDate.defaults.prevButtonID;
        this.nextButtonID = inputs.nextButtonID || ControlFormDate.defaults.nextButtonID;
        this.dateLabelID = inputs.dateLabelID || ControlFormDate.defaults.dateLabelID;
        this.timeLabelID = inputs.timeLabelID || ControlFormDate.defaults.timeLabelID;

        
        this.$divContainer = jQuery('<div>').attr('id', this.containerID);
        this.$inputDate = jQuery('<input type="date" id="' + this.dateInputID + '">');
        this.$inputTimeSelect = jQuery('<select id="' + this.timeInputID + '"></select>');
        
        this.$prevButton = jQuery('<button type="button" id="' + this.prevButtonID + '" class="btn btn-primary">-1h</button>');
        this.$nextButton = jQuery('<button type="button" id="' + this.nextButtonID + '" class="btn btn-primary">+1h</button>');
        
        // Creazione delle label
        this.$dateLabel = jQuery('<label for="' + this.dateInputID + '" id="' + this.dateLabelID + '">Date: </label>');
        this.$timeLabel = jQuery('<label for="' + this.timeInputID + '" id="' + this.timeLabelID + '">Time UTC: </label>');
        
        this.populateTimeSelect();
        this.setupEventHandlers();
        this.internalUTCDate= this.setUTCDateTime();
        
        this.$divContainer.append(this.$inputDate);
        this.$divContainer.append(this.$inputTimeSelect);
        this.$divContainer.append(this.$prevButton);
        this.$divContainer.append(this.$nextButton);
        this.$divContainer.append(this.$dateLabel);
        this.$divContainer.append(this.$timeLabel);

    }

    getContainer() {
        return this.$divContainer;
    }

    getDateInput() {
        return this.$inputDate;
    }

    getTimeInput() {
        return this.$inputTimeSelect;
    }

    getCombinedInputs() {
        return this.$inputDate.add(this.$inputTimeSelect);
    }

    getPrevButton() {
        return this.$prevButton;
    }

    getNextButton() {
        return this.$nextButton;
    }

    // Nuovi metodi per accedere alle label
    getDateLabel() {
        return this.$dateLabel;
    }

    getTimeLabel() {
        return this.$timeLabel;
    }

    getInternalUTCDate(){
        return this.internalUTCDate;
    }

    populateTimeSelect() {
        for (let hour = 0; hour < 24; hour++) {
            const hourFormatted = hour.toString().padStart(2, '0');
            const timeValue = hourFormatted + ':00';
            const option = jQuery('<option></option>')
                .attr('value', timeValue)
                .text(hourFormatted);
            this.$inputTimeSelect.append(option);
        }
    }

    setUTCDateTime() {
        const dateTime=new Date()
        //defaultNcepDate=dateTime.getUTCFullYear()+this.pad(dateTime.getUTCMonth()+1,2)+this.pad(dateTime.getUTCDate(),2)+"Z"+this.pad(dateTime.getUTCHours(),2)+"00";

        const year = dateTime.getUTCFullYear();
        const month = (dateTime.getUTCMonth()+ 1).toString().padStart(2, '0');
        const day = dateTime.getUTCDate().toString().padStart(2, '0');
        const currentDate = `${year}-${month}-${day}`;
        this.$inputDate.val(currentDate);

        const currentTime = dateTime.getUTCHours().toString().padStart(2, '0') + ":00";
        this.$inputTimeSelect.val(currentTime);

        return dateTime;
    }

    pad(n, width, z) {
        z = z || '0';
        n = n + '';
        return n.length >= width ? n : new Array(width - n.length + 1).join(z) + n;
    }

    setupEventHandlers() {
        this.$prevButton.on('click', () => {
            this.adjustTime(-1);
        });

        this.$nextButton.on('click', () => {
            this.adjustTime(1);
        });
    }

    adjustTime(hourDelta) {
        const currentDate = this.$inputDate.val();
        const currentTime = this.$inputTimeSelect.val();
        
        if (!currentDate || !currentTime) {
            return;
        }

        const currentDateTime = new Date(currentDate + 'T' + currentTime + ':00');
        
        currentDateTime.setHours(currentDateTime.getHours() + hourDelta);
        
        const newYear = currentDateTime.getFullYear();
        const newMonth = (currentDateTime.getMonth() + 1).toString().padStart(2, '0');
        const newDay = currentDateTime.getDate().toString().padStart(2, '0');
        const newDate = `${newYear}-${newMonth}-${newDay}`;
        
        const newHour = currentDateTime.getHours().toString().padStart(2, '0');
        const newTime = newHour + ':00';
        
        this.$inputDate.val(newDate);
        this.$inputTimeSelect.val(newTime);

        this.$inputTimeSelect.trigger('change');
    }

    setContainerAttribute(attribute, value) {
        this.$divContainer.attr(attribute, value);
    }

    appendContainerClass(value) {
        this.$divContainer.addClass(value);
    }

    removeContainerClass(value) {
        this.$divContainer.removeClass(value);
    }

    setInputDateAttribute(attribute, value) {
        this.$inputDate.attr(attribute, value);
    }

    appendInputDateClass(value) {
        this.$inputDate.addClass(value);
    }

    removeInputDateClass(value) {
        this.$inputDate.removeClass(value);
    }

    setInputTimeAttribute(attribute, value) {
        this.$inputTimeSelect.attr(attribute, value);
    }

    appendInputTimeClass(value) {
        this.$inputTimeSelect.addClass(value);
    }

    removeInputTimeClass(value) {
        this.$inputTimeSelect.removeClass(value);
    }

    setPrevButtonAttribute(attribute, value) {
        this.$prevButton.attr(attribute, value);
    }

    appendPrevButtonClass(value) {
        this.$prevButton.addClass(value);
    }

    removePrevButtonClass(value) {
        this.$prevButton.removeClass(value);
    }

    setNextButtonAttribute(attribute, value) {
        this.$nextButton.attr(attribute, value);
    }

    appendNextButtonClass(value) {
        this.$nextButton.addClass(value);
    }

    removeNextButtonClass(value) {
        this.$nextButton.removeClass(value);
    }

    setPrevButtonText(text) {
        this.$prevButton.text(text);
    }

    setNextButtonText(text) {
        this.$nextButton.text(text);
    }

    // Nuovi metodi per gestire le label
    setDateLabelAttribute(attribute, value) {
        this.$dateLabel.attr(attribute, value);
    }

    appendDateLabelClass(value) {
        this.$dateLabel.addClass(value);
    }

    removeDateLabelClass(value) {
        this.$dateLabel.removeClass(value);
    }

    setTimeLabelAttribute(attribute, value) {
        this.$timeLabel.attr(attribute, value);
    }

    appendTimeLabelClass(value) {
        this.$timeLabel.addClass(value);
    }

    removeTimeLabelClass(value) {
        this.$timeLabel.removeClass(value);
    }

    setDateLabelText(text) {
        this.$dateLabel.text(text);
    }

    setTimeLabelText(text) {
        this.$timeLabel.text(text);
    }

    setInternalUTCDate(date){
        this.internalUTCDate = date;
    }
}