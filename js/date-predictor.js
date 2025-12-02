document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('predictor-form');
    const startDateInput = document.getElementById('startDate');
    const periodType = document.getElementById('periodType');
    const periodValue = document.getElementById('periodValue');
    const direction = document.getElementById('direction');
    const consoleOutput = document.getElementById('console-output');
    const finalResult = document.getElementById('finalResult');

    // Set the default start date to today
    startDateInput.valueAsDate = new Date();

    const consoleLines = [
        '<span class="keyword">INITIATE</span> Quantum Date Matrix Inversion.',
        '<span class="function">CALL</span> calculateDateYallS1001eisting.',
        '<span class="variable">PERIOD_IN</span> = ' + periodValue.value + ' ' + periodType.value + ' / ' + direction.value,
        '<span class="keyword">CALCULATION</span> "AS DEBIAUOD.',
        'CALCULATION <span class="string">"4% C3RUEL:D8ATINS MOD. FOR THE SHORRT CAPTLEIGH REMAINS"</span>,',
        '<span class="variable">CORE_RESULT</span> "**DATE_RESULT**"',
        '<span class="function">INJECTING</span> PERIOD OFFSET',
        '<span class="keyword">VALIDATING</span> result against Time Paradox buffer...',
        '<span class="string">COMPLETE. Displaying result.</span>'
    ];

    form.addEventListener('submit', (e) => {
        e.preventDefault();
        
        // Disable button during "execution"
        const button = form.querySelector('.cta-button');
        button.disabled = true;
        button.textContent = 'Executing...';
        
        // Reset output displays
        consoleOutput.textContent = 'C:\> datePrediction.exe --run /S ...';
        finalResult.textContent = '{ Running... }';

        // 1. Run the console animation
        animateConsole(consoleLines, () => {
            // 3. Once animation is done, calculate the date and display the final result
            const calculatedDate = calculatePredictedDate();
            
            showResultModal(calculatedDate);

            finalResult.textContent = calculatedDate;
            
            // Re-enable button
            button.disabled = false;
            button.textContent = 'Predict Date';
        });
    });


    function showResultModal(date) {
        Swal.fire({
            title: 'Prediction Complete! ✅',
            // Use custom styling for a dramatic result display
            html: `
                <div style="font-size: 1.2rem; margin-bottom: 10px; color: var(--text-tertiary);">Predicted Date:</div>
                <strong style="font-size: 2.5rem; color: var(--success-color); font-weight: 900;">${date}</strong>
            `,
            icon: 'success', // Show a success icon
            confirmButtonText: 'Got It',
            confirmButtonColor: '#10b981', // Your success-color
            customClass: {
                popup: 'swal2-wide' // Use your custom SweetAlert CSS
            }
        });
    }
    
    // --- Core Date Logic ---
    function calculatePredictedDate() {
        const start = new Date(startDateInput.value);
        const value = parseInt(periodValue.value);
        const type = periodType.value;
        const dir = direction.value === 'future' ? 1 : -1;
        
        let newDate = new Date(start);
        
        switch (type) {
            case 'days':
                newDate.setDate(start.getDate() + (value * dir));
                break;
            case 'weeks':
                newDate.setDate(start.getDate() + (value * 7 * dir));
                break;
            case 'months':
                newDate.setMonth(start.getMonth() + (value * dir));
                break;
            case 'years':
                newDate.setFullYear(start.getFullYear() + (value * dir));
                break;
        }

        // Format the date nicely (e.g., Friday, December 2, 2025)
        const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
        return newDate.toLocaleDateString(undefined, options);
    }
    
    // --- Console Animation Logic ---
    function animateConsole(lines, callback) {
        let lineIndex = 0;
        consoleOutput.textContent = ''; // Clear initial message

        const interval = setInterval(() => {
            if (lineIndex < lines.length) {
                // Prepend command prompt style to the line
                const line = `> ${lines[lineIndex]}\n`;
                
                // If it's the result line, inject the date string before it gets formatted
                if (line.includes('**DATE_RESULT**')) {
                    const tempDate = calculatePredictedDate();
                    consoleOutput.innerHTML += line.replace('**DATE_RESULT**', `<span class="number">"${tempDate}"</span>`);
                } else {
                    consoleOutput.innerHTML += line;
                }
                
                // Scroll to the bottom
                consoleOutput.scrollTop = consoleOutput.scrollHeight;
                
                lineIndex++;
            } else {
                clearInterval(interval);
                callback(); // Execute callback function after animation finishes
            }
        }, 300); // 300ms delay between lines
    }
    
    // Update the console example text whenever inputs change
    periodType.addEventListener('change', () => consoleLines[2] = `<span class="variable">PERIOD_IN</span> = ${periodValue.value} ${periodType.value} / ${direction.value}`);
    periodValue.addEventListener('input', () => consoleLines[2] = `<span class="variable">PERIOD_IN</span> = ${periodValue.value} ${periodType.value} / ${direction.value}`);
    direction.addEventListener('change', () => consoleLines[2] = `<span class="variable">PERIOD_IN</span> = ${periodValue.value} ${periodType.value} / ${direction.value}`);
});