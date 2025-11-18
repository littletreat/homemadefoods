// Product data
const products = {
    vadapav: { name: 'Mumbai Style Vadapav', price: 30, emoji: '🍔' },
    dabeli: { name: 'Kutchi Dabeli', price: 30, emoji: '🌮' },
    sandwich: { name: 'Grilled Sandwich', price: 40, emoji: '🥪' },
    pavbhaji: { name: 'Pav Bhaji', price: 50, emoji: '🍛' },
    custardapple: { name: 'Sitafal', price: 85, emoji: '🍏' }
};

// Cart state
let cart = {
    vadapav: 0,
    dabeli: 0,
    sandwich: 0,
    pavbhaji: 0,
    custardapple: 0
};

let currentStep = 1;

// Format date and time to readable format
function formatDateTime(dateTimeString) {
    const date = new Date(dateTimeString);
    const day = date.getDate();
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const month = monthNames[date.getMonth()];
    const year = date.getFullYear();
    const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const dayName = dayNames[date.getDay()];
    
    // Format time
    let hours = date.getHours();
    const minutes = date.getMinutes();
    const ampm = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12;
    hours = hours ? hours : 12; // 0 should be 12
    const timeStr = `${hours}:${minutes.toString().padStart(2, '0')} ${ampm}`;
    
    return `${day} ${month} ${year} (${dayName}) - ${timeStr}`;
}

// Update quantity
function updateQuantity(productId, change) {
    cart[productId] = Math.max(0, cart[productId] + change);
    document.getElementById(`qty-${productId}`).textContent = cart[productId];
    updateTotalPrice();
}

// Calculate total
function calculateTotal() {
    let total = 0;
    for (let productId in cart) {
        total += cart[productId] * products[productId].price;
    }
    return total;
}

// Update total price display
function updateTotalPrice() {
    const total = calculateTotal();
    document.getElementById('totalPrice').textContent = `₹${total}`;
}

// Navigate to step
function goToStep(step) {
    document.querySelectorAll('.step').forEach(s => s.classList.remove('active'));
    document.querySelectorAll('.progress-step').forEach(s => {
        s.classList.remove('active');
        s.classList.remove('completed');
    });
    document.getElementById(`step${step}`).classList.add('active');
    document.getElementById(`step${step}-indicator`).classList.add('active');
    for (let i = 1; i < step; i++) {
        document.getElementById(`step${i}-indicator`).classList.add('completed');
    }
    currentStep = step;
}

// Proceed to address
function proceedToAddress() {
    const total = calculateTotal();
    if (total === 0) {
        alert('Please select at least one item to proceed!');
        return;
    }
    // Show order summary when moving to step 2
    updateOrderSummary();
    goToStep(2);
}

// Update order summary in step 2
function updateOrderSummary() {
    const total = calculateTotal();
    let summaryHTML = '';
    for (let productId in cart) {
        if (cart[productId] > 0) {
            const product = products[productId];
            const itemTotal = cart[productId] * product.price;
            // Use "pcs" for food items, "Kg" for Sitafal (custardapple)
            const unit = productId === 'custardapple' ? 'Kg' : 'pcs';
            summaryHTML += `
                <div class="summary-item">
                    <span>${product.emoji} ${product.name} x ${cart[productId]} ${unit}</span>
                    <span>₹${itemTotal}</span>
                </div>
            `;
        }
    }
    document.getElementById('liveOrderSummary').innerHTML = `<div class="order-summary">${summaryHTML}</div>`;
    document.getElementById('finalTotalPrice').textContent = `₹${total}`;
}

// Update live review section as user types
function updateLiveReview() {
    const flatNumber = document.getElementById('flatNumber').value.trim();
    const apartmentName = document.getElementById('apartmentName').value.trim();
    const dateSelect = document.getElementById('dateSelect');
    const reviewSection = document.getElementById('liveReviewSection');
    
    // Show review section if any field has value
    if (flatNumber || apartmentName || dateSelect.value) {
        reviewSection.style.display = 'block';
        
        if (flatNumber && apartmentName) {
            document.getElementById('reviewAddress').innerHTML = `📍 ${flatNumber}, ${apartmentName}`;
        } else if (flatNumber) {
            document.getElementById('reviewAddress').innerHTML = `📍 ${flatNumber}`;
        } else if (apartmentName) {
            document.getElementById('reviewAddress').innerHTML = `📍 ${apartmentName}`;
        } else {
            document.getElementById('reviewAddress').innerHTML = '';
        }
        
        if (dateSelect.value) {
            const selectedDateFormatted = dateSelect.options[dateSelect.selectedIndex].text;
            document.getElementById('reviewDate').innerHTML = `📅 ${selectedDateFormatted}`;
        } else {
            document.getElementById('reviewDate').innerHTML = '';
        }
    } else {
        reviewSection.style.display = 'none';
    }
}

// Validate address form
function validateAddressForm() {
    let isValid = true;
    const dateSelect = document.getElementById('dateSelect');
    if (!dateSelect.value) {
        document.getElementById('dateError').style.display = 'block';
        isValid = false;
    } else {
        document.getElementById('dateError').style.display = 'none';
    }
    const flatNumber = document.getElementById('flatNumber').value.trim();
    const apartmentName = document.getElementById('apartmentName').value.trim();
    if (!flatNumber || !apartmentName) {
        document.getElementById('addressError').style.display = 'block';
        isValid = false;
    } else {
        document.getElementById('addressError').style.display = 'none';
    }
    return isValid;
}

// Book order - send to WhatsApp
function bookOrder() {
    // Validate form first
    if (!validateAddressForm()) {
        return;
    }
    
    const flatNumber = document.getElementById('flatNumber').value.trim();
    const apartmentName = document.getElementById('apartmentName').value.trim();
    const dateSelect = document.getElementById('dateSelect');
    const selectedDateFormatted = dateSelect.options[dateSelect.selectedIndex].text;
    const total = calculateTotal();
    
    // Build order items list
    let orderItems = '';
    for (let productId in cart) {
        if (cart[productId] > 0) {
            const product = products[productId];
            // Use "pcs" for food items, "Kg" for Sitafal (custardapple)
            const unit = productId === 'custardapple' ? 'Kg' : 'pcs';
            orderItems += `${product.emoji} ${product.name}: ${cart[productId]} ${unit}\n`;
        }
    }
    
    // Create message with proper emoji support
    const message = `� *Kutchi Dabeli Order*

📦 *Order Items:*
${orderItems}
📅 *Delivery Date & Time:* ${selectedDateFormatted}
💰 *Total Amount:* ₹${total}

📍 *Delivery Address:*
Flat: ${flatNumber}
Apartment: ${apartmentName}

Please confirm my order. Thank you! 😊`;

    // Use encodeURIComponent which properly handles UTF-8 emojis
    const encodedMessage = encodeURIComponent(message);
    const whatsappUrl = `https://wa.me/917710963036?text=${encodedMessage}`;
    window.open(whatsappUrl, '_blank');
}

// Initialize the page
document.addEventListener('DOMContentLoaded', function() {
    updateTotalPrice();
});
