let currentTool = 'meme'; // To track the active tool

// --- Tab Switching Logic ---
const toolTabs = document.querySelectorAll('.tool-tab-btn');
const toolPanels = document.querySelectorAll('.tool-panel');

toolTabs.forEach(tab => {
    tab.addEventListener('click', () => {
        // Deactivate all tabs and panels
        toolTabs.forEach(t => t.classList.remove('active'));
        toolPanels.forEach(p => p.classList.remove('active'));

        // Activate the clicked tab
        tab.classList.add('active');

        // Activate the corresponding panel
        currentTool = tab.dataset.tool;
        const targetPanel = document.getElementById(`${currentTool}-tool-panel`);
        if (targetPanel) {
            targetPanel.classList.add('active');
        }
        drawMeme(); // Redraw to show/hide crop box
    });
});

// Get canvas and context
const canvas = document.getElementById('memeCanvas');
const ctx = canvas.getContext('2d');

// Get all control elements
const imageLoader = document.getElementById('imageLoader');
const imageUrlInput = document.getElementById('imageUrl');
const topTextInput = document.getElementById('topText');
const bottomTextInput = document.getElementById('bottomText');
const fontSizeSlider = document.getElementById('fontSizeSlider');
const fontSizeInput = document.getElementById('fontSizeInput');
const strokeWidthSlider = document.getElementById('strokeWidthSlider');
const strokeWidthInput = document.getElementById('strokeWidthInput');
const lineHeightSlider = document.getElementById('lineHeightSlider');
const lineHeightInput = document.getElementById('lineHeightInput');
const textColorInput = document.getElementById('textColor');
const strokeColorInput = document.getElementById('strokeColor');
const fontFamilySelect = document.getElementById('fontFamily');
// Watermark Controls
const watermarkTextInput = document.getElementById('watermarkText');
const watermarkTextSizeSlider = document.getElementById('watermarkTextSizeSlider');
const watermarkTextSizeInput = document.getElementById('watermarkTextSizeInput');
const watermarkOpacitySlider = document.getElementById('watermarkOpacitySlider');
const watermarkOpacityInput = document.getElementById('watermarkOpacityInput');
const watermarkRotationSlider = document.getElementById('watermarkRotationSlider');
const watermarkRotationInput = document.getElementById('watermarkRotationInput');
const watermarkImageLoader = document.getElementById('watermarkImageLoader');
const watermarkImageSizeSlider = document.getElementById('watermarkImageSizeSlider');
const watermarkImageSizeInput = document.getElementById('watermarkImageSizeInput');
const watermarkImageSizeContainer = document.getElementById('watermarkImageSizeContainer'); // Keep this for show/hide logic
const watermarkTypeRadios = document.querySelectorAll('input[name="watermarkType"]');
const downloadBtn = document.getElementById('downloadBtn');
const applyCropBtn = document.getElementById('applyCropBtn');
const cancelCropBtn = document.getElementById('cancelCropBtn');
const undoBtn = document.getElementById('undoBtn');
const redoBtn = document.getElementById('redoBtn');
const clearImageBtn = document.getElementById('clearImageBtn');
const fileNameDisplay = document.getElementById('fileNameDisplay');

// --- Adjust Tool Controls ---
const brightnessSlider = document.getElementById('brightnessSlider');
const brightnessInput = document.getElementById('brightnessInput');
const contrastSlider = document.getElementById('contrastSlider');
const contrastInput = document.getElementById('contrastInput');
const saturateSlider = document.getElementById('saturateSlider');
const saturateInput = document.getElementById('saturateInput');
const grayscaleSlider = document.getElementById('grayscaleSlider');
const grayscaleInput = document.getElementById('grayscaleInput');
const sepiaSlider = document.getElementById('sepiaSlider');
const sepiaInput = document.getElementById('sepiaInput');
const resetAdjustmentsBtn = document.getElementById('resetAdjustmentsBtn');


// --- Pre-load placeholder icon ---
const placeholderIcon = new Image();
placeholderIcon.crossOrigin = "Anonymous";
let placeholderIconLoaded = false;
placeholderIcon.onload = () => {
    placeholderIconLoaded = true;
    drawMeme(); // Redraw once the icon is loaded
};
placeholderIcon.src = 'https://corsproxy.io/?https%3A%2F%2Fi.pinimg.com%2F736x%2F38%2F41%2Ff7%2F3841f7d8550bf682f1c0871f0dc7a66d.jpg';

// State variables
let image = null;
let activeDragTarget = null; // Can be 'top', 'bottom', or 'watermark'
let hoverTarget = null; // For showing drag icon on hover

let history = [];
let historyIndex = -1;


let topTextState = {
    text: '',
    x: 250,
    y: 40,
    dragging: false,
    dragStartX: 0,
    dragStartY: 0
};

