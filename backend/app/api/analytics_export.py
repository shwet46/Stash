"""Analytics Export API — PDF reports and CSV downloads"""
import io
import csv
from fastapi import APIRouter, Query, HTTPException
from fastapi.responses import StreamingResponse
from app.services.firestore_service import firestore_service
from datetime import datetime

router = APIRouter(prefix="/api/analytics/export", tags=["analytics-export"])


# ─────────────────────────────────────────────
# CSV Export
# ─────────────────────────────────────────────

async def _fetch_collection(collection_name: str) -> list[dict]:
    """Fetch all documents from a Firestore collection."""
    if not firestore_service.is_enabled:
        return []
    docs = firestore_service.db.collection(collection_name).stream()
    results = []
    async for doc in docs:
        d = doc.to_dict()
        d["id"] = doc.id
        results.append(d)
    return results


def _dicts_to_csv(rows: list[dict]) -> str:
    """Convert list of dicts to CSV string."""
    if not rows:
        return ""
    output = io.StringIO()
    # Collect all keys
    all_keys: list[str] = []
    seen = set()
    for row in rows:
        for k in row:
            if k not in seen:
                all_keys.append(k)
                seen.add(k)
    writer = csv.DictWriter(output, fieldnames=all_keys, extrasaction="ignore")
    writer.writeheader()
    writer.writerows(rows)
    return output.getvalue()


EXPORT_COLLECTIONS = {
    "orders": "orders",
    "inventory": "inventory",
    "bills": "bills",
    "suppliers": "suppliers",
}


@router.get("/csv")
async def export_csv(type: str = Query("orders", description="One of: orders, inventory, bills, suppliers")):
    """Export a Firestore collection as a downloadable CSV."""
    if type not in EXPORT_COLLECTIONS:
        raise HTTPException(
            status_code=400,
            detail=f"Invalid type '{type}'. Choose from: {', '.join(EXPORT_COLLECTIONS)}"
        )

    collection_name = EXPORT_COLLECTIONS[type]
    rows = await _fetch_collection(collection_name)

    # Numeric cleanup for bills
    if type == "bills":
        for row in rows:
            for k in ["amount", "gst_rate", "gst_amount", "total", "unit_price"]:
                if k in row and row[k] is not None:
                    try:
                        row[k] = float(row[k])
                    except Exception:
                        pass

    csv_content = _dicts_to_csv(rows)
    filename = f"stash_{type}_{datetime.utcnow().strftime('%Y%m%d_%H%M%S')}.csv"

    return StreamingResponse(
        io.BytesIO(csv_content.encode("utf-8-sig")),  # utf-8-sig for Excel compatibility
        media_type="text/csv",
        headers={"Content-Disposition": f'attachment; filename="{filename}"'},
    )


# ─────────────────────────────────────────────
# PDF Dashboard Report
# ─────────────────────────────────────────────

