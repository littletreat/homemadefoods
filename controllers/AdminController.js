/**
 * AdminController - Handles business logic for admin dashboard
 */
class AdminController {
    constructor(model, view) {
        this.model = model;
        this.view = view;
        this.currentDisplayedOrders = [];
    }

    /**
     * Initialize the dashboard
     */
    async init() {
        try {
            // Load configuration
            await this.model.loadConfig();

            // Initial data load
            await this.loadOrders();

            // Setup event listeners
            this.setupEventListeners();
        } catch (error) {
            console.error('Initialization error:', error);
            this.view.showError('Failed to initialize dashboard');
        }
    }

    /**
     * Setup all event listeners
     */
    setupEventListeners() {
        // Refresh button
        const refreshBtn = document.getElementById('refreshBtn');
        if (refreshBtn) {
            refreshBtn.addEventListener('click', async () => {
                this.view.disableRefresh();
                await this.loadOrders();
                this.view.enableRefresh();
            });
        }

        // Search input
        const searchInput = document.getElementById('searchInput');
        if (searchInput) {
            searchInput.addEventListener('input', () => {
                this.handleSearch();
            });
        }

        // Sort select
        const sortSelect = document.getElementById('sortSelect');
        if (sortSelect) {
            sortSelect.addEventListener('change', () => {
                this.handleSort();
            });
        }

        // Status filter
        const statusFilter = document.getElementById('statusFilter');
        if (statusFilter) {
            statusFilter.addEventListener('change', () => {
                this.handleStatusFilter();
            });
        }

        // Status badge clicks (event delegation)
        const tableBody = document.getElementById('ordersTableBody');
        if (tableBody) {
            tableBody.addEventListener('click', (e) => {
                const badge = e.target.closest('.status-badge');
                if (badge) {
                    const orderId = badge.dataset.orderId;
                    const currentStatus = badge.dataset.status;
                    this.cycleStatus(orderId, currentStatus);
                }
            });
        }
    }

    /**
     * Load orders from Google Sheets
     */
    async loadOrders() {
        try {
            this.view.showLoading();

            // Fetch orders
            await this.model.fetchOrders();
            this.currentDisplayedOrders = this.model.getAllOrders();

            // Apply current filters and sort
            this.applyFiltersAndSort();

            // Update summary
            const summary = this.model.calculateSummary();
            this.view.updateSummary(summary);

            // Render orders
            this.view.renderOrders(this.currentDisplayedOrders);

            this.view.hideLoading();
            this.view.showOrdersSection();

            console.log(`Loaded ${this.model.getAllOrders().length} orders`);
        } catch (error) {
            console.error('Error loading orders:', error);
            this.view.hideLoading();
            this.view.showError('Failed to load orders. Please try again.');
        }
    }

    /**
     * Handle search
     */
    handleSearch() {
        const query = this.view.getSearchQuery();
        const statusFilter = this.view.getStatusFilter();

        // Start with all orders
        let filtered = this.model.getAllOrders();

        // Apply status filter first
        if (statusFilter !== 'all') {
            filtered = this.model.getOrdersByStatus(statusFilter);
        }

        // Then apply search
        if (query && query.trim() !== '') {
            filtered = this.model.searchOrders(query);
            
            // Reapply status filter to search results if needed
            if (statusFilter !== 'all') {
                filtered = filtered.filter(order => order.status === statusFilter);
            }
        }

        // Apply sort
        const sortBy = this.view.getSortOption();
        this.currentDisplayedOrders = this.model.sortOrders(filtered, sortBy);

        // Render
        this.view.renderOrders(this.currentDisplayedOrders);
    }

    /**
     * Handle sort
     */
    handleSort() {
        const sortBy = this.view.getSortOption();
        this.currentDisplayedOrders = this.model.sortOrders(this.currentDisplayedOrders, sortBy);
        this.view.renderOrders(this.currentDisplayedOrders);
    }

    /**
     * Handle status filter
     */
    handleStatusFilter() {
        this.applyFiltersAndSort();
    }

    /**
     * Apply all filters and sorting
     */
    applyFiltersAndSort() {
        const statusFilter = this.view.getStatusFilter();
        const searchQuery = this.view.getSearchQuery();
        const sortBy = this.view.getSortOption();

        // Start with filtered by status
        let filtered = this.model.getOrdersByStatus(statusFilter);

        // Apply search if present
        if (searchQuery && searchQuery.trim() !== '') {
            const searchResults = this.model.searchOrders(searchQuery);
            // Intersect with status filter
            if (statusFilter !== 'all') {
                filtered = searchResults.filter(order => order.status === statusFilter);
            } else {
                filtered = searchResults;
            }
        }

        // Apply sort
        this.currentDisplayedOrders = this.model.sortOrders(filtered, sortBy);

        // Render
        this.view.renderOrders(this.currentDisplayedOrders);
    }

    /**
     * Cycle through status (Pending → Dispatched → Delivered → Pending)
     */
    async cycleStatus(orderId, currentStatus) {
        const statusCycle = {
            'Pending': 'Dispatched',
            'Dispatched': 'Delivered',
            'Delivered': 'Pending'
        };

        const newStatus = statusCycle[currentStatus] || 'Pending';

        try {
            await this.updateOrderStatus(orderId, newStatus);
        } catch (error) {
            console.error('Error updating status:', error);
            alert('Failed to update status. Please try again.');
        }
    }

    /**
     * Update order status in Google Sheets
     */
    async updateOrderStatus(orderId, newStatus) {
        try {
            const webAppUrl = this.model.getWebAppUrl();

            await fetch(webAppUrl, {
                method: 'POST',
                mode: 'no-cors',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    action: 'updateStatus',
                    orderId: orderId,
                    status: newStatus
                })
            });

            // Update local order data
            this.model.updateOrderStatus(orderId, newStatus);

            // Re-apply filters and render
            this.applyFiltersAndSort();

            console.log(`✅ Status updated: ${orderId} → ${newStatus}`);

        } catch (error) {
            console.error('Error updating status:', error);
            throw error;
        }
    }
}

