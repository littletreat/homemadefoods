
document.addEventListener('DOMContentLoaded', async function() {
    try {
        const adminModel = new AdminModel(null);
        const config = await adminModel.loadConfig();
        if (config && config.googleSheets && config.googleSheets.webAppUrl) {
            const orderService = new OrderService(config.googleSheets.webAppUrl);
            adminModel.orderService = orderService;
            const adminView = new AdminView();
            const adminController = new AdminController(adminModel, adminView);
            await adminController.init();
        } else {
            alert('Configuration error. Please check config.json');
        }
    } catch (error) {
        alert('Please check error in console.');
    }
});

