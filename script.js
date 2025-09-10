let counter = parseInt(localStorage.getItem("counter")) || 1;
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

// 🔹 Scarica PDF (Accettazione, Etichetta, AR)
function downloadPDF(sectionId, fileName) {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();

    const element = document.getElementById(sectionId);
    element.style.display = "block"; // assicurati che sia visibile

    doc.html(element, {
        callback: function (doc) {
            doc.save(fileName + ".pdf");
        },
        x: 10,
        y: 10,
        width: 180,
        windowWidth: element.scrollWidth
    });
}

// 🔹 Scarica PDF AR con 3 copie sullo stesso foglio A4
function downloadARPDF() {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF({ unit: "mm", format: "a4" });

    const element = document.getElementById('return');
    element.style.display = "block";

    const blockHeight = 99; // Altezza di ogni modulo AR

    for (let i = 0; i < 3; i++) {
        let offsetY = i * blockHeight;

        doc.html(element, {
            callback: function (doc) {
                if (i === 2) doc.save("Ricevuta_Ritorno.pdf");
            },
            x: 10,
            y: offsetY + 10,
            width: 180,
            windowWidth: element.scrollWidth
        });

        // Linea divisoria
        if (i < 2) {
            doc.setDrawColor(150);
            doc.line(10, blockHeight * (i + 1), 200, blockHeight * (i + 1));
        }
    }
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
    localStorage.setItem("counter", counter); // salva il counter
    const date = new Date().toLocaleDateString();

    // 🔹 Ricevuta di accettazione
    document.getElementById('a_sender').textContent = sender;
    document.getElementById('a_recipient').textContent = recipient;
    document.getElementById('a_code').textContent = code;
    document.getElementById('a_date').textContent = date;

    // 🔹 Etichetta con barcode
    JsBarcode("#barcode", code, {
        format: "CODE128",
        width: 2,
        height: 60,
        displayValue: true
    });
    document.getElementById('l_code').textContent = code;

    // 🔹 Ricevuta di ritorno
    document.getElementById('r_sender').textContent = sender;
    document.getElementById('r_recipient').textContent = recipient;
    document.getElementById('r_code').textContent = code;
    document.getElementById('r_date').textContent = date;

    document.getElementById('documents').style.display = 'block';

    // 🔹 Salvataggio nello storico
    raccomandate.push({ sender, recipient, code, date });
    localStorage.setItem("raccomandate", JSON.stringify(raccomandate));
    mostraStorico();
});

// Mostra storico al caricamento
mostraStorico();
