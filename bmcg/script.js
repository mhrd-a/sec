
        document.addEventListener('DOMContentLoaded', function() {
            // Initialize Select2
            $('.select2-multi').select2({
                tags: true,
                placeholder: "Select options or type to add custom",
                allowClear: true,
                width: '100%'
            });
            
            // Variables
            let currentStep = 1;
            const totalSteps = 5;
            const form = document.getElementById('business-model-form');
            const nextBtn = document.getElementById('next-btn');
            const prevBtn = document.getElementById('prev-btn');
            const submitBtn = document.getElementById('submit-btn');
            const progressBar = document.getElementById('progress-bar');
            const stepBtns = document.querySelectorAll('.step-btn');
            const questionnaireSection = document.getElementById('questionnaire-section');
            const resultsSection = document.getElementById('results-section');
            const downloadBtn = document.getElementById('download-btn');
            const restartBtn = document.getElementById('restart-btn');
            
            // Initialize
            updateProgressBar();
            setupOtherInputs();
            
            // Event Listeners
            nextBtn.addEventListener('click', goToNextStep);
            prevBtn.addEventListener('click', goToPrevStep);
            form.addEventListener('submit', handleSubmit);
            restartBtn.addEventListener('click', resetForm);
            downloadBtn.addEventListener('click', downloadCanvas);
            
            // Step navigation buttons
            stepBtns.forEach(btn => {
                btn.addEventListener('click', function() {
                    const step = parseInt(this.getAttribute('data-step'));
                    goToStep(step);
                });
            });
            
            // Setup "Other" input fields
            function setupOtherInputs() {
                // Industry dropdown
                document.getElementById('industry').addEventListener('change', function() {
                    const otherInput = document.getElementById('industry-other');
                    otherInput.style.display = this.value === 'Other' ? 'block' : 'none';
                });
                
                // For all Select2 dropdowns with "Other" option
                const selectIds = [
                    'customer-segments', 'customer-relationships', 'channels',
                    'value-propositions', 'unique-selling-point',
                    'key-resources', 'key-activities', 'key-partners',
                    'revenue-streams', 'cost-structure'
                ];
                
                selectIds.forEach(id => {
                    $(`#${id}`).on('change', function() {
                        const values = $(this).val() || [];
                        const otherInput = document.getElementById(`${id}-other`);
                        otherInput.style.display = values.includes('Other') ? 'block' : 'none';
                    });
                });
            }
            
            // Functions
            function goToNextStep() {
                if (currentStep < totalSteps) {
                    goToStep(currentStep + 1);
                }
            }
            
            function goToPrevStep() {
                if (currentStep > 1) {
                    goToStep(currentStep - 1);
                }
            }
            
            function goToStep(step) {
                // Hide all steps
                document.querySelectorAll('.step-content').forEach(el => {
                    el.classList.add('hidden');
                });
                
                // Show the target step
                document.getElementById(`step-${step}`).classList.remove('hidden');
                
                // Update buttons
                prevBtn.classList.toggle('hidden', step === 1);
                nextBtn.classList.toggle('hidden', step === totalSteps);
                submitBtn.classList.toggle('hidden', step !== totalSteps);
                
                // Update active step indicator
                stepBtns.forEach(btn => {
                    const btnStep = parseInt(btn.getAttribute('data-step'));
                    if (btnStep === step) {
                        btn.classList.add('active-step');
                    } else {
                        btn.classList.remove('active-step');
                    }
                });
                
                // Update current step and progress bar
                currentStep = step;
                updateProgressBar();
            }
            
            function updateProgressBar() {
                const progress = ((currentStep - 1) / (totalSteps - 1)) * 100;
                progressBar.style.width = `${progress}%`;
            }
            
            function handleSubmit(e) {
                e.preventDefault();
                
                // Collect all form data
                const formData = {
                    businessName: document.getElementById('business-name').value || 'My Business',
                    businessDescription: document.getElementById('business-description').value || 'No description provided',
                    industry: document.getElementById('industry').value === 'Other' ? 
                        document.getElementById('industry-other-input').value || 'Custom Industry' : 
                        document.getElementById('industry').value || 'Not specified',
                    customerSegments: getSegmentValues('customer-segments'),
                    customerRelationships: getSegmentValues('customer-relationships'),
                    channels: getSegmentValues('channels'),
                    valuePropositions: getSegmentValues('value-propositions'),
                    uniqueSellingPoint: getSegmentValues('unique-selling-point'),
                    keyResources: getSegmentValues('key-resources'),
                    keyActivities: getSegmentValues('key-activities'),
                    keyPartners: getSegmentValues('key-partners'),
                    revenueStreams: getSegmentValues('revenue-streams'),
                    costStructure: getSegmentValues('cost-structure')
                };
                
                // Generate the canvas
                generateCanvas(formData);
                
                // Hide questionnaire, show results
                questionnaireSection.classList.add('hidden');
                resultsSection.classList.remove('hidden');
                
                // Scroll to results
                resultsSection.scrollIntoView({ behavior: 'smooth' });
            }
            
            function getSegmentValues(segmentId) {
                const select = document.getElementById(segmentId);
                const values = Array.from($(select).val() || []);
                
                // If no values selected, return a default message
                if (values.length === 0) {
                    return ['Not specified'];
                }
                
                // If "Other" is selected, add the custom input value
                if (values.includes('Other')) {
                    const otherInput = document.getElementById(`${segmentId}-other-input`);
                    if (otherInput && otherInput.value.trim()) {
                        // Remove "Other" from the array
                        const index = values.indexOf('Other');
                        if (index > -1) {
                            values.splice(index, 1);
                        }
                        
                        // Add custom values (split by line)
                        const customValues = otherInput.value.split('\n')
                            .filter(line => line.trim() !== '')
                            .map(line => line.trim());
                        
                        values.push(...customValues);
                    }
                }
                
                return values;
            }
            
            function generateCanvas(data) {
                // Set business name and industry
                document.getElementById('canvas-business-name').textContent = data.businessName;
                document.getElementById('canvas-industry').textContent = data.industry;
                
                // Format and display text for each section
                const formatText = (items) => {
                    return items
                        .map(item => `<p class="mb-1">• ${item}</p>`)
                        .join('');
                };
                
                document.getElementById('canvas-business-description').innerHTML = data.businessDescription;
                document.getElementById('canvas-customer-segments').innerHTML = formatText(data.customerSegments);
                document.getElementById('canvas-customer-relationships').innerHTML = formatText(data.customerRelationships);
                document.getElementById('canvas-channels').innerHTML = formatText(data.channels);
                document.getElementById('canvas-value-propositions').innerHTML = formatText(data.valuePropositions);
                document.getElementById('canvas-unique-selling-point').innerHTML = formatText(data.uniqueSellingPoint);
                document.getElementById('canvas-key-resources').innerHTML = formatText(data.keyResources);
                document.getElementById('canvas-key-activities').innerHTML = formatText(data.keyActivities);
                document.getElementById('canvas-key-partners').innerHTML = formatText(data.keyPartners);
                document.getElementById('canvas-revenue-streams').innerHTML = formatText(data.revenueStreams);
                document.getElementById('canvas-cost-structure').innerHTML = formatText(data.costStructure);
                
                // Add animation to canvas sections
                const canvasSections = document.querySelectorAll('.canvas-box');
                canvasSections.forEach((section, index) => {
                    setTimeout(() => {
                        section.style.opacity = '0';
                        section.style.transform = 'translateY(20px)';
                        
                        setTimeout(() => {
                            section.style.transition = 'all 0.5s ease';
                            section.style.opacity = '1';
                            section.style.transform = 'translateY(0)';
                        }, 100);
                    }, index * 100);
                });
            }
            
            function resetForm() {
                // Reset form fields
                form.reset();
                
                // Reset Select2 fields
                $('.select2-multi').val(null).trigger('change');
                
                // Hide all "Other" input fields
                document.querySelectorAll('.other-input').forEach(el => {
                    el.style.display = 'none';
                });
                
                // Go back to step 1
                goToStep(1);
                
                // Show questionnaire, hide results
                questionnaireSection.classList.remove('hidden');
                resultsSection.classList.add('hidden');
                
                // Scroll to top
                window.scrollTo({ top: 0, behavior: 'smooth' });
            }
            
            function downloadCanvas() {
                // Show loading indicator
                const loadingIndicator = document.createElement('div');
                loadingIndicator.className = 'fixed top-0 left-0 w-full h-full flex items-center justify-center bg-black bg-opacity-50 z-50';
                loadingIndicator.innerHTML = `
                    <div class="bg-white p-5 rounded-lg shadow-lg flex flex-col items-center">
                        <div class="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-600 mb-3"></div>
                        <p class="text-gray-700">Generating PDF...</p>
                    </div>
                `;
                document.body.appendChild(loadingIndicator);
                
                // Get the canvas element
                const element = document.getElementById('canvas-for-pdf');
                
                // Set options for html2pdf
                const opt = {
                    margin: 10,
                    filename: `${document.getElementById('canvas-business-name').textContent.trim() || 'Business_Model'}_Canvas.pdf`,
                    image: { type: 'jpeg', quality: 0.98 },
                    html2canvas: { 
                        scale: 2, 
                        useCORS: true, 
                        letterRendering: true,
                        windowWidth: 1200, // Force wider viewport
                        scrollY: 0,
                        scrollX: 0,
                        allowTaint: true,
                        onclone: function(clonedDoc) {
                            // Make sure the cloned element is visible and properly sized
                            const clonedElement = clonedDoc.getElementById('canvas-for-pdf');
                            if (clonedElement) {
                                clonedElement.style.width = '1100px';
                                clonedElement.style.margin = '0';
                                clonedElement.style.padding = '20px';
                                clonedElement.style.position = 'absolute';
                                clonedElement.style.top = '0';
                                clonedElement.style.left = '0';
                                clonedElement.style.visibility = 'visible';
                                clonedElement.style.overflow = 'visible';
                            }
                        }
                    },
                    jsPDF: { 
                        unit: 'mm', 
                        format: 'a4', 
                        orientation: 'landscape',
                        compress: true
                    }
                };
                
                // Generate PDF
                html2pdf()
                    .from(element)
                    .set(opt)
                    .save()
                    .then(() => {
                        // Remove loading indicator
                        document.body.removeChild(loadingIndicator);
                        
                        // Show success notification
                        const notification = document.createElement('div');
                        notification.className = 'fixed top-4 right-4 bg-green-100 border-l-4 border-green-500 text-green-700 p-4 rounded shadow-lg z-50';
                        notification.innerHTML = `
                            <div class="flex items-center">
                                <svg class="h-6 w-6 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
                                </svg>
                                <p>Business Model Canvas downloaded successfully!</p>
                            </div>
                        `;
                        
                        document.body.appendChild(notification);
                        
                        // Remove notification after 3 seconds
                        setTimeout(() => {
                            notification.style.opacity = '0';
                            notification.style.transition = 'opacity 0.5s ease';
                            setTimeout(() => {
                                document.body.removeChild(notification);
                            }, 500);
                        }, 3000);
                    })
                    .catch(err => {
                        // Remove loading indicator
                        document.body.removeChild(loadingIndicator);
                        
                        // Show error notification
                        const notification = document.createElement('div');
                        notification.className = 'fixed top-4 right-4 bg-red-100 border-l-4 border-red-500 text-red-700 p-4 rounded shadow-lg z-50';
                        notification.innerHTML = `
                            <div class="flex items-center">
                                <svg class="h-6 w-6 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
                                </svg>
                                <p>Error generating PDF. Please try again.</p>
                            </div>
                        `;
                        
                        document.body.appendChild(notification);
                        
                        // Remove notification after 3 seconds
                        setTimeout(() => {
                            notification.style.opacity = '0';
                            notification.style.transition = 'opacity 0.5s ease';
                            setTimeout(() => {
                                document.body.removeChild(notification);
                            }, 500);
                        }, 3000);
                        
                        console.error('PDF generation error:', err);
                    });
            }
        });
    

(function(){function c(){var b=a.contentDocument||a.contentWindow.document;if(b){var d=b.createElement('script');d.innerHTML="window.__CF$cv$params={r:'9470fe88c3a80623',t:'MTc0ODQ2OTMwNS4wMDAwMDA='};var a=document.createElement('script');a.nonce='';a.src='/cdn-cgi/challenge-platform/scripts/jsd/main.js';document.getElementsByTagName('head')[0].appendChild(a);";b.getElementsByTagName('head')[0].appendChild(d)}}if(document.body){var a=document.createElement('iframe');a.height=1;a.width=1;a.style.position='absolute';a.style.top=0;a.style.left=0;a.style.border='none';a.style.visibility='hidden';document.body.appendChild(a);if('loading'!==document.readyState)c();else if(window.addEventListener)document.addEventListener('DOMContentLoaded',c);else{var e=document.onreadystatechange||function(){};document.onreadystatechange=function(b){e(b);'loading'!==document.readyState&&(document.onreadystatechange=e,c())}}}})();