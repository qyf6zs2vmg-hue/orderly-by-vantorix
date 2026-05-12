const fs = require('fs');
const path = require('path');
function walk(dir) {
  let results = [];
  const list = fs.readdirSync(dir);
  list.forEach(file => {
    file = path.join(dir, file);
    const stat = fs.statSync(file);
    if (stat && stat.isDirectory()) { 
      results = results.concat(walk(file));
    } else if (file.endsWith('.tsx') || file.endsWith('.ts')) {
      results.push(file);
    }
  });
  return results;
}

walk('src').forEach(f => {
  let content = fs.readFileSync(f, 'utf8');
  let original = content;

  // Replace shadows
  content = content.replace(/shadow-[[^]]+]/g, 'shadow-sm'); // all arb shadows become shadow-sm or custom ones
  
  // Custom button replacements
  content = content.replace(/bg-brand-primary(s+([^"']))?text-white/g, 'btn-primary');
  
  // Let's replace big border radiuses
  content = content.replace(/rounded-[32px]/g, 'card-large');
  content = content.replace(/rounded-[24px]/g, 'card-large');
  content = content.replace(/rounded-[16px]/g, 'card-small');
  content = content.replace(/rounded-3xl/g, 'card-large');
  content = content.replace(/rounded-2xl/g, 'card-small');
  
  content = content.replace(/border border-border-color(s+)?hover:bg-surface-alt/g, 'btn-secondary');

  if (content !== original) {
    fs.writeFileSync(f, content);
    console.log('Updated', f);
  }
});
