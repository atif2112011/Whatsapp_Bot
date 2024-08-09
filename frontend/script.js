document.addEventListener("DOMContentLoaded", function () {
  const statusButton = document.getElementById("statusButton");
  const refreshButton = document.getElementById("refreshButton");
  const qrImage = document.getElementById("qrImage");

  function updateStatus() {
    fetch("/bot-status")
      .then((response) => response.json())
      .then((data) => {
        if (data.status === "connected") {
          statusButton.textContent = "Connected";
          statusButton.classList.add("green");
          statusButton.classList.remove("red");
          qrImage.setAttribute("hidden", "hidden");
          qrImage.src = ""; // Clear QR code
        } else {
          statusButton.textContent = "Disconnected";
          statusButton.classList.add("red");
          statusButton.classList.remove("green");
          qrImage.removeAttribute("hidden");
          fetch("/get-qr")
            .then((response) => response.json())
            .then((data) => {
              if (data.qr) {
                qrImage.src = data.qr; // Set the QR code image source
              }
            })
            .catch((error) => console.error("Error fetching QR:", error));
        }
      })
      .catch((error) => {
        console.error("Error checking status:", error);
        statusButton.textContent = "Error";
        statusButton.classList.add("red");
        statusButton.classList.remove("green");
      });
  }

  // Initial status check
  updateStatus();

  // Refresh status on button click
  refreshButton.addEventListener("click", updateStatus);
});
