class ControlFormDate{
    static get defaults() {
        return {
            containerID: 'date-control-form-container',
            dateInputID: 'control-select-date',
            timeInputID: 'control-select-time'
        };
    }
    constructor(inputs = {}) {
        this.containerID = inputs.containerID || ControlFormDate.defaults.containerID;
        this.dateInputID = inputs.dateInputID || ControlFormDate.defaults.dateInputID;
        this.timeInputID = inputs.timeInputID || ControlFormDate.defaults.timeInputID;

        this.$divContainer = jQuery('<div>').attr('id',this.containerID);
        this.$inputDate = jQuery('<input type="date" id="'+this.dateInputID+'">');
        this.$inputTimeSelect = jQuery('<select id="'+this.timeInputID+'"></select>');
        this.populateTimeSelect();
        this.setCurrentDateTime();
        this.$divContainer.append(this.$inputDate);
        this.$divContainer.append(this.$inputTimeSelect);
    }

    getContainer(){
        return this.$divContainer;
    }

    getDateInput(){
        return this.$inputDate;
    }

    getTimeInput(){
        return this.$inputTimeSelect;
    }

    getCombinedInputs(){
        return this.$inputDate.add(this.$inputTimeSelect);
    }

    populateTimeSelect(){
        for (let hour = 0; hour < 24; hour++) {
            const hourFormatted = hour.toString().padStart(2, '0');
            const timeValue = hourFormatted + ':00';
            const option = jQuery('<option></option>')
                .attr('value', timeValue)
                .text(timeValue);
            this.$inputTimeSelect.append(option);
        }
    }

    setCurrentDateTime() {
        const now = new Date();
        
        // Imposta la data corrente nel campo date
        const year = now.getFullYear();
        const month = (now.getMonth() + 1).toString().padStart(2, '0');
        const day = now.getDate().toString().padStart(2, '0');
        const currentDate = `${year}-${month}-${day}`;  
        
        this.$inputDate.val(currentDate);
        
        // Imposta l'ora corrente nella select
        const currentHour = now.getHours().toString().padStart(2, '0');
        const currentTime = currentHour + ':00';
        
        this.$inputTimeSelect.val(currentTime);
    }

    setContainerAttribute(attribute, value){
        this.$divContainer.attr(attribute, value);
    }

    appendContainerClass(value){
        this.$divContainer.addClass(value);
    }

    removeContainerClass(value){
        this.$divContainer.removeClass(value);
    }
    
    setInputDateAttribute(attribute, value){
        this.$inputDate.attr(attribute,value);
    }

    appendInputDateClass(value){
        this.$inputDate.addClass(value);
    }

    removeInputDateClass(value){
        this.$inputDate.removeClass(value);
    }

    setInputTimeAttribute(attribute, value){
        this.$inputTimeSelect.attr(attribute,value);
    }

    appendInputTimeClass(value){
        this.$inputTimeSelect.addClass(value);
    }

    removeInputTimeClass(value){
        this.$inputTimeSelect.removeClass(value);
    }
}