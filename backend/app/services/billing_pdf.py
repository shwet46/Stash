"""WeasyPrint invoice PDF generation — Professional GST-compliant invoices"""
from jinja2 import Template
from datetime import datetime


# GST rate mapping by product category
GST_RATE_MAP = {
    # 5% — Agricultural commodities (essential food items)
    "grains": 5,
    "rice": 5,
    "wheat": 5,
    "pulses": 5,
    "dal": 5,
    "cereals": 5,
    "flour": 5,
    "atta": 5,
    "maida": 5,
    "vegetables": 5,
    "fruits": 5,
    "salt": 5,
    # 12% — Processed foods
    "oils": 12,
    "oil": 12,
    "edible oil": 12,
    "ghee": 12,
    "sugar": 12,
    "jaggery": 12,
    "processed": 12,
    "dairy": 12,
    "milk": 12,
    # 18% — Packaged / FMCG / spices
    "spices": 18,
    "fmcg": 18,
    "packaged": 18,
    "beverages": 18,
    "snacks": 18,
    "others": 18,
    "other": 18,
}


def get_gst_rate_for_category(category: str) -> int:
    """Return the applicable GST rate (%) for a product category."""
    if not category:
        return 5  # Default: agricultural
    key = category.lower().strip()
    # Try exact match first
    if key in GST_RATE_MAP:
        return GST_RATE_MAP[key]
    # Try substring match
    for cat_key, rate in GST_RATE_MAP.items():
        if cat_key in key or key in cat_key:
            return rate
    return 5  # Default to 5% for unknown categories


