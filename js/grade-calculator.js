let subjectCount = 0;
const MAX_SUBJECTS = 15;
let settings = {
    weights: { prelim: 20, midterm: 20, prefinals: 20, finals: 40 },
    passingGrade: 59.5,
    requirementEnabled: false,
    customFormula: '',
    theme: 'light'
};

const manuallyEdited = {};

const passedMemes = [
    'memes/passed1.jpg',
    'memes/passed2.jpg',
    'memes/passed3.jpg',
    'memes/passed4.jpg',
    'memes/passed5.jpg'
];

const failedMemes = [
    'memes/failed1.jpg',
    'memes/failed2.jpg',
    'memes/failed3.jpg',
    'memes/failed4.jpg',
    'memes/failed5.jpg'
];

const passedMessages = [
    "Grabe! You ate that! No crumbs left!",
    "Pasado ka na, humble e noh!",
    "Certified achiever, parang wala lang sayo!",
    "Light work lang 'to para sayo, BGC level!",
    "You popped off! G ka na sa next round!",
    "Ikaw na talaga, top-tier energy!",
    "Slay ka na naman, as usual.",
    "Parang quiz lang, nilaro mo lang oh!",
    "Hits different when it's your name on top!",
    "Smart, witty, and unstoppable — ikaw 'yan!"
];

const failedMessages = [
    "Chill, hindi pa tapos 'to — bawi next time!",
    "Laban lang, hindi lahat ng matalino laging pasado.",
    "G lang, small setback, big comeback!",
    "Walang tulog pero may pag-asa!",
    "Failure? More like plot twist lang 'yan!",
    "Review muna, tapos flex ulit!",
    "Bounce back agad G!",
    "Roadblock lang 'to, hindi dead end!",
    "Smile lang, baka ma-fall sayo si success.",
    "Buti pa ML mo may skin, notes mo wala hwahawhawhaw"
];

function getRandomMeme(memeArray) {
    const randomIndex = Math.floor(Math.random() * memeArray.length);
    return memeArray[randomIndex];
}

function getRandomMessage(messageArray) {
    const randomIndex = Math.floor(Math.random() * messageArray.length);
    return messageArray[randomIndex];
}

function showMeme(isPassed) {
    const memeContainer = document.getElementById('meme-container');
    const motivationalText = document.getElementById('motivational-text');
    
    memeContainer.innerHTML = '';
    motivationalText.textContent = '';
    
    if (isPassed !== null) {
        motivationalText.textContent = getRandomMessage(isPassed ? passedMessages : failedMessages);
        
        const memeImg = document.createElement('img');
        memeImg.src = getRandomMeme(isPassed ? passedMemes : failedMemes);
        memeImg.alt = isPassed ? 'Passed Meme' : 'Failed Meme';
        memeImg.onerror = function() {
            this.style.display = 'none';
        };
        memeContainer.appendChild(memeImg);
    }
}

function validateGrade(input) {
    let value = parseFloat(input.value);
    
    if (value > 100) {
        input.value = 100;
    } else if (value < 0) {
        input.value = 0;
    }
}

