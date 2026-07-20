const artworks = JSON.parse(localStorage.getItem("artistArtworks")) || [];

const container = document.getElementById("myArtworks");

if (artworks.length === 0) {
  container.innerHTML = "<h2>No Artworks Uploaded Yet</h2>";
} else {
  artworks.forEach((art, index) => {
    container.innerHTML += `
            <div class="art-card">

                <img src="${art.image}" width="200">

                <h3>${art.title}</h3>

                <p>${art.price}</p>

                <button onclick="viewArtwork(${index})">
                    👁 View
                </button>

                <button onclick="editArtwork(${index})">
                    ✏ Edit
                </button>

                <button onclick="deleteArtwork(${index})">
                    🗑 Delete
                </button>

                <br><br>

            </div>
        `;
  });
}

function viewArtwork(index) {
  localStorage.setItem("selectedArtwork", JSON.stringify(artworks[index]));

  window.location.href = "pages/dynamic-artwork.html";
}

function editArtwork(index) {
  localStorage.setItem("editIndex", index);

  window.location.href = "pages/artist.html";
}

function deleteArtwork(index) {
  if (confirm("Delete this artwork?")) {
    artworks.splice(index, 1);

    localStorage.setItem("artistArtworks", JSON.stringify(artworks));

    location.reload();
  }
}
