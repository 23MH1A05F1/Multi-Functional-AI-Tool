document.getElementById("analyzeBtn").onclick = analyzeResume;

let resumeText = "";

// ----------------------
// PDF Upload
// ----------------------
async function extractPDF(file) {
    const reader = new FileReader();

    return new Promise(resolve => {
        reader.onload = async function() {
            const typedArray = new Uint8Array(this.result);
            const pdf = await pdfjsLib.getDocument({ data: typedArray }).promise;
            let text = "";

            for (let i = 1; i <= pdf.numPages; i++) {
                const page = await pdf.getPage(i);
                const content = await page.getTextContent();
                text += content.items.map(i => i.str).join(" ") + " ";
            }
            resolve(text);
        };
        reader.readAsArrayBuffer(file);
    });
}

// ----------------------
// DOCX Upload
// ----------------------
async function extractDOCX(file) {
    return new Promise(resolve => {
        let reader = new FileReader();
        reader.onload = function() {
            mammoth.extractRawText({ arrayBuffer: reader.result })
                .then(res => resolve(res.value));
        };
        reader.readAsArrayBuffer(file);
    });
}

// ----------------------
// Analyze Resume
// ----------------------
async function analyzeResume() {
    let file = document.getElementById("resumeFile").files[0];
    let jobDesc = document.getElementById("jobDesc").value.toLowerCase();

    if (!file || !jobDesc) {
        alert("Upload a resume and paste job description.");
        return;
    }

    // Parse file
    if (file.name.endsWith(".pdf")) {
        resumeText = await extractPDF(file);
    } else if (file.name.endsWith(".docx")) {
        resumeText = await extractDOCX(file);
    }

    resumeText = resumeText.toLowerCase();

    keywordMatching(jobDesc);
    extractSkills();
    sectionScoring();
    generateSuggestions();
}

// ----------------------
// Keyword Matching + Highlighting
// ----------------------
function keywordMatching(jd) {
    const jdWords = [...new Set(jd.match(/\b[a-zA-Z]+\b/g))];
    const matched = jdWords.filter(w => resumeText.includes(w));
    const missing = jdWords.filter(w => !resumeText.includes(w));

    const score = ((matched.length / jdWords.length) * 100).toFixed(1);

    document.getElementById("atsScore").innerText = score + "%";

    let missingBox = document.getElementById("missingKeywords");
    missingBox.innerHTML = "";
    missing.slice(0, 30).forEach(w => {
        let li = document.createElement("li");
        li.textContent = w;
        missingBox.appendChild(li);
    });

    // Highlighting
    let highlighted = resumeText;
    matched.forEach(w => {
        const reg = new RegExp(`\\b${w}\\b`, "gi");
        highlighted = highlighted.replace(reg, `<span class='highlight'>${w}</span>`);
    });

    document.getElementById("highlightBox").innerHTML = highlighted;
}

// ----------------------
// Skill Extraction (offline)
// ----------------------
function extractSkills() {
    const skillList = [
        "javascript", "flutter", "python", "java", "sql",
        "react", "node", "html", "css", "aws", "git",
        "communication", "leadership", "teamwork"
    ];

    const found = skillList.filter(s => resumeText.includes(s));

    let skillBox = document.getElementById("skillsList");
    skillBox.innerHTML = "";

    found.forEach(s => {
        let li = document.createElement("li");
        li.textContent = s;
        skillBox.appendChild(li);
    });
}

// ----------------------
// Section-Based Scoring
// ----------------------
function sectionScoring() {
    const sections = {
        "Experience": 30,
        "Education": 20,
        "Projects": 20,
        "Skills": 20,
        "Certifications": 10
    };

    let scoreBox = document.getElementById("sectionScores");
    scoreBox.innerHTML = "";

    Object.entries(sections).forEach(([section, weight]) => {
        let found = resumeText.includes(section.toLowerCase());
        let li = document.createElement("li");
        li.textContent = `${section}: ${found ? weight : 0}/${weight}`;
        scoreBox.appendChild(li);
    });
}

// ----------------------
// AI-like Offline Suggestions
// ----------------------
function generateSuggestions() {
    let suggestions = [];

    if (!resumeText.includes("experience"))
        suggestions.push("Add a Work Experience section.");

    if (!resumeText.includes("education"))
        suggestions.push("Add an Education section with degrees and years.");

    if (!resumeText.includes("project"))
        suggestions.push("Include at least 2–3 projects with outcomes.");

    if (!resumeText.includes("skill"))
        suggestions.push("Add a Skills section with technical and soft skills.");

    if (resumeText.length < 500)
        suggestions.push("Your resume seems too short. Expand your achievements.");

    if (resumeText.length > 4000)
        suggestions.push("Your resume is too long. Keep it to 1–2 pages.");

    let suggBox = document.getElementById("suggestions");
    suggBox.innerHTML = "";

    suggestions.forEach(s => {
        let li = document.createElement("li");
        li.textContent = s;
        suggBox.appendChild(li);
    });
}
