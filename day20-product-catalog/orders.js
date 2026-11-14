// 1. Select HTML elements

const totalOrdersElement =
    document.getElementById("totalOrders");

const totalSalesElement =
    document.getElementById("totalSales");

const searchInput =
    document.getElementById("searchInput");

const deliveryFilter =
    document.getElementById("deliveryFilter");

const sortFilter =
    document.getElementById("sortFilter");

const ordersList =
    document.getElementById("ordersList");

const statusMessage =
    document.getElementById("statusMessage");

const resultsCount =
    document.getElementById("resultsCount");


// 2. Global variables

let allOrders = [];

const expandedOrders = new Set();


// 3. Format currency

function formatCurrency(amount) {

    return new Intl.NumberFormat("en-US", {

        style: "currency",

        currency: "USD"

    }).format(amount);

}


// 4. Validate order data

function isValidOrder(order) {

    return Boolean(

        order &&

        typeof order.orderId === "string" &&

        Array.isArray(order.items) &&

        Number.isFinite(order.total) &&

        order.total >= 0 &&

        order.items.every(item => {

            return item &&

                typeof item.name === "string" &&

                Number.isFinite(item.price) &&

                item.price >= 0 &&

                Number.isInteger(item.quantity) &&

                item.quantity > 0;

        })

    );

}


// 5. Load orders from localStorage

function loadOrders() {

    try {

        const savedOrders =
            localStorage.getItem("demoOrders");

        if (!savedOrders) {

            return [];

        }

        const parsedOrders = JSON.parse(savedOrders);

        if (!Array.isArray(parsedOrders)) {

            throw new Error("Invalid order data.");

        }

        return parsedOrders.filter(isValidOrder);

    }

    catch (error) {

        statusMessage.textContent =
            "Could not read saved orders.";

        console.error("Loading Error:", error);

        return [];

    }

}


// 6. Calculate dashboard statistics

function renderStatistics() {

    totalOrdersElement.textContent = allOrders.length;


    const totalSales = allOrders.reduce((sum, order) => {

        return sum + order.total;

    }, 0);


    totalSalesElement.textContent =
        formatCurrency(totalSales);

}


// 7. Get order timestamp

function getOrderTimestamp(order) {

    const timestamp = Number(

        order.orderId.split("-").pop()

    );

    if (Number.isFinite(timestamp)) {

        return timestamp;

    }

    const dateTimestamp = Date.parse(order.date);

    return Number.isFinite(dateTimestamp)
        ? dateTimestamp
        : 0;

}


// 8. Create order card

function createOrderCard(order) {

    const card = document.createElement("article");

    card.className = "order-card";


    // Order Header

    const header = document.createElement("div");

    header.className = "order-header";


    const title = document.createElement("h3");

    title.textContent = order.orderId;


    const status = document.createElement("span");

    status.className = "order-status";

    status.textContent = order.status || "Unknown";


    header.append(title, status);


    // Order Information

    const meta = document.createElement("div");

    meta.className = "order-meta";


    const date = document.createElement("p");

    date.textContent =
        "Date: " + (order.date || "Not available");


    const delivery = document.createElement("p");

    delivery.textContent =
        "Delivery: " + order.delivery;


    const itemCount = order.items.reduce((sum, item) => {

        return sum + item.quantity;

    }, 0);


    const itemsCount = document.createElement("p");

    itemsCount.textContent =
        "Total Items: " + itemCount;


    meta.append(date, delivery, itemsCount);


    // Total Price

    const total = document.createElement("p");

    total.className = "order-total";

    total.textContent =
        "Total: " + formatCurrency(order.total);


    // Action Buttons

    const actions = document.createElement("div");

    actions.className = "order-actions";


    const detailsButton = document.createElement("button");

    detailsButton.className = "details-button";

    detailsButton.textContent =
        expandedOrders.has(order.orderId)
            ? "Hide Details"
            : "View Details";

    detailsButton.dataset.action = "details";

    detailsButton.dataset.id = order.orderId;


    const deleteButton = document.createElement("button");

    deleteButton.className = "delete-button";

    deleteButton.textContent = "Delete Order";

    deleteButton.dataset.action = "delete";

    deleteButton.dataset.id = order.orderId;


    actions.append(detailsButton, deleteButton);


    // Add elements to card

    card.append(

        header,

        meta,

        total,

        actions

    );


    // Display product details when expanded

    if (expandedOrders.has(order.orderId)) {

        const details = document.createElement("div");

        details.className = "order-details";


        order.items.forEach(item => {

            const row = document.createElement("div");

            row.className = "detail-item";


            const name = document.createElement("p");

            name.textContent =
                `${item.name} × ${item.quantity}`;


            const price = document.createElement("strong");

            price.textContent = formatCurrency(

                item.price * item.quantity

            );


            row.append(name, price);

            details.appendChild(row);

        });


        card.appendChild(details);

    }


    return card;

}


