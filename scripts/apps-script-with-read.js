// ===================================
// UPDATED APPS SCRIPT CODE
// Copy this ENTIRE code and replace your Apps Script
// ===================================

function doPost(e) {
  try {
    var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('Orders');
    
    if (!sheet) {
      sheet = SpreadsheetApp.getActiveSpreadsheet().insertSheet('Orders');
      sheet.appendRow(['Order ID', 'Delivery Date', 'Delivery Time', 'Flat', 'Apartment', 'Items', 'Total', 'Status', 'Ordered At']);
    }
    
    var data = JSON.parse(e.postData.contents);
    
    // Check if this is a status update
    if (data.action === 'updateStatus') {
      return updateOrderStatus(data.orderId, data.status);
    }
    
    // Save order with correct column order - 9 columns now (added Status)
    sheet.appendRow([
      data.orderId,
      data.date,
      data.time,
      data.flatNumber,
      data.apartmentName,
      data.items,
      data.total,
      'Pending',  // Default status
      data.timestamp
    ]);
    
    return ContentService
      .createTextOutput(JSON.stringify({
        'status': 'success',
        'message': 'Order saved successfully',
        'orderId': data.orderId
      }))
      .setMimeType(ContentService.MimeType.JSON);
      
  } catch (error) {
    return ContentService
      .createTextOutput(JSON.stringify({
        'status': 'error',
        'message': error.toString()
      }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

// NEW: Read orders endpoint for admin dashboard
function doGet(e) {
  try {
    var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('Orders');
    
    if (!sheet) {
      return ContentService
        .createTextOutput(JSON.stringify({
          'status': 'success',
          'orders': []
        }))
        .setMimeType(ContentService.MimeType.JSON);
    }
    
    // Get all data from sheet
    var data = sheet.getDataRange().getValues();
    
    // Skip header row, convert to array of objects - 9 columns now
    var orders = [];
    for (var i = 1; i < data.length; i++) {
      var row = data[i];
      orders.push({
        orderId: row[0],
        deliveryDate: row[1],
        deliveryTime: row[2],
        flat: row[3],
        apartment: row[4],
        items: row[5],
        total: row[6],
        status: row[7] || 'Pending',
        timestamp: row[8],
        rowIndex: i + 1  // Store row index for updates (1-based, +1 for header)
      });
    }
    
    // Sort by timestamp (newest first)
    orders.sort(function(a, b) {
      return new Date(b.timestamp) - new Date(a.timestamp);
    });
    
    return ContentService
      .createTextOutput(JSON.stringify({
        'status': 'success',
        'orders': orders,
        'count': orders.length
      }))
      .setMimeType(ContentService.MimeType.JSON);
      
  } catch (error) {
    return ContentService
      .createTextOutput(JSON.stringify({
        'status': 'error',
        'message': error.toString()
      }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

