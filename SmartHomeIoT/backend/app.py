

import json
import os

from flask import Flask, request, jsonify, render_template, redirect, url_for, session, send_from_directory
from flask_cors import CORS



# Flask app pointing to correct template/static folder
app = Flask(__name__, template_folder="templates", static_folder="static")
app.secret_key = "mysecret"   # ✅ secret key for session (can be anything)
CORS(app)

# ✅ Home route - serves index.html for WebView/app
@app.route("/")
def home():
    if "user" not in session:
        return redirect(url_for("login_page"))  # 🔐 Not logged in → go to login page
    return render_template("index.html", username=session["user"])  # ✅ Logged in → show home


# ✅ Login Page (if needed)
@app.route("/loginpage")
def login_page():
    return render_template("login.html")

# ---------- User DB ----------
USER_FILE = "users.json"

def load_users():
    if not os.path.exists(USER_FILE):
        return {}
    with open(USER_FILE, "r") as file:
        return json.load(file)

def save_users(users):
    with open(USER_FILE, "w") as file:
        json.dump(users, file, indent=2)

# ---------- Smart Home Endpoints ----------
light_status = False
fan_speed = 0
room_temperature = 0

@app.route("/toggle_light", methods=["POST"])
def toggle_light():
    global light_status
    light_status = not light_status
    return jsonify({"status": "on" if light_status else "off"})

@app.route("/set_fan_speed", methods=["POST"])
def set_fan_speed():
    global fan_speed
    data = request.get_json()
    fan_speed = data.get("speed", 0)
    return jsonify({"message": f"Fan speed set to {fan_speed}"})

@app.route("/check_temperature", methods=["POST"])
def check_temperature():
    data = request.get_json()
    temp = data.get("temperature", 0)
    status = "normal"
    if temp < 18:
        status = "Too Cold"
    elif temp > 30:
        status = "Too Hot"
    return jsonify({"message": f"Room is {status}"})

@app.route("/detect_gas", methods=["POST"])
def detect_gas():
    data = request.get_json()
    gas_leak = data.get("leak", False)
    return jsonify({"status": "Leak Detected" if gas_leak else "Safe"})

@app.route("/unlock_door", methods=["POST"])
def unlock_door():
    data = request.get_json()
    if data.get("password") == "1234":
        return jsonify({"status": "success", "message": "Door Unlocked"})
    return jsonify({"status": "fail", "message": "Incorrect Password"})

@app.route("/check_soil", methods=["POST"])
def check_soil():
    dry = request.get_json().get("dry", False)
    return jsonify({"message": "Watering plants..." if dry else "No need to water."})

@app.route("/toggle_curtain", methods=["POST"])
def toggle_curtain():
    status = request.get_json().get("open", False)
    return jsonify({"message": "Curtains are Open" if status else "Curtains are Closed"})

@app.route("/ring_bell", methods=["POST"])
def ring_bell():
    return jsonify({"message": "🔔 Someone pressed the bell!"})

@app.route("/approach_door", methods=["POST"])
def approach_door():
    return jsonify({"message": "🚪 Door opened automatically!"})

@app.route("/detect_intruder", methods=["POST"])
def detect_intruder():
    intruder = request.get_json().get("intruder", False)
    return jsonify({"message": "⚠️ Intruder Detected!" if intruder else "All safe"})

@app.route("/motion_light", methods=["POST"])
def motion_light():
    motion = request.get_json().get("motion", False)
    return jsonify({"status": "ON" if motion else "OFF"})

@app.route("/set_dimmer", methods=["POST"])
def set_dimmer():
    brightness = request.get_json().get("brightness", 50)
    return jsonify({"message": f"Brightness: {brightness}%"})

@app.route("/detect_smoke", methods=["POST"])
def detect_smoke():
    detected = request.get_json().get("smoke", False)
    return jsonify({"message": "🔥 Smoke detected!" if detected else "No smoke detected"})

