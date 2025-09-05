// --- Upload Page Logic ---
function handleUploadForm() {
  const form = document.getElementById("uploadForm");
  if (!form) return;

  form.onsubmit = function (e) {
    e.preventDefault();
    let file = document.getElementById("fileInput").files[0];
    if (file) {
      // Store file temporarily in localStorage (for demo)
      const reader = new FileReader();
      reader.onload = function (event) {
        localStorage.setItem("uploadedImage", event.target.result);
        window.location.href = "result.html";
      };
      reader.readAsDataURL(file);
    } else {
      alert("⚠ Please select an image first.");
    }
  };
}

// --- Result Page Logic ---
function handleResultPage() {
  const preview = document.getElementById("preview");
  const output = document.getElementById("output");
  if (!preview || !output) return;

  const imgData = localStorage.getItem("uploadedImage");

  if (imgData) {
    preview.src = imgData;
    output.innerHTML = `
      <strong>Possible Disease:</strong> Early Blight 🍂 <br>
      <strong>Remedy:</strong> Use fungicide and remove infected leaves.
    `;
  } else {
    output.innerText = "⚠ No image uploaded. Please go back.";
  }
}

// Run correct function depending on page
window.onload = function () {
  handleUploadForm();
  handleResultPage();
};
