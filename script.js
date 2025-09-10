let counter = 1;

// Genera codice univoco
function generateCode() {
    let codeNumber = String(counter).padStart(12, '0');
    return '90018' + codeNumber;
}

// Stampa solo una sezione
function printSection(id) {
    const divToPrint = document.getElementById(id).innerHTML;
    const newWin = window.open('', '_blank');
    newWin.document.write(`<html><head><title>Stampa</title></head><body>${divToPrint}</body></html>`);
    newWin.document.close();
    newWin.print();
}

document.getElementById('raccomandataForm').addEventListener('submit', function(e){
    e.preventDefault();

    const sender = document.getElementById('sender_name').value + " " +
                   document.getElementById('sender_surname').value + ", " +
                   document.getElementById('sender_street').value + " " +
                   document.getElementById('sender_number').value + ", " +
                   document.getElementById('sender_city').value + " (" +
                   document.getElementById('sender_zip').value + ")";

    const recipient = document.getElementById('recipient_name').value + " " +
                      document.getElementById('recipient_surname').value + ", " +
                      document.getElementById('recipient_street').value + " " +
                      document.getElementById('recipient_number').value + ", " +
                      document.getElementById('recipient_city').value + " (" +
                      document.getElementById('recipient_zip').value + ")";

    const code = generateCode();
    counter++;
    const date = new Date().toLocaleDateString();

    // Ricevuta accettazione
    document.getElementById('a_sender').textContent = sender;
    document.getElementById('a_recipient').textContent = recipient;
    document.getElementById('a_code').textContent = code;
    document.getElementById('a_date').textContent = date;

    // Etichetta
    JsBarcode("#barcode", code, {
        format: "CODE128",
        width: 2,
        height: 60,
        displayValue: false
    });
    document.getElementById('l_code').textContent = code;

    // Ricevuta ritorno
    document.getElementById('r_sender').textContent = sender;
    document.getElementById('r_recipient').textContent = recipient;
    document.getElementById('r_code').textContent = code;
    document.getElementById('r_date').textContent = date;

    document.getElementById('documents').style.display = 'block';
});
