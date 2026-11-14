const productGrid = document.getElementById("productGrid");

const searchInput = document.getElementById("searchInput");

const categoryFilter = document.getElementById("categoryFilter");

const sortFilter = document.getElementById("sortFilter");

const statusMessage = document.getElementById("statusMessage");

const resultsCount = document.getElementById("resultsCount");

let allProducts = [];


// Load products from JSON file

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

        loadCategories();

        renderProducts(allProducts);

        statusMessage.textContent = "";

    } catch (error) {

        statusMessage.textContent = "Error: " + error.message;

        console.error(error);

    }

}


// Load categories into select menu

function loadCategories() {

    const categories = [
        ...new Set(allProducts.map(product => product.category))
    ];

    categories.forEach(category => {

        const option = document.createElement("option");

        option.value = category;

        option.textContent = category;

        categoryFilter.appendChild(option);

    });

}


// Display products

function renderProducts(products) {

    productGrid.replaceChildren();

    resultsCount.textContent = `${products.length} products found`;

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

        price.textContent = "$" + product.price.toFixed(2);


        card.append(
            icon,
            name,
            description,
            category,
            price
        );

        productGrid.appendChild(card);

    });

}


// Search, filter and sort products

function filterProducts() {

    const searchValue = searchInput.value.toLowerCase();

    const selectedCategory = categoryFilter.value;

    const selectedSort = sortFilter.value;


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

        filteredProducts.sort((a, b) => a.price - b.price);

    }

    else if (selectedSort === "high") {

        filteredProducts.sort((a, b) => b.price - a.price);

    }


    renderProducts(filteredProducts);

}


// Listen for user actions

searchInput.addEventListener("input", filterProducts);

categoryFilter.addEventListener("change", filterProducts);

sortFilter.addEventListener("change", filterProducts);


// Start application

loadProducts();