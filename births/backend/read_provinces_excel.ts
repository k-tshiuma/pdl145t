import * as xlsx from 'xlsx';
import path from 'path';

const filePath = path.resolve(__dirname, '../provinces.xlsx');
const workbook = xlsx.readFile(filePath);
const sheetName = workbook.SheetNames[0];
const data = xlsx.utils.sheet_to_json(workbook.Sheets[sheetName]);

console.log('Columns:', Object.keys(data[0] as any));
console.log('Sample data:', (data as any[]).slice(0, 5));