function addSubject() {
    const currentSubjects = document.querySelectorAll('.subject-row').length;
    if (currentSubjects >= MAX_SUBJECTS) {
        Swal.fire({
            icon: 'warning',
            title: 'Maximum Subjects Reached',
            text: `You can only add up to ${MAX_SUBJECTS} subjects.`,
            confirmButtonColor: '#2563eb'
        });
        return;
    }
    
    subjectCount++;
    const container = document.getElementById('subjects-container');
    const subjectDiv = document.createElement('div');
    subjectDiv.className = 'subject-row';
    subjectDiv.id = `subject-${subjectCount}`;
    
    const subjectName = `Subject ${subjectCount}`;
    const deleteButton = `<button class="delete-btn" onclick="deleteSubject(${subjectCount})">Delete</button>`;
    
    subjectDiv.innerHTML = `
        <label><input type="text" class="grade-input" placeholder="${subjectName}" value="${subjectName}" style="text-align: left; width: 100%;"></label>
        <input type="number" class="grade-input prelim" data-field="prelim-${subjectCount}" placeholder="0" min="0" max="100" step="0.01" onchange="handleManualEdit(this, ${subjectCount}); calculateGWA(${subjectCount})" oninput="validateGrade(this); calculateGWA(${subjectCount})">
        <input type="number" class="grade-input midterm" data-field="midterm-${subjectCount}" placeholder="0" min="0" max="100" step="0.01" onchange="handleManualEdit(this, ${subjectCount}); calculateGWA(${subjectCount})" oninput="validateGrade(this); calculateGWA(${subjectCount})">
        <input type="number" class="grade-input prefinals" data-field="prefinals-${subjectCount}" placeholder="0" min="0" max="100" step="0.01" onchange="handleManualEdit(this, ${subjectCount}); calculateGWA(${subjectCount})" oninput="validateGrade(this); calculateGWA(${subjectCount})">
        <input type="number" class="grade-input finals" data-field="finals-${subjectCount}" placeholder="0" min="0" max="100" step="0.01" onchange="handleManualEdit(this, ${subjectCount}); calculateGWA(${subjectCount})" oninput="validateGrade(this); calculateGWA(${subjectCount})">
        <div class="result-box" id="gwa-${subjectCount}">-</div>
        <div class="result-box" id="need-${subjectCount}" style="display: none;">-</div>
        ${deleteButton}
    `;
    
    container.appendChild(subjectDiv);
}

function handleManualEdit(input, id) {
    const fieldKey = input.getAttribute('data-field');
    if (input.classList.contains('required') && input.value !== '') {
        manuallyEdited[fieldKey] = true;
        input.classList.remove('required');
        input.title = '';
    }
}

function deleteSubject(id) {
    const currentSubjects = document.querySelectorAll('.subject-row');
    if (currentSubjects.length <= 1) {
        Swal.fire({
            icon: 'error',
            title: 'Cannot Delete',
            text: 'Cannot delete the last subject. Add more subjects first.',
            confirmButtonColor: '#2563eb'
        });
        return;
    }
    
    Swal.fire({
        title: 'Delete Subject?',
        text: "This action cannot be undone!",
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#ef4444',
        cancelButtonColor: '#6c757d',
        confirmButtonText: 'Yes, delete it!'
    }).then((result) => {
        if (result.isConfirmed) {
            const subject = document.getElementById(`subject-${id}`);
            if (subject) {
                ['prelim', 'midterm', 'prefinals', 'finals'].forEach(field => {
                    delete manuallyEdited[`${field}-${id}`];
                });
                subject.remove();
                calculateOverallGWA();
                
                Swal.fire({
                    icon: 'success',
                    title: 'Deleted!',
                    text: 'Subject has been removed.',
                    timer: 1500,
                    showConfirmButton: false
                });
            }
        }
    });
}

function calculateGWA(id, skipPrediction) {
    const subject = document.getElementById(`subject-${id}`);
    const prelim = parseFloat(subject.querySelector('.prelim').value) || 0;
    const midterm = parseFloat(subject.querySelector('.midterm').value) || 0;
    const prefinals = parseFloat(subject.querySelector('.prefinals').value) || 0;
    const finals = parseFloat(subject.querySelector('.finals').value) || 0;

    let gwa;
    if (settings.customFormula) {
        try {
            const formula = settings.customFormula
                .replace(/{prelim}/g, prelim)
                .replace(/{midterm}/g, midterm)
                .replace(/{prefinals}/g, prefinals)
                .replace(/{finals}/g, finals);
            gwa = eval(formula);
        } catch (e) {
            const w = settings.weights;
            gwa = (prelim * (w.prelim/100)) + (midterm * (w.midterm/100)) + (prefinals * (w.prefinals/100)) + (finals * (w.finals/100));
        }
    } else {
        const w = settings.weights;
        gwa = (prelim * (w.prelim/100)) + (midterm * (w.midterm/100)) + (prefinals * (w.prefinals/100)) + (finals * (w.finals/100));
    }
    
    const gwaBox = document.getElementById(`gwa-${id}`);
    gwaBox.textContent = gwa.toFixed(2);
    
    if (gwa >= settings.passingGrade) {
        gwaBox.className = 'result-box passed';
    } else if (gwa > 0) {
        gwaBox.className = 'result-box failed';
    } else {
        gwaBox.className = 'result-box';
    }
    
    const pass = settings.passingGrade;
    ['prelim','midterm','prefinals','finals'].forEach(key => {
        const el = subject.querySelector(`.${key}`);
        const raw = el.value;
        if (raw === '') { el.classList.remove('below-pass'); return; }
        const val = parseFloat(raw);
        if (!isNaN(val) && val < pass) {
            el.classList.add('below-pass');
        } else {
            el.classList.remove('below-pass');
        }
    });

    computeNeededToPass(id, !!skipPrediction);
    calculateOverallGWA();
}

