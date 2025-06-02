
        document.addEventListener('DOMContentLoaded', function() {
            // Initialize Select2 for all segment selects with improved configuration
            $('.segment-select').select2({
                tags: true,
                placeholder: "Select or enter options",
                closeOnSelect: false,
                width: '100%',
                templateSelection: function(data) {
                    // Create a container for the selection that ensures text doesn't overlap with the X
                    var $result = $('<span class="select2-selection__choice__text"></span>');
                    $result.text(data.text);
                    return $result;
                }
            });
            
            // Handle "Other" option for all selects
            const segmentSelects = document.querySelectorAll('.segment-select');
            segmentSelects.forEach(select => {
                const selectId = select.id;
                const otherInput = document.getElementById(`${selectId}-other`);
                
                $(select).on('change', function(e) {
                    const selectedValues = $(this).val() || [];
                    if (selectedValues.includes('Other')) {
                        otherInput.style.display = 'block';
                    } else {
                        otherInput.style.display = 'none';
                    }
                });
            });
            
            // Variables
            const form = document.getElementById('canvas-form');
            const questionnaireSection = document.getElementById('questionnaire-section');
            const canvasResultSection = document.getElementById('canvas-result-section');
            const generateCanvasBtn = document.getElementById('generate-canvas-btn');
            const editFormBtn = document.getElementById('edit-form-btn');
            const exportPdfBtn = document.getElementById('export-pdf-btn');
            const progressFill = document.querySelector('.progress-fill');
            const progressText = document.getElementById('progress-text');
            const progressPercentage = document.getElementById('progress-percentage');
            
            const formSections = document.querySelectorAll('.form-section');
            const nextButtons = document.querySelectorAll('.next-btn');
            const prevButtons = document.querySelectorAll('.prev-btn');
            const stepIndicators = document.querySelectorAll('.step-indicator');
            
            let currentStep = 1;
            const totalSteps = formSections.length;
            
            // Functions
            function updateProgress() {
                const progress = (currentStep / totalSteps) * 100;
                progressFill.style.width = `${progress}%`;
                progressText.textContent = `Step ${currentStep} of ${totalSteps}`;
                progressPercentage.textContent = `${Math.round(progress)}%`;
                
                // Update step indicators
                stepIndicators.forEach((indicator, index) => {
                    const step = index + 1;
                    indicator.classList.remove('step-active', 'step-completed', 'step-inactive');
                    
                    if (step < currentStep) {
                        indicator.classList.add('step-completed');
                        indicator.innerHTML = '✓';
                    } else if (step === currentStep) {
                        indicator.classList.add('step-active');
                        indicator.innerHTML = step;
                    } else {
                        indicator.classList.add('step-inactive');
                        indicator.innerHTML = step;
                    }
                });
            }
            
            function showStep(step) {
                formSections.forEach((section, index) => {
                    if (index + 1 === step) {
                        section.classList.add('active');
                    } else {
                        section.classList.remove('active');
                    }
                });
                
                currentStep = step;
                updateProgress();
            }
            
            function getSegmentValues(segmentId) {
                const select = $(`#${segmentId}`);
                const selectedValues = select.val() || [];
                const notes = document.getElementById(`${segmentId}-notes`).value;
                
                let result = '';
                
                if (selectedValues.length > 0) {
                    const otherIndex = selectedValues.indexOf('Other');
                    if (otherIndex !== -1) {
                        // Replace 'Other' with the custom value
                        const otherInput = document.querySelector(`#${segmentId}-other input`);
                        if (otherInput && otherInput.value) {
                            selectedValues[otherIndex] = otherInput.value;
                        }
                    }
                    
                    result += '<ul class="list-disc pl-5 mb-2">';
                    selectedValues.forEach(value => {
                        result += `<li>${value}</li>`;
                    });
                    result += '</ul>';
                }
                
                if (notes) {
                    result += `<p class="text-gray-700">${notes}</p>`;
                }
                
                return result || '<p class="text-gray-500 italic">No information provided</p>';
            }
            
            function generateCanvas() {
                // Populate canvas with form data
                document.getElementById('canvas-title').textContent = document.getElementById('startup-name').value || 'Your Startup';
                document.getElementById('canvas-description').textContent = document.getElementById('startup-description').value || 'Your business description';
                
                // Populate the 9 segments
                document.getElementById('canvas-key-partnerships').innerHTML = getSegmentValues('key-partnerships');
                document.getElementById('canvas-key-activities').innerHTML = getSegmentValues('key-activities');
                document.getElementById('canvas-key-resources').innerHTML = getSegmentValues('key-resources');
                document.getElementById('canvas-value-proposition').innerHTML = getSegmentValues('value-proposition');
                document.getElementById('canvas-unique-selling-point').textContent = document.getElementById('unique-selling-point').value || 'No unique selling point provided';
                document.getElementById('canvas-customer-relationships').innerHTML = getSegmentValues('customer-relationships');
                document.getElementById('canvas-customer-segments').innerHTML = getSegmentValues('customer-segments');
                document.getElementById('canvas-channels').innerHTML = getSegmentValues('channels');
                document.getElementById('canvas-cost-structure').innerHTML = getSegmentValues('cost-structure');
                document.getElementById('canvas-revenue-streams').innerHTML = getSegmentValues('revenue-streams');
                
                // Show canvas section, hide questionnaire
                questionnaireSection.classList.add('hidden');
                canvasResultSection.classList.remove('hidden');
            }
            
            function exportToPdf() {
                const canvasContainer = document.getElementById('canvas-container');
                const startupName = document.getElementById('startup-name').value || 'Business_Model_Canvas';
                
                // Improved PDF export settings
                const opt = {
                    margin: [5, 5, 5, 5], // Reduced margins [top, right, bottom, left]
                    filename: `${startupName.replace(/\s+/g, '_')}_Business_Model_Canvas.pdf`,
                    image: { type: 'jpeg', quality: 1.0 }, // Higher quality
                    html2canvas: { 
                        scale: 2, // Higher scale for better resolution
                        useCORS: true,
                        logging: false,
                        letterRendering: true,
                        windowWidth: 1200, // Force wider viewport
                        width: 1200 // Force width to ensure content fits
                    },
                    jsPDF: { 
                        unit: 'mm', 
                        format: 'a3', 
                        orientation: 'landscape',
                        compress: true
                    }
                };
                
                // Create a temporary clone with fixed width to ensure proper rendering
                const tempContainer = canvasContainer.cloneNode(true);
                tempContainer.style.width = '1100px';
                tempContainer.style.maxWidth = '1100px';
                tempContainer.style.margin = '0';
                tempContainer.style.padding = '10px';
                tempContainer.style.visibility = 'hidden';
                tempContainer.style.position = 'absolute';
                tempContainer.style.left = '-9999px';
                document.body.appendChild(tempContainer);
                
                // Generate PDF from the temporary container
                html2pdf().from(tempContainer).set(opt).save().then(() => {
                    // Remove the temporary container after PDF generation
                    document.body.removeChild(tempContainer);
                });
            }
            
            // Event Listeners
            nextButtons.forEach(button => {
                button.addEventListener('click', () => {
                    showStep(currentStep + 1);
                });
            });
            
            prevButtons.forEach(button => {
                button.addEventListener('click', () => {
                    showStep(currentStep - 1);
                });
            });
            
            generateCanvasBtn.addEventListener('click', generateCanvas);
            
            editFormBtn.addEventListener('click', () => {
                canvasResultSection.classList.add('hidden');
                questionnaireSection.classList.remove('hidden');
            });
            
            exportPdfBtn.addEventListener('click', exportToPdf);
            
            // Initialize
            updateProgress();
        });
    

(function(){function c(){var b=a.contentDocument||a.contentWindow.document;if(b){var d=b.createElement('script');d.innerHTML="window.__CF$cv$params={r:'9498dddd46f8b83d',t:'MTc0ODg4NzM5OC4wMDAwMDA='};var a=document.createElement('script');a.nonce='';a.src='/cdn-cgi/challenge-platform/scripts/jsd/main.js';document.getElementsByTagName('head')[0].appendChild(a);";b.getElementsByTagName('head')[0].appendChild(d)}}if(document.body){var a=document.createElement('iframe');a.height=1;a.width=1;a.style.position='absolute';a.style.top=0;a.style.left=0;a.style.border='none';a.style.visibility='hidden';document.body.appendChild(a);if('loading'!==document.readyState)c();else if(window.addEventListener)document.addEventListener('DOMContentLoaded',c);else{var e=document.onreadystatechange||function(){};document.onreadystatechange=function(b){e(b);'loading'!==document.readyState&&(document.onreadystatechange=e,c())}}}})();
