const fs = require('fs');
let content = fs.readFileSync('app/page.js', 'utf8');

// Fix initializations
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

// Fix Reset button fallback values
content = content.replace(
    /setCurrentYearFilter\(isTeamMode \? 'all' : new Date\(\)\.getFullYear\(\)\.toString\(\)\);/,
    "setCurrentYearFilter('all');"
);
content = content.replace(
    /setCurrentMonthFilter\(isTeamMode \? 'all' : MONTH_LIST\[new Date\(\)\.getMonth\(\)\]\);/,
    "setCurrentMonthFilter('all');"
);
content = content.replace(
    /setCurrentDateFilterType\(isTeamMode \? 'assign' : 'Assign Date'\);/,
    "setCurrentDateFilterType('assign');"
);

fs.writeFileSync('app/page.js', content, 'utf8');
