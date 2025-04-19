#!/usr/bin/env node

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
  .option('-x, --excluded <parts>', 'Excluded file to be skipped')
  .option('-m, --multiple', 'Create multiple files from a single input file')
  .on('--help', () => {
    console.log('');
    console.log('Example usage:');
    console.log('  npx bulkai -p prefix.txt -s suffix.txt -i ./input -o ./output -f -H -e .md,.txt');
    console.log('  npx bulkai -m -i ./input -o ./output -f -e .md,.txt');
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
async function loadPrefixOrSuffix(input) {
  if (!input) return '';
  
  const parts = input.split(',').map(part => part.trim());
  let content = '';
  
  for (const part of parts) {
    // Check if it's a preset (no path separators)
    if (!part.includes('/') && !part.includes('\\')) {
      const presetPath = path.join(__dirname, 'presets', `${part}.md`);
      if (await fs.pathExists(presetPath)) {
        content += await fs.readFile(presetPath, 'utf8');
        continue;
      }
    }
    // Try as a regular file path
    if (await fs.pathExists(part)) {
      content += await fs.readFile(part, 'utf8');
    } else {
      console.warn(`Warning: ${part} not found as preset or file`);
    }
  }
  
  return content;
}

const prefix = await loadPrefixOrSuffix(options.prefixFile);
const suffix = await loadPrefixOrSuffix(options.suffixFile);

const inputPath = path.resolve(options.inputDir);

// Parse extensions
const extensions = options.extensions.split(',').map(ext => ext.trim());

// Parse excluded
const excluded = options.excluded ? options.excluded.split(',').map(path => path.trim()) : [];

// Check for required options
if (!options.inputDir || !options.outputDir) {
  console.error('Missing required parameters: --input-dir and --output-dir are required.');
  process.exit(1);
}

// Initialize OpenAI API
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

async function processFile(filePath, outputDir, force, hugo, multiple) {
  const outputFilePath = path.resolve(filePath).replace(inputPath, '');
  // outputPath preserves directory structure
  const outputPath = path.join(outputDir, outputFilePath);
  const outputFileDir = path.dirname(outputPath);
  // create output directory if it doesn't exist
  await fs.ensureDir(outputFileDir);

  if (!force && await fs.pathExists(outputPath)) {
    console.log(`File already exists: ${outputPath}`);
    return;
  }

  const fileContent = await fs.readFile(filePath, 'utf8');
  const combinedContent = `${prefix}${fileContent}${suffix}`;

  // Send content to OpenAI API
  const completion = await openai.chat.completions.create({
    model: process.env.DEFAULT_MODEL || "gpt-4o-mini",
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

  if (multiple) {
    // Create multiple files based on sections
    const sections = aiResponse.split(/\n(?=#{1,6}\s)/);
    for (const section of sections) {
      if (!section.trim()) continue;
      
      // Extract title from the first line
      const titleMatch = section.match(/^#{1,6}\s+(.+)$/m);
      if (!titleMatch) continue;
      
      const title = titleMatch[1]
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-|-$/g, '');
      
      const sectionPath = path.join(outputFileDir, `${title}.md`);
      await fs.outputFile(sectionPath, section);
      console.log(`Created section: ${sectionPath}`);
    }
  } else {
    // Write the AI's response to the output directory
    await fs.outputFile(outputPath, aiResponse);
    console.log(`Processed and saved: ${outputPath}`);
  }
}

// check if filePath contains excluded file or directory
function isExcluded(filePath) {
  return excluded.some(exclude => filePath.includes(exclude));
}

async function main() {
  const files = await scanner(inputPath);

  for (const file of files) {
    if (!extensions.includes(path.extname(file))) continue;
    if (isExcluded(file)) {
      console.log(`Excluded: ${file}`);
      continue;
    }
    await processFile(file, options.outputDir, options.force, options.hugo, options.multiple);
  }
}

main().catch(console.error);
