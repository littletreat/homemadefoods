/**
 * OrderService - Fetches orders from Google Sheets for admin dashboard
 */
class OrderService {
    constructor(webAppUrl) {
        this.webAppUrl = webAppUrl;
    }

    /**
     * Fetch all orders from Google Sheets
     * @returns {Promise<Array>} Array of order objects
     */
    async fetchOrders() {
        try {
            const response = await fetch(this.webAppUrl, {
                method: 'GET',
                headers: {
                    'Accept': 'application/json'
                }
            });

            if (!response.ok) {
                throw new Error('Failed to fetch orders');
            }

            const data = await response.json();
            
            if (data.status === 'success') {
                const orders = data.orders || [];
                // Format dates for display (handle both old ISO format and new readable format)
                const formatted = orders.map(order => {
                    const formatted = {
                        ...order,
                        deliveryDate: this.formatDeliveryDate(order.deliveryDate),
                        deliveryTime: this.formatDeliveryTime(order.deliveryTime)
                    };
                    console.log('Formatted order:', order.orderId, 'Date:', formatted.deliveryDate, 'Time:', formatted.deliveryTime);
                    return formatted;
                });
                return formatted;
            } else {
                throw new Error(data.message || 'Unknown error');
            }
        } catch (error) {
            console.error('Error fetching orders:', error);
            throw error;
        }
    }

    /**
     * Format delivery date (handle both ISO timestamps and readable format)
     * @param {string} dateStr - Date string (ISO or readable)
     * @returns {string} Formatted date
     */
    formatDeliveryDate(dateStr) {
        if (!dateStr) return 'N/A';
        
        // If it's already readable (contains letters), return as-is
        if (/[a-zA-Z]/.test(dateStr)) {
            return dateStr;
        }
        
        // If it's ISO timestamp, convert to readable format
        try {
            const date = new Date(dateStr);
            if (isNaN(date.getTime())) return dateStr; // Invalid date, return as-is
            
            const options = { day: 'numeric', month: 'short', year: 'numeric' };
            return date.toLocaleDateString('en-GB', options);
        } catch (e) {
            return dateStr;
        }
    }

    /**
     * Format delivery time (handle both ISO timestamps and readable format)
     * @param {string} timeStr - Time string (ISO or readable)
     * @returns {string} Formatted time
     */
    formatDeliveryTime(timeStr) {
        if (!timeStr) return 'N/A';
        
        // If it's already readable (HH:MM format), return as-is
        if (/^\d{2}:\d{2}$/.test(timeStr)) {
            return timeStr;
        }
        
        // If it's ISO timestamp, extract time
        try {
            const date = new Date(timeStr);
            if (isNaN(date.getTime())) return 'N/A'; // Invalid date
            
            // Format as HH:MM (24-hour format)
            return date.toLocaleTimeString('en-GB', { 
                hour: '2-digit', 
                minute: '2-digit',
                hour12: false 
            });
        } catch (e) {
            return timeStr;
        }
    }

    /**
     * Get orders for today
     * @param {Array} orders - All orders
     * @returns {Array} Today's orders
     */
    getTodayOrders(orders) {
        const today = new Date().toDateString();
        return orders.filter(order => {
            const orderDate = new Date(order.timestamp).toDateString();
            return orderDate === today;
        });
    }

    /**
     * Calculate total revenue from orders
     * @param {Array} orders - Orders array
     * @returns {number} Total amount
     */
    calculateTotalRevenue(orders) {
        let total = 0;
        orders.forEach(order => {
            // Extract price from items string
            const matches = order.items.match(/₹(\d+)/g);
            if (matches) {
                matches.forEach(match => {
                    const amount = parseInt(match.replace('₹', ''));
                    total += amount;
                });
            }
        });
        return total;
    }

    /**
     * Search orders by query
     * @param {Array} orders - All orders
     * @param {string} query - Search query
     * @returns {Array} Filtered orders
     */
    searchOrders(orders, query) {
        if (!query || query.trim() === '') {
            return orders;
        }

        const lowerQuery = query.toLowerCase();
        return orders.filter(order => {
            // Convert all searchable fields to strings and check
            const orderId = (order.orderId || '').toString().toLowerCase();
            const flat = (order.flat || '').toString().toLowerCase();
            const apartment = (order.apartment || '').toString().toLowerCase();
            const items = (order.items || '').toString().toLowerCase();
            const deliveryDate = (order.deliveryDate || '').toString().toLowerCase();
            const deliveryTime = (order.deliveryTime || '').toString().toLowerCase();
            
            return (
                orderId.includes(lowerQuery) ||
                flat.includes(lowerQuery) ||
                apartment.includes(lowerQuery) ||
                items.includes(lowerQuery) ||
                deliveryDate.includes(lowerQuery) ||
                deliveryTime.includes(lowerQuery)
            );
        });
    }

    /**
     * Sort orders by delivery time
     * @param {Array} orders - Orders array
     * @returns {Array} Sorted orders
     */
    sortByDeliveryTime(orders) {
        return [...orders].sort((a, b) => {
            // Parse delivery times (format: "7:00 PM", "7:30 PM", etc.)
            const timeA = this.parseDeliveryTime(a.deliveryTime);
            const timeB = this.parseDeliveryTime(b.deliveryTime);
            return timeA - timeB;
        });
    }

    /**
     * Parse delivery time string to comparable number
     * @param {string} timeStr - Time string like "7:00 PM"
     * @returns {number} Minutes since midnight
     */
    parseDeliveryTime(timeStr) {
        if (!timeStr) return 0;
        
        try {
            // Extract hours and minutes
            const match = timeStr.match(/(\d+):(\d+)\s*(AM|PM)/i);
            if (!match) return 0;
            
            let hours = parseInt(match[1]);
            const minutes = parseInt(match[2]);
            const isPM = match[3].toUpperCase() === 'PM';
            
            // Convert to 24-hour format
            if (isPM && hours !== 12) {
                hours += 12;
            } else if (!isPM && hours === 12) {
                hours = 0;
            }
            
            return hours * 60 + minutes;
        } catch (e) {
            return 0;
        }
    }

    /**
     * Format timestamp to readable format
     * @param {string} timestamp - ISO timestamp
     * @returns {string} Formatted date and time
     */
    formatTimestamp(timestamp) {
        const date = new Date(timestamp);
        const options = { 
            year: 'numeric', 
            month: 'short', 
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        };
        return date.toLocaleString('en-IN', options);
    }
}

