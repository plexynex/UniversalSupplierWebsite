// PDF Viewer for Package Page
// PDF data configuration - URLs atau paths ke file PDF
const pdfData = {
    paket1: {
        name: 'Paket Standar',
        url: 'assets/Full-Paket.pdf'  // ganti dengan path PDF Anda
    }
    // paket2: {
    //     name: 'Paket Premium',
    //     url: 'assets/paket-premium.pdf'  // ganti dengan path PDF Anda
    // },
    // paket3: {
    //     name: 'Paket Enterprise',
    //     url: 'assets/paket-enterprise.pdf'  // ganti dengan path PDF Anda
    // }
};

// State management
let pdfState = {
    currentFile: null,
    currentPage: 1,
    totalPages: 0,
    pdf: null,
    zoom: 100,
    isLoading: false
};

// DOM elements
const pdfSelect = document.getElementById('pdf-select');
const pdfCanvas = document.getElementById('pdf-canvas');
const pdfContainer = document.getElementById('pdf-container');
const pdfPrevBtn = document.getElementById('pdf-prev');
const pdfNextBtn = document.getElementById('pdf-next');
const pageCurrentSpan = document.getElementById('page-current');
const pageTotalSpan = document.getElementById('page-total');
const pdfZoomInBtn = document.getElementById('pdf-zoom-in');
const pdfZoomOutBtn = document.getElementById('pdf-zoom-out');
const pdfFitPageBtn = document.getElementById('pdf-fit-page');
const zoomLevelSpan = document.getElementById('zoom-level');
const pdfInfo = document.getElementById('pdf-info');
const pdfMessage = document.getElementById('pdf-message');

// Initialize
document.addEventListener('DOMContentLoaded', function() {
    initPdfViewer();
});

function initPdfViewer() {
    // Event listeners
    pdfSelect.addEventListener('change', handlePdfSelect);
    pdfPrevBtn.addEventListener('click', goToPreviousPage);
    pdfNextBtn.addEventListener('click', goToNextPage);
    pdfZoomInBtn.addEventListener('click', () => changeZoom(10));
    pdfZoomOutBtn.addEventListener('click', () => changeZoom(-10));
    pdfFitPageBtn.addEventListener('click', fitPageToContainer);
    
    // Keyboard navigation
    document.addEventListener('keydown', handleKeyboard);
}

// Handle PDF selection
async function handlePdfSelect(event) {
    const selectedKey = event.target.value;
    
    if (!selectedKey) {
        resetPdfViewer();
        showMessage('Silakan pilih paket PDF untuk ditampilkan');
        return;
    }

    if (pdfState.isLoading) return;
    
    pdfState.isLoading = true;
    pdfMessage.textContent = 'Memuat PDF...';
    pdfInfo.style.display = 'block';
    
    try {
        pdfState.currentFile = selectedKey;
        pdfState.currentPage = 1;
        
        const pdfUrl = pdfData[selectedKey].url;
        const pdf = await pdfjsLib.getDocument(pdfUrl).promise;
        
        pdfState.pdf = pdf;
        pdfState.totalPages = pdf.numPages;
        
        // Reset zoom
        pdfState.zoom = 100;
        zoomLevelSpan.textContent = '100%';
        
        // Update UI
        pageTotalSpan.textContent = pdfState.totalPages;
        updatePageControls();
        
        // Render first page
        await renderPage(1);
        
        pdfInfo.style.display = 'none';
        pdfState.isLoading = false;
        
    } catch (error) {
        console.error('Error loading PDF:', error);
        showMessage(`Error memuat PDF: ${error.message}`);
        pdfState.isLoading = false;
    }
}

