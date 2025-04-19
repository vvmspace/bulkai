---
name: Hugo Front Matter Processor
description: Processes Hugo front matter by removing everything before the first "---"
---

// Process Hugo front matter
function processHugo(content) {
const hugoMatch = content.match(/---/g);
if (hugoMatch && hugoMatch.length >= 2) {
const firstIndex = content.indexOf('---');
return content.slice(firstIndex);
}
return content;
}

// Apply Hugo processing to the content
const processedContent = processHugo(aiResponse);
aiResponse = processedContent;
