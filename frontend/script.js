const API = "http://localhost:8000";

const uploadArea = document.getElementById('uploadArea');
const pdfFile = document.getElementById('pdfFile');

uploadArea.addEventListener('click', () => {
    pdfFile.click();
});

uploadArea.addEventListener('dragover', (e) => {
    e.preventDefault();
    uploadArea.style.background = '#0a2a2a';
});

uploadArea.addEventListener('dragleave', () => {
    uploadArea.style.background = '';
});

uploadArea.addEventListener('drop', (e) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file && file.type === 'application/pdf') {
        pdfFile.files = e.dataTransfer.files;
        uploadArea.innerHTML = `📄 ${file.name}`;
    } else {
        document.getElementById('uploadStatus').textContent = "⚠️ Please drop a PDF file.";
    }
});

pdfFile.onchange = (e) => {
    uploadArea.innerHTML = `📄 ${e.target.files[0].name}`;
};

async function uploadPDF() {
    const file = pdfFile.files[0];
    const status = document.getElementById('uploadStatus');

    if (!file) {
        status.textContent = "⚠️ Please select a PDF first.";
        return;
    }

    status.textContent = "⏳ Processing PDF...";
    document.getElementById('uploadBtn').disabled = true;

    try {
        const formData = new FormData();
        formData.append('file', file);

        const res = await fetch(`${API}/upload`, { method: 'POST', body: formData });
        const data = await res.json();
        status.textContent = "✅ " + data.message;
        document.getElementById('qaSection').style.display = 'block';
    } catch (err) {
        status.textContent = "❌ Error connecting to server. Is backend running?";
    }

    document.getElementById('uploadBtn').disabled = false;
}

async function askQuestion() {
    const question = document.getElementById('questionInput').value.trim();
    if (!question) return;

    const chatBox = document.getElementById('chatBox');
    chatBox.innerHTML += `<div class="message user-msg">🧑 ${question}</div>`;
    document.getElementById('questionInput').value = '';
    chatBox.scrollTop = chatBox.scrollHeight;

    try {
        const formData = new FormData();
        formData.append('question', question);

        const res = await fetch(`${API}/ask`, { method: 'POST', body: formData });
        const data = await res.json();
        chatBox.innerHTML += `<div class="message bot-msg">🤖 ${data.answer}</div>`;
        chatBox.scrollTop = chatBox.scrollHeight;
    } catch (err) {
        chatBox.innerHTML += `<div class="message bot-msg">❌ Error connecting to server.</div>`;
    }
}

document.getElementById('questionInput').addEventListener('keypress', (e) => {
    if (e.key === 'Enter') askQuestion();
});