let bottomTextState = {
    text: '',
    x: 250,
    y: 460,
    dragging: false,
    dragStartX: 0,
    dragStartY: 0
};

let watermark = {
    type: 'text', // 'text' or 'image'
    text: '',
    image: null,
    x: 50,
    y: 50,
    rotation: 0,
    size: 100,
    dragging: false,
    dragStartX: 0,
    dragStartY: 0
};

let cropState = {
    active: false,
    isDragging: false,
    isResizing: false,
    resizeHandle: null,
    x: 50,
    y: 50,
    width: 200,
    height: 150,
    minSize: 20
};

let adjustments = {
    brightness: 100,
    contrast: 100,
    saturate: 100,
    grayscale: 0,
    sepia: 0
};


function drawMoveIcon(x, y) {
    ctx.save();
    ctx.strokeStyle = 'rgba(0, 0, 0, 0.7)';
    ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.arc(x, y, 12, 0, 2 * Math.PI);
    ctx.fill();
    ctx.stroke();
    // Arrows
    ctx.beginPath();
    ctx.moveTo(x - 5, y); ctx.lineTo(x + 5, y); // Horizontal
    ctx.moveTo(x, y - 5); ctx.lineTo(x, y + 5); // Vertical
    ctx.stroke();
    ctx.restore();
}

/**
 * A helper function to draw wrapped text on the canvas.
 * @param {CanvasRenderingContext2D} context The canvas rendering context.
 * @param {string} text The text to wrap and draw.
 * @param {number} x The x-coordinate for the center of the text.
 * @param {number} y The y-coordinate for the top of the text.
 * @param {number} maxWidth The maximum width of a line.
 * @param {number} lineHeight The height of each line.
 */
function drawWrappedText(context, text, x, y, maxWidth, lineHeight) {
    const lines = getWrappedLines(context, text, maxWidth);

    lines.forEach((line, index) => {
        context.strokeText(line.trim(), x, y + (index * lineHeight));
        context.fillText(line.trim(), x, y + (index * lineHeight));
    });
}

/**
 * A robust helper function to get an array of wrapped lines.
 * This version handles both word wrapping and character wrapping for long words.
 * @param {CanvasRenderingContext2D} context The canvas rendering context.
 * @param {string} text The text to wrap.
 * @param {number} maxWidth The maximum width of a line.
 * @returns {string[]} An array of strings, where each string is a line.
 */
