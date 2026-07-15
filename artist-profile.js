const user = JSON.parse(localStorage.getItem("user"));

const profile = document.getElementById("artistProfile");

profile.innerHTML = `
<h2>${user.name}</h2>
<p>${user.email}</p>
`;

const artworks = JSON.parse(localStorage.getItem("artistArtworks")) || [];

const container = document.getElementById("artistArtworks");

artworks.forEach((art, index) => {

container.innerHTML += `
<div class="art-card">

<img src="${art.image}" width="200">

<h3>${art.title}</h3>

<p>${art.price}</p>

<a href="#" onclick="viewArtwork(${index}); return false;">
<button>View Details</button>
</a>

</div>
`;

});

function viewArtwork(index){

localStorage.setItem(
"selectedArtwork",
JSON.stringify(artworks[index])
);

window.location.href="dynamic-artwork.html";

}