@app.route("/set_schedule", methods=["POST"])
def set_schedule():
    data = request.get_json()
    on_time = data.get("on")
    off_time = data.get("off")
    return jsonify({"message": f"Scheduled: ON at {on_time}, OFF at {off_time}"})

@app.route("/daylight", methods=["POST"])
def daylight():
    dark = request.get_json().get("dark", False)
    return jsonify({"status": "ON" if dark else "OFF"})

@app.route("/room_occupancy", methods=["POST"])
def room_occupancy():
    occupied = request.get_json().get("occupied", False)
    return jsonify({"message": "Room is occupied" if occupied else "Room is empty"})

@app.route("/voice_feedback", methods=["POST"])
def voice_feedback():
    text = request.get_json().get("text", "")
    return jsonify({"message": f"Speaking: {text}"})

@app.route("/water_level", methods=["POST"])
def water_level():
    level = request.get_json().get("level", 0)
    return jsonify({"message": f"Water Level: {level}%{' (Auto OFF Pump)' if level >= 90 else ''}"})

@app.route("/inverter", methods=["POST"])
def inverter():
    status = request.get_json().get("status", False)
    return jsonify({"message": "Inverter ON – Low Power Mode" if status else "Inverter OFF – Full Power"})

@app.route("/energy_usage", methods=["GET"])
def energy_usage():
    import random
    usage = round(random.uniform(100, 500), 2)
    return jsonify({"usage": usage})

@app.route("/facial_recognition", methods=["POST"])
def facial_recognition():
    import random
    matched = random.random() < 0.7
    return jsonify({"status": "✅ Face matched. Door unlocked." if matched else "❌ Face not recognized."})

@app.route("/fire_alert", methods=["POST"])
def fire_alert():
    return jsonify({"message": "🔥 Fire detected! Buzzer ON!"})

@app.route("/detect_rain", methods=["POST"])
def detect_rain():
    return jsonify({"message": "🌧️ Rain detected! Window Closed."})

@app.route("/feed_pet", methods=["POST"])
def feed_pet():
    from datetime import datetime
    time = datetime.now().strftime("%I:%M:%S %p")
    return jsonify({"message": f"🐶 Pet fed at {time}"})

@app.route("/check_inverter_status", methods=["POST"])
def check_inverter_status():
    battery = request.get_json().get("battery", 0)
    if battery > 50:
        msg = "✅ All appliances will operate on inverter power."
    elif 10 < battery <= 50:
        msg = "⚠️ Only essential appliances will be powered (Fan, Light, Router)."
    else:
        msg = "🔴 Low battery! Only Wi-Fi, 1–2 Lights & Charging Point will remain ON."
    return jsonify({"message": msg})

@app.route("/set_pet_feeder_automation", methods=["POST"])
def set_pet_feeder_automation():
    data = request.get_json()
    time = data.get("time")
    delay = data.get("delay")
    return jsonify({"message": f"Scheduled feeding at {time}, auto-feed after {delay} min if missed."})

@app.route("/signup", methods=["POST"])
def signup():
    data = request.get_json()
    email = data.get("email")
    password = data.get("password")
    name = data.get("name")
    users = load_users()
    if email in users:
        return jsonify({"success": False, "message": "Email already registered."})
    users[email] = {"password": password, "name": name}
    save_users(users)
    return jsonify({"success": True, "message": "Signup successful!"})

@app.route("/login", methods=["POST"])
def login():
    data = request.get_json()
    email = data.get("email")
    password = data.get("password")
    users = load_users()

    if email in users and users[email]["password"] == password:
        # ✅ Set session
        session["user"] = users[email]["name"]
        return jsonify({"success": True, "message": f"Welcome {users[email]['name']}!"})
    else:
        return jsonify({"success": False, "message": "Invalid email or password."})

@app.route("/logout")
def logout():
    session.clear()
    return redirect("/loginpage")


# ---------- Run Server ----------
if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000, debug=True)
