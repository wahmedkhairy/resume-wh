
// Helper function to wait for DOM to be ready
export const waitForDOM = (ms: number = 100): Promise<void> => {
  return new Promise(resolve => {
    // Use requestAnimationFrame for better timing
    requestAnimationFrame(() => {
      setTimeout(resolve, ms);
    });
  });
};

// Helper function to find resume element with multiple fallback strategies
export const findResumeElement = (): HTMLElement | null => {
  console.log('=== Searching for resume element ===');
  
  // Strategy 1: Look for data-resume-preview attribute (most specific)
  let element = document.querySelector('[data-resume-preview]') as HTMLElement;
  if (element && element.offsetWidth > 0 && element.offsetHeight > 0) {
    console.log('✓ Found resume element with data-resume-preview');
    return element;
  }
  
  // Strategy 2: Look for ClassicResumePreview class
  element = document.querySelector('.ClassicResumePreview') as HTMLElement;
  if (element && element.offsetWidth > 0 && element.offsetHeight > 0) {
    console.log('✓ Found resume element with ClassicResumePreview class');
    return element;
  }
  
  // Strategy 3: Look inside PreviewSection for the resume container
  element = document.querySelector('.border.rounded-lg.bg-white') as HTMLElement;
  if (element && element.offsetWidth > 0 && element.offsetHeight > 0) {
    console.log('✓ Found resume element by container styling');
    return element;
  }
  
  // Strategy 4: Look for any element containing resume content by checking for common resume elements
  const resumeContainers = document.querySelectorAll('div');
  for (const container of resumeContainers) {
    const htmlContainer = container as HTMLElement;
    // Check if this container has resume-like content
    const hasName = htmlContainer.textContent?.includes('NAME') || 
                    htmlContainer.querySelector('h1, h2, .text-xl, .font-bold');
    const hasWorkExperience = htmlContainer.textContent?.includes('EXPERIENCE') ||
                              htmlContainer.textContent?.includes('Work Experience');
    
    if (hasName && htmlContainer.offsetWidth > 200 && htmlContainer.offsetHeight > 300) {
      console.log('✓ Found resume element by content analysis');
      return htmlContainer;
    }
  }
  
  // Strategy 5: Last resort - find the largest visible element in the preview area
  const previewElements = document.querySelectorAll('[class*="preview"], [class*="resume"]');
  let largestElement: HTMLElement | null = null;
  let largestArea = 0;
  
  previewElements.forEach(el => {
    const htmlEl = el as HTMLElement;
    const area = htmlEl.offsetWidth * htmlEl.offsetHeight;
    if (area > largestArea && htmlEl.offsetParent !== null) {
      largestArea = area;
      largestElement = htmlEl;
    }
  });
  
  if (largestElement) {
    console.log('✓ Found resume element by size analysis');
    return largestElement;
  }
  
  console.error('✗ No suitable resume element found');
  console.log('Available elements:', {
    dataResumePreview: !!document.querySelector('[data-resume-preview]'),
    classicResumePreview: !!document.querySelector('.ClassicResumePreview'),
    borderContainer: !!document.querySelector('.border.rounded-lg.bg-white'),
    totalDivs: document.querySelectorAll('div').length
  });
  
  return null;
};

// Helper to hide watermarks and anti-theft elements
export const hideOverlayElements = (): Array<{element: HTMLElement, originalDisplay: string}> => {
  console.log('Hiding overlay elements...');
  
  const elementsToHide = [
    '.watermark',
    '[data-anti-theft]',
    '.anti-theft',
    '[class*="watermark"]',
    '[data-watermark]'
  ];
  
  const hiddenElements: Array<{element: HTMLElement, originalDisplay: string}> = [];
  
  elementsToHide.forEach(selector => {
    const elements = document.querySelectorAll(selector);
    elements.forEach(el => {
      const htmlEl = el as HTMLElement;
      hiddenElements.push({
        element: htmlEl,
        originalDisplay: htmlEl.style.display || ''
      });
      htmlEl.style.display = 'none';
    });
  });
  
  console.log(`Hidden ${hiddenElements.length} overlay elements`);
  return hiddenElements;
};

// Helper to restore hidden elements
export const restoreHiddenElements = (hiddenElements: Array<{element: HTMLElement, originalDisplay: string}>) => {
  console.log('Restoring hidden elements...');
  hiddenElements.forEach(({ element, originalDisplay }) => {
    element.style.display = originalDisplay;
  });
  console.log(`Restored ${hiddenElements.length} elements`);
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
