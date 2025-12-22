function showSection(sectionId) {
    document.getElementById('fileInputSection').classList.remove('active');
    document.getElementById('youtubeInputSection').classList.remove('active');
    if (sectionId) document.getElementById(sectionId).classList.add('active');
}
document.getElementById('fileBtn').onclick = function() {
    showSection('fileInputSection');
    document.getElementById('summaryText').textContent = '';
    document.getElementById('loader').classList.remove('active');
    this.classList.add('active');
    document.getElementById('youtubeBtn').classList.remove('active');
};
document.getElementById('youtubeBtn').onclick = function() {
    showSection('youtubeInputSection');
    document.getElementById('summaryText').textContent = '';
    document.getElementById('loader').classList.remove('active');
    this.classList.add('active');
    document.getElementById('fileBtn').classList.remove('active');
};

document.getElementById('submitFile').onclick = async function() {
    const fileInput = document.getElementById('pdfFile');
    if (!fileInput.files.length) {
        alert('Please select a PDF file.');
        return;
    }
    const formData = new FormData();
    formData.append('file', fileInput.files[0]);
    document.getElementById('summaryText').textContent = '';
    document.getElementById('loader').classList.add('active');
    try {
        const res = await fetch('/summarize-file', {
            method: 'POST',
            body: formData
        });
        const data = await res.json();
        document.getElementById('loader').classList.remove('active');
        document.getElementById('summaryText').textContent = data.summary || data.error || 'Unknown error.';
    } catch (e) {
        document.getElementById('loader').classList.remove('active');
        document.getElementById('summaryText').textContent = 'Error connecting to server.';
    }
};

document.getElementById('submitYoutube').onclick = async function() {
    const url = document.getElementById('youtubeUrl').value.trim();
    if (!url) {
        alert('Please enter a YouTube URL.');
        return;
    }
    document.getElementById('summaryText').textContent = '';
    document.getElementById('loader').classList.add('active');
    try {
        const res = await fetch('/summarize-youtube', {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({ url })
        });
        const data = await res.json();
        document.getElementById('loader').classList.remove('active');
        document.getElementById('summaryText').textContent = data.summary || data.error || 'Unknown error.';
    } catch (e) {
        document.getElementById('loader').classList.remove('active');
        document.getElementById('summaryText').textContent = 'Error connecting to server.';
    }
};

// Theme toggle logic
const themeToggle = document.getElementById('theme-toggle');
const body = document.body;

function setTheme(isDark) {
    if (isDark) {
        body.classList.add('dark');
        themeToggle.textContent = '☀️ Light Mode';
    } else {
        body.classList.remove('dark');
        themeToggle.textContent = '🌙 Dark Mode';
    }
    localStorage.setItem('theme', isDark ? 'dark' : 'light');
}

themeToggle.addEventListener('click', () => {
    const isDark = !body.classList.contains('dark');
    setTheme(isDark);
});

// On load, set theme from localStorage
window.onload = () => {
    const savedTheme = localStorage.getItem('theme');
    setTheme(savedTheme === 'dark');
    document.getElementById('fileBtn').click();
};