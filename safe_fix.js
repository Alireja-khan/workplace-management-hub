const fs = require('fs');
let content = fs.readFileSync('app/page.js', 'utf8');

// 1. Fix Initializations
content = content.replace(
    /const \[personalStatusFilter, setPersonalStatusFilter\] = useState\('All Statuses'\);/,
    "const [personalStatusFilter, setPersonalStatusFilter] = useState('all');"
);
content = content.replace(
    /const \[personalSalesFilter, setPersonalSalesFilter\] = useState\('All Sales'\);/,
    "const [personalSalesFilter, setPersonalSalesFilter] = useState('all');"
);
content = content.replace(
    /const \[personalProfileFilter, setPersonalProfileFilter\] = useState\('All Profiles'\);/,
    "const [personalProfileFilter, setPersonalProfileFilter] = useState('all');"
);
content = content.replace(
    /const \[personalMonthFilter, setPersonalMonthFilter\] = useState\(MONTH_LIST\[new Date\(\)\.getMonth\(\)\]\);/,
    "const [personalMonthFilter, setPersonalMonthFilter] = useState('all');"
);
content = content.replace(
    /const \[personalYearFilter, setPersonalYearFilter\] = useState\(new Date\(\)\.getFullYear\(\)\.toString\(\)\);/,
    "const [personalYearFilter, setPersonalYearFilter] = useState('all');"
);
content = content.replace(
    /const \[personalDateFilterType, setPersonalDateFilterType\] = useState\('Assign Date'\);/,
    "const [personalDateFilterType, setPersonalDateFilterType] = useState('assign');"
);

// 2. Fix UI bindings precisely
// Replace exactly the value and onChange inside the specific selects.

// Search Query
content = content.replace(
    /value=\{searchQuery\}\n\s*onChange=\{\(e\) => setSearchQuery\(e\.target\.value\)\}/g,
    "value={currentSearchQuery}\n                    onChange={(e) => setCurrentSearchQuery(e.target.value)}"
);

// Date Filter Type
content = content.replace(
    /value=\{teamDateFilterType\}\n\s*onChange=\{\(e\) => setTeamDateFilterType\(e\.target\.value\)\}/g,
    "value={currentDateFilterType}\n                        onChange={(e) => setCurrentDateFilterType(e.target.value)}"
);

// Year Filter
content = content.replace(
    /value=\{teamYearFilter\}\n\s*onChange=\{\(e\) => setTeamYearFilter\(e\.target\.value\)\}/g,
    "value={currentYearFilter}\n                        onChange={(e) => setCurrentYearFilter(e.target.value)}"
);

// Month Filter
content = content.replace(
    /value=\{teamMonthFilter\}\n\s*onChange=\{\(e\) => setTeamMonthFilter\(e\.target\.value\)\}/g,
    "value={currentMonthFilter}\n                        onChange={(e) => setCurrentMonthFilter(e.target.value)}"
);

// Member Filter (Wait, team Member Filter is only in Team mode, it's fine)
// Let's leave teamMemberFilter as is.

// Sales Filter
content = content.replace(
    /value=\{teamSalesFilter\}\n\s*onChange=\{\(e\) => setTeamSalesFilter\(e\.target\.value\)\}/g,
    "value={currentSalesFilter}\n                        onChange={(e) => setCurrentSalesFilter(e.target.value)}"
);

// Profile Filter
content = content.replace(
    /value=\{profileFilter\}\n\s*onChange=\{\(e\) => setProfileFilter\(e\.target\.value\)\}/g,
    "value={currentProfileFilter}\n                        onChange={(e) => setCurrentProfileFilter(e.target.value)}"
);

// Status Filter (Wait, there's multiple status filters. We only want the main one!)
content = content.replace(
    /<select\s*className="v-select"\s*value=\{statusFilter\}\s*onChange=\{\(e\) => setStatusFilter\(e\.target\.value\)\}/g,
    `<select
                        className="v-select"
                        value={currentStatusFilter}
                        onChange={(e) => setCurrentStatusFilter(e.target.value)}`
);

// Add currentStatusFilter to variables if it doesn't exist
if (!content.includes('const currentStatusFilter =')) {
    content = content.replace(
        /const currentProfileFilter = isTeamMode \? profileFilter : personalProfileFilter;/,
        `const currentProfileFilter = isTeamMode ? profileFilter : personalProfileFilter;
    const currentStatusFilter = isTeamMode ? statusFilter : personalStatusFilter;
    const setCurrentStatusFilter = isTeamMode ? setStatusFilter : setPersonalStatusFilter;`
    );
}

// 3. Fix Reset Button precisely
const oldReset = `                    onClick={() => {
                      setSearchQuery('');
                      setProfileFilter('all');
                      setStatusFilter('all');
                      setCurrentStatusFilter('all');
                      setScheduleFilter('all');
                      setTeamMemberFilter('all');
                      setTeamSalesFilter('all');
                      setTeamYearFilter('all');
                      setTeamMonthFilter('all');
                      setTeamDateFilterType('assign');
                      setCurrentTab('all');
                    }}`;
const newReset = `                    onClick={() => {
                      setCurrentSearchQuery('');
                      setCurrentProfileFilter('all');
                      if (isTeamMode) {
                        setStatusFilter('all');
                        setTeamMemberFilter('all');
                      } else {
                        setPersonalStatusFilter('all');
                      }
                      setCurrentStatusFilter('all');
                      setScheduleFilter('all');
                      setCurrentSalesFilter('all');
                      setCurrentYearFilter('all');
                      setCurrentMonthFilter('all');
                      setCurrentDateFilterType('assign');
                      setCurrentTab('all');
                    }}`;
content = content.replace(oldReset, newReset);

fs.writeFileSync('app/page.js', content, 'utf8');
