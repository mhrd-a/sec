
document.addEventListener('DOMContentLoaded', function () {
    // Initialize Select2
    $('.segment-select').select2({
        tags: true,
        placeholder: "Select or enter options",
        closeOnSelect: false,
        width: '100%',
        templateSelection: function (data) {
            var $result = $('<span class="select2-selection__choice__text"></span>');
            $result.text(data.text);
            return $result;
        }
    });

    // Handle "Other" option visibility
    const segmentSelects = document.querySelectorAll('.segment-select');
    segmentSelects.forEach(select => {
        const selectId = select.id;
        const otherInput = document.getElementById(`${selectId}-other`);
        $(select).on('change', function () {
            const selectedValues = $(this).val() || [];
            otherInput.style.display = selectedValues.includes('Other') ? 'block' : 'none';
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

    function updateProgress() {
        const progress = (currentStep / totalSteps) * 100;
        progressFill.style.width = `${progress}%`;
        progressText.textContent = `Step ${currentStep} of ${totalSteps}`;
        progressPercentage.textContent = `${Math.round(progress)}%`;

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
            section.classList.toggle('active', index + 1 === step);
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
        document.getElementById('canvas-title').textContent = document.getElementById('startup-name').value || 'Your Startup';
        document.getElementById('canvas-description').textContent = document.getElementById('startup-description').value || 'Your business description';
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

        questionnaireSection.classList.add('hidden');
        canvasResultSection.classList.remove('hidden');
    }

    // Navigation
    nextButtons.forEach(button => button.addEventListener('click', () => showStep(currentStep + 1)));
    prevButtons.forEach(button => button.addEventListener('click', () => showStep(currentStep - 1)));
    document.querySelectorAll('.step-link').forEach(link => {
        link.addEventListener('click', function () {
            const step = parseInt(this.getAttribute('data-step'));
            if (!isNaN(step)) showStep(step);
        });
    });

    generateCanvasBtn.addEventListener('click', generateCanvas);
    editFormBtn.addEventListener('click', () => {
        canvasResultSection.classList.add('hidden');
        questionnaireSection.classList.remove('hidden');
    });

    // Export PDF
    exportPdfBtn.addEventListener('click', function (event) {
        event.preventDefault();
    
        const canvasContainer = document.getElementById('canvas-container');
        const canvasTitle = document.getElementById('canvas-title').textContent.trim() || 'Business Model Canvas';
    
        // Clone canvas
        const exportCanvas = canvasContainer.cloneNode(true);
        exportCanvas.querySelectorAll('button').forEach(btn => btn.remove());
    
        // Create an invisible full-size container
        const wrapper = document.createElement('div');
        wrapper.style.position = 'fixed';
        wrapper.style.top = '0';
        wrapper.style.left = '0';
        wrapper.style.width = `${canvasContainer.scrollWidth}px`;
        wrapper.style.height = `${canvasContainer.scrollHeight}px`;
        wrapper.style.overflow = 'visible';
        wrapper.style.opacity = '0';
        wrapper.style.pointerEvents = 'none';
        wrapper.style.zIndex = '-9999';
        document.body.appendChild(wrapper);
        wrapper.appendChild(exportCanvas);
    
        // Wait for DOM to render fully
        requestAnimationFrame(() => {
            const rect = exportCanvas.getBoundingClientRect();
    
            const opt = {
                margin: 0,
                filename: `${canvasTitle}.pdf`,
                image: { type: 'jpeg', quality: 1 },
                html2canvas: {
                    scale: 3,
                    scrollX: 0,
                    scrollY: 0,
                    width: rect.width,
                    height: rect.height,
                    windowWidth: rect.width,
                    windowHeight: rect.height
                },
                jsPDF: { unit: 'mm', format: 'a3', orientation: 'landscape' }
            };
    
            html2pdf().set(opt).from(exportCanvas).save().then(() => {
                document.body.removeChild(wrapper);
            });
        });
    }, { once: true });



    updateProgress();
    showStep(1);
});
