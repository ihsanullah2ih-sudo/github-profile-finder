// 1. Select HTML elements

const productGrid = document.getElementById("productGrid");

const searchInput = document.getElementById("searchInput");

const categoryFilter = document.getElementById("categoryFilter");

const sortFilter = document.getElementById("sortFilter");

const statusMessage = document.getElementById("statusMessage");

const resultsCount = document.getElementById("resultsCount");

const cartCount = document.getElementById("cartCount");

const cartItemsContainer = document.getElementById("cartItems");

const cartTotal = document.getElementById("cartTotal");

const clearCartButton = document.getElementById("clearCartButton");


// 2. Global variables

let allProducts = [];

let cart = loadCart();


// 3. Load saved cart from localStorage

function loadCart() {

    try {

        const savedCart = localStorage.getItem("shoppingCart");

        const parsedCart = savedCart
            ? JSON.parse(savedCart)
            : [];

        if (!Array.isArray(parsedCart)) {
            return [];
        }

        return parsedCart.filter(item => {

            return item &&
                Number.isInteger(item.id) &&
                Number.isInteger(item.quantity) &&
                item.quantity > 0;

        });

    } catch (error) {

        console.error("Cart loading error:", error);

        return [];

    }

}


// 4. Save cart in localStorage

function saveCart() {

    try {

        localStorage.setItem(
            "shoppingCart",
            JSON.stringify(cart)
        );

        return true;

    } catch (error) {

        console.error("Cart saving error:", error);

        statusMessage.textContent =
            "Could not save cart in this browser.";

        return false;

    }

}


// 5. Load products from JSON

async function loadProducts() {

    try {

        statusMessage.textContent = "Loading products...";

        const response = await fetch("products.json");

        if (!response.ok) {

            throw new Error("Could not load products");

        }

        const products = await response.json();

        if (!Array.isArray(products)) {

            throw new Error("Invalid products data");

        }

        allProducts = products;

        // Remove cart items that are no longer available

        cart = cart.filter(item => {

            return allProducts.some(product => {

                return product.id === item.id;

            });

        });

        saveCart();

        loadCategories();

        renderProducts(allProducts);

        renderCart();

        statusMessage.textContent = "";

    } catch (error) {

        statusMessage.textContent =
            "Error: " + error.message;

        console.error(error);

    }

}


// 6. Load categories

function loadCategories() {

    const categories = [
        ...new Set(
            allProducts.map(product => product.category)
        )
    ];

    categories.forEach(category => {

        const option = document.createElement("option");

        option.value = category;

        option.textContent = category;

        categoryFilter.appendChild(option);

    });

}


// 7. Display products

function renderProducts(products) {

    productGrid.replaceChildren();

    resultsCount.textContent =
        `${products.length} products found`;

    if (products.length === 0) {

        const message = document.createElement("p");

        message.className = "empty-message";

        message.textContent = "No products found.";

        productGrid.appendChild(message);

        return;

    }

    products.forEach(product => {

        const card = document.createElement("article");

        card.className = "product-card";


        const icon = document.createElement("div");

        icon.className = "product-icon";

        icon.textContent = product.icon;


        const name = document.createElement("h3");

        name.textContent = product.name;


        const description = document.createElement("p");

        description.className = "product-description";

        description.textContent = product.description;


        const category = document.createElement("span");

        category.className = "product-category";

        category.textContent = product.category;


        const price = document.createElement("p");

        price.className = "product-price";

        price.textContent =
            "$" + product.price.toFixed(2);


        const addButton = document.createElement("button");

        addButton.className = "add-button";

        addButton.textContent = "Add to Cart";

        addButton.dataset.addToCart = product.id;

        card.append(
            icon,
            name,
            description,
            category,
            price,
            addButton
        );

        productGrid.appendChild(card);

    });

}


// 8. Add product to cart

function addToCart(productId) {

    const product = allProducts.find(item => {

        return item.id === productId;

    });

    if (!product) {
        return;
    }

    const existingItem = cart.find(item => {

        return item.id === productId;

    });

    if (existingItem) {

        existingItem.quantity++;

    } else {

        cart.push({

            id: productId,

            quantity: 1

        });

    }

    updateCart();

}


// 9. Update cart quantity

