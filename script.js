let counter = 1;
let raccomandate = JSON.parse(localStorage.getItem("raccomandate")) || [];

// 🔹 Genera codice univoco
function generateCode() {
    let codeNumber = String(counter).padStart(12, '0');
    return '90018' + codeNumber;
}

// 🔹 Stampa solo una sezione
function printSection(id) {
    const divToPrint = document.getElementById(id).innerHTML;
    const newWin = window.open('', '_blank');
    newWin.document.write(`<html><head><title>Stampa</title></head><body>${divToPrint}</body></html>`);
    newWin.document.close();
    newWin.print();
}

// 🔹 Scarica PDF generico (Accettazione, Etichetta)
function downloadPDF(id, filename) {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();
    const element = document.getElementById(id);
    const clone = element.cloneNode(true);
    const textElements = clone.querySelectorAll("p");

    doc.setFontSize(12);
    doc.text(filename, 20, 20);

    let y = 40;
    textElements.forEach(p => {
        doc.text(p.innerText, 20, y);
        y += 10;
    });

    doc.save(filename + ".pdf");
}

// 🔹 Scarica PDF AR con 3 copie sullo stesso foglio A4
function downloadARPDF() {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF({ unit: "mm", format: "a4" });

    const sender = document.getElementById('r_sender').textContent;
    const recipient = document.getElementById('r_recipient').textContent;
    const code = document.getElementById('r_code').textContent;
    const date = document.getElementById('r_date').textContent;

    // Altezza di ogni modulo AR (circa 99 mm)
    const blockHeight = 99;

    for (let i = 0; i < 3; i++) {
        let offset = i * blockHeight;

        doc.setFontSize(9);

        // Mittente
        doc.text("Mittente:", 20, 20 + offset);
        doc.text(sender, 20, 25 + offset);

        // Destinatario
        doc.text("Destinatario:", 20, 45 + offset);
        doc.text(recipient, 20, 50 + offset);

        // Numero raccomandata
        doc.setFontSize(10);
        doc.text("Raccomandata n.: " + code, 20, 70 + offset);

        // Data accettazione
        doc.text("Data accettazione: " + date, 20, 80 + offset);

        // Linea divisoria per le copie (solo per allineamento)
        if (i < 2) {
            doc.setDrawColor(150);
            doc.line(10, blockHeight * (i + 1), 200, blockHeight * (i + 1));
        }
    }

    doc.save("Ricevuta_Ritorno.pdf");
}

// 🔹 Mostra lo storico raccomandate
function mostraStorico() {
    const tbody = document.querySelector("#storico tbody");
    tbody.innerHTML = "";
    raccomandate.forEach(r => {
        const tr = document.createElement("tr");
        tr.innerHTML = `
            <td>${r.code}</td>
            <td>${r.sender}</td>
            <td>${r.recipient}</td>
            <td>${r.date}</td>
        `;
        tbody.appendChild(tr);
    });
}

// 🔹 Gestione invio form
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

    // Ricevuta di accettazione
    document.getElementById('a_sender').textContent = sender;
    document.getElementById('a_recipient').textContent = recipient;
    document.getElementById('a_code').textContent = code;
    document.getElementById('a_date').textContent = date;

    // Etichetta con barcode
    JsBarcode("#barcode", code, {
        format: "CODE128",
        width: 2,
        height: 60,
        displayValue: false
    });
    document.getElementById('l_code').textContent = code;

    // Ricevuta di ritorno
    document.getElementById('r_sender').textContent = sender;
    document.getElementById('r_recipient').textContent = recipient;
    document.getElementById('r_code').textContent = code;
    document.getElementById('r_date').textContent = date;

    document.getElementById('documents').style.display = 'block';

    // Salvataggio nello storico
    raccomandate.push({ sender, recipient, code, date });
    localStorage.setItem("raccomandate", JSON.stringify(raccomandate));
    mostraStorico();
});

// Mostra storico al caricamento
mostraStorico();