// Render a specific page
async function renderPage(pageNum) {
    if (!pdfState.pdf || pageNum < 1 || pageNum > pdfState.totalPages) return;
    
    try {
        pdfState.currentPage = pageNum;
        pageCurrentSpan.textContent = pageNum;
        
        const page = await pdfState.pdf.getPage(pageNum);
        
        // A4 Landscape: 279mm × 216mm @ 96 DPI
        // Viewport: 1052px × 815px (approx)
        const baseScale = 2; // higher quality
        const scale = (pdfState.zoom / 100) * baseScale;
        
        const viewport = page.getViewport({ scale: scale });
        
        // Set canvas dimensions
        pdfCanvas.width = viewport.width;
        pdfCanvas.height = viewport.height;
        
        // Render page
        const renderContext = {
            canvasContext: pdfCanvas.getContext('2d'),
            viewport: viewport
        };
        
        await page.render(renderContext).promise;
        
        updatePageControls();
        
    } catch (error) {
        console.error('Error rendering page:', error);
        showMessage(`Error merender halaman: ${error.message}`);
    }
}

// Navigation functions
function goToPreviousPage() {
    if (pdfState.currentPage > 1) {
        renderPage(pdfState.currentPage - 1);
    }
}

function goToNextPage() {
    if (pdfState.currentPage < pdfState.totalPages) {
        renderPage(pdfState.currentPage + 1);
    }
}

// Zoom control
function changeZoom(delta) {
    const newZoom = pdfState.zoom + delta;
    if (newZoom >= 50 && newZoom <= 200) {
        pdfState.zoom = newZoom;
        zoomLevelSpan.textContent = pdfState.zoom + '%';
        renderPage(pdfState.currentPage);
    }
}

// Fit page to container
function fitPageToContainer() {
    if (!pdfState.pdf) return;
    
    const containerWidth = pdfContainer.offsetWidth - 40; // padding
    const containerHeight = window.innerHeight - 400; // rough estimate
    
    // Calculate zoom to fit
    const maxWidth = (279 / 25.4) * 96; // mm to px (279mm A4 width)
    const maxHeight = (216 / 25.4) * 96; // mm to px (216mm A4 height)
    
    const fitZoomWidth = (containerWidth / maxWidth) * 100;
    const fitZoomHeight = (containerHeight / maxHeight) * 100;
    
    pdfState.zoom = Math.min(fitZoomWidth, fitZoomHeight, 200);
    pdfState.zoom = Math.max(pdfState.zoom, 50);
    
    zoomLevelSpan.textContent = Math.round(pdfState.zoom) + '%';
    renderPage(pdfState.currentPage);
}

// Update button states
function updatePageControls() {
    pdfPrevBtn.disabled = pdfState.currentPage <= 1;
    pdfNextBtn.disabled = pdfState.currentPage >= pdfState.totalPages;
}

// Keyboard navigation
function handleKeyboard(event) {
    if (!pdfState.pdf) return;
    
    switch(event.key) {
        case 'ArrowLeft':
        case 'ArrowUp':
            goToPreviousPage();
            break;
        case 'ArrowRight':
        case 'ArrowDown':
            goToNextPage();
            break;
    }
}

// Reset viewer
function resetPdfViewer() {
    pdfState.currentFile = null;
    pdfState.currentPage = 1;
    pdfState.totalPages = 0;
    pdfState.pdf = null;
    pdfState.zoom = 100;
    
    pdfCanvas.width = 800;
    pdfCanvas.height = 600;
    
    pageCurrentSpan.textContent = '0';
    pageTotalSpan.textContent = '0';
    zoomLevelSpan.textContent = '100%';
    
    updatePageControls();
}

// Show message
function showMessage(message) {
    pdfMessage.textContent = message;
    pdfInfo.style.display = 'block';
    setTimeout(() => {
        if (!pdfState.currentFile) {
            pdfInfo.style.display = 'none';
        }
    }, 3000);
}

// Handle window resize for responsive behavior
window.addEventListener('resize', function() {
    if (pdfState.pdf && pdfState.currentFile) {
        renderPage(pdfState.currentPage);
    }
});
