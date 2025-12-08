// Theme Toggle
let currentTheme = localStorage.getItem("theme") || "light";

function toggleTheme() {
    currentTheme = currentTheme === "light" ? "dark" : "light";
    applyTheme();
    localStorage.setItem("theme", currentTheme);
}

function applyTheme() {
    const body = document.body;
    const themeIcon = document.getElementById("theme-icon");

    // CRITICAL FIX: Only try to set innerHTML if the themeIcon element exists on the current page
    if (themeIcon) {
        if (currentTheme === "dark") {
            body.classList.add("dark-theme");
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
            body.classList.remove("dark-theme");
            themeIcon.innerHTML = `<path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>`;
        }
    } else {
        // Still apply the dark-theme class to the body even if the icon isn't there, 
        // to ensure CSS colors/backgrounds work across all pages.
        if (currentTheme === "dark") {
            body.classList.add("dark-theme");
        } else {
            body.classList.remove("dark-theme");
        }
    }
}

document.addEventListener('DOMContentLoaded', () => {
    const themeToggleButton = document.getElementById('theme-toggle');
    if (themeToggleButton) {
        themeToggleButton.addEventListener('click', toggleTheme);
    }
});
// Show app info with SweetAlert
function showAppInfo(appName) {
    if (appName === "grade-calculator") {
        Swal.fire({
            title: "Grade Calculator",
            html: `
                <div style="text-align: left;">
                    <p><strong>Features:</strong></p>
                    <ul style="margin: 10px 0;">
                        <li>Calculate GWA across multiple subjects</li>
                        <li>Predict required grades to pass</li>
                        <li>Customizable weight distribution</li>
                        <li>Dark/Light theme support</li>
                        <li>Export grades as PDF</li>
                    </ul>
                    <p style="margin-top: 15px;"><strong>Perfect for:</strong> Students tracking academic performance</p>
                </div>
            `,
            icon: "info",
            confirmButtonText: "Got it!",
            confirmButtonColor: "#2563eb",
        });
    } else if (appName === 'aguinaldo-randomizer') {
        Swal.fire({
            title: 'Randomizer Aguinaldo',
            html: `
                <div style="text-align: left;">
                    <p><strong>Features:</strong></p>
                    <ul style="margin: 10px 0;">
                        <li>Input Minimum and Maximum cash amounts.</li>
                        <li>Set a custom **Probability** (chance) to generate an amount in the **Top 30%** of the range.</li>
                        <li>Designed for fun and fair holiday gift-giving!</li>
                    </ul>
                    <p style="margin-top: 15px;"><strong>Perfect for:</strong> Deciding Christmas cash gifts in a fun, probabilistic way.</p>
                </div>
            `,
            icon: 'info',
            confirmButtonText: 'Got it!',
            confirmButtonColor: '#2563eb'
        });
    } else if (appName === 'follower-checkers') {
        Swal.fire({
            title: 'Follower Checkers',
            text: 'This app is a utility for checking social media follower status. Details coming soon!',
            icon: 'info',
            confirmButtonText: 'Okay',
            confirmButtonColor: '#2563eb'
        });
    }
}

// Coming soon alert
function comingSoonAlert() {
  Swal.fire({
    title: "Get Notified!",
    text: "Enter your email below to be notified when this app is released.",
    input: "email",
    inputPlaceholder: "you@example.com",
    showCancelButton: true,
    confirmButtonText: "Notify Me &rarr;",
    confirmButtonColor: "#2563eb",
    cancelButtonText: "Cancel",
    showLoaderOnConfirm: true,
    preConfirm: (email) => {
      // Here you would typically send the email to your backend or a mailing list service.
      // For this example, we'll just simulate a network request.
      return new Promise((resolve) => {
        setTimeout(() => {
          if (email && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            resolve();
          } else {
            Swal.showValidationMessage("Please enter a valid email address");
            resolve();
          }
        }, 1000); // Simulate a 1-second delay
      });
    },
    allowOutsideClick: () => !Swal.isLoading(),
  }).then((result) => {
    if (result.isConfirmed) {
      Swal.fire({
        title: "You're on the list!",
        text: `We'll notify you at ${result.value} when the app is ready.`,
        icon: "success",
        confirmButtonColor: "#2563eb",
      });
    }
  });
}

// Smooth scroll
document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
    anchor.addEventListener("click", function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute("href"));
        if (target) {
            target.scrollIntoView({ behavior: "smooth", block: "start" });
        }
    });
});


// ==================== IMAGE TRACK SLIDING LOGIC ====================

const track = document.getElementById("image-track");

