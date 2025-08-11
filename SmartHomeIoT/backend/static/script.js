let lightOn = false;

// Speech Recognition Setup
const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
let recognition = null;

if (SpeechRecognition) {
  console.log("SpeechRecognition supported");
  recognition = new SpeechRecognition();
  recognition.continuous = false;
  recognition.lang = 'en-US';
  recognition.interimResults = false;

  recognition.onresult = function(event) {
    const transcript = event.results[0][0].transcript.toLowerCase();
    document.getElementById("voice-status").innerText = `Heard: ${transcript}`;
    console.log("Voice command:", transcript);
    processVoiceCommand(transcript);
  };

  recognition.onerror = function(event) {
    document.getElementById("voice-status").innerText = `Error: ${event.error}`;
    console.error("SpeechRecognition error:", event.error);
  };

  recognition.onend = function() {
    document.getElementById("voice-status").innerText = "Say a command (e.g., 'light on')";
    console.log("SpeechRecognition ended");
  };
} else {
  console.error("SpeechRecognition not supported in this browser");
}

function startVoiceControl() {
  if (recognition) {
    // Check microphone permission
    navigator.permissions.query({ name: 'microphone' }).then((result) => {
      if (result.state === 'granted') {
        try {
          recognition.start();
          document.getElementById("voice-status").innerText = "Listening...";
          console.log("SpeechRecognition started");
        } catch (error) {
          document.getElementById("voice-status").innerText = "Error starting recognition";
          console.error("Error starting SpeechRecognition:", error);
        }
      } else if (result.state === 'prompt') {
        document.getElementById("voice-status").innerText = "Please allow microphone access";
        console.log("Microphone permission not granted, prompting user");
        recognition.start(); // This will trigger permission prompt
      } else {
        document.getElementById("voice-status").innerText = "Microphone access denied";
        console.error("Microphone permission denied");
      }
    }).catch((error) => {
      document.getElementById("voice-status").innerText = "Error checking permissions";
      console.error("Permission query error:", error);
    });
  } else {
    document.getElementById("voice-status").innerText = "Voice recognition not supported";
    console.error("No SpeechRecognition instance");
  }
}

function processVoiceCommand(command) {
  fetch("/voice_command", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ command: command })
  })
    .then((res) => res.json())
    .then((data) => {
      document.getElementById("voice-status").innerText = data.message;
      console.log("Server response:", data);
      if (data.action === "toggle_light") {
        document.getElementById("light-status").innerText = `Light is ${data.status.toUpperCase()}`;
      } else if (data.action === "set_fan_speed") {
        document.getElementById("fan-status").innerText = `Fan speed: ${data.speed}`;
      } else if (data.action === "unlock_door") {
        document.getElementById("lock-status").innerText = data.status === "success" ? "✅ Door Unlocked" : "❌ Incorrect Password";
      }
    })
    .catch((error) => {
      document.getElementById("voice-status").innerText = "Error contacting server";
      console.error("Fetch error:", error);
    });
}

// Toggle Light
function toggleLight() {
  fetch("/toggle_light", {
    method: "POST",
  })
    .then((response) => response.json())
    .then((data) => {
      const lightStatus = document.getElementById("light-status");
      lightStatus.textContent = `Light is ${data.status.toUpperCase()}`;
      lightOn = data.status === "on";
    });
}

// Set Fan Speed
function setFanSpeed(speed) {
  fetch("/set_fan_speed", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ speed: parseInt(speed) })
  })
    .then((response) => response.json())
    .then((data) => {
      const fanStatus = document.getElementById("fan-status");
      fanStatus.textContent = `Fan speed: ${speed}`;
    });
}

// Check Temperature
function checkTemperature() {
  const temp = document.getElementById("tempInput").value;
  fetch("/check_temperature", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ temperature: parseFloat(temp) })
  })
    .then((response) => response.json())
    .then((data) => {
      const tempMessage = document.getElementById("temp-message");
      tempMessage.textContent = data.message;
    });
}

function detectGas() {
  const leak = Math.random() < 0.5; // Simulate leak or not
  fetch("/detect_gas", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ leak: leak })
  })
    .then((response) => response.json())
    .then((data) => {
      document.getElementById("gas-status").innerText =
        leak ? "⚠️ Gas Leak Detected!" : "All clear";
      console.log(data.status);
    });
}

function unlockDoor() {
  const password = document.getElementById("doorPassword").value;
  fetch("/unlock_door", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ password: password })
  })
    .then((response) => response.json())
    .then((data) => {
      const statusElement = document.getElementById("lock-status");
      statusElement.textContent =
        data.status === "success" ? "✅ Door Unlocked" : "❌ Incorrect Password";
    });
}

function checkSoil() {
  const dry = Math.random() < 0.5;
  fetch("/check_soil", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ dry: dry })
  })
    .then((res) => res.json())
    .then((data) => {
      document.getElementById("plant-status").innerText = data.message;
    });
}

let curtainOpen = false;

function toggleCurtain() {
  curtainOpen = !curtainOpen;
  fetch("/toggle_curtain", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ open: curtainOpen })
  })
    .then((res) => res.json())
    .then((data) => {
      document.getElementById("curtain-status").innerText = data.message;
    });
}

