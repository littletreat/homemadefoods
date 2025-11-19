class MenuModel {
    constructor(dataUrl) {
        this.dataUrl = dataUrl;
        this.categories = [];
        this.itemsById = new Map();
        this.quantities = new Map();
    }

    async loadMenu() {
        try {
            console.log('Fetching menu from:', this.dataUrl);
            const response = await fetch(this.dataUrl);

            if (!response.ok) {
                throw new Error(`Unable to load menu data (${response.status})`);
            }

            const data = await response.json();
            console.log('Parsed JSON data:', data);
            this.categories = Array.isArray(data.categories) ? data.categories : [];
            this.itemsById.clear();
            this.quantities.clear();

            this.categories.forEach((category) => {
                (category.items || []).forEach((item) => {
                    this.itemsById.set(item.id, { ...item, categoryId: category.id });
                    this.quantities.set(item.id, 0);
                });
            });

            console.log('Loaded categories:', this.categories.length);
            return this.categories;
        } catch (error) {
            console.error('Error fetching menu, trying fallback data...', error);
            
            // Try to use fallback data embedded in HTML
            if (window.MENU_DATA_FALLBACK) {
                console.log('Using fallback menu data');
                const data = window.MENU_DATA_FALLBACK;
                this.categories = Array.isArray(data.categories) ? data.categories : [];
                this.itemsById.clear();
                this.quantities.clear();

                this.categories.forEach((category) => {
                    (category.items || []).forEach((item) => {
                        this.itemsById.set(item.id, { ...item, categoryId: category.id });
                        this.quantities.set(item.id, 0);
                    });
                });

                console.log('Loaded categories from fallback:', this.categories.length);
                return this.categories;
            }
            
            throw error;
        }
    }

    setQuantity(itemId, quantity) {
        if (!this.itemsById.has(itemId)) {
            throw new Error(`Unknown menu item: ${itemId}`);
        }

        const safeQuantity = Math.max(0, quantity);
        this.quantities.set(itemId, safeQuantity);
        return safeQuantity;
    }

    getQuantity(itemId) {
        return this.quantities.get(itemId) ?? 0;
    }

    getSelectedItems() {
        const selected = [];

        this.quantities.forEach((quantity, itemId) => {
            if (quantity > 0) {
                const item = this.itemsById.get(itemId);
                if (item) {
                    selected.push({
                        ...item,
                        quantity,
                        subtotal: quantity * item.price
                    });
                }
            }
        });

        return selected;
    }

    getOrderTotal() {
        return this.getSelectedItems().reduce((total, item) => total + item.subtotal, 0);
    }
}

