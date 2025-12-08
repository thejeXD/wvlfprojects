class GradeCalculatorApp {
    constructor() { // NOSONAR
        this.appVersion = '1.6.0'; // Current version of the app
        this.changelogData = {
            '1.6.0': [
                '<strong>New Feature: Goal Tracker!</strong> Set a target GWA in Settings to see a celebration with confetti and effects when you reach your goal.',
                '<strong>UI Refinement:</strong> Moved "Clear All Grades" and "Delete All Subjects" buttons into the "Manage Data" dropdown for a cleaner interface.',
                '<strong>Smarter Display:</strong> The GWA summary card now automatically hides when the subject table is empty.',
                '<strong>Improved Deletion:</strong> You can now delete the last subject in the table. A new blank row will be added automatically.',
            ],
            '1.5.1': [
                'Made the "What\'s New" changelog dynamic and viewable by version.',
                'Enhanced data privacy notice for clarity.',
                'Minor bug fixes and performance improvements.'
            ],
            '1.5.0': [
                'Added CSV Import/Export functionality and subject reordering with drag-and-drop.',
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
            targetHonorGWA: 0,
        };
        this.componentData = {}; // New: To store component scores, e.g., { '1-prelim': [{...}] }

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
            'https://i.pinimg.com/736x/6a/ad/74/6aad74ef177f87a1ea95f246042be3f0.jpg',
            'https://i.pinimg.com/736x/4f/cd/3b/4fcd3bc76dd8150aba0dedbe3b3b9970.jpg',
            'https://i.pinimg.com/1200x/d4/8e/68/d48e68043e584f71ea353be6f40ccf83.jpg',
            'https://i.pinimg.com/1200x/40/7f/16/407f16e13ea486af8eaf209cedb3e987.jpg',
            'https://i.pinimg.com/736x/a8/71/99/a87199ef52d68e20fdb17b5ee484f1a4.jpg'
        ];
        this.failedMemes = [
            'https://i.pinimg.com/736x/bd/f9/28/bdf9281f329c668101cc834dc52df732.jpg',
            'https://i.pinimg.com/736x/12/cd/18/12cd1876fe809f07c19743b3e7e74b71.jpg',
            'https://i.pinimg.com/736x/00/1e/37/001e37ddbc07ea12635757891de58426.jpg',
            'https://i.pinimg.com/736x/52/0c/2a/520c2ae783953a02b4240f9990779176.jpg',
            'https://i.pinimg.com/736x/5b/fb/88/5bfb88aa79fae6602a91206ea05f836b.jpg'
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
        this.whatsNewBtn = document.getElementById('whats-new-btn');
        this.printBtn = document.getElementById('print-btn');
        this.settingsBtn = document.getElementById('settings-btn');
        this.addSubjectBtn = document.getElementById('add-subject-btn');
        this.exportCsvBtn = document.getElementById('export-csv-btn');
        this.importCsvBtn = document.getElementById('import-csv-btn');
        this.manageStorageBtn = document.getElementById('manage-storage-btn');
        this.clearGradesBtn = document.getElementById('clear-grades-btn');
        this.deleteAllBtn = document.getElementById('delete-all-btn');
        this.dropdowns = document.querySelectorAll('.dropdown-btn');

        // Table
        this.subjectsContainer = document.getElementById('subjects-container');
        this.neededHeader = document.getElementById('needed-header');

        // Header Summary
        this.overallGwaDisplay = document.getElementById('overall-gwa');
        this.statusDisplay = document.getElementById('status');
        this.gwaProgressBar = document.getElementById('gwa-progress-bar');
        
        // Summary Section (memes)
        this.motivationalText = document.getElementById('motivational-text');
        this.memeContainer = document.getElementById('meme-container');
        this.summarySection = document.querySelector('.summary-section');

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
        this.targetHonorGWAInput = document.getElementById('target-honor-gwa');
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
        // Storage Manager Drawer
        this.storageManagerOverlay = document.getElementById('storage-manager-overlay');
        this.storageManagerDrawer = document.getElementById('storage-manager-drawer');
        this.closeStorageManagerBtn = document.getElementById('close-storage-manager-btn');
        this.settingsJsonDisplay = document.getElementById('settings-json-display');
        this.gradeDataJsonDisplay = document.getElementById('grade-data-json-display');
        this.storageDataSelector = document.getElementById('storage-data-selector');
        this.clearGradeDataBtn = document.getElementById('clear-grade-data-btn');
        this.deleteAllDataBtn = document.getElementById('delete-all-data-btn');
    }

    _init() {
        // 2. Bind event listeners.
        this._bindEventListeners();

        // 4. Set up the initial UI state.
        this.dropdowns.forEach(button => button.classList.remove('active'));
        // Open the privacy dropdown by default
        const privacyDropdown = document.querySelector('.dropdown-btn[data-dropdown="privacy"]');
        if (privacyDropdown) privacyDropdown.classList.add('active');
        
        // 5. Load saved data from localStorage or create default subjects.
        this._loadStateFromStorage();
        this._checkVersionAndShowChangelog();
        this._initSortable();
    }


    _bindEventListeners() {
        if (this.whatsNewBtn) this.whatsNewBtn.addEventListener('click', () => this.showChangelog(true));
        if (this.printBtn) this.printBtn.addEventListener('click', () => this.printReport());
        if (this.settingsBtn) this.settingsBtn.addEventListener('click', () => this.openSettings());
        if (this.addSubjectBtn) this.addSubjectBtn.addEventListener('click', () => this.addSubject());
        if (this.exportCsvBtn) this.exportCsvBtn.addEventListener('click', () => this.exportToCSV());
        if (this.importCsvBtn) this.importCsvBtn.addEventListener('click', () => this.importFromCSV());
        if (this.manageStorageBtn) this.manageStorageBtn.addEventListener('click', () => this.openStorageManager());
        if (this.clearGradesBtn) this.clearGradesBtn.addEventListener('click', () => this.clearAllGrades());
        if (this.deleteAllBtn) this.deleteAllBtn.addEventListener('click', () => this.deleteAllSubjects());

        if (this.dropdowns) {
            this.dropdowns.forEach(btn => {
                btn.addEventListener('click', () => this.toggleDropdown(btn.dataset.dropdown));
            });
        }

        // Handle new action dropdowns
        document.querySelectorAll('.action-dropdown > .action-btn').forEach(button => {
            button.addEventListener('click', (e) => {
                const parentDropdown = e.currentTarget.closest('.action-dropdown');
                // Close all other action dropdowns
                document.querySelectorAll('.action-dropdown').forEach(dropdown => {
                    if (dropdown !== parentDropdown) {
                        dropdown.classList.remove('open');
                    }
                });
                // Toggle the clicked dropdown
                parentDropdown.classList.toggle('open');
            });
        });

        // Event delegation for the table body is safe as it checks the container first
        if (this.subjectsContainer) {
            const handleGradeInput = (e) => {
                if (e.target.classList.contains('grade-input')) {
                    const subjectId = e.target.closest('tr').dataset.subjectId;
                    if (e.target.type === 'number') {
                        this.validateGrade(e.target);
                    }
                    // Call calculateGWA immediately for real-time feedback
                    if(subjectId) this.calculateGWA(subjectId);
                }
            };

            // Save data whenever an input changes.
            const debouncedSave = this._debounce(() => this._saveStateToStorage(), 300);
            const debouncedHandler = (event) => { handleGradeInput(event); debouncedSave(); };

            this.subjectsContainer.addEventListener('click', (e) => {
                const target = e.target.closest('.delete-btn, .calc-btn');
                if (!target) return;

                const subjectRow = target.closest('tr');
                const subjectId = subjectRow.dataset.subjectId; // Use the unique ID from dataset

                if (target.classList.contains('delete-btn')) {
                    this.deleteSubject(subjectId);
                } else if (target.classList.contains('calc-btn')) {
                    const term = target.dataset.term;
                    this.openComponentDrawer(subjectId, term);
                }
            });

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
        
        // Storage Manager
        if (this.storageManagerOverlay) this.storageManagerOverlay.addEventListener('click', () => this.closeStorageManager());
        if (this.closeStorageManagerBtn) this.closeStorageManagerBtn.addEventListener('click', () => this.closeStorageManager());
        if (this.clearGradeDataBtn) this.clearGradeDataBtn.addEventListener('click', () => this._clearGradeData());
        if (this.deleteAllDataBtn) this.deleteAllDataBtn.addEventListener('click', () => this._deleteAllData());
        if (this.storageDataSelector) this.storageDataSelector.addEventListener('change', () => this._updateStorageManagerView());

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

        // Close dropdowns when clicking outside
        window.addEventListener('click', (e) => {
            if (!e.target.closest('.action-dropdown')) {
                document.querySelectorAll('.action-dropdown.open').forEach(dropdown => {
                    dropdown.classList.remove('open');
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

    _getStateForSaving() {
        const subjects = [];
        for (const row of this.subjectsContainer.rows) {
            const getVal = (selector) => row.querySelector(selector).value;
            subjects.push({
                id: row.dataset.subjectId, // CRITICAL FIX: Save the unique ID
                name: getVal('input[type="text"]'),
                prelim: getVal('.prelim'),
                midterm: getVal('.midterm'),
                prefinals: getVal('.prefinals'),
                finals: getVal('.finals'),
            });
        }
        return {
            settings: this.settings,
            subjects: subjects,
            components: this.componentData,
        };
    }

    _saveStateToStorage() {
        const state = this._getStateForSaving();
        localStorage.setItem('wolfGradeCalculatorState', JSON.stringify(state));
    }

    _loadStateFromStorage() {
        const rawState = localStorage.getItem('wolfGradeCalculatorState');
        this.subjectsContainer.innerHTML = ''; // Clear UI
        this.subjectCount = 0;

        if (rawState) {
            try {
                const state = JSON.parse(rawState);

                // Load settings
                if (state.settings && state.settings.weights) {
                    this.settings = { ...this.settings, ...state.settings };
                }

                // Load component data
                if (state.components) {
                    this.componentData = state.components;
                }

                // Load subjects
                if (Array.isArray(state.subjects) && state.subjects.length > 0) {
                    state.subjects.forEach(subject => this.addSubject(subject));
                } else {
                    this.addSubject(); // Add one if storage is empty
                }
            } catch (e) {
                console.error("Failed to load state, starting fresh.", e);
                this.addSubject(); // Add one on error
            }
        } else {
            // If no saved state at all, add one default subject
            this.addSubject();
        }

        this._updateLabels();
        this._updateNeededHeader();
    }

    async addSubject(data = null) {
        // If called without data (from the button click), show the form first.
        if (!data) {
            try {
                const result = await Swal.fire({
                    title: 'Add New Subject',
                    html: `
                        <p style="font-size: 0.9em; color: var(--text-secondary); margin-bottom: 0;">Enter the subject details below. All fields are optional.</p>
                        <div class="swal-form-grades">
                            <div class="swal-form-group swal-form-full-width">
                                <label for="swal-name">Subject Name</label>
                                <input id="swal-name" class="swal2-input" placeholder="e.g., Mathematics">
                            </div>
                            <div class="swal-form-group">
                                <label for="swal-prelim">Prelim</label>
                                <input id="swal-prelim" class="swal2-input" type="number" min="0" max="100" placeholder="e.g., 85">
                            </div>
                            <div class="swal-form-group">
                                <label for="swal-midterm">Midterm</label>
                                <input id="swal-midterm" class="swal2-input" type="number" min="0" max="100" placeholder="e.g., 88">
                            </div>
                            <div class="swal-form-group">
                                <label for="swal-prefinals">Pre-Finals</label>
                                <input id="swal-prefinals" class="swal2-input" type="number" min="0" max="100" placeholder="e.g., 90">
                            </div>
                            <div class="swal-form-group">
                                <label for="swal-finals">Finals</label>
                                <input id="swal-finals" class="swal2-input" type="number" min="0" max="100" placeholder="e.g., 92">
                            </div>
                        </div>
                    `,
                    confirmButtonText: 'Add Subject',
                    confirmButtonColor: '#2563eb',
                    showCancelButton: true,
                    focusConfirm: false, // Keep focus on the form
                    preConfirm: () => {
                        const grades = {
                            name: document.getElementById('swal-name').value,
                            prelim: document.getElementById('swal-prelim').value,
                            midterm: document.getElementById('swal-midterm').value,
                            prefinals: document.getElementById('swal-prefinals').value,
                            finals: document.getElementById('swal-finals').value,
                        };

                        // Validate all grade fields
                        for (const key in grades) {
                            if (key !== 'name' && grades[key]) {
                                const grade = parseFloat(grades[key]);
                                if (isNaN(grade) || grade < 0 || grade > 100) {
                                    Swal.showValidationMessage(`Invalid grade for ${key}. Please enter a number between 0 and 100.`);
                                    return false; // Prevent closing
                                }
                            }
                        }
                        return grades;
                    }
                });

                if (result.isConfirmed) {
                    this._createSubjectRow(result.value);
                }
            } catch (error) {
                console.error("SweetAlert form error:", error);
            }
        } else {
            // If called with data (from loading storage), create the row directly.
            this._createSubjectRow(data);
        }
    }

    _createSubjectRow(data = null) {
        const uniqueSubjectId = data?.id || `sub-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`; // Generate unique ID if not provided
        if (this.subjectsContainer.children.length >= this.settings.maxSubjects && !data) { // Only check limit if adding a new subject, not loading existing
            Swal.fire('Limit Reached', `You can only add up to ${this.settings.maxSubjects} subjects. You can change this in Settings.`, 'warning');
            return;
        }

        this.subjectCount++;
        const row = this.subjectsContainer.insertRow(-1);
        row.id = `subject-${uniqueSubjectId}`; // Use unique ID for row ID
        row.dataset.subjectId = uniqueSubjectId; // Store unique ID in dataset for easy retrieval

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
        subjectInput.placeholder = 'Subject Name'; // Default placeholder
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
            input.dataset.field = `${term}-${uniqueSubjectId}`; // Use unique ID for data-field
            input.placeholder = '-';
            input.min = '0';
            input.max = '100';
            input.step = '0.01';
            input.value = data ? data[term] : '';
            wrapper.appendChild(input);

            if (this.settings.componentBreakdown) {
                const btn = document.createElement('button');
                btn.className = 'calc-btn';
                btn.dataset.subject = uniqueSubjectId; // Use unique ID for data-subject
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

        createResultCell(`gwa-${uniqueSubjectId}`, 'GWA');
        const neededCell = createResultCell(`need-${uniqueSubjectId}`, 'Needed');
        neededCell.id = `needed-cell-${uniqueSubjectId}`;
        neededCell.style.display = this.settings.requirementEnabled ? '' : 'none'; // This ID is fine as it's just for display
        
        // 4. Actions Cell
        const actionsCell = createCell('Actions');
        const actionsWrapper = createWrapper();

        const dragHandle = document.createElement('span');
        dragHandle.className = 'drag-handle';
        dragHandle.title = 'Drag to reorder';
        dragHandle.innerHTML = `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="1"></circle><circle cx="12" cy="5" r="1"></circle><circle cx="12" cy="19" r="1"></circle><circle cx="5" cy="12" r="1"></circle><circle cx="19" cy="12" r="1"></circle></svg>`;

        const deleteBtn = document.createElement('button');
        deleteBtn.className = 'delete-btn';
        deleteBtn.title = 'Delete Subject';
        deleteBtn.innerHTML = `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path><line x1="10" y1="11" x2="10" y2="17"></line><line x1="14" y1="11" x2="14" y2="17"></line></svg>`;
        
        actionsWrapper.appendChild(dragHandle);
        actionsWrapper.appendChild(deleteBtn);
        actionsCell.appendChild(actionsWrapper);

        // If data was passed (from form or storage), calculate its GWA now.
        if (data) {
            // For each term, check if component data exists. If so, calculate and apply it.
            ['prelim', 'midterm', 'prefinals', 'finals'].forEach(term => {
                const dataKey = `${uniqueSubjectId}-${term}`;
                const savedComponents = this.componentData[dataKey];
                if (savedComponents) {
                    const calculatedGrade = this._calculateGradeFromComponents(savedComponents);
                    const targetInput = row.querySelector(`.${term}`);
                    if (targetInput) { // CRITICAL FIX: Apply the grade as long as component data exists, even if the result is 0.
                        targetInput.value = calculatedGrade.toFixed(2);
                    }
                }
            });
            // After potentially updating grades from components, calculate the final GWA for the row.
            this.calculateGWA(uniqueSubjectId);
        }

        this._saveStateToStorage(); // Save the new state
    }

    _initSortable() {
        if (this.subjectsContainer) {
            Sortable.create(this.subjectsContainer, { // Use Sortable.create
                animation: 150,
                handle: '.drag-handle', // Use the drag handle to initiate dragging
                onEnd: () => {
                    // Save the new order to localStorage after a drag operation
                    this._saveStateToStorage();
                }
            }
            );
        }
    }

    deleteSubject(id) {
        const isLastSubject = this.subjectsContainer.rows.length <= 1;
        const confirmationText = isLastSubject 
            ? "This is the last subject. Deleting it will clear the table and add a new blank row."
            : "This action cannot be undone.";
        
        Swal.fire({
            title: 'Delete Subject?', text: confirmationText, icon: 'warning',
            showCancelButton: true, confirmButtonColor: '#ef4444', cancelButtonColor: '#6c757d', confirmButtonText: 'Yes, delete it!'
        }).then((result) => {
            if (result.isConfirmed) {
                document.getElementById(`subject-${id}`)?.remove(); // ID is now uniqueSubjectId
                if (isLastSubject) {
                    this.addSubject(); // Add a new blank row if the last one was deleted
                }
                this.calculateOverallGWA();
                this._saveStateToStorage();
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
                this._saveStateToStorage();
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
                    const id = row.dataset.subjectId; // Use unique ID
                    if(id) this.calculateGWA(id);
                }
                this._saveStateToStorage();
                Swal.fire('Cleared!', 'All grades have been removed.', 'success');
            }
        });
    }
    
    calculateGWA(id, skipPrediction = false) { // ID is now uniqueSubjectId
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
        // Hide the summary if the table is completely empty.
        if (this.subjectsContainer.rows.length === 0) {
            if (this.summarySection) this.summarySection.style.display = 'none';
        } else if (count === 0) {
            if (this.summarySection) this.summarySection.style.display = 'flex';
            this.statusDisplay.textContent = 'Enter Grades';
            this.statusDisplay.className = 'summary-value status'; // Reset classes
            this.motivationalText.textContent = 'Start by entering some grades!';
        } else {
            if (this.summarySection) this.summarySection.style.display = 'flex'; // Show the section
            this.statusDisplay.textContent = isPassed ? 'Passed' : 'Failed'; // NOSONAR
            // Correctly add/remove classes without overwriting base classes
            this.statusDisplay.classList.remove('passed', 'failed');
            this.statusDisplay.classList.add(isPassed ? 'passed' : 'failed');
            this.motivationalText.textContent = this._getRandomItem(isPassed ? this.passedMessages : this.failedMessages);
            // CRITICAL FIX: Only show the meme if the summary section is already visible (i.e., not on initial load).
            // This prevents it from running on initial page load and clearing component data.
            if (this.summarySection.style.display !== 'none') {
                this._showMeme(isPassed);
            }
        }

        // Animate the progress circle
        if (this.gwaProgressBar) {
            const circumference = 2 * Math.PI * 80; // 2 * PI * radius
            const progress = (overallGWA > 0) ? (overallGWA / 100) : 0;
            const offset = circumference * (1 - progress);
            this.gwaProgressBar.style.strokeDashoffset = offset;
            this.gwaProgressBar.style.stroke = isPassed ? 'var(--success-color)' : 'var(--danger-color)';
        }

        // Reset party effect if GWA changes
        if (this.gwaProgressBar.classList.contains('party-time')) {
            this.gwaProgressBar.classList.remove('party-time');
        }
        // Check for goal achievement after GWA is updated
        this._calculateTargetHonorNeeded();
    }
    
    _calculateTargetHonorNeeded() {
        const targetGWA = this.settings.targetHonorGWA;
        if (!targetGWA || targetGWA <= 0) return; // Do nothing if no goal is set

        const rows = Array.from(this.subjectsContainer.rows);
        const totalSubjects = rows.length;
        if (totalSubjects === 0) return;

        let completedGwaSum = 0;
        let inProgressCount = 0;

        rows.forEach(row => {
            const gwa = parseFloat(row.querySelector('.result-box').textContent);
            const hasEmptyField = Array.from(row.querySelectorAll('.grade-input[type="number"]')).some(input => input.value === '');
            if (!hasEmptyField && !isNaN(gwa) && gwa > 0) {
                completedGwaSum += gwa;
            } else {
                inProgressCount++;
            }
        });

        const overallGWA = parseFloat(this.overallGwaDisplay.textContent);

        if (inProgressCount === 0) {
            if (overallGWA >= targetGWA) {
                this.motivationalText.innerHTML = `<strong>Congratulations!</strong> You reached your goal of ${targetGWA.toFixed(2)}! 🎉`;
                this._triggerCelebration();
            } else {
                // Optional: You can add a message here if you want
            }
        } else {
            const totalPointsNeeded = targetGWA * totalSubjects;
            const pointsFromCompleted = completedGwaSum;
            const neededGWA = (totalPointsNeeded - pointsFromCompleted) / inProgressCount;
            // This logic can be re-added if you want to display the "needed" GWA somewhere else.
        }
    }

     _showMeme(isPassed) {
        // Find and remove any existing meme image to prevent duplicates
        const existingMeme = this.memeContainer.querySelector('img');
        if (existingMeme) {
            existingMeme.remove();
        }

        const memeImg = document.createElement('img');
        memeImg.src = this._getRandomItem(isPassed ? this.passedMemes : this.failedMemes);
        memeImg.alt = isPassed ? 'Passed Meme' : 'Failed Meme';
        memeImg.onerror = () => { memeImg.style.display = 'none'; };
        this.memeContainer.prepend(memeImg); // Use prepend to ensure it's the first child (lowest z-index)
    }
    
    _triggerCelebration() {
        if (this.gwaProgressBar) {
            this.gwaProgressBar.classList.add('party-time');
        }

        // Add the GIF
        const existingGif = this.memeContainer.querySelector('.celebration-gif');
        if (!existingGif) {
            const gif = document.createElement('img');
            gif.src = 'https://media.tenor.com/VQBahlBHyn8AAAAi/ted-puppy.gif';
            gif.className = 'celebration-gif';
            this.memeContainer.appendChild(gif);
            // Remove the GIF after the celebration
            setTimeout(() => gif.remove(), 5000);
        }

        // Use canvas-confetti
        const duration = 3 * 1000;
        const end = Date.now() + duration;

        (function frame() {
            confetti({
                particleCount: 2,
                angle: 60,
                spread: 55,
                origin: { x: 0 },
            });
            confetti({ particleCount: 2, angle: 120, spread: 55, origin: { x: 1 } });
            if (Date.now() < end) requestAnimationFrame(frame);
        }());
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
        this.targetHonorGWAInput.value = this.settings.targetHonorGWA > 0 ? this.settings.targetHonorGWA.toFixed(2) : '';
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
        this.settings.targetHonorGWA = parseFloat(this.targetHonorGWAInput.value) || 0;
        
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

        this._saveStateToStorage();
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
    
    _resetWeights() {
        this.wPrelim.value = 20;
        this.wMidterm.value = 20;
        this.wPrefinals.value = 20;
        this.wFinals.value = 40;
        this.settingsDirty = true; // Mark settings as changed
        Swal.fire({ title: 'Weights Reset', text: 'Main grade weights have been reset to default. Click "Save Settings" to apply.', icon: 'info', toast: true, position: 'top-end', showConfirmButton: false, timer: 3000 });
    }

    _resetComponentWeights() {
        this.wPerformance.value = 40;
        this.wActivities.value = 30;
        this.wExam.value = 30;
        this.settingsDirty = true; // Mark settings as changed
        Swal.fire({ title: 'Weights Reset', text: 'Component weights have been reset to default. Click "Save Settings" to apply.', icon: 'info', toast: true, position: 'top-end', showConfirmButton: false, timer: 3000 });
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
        this.currentComponentSubject = subjectId; // This is now the unique ID
        this.currentComponentTerm = term;

        this.componentCalculatedGrade.textContent = '-';

        // Set title
        const subjectRow = document.getElementById(`subject-${subjectId}`); // Use unique ID
        const subjectNameInput = subjectRow.querySelector('input[type="text"]');
        const subjectName = subjectNameInput.value || `Subject ${subjectId}`;
        this.componentDrawerTitle.textContent = `Calculate ${term.charAt(0).toUpperCase() + term.slice(1)} for ${subjectName}`;

        // Set weight labels
        this.compPerfWeight.textContent = `${this.settings.componentWeights.performance}%`;
        this.compActWeight.textContent = `${this.settings.componentWeights.activities}%`;
        this.compExamWeight.textContent = `${this.settings.componentWeights.exam}%`;

        // CRITICAL FIX: Clear the containers *before* loading new data.
        this.performanceTasksContainer.innerHTML = '';
        this.activitiesContainer.innerHTML = '';
        this.examContainer.innerHTML = '';

        // New: Load saved component data for this subject and term
        const dataKey = `${subjectId}-${term}`;
        const savedComponents = this.componentData[dataKey];
        if (savedComponents) {
            // Automatically create the fields for any saved data.
            Object.keys(savedComponents).forEach(componentType => {
                const items = savedComponents[componentType];
                if (Array.isArray(items)) {
                    items.forEach(itemData => {
                        // Automatically call addComponentField to build the UI from saved data.
                        this.addComponentField(componentType, itemData);
                    })
                }
            });
            this.calculateComponentGrade(); // Recalculate total after loading
        }

        // Show drawer
        this.componentOverlay.classList.add('open');
        this.componentDrawer.classList.add('open');
     }

    closeComponentDrawer() {
       this.componentOverlay.classList.remove('open');
       this.componentDrawer.classList.remove('open');
    }

    addComponentField(type, data = null) {
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
                <input type="text" id="comp-name-${fieldId}" class="component-name" placeholder="e.g., Quiz 1" style="text-align: left;" value="${data?.name || ''}">
                <input type="number" id="comp-score-${fieldId}" class="component-score" placeholder="Score" min="0" pattern="[0-9]*" value="${data?.score || ''}">
                <span class="divider">/</span>
                <input type="number" id="comp-total-${fieldId}" class="component-total" placeholder="Items" min="1" pattern="[0-9]*" value="${data?.total || ''}">
                <span class="divider">=</span>
                <span class="component-row-total">-</span>
                <button class="remove-component-btn" data-field-id="${fieldId}" data-type="${type}" title="Remove"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg></button>
            </div>
        `;
        container.insertAdjacentHTML('beforeend', fieldHTML);

        // CRITICAL FIX: If data was loaded, calculate the total for this new row immediately.
        if (data) {
            const newRow = document.getElementById(fieldId);
            this._calculateComponentRowTotal(newRow);
        }
    }
    _saveCurrentComponentData() {
        const dataKey = `${this.currentComponentSubject}-${this.currentComponentTerm}`;
        this.componentData[dataKey] = this._getCurrentComponentData();
        this._saveStateToStorage();
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

        // New: Validate that score is not greater than total
        if (total > 0 && score > total) {
            scoreInput.style.borderColor = 'var(--danger-color)';
            scoreInput.style.color = 'var(--danger-color)';
        } else {
            scoreInput.style.borderColor = ''; // Revert to default
            scoreInput.style.color = ''; // Revert to default
        }

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
    
    _calculateGradeFromComponents(componentData) {
        const w = this.settings.componentWeights;

        const calculateSubGrade = (tasks) => {
            if (!tasks || tasks.length === 0) return 0;
            let totalScore = 0;
            let totalItems = 0;

            tasks.forEach(item => {
                const score = parseFloat(item.score) || 0;
                const items = parseFloat(item.total) || 0;
                if (items > 0) {
                    totalScore += score;
                    totalItems += items;
                }
            });

            if (totalItems === 0) return 0;
            return (totalScore / totalItems) * 100;
        };

        const perfGrade = calculateSubGrade(componentData.performance);
        const actGrade = calculateSubGrade(componentData.activities);
        const examGrade = calculateSubGrade(componentData.exam);

        return (perfGrade * w.performance / 100) + (actGrade * w.activities / 100) + (examGrade * w.exam / 100);
    }

    _isComponentDataValid() {
        const containers = [this.performanceTasksContainer, this.activitiesContainer, this.examContainer];
        let isValid = true;
        for (const container of containers) {
            if (container) {
                const rows = container.querySelectorAll('.component-field-row');
                rows.forEach(row => {
                    const score = parseFloat(row.querySelector('.component-score').value) || 0;
                    const total = parseFloat(row.querySelector('.component-total').value) || 0;
                    if (total > 0 && score > total) {
                        isValid = false;
                    }
                });
            }
        }
        return isValid;
    }

    applyComponentGrade() {
        try {
            if (!this._isComponentDataValid()) {
                Swal.fire('Invalid Score', 'One or more scores are greater than the total items. Please correct the highlighted fields before applying.', 'error');
                return;
            }
            // CRITICAL FIX: Save the current state of the component drawer before applying the grade.
            this._saveCurrentComponentData();

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

            // CRITICAL FIX: Save the main grade data after applying the component grade.
            this._saveStateToStorage();

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

    _getCurrentComponentData() {
        const data = {
            performance: [],
            activities: [],
            exam: []
        };
        const processContainer = (container, type) => {
            if (container) {
                container.querySelectorAll('.component-field-row').forEach(row => {
                    data[type].push({
                        name: row.querySelector('.component-name').value,
                        score: row.querySelector('.component-score').value,
                        total: row.querySelector('.component-total').value,
                    });
                });
            }
        };
        processContainer(this.performanceTasksContainer, 'performance');
        processContainer(this.activitiesContainer, 'activities');
        processContainer(this.examContainer, 'exam');
        return data;
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

    openStorageManager() {
        this._populateStorageManagerDropdown(); // Populate dropdown first
        this._updateStorageManagerView();      // Then show the initial view

        this.storageManagerOverlay.classList.add('open');
        this.storageManagerDrawer.classList.add('open');
    }

    _populateStorageManagerDropdown() {
        const state = JSON.parse(localStorage.getItem('wolfGradeCalculatorState')) || {};
        
        // Clear previous dynamic options, keeping the first default option
        while (this.storageDataSelector.options.length > 1) {
            this.storageDataSelector.remove(1);
        }

        // Dynamically add an option for each saved subject
        if (state.subjects) {
            state.subjects.forEach(subject => {
                const option = document.createElement('option');
                option.value = subject.id; // The value is the unique subject ID
                const displayName = subject.name || subject.id; // Use name, fallback to ID
                option.textContent = displayName;
                this.storageDataSelector.appendChild(option);
            });
        }
    }

    _updateStorageManagerView() {
        const state = JSON.parse(localStorage.getItem('wolfGradeCalculatorState')) || { subjects: [], components: {} };
        
        // Always display settings
        this.settingsJsonDisplay.textContent = JSON.stringify(state.settings || this.settings, null, 2);

        // Display the selected grade data type
        const selectedId = this.storageDataSelector.value;
        let dataToDisplay = {};

        if (selectedId === 'all_subjects') {
            // Show the summary list of all subjects
            dataToDisplay = state.subjects || [];
        } else {
            // A specific subject ID was selected, gather all its data
            const subjectData = state.subjects.find(s => s.id === selectedId);
            const subjectComponents = {};
            Object.keys(state.components).forEach(key => {
                if (key.startsWith(selectedId)) {
                    subjectComponents[key] = state.components[key];
                }
            });

            dataToDisplay = {
                subject: subjectData,
                components: subjectComponents
            };
        }
        
        this.gradeDataJsonDisplay.textContent = JSON.stringify(dataToDisplay, null, 2);
    }

    closeStorageManager() {
        this.storageManagerOverlay.classList.remove('open');
        this.storageManagerDrawer.classList.remove('open');
    }

    _clearGradeData() {
        Swal.fire({
            title: 'Clear All Grade Data?',
            text: "This will delete all subjects and component breakdowns. Your settings will be kept. This action cannot be undone.",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#ef4444',
            confirmButtonText: 'Yes, Clear Data'
        }).then((result) => {
            if (result.isConfirmed) {
                const state = JSON.parse(localStorage.getItem('wolfGradeCalculatorState')) || {};
                state.subjects = [];
                state.components = {};
                localStorage.setItem('wolfGradeCalculatorState', JSON.stringify(state));
                window.location.reload();
            }
        });
    }

    _deleteAllData() {
        Swal.fire({
            title: 'Delete All Application Data?',
            html: "This will perform a <strong>factory reset</strong>, deleting all subjects, grades, and settings. The page will reload to its original state. This action is permanent.",
            icon: 'error',
            showCancelButton: true,
            confirmButtonColor: '#ef4444',
            confirmButtonText: 'Yes, Delete Everything'
        }).then((result) => {
            if (result.isConfirmed) {
                localStorage.removeItem('wolfGradeCalculatorState');
                // Also remove older keys just in case
                localStorage.removeItem('wolfGradeData');
                localStorage.removeItem('wolfGradeComponentData');
                localStorage.removeItem('wolfGradeSettings');
                window.location.reload();
            }
        });
    }
}

document.addEventListener('DOMContentLoaded', () => {
    new GradeCalculatorApp();
});
