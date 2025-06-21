
import { exportResumeAsPlainText } from './textExport';
import { exportResumeToPDF } from './export/pdfExport';
import { exportResumeAsHTML } from './export/htmlExport';
import { ExportData } from './export/types';

export type { ExportData };

// Export as PDF
export { exportResumeToPDF };

// Export as Word
export const exportResumeAsWord = async (data: ExportData): Promise<void> => {
  console.log('=== Starting Word Export ===');
  console.log('Export data received:', data);
  
  try {
    if (!data || typeof data !== 'object') {
      throw new Error('Invalid export data provided');
    }
    
    const { exportResumeAsWord: exportWordFunction } = await import('./wordExport');
    await exportWordFunction(data);
    
    console.log('=== Word Export Completed Successfully ===');
  } catch (error) {
    console.error('=== Word Export Failed ===');
    console.error('Error details:', error);
    throw new Error(`Word export failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
};

// Export as plain text
export const exportResumeAsText = (data: ExportData): void => {
  console.log('=== Starting Text Export ===');
  try {
    exportResumeAsPlainText(data);
    console.log('=== Text Export Completed Successfully ===');
  } catch (error) {
    console.error('=== Text Export Failed ===');
    console.error('Error details:', error);
    throw new Error(`Text export failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
};

// Export as HTML  
export { exportResumeAsHTML };
