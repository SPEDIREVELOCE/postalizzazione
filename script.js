// Recupera storico salvato o inizializza array
let shipments = JSON.parse(localStorage.getItem('shipments')) || [];
let counter = shipments.length + 1;

// Mostra storico
function updateHistory() {
    const tbody = document.querySelector("#history tbody");
    tbody.innerHTML = '';
    shipments.forEach(s => {
        const tr = document.createElement('tr');
        tr.innerHTML = `<td>${s.code}</td><td>${s.sender}</td><td>${s.recipient}</td><td>${s.date}</td>`;
        tbody.appendChild(tr);
    });
}

// Genera codice univoco 17 cifre
function generateCode() {
    let codeNumber = String(counter).padStart(12, '0');
    return '90018' + codeNumber;
}

// Submit form
document.getElementById('raccomandataForm').addEventListener('submit', function(e){
    e.preventDefault();

    const senderName = document.getElementById('sender_name').value + " " +
                       document.getElementById('sender_surname').value;
    const senderAddress = document.getElementById('sender_street').value + " " +
                          document.getElementById('sender_number').value + ", " +
                          document.getElementById('sender_city').value + " (" +
                          document.getElementById('sender_zip').value + ")";

    const recipientName = document.getElementById('recipient_name').value + " " +
                          document.getElementById('recipient_surname').value;
    const recipientAddress = document.getElementById('recipient_street').value + " " +
                             document.getElementById('recipient_number').value + ", " +
                             document.getElementById('recipient_city').value + " (" +
                             document.getElementById('recipient_zip').value + ")";

    const code = generateCode();
    counter++;
    const date = new Date().toLocaleDateString();

    shipments.push({
        code,
        sender: senderName + " - " + senderAddress,
        recipient: recipientName + " - " + recipientAddress,
        date
    });
    localStorage.setItem('shipments', JSON.stringify(shipments));

    // Aggiorna ricevuta
    document.getElementById('r_sender_name').textContent = senderName;
    document.getElementById('r_sender_address').textContent = senderAddress;
    document.getElementById('r_recipient_name').textContent = recipientName;
    document.getElementById('r_recipient_address').textContent = recipientAddress;
    document.getElementById('r_code').textContent = code;
    document.getElementById('r_date').textContent = date;
    document.getElementById('receipt').style.display = 'block';

    JsBarcode("#barcode", code, {
        format: "CODE128",
        width: 2,
        height: 50,
        displayValue: true
    });

    updateHistory();
    document.getElementById('raccomandataForm').reset();
});

// Inizializza storico
updateHistory();

// Download PDF funzionante
document.getElementById('downloadPDF').addEventListener('click', function(){
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();

    const senderName = document.getElementById('r_sender_name').textContent;
    const senderAddress = document.getElementById('r_sender_address').textContent;
    const recipientName = document.getElementById('r_recipient_name').textContent;
    const recipientAddress = document.getElementById('r_recipient_address').textContent;
    const code = document.getElementById('r_code').textContent;
    const date = document.getElementById('r_date').textContent;
    const license = '690/2009';

    doc.setFontSize(14);
    doc.text("Ricevuta di Ritorno", 20, 20);
    doc.setFontSize(12);
    doc.text(`Mittente: ${senderName}`, 20, 40);
    doc.text(senderAddress, 20, 50);
    doc.text(`Destinatario: ${recipientName}`, 20, 65);
    doc.text(recipientAddress, 20, 75);
    doc.text(`Codice a barre: ${code}`, 20, 90);
    doc.text(`Data di emissione: ${date}`, 20, 100);
    doc.text(`Numero licenza: ${license}`, 20, 110);

    // Barcode come immagine
    const svg = document.getElementById('barcode');
    const svgData = new XMLSerializer().serializeToString(svg);
    const img = new Image();
    const svgBlob = new Blob([svgData], {type:"image/svg+xml;charset=utf-8"});
    const url = URL.createObjectURL(svgBlob);
    img.onload = function(){
        doc.addImage(img, 'SVG', 20, 120, 160, 40);
        doc.save(`Ricevuta_${code}.pdf`);
        URL.revokeObjectURL(url);
    };
    img.src = url;
});
