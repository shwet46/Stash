import requests
import json
import time

url = "http://localhost:8000/api/barter/chat"

print("--- Turn 1 ---")
payload1 = {
    "message": "I want to buy basmati rice, 400kg at 42 rupees",
    "history": [],
    "session_state": {}
}

# The AI might not negotiate on turn 1 if it needs details. 
# We'll mock the JSON trigger internally by sending it directly to see if the state is set.

# Wait, let's just observe if the backend returns required_min_qty
state = {
    "buyer_name": "Ojasvi",
    "product": "basmati rice",
    "quantity": 400,
    "offered_price": 42
}

payload2 = {
    "message": "negotiate this", # Force it
    "history": [{"role": "user", "content": "I want to buy basmati rice, 400kg at 42 rupees"}],
    "session_state": state
}
print("Request 1 state:", state)
res2 = requests.post(url, json=payload2).json()
print("Response 1 session_state:", res2.get("session_state"))
print("Response 1 reply:", res2.get("reply"))

state = res2.get("session_state", {})
payload3 = {
    "message": "ok",
    "history": [{"role": "user", "content": "ok"}],
    "session_state": state
}
print("\nRequest 2 state:", state)
res3 = requests.post(url, json=payload3).json()
print("Response 2 session_state:", res3.get("session_state"))
print("Response 2 reply:", res3.get("reply"))

