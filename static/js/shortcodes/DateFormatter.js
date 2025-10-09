class DateFormatter{

    static formatFromDateUTCObjToAPI(date){
        const year = date.getUTCFullYear();
        const month = (date.getUTCMonth()+ 1).toString().padStart(2, '0');
        const day = date.getUTCDate().toString().padStart(2, '0');
        const hour = date.getUTCHours().toString().padStart(2, '0');

        return `${year}${month}${day}Z${hour}00`;
    }

    static formatFromDateObjToAPI(date){
        const year = date.getFullYear();
        const month = (date.getMonth() + 1).toString().padStart(2, '0');
        const day = date.getDate().toString().padStart(2, '0');
        const hour = date.getHours().toString().padStart(2, '0');

        return `${year}${month}${day}Z${hour}00`;
    }

    static formatFromDateToAPI(dateValue, timeValue){
        // Verifica che i valori siano validi
        if (!dateValue || !timeValue) {
            console.error('Data o ora non valide');
            return null;
        }
        
        // Estrae anno, mese, giorno dalla data (formato YYYY-MM-DD)
        const dateParts = dateValue.split('-');
        const year = dateParts[0];
        const month = dateParts[1];
        const day = dateParts[2];
        
        // Estrae l'ora dal tempo (formato HH:MM)
        const timeParts = timeValue.split(':');
        const hour = timeParts[0];
        
        // Compone il formato finale: yyyymmddZhh00
        const formattedDateTime = year + month + day + 'Z' + hour + '00';
        
        return formattedDateTime;
    }

    static formatFromAPIToDateString(dateTimeString){
        if (!dateTimeString || dateTimeString.length < 8) {
            return null;
        }
        
        const year = dateTimeString.substring(0, 4);
        const month = dateTimeString.substring(4, 6);
        const day = dateTimeString.substring(6, 8);
        
        return `${year}-${month}-${day}`;
    }
    static formatFromAPIToTimeString(dateTimeString){
        const hour = dateTimeString.substring(9,11);
        return `${hour}:00`;
    }

    static formatFromAPIToDateObj(dateTimeString){
        // Verifica che la stringa abbia la lunghezza corretta
        if (dateTimeString.length !== 13) {
            throw new Error('La stringa deve essere lunga esattamente 13 caratteri (yyyymmddZhh00)');
        }
        
        // Verifica che contenga la 'Z' nella posizione corretta
        if (dateTimeString.charAt(8) !== 'Z') {
            throw new Error('La stringa deve contenere "Z" in posizione 8 (yyyymmddZhh00)');
        }
        
        // Estrai le componenti della data
        const year = parseInt(dateTimeString.substring(0, 4), 10);
        const month = parseInt(dateTimeString.substring(4, 6), 10);
        const day = parseInt(dateTimeString.substring(6, 8), 10);
        const hour = parseInt(dateTimeString.substring(9, 11), 10);
        
        // Verifica che i valori siano validi
        if (month < 1 || month > 12) {
            throw new Error('Mese non valido: deve essere tra 01 e 12');
        }
        
        if (day < 1 || day > 31) {
            throw new Error('Giorno non valido: deve essere tra 01 e 31');
        }
        
        if (hour < 0 || hour > 23) {
            throw new Error('Ora non valida: deve essere tra 00 e 23');
        }
        
        // Crea l'oggetto Date
        // Nota: il mese in JavaScript è 0-based, quindi sottrai 1
        const date = new Date(year, month - 1, day, hour, 0, 0, 0);
        
        // Verifica che la data sia valida (ad esempio, non 31 febbraio)
        if (date.getFullYear() !== year || 
            date.getMonth() !== month - 1 || 
            date.getDate() !== day ||
            date.getHours() !== hour) {
            throw new Error('Data non valida');
        }
        
        return date;
    }

    static dayOfWeek(date) {
        let year = date.substring(0, 4);
        let month = date.substring(4, 6);
        let day = date.substring(6, 8);

        let dayOfWeek = new Date(year + "-" + month + "-" + day).getDay();
        return isNaN(dayOfWeek) ? null : ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][dayOfWeek];
    };
    static monthOfYear(date) {
        let month = parseInt(date.substring(4, 6)) - 1;
        
        return isNaN(month) ? null : ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"][month];
    };
}