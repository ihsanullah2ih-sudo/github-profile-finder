// 1. Select HTML elements

const checkoutForm = document.getElementById("checkoutForm");

const fullNameInput = document.getElementById("fullName");

const emailInput = document.getElementById("email");

const phoneInput = document.getElementById("phone");

const addressInput = document.getElementById("address");

const cityInput = document.getElementById("city");

const deliveryInput = document.getElementById("delivery");

const orderItems = document.getElementById("orderItems");

const orderTotal = document.getElementById("orderTotal");

const statusMessage = document.getElementById("statusMessage");

const placeOrderButton = document.getElementById("placeOrderButton");


// 2. Store cart products

let checkoutProducts = [];


// 3. Read shopping cart

function getSavedCart() {

    try {

        const savedCart = localStorage.getItem("shoppingCart");

        const cart = savedCart
            ? JSON.parse(savedCart)
            : [];

        if (!Array.isArray(cart)) {
            return [];
        }

        return cart.filter(item => {

            return item &&
                Number.isInteger(item.id) &&
                Number.isInteger(item.quantity) &&
                item.quantity > 0;

        });

    } catch (error) {

        console.error("Cart Error:", error);

        return [];

    }

}


// 4. Load products

async function loadCheckout() {

    try {

        const response = await fetch("products.json");

        if (!response.ok) {

            throw new Error("Could not load products");

        }

        const products = await response.json();

        const cart = getSavedCart();


        checkoutProducts = cart.map(cartItem => {

            const product = products.find(item => {

                return item.id === cartItem.id;

            });

            if (!product) {
                return null;
            }

            return {

                id: product.id,

                name: product.name,

                price: product.price,

                quantity: cartItem.quantity

            };

        }).filter(item => item !== null);


        renderOrderSummary();

    } catch (error) {

        statusMessage.textContent =
            "Error: " + error.message;

        statusMessage.className = "error-message";

        placeOrderButton.disabled = true;

        console.error(error);

    }

}


// 5. Display order summary

function renderOrderSummary() {

    orderItems.replaceChildren();

    if (checkoutProducts.length === 0) {

        const message = document.createElement("p");

        message.className = "empty-message";

        message.textContent = "Your shopping cart is empty.";

        orderItems.appendChild(message);

        orderTotal.textContent = "$0.00";

        placeOrderButton.disabled = true;

        return;

    }

    placeOrderButton.disabled = false;


    checkoutProducts.forEach(product => {

        const item = document.createElement("div");

        item.className = "order-item";


        const info = document.createElement("div");

        const name = document.createElement("h4");

        name.textContent = product.name;


        const quantity = document.createElement("p");

        quantity.textContent =
            `Quantity: ${product.quantity}`;


        info.append(name, quantity);


        const price = document.createElement("strong");

        price.textContent =
            "$" + (product.price * product.quantity).toFixed(2);


        item.append(info, price);

        orderItems.appendChild(item);

    });


    const total = checkoutProducts.reduce((sum, product) => {

        return sum + product.price * product.quantity;

    }, 0);


    orderTotal.textContent = "$" + total.toFixed(2);

}


// 6. Display validation errors

function showError(field, message) {

    const errorElement = document.getElementById(field + "Error");

    errorElement.textContent = message;

}


// 7. Clear validation errors

function clearErrors() {

    const errorElements = document.querySelectorAll(".form-group small");

    errorElements.forEach(element => {

        element.textContent = "";

    });

}


// 8. Validate form

function validateForm() {

    clearErrors();

    let isValid = true;


    // Validate full name

    const fullName = fullNameInput.value.trim();

    if (fullName.length < 3) {

        showError(
            "fullName",
            "Name must contain at least 3 characters."
        );

        isValid = false;

    }


    // Validate email

    const email = emailInput.value.trim();

    if (email === "" || !emailInput.checkValidity()) {

        showError(
            "email",
            "Please enter a valid email address."
        );

        isValid = false;

    }


    // Validate phone

    const phone = phoneInput.value.trim();

    const phoneDigits = phone.replace(/\D/g, "");

    if (phoneDigits.length < 7 || phoneDigits.length > 15) {

        showError(
            "phone",
            "Phone number must contain 7 to 15 digits."
        );

        isValid = false;

    }


    // Validate address

    const address = addressInput.value.trim();

    if (address.length < 8) {

        showError(
            "address",
            "Address must contain at least 8 characters."
        );

        isValid = false;

    }


    // Validate city

    const city = cityInput.value.trim();

    if (city === "") {

        showError(
            "city",
            "Please enter your city."
        );

        isValid = false;

    }


    // Validate delivery method

    if (deliveryInput.value === "") {

        showError(
            "delivery",
            "Please select a delivery method."
        );

        isValid = false;

    }


    return isValid;

}


// 9. Save order

function saveOrder(order) {

    try {

        const savedOrders = localStorage.getItem("demoOrders");

        const orders = savedOrders
            ? JSON.parse(savedOrders)
            : [];

        if (!Array.isArray(orders)) {

            throw new Error("Invalid saved orders data");

        }

        orders.push(order);

        localStorage.setItem(
            "demoOrders",
            JSON.stringify(orders)
        );

        return true;

    } catch (error) {

        console.error("Order Saving Error:", error);

        return false;

    }

}


// 10. Submit checkout form

checkoutForm.addEventListener("submit", function(event) {

    event.preventDefault();


    if (checkoutProducts.length === 0) {

        statusMessage.textContent =
            "Your shopping cart is empty.";

        statusMessage.className = "error-message";

        return;

    }


    if (!validateForm()) {

        statusMessage.textContent =
            "Please correct the form errors.";

        statusMessage.className = "error-message";

        return;

    }


    // Calculate total price

    const total = checkoutProducts.reduce((sum, product) => {

        return sum + product.price * product.quantity;

    }, 0);


    // Create order

    const order = {

        orderId: "ORD-" + Date.now(),

        date: new Date().toLocaleString(),

        items: checkoutProducts.map(product => {

            return {

                id: product.id,

                name: product.name,

                price: product.price,

                quantity: product.quantity

            };

        }),

        total: total,

        delivery: deliveryInput.value,

        status: "Demo Order"

    };


    // Save order

    const saved = saveOrder(order);

    if (!saved) {

        statusMessage.textContent =
            "Could not save your order.";

        statusMessage.className = "error-message";

        return;

    }


    // Clear shopping cart

    localStorage.setItem("shoppingCart", JSON.stringify([]));


    // Clear current products

    checkoutProducts = [];

    renderOrderSummary();


    // Reset form

    checkoutForm.reset();

    clearErrors();


    // Show success message

    statusMessage.textContent =
        `Your demo order was placed successfully! Order ID: ${order.orderId}`;

    statusMessage.className = "success";

});


// 11. Clear individual error when typing

checkoutForm.addEventListener("input", function(event) {

    const field = event.target;

    const errorElement = document.getElementById(
        field.id + "Error"
    );

    if (errorElement) {

        errorElement.textContent = "";

    }

});


// 12. Start application

loadCheckout();