// 9. Display orders

function renderOrders(orders) {

    ordersList.replaceChildren();


    resultsCount.textContent =
        `${orders.length} orders found`;


    if (orders.length === 0) {

        const message = document.createElement("p");

        message.className = "empty-message";

        message.textContent = "No orders found.";

        ordersList.appendChild(message);

        return;

    }


    orders.forEach(order => {

        const card = createOrderCard(order);

        ordersList.appendChild(card);

    });

}


// 10. Search, filter and sort orders

function filterOrders() {

    const searchValue =
        searchInput.value.trim().toLowerCase();

    const selectedDelivery =
        deliveryFilter.value;

    const selectedSort =
        sortFilter.value;


    let filteredOrders = allOrders.filter(order => {


        // Search by Order ID or Product Name

        const matchesSearch =

            order.orderId.toLowerCase().includes(searchValue) ||

            order.items.some(item => {

                return item.name
                    .toLowerCase()
                    .includes(searchValue);

            });


        // Filter by delivery method

        const matchesDelivery =

            selectedDelivery === "all" ||

            order.delivery === selectedDelivery;


        return matchesSearch && matchesDelivery;

    });


    // Sort orders

    if (selectedSort === "newest") {

        filteredOrders.sort((a, b) => {

            return getOrderTimestamp(b) -
                getOrderTimestamp(a);

        });

    }

    else if (selectedSort === "oldest") {

        filteredOrders.sort((a, b) => {

            return getOrderTimestamp(a) -
                getOrderTimestamp(b);

        });

    }

    else if (selectedSort === "high") {

        filteredOrders.sort((a, b) => {

            return b.total - a.total;

        });

    }

    else if (selectedSort === "low") {

        filteredOrders.sort((a, b) => {

            return a.total - b.total;

        });

    }


    renderOrders(filteredOrders);

}


// 11. Delete an order

function deleteOrder(orderId) {

    const confirmed = confirm(

        "Are you sure you want to delete this order?"

    );


    if (!confirmed) {

        return;

    }


    const updatedOrders = allOrders.filter(order => {

        return order.orderId !== orderId;

    });


    try {

        localStorage.setItem(

            "demoOrders",

            JSON.stringify(updatedOrders)

        );


        allOrders = updatedOrders;

        expandedOrders.delete(orderId);


        renderStatistics();

        filterOrders();


        statusMessage.textContent =
            "Order deleted successfully.";

    }

    catch (error) {

        statusMessage.textContent =
            "Could not delete the order.";

        console.error(error);

    }

}


// 12. Event delegation

ordersList.addEventListener("click", function(event) {


    const button = event.target.closest(

        "button[data-action]"

    );


    if (!button) {

        return;

    }


    const orderId = button.dataset.id;

    const action = button.dataset.action;


    if (action === "details") {


        if (expandedOrders.has(orderId)) {

            expandedOrders.delete(orderId);

        }

        else {

            expandedOrders.add(orderId);

        }


        filterOrders();

    }


    else if (action === "delete") {

        deleteOrder(orderId);

    }

});


// 13. Listen for search and filter

searchInput.addEventListener(

    "input",

    filterOrders

);


deliveryFilter.addEventListener(

    "change",

    filterOrders

);


sortFilter.addEventListener(

    "change",

    filterOrders

);


// 14. Start application

function startDashboard() {

    allOrders = loadOrders();

    renderStatistics();

    filterOrders();

}


startDashboard();