"use client";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { LuPrinter, LuDownload, LuSend, LuArrowLeft, LuCircleCheck, LuClock, LuTriangleAlert } from "react-icons/lu";
import { CLIENT_BACKEND_URL } from "@/lib/backend-url";

const API = CLIENT_BACKEND_URL;

interface Bill {
  id: string;
  bill_ref: string;
  order_ref: string;
  buyer_name: string;
  buyer_phone: string;
  buyer_address?: string;
  buyer_gstin?: string;
  product_name: string;
  category?: string;
  quantity: number;
  unit: string;
  unit_price: number;
  amount: number;
  gst_rate: number;
  gst_amount: number;
  total: number;
  status: "paid" | "pending" | "overdue";
  order_date?: string;
  created_at: string;
  is_intrastate?: boolean;
}

const statusConfig = {
  paid: { icon: LuCircleCheck, color: "#108548", bg: "#dcfce7", border: "#bbf7d0", label: "Paid" },
  pending: { icon: LuClock, color: "#f29900", bg: "#fef3c7", border: "#fde68a", label: "Pending" },
  overdue: { icon: LuTriangleAlert, color: "#d93025", bg: "#fee2e2", border: "#fecaca", label: "Overdue" },
};

function numberToWords(n: number): string {
  const ones = ["","One","Two","Three","Four","Five","Six","Seven","Eight","Nine","Ten","Eleven","Twelve","Thirteen","Fourteen","Fifteen","Sixteen","Seventeen","Eighteen","Nineteen"];
  const tens = ["","","Twenty","Thirty","Forty","Fifty","Sixty","Seventy","Eighty","Ninety"];
  function convert(num: number): string {
    if (num === 0) return "";
    if (num < 20) return ones[num];
    if (num < 100) return tens[Math.floor(num/10)] + (num%10 ? " "+ones[num%10] : "");
    if (num < 1000) return ones[Math.floor(num/100)]+" Hundred"+(num%100 ? " "+convert(num%100) : "");
    if (num < 100000) return convert(Math.floor(num/1000))+" Thousand"+(num%1000 ? " "+convert(num%1000) : "");
    if (num < 10000000) return convert(Math.floor(num/100000))+" Lakh"+(num%100000 ? " "+convert(num%100000) : "");
    return convert(Math.floor(num/10000000))+" Crore"+(num%10000000 ? " "+convert(num%10000000) : "");
  }
  const int = Math.floor(n);
  return "Rupees " + (convert(int) || "Zero") + " Only";
}

