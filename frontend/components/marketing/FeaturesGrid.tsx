"use client";
import { LuMic as Mic, LuPackage as Package, LuBrain as Brain, LuUsers as Users, LuShoppingCart as ShoppingCart, LuReceipt as Receipt, LuTruck as Truck, LuMessageSquare as MessageSquare, LuChartBar as BarChart3, LuLayers as Layers, LuWarehouse as Warehouse, LuGlobe as Globe } from 'react-icons/lu';
import { motion } from "framer-motion";

const features = [
  {
    icon: Mic,
    title: "Voice-First Operations",
    description:
      "Manage inventory, orders, and tasks using simple multilingual voice commands. Works in Hindi, English, and Hinglish.",
    accent: "#6B4226",
  },
  {
    icon: Package,
    title: "Smart Inventory Management",
    description:
      "Track real-time stock with automatic updates and discrepancy alerts. Voice-based stock entry and correction.",
    accent: "#8B5E3C",
  },
  {
    icon: Brain,
    title: "AI Stock Intelligence",
    description:
      "Predict demand 14 days ahead, prevent stockouts, and optimize reordering decisions using ML models.",
    accent: "#D4956A",
  },
  {
    icon: Users,
    title: "Supplier Automation",
    description:
      "Automatically place orders and coordinate with primary and backup suppliers via automated calls.",
    accent: "#6B4226",
  },
  {
    icon: ShoppingCart,
    title: "Voice-Based Order Management",
    description:
      "Enable buyers to place, track, and manage orders through voice. No app needed — just a phone call.",
    accent: "#8B5E3C",
  },
  {
    icon: Receipt,
    title: "Billing & Payments",
    description:
      "Generate GST invoices automatically, track credit per buyer, and automate payment reminders via Telegram.",
    accent: "#D4956A",
  },
  {
    icon: Truck,
    title: "Delivery Tracking",
    description:
      "Monitor order status and ensure timely delivery with automated follow-ups and ETA notifications.",
    accent: "#6B4226",
  },
  {
    icon: MessageSquare,
    title: "AI Negotiation & Control",
    description:
      "Handle price negotiations with a 4-tier strategy while maintaining margin rules with owner oversight.",
    accent: "#8B5E3C",
  },
  {
    icon: BarChart3,
    title: "Analytics & Reporting",
    description:
      "Insights on sales trends, top products, customer performance, and automated report generation.",
    accent: "#D4956A",
  },
  {
    icon: Layers,
    title: "Unified AI Intelligence",
    description:
      "All operations connected through a central AI system that learns and improves continuously.",
    accent: "#6B4226",
  },
  {
    icon: Warehouse,
    title: "Multi-Warehouse Management",
    description:
      "Manage multiple godowns under one account with consolidated stock visibility and inter-warehouse transfers.",
    accent: "#8B5E3C",
  },
  {
    icon: Globe,
    title: "22 Language Support",
    description:
      "Full interface translation for all 22 scheduled Indian languages. Voice processing in Hindi, English, and Hinglish.",
    accent: "#D4956A",
  },
];

export default function FeaturesGrid() {
  return (
    <section className="section section-alt" id="features-grid">
      <div className="container">
        <div className="section-header">
          <span className="section-badge">
            Features
          </span>
          <h2 className="section-title">
            Everything You Need to Run a Modern Godown
          </h2>
          <p className="section-desc">
            From voice-based inventory management to AI-powered demand
            forecasting — <span className="notranslate" translate="no">Stash</span> covers every aspect of godown operations.
          </p>
        </div>

        <motion.div 
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          variants={{
            visible: { transition: { staggerChildren: 0.1 } },
            hidden: {}
          }}
          className="grid-3"
        >
          {features.map((feature, i) => {
            const Icon = feature.icon;
            return (
              <motion.div
                key={i}
                variants={{
                  hidden: { opacity: 0, y: 30 },
                  visible: { opacity: 1, y: 0, transition: { duration: 0.5 } }
                }}
                className="feature-card"
                style={{ borderLeftWidth: "4px", borderLeftColor: feature.accent }}
              >
                <div
                  className="feature-icon-wrapper"
                  style={{ backgroundColor: `${feature.accent}15` }}
                >
                  <Icon size={20} style={{ color: feature.accent }} />
                </div>
                <h3 className="feature-title">
                  {feature.title}
                </h3>
                <p className="feature-desc">
                  {feature.description}
                </p>
              </motion.div>
            );
          })}
        </motion.div>
      </div>
    </section>
  );
}
