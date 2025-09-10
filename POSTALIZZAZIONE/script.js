// Recupera dati salvati o inizializza array
let shipments = JSON.parse(localStorage.getItem('shipments')) || [];

// contatore progressivo basato sul numero di elementi salvati
let counter = shipments.length + 1;

// mostra storico iniziale
function updateHistory() {
    const tbody = document.querySelector("#history tbody");
    tbody.innerHTML = '';
    shipments.forEach(s => {
        const tr = document.createElement('tr');
        tr.innerHTML = `<td>${s.code}</td><td>${s.sender}</td><td>${s.recipient}</td><td>${s.date}</td>`;
        tbody.appendChild(tr);
    });
}

// genera codice univoco 17 cifre (90018 + 12 cifre progressivo)
function generateCode() {
    let codeNumber = String(counter).padStart(12, '0');
    return '90018' + codeNumber;
}

// gestisce il submit del form
document.getElementById('raccomandataForm').addEventListener('submit', function(e){
    e.preventDefault();

    const sender = document.getElementById('sender').value;
    const recipient = document.getElementById('recipient').value;

    const code = generateCode();
    counter++;

    const date = new Date().toLocaleDateString();

    // salva nel browser
    shipments.push({code, sender, recipient, date});
    localStorage.setItem('shipments', JSON.stringify(shipments));

    // mostra ricevuta
    document.getElementById('r_sender').textContent = sender;
    document.getElementById('r_recipient').textContent = recipient;
    document.getElementById('r_code').textContent = code;
    document.getElementById('r_date').textContent = date;
    document.getElementById('receipt').style.display = 'block';

    // genera barcode in SVG
    JsBarcode("#barcode", code, {
        format: "CODE128",
        width: 2,
        height: 50,
        displayValue: true
    });

    // aggiorna storico
    updateHistory();

    // reset form
    document.getElementById('raccomandataForm').reset();
});

// inizializza storico al caricamento
updateHistory();

// --- Scarica PDF ---
document.getElementById('downloadPDF').addEventListener('click', function(){
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();

    const sender = document.getElementById('r_sender').textContent;
    const recipient = document.getElementById('r_recipient').textContent;
    const code = document.getElementById('r_code').textContent;
    const date = document.getElementById('r_date').textContent;
    const license = '690/2009';

    doc.setFontSize(14);
    doc.text("Ricevuta di Ritorno", 20, 20);
    doc.setFontSize(12);
    doc.text(`Mittente: ${sender}`, 20, 40);
    doc.text(`Destinatario: ${recipient}`, 20, 50);
    doc.text(`Codice a barre: ${code}`, 20, 60);
    doc.text(`Data di emissione: ${date}`, 20, 70);
    doc.text(`Numero licenza: ${license}`, 20, 80);

    // barcode SVG in canvas
    const svg = document.getElementById('barcode');
    const svgData = new XMLSerializer().serializeToString(svg);
    const img = new Image();
    const svgBlob = new Blob([svgData], {type:"image/svg+xml;charset=utf-8"});
    const url = URL.createObjectURL(svgBlob);
    img.onload = function(){
        doc.addImage(img, 'SVG', 20, 90, 160, 40);
        doc.save(`Ricevuta_${code}.pdf`);
        URL.revokeObjectURL(url);
    };
    img.src = url;
});
