const fs = require('fs');

let content = fs.readFileSync('app/page.js', 'utf-8');

// 1. Remove projects state and other useless states
content = content.replace(/const \[projects, setProjects\] = useState\(\[\]\);[\s\S]*?const \[currentTab, setCurrentTab\] = useState\('running'\);\s*/, '');
content = content.replace(/const \[profileFilter, setProfileFilter\].*?const \[sortConfig, setSortConfig\].*?\} \);\s*/s, '');

// Add personal filter states
const personal_states = `  const [personalSearchQuery, setPersonalSearchQuery] = useState('');
  const [personalStatusFilter, setPersonalStatusFilter] = useState('All Statuses');
  const [personalSalesFilter, setPersonalSalesFilter] = useState('All Sales');
  const [personalProfileFilter, setPersonalProfileFilter] = useState('All Profiles');
  const [personalMonthFilter, setPersonalMonthFilter] = useState(MONTH_LIST[new Date().getMonth()]);
  const [personalYearFilter, setPersonalYearFilter] = useState(new Date().getFullYear().toString());
  const [personalDateFilterType, setPersonalDateFilterType] = useState('Assign Date');
`;
content = content.replace("const [teamProjects, setTeamProjects] = useState([]);", personal_states + "\n  const [teamProjects, setTeamProjects] = useState([]);");

// 2. Modify fetchProjects
content = content.replace(/const fetchProjects = async \(\) => \{[\s\S]*?\};\s*/, '');
content = content.replace(/await fetchProjects\(\);\n/g, '');
content = content.replace(/fetchProjects\(\);\n/g, '');
content = content.replace(/fetchProjects,\n/g, '');
content = content.replace(/fetchProjects\(\);/g, '');
content = content.replace(/await fetchProjects\(\);/g, '');

// 3. Create filteredPersonalProjects
const teamRegex = /(const filteredTeamProjects = useMemo\(\(\) => \{[\s\S]*?\}\), \[.*?\]\);)/;
const match = content.match(teamRegex);
if (match) {
    const team_block = match[1];
    let personal_block = team_block.replace(/filteredTeamProjects/g, "filteredPersonalProjects");
    personal_block = personal_block.replace(/teamSearchQuery/g, "personalSearchQuery");
    personal_block = personal_block.replace(/teamStatusFilter/g, "personalStatusFilter");
    
    // Crucial: inject user check
    personal_block = personal_block.replace("if (!memberMatch)", "const isMyProject = isMemberMatch(p.assignedMembers, session?.user?.assignedName || 'Alireja');\n        if (!isMyProject) return false;\n\n        if (!memberMatch)");
    personal_block = personal_block.replace(/teamMemberFilter/g, "'All Members'");
    personal_block = personal_block.replace(/teamSalesFilter/g, "personalSalesFilter");
    personal_block = personal_block.replace(/teamProfileFilter/g, "personalProfileFilter");
    personal_block = personal_block.replace(/teamMonthFilter/g, "personalMonthFilter");
    personal_block = personal_block.replace(/teamYearFilter/g, "personalYearFilter");
    personal_block = personal_block.replace(/teamDateFilterType/g, "personalDateFilterType");
    
    // Update dependency array
    const dep_array_match = personal_block.match(/, \[(.*?)\]\);/);
    if (dep_array_match) {
        let new_dep_array = dep_array_match[1].replace(/teamSearchQuery/g, "personalSearchQuery")
          .replace(/teamStatusFilter/g, "personalStatusFilter")
          .replace(/teamSalesFilter/g, "personalSalesFilter")
          .replace(/teamProfileFilter/g, "personalProfileFilter")
          .replace(/teamMonthFilter/g, "personalMonthFilter")
          .replace(/teamYearFilter/g, "personalYearFilter")
          .replace(/teamDateFilterType/g, "personalDateFilterType")
          .replace(/teamMemberFilter, /g, "");
        new_dep_array += ", session?.user?.assignedName";
        personal_block = personal_block.replace(/, \[.*?\]\);/, `, [${new_dep_array}]);`);
    }
    
    content = content.replace(team_block, team_block + "\n\n  " + personal_block);
}

fs.writeFileSync('app/page.js', content, 'utf-8');
