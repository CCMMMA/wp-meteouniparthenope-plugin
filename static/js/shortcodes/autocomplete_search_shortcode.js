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
`;
document.head.appendChild(autocompleteStyle);

(function($){
    let $parent =  $('input[type="search"]').parent();
    let $newParent = $('<div class="ui-widget">');
    $parent.append($newParent);
    let $input = $('input[type="search"]');
    $input.appendTo($newParent);
    
    $input.autocomplete({
            source: function( request, response ) {
                $.ajax( {
                    url: apiBaseUrl+"/places/search/byname/autocomplete",
                    dataType: "json",
                    data: {
                        term: request.term
                    },
                    success: function( data ) {
                        console.log("DATA FORM SEARCH:");
                        console.log(data);
                        response( data );
                    },
                } );
            },
            minLength: 2,
            select: function( event, ui ) {
                console.log("EVENT PROP:");
                console.log(event.originalEvent);
                console.log("SELECTED FORM SEARCH: ");
                console.log(ui.item.label);

                var url = CPTPlaces[ui.item.label];
                window.open(url, '_blank ');
            }
        } );
})(jQuery)