// Dizionario CAP -> città
const capCities = {
    "00100": "Roma",
    "20100": "Milano",
    "10100": "Torino",
    "50100": "Firenze",
    "80100": "Napoli"
};

// Funzione per aggiornare la città in base al CAP
function updateCity(inputId, cityId) {
    const cap = document.getElementById(inputId).value;
    const cityField = document.getElementById(cityId);
    if(capCities[cap]) {
        cityField.value = capCities[cap];
    } else {
        cityField.value = "";
    }
}

// Event listener CAP -> città
document.getElementById("sender_zip").addEventListener("input", () => updateCity("sender_zip", "sender_city"));
document.getElementById("recipient_zip").addEventListener("input", () => updateCity("recipient_zip", "recipient_city"));

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

// Genera codice a barre univoco 17 cifre
function generateCode() {
    let codeNumber = String(counter).padStart(12, '0');
    return '90018' + codeNumber;
}

// Submit form
document.getElementById('raccomandataForm').addEventListener('submit', function(e){
    e.preventDefault();

    const sender = document.getElementById('sender_street').value + " " +
                   document.getElementById('sender_number').value + ", " +
                   document.getElementById('sender_city').value + " (" +
                   document.getElementById('sender_zip').value + ")";

    const recipient = document.getElementById('recipient_street').value + " " +
                      document.getElementById('recipient_number').value + ", " +
                      document.getElementById('recipient_city').value + " (" +
                      document.getElementById('recipient_zip').value + ")";

    const code = generateCode();
    counter++;
    const date = new Date().toLocaleDateString();

    shipments.push({code, sender, recipient, date});
    localStorage.setItem('shipments', JSON.stringify(shipments));

    document.getElementById('r_sender').textContent = sender;
    document.getElementById('r_recipient').textContent = recipient;
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

// Download PDF
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
