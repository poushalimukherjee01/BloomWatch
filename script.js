// ==========================
// Load simulated NDVI data
// ==========================
let ndviData = null;
fetch("ndvi_data.json")
    .then(res => res.json())
    .then(data => {
        ndviData = data;
        console.log("NDVI data loaded:", ndviData);
    })
    .catch(err => console.error("Error loading NDVI data:", err));

// ==========================
// Initialize Leaflet map
// ==========================
const map = L.map("map").setView([20.5937, 78.9629], 4);

L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    attribution: '&copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors'
}).addTo(map);

// ==========================
// Bloom prediction function
// ==========================
function simulateBloom(ndviSeries) {
    const threshold = 0.65; // NDVI threshold for bloom
    const bloomStep = ndviSeries.findIndex(val => val > threshold);
    if (bloomStep === -1) return "🍂 No bloom predicted";
    return `🌸 Bloom predicted in ${bloomStep + 1} steps`;
}

// ==========================
// Initialize Chart.js
// ==========================
const ctx = document.getElementById("bloomChart").getContext("2d");
const bloomChart = new Chart(ctx, {
    type: "line",
    data: {
        labels: ["Step 1", "Step 2", "Step 3", "Step 4", "Step 5", "Step 6", "Step 7", "Step 8"],
        datasets: [{
            label: "NDVI Trend",
            data: [0, 0, 0, 0, 0, 0, 0, 0],
            borderColor: "#2e8b57",
            backgroundColor: "rgba(72,255,156,0.3)",
            fill: true,
            tension: 0.3
        }]
    },
    options: {
        responsive: true,
        plugins: {
            legend: { display: true }
        },
        scales: {
            y: { beginAtZero: true, max: 1 }
        }
    }
});

// ==========================
// Map click event
// ==========================
map.on("click", e => {
    if (!ndviData) {
        alert("NDVI data not loaded yet!");
        return;
    }

    // Find nearest simulated location
    let nearest = ndviData.locations[0];
    let minDist = Math.hypot(e.latlng.lat - nearest.lat, e.latlng.lng - nearest.lon);

    ndviData.locations.forEach(loc => {
        const dist = Math.hypot(e.latlng.lat - loc.lat, e.latlng.lng - loc.lon);
        if (dist < minDist) {
            nearest = loc;
            minDist = dist;
        }
    });

    console.log("Click at:", e.latlng, "→ Nearest location:", nearest);

    // Get bloom prediction
    const bloom = simulateBloom(nearest.ndvi_series);
    console.log("Bloom result:", bloom);

    // Show Leaflet popup
    L.popup()
        .setLatLng(e.latlng)
        .setContent(`<b>${bloom}</b><br>Lat: ${nearest.lat}, Lon: ${nearest.lon}`)
        .openOn(map);

    // Update prediction panel
    const predEl = document.getElementById("predictionText");
    if (predEl) {
        predEl.innerHTML = `Predicted Bloom Index at (${nearest.lat}, ${nearest.lon}): <b>${bloom}</b>`;
    }

    // Update Chart.js with NDVI series
    bloomChart.data.datasets[0].data = nearest.ndvi_series;
    bloomChart.update();
});

// ==========================
// Smooth scroll for "Start Demo" button
// ==========================
const startBtn = document.getElementById("startDemo");
if (startBtn) {
    startBtn.addEventListener("click", () => {
        document.getElementById("mapSection").scrollIntoView({ behavior: "smooth" });
    });
}




