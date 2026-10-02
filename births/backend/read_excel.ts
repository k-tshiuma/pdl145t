import * as xlsx from 'xlsx';
import path from 'path';

const filePath = path.resolve(__dirname, '../provinces_et_territoires.xlsx');
const workbook = xlsx.readFile(filePath);
const sheetName = workbook.SheetNames[0];
const data = xlsx.utils.sheet_to_json(workbook.Sheets[sheetName]) as any[];

console.log('Columns:', Object.keys(data[0]));
console.log('Sample data:', data.slice(0, 3));
