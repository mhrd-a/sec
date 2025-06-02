document.addEventListener('DOMContentLoaded', function() {
            // State management
            const state = {
                history: [],
                currentState: -1,
                draggedElement: null,
                draggedElementOriginalParent: null,
                noteColors: ['bg-yellow-200', 'bg-blue-200', 'bg-green-200', 'bg-pink-200', 'bg-purple-200', 'bg-orange-200'],
                pendingAction: null
            };
            
            // DOM Elements
            const canvasContainer = document.getElementById('canvas-container');
            const segments = document.querySelectorAll('.canvas-segment');
            const addNoteBtn = document.getElementById('add-note-tool');
            const addEmojiBtn = document.getElementById('add-emoji-tool');
            const addPhotoBtn = document.getElementById('add-photo-tool');
            const undoBtn = document.getElementById('undo-tool');
            const redoBtn = document.getElementById('redo-tool');
            const templatesBtn = document.getElementById('templates-tool');
            const clearBtn = document.getElementById('clear-tool');
            const exportBtn = document.getElementById('export-tool');
            const emojiModal = document.getElementById('emoji-modal');
            const closeEmojiModal = document.getElementById('close-emoji-modal');
            const emojiPicker = document.querySelector('.emoji-picker');
            const templatesModal = document.getElementById('templates-modal');
            const closeTemplatesModal = document.getElementById('close-templates-modal');
            const templateCards = document.querySelectorAll('.template-card');
            const photoInput = document.getElementById('photo-input');
            const confirmationModal = document.getElementById('confirmation-modal');
            const confirmationTitle = document.getElementById('confirmation-title');
            const confirmationMessage = document.getElementById('confirmation-message');
            const cancelActionBtn = document.getElementById('cancel-action');
            const confirmActionBtn = document.getElementById('confirm-action');
            const notification = document.getElementById('notification');
            const notificationMessage = document.getElementById('notification-message');
            
            // Show notification
            function showNotification(message, type = 'success', duration = 3000) {
                notificationMessage.textContent = message;
                notification.className = 'notification';
                
                if (type === 'error') {
                    notification.classList.add('error');
                } else if (type === 'warning') {
                    notification.classList.add('warning');
                }
                
                notification.classList.add('show');
                
                setTimeout(() => {
                    notification.classList.remove('show');
                }, duration);
            }
            
            // Show confirmation modal
            function showConfirmation(title, message, onConfirm) {
                confirmationTitle.textContent = title;
                confirmationMessage.textContent = message;
                state.pendingAction = onConfirm;
                confirmationModal.classList.remove('hidden');
            }
            
            // Cancel action
            cancelActionBtn.addEventListener('click', function() {
                confirmationModal.classList.add('hidden');
                state.pendingAction = null;
            });
            
            // Confirm action
            confirmActionBtn.addEventListener('click', function() {
                confirmationModal.classList.add('hidden');
                if (state.pendingAction) {
                    state.pendingAction();
                    state.pendingAction = null;
                }
            });
            
            // Save current state to history
            function saveState() {
                // If we're not at the end of the history, truncate it
                if (state.currentState < state.history.length - 1) {
                    state.history = state.history.slice(0, state.currentState + 1);
                }
                
                const currentState = canvasContainer.innerHTML;
                state.history.push(currentState);
                state.currentState = state.history.length - 1;
                
                // Update undo/redo buttons
                updateUndoRedoButtons();
            }
            
            // Update undo/redo buttons state
            function updateUndoRedoButtons() {
                undoBtn.style.opacity = state.currentState > 0 ? '1' : '0.5';
                redoBtn.style.opacity = state.currentState < state.history.length - 1 ? '1' : '0.5';
            }
            
            // Initialize with empty state
            saveState();
            
            // Add a new note to a segment
            function addNote(segmentEl) {
                const segmentContent = segmentEl.querySelector('.segment-content');
                const colorClass = state.noteColors[Math.floor(Math.random() * state.noteColors.length)];
                
                const noteEl = document.createElement('div');
                noteEl.className = `note ${colorClass}`;
                noteEl.setAttribute('draggable', 'true');
                noteEl.innerHTML = `
                    <div class="note-content" contenteditable="false">Click to edit</div>
                    <div class="note-actions">
                        <div class="note-action edit-note"><i class="fas fa-pencil-alt"></i></div>
                        <div class="note-action delete-note"><i class="fas fa-times"></i></div>
                    </div>
                `;
                
                segmentContent.appendChild(noteEl);
                setupNoteDragEvents(noteEl);
                setupNoteActions(noteEl);
                saveState();
                
                showNotification('Note added successfully');
            }
            
            // Add emoji to a segment
            function addEmoji(segmentEl, emoji) {
                const segmentContent = segmentEl.querySelector('.segment-content');
                
                const emojiEl = document.createElement('div');
                emojiEl.className = 'emoji-item';
                emojiEl.setAttribute('draggable', 'true');
                emojiEl.innerHTML = `
                    ${emoji}
                    <div class="emoji-delete"><i class="fas fa-times"></i></div>
                `;
                
                segmentContent.appendChild(emojiEl);
                setupEmojiDragEvents(emojiEl);
                
                // Setup delete action
                const deleteBtn = emojiEl.querySelector('.emoji-delete');
                deleteBtn.addEventListener('click', function(e) {
                    e.stopPropagation();
                    emojiEl.remove();
                    saveState();
                });
                
                saveState();
                showNotification('Emoji added successfully');
            }
            
            // Add photo to a segment
            function addPhoto(segmentEl, file) {
                const segmentContent = segmentEl.querySelector('.segment-content');
                
                const reader = new FileReader();
                reader.onload = function(e) {
                    const photoEl = document.createElement('div');
                    photoEl.className = 'photo-item';
                    photoEl.setAttribute('draggable', 'true');
                    photoEl.innerHTML = `
                        <img src="${e.target.result}" alt="Uploaded photo">
                        <div class="photo-delete"><i class="fas fa-times"></i></div>
                    `;
                    
                    segmentContent.appendChild(photoEl);
                    setupPhotoDragEvents(photoEl);
                    
                    // Setup delete action
                    const deleteBtn = photoEl.querySelector('.photo-delete');
                    deleteBtn.addEventListener('click', function(e) {
                        e.stopPropagation();
                        photoEl.remove();
                        saveState();
                    });
                    
                    saveState();
                    showNotification('Photo added successfully');
                };
                reader.readAsDataURL(file);
            }
            
            // Setup drag events for notes
            function setupNoteDragEvents(noteEl) {
                noteEl.addEventListener('dragstart', handleDragStart);
                noteEl.addEventListener('dragend', handleDragEnd);
            }
            
            // Setup drag events for emojis
            function setupEmojiDragEvents(emojiEl) {
                emojiEl.addEventListener('dragstart', handleDragStart);
                emojiEl.addEventListener('dragend', handleDragEnd);
            }
            
            // Setup drag events for photos
            function setupPhotoDragEvents(photoEl) {
                photoEl.addEventListener('dragstart', handleDragStart);
                photoEl.addEventListener('dragend', handleDragEnd);
            }
            
            // Setup note actions (edit, delete)
            function setupNoteActions(noteEl) {
                const editBtn = noteEl.querySelector('.edit-note');
                const deleteBtn = noteEl.querySelector('.delete-note');
                const noteContent = noteEl.querySelector('.note-content');
                
                editBtn.addEventListener('click', function(e) {
                    e.stopPropagation();
                    
                    // Toggle contenteditable
                    const isEditing = noteContent.getAttribute('contenteditable') === 'true';
                    noteContent.setAttribute('contenteditable', !isEditing);
                    
                    if (!isEditing) {
                        noteContent.focus();
                        // Select all text
                        const range = document.createRange();
                        range.selectNodeContents(noteContent);
                        const selection = window.getSelection();
                        selection.removeAllRanges();
                        selection.addRange(range);
                    } else {
                        saveState();
                    }
                });
                
                deleteBtn.addEventListener('click', function(e) {
                    e.stopPropagation();
                    noteEl.remove();
                    saveState();
                });
                
                // Save when clicking outside
                noteContent.addEventListener('blur', function() {
                    noteContent.setAttribute('contenteditable', 'false');
                    saveState();
                });
                
                // Prevent dragging when editing
                noteContent.addEventListener('mousedown', function(e) {
                    if (noteContent.getAttribute('contenteditable') === 'true') {
                        e.stopPropagation();
                    }
                });
            }
            
            // Handle drag start
            function handleDragStart(e) {
                state.draggedElement = this;
                state.draggedElementOriginalParent = this.parentNode;
                
                // Add dragging class for visual feedback
                setTimeout(() => {
                    this.classList.add('dragging');
                }, 0);
                
                e.dataTransfer.effectAllowed = 'move';
                e.dataTransfer.setData('text/html', this.outerHTML);
            }
            
            // Handle drag end
            function handleDragEnd(e) {
                this.classList.remove('dragging');
                
                // Remove drop active class from all segments
                segments.forEach(segment => {
                    segment.classList.remove('segment-drop-active');
                });
            }
            
            // Setup drop zones (segments)
            segments.forEach(segment => {
                segment.addEventListener('dragover', function(e) {
                    e.preventDefault();
                    e.dataTransfer.dropEffect = 'move';
                    this.classList.add('segment-drop-active');
                });
                
                segment.addEventListener('dragleave', function(e) {
                    this.classList.remove('segment-drop-active');
                });
                
                segment.addEventListener('drop', function(e) {
                    e.preventDefault();
                    this.classList.remove('segment-drop-active');
                    
                    if (state.draggedElement) {
                        const segmentContent = this.querySelector('.segment-content');
                        
                        // Move the element to the new segment
                        segmentContent.appendChild(state.draggedElement);
                        state.draggedElement.classList.remove('dragging');
                        state.draggedElement = null;
                        
                        saveState();
                        showNotification('Item moved successfully');
                    }
                });
            });
            
            // Add note button click
            addNoteBtn.addEventListener('click', function() {
            
            // Add emoji button click
            addEmojiBtn.addEventListener('click', function() {
            
            // Close emoji modal
            closeEmojiModal.addEventListener('click', function() {
                emojiModal.classList.add('hidden');
            });
            
            // Emoji selection
            emojiPicker.addEventListener('click', function(e) {
                if (e.target.tagName === 'SPAN') {
                    const emoji = e.target.textContent;
                    // Find the first segment (or you could prompt the user to select a segment)
                    const firstSegment = document.querySelector('.canvas-segment');
                    addEmoji(firstSegment, emoji);
                    emojiModal.classList.add('hidden');
                }
            });
            
            // Add photo button click
            addPhotoBtn.addEventListener('click', function() {
                photoInput.click();
            });
            
            // Photo input change
            photoInput.addEventListener('change', function(e) {
                if (this.files && this.files[0]) {
                    // Find the first segment (or you could prompt the user to select a segment)
                    const firstSegment = document.querySelector('.canvas-segment');
                    addPhoto(firstSegment, this.files[0]);
                    this.value = ''; // Reset input
                }
            });
            
            // Undo button click
            undoBtn.addEventListener('click', function() {
                if (state.currentState > 0) {
                    state.currentState--;
                    canvasContainer.innerHTML = state.history[state.currentState];
                    reattachEventListeners();
                    updateUndoRedoButtons();
                    showNotification('Undo successful');
                } else {
                    showNotification('Nothing to undo', 'warning');
                }
            });
            
            // Redo button click
            redoBtn.addEventListener('click', function() {
                if (state.currentState < state.history.length - 1) {
                    state.currentState++;
                    canvasContainer.innerHTML = state.history[state.currentState];
                    reattachEventListeners();
                    updateUndoRedoButtons();
                    showNotification('Redo successful');
                } else {
                    showNotification('Nothing to redo', 'warning');
                }
            });
            
            // Templates button click
            templatesBtn.addEventListener('click', function() {
                showConfirmation(
                    'Load Template',
                    'Loading a template will replace your current canvas. Are you sure you want to continue?',
                    function() {
                        templatesModal.classList.remove('hidden');
                    }
                );
            });
            
            // Close templates modal
            closeTemplatesModal.addEventListener('click', function() {
                templatesModal.classList.add('hidden');
            });
            
            // Template selection
            templateCards.forEach(card => {
                card.addEventListener('click', function() {
                    const template = this.getAttribute('data-template');
                    loadTemplate(template);
                    templatesModal.classList.add('hidden');
                });
            });
            
            // Clear button click
            clearBtn.addEventListener('click', function() {
                showConfirmation(
                    'Clear Canvas',
                    'Are you sure you want to clear the entire canvas? This action cannot be undone.',
                    function() {
                        clearCanvas();
                        saveState();
                        showNotification('Canvas cleared successfully');
                    }
                );
            });
            
            // Export button click
            exportBtn.addEventListener('click', function() {
                const projectName = document.getElementById('project-name').value || 'Business Model Canvas';
                
                // Create a clone of the canvas for export
                const exportCanvas = canvasContainer.cloneNode(true);
                
                // Remove action buttons from notes
                exportCanvas.querySelectorAll('.note-actions, .emoji-delete, .photo-delete').forEach(el => {
                    el.remove();
                });
                
                // Set up export options
                const opt = {
                    margin: 10,
                    filename: `${projectName}.pdf`,
                    image: { type: 'jpeg', quality: 0.98 },
                    html2canvas: { scale: 2 },
                    jsPDF: { unit: 'mm', format: 'a3', orientation: 'landscape' }
                };
                
                showNotification('Preparing PDF export...');
                
                // Generate PDF
                html2pdf().set(opt).from(exportCanvas).save().then(() => {
                    showNotification('PDF exported successfully');
                }).catch(err => {
                    showNotification('Error exporting PDF', 'error');
                    console.error(err);
                });
            });
            
            // Reattach event listeners after undo/redo
            function reattachEventListeners() {
                // Reattach segment drop events
                segments.forEach(segment => {
                    segment.addEventListener('dragover', function(e) {
                        e.preventDefault();
                        e.dataTransfer.dropEffect = 'move';
                        this.classList.add('segment-drop-active');
                    });
                    
                    segment.addEventListener('dragleave', function(e) {
                        this.classList.remove('segment-drop-active');
                    });
                    
                    segment.addEventListener('drop', function(e) {
                        e.preventDefault();
                        this.classList.remove('segment-drop-active');
                        
                        if (state.draggedElement) {
                            const segmentContent = this.querySelector('.segment-content');
                            
                            // Move the element to the new segment
                            segmentContent.appendChild(state.draggedElement);
                            state.draggedElement.classList.remove('dragging');
                            state.draggedElement = null;
                            
                            saveState();
                        }
                    });
                });
                
                // Reattach note events
                document.querySelectorAll('.note').forEach(noteEl => {
                    setupNoteDragEvents(noteEl);
                    setupNoteActions(noteEl);
                });
                
                // Reattach emoji events
                document.querySelectorAll('.emoji-item').forEach(emojiEl => {
                    setupEmojiDragEvents(emojiEl);
                    
                    // Setup delete action
                    const deleteBtn = emojiEl.querySelector('.emoji-delete');
                    if (deleteBtn) {
                        deleteBtn.addEventListener('click', function(e) {
                            e.stopPropagation();
                            emojiEl.remove();
                            saveState();
                        });
                    }
                });
                
                // Reattach photo events
                document.querySelectorAll('.photo-item').forEach(photoEl => {
                    setupPhotoDragEvents(photoEl);
                    
                    // Setup delete action
                    const deleteBtn = photoEl.querySelector('.photo-delete');
                    if (deleteBtn) {
                        deleteBtn.addEventListener('click', function(e) {
                            e.stopPropagation();
                            photoEl.remove();
                            saveState();
                        });
                    }
                });
            }
            
            // Load template data
            function loadTemplate(templateName) {
                clearCanvas();
                
                const templates = {
                    'pokemon-go': {
                        'customer-segments': [
                            'Mobile gamers',
                            'Pokémon fans',
                            'Families',
                            'Casual players',
                            'Location-based AR enthusiasts'
                        ],
                        'value-propositions': [
                            'Free-to-play AR gaming',
                            'Social interaction',
                            'Physical activity',
                            'Nostalgia-driven Pokémon collecting'
                        ],
                        'channels': [
                            'App stores (iOS, Android)',
                            'Social media',
                            'In-game events',
                            'Niantic website'
                        ],
                        'customer-relationships': [
                            'Community-driven (events, forums)',
                            'Automated (in-game notifications)',
                            'Self-service (app tutorials)'
                        ],
                        'revenue-streams': [
                            'In-app purchases (PokéCoins)',
                            'Sponsored locations (e.g., Starbucks PokéStops)',
                            'Event tickets'
                        ],
                        'key-resources': [
                            'AR technology',
                            'Pokémon IP',
                            'Mobile app',
                            'Location data'
                        ],
                        'key-activities': [
                            'Game development',
                            'Server maintenance',
                            'Event organization',
                            'Marketing'
                        ],
                        'key-partners': [
                            'The Pokémon Company',
                            'Sponsors (e.g., McDonald\'s)',
                            'App stores'
                        ],
                        'cost-structure': [
                            'Server costs',
                            'Development',
                            'Licensing fees',
                            'Marketing'
                        ]
                    },
                    'openai': {
                        'customer-segments': [
                            'Enterprises',
                            'Developers',
                            'Researchers',
                            'Content creators',
                            'End users'
                        ],
                        'value-propositions': [
                            'Advanced AI capabilities',
                            'API access to cutting-edge models',
                            'Research publications',
                            'Safety-aligned AI systems'
                        ],
                        'channels': [
                            'Direct website',
                            'API platform',
                            'Research papers',
                            'Social media',
                            'Partnerships'
                        ],
                        'customer-relationships': [
                            'Self-service API',
                            'Enterprise support',
                            'Community forums',
                            'Documentation'
                        ],
                        'revenue-streams': [
                            'API usage fees',
                            'Enterprise subscriptions',
                            'ChatGPT Plus subscriptions',
                            'Custom solutions'
                        ],
                        'key-resources': [
                            'AI models (GPT, DALL-E, etc.)',
                            'Computing infrastructure',
                            'Research talent',
                            'Training data'
                        ],
                        'key-activities': [
                            'AI research',
                            'Model training',
                            'API development',
                            'Safety alignment',
                            'Infrastructure scaling'
                        ],
                        'key-partners': [
                            'Microsoft',
                            'Cloud providers',
                            'Research institutions',
                            'Compute hardware manufacturers'
                        ],
                        'cost-structure': [
                            'Computing resources',
                            'Research & development',
                            'Talent acquisition',
                            'Infrastructure maintenance'
                        ]
                    },
                    'netflix': {
                        'customer-segments': [
                            'Global streaming audience',
                            'Film enthusiasts',
                            'TV series fans',
                            'Family households',
                            'Mobile viewers'
                        ],
                        'value-propositions': [
                            'Vast content library',
                            'Original productions',
                            'Ad-free experience',
                            'Personalized recommendations',
                            'Multi-device access'
                        ],
                        'channels': [
                            'Website',
                            'Mobile apps',
                            'Smart TVs',
                            'Gaming consoles',
                            'Set-top boxes'
                        ],
                        'customer-relationships': [
                            'Self-service platform',
                            'Automated recommendations',
                            'Customer support',
                            'Social media engagement'
                        ],
                        'revenue-streams': [
                            'Subscription fees',
                            'Tiered pricing plans',
                            'Licensing content to others',
                            'Merchandise'
                        ],
                        'key-resources': [
                            'Content library',
                            'Streaming technology',
                            'Recommendation algorithms',
                            'Brand recognition',
                            'Global distribution network'
                        ],
                        'key-activities': [
                            'Content acquisition',
                            'Original content production',
                            'Platform development',
                            'Data analytics',
                            'Global expansion'
                        ],
                        'key-partners': [
                            'Content creators',
                            'Production studios',
                            'ISPs',
                            'Device manufacturers',
                            'Payment processors'
                        ],
                        'cost-structure': [
                            'Content acquisition',
                            'Original production',
                            'Technology infrastructure',
                            'Marketing',
                            'R&D'
                        ]
                    },
                    'uber': {
                        'customer-segments': [
                            'Urban commuters',
                            'Business travelers',
                            'Tourists',
                            'People without cars',
                            'Drivers seeking flexible work'
                        ],
                        'value-propositions': [
                            'Convenient transportation',
                            'Flexible earning opportunity',
                            'Lower cost than taxis',
                            'Cashless transactions',
                            'Real-time tracking'
                        ],
                        'channels': [
                            'Mobile app',
                            'Website',
                            'Partner integrations',
                            'Word of mouth',
                            'Marketing campaigns'
                        ],
                        'customer-relationships': [
                            'Automated platform',
                            'Rating system',
                            'Support center',
                            'Driver incentives',
                            'Rider promotions'
                        ],
                        'revenue-streams': [
                            'Commission from rides',
                            'Surge pricing',
                            'Uber Eats',
                            'Uber Freight',
                            'Corporate partnerships'
                        ],
                        'key-resources': [
                            'Platform technology',
                            'Driver network',
                            'User data',
                            'Brand recognition',
                            'Mapping technology'
                        ],
                        'key-activities': [
                            'Platform development',
                            'Driver recruitment',
                            'Marketing',
                            'Regulatory compliance',
                            'Customer support'
                        ],
                        'key-partners': [
                            'Drivers',
                            'Payment processors',
                            'Map providers',
                            'Vehicle rental companies',
                            'Cities and regulators'
                        ],
                        'cost-structure': [
                            'Technology development',
                            'Marketing',
                            'Driver incentives',
                            'Legal and regulatory',
                            'Customer support'
                        ]
                    },
                    'airbnb': {
                        'customer-segments': [
                            'Travelers',
                            'Property owners',
                            'Business travelers',
                            'Experience seekers',
                            'Digital nomads'
                        ],
                        'value-propositions': [
                            'Unique accommodations',
                            'Local experiences',
                            'Extra income for hosts',
                            'Verified reviews',
                            'Global reach'
                        ],
                        'channels': [
                            'Website',
                            'Mobile app',
                            'Social media',
                            'Word of mouth',
                            'Travel partnerships'
                        ],
                        'customer-relationships': [
                            'Community platform',
                            'Review system',
                            'Host guidelines',
                            'Customer support',
                            'Superhost program'
                        ],
                        'revenue-streams': [
                            'Service fees from guests',
                            'Host commission',
                            'Experiences',
                            'Airbnb Plus premium listings',
                            'Business travel program'
                        ],
                        'key-resources': [
                            'Platform technology',
                            'Host network',
                            'User reviews',
                            'Brand recognition',
                            'Insurance coverage'
                        ],
                        'key-activities': [
                            'Platform development',
                            'Host recruitment',
                            'Trust & safety',
                            'Customer support',
                            'Marketing'
                        ],
                        'key-partners': [
                            'Property owners',
                            'Experience hosts',
                            'Photographers',
                            'Payment processors',
                            'Insurance providers'
                        ],
                        'cost-structure': [
                            'Platform development',
                            'Marketing',
                            'Customer support',
                            'Insurance',
                            'Regulatory compliance'
                        ]
                    },
                    'spotify': {
                        'customer-segments': [
                            'Music listeners',
                            'Podcast enthusiasts',
                            'Artists and creators',
                            'Advertisers',
                            'Premium subscribers'
                        ],
                        'value-propositions': [
                            'On-demand streaming',
                            'Personalized playlists',
                            'Offline listening',
                            'Artist promotion',
                            'Ad-free experience (premium)'
                        ],
                        'channels': [
                            'Mobile app',
                            'Desktop app',
                            'Web player',
                            'Smart devices',
                            'Car integration'
                        ],
                        'customer-relationships': [
                            'Self-service platform',
                            'Personalized recommendations',
                            'Artist engagement',
                            'Customer support',
                            'Social features'
                        ],
                        'revenue-streams': [
                            'Premium subscriptions',
                            'Ad-supported free tier',
                            'Partnerships',
                            'Merchandise',
                            'Concert promotions'
                        ],
                        'key-resources': [
                            'Music library',
                            'Recommendation algorithms',
                            'User data',
                            'Brand recognition',
                            'Streaming technology'
                        ],
                        'key-activities': [
                            'Content licensing',
                            'Platform development',
                            'Data analytics',
                            'Marketing',
                            'Artist relations'
                        ],
                        'key-partners': [
                            'Record labels',
                            'Artists',
                            'Podcast creators',
                            'Advertisers',
                            'Device manufacturers'
                        ],
                        'cost-structure': [
                            'Content licensing fees',
                            'Royalty payments',
                            'Technology infrastructure',
                            'Marketing',
                            'R&D'
                        ]
                    }
                };
                
                const template = templates[templateName];
                if (!template) return;
                
                // Add notes for each segment
                for (const [segmentId, notes] of Object.entries(template)) {
                    const segment = document.querySelector(`[data-segment="${segmentId}"]`);
                    if (segment) {
                        notes.forEach(noteText => {
                            addTemplateNote(segment, noteText);
                        });
                    }
                }
                
                // Set project name
                document.getElementById('project-name').value = templateName.charAt(0).toUpperCase() + templateName.slice(1).replace('-', ' ') + ' Business Model';
                
                saveState();
                showNotification(`${templateName.charAt(0).toUpperCase() + templateName.slice(1).replace('-', ' ')} template loaded successfully`);
            }
            
            // Add a template note to a segment
            function addTemplateNote(segmentEl, text) {
                const segmentContent = segmentEl.querySelector('.segment-content');
                const colorClass = state.noteColors[Math.floor(Math.random() * state.noteColors.length)];
                
                const noteEl = document.createElement('div');
                noteEl.className = `note ${colorClass}`;
                noteEl.setAttribute('draggable', 'true');
                noteEl.innerHTML = `
                    <div class="note-content" contenteditable="false">${text}</div>
                    <div class="note-actions">
                        <div class="note-action edit-note"><i class="fas fa-pencil-alt"></i></div>
                        <div class="note-action delete-note"><i class="fas fa-times"></i></div>
                    </div>
                `;
                
                segmentContent.appendChild(noteEl);
                setupNoteDragEvents(noteEl);
                setupNoteActions(noteEl);
            }
            
            // Clear the canvas
            function clearCanvas() {
                segments.forEach(segment => {
                    const segmentContent = segment.querySelector('.segment-content');
                    segmentContent.innerHTML = '';
                });
            }
            
            // Close modals when clicking outside
            window.addEventListener('click', function(e) {
                if (e.target === emojiModal) {
                    emojiModal.classList.add('hidden');
                }
                if (e.target === templatesModal) {
                    templatesModal.classList.add('hidden');
                }
                if (e.target === confirmationModal) {
                    confirmationModal.classList.add('hidden');
                    state.pendingAction = null;
                }
            });
            
            // Handle window resize to ensure canvas fits properly
            function adjustCanvasHeight() {
                const header = document.querySelector('header');
                const headerHeight = header.offsetHeight;
                const windowHeight = window.innerHeight;
                const canvasHeight = windowHeight - headerHeight;
                
                document.querySelector('.main-container').style.height = `${canvasHeight}px`;
            }
            
            // Initial adjustment and listen for resize
            adjustCanvasHeight();
            window.addEventListener('resize', adjustCanvasHeight);
        });

// Cleaned event bindings
addNoteBtn.addEventListener('click', handleAddNote);
addEmojiBtn.addEventListener('click', handleAddEmoji);
