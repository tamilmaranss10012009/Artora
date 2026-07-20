const user = JSON.parse(localStorage.getItem("user"));

const profile = document.getElementById("artistProfile");

profile.innerHTML = `
<h2>${user.name}</h2>
<p>${user.email}</p>
`;

const artworks = JSON.parse(localStorage.getItem("artistArtworks")) || [];

const container = document.getElementById("artistArtworks");

let html = "";

if (artworks.length === 0) {
  container.innerHTML = "<p>No artworks uploaded yet.</p>";
} else {
  artworks.forEach((art, index) => {
    html += `
<div class="art-card">

<img src="${art.image}" alt="${art.title}" class="art-image">

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
