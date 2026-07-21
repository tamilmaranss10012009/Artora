const ordersList = document.getElementById("ordersList");

function getStatusBadge(status) {
  const colors = {
    "Processing": "#ff9800",
    "Shipped": "#2196f3",
    "Out for Delivery": "#9c27b0",
    "Delivered": "#4caf50",
    "Cancelled": "#f44336"
  };
  return `<span style="background:${colors[status] || '#888'}; color:white; padding:4px 12px; border-radius:20px; font-size:13px; font-weight:bold;">${status}</span>`;
}

function renderOrders() {
  const currentOrders = JSON.parse(localStorage.getItem("myOrders")) || [];

  if (currentOrders.length === 0) {
    ordersList.innerHTML = "<div class='empty-state'><h2>📦 No Orders Yet</h2><p>Your orders will appear here after you checkout.</p></div>";
    return;
  }

  ordersList.innerHTML = "";

  currentOrders.forEach(function (order, index) {
    const isCancelled = order.status === "Cancelled";
    const isDelivered = order.status === "Delivered";

    let html = `
      <div class="order-card ${isCancelled ? 'cancelled' : ''}" style="background:var(--card-bg); border:1px solid var(--border-color); border-radius:16px; padding:24px; margin-bottom:20px; box-shadow:var(--shadow);">
        <div style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:10px; margin-bottom:15px;">
          <div>
            <h3 style="margin:0; font-size:18px;">Order #${order.orderId || (index + 1)}</h3>
            <small style="color:#888;">${order.date}</small>
          </div>
          <div>
            ${getStatusBadge(order.status)}
          </div>
        </div>
        <hr style="border:none; border-top:1px solid var(--border-color); margin:10px 0;">
    `;

    order.items.forEach(function (item) {
      const price = Number(String(item.price).replace(/[₹,]/g, ""));

      html += `
        <div style="display:flex; justify-content:space-between; align-items:center; padding:8px 0; flex-wrap:wrap; gap:10px;">
          <div>
            <strong>${item.title}</strong>
            <span style="color:#888; font-size:14px;"> × ${item.quantity}</span>
          </div>
          <span style="font-weight:bold;">₹${(price * item.quantity).toLocaleString("en-IN")}</span>
        </div>
      `;
    });

    html += `
        <hr style="border:none; border-top:1px solid var(--border-color); margin:10px 0;">
        <div style="display:flex; justify-content:space-between; align-items:center; font-size:18px; font-weight:bold; color:var(--primary-color);">
          <span>Total</span>
          <span>₹${order.total.toLocaleString ? order.total.toLocaleString("en-IN") : Number(order.total).toLocaleString("en-IN")}</span>
        </div>
        <div style="margin-top:15px; display:flex; gap:10px; flex-wrap:wrap;">
    `;

    if (!isCancelled && !isDelivered) {
      html += `<button onclick="cancelOrder(${index})" class="order-btn cancel-btn" style="background:#f44336;">❌ Cancel Order</button>`;
      html += `<button onclick="trackOrder(${index})" class="order-btn track-btn" style="background:#2196f3;">📍 Track Order</button>`;
    }

    if (isDelivered || isCancelled) {
      html += `<button onclick="deleteOrder(${index})" class="order-btn delete-btn" style="background:#888;">🗑 Delete Order</button>`;
    }

    html += `</div></div>`;
    ordersList.innerHTML += html;
  });
}

window.cancelOrder = function (index) {
  if (!confirm("Are you sure you want to cancel this order?")) return;
  const currentOrders = JSON.parse(localStorage.getItem("myOrders")) || [];
  if (currentOrders[index]) {
    currentOrders[index].status = "Cancelled";
    localStorage.setItem("myOrders", JSON.stringify(currentOrders));
    showToast("Order Cancelled ❌", "info");
    renderOrders();
  }
};

window.trackOrder = function (index) {
  const currentOrders = JSON.parse(localStorage.getItem("myOrders")) || [];
  const order = currentOrders[index];
  if (!order) return;

  const statuses = ["Processing", "Shipped", "Out for Delivery", "Delivered"];
  const currentIdx = statuses.indexOf(order.status);

  let trackHtml = `<div style="padding:15px;">
    <h3 style="margin-bottom:15px;">📍 Track Order #${order.orderId || (index + 1)}</h3>
    <div style="display:flex; flex-direction:column; gap:12px;">`;

  statuses.forEach((s, i) => {
    const isActive = i <= currentIdx;
    const isCurrent = i === currentIdx;
    trackHtml += `
      <div style="display:flex; align-items:center; gap:12px;">
        <div style="width:32px; height:32px; border-radius:50%; background:${isActive ? '#4caf50' : '#ddd'}; display:flex; align-items:center; justify-content:center; color:white; font-weight:bold; font-size:14px;">
          ${isActive ? '✓' : (i + 1)}
        </div>
        <div>
          <strong style="color:${isCurrent ? 'var(--primary-color)' : (isActive ? '#333' : '#aaa')};">${s}</strong>
          ${isCurrent ? '<br><small style="color:#888;">Current Status</small>' : ''}
        </div>
      </div>
      ${i < statuses.length - 1 ? '<div style="width:2px; height:20px; background:#ddd; margin-left:15px;"></div>' : ''}
    `;
  });

  trackHtml += `</div></div>`;

  // Show tracking modal
  const modal = document.createElement("div");
  modal.style.cssText = "position:fixed; top:0; left:0; right:0; bottom:0; background:rgba(0,0,0,0.5); display:flex; align-items:center; justify-content:center; z-index:1000;";
  modal.innerHTML = `
    <div style="background:var(--card-bg); border-radius:16px; padding:30px; max-width:450px; width:90%; box-shadow:0 20px 60px rgba(0,0,0,0.3);">
      ${trackHtml}
      <button onclick="this.closest('div[style]').remove()" style="margin-top:20px; width:100%; padding:12px; background:var(--primary-color); color:white; border:none; border-radius:10px; cursor:pointer; font-size:16px;">Close</button>
    </div>
  `;
  document.body.appendChild(modal);
};

window.deleteOrder = function (index) {
  if (!confirm("Delete this order permanently?")) return;
  let currentOrders = JSON.parse(localStorage.getItem("myOrders")) || [];
  currentOrders.splice(index, 1);
  localStorage.setItem("myOrders", JSON.stringify(currentOrders));
  showToast("Order Deleted 🗑", "info");
  renderOrders();
};

renderOrders();
