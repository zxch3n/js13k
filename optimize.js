const fs = require('fs');

const content = fs.readFileSync('./dist/main.js', { encoding: 'utf-8' });
const newContent = content
  .replace(/atmosphere/g, 'at')
  .replace(/parent/g, 'pr')
  .replace(/planet/g, 'pl')
  .replace(/low/g, 'l')
  .replace(/camera/g, 'cr')
  .replace(/speedX/g, 'sx')
  .replace(/speedY/g, 'sy')
  .replace(/attackDistance/g, 'atd')
  .replace(/hight/g, 'h')
  .replace(/target/g, 'tg')
  .replace(/attackInterval/g, 'ati');
fs.writeFileSync('./dist/main.js', newContent, { encoding: 'utf-8' });
