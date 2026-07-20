const editIndex = localStorage.getItem("editIndex");

const artistForm = document.getElementById("artistForm");

if (editIndex !== null) {
  const artworks = JSON.parse(localStorage.getItem("artistArtworks")) || [];

  const art = artworks[editIndex];

  if (art) {
    document.getElementById("artTitle").value = art.title;
    document.getElementById("artPrice").value = art.price.replace("₹", "");
    document.getElementById("artImage").value = art.image;
    document.getElementById("artDesc").value = art.description;
  }
}

artistForm.addEventListener("submit", function (event) {
  event.preventDefault();

  const title = document.getElementById("artTitle").value.trim();
  const price = "₹" + document.getElementById("artPrice").value.trim();
  const image = document.getElementById("artImage").value.trim();
  const description = document.getElementById("artDesc").value.trim();

  let artworks = JSON.parse(localStorage.getItem("artistArtworks")) || [];

  if (editIndex !== null) {
    artworks[editIndex] = {
      title,
      price,
      image,
      description,
      artist: "Demo Artist",
      category: "Painting",
    };

    localStorage.removeItem("editIndex");

        alert("Artwork Updated Successfully!");

    } else {

        artworks.push({
    title,
    price,
    image,
    description,
    artist: "Demo Artist",
    category: "Painting"
});

        alert("Artwork Uploaded Successfully!");

    }

    localStorage.setItem("artistArtworks", JSON.stringify(artworks));

    artistForm.reset();

    window.location.href = "my-artworks.html";

});