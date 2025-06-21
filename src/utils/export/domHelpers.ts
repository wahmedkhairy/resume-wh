
// Helper function to wait for DOM to be ready
export const waitForDOM = (ms: number = 100): Promise<void> => {
  return new Promise(resolve => setTimeout(resolve, ms));
};

// Helper function to find resume element with multiple fallback strategies
export const findResumeElement = (): HTMLElement | null => {
  console.log('Searching for resume element...');
  
  // Strategy 1: Look for data-resume-preview attribute
  let element = document.querySelector('[data-resume-preview]') as HTMLElement;
  if (element) {
    console.log('Found resume element with data-resume-preview');
    return element;
  }
  
  // Strategy 2: Look for ClassicResumePreview class
  element = document.querySelector('.ClassicResumePreview') as HTMLElement;
  if (element) {
    console.log('Found resume element with ClassicResumePreview class');
    return element;
  }
  
  // Strategy 3: Look for any element containing resume content
  element = document.querySelector('[class*="resume"]') as HTMLElement;
  if (element) {
    console.log('Found resume element with resume in class name');
    return element;
  }
  
  // Strategy 4: Look for the parent container
  element = document.querySelector('.border.rounded-lg.bg-white') as HTMLElement;
  if (element) {
    console.log('Found resume element by border styling');
    return element;
  }
  
  console.error('No resume element found');
  return null;
};

// Helper to hide watermarks and anti-theft elements
export const hideOverlayElements = (): Array<{element: HTMLElement, originalDisplay: string}> => {
  const elementsToHide = [
    '.watermark',
    '[data-anti-theft]',
    '.anti-theft',
    '[class*="watermark"]'
  ];
  
  const hiddenElements: Array<{element: HTMLElement, originalDisplay: string}> = [];
  
  elementsToHide.forEach(selector => {
    const elements = document.querySelectorAll(selector);
    elements.forEach(el => {
      const htmlEl = el as HTMLElement;
      hiddenElements.push({
        element: htmlEl,
        originalDisplay: htmlEl.style.display
      });
      htmlEl.style.display = 'none';
    });
  });
  
  console.log(`Hidden ${hiddenElements.length} overlay elements`);
  return hiddenElements;
};

// Helper to restore hidden elements
export const restoreHiddenElements = (hiddenElements: Array<{element: HTMLElement, originalDisplay: string}>) => {
  hiddenElements.forEach(({ element, originalDisplay }) => {
    element.style.display = originalDisplay;
  });
};

// Generate safe filename
export const generateFilename = (data: any, extension: string): string => {
  const timestamp = new Date().toISOString().slice(0, 10);
  const nameFromData = data.personalInfo?.name || '';
  const safeName = nameFromData
    .replace(/[^a-zA-Z0-9\s]/g, '')
    .replace(/\s+/g, '_')
    .substring(0, 30) || 'resume';
  
  return `${safeName}_Resume_${timestamp}.${extension}`;
};