function getWrappedLines(context, text, maxWidth) {
    if (!text) return [];

    const words = text.split(' ');
    const lines = [];
    let currentLine = '';

    for (const word of words) {
        const testLine = currentLine ? `${currentLine} ${word}` : word;
        const testWidth = context.measureText(testLine).width;

        if (testWidth > maxWidth) {
            if (currentLine) {
                lines.push(currentLine);
            }

            // Now, handle the word that was too long to fit.
            // It might need to be broken down by character.
            let tempWordLine = '';
            for (const char of word) {
                const testCharLine = tempWordLine + char;
                if (context.measureText(testCharLine).width > maxWidth) {
                    lines.push(tempWordLine);
                    tempWordLine = char;
                } else {
                    tempWordLine = testCharLine;
                }
            }
            currentLine = tempWordLine;
        } else {
            currentLine = testLine;
        }
    }
    if (currentLine) lines.push(currentLine);

    return lines.map(l => l.trim()).filter(l => l.length > 0);
}
// --- Main Drawing Function ---
function drawMeme() {
    if (!image) {
        // Get theme colors from CSS variables for the placeholder
        const styles = getComputedStyle(document.documentElement);
        const bgColor = styles.getPropertyValue('--bg-secondary').trim() || '#f8f9fa';
        const textColor = styles.getPropertyValue('--text-secondary').trim() || '#6c757d';

        // Reset canvas to a fixed size for the placeholder
        canvas.width = 500;
        canvas.height = 500;

        // --- Draw a more engaging, theme-aware placeholder ---
        ctx.fillStyle = bgColor;
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // Draw the pre-loaded placeholder icon
        if (placeholderIconLoaded) {
            const iconSize = 128;
            const iconX = (canvas.width - iconSize) / 2;
            const iconY = canvas.height / 2 - 100;
            ctx.globalAlpha = 0.6; // Make icon slightly transparent
            ctx.drawImage(placeholderIcon, iconX, iconY, iconSize, iconSize);
            ctx.globalAlpha = 1.0; // Reset alpha
        }

        // Text Style
        ctx.fillStyle = textColor;
        ctx.textAlign = 'center';
        ctx.font = 'bold 24px sans-serif';
        ctx.fillText('Add Your Image', canvas.width / 2, canvas.height / 2 + 30);
        ctx.font = '16px sans-serif';
        ctx.fillText('Drag & Drop, Paste, or Click to Upload', canvas.width / 2, canvas.height / 2 + 60);

        clearImageBtn.style.display = 'none'; // Hide button when no image
        return;
    }

    // --- Canvas Sizing ---
    // The actual drawing surface of the canvas is set to the image's dimensions
    // to ensure the downloaded meme is high quality.
    canvas.width = image.width;
    canvas.height = image.height;

    // The CSS controls the display size of the canvas, making it responsive.
    // We use object-fit in the CSS to handle the scaling visually.
    // This ensures the layout doesn't break with large images.
    // The canvas-container's flex properties will handle centering.

    // --- Drawing ---
    // Clear the canvas before drawing
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    // Draw the user's image onto the canvas at its full resolution.

    // --- Apply Image Adjustments ---
    // Construct the filter string from our adjustments state
    const filterString = `
        brightness(${adjustments.brightness}%)
        contrast(${adjustments.contrast}%)
        saturate(${adjustments.saturate}%)
        grayscale(${adjustments.grayscale}%)
        sepia(${adjustments.sepia}%)
    `.trim();
    ctx.filter = filterString;
    ctx.drawImage(image, 0, 0);
    // IMPORTANT: Reset the filter so it doesn't affect text, watermarks, or the crop box
    ctx.filter = 'none';

    // --- Text Styling ---
    const fontSize = fontSizeInput.value;
    const fontFamily = fontFamilySelect.value;
    ctx.font = `bold ${fontSize}px ${fontFamily}`;
    ctx.fillStyle = textColorInput.value;
    ctx.strokeStyle = strokeColorInput.value;
    ctx.lineWidth = strokeWidthInput.value;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'top';

    // --- Draw Top Text ---
    topTextState.text = topTextInput.value.toUpperCase();
    const maxTextWidth = canvas.width * 0.9; // Use 90% of canvas width as max
    const lineHeight = parseInt(fontSize, 10) * parseFloat(lineHeightInput.value);
    drawWrappedText(ctx, topTextState.text, topTextState.x, topTextState.y, maxTextWidth, lineHeight);

    // --- Draw Bottom Text ---
    ctx.textBaseline = 'bottom';
    bottomTextState.text = bottomTextInput.value.toUpperCase();
    // For bottom text, we need to calculate the starting Y position differently to "grow" upwards.
    const bottomLines = getWrappedLines(ctx, bottomTextState.text, maxTextWidth);
    bottomLines.reverse().forEach((line, index) => {
        const yPos = bottomTextState.y - (index * lineHeight);
        ctx.strokeText(line.trim(), bottomTextState.x, yPos);
        ctx.fillText(line.trim(), bottomTextState.x, yPos);
    });

    // --- Draw Watermark ---
    // Reset text baseline for watermark drawing
    ctx.textBaseline = 'alphabetic';
    ctx.textAlign = 'left';

    if (watermark.type === 'text' && watermarkTextInput.value) {
        ctx.save();
        // Translate to the watermark's position to rotate around its origin
        ctx.translate(watermark.x, watermark.y);
        ctx.rotate(watermark.rotation * Math.PI / 180); // convert degrees to radians

        ctx.font = `${watermarkTextSizeInput.value}px Arial`;
        ctx.fillStyle = `rgba(255, 255, 255, ${watermarkOpacitySlider.value})`;
        ctx.lineWidth = 1;
        ctx.strokeStyle = `rgba(0, 0, 0, ${watermarkOpacityInput.value})`;
        watermark.text = watermarkTextInput.value;
        // Draw at (0,0) because we've already translated the context
        ctx.strokeText(watermark.text, 0, 0);
        ctx.fillText(watermark.text, 0, 0);

        ctx.restore();
    } else if (watermark.type === 'image' && watermark.image) {
        ctx.save();
        // Set opacity
        ctx.globalAlpha = watermarkOpacitySlider.value;

        // Calculate center of the image for rotation
        const w = watermark.size;
        const h = watermark.image.height * (watermark.size / watermark.image.width);
        const centerX = watermark.x + w / 2;
        const centerY = watermark.y + h / 2;

        // Translate to the center, rotate, and translate back
        ctx.translate(centerX, centerY);
        ctx.rotate(watermark.rotation * Math.PI / 180);
        ctx.translate(-centerX, -centerY);

        // Draw the image
        ctx.drawImage(watermark.image, watermark.x, watermark.y, w, h);

        ctx.restore();
    }
    // --- Draw Draggable Icon on Hover ---
    if (hoverTarget === 'top' && topTextState.text) {
        const topMetrics = ctx.measureText(topTextState.text);
        drawMoveIcon(topTextState.x + topMetrics.width / 2 + 20, topTextState.y + parseInt(fontSize) / 2);
    } else if (hoverTarget === 'bottom' && bottomTextState.text) {
        const bottomMetrics = ctx.measureText(bottomTextState.text);
        drawMoveIcon(bottomTextState.x + bottomMetrics.width / 2 + 20, bottomTextState.y - parseInt(fontSize) / 2);
    } else if (hoverTarget === 'watermark' && watermark.text) {
        ctx.font = `${watermarkTextSizeInput.value}px Arial`;
        const watermarkMetrics = ctx.measureText(watermark.text);
        drawMoveIcon(watermark.x + watermarkMetrics.width + 20, watermark.y - 10);
    } else if (hoverTarget === 'watermark' && watermark.image) {
        const w = watermark.size;
        drawMoveIcon(watermark.x + w + 20, watermark.y + 20);
    }

    // --- Draw Crop Box if Crop tool is active ---
    if (currentTool === 'crop') {
        drawCropBox();
    }
}

