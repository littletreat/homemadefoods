function doPost(e) {
  try {
    var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('Orders');
    
    if (!sheet) {
      sheet = SpreadsheetApp.getActiveSpreadsheet().insertSheet('Orders');
      sheet.appendRow(['Order ID', 'Delivery Date', 'Delivery Time', 'Flat', 'Apartment', 'Items', 'Total', 'Status', 'Ordered At']);
    }
    
    var data = JSON.parse(e.postData.contents);
    
    if (data.action === 'updateStatus') {
      return updateOrderStatus(data.orderId, data.status);
    }
    
    sheet.appendRow([
      data.orderId,
      data.date,
      data.time,
      data.flatNumber,
      data.apartmentName,
      data.items,
      data.total,
      'Pending',
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
    
    var data = sheet.getDataRange().getDisplayValues();
    
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
        rowIndex: i + 1  
      });
    }
    
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

function updateOrderStatus(orderId, newStatus) {
  try {
    var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('Orders');
    
    if (!sheet) {
      throw new Error('Orders sheet not found');
    }
    
    var data = sheet.getDataRange().getValues();
    
    for (var i = 1; i < data.length; i++) {
      if (data[i][0] === orderId) {
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

function formatCellValue(value) {
  if (value === null || value === undefined || value === '') {
    return '';
  }
  return String(value);
}
