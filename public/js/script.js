(() => {
  'use strict';

  // Fetch all the forms we want to apply custom Bootstrap validation styles to
  const forms = document.querySelectorAll('.needs-validation');

  // Loop over them and prevent submission
  Array.from(forms).forEach(form => {
    form.addEventListener('submit', event => {
      if (!form.checkValidity()) {
        event.preventDefault();
        event.stopPropagation();
      }

      form.classList.add('was-validated');
    }, false);
  });
})();
function setupSearch(inputId, suggestionsId) {
  const input = document.getElementById(inputId);
  const box = document.getElementById(suggestionsId);
  if (!input || !box) return;

  input.addEventListener("input", async () => {
    const q = input.value.trim();
    if (q.length < 2) {
      box.style.display = "none";
      return;
    }

    const res = await fetch(`/api/search?q=${encodeURIComponent(q)}`);
    const results = await res.json();

    if (results.length === 0) {
      box.style.display = "none";
      return;
    }

    box.innerHTML = results.map(r => `
      <div class="suggestion-item" onclick="window.location='/listings/${r._id}'">
        <i class="fa-solid fa-location-dot"></i>
        <span><b>${r.title}</b> &mdash; ${r.location}, ${r.country}</span>
      </div>
    `).join("");
    box.style.display = "block";
  });

  // Hide suggestions when clicking outside
  document.addEventListener("click", (e) => {
    if (!input.contains(e.target) && !box.contains(e.target)) {
      box.style.display = "none";
    }
  });
}

setupSearch("desktopSearch", "desktopSuggestions");
setupSearch("mobileSearch", "mobileSuggestions");
// Auto dismiss flash messages after 3 seconds
setTimeout(() => {
  const alerts = document.querySelectorAll('.alert');
  alerts.forEach(alert => {
    alert.style.transition = 'opacity 0.5s ease';
    alert.style.opacity = '0';
    setTimeout(() => alert.remove(), 500);
  });
}, 3000);