REPORT_TEMPLATE = """
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
    font-size: 12px;
    line-height: 1.5;
  }

  .wrapper { max-width: 900px; margin: 0 auto; padding: 40px; }

  /* Cover Header */
  .report-header {
    background: linear-gradient(135deg, #3d2616 0%, #6B4226 50%, #8B5E3C 100%);
    border-radius: 16px;
    padding: 32px;
    margin-bottom: 32px;
    color: white;
  }

  .report-logo {
    display: flex;
    align-items: center;
    gap: 12px;
    margin-bottom: 24px;
  }

  .report-logo-icon {
    width: 44px;
    height: 44px;
    background: rgba(255,255,255,0.2);
    border-radius: 10px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-weight: 800;
    font-size: 22px;
    color: white;
    border: 1px solid rgba(255,255,255,0.3);
  }

  .report-logo-text { font-size: 24px; font-weight: 800; color: white; }
  .report-logo-sub { font-size: 11px; color: rgba(255,255,255,0.7); }

  .report-title { font-size: 28px; font-weight: 800; color: white; margin-bottom: 8px; }
  .report-subtitle { font-size: 13px; color: rgba(255,255,255,0.75); }

  .report-meta {
    display: flex;
    gap: 24px;
    margin-top: 20px;
    padding-top: 20px;
    border-top: 1px solid rgba(255,255,255,0.2);
  }

  .report-meta-item { font-size: 11px; }
  .report-meta-label { color: rgba(255,255,255,0.6); text-transform: uppercase; letter-spacing: 1px; }
  .report-meta-value { color: white; font-weight: 600; font-size: 13px; margin-top: 2px; }

  /* KPI Cards */
  .kpi-grid {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 16px;
    margin-bottom: 28px;
  }

  .kpi-card {
    background: #FAF6F1;
    border: 1px solid #E2CDB0;
    border-radius: 12px;
    padding: 16px;
    text-align: center;
  }

  .kpi-value {
    font-size: 20px;
    font-weight: 800;
    color: #6B4226;
    margin-bottom: 4px;
  }

  .kpi-label {
    font-size: 10px;
    color: #9A7B5A;
    text-transform: uppercase;
    letter-spacing: 0.8px;
    font-weight: 600;
  }

  /* Section */
  .section { margin-bottom: 32px; }

  .section-title {
    font-size: 14px;
    font-weight: 700;
    color: #3d2616;
    margin-bottom: 12px;
    padding-bottom: 8px;
    border-bottom: 2px solid #E2CDB0;
    display: flex;
    align-items: center;
    gap: 8px;
  }

  .section-title::before {
    content: "";
    width: 4px;
    height: 16px;
    background: linear-gradient(135deg, #6B4226, #D4956A);
    border-radius: 2px;
    display: inline-block;
  }

  /* Tables */
  table {
    width: 100%;
    border-collapse: collapse;
    border-radius: 10px;
    overflow: hidden;
    border: 1px solid #E2CDB0;
  }

  thead tr { background: linear-gradient(135deg, #6B4226, #8B5E3C); }

  th {
    padding: 10px 12px;
    font-size: 9px;
    text-transform: uppercase;
    letter-spacing: 0.8px;
    font-weight: 600;
    color: white;
    text-align: left;
  }

  td {
    padding: 9px 12px;
    border-bottom: 1px solid #E2CDB0;
    font-size: 11px;
    color: #3d2616;
  }

  tbody tr:last-child td { border-bottom: none; }
  tbody tr:nth-child(even) { background: #fdfcfb; }

  .badge {
    display: inline-block;
    padding: 2px 8px;
    border-radius: 20px;
    font-size: 9px;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.5px;
  }

  .badge-paid { background: #dcfce7; color: #166534; }
  .badge-pending { background: #fef3c7; color: #92400e; }
  .badge-overdue { background: #fee2e2; color: #991b1b; }
  .badge-delivered { background: #dcfce7; color: #166534; }
  .badge-in_transit { background: #dbeafe; color: #1d4ed8; }

  /* Summary box */
  .summary-box {
    background: linear-gradient(135deg, #FAF6F1, #fff);
    border: 1px solid #E2CDB0;
    border-radius: 12px;
    padding: 20px;
    margin-bottom: 16px;
  }

  .summary-grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 16px;
  }

  .summary-item .label { font-size: 10px; color: #9A7B5A; text-transform: uppercase; letter-spacing: 0.8px; }
  .summary-item .value { font-size: 16px; font-weight: 800; color: #6B4226; margin-top: 2px; }

  /* Footer */
  .report-footer {
    margin-top: 40px;
    padding-top: 20px;
    border-top: 1px solid #E2CDB0;
    display: flex;
    justify-content: space-between;
    align-items: center;
    font-size: 10px;
    color: #9A7B5A;
  }

  .footer-logo { font-weight: 700; color: #6B4226; font-size: 12px; }

  /* Page break */
  .page-break { page-break-before: always; }
</style>
</head>
<body>
<div class="wrapper">

  <!-- Cover Header -->
  <div class="report-header">
    <div class="report-logo">
      <div class="report-logo-icon">S</div>
      <div>
        <div class="report-logo-text">Stash</div>
        <div class="report-logo-sub">Voice-Native AI Supply Chain</div>
      </div>
    </div>
    <div class="report-title">Dashboard Report</div>
    <div class="report-subtitle">Comprehensive business analytics &amp; performance overview</div>
    <div class="report-meta">
      <div class="report-meta-item">
        <div class="report-meta-label">Generated On</div>
        <div class="report-meta-value">{{ generated_at }}</div>
      </div>
      <div class="report-meta-item">
        <div class="report-meta-label">Report Period</div>
        <div class="report-meta-value">All Time</div>
      </div>
      <div class="report-meta-item">
        <div class="report-meta-label">Total Orders</div>
        <div class="report-meta-value">{{ total_orders }}</div>
      </div>
      <div class="report-meta-item">
        <div class="report-meta-label">Total Revenue</div>
        <div class="report-meta-value">₹{{ total_revenue }}</div>
      </div>
    </div>
  </div>

  <!-- KPIs -->
  <div class="kpi-grid">
    <div class="kpi-card">
      <div class="kpi-value">₹{{ total_revenue }}</div>
      <div class="kpi-label">Total Revenue</div>
    </div>
    <div class="kpi-card">
      <div class="kpi-value">{{ total_orders }}</div>
      <div class="kpi-label">Total Orders</div>
    </div>
    <div class="kpi-card">
      <div class="kpi-value">{{ total_bills }}</div>
      <div class="kpi-label">Invoices</div>
    </div>
    <div class="kpi-card">
      <div class="kpi-value">₹{{ total_gst }}</div>
      <div class="kpi-label">Total GST Collected</div>
    </div>
  </div>

  <!-- Bills / Invoices -->
  {% if bills %}
  <div class="section">
    <div class="section-title">GST Invoices ({{ bills|length }})</div>
    <div class="summary-box">
      <div class="summary-grid">
        <div class="summary-item">
          <div class="label">Total Billed</div>
          <div class="value">₹{{ bill_total_amount }}</div>
        </div>
        <div class="summary-item">
          <div class="label">GST Collected</div>
          <div class="value">₹{{ total_gst }}</div>
        </div>
        <div class="summary-item">
          <div class="label">Outstanding</div>
          <div class="value">₹{{ bill_outstanding }}</div>
        </div>
      </div>
    </div>
    <table>
      <thead>
        <tr>
          <th>Invoice</th>
          <th>Order Ref</th>
          <th>Buyer</th>
          <th>Amount</th>
          <th>GST</th>
          <th>Total</th>
          <th>Status</th>
          <th>Date</th>
        </tr>
      </thead>
      <tbody>
        {% for bill in bills %}
        <tr>
          <td><strong>{{ bill.bill_ref }}</strong></td>
          <td>{{ bill.order_ref }}</td>
          <td>{{ bill.buyer_name }}</td>
          <td>₹{{ "%.0f"|format(bill.amount or 0) }}</td>
          <td>{{ bill.gst_rate or 5 }}% (₹{{ "%.0f"|format(bill.gst_amount or 0) }})</td>
          <td><strong>₹{{ "%.0f"|format(bill.total or 0) }}</strong></td>
          <td><span class="badge badge-{{ bill.status or 'pending' }}">{{ bill.status or "pending" }}</span></td>
          <td>{{ (bill.created_at or "")[:10] }}</td>
        </tr>
        {% endfor %}
      </tbody>
    </table>
  </div>
  {% endif %}

  <!-- Orders -->
  {% if orders %}
  <div class="section page-break">
    <div class="section-title">Orders ({{ orders|length }})</div>
    <table>
      <thead>
        <tr>
          <th>Order Ref</th>
          <th>Buyer</th>
          <th>Product</th>
          <th>Qty</th>
          <th>Amount</th>
          <th>Status</th>
          <th>Date</th>
        </tr>
      </thead>
      <tbody>
        {% for order in orders %}
        <tr>
          <td><strong>{{ order.order_ref }}</strong></td>
          <td>{{ order.buyer_name }}</td>
          <td>{{ order.product_name or "—" }}</td>
          <td>{{ order.quantity }}</td>
          <td>₹{{ "%.0f"|format(order.total_amount or 0) }}</td>
          <td><span class="badge badge-{{ order.status or 'pending' }}">{{ order.status or "pending" }}</span></td>
          <td>{{ (order.created_at or "")[:10] }}</td>
        </tr>
        {% endfor %}
      </tbody>
    </table>
  </div>
  {% endif %}

  <!-- Inventory -->
  {% if inventory %}
  <div class="section">
    <div class="section-title">Inventory ({{ inventory|length }} products)</div>
    <table>
      <thead>
        <tr>
          <th>Product</th>
          <th>Category</th>
          <th>Stock</th>
          <th>Unit</th>
          <th>Price/Unit</th>
          <th>Total Value</th>
          <th>Threshold</th>
        </tr>
      </thead>
      <tbody>
        {% for item in inventory %}
        <tr>
          <td><strong>{{ item.product_name }}</strong></td>
          <td>{{ item.category or "—" }}</td>
          <td>{{ item.current_stock or 0 }}</td>
          <td>{{ item.unit or "—" }}</td>
          <td>₹{{ "%.2f"|format(item.price_per_unit or 0) }}</td>
          <td>₹{{ "%.0f"|format((item.current_stock or 0) * (item.price_per_unit or 0)) }}</td>
          <td>{{ item.threshold or 0 }}</td>
        </tr>
        {% endfor %}
      </tbody>
    </table>
  </div>
  {% endif %}

  <!-- Footer -->
  <div class="report-footer">
    <div>
      <span class="footer-logo">Stash</span> — Voice-Native AI Supply Chain Platform<br>
      This report is computer-generated. For queries: helpline@stash.in
    </div>
    <div>Generated: {{ generated_at }}</div>
  </div>

</div>
</body>
</html>
"""


