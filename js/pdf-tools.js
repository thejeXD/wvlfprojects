// Theme Management
let currentTheme = localStorage.getItem('theme') || 'light';

function toggleTheme() {
    currentTheme = currentTheme === 'light' ? 'dark' : 'light';
    applyTheme();
    localStorage.setItem('theme', currentTheme);
}

function applyTheme() {
    const body = document.body;
    const themeIcon = document.getElementById('theme-icon');
    
    if (currentTheme === 'dark') {
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

// Tool Switching
function switchTool(tool) {
    document.querySelectorAll('.tool-btn').forEach(btn => btn.classList.remove('active'));
    document.querySelectorAll('.tool-section').forEach(section => section.style.display = 'none');
    
    if (tool === 'merge') {
        document.getElementById('merge-btn').classList.add('active');
        document.getElementById('merge-tool').style.display = 'block';
    } else if (tool === 'unlock') {
        document.getElementById('unlock-btn').classList.add('active');
        document.getElementById('unlock-tool').style.display = 'block';
    }
}

// ==================== MERGE PDF FUNCTIONALITY ====================

let mergeFiles = [];
let draggedElement = null;

// Setup Merge Upload Zone
const mergeUploadZone = document.getElementById('merge-upload-zone');
const mergeFileInput = document.getElementById('merge-file-input');

mergeUploadZone.addEventListener('click', () => mergeFileInput.click());

mergeUploadZone.addEventListener('dragover', (e) => {
    e.preventDefault();
    mergeUploadZone.classList.add('drag-over');
});

mergeUploadZone.addEventListener('dragleave', () => {
    mergeUploadZone.classList.remove('drag-over');
});

mergeUploadZone.addEventListener('drop', (e) => {
    e.preventDefault();
    mergeUploadZone.classList.remove('drag-over');
    const files = Array.from(e.dataTransfer.files).filter(file => file.type === 'application/pdf');
    handleMergeFiles(files);
});

mergeFileInput.addEventListener('change', (e) => {
    const files = Array.from(e.target.files);
    handleMergeFiles(files);
});

function handleMergeFiles(files) {
    if (files.length === 0) {
        Swal.fire({
            icon: 'error',
            title: 'No PDF Files',
            text: 'Please select valid PDF files.',
            confirmButtonColor: '#2563eb'
        });
        return;
    }
    
    // Check for duplicates and add files
    let hasRestricted = false;
    files.forEach(file => {
        if (!mergeFiles.find(f => f.name === file.name)) {
            mergeFiles.push(file);
        }
    });
    
    displayMergeFiles();
    
    // Show helpful tip about restrictions
    Swal.fire({
        icon: 'info',
        title: 'Files Added',
        html: `
            <p>${files.length} PDF file(s) added successfully.</p>
            <p style="font-size: 13px; margin-top: 12px; color: #d97706;">
                <strong>Note:</strong> If any PDF has copy/print restrictions, unlock it first using the "Unlock PDF" tool before merging.
            </p>
        `,
        confirmButtonColor: '#2563eb',
        timer: 3000
    });
}

function displayMergeFiles() {
    const filesList = document.getElementById('merge-files-list');
    const actionsDiv = document.getElementById('merge-actions');
    
    if (mergeFiles.length === 0) {
        filesList.innerHTML = '';
        actionsDiv.style.display = 'none';
        return;
    }
    
    actionsDiv.style.display = 'flex';
    
    filesList.innerHTML = mergeFiles.map((file, index) => `
        <div class="file-item" draggable="true" data-index="${index}">
            <div class="file-info">
                <div class="drag-handle">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <line x1="3" y1="12" x2="21" y2="12"/>
                        <line x1="3" y1="6" x2="21" y2="6"/>
                        <line x1="3" y1="18" x2="21" y2="18"/>
                    </svg>
                </div>
                <div class="file-icon">PDF</div>
                <div class="file-details">
                    <div class="file-name">${file.name}</div>
                    <div class="file-size">${formatFileSize(file.size)}</div>
                </div>
            </div>
            <div class="file-actions">
                <button class="btn-icon delete" onclick="removeMergeFile(${index})" title="Remove">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <polyline points="3 6 5 6 21 6"/>
                        <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
                    </svg>
                </button>
            </div>
        </div>
    `).join('');
    
    setupDragAndDrop();
}

function setupDragAndDrop() {
    const items = document.querySelectorAll('.file-item');
    
    items.forEach(item => {
        item.addEventListener('dragstart', handleDragStart);
        item.addEventListener('dragover', handleDragOver);
        item.addEventListener('drop', handleDrop);
        item.addEventListener('dragend', handleDragEnd);
    });
}

function handleDragStart(e) {
    draggedElement = this;
    this.classList.add('dragging');
    e.dataTransfer.effectAllowed = 'move';
}

function handleDragOver(e) {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    
    const afterElement = getDragAfterElement(e.clientY);
    const container = this.parentNode;
    
    if (afterElement == null) {
        container.appendChild(draggedElement);
    } else {
        container.insertBefore(draggedElement, afterElement);
    }
}

function handleDrop(e) {
    e.preventDefault();
    updateMergeFilesOrder();
}

function handleDragEnd() {
    this.classList.remove('dragging');
    draggedElement = null;
}

function getDragAfterElement(y) {
    const draggableElements = [...document.querySelectorAll('.file-item:not(.dragging)')];
    
    return draggableElements.reduce((closest, child) => {
        const box = child.getBoundingClientRect();
        const offset = y - box.top - box.height / 2;
        
        if (offset < 0 && offset > closest.offset) {
            return { offset: offset, element: child };
        } else {
            return closest;
        }
    }, { offset: Number.NEGATIVE_INFINITY }).element;
}

function updateMergeFilesOrder() {
    const items = document.querySelectorAll('.file-item');
    const newOrder = [];
    
    items.forEach(item => {
        const index = parseInt(item.dataset.index);
        newOrder.push(mergeFiles[index]);
    });
    
    mergeFiles = newOrder;
    displayMergeFiles();
}

function removeMergeFile(index) {
    mergeFiles.splice(index, 1);
    displayMergeFiles();
}

function clearMergeFiles() {
    Swal.fire({
        title: 'Clear All Files?',
        text: "This will remove all selected PDF files.",
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#ef4444',
        cancelButtonColor: '#6c757d',
        confirmButtonText: 'Yes, clear them!'
    }).then((result) => {
        if (result.isConfirmed) {
            mergeFiles = [];
            displayMergeFiles();
            mergeFileInput.value = '';
        }
    });
}

async function mergePDFs() {
    if (mergeFiles.length < 2) {
        Swal.fire({
            icon: 'warning',
            title: 'Not Enough Files',
            text: 'Please select at least 2 PDF files to merge.',
            confirmButtonColor: '#2563eb'
        });
        return;
    }
    
    showProcessing('Merging PDFs...', 'Please wait while we combine your files.');
    
    try {
        const { PDFDocument } = PDFLib;
        const mergedPdf = await PDFDocument.create();
        
        for (let i = 0; i < mergeFiles.length; i++) {
            try {
                const fileData = await readFileAsArrayBuffer(mergeFiles[i]);
                
                let pdf;
                
                // Try multiple methods to load the PDF
                try {
                    // Method 1: Try with ignoreEncryption and throwOnInvalidObject
                    pdf = await PDFDocument.load(fileData, { 
                        ignoreEncryption: true,
                        throwOnInvalidObject: false
                    });
                } catch (e1) {
                    try {
                        // Method 2: Try with just ignoreEncryption
                        pdf = await PDFDocument.load(fileData, { 
                            ignoreEncryption: true
                        });
                    } catch (e2) {
                        try {
                            // Method 3: Try with empty password
                            pdf = await PDFDocument.load(fileData, { 
                                password: ''
                            });
                        } catch (e3) {
                            try {
                                // Method 4: Try loading normally (for unprotected PDFs)
                                pdf = await PDFDocument.load(fileData);
                            } catch (e4) {
                                // All methods failed
                                throw new Error(`Cannot load PDF: ${mergeFiles[i].name}. It may have strong encryption or restrictions.`);
                            }
                        }
                    }
                }
                
                const copiedPages = await mergedPdf.copyPages(pdf, pdf.getPageIndices());
                copiedPages.forEach(page => mergedPdf.addPage(page));
                
            } catch (fileError) {
                console.error(`Error processing ${mergeFiles[i].name}:`, fileError);
                hideProcessing();
                
                Swal.fire({
                    icon: 'error',
                    title: 'Cannot Merge This File',
                    html: `
                        <p>Could not process: <strong>${mergeFiles[i].name}</strong></p>
                        <p style="font-size: 14px; margin-top: 10px; color: #dc2626;">This PDF has restrictions that prevent merging.</p>
                        <p style="font-size: 13px; margin-top: 10px; text-align: left;">To fix this:</p>
                        <ul style="text-align: left; font-size: 13px; margin-top: 8px;">
                            <li>First use the "Unlock PDF" tool to remove restrictions</li>
                            <li>Then try merging the unlocked version</li>
                            <li>Or remove this file and merge the others</li>
                        </ul>
                    `,
                    confirmButtonColor: '#ef4444',
                    showCancelButton: true,
                    cancelButtonText: 'Remove This File',
                    confirmButtonText: 'OK'
                }).then((result) => {
                    if (result.dismiss === Swal.DismissReason.cancel) {
                        removeMergeFile(i);
                    }
                });
                return;
            }
        }
        
        const mergedPdfBytes = await mergedPdf.save();
        downloadPDF(mergedPdfBytes, 'merged-document.pdf');
        
        hideProcessing();
        
        Swal.fire({
            icon: 'success',
            title: 'Success!',
            text: 'Your PDFs have been merged successfully.',
            confirmButtonColor: '#10b981'
        });
        
    } catch (error) {
        hideProcessing();
        console.error('Merge error:', error);
        Swal.fire({
            icon: 'error',
            title: 'Merge Failed',
            html: `
                <p>An error occurred while merging the PDFs.</p>
                <p style="font-size: 14px; margin-top: 10px;"><strong>Error:</strong> ${error.message}</p>
                <p style="font-size: 13px; margin-top: 10px;">Try using "Unlock PDF" tool first on restricted files.</p>
            `,
            confirmButtonColor: '#ef4444'
        });
    }
}

// ==================== UNLOCK PDF FUNCTIONALITY ====================

let unlockFile = null;
const unlockUploadZone = document.getElementById('unlock-upload-zone');
const unlockFileInput = document.getElementById('unlock-file-input');

unlockUploadZone.addEventListener('click', () => unlockFileInput.click());

unlockUploadZone.addEventListener('dragover', (e) => {
    e.preventDefault();
    unlockUploadZone.classList.add('drag-over');
});

unlockUploadZone.addEventListener('dragleave', () => {
    unlockUploadZone.classList.remove('drag-over');
});

unlockUploadZone.addEventListener('drop', (e) => {
    e.preventDefault();
    unlockUploadZone.classList.remove('drag-over');
    const file = e.dataTransfer.files[0];
    if (file && file.type === 'application/pdf') {
        handleUnlockFile(file);
    }
});

unlockFileInput.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (file) {
        handleUnlockFile(file);
    }
});