function handleImageLoad(imageSrc) {
    // Show a loading indicator
    Swal.fire({
        title: 'Loading Image...',
        text: 'Please wait while the image is being prepared.',
        allowOutsideClick: false,
        didOpen: () => {
            Swal.showLoading();
        }
    });

    image = new Image();
    image.crossOrigin = "Anonymous"; // Allow loading images from other domains
    image.onload = () => {
        Swal.close();
        // Reset text positions when a new image is loaded
        topTextState.x = image.width / 2;
        topTextState.y = 10;
        bottomTextState.x = image.width / 2;
        bottomTextState.y = image.height - 10;

        clearImageBtn.style.display = 'block'; // Show button when image is loaded
        drawMeme(); // CRITICAL FIX: Redraw the canvas after setting the mode.
    };
    image.onerror = () => {
        Swal.fire('Error', 'Failed to load image. Check the URL or if the server allows cross-origin requests.', 'error');
        image = null;
        drawMeme();
    };
    image.src = imageSrc;
}

function clearImage() {
    image = null;
    imageLoader.value = '';
    imageUrlInput.value = '';
    clearImageBtn.style.display = 'none';    
    fileNameDisplay.textContent = 'No file chosen';

    // If we clear while on the crop tab, switch back to meme tab
    if (currentTool === 'crop') {
        document.querySelector('.tool-tab-btn[data-tool="meme"]').click();
    }

    drawMeme();
}

// --- Event Listeners ---

// Redraw when any control changes
[topTextInput, bottomTextInput, fontSizeInput, fontFamilySelect, strokeWidthInput, textColorInput, strokeColorInput, watermarkTextInput].forEach(el => {
    el.addEventListener('input', drawMeme);
});

// Sync sliders with number inputs
fontSizeSlider.addEventListener('input', (e) => {
    fontSizeInput.value = e.target.value;
    drawMeme();
});
fontSizeInput.addEventListener('input', (e) => { fontSizeSlider.value = e.target.value; });

strokeWidthSlider.addEventListener('input', (e) => {
    strokeWidthInput.value = e.target.value;
    drawMeme();
});
strokeWidthInput.addEventListener('input', (e) => { strokeWidthSlider.value = e.target.value; });

lineHeightSlider.addEventListener('input', (e) => {
    lineHeightInput.value = e.target.value;
    drawMeme();
});
lineHeightInput.addEventListener('input', (e) => { lineHeightSlider.value = e.target.value; drawMeme(); });

// Watermark Slider Sync
watermarkTextSizeSlider.addEventListener('input', (e) => {
    watermarkTextSizeInput.value = e.target.value;
    drawMeme();
});
watermarkTextSizeInput.addEventListener('input', (e) => { watermarkTextSizeSlider.value = e.target.value; drawMeme(); });

watermarkOpacitySlider.addEventListener('input', (e) => {
    watermarkOpacityInput.value = e.target.value;
    drawMeme();
});
watermarkOpacityInput.addEventListener('input', (e) => { watermarkOpacitySlider.value = e.target.value; drawMeme(); });

watermarkRotationSlider.addEventListener('input', (e) => {
    watermarkRotationInput.value = e.target.value;
    watermark.rotation = parseInt(e.target.value, 10);
    drawMeme();
});
watermarkRotationInput.addEventListener('input', (e) => { watermarkRotationSlider.value = e.target.value; watermark.rotation = parseInt(e.target.value, 10); drawMeme(); });

// --- Adjust Tool Listeners ---
function setupAdjustmentListener(slider, input, property) {
    slider.addEventListener('input', (e) => {
        input.value = e.target.value;
        adjustments[property] = e.target.value;
        drawMeme();
    });
    input.addEventListener('input', (e) => {
        slider.value = e.target.value;
        adjustments[property] = e.target.value;
        drawMeme();
    });
}

