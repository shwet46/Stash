import re

history_text = """
user: I want to buy basmati rice, 400kg at 42 rupees
assistant: Hello Ojasvi, we appreciate your interest! We can certainly accommodate your price of ₹42.0/kg for the rice. To proceed with this excellent rate, we kindly require a minimum order quantity of 520 kg. Let us know if that works for you!
user: ok
assistant: Hi Ojasvi, we can accept ₹42.0/kg if you increase the order to at least 878 kg.
"""

m = re.findall(r"(?:minimum (?:order )?quantity of|at least) (\d+)", history_text)
if m:
    print(m[-1])

