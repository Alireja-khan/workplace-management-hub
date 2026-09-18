const fs = require('fs');
let content = fs.readFileSync('app/page.js', 'utf8');

const targetStr = `const filteredPersonalProjects = useMemo(() => {
    let res = teamProjects.filter((p) => {`;

const newStr = `const filteredPersonalProjects = useMemo(() => {
    let res = teamProjects.filter((p) => {
      const isMyProject = Array.isArray(p.assignedMembers) && p.assignedMembers.some(m => m.toLowerCase() === (session?.user?.assignedName || 'Alireja').toLowerCase());
      if (!isMyProject) return false;`;

content = content.replace(
    /const filteredPersonalProjects = useMemo\(\(\) => \{\r?\n\s*let res = teamProjects\.filter\(\(p\) => \{/,
    newStr
);

fs.writeFileSync('app/page.js', content, 'utf8');