setupAdjustmentListener(brightnessSlider, brightnessInput, 'brightness');
setupAdjustmentListener(contrastSlider, contrastInput, 'contrast');
setupAdjustmentListener(saturateSlider, saturateInput, 'saturate');
setupAdjustmentListener(grayscaleSlider, grayscaleInput, 'grayscale');
setupAdjustmentListener(sepiaSlider, sepiaInput, 'sepia');

resetAdjustmentsBtn.addEventListener('click', () => {
    // Reset state object
    adjustments.brightness = 100;
    adjustments.contrast = 100;
    adjustments.saturate = 100;
    adjustments.grayscale = 0;
    adjustments.sepia = 0;

    // Reset UI sliders and inputs
    brightnessSlider.value = brightnessInput.value = 100;
    contrastSlider.value = contrastInput.value = 100;
    saturateSlider.value = saturateInput.value = 100;
    grayscaleSlider.value = grayscaleInput.value = 0;
    sepiaSlider.value = sepiaInput.value = 0;

    drawMeme();
});

// Watermark Listeners
watermarkTypeRadios.forEach(radio => {
    radio.addEventListener('change', (e) => {
        watermark.type = e.target.value;
        document.getElementById('textWatermarkSettings').style.display = (watermark.type === 'text') ? 'block' : 'none';
        document.getElementById('imageWatermarkSettings').style.display = (watermark.type === 'image') ? 'block' : 'none';
        watermarkImageSizeContainer.style.display = (watermark.type === 'image') ? 'flex' : 'none';
        drawMeme();
    });
});

watermarkImageSizeSlider.addEventListener('input', (e) => {
    watermarkImageSizeInput.value = e.target.value;
    watermark.size = parseInt(e.target.value, 10);
    drawMeme();
});
watermarkImageSizeInput.addEventListener('input', (e) => {
    watermarkImageSizeSlider.value = e.target.value;
    watermark.size = parseInt(e.target.value, 10);
    drawMeme();
});
watermarkImageLoader.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = (event) => {
            watermark.image = new Image();
            watermark.image.onload = () => drawMeme();
            watermark.image.src = event.target.result;
        };
        reader.readAsDataURL(file);
    }
});

// Crop tool buttons


// Undo/Redo Buttons
undoBtn.addEventListener('click', undo);
redoBtn.addEventListener('click', redo);

// Clear image button
clearImageBtn.addEventListener('click', clearImage);

// 1a. Image Upload from File
imageLoader.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = (event) => handleImageLoad(event.target.result);
        // Clear the URL input to avoid confusion
        imageUrlInput.value = '';
        fileNameDisplay.textContent = file.name;
        reader.readAsDataURL(file);
    }
});

// 1b. Image Upload from URL
imageUrlInput.addEventListener('change', () => {
    const imageUrl = imageUrlInput.value.trim();
    if (!imageUrl) return;

    // Use a CORS proxy to bypass browser restrictions. Public proxies can be unreliable.
    // If one fails (like returning a 500 error), try another.
    // Old proxy: `https://api.allorigins.win/raw?url=${encodeURIComponent(imageUrl)}`
    const proxiedUrl = `https://corsproxy.io/?${encodeURIComponent(imageUrl)}`;
    // Clear the file input to avoid confusion
    imageLoader.value = '';
    fileNameDisplay.textContent = 'Loaded from URL';
    handleImageLoad(proxiedUrl);
});

// 1c. Drag and Drop
canvas.addEventListener('dragover', (e) => {
    e.preventDefault(); // Prevent default browser behavior
    canvas.style.borderColor = 'var(--accent-color)';
});
canvas.addEventListener('drop', (e) => {
    e.preventDefault();
    canvas.style.borderColor = 'var(--border-color)';
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = (event) => handleImageLoad(event.target.result);
        // Clear other inputs
        imageUrlInput.value = '';
        imageLoader.value = '';
        fileNameDisplay.textContent = file.name;
        reader.readAsDataURL(file);
    }
});

// 1d. Paste from Clipboard
document.addEventListener('paste', (e) => {
    const items = e.clipboardData.items;
    for (const item of items) {
        if (item.type.indexOf('image') !== -1) {
            const blob = item.getAsFile();
            const reader = new FileReader();
            reader.onload = (event) => handleImageLoad(event.target.result);
            // Clear other inputs
            imageUrlInput.value = '';
            imageLoader.value = '';
            fileNameDisplay.textContent = 'Pasted from clipboard';
            reader.readAsDataURL(blob);
            e.preventDefault(); // Prevent pasting image into input fields
            break; // Stop after finding the first image
        }
    }
});

