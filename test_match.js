const fs = require('fs');
const content = fs.readFileSync('app/page.js', 'utf-8');
const teamRegex = /(const filteredTeamProjects = useMemo\(\(\) => \{[\s\S]*?\}\), \[.*?\]\);)/;
const match = content.match(teamRegex);
console.log(match ? "Matched!" : "Failed to match!");
