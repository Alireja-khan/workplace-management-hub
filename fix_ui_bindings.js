const fs = require('fs');
let content = fs.readFileSync('app/page.js', 'utf8');

// The dropdowns and search bar are incorrectly hardcoded to the team/old state variables.
// They should be bound to the `current...` dynamic variables!

// 1. Search Bar
content = content.replace(
    /value=\{searchQuery\}/g,
    "value={currentSearchQuery}"
);
content = content.replace(
    /onChange=\{\(e\) => setSearchQuery\(e\.target\.value\)\}/g,
    "onChange={(e) => setCurrentSearchQuery(e.target.value)}"
);

// 2. Year Filter
content = content.replace(
    /value=\{teamYearFilter\}/g,
    "value={currentYearFilter}"
);
content = content.replace(
    /onChange=\{\(e\) => setTeamYearFilter\(e\.target\.value\)\}/g,
    "onChange={(e) => setCurrentYearFilter(e.target.value)}"
);

// 3. Month Filter
content = content.replace(
    /value=\{teamMonthFilter\}/g,
    "value={currentMonthFilter}"
);
content = content.replace(
    /onChange=\{\(e\) => setTeamMonthFilter\(e\.target\.value\)\}/g,
    "onChange={(e) => setCurrentMonthFilter(e.target.value)}"
);

// 4. Sales Person Filter
content = content.replace(
    /value=\{teamSalesFilter\}/g,
    "value={currentSalesFilter}"
);
content = content.replace(
    /onChange=\{\(e\) => setTeamSalesFilter\(e\.target\.value\)\}/g,
    "onChange={(e) => setCurrentSalesFilter(e.target.value)}"
);

// 5. Date Filter Type (Assign Date vs Delivery Date)
content = content.replace(
    /value=\{teamDateFilterType\}/g,
    "value={currentDateFilterType}"
);
content = content.replace(
    /onChange=\{\(e\) => setTeamDateFilterType\(e\.target\.value\)\}/g,
    "onChange={(e) => setCurrentDateFilterType(e.target.value)}"
);

// 6. Profile Filter (Already currentProfileFilter? Wait, in JSX it's profileFilter)
// Let's check what's defined.
// const currentProfileFilter = isTeamMode ? profileFilter : personalProfileFilter;
content = content.replace(
    /<select[\s\S]*?className="v-select"[\s\S]*?value=\{profileFilter\}[\s\S]*?onChange=\{\(e\) => setProfileFilter\(e\.target\.value\)\}/g,
    `<select
        className="v-select"
        value={currentProfileFilter}
        onChange={(e) => setCurrentProfileFilter(e.target.value)}`
);

// 7. Status Filter
// const currentStatus = isTeamMode ? statusFilter : personalStatusFilter;
// const setCurrentStatus = isTeamMode ? setStatusFilter : setPersonalStatusFilter;
// First let's inject those definitions if they don't exist
if (!content.includes('const currentStatus = isTeamMode ?')) {
    content = content.replace(
        /const currentProfileFilter = isTeamMode \? profileFilter : personalProfileFilter;/,
        `const currentProfileFilter = isTeamMode ? profileFilter : personalProfileFilter;
    const setCurrentProfileFilter = isTeamMode ? setProfileFilter : setPersonalProfileFilter;
    const currentStatus = isTeamMode ? teamStatusFilter : personalStatusFilter;
    const setCurrentStatus = isTeamMode ? setTeamStatusFilter : setPersonalStatusFilter;`
    );
}

// Then replace the JSX
content = content.replace(
    /<select[\s\S]*?className="v-select"[\s\S]*?value=\{statusFilter\}[\s\S]*?onChange=\{\(e\) => setStatusFilter\(e\.target\.value\)\}/g,
    `<select
        className="v-select"
        value={currentStatus}
        onChange={(e) => setCurrentStatus(e.target.value)}`
);

// 8. Fix Reset button!
content = content.replace(
    /setSearchQuery\(''\);[\s\S]*?setProfileFilter\('all'\);[\s\S]*?setStatusFilter\('all'\);[\s\S]*?setCurrentStatusFilter\('all'\);[\s\S]*?setScheduleFilter\('all'\);[\s\S]*?setTeamMemberFilter\('all'\);[\s\S]*?setTeamSalesFilter\('all'\);[\s\S]*?setTeamYearFilter\('all'\);[\s\S]*?setTeamMonthFilter\('all'\);[\s\S]*?setTeamDateFilterType\('assign'\);[\s\S]*?setCurrentTab\('all'\);/,
    `setCurrentSearchQuery('');
    setCurrentProfileFilter('all');
    setCurrentStatus('all');
    if (isTeamMode) {
      setTeamMemberFilter('all');
    }
    setCurrentSalesFilter('all');
    setCurrentYearFilter(isTeamMode ? 'all' : new Date().getFullYear().toString());
    setCurrentMonthFilter(isTeamMode ? 'all' : MONTH_LIST[new Date().getMonth()]);
    setCurrentDateFilterType(isTeamMode ? 'assign' : 'Assign Date');
    setCurrentTab('all');`
);

fs.writeFileSync('app/page.js', content, 'utf8');