// 2. Draggable Watermark
canvas.addEventListener('mousedown', (e) => {
    const rect = canvas.getBoundingClientRect();
    // Scale mouse coordinates to match canvas coordinates if canvas is scaled by CSS
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    const mouseX = (e.clientX - rect.left) * scaleX;
    const mouseY = (e.clientY - rect.top) * scaleY;

    // If crop tool is active, prioritize its interactions
    if (currentTool === 'crop' && image) {
        handleCropMouseDown(mouseX, mouseY);
        return; // Stop further processing to prevent dragging text while cropping
    }

    // --- Check for Top Text Drag ---
    saveStateForUndo(); // Save state before a potential drag starts
    ctx.font = `bold ${fontSizeInput.value}px ${fontFamilySelect.value}`;
    ctx.textAlign = 'center';
    const topMetrics = ctx.measureText(topTextState.text);
    const topLines = getWrappedLines(ctx, topTextState.text, canvas.width * 0.9);
    const topTextHeight = topLines.length * (parseInt(fontSizeInput.value, 10) * parseFloat(lineHeightInput.value));
    if (mouseX > topTextState.x - topMetrics.width / 2 && mouseX < topTextState.x + topMetrics.width / 2 &&
        mouseY > topTextState.y && mouseY < topTextState.y + topTextHeight) {
        activeDragTarget = 'top';
        topTextState.dragStartX = mouseX - topTextState.x;
        topTextState.dragStartY = mouseY - topTextState.y;
        canvas.style.cursor = 'grabbing';
        return;
    }

    // --- Check for Bottom Text Drag ---
    const bottomMetrics = ctx.measureText(bottomTextState.text);
    const bottomLines = getWrappedLines(ctx, bottomTextState.text, canvas.width * 0.9);
    const bottomTextHeight = bottomLines.length * (parseInt(fontSizeInput.value, 10) * parseFloat(lineHeightInput.value));
    if (mouseX > bottomTextState.x - bottomMetrics.width / 2 && mouseX < bottomTextState.x + bottomMetrics.width / 2 &&
        mouseY < bottomTextState.y && mouseY > bottomTextState.y - bottomTextHeight) {
        activeDragTarget = 'bottom';
        bottomTextState.dragStartX = mouseX - bottomTextState.x;
        bottomTextState.dragStartY = mouseY - bottomTextState.y;
        canvas.style.cursor = 'grabbing';
        return;
    }


    // Check if click is on the watermark
    if (watermark.type === 'text' && watermark.text) {
        ctx.font = `${watermarkTextSizeInput.value}px Arial`;
        const textMetrics = ctx.measureText(watermark.text);
        const textWidth = textMetrics.width;
        const textHeight = 20; // Approximate height

        // This hit detection is simplified and won't be perfect for rotated text
        if (mouseX >= watermark.x && mouseX <= watermark.x + textWidth && // NOSONAR
            mouseY >= watermark.y - textHeight && mouseY <= watermark.y) {
            activeDragTarget = 'watermark';
            canvas.style.cursor = 'grabbing';
            watermark.dragStartX = mouseX - watermark.x;
            watermark.dragStartY = mouseY - watermark.y;
            return;
        }
    }
    if (watermark.type === 'image' && watermark.image) {
        const w = watermark.size;
        const h = watermark.image.height * (w / watermark.image.width);
        if (mouseX >= watermark.x && mouseX <= watermark.x + w &&
            mouseY >= watermark.y && mouseY <= watermark.y + h) {
            activeDragTarget = 'watermark';
            canvas.style.cursor = 'grabbing';
            watermark.dragStartX = mouseX - watermark.x;
            watermark.dragStartY = mouseY - watermark.y;
            return;
        }
    }
});

