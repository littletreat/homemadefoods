/**
 * MenuView - Handles all DOM manipulation and UI updates
 * Responsible for rendering menu items, cart, and forms
 */
class MenuView {
    constructor() {
        this.productSection = document.getElementById('step1');
        this.orderSummaryElement = document.getElementById('liveOrderSummary');
        this.finalTotalElement = document.getElementById('finalTotalPrice');
    }

    /**
     * Render all visible menu items
     * @param {Array} menuItems - Array of menu items to render
     * @param {Function} onQuantityChange - Callback for quantity changes
     */
    renderMenuItems(menuItems, onQuantityChange) {
        // Clear existing items except the proceed button
        const proceedBtn = document.getElementById('proceedBtn');
        this.productSection.innerHTML = '';
        
        // Render each menu item
        menuItems.forEach(item => {
            const productCard = this.createProductCard(item, onQuantityChange);
            this.productSection.appendChild(productCard);
        });
        
        // Add proceed button back
        if (proceedBtn) {
            this.productSection.appendChild(proceedBtn);
        }
    }

    /**
     * Create a product card element
     * @param {Object} item - Menu item object
     * @param {Function} onQuantityChange - Callback for quantity changes
     * @returns {HTMLElement} Product card element
     */
    createProductCard(item, onQuantityChange) {
        const card = document.createElement('div');
        card.className = 'product-card';
        card.setAttribute('data-item-id', item.id);

        const productInfo = document.createElement('div');
        productInfo.className = 'product-info';

        // Add image or emoji
        if (item.image) {
            const img = document.createElement('img');
            img.src = item.image;
            img.alt = item.name;
            img.className = 'product-image';
            productInfo.appendChild(img);
        } else if (item.emoji) {
            const emoji = document.createElement('div');
            emoji.className = 'product-emoji';
            emoji.textContent = item.emoji;
            productInfo.appendChild(emoji);
        }

        // Product details
        const details = document.createElement('div');
        details.className = 'product-details';

        const title = document.createElement('h2');
        title.className = 'product-title';
        title.textContent = item.name;

        const description = document.createElement('p');
        description.className = 'product-description';
        description.textContent = item.description;

        const priceDisplay = document.createElement('div');
        priceDisplay.className = 'price-display';
        
        // Format price based on unit
        const unitText = this.getUnitDisplayText(item.unit);
        if (item.originalPrice) {
            priceDisplay.innerHTML = `<del>₹${item.originalPrice}</del> ₹${item.price} / ${unitText}`;
        } else {
            priceDisplay.textContent = `₹${item.price} Per ${unitText}`;
        }

        details.appendChild(title);
        details.appendChild(description);
        details.appendChild(priceDisplay);
        productInfo.appendChild(details);

        // Quantity controls
        const quantityControls = this.createQuantityControls(item.id, 0, onQuantityChange);
        productInfo.appendChild(quantityControls);

        card.appendChild(productInfo);
        return card;
    }

    /**
     * Create quantity control buttons
     * @param {string} itemId - Item ID
     * @param {number} quantity - Current quantity
     * @param {Function} onQuantityChange - Callback for quantity changes
     * @returns {HTMLElement} Quantity controls element
     */
    createQuantityControls(itemId, quantity, onQuantityChange) {
        const controls = document.createElement('div');
        controls.className = 'quantity-controls';

        const minusBtn = document.createElement('button');
        minusBtn.className = 'quantity-btn';
        minusBtn.textContent = '-';
        minusBtn.onclick = () => onQuantityChange(itemId, -1);

        const quantityDisplay = document.createElement('div');
        quantityDisplay.className = 'quantity-display';
        quantityDisplay.id = `qty-${itemId}`;
        quantityDisplay.textContent = quantity;

        const plusBtn = document.createElement('button');
        plusBtn.className = 'quantity-btn';
        plusBtn.textContent = '+';
        plusBtn.onclick = () => onQuantityChange(itemId, 1);

        controls.appendChild(minusBtn);
        controls.appendChild(quantityDisplay);
        controls.appendChild(plusBtn);

        return controls;
    }

    /**
     * Update quantity display for an item
     * @param {string} itemId - Item ID
     * @param {number} quantity - New quantity
     */
    updateQuantityDisplay(itemId, quantity) {
        const quantityElement = document.getElementById(`qty-${itemId}`);
        if (quantityElement) {
            quantityElement.textContent = quantity;
        }
    }

    /**
     * Render order summary in step 2
     * @param {Array} cartItems - Array of items in cart
     * @param {number} total - Total price
     */
    renderOrderSummary(cartItems, total) {
        let summaryHTML = '';
        
        cartItems.forEach(item => {
            const itemTotal = item.quantity * item.price;
            const unitDisplay = this.getUnitDisplayText(item.unit);
            summaryHTML += `
                <div class="summary-item">
                    <span>${item.emoji || '📦'} ${item.name} x ${item.quantity} ${unitDisplay}</span>
                    <span>₹${itemTotal}</span>
                </div>
            `;
        });

        if (this.orderSummaryElement) {
            this.orderSummaryElement.innerHTML = `<div class="order-summary">${summaryHTML}</div>`;
        }
        
        if (this.finalTotalElement) {
            this.finalTotalElement.textContent = `₹${total}`;
        }
    }

