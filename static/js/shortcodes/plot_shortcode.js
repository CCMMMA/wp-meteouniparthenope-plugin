class MeteoPlot {
    static get defaults() {
        return {
            apiBaseURL: apiBaseUrl,
            place: "it000",
            product: "wrf5",
            output: "gen",
            dateTime: null,
            controlForms: "STANDALONE",
            container_id: -1,
            loadingGifPath: METEOUNIP_PLUGIN_LOADING_DIR+"/loading_gif.gif",
            dateForm_id: null,
            timeForm_id: null,
            productForm_id: null,
            outputForm_id: null,
            inPlace: false
        };
    }

    constructor(options = {}) {
        this.container_id = options.container_id || MeteoPlot.defaults.container_id;
        this.apiBaseURL = options.apiBaseURL || MeteoPlot.defaults.apiBaseURL;
        this.place = options.place || MeteoPlot.defaults.place;
        this.product = options.product || MeteoPlot.defaults.product;
        this.output = options.output || MeteoPlot.defaults.output;
        this.loadingGifPath = options.loadingGifPath || MeteoPlot.defaults.loadingGifPath;
        this.controlForms = options.controlForms || MeteoPlot.defaults.controlForms;
        this.inPlace = (options.inPlace || MeteoPlot.defaults.inPlace) === "true" ? true : false;

        if(this.controlForms !== "STANDALONE"){
            this.dateForm_id = options.dateForm_id || MeteoPlot.defaults.dateForm_id;
            this.timeForm_id = options.timeForm_id || MeteoPlot.defaults.timeForm_id;
            if(options.controlForms === "FULL"){
                this.productForm_id = options.productForm_id || MeteoPlot.defaults.productForm_id;
                this.outputForm_id = options.outputForm_id || MeteoPlot.defaults.outputForm_id;
            }
        }

        if(options.dateTime){
            this.dateTime = options.dateTime;
        }
        else{
            let now = new Date();
            this.dateTime = DateFormatter.formatFromDateUTCObjToAPI(now);
        }
        
        if(this.controlForms === "STANDALONE"){
            this.createPlot();
            this.createLink();
        }
        if(this.controlForms === "DATETIME_ONLY"){
            this.createPlot();
            this.createLink();
            this.registerEvent();
        }
        if(this.controlForms === "FULL"){
            var self = this;
            jQuery(document).on('place.control_forms.loaded',function(){
                var newDate = jQuery(`#${self.dateForm_id}`).val();
                var newTime = jQuery(`#${self.timeForm_id}`).val();
                var dateString = DateFormatter.formatFromDateToAPI(newDate,newTime);
                self.dateTime = dateString;
                self.product = jQuery(`#${self.productForm_id}`).val();
                self.output = jQuery(`#${self.outputForm_id}`).val();

                self.createPlot();
                self.registerEvent();
            });
        }
    }

    registerEvent(){
        var self = this;
        jQuery('.plot-control-forms').change(function(){
            var newDate = jQuery(`#${self.dateForm_id}`).val();
            var newTime = jQuery(`#${self.timeForm_id}`).val();
            var dateString = DateFormatter.formatFromDateToAPI(newDate,newTime);
            self.dateTime = dateString;

            if(self.controlForms === "FULL"){
                self.product = jQuery(`#${self.productForm_id}`).val();
                self.output = jQuery(`#${self.outputForm_id}`).val();
            }

            self.createPlot();
            if(self.controlForms !== "FULL"){
                self.createLink();
            }
        });
    }

    createPlot(){
        let html=
        `<div id="${this.container_id}_loader" style="display: block"><img src="${this.loadingGifPath}"/></div>` +
        `<div id="${this.container_id}_image" style="display: none">`;
        if(this.controlForms === "FULL"){
            html += `<img src="${this.getImageUrl()}`;
        }
        else{
            `<img src="https://api.meteo.uniparthenope.it/products/${this.product}/forecast/${this.place}/plot/image?output=${this.output}`;
        }
        if(this.controlForms === "DATETIME_ONLY" || this.controlForms === "FULL"){
            html += `&date=${this.dateTime}`;
        }
        html += `" onload="jQuery('#${this.container_id}_loader').hide();jQuery('#${this.container_id}_image').show()"/>` +
        `</div>`;

        jQuery("#"+this.container_id).html(html);
    }
    
    getImageUrl(){
        return `${this.apiBaseURL}/products/${this.product}/forecast/${this.place}/plot/image?date=${this.dateTime}&output=${this.output}&opt=bars`;
    }

    createLink(){
       var self = this;
       jQuery.ajax({
            url: `/wp-json/meteounip/v1/places/${self.place}/link`,
            success: function(data){
                var wpLink = data['link'];
                var newLink = wpLink + `?place_id=${self.place}&date=${self.dateTime}&prod=${self.product}&output=${self.output}`;
                
                jQuery(`#${self.container_id}`).css('cursor', 'pointer').click(function(){
                    window.location.href = newLink;
                })
            }
        });
    }
}