canvas.addEventListener('mousemove', (e) => {
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    const mouseX = (e.clientX - rect.left) * scaleX;
    const mouseY = (e.clientY - rect.top) * scaleY;

    // Handle crop tool mouse move
    if (currentTool === 'crop' && image) {
        handleCropMouseMove(mouseX, mouseY);
        // Don't return, so text drag can still work if needed, but crop cursor will take precedence
    }

    if (!activeDragTarget) {
        // --- Hover detection to show drag icon ---
        let foundTarget = null;
        // Top text
        ctx.font = `bold ${fontSizeInput.value}px ${fontFamilySelect.value}`;
        ctx.textAlign = 'center';
        const topMetrics = ctx.measureText(topTextState.text);
        const topLines = getWrappedLines(ctx, topTextState.text, canvas.width * 0.9);
        const topTextHeight = topLines.length * (parseInt(fontSizeInput.value, 10) * parseFloat(lineHeightInput.value));
        if (topTextState.text && mouseX > topTextState.x - topMetrics.width / 2 && mouseX < topTextState.x + topMetrics.width / 2 &&
            mouseY > topTextState.y && mouseY < topTextState.y + topTextHeight) {
            foundTarget = 'top';
        }
        // Bottom text
        const bottomMetrics = ctx.measureText(bottomTextState.text);
        const bottomLines = getWrappedLines(ctx, bottomTextState.text, canvas.width * 0.9);
        const bottomTextHeight = bottomLines.length * (parseInt(fontSizeInput.value, 10) * parseFloat(lineHeightInput.value));
        if (bottomTextState.text && mouseX > bottomTextState.x - bottomMetrics.width / 2 && mouseX < bottomTextState.x + bottomMetrics.width / 2 &&
            mouseY < bottomTextState.y && mouseY > bottomTextState.y - bottomTextHeight) {
            foundTarget = 'bottom';
        }
        // Watermark
        if (watermark.type === 'text' && watermark.text) {
            ctx.font = `${watermarkTextSizeInput.value}px Arial`;
            const textMetrics = ctx.measureText(watermark.text);
            // Simplified hit detection for hover
            if (mouseX >= watermark.x && mouseX <= watermark.x + textMetrics.width && mouseY >= watermark.y - 20 && mouseY <= watermark.y) { // NOSONAR
                foundTarget = 'watermark';
            }
        } else if (watermark.type === 'image' && watermark.image) {
            const w = watermark.size;
            const h = watermark.image.height * (w / watermark.image.width);
            if (mouseX >= watermark.x && mouseX <= watermark.x + w &&
                mouseY >= watermark.y && mouseY <= watermark.y + h) {
                foundTarget = 'watermark';
            }
        }
        if (hoverTarget !== foundTarget) {
            hoverTarget = foundTarget;
            drawMeme();
        }
    }

    switch (activeDragTarget) {
        case 'top':
            topTextState.x = mouseX - topTextState.dragStartX; // NOSONAR
            topTextState.y = mouseY - topTextState.dragStartY; // NOSONAR
            break;
        case 'bottom':
            bottomTextState.x = mouseX - bottomTextState.dragStartX;
            bottomTextState.y = mouseY - bottomTextState.dragStartY;
            break;
        case 'watermark':
            watermark.x = mouseX - watermark.dragStartX;
            watermark.y = mouseY - watermark.dragStartY;
            break;
    }

    if (activeDragTarget) {
        drawMeme();
    }
});

function stopDragging() {
    // Handle crop state
    if (cropState.isDragging || cropState.isResizing) {
        cropState.isDragging = false;
        cropState.isResizing = false;
        saveStateForUndo(); // Save state after a crop adjustment
    }

    // Handle text/watermark state
    activeDragTarget = null;
    hoverTarget = null;
    canvas.style.cursor = 'grab'; // Or 'default'
}

canvas.addEventListener('mouseup', stopDragging);
canvas.addEventListener('mouseleave', stopDragging);

// --- Undo/Redo Logic ---

function saveStateForUndo() {
    // Clear the "redo" history if we make a new change after undoing
    if (historyIndex < history.length - 1) {
        history = history.slice(0, historyIndex + 1);
    }

    const currentState = {
        topX: topTextState.x,
        topY: topTextState.y,
        bottomX: bottomTextState.x,
        bottomY: bottomTextState.y,
        watermarkX: watermark.x,
        watermarkY: watermark.y,
        crop: { ...cropState }
    };

    history.push(currentState);
    historyIndex++;
    updateUndoRedoButtons();
}

function applyState(state) {
    topTextState.x = state.topX;
    topTextState.y = state.topY;
    bottomTextState.x = state.bottomX;
    bottomTextState.y = state.bottomY;
    watermark.x = state.watermarkX;
    watermark.y = state.watermarkY;
    cropState = { ...state.crop };
    drawMeme();
}

function undo() {
    if (historyIndex > 0) {
        historyIndex--;
        applyState(history[historyIndex]);
        updateUndoRedoButtons();
    }
}

function redo() {
    if (historyIndex < history.length - 1) {
        historyIndex++;
        applyState(history[historyIndex]);
        updateUndoRedoButtons();
    }
}

function updateUndoRedoButtons() {
    undoBtn.disabled = historyIndex <= 0;
    redoBtn.disabled = historyIndex >= history.length - 1;
}

// Keyboard shortcuts for undo/redo
document.addEventListener('keydown', (e) => {
    if (e.ctrlKey || e.metaKey) {
        if (e.key === 'z') { e.preventDefault(); undo(); }
        if (e.key === 'y') { e.preventDefault(); redo(); }
    }
});

// --- CROP TOOL LOGIC ---

