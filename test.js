import { parseRawSheetText } from './lib/sheetParser.js';

const input = `C_Forward_SMT Sales
29-Aug-2026
dev_verse
fsimaging
FO82A14FFD6C4
$350.00
Shuvo
$280.00
Delivered
[FO82A14FFD6C4_fsimaging_WordPress_$350](https://docs.google.com/spreadsheets/d/1Mf3n8s91hG4b93H737GEkwcL54sVZq9dBI05mrsEAws/edit?usp=sharing)
EleSquad
1-Sep-2026
$70.00`;

console.log(JSON.stringify(parseRawSheetText(input), null, 2));
