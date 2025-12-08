class GradeCalculatorApp {
    constructor() { // NOSONAR
        this.appVersion = '1.5.1'; // Current version of the app
        this.changelogData = {
            '1.5.1': [
                'Made the "What\'s New" changelog dynamic and viewable by version.',
                'Enhanced data privacy notice for clarity.',
                'Minor bug fixes and performance improvements.'
            ],
            '1.5.0': [
                'Added CSV Import/Export functionality.',
                'Implemented subject reordering with up/down buttons.',
                'Added "Reset to Default" for grade weights.',
                'Added a confirmation prompt for unsaved settings.',
                'Polished the printable report card design.'
            ]
        };
        this.subjectCount = 0;
        this.settings = {
            weights: { prelim: 20, midterm: 20, prefinals: 20, finals: 40 },
            passingGrade: 59.5,
            maxSubjects: 10,
            requirementEnabled: false,
            componentBreakdown: false,
            componentWeights: { performance: 40, activities: 30, exam: 30 },
            theme: localStorage.getItem('theme') || 'light',
        };

        this.manuallyEdited = {};
        this.currentComponentSubject = null;
        this.currentComponentTerm = null;
        this.componentFields = {
            performance: [],
            activities: [],
            exam: []
        };
        this.settingsDirty = false;
        
        this.passedMemes = [
            '../assets/memes/passed1.jpg',
            '../assets/memes/passed2.jpg',
            '../assets/memes/passed3.jpg',
        ];
        this.failedMemes = [
            '../assets/memes/failed1.jpg',
            '../assets/memes/failed2.jpg',
            '../assets/memes/failed3.jpg',
        ];
        this.passedMessages = [
            "Grabe! You ate that! No crumbs left!",
            "Pasado ka na, humble e noh!",
            "Certified achiever, parang wala lang sayo!",
            "Slay ka na naman, as usual.",
        ];
        this.failedMessages = [
            "Chill, hindi pa tapos 'to — bawi next time!",
            "Laban lang, hindi lahat ng matalino laging pasado.",
            "G lang, small setback, big comeback!",
            "Buti pa ML mo may skin, notes mo wala hwahawhawhaw",
        ];

        this._cacheDOMElements();
        this._init();
    }

    _cacheDOMElements() {
        // Main layout
        this.themeToggleButton = document.getElementById('theme-toggle');
        this.themeIconSun = document.getElementById('theme-icon-sun');
        this.themeIconMoon = document.getElementById('theme-icon-moon');
        this.whatsNewBtn = document.getElementById('whats-new-btn');
        this.printBtn = document.getElementById('print-btn');
        this.settingsBtn = document.getElementById('settings-btn');
        this.addSubjectBtn = document.getElementById('add-subject-btn');
        this.clearGradesBtn = document.getElementById('clear-grades-btn');
        this.deleteAllBtn = document.getElementById('delete-all-btn');
        this.exportCsvBtn = document.getElementById('export-csv-btn');
        this.importCsvBtn = document.getElementById('import-csv-btn');
        this.dropdowns = document.querySelectorAll('.dropdown-btn');

        // Table
        this.subjectsContainer = document.getElementById('subjects-container');
        this.neededHeader = document.getElementById('needed-header');

        // Header Summary
        this.overallGwaDisplay = document.getElementById('overall-gwa');
        this.statusDisplay = document.getElementById('status');
        
        // Summary Section (memes)
        this.motivationalText = document.getElementById('motivational-text');
        this.memeContainer = document.getElementById('meme-container');

        // Settings Drawer
        this.settingsOverlay = document.getElementById('settings-overlay');
        this.settingsDrawer = document.getElementById('settings-drawer');
        this.settingsContent = this.settingsDrawer ? this.settingsDrawer.querySelector('.settings-content') : null;
        this.closeSettingsBtn = document.getElementById('close-settings-btn');
        this.saveSettingsBtn = document.getElementById('save-settings-btn');
        this.wPrelim = document.getElementById('w-prelim');
        this.wMidterm = document.getElementById('w-midterm');
        this.wPrefinals = document.getElementById('w-prefinals');
        this.wFinals = document.getElementById('w-finals');
        this.passingGradeInput = document.getElementById('passing-grade');
        this.requirementToggle = document.getElementById('requirement-toggle');
        this.componentToggle = document.getElementById('component-toggle');
        this.componentWeightsContainer = document.getElementById('component-weights');
        this.wPerformance = document.getElementById('w-performance');
        this.wActivities = document.getElementById('w-activities');
        this.wExam = document.getElementById('w-exam');
        this.maxSubjectsInput = document.getElementById('max-subjects-input');
        this.resetWeightsBtn = document.getElementById('reset-weights-btn');
        this.resetComponentWeightsBtn = document.getElementById('reset-component-weights-btn');

        // Component Drawer
        this.componentOverlay = document.getElementById('component-overlay');
        this.componentDrawer = document.getElementById('component-drawer');
        this.closeComponentDrawerBtn = document.getElementById('close-component-drawer-btn');
        this.applyComponentGradeBtn = document.getElementById('apply-component-grade-btn');
        this.componentDrawerTitle = document.getElementById('component-drawer-title');
        this.compPerfWeight = document.getElementById('comp-perf-weight');
        this.compActWeight = document.getElementById('comp-act-weight');
        this.compExamWeight = document.getElementById('comp-exam-weight');
        this.performanceTasksContainer = document.getElementById('performance-tasks-container');
        this.activitiesContainer = document.getElementById('activities-container');
        this.examContainer = document.getElementById('exam-container');
        this.componentCalculatedGrade = document.getElementById('component-calculated-grade');
        this.addComponentBtns = document.querySelectorAll('.add-component-btn');
    }

    _init() {
        // 1. Load settings from storage FIRST.
        this._loadSettings();

        // 2. Bind event listeners.
        this._bindEventListeners();

        // 3. Apply the theme from loaded settings.
        this._applyTheme();
        
        // 4. Set up the initial UI state.
        this.dropdowns.forEach(button => button.classList.remove('active'));
        // Open the privacy dropdown by default
        const privacyDropdown = document.querySelector('.dropdown-btn[data-dropdown="privacy"]');
        if (privacyDropdown) privacyDropdown.classList.add('active');
        
        // 5. Load saved data from localStorage or create default subjects.
        this._loadDataFromStorage();
        this._checkVersionAndShowChangelog();
    }


    _bindEventListeners() {
        if (this.themeToggleButton) this.themeToggleButton.addEventListener('click', () => this.toggleTheme());
        if (this.whatsNewBtn) this.whatsNewBtn.addEventListener('click', () => this.showChangelog(true));
        if (this.printBtn) this.printBtn.addEventListener('click', () => this.printReport());
        if (this.settingsBtn) this.settingsBtn.addEventListener('click', () => this.openSettings());
        if (this.addSubjectBtn) this.addSubjectBtn.addEventListener('click', () => this.addSubject());
        if (this.clearGradesBtn) this.clearGradesBtn.addEventListener('click', () => this.clearAllGrades());
        if (this.deleteAllBtn) this.deleteAllBtn.addEventListener('click', () => this.deleteAllSubjects());
        if (this.exportCsvBtn) this.exportCsvBtn.addEventListener('click', () => this.exportToCSV());
        if (this.importCsvBtn) this.importCsvBtn.addEventListener('click', () => this.importFromCSV());

        if (this.dropdowns) {
            this.dropdowns.forEach(btn => {
                btn.addEventListener('click', () => this.toggleDropdown(btn.dataset.dropdown));
            });
        }

        // Event delegation for the table body is safe as it checks the container first
        if (this.subjectsContainer) {
            this.subjectsContainer.addEventListener('click', (e) => {
                const target = e.target.closest('.delete-btn, .calc-btn, .move-btn');
                if (!target) return;

                const subjectRow = target.closest('tr');
                const subjectId = parseInt(subjectRow.id.split('-')[1]);

                if (target.classList.contains('delete-btn')) {
                    this.deleteSubject(subjectId);
                } else if (target.classList.contains('move-up-btn')) {
                    this._moveSubjectUp(subjectRow);
                } else if (target.classList.contains('move-down-btn')) {
                    this._moveSubjectDown(subjectRow);
                } else if (target.classList.contains('calc-btn')) {
                    const term = target.dataset.term;
                    this.openComponentDrawer(subjectId, term);
                }
            });

            const handleGradeInput = (e) => {
                if (e.target.classList.contains('grade-input')) {
                    const subjectId = parseInt(e.target.closest('tr').id.split('-')[1]);
                    if (e.target.type === 'number') {
                        this.validateGrade(e.target);
                    }
                    this.calculateGWA(subjectId);
                }
            };

            // Save data whenever an input changes.
            const debouncedHandler = this._debounce((event) => { handleGradeInput(event); this._saveDataToStorage(); }, 300);
            this.subjectsContainer.addEventListener('input', debouncedHandler);
        }


        // Settings
        if (this.settingsOverlay) this.settingsOverlay.addEventListener('click', () => this.closeSettings());
        if (this.closeSettingsBtn) this.closeSettingsBtn.addEventListener('click', () => this.closeSettings());
        if (this.saveSettingsBtn) this.saveSettingsBtn.addEventListener('click', () => this.saveSettings());
        if (this.resetComponentWeightsBtn) this.resetComponentWeightsBtn.addEventListener('click', () => this._resetComponentWeights());
        if (this.resetWeightsBtn) this.resetWeightsBtn.addEventListener('click', () => this._resetWeights());
        if (this.componentToggle) {
            this.componentToggle.addEventListener('change', () => {
                if (this.componentWeightsContainer) {
                    this.componentWeightsContainer.style.display = this.componentToggle.checked ? 'block' : 'none';
                }
            });
        }

        if (this.settingsContent) {
            this.settingsContent.addEventListener('input', () => { this.settingsDirty = true; });
        }

        // Component Drawer
        if (this.componentOverlay) this.componentOverlay.addEventListener('click', () => this.closeComponentDrawer());
        if (this.closeComponentDrawerBtn) this.closeComponentDrawerBtn.addEventListener('click', () => this.closeComponentDrawer());
        if (this.applyComponentGradeBtn) this.applyComponentGradeBtn.addEventListener('click', () => this.applyComponentGrade());
        
        if (this.addComponentBtns) {
            this.addComponentBtns.forEach(btn => {
                btn.addEventListener('click', () => {
                     if(btn.dataset.componentType) this.addComponentField(btn.dataset.componentType)
                });
            });
        }

        const componentContainers = [this.performanceTasksContainer, this.activitiesContainer, this.examContainer];
        componentContainers.forEach(container => {
            if (container) {
                container.addEventListener('input', (e) => {
                    // Calculate the total for the specific row that was changed
                    if (e.target.classList.contains('component-score') || e.target.classList.contains('component-total')) {
                        const row = e.target.closest('.component-field-row');
                        this._calculateComponentRowTotal(row);
                    }
                    // Recalculate the overall term grade
                    this.calculateComponentGrade();
                });

                container.addEventListener('click', (e) => {
                    if (e.target.closest('.remove-component-btn')) {
                        const btn = e.target.closest('.remove-component-btn');
                        this.removeComponentField(btn.dataset.fieldId);
                        // Recalculate after removing a field
                        this.calculateComponentGrade();
                    }
                });
            }
        });
    }

    _debounce(func, delay = 300) {
        let timeout;
        return (...args) => {
            clearTimeout(timeout);
            timeout = setTimeout(() => {
                func.apply(this, args);
            }, delay);
        };
    }

    _loadSettings() {
        const raw = localStorage.getItem('wolfGradeSettings');
        if (raw) {
            try {
                const parsed = JSON.parse(raw);
                if (parsed && parsed.weights) {
                    this.settings = { ...this.settings, ...parsed };
                }
            } catch (e) { console.error("Failed to parse settings:", e); }
        }
        this._updateLabels();
        this._updateNeededHeader();
    }

    _loadDataFromStorage() {
        const savedData = localStorage.getItem('wolfGradeData');
        this.subjectsContainer.innerHTML = ''; // Clear existing rows
        this.subjectCount = 0;

        if (savedData) {
            try {
                const subjects = JSON.parse(savedData);
                if (Array.isArray(subjects) && subjects.length > 0) {
                    subjects.forEach(subject => {
                        this.addSubject(subject);
                    });
                } else {
                    this.addSubject(); // Add one if storage is empty array
                }
            } catch (e) {
                console.error("Failed to load grade data, starting fresh.", e);
                this.addSubject(); // Add one on error
            }
        } else {
            // If no data, add 3 default subjects
            for (let i = 0; i < 3; i++) {
                this.addSubject();
            }
        }
        // Recalculate everything after loading
        for (const row of this.subjectsContainer.rows) {
            this.calculateGWA(parseInt(row.id.split('-')[1]));
        }
        this._updateMoveButtonStates();
    }

    _saveSettingsToStorage() {
        localStorage.setItem('wolfGradeSettings', JSON.stringify(this.settings));
    }

    _applyTheme() {
        document.body.classList.toggle('dark-theme', this.settings.theme === 'dark');
        if(this.themeIconSun) {
            this.themeIconSun.style.display = this.settings.theme === 'dark' ? 'block' : 'none';
        }
        if(this.themeIconMoon) {
            this.themeIconMoon.style.display = this.settings.theme === 'light' ? 'block' : 'none';
        }
    }

    toggleTheme() {
        this.settings.theme = this.settings.theme === 'light' ? 'dark' : 'light';
        this._applyTheme();
        this._saveSettingsToStorage();
    }

    _saveDataToStorage() {
        const subjects = [];
        for (const row of this.subjectsContainer.rows) {
            const getVal = (selector) => row.querySelector(selector).value;
            subjects.push({
                name: getVal('input[type="text"]'),
                prelim: getVal('.prelim'),
                midterm: getVal('.midterm'),
                prefinals: getVal('.prefinals'),
                finals: getVal('.finals'),
            });
        }
        localStorage.setItem('wolfGradeData', JSON.stringify(subjects));
    }

    addSubject(data = null) {
        if (this.subjectsContainer.children.length >= this.settings.maxSubjects) {
            Swal.fire('Limit Reached', `You can only add up to ${this.settings.maxSubjects} subjects. You can change this in Settings.`, 'warning');
            return;
        }

        this.subjectCount++;
        const row = this.subjectsContainer.insertRow();
        row.id = `subject-${this.subjectCount}`;

        const createCell = (label) => {
            const cell = row.insertCell();
            cell.dataset.label = label;
            return cell;
        };

        const createWrapper = () => {
            const wrapper = document.createElement('div');
            wrapper.className = 'grade-input-wrapper';
            return wrapper;
        };

        // 1. Subject Name Cell
        const subjectCell = createCell('Subject');
        const subjectWrapper = createWrapper();
        const subjectInput = document.createElement('input');
        subjectInput.type = 'text';
        subjectInput.className = 'grade-input';
        subjectInput.placeholder = 'Subject Name';
        subjectInput.value = data ? data.name : `Subject ${this.subjectCount}`;
        subjectWrapper.appendChild(subjectInput);
        subjectCell.appendChild(subjectWrapper);

        // 2. Input Cells (Prelim, Midterm, etc.)
        const createInputCell = (term, label) => {
            const cell = createCell(label);
            const wrapper = createWrapper();
            const input = document.createElement('input');
            input.type = 'number';
            input.className = `grade-input ${term}`;
            input.dataset.field = `${term}-${this.subjectCount}`;
            input.placeholder = '-';
            input.min = '0';
            input.max = '100';
            input.step = '0.01';
            input.value = data ? data[term] : '';
            wrapper.appendChild(input);

            if (this.settings.componentBreakdown) {
                const btn = document.createElement('button');
                btn.className = 'calc-btn';
                btn.dataset.subject = this.subjectCount;
                btn.dataset.term = term;
                btn.title = 'Calculate from components';
                btn.innerHTML = `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 7V4a2 2 0 0 1 2-2h8.5L20 7.5V20a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2v-3"/><polyline points="14 2 14 8 20 8"/><path d="M8 16.5h2M12 16.5h2M10 14v5M16 14h-3v5h3a2 2 0 0 0 2-2v-1a2 2 0 0 0-2-2Z"/></svg>`;
                wrapper.appendChild(btn);
            }
            cell.appendChild(wrapper);
        };

        createInputCell('prelim', 'Prelim');
        createInputCell('midterm', 'Midterm');
        createInputCell('prefinals', 'Pre-Finals');
        createInputCell('finals', 'Finals');

        // 3. Result Cells (GWA, Needed)
        const createResultCell = (id, label) => {
            const cell = createCell(label);
            const wrapper = createWrapper();
            const box = document.createElement('div');
            box.className = 'result-box';
            box.id = id;
            box.textContent = '-';
            wrapper.appendChild(box);
            cell.appendChild(wrapper);
            return cell;
        };

        createResultCell(`gwa-${this.subjectCount}`, 'GWA');
        const neededCell = createResultCell(`need-${this.subjectCount}`, 'Needed');
        neededCell.id = `needed-cell-${this.subjectCount}`;
        neededCell.style.display = this.settings.requirementEnabled ? '' : 'none';

        // 4. Actions Cell
        const actionsCell = createCell('Actions');
        const actionsWrapper = createWrapper();
        
        const upBtn = document.createElement('button');
        upBtn.className = 'move-btn move-up-btn';
        upBtn.title = 'Move Up';
        upBtn.innerHTML = `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><polyline points="18 15 12 9 6 15"></polyline></svg>`;
        
        const downBtn = document.createElement('button');
        downBtn.className = 'move-btn move-down-btn';
        downBtn.title = 'Move Down';
        downBtn.innerHTML = `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><polyline points="6 9 12 15 18 9"></polyline></svg>`;

        const deleteBtn = document.createElement('button');
        deleteBtn.className = 'delete-btn';
        deleteBtn.title = 'Delete Subject';
        deleteBtn.innerHTML = `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path><line x1="10" y1="11" x2="10" y2="17"></line><line x1="14" y1="11" x2="14" y2="17"></line></svg>`;
        
        actionsWrapper.appendChild(upBtn);
        actionsWrapper.appendChild(downBtn);
        actionsWrapper.appendChild(deleteBtn);
        actionsCell.appendChild(actionsWrapper);

        if (!data) this._saveDataToStorage(); // Save immediately when a new blank subject is added
        this._updateMoveButtonStates();
    }

    _moveSubjectUp(row) {
        const prevRow = row.previousElementSibling;
        if (prevRow) {
            this.subjectsContainer.insertBefore(row, prevRow);
            this._saveDataToStorage();
            this._updateMoveButtonStates();
        }
    }

    _moveSubjectDown(row) {
        const nextRow = row.nextElementSibling;
        if (nextRow) {
            this.subjectsContainer.insertBefore(nextRow, row);
            this._saveDataToStorage();
            this._updateMoveButtonStates();
        }
    }

    _updateMoveButtonStates() {
        const rows = this.subjectsContainer.rows;
        if (rows.length <= 1) {
            if (rows[0]) {
                rows[0].querySelector('.move-up-btn').disabled = true;
                rows[0].querySelector('.move-down-btn').disabled = true;
            }
            return;
        }

        for (let i = 0; i < rows.length; i++) {
            rows[i].querySelector('.move-up-btn').disabled = (i === 0);
            rows[i].querySelector('.move-down-btn').disabled = (i === rows.length - 1);
        }
    }

    deleteSubject(id) {
        if (this.subjectsContainer.rows.length <= 1) {
            Swal.fire('Cannot Delete', 'Cannot delete the last subject.', 'error');
            return;
        }
        
        Swal.fire({
            title: 'Delete Subject?', text: "This action cannot be undone.", icon: 'warning',
            showCancelButton: true, confirmButtonColor: '#ef4444', cancelButtonColor: '#6c757d', confirmButtonText: 'Yes, delete it!'
        }).then((result) => {
            if (result.isConfirmed) {
                document.getElementById(`subject-${id}`)?.remove();
                this.calculateOverallGWA();
                this._updateMoveButtonStates();
                this._saveDataToStorage();
                Swal.fire('Deleted!', 'Subject has been removed.', 'success');
            }
        });
    }

    deleteAllSubjects() {
        Swal.fire({
            title: 'Delete All Subjects?',
            text: "This will remove all subjects from the table. This action cannot be undone.",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#ef4444',
            cancelButtonColor: '#6c757d',
            confirmButtonText: 'Yes, delete all!'
        }).then((result) => {
            if (result.isConfirmed) {
                while (this.subjectsContainer.firstChild) {
                    this.subjectsContainer.removeChild(this.subjectsContainer.firstChild);
                }
                this.addSubject(); // Add one fresh subject back
                this.calculateOverallGWA();
                this._updateMoveButtonStates();
                this._saveDataToStorage();
                Swal.fire('Deleted!', 'All subjects have been removed.', 'success');
            }
        });
    }

    clearAllGrades() {
        Swal.fire({
            title: 'Clear All Grades?', text: "This will remove all grade inputs but keep your subjects.", icon: 'warning',
            showCancelButton: true, confirmButtonColor: '#ef4444', cancelButtonColor: '#6c757d', confirmButtonText: 'Yes, clear them!'
        }).then((result) => {
            if (result.isConfirmed) {
                for (const row of this.subjectsContainer.rows) {
                    row.querySelectorAll('.grade-input[type="number"]').forEach(input => {
                        input.value = '';
                    });
                    const id = parseInt(row.id.split('-')[1]);
                    if(id) this.calculateGWA(id);
                }
                this._saveDataToStorage();
                Swal.fire('Cleared!', 'All grades have been removed.', 'success');
            }
        });
    }
    
    calculateGWA(id, skipPrediction = false) {
        const row = document.getElementById(`subject-${id}`);
        if (!row) return;

        const getVal = (selector) => parseFloat(row.querySelector(selector).value) || 0;
        const grades = { prelim: getVal('.prelim'), midterm: getVal('.midterm'), prefinals: getVal('.prefinals'), finals: getVal('.finals') };
        
        const w = this.settings.weights;
        const gwa = (grades.prelim * w.prelim / 100) + (grades.midterm * w.midterm / 100) + (grades.prefinals * w.prefinals / 100) + (grades.finals * w.finals / 100);

        const gwaBox = row.querySelector(`#gwa-${id}`);
        gwaBox.textContent = gwa > 0 ? gwa.toFixed(2) : '-';
        gwaBox.className = 'result-box';
        if (gwa > 0) gwaBox.classList.add(gwa >= this.settings.passingGrade ? 'passed' : 'failed');
        
        Object.keys(grades).forEach(key => { // NOSONAR
            const el = row.querySelector(`.${key}`);
            el.classList.toggle('below-pass', el.value !== '' && parseFloat(el.value) < this.settings.passingGrade);
        });

        if (!skipPrediction) this.computeNeededToPass(id);
        this.calculateOverallGWA();
    }
    
    calculateOverallGWA() {
        let totalGWA = 0;
        let count = 0;

        for (const row of this.subjectsContainer.rows) {
            const gwa = parseFloat(row.querySelector('.result-box').textContent);
            if (!isNaN(gwa) && gwa > 0) {
                totalGWA += gwa;
                count++;
            }
        }

        const overallGWA = count > 0 ? totalGWA / count : 0;
        this.overallGwaDisplay.textContent = overallGWA.toFixed(2);
        
        const isPassed = overallGWA >= this.settings.passingGrade;
        if (count === 0) {
            this.statusDisplay.textContent = 'Enter Grades';
            this.statusDisplay.className = 'status';
            this.motivationalText.textContent = 'Start by entering some grades!';
            this.memeContainer.innerHTML = '';
        } else {
            this.statusDisplay.textContent = isPassed ? 'Passed' : 'Failed';
            this.statusDisplay.className = `status ${isPassed ? 'passed' : 'failed'}`;
            this.motivationalText.textContent = this._getRandomItem(isPassed ? this.passedMessages : this.failedMessages);
            this._showMeme(isPassed);
        }
    }
    
     _showMeme(isPassed) {
        this.memeContainer.innerHTML = '';
        const memeImg = document.createElement('img');
        memeImg.src = this._getRandomItem(isPassed ? this.passedMemes : this.failedMemes);
        memeImg.alt = isPassed ? 'Passed Meme' : 'Failed Meme';
        memeImg.onerror = () => { memeImg.style.display = 'none'; };
        this.memeContainer.appendChild(memeImg);
    }
    
    _getRandomItem(arr) {
        return arr[Math.floor(Math.random() * arr.length)];
    }

    printReport() {
        const subjectRows = this.subjectsContainer.querySelectorAll('tr');
        if (subjectRows.length === 0) {
            Swal.fire('Cannot Print', 'Please add at least one subject.', 'warning');
            return;
        }

        for (const row of subjectRows) {
            const gradeInputs = row.querySelectorAll('.grade-input[type="number"]');
            for (const input of gradeInputs) {
                if (input.value.trim() === '') {
                    Swal.fire('Incomplete Data', 'Please fill in all grade fields for every subject before printing.', 'warning');
                    return;
                }
            }
        }

        const isFailed = this.statusDisplay.classList.contains('failed');
        const memeImg = this.memeContainer.querySelector('img');
        const memeSrc = memeImg ? memeImg.src : '';

        if (isFailed) {
            Swal.fire({
                title: 'Are you sure about this?',
                html: `Printing this report might feel... a little awkward. You sure you want to proceed?`,
                imageUrl: memeSrc,
                imageWidth: 250,
                imageAlt: 'Failed Meme',
                icon: 'warning',
                showCancelButton: true,
                confirmButtonColor: '#ef4444',
                confirmButtonText: 'Yes, print the evidence!',
                cancelButtonText: 'On second thought...'
            }).then((result) => {
                if (result.isConfirmed) {
                    this._promptForNameAndPrint();
                }
            });
        } else {
            this._promptForNameAndPrint();
        }
    }

    _promptForNameAndPrint() {
         Swal.fire({
             title: 'Enter Student Name',
             input: 'text',
             inputPlaceholder: 'e.g., Juan Dela Cruz (Optional)',
             html: `<p style="font-size: 0.85em; color: #6c757d; margin-top: 10px;">This name is for display on the report only and is <strong>not</strong> saved anywhere.</p>`,
             showCancelButton: true,
             confirmButtonText: 'Generate Report',
             allowOutsideClick: false
         }).then((result) => {
             if (result.isConfirmed) {
                 const studentName = result.value || 'Wolf';
                 const motivationalMessage = this.motivationalText.textContent;
                 this._generateAndPrintReport(studentName, motivationalMessage);
             }
         });
    }
    
    _generateAndPrintReport(studentName, motivationalMessage) {
         const subjectRows = this.subjectsContainer.querySelectorAll('tr');
         const printWindow = window.open('', '_blank');
         let tableRows = '';
         subjectRows.forEach(row => {
             const subjectName = row.querySelector('input[type="text"]').value || 'Unnamed Subject';
             const prelim = row.querySelector('.prelim').value;
             const midterm = row.querySelector('.midterm').value;
             const prefinals = row.querySelector('.prefinals').value;
             const finals = row.querySelector('.finals').value;
             const gwaBox = row.querySelector('.result-box');
             const gwa = gwaBox.textContent;
             const statusClass = gwaBox.classList.contains('passed') ? 'passed' : 'failed';
             const statusText = gwaBox.classList.contains('passed') ? 'Passed' : 'Failed';
 
             tableRows += `
                 <tr>
                     <td>${subjectName}</td>
                     <td>${prelim}</td>
                     <td>${midterm}</td>
                     <td>${prefinals}</td>
                     <td>${finals}</td>
                     <td class="${statusClass}">${gwa}</td>
                     <td class="${statusClass}">${statusText}</td>
                 </tr>
             `;
         });
 
         const overallGWA = this.overallGwaDisplay.textContent;
         const overallStatus = this.statusDisplay.textContent;
         const overallStatusClass = this.statusDisplay.classList.contains('passed') ? 'passed' : 'failed';
 
         let settingsSummaryHTML = `
             <div class="settings-summary">
                 <h3>Calculation Settings Used</h3>
                 <div class="settings-grid">
                     <div><strong>Passing Grade:</strong> ${this.settings.passingGrade.toFixed(2)}</div>
                     <div><strong>Prelim Weight:</strong> ${this.settings.weights.prelim}%</div>
                     <div><strong>Midterm Weight:</strong> ${this.settings.weights.midterm}%</div>
                     <div><strong>Pre-Finals Weight:</strong> ${this.settings.weights.prefinals}%</div>
                     <div><strong>Finals Weight:</strong> ${this.settings.weights.finals}%</div>
                 </div>
         `;
 
         if (this.settings.componentBreakdown) {
             settingsSummaryHTML += `
                 <div class="settings-grid component-weights"><div><strong>Performance:</strong> ${this.settings.componentWeights.performance}%</div><div><strong>Activities:</strong> ${this.settings.componentWeights.activities}%</div><div><strong>Exam:</strong> ${this.settings.componentWeights.exam}%</div></div>`;
         }
         settingsSummaryHTML += `</div>`;
 
         const printDate = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
 
         const htmlContent = `
             <!DOCTYPE html>
             <html>
             <head>
                 <title>Grade Report</title>
                 <style>
                     body { 
                         font-family: 'Segoe UI', 'Roboto', 'Helvetica Neue', Arial, sans-serif;
                         margin: 0; 
                         padding: 15px; 
                         background-color: #fff;
                         -webkit-print-color-adjust: exact;
                         color-adjust: exact;
                         user-select: none; -webkit-user-select: none; -moz-user-select: none;
                     }
                     .watermark {
                         position: fixed; top: 50%; left: 50%; transform: translate(-50%, -50%) rotate(-45deg);
                         font-size: 4.5em; color: rgba(0, 0, 0, 0.04); font-weight: bold; pointer-events: none; z-index: 5; white-space: nowrap;
                     }
                     .report-card { max-width: 800px; margin: 0 auto; padding: 25px; background-color: transparent; position: relative; z-index: 1; }
                     .header { display: flex; justify-content: space-between; align-items: flex-start; border-bottom: 2px solid #000; padding-bottom: 15px; margin-bottom: 20px; }
                     .header .brand { display: flex; align-items: center; gap: 15px; }
                     .header .brand img { width: 40px; height: 40px; }
                     .header .brand h1 { font-size: 1.8em; margin: 0; color: #000; font-weight: 700; }
                     .header .info { text-align: right; font-size: 0.9em; color: #444; line-height: 1.5; }
                     table { width: 100%; border-collapse: collapse; margin: 20px 0; }
                     th, td { padding: 8px 10px; text-align: center; border-bottom: 1px solid #e0e0e0; font-size: 0.9em; }
                     th { background-color: transparent; color: #666; text-transform: uppercase; font-size: 0.75em; letter-spacing: 1px; border-bottom: 2px solid #000; }
                     td:first-child { text-align: left; }
                     .summary { display: grid; grid-template-columns: 1fr 1fr; gap: 15px; margin-top: 20px; padding: 15px; background-color: #f8f9fa; border: 1px solid #e0e0e0; border-radius: 8px; }
                     .summary-item { text-align: center; }
                     .summary-item h2 { margin: 0 0 10px 0; font-size: 0.9em; color: #333; text-transform: uppercase; letter-spacing: 0.5px; font-weight: 600; }
                     .summary-item span { font-size: 1.8em; font-weight: 700; }
                     .passed { color: #10b981; font-weight: bold; }
                     .failed { color: #ef4444; font-weight: bold; }
                     .settings-summary { margin-top: 20px; padding: 15px; border: 1px solid #eee; border-radius: 8px; font-size: 0.8em; color: #555; background-color: #fdfdfd; }
                     .settings-summary h3 { margin-top: 0; margin-bottom: 15px; text-align: center; font-size: 1em; color: #333; text-transform: uppercase; letter-spacing: 0.5px; }
                     .settings-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 10px; }
                     .settings-grid.component-weights { margin-top: 10px; padding-top: 10px; border-top: 1px solid #eee; }
                     .footer { text-align: center; margin-top: 30px; font-size: 0.75em; color: #999; }
                     .motivational-quote { font-style: italic; color: #555; margin-bottom: 20px; font-size: 0.9em; }
                     .signature-line { margin-top: 40px; border-top: 1px solid #555; padding-top: 8px; display: inline-block; color: #000; font-weight: bold; letter-spacing: 1px; }
                     .disclaimer { margin-top: 20px; }
                 </style>
                 <script>
                     document.addEventListener('contextmenu', event => event.preventDefault());
                     document.addEventListener('keydown', function(e) {
                         if (e.key === 'F12' || (e.ctrlKey && e.shiftKey && (e.key === 'I' || e.key === 'J' || e.key === 'C')) || (e.metaKey && e.altKey && (e.key === 'I' || e.key === 'J'))) {
                             e.preventDefault();
                         }
                     });
                 <\/script>
             </head>
             <body>
                 <div class="watermark">wolfprojects.netlify.app</div>
                 <div class="report-card">
                     <div class="header">
                         <div class="brand">
                             <img src="../assets/logo.png" alt="Logo">
                             <h1>Grade Report</h1>
                         </div>
                         <div class="info">
                             <div><strong>Student:</strong> ${studentName}</div>
                             <div><strong>Date:</strong> ${printDate}</div>
                         </div>
                     </div>
                     <table>
                         <thead>
                             <tr>
                                 <th>Subject</th><th>Prelim</th><th>Midterm</th><th>Pre-Finals</th><th>Finals</th><th>GWA</th><th>Status</th>
                             </tr>
                         </thead>
                         <tbody>${tableRows}</tbody>
                     </table>
                     <div class="summary">
                         <div class="summary-item">
                             <h2>Overall GWA</h2>
                             <span>${overallGWA}</span>
                         </div>
                         <div class="summary-item">
                             <h2>Final Status</h2>
                             <span class="${overallStatusClass}">${overallStatus}</span>
                         </div>
                     </div>
                     ${settingsSummaryHTML}
                     <div class="footer">
                         <p class="motivational-quote">"${motivationalMessage}"</p>
                         <div class="signature-line">
                             WOLF
                         </div>
                         <p class="disclaimer"><strong>Notice:</strong> This is a computer-generated document from the Wolf's Grade Calculator. It is not an official transcript. The accuracy of this report depends entirely on the data entered by the user. Do not use for official purposes.</p>
                     </div>
                 </div>
             </body>
             </html>
         `;
 
         printWindow.document.write(htmlContent);
         printWindow.document.close();
         printWindow.focus();
         printWindow.print();
    }

    importFromCSV() {
        const fileInput = document.createElement('input');
        fileInput.type = 'file';
        fileInput.accept = '.csv, text/csv';

        fileInput.onchange = e => {
            const file = e.target.files[0];
            if (!file) return;

            const reader = new FileReader();
            reader.onload = (event) => {
                try {
                    this._parseAndLoadCSV(event.target.result);
                } catch (error) {
                    Swal.fire('Import Error', error.message, 'error');
                }
            };
            reader.readAsText(file);
        };

        fileInput.click();
    }

    _parseAndLoadCSV(csvText) {
        const lines = csvText.trim().split(/\r?\n/);
        if (lines.length < 2) throw new Error('CSV file is empty or has no data rows.');

        const headers = lines[0].split(',').map(h => h.trim());
        const expectedHeaders = ['Subject Name', 'Prelim', 'Midterm', 'Pre-Finals', 'Finals'];
        if (headers.length < expectedHeaders.length || !expectedHeaders.every((h, i) => headers[i] === h)) {
            throw new Error('Invalid CSV format. Please ensure the headers are: ' + expectedHeaders.join(', '));
        }

        const subjects = lines.slice(1).map(line => {
            // This simple split won't handle commas inside quoted fields, but is fine for this app's export format.
            const values = line.split(',');
            return {
                name: values[0].replace(/"/g, ''),
                prelim: values[1],
                midterm: values[2],
                prefinals: values[3],
                finals: values[4],
            };
        });

        if (subjects.length > this.settings.maxSubjects) {
            throw new Error(`The CSV file contains ${subjects.length} subjects, which exceeds the maximum limit of ${this.settings.maxSubjects}. Please adjust the limit in Settings.`);
        }

        // Clear current table and load new data
        this.subjectsContainer.innerHTML = '';
        this.subjectCount = 0;
        subjects.forEach(subjectData => this.addSubject(subjectData));

        // Recalculate all grades
        for (const row of this.subjectsContainer.rows) {
            this.calculateGWA(parseInt(row.id.split('-')[1]));
        }

        this._saveDataToStorage(); // Persist the newly imported data

        Swal.fire('Import Successful', `${subjects.length} subjects have been loaded.`, 'success');
    }

    exportToCSV() {
        const subjectRows = this.subjectsContainer.querySelectorAll('tr');
        if (subjectRows.length === 0) {
            Swal.fire('No Data', 'There is nothing to export.', 'info');
            return;
        }

        const headers = ['Subject Name', 'Prelim', 'Midterm', 'Pre-Finals', 'Finals', 'GWA'];
        const rows = [headers.join(',')];

        subjectRows.forEach(row => {
            const subjectName = `"${(row.querySelector('input[type="text"]').value || 'Unnamed Subject').replace(/"/g, '""')}"`;
            const prelim = row.querySelector('.prelim').value || '0';
            const midterm = row.querySelector('.midterm').value || '0';
            const prefinals = row.querySelector('.prefinals').value || '0';
            const finals = row.querySelector('.finals').value || '0';
            const gwa = row.querySelector('.result-box').textContent || '0';

            rows.push([subjectName, prelim, midterm, prefinals, finals, gwa].join(','));
        });

        const csvContent = rows.join('\n');
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');

        link.setAttribute('href', url);
        const date = new Date().toISOString().slice(0, 10);
        link.setAttribute('download', `wolf_grades_${date}.csv`);
        link.style.visibility = 'hidden';

        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        Swal.fire({
            icon: 'success',
            title: 'Export Successful!',
            text: 'Your grades have been exported as a CSV file.',
            timer: 2000,
            showConfirmButton: false
        });
    }

    validateGrade(input) {
        let value = parseFloat(input.value);
        if (value > 100) input.value = 100;
        if (value < 0) input.value = 0;
    }

    toggleDropdown(type) {
        const clickedButton = document.querySelector(`.dropdown-btn[data-dropdown="${type}"]`);
        if (!clickedButton) return;
    
        const wasActive = clickedButton.classList.contains('active');
    
        // Close all dropdowns
        this.dropdowns.forEach(button => button.classList.remove('active'));
    
        // If the clicked dropdown was not active, open it
        if (!wasActive) {
            clickedButton.classList.add('active');
        }
    }

    openSettings() {
        this.wPrelim.value = this.settings.weights.prelim;
        this.wMidterm.value = this.settings.weights.midterm;
        this.wPrefinals.value = this.settings.weights.prefinals;
        this.wFinals.value = this.settings.weights.finals;
        this.passingGradeInput.value = this.settings.passingGrade.toFixed(2);
        this.requirementToggle.checked = this.settings.requirementEnabled;
        this.maxSubjectsInput.value = this.settings.maxSubjects;
        this.componentToggle.checked = this.settings.componentBreakdown;
        this.wPerformance.value = this.settings.componentWeights.performance;
        this.wActivities.value = this.settings.componentWeights.activities;
        this.wExam.value = this.settings.componentWeights.exam;
        this.componentWeightsContainer.style.display = this.settings.componentBreakdown ? 'block' : 'none';

        this.settingsOverlay.classList.add('open');
        this.settingsDrawer.classList.add('open');
        this.settingsDirty = false; // Reset dirty flag on open
    }

    closeSettings() {
        if (this.settingsDirty) {
            Swal.fire({
                title: 'Discard Changes?',
                text: "You have unsaved changes. Are you sure you want to discard them?",
                icon: 'warning',
                showCancelButton: true,
                confirmButtonColor: '#ef4444',
                confirmButtonText: 'Yes, Discard',
                cancelButtonText: 'No, Keep Editing'
            }).then((result) => {
                if (result.isConfirmed) {
                    this._forceCloseSettings();
                }
            });
        } else {
            this._forceCloseSettings();
        }
    }

    _forceCloseSettings() {
        this.settingsOverlay.classList.remove('open');
        this.settingsDrawer.classList.remove('open');
    }

    saveSettings() {
        const p = parseFloat(this.wPrelim.value) || 0;
        const m = parseFloat(this.wMidterm.value) || 0;
        const pf = parseFloat(this.wPrefinals.value) || 0;
        const f = parseFloat(this.wFinals.value) || 0;
        if (p + m + pf + f !== 100) {
            Swal.fire('Invalid Weights', `Weights must sum to 100.`, 'error');
            return;
        }

        const maxSubjects = parseInt(this.maxSubjectsInput.value);
        if (isNaN(maxSubjects) || maxSubjects < 1 || maxSubjects > 49) {
            Swal.fire('Invalid Input', 'Maximum subjects must be a number between 1 and 49.', 'error');
            return;
        }

        this.settings.weights = { prelim: p, midterm: m, prefinals: pf, finals: f };
        this.settings.passingGrade = parseFloat(this.passingGradeInput.value) || 59.5;
        this.settings.requirementEnabled = this.requirementToggle.checked;
        this.settings.maxSubjects = maxSubjects;
        this.settings.componentBreakdown = this.componentToggle.checked;
        
        if (this.settings.componentBreakdown) {
             const perf = parseFloat(this.wPerformance.value) || 0;
             const act = parseFloat(this.wActivities.value) || 0;
             const exam = parseFloat(this.wExam.value) || 0;
             if (perf + act + exam !== 100) {
                 Swal.fire('Invalid Component Weights', 'Component weights must sum to 100.', 'error');
                 return;
             }
             this.settings.componentWeights = { performance: perf, activities: act, exam: exam };
        }

        this._saveSettingsToStorage();
        this._updateLabels();
        this._updateNeededHeader();
        this._updateAllSubjectsUI();
        
        Swal.fire({
            title: 'Settings Saved',
            text: 'Your preferences have been updated.',
            icon: 'success',
            timer: 1500,
            showConfirmButton: false
        }).then(() => {
            this.settingsDirty = false; // Mark as clean before closing
            this._forceCloseSettings();
        });
    }
    
     _updateAllSubjectsUI() {
        for (const row of this.subjectsContainer.rows) {
            const id = parseInt(row.id.split('-')[1]);
            // Only target wrappers that are known to contain a grade input.
            const wrappers = row.querySelectorAll('td:nth-child(n+2):nth-child(-n+5) .grade-input-wrapper');
            wrappers.forEach(wrapper => {
                wrapper.querySelector('.calc-btn')?.remove();
                const input = wrapper.querySelector('input');
                const term = Array.from(input.classList).find(c => ['prelim', 'midterm', 'prefinals', 'finals'].includes(c));

                if (this.settings.componentBreakdown && term) {
                    const newBtnHTML = `<button class="calc-btn" data-subject="${id}" data-term="${term}" title="Calculate from components"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 7V4a2 2 0 0 1 2-2h8.5L20 7.5V20a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2v-3"/><polyline points="14 2 14 8 20 8"/><path d="M8 16.5h2M12 16.5h2M10 14v5M16 14h-3v5h3a2 2 0 0 0 2-2v-1a2 2 0 0 0-2-2Z"/></svg></button>`;
                    wrapper.insertAdjacentHTML('beforeend', newBtnHTML);
                }
            });
            this.calculateGWA(id);
        }
    }


    _updateLabels() {
        document.getElementById('label-prelim').textContent = `${this.settings.weights.prelim}%`;
        document.getElementById('label-midterm').textContent = `${this.settings.weights.midterm}%`;
        document.getElementById('label-prefinals').textContent = `${this.settings.weights.prefinals}%`;
        document.getElementById('label-finals').textContent = `${this.settings.weights.finals}%`;
        document.getElementById('weights-info').innerHTML = `Prelim (${this.settings.weights.prelim}%), Midterm (${this.settings.weights.midterm}%), Pre-Finals (${this.settings.weights.prefinals}%), Finals (${this.settings.weights.finals}%)`;
        document.getElementById('passing-info').innerHTML = `${this.settings.passingGrade.toFixed(2)} and above`;
    }

    _updateNeededHeader() {
        const display = this.settings.requirementEnabled ? '' : 'none';
        this.neededHeader.style.display = display;
        for (const row of this.subjectsContainer.rows) {
            const neededCell = row.querySelector(`#needed-cell-${row.id.split('-')[1]}`);
            if (neededCell) neededCell.style.display = display;
        }
    }
    
    handleManualEdit(input, id) {
        const fieldKey = input.dataset.field;
        if (input.classList.contains('required') && input.value !== '') {
            this.manuallyEdited[fieldKey] = true;
            input.classList.remove('required');
        }
    }

    computeNeededToPass(id) {
        const row = document.getElementById(`subject-${id}`); // NOSONAR
        const needBox = document.getElementById(`need-${id}`);
        if (!row || !needBox) return;
        
        let sum = 0;
        let remainingWeight = 0;
        
        ['prelim', 'midterm', 'prefinals', 'finals'].forEach(term => {
            const input = row.querySelector(`.${term}`);
            const weight = this.settings.weights[term] / 100;
            if (input.value === '') {
                remainingWeight += weight;
            } else {
                sum += parseFloat(input.value) * weight;
            }
        });
        
        if (remainingWeight > 0) {
            const neededValue = (this.settings.passingGrade - sum) / remainingWeight;
            const clamped = Math.max(0, Math.min(100, neededValue));
            needBox.textContent = isFinite(clamped) ? clamped.toFixed(2) : '-';

            if (this.settings.requirementEnabled) {
                ['prelim', 'midterm', 'prefinals', 'finals'].forEach(term => {
                    const input = row.querySelector(`.${term}`);
                    if (input.value === '' && !this.manuallyEdited[input.dataset.field]) {
                        input.value = clamped.toFixed(2);
                        input.classList.add('required');
                    }
                });
                this.calculateGWA(id, true); // Recalculate GWA without re-triggering prediction
            }
        } else {
             needBox.textContent = '-';
        }
    }
    
     openComponentDrawer(subjectId, term) {
        this.currentComponentSubject = subjectId;
        this.currentComponentTerm = term;

        // Reset fields
        this.performanceTasksContainer.innerHTML = '';
        this.activitiesContainer.innerHTML = '';
        this.examContainer.innerHTML = '';
        this.componentCalculatedGrade.textContent = '-';

        // Set title
        const subjectRow = document.getElementById(`subject-${subjectId}`);
        const subjectNameInput = subjectRow.querySelector('input[type="text"]');
        const subjectName = subjectNameInput.value || `Subject ${subjectId}`;
        this.componentDrawerTitle.textContent = `Calculate ${term.charAt(0).toUpperCase() + term.slice(1)} Grade for ${subjectName}`;

        // Set weight labels
        this.compPerfWeight.textContent = `${this.settings.componentWeights.performance}%`;
        this.compActWeight.textContent = `${this.settings.componentWeights.activities}%`;
        this.compExamWeight.textContent = `${this.settings.componentWeights.exam}%`;

        // Show drawer
        this.componentOverlay.classList.add('open');
        this.componentDrawer.classList.add('open');
     }

    closeComponentDrawer() {
       this.componentOverlay.classList.remove('open');
       this.componentDrawer.classList.remove('open');
    }

    addComponentField(type) {
        const containerMap = {
            performance: this.performanceTasksContainer,
            activities: this.activitiesContainer,
            exam: this.examContainer,
        };
        const container = containerMap[type];
        if (!container) return;

        const fieldId = `${type}-${Date.now()}`;
        const fieldHTML = `
            <div class="component-field-row" id="${fieldId}">
                <input type="number" class="component-score" placeholder="Score" min="0">
                <span class="divider"> / </span>
                <input type="number" class="component-total" placeholder="Items" min="1">
                <span class="divider"> = </span>
                <span class="component-row-total">-</span>
                <button class="remove-component-btn" data-field-id="${fieldId}" data-type="${type}" title="Remove">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                </button>
            </div>
        `;
        container.insertAdjacentHTML('beforeend', fieldHTML);
    }

    removeComponentField(fieldId) {
        const field = document.getElementById(fieldId);
        if (field) {
            field.remove();
        }
    }

    _calculateComponentRowTotal(row) {
        if (!row) return;
        const scoreInput = row.querySelector('.component-score');
        const totalInput = row.querySelector('.component-total');
        const totalDisplay = row.querySelector('.component-row-total');

        const score = parseFloat(scoreInput.value) || 0;
        const total = parseFloat(totalInput.value) || 0;

        totalDisplay.textContent = (total > 0) ? `${((score / total) * 100).toFixed(2)}%` : '-';
    }

    calculateComponentGrade() {
        const w = this.settings.componentWeights;

        const calculateSubGrade = (container) => {
            const rows = container.querySelectorAll('.component-field-row');
            let totalScore = 0;
            let totalItems = 0;

            rows.forEach(row => {
                const score = parseFloat(row.querySelector('.component-score').value) || 0;
                const items = parseFloat(row.querySelector('.component-total').value) || 0;
                if (items > 0) {
                    totalScore += score;
                    totalItems += items;
                }
            });

            if (totalItems === 0) return 0;
            return (totalScore / totalItems) * 100;
        };

        const perfGrade = calculateSubGrade(this.performanceTasksContainer);
        const actGrade = calculateSubGrade(this.activitiesContainer);
        const examGrade = calculateSubGrade(this.examContainer);

        const finalGrade = (perfGrade * w.performance / 100) +
                           (actGrade * w.activities / 100) +
                           (examGrade * w.exam / 100);

        if (isNaN(finalGrade) || finalGrade === 0) {
            this.componentCalculatedGrade.textContent = '-';
        } else {
            this.componentCalculatedGrade.textContent = finalGrade.toFixed(2);
        }
    }

    applyComponentGrade() {
        try {
            const gradeText = this.componentCalculatedGrade.textContent;
            const calculatedGrade = (gradeText === '-') ? 0 : parseFloat(gradeText);

            if (isNaN(calculatedGrade) || !this.currentComponentSubject || !this.currentComponentTerm) {
                throw new Error('No valid grade has been calculated. Please add scores and items.');
            }

            const subjectRow = document.getElementById(`subject-${this.currentComponentSubject}`);
            if (!subjectRow) throw new Error("Could not find the subject row to apply the grade to.");

            const targetInput = subjectRow.querySelector(`.${this.currentComponentTerm}`);
            if (!targetInput) throw new Error("Could not find the grade input field for the selected term.");

            // Set the value and mark it as manually edited
            targetInput.value = calculatedGrade.toFixed(2);
            const fieldKey = targetInput.dataset.field;
            this.manuallyEdited[fieldKey] = true;
            targetInput.classList.remove('required');

            // Trigger a recalculation for the row
            this.calculateGWA(this.currentComponentSubject, true);

        } catch (error) {
            Swal.fire('Application Error', error.message, 'error');
            return; // Stop execution if there was an error
        }

        this.closeComponentDrawer();
        Swal.fire({
            icon: 'success',
            title: 'Grade Applied!',
            toast: true,
            position: 'top-end',
            timer: 2000,
            showConfirmButton: false
        });
    }

    _checkVersionAndShowChangelog() {
        const lastSeenVersion = localStorage.getItem('lastSeenVersion');
        if (lastSeenVersion !== this.appVersion) {
            this.showChangelog(false); // Don't force show, just show if new
        }
    }

    showChangelog(forceShow) {
        const generateVersionHTML = (version) => {
            const changes = this.changelogData[version] || [];
            const listItems = changes.map(change => `<li style="margin-bottom: 10px;">- ${change}</li>`).join('');
            return `<h3 style="font-size: 1.2em; color: var(--accent-color); margin-bottom: 10px;">🚀 What's New in v${version}</h3><ul style="list-style-type: none; padding-left: 0;">${listItems}</ul>`;
        };

        const versionOptions = Object.keys(this.changelogData).map(v => `<option value="${v}" ${v === this.appVersion ? 'selected' : ''}>Version ${v}</option>`).join('');

        const showModal = () => {
            Swal.fire({
                title: 'Application Updates',
                html: `
                    <div style="text-align: left; max-height: 400px; overflow-y: auto; padding-right: 15px;">
                        <div style="margin-bottom: 15px;">
                            <label for="version-selector" style="font-weight: 600; font-size: 0.9em;">View changes for:</label>
                            <select id="version-selector" style="width: 100%; padding: 8px; margin-top: 5px; border-radius: 6px; border: 1px solid #ccc;">${versionOptions}</select>
                        </div>
                        <div id="changelog-content">
                            ${generateVersionHTML(this.appVersion)}
                        </div>
                    </div>
                `,
                icon: 'info',
                confirmButtonText: 'Got it!',
                confirmButtonColor: '#2563eb',
                didOpen: () => {
                    const selector = document.getElementById('version-selector');
                    const contentDiv = document.getElementById('changelog-content');
                    selector.addEventListener('change', (e) => {
                        contentDiv.innerHTML = generateVersionHTML(e.target.value);
                    });
                }
            }).then(() => {
                localStorage.setItem('lastSeenVersion', this.appVersion);
            });
        };

        if (forceShow) {
            showModal();
        } else {
            const lastSeenVersion = localStorage.getItem('lastSeenVersion');
            if (lastSeenVersion !== this.appVersion) {
                showModal();
            }
        }
    }
}

document.addEventListener('DOMContentLoaded', () => {
    new GradeCalculatorApp();
});