export default function BillPage() {
  const params = useParams();
  const billRef = params.bill_ref as string;
  const [bill, setBill] = useState<Bill | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [sharing, setSharing] = useState(false);
  const [shareSuccess, setShareSuccess] = useState(false);

  useEffect(() => {
    if (!billRef) return;
    fetch(`${API}/api/billing/${billRef}`)
      .then(r => { if (!r.ok) throw new Error("Bill not found"); return r.json(); })
      .then(data => { setBill(data); setLoading(false); })
      .catch(e => { setError(e.message); setLoading(false); });
  }, [billRef]);

  const handleDownloadPdf = () => {
    window.open(`${API}/api/billing/${billRef}/pdf`, "_blank");
  };

  const handlePrint = () => window.print();

  const handleTelegramShare = async () => {
    setSharing(true);
    try {
      const r = await fetch(`${API}/api/billing/${billRef}/telegram`, { method: "POST", headers: {"Content-Type":"application/json"}, body: "{}" });
      if (r.ok) { setShareSuccess(true); setTimeout(() => setShareSuccess(false), 3000); }
    } catch {} finally { setSharing(false); }
  };

  if (loading) return (
    <div style={{ minHeight:"100vh", display:"flex", alignItems:"center", justifyContent:"center", background:"#fdfcfb", fontFamily:"Inter,sans-serif" }}>
      <div style={{ textAlign:"center" }}>
        <div style={{ width:48, height:48, border:"3px solid #E2CDB0", borderTopColor:"#6B4226", borderRadius:"50%", animation:"spin 1s linear infinite", margin:"0 auto 16px" }} />
        <p style={{ color:"#9A7B5A", fontSize:14 }}>Loading invoice…</p>
      </div>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  );

  if (error || !bill) return (
    <div style={{ minHeight:"100vh", display:"flex", alignItems:"center", justifyContent:"center", background:"#fdfcfb", fontFamily:"Inter,sans-serif" }}>
      <div style={{ textAlign:"center", padding:40 }}>
        <div style={{ fontSize:48, marginBottom:16 }}>🧾</div>
        <h2 style={{ color:"#3d2616", marginBottom:8 }}>Invoice Not Found</h2>
        <p style={{ color:"#9A7B5A" }}>{error || "This invoice does not exist."}</p>
        <button onClick={() => history.back()} style={{ marginTop:24, padding:"10px 24px", background:"#6B4226", color:"white", border:"none", borderRadius:8, cursor:"pointer", fontWeight:600 }}>← Go Back</button>
      </div>
    </div>
  );

  const sc = statusConfig[bill.status] || statusConfig.pending;
  const StatusIcon = sc.icon;
  const isIntrastate = bill.is_intrastate !== false;
  const halfGst = bill.gst_amount / 2;

  return (
    <div style={{ minHeight:"100vh", background:"linear-gradient(135deg,#fdfcfb 0%,#f5f1ee 100%)", fontFamily:"Inter,-apple-system,sans-serif", padding:"2rem 1rem" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');
        @media print {
          .no-print { display: none !important; }
          body { background: white !important; padding: 0 !important; }
          .invoice-card { box-shadow: none !important; border: none !important; }
        }
        @keyframes fadeIn { from{opacity:0;transform:translateY(12px)} to{opacity:1;transform:translateY(0)} }
        @keyframes spin { to{transform:rotate(360deg)} }
      `}</style>

      {/* Action Bar */}
      <div className="no-print" style={{ maxWidth:820, margin:"0 auto 24px", display:"flex", alignItems:"center", justifyContent:"space-between", gap:12, flexWrap:"wrap" }}>
        <button onClick={() => history.back()} style={{ display:"flex", alignItems:"center", gap:8, padding:"10px 16px", background:"white", border:"1px solid #E2CDB0", borderRadius:10, cursor:"pointer", color:"#6B4226", fontWeight:600, fontSize:14, boxShadow:"0 1px 4px rgba(0,0,0,0.06)" }}>
          <LuArrowLeft size={16}/> Back
        </button>
        <div style={{ display:"flex", gap:10 }}>
          <button onClick={handleTelegramShare} disabled={sharing} style={{ display:"flex", alignItems:"center", gap:8, padding:"10px 18px", background:shareSuccess?"#108548":"#229ED9", color:"white", border:"none", borderRadius:10, cursor:"pointer", fontWeight:600, fontSize:14, opacity:sharing?0.7:1, transition:"all 0.2s" }}>
            <LuSend size={16}/>{sharing ? "Sending…" : shareSuccess ? "Sent! ✓" : "Telegram"}
          </button>
          <button onClick={handleDownloadPdf} style={{ display:"flex", alignItems:"center", gap:8, padding:"10px 18px", background:"white", border:"1px solid #6B4226", borderRadius:10, cursor:"pointer", color:"#6B4226", fontWeight:600, fontSize:14, boxShadow:"0 1px 4px rgba(0,0,0,0.06)" }}>
            <LuDownload size={16}/> Download PDF
          </button>
          <button onClick={handlePrint} style={{ display:"flex", alignItems:"center", gap:8, padding:"10px 18px", background:"linear-gradient(135deg,#6B4226,#8B5E3C)", color:"white", border:"none", borderRadius:10, cursor:"pointer", fontWeight:600, fontSize:14 }}>
            <LuPrinter size={16}/> Print
          </button>
        </div>
      </div>

      {/* Invoice Card */}
      <div className="invoice-card" style={{ maxWidth:820, margin:"0 auto", background:"white", borderRadius:20, boxShadow:"0 20px 60px rgba(107,66,38,0.12)", border:"1px solid #E2CDB0", overflow:"hidden", animation:"fadeIn 0.4s ease-out" }}>

        {/* Header */}
        <div style={{ background:"linear-gradient(135deg,#3d2616 0%,#6B4226 60%,#8B5E3C 100%)", padding:"32px 40px", display:"flex", justifyContent:"space-between", alignItems:"flex-start" }}>
          <div>
            <div style={{ display:"flex", alignItems:"center", gap:12, marginBottom:12 }}>
              <div style={{ width:44, height:44, background:"rgba(255,255,255,0.15)", borderRadius:10, display:"flex", alignItems:"center", justifyContent:"center", fontWeight:800, fontSize:22, color:"white", border:"1px solid rgba(255,255,255,0.25)" }}>S</div>
              <div>
                <div style={{ fontSize:24, fontWeight:800, color:"white", letterSpacing:-0.5 }}>Stash</div>
                <div style={{ fontSize:10, color:"rgba(255,255,255,0.65)", textTransform:"uppercase", letterSpacing:1.5 }}>Voice-Native AI Supply Chain</div>
              </div>
            </div>
            <div style={{ display:"inline-block", padding:"3px 12px", background:"rgba(255,255,255,0.12)", borderRadius:6, fontSize:10, color:"rgba(255,255,255,0.8)", fontWeight:600, letterSpacing:0.5, border:"1px solid rgba(255,255,255,0.2)" }}>
              GSTIN: 27AABCS1429B1Z6
            </div>
          </div>
          <div style={{ textAlign:"right" }}>
            <div style={{ fontSize:10, textTransform:"uppercase", letterSpacing:2, color:"rgba(255,255,255,0.6)", fontWeight:600, marginBottom:6 }}>Tax Invoice</div>
            <div style={{ fontSize:24, fontWeight:800, color:"white" }}>{bill.bill_ref}</div>
            <div style={{ fontSize:12, color:"rgba(255,255,255,0.7)", marginTop:4 }}>
              {new Date(bill.created_at).toLocaleDateString("en-IN", {day:"2-digit", month:"long", year:"numeric"})}
            </div>
            <div style={{ display:"inline-flex", alignItems:"center", gap:6, marginTop:10, padding:"4px 12px", background:sc.bg, borderRadius:20, border:`1px solid ${sc.border}` }}>
              <StatusIcon size={12} color={sc.color} />
              <span style={{ fontSize:10, fontWeight:700, color:sc.color, textTransform:"uppercase", letterSpacing:1 }}>{sc.label}</span>
            </div>
          </div>
        </div>

        <div style={{ padding:"32px 40px" }}>
          {/* Bill To / Order Details */}
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:20, marginBottom:32 }}>
            <div style={{ background:"#FAF6F1", borderRadius:12, padding:"18px 20px", border:"1px solid #E2CDB0" }}>
              <div style={{ fontSize:9, textTransform:"uppercase", letterSpacing:1.5, color:"#9A7B5A", fontWeight:700, marginBottom:10 }}>Bill To</div>
              <div style={{ fontSize:16, fontWeight:700, color:"#3d2616", marginBottom:4 }}>{bill.buyer_name}</div>
              <div style={{ fontSize:12, color:"#5C3D1E" }}>{bill.buyer_phone}</div>
              {bill.buyer_address && <div style={{ fontSize:12, color:"#5C3D1E", marginTop:2 }}>{bill.buyer_address}</div>}
              {bill.buyer_gstin && <div style={{ fontSize:11, color:"#9A7B5A", marginTop:4 }}>GSTIN: {bill.buyer_gstin}</div>}
            </div>
            <div style={{ background:"#FAF6F1", borderRadius:12, padding:"18px 20px", border:"1px solid #E2CDB0" }}>
              <div style={{ fontSize:9, textTransform:"uppercase", letterSpacing:1.5, color:"#9A7B5A", fontWeight:700, marginBottom:10 }}>Order Details</div>
              <div style={{ display:"flex", flexDirection:"column", gap:4 }}>
                {[["Order Ref", bill.order_ref],["Order Date", bill.order_date || bill.created_at.slice(0,10)],["Place of Supply","Maharashtra (27)"],["Supply Type","B2B – Intra-state"]].map(([k,v]) => (
                  <div key={k} style={{ display:"flex", justifyContent:"space-between", fontSize:12 }}>
                    <span style={{ color:"#9A7B5A" }}>{k}</span>
                    <span style={{ color:"#3d2616", fontWeight:600 }}>{v}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Items Table */}
          <div style={{ fontSize:9, textTransform:"uppercase", letterSpacing:1.5, color:"#9A7B5A", fontWeight:700, marginBottom:10 }}>Items</div>
          <div style={{ borderRadius:12, overflow:"hidden", border:"1px solid #E2CDB0", marginBottom:24 }}>
            <table style={{ width:"100%", borderCollapse:"collapse" }}>
              <thead>
                <tr style={{ background:"linear-gradient(135deg,#6B4226,#8B5E3C)" }}>
                  {["#","Description","HSN Code","Qty","Rate (₹)","Amount (₹)"].map(h => (
                    <th key={h} style={{ padding:"11px 14px", fontSize:10, textTransform:"uppercase", letterSpacing:0.8, fontWeight:600, color:"white", textAlign:"left" }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td style={{ padding:"12px 14px", fontSize:13, color:"#3d2616", borderBottom:"1px solid #E2CDB0" }}>1</td>
                  <td style={{ padding:"12px 14px", borderBottom:"1px solid #E2CDB0" }}>
                    <div style={{ fontSize:13, fontWeight:600, color:"#3d2616" }}>{bill.product_name}</div>
                    <div style={{ fontSize:10, color:"#9A7B5A", marginTop:2 }}>Category: {bill.category || "Agricultural"}</div>
                  </td>
                  <td style={{ padding:"12px 14px", fontSize:12, color:"#5C3D1E", borderBottom:"1px solid #E2CDB0" }}>10019900</td>
                  <td style={{ padding:"12px 14px", fontSize:12, color:"#5C3D1E", borderBottom:"1px solid #E2CDB0" }}>{bill.quantity} {bill.unit}</td>
                  <td style={{ padding:"12px 14px", fontSize:12, color:"#5C3D1E", borderBottom:"1px solid #E2CDB0" }}>₹{bill.unit_price.toLocaleString("en-IN", {minimumFractionDigits:2})}</td>
                  <td style={{ padding:"12px 14px", fontSize:13, fontWeight:600, color:"#3d2616", borderBottom:"1px solid #E2CDB0" }}>₹{bill.amount.toLocaleString("en-IN", {minimumFractionDigits:2})}</td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Amount in Words */}
          <div style={{ background:"linear-gradient(135deg,#6B4226,#8B5E3C)", borderRadius:10, padding:"12px 18px", marginBottom:24, color:"white", fontSize:12 }}>
            <strong>Amount in Words:</strong> {numberToWords(bill.total)}
          </div>

          {/* Totals + Tax Note */}
          <div style={{ display:"flex", justifyContent:"flex-end", marginBottom:24 }}>
            <div style={{ width:300, borderRadius:12, overflow:"hidden", border:"1px solid #E2CDB0" }}>
              {[
                { label:"Subtotal", value:`₹${bill.amount.toLocaleString("en-IN",{minimumFractionDigits:2})}`, bold:false, bg:"#FAF6F1" },
                ...(isIntrastate ? [
                  { label:`CGST @ ${bill.gst_rate/2}%`, value:`₹${halfGst.toLocaleString("en-IN",{minimumFractionDigits:2})}`, bold:false, bg:"white" },
                  { label:`SGST @ ${bill.gst_rate/2}%`, value:`₹${halfGst.toLocaleString("en-IN",{minimumFractionDigits:2})}`, bold:false, bg:"#fdfcfb" },
                ] : [
                  { label:`IGST @ ${bill.gst_rate}%`, value:`₹${bill.gst_amount.toLocaleString("en-IN",{minimumFractionDigits:2})}`, bold:false, bg:"white" },
                ]),
              ].map((row, i) => (
                <div key={i} style={{ display:"flex", justifyContent:"space-between", padding:"10px 16px", background:row.bg, borderBottom:"1px solid #E2CDB0", fontSize:13 }}>
                  <span style={{ color:"#5C3D1E" }}>{row.label}</span>
                  <span style={{ color:"#3d2616", fontWeight:row.bold?700:500 }}>{row.value}</span>
                </div>
              ))}
              <div style={{ display:"flex", justifyContent:"space-between", padding:"14px 16px", background:"linear-gradient(135deg,#6B4226,#8B5E3C)" }}>
                <span style={{ color:"white", fontWeight:800, fontSize:15 }}>Total</span>
                <span style={{ color:"white", fontWeight:800, fontSize:15 }}>₹{bill.total.toLocaleString("en-IN",{minimumFractionDigits:2})}</span>
              </div>
            </div>
          </div>

          {/* Tax breakdown */}
          <div style={{ background:"#FAF6F1", border:"1px solid #E2CDB0", borderRadius:10, padding:"12px 18px", marginBottom:24, fontSize:12, color:"#5C3D1E" }}>
            <strong style={{ color:"#3d2616" }}>GST Breakdown: </strong>
            Taxable Value: ₹{bill.amount.toLocaleString("en-IN")} | GST Rate: {bill.gst_rate}% ({isIntrastate ? "CGST+SGST" : "IGST"}) | GST Amount: ₹{bill.gst_amount.toLocaleString("en-IN")} |{" "}
            <strong style={{ color:"#6B4226" }}>Grand Total: ₹{bill.total.toLocaleString("en-IN")}</strong>
          </div>

          {/* Payment Info */}
          <div style={{ background:"#FAF6F1", border:"1px solid #E2CDB0", borderRadius:12, padding:"18px 20px", marginBottom:24 }}>
            <div style={{ fontSize:9, textTransform:"uppercase", letterSpacing:1.5, color:"#9A7B5A", fontWeight:700, marginBottom:12 }}>Payment Information</div>
            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12 }}>
              {[["Bank","State Bank of India"],["Account No.","XXXX XXXX 4829"],["IFSC","SBIN0001234"],["UPI ID","stash@sbi"]].map(([k,v]) => (
                <div key={k}>
                  <div style={{ fontSize:10, color:"#9A7B5A" }}>{k}</div>
                  <div style={{ fontSize:13, color:"#3d2616", fontWeight:500, marginTop:2 }}>{v}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Footer */}
          <div style={{ paddingTop:20, borderTop:"1px solid #E2CDB0", display:"flex", justifyContent:"space-between", alignItems:"flex-end" }}>
            <div style={{ fontSize:10, color:"#9A7B5A", lineHeight:1.8 }}>
              <div>This is a computer-generated invoice. No physical signature required.</div>
              <div>For queries: helpline@stash.in | +91 98765 00000</div>
              <div>Payment due within 30 days. Subject to Maharashtra jurisdiction.</div>
            </div>
            <div style={{ textAlign:"right" }}>
              <div style={{ width:140, borderTop:"1px solid #9A7B5A", marginBottom:4 }} />
              <div style={{ fontSize:10, color:"#9A7B5A" }}>Authorised Signatory</div>
              <div style={{ fontSize:11, fontWeight:700, color:"#6B4226" }}>Stash AI Supply Chain</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