function drawCropBox() {
    ctx.save();
    // Draw semi-transparent overlay outside the crop box
    ctx.fillStyle = 'rgba(0, 0, 0, 0.6)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Clear the inside of the crop box
    ctx.clearRect(cropState.x, cropState.y, cropState.width, cropState.height);

    // Draw the image again, but only inside the clear rectangle
    ctx.drawImage(image, cropState.x, cropState.y, cropState.width, cropState.height, cropState.x, cropState.y, cropState.width, cropState.height);

    // Draw the crop box border
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.9)';
    ctx.lineWidth = 2;
    ctx.strokeRect(cropState.x, cropState.y, cropState.width, cropState.height);

    // Draw resize handles
    ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
    const handleSize = 10;
    const handles = getCropHandles();
    for (const handle in handles) {
        const pos = handles[handle];
        ctx.fillRect(pos.x - handleSize / 2, pos.y - handleSize / 2, handleSize, handleSize);
    }
    ctx.restore();
}

function getCropHandles() {
    const { x, y, width, height } = cropState;
    return {
        tl: { x: x, y: y },
        tm: { x: x + width / 2, y: y },
        tr: { x: x + width, y: y },
        ml: { x: x, y: y + height / 2 },
        mr: { x: x + width, y: y + height / 2 },
        bl: { x: x, y: y + height },
        bm: { x: x + width / 2, y: y + height },
        br: { x: x + width, y: y + height }
    };
}

function getHandleAt(mouseX, mouseY) {
    const handles = getCropHandles();
    const handleSize = 16; // Larger hit area
    for (const name in handles) {
        const pos = handles[name];
        if (Math.abs(mouseX - pos.x) < handleSize / 2 && Math.abs(mouseY - pos.y) < handleSize / 2) {
            return name;
        }
    }
    return null;
}

function handleCropMouseDown(mouseX, mouseY) {
    const handle = getHandleAt(mouseX, mouseY);
    if (handle) {
        cropState.isResizing = true;
        cropState.resizeHandle = handle;
        saveStateForUndo();
    } else if (mouseX > cropState.x && mouseX < cropState.x + cropState.width && mouseY > cropState.y && mouseY < cropState.y + cropState.height) {
        cropState.isDragging = true;
        cropState.dragStartX = mouseX - cropState.x;
        cropState.dragStartY = mouseY - cropState.y;
        saveStateForUndo();
    }
}

function handleCropMouseMove(mouseX, mouseY) {
    const handle = getHandleAt(mouseX, mouseY);
    let cursor = 'default';
    if (handle) {
        if (handle.includes('t') || handle.includes('b')) cursor = 'ns-resize';
        if (handle.includes('l') || handle.includes('r')) cursor = 'ew-resize';
        if ((handle === 'tl' || handle === 'br')) cursor = 'nwse-resize';
        if ((handle === 'tr' || handle === 'bl')) cursor = 'nesw-resize';
    } else if (mouseX > cropState.x && mouseX < cropState.x + cropState.width && mouseY > cropState.y && mouseY < cropState.y + cropState.height) {
        cursor = 'move';
    }
    canvas.style.cursor = cursor;

    if (cropState.isDragging) {
        cropState.x = mouseX - cropState.dragStartX;
        cropState.y = mouseY - cropState.dragStartY;
        drawMeme();
    } else if (cropState.isResizing) {
        const { x, y, width, height } = cropState;
        if (cropState.resizeHandle.includes('r')) cropState.width = Math.max(cropState.minSize, mouseX - x);
        if (cropState.resizeHandle.includes('l')) {
            const newWidth = x + width - mouseX;
            if (newWidth > cropState.minSize) {
                cropState.width = newWidth;
                cropState.x = mouseX;
            }
        }
        if (cropState.resizeHandle.includes('b')) cropState.height = Math.max(cropState.minSize, mouseY - y);
        if (cropState.resizeHandle.includes('t')) {
            const newHeight = y + height - mouseY;
            if (newHeight > cropState.minSize) {
                cropState.height = newHeight;
                cropState.y = mouseY;
            }
        }
        drawMeme();
    }
}

function applyCrop() {
    if (!image) return;

    const tempCanvas = document.createElement('canvas');
    const tempCtx = tempCanvas.getContext('2d');
    tempCanvas.width = cropState.width;
    tempCanvas.height = cropState.height;

    tempCtx.drawImage(image, cropState.x, cropState.y, cropState.width, cropState.height, 0, 0, cropState.width, cropState.height);

    // Create a new image object from the cropped canvas data
    const newImage = new Image();
    newImage.onload = () => {
        // Replace the main image and re-initialize the editor, skipping the crop step this time.
        handleImageLoad(newImage.src, true);
    };
    newImage.src = tempCanvas.toDataURL();
}

function cancelCrop() {
  // This function is no longer needed in the new workflow.
  // The 'skip' button now calls enterMemeMode directly.
}
