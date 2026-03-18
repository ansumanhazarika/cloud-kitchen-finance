/**
 * =====================================================
 * SpiceBox Kitchen Finance Hub — Google Apps Script Backend
 * (Single "Entries" Sheet)
 * =====================================================
 *
 * SETUP INSTRUCTIONS:
 * 1. Create a new Google Sheet (sheets.new)
 * 2. Go to Extensions > Apps Script
 * 3. Delete the default code in Code.gs
 * 4. Paste this ENTIRE file into Code.gs
 * 5. Click Save (Ctrl+S)
 * 6. In the toolbar, select "setupNewSheets" from the function dropdown
 * 7. Click Run and authorize when prompted
 * 8. Click Deploy > New Deployment
 * 9. Click the gear icon next to "Select type" and choose "Web app"
 * 10. Set "Execute as" → Me
 * 11. Set "Who has access" → Anyone
 * 12. Click Deploy
 * 13. Copy the Web App URL — paste it into the Finance Hub app
 */

var ENTRIES_HEADERS = ['id', 'date', 'dateTo', 'type', 'category', 'amount', 'commission', 'gst', 'deliveryCharge', 'netAmount', 'paidBy', 'note', 'status'];

function setupNewSheets() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName('Entries');
  if (!sheet) {
    sheet = ss.insertSheet('Entries');
  } else {
    sheet.clear();
  }
  sheet.getRange(1, 1, 1, ENTRIES_HEADERS.length).setValues([ENTRIES_HEADERS]);
  sheet.getRange(1, 1, 1, ENTRIES_HEADERS.length).setFontWeight('bold');
  sheet.setFrozenRows(1);

  try {
    var sheet1 = ss.getSheetByName('Sheet1');
    if (sheet1 && ss.getSheets().length > 1) {
      ss.deleteSheet(sheet1);
    }
  } catch (e) {}

  SpreadsheetApp.getUi().alert('Setup complete! "Entries" sheet created with headers:\n' + ENTRIES_HEADERS.join(', '));
}

function doGet(e) {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName('Entries');
  var numericFields = ['id', 'amount', 'commission', 'gst', 'deliveryCharge', 'netAmount'];

  if (!sheet || sheet.getLastRow() <= 1) {
    return ContentService.createTextOutput(JSON.stringify({ Entries: [] }))
      .setMimeType(ContentService.MimeType.JSON);
  }

  var data = sheet.getDataRange().getValues();
  var headers = data[0];
  var rows = [];

  for (var i = 1; i < data.length; i++) {
    var row = data[i];
    var hasData = false;
    for (var c = 0; c < row.length; c++) {
      if (row[c] !== '' && row[c] !== null) { hasData = true; break; }
    }
    if (!hasData) continue;

    var obj = {};
    for (var j = 0; j < headers.length; j++) {
      var h = headers[j];
      var v = row[j];
      if (h === 'date' || h === 'dateTo') {
        if (v instanceof Date) {
          obj[h] = Utilities.formatDate(v, Session.getScriptTimeZone(), 'yyyy-MM-dd');
        } else {
          obj[h] = v ? String(v) : '';
        }
      } else if (numericFields.indexOf(h) !== -1) {
        obj[h] = Number(v) || 0;
      } else {
        obj[h] = v !== null && v !== undefined ? String(v) : '';
      }
    }
    rows.push(obj);
  }

  return ContentService.createTextOutput(JSON.stringify({ Entries: rows }))
    .setMimeType(ContentService.MimeType.JSON);
}

