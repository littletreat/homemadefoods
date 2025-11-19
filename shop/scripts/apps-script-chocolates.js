/**
 * Google Apps Script for Little Treat Chocolate Orders
 * 
 * Setup Instructions:
 * 1. Open your Google Sheet
 * 2. Go to Extensions > Apps Script
 * 3. Delete any existing code and paste this script
 * 4. Click "Deploy" > "New deployment"
 * 5. Select type: "Web app"
 * 6. Execute as: "Me"
 * 7. Who has access: "Anyone"
 * 8. Click "Deploy" and copy the Web App URL
 * 9. Update shop/config.json with the Web App URL
 * 
 * Sheet Structure:
 * Create a sheet named "chocolates_orders" with these columns:
 * Order ID | Flat Number | Apartment Name | Items | Total | Status | Timestamp
 */

function doPost(e) {
  try {
    const lock = LockService.getScriptLock();
    lock.tryLock(10000);
    
    if (!lock.hasLock()) {
      return ContentService.createTextOutput(JSON.stringify({
        'success': false,
        'error': 'Could not obtain lock'
      })).setMimeType(ContentService.MimeType.JSON);
    }
    
    const data = JSON.parse(e.postData.contents);
    const sheetName = data.sheetName || 'chocolates_orders';
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    let sheet = ss.getSheetByName(sheetName);
    
    // Create sheet if it doesn't exist
    if (!sheet) {
      sheet = ss.insertSheet(sheetName);
      // Add headers
      sheet.appendRow([
        'Order ID',
        'Flat Number',
        'Apartment Name',
        'Items',
        'Total',
        'Status',
        'Timestamp'
      ]);
      
      // Format header row
      const headerRange = sheet.getRange(1, 1, 1, 7);
      headerRange.setFontWeight('bold');
      headerRange.setBackground('#B19CD9');
      headerRange.setFontColor('#FFFFFF');
    }
    
    // Append the order data
    sheet.appendRow([
      data.orderId || '',
      data.flatNumber || '',
      data.apartmentName || '',
      data.items || '',
      data.total || '',
      data.status || 'Pending',
      data.timestamp || new Date().toISOString()
    ]);
    
    // Auto-resize columns for better readability
    sheet.autoResizeColumns(1, 7);
    
    lock.releaseLock();
    
    return ContentService.createTextOutput(JSON.stringify({
      'success': true,
      'orderId': data.orderId
    })).setMimeType(ContentService.MimeType.JSON);
    
  } catch (error) {
    Logger.log('Error: ' + error.toString());
    return ContentService.createTextOutput(JSON.stringify({
      'success': false,
      'error': error.toString()
    })).setMimeType(ContentService.MimeType.JSON);
  }
}

function doGet(e) {
  return ContentService.createTextOutput(JSON.stringify({
    'status': 'active',
    'message': 'Little Treat Chocolate Orders API is running'
  })).setMimeType(ContentService.MimeType.JSON);
}

