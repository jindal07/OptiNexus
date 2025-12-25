import CloudConvert from 'cloudconvert';

/**
 * Initialize CloudConvert client
 * Requires CLOUDCONVERT_API_KEY environment variable
 */
function getCloudConvertClient() {
  const apiKey = process.env.CLOUDCONVERT_API_KEY;
  
  if (!apiKey) {
    throw new Error('CLOUDCONVERT_API_KEY environment variable is not set');
  }

  return new CloudConvert(apiKey, false); // false for production API
}

/**
 * Create a conversion job with CloudConvert
 * @param {string} inputUrl - Source file URL
 * @param {string} inputFormat - Input format (pdf, docx, pptx)
 * @param {string} outputFormat - Output format (pdf, docx, pptx)
 * @returns {Promise<{jobId: string, status: string}>}
 */
export async function createConversionJob(inputUrl, inputFormat, outputFormat) {
  const cloudConvert = getCloudConvertClient();

  const job = await cloudConvert.jobs.create({
    tasks: {
      'import-file': {
        operation: 'import/url',
        url: inputUrl
      },
      'convert-file': {
        operation: 'convert',
        input: 'import-file',
        input_format: inputFormat,
        output_format: outputFormat
      },
      'export-file': {
        operation: 'export/url',
        input: 'convert-file'
      }
    }
  });

  return {
    jobId: job.id,
    status: job.status
  };
}

/**
 * Get job status and result
 * @param {string} jobId - CloudConvert job ID
 * @returns {Promise<{status: string, progress: number, downloadUrl?: string, error?: string}>}
 */
export async function getJobStatus(jobId) {
  const cloudConvert = getCloudConvertClient();

  const job = await cloudConvert.jobs.get(jobId);

  const result = {
    status: job.status,
    progress: 0
  };

  // Calculate progress based on task statuses
  const tasks = job.tasks || [];
  const completedTasks = tasks.filter(t => t.status === 'finished').length;
  result.progress = Math.round((completedTasks / Math.max(tasks.length, 1)) * 100);

  if (job.status === 'finished') {
    // Find the export task with the download URL
    const exportTask = tasks.find(t => 
      t.operation === 'export/url' && t.status === 'finished'
    );

    if (exportTask && exportTask.result && exportTask.result.files) {
      result.downloadUrl = exportTask.result.files[0]?.url;
    }
    result.progress = 100;
  }

  if (job.status === 'error') {
    const errorTask = tasks.find(t => t.status === 'error');
    result.error = errorTask?.message || 'Conversion failed';
  }

  return result;
}

/**
 * Wait for job completion with polling
 * @param {string} jobId - CloudConvert job ID
 * @param {number} timeout - Timeout in milliseconds
 * @returns {Promise<{downloadUrl: string}>}
 */
export async function waitForJob(jobId, timeout = 300000) {
  const cloudConvert = getCloudConvertClient();
  
  const startTime = Date.now();
  
  while (Date.now() - startTime < timeout) {
    const job = await cloudConvert.jobs.get(jobId);
    
    if (job.status === 'finished') {
      const exportTask = job.tasks.find(t => 
        t.operation === 'export/url' && t.status === 'finished'
      );
      
      if (exportTask?.result?.files?.[0]?.url) {
        return { downloadUrl: exportTask.result.files[0].url };
      }
      throw new Error('No download URL in completed job');
    }
    
    if (job.status === 'error') {
      const errorTask = job.tasks.find(t => t.status === 'error');
      throw new Error(errorTask?.message || 'Conversion failed');
    }
    
    // Wait 2 seconds before next poll
    await new Promise(resolve => setTimeout(resolve, 2000));
  }
  
  throw new Error('Conversion timed out');
}

/**
 * Helper to determine formats
 */
export function getConversionFormats(type) {
  const formatMap = {
    'pdf-to-docx': { input: 'pdf', output: 'docx' },
    'pdf-to-pptx': { input: 'pdf', output: 'pptx' },
    'docx-to-pdf': { input: 'docx', output: 'pdf' },
    'pptx-to-pdf': { input: 'pptx', output: 'pdf' },
    'doc-to-pdf': { input: 'doc', output: 'pdf' },
    'ppt-to-pdf': { input: 'ppt', output: 'pdf' }
  };

  return formatMap[type] || null;
}

