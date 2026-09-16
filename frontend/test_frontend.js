import { chromium } from 'playwright';

const url = 'http://localhost:5173';

const diseases = [
  'non-small cell lung carcinoma',
  'triple-negative breast cancer',
  'glioblastoma multiforme',
  'colorectal cancer',
  'acute myeloid leukemia'
];

async function runTest() {
  console.log('Starting Playwright tests for all diseases...');
  const browser = await chromium.launch({ headless: true });
  
  for (const disease of diseases) {
    console.log(`\nTesting disease: ${disease}`);
    const context = await browser.newContext();
    const page = await context.newPage();
    page.setDefaultTimeout(130000);
    
    try {
      await page.goto(url);
      
      // Select disease from dropdown
      await page.selectOption('#diseaseTargetSelector', disease);
      
      // Click analyze button
      await page.click('#startAnalysisBtn');
      
      // Wait for wizard page to load and wait for DOM content
      console.log('Waiting for wizard to load...');
      await page.waitForURL('**/wizard.html', { waitUntil: 'load', timeout: 130000 });
      
      // Evaluate data in wizard
      const result = await page.evaluate(() => {
        const errorText = document.body ? (document.body.innerText.includes('Failed to analyze') || document.body.innerText.includes('Error:')) : false;
        if (errorText) return 'Error modal found';
        
        const dataStr = localStorage.getItem('genebridge_analysis_result');
        let parsed = null;
        if (dataStr) {
           parsed = JSON.parse(dataStr);
        }
        return {
           success: true,
           parsed_proteins: parsed ? parsed.top_targets_evaluated : []
        };
      });
      
      console.log(`Result for ${disease}:`, result);
      
    } catch (err) {
      console.error(`Test failed for ${disease}:`, err.message);
    } finally {
      await context.close();
    }
  }
  
  await browser.close();
  console.log('All tests finished.');
}

runTest();
