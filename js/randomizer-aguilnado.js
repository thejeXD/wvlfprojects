document.addEventListener('DOMContentLoaded', () => {
    const minInput = document.getElementById('min-money');
    const maxInput = document.getElementById('max-money');
    const probabilityInput = document.getElementById('probability');
    const randomizeBtn = document.getElementById('randomize-btn');
    const resultCard = document.getElementById('result-card');
    const resultAmountDisplay = document.getElementById('result-amount');

    // Function to handle the randomization logic
    function generateAguinaldo() {
        // 1. Get and validate inputs
        const min = parseFloat(minInput.value);
        const max = parseFloat(maxInput.value);
        const probability = parseFloat(probabilityInput.value) / 100; // Convert % to decimal

        if (isNaN(min) || isNaN(max) || isNaN(probability) || min < 0 || max < 0 || min > max) {
            Swal.fire({
                icon: 'error',
                title: 'Invalid Input',
                text: 'Please ensure Min is less than Max, and all inputs are valid numbers.',
                confirmButtonColor: '#ef4444' // Using your danger color
            });
            return;
        }

        // 2. Define High/Low ranges
        const range = max - min;
        
        // Define the threshold for "Higher Amount" (e.g., top 30% of the range)
        const highRangePercentage = 0.30; 
        
        // Low Range: from min to the start of the high range
        const lowMax = min + range * (1 - highRangePercentage); 
        
        // High Range: from lowMax to max
        const highMin = lowMax; 

        // 3. Determine which range to pick from based on probability
        let finalAmount;
        const randomChance = Math.random(); 

        if (randomChance < probability) {
            // Pick from the "High" range (e.g., 10% chance for top 30% of the range)
            finalAmount = Math.random() * (max - highMin) + highMin;
            console.log("Picking from HIGH range: " + finalAmount);
        } else {
            // Pick from the "Low" range (The remaining 90% chance)
            finalAmount = Math.random() * (lowMax - min) + min;
            console.log("Picking from LOW range: " + finalAmount);
        }

        // 4. Format and display result
        const formattedAmount = finalAmount.toFixed(2); // Keep two decimal places
        
        // Display the result
        resultAmountDisplay.textContent = `₱${formattedAmount}`;
        resultCard.classList.remove('hidden');

        // Optional: Add a celebratory sweet alert
        Swal.fire({
            title: '🎉 Aguinaldo Generated!',
            text: `You are giving ₱${formattedAmount}!`,
            icon: 'success',
            confirmButtonText: 'Woohoo!',
            confirmButtonColor: '#10b981' // Using your success color
        });
    }

    // Attach event listener to the button
    randomizeBtn.addEventListener('click', generateAguinaldo);

    // Initial check to apply theme on app page load (in case the global script is slow)
    if (window.applyTheme) {
        window.applyTheme();
    }
});