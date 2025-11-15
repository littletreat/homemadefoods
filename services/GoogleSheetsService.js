/**
 * GoogleSheetsService - Handles saving orders to Google Sheets
 */
class GoogleSheetsService {
    constructor(config) {
        this.method = config.method || 'apiKey'; // 'apiKey' or 'appsScript'
        this.apiKey = config.apiKey;
        this.sheetId = config.sheetId;
        this.sheetName = config.sheetName || 'Orders';
        this.webAppUrl = config.webAppUrl; // For Apps Script method
        this.enabled = config.enabled !== false;
    }

    /**
     * Save order to Google Sheets
     * @param {Object} orderData - Order details
     * @returns {Promise<boolean>} Success status
     */
    async saveOrder(orderData) {
        if (!this.enabled) {
            console.log('Google Sheets integration is disabled');
            return false;
        }

        try {
            // Generate order ID
            const orderId = this.generateOrderId();
            
            // Prepare order data with all fields
            const fullOrderData = {
                orderId: orderId,
                date: orderData.date,
                time: orderData.time,
                customerName: orderData.customerName || 'N/A',
                phone: orderData.phone || 'N/A',
                flatNumber: orderData.flatNumber,
                apartmentName: orderData.apartmentName,
                items: orderData.items,
                total: orderData.total,
                status: 'Pending',
                timestamp: new Date().toISOString()
            };

            let success;
            
            // Choose method based on configuration
            if (this.method === 'appsScript') {
                success = await this.saveViaAppsScript(fullOrderData);
            } else {
                success = await this.saveViaApiKey(fullOrderData);
            }
            
            if (success) {
                console.log(`✅ Order ${orderId} saved to Google Sheets successfully!`);
                return true;
            } else {
                console.error('❌ Failed to save order to Google Sheets');
                return false;
            }
        } catch (error) {
            console.error('Error saving to Google Sheets:', error);
            return false;
        }
    }

    /**
     * Save via Google Apps Script (Recommended - No API key needed!)
     * @param {Object} orderData - Complete order data
     * @returns {Promise<boolean>} Success status
     */
    async saveViaAppsScript(orderData) {
        if (!this.webAppUrl) {
            console.error('Web App URL is not configured');
            return false;
        }

        try {
            const response = await fetch(this.webAppUrl, {
                method: 'POST',
                mode: 'no-cors', // Important for Apps Script
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(orderData)
            });

            // Note: With no-cors mode, we can't read the response
            // But if no error was thrown, it likely succeeded
            console.log('📊 Order sent to Google Apps Script');
            return true;
        } catch (error) {
            console.error('Apps Script error:', error);
            return false;
        }
    }

    /**
     * Save via API Key (Only works for reading, not writing!)
     * @param {Object} orderData - Complete order data
     * @returns {Promise<boolean>} Success status
     */
    async saveViaApiKey(orderData) {
        console.warn('⚠️ API Key method only works for reading data, not writing!');
        console.warn('⚠️ Please use Apps Script method instead.');
        
        try {
            const row = [
                orderData.orderId,
                orderData.date,
                orderData.time,
                orderData.customerName,
                orderData.phone,
                orderData.flatNumber,
                orderData.apartmentName,
                orderData.items,
                orderData.total,
                orderData.status,
                orderData.timestamp
            ];

            const url = `https://sheets.googleapis.com/v4/spreadsheets/${this.sheetId}/values/${this.sheetName}!A:K:append?valueInputOption=RAW&key=${this.apiKey}`;
            
            const response = await fetch(url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    values: [row]
                })
            });

            if (!response.ok) {
                const errorData = await response.json();
                console.error('Google Sheets API Error:', errorData);
                return false;
            }

            const result = await response.json();
            console.log('Google Sheets Response:', result);
            return true;
        } catch (error) {
            console.error('API Key method error:', error);
            return false;
        }
    }

    /**
     * Generate unique order ID
     * @returns {string} Order ID like #LT001
     */
    generateOrderId() {
        const timestamp = Date.now();
        const random = Math.floor(Math.random() * 1000);
        const orderId = `#LT${timestamp.toString().slice(-6)}${random.toString().padStart(3, '0')}`;
        return orderId;
    }

    /**
     * Format order items for display
     * @param {Array} cartItems - Array of cart items
     * @returns {string} Formatted items string
     */
    static formatOrderItems(cartItems) {
        return cartItems.map(item => {
            const unit = item.unit === 'kg' ? 'Kg' : item.unit === 'piece' ? 'pcs' : item.unit;
            return `${item.name} x ${item.quantity} ${unit} (₹${item.price * item.quantity})`;
        }).join(', ');
    }
}

