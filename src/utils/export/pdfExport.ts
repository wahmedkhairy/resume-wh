
import { ExportData } from './types';
import { 
  waitForDOM, 
  findResumeElement, 
  hideOverlayElements, 
  restoreHiddenElements, 
  generateFilename 
} from './domHelpers';

export const exportResumeToPDF = async (data: ExportData): Promise<void> => {
  console.log('=== Starting PDF Export ===');
  console.log('Export data received:', data);
  
  try {
    // Validate input data
    if (!data || typeof data !== 'object') {
      throw new Error('Invalid export data provided');
    }
    
    // Wait for DOM to be ready
    await waitForDOM(200);
    
    // Find the resume element
    const resumeElement = findResumeElement();
    if (!resumeElement) {
      throw new Error('Resume preview element not found. Please ensure the resume is visible on the page.');
    }
    
    console.log('Resume element found:', resumeElement);
    console.log('Element dimensions:', {
      width: resumeElement.offsetWidth,
      height: resumeElement.offsetHeight,
      visible: resumeElement.offsetParent !== null
    });
    
    // Check if element is visible
    if (resumeElement.offsetParent === null) {
      throw new Error('Resume element is not visible. Please ensure the resume preview is displayed.');
    }
    
    // Dynamically import required libraries
    console.log('Loading html2canvas and jsPDF...');
    const [html2canvasModule, jsPDFModule] = await Promise.all([
      import('html2canvas'),
      import('jspdf')
    ]);
    
    const html2canvas = html2canvasModule.default;
    const { jsPDF } = jsPDFModule;
    
    console.log('Libraries loaded successfully');
    
    // Hide overlay elements
    const hiddenElements = hideOverlayElements();
    
    // Wait for style changes to take effect
    await waitForDOM(100);
    
    // Create canvas with optimized settings
    console.log('Creating canvas from element...');
    const canvas = await html2canvas(resumeElement, {
      scale: 2,
      useCORS: true,
      allowTaint: true,
      backgroundColor: '#ffffff',
      logging: false,
      width: resumeElement.offsetWidth,
      height: resumeElement.offsetHeight,
      onclone: (clonedDoc) => {
        console.log('Cloning document for canvas...');
        // Remove overlay elements in cloned document
        const elementsToHide = ['.watermark', '[data-anti-theft]', '.anti-theft', '[class*="watermark"]'];
        elementsToHide.forEach(selector => {
          const elements = clonedDoc.querySelectorAll(selector);
          elements.forEach(el => el.remove());
        });
      }
    });
    
    // Restore hidden elements immediately
    restoreHiddenElements(hiddenElements);
    
    console.log('Canvas created successfully:', {
      width: canvas.width,
      height: canvas.height
    });
    
    // Validate canvas
    if (canvas.width === 0 || canvas.height === 0) {
      throw new Error('Generated canvas has invalid dimensions');
    }
    
    // Create PDF
    console.log('Creating PDF document...');
    const imgData = canvas.toDataURL('image/png', 0.95);
    
    if (!imgData || imgData === 'data:,') {
      throw new Error('Failed to generate image data from canvas');
    }
    
    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4',
      compress: true
    });
    
    // Calculate optimal scaling for A4
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = pdf.internal.pageSize.getHeight();
    const imgAspectRatio = canvas.width / canvas.height;
    const pdfAspectRatio = pdfWidth / pdfHeight;
    
    let finalWidth, finalHeight;
    
    if (imgAspectRatio > pdfAspectRatio) {
      // Image is wider - fit to width
      finalWidth = pdfWidth - 20; // 10mm margin on each side
      finalHeight = finalWidth / imgAspectRatio;
    } else {
      // Image is taller - fit to height
      finalHeight = pdfHeight - 20; // 10mm margin top/bottom
      finalWidth = finalHeight * imgAspectRatio;
    }
    
    // Center the image
    const x = (pdfWidth - finalWidth) / 2;
    const y = (pdfHeight - finalHeight) / 2;
    
    pdf.addImage(imgData, 'PNG', x, y, finalWidth, finalHeight, undefined, 'FAST');
    
    // Generate filename and save
    const filename = generateFilename(data, 'pdf');
    console.log('Saving PDF with filename:', filename);
    pdf.save(filename);
    
    console.log('=== PDF Export Completed Successfully ===');
    
  } catch (error) {
    console.error('=== PDF Export Failed ===');
    console.error('Error details:', error);
    console.error('Error stack:', error instanceof Error ? error.stack : 'No stack trace');
    
    // Ensure hidden elements are restored even on error
    const elementsToRestore = document.querySelectorAll('[style*="display: none"]');
    elementsToRestore.forEach(el => {
      const htmlEl = el as HTMLElement;
      if (htmlEl.style.display === 'none') {
        htmlEl.style.display = '';
      }
    });
    
    throw new Error(`PDF export failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
};
