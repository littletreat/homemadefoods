/**
 * MenuModel - Handles all data-related operations
 * Responsible for loading menu data and managing cart state
 */
class MenuModel {
    constructor() {
        this.menuItems = [];
        this.cart = {};
        this.config = null;
    }

    /**
     * Load menu items from menu.json
     * @returns {Promise<Array>} Array of menu items
     */
    async loadMenuItems() {
        try {
            const response = await fetch('menu.json');
            if (!response.ok) {
                throw new Error('Failed to load menu items');
            }
            const data = await response.json();
            this.menuItems = data.menuItems;
            
            // Initialize cart with all items set to 0
            this.menuItems.forEach(item => {
                this.cart[item.id] = 0;
            });
            
            return this.menuItems;
        } catch (error) {
            console.error('Error loading menu items:', error);
            throw error;
        }
    }

    /**
     * Load configuration from config.json
     * @returns {Promise<Object>} Configuration object
     */
    async loadConfig() {
        try {
            const response = await fetch('config.json');
            if (!response.ok) {
                throw new Error('Failed to load configuration');
            }
            this.config = await response.json();
            return this.config;
        } catch (error) {
            console.error('Error loading config:', error);
            throw error;
        }
    }

    /**
     * Get delivery date configuration
     * @returns {Object} Delivery date object with date and dayName
     */
    getDeliveryDate() {
        return this.config?.deliveryDate || null;
    }

    /**
     * Get delivery time configuration
     * @returns {Object} Delivery time object with startTime, endTime, intervalMinutes
     */
    getDeliveryTime() {
        return this.config?.deliveryTime || null;
    }

    /**
     * Generate time slots based on configuration
     * @returns {Array} Array of time slot objects {value, label}
     */
    generateTimeSlots() {
        if (!this.config || !this.config.deliveryTime) {
            return [];
        }

        const { startTime, endTime, intervalMinutes } = this.config.deliveryTime;
        const timeSlots = [];

        // Parse start and end times
        const [startHour, startMinute] = startTime.split(':').map(Number);
        const [endHour, endMinute] = endTime.split(':').map(Number);

        // Create Date objects for easier manipulation
        let currentTime = new Date();
        currentTime.setHours(startHour, startMinute, 0, 0);

        const endTimeObj = new Date();
        endTimeObj.setHours(endHour, endMinute, 0, 0);

        // Generate slots
        while (currentTime <= endTimeObj) {
            const hours = currentTime.getHours();
            const minutes = currentTime.getMinutes();
            
            // Format time as HH:MM for value
            const value = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
            
            // Format time as 12-hour format for display
            const displayHours = hours % 12 || 12;
            const ampm = hours >= 12 ? 'PM' : 'AM';
            const label = `${displayHours}:${minutes.toString().padStart(2, '0')} ${ampm}`;

            timeSlots.push({ value, label });

            // Add interval minutes
            currentTime.setMinutes(currentTime.getMinutes() + intervalMinutes);
        }

        return timeSlots;
    }

    /**
     * Get all menu items
     * @returns {Array} Array of menu items
     */
    getMenuItems() {
        return this.menuItems;
    }

    /**
     * Get visible menu items (display = 1)
     * @returns {Array} Array of visible menu items
     */
    getVisibleMenuItems() {
        return this.menuItems.filter(item => item.display === 1);
    }

    /**
     * Get a specific menu item by ID
     * @param {string} id - Item ID
     * @returns {Object|null} Menu item or null if not found
     */
    getMenuItem(id) {
        return this.menuItems.find(item => item.id === id) || null;
    }

    /**
     * Update cart quantity for an item
     * @param {string} itemId - Item ID
     * @param {number} quantity - New quantity
     */
    updateCartQuantity(itemId, quantity) {
        if (this.cart.hasOwnProperty(itemId)) {
            this.cart[itemId] = Math.max(0, quantity);
        }
    }

    /**
     * Get cart quantity for an item
     * @param {string} itemId - Item ID
     * @returns {number} Quantity in cart
     */
    getCartQuantity(itemId) {
        return this.cart[itemId] || 0;
    }

    /**
     * Get all cart items with quantity > 0
     * @returns {Array} Array of cart items with details
     */
    getCartItems() {
        const cartItems = [];
        for (let itemId in this.cart) {
            if (this.cart[itemId] > 0) {
                const item = this.getMenuItem(itemId);
                if (item) {
                    cartItems.push({
                        ...item,
                        quantity: this.cart[itemId]
                    });
                }
            }
        }
        return cartItems;
    }

    /**
     * Calculate total price of cart
     * @returns {number} Total price
     */
    calculateTotal() {
        let total = 0;
        for (let itemId in this.cart) {
            const quantity = this.cart[itemId];
            if (quantity > 0) {
                const item = this.getMenuItem(itemId);
                if (item) {
                    total += quantity * item.price;
                }
            }
        }
        return total;
    }

    /**
     * Check if cart is empty
     * @returns {boolean} True if cart is empty
     */
    isCartEmpty() {
        return this.calculateTotal() === 0;
    }

    /**
     * Clear the cart
     */
    clearCart() {
        for (let itemId in this.cart) {
            this.cart[itemId] = 0;
        }
    }

    /**
     * Get unit display text with proper formatting
     * @param {string} unit - Unit type (piece, kg, plate, etc.)
     * @param {number} quantity - Quantity
     * @returns {string} Formatted unit text
     */
    getUnitDisplay(unit, quantity = 1) {
        const unitMap = {
            'piece': quantity > 1 ? 'pcs' : 'pc',
            'kg': 'Kg',
            'plate': quantity > 1 ? 'plates' : 'plate',
            'dozen': 'dozen'
        };
        return unitMap[unit.toLowerCase()] || unit;
    }
}

