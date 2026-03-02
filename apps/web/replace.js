const fs = require('fs');
const path = require('path');

function walk(dir) {
    let results = [];
    const list = fs.readdirSync(dir);
    list.forEach(function (file) {
        file = dir + '/' + file;
        const stat = fs.statSync(file);
        if (stat && stat.isDirectory() && !file.includes('node_modules') && !file.includes('.next')) {
            results = results.concat(walk(file));
        } else {
            if (file.endsWith('.tsx') || file.endsWith('.ts')) {
                results.push(file);
            }
        }
    });
    return results;
}

const files = walk('c:/Users/Sherwyn joel/OneDrive/Desktop/Tech uc/apps/web');
let changed = 0;
files.forEach(f => {
    const content = fs.readFileSync(f, 'utf8');
    if (content.includes('localhost:4000')) {
        fs.writeFileSync(f, content.replace(/localhost:4000/g, '127.0.0.1:4000'), 'utf8');
        console.log('Fixed:', f);
        changed++;
    }
});
console.log('Done! Files modified:', changed);
