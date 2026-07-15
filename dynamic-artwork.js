const artwork = JSON.parse(localStorage.getItem("selectedArtwork"));

const details = document.getElementById("artworkDetails");

if (artwork) {

    details.innerHTML = `
        <img src="${artwork.image}" class="cart-image">

        <h1>${artwork.title}</h1>

        <h2>${artwork.price}</h2>

        <p>${artwork.desc || artwork.description || ""}</p>

        <p><strong>Artist:</strong> ${artwork.artist || "Unknown Artist"}</p>

        <p><strong>Category:</strong> ${artwork.category || "Painting"}</p>

        <br>

        <button id="wishlistBtn">❤️ Add to Wishlist</button>

        <button id="addCartBtn">🛒 Add to Cart</button>

        <button id="buyNowBtn">⚡ Buy Now</button>
    `;

    // ---------- Wishlist ----------

    document.getElementById("wishlistBtn").addEventListener("click", function () {

        let wishlist = JSON.parse(localStorage.getItem("wishlist")) || [];

        const exists = wishlist.find(item => item.title === artwork.title);

        if (!exists) {

            wishlist.push(artwork);

            localStorage.setItem("wishlist", JSON.stringify(wishlist));

            alert("Added to Wishlist ❤️");

        } else {

            alert("Already in Wishlist ❤️");

        }

    });

    // ---------- Cart ----------

    document.getElementById("addCartBtn").addEventListener("click", function () {

        let cart = JSON.parse(localStorage.getItem("cartItems")) || [];

        const existing = cart.find(item => item.title === artwork.title);

        if (existing) {

            existing.quantity++;

        } else {

            cart.push({
                title: artwork.title,
                price: artwork.price,
                image: artwork.image,
                quantity: 1
            });

        }

        localStorage.setItem("cartItems", JSON.stringify(cart));

        alert("Added to Cart!");

        window.location.href = "cart.html";

    });

    // ---------- Buy Now ----------

    document.getElementById("buyNowBtn").addEventListener("click", function () {

        localStorage.setItem("cartItems", JSON.stringify([
            {
                title: artwork.title,
                price: artwork.price,
                image: artwork.image,
                quantity: 1
            }
        ]));

        window.location.href = "checkout.html";

    });

} else {

    details.innerHTML = `
<h2>Artwork Not Found</h2>

<a href="index.html" class="buy-btn">
⬅ Back to Home
</a>
`;

}

// ---------- Reviews ----------

const reviewsList = document.getElementById("reviewsList");
const submitReview = document.getElementById("submitReview");

if (artwork && submitReview && reviewsList) {

    let reviews = JSON.parse(localStorage.getItem("reviews")) || {};

    if (!reviews[artwork.title]) {
        reviews[artwork.title] = [];
    }

    function loadReviews() {

        reviewsList.innerHTML = "";

        reviews[artwork.title].forEach(function (review) {

            reviewsList.innerHTML += `
                <div class="art-card">

                    <h3>${"⭐".repeat(review.rating)}</h3>

                    <p>${review.text}</p>

                </div>
            `;

        });

    }

    loadReviews();

    submitReview.addEventListener("click", function () {

        const text = document.getElementById("reviewText").value.trim();

        const rating = Number(document.getElementById("rating").value);

        if (text === "") {

            alert("Write a review first!");

            return;

        }

        reviews[artwork.title].push({

            rating: rating,

            text: text

        });

        localStorage.setItem("reviews", JSON.stringify(reviews));

        document.getElementById("reviewText").value = "";

        loadReviews();

        alert("Review Submitted Successfully ⭐");

    });

}