function doPost(e) {
  try {
    var body = JSON.parse(e.postData.contents);
    var action = body.action;
    var rows = body.rows;
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var sheet = ss.getSheetByName('Entries');

    if (!sheet) {
      return ContentService.createTextOutput(JSON.stringify({ error: 'Entries sheet not found. Run setupNewSheets() first.' }))
        .setMimeType(ContentService.MimeType.JSON);
    }

    if (action === 'sync') {
      var headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
      var lastRow = sheet.getLastRow();
      if (lastRow > 1) {
        sheet.getRange(2, 1, lastRow - 1, sheet.getLastColumn()).clearContent();
      }
      if (rows && rows.length > 0) {
        var newRows = [];
        for (var i = 0; i < rows.length; i++) {
          var rowData = [];
          for (var j = 0; j < headers.length; j++) {
            var val = rows[i][headers[j]];
            rowData.push(val !== undefined && val !== null ? val : '');
          }
          newRows.push(rowData);
        }
        sheet.getRange(2, 1, newRows.length, headers.length).setValues(newRows);
      }
    }

    return ContentService.createTextOutput(JSON.stringify({ success: true }))
      .setMimeType(ContentService.MimeType.JSON);
  } catch (err) {
    return ContentService.createTextOutput(JSON.stringify({ error: err.toString() }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

/**
 * Seed demo data for SpiceBox Kitchen (Jan 2026 – Mar 2026).
 * Realistic cloud kitchen / fast food stall entries.
 */
function seedHistoricalData() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName('Entries');
  if (!sheet) {
    SpreadsheetApp.getUi().alert('Error: "Entries" sheet not found. Run setupNewSheets() first.');
    return;
  }

  var rows = [];
  var now = Date.now();

  // --- JANUARY 2026 ---
  // Zomato orders (weekly settlements)
  rows.push([now++, '2026-01-01', '2026-01-07', 'income', 'Zomato Order', 18500, 4625, 0, 0, 13875, '', 'Week 1 settlement', 'paid']);
  rows.push([now++, '2026-01-08', '2026-01-14', 'income', 'Zomato Order', 21200, 5300, 0, 0, 15900, '', 'Week 2 settlement', 'paid']);
  rows.push([now++, '2026-01-15', '2026-01-21', 'income', 'Zomato Order', 19800, 4950, 0, 0, 14850, '', 'Week 3 settlement', 'paid']);
  rows.push([now++, '2026-01-22', '2026-01-31', 'income', 'Zomato Order', 22400, 5600, 0, 0, 16800, '', 'Week 4 settlement', 'paid']);
  // Swiggy orders
  rows.push([now++, '2026-01-01', '2026-01-15', 'income', 'Swiggy Order', 15600, 3900, 0, 0, 11700, '', 'Bi-weekly settlement 1', 'paid']);
  rows.push([now++, '2026-01-16', '2026-01-31', 'income', 'Swiggy Order', 17200, 4300, 0, 0, 12900, '', 'Bi-weekly settlement 2', 'paid']);
  // Direct orders
  rows.push([now++, '2026-01-05', '', 'income', 'Direct Order', 3200, 0, 0, 0, 3200, '', 'Walk-in orders', 'paid']);
  rows.push([now++, '2026-01-12', '', 'income', 'Direct Order', 2800, 0, 0, 0, 2800, '', 'Walk-in + phone orders', 'paid']);
  rows.push([now++, '2026-01-19', '', 'income', 'Direct Order', 4500, 0, 0, 200, 4300, '', 'Sunday rush + delivery', 'paid']);
  rows.push([now++, '2026-01-26', '', 'income', 'Direct Order', 3600, 0, 0, 150, 3450, '', 'Republic day special', 'paid']);
  // Catering
  rows.push([now++, '2026-01-15', '', 'income', 'Catering', 12000, 0, 0, 0, 12000, '', 'Birthday party - 50 pax', 'paid']);
  // Expenses Jan
  rows.push([now++, '2026-01-02', '', 'expense', 'Raw Materials', 8500, 0, 0, 0, 8500, 'Rajesh', 'Vegetables & chicken', 'paid']);
  rows.push([now++, '2026-01-05', '', 'expense', 'Raw Materials', 6200, 0, 0, 0, 6200, 'Priya', 'Spices & oil bulk', 'paid']);
  rows.push([now++, '2026-01-10', '', 'expense', 'Gas', 2800, 0, 0, 0, 2800, 'Rajesh', 'Commercial LPG x2', 'paid']);
  rows.push([now++, '2026-01-12', '', 'expense', 'Packaging', 3500, 0, 0, 0, 3500, 'Priya', 'Containers & bags', 'paid']);
  rows.push([now++, '2026-01-15', '', 'expense', 'Electricity', 4200, 0, 0, 0, 4200, 'Rajesh', 'Monthly bill', 'paid']);
  rows.push([now++, '2026-01-18', '', 'expense', 'Raw Materials', 7800, 0, 0, 0, 7800, 'Rajesh', 'Weekly restock', 'paid']);
  rows.push([now++, '2026-01-20', '', 'expense', 'Maid', 3000, 0, 0, 0, 3000, 'Priya', 'Kitchen cleaner salary', 'paid']);
  rows.push([now++, '2026-01-25', '', 'expense', 'Staff Salaries', 15000, 0, 0, 0, 15000, 'Rajesh', 'Cook - Suresh', 'paid']);
  rows.push([now++, '2026-01-25', '', 'expense', 'Staff Salaries', 12000, 0, 0, 0, 12000, 'Rajesh', 'Helper - Ramu', 'paid']);
  rows.push([now++, '2026-01-28', '', 'expense', 'Raw Materials', 5400, 0, 0, 0, 5400, 'Priya', 'Month-end restock', 'paid']);
  rows.push([now++, '2026-01-30', '', 'expense', 'Equipment', 4500, 0, 0, 0, 4500, 'Rajesh', 'New mixer grinder', 'paid']);

  // --- FEBRUARY 2026 ---
  // Zomato
  rows.push([now++, '2026-02-01', '2026-02-07', 'income', 'Zomato Order', 20100, 5025, 0, 0, 15075, '', 'Week 1', 'paid']);
  rows.push([now++, '2026-02-08', '2026-02-14', 'income', 'Zomato Order', 24500, 6125, 0, 0, 18375, '', 'Week 2 - Valentines boost', 'paid']);
  rows.push([now++, '2026-02-15', '2026-02-21', 'income', 'Zomato Order', 19200, 4800, 0, 0, 14400, '', 'Week 3', 'paid']);
  rows.push([now++, '2026-02-22', '2026-02-28', 'income', 'Zomato Order', 21800, 5450, 0, 0, 16350, '', 'Week 4', 'paid']);
  // Swiggy
  rows.push([now++, '2026-02-01', '2026-02-14', 'income', 'Swiggy Order', 16800, 4200, 0, 0, 12600, '', 'Bi-weekly 1', 'paid']);
  rows.push([now++, '2026-02-15', '2026-02-28', 'income', 'Swiggy Order', 18500, 4625, 0, 0, 13875, '', 'Bi-weekly 2', 'paid']);
  // Direct
  rows.push([now++, '2026-02-07', '', 'income', 'Direct Order', 3800, 0, 0, 0, 3800, '', 'Walk-in orders', 'paid']);
  rows.push([now++, '2026-02-14', '', 'income', 'Direct Order', 6200, 0, 0, 300, 5900, '', 'Valentines day special', 'paid']);
  rows.push([now++, '2026-02-21', '', 'income', 'Direct Order', 3100, 0, 0, 0, 3100, '', 'Regular walk-ins', 'paid']);
  rows.push([now++, '2026-02-28', '', 'income', 'Direct Order', 2900, 0, 0, 0, 2900, '', 'End of month', 'paid']);
  // Special event
  rows.push([now++, '2026-02-14', '', 'income', 'Special Events', 8500, 0, 0, 0, 8500, '', 'Valentines dinner package x25', 'paid']);
  // Pending order
  rows.push([now++, '2026-02-20', '', 'income', 'Catering', 15000, 0, 0, 0, 15000, '', 'Office party - pending payment', 'pending']);
  // Expenses Feb
  rows.push([now++, '2026-02-01', '', 'expense', 'Raw Materials', 9200, 0, 0, 0, 9200, 'Rajesh', 'Chicken & mutton bulk', 'paid']);
  rows.push([now++, '2026-02-06', '', 'expense', 'Raw Materials', 5800, 0, 0, 0, 5800, 'Priya', 'Vegetables & dairy', 'paid']);
  rows.push([now++, '2026-02-10', '', 'expense', 'Gas', 2800, 0, 0, 0, 2800, 'Rajesh', 'Commercial LPG x2', 'paid']);
  rows.push([now++, '2026-02-12', '', 'expense', 'Packaging', 4200, 0, 0, 0, 4200, 'Priya', 'Valentine special boxes', 'paid']);
  rows.push([now++, '2026-02-15', '', 'expense', 'Electricity', 4600, 0, 0, 0, 4600, 'Rajesh', 'Monthly bill', 'paid']);
  rows.push([now++, '2026-02-18', '', 'expense', 'Raw Materials', 8100, 0, 0, 0, 8100, 'Rajesh', 'Weekly restock', 'paid']);
  rows.push([now++, '2026-02-20', '', 'expense', 'Maid', 3000, 0, 0, 0, 3000, 'Priya', 'Kitchen cleaner salary', 'paid']);
  rows.push([now++, '2026-02-25', '', 'expense', 'Staff Salaries', 15000, 0, 0, 0, 15000, 'Rajesh', 'Cook - Suresh', 'paid']);
  rows.push([now++, '2026-02-25', '', 'expense', 'Staff Salaries', 12000, 0, 0, 0, 12000, 'Rajesh', 'Helper - Ramu', 'paid']);
  rows.push([now++, '2026-02-27', '', 'expense', 'Marketing', 3500, 0, 0, 0, 3500, 'Priya', 'Instagram ads & flyers', 'paid']);
  rows.push([now++, '2026-02-28', '', 'expense', 'Raw Materials', 6500, 0, 0, 0, 6500, 'Priya', 'Month-end restock', 'paid']);

  // --- MARCH 2026 ---
  // Zomato
  rows.push([now++, '2026-03-01', '2026-03-07', 'income', 'Zomato Order', 22800, 5700, 0, 0, 17100, '', 'Week 1 - Holi season', 'paid']);
  rows.push([now++, '2026-03-08', '2026-03-14', 'income', 'Zomato Order', 25200, 6300, 0, 0, 18900, '', 'Week 2 - Holi week', 'paid']);
  rows.push([now++, '2026-03-15', '2026-03-19', 'income', 'Zomato Order', 12500, 3125, 0, 0, 9375, '', 'Partial week 3', 'paid']);
  // Swiggy
  rows.push([now++, '2026-03-01', '2026-03-14', 'income', 'Swiggy Order', 19200, 4800, 0, 0, 14400, '', 'Bi-weekly 1', 'paid']);
  // Direct
  rows.push([now++, '2026-03-02', '', 'income', 'Direct Order', 4200, 0, 0, 0, 4200, '', 'Walk-in orders', 'paid']);
  rows.push([now++, '2026-03-10', '', 'income', 'Direct Order', 3500, 0, 0, 150, 3350, '', 'Phone + delivery', 'paid']);
  rows.push([now++, '2026-03-14', '', 'income', 'Catering', 18000, 0, 0, 0, 18000, '', 'Holi party catering - 80 pax', 'paid']);
  // Expenses Mar
  rows.push([now++, '2026-03-01', '', 'expense', 'Raw Materials', 10500, 0, 0, 0, 10500, 'Rajesh', 'Holi season bulk', 'paid']);
  rows.push([now++, '2026-03-05', '', 'expense', 'Raw Materials', 4800, 0, 0, 0, 4800, 'Priya', 'Sweets ingredients', 'paid']);
  rows.push([now++, '2026-03-10', '', 'expense', 'Gas', 2800, 0, 0, 0, 2800, 'Rajesh', 'Commercial LPG x2', 'paid']);
  rows.push([now++, '2026-03-12', '', 'expense', 'Packaging', 3800, 0, 0, 0, 3800, 'Priya', 'Containers restock', 'paid']);
  rows.push([now++, '2026-03-15', '', 'expense', 'Electricity', 4800, 0, 0, 0, 4800, 'Rajesh', 'Monthly bill', 'paid']);
  rows.push([now++, '2026-03-18', '', 'expense', 'Raw Materials', 7200, 0, 0, 0, 7200, 'Rajesh', 'Weekly restock', 'paid']);

  // Investment
  rows.push([now++, '2026-01-01', '', 'investment', 'Capital', 50000, 0, 0, 0, 50000, 'Rajesh', 'Initial kitchen setup', 'paid']);
  rows.push([now++, '2026-01-01', '', 'investment', 'Capital', 30000, 0, 0, 0, 30000, 'Priya', 'Initial kitchen setup', 'paid']);

  // Reimbursement
  rows.push([now++, '2026-02-01', '', 'reimbursement', 'Reimbursement', 5000, 0, 0, 0, 5000, 'Priya', 'Jan expense settlement', 'paid']);

  if (rows.length > 0) {
    var startRow = sheet.getLastRow() + 1;
    sheet.getRange(startRow, 1, rows.length, ENTRIES_HEADERS.length).setValues(rows);
  }

  SpreadsheetApp.getUi().alert('Seeded ' + rows.length + ' demo entries for SpiceBox Kitchen (Jan-Mar 2026).');
}
