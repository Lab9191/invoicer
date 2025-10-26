const fs = require('fs');
const path = require('path');

// Convert Roboto fonts to base64 for jsPDF
const regularPath = path.join(__dirname, '../public/fonts/Roboto-Regular.ttf');
const boldPath = path.join(__dirname, '../public/fonts/Roboto-Bold.ttf');
const outputPath = path.join(__dirname, '../src/lib/roboto-font.ts');

const regularData = fs.readFileSync(regularPath);
const boldData = fs.readFileSync(boldPath);

const regularBase64 = regularData.toString('base64');
const boldBase64 = boldData.toString('base64');

const output = `// Auto-generated Roboto fonts in base64 for jsPDF
// These fonts support Slovak special characters (č, š, ž, ť, ď, ľ, ň, etc.)

export const robotoRegularBase64 = '${regularBase64}';

export const robotoBoldBase64 = '${boldBase64}';
`;

fs.writeFileSync(outputPath, output);

console.log('✅ Roboto fonts converted successfully!');
console.log(`   Output: ${outputPath}`);
console.log(`   Regular size: ${(regularBase64.length / 1024).toFixed(2)} KB`);
console.log(`   Bold size: ${(boldBase64.length / 1024).toFixed(2)} KB`);
