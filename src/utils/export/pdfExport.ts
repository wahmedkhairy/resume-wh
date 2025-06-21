
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
    // Validate input data first
    if (!data || typeof data !== 'object') {
      throw new Error('Invalid export data provided');
    }

    if (!data.personalInfo || typeof data.personalInfo !== 'object') {
      throw new Error('Personal information is required for export');
    }
    
    // Wait for DOM to be ready and stable
    await waitForDOM(500);
    
    // Find the resume element with better error handling
    console.log('Searching for resume element...');
    const resumeElement = findResumeElement();
    
    if (!resumeElement) {
      console.error('Resume element not found in DOM');
      throw new Error('Resume preview not found. Please ensure the resume is visible and try again.');
    }
    
    console.log('Resume element found:', resumeElement);
    console.log('Element details:', {
      tagName: resumeElement.tagName,
      className: resumeElement.className,
      width: resumeElement.offsetWidth,
      height: resumeElement.offsetHeight,
      visible: resumeElement.offsetParent !== null,
      childCount: resumeElement.children.length
    });
    
    // Validate element visibility and dimensions
    if (resumeElement.offsetParent === null) {
      throw new Error('Resume element is not visible. Please ensure the resume preview is displayed.');
    }
    
    if (resumeElement.offsetWidth === 0 || resumeElement.offsetHeight === 0) {
      throw new Error('Resume element has no dimensions. Please refresh the page and try again.');
    }
    
    // Show loading feedback to prevent user interaction
    console.log('Preparing export, hiding overlay elements...');
    const hiddenElements = hideOverlayElements();
    
    // Wait for style changes to apply
    await waitForDOM(200);
    
    try {
      // Dynamically import required libraries
      console.log('Loading html2canvas and jsPDF libraries...');
      const [html2canvasModule, jsPDFModule] = await Promise.all([
        import('html2canvas'),
        import('jspdf')
      ]);
      
      const html2canvas = html2canvasModule.default;
      const { jsPDF } = jsPDFModule;
      
      console.log('Libraries loaded successfully');
      
      // Create canvas with optimized settings to prevent freezing
      console.log('Generating canvas from element...');
      
      // Use requestAnimationFrame to prevent blocking
      const canvas = await new Promise<HTMLCanvasElement>((resolve, reject) => {
        requestAnimationFrame(async () => {
          try {
            const generatedCanvas = await html2canvas(resumeElement, {
              scale: 2,
              useCORS: true,
              allowTaint: false,
              backgroundColor: '#ffffff',
              logging: false,
              width: resumeElement.offsetWidth,
              height: resumeElement.offsetHeight,
              windowWidth: resumeElement.offsetWidth,
              windowHeight: resumeElement.offsetHeight,
              scrollX: 0,
              scrollY: 0,
              foreignObjectRendering: false,
              removeContainer: true,
              onclone: (clonedDoc) => {
                console.log('Processing cloned document...');
                // Remove overlay elements in cloned document
                const elementsToHide = ['.watermark', '[data-anti-theft]', '.anti-theft', '[class*="watermark"]'];
                elementsToHide.forEach(selector => {
                  const elements = clonedDoc.querySelectorAll(selector);
                  elements.forEach(el => el.remove());
                });
              }
            });
            resolve(generatedCanvas);
          } catch (error) {
            reject(error);
          }
        });
      });
      
      console.log('Canvas created successfully:', {
        width: canvas.width,
        height: canvas.height,
        dataURL: canvas.toDataURL('image/png', 0.1).substring(0, 50) + '...'
      });
      
      // Validate canvas
      if (canvas.width === 0 || canvas.height === 0) {
        throw new Error('Generated canvas has invalid dimensions');
      }
      
      // Create PDF with better error handling
      console.log('Creating PDF document...');
      const imgData = canvas.toDataURL('image/png', 0.95);
      
      if (!imgData || imgData === 'data:,' || imgData.length < 100) {
        throw new Error('Failed to generate valid image data from canvas');
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
      
      // Use requestAnimationFrame for the save operation to prevent freezing
      requestAnimationFrame(() => {
        pdf.save(filename);
        console.log('=== PDF Export Completed Successfully ===');
      });
      
    } finally {
      // Always restore hidden elements
      console.log('Restoring hidden elements...');
      restoreHiddenElements(hiddenElements);
    }
    
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
