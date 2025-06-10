document.addEventListener('DOMContentLoaded', function () {
    // Initialize Select2 for all segment selects
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
            if (selectedValues.includes('Other')) {
                otherInput.style.display = 'block';
            } else {
                otherInput.style.display = 'none';
            }
        });
    });

    // Variables
    form = document.getElementById('canvas-form');
    questionnaireSection = document.getElementById('questionnaire-section');
    canvasResultSection = document.getElementById('canvas-result-section');
    generateCanvasBtn = document.getElementById('generate-canvas-btn');
    editFormBtn = document.getElementById('edit-form-btn');
    exportPdfBtn = document.getElementById('export-pdf-btn');
    progressFill = document.querySelector('.progress-fill');
    progressText = document.getElementById('progress-text');
    progressPercentage = document.getElementById('progress-percentage');

    formSections = document.querySelectorAll('.form-section');
    nextButtons = document.querySelectorAll('.next-btn');
    prevButtons = document.querySelectorAll('.prev-btn');
    stepIndicators = document.querySelectorAll('.step-indicator');

    totalSteps = formSections.length;

    updateProgress();
    showStep(1);

    // Navigation buttons
    document.querySelectorAll('.next-btn').forEach(button => {
        button.addEventListener('click', () => showStep(currentStep + 1));
    });

    document.querySelectorAll('.prev-btn').forEach(button => {
        button.addEventListener('click', () => showStep(currentStep - 1));
    });

    generateCanvasBtn.addEventListener('click', generateCanvas);
    editFormBtn.addEventListener('click', () => {
        canvasResultSection.classList.add('hidden');
        questionnaireSection.classList.remove('hidden');
    });
    exportPdfBtn.addEventListener('click', exportToPdf);

    // Step click listeners
    document.querySelectorAll('.step-link').forEach(link => {
        link.addEventListener('click', function () {
            const step = parseInt(this.getAttribute('data-step'));
            if (!isNaN(step)) {
                showStep(step);
            }
        });
    });
});

// Global scope variables
let currentStep = 1;
let totalSteps, formSections, form, progressFill, progressText, progressPercentage;
let questionnaireSection, canvasResultSection, generateCanvasBtn, editFormBtn, exportPdfBtn;
let nextButtons, prevButtons, stepIndicators;

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
    const canvasContainer = document.getElementById('canvas-container');
    const startupName = document.getElementById('startup-name').value || 'Business_Model_Canvas';

    const opt = {
        margin: [5, 5, 5, 5],
        filename: `${startupName.replace(/\s+/g, '_')}_Business_Model_Canvas.pdf`,
        image: { type: 'jpeg', quality: 1.0 },
        html2canvas: {
            scale: 2,
            useCORS: true,
            logging: false,
            letterRendering: true,
            windowWidth: 1200,
            width: 1200
        },
        jsPDF: {
            unit: 'mm',
            format: 'a3',
            orientation: 'landscape',
            compress: true
        }
    };

    // Clone the container and render it off-screen
    const tempContainer = canvasContainer.cloneNode(true);
    tempContainer.style.width = '1100px';
    tempContainer.style.maxWidth = '1100px';
    tempContainer.style.margin = '0';
    tempContainer.style.padding = '10px';
    tempContainer.style.visibility = 'hidden';
    tempContainer.style.position = 'absolute';
    tempContainer.style.left = '-9999px';
    document.body.appendChild(tempContainer);

    // Wait briefly to ensure rendering
    setTimeout(() => {
        html2pdf().from(tempContainer).set(opt).save().then(() => {
            document.body.removeChild(tempContainer);
        });
    }, 100);
}