// Helper function for percentage calculation
const getPercentage = (delta, maxDelta) => (delta / maxDelta) * -100;

if (track) {
    // Only enable JS-based sliding on screens wider than 768px
    const isDesktop = window.matchMedia("(min-width: 769px)").matches;

    window.onmousedown = e => {
        // Record the starting point of the mouse drag
        track.dataset.mouseDownAt = e.clientX;
    }

    window.onmouseup = () => {
        // Reset the mouse down position when the drag ends
        track.dataset.mouseDownAt = "0";
        track.dataset.prevPercentage = track.dataset.percentage;
    }

    window.onmousemove = e => {
        // Exit if not on desktop
        if (!isDesktop) return;

        // Only run if the mouse is currently held down (dragging)
        if(track.dataset.mouseDownAt === "0") return;

        const mouseDownAt = parseFloat(track.dataset.mouseDownAt);
        const mouseDelta = mouseDownAt - e.clientX;
        const maxDelta = window.innerWidth / 2;
        
        // Calculate the new drag percentage
        const percentage = getPercentage(mouseDelta, maxDelta);
        
        // Combine the current drag with the previous position
        const prevPercentage = parseFloat(track.dataset.prevPercentage);
        const nextPercentageUnconstrained = prevPercentage + percentage;
        
        // Clamp the percentage between a reasonable range to prevent scrolling infinitely
        const nextPercentage = Math.max(Math.min(nextPercentageUnconstrained, 0), -100);
        
        // Store the current percentage
        track.dataset.percentage = nextPercentage;

        // Apply transform to the track (x-axis movement)
        track.animate({
            transform: `translate(${nextPercentage}%, -0%)`
        }, { duration: 1200, fill: "forwards" }); // Use animate for smoother transition

        // Apply a parallax effect to the individual images
        for (const image of track.getElementsByClassName("track-image")) {
            image.animate({
                objectPosition: `${100 + nextPercentage}% center`
            }, { duration: 1200, fill: "forwards" });
        }
    }
    
    // Add touch support (simplified version of mouse logic)
    track.ontouchstart = e => {
        track.dataset.mouseDownAt = e.touches[0].clientX;
    }
    
    track.ontouchend = () => {
        track.dataset.mouseDownAt = "0";
        track.dataset.prevPercentage = track.dataset.percentage;
    }
    
    track.ontouchmove = e => {
        // Exit if not on desktop
        if (!isDesktop) return;

        if(track.dataset.mouseDownAt === "0") return;
        
        const mouseDownAt = parseFloat(track.dataset.mouseDownAt);
        const mouseDelta = mouseDownAt - e.touches[0].clientX;
        const maxDelta = window.innerWidth / 2;
        
        const percentage = getPercentage(mouseDelta, maxDelta);
        const prevPercentage = parseFloat(track.dataset.prevPercentage);
        const nextPercentageUnconstrained = prevPercentage + percentage;
        const nextPercentage = Math.max(Math.min(nextPercentageUnconstrained, 0), -100);
        
        track.dataset.percentage = nextPercentage;

        // Apply transform immediately for touch (no animation needed for responsiveness)
        track.style.transform = `translate(${nextPercentage}%, -0%)`;

        for (const image of track.getElementsByClassName("track-image")) {
            image.style.objectPosition = `${100 + nextPercentage}% center`;
        }
    }
}

// ==================== CUSTOM MODAL LOGIC ====================

// Get modal elements
const modal = document.getElementById("custom-image-modal");

