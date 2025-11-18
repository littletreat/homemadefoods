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

// Read orders endpoint for admin dashboard
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
    
    // Get all data from sheet - use getDisplayValues() to get formatted text
    var data = sheet.getDataRange().getDisplayValues();
    
    // Skip header row, convert to array of objects - 9 columns now
    var orders = [];
    for (var i = 1; i < data.length; i++) {
      var row = data[i];
      orders.push({
        orderId: formatCellValue(row[0]),
        deliveryDate: formatCellValue(row[1]),
        deliveryTime: formatCellValue(row[2]),
        flat: formatCellValue(row[3]),
        apartment: formatCellValue(row[4]),
        items: formatCellValue(row[5]),
        total: formatCellValue(row[6]),
        status: formatCellValue(row[7]) || 'Pending',
        timestamp: formatCellValue(row[8]),
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

// Update order status function
function updateOrderStatus(orderId, newStatus) {
  try {
    var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('Orders');
    
    if (!sheet) {
      throw new Error('Orders sheet not found');
    }
    
    var data = sheet.getDataRange().getValues();
    
    // Find the order by ID (column A, index 0)
    for (var i = 1; i < data.length; i++) {
      if (data[i][0] === orderId) {
        // Update status (column H, index 7)
        sheet.getRange(i + 1, 8).setValue(newStatus);
        
        return ContentService
          .createTextOutput(JSON.stringify({
            'status': 'success',
            'message': 'Status updated successfully',
            'orderId': orderId,
            'newStatus': newStatus
          }))
          .setMimeType(ContentService.MimeType.JSON);
      }
    }
    
    // Order not found
    return ContentService
      .createTextOutput(JSON.stringify({
        'status': 'error',
        'message': 'Order not found'
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

// Helper function to format cell values (now just returns the display value)
function formatCellValue(value) {
  if (value === null || value === undefined || value === '') {
    return '';
  }
  return String(value);
}
