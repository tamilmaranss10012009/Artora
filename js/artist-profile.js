// Protected page: require login
if (!requireAuth()) {
  throw new Error("Not authenticated");
}

const user = getCurrentUser();

const profile = document.getElementById("artistProfile");

if (user) {
  profile.innerHTML = `
<h2>${user.name}</h2>
<p>${user.email}</p>
`;
} else {
  profile.innerHTML = "<h2>User not found</h2>";
}

const artworks = getStorage("artistArtworks", []);

const container = document.getElementById("artistArtworks");

let html = "";

if (artworks.length === 0) {
  container.innerHTML = "<p>No artworks uploaded yet.</p>";
} else {
  artworks.forEach((art, index) => {
    const imgPath = normalizeImagePath(art.image);
    html += `
<div class="art-card">

<img src="${imgPath}" alt="${art.title}" class="art-image">

<h3>${art.title}</h3>

<p>${art.price}</p>

<button onclick="viewArtwork(${index})">
View Details
</button>

</div>
`;
  });
  container.innerHTML = html;
}
function viewArtwork(index) {
  localStorage.setItem("selectedArtwork", JSON.stringify(artworks[index]));
  window.location.href = "dynamic-artwork.html";
}
