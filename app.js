/**
 * Main Application Entry Point
 * Initializes the MVC components and starts the application
 */

// Wait for DOM to be fully loaded
document.addEventListener('DOMContentLoaded', async function() {
    try {
        // Initialize MVC components
        const model = new MenuModel();
        const view = new MenuView();
        const controller = new MenuController(model, view);
        
        // Initialize the application
        await controller.init();
        
        // Make controller available globally for any inline onclick handlers that might still exist
        window.menuController = controller;
        
    } catch (error) {
        console.error('Failed to start application:', error);
        alert('Failed to load the application. Please refresh the page.');
    }
});

// Legacy function support (for any remaining inline handlers)
// These will delegate to the controller

function updateQuantity(productId, change) {
    if (window.menuController) {
        window.menuController.handleQuantityChange(productId, change);
    }
}

function proceedToAddress() {
    if (window.menuController) {
        window.menuController.proceedToAddress();
    }
}

function bookOrder() {
    if (window.menuController) {
        window.menuController.bookOrder();
    }
}

function goToStep(step) {
    if (window.menuController) {
        window.menuController.goToStep(step);
    }
}

function updateLiveReview() {
    if (window.menuController) {
        window.menuController.updateLiveReview();
    }
}

