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
    <div className="bg-white rounded-[12px] border border-divider shadow-card overflow-hidden">
      <div className="px-6 py-4 border-b border-divider">
        <h3 className="text-lg font-semibold text-brand-800">
          Active Suppliers
        </h3>
        <p className="text-sm text-muted">Top supplier connections</p>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-surface">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-semibold text-muted uppercase tracking-wider">
                Supplier
              </th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-muted uppercase tracking-wider">
                Product
              </th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-muted uppercase tracking-wider">
                Priority
              </th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-muted uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-muted uppercase tracking-wider">
                Last Contact
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-divider">
            {suppliers.map((sup, i) => (
              <tr
                key={i}
                className="hover:bg-brand-50 transition-colors"
              >
                <td className="px-6 py-4">
                  <div>
                    <p className="font-medium text-brand-800">{sup.name}</p>
                    <p className="text-xs text-muted">{sup.phone}</p>
                  </div>
                </td>
                <td className="px-6 py-4 text-brand-700">{sup.product}</td>
                <td className="px-6 py-4">
                  <Badge
                    variant={sup.priority === 1 ? "default" : "outline"}
                    size="sm"
                  >
                    P{sup.priority}
                  </Badge>
                </td>
                <td className="px-6 py-4">
                  <Badge
                    variant={sup.status === "active" ? "success" : "warning"}
                    dot
                    size="sm"
                  >
                    {sup.status}
                  </Badge>
                </td>
                <td className="px-6 py-4 text-muted">{sup.lastContacted}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