class MenuView {
    constructor() {
        this.menuRoot = document.getElementById('menu-root');
        this.orderList = document.getElementById('order-items');
        this.orderTotal = document.getElementById('order-total');
        this.bookOrderButton = document.getElementById('book-order');
        this.navToggle = document.querySelector('.nav-toggle');
        this.navLinks = document.getElementById('primary-navigation');
        this.navbar = document.querySelector('.navbar');
        this.currencyFormatter = new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: 'INR',
            maximumFractionDigits: 0
        });

        this.menuObserver = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        entry.target.classList.add('is-visible');
                        this.menuObserver.unobserve(entry.target);
                    }
                });
            },
            {
                threshold: 0.15,
                rootMargin: '0px 0px -50px 0px'
            }
        );
    }

    renderMenu(categories) {
        if (!this.menuRoot) {
            return;
        }

        this.menuRoot.innerHTML = '';
        const fragment = document.createDocumentFragment();

        categories.forEach((category) => {
            const section = this.createCategorySection(category);
            fragment.appendChild(section);
        });

        this.menuRoot.appendChild(fragment);
    }

    createCategorySection(category) {
        const section = document.createElement('section');
        section.className = 'menu-category';
        section.setAttribute('role', 'listitem');

        const header = document.createElement('header');
        header.className = 'menu-category__header';

        const title = document.createElement('h3');
        title.className = 'menu-category__title';
        title.textContent = category.name;
        header.appendChild(title);

        if (category.description) {
            const description = document.createElement('p');
            description.className = 'menu-category__description';
            description.textContent = category.description;
            header.appendChild(description);
        }

        section.appendChild(header);

        const itemsWrapper = document.createElement('div');
        itemsWrapper.className = 'menu-items';

        (category.items || []).forEach((item) => {
            const card = this.createMenuItemCard(item);
            itemsWrapper.appendChild(card);
            this.menuObserver.observe(card);
        });

        section.appendChild(itemsWrapper);
        return section;
    }

    createMenuItemCard(item) {
        const card = document.createElement('article');
        card.className = 'menu-item';
        card.dataset.itemId = item.id;

        if (item.icon) {
            const icon = document.createElement('span');
            icon.className = 'menu-item__icon';
            icon.textContent = item.icon;
            card.appendChild(icon);
        }

        const header = document.createElement('div');
        header.className = 'menu-item__header';

        const titleWrapper = document.createElement('div');
        const name = document.createElement('h4');
        name.className = 'menu-item__name';
        name.textContent = item.name;
        titleWrapper.appendChild(name);

        if (item.description) {
            const description = document.createElement('p');
            description.className = 'menu-item__description';
            description.textContent = item.description;
            titleWrapper.appendChild(description);
        }

        header.appendChild(titleWrapper);

        const price = document.createElement('span');
        price.className = 'menu-item__price';
        price.textContent = this.currencyFormatter.format(item.price);
        header.appendChild(price);

        card.appendChild(header);

        if (item.unitLabel) {
            const note = document.createElement('p');
            note.className = 'menu-item__note';
            note.textContent = item.unitLabel;
            card.appendChild(note);
        }

        const controls = document.createElement('div');
        controls.className = 'menu-item__controls';

        const quantity = document.createElement('div');
        quantity.className = 'quantity-selector';

        const decrement = document.createElement('button');
        decrement.className = 'quantity-button';
        decrement.type = 'button';
        decrement.dataset.action = 'decrease';
        decrement.dataset.itemId = item.id;
        decrement.setAttribute('aria-label', `Remove one ${item.name}`);
        decrement.innerHTML = '<i class="fas fa-minus"></i>';

        const value = document.createElement('span');
        value.className = 'quantity-value';
        value.dataset.quantityFor = item.id;
        value.textContent = '0';

        const increment = document.createElement('button');
        increment.className = 'quantity-button';
        increment.type = 'button';
        increment.dataset.action = 'increase';
        increment.dataset.itemId = item.id;
        increment.setAttribute('aria-label', `Add one ${item.name}`);
        increment.innerHTML = '<i class="fas fa-plus"></i>';

        quantity.append(decrement, value, increment);
        controls.appendChild(quantity);
        card.appendChild(controls);

        return card;
    }

    bindQuantityChange(handler) {
        if (!this.menuRoot) return;

        this.menuRoot.addEventListener('click', (event) => {
            const target = event.target.closest('.quantity-button');
            if (!target) return;

            const itemId = target.dataset.itemId;
            const action = target.dataset.action;

            if (!itemId || !action) return;

            const delta = action === 'increase' ? 1 : -1;
            handler(itemId, delta);
        });
    }

    bindBookOrder(handler) {
        if (!this.bookOrderButton) return;
        this.bookOrderButton.addEventListener('click', handler);
    }

    bindNavToggle(handler) {
        if (!this.navToggle) return;
        this.navToggle.addEventListener('click', handler);
    }

    bindNavLinks(handler) {
        if (!this.navLinks) return;
        this.navLinks.querySelectorAll('a').forEach((link) => {
            link.addEventListener('click', handler);
        });
    }

    toggleNavigation(isOpen) {
        if (!this.navToggle || !this.navLinks) return;
        this.navToggle.setAttribute('aria-expanded', String(isOpen));
        this.navLinks.classList.toggle('is-open', isOpen);
    }

    closeNavigation() {
        this.toggleNavigation(false);
    }

    updateQuantityDisplay(itemId, quantity) {
        const element = this.menuRoot?.querySelector(`[data-quantity-for="${itemId}"]`);
        if (element) {
            element.textContent = String(quantity);
        }
    }

    updateOrderSummary(items, total) {
        if (!this.orderList || !this.orderTotal) return;

        this.orderList.innerHTML = '';

        if (items.length === 0) {
            const emptyState = document.createElement('li');
            emptyState.className = 'order-summary__item';
            emptyState.textContent = 'No items selected yet.';
            this.orderList.appendChild(emptyState);
        } else {
            const fragment = document.createDocumentFragment();
            items.forEach((item) => {
                const listItem = document.createElement('li');
                listItem.className = 'order-summary__item';

                const name = document.createElement('span');
                name.textContent = `${item.name} × ${item.quantity}`;

                const subtotal = document.createElement('strong');
                subtotal.textContent = this.currencyFormatter.format(item.subtotal);

                listItem.append(name, subtotal);
                fragment.appendChild(listItem);
            });

            this.orderList.appendChild(fragment);
        }

        this.orderTotal.textContent = this.currencyFormatter.format(total);
    }

    setNavScrolled(isScrolled) {
        if (!this.navbar) return;
        this.navbar.classList.toggle('is-scrolled', isScrolled);
    }

    showEmptyOrderMessage() {
        window.alert('Please add at least one item before booking your order.');
    }
}

