jQuery(document).ready(function($) {
    $('#delete-all-places-btn').on('click', function(e) {
        if (!confirm("Sei sicuro di eliminare tutti i place? Questa operazione è irreversibile e non può essere annullata")) {
            e.preventDefault();
            return false;
        }
    });
});