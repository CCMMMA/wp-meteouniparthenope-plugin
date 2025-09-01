const autocompleteStyle = document.createElement("style");
autocompleteStyle.innerHTML = `
 .ui-autocomplete {
 background: white;
 border: 1px solid #ccc;
 z-index: 9999 !important;
 max-height: 300px;
 overflow-y: auto;
 display: inline-block;
 position: absolute;
 box-sizing: border-box;
 }
 .ui-menu-item-wrapper {
 padding: 8px 12px;
 display: flex;
 align-items: center;
 gap: 10px;
 min-height: 60px;
 box-sizing: border-box
 }
 .ui-menu-item-wrapper img {
 width: 50px;
 height: 50px;
 object-fit: cover;
 flex-shrink: 0;
 display: block;
 }
 .ui-menu-item-wrapper.ui-state-active,
 .ui-state-active .ui-menu-item-wrapper {
 background-color: #2a91eb;
 }
 .ui-menu-item-wrapper.disabled {
 color: #999;
 font-style: italic;
 cursor: default;
 }
 .ui-menu-item-wrapper.disabled:hover {
 background-color: transparent;
 }
`;
document.head.appendChild(autocompleteStyle);

(function($){
    let $parent = $('input[type="search"]').parent();
    let $newParent = $('<div class="ui-widget">');
    $parent.append($newParent);
    let $input = $('input[type="search"]');
    $input.appendTo($newParent);
    
    $input.autocomplete({
        source: function( request, response ) {
            $.ajax({
                url: "/wp-json/meteounip/v1/places/autocomplete",
                dataType: "json",
                data: {
                    search: request.term,
                    per_page: 10
                },
                success: function( data ) {
                    console.log("DATA FROM SEARCH:");
                    console.log(data);
                    
                    // Se non ci sono risultati, mostra messaggio
                    if (!data || data.length === 0) {
                        response([{
                            label: "No places found!",
                            value: "",
                            disabled: true
                        }]);
                    } else {
                        // I dati sono già nel formato corretto (label/value)
                        response( data );
                    }
                },
                error: function(xhr, status, error) {
                    console.error("Errore nella chiamata API:", error);
                    response([]);
                }
            });
        },
        minLength: 2,
        select: function( event, ui ) {
            if (ui.item.disabled) {
                event.preventDefault();
                return false;
            }
            
            console.log("EVENT PROP:");
            console.log(event.originalEvent);
            console.log("SELECTED FROM SEARCH: ");
            console.log(ui.item.label);
            console.log("LINK: "+ui.item.link);
            window.location.replace(ui.item.link);
        }
    });
})(jQuery);