function ringBell() {
  fetch("/ring_bell", {
    method: "POST",
  })
    .then((res) => res.json())
    .then((data) => {
      document.getElementById("bell-status").innerText = data.message;
      setTimeout(() => {
        document.getElementById("bell-status").innerText = "No visitor";
      }, 3000);
    });
}

function approachDoor() {
  fetch("/approach_door", {
    method: "POST",
  })
    .then((res) => res.json())
    .then((data) => {
      document.getElementById("auto-door-status").innerText = data.message;
      setTimeout(() => {
        document.getElementById("auto-door-status").innerText = "No one nearby";
      }, 4000);
    });
}

function detectIntruder() {
  const intruder = Math.random() < 0.3;
  fetch("/detect_intruder", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ intruder: intruder })
  })
    .then((res) => res.json())
    .then((data) => {
      document.getElementById("intruder-status").innerText = data.message;
    });
}

function detectMotion() {
  fetch("/motion_light", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ motion: true })
  })
    .then((res) => res.json())
    .then((data) => {
      document.getElementById("motion-light-status").innerText = `Motion detected! Light ${data.status}`;
      setTimeout(() => {
        document.getElementById("motion-light-status").innerText = "Light is OFF";
      }, 3000);
    });
}

function updateDimmer(value) {
  document.getElementById("dimmer-status").innerText = `Brightness: ${value}%`;
  fetch("/set_dimmer", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ brightness: parseInt(value) })
  });
}

function detectSmoke() {
  const detected = Math.random() < 0.5;
  fetch("/detect_smoke", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ smoke: detected })
  })
    .then((res) => res.json())
    .then((data) => {
      document.getElementById("smoke-status").innerText = data.message;
    });
}

function setSchedule() {
  const onTime = document.getElementById("onTime").value;
  const offTime = document.getElementById("offTime").value;
  if (!onTime || !offTime) {
    document.getElementById("schedule-status").innerText = "Please select both times!";
    return;
  }
  fetch("/set_schedule", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ on: onTime, off: offTime })
  })
    .then((res) => res.json())
    .then((data) => {
      document.getElementById("schedule-status").innerText = data.message;
    });
}

function checkDaylight(isDark) {
  fetch("/daylight", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ dark: isDark })
  })
    .then((res) => res.json())
    .then((data) => {
      document.getElementById("daylight-status").innerText = `Light ${data.status}`;
    });
}

function roomOccupied(status) {
  fetch("/room_occupancy", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ occupied: status })
  })
    .then((res) => res.json())
    .then((data) => {
      document.getElementById("room-status").innerText = data.message;
    });
}

function speakFeedback(text) {
  fetch("/voice_feedback", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ text: text })
  });
  const msg = new SpeechSynthesisUtterance(text);
  window.speechSynthesis.speak(msg);
}

function checkWaterLevel(value) {
  fetch("/water_level", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ level: parseInt(value) })
  })
    .then((res) => res.json())
    .then((data) => {
      document.getElementById("water-status").innerText = data.message;
    });
}

function setInverter(status) {
  fetch("/inverter", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ status: status })
  })
    .then((res) => res.json())
    .then((data) => {
      document.getElementById("inverter-status").innerText = data.message;
    });
}

function showEnergyUsage() {
  fetch("/energy_usage")
    .then((res) => res.json())
    .then((data) => {
      document.getElementById("energy-status").innerText = `Usage: ${data.usage} Watts`;
    });
}

function facialRecognition() {
  fetch("/facial_recognition", {
    method: "POST",
  })
    .then((res) => res.json())
    .then((data) => {
      document.getElementById("face-status").innerText = data.status;
    });
}

function fireAlert() {
  fetch("/fire_alert", {
    method: "POST",
  })
    .then((res) => res.json())
    .then((data) => {
      document.getElementById("fire-status").innerText = data.message;
    });
}

function detectRain() {
  fetch("/detect_rain", {
    method: "POST",
  })
    .then((res) => res.json())
    .then((data) => {
      document.getElementById("rain-status").innerText = data.message;
    });
}

function feedPet() {
  fetch("/feed_pet", {
    method: "POST",
  })
    .then((res) => res.json())
    .then((data) => {
      document.getElementById("pet-status").innerText = data.message;
    });
}

function checkInverterStatus() {
  const battery = parseInt(document.getElementById("batteryLevel").value);
  fetch("/check_inverter_status", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ battery: battery })
  })
    .then((res) => res.json())
    .then((data) => {
      document.getElementById("inverterStatus").innerText = data.message;
    });
}

function setPetFeederAutomation() {
  const feedTime = document.getElementById("feedTime").value;
  const graceDelay = parseInt(document.getElementById("graceDelay").value);
  if (!feedTime || isNaN(graceDelay)) {
    document.getElementById("pet-feeder-status").innerText =
      "❗ Please enter both feeding time and grace delay.";
    return;
  }
  fetch("/set_pet_feeder_automation", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ time: feedTime, delay: graceDelay })
  })
    .then((res) => res.json())
    .then((data) => {
      document.getElementById("pet-feeder-status").innerText = data.message;
    });
}

function filterCards() {
  const input = document.getElementById("searchInput").value.toLowerCase();
  const cards = document.querySelectorAll(".card");
  cards.forEach((card) => {
    const text = card.innerText.toLowerCase();
    card.style.display = text.includes(input) ? "block" : "none";
  });
}