// Check if the modal exists before executing the rest of the modal logic
if (modal) {
    const modalImage = document.getElementById("modal-full-image");
    const modalName = document.getElementById("modal-name");
    const modalDescription = document.getElementById("modal-description");
    const modalButton = document.getElementById("modal-button");
    const modalDetails = document.getElementById("modal-details");
    const closeBtn = document.getElementsByClassName("close-btn")[0]; // Close button should exist if modal exists

    // Function to close the modal
    function closeModal() {
        // 1. Remove the 'open' class for fade-out
        modal.classList.remove("open");

        // 2. Hide display after transition completes (0.3s)
        setTimeout(() => {
             // Use display: none only after the fade-out is complete
            modal.style.display = "none";
        }, 300); // 300ms matches the CSS transition time
    }

    // Attach close events
    // We check if closeBtn exists just in case, though it should be present in the HTML if modal is present
    if (closeBtn) {
         closeBtn.onclick = closeModal;
    }
    
    window.onclick = function(event) {
        if (event.target == modal) {
            closeModal();
        }
    }

    function showGameDetails(imageElement) {
        // 1. Get details from the data attributes
        const name = imageElement.dataset.name || "Game Preview";
        const description = imageElement.dataset.description;
        const link = imageElement.dataset.link;
        const imageUrl = imageElement.src;

        // 2. Set the image source
        modalImage.src = imageUrl;
        modalImage.alt = name;
        
        // 3. Always show the name
        modalName.textContent = name;
        
        // 4. Handle Description
        if (description && description.trim().length > 0) {
            modalDescription.textContent = description;
            modalDescription.style.display = 'block';
        } else {
            modalDescription.style.display = 'none';
        }
        
        // 5. Handle Button/Link
        if (link && link.trim().length > 0) {
            modalButton.href = link;
            modalButton.style.display = 'inline-block';
        } else {
            modalButton.style.display = 'none';
        }

        // 6. Hide the whole details block if neither description nor link are present
        if ((!description || description.trim().length === 0) && (!link || link.trim().length === 0)) {
            modalDetails.style.display = 'none';
        } else {
            modalDetails.style.display = 'block';
        }

        // 7. Show the modal:
        // FIRST set display to FLEX (to center content)
        modal.style.display = 'flex';
        // THEN add the 'open' class to trigger the opacity transition
        setTimeout(() => {
            modal.classList.add('open');
        }, 10);
    }


    // Attach click listeners to all images in the track (REPLACE EXISTING)
    if (track) {
        const images = track.getElementsByClassName('track-image');
        
        for (const image of images) {
            image.addEventListener('click', function(e) {
                // Check if the user was just dragging (movement check remains for usability)
                const currentPercentage = parseFloat(track.dataset.percentage) || 0;
                const prevPercentage = parseFloat(track.dataset.prevPercentage) || 0;
                const movement = Math.abs(currentPercentage - prevPercentage);

                // If movement is small (e.g., less than 0.5%), treat it as a click
                if (movement < 0.5) {
                    showGameDetails(e.currentTarget);
                }
            });
        }
    }
}

// ==================== MOBILE NAVIGATION ====================
const navToggle = document.getElementById('nav-toggle');
const navLinks = document.getElementById('nav-links');

if (navToggle && navLinks) {
    navToggle.addEventListener('click', () => {
        const isVisible = navLinks.getAttribute('data-visible') === 'true';

        if (isVisible) {
            // Close the menu
            navLinks.setAttribute('data-visible', 'false');
            navToggle.setAttribute('aria-expanded', 'false');
            navToggle.setAttribute('aria-label', 'Open navigation menu');
            document.body.classList.remove('nav-open');
        } else {
            // Open the menu
            navLinks.setAttribute('data-visible', 'true');
            navToggle.setAttribute('aria-expanded', 'true');
            navToggle.setAttribute('aria-label', 'Close navigation menu');
            document.body.classList.add('nav-open');
        }
    });

    // Close menu when a link is clicked
    navLinks.querySelectorAll('.nav-link').forEach(link => {
        link.addEventListener('click', () => {
            const isVisible = navLinks.getAttribute('data-visible') === 'true';
            if (isVisible) {
                navLinks.setAttribute('data-visible', 'false');
                navToggle.setAttribute('aria-expanded', 'false');
                navToggle.setAttribute('aria-label', 'Open navigation menu');
                document.body.classList.remove('nav-open');
            }
        });
    });
}

// ==================== SCROLL-IN ANIMATIONS ====================
const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
            // Optional: Unobserve the element after it has become visible
            // This is a performance optimization as we don't need to watch it anymore.
            observer.unobserve(entry.target);
        }
    });
}, {
    // Options for the observer
    root: null, // relative to the viewport
    rootMargin: '0px',
    threshold: 0.1 // Trigger when 10% of the element is visible
});

// Find all elements to animate and start observing them
const elementsToAnimate = document.querySelectorAll('.fade-in-on-scroll');
elementsToAnimate.forEach(element => {
    observer.observe(element);
});

// ==================== BACK TO TOP BUTTON ====================
const backToTopButton = document.getElementById("back-to-top-btn");

if (backToTopButton) {
    window.addEventListener("scroll", () => {
        // Show button if user has scrolled down more than 300px
        if (window.scrollY > 300) {
            backToTopButton.classList.add("visible");
        } else {
            backToTopButton.classList.remove("visible");
        }
    });

    // The existing smooth scroll logic will handle the click event
    // because the button is an anchor with href="#top".
    // No extra click handler is needed here.
}


// Apply theme on load
window.addEventListener("DOMContentLoaded", applyTheme);