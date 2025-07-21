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
        this.$divContainer.append(this.$inputDate);
        this.$divContainer.append(this.$inputTimeSelect);

        console.log(this.$divContainer);
    }

    getContainer(){
        return this.$divContainer;
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

    setContainerAttrAttribute(attribute, value){
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