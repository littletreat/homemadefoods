/**
 * MenuController - Handles user interactions and coordinates between Model and View
 * Responsible for business logic and event handling
 */
class MenuController {
    constructor(model, view) {
        this.model = model;
        this.view = view;
        this.currentStep = 1;
    }

    /**
     * Initialize the application
     */
    async init() {
        try {
            // Load menu items and config in parallel
            await Promise.all([
                this.model.loadMenuItems(),
                this.model.loadConfig()
            ]);
            
            // Get visible items and render them
            const visibleItems = this.model.getVisibleMenuItems();
            this.view.renderMenuItems(visibleItems, this.handleQuantityChange.bind(this));
            
            // Render delivery date and time options
            const deliveryDate = this.model.getDeliveryDate();
            const timeSlots = this.model.generateTimeSlots();
            this.view.renderDeliveryDateTime(deliveryDate, timeSlots);
            
            // Setup event listeners
            this.setupEventListeners();
            
            console.log('Menu loaded successfully');
            console.log('Delivery config loaded:', deliveryDate);
        } catch (error) {
            console.error('Failed to initialize app:', error);
            this.view.showError('Failed to load menu. Please refresh the page.');
        }
    }

    /**
     * Setup event listeners for buttons and form inputs
     */
    setupEventListeners() {
        // Proceed button
        const proceedBtn = document.getElementById('proceedBtn');
        if (proceedBtn) {
            proceedBtn.onclick = () => this.proceedToAddress();
        }

        // Book order button
        const bookBtn = document.querySelector('[onclick*="bookOrder"]');
        if (bookBtn) {
            bookBtn.onclick = () => this.bookOrder();
        }

        // Back button
        const backBtn = document.querySelector('[onclick*="goToStep(1)"]');
        if (backBtn) {
            backBtn.onclick = () => this.goToStep(1);
        }

        // Form input listeners for live validation feedback
        const flatNumber = document.getElementById('flatNumber');
        const apartmentName = document.getElementById('apartmentName');
        const dateSelect = document.getElementById('dateSelect');

        if (flatNumber) {
            flatNumber.oninput = () => this.updateLiveReview();
        }
        if (apartmentName) {
            apartmentName.oninput = () => this.updateLiveReview();
        }
        if (dateSelect) {
            dateSelect.onchange = () => this.updateLiveReview();
        }
    }

    /**
     * Handle quantity change for a menu item
     * @param {string} itemId - Item ID
     * @param {number} change - Change amount (+1 or -1)
     */
    handleQuantityChange(itemId, change) {
        const currentQuantity = this.model.getCartQuantity(itemId);
        const newQuantity = currentQuantity + change;
        
        if (newQuantity >= 0) {
            this.model.updateCartQuantity(itemId, newQuantity);
            this.view.updateQuantityDisplay(itemId, newQuantity);
        }
    }

    /**
     * Proceed to address/review step
     */
    proceedToAddress() {
        if (this.model.isCartEmpty()) {
            this.view.showError('Please select at least one item to proceed!');
            return;
        }
        
        // Update order summary
        const cartItems = this.model.getCartItems();
        const total = this.model.calculateTotal();
        this.view.renderOrderSummary(cartItems, total);
        
        // Go to step 2
        this.goToStep(2);
    }

    /**
     * Navigate to a specific step
     * @param {number} step - Step number
     */
    goToStep(step) {
        this.currentStep = step;
        this.view.goToStep(step);
    }

    /**
     * Update live review section (if needed)
     */
    updateLiveReview() {
        // This can be expanded if you want to show live preview
        // Currently just clears validation errors when user starts typing
        const formValues = this.view.getFormValues();
        
        if (formValues.flatNumber && formValues.apartmentName) {
            this.view.showFieldError('addressError', false);
        }
        
        if (formValues.dateSelect) {
            this.view.showFieldError('dateError', false);
        }
    }

    /**
     * Validate address form
     * @returns {boolean} True if form is valid
     */
    validateAddressForm() {
        return this.view.validateForm();
    }

    /**
     * Book order - send to WhatsApp
     */
    bookOrder() {
        // Validate form first
        if (!this.validateAddressForm()) {
            return;
        }
        
        const formValues = this.view.getFormValues();
        const cartItems = this.model.getCartItems();
        const total = this.model.calculateTotal();
        
        // Build order items list
        let orderItems = '';
        cartItems.forEach(item => {
            const unitDisplay = this.model.getUnitDisplay(item.unit, item.quantity);
            orderItems += `${item.emoji || '📦'} ${item.name}: ${item.quantity} ${unitDisplay}\n`;
        });
        
        // Create message with proper emoji support
        const message = `🍽️ *Little Treat Order*

📦 *Order Items:*
${orderItems}
📅 *Delivery Date & Time:* ${formValues.dateSelectText}
💰 *Total Amount:* ₹${total}

📍 *Delivery Address:*
Flat: ${formValues.flatNumber}
Apartment: ${formValues.apartmentName}

Please confirm my order. Thank you! 😊`;

        // Use encodeURIComponent which properly handles UTF-8 emojis
        const encodedMessage = encodeURIComponent(message);
        const whatsappUrl = `https://wa.me/917710963036?text=${encodedMessage}`;
        window.open(whatsappUrl, '_blank');
    }
}

