# BulkAI: Revolutionize Your Markdown Processing with the Power of OpenAI

[![npm version](https://badge.fury.io/js/bulkai.svg)](https://www.npmjs.com/package/bulkai)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

Are you tired of manually processing large sets of markdown files, or struggling to find the time to enhance your content with the latest AI technology? **BulkAI** is here to change the game. With just a few simple commands, you can transform how you manage and optimize your markdown and text files, all while harnessing the incredible power of OpenAI’s GPT-4. Whether you're looking to rewrite entire websites, translate books, or simply batch-process content with custom formatting, BulkAI makes it easier than ever.

Don't wait—experience the difference BulkAI can make in your workflow today!

## Usage

No installation required! You can run BulkAI directly using `npx`:

```bash
npx bulkai -i input-dir -o output-dir [options]
```

### Example Command

```bash
npx bulkai -p prefix.md -s suffix.md -i ./input -o ./output -f -H -e .md,.txt
```

### Command-Line Options

-   **`-p, --prefix-file <path>`**: Path to the file containing the prefix to add to each file (e.g., `prefix.md`).
-   **`-s, --suffix-file <path>`**: Path to the file containing the suffix to add to each file (e.g., `suffix.md`).
-   **`-i, --input-dir <path>`**: Path to the input directory containing files to process.
-   **`-o, --output-dir <path>`**: Path to the output directory where processed files will be saved.
-   **`-f, --force`**: Force overwrite of existing files in the output directory.
-   **`-H, --hugo`**: Enable Hugo front matter processing.
-   **`-e, --extensions <extensions>`**: Comma-separated list of file extensions to process (default: `.md,.txt`).
-   **`-x, --excluded <parts>`**: Comma-separated list of path parts to exclude from processing (e.g., `/.,_private`).

## Introduction

**BulkAI** is a powerful Node.js CLI tool designed to automate the processing of markdown and text files using OpenAI's GPT-4. Ideal for developers, content creators, and technical writers, BulkAI allows you to efficiently batch-process your `.md` and `.txt` files, adding custom prefixes and suffixes, and even handling Hugo front matter with ease. Whether you're preparing large sets of documents, rewriting entire websites, or translating books, BulkAI simplifies the workflow and maximizes productivity.

## Features

### 🔄 Batch Processing of Markdown and Text Files

BulkAI enables the bulk processing of `.md` and `.txt` files, making it perfect for large-scale content management tasks. Simply point the tool to your input directory, and it will recursively scan and process all specified file types.

### 🎨 Custom Prefix and Suffix Support

Easily add custom prefixes and suffixes to your content before sending it to the OpenAI API. This feature is particularly useful for standardizing content, adding disclaimers, or appending signatures. For example, you can use `prefix.md` and `suffix.md` files to define the content you want to prepend or append to your documents.

### 🚀 OpenAI GPT-4 Integration

Leverage the power of OpenAI's GPT-4 to enhance your content. BulkAI sends your processed content to the OpenAI API, where it can be improved, summarized, or expanded upon, based on your needs. This capability is powerful enough to rewrite entire websites or even translate entire books into different languages, making BulkAI a versatile tool for various content processing tasks.

### 🛠️ Hugo Front Matter Handling

With the `--hugo` option, BulkAI automatically detects and handles Hugo front matter in your markdown files. If the AI response contains Hugo front matter (denoted by `---`), the tool will strip any content before the first occurrence, ensuring clean, ready-to-use output for your Hugo site.

### 📝 Flexible File Extension Support

BulkAI allows you to specify which file extensions to process using the `--extensions` option. By default, it processes `.md` and `.txt` files, but you can customize this to fit your specific needs.

### 💾 Force Overwrite Option

The `--force` option ensures that processed files are always written to the output directory, even if they already exist. This is useful when you need to re-process files without manually deleting old versions.

### 🔍 SEO-Friendly Content Processing

Designed with SEO in mind, BulkAI helps you optimize your markdown content for better search engine visibility. By integrating GPT-4's advanced language model, you can generate more engaging, keyword-rich content that resonates with both readers and search engines.

## Benefits

-   **Boost Productivity**: Automate repetitive content enhancement tasks, saving time and reducing manual effort.
-   **Enhance Content Quality**: Use OpenAI's GPT-4 to improve the readability, engagement, and SEO performance of your markdown files.
-   **Flexible and Customizable**: Tailor the processing to your specific workflow needs, from file handling to content customization.

## License

BulkAI is licensed under the [MIT License](https://opensource.org/licenses/MIT).
