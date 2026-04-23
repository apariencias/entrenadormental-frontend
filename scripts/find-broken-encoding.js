const fs = require('fs');
const path = require('path');
const text = fs.readFileSync(path.join(__dirname, '../la-calma-de-mama.html'), 'utf8');
const patterns = [
  /Ã[\w]/g,
  /â€/g,
  /â„/g,
  /â„¢/g,
  /Â/g,
  /ðŸ/g,
  /âœ/g,
  /â†/g,
  /\ufeff/g,
];
patterns.forEach((pattern) => {
  let match;
  while ((match = pattern.exec(text)) !== null) {
    console.log(`${pattern} -> ${JSON.stringify(match[0])} at ${match.index}`);
  }
});
