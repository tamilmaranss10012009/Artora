const orders = JSON.parse(localStorage.getItem("myOrders")) || [];

const ordersList = document.getElementById("ordersList");

if (orders.length > 0) {

    ordersList.innerHTML = "";

    orders.forEach(function(order, index) {

        let total = 0;

        let html = `
            <div class="order-card">
                <h2>Order #${index + 1}</h2>
<p>${order.date}</p>
                <hr><br>
        `;

        order.items.forEach(function(item) {

            const price = Number(item.price.replace(/[₹,]/g, ""));

            total += price * item.quantity;

            html += `
                <p>
                    <strong>${item.title}</strong><br>
                    Qty: ${item.quantity}<br>
                    ₹${(price * item.quantity).toLocaleString("en-IN")}
                </p>
                <br>
            `;
        });

        html += `
            <h3>Total: ₹${order.total.toLocaleString("en-IN")}</h3>
            </div>
            <br>
        `;

        ordersList.innerHTML += html;

    });

} else {

    ordersList.innerHTML = "<h2>No Orders Yet</h2>";

}