function changeQuantity(productId, amount) {

    const item = cart.find(item => {

        return item.id === productId;

    });

    if (!item) {
        return;
    }

    item.quantity += amount;

    if (item.quantity <= 0) {

        cart = cart.filter(cartItem => {

            return cartItem.id !== productId;

        });

    }

    updateCart();

}


// 10. Remove product from cart

function removeFromCart(productId) {

    cart = cart.filter(item => {

        return item.id !== productId;

    });

    updateCart();

}


// 11. Update and save cart

function updateCart() {

    saveCart();

    renderCart();

}


// 12. Create cart buttons

function createCartButton(text, action, productId, className) {

    const button = document.createElement("button");

    button.type = "button";

    button.textContent = text;

    button.dataset.action = action;

    button.dataset.id = productId;

    button.className = className;

    return button;

}


// 13. Display cart products

function renderCart() {

    cartItemsContainer.replaceChildren();

    // Calculate total quantity

    const totalQuantity = cart.reduce((sum, item) => {

        return sum + item.quantity;

    }, 0);

    cartCount.textContent = totalQuantity;


    let totalPrice = 0;


    if (cart.length === 0) {

        const message = document.createElement("p");

        message.className = "empty-message";

        message.textContent = "Your cart is empty.";

        cartItemsContainer.appendChild(message);

    }


    cart.forEach(item => {

        const product = allProducts.find(product => {

            return product.id === item.id;

        });

        if (!product) {
            return;
        }

        const itemTotal = product.price * item.quantity;

        totalPrice += itemTotal;


        const cartItem = document.createElement("div");

        cartItem.className = "cart-item";


        const info = document.createElement("div");


        const name = document.createElement("h4");

        name.textContent = product.name;


        const price = document.createElement("p");

        price.textContent =
            `$${product.price.toFixed(2)} each`;


        info.append(name, price);


        const controls = document.createElement("div");

        controls.className = "quantity-controls";


        const decreaseButton = createCartButton(
            "-",
            "decrease",
            product.id,
            ""
        );


        const quantity = document.createElement("span");

        quantity.textContent = item.quantity;


        const increaseButton = createCartButton(
            "+",
            "increase",
            product.id,
            ""
        );


        const removeButton = createCartButton(
            "Remove",
            "remove",
            product.id,
            "remove-button"
        );


        controls.append(
            decreaseButton,
            quantity,
            increaseButton,
            removeButton
        );


        cartItem.append(info, controls);

        cartItemsContainer.appendChild(cartItem);

    });


    cartTotal.textContent = "$" + totalPrice.toFixed(2);

}


// 14. Search, filter and sort

function filterProducts() {

    const searchValue =
        searchInput.value.toLowerCase();

    const selectedCategory =
        categoryFilter.value;

    const selectedSort =
        sortFilter.value;


    let filteredProducts = allProducts.filter(product => {

        const matchesSearch = product.name
            .toLowerCase()
            .includes(searchValue);

        const matchesCategory =
            selectedCategory === "all" ||
            product.category === selectedCategory;

        return matchesSearch && matchesCategory;

    });


    if (selectedSort === "low") {

        filteredProducts.sort((a, b) => {

            return a.price - b.price;

        });

    }

    else if (selectedSort === "high") {

        filteredProducts.sort((a, b) => {

            return b.price - a.price;

        });

    }


    renderProducts(filteredProducts);

}


// 15. Event delegation for Add to Cart

productGrid.addEventListener("click", function(event) {

    const button = event.target.closest("[data-add-to-cart]");

    if (!button) {
        return;
    }

    const productId = Number(button.dataset.addToCart);

    addToCart(productId);

});


// 16. Event delegation for cart buttons

cartItemsContainer.addEventListener("click", function(event) {

    const button = event.target.closest("button[data-action]");

    if (!button) {
        return;
    }

    const productId = Number(button.dataset.id);

    const action = button.dataset.action;


    if (action === "increase") {

        changeQuantity(productId, 1);

    }

    else if (action === "decrease") {

        changeQuantity(productId, -1);

    }

    else if (action === "remove") {

        removeFromCart(productId);

    }

});


// 17. Clear cart

clearCartButton.addEventListener("click", function() {

    cart = [];

    updateCart();

});


// 18. Listen for search and filter actions

searchInput.addEventListener("input", filterProducts);

categoryFilter.addEventListener("change", filterProducts);

sortFilter.addEventListener("change", filterProducts);


// 19. Start application

loadProducts();