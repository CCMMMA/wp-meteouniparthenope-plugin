class MeteoPlot {
    static get defaults() {
        return {
            apiBaseURL: apiBaseUrl,
            place: "it000",
            product: "wrf5",
            output: "gen",
            dateTime: null
        };
    }

    constructor(options = {}) {
        this.apiBaseURL = options.apiBaseURL || MeteoPlot.defaults.apiBaseURL;
        this.place = options.place || MeteoPlot.defaults.place;
        this.product = options.product || MeteoPlot.defaults.product;
        this.output = options.output || MeteoPlot.defaults.output;

        if(options.dateTime){
            this.dateTime = options.dateTime;
        }
        else{
            let now = new Date();
            console.log(now);
            now.setHours(now.getHours() - 2);
            this.dateTime = DateFormatter.formatFromDateObjToAPI(now);
            console.log(this.dateTime);
        }
    }

    setApiBaseUrl(apiBaseURL) {
        this.apiBaseURL = apiBaseURL;
    }

    setPlace(placeID) {
        this.place = placeID;
    }

    setProduct(product) {
        this.product = product;
    }

    setOutput(output) {
        this.output = output;
    }

    setDateTime(dateTime) {
        this.dateTime = dateTime;
    }

    getImageUrl(){
        return `${this.apiBaseURL}/products/${this.product}/forecast/${this.place}/plot/image?date=${this.dateTime}&output=${this.output}&opt=bars`;
    }

    generatePlotElement(serialNumber = null) {
        let $plotImage = jQuery('<img>');
        
        let imageId = serialNumber ? `plotMap-image-${serialNumber}` : 'plotMap-image';
        $plotImage.attr('id', imageId);
        
        let imageUrl = this.getImageUrl();
        $plotImage.attr('src', imageUrl);
        
        let $plotDiv = jQuery('<div>').addClass('plot-image-container');
        $plotDiv.append($plotImage);
        
        return $plotDiv;
    }
}