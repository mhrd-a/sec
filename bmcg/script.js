
document.addEventListener('DOMContentLoaded', function () {
    // Global variables
    let currentStep = 1;
    let form = document.getElementById('canvas-form');
    let questionnaireSection = document.getElementById('questionnaire-section');
    let canvasResultSection = document.getElementById('canvas-result-section');
    let generateCanvasBtn = document.getElementById('generate-canvas-btn');
    let editFormBtn = document.getElementById('edit-form-btn');
    let exportPdfBtn = document.getElementById('export-pdf-btn');
    let progressFill = document.querySelector('.progress-fill');
    let progressText = document.getElementById('progress-text');
    let progressPercentage = document.getElementById('progress-percentage');
    let formSections = document.querySelectorAll('.form-section');
    let nextButtons = document.querySelectorAll('.next-btn');
    let prevButtons = document.querySelectorAll('.prev-btn');
    let stepIndicators = document.querySelectorAll('.step-indicator');
    let totalSteps = formSections.length;

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

    const segmentSelects = document.querySelectorAll('.segment-select');
    segmentSelects.forEach(select => {
        const selectId = select.id;
        const otherInput = document.getElementById(`${selectId}-other`);
        $(select).on('change', function () {
            const selectedValues = $(this).val() || [];
            otherInput.style.display = selectedValues.includes('Other') ? 'block' : 'none';
        });
    });

    updateProgress();
    showStep(1);

    // Event listeners
    nextButtons.forEach(button => {
        button.addEventListener('click', () => showStep(currentStep + 1));
    });

    prevButtons.forEach(button => {
        button.addEventListener('click', () => showStep(currentStep - 1));
    });

    generateCanvasBtn.addEventListener('click', generateCanvas);

    editFormBtn.addEventListener('click', () => {
        canvasResultSection.classList.add('hidden');
        questionnaireSection.classList.remove('hidden');
    });

    exportPdfBtn.addEventListener('click', exportToPdf);

    document.querySelectorAll('.step-link').forEach(link => {
        link.addEventListener('click', function () {
            const step = parseInt(this.getAttribute('data-step'));
            if (!isNaN(step)) {
                showStep(step);
            }
        });
    });

    // Functions
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

    function exportToPdf() {
        const exportCanvas = document.getElementById('canvas-container');
        const projectName = document.getElementById('project-name').value || 'Business_Model_Canvas';

        const opt = {
            margin: 10,
            filename: `${projectName.replace(/\s+/g, '_')}.pdf`,
            image: { type: 'jpeg', quality: 0.98 },
            html2canvas: { scale: 2 },
            jsPDF: { unit: 'mm', format: 'a3', orientation: 'landscape' }
        };

        showNotification('Preparing PDF export...');
        window.scrollTo(0, 0);

    	// Generate PDF
    	html2pdf().set(opt).from(exportCanvas).save().then(() => {
            showNotification('PDF exported successfully');
    	}).catch(err => {
            showNotification('Error exporting PDF', 'error');
            console.error(err);
    	});
    }
});
