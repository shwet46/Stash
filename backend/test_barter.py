import requests
import json
import time

url = "http://localhost:8000/api/barter/chat"

# Give the full state so AI skips asking questions
state1 = {
    "buyer_name": "Ojasvi",
    "product": "basmati rice",
    "quantity": 400,
    "offered_price": 42
}

payload1 = {
    "message": "I want to buy basmati rice, 400kg at 42 rupees",
    "history": [],
    "session_state": state1
}

print("Starting Step 1...")
res1 = requests.post(url, json=payload1).json()
print("Step 1:", json.dumps(res1, indent=2))

state2 = res1.get("session_state", {})
payload2 = {
    "message": "ok",
    "history": [
        {"role": "user", "content": "I want to buy basmati rice, 400kg at 42 rupees"},
        {"role": "assistant", "content": res1.get("reply", "")}
    ],
    "session_state": state2
}

print("Starting Step 2...")
res2 = requests.post(url, json=payload2).json()
print("Step 2:", json.dumps(res2, indent=2))

state3 = res2.get("session_state", {})
payload3 = {
    "message": "ok",
    "history": [
        {"role": "user", "content": "I want to buy basmati rice, 400kg at 42 rupees"},
        {"role": "assistant", "content": res1.get("reply", "")},
        {"role": "user", "content": "ok"},
        {"role": "assistant", "content": res2.get("reply", "")}
    ],
    "session_state": state3
}

print("Starting Step 3...")
res3 = requests.post(url, json=payload3).json()
print("Step 3:", json.dumps(res3, indent=2))