@router.get("/pdf")
async def export_pdf_report():
    """Generate and stream a full dashboard PDF report."""
    try:
        from weasyprint import HTML
        from jinja2 import Template
    except ImportError:
        raise HTTPException(status_code=500, detail="PDF generation unavailable (WeasyPrint not installed)")

    # Fetch data from Firestore
    bills_raw = await _fetch_collection("bills")
    orders_raw = await _fetch_collection("orders")
    inventory_raw = await _fetch_collection("inventory")

    # Numeric cleanup for bills
    bills = []
    for b in bills_raw:
        for k in ["amount", "gst_rate", "gst_amount", "total", "unit_price"]:
            if k in b and b[k] is not None:
                try:
                    b[k] = float(b[k])
                except Exception:
                    pass
        bills.append(b)

    # Numeric cleanup for orders
    orders = []
    for o in orders_raw:
        if "total_amount" in o and o["total_amount"] is not None:
            try:
                o["total_amount"] = float(o["total_amount"])
            except Exception:
                pass
        orders.append(o)

    # Numeric cleanup for inventory
    inventory = []
    for i in inventory_raw:
        for k in ["current_stock", "price_per_unit", "threshold"]:
            if k in i and i[k] is not None:
                try:
                    i[k] = float(i[k])
                except Exception:
                    pass
        inventory.append(i)

    # Compute KPIs
    total_orders = len(orders)
    total_bills = len(bills)
    total_revenue_val = sum(o.get("total_amount", 0) or 0 for o in orders)
    total_gst_val = sum(b.get("gst_amount", 0) or 0 for b in bills)
    bill_total_amount_val = sum(b.get("amount", 0) or 0 for b in bills)
    bill_outstanding_val = sum(
        b.get("total", 0) or 0 for b in bills if b.get("status") != "paid"
    )

    def fmt(val: float) -> str:
        return f"{val:,.0f}"

    template = Template(REPORT_TEMPLATE)
    html_content = template.render(
        generated_at=datetime.utcnow().strftime("%d %B %Y, %H:%M UTC"),
        total_orders=total_orders,
        total_bills=total_bills,
        total_revenue=fmt(total_revenue_val),
        total_gst=fmt(total_gst_val),
        bill_total_amount=fmt(bill_total_amount_val),
        bill_outstanding=fmt(bill_outstanding_val),
        bills=bills[:50],      # cap for PDF size
        orders=orders[:50],
        inventory=inventory[:50],
    )

    pdf_bytes = HTML(string=html_content).write_pdf()
    filename = f"stash_report_{datetime.utcnow().strftime('%Y%m%d_%H%M%S')}.pdf"

    return StreamingResponse(
        io.BytesIO(pdf_bytes),
        media_type="application/pdf",
        headers={"Content-Disposition": f'attachment; filename="{filename}"'},
    )
