import Badge from "../ui/Badge";

const suppliers = [
  {
    name: "Anand Trading Co.",
    phone: "+91 98765 43210",
    product: "Basmati Rice",
    priority: 1,
    status: "active",
    lastContacted: "2 hours ago",
  },
  {
    name: "Patel & Sons Grains",
    phone: "+91 87654 32109",
    product: "Chana Dal",
    priority: 1,
    status: "active",
    lastContacted: "5 hours ago",
  },
  {
    name: "Sharma Commodities",
    phone: "+91 76543 21098",
    product: "Sugar",
    priority: 2,
    status: "active",
    lastContacted: "1 day ago",
  },
  {
    name: "Gupta Oil Mills",
    phone: "+91 65432 10987",
    product: "Groundnut Oil",
    priority: 1,
    status: "active",
    lastContacted: "3 hours ago",
  },
  {
    name: "Maharashtra Grains Ltd.",
    phone: "+91 54321 09876",
    product: "Wheat Flour",
    priority: 1,
    status: "inactive",
    lastContacted: "5 days ago",
  },
];

export default function SupplierTable() {
  return (
    <div className="dashboard-table-wrapper" style={{ marginTop: 0 }}>
      <div className="d-flex align-center justify-between" style={{ padding: '1rem 1.5rem', borderBottom: '1px solid var(--color-divider)' }}>
        <div>
          <h3 className="dashboard-card-title">
            Active Suppliers
          </h3>
          <p className="dashboard-card-subtitle">Top supplier connections</p>
        </div>
      </div>
      <div style={{ overflowX: 'auto' }}>
        <table className="dashboard-table">
          <thead>
            <tr>
              <th>
                Supplier
              </th>
              <th>
                Product
              </th>
              <th>
                Priority
              </th>
              <th>
                Status
              </th>
              <th>
                Last Contact
              </th>
            </tr>
          </thead>
          <tbody>
            {suppliers.map((sup, i) => (
              <tr key={i}>
                <td>
                  <div>
                    <p style={{ fontWeight: 500, color: 'var(--color-brand-800)' }}>{sup.name}</p>
                    <p style={{ fontSize: '0.75rem', color: 'var(--color-muted)' }}>{sup.phone}</p>
                  </div>
                </td>
                <td style={{ color: 'var(--color-brand-700)' }}>{sup.product}</td>
                <td>
                  <Badge
                    variant={sup.priority === 1 ? "default" : "outline"}
                    size="sm"
                  >
                    P{sup.priority}
                  </Badge>
                </td>
                <td>
                  <Badge
                    variant={sup.status === "active" ? "success" : "warning"}
                    dot
                    size="sm"
                  >
                    {sup.status}
                  </Badge>
                </td>
                <td style={{ color: 'var(--color-muted)' }}>{sup.lastContacted}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
