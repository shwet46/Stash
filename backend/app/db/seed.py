"""Seed data generator for Stash — realistic Indian godown data"""
import uuid
import random
from datetime import datetime, timedelta, date
from decimal import Decimal


def generate_seed_data():
    """Generate realistic seed data for the Stash platform"""

    # ========== USERS ==========
    users = [
        {
            "id": str(uuid.uuid4()),
            "name": "Shweta Behera",
            "email": "shweta@stash.ai",
            "role": "owner",
        },
        {
            "id": str(uuid.uuid4()),
            "name": "Ramesh Kumar",
            "email": "ramesh@stash.ai",
            "role": "worker",
        },
        {
            "id": str(uuid.uuid4()),
            "name": "Priya Sharma",
            "email": "priya@stash.ai",
            "role": "worker",
        },
    ]

    # ========== GODOWNS ==========
    godowns = [
        {
            "id": str(uuid.uuid4()),
            "name": "Mumbai Central Godown",
            "lat": 19.0760,
            "lon": 72.8777,
            "owner_id": users[0]["id"],
        },
        {
            "id": str(uuid.uuid4()),
            "name": "Pune Warehouse",
            "lat": 18.5204,
            "lon": 73.8567,
            "owner_id": users[0]["id"],
        },
        {
            "id": str(uuid.uuid4()),
            "name": "Nashik Depot",
            "lat": 19.9975,
            "lon": 73.7898,
            "owner_id": users[0]["id"],
        },
        {
            "id": str(uuid.uuid4()),
            "name": "Ahmedabad Store",
            "lat": 23.0225,
            "lon": 72.5714,
            "owner_id": users[0]["id"],
        },
        {
            "id": str(uuid.uuid4()),
            "name": "Surat Godown",
            "lat": 21.1702,
            "lon": 72.8311,
            "owner_id": users[0]["id"],
        },
    ]

    # ========== INVENTORY (20 items) ==========
    products = [
        ("Chana Dal", "Pulses", 850, 200, "kg", 90),
        ("Basmati Rice", "Grains", 2450, 500, "kg", 180),
        ("Wheat Flour (Atta)", "Grains", 1800, 400, "kg", 120),
        ("Moong Dal", "Pulses", 320, 150, "kg", 90),
        ("Sugar", "Essentials", 45, 100, "kg", 365),
        ("Toor Dal", "Pulses", 250, 200, "kg", 90),
        ("Masoor Dal", "Pulses", 90, 100, "kg", 90),
        ("Urad Dal", "Pulses", 180, 100, "kg", 90),
        ("Soya Bean", "Pulses", 400, 200, "kg", 120),
        ("Groundnut Oil", "Oils", 520, 200, "L", 180),
        ("Mustard Oil", "Oils", 380, 150, "L", 180),
        ("Salt", "Essentials", 1200, 300, "kg", 730),
        ("Turmeric", "Spices", 75, 50, "kg", 365),
        ("Red Chilli", "Spices", 40, 30, "kg", 365),
        ("Coriander", "Spices", 55, 30, "kg", 180),
        ("Cumin", "Spices", 35, 20, "kg", 365),
        ("Tea", "Beverages", 120, 80, "kg", 180),
        ("Parle-G Biscuits", "Snacks", 200, 100, "packs", 120),
        ("Lux Soap", "FMCG", 150, 100, "pcs", 730),
        ("Surf Detergent", "FMCG", 85, 80, "packs", 730),
    ]

    inventory = []
    for i, (name, category, stock, threshold, unit, shelf_days) in enumerate(products):
        godown = godowns[i % len(godowns)]
        expiry = date.today() + timedelta(days=shelf_days + random.randint(0, 90))
        inventory.append({
            "id": str(uuid.uuid4()),
            "product_name": name,
            "category": category,
            "current_stock": stock,
            "threshold": threshold,
            "unit": unit,
            "expiry_date": expiry.isoformat(),
            "godown_id": godown["id"],
        })

    # ========== BUYERS (10) ==========
    buyer_names = [
        "Mehta & Sons", "Sharma Stores", "Patel Grocers", "Kumar Trading",
        "Singh & Co.", "Gupta Traders", "Reddy Retail", "Jain Supermart",
        "Yadav & Sons", "Chopra Stores",
    ]
    buyers = []
    for i, name in enumerate(buyer_names):
        buyers.append({
            "id": str(uuid.uuid4()),
            "name": name,
            "phone": f"+91 {random.randint(70000, 99999)} {random.randint(10000, 99999)}",
            "telegram_chat_id": random.randint(100000000, 999999999),
            "credit_limit": random.choice([50000, 100000, 200000, 500000]),
            "current_balance": random.randint(0, 80000),
            "credit_due_date": (date.today() + timedelta(days=random.randint(-5, 30))).isoformat(),
            "preferred_language": random.choice(["en", "hi", "mr", "gu"]),
        })

    # ========== SUPPLIERS (8) ==========
    supplier_names = [
        ("Anand Trading Co.", "+91 98765 43210", 0),
        ("Patel & Sons Grains", "+91 87654 32109", 1),
        ("Sharma Commodities", "+91 76543 21098", 4),
        ("Gupta Oil Mills", "+91 65432 10987", 9),
        ("Maharashtra Grains Ltd.", "+91 54321 09876", 2),
        ("Gujarat Spice Co.", "+91 43210 98765", 12),
        ("Rathi Oils Pvt. Ltd.", "+91 32109 87654", 10),
        ("Deccan Trading Co.", "+91 21098 76543", 5),
    ]
    suppliers = []
    for i, (name, phone, prod_idx) in enumerate(supplier_names):
        suppliers.append({
            "id": str(uuid.uuid4()),
            "name": name,
            "phone": phone,
            "telegram_chat_id": random.randint(100000000, 999999999),
            "product_id": inventory[prod_idx]["id"],
            "priority": 1 if i < 5 else 2,
            "status": "active" if i != 4 else "inactive",
            "last_contacted": (datetime.utcnow() - timedelta(hours=random.randint(1, 120))).isoformat(),
        })

    # ========== ORDERS (50) ==========
    statuses = (["delivered"] * 30 + ["dispatched"] * 13 + ["pending"] * 7)
    random.shuffle(statuses)
    orders = []
    for i in range(50):
        buyer = random.choice(buyers)
        product = random.choice(inventory)
        qty = random.randint(50, 1000)
        unit_price = random.uniform(30, 200)
        total = round(qty * unit_price, 2)
        created = datetime.utcnow() - timedelta(days=random.randint(0, 30))
        delivery = created + timedelta(days=random.randint(3, 7))

        orders.append({
            "id": str(uuid.uuid4()),
            "order_ref": f"STH-{4800 + i}",
            "buyer_id": buyer["id"],
            "product_id": product["id"],
            "quantity": qty,
            "status": statuses[i],
            "estimated_delivery": delivery.date().isoformat(),
            "total_amount": total,
            "created_at": created.isoformat(),
        })

    # ========== BILLS ==========
    bills = []
    for order in orders:
        gst_rate = random.choice([5, 12, 18])
        amount = order["total_amount"]
        gst_amount = round(amount * gst_rate / 100, 2)
        total = round(amount + gst_amount, 2)

        bill_status = "paid" if order["status"] == "delivered" else "pending"
        if bill_status == "pending" and random.random() < 0.2:
            bill_status = "overdue"

        bills.append({
            "id": str(uuid.uuid4()),
            "bill_ref": f"INV-{order['order_ref'].split('-')[1]}",
            "order_id": order["id"],
            "buyer_id": order["buyer_id"],
            "amount": amount,
            "gst_rate": gst_rate,
            "gst_amount": gst_amount,
            "total": total,
            "status": bill_status,
        })

    return {
        "users": users,
        "godowns": godowns,
        "inventory": inventory,
        "buyers": buyers,
        "suppliers": suppliers,
        "orders": orders,
        "bills": bills,
    }


if __name__ == "__main__":
    import json

    data = generate_seed_data()
    print(json.dumps(data, indent=2, default=str))
    print(f"\nGenerated:")
    for key, values in data.items():
        print(f"  {key}: {len(values)} records")
