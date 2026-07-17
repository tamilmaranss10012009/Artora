const artworks = {
  1: {
    title: "Sunset Painting",
    price: "₹2,499",
    image: "../images/sunset.jpg",
    desc: "Beautiful sunset painting perfect for home decoration.",
  },

  2: {
    title: "Bear Painting",
    price: "₹2,500",
    image: "../images/bear.jpg",
    desc: "Beautiful handmade bear painting created using premium acrylic colors.",
  },

  3: {
    title: "Bull Painting",
    price: "₹1,200",
    image: "../images/bull.jpg",
    desc: "Beautiful handmade bull painting created using premium acrylic colors.",
  },

  4: {
    title: "Tiger Painting",
    price: "₹3,000",
    image: "../images/tiger.jpg",
    desc: "Beautiful handmade tiger painting created using premium acrylic colors.",
  },
};

const params = new URLSearchParams(window.location.search);
const id = params.get("id");
if (!artworks[id]) {
  alert("Artwork not found!");
  window.location.href = "../index.html";
} else {
  //Display artwork
  document.getElementById("artTitle").innerText = artworks[id].title;
  document.getElementById("artPrice").innerText = artworks[id].price;
  document.getElementById("artImage").src = artworks[id].image;
  document.getElementById("artDesc").innerText = artworks[id].desc;
  document.getElementById("buyLink").href = "checkout.html?id=" + id;
}

document.getElementById("cartBtn").addEventListener("click", function () {
  // Add to cart logic
  let cart = JSON.parse(localStorage.getItem("cartItems")) || [];

  const existingItem = cart.find((item) => item.title === artworks[id].title);

  if (existingItem) {
    existingItem.quantity++;
  } else {
    cart.push({
      ...artworks[id],
      quantity: 1,
    });
  }

  localStorage.setItem("cartItems", JSON.stringify(cart));

  alert("✅ Added to Cart");

  window.location.href = "cart.html";
});