    /**
     * Get unit display text
     * @param {string} unit - Unit type
     * @returns {string} Formatted unit text
     */
    getUnitDisplayText(unit) {
        const unitMap = {
            'piece': 'Piece',
            'kg': 'Kg',
            'plate': 'Plate',
            'dozen': 'Dozen'
        };
        return unitMap[unit.toLowerCase()] || unit;
    }

    /**
     * Show error message
     * @param {string} message - Error message to display
     */
    showError(message) {
        alert(message);
    }

    /**
     * Show validation error for a specific field
     * @param {string} fieldId - Field ID (e.g., 'addressError', 'dateError')
     * @param {boolean} show - Whether to show or hide the error
     */
    showFieldError(fieldId, show) {
        const errorElement = document.getElementById(fieldId);
        if (errorElement) {
            errorElement.style.display = show ? 'block' : 'none';
        }
    }

    /**
     * Navigate to a specific step
     * @param {number} step - Step number (1 or 2)
     */
    goToStep(step) {
        document.querySelectorAll('.step').forEach(s => s.classList.remove('active'));
        const stepElement = document.getElementById(`step${step}`);
        if (stepElement) {
            stepElement.classList.add('active');
        }
        
        // Update progress bar if it exists
        const progressSteps = document.querySelectorAll('.progress-step');
        if (progressSteps.length > 0) {
            progressSteps.forEach(s => {
                s.classList.remove('active');
                s.classList.remove('completed');
            });
            
            const currentStepIndicator = document.getElementById(`step${step}-indicator`);
            if (currentStepIndicator) {
                currentStepIndicator.classList.add('active');
            }
            
            for (let i = 1; i < step; i++) {
                const prevStepIndicator = document.getElementById(`step${i}-indicator`);
                if (prevStepIndicator) {
                    prevStepIndicator.classList.add('completed');
                }
            }
        }
        
        // Scroll to top
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    /**
     * Get form values from step 2
     * @returns {Object} Form values
     */
    getFormValues() {
        return {
            flatNumber: document.getElementById('flatNumber')?.value.trim() || '',
            apartmentName: document.getElementById('apartmentName')?.value.trim() || '',
            dateSelect: document.getElementById('dateSelect')?.value || '',
            dateSelectText: document.getElementById('dateSelect')?.options[document.getElementById('dateSelect')?.selectedIndex]?.text || ''
        };
    }

    /**
     * Render delivery date and time options
     * @param {Object} deliveryDate - Date configuration {date, dayName}
     * @param {Array} timeSlots - Array of time slot objects {value, label}
     */
    renderDeliveryDateTime(deliveryDate, timeSlots) {
        // Update date label
        const dateLabel = document.querySelector('label[for="dateSelect"]') || 
                         document.querySelector('.form-label');
        
        if (dateLabel && deliveryDate) {
            dateLabel.innerHTML = `📅 Delivery Date & Time - ${deliveryDate.date} (${deliveryDate.dayName})`;
        }

        // Update time select dropdown
        const dateSelect = document.getElementById('dateSelect');
        if (dateSelect && timeSlots.length > 0) {
            // Clear existing options
            dateSelect.innerHTML = '';

            // Add placeholder option
            const placeholderOption = document.createElement('option');
            placeholderOption.value = '';
            
            // Get time range for placeholder
            const firstSlot = timeSlots[0];
            const lastSlot = timeSlots[timeSlots.length - 1];
            placeholderOption.textContent = `(${firstSlot.label} - ${lastSlot.label})`;
            dateSelect.appendChild(placeholderOption);

            // Add time slot options
            timeSlots.forEach(slot => {
                const option = document.createElement('option');
                option.value = slot.value;
                option.textContent = slot.label;
                dateSelect.appendChild(option);
            });
        }
    }

    /**
     * Get form values from step 2
     * @returns {Object} Form values (kept for backward compatibility)
     */
    getFormValuesLegacy() {
        return {
            flatNumber: document.getElementById('flatNumber')?.value.trim() || '',
            apartmentName: document.getElementById('apartmentName')?.value.trim() || '',
            dateSelect: document.getElementById('dateSelect')?.value || '',
            dateSelectText: document.getElementById('dateSelect')?.options[document.getElementById('dateSelect')?.selectedIndex]?.text || ''
        };
    }

    /**
     * Validate address form
     * @returns {boolean} True if form is valid
     */
    validateForm() {
        const formValues = this.getFormValues();
        let isValid = true;

        if (!formValues.dateSelect) {
            this.showFieldError('dateError', true);
            isValid = false;
        } else {
            this.showFieldError('dateError', false);
        }

        if (!formValues.flatNumber || !formValues.apartmentName) {
            this.showFieldError('addressError', true);
            isValid = false;
        } else {
            this.showFieldError('addressError', false);
        }

        return isValid;
    }
}

