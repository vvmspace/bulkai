import { Command } from 'commander';
import fs from 'fs-extra';
import path from 'path';
import { fileURLToPath } from 'url';
import scanner from 'node-recursive-directory';
import OpenAI from 'openai';

// Workaround for __dirname and __filename in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const program = new Command();

program
  .option('-p, --prefix-file <path>', 'Prefix file to be added to the beginning of each file content')
  .option('-s, --suffix-file <path>', 'Suffix file to be added to the end of each file content')
  .option('-i, --input-dir <path>', 'Input directory containing files to be processed')
  .option('-o, --output-dir <path>', 'Output directory where the processed files will be saved')
  .option('-f, --force', 'Force overwrite existing files in the output directory')
  .option('-H, --hugo', 'Enable Hugo front matter processing by removing everything before the first "---" in the AI response')
  .option('-e, --extensions <extensions>', 'Comma-separated list of file extensions to process', '.md,.txt')
  .on('--help', () => {
    console.log('');
    console.log('Example usage:');
    console.log('  npx bulkai -p prefix.txt -s suffix.txt -i ./input -o ./output -f -H -e .md,.txt');
  });

program.parse(process.argv);

const options = program.opts();

// Check for OpenAI API key in environment variables
if (!process.env.OPENAI_API_KEY) {
  console.error('Error: OpenAI API key is not set in the environment variables.');
  console.error('To set the OpenAI API key, follow these steps:');
  console.error('');
  console.error('1. Get your API key from OpenAI: https://platform.openai.com/account/api-keys');
  console.error('2. Set the API key as an environment variable:');
  console.error('   - On macOS/Linux:');
  console.error('     export OPENAI_API_KEY="your-openai-api-key"');
  console.error('   - On Windows (Command Prompt):');
  console.error('     set OPENAI_API_KEY="your-openai-api-key"');
  console.error('   - On Windows (PowerShell):');
  console.error('     $env:OPENAI_API_KEY="your-openai-api-key"');
  console.error('');
  console.error('After setting the API key, you can run the script again.');
  process.exit(1);
}

// Load prefix and suffix content if provided
const prefix = options.prefixFile ? await fs.readFile(options.prefixFile, 'utf8') : '';
const suffix = options.suffixFile ? await fs.readFile(options.suffixFile, 'utf8') : '';

// Parse extensions
const extensions = options.extensions.split(',').map(ext => ext.trim());

// Check for required options
if (!options.inputDir || !options.outputDir) {
  console.error('Missing required parameters: --input-dir and --output-dir are required.');
  process.exit(1);
}

// Initialize OpenAI API
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

async function processFile(filePath, outputDir, force, hugo) {
  const fileName = path.basename(filePath);
  const outputPath = path.join(outputDir, fileName);

  if (!force && await fs.pathExists(outputPath)) {
    console.log(`File already exists: ${outputPath}`);
    return;
  }

  const fileContent = await fs.readFile(filePath, 'utf8');
  const combinedContent = `${prefix}${fileContent}${suffix}`;

  // Send content to OpenAI API
  const completion = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [
      { role: "system", content: "You are a helpful assistant." },
      { role: "user", content: combinedContent },
    ],
  });

  let aiResponse = completion.choices[0].message.content;

  // Hugo flag processing
  if (hugo) {
    const hugoMatch = aiResponse.match(/---/g);
    if (hugoMatch && hugoMatch.length >= 2) {
      const firstIndex = aiResponse.indexOf('---');
      aiResponse = aiResponse.slice(firstIndex);
    }
  }

  // Write the AI's response to the output directory
  await fs.outputFile(outputPath, aiResponse);

  console.log(`Processed and saved: ${outputPath}`);
}

async function main() {
  const files = await scanner(options.inputDir);

  for (const file of files) {
    if (extensions.includes(path.extname(file))) {
      await processFile(file, options.outputDir, options.force, options.hugo);
    }
  }
}

main().catch(console.error);
