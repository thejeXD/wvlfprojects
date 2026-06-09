/**
 * Main Utility Module
 * Handles theme toggling, global alerts, and smooth scrolling.
 */

// Theme is permanently enforced via CSS.

// --- App Alerts ---
export function showAppInfo(appName) {
    const appDetails = {
        'grade-calculator': {
            title: "Grade Calculator",
            features: [
                "Calculate GWA across multiple subjects",
                "Predict required grades to pass",
                "Customizable weight distribution",
                "Export grades as PDF"
            ],
            perfectFor: "Students tracking academic performance"
        },
        'aguinaldo-randomizer': {
            title: "Randomizer Aguinaldo",
            features: [
                "Input Minimum and Maximum cash amounts.",
                "Set a custom Probability for top 30% of range.",
                "Designed for fun and fair holiday gift-giving!"
            ],
            perfectFor: "Deciding Christmas cash gifts in a fun way."
        },
        'follower-checkers': {
            title: 'Follower Checkers',
            text: 'This app is a utility for checking social media follower status. Details coming soon!',
            features: [],
            perfectFor: ""
        }
    };

    const details = appDetails[appName];
    if (!details) return;

    if (details.text) {
        Swal.fire({
            title: details.title,
            text: details.text,
            icon: 'info',
            confirmButtonText: 'Okay',
            confirmButtonColor: '#2563eb'
        });
        return;
    }

    const featureList = details.features.map(f => `<li>${f}</li>`).join('');
    Swal.fire({
        title: details.title,
        html: `
            <div style="text-align: left;">
                <p><strong>Features:</strong></p>
                <ul style="margin: 10px 0; padding-left: 20px;">
                    ${featureList}
                </ul>
                <p style="margin-top: 15px;"><strong>Perfect for:</strong> ${details.perfectFor}</p>
            </div>
        `,
        icon: "info",
        confirmButtonText: "Got it!",
        confirmButtonColor: "#2563eb",
    });
}

export function comingSoonAlert() {
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
      return new Promise((resolve) => {
        setTimeout(() => {
          if (email && /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/.test(email)) {
            resolve();
          } else {
            Swal.showValidationMessage("Please enter a valid email address");
            resolve();
          }
        }, 800);
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

// Attach to window to support inline onclick handlers
window.showAppInfo = showAppInfo;
window.comingSoonAlert = comingSoonAlert;

// --- Initialization ---
document.addEventListener('DOMContentLoaded', () => {
    
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
    const closeBtn = document.getElementsByClassName("close-btn")[0];
    
    // Gallery Elements
    const prevBtn = document.querySelector('.modal-prev');
    const nextBtn = document.querySelector('.modal-next');
    const dotsContainer = document.getElementById('modal-dots');
    
    let currentGalleryImages = [];
    let currentGalleryIndex = 0;

    // Function to close the modal
    function closeModal() {
        modal.classList.remove("open");
        setTimeout(() => {
            modal.style.display = "none";
        }, 300);
    }

    if (closeBtn) {
         closeBtn.onclick = closeModal;
    }
    
    window.onclick = function(event) {
        if (event.target == modal) {
            closeModal();
        }
    }
    
    function updateGalleryUI() {
        if (currentGalleryImages.length === 0) return;
        
        // Update image source
        modalImage.src = currentGalleryImages[currentGalleryIndex];
        
        // Show/Hide arrows based on image count
        if (currentGalleryImages.length > 1) {
            prevBtn.style.display = 'flex';
            nextBtn.style.display = 'flex';
        } else {
            prevBtn.style.display = 'none';
            nextBtn.style.display = 'none';
        }
        
        // Update dots
        if (dotsContainer) {
            dotsContainer.innerHTML = '';
            if (currentGalleryImages.length > 1) {
                currentGalleryImages.forEach((_, idx) => {
                    const dot = document.createElement('div');
                    dot.classList.add('modal-dot');
                    if (idx === currentGalleryIndex) dot.classList.add('active');
                    dot.addEventListener('click', () => {
                        currentGalleryIndex = idx;
                        updateGalleryUI();
                    });
                    dotsContainer.appendChild(dot);
                });
            }
        }
    }
    
    if (prevBtn) {
        prevBtn.addEventListener('click', () => {
            currentGalleryIndex = (currentGalleryIndex - 1 + currentGalleryImages.length) % currentGalleryImages.length;
            updateGalleryUI();
        });
    }
    
    if (nextBtn) {
        nextBtn.addEventListener('click', () => {
            currentGalleryIndex = (currentGalleryIndex + 1) % currentGalleryImages.length;
            updateGalleryUI();
        });
    }

    function showGameDetails(imageElement) {
        const name = imageElement.dataset.name || "Game Preview";
        const description = imageElement.dataset.description;
        const link = imageElement.dataset.link;
        
        // Parse images from data-images, fallback to src
        const imagesRaw = imageElement.dataset.images;
        if (imagesRaw && imagesRaw.trim().length > 0) {
            currentGalleryImages = imagesRaw.split(',').map(s => s.trim());
        } else {
            currentGalleryImages = [imageElement.src];
        }
        currentGalleryIndex = 0;
        
        // Update Gallery
        updateGalleryUI();
        
        modalImage.alt = name;
        modalName.textContent = name;
        
        if (description && description.trim().length > 0) {
            modalDescription.textContent = description;
            modalDescription.style.display = 'block';
        } else {
            modalDescription.style.display = 'none';
        }
        
        if (link && link.trim().length > 0) {
            modalButton.href = link;
            modalButton.style.display = 'inline-block';
        } else {
            modalButton.style.display = 'none';
        }

        if ((!description || description.trim().length === 0) && (!link || link.trim().length === 0)) {
            modalDetails.style.display = 'none';
        } else {
            modalDetails.style.display = 'block';
        }

        modal.style.display = 'flex';
        setTimeout(() => {
            modal.classList.add('open');
        }, 10);
    }

    if (track) {
        const images = track.getElementsByClassName('track-image');
        for (const image of images) {
            image.addEventListener('click', function(e) {
                const currentPercentage = parseFloat(track.dataset.percentage) || 0;
                const prevPercentage = parseFloat(track.dataset.prevPercentage) || 0;
                const movement = Math.abs(currentPercentage - prevPercentage);

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

