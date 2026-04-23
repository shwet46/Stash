"""WeasyPrint invoice PDF generation"""
from jinja2 import Template
from datetime import datetime


INVOICE_TEMPLATE = """
<!DOCTYPE html>
<html>
<head>
<style>
  body { font-family: 'Inter', sans-serif; color: #2C1A0E; margin: 0; padding: 40px; }
  .header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 40px; }
  .logo { font-size: 28px; font-weight: 700; color: #6B4226; }
  .logo-sub { font-size: 12px; color: #9A7B5A; }
  .invoice-title { text-align: right; }
  .invoice-title h1 { font-size: 24px; color: #6B4226; margin: 0; }
  .invoice-title p { color: #9A7B5A; font-size: 12px; }
  .info-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 30px; margin-bottom: 40px; }
  .info-block h3 { font-size: 11px; text-transform: uppercase; color: #9A7B5A; margin-bottom: 8px; letter-spacing: 1px; }
  .info-block p { font-size: 13px; margin: 2px 0; }
  table { width: 100%; border-collapse: collapse; margin-bottom: 30px; }
  th { background: #FAF6F1; color: #5C3D1E; font-size: 11px; text-transform: uppercase; padding: 12px; text-align: left; border-bottom: 2px solid #E2CDB0; }
  td { padding: 12px; border-bottom: 1px solid #E2CDB0; font-size: 13px; }
  .totals { float: right; width: 280px; }
  .totals tr td { padding: 8px 12px; }
  .totals .total-row { font-weight: 700; font-size: 16px; border-top: 2px solid #6B4226; color: #6B4226; }
  .footer { margin-top: 60px; padding-top: 20px; border-top: 1px solid #E2CDB0; text-align: center; color: #9A7B5A; font-size: 11px; }
</style>
</head>
<body>
  <div class="header">
    <div>
      <div class="logo">Stash</div>
      <div class="logo-sub">Voice-Native AI Supply Chain</div>
    </div>
    <div class="invoice-title">
      <h1>INVOICE</h1>
      <p>{{ bill_ref }}</p>
      <p>Date: {{ date }}</p>
    </div>
  </div>

  <div class="info-grid">
    <div class="info-block">
      <h3>Bill To</h3>
      <p><strong>{{ buyer_name }}</strong></p>
      <p>{{ buyer_phone }}</p>
    </div>
    <div class="info-block" style="text-align: right;">
      <h3>Order Details</h3>
      <p>Order: {{ order_ref }}</p>
      <p>Date: {{ order_date }}</p>
    </div>
  </div>

  <table>
    <thead>
      <tr>
        <th>Product</th>
        <th>Quantity</th>
        <th>Unit Price</th>
        <th style="text-align: right;">Amount</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td>{{ product_name }}</td>
        <td>{{ quantity }} {{ unit }}</td>
        <td>₹{{ unit_price }}</td>
        <td style="text-align: right;">₹{{ amount }}</td>
      </tr>
    </tbody>
  </table>

  <table class="totals">
    <tr>
      <td>Subtotal</td>
      <td style="text-align: right;">₹{{ amount }}</td>
    </tr>
    <tr>
      <td>GST ({{ gst_rate }}%)</td>
      <td style="text-align: right;">₹{{ gst_amount }}</td>
    </tr>
    <tr class="total-row">
      <td>Total</td>
      <td style="text-align: right;">₹{{ total }}</td>
    </tr>
  </table>

  <div style="clear: both;"></div>

  <div class="footer">
    <p>This is a computer-generated invoice from Stash AI Supply Chain Platform.</p>
    <p>For queries, call our Stash helpline or send /help to our Telegram bot.</p>
  </div>
</body>
</html>
"""


async def generate_invoice_pdf(bill_data: dict) -> bytes:
    """Generate a GST-compliant invoice PDF using WeasyPrint"""
    try:
        from weasyprint import HTML
    except ImportError:
        # WeasyPrint may not be available in all environments
        return b""

    template = Template(INVOICE_TEMPLATE)
    html_content = template.render(
        bill_ref=bill_data.get("bill_ref", ""),
        date=datetime.now().strftime("%d %B %Y"),
        buyer_name=bill_data.get("buyer_name", ""),
        buyer_phone=bill_data.get("buyer_phone", ""),
        order_ref=bill_data.get("order_ref", ""),
        order_date=bill_data.get("order_date", ""),
        product_name=bill_data.get("product_name", ""),
        quantity=bill_data.get("quantity", 0),
        unit=bill_data.get("unit", ""),
        unit_price=f"{bill_data.get('unit_price', 0):,.2f}",
        amount=f"{bill_data.get('amount', 0):,.2f}",
        gst_rate=bill_data.get("gst_rate", 0),
        gst_amount=f"{bill_data.get('gst_amount', 0):,.2f}",
        total=f"{bill_data.get('total', 0):,.2f}",
    )

    pdf_bytes = HTML(string=html_content).write_pdf()
    return pdf_bytes
