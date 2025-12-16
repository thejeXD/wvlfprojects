/**
 * Instagram Mockup Application
 * Handles real-time preview generation for Instagram posts.
 */
class InstagramMockupApp {
    constructor() {
        this.state = {
            username: 'wolf_designs',
            location: '',
            caption: 'Creating something amazing! 🐺 #design #mockup',
            likes: '1,234',
            timestamp: '2 HOURS AGO',
            verified: true,
            verifiedCaption: false,
            format: 'square', // square, portrait, landscape
            profileImage: null,
            //postImage: null, // No longer needed. Images are in 'postImages'
            recentlyDeleted: [],
            postImages: [], // Array of images for carousel
            darkMode: false
        };
        this.currentImageIndex = 0;

        this.dom = {};
        this._init();
    }

    _init() {
        this._cacheDOM();
        this._loadState();
        this._bindEvents();
        this._initSortable();
        this._updatePreview();
        this._renderLayers();
        this._renderRecentlyDeleted();
        this._updateCharCount();
        console.log('Instagram Mockup App Initialized');
    }

    _cacheDOM() {
        // --- Inputs ---
        this.dom.usernameInput = document.getElementById('input-username');
        this.dom.locationInput = document.getElementById('input-location');
        this.dom.captionInput = document.getElementById('input-caption');
        this.dom.captionCharCount = document.getElementById('caption-char-count');
        this.dom.likesInput = document.getElementById('input-likes');
        this.dom.timestampInput = document.getElementById('input-timestamp');
        
        // Toggles & Selects
        this.dom.verifiedInput = document.getElementById('input-verified');
        this.dom.verifiedCaptionInput = document.getElementById('input-verified-caption');
        this.dom.darkModeInput = document.getElementById('input-darkmode');
        this.dom.formatSelect = document.getElementById('input-format');
        
        // File Uploads
        this.dom.profileUpload = document.getElementById('upload-profile');
        this.dom.postUpload = document.getElementById('upload-post'); // For multiple images
        
        // --- Preview Elements ---
        this.dom.previewCard = document.getElementById('preview-card');
        this.dom.pUsernames = document.querySelectorAll('.preview-username'); // Updates both header and caption username
        this.dom.pLocation = document.getElementById('preview-location');
        this.dom.pProfilePic = document.getElementById('preview-profile-pic');
        this.dom.pVerified = document.getElementById('preview-verified');
        
        // Carousel
        this.dom.carouselContainer = document.getElementById('carousel-container');
        this.dom.carouselPrev = document.getElementById('carousel-prev');
        this.dom.carouselNext = document.getElementById('carousel-next');
        this.dom.pPostImageContainer = document.getElementById('preview-image-container');
        this.dom.pPostImage = document.getElementById('preview-post-image');
        
        // Layers
        this.dom.layersList = document.getElementById('layers-list');
        this.dom.clearLayersBtn = document.getElementById('btn-clear-layers');
        this.dom.toggleDeletedBtn = document.getElementById('toggle-deleted-btn');
        this.dom.recentlyDeletedPanel = document.getElementById('recently-deleted-panel');
        this.dom.clearDeletedPermanentlyBtn = document.getElementById('btn-clear-deleted-permanently');
        this.dom.recentlyDeletedContainer = document.getElementById('recently-deleted-container');
        this.dom.loadingOverlay = document.getElementById('loading-overlay');

        this.dom.pCaption = document.getElementById('preview-caption');
        this.dom.pLikes = document.getElementById('preview-likes');
        this.dom.pTimestamp = document.getElementById('preview-timestamp');

        // Actions

        this.dom.downloadBtn = document.getElementById('btn-download');
        this.dom.saveDraftBtn = document.getElementById('btn-save-draft');
    }