class MenuController {
    constructor({ model, view, whatsappNumber }) {
        this.model = model;
        this.view = view;
        this.whatsappNumber = whatsappNumber.replace(/\D/g, '');
        this.navigationOpen = false;
    }

    async init() {
        try {
            console.log('Initializing menu...');
            const categories = await this.model.loadMenu();
            console.log('Menu loaded:', categories);
            this.view.renderMenu(categories);
            this.view.updateOrderSummary([], 0);
            this.registerEvents();
        } catch (error) {
            console.error('Error loading menu:', error);
            this.showLoadError();
        }
    }

    registerEvents() {
        this.view.bindQuantityChange((itemId, delta) => {
            const currentQuantity = this.model.getQuantity(itemId);
            const nextQuantity = Math.max(0, currentQuantity + delta);
            this.model.setQuantity(itemId, nextQuantity);
            this.view.updateQuantityDisplay(itemId, nextQuantity);
            this.refreshSummary();
        });

        this.view.bindBookOrder(() => this.handleBookOrder());

        this.view.bindNavToggle(() => {
            this.navigationOpen = !this.navigationOpen;
            this.view.toggleNavigation(this.navigationOpen);
        });

        this.view.bindNavLinks(() => {
            this.navigationOpen = false;
            this.view.closeNavigation();
        });

        window.addEventListener('scroll', () => {
            this.view.setNavScrolled(window.scrollY > 40);
        });
    }

    refreshSummary() {
        const items = this.model.getSelectedItems();
        const total = this.model.getOrderTotal();
        this.view.updateOrderSummary(items, total);
    }

    handleBookOrder() {
        const items = this.model.getSelectedItems();

        if (items.length === 0) {
            this.view.showEmptyOrderMessage();
            return;
        }

        const total = this.model.getOrderTotal();
        const messageLines = [
            'Hello Little Treat,',
            '',
            'I would like to place an order:',
            '',
            ...items.map((item) => `• ${item.name} × ${item.quantity} = ${this.view.currencyFormatter.format(item.subtotal)}`),
            '',
            `Total: ${this.view.currencyFormatter.format(total)}`,
            '',
            'Please confirm availability.'
        ];

        const message = encodeURIComponent(messageLines.join('\n'));
        const whatsappUrl = `https://wa.me/${this.whatsappNumber}?text=${message}`;
        window.open(whatsappUrl, '_blank', 'noopener');
    }

    showLoadError() {
        if (!this.view.menuRoot) return;
        this.view.menuRoot.innerHTML = `
            <div class="menu-category">
                <div class="menu-category__header">
                    <h3 class="menu-category__title">Menu unavailable</h3>
                    <p class="menu-category__description">We couldn't load our treats right now. Please refresh the page or try again later.</p>
                </div>
            </div>
        `;
    }
}

const app = new MenuController({
    model: new MenuModel('data/menu.json'),
    view: new MenuView(),
    whatsappNumber: '+91 7874914422'
});

app.init();

