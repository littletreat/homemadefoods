/**
 * Admin Dashboard Application - MVC Initialization
 */

// Initialize on page load
document.addEventListener('DOMContentLoaded', async function() {
    try {
        // Create Model (needs config for OrderService)
        const adminModel = new AdminModel(null); // Temporarily null
        
        // Load config first
        const config = await adminModel.loadConfig();
        
        // Create OrderService with config
        if (config && config.googleSheets && config.googleSheets.webAppUrl) {
            const orderService = new OrderService(config.googleSheets.webAppUrl);
            
            // Update model with order service
            adminModel.orderService = orderService;
            
            // Create View
            const adminView = new AdminView();
            
            // Create Controller
            const adminController = new AdminController(adminModel, adminView);
            
            // Initialize the application
            await adminController.init();
            
            console.log('✅ Admin Dashboard initialized with MVC architecture');
        } else {
            console.error('Configuration not found. Please check config.json');
            alert('Configuration error. Please check config.json');
        }
    } catch (error) {
        console.error('Failed to initialize admin dashboard:', error);
        alert('Failed to initialize dashboard. Please check console for errors.');
    }
});