INVOICE_TEMPLATE = """
<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<style>
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');

  * { margin: 0; padding: 0; box-sizing: border-box; }

  body {
    font-family: 'Inter', -apple-system, sans-serif;
    color: #2C1A0E;
    background: #fff;
    font-size: 13px;
    line-height: 1.5;
  }

  .invoice-wrapper {
    max-width: 800px;
    margin: 0 auto;
    padding: 40px;
    position: relative;
  }

  /* Watermark for paid invoices */
  {% if status == "paid" %}
  .invoice-wrapper::before {
    content: "PAID";
    position: fixed;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%) rotate(-30deg);
    font-size: 120px;
    font-weight: 800;
    color: rgba(16, 133, 72, 0.07);
    pointer-events: none;
    z-index: 0;
    letter-spacing: 8px;
  }
  {% endif %}

  /* Header */
  .header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    margin-bottom: 32px;
    padding-bottom: 24px;
    border-bottom: 2px solid #E2CDB0;
  }

  .logo-section { display: flex; flex-direction: column; gap: 4px; }

  .logo-mark {
    display: inline-flex;
    align-items: center;
    gap: 10px;
  }

  .logo-icon {
    width: 40px;
    height: 40px;
    background: linear-gradient(135deg, #6B4226, #8B5E3C);
    border-radius: 10px;
    display: flex;
    align-items: center;
    justify-content: center;
    color: white;
    font-weight: 800;
    font-size: 20px;
    letter-spacing: -1px;
  }

  .logo-text {
    font-size: 26px;
    font-weight: 800;
    color: #6B4226;
    letter-spacing: -0.5px;
  }

  .logo-tagline {
    font-size: 10px;
    color: #9A7B5A;
    text-transform: uppercase;
    letter-spacing: 1.5px;
    margin-top: 2px;
  }

  .gstin-badge {
    margin-top: 8px;
    display: inline-block;
    padding: 3px 10px;
    background: #FAF6F1;
    border: 1px solid #E2CDB0;
    border-radius: 4px;
    font-size: 10px;
    color: #6B4226;
    font-weight: 600;
    letter-spacing: 0.5px;
  }

  .invoice-meta { text-align: right; }

  .invoice-label {
    font-size: 11px;
    text-transform: uppercase;
    letter-spacing: 2px;
    color: #9A7B5A;
    margin-bottom: 6px;
    font-weight: 600;
  }

  .invoice-number {
    font-size: 22px;
    font-weight: 800;
    color: #3d2616;
    margin-bottom: 4px;
  }

  .invoice-date {
    font-size: 12px;
    color: #9A7B5A;
  }

  .status-badge {
    display: inline-block;
    padding: 4px 12px;
    border-radius: 20px;
    font-size: 10px;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 1px;
    margin-top: 8px;
  }

  .status-paid { background: #dcfce7; color: #166534; border: 1px solid #bbf7d0; }
  .status-pending { background: #fef3c7; color: #92400e; border: 1px solid #fde68a; }
  .status-overdue { background: #fee2e2; color: #991b1b; border: 1px solid #fecaca; }

  /* Info Grid */
  .info-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 24px;
    margin-bottom: 32px;
  }

  .info-block {
    background: #FAF6F1;
    border-radius: 10px;
    padding: 16px 20px;
    border: 1px solid #E2CDB0;
  }

  .info-block h3 {
    font-size: 9px;
    text-transform: uppercase;
    letter-spacing: 1.5px;
    color: #9A7B5A;
    margin-bottom: 10px;
    font-weight: 700;
  }

  .info-block .name {
    font-size: 14px;
    font-weight: 700;
    color: #3d2616;
    margin-bottom: 2px;
  }

  .info-block p {
    font-size: 12px;
    color: #5C3D1E;
    margin: 2px 0;
  }

  /* Items Table */
  .section-label {
    font-size: 9px;
    text-transform: uppercase;
    letter-spacing: 1.5px;
    color: #9A7B5A;
    margin-bottom: 10px;
    font-weight: 700;
  }

  table.items {
    width: 100%;
    border-collapse: collapse;
    margin-bottom: 24px;
    border-radius: 10px;
    overflow: hidden;
    border: 1px solid #E2CDB0;
  }

  table.items thead tr {
    background: linear-gradient(135deg, #6B4226, #8B5E3C);
    color: white;
  }

  table.items th {
    padding: 11px 14px;
    font-size: 10px;
    text-transform: uppercase;
    letter-spacing: 0.8px;
    font-weight: 600;
    text-align: left;
  }

  table.items th:last-child { text-align: right; }

  table.items td {
    padding: 11px 14px;
    border-bottom: 1px solid #E2CDB0;
    font-size: 12px;
    color: #3d2616;
  }

  table.items td:last-child { text-align: right; font-weight: 600; }

  table.items tbody tr:last-child td { border-bottom: none; }

  table.items tbody tr:nth-child(even) { background: #fdfcfb; }

  .hsn-code {
    font-size: 10px;
    color: #9A7B5A;
    margin-top: 2px;
  }

  /* Totals */
  .totals-section {
    display: flex;
    justify-content: flex-end;
    margin-bottom: 32px;
  }

  table.totals {
    width: 280px;
    border-collapse: collapse;
    border: 1px solid #E2CDB0;
    border-radius: 10px;
    overflow: hidden;
  }

  table.totals td {
    padding: 9px 14px;
    font-size: 12px;
    border-bottom: 1px solid #E2CDB0;
  }

  table.totals td:last-child { text-align: right; font-weight: 500; }

  table.totals tr:last-child td { border-bottom: none; }

  .subtotal-row td { color: #5C3D1E; background: #FAF6F1; }

  .gst-row td {
    color: #5C3D1E;
    font-size: 11px;
    background: #fdfcfb;
  }

  .total-row td {
    font-weight: 800;
    font-size: 15px;
    color: white;
    background: linear-gradient(135deg, #6B4226, #8B5E3C);
    border-bottom: none;
    padding: 12px 14px;
  }

  /* Tax breakdown note */
  .tax-note {
    background: #FAF6F1;
    border: 1px solid #E2CDB0;
    border-radius: 8px;
    padding: 12px 16px;
    margin-bottom: 24px;
    font-size: 11px;
    color: #5C3D1E;
  }

  .tax-note strong { color: #3d2616; }

  /* Bank / Payment */
  .payment-section {
    background: #FAF6F1;
    border: 1px solid #E2CDB0;
    border-radius: 10px;
    padding: 16px 20px;
    margin-bottom: 24px;
  }

  .payment-section h3 {
    font-size: 9px;
    text-transform: uppercase;
    letter-spacing: 1.5px;
    color: #9A7B5A;
    margin-bottom: 10px;
    font-weight: 700;
  }

  .payment-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 8px;
  }

  .payment-item {
    font-size: 12px;
    color: #3d2616;
  }

  .payment-item span { color: #9A7B5A; font-size: 10px; display: block; }

  /* Footer */
  .footer {
    margin-top: 24px;
    padding-top: 20px;
    border-top: 1px solid #E2CDB0;
    display: flex;
    justify-content: space-between;
    align-items: flex-end;
  }

  .footer-left {
    font-size: 10px;
    color: #9A7B5A;
    line-height: 1.8;
    max-width: 380px;
  }

  .footer-right { text-align: right; }

  .signature-line {
    width: 140px;
    border-top: 1px solid #9A7B5A;
    margin-left: auto;
    margin-bottom: 4px;
  }

  .signature-text {
    font-size: 10px;
    color: #9A7B5A;
    text-align: right;
  }

  .amount-words {
    background: linear-gradient(135deg, #6B4226, #8B5E3C);
    color: white;
    border-radius: 8px;
    padding: 10px 16px;
    margin-bottom: 16px;
    font-size: 11px;
  }

  .amount-words strong { font-weight: 700; font-size: 12px; }
</style>
</head>
<body>
<div class="invoice-wrapper">

  <!-- Header -->
  <div class="header">
    <div class="logo-section">
      <div class="logo-mark">
        <div class="logo-icon">S</div>
        <div class="logo-text">Stash</div>
      </div>
      <div class="logo-tagline">Voice-Native AI Supply Chain</div>
      <div class="gstin-badge">GSTIN: 27AABCS1429B1Z6</div>
    </div>
    <div class="invoice-meta">
      <div class="invoice-label">Tax Invoice</div>
      <div class="invoice-number">{{ bill_ref }}</div>
      <div class="invoice-date">Date: {{ date }}</div>
      <div class="invoice-date">Due: {{ due_date }}</div>
      <div class="status-badge status-{{ status }}">{{ status_label }}</div>
    </div>
  </div>

  <!-- Bill To / Order Details -->
  <div class="info-grid">
    <div class="info-block">
      <h3>Bill To</h3>
      <div class="name">{{ buyer_name }}</div>
      <p>{{ buyer_phone }}</p>
      {% if buyer_address %}<p>{{ buyer_address }}</p>{% endif %}
      {% if buyer_gstin %}<p>GSTIN: {{ buyer_gstin }}</p>{% endif %}
    </div>
    <div class="info-block">
      <h3>Order Details</h3>
      <p><strong>Order Ref:</strong> {{ order_ref }}</p>
      <p><strong>Order Date:</strong> {{ order_date }}</p>
      <p><strong>Place of Supply:</strong> Maharashtra (27)</p>
      <p><strong>Supply Type:</strong> B2B — Intra-state</p>
    </div>
  </div>

  <!-- Line Items -->
  <div class="section-label">Items</div>
  <table class="items">
    <thead>
      <tr>
        <th>#</th>
        <th>Description</th>
        <th>HSN/SAC</th>
        <th>Qty</th>
        <th>Rate (₹)</th>
        <th>Amount (₹)</th>
      </tr>
    </thead>
    <tbody>
      {% for item in items %}
      <tr>
        <td>{{ loop.index }}</td>
        <td>
          {{ item.product_name }}
          <div class="hsn-code">Category: {{ item.category or "Agricultural" }}</div>
        </td>
        <td>{{ item.hsn_code or "10019900" }}</td>
        <td>{{ item.quantity }} {{ item.unit }}</td>
        <td>{{ "%.2f"|format(item.unit_price) }}</td>
        <td>{{ "%.2f"|format(item.amount) }}</td>
      </tr>
      {% endfor %}
    </tbody>
  </table>

  <!-- Amount in Words -->
  <div class="amount-words">
    <strong>Amount in Words:</strong> {{ amount_in_words }} Only
  </div>

  <!-- Totals -->
  <div class="totals-section">
    <table class="totals">
      <tr class="subtotal-row">
        <td>Subtotal</td>
        <td>₹{{ "%.2f"|format(amount) }}</td>
      </tr>
      {% if is_intrastate %}
      <tr class="gst-row">
        <td>CGST @ {{ "%.1f"|format(gst_rate / 2) }}%</td>
        <td>₹{{ "%.2f"|format(gst_amount / 2) }}</td>
      </tr>
      <tr class="gst-row">
        <td>SGST @ {{ "%.1f"|format(gst_rate / 2) }}%</td>
        <td>₹{{ "%.2f"|format(gst_amount / 2) }}</td>
      </tr>
      {% else %}
      <tr class="gst-row">
        <td>IGST @ {{ gst_rate }}%</td>
        <td>₹{{ "%.2f"|format(gst_amount) }}</td>
      </tr>
      {% endif %}
      <tr class="total-row">
        <td>Total</td>
        <td>₹{{ "%.2f"|format(total) }}</td>
      </tr>
    </table>
  </div>

  <!-- Tax Breakdown Note -->
  <div class="tax-note">
    <strong>GST Breakdown:</strong>
    Taxable Value: ₹{{ "%.2f"|format(amount) }} |
    GST Rate: {{ gst_rate }}% ({{ gst_type }}) |
    GST Amount: ₹{{ "%.2f"|format(gst_amount) }} |
    <strong>Grand Total: ₹{{ "%.2f"|format(total) }}</strong>
  </div>

  <!-- Payment Info -->
  <div class="payment-section">
    <h3>Payment Information</h3>
    <div class="payment-grid">
      <div class="payment-item">
        <span>Bank Name</span>
        State Bank of India
      </div>
      <div class="payment-item">
        <span>Account Number</span>
        XXXX XXXX 4829
      </div>
      <div class="payment-item">
        <span>IFSC Code</span>
        SBIN0001234
      </div>
      <div class="payment-item">
        <span>UPI ID</span>
        stash@sbi
      </div>
    </div>
  </div>

  <!-- Footer -->
  <div class="footer">
    <div class="footer-left">
      <p>This is a computer-generated invoice. No physical signature required.</p>
      <p>For queries: helpline@stash.in | +91 98765 00000</p>
      <p>Terms: Payment due within 30 days of invoice date.</p>
      <p>Subject to Maharashtra jurisdiction.</p>
    </div>
    <div class="footer-right">
      <div class="signature-line"></div>
      <div class="signature-text">Authorised Signatory</div>
      <div class="signature-text" style="margin-top:2px; font-weight:600; color:#6B4226;">Stash AI Supply Chain</div>
    </div>
  </div>

</div>
</body>
</html>
"""


