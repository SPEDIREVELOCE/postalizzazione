let counter = parseInt(localStorage.getItem("counter")) || 1;
let raccomandate = JSON.parse(localStorage.getItem("raccomandate")) || [];

// 🔹 Genera codice univoco
function generateCode() {
    let codeNumber = String(counter).padStart(12, '0');
    return '90018' + codeNumber;
}

// 🔹 Stampa solo una sezione
function printSection(id) {
    const divToPrint = document.getElementById(id).cloneNode(true);
    const buttons = divToPrint.querySelectorAll("button");
    buttons.forEach(b => b.remove());

    const newWin = window.open('', '_blank');
    newWin.document.write(`<html><head><title>Stampa</title></head><body>${divToPrint.innerHTML}</body></html>`);
    newWin.document.close();
    newWin.print();
}

// 🔹 Scarica PDF pulito (senza pulsanti)
function downloadPDF(sectionId, fileName) {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();

    const element = document.getElementById(sectionId).cloneNode(true);
    const buttons = element.querySelectorAll("button");
    buttons.forEach(b => b.remove());

    element.style.display = "block";
    element.style.position = "absolute";
    element.style.left = "-9999px";
    document.body.appendChild(element);

    doc.html(element, {
        callback: function(doc) {
            doc.save(fileName + ".pdf");
            document.body.removeChild(element);
        },
        x: 10,
        y: 10,
        width: 180,
        windowWidth: element.scrollWidth
    });
}

// 🔹 Scarica PDF Ricevuta di Ritorno (3 copie sullo stesso foglio)
function downloadARPDF() {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF({ unit: "mm", format: "a4" });

    const original = document.getElementById('return');
    const element = original.cloneNode(true);

    const buttons = element.querySelectorAll("button");
    buttons.forEach(b => b.remove());

    element.style.display = "block";
    element.style.position = "absolute";
    element.style.left = "-9999px";
    document.body.appendChild(element);

    const blockHeight = 99;
    for (let i = 0; i < 3; i++) {
        let offsetY = i * blockHeight;
        doc.html(element, {
            callback: function(doc) {
                if(i === 2) doc.save("Ricevuta_Ritorno.pdf");
            },
            x: 10,
            y: offsetY + 10,
            width: 180,
            windowWidth: element.scrollWidth
        });

        if(i < 2) {
            doc.setDrawColor(150);
            doc.line(10, blockHeight*(i+1), 200, blockHeight*(i+1));
        }
    }

    document.body.removeChild(element);
}

// 🔹 Mostra storico raccomandate
function mostraStorico() {
    const tbody = document.querySelector("#storico tbody");
    tbody.innerHTML = "";

    raccomandate.forEach((r, index) => {
        const tr = document.createElement("tr");
        tr.innerHTML = `
            <td>${r.code}</td>
            <td>${r.sender}</td>
            <td>${r.recipient}</td>
            <td>${r.date}</td>
            <td>
                <button onclick="printSection('row-${index}')">Stampa</button>
                <button onclick="downloadPDF('row-${index}','${r.code}')">Scarica PDF</button>
            </td>
        `;

        // Aggiungi una sezione nascosta per la stampa PDF
        const hiddenDiv = document.createElement("div");
        hiddenDiv.id = `row-${index}`;
        hiddenDiv.style.display = "none";
        hiddenDiv.innerHTML = `
            <p><strong>Mittente:</strong> ${r.sender}</p>
            <p><strong>Destinatario:</strong> ${r.recipient}</p>
            <p><strong>Numero raccomandata:</strong> ${r.code}</p>
            <p><strong>Data:</strong> ${r.date}</p>
        `;
        document.body.appendChild(hiddenDiv);

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
    localStorage.setItem("counter", counter);
    const date = new Date().toLocaleDateString();

    // 🔹 Aggiorna ricevute e etichetta
    document.getElementById('a_sender').textContent = sender;
    document.getElementById('a_recipient').textContent = recipient;
    document.getElementById('a_code').textContent = code;
    document.getElementById('a_date').textContent = date;

    JsBarcode("#barcode", code, {
        format: "CODE128",
        width: 2,
        height: 60,
        displayValue: false
    });
    document.getElementById('l_code').textContent = code;
    const dateEl = document.createElement("p");
    dateEl.textContent = `Data: ${date}`;
    document.getElementById('label').appendChild(dateEl);

    document.getElementById('r_sender').textContent = sender;
    document.getElementById('r_recipient').textContent = recipient;
    document.getElementById('r_code').textContent = code;
    document.getElementById('r_date').textContent = date;

    document.getElementById('documents').style.display = 'block';

    // 🔹 Salva nello storico
    raccomandate.push({sender, recipient, code, date});
    localStorage.setItem("raccomandate", JSON.stringify(raccomandate));
    mostraStorico();
});

// 🔹 Mostra storico al caricamento
mostraStorico();
