/**
 * AdminModel - Handles data logic for admin dashboard
 */
class AdminModel {
    constructor(orderService) {
        this.orderService = orderService;
        this.allOrders = [];
        this.config = null;
    }

    /**
     * Load configuration from config.json
     */
    async loadConfig() {
        try {
            // Check if we're in a subfolder (state/)
            const configPath = window.location.pathname.includes('/state/') ? '../config.json' : 'config.json';
            const response = await fetch(configPath);
            this.config = await response.json();
            return this.config;
        } catch (error) {
            console.error('Error loading config:', error);
            throw error;
        }
    }

    /**
     * Fetch all orders from Google Sheets
     */
    async fetchOrders() {
        try {
            this.allOrders = await this.orderService.fetchOrders();
            return this.allOrders;
        } catch (error) {
            console.error('Error fetching orders:', error);
            throw error;
        }
    }

    /**
     * Get all orders
     */
    getAllOrders() {
        return this.allOrders;
    }

    /**
     * Get orders filtered by status
     */
    getOrdersByStatus(status) {
        if (status === 'all') {
            return this.allOrders;
        }
        return this.allOrders.filter(order => order.status === status);
    }

    /**
     * Search orders by query
     */
    searchOrders(query) {
        return this.orderService.searchOrders(this.allOrders, query);
    }

    /**
     * Sort orders by specified field
     */
    sortOrders(orders, sortBy) {
        const sorted = [...orders];
        
        if (sortBy === 'deliveryTime') {
            return this.orderService.sortByDeliveryTime(sorted);
        }
        
        // Default: sort by timestamp (newest first)
        return sorted.sort((a, b) => {
            return new Date(b.timestamp) - new Date(a.timestamp);
        });
    }

    /**
     * Calculate summary statistics
     */
    calculateSummary() {
        const today = new Date().toDateString();
        
        const todayOrders = this.allOrders.filter(order => {
            const orderDate = new Date(order.timestamp).toDateString();
            return orderDate === today;
        });

        // Calculate today's revenue from total field
        let todayRevenue = 0;
        todayOrders.forEach(order => {
            const total = order.total;
            if (total) {
                // Extract number from string like "₹210"
                const amount = parseInt(total.replace(/[^\d]/g, '')) || 0;
                todayRevenue += amount;
            }
        });

        return {
            totalOrders: this.allOrders.length,
            todayOrders: todayOrders.length,
            todayRevenue: todayRevenue
        };
    }

    /**
     * Update order in local cache
     */
    updateOrderStatus(orderId, newStatus) {
        const order = this.allOrders.find(o => o.orderId === orderId);
        if (order) {
            order.status = newStatus;
        }
    }

    /**
     * Get web app URL for status updates
     */
    getWebAppUrl() {
        return this.config?.googleSheets?.webAppUrl || '';
    }
}