function calculateOverallGWA() {
    const subjects = document.querySelectorAll('.subject-row');
    let totalGWA = 0;
    let count = 0;

    subjects.forEach(subject => {
        const gwaText = subject.querySelector('.result-box').textContent;
        if (gwaText !== '-' && gwaText !== '') {
            const gwa = parseFloat(gwaText);
            if (gwa > 0) {
                totalGWA += gwa;
                count++;
            }
        }
    });

    const overallGWA = count > 0 ? totalGWA / count : 0;
    const gwaDisplay = document.getElementById('overall-gwa');
    const statusDisplay = document.getElementById('status');

    gwaDisplay.textContent = overallGWA.toFixed(2);

    if (overallGWA >= settings.passingGrade) {
        statusDisplay.textContent = 'PASSED';
        statusDisplay.className = 'status passed';
        showMeme(true);
    } else if (overallGWA > 0) {
        statusDisplay.textContent = 'FAILED';
        statusDisplay.className = 'status failed';
        showMeme(false);
    } else {
        statusDisplay.textContent = 'Calculate Your Grades';
        statusDisplay.className = 'status';
        statusDisplay.style.background = 'rgba(255,255,255,0.2)';
        showMeme(null);
    }
    
    const summaryCard = document.querySelector('.summary');
    if (count > 0) {
        summaryCard.style.display = 'block';
        summaryCard.classList.add('reveal');
    } else {
        summaryCard.style.display = 'none';
        summaryCard.classList.remove('reveal');
    }
}

function printGrades() {
    window.print();
}

function clearAllGrades() {
    Swal.fire({
        title: 'Clear All Grades?',
        text: "This will remove all grade inputs but keep your subjects.",
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#ef4444',
        cancelButtonColor: '#6c757d',
        confirmButtonText: 'Yes, clear them!'
    }).then((result) => {
        if (result.isConfirmed) {
            const subjects = document.querySelectorAll('.subject-row');
            subjects.forEach((subject, index) => {
                const inputs = subject.querySelectorAll('.grade-input');
                inputs.forEach(input => {
                    if (input.type === 'number') {
                        input.value = '';
                        input.classList.remove('required', 'below-pass');
                        input.title = '';
                        const fieldKey = input.getAttribute('data-field');
                        if (fieldKey) {
                            delete manuallyEdited[fieldKey];
                        }
                    }
                });
            });
            calculateOverallGWA();
            
            Swal.fire({
                icon: 'success',
                title: 'Cleared!',
                text: 'All grades have been removed.',
                timer: 1500,
                showConfirmButton: false
            });
        }
    });
}

function clearAllSubjects() {
    Swal.fire({
        title: 'Clear All Subjects?',
        text: "This will remove all subjects except one.",
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#fb8500',
        cancelButtonColor: '#6c757d',
        confirmButtonText: 'Yes, clear them!'
    }).then((result) => {
        if (result.isConfirmed) {
            const subjects = document.querySelectorAll('.subject-row');
            
            subjects.forEach((subject, index) => {
                if (index > 0) {
                    const id = parseInt(subject.id.split('-')[1]);
                    ['prelim', 'midterm', 'prefinals', 'finals'].forEach(field => {
                        delete manuallyEdited[`${field}-${id}`];
                    });
                    subject.remove();
                }
            });
            
            if (subjects.length > 0) {
                const firstSubject = subjects[0];
                const inputs = firstSubject.querySelectorAll('.grade-input');
                inputs.forEach(input => {
                    if (input.type === 'number') {
                        input.value = '';
                        input.classList.remove('required', 'below-pass');
                        input.title = '';
                        const fieldKey = input.getAttribute('data-field');
                        if (fieldKey) {
                            delete manuallyEdited[fieldKey];
                        }
                    }
                });
            }
            
            calculateOverallGWA();
            
            Swal.fire({
                icon: 'success',
                title: 'Cleared!',
                text: 'All subjects removed except one.',
                timer: 1500,
                showConfirmButton: false
            });
        }
    });
}

