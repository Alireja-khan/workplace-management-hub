const fs = require('fs');
let content = fs.readFileSync('app/page.js', 'utf8');

const regex = /const setCurrentProfileFilter = isTeamMode \? setProfileFilter : setPersonalProfileFilter;\r?\n\s*const activeOrderStatusFilter = isTeamMode \? statusFilter : personalStatusFilter;\r?\n\s*const setActiveOrderStatusFilter = isTeamMode \? setStatusFilter : setPersonalStatusFilter;\r?\n\s*const setCurrentProfileFilter = isTeamMode \? setProfileFilter : setPersonalProfileFilter;/g;

content = content.replace(regex, `const setCurrentProfileFilter = isTeamMode ? setProfileFilter : setPersonalProfileFilter;
  const activeOrderStatusFilter = isTeamMode ? statusFilter : personalStatusFilter;
  const setActiveOrderStatusFilter = isTeamMode ? setStatusFilter : setPersonalStatusFilter;`);

fs.writeFileSync('app/page.js', content, 'utf8');