    _bindEvents() {
        // Text Input Listeners
        const textInputs = ['username', 'location', 'caption', 'likes', 'timestamp'];
        textInputs.forEach(key => {
            const input = this.dom[`${key}Input`];
            if (input) {
                input.addEventListener('input', (e) => {
                    this.state[key] = e.target.value;
                    this._updatePreview();
                    this._saveState();
                    if (key === 'caption') this._updateCharCount();
                });
            }
        });

        // Toggle Listeners
        if (this.dom.verifiedInput) {
            this.dom.verifiedInput.addEventListener('change', (e) => {
                this.state.verified = e.target.checked;
                this._updatePreview();
                this._saveState();
            });
        }

        if (this.dom.verifiedCaptionInput) {
            this.dom.verifiedCaptionInput.addEventListener('change', (e) => {
                this.state.verifiedCaption = e.target.checked;
                this._updatePreview();
                this._saveState();
            });
        }

        if (this.dom.darkModeInput) {
            this.dom.darkModeInput.addEventListener('change', (e) => {
                this.state.darkMode = e.target.checked;
                this._updatePreview();
                this._saveState();
            });
        }

        // Format Selection
        if (this.dom.formatSelect) {
            this.dom.formatSelect.addEventListener('change', (e) => {
                this.state.format = e.target.value;
                this._updatePreview();
                this._saveState();
            });
        }

        // Image Uploads
        if (this.dom.profileUpload) {
            this.dom.profileUpload.addEventListener('change', (e) => this._handleImageUpload(e, 'profileImage'));
        }
        if (this.dom.postUpload) {
            this.dom.postUpload.addEventListener('change', (e) => this._handleImageUpload(e, 'postImage'));
         }

        // Download Action
        if (this.dom.downloadBtn) {
            this.dom.downloadBtn.addEventListener('click', () => this._downloadMockup());
        }
        if (this.dom.saveDraftBtn) {
            this.dom.saveDraftBtn.addEventListener('click', () => this._saveDraft());
        }

        // Clear Layers
        if (this.dom.clearLayersBtn) {
            this.dom.clearLayersBtn.addEventListener('click', () => this._clearAllLayers());
        }

        // Recently Deleted Panel
        if (this.dom.toggleDeletedBtn) {
            this.dom.toggleDeletedBtn.addEventListener('click', () => this._toggleRecentlyDeleted());
        }
        if (this.dom.clearDeletedPermanentlyBtn) {
            this.dom.clearDeletedPermanentlyBtn.addEventListener('click', () => this._clearDeletedPermanently());
        }

        // Carousel Navigation
        if (this.dom.carouselPrev) {
            this.dom.carouselPrev.addEventListener('click', () => {
                if (this.state.postImages.length > 1) {
                    this.currentImageIndex = (this.currentImageIndex - 1 + this.state.postImages.length) % this.state.postImages.length;
                    this._updatePreview();
                }
            });
        }
        if (this.dom.carouselNext) {
            this.dom.carouselNext.addEventListener('click', () => {
                if (this.state.postImages.length > 1) {
                    this.currentImageIndex = (this.currentImageIndex + 1) % this.state.postImages.length;
                    this._updatePreview();
                }
            });
        }

        // Drag and Drop on Preview Card
        if (this.dom.previewCard) {
            ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
                this.dom.previewCard.addEventListener(eventName, (e) => {
                    e.preventDefault();
                    e.stopPropagation();
                });
            });

            this.dom.previewCard.addEventListener('dragover', () => {
                this.dom.previewCard.classList.add('drag-over');
            });

            this.dom.previewCard.addEventListener('dragleave', (e) => {
                // Only remove if leaving the card entirely (not entering a child element)
                if (!this.dom.previewCard.contains(e.relatedTarget)) {
                    this.dom.previewCard.classList.remove('drag-over');
                }
            });

