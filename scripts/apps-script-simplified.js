function doPost(e) {
  try {
    var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('Orders');
    
    if (!sheet) {
      sheet = SpreadsheetApp.getActiveSpreadsheet().insertSheet('Orders');
      // Only 7 columns as requested
      sheet.appendRow(['Order ID', 'Date', 'Time', 'Flat', 'Apartment', 'Items', 'Timestamp']);
    }
    
    var data = JSON.parse(e.postData.contents);
    
    // Only save the 7 fields requested
    sheet.appendRow([
      data.orderId,
      data.date,
      data.time,
      data.flatNumber,
      data.apartmentName,
      data.items,
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
  return ContentService
    .createTextOutput(JSON.stringify({
      'status': 'success',
      'message': 'Little Treat Order Tracking API is running'
    }))
    .setMimeType(ContentService.MimeType.JSON);
}