function handleUnlockFile(file) {
    unlockFile = file;
    document.getElementById('unlock-password-section').style.display = 'block';
    document.getElementById('unlock-file-info').style.display = 'block';
    document.getElementById('unlock-file-info').innerHTML = `
        <div class="file-info">
            <div class="file-icon">PDF</div>
            <div class="file-details">
                <div class="file-name">${file.name}</div>
                <div class="file-size">${formatFileSize(file.size)}</div>
            </div>
        </div>
    `;
}

function togglePasswordVisibility() {
    const passwordInput = document.getElementById('pdf-password');
    const eyeIcon = document.getElementById('eye-icon');
    
    if (passwordInput.type === 'password') {
        passwordInput.type = 'text';
        eyeIcon.innerHTML = `
            <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/>
            <line x1="1" y1="1" x2="23" y2="23"/>
        `;
    } else {
        passwordInput.type = 'password';
        eyeIcon.innerHTML = `
            <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
            <circle cx="12" cy="12" r="3"/>
        `;
    }
}

async function unlockPDF() {
    if (!unlockFile) {
        Swal.fire({
            icon: 'error',
            title: 'No File Selected',
            text: 'Please select a PDF file first.',
            confirmButtonColor: '#2563eb'
        });
        return;
    }
    
    const password = document.getElementById('pdf-password').value;
    
    showProcessing('Unlocking PDF...', 'Attempting to remove password protection.');
    
    try {
        const { PDFDocument } = PDFLib;
        const fileData = await readFileAsArrayBuffer(unlockFile);
        
        let pdf;
        
        // Try loading with password first if provided
        if (password) {
            try {
                pdf = await PDFDocument.load(fileData, { password: password });
            } catch (passwordError) {
                // If password is wrong, try without password using ignoreEncryption
                try {
                    pdf = await PDFDocument.load(fileData, { ignoreEncryption: true });
                } catch (ignoreError) {
                    throw new Error('Incorrect password');
                }
            }
        } else {
            // No password provided, try to load with ignoreEncryption
            try {
                pdf = await PDFDocument.load(fileData, { ignoreEncryption: true });
            } catch (error) {
                // If ignoreEncryption fails, the PDF might require a password
                hideProcessing();
                Swal.fire({
                    icon: 'warning',
                    title: 'Password Required',
                    text: 'This PDF requires a password. Please enter the password and try again.',
                    confirmButtonColor: '#2563eb'
                });
                return;
            }
        }
        
        // Save without password/encryption
        const unlockedPdfBytes = await pdf.save();
        downloadPDF(unlockedPdfBytes, `unlocked-${unlockFile.name}`);
        
        hideProcessing();
        
        Swal.fire({
            icon: 'success',
            title: 'Success!',
            text: 'Your PDF has been unlocked successfully.',
            confirmButtonColor: '#10b981'
        });
        
        // Reset
        document.getElementById('pdf-password').value = '';
        
    } catch (error) {
        hideProcessing();
        console.error('Unlock error:', error);
        
        if (error.message && error.message.includes('password')) {
            Swal.fire({
                icon: 'error',
                title: 'Incorrect Password',
                text: 'The password you entered is incorrect. Please try again.',
                confirmButtonColor: '#ef4444'
            });
        } else {
            Swal.fire({
                icon: 'error',
                title: 'Unlock Failed',
                text: 'An error occurred while unlocking the PDF. The file may be corrupted or use unsupported encryption.',
                confirmButtonColor: '#ef4444'
            });
        }
    }
}

// ==================== UTILITY FUNCTIONS ====================

function readFileAsArrayBuffer(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result);
        reader.onerror = reject;
        reader.readAsArrayBuffer(file);
    });
}

function formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
}

function downloadPDF(pdfBytes, filename) {
    const blob = new Blob([pdfBytes], { type: 'application/pdf' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
}

function showProcessing(title, message) {
    const overlay = document.createElement('div');
    overlay.className = 'processing-overlay';
    overlay.id = 'processing-overlay';
    overlay.innerHTML = `
        <div class="processing-content">
            <div class="spinner"></div>
            <h3>${title}</h3>
            <p>${message}</p>
        </div>
    `;
    document.body.appendChild(overlay);
}

function hideProcessing() {
    const overlay = document.getElementById('processing-overlay');
    if (overlay) {
        overlay.remove();
    }
}

// Initialize on page load
window.addEventListener('DOMContentLoaded', () => {
    applyTheme();
});