def _number_to_words(n: float) -> str:
    """Convert a number to Indian number words (simplified)."""
    ones = ["", "One", "Two", "Three", "Four", "Five", "Six", "Seven", "Eight", "Nine",
            "Ten", "Eleven", "Twelve", "Thirteen", "Fourteen", "Fifteen", "Sixteen",
            "Seventeen", "Eighteen", "Nineteen"]
    tens = ["", "", "Twenty", "Thirty", "Forty", "Fifty", "Sixty", "Seventy", "Eighty", "Ninety"]

    def _convert(num: int) -> str:
        if num == 0:
            return ""
        elif num < 20:
            return ones[num]
        elif num < 100:
            return tens[num // 10] + (" " + ones[num % 10] if num % 10 else "")
        elif num < 1000:
            return ones[num // 100] + " Hundred" + (" " + _convert(num % 100) if num % 100 else "")
        elif num < 100000:
            return _convert(num // 1000) + " Thousand" + (" " + _convert(num % 1000) if num % 1000 else "")
        elif num < 10000000:
            return _convert(num // 100000) + " Lakh" + (" " + _convert(num % 100000) if num % 100000 else "")
        else:
            return _convert(num // 10000000) + " Crore" + (" " + _convert(num % 10000000) if num % 10000000 else "")

    integer_part = int(n)
    paise = round((n - integer_part) * 100)
    words = "Rupees " + (_convert(integer_part) or "Zero")
    if paise:
        words += f" and {_convert(paise)} Paise"
    return words


async def generate_invoice_pdf(bill_data: dict) -> bytes:
    """Generate a GST-compliant professional invoice PDF using WeasyPrint."""
    try:
        from weasyprint import HTML
    except ImportError:
        return b""

    status = bill_data.get("status", "pending")
    status_labels = {"paid": "Paid", "pending": "Pending", "overdue": "Overdue"}

    # Build items list (support single item or multi-item)
    items = bill_data.get("items")
    if not items:
        items = [{
            "product_name": bill_data.get("product_name", "Product"),
            "category": bill_data.get("category", ""),
            "hsn_code": bill_data.get("hsn_code", "10019900"),
            "quantity": bill_data.get("quantity", 0),
            "unit": bill_data.get("unit", "units"),
            "unit_price": bill_data.get("unit_price", 0),
            "amount": bill_data.get("amount", 0),
        }]

    amount = float(bill_data.get("amount", 0))
    gst_rate = int(bill_data.get("gst_rate", 5))
    gst_amount = float(bill_data.get("gst_amount", amount * gst_rate / 100))
    total = float(bill_data.get("total", amount + gst_amount))

    # Determine CGST/SGST vs IGST (intra-state = same state)
    is_intrastate = bill_data.get("is_intrastate", True)
    gst_type = "CGST + SGST" if is_intrastate else "IGST"

    # Due date (30 days from order date)
    order_date_str = bill_data.get("order_date", datetime.now().strftime("%Y-%m-%d"))
    try:
        from datetime import timedelta
        order_date = datetime.strptime(order_date_str, "%Y-%m-%d")
        due_date = (order_date + timedelta(days=30)).strftime("%d %B %Y")
    except Exception:
        due_date = "30 days from invoice date"

    template = Template(INVOICE_TEMPLATE)
    html_content = template.render(
        bill_ref=bill_data.get("bill_ref", ""),
        date=datetime.now().strftime("%d %B %Y"),
        due_date=due_date,
        status=status,
        status_label=status_labels.get(status, "Pending"),
        buyer_name=bill_data.get("buyer_name", ""),
        buyer_phone=bill_data.get("buyer_phone", ""),
        buyer_address=bill_data.get("buyer_address", ""),
        buyer_gstin=bill_data.get("buyer_gstin", ""),
        order_ref=bill_data.get("order_ref", ""),
        order_date=bill_data.get("order_date", ""),
        items=items,
        amount=amount,
        gst_rate=gst_rate,
        gst_amount=gst_amount,
        gst_type=gst_type,
        is_intrastate=is_intrastate,
        total=total,
        amount_in_words=_number_to_words(total),
    )

    pdf_bytes = HTML(string=html_content).write_pdf()
    return pdf_bytes