function saveGrades() {
    const printWindow = window.open('', '_blank');
    const subjects = document.querySelectorAll('.subject-row');
    
    let htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
        <title>Grade Calculator Report</title>
        <style>
            body { font-family: Arial, sans-serif; margin: 20px; }
            table { width: 100%; border-collapse: collapse; margin: 20px 0; }
            th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
            th { background-color: #f2f2f2; }
            .summary { background-color: #f8f9fa; padding: 20px; margin: 20px 0; border-radius: 5px; }
            .passed { color: #28a745; font-weight: bold; }
            .failed { color: #dc3545; font-weight: bold; }
        </style>
    </head>
    <body>
        <h1>Grade Calculator Report</h1>
        <table>
            <thead>
                <tr>
                    <th>Subject</th>
                    <th>Prelim</th>
                    <th>Midterm</th>
                    <th>Pre-Finals</th>
                    <th>Finals</th>
                    <th>GWA</th>
                    <th>Status</th>
                </tr>
            </thead>
            <tbody>
    `;
    
    subjects.forEach((subject, index) => {
        const subjectName = subject.querySelector('input[type="text"]').value || `Subject ${index + 1}`;
        const prelim = subject.querySelector('.prelim').value || '0';
        const midterm = subject.querySelector('.midterm').value || '0';
        const prefinals = subject.querySelector('.prefinals').value || '0';
        const finals = subject.querySelector('.finals').value || '0';
        const gwa = subject.querySelector('.result-box').textContent;
        const status = parseFloat(gwa) >= settings.passingGrade ? 'PASSED' : 'FAILED';
        const statusClass = parseFloat(gwa) >= settings.passingGrade ? 'passed' : 'failed';
        
        htmlContent += `
            <tr>
                <td>${subjectName}</td>
                <td>${prelim}</td>
                <td>${midterm}</td>
                <td>${prefinals}</td>
                <td>${finals}</td>
                <td>${gwa}</td>
                <td class="${statusClass}">${status}</td>
            </tr>
        `;
    });
    
    const overallGWA = document.getElementById('overall-gwa').textContent;
    const overallStatus = parseFloat(overallGWA) >= settings.passingGrade ? 'PASSED' : 'FAILED';
    const overallStatusClass = parseFloat(overallGWA) >= settings.passingGrade ? 'passed' : 'failed';
    
    htmlContent += `
            </tbody>
        </table>
        <div class="summary">
            <h2>Overall Summary</h2>
            <p><strong>Overall GWA:</strong> ${overallGWA}</p>
            <p><strong>Status:</strong> <span class="${overallStatusClass}">${overallStatus}</span></p>
            <p><strong>Passing Grade:</strong> ${settings.passingGrade}</p>
            <p><em>Created by Wolf with ❤️</em></p>
            <p style="font-size: 12px; color: #888;">© 2025 All Rights Reserved</p>
        </div>
    </body>
    </html>
    `;
    
    printWindow.document.write(htmlContent);
    printWindow.document.close();
    printWindow.print();
}

window.onload = function() {
    loadSettings();
    for (let i = 0; i < 5; i++) {
        addSubject();
    }
    applyTheme();
};

function toggleTheme() {
    settings.theme = settings.theme === 'light' ? 'dark' : 'light';
    applyTheme();
    saveSettingsToStorage();
}

function applyTheme() {
    const body = document.body;
    const themeIcon = document.getElementById('theme-icon');
    
    if (settings.theme === 'dark') {
        body.classList.add('dark-theme');
        themeIcon.innerHTML = `
            <circle cx="12" cy="12" r="5"/>
            <line x1="12" y1="1" x2="12" y2="3" stroke="currentColor" stroke-width="2"/>
            <line x1="12" y1="21" x2="12" y2="23" stroke="currentColor" stroke-width="2"/>
            <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" stroke="currentColor" stroke-width="2"/>
            <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" stroke="currentColor" stroke-width="2"/>
            <line x1="1" y1="12" x2="3" y2="12" stroke="currentColor" stroke-width="2"/>
            <line x1="21" y1="12" x2="23" y2="12" stroke="currentColor" stroke-width="2"/>
            <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" stroke="currentColor" stroke-width="2"/>
            <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" stroke="currentColor" stroke-width="2"/>
        `;
    } else {
        body.classList.remove('dark-theme');
        themeIcon.innerHTML = `<path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>`;
    }
}

function toggleDropdown(type) {
    const dropdown = document.getElementById(`${type}-dropdown`);
    if (!dropdown) return;
    
    const arrow = dropdown.previousElementSibling?.querySelector('.dropdown-arrow');
    
    if (dropdown.style.display === 'block') {
        dropdown.style.display = 'none';
        if (arrow) arrow.textContent = '▼';
    } else {
        document.querySelectorAll('.dropdown-content').forEach(d => d.style.display = 'none');
        document.querySelectorAll('.dropdown-arrow').forEach(a => a.textContent = '▼');
        
        dropdown.style.display = 'block';
        if (arrow) arrow.textContent = '▲';
    }
}

function openSettings() {
    document.getElementById('settings-overlay').style.display = 'block';
    const drawer = document.getElementById('settings-drawer');
    drawer.style.display = 'block';
    document.getElementById('w-prelim').value = settings.weights.prelim;
    document.getElementById('w-midterm').value = settings.weights.midterm;
    document.getElementById('w-prefinals').value = settings.weights.prefinals;
    document.getElementById('w-finals').value = settings.weights.finals;
    document.getElementById('passing-grade').value = settings.passingGrade.toFixed(2);
    document.getElementById('custom-formula').value = settings.customFormula;
    document.getElementById('requirement-toggle').checked = settings.requirementEnabled;
}

function closeSettings() {
    document.getElementById('settings-overlay').style.display = 'none';
    document.getElementById('settings-drawer').style.display = 'none';
}

function saveSettings() {
    const p = parseFloat(document.getElementById('w-prelim').value) || 0;
    const m = parseFloat(document.getElementById('w-midterm').value) || 0;
    const pf = parseFloat(document.getElementById('w-prefinals').value) || 0;
    const f = parseFloat(document.getElementById('w-finals').value) || 0;
    const sum = p + m + pf + f;
    
    if (sum !== 100) {
        Swal.fire({
            icon: 'error',
            title: 'Invalid Weights',
            text: `Weights must sum to 100. Current sum: ${sum}`,
            confirmButtonColor: '#ef4444'
        });
        return;
    }
    
    const pass = parseFloat(document.getElementById('passing-grade').value);
    const customFormula = document.getElementById('custom-formula').value.trim();
    const requirementEnabled = document.getElementById('requirement-toggle').checked;
    
    settings = {
        weights: { prelim: p, midterm: m, prefinals: pf, finals: f },
        passingGrade: isNaN(pass) ? 59.5 : pass,
        requirementEnabled: requirementEnabled,
        customFormula: customFormula,
        theme: settings.theme
    };
    
    saveSettingsToStorage();
    updateLabels();
    updateNeededHeader();
    
    const rows = document.querySelectorAll('.subject-row');
    rows.forEach(row => {
        const id = parseInt(row.id.split('-')[1]);
        calculateGWA(id);
    });
    calculateOverallGWA();
    closeSettings();
    
    Swal.fire({
        icon: 'success',
        title: 'Settings Saved!',
        text: 'Your preferences have been updated.',
        timer: 1500,
        showConfirmButton: false
    });
}

function saveSettingsToStorage() {
    localStorage.setItem('wolfGradeSettings', JSON.stringify(settings));
}

function loadSettings() {
    const raw = localStorage.getItem('wolfGradeSettings');
    if (raw) {
        try {
            const parsed = JSON.parse(raw);
            if (parsed && parsed.weights) settings = parsed;
        } catch(e) {}
    }
    updateLabels();
    updateNeededHeader();
}

function updateLabels() {
    const w = settings.weights;
    const setText = (id, val) => { const el = document.getElementById(id); if (el) el.textContent = `${val}%`; };
    setText('label-prelim', w.prelim);
    setText('label-midterm', w.midterm);
    setText('label-prefinals', w.prefinals);
    setText('label-finals', w.finals);
    const weightsInfo = document.getElementById('weights-info');
    if (weightsInfo) {
        weightsInfo.innerHTML = `Prelim (${w.prelim}%), Midterm (${w.midterm}%), Pre-Finals (${w.prefinals}%), Finals (${w.finals}%)`;
    }
    const formulaInfo = document.getElementById('formula-info');
    if (formulaInfo) {
        if (settings.customFormula) {
            formulaInfo.innerHTML = settings.customFormula;
        } else {
            formulaInfo.innerHTML = `GWA = (Prelim × ${(w.prelim/100).toFixed(2)}) + (Midterm × ${(w.midterm/100).toFixed(2)}) + (Pre-Finals × ${(w.prefinals/100).toFixed(2)}) + (Finals × ${(w.finals/100).toFixed(2)})`;
        }
    }
    const passingInfo = document.getElementById('passing-info');
    if (passingInfo) {
        passingInfo.innerHTML = `${settings.passingGrade.toFixed(2)} and above`;
    }
}

function updateNeededHeader() {
    const neededHeader = document.getElementById('needed-header');
    if (neededHeader) {
        neededHeader.style.display = settings.requirementEnabled ? 'block' : 'none';
    }
}

function computeNeededToPass(id, skipPrediction) {
    const row = document.getElementById(`subject-${id}`);
    const needBox = document.getElementById(`need-${id}`);
    const w = settings.weights;
    const inputs = {
        prelim: row.querySelector('.prelim').value === '' ? null : parseFloat(row.querySelector('.prelim').value),
        midterm: row.querySelector('.midterm').value === '' ? null : parseFloat(row.querySelector('.midterm').value),
        prefinals: row.querySelector('.prefinals').value === '' ? null : parseFloat(row.querySelector('.prefinals').value),
        finals: row.querySelector('.finals').value === '' ? null : parseFloat(row.querySelector('.finals').value)
    };
    
    let sum = 0;
    let remainingWeight = 0;
    const weightsMap = { prelim: w.prelim/100, midterm: w.midterm/100, prefinals: w.prefinals/100, finals: w.finals/100 };
    let missingKey = null;
    Object.keys(inputs).forEach(k => {
        const val = inputs[k];
        const weight = weightsMap[k];
        if (val === null || isNaN(val)) {
            remainingWeight += weight;
            missingKey = missingKey === null ? k : 'multiple';
        } else {
            sum += val * weight;
        }
    });
    
    if (remainingWeight === 0) {
        needBox.textContent = '-';
        needBox.className = 'result-box';
        needBox.style.display = settings.requirementEnabled ? 'block' : 'none';
        return;
    }
    const neededValue = (settings.passingGrade - sum) / remainingWeight;
    const clamped = Math.max(0, Math.min(100, neededValue));
    needBox.textContent = isFinite(clamped) ? clamped.toFixed(2) : '-';
    if (clamped >= settings.passingGrade) {
        needBox.className = 'result-box passed';
    } else {
        needBox.className = 'result-box failed';
    }
    
    needBox.style.display = settings.requirementEnabled ? 'block' : 'none';
    
    if (!skipPrediction && settings.requirementEnabled && remainingWeight > 0) {
        const missingFields = [];
        Object.keys(inputs).forEach(k => {
            const val = inputs[k];
            const fieldKey = `${k}-${id}`;
            if ((val === null || isNaN(val)) && !manuallyEdited[fieldKey]) {
                missingFields.push(k);
            }
        });
        
        if (missingFields.length > 0) {
            const avgNeeded = neededValue;
            missingFields.forEach(key => {
                const target = row.querySelector(`.${key}`);
                if (target) {
                    target.value = isFinite(avgNeeded) ? Math.max(0, Math.min(100, avgNeeded)).toFixed(2) : '';
                    target.classList.add('required');
                    target.title = `Required Grade: ${isFinite(avgNeeded) ? Math.max(0, Math.min(100, avgNeeded)).toFixed(2) : 'N/A'}`;
                }
            });
            calculateGWA(parseInt(row.id.split('-')[1]), true);
        }
    } else if (!settings.requirementEnabled) {
        row.querySelectorAll('.grade-input').forEach(inp => {
            if (inp.type === 'number') {
                inp.classList.remove('required');
                inp.title = '';
            }
        });
    }
}