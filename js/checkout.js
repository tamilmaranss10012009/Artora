const items = JSON.parse(localStorage.getItem("cartItems")) || [];

const summary = document.getElementById("summaryItems");

let total = 0;

if (items.length > 0) {
    summary.innerHTML = "";

    items.forEach(item => {

        const price = Number(item.price.replace(/[₹,]/g, ""));

        total += price * item.quantity;

        summary.innerHTML += `
            <p>
                ${item.title} × ${item.quantity}
                <br>
                ₹${(price * item.quantity).toLocaleString("en-IN")}
            </p>
            <br>
        `;
    });

    summary.innerHTML += `
        <h3>Total: ₹${total.toLocaleString("en-IN")}</h3>
    `;

} else {

    summary.innerHTML = "<p>No items in cart.</p>";

}

const form = document.getElementById("checkoutForm");

if (form) {

form.addEventListener("submit", function (event) {

    event.preventDefault();

    let orders = JSON.parse(localStorage.getItem("myOrders")) || [];

orders.push({
    date: new Date().toLocaleString(),
    items: items,
    total: total
});

localStorage.setItem("myOrders", JSON.stringify(orders));

localStorage.removeItem("cartItems");

window.location.href = "success.html";

});

}