            this.dom.previewCard.addEventListener('drop', (e) => this._handleDrop(e));
        }
    }

    _initSortable() {
        if (this.dom.layersList && typeof Sortable !== 'undefined') {
            Sortable.create(this.dom.layersList, {
                animation: 150,
                handle: '.layer-item', // Make whole item draggable
                onEnd: (evt) => {
                    // Reorder array based on drag
                    const item = this.state.postImages.splice(evt.oldIndex, 1)[0];
                    this.state.postImages.splice(evt.newIndex, 0, item);
                    
                    // Reset index to 0 to avoid out of bounds issues
                    this.currentImageIndex = 0;
                    this._updatePreview();
                    this._renderLayers(); // Re-render to ensure indices are correct
                    this._saveState();
                }
            });
        }
    }

    _showLoading() {
        if (this.dom.loadingOverlay) this.dom.loadingOverlay.style.display = 'flex';
    }

    _hideLoading() {
        if (this.dom.loadingOverlay) this.dom.loadingOverlay.style.display = 'none';
    }

    _handleDrop(e) {
        this.dom.previewCard.classList.remove('drag-over');
        const files = Array.from(e.dataTransfer.files).filter(file => file.type.startsWith('image/'));
        
        if (files.length === 0) return;

        if (e.target.id === 'preview-profile-pic') {
            const file = files[0];
            const reader = new FileReader();
            reader.onload = (evt) => {
                this.state.profileImage = evt.target.result;
                this._updatePreview();
                this._saveState();
            };
            reader.readAsDataURL(file);
        } else {
            this._processPostImages(files);
        }
    }

    _processPostImages(files) {
        const currentCount = this.state.postImages.length;
        const maxImages = 20;
        const remaining = maxImages - currentCount;

        if (remaining <= 0) {
            Swal.fire({
                icon: 'warning',
                title: 'Limit Reached',
                text: 'You have reached the maximum limit of 20 images.',
                confirmButtonColor: '#2563eb'
            });
            return;
        }

        if (files.length > remaining) {
            Swal.fire({
                icon: 'warning',
                title: 'Image Limit Exceeded',
                text: `You can only upload a maximum of 20 images. The first ${remaining} images from this batch have been added.`,
                confirmButtonColor: '#2563eb'
            });
            files = files.slice(0, remaining);
        }

        this._showLoading();
        
        const promises = files.map(file => {
            return new Promise((resolve) => {
                const reader = new FileReader();
                reader.onload = (e) => resolve({
                    src: e.target.result,
                    name: file.name,
                    size: this._formatFileSize(file.size)
                });
                reader.readAsDataURL(file);
            });
        });

        Promise.all(promises).then(newImages => {
            this.state.postImages = this.state.postImages.concat(newImages);
            if (this.currentImageIndex >= this.state.postImages.length) {
                this.currentImageIndex = 0;
            }
            this._updatePreview();
            this._renderLayers();
            this._saveState();
            this._hideLoading();
            if (this.dom.postUpload) this.dom.postUpload.value = '';
        });
    }

    // Multiple Image Uploads
    _handleImageUpload(event, stateKey) {
        const files = Array.from(event.target.files);
        if (!files || files.length === 0) return;

        if (stateKey === 'postImage') {
            this._processPostImages(files);
        } else {
            // Single image (Profile)
            const file = files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = (e) => {
                    this.state[stateKey] = e.target.result;
                    this._updatePreview();
                    this._saveState();
                };
                reader.readAsDataURL(file);
            }
        }
    }

    _restoreLayer(index) {
        if (index >= 0 && index < this.state.recentlyDeleted.length) {
            const restoredImage = this.state.recentlyDeleted.splice(index, 1)[0];
            this.state.postImages.push(restoredImage);
            this.currentImageIndex = this.state.postImages.length - 1;

            this._updatePreview();
            this._renderLayers();
            this._renderRecentlyDeleted();
            this._saveState();
        }
    }

    _deleteLayer(index) {
        if (index >= 0 && index < this.state.postImages.length) {
            const deletedImage = this.state.postImages[index];

            // Adjust currentImageIndex logic
            if (index < this.currentImageIndex) {
                // If deleting an image before current, shift index left to stay on same image
                this.currentImageIndex--;
            } else if (index === this.currentImageIndex) {
                // If deleting current image, and it's the last one, move to previous
                if (this.state.postImages.length > 1 && index === this.state.postImages.length - 1) {
                    this.currentImageIndex--;
                }
                // If it's not the last one, index stays same (which becomes the next image)
            }

            this.state.postImages.splice(index, 1);
            this.state.recentlyDeleted.push(deletedImage);

            // Ensure index is valid (handle empty case)
            this.currentImageIndex = Math.max(0, this.currentImageIndex);

            this._updatePreview();
            this._renderLayers();
            this._renderRecentlyDeleted();
            this._saveState();
        }
    }

    _clearAllLayers() {
        if (this.state.postImages.length === 0) return;

        Swal.fire({
            title: 'Move all to Recently Deleted?',
            text: "This will move all active images to the 'Recently Deleted' section.",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#ef4444',
            cancelButtonText: 'Cancel',
            confirmButtonText: 'Yes, move all'
        }).then((result) => {
            if (result.isConfirmed) {
                this.state.recentlyDeleted = this.state.recentlyDeleted.concat(this.state.postImages);
                this.state.postImages = [];
                this.currentImageIndex = 0;
                this._updatePreview();
                this._renderLayers();
                this._renderRecentlyDeleted();
                this._saveState();
            }
        });
    }

    _formatFileSize(bytes) {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }

    _renderLayers() {
        if (!this.dom.layersList) return;
        
        if (this.dom.clearLayersBtn) {
            this.dom.clearLayersBtn.style.display = this.state.postImages.length > 0 ? 'block' : 'none';
        }

        this.dom.layersList.innerHTML = '';
        
        if (this.state.postImages.length === 0) {
            this.dom.layersList.innerHTML = '<p style="text-align:center; color:var(--text-secondary); font-size:0.9rem;">No images uploaded</p>';
            return;
        }

        // Count occurrences to identify duplicates based on name and size
        const occurrenceMap = {};
        this.state.postImages.forEach(img => {
            const name = typeof img === 'string' ? 'Image' : img.name;
            const size = typeof img === 'string' ? '' : img.size;
            const key = name + size;
            occurrenceMap[key] = (occurrenceMap[key] || 0) + 1;
        });

        this.state.postImages.forEach((imgData, index) => {
            const item = document.createElement('div');
            item.className = `layer-item ${index === this.currentImageIndex ? 'active' : ''}`;
            item.dataset.index = index;
            
            const src = typeof imgData === 'string' ? imgData : imgData.src;
            const name = typeof imgData === 'string' ? `Image ${index + 1}` : imgData.name;
            const size = typeof imgData === 'string' ? '' : imgData.size;

            // Check for duplicate
            const key = name + size;
            const isDuplicate = occurrenceMap[key] > 1;

            item.innerHTML = `
                <img src="${src}" class="layer-thumb">
                <div class="layer-info">
                    <div class="layer-name" title="${name}">
                        ${name}
                        ${isDuplicate ? '<span class="duplicate-tag">Duplicate</span>' : ''}
                    </div>
                    ${size ? `<div class="layer-size">${size}</div>` : ''}
                </div>
                <button class="layer-delete" title="Delete Layer">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
                </button>
            `;
            
            // Click to select layer
            item.addEventListener('click', (e) => {
                if (e.target.closest('.layer-delete')) return;
                this.currentImageIndex = index;
                this._updatePreview();
            });

            // Delete event
            item.querySelector('.layer-delete').addEventListener('click', (e) => {
                e.stopPropagation();
                this._deleteLayer(index);
            });
            
            this.dom.layersList.appendChild(item);
        });
    }

    _renderRecentlyDeleted() {
        if (!this.dom.recentlyDeletedContainer) return;

        if (this.dom.clearDeletedPermanentlyBtn) {
            this.dom.clearDeletedPermanentlyBtn.style.display = this.state.recentlyDeleted.length > 0 ? 'block' : 'none';
        }

        this.dom.recentlyDeletedContainer.innerHTML = '';
        if (this.state.recentlyDeleted.length === 0) {
            this.dom.recentlyDeletedContainer.innerHTML = '<p style="text-align:center; color:var(--text-secondary); font-size:0.9rem;">No recently deleted images</p>';
            return;
        }

        this.state.recentlyDeleted.forEach((imgData, index) => {
            const item = document.createElement('div');
            item.className = 'layer-item';
            item.dataset.index = index;

            const src = typeof imgData === 'string' ? imgData : imgData.src;
            const name = typeof imgData === 'string' ? `Image ${index + 1}` : imgData.name;
            const size = typeof imgData === 'string' ? '' : imgData.size;

           item.innerHTML = `
                <img src="${src}" class="layer-thumb">
                <div class="layer-info">
                    <div class="layer-name" title="${name}">${name}</div>
                    ${size ? `<div class="layer-size">${size}</div>` : ''}
                </div>
                <button class="layer-restore" title="Restore Layer">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="5 10 7 12 12 7"></polyline><path d="M12 15a7 7 0 1 1 0-14 7 7 0 0 1 0 14z"></path></svg>
                </button>
            `;

            item.querySelector('.layer-restore').addEventListener('click', (e) => {
                e.stopPropagation();
                this._restoreLayer(index);
            });

            this.dom.recentlyDeletedContainer.appendChild(item);
        });
    }

    _toggleRecentlyDeleted() {
        const panel = this.dom.recentlyDeletedPanel;
        const btn = this.dom.toggleDeletedBtn;
        if (!panel || !btn) return;

        if (panel.style.display === 'none') {
            panel.style.display = 'block';
            btn.classList.add('active');
            this._renderRecentlyDeleted(); // Ensure it's up-to-date when shown
        } else {
            panel.style.display = 'none';
            btn.classList.remove('active');
        }
    }

    _clearDeletedPermanently() {
        if (this.state.recentlyDeleted.length === 0) return;

        Swal.fire({
            title: 'Permanently Delete?',
            text: "This will permanently delete all images in the 'Recently Deleted' section. This action cannot be undone.",
            icon: 'error',
            showCancelButton: true,
            confirmButtonColor: '#ef4444',
            confirmButtonText: 'Yes, Delete Permanently'
        }).then((result) => {
            if (result.isConfirmed) {
                this.state.recentlyDeleted = [];
                this._renderRecentlyDeleted();
                this._saveState();
            }
        });
    }

    _updateLayerHighlight() {
        if (!this.dom.layersList) return;
        const items = this.dom.layersList.querySelectorAll('.layer-item');
        items.forEach((item, index) => {
            if (index === this.currentImageIndex) {
                item.classList.add('active');
                item.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
            } else {
                item.classList.remove('active');
            }
        });
    }

    _updatePreview() {
        // 1. Update Text Content
        this.dom.pUsernames.forEach(el => el.textContent = this.state.username);
        
        if (this.dom.pLocation) {
            this.dom.pLocation.textContent = this.state.location;
            this.dom.pLocation.style.display = this.state.location ? 'block' : 'none';
        }

        if (this.dom.pCaption) {
            // Format: Username (bold) + Badge + Caption
            const verifiedBadgeHTML = `<svg class="ig-verified-badge" style="display:inline-block; vertical-align:text-bottom; margin-left:2px; width:12px; height:12px;" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg"><path fill-rule="evenodd" clip-rule="evenodd" d="M20 0C31.0457 0 40 8.9543 40 20C40 31.0457 31.0457 40 20 40C8.9543 40 0 31.0457 0 20C0 8.9543 8.9543 0 20 0ZM16.3636 29.0909L30.9091 14.5455L28 11.6364L16.3636 23.2727L12 18.9091L9.09091 21.8182L16.3636 29.0909Z" fill="#3897F0"/></svg>`;
            const badge = this.state.verifiedCaption ? verifiedBadgeHTML : '';
            this.dom.pCaption.innerHTML = `<span style="font-weight: 600; margin-right: ${this.state.verifiedCaption ? '0' : '4px'}">${this.state.username}</span>${badge} ${this.state.caption.replace(/\n/g, '<br>')}`;
        }

        if (this.dom.pLikes) this.dom.pLikes.textContent = `${this.state.likes} likes`;
        if (this.dom.pTimestamp) this.dom.pTimestamp.textContent = this.state.timestamp.toUpperCase();

        // 2. Update Visibility
        if (this.dom.pVerified) {
            this.dom.pVerified.style.display = this.state.verified ? 'inline-flex' : 'none';
        }

        // 3. Update Images
        if (this.state.profileImage && this.dom.pProfilePic) {
            this.dom.pProfilePic.src = this.state.profileImage;
        }
        // Set First Image Carousel
        if (this.state.postImages.length > 0) {
             if (this.dom.pPostImage) {
                const imgData = this.state.postImages[this.currentImageIndex];
                if (imgData) {
                    this.dom.pPostImage.src = typeof imgData === 'string' ? imgData : imgData.src;
                }
            }

            // Always show container if we have images
            if (this.dom.carouselContainer) this.dom.carouselContainer.style.display = 'flex';
            
            // Handle Button Visibility (Only show if more than 1 image)
            const showButtons = this.state.postImages.length > 1;
            
            if (this.dom.carouselPrev) {
                this.dom.carouselPrev.style.display = (showButtons && this.currentImageIndex > 0) ? 'flex' : 'none';
            }
            
            if (this.dom.carouselNext) {
                this.dom.carouselNext.style.display = (showButtons && this.currentImageIndex < this.state.postImages.length - 1) ? 'flex' : 'none';
            }
         } else {
            // Handle empty state - reset to placeholder
            if (this.dom.pPostImage) {
                this.dom.pPostImage.src = '../assets/thumb-instagram.png';
            }
            // Keep container visible for placeholder
            if (this.dom.carouselContainer) this.dom.carouselContainer.style.display = 'flex';
            // Hide buttons
            if (this.dom.carouselPrev) this.dom.carouselPrev.style.display = 'none';
            if (this.dom.carouselNext) this.dom.carouselNext.style.display = 'none';
         }

        // 4. Update Post Format (Aspect Ratio)
        if (this.dom.pPostImageContainer) {
            let aspectRatio = '1 / 1'; // Default Square
            switch(this.state.format) {
                case 'portrait': 
                    aspectRatio = '4 / 5'; 
                    break;
                case 'landscape': 
                    aspectRatio = '1.91 / 1'; 
                    break;
                case 'square': 
                default: 
                    aspectRatio = '1 / 1'; 
                    break;
            }
            this.dom.pPostImageContainer.style.aspectRatio = aspectRatio;
        }

        // 5. Dark Mode Toggle for Preview Card
        if (this.dom.previewCard) {
            if (this.state.darkMode) {
                this.dom.previewCard.classList.add('dark-mode');
            } else {
                this.dom.previewCard.classList.remove('dark-mode');
            }
        }
        this._updateLayerHighlight();
    }

    _saveState() {
        try {
            // Try to save the full state including images
            const stateToSave = { ...this.state };
            localStorage.setItem('instagramMockupState', JSON.stringify(stateToSave));
        } catch (e) {
            if (e.name === 'QuotaExceededError' || e.code === 22) {
                console.warn('Storage quota exceeded. Saving without images.');
                // Fallback: Save without images if quota exceeded
                const textOnlyState = { ...this.state };
                delete textOnlyState.profileImage;
                delete textOnlyState.postImages;
                delete textOnlyState.recentlyDeleted;
                try {
                    localStorage.setItem('instagramMockupState', JSON.stringify(textOnlyState));
                } catch (innerE) {
                    console.error('Failed to save even text state', innerE);
                }
            } else {
                console.warn('Failed to save state to localStorage.', e);
            }
        }
    }

    _loadState() {
        const saved = localStorage.getItem('instagramMockupState');
        if (saved) {
            try {
                const parsed = JSON.parse(saved);
                this.state = { ...this.state, ...parsed };

                // Update Inputs

                if (this.dom.usernameInput) this.dom.usernameInput.value = this.state.username;
                if (this.dom.locationInput) this.dom.locationInput.value = this.state.location;
                if (this.dom.captionInput) this.dom.captionInput.value = this.state.caption;
                if (this.dom.likesInput) this.dom.likesInput.value = this.state.likes;
                if (this.dom.timestampInput) this.dom.timestampInput.value = this.state.timestamp;
                
                if (this.dom.verifiedInput) this.dom.verifiedInput.checked = this.state.verified;
                if (this.dom.verifiedCaptionInput) this.dom.verifiedCaptionInput.checked = this.state.verifiedCaption;
                if (this.dom.darkModeInput) this.dom.darkModeInput.checked = this.state.darkMode;
                if (this.dom.formatSelect) this.dom.formatSelect.value = this.state.format;
            } catch (e) {
                console.error('Error loading state:', e);
            }
        }
    }

    _downloadMockup() {
        // Check if html2canvas is loaded
        if (typeof html2canvas === 'undefined') {
            Swal.fire({
                icon: 'warning',
                title: 'Library Missing',
                text: 'The html2canvas library is required to download the mockup. Please ensure it is included in your HTML.',
                confirmButtonColor: '#2563eb'
            });
            return;
        }

        const element = this.dom.previewCard;
        
        // Show loading state
        const originalBtnContent = this.dom.downloadBtn.innerHTML;
        this.dom.downloadBtn.textContent = 'Generating...';
        this.dom.downloadBtn.disabled = true;

        html2canvas(element, { 
            scale: 2, // Higher resolution
            useCORS: true, // Allow loading cross-origin images
            backgroundColor: this.state.darkMode ? '#000000' : '#ffffff'
        }).then(canvas => {
            const link = document.createElement('a');
            link.download = `instagram-mockup-${this.state.username}-${Date.now()}.png`;
            link.href = canvas.toDataURL('image/png');
            link.click();

            // Reset button
            this.dom.downloadBtn.innerHTML = originalBtnContent;
            this.dom.downloadBtn.disabled = false;
            
            Swal.fire({
                icon: 'success',
                title: 'Downloaded!',
                text: 'Your mockup has been saved.',
                timer: 2000,
                showConfirmButton: false
            });
        }).catch(err => {
            console.error(err);
            this.dom.downloadBtn.innerHTML = originalBtnContent;
            this.dom.downloadBtn.disabled = false;
            Swal.fire({
                icon: 'error',
                title: 'Download Failed',
                text: 'There was an error generating the image.',
                confirmButtonColor: '#ef4444'
            });
        });
    }
    _saveDraft() {
        this._saveState();
        
        // Check if images were actually saved (simple check)
        const savedData = localStorage.getItem('instagramMockupState');
        const hasImages = savedData && (savedData.includes('"src":"data:image') || savedData.includes('"profileImage":"data:image'));
        const warningMsg = !hasImages && (this.state.postImages.length > 0 || this.state.profileImage) 
            ? '<br><br><strong style="color: #ef4444;">Warning:</strong> Images were too large to save and have been excluded.' 
            : '';

        Swal.fire({
            title: 'Draft Saved!',
            html: `
                <p>Your current mockup state has been saved to your browser's local storage.${warningMsg}</p>
                <div style="text-align: left; margin-top: 15px; font-size: 0.85em; color: var(--text-secondary);">
                    <strong>Please Note:</strong>
                    <ul>
                        <li>Data is stored locally in your browser.</li>
                        <li>Large images may not be saved if browser limits are reached.</li>
                        <li>Clearing your browser's data will remove the draft.</li>
                    </ul>
                </div>
            `,
            icon: 'info',
            confirmButtonText: 'Got it!',
            confirmButtonColor: '#2563eb'
        });
    }

    _updateCharCount() {
        if (this.dom.captionInput && this.dom.captionCharCount) {
            const length = this.dom.captionInput.value.length;
            this.dom.captionCharCount.textContent = `${length} / 2200`;
        }
    }
}

// Initialize on load
document.addEventListener('DOMContentLoaded', () => {
    new InstagramMockupApp();
});