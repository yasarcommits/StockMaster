import { useState, useEffect } from 'react';
import api from '../services/api';
import Layout from '../components/Layout';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowDownLeft,
  ArrowUpRight,
  ArrowRightLeft,
  Check,
  Loader2,
  History,
  Calendar,
  MapPin,
  Plus,
  AlertTriangle
} from 'lucide-react';
import clsx from 'clsx';

const Operations = () => {
  const [activeTab, setActiveTab] = useState("receipt");
  const [products, setProducts] = useState([]);
  const [locations, setLocations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [moveHistory, setMoveHistory] = useState([]);
  const [error, setError] = useState(null);

  // Form states
  const [receiptForm, setReceiptForm] = useState({
    supplier: "",
    items: [{ productId: "", quantity: "", locationId: "" }],
  });

  const [deliveryForm, setDeliveryForm] = useState({
    customer: "",
    items: [{ productId: "", quantity: "", locationId: "" }],
  });

  const [transferForm, setTransferForm] = useState({
    items: [{ productId: "", quantity: "", fromLocationId: "", toLocationId: "" }],
  });

  const [adjustmentForm, setAdjustmentForm] = useState({
    reason: "",
    items: [{ productId: "", locationId: "", newQuantity: "" }],
  });

  const fetchData = async () => {
    setLoading(true);
    try {
      const [productsRes, locationsRes, historyRes] = await Promise.all([
        api.get("/products"),
        api.get("/ops/locations"),
        api.get("/ops/history"),
      ]);
      setProducts(productsRes.data);
      setLocations(locationsRes.data);
      setMoveHistory(historyRes.data);
    } catch (err) {
      console.error("Fetch error:", err);
      setError("Failed to load data. Check backend.");
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleAddItem = (formType) => {
    if (formType === "receipt") {
      setReceiptForm({
        ...receiptForm,
        items: [...receiptForm.items, { productId: "", quantity: "", locationId: "" }],
      });
    } else if (formType === "delivery") {
      setDeliveryForm({
        ...deliveryForm,
        items: [...deliveryForm.items, { productId: "", quantity: "", locationId: "" }],
      });
    } else if (formType === "transfer") {
      setTransferForm({
        ...transferForm,
        items: [...transferForm.items, { productId: "", quantity: "", fromLocationId: "", toLocationId: "" }],
      });
    } else if (formType === "adjustment") {
      setAdjustmentForm({
        ...adjustmentForm,
        items: [...adjustmentForm.items, { productId: "", locationId: "", newQuantity: "" }],
      });
    }
  };

  const handleItemChange = (formType, index, field, value) => {
    const formMap = {
      receipt: receiptForm,
      delivery: deliveryForm,
      transfer: transferForm,
      adjustment: adjustmentForm,
    };

    const formSetter = {
      receipt: setReceiptForm,
      delivery: setDeliveryForm,
      transfer: setTransferForm,
      adjustment: setAdjustmentForm,
    };

    const form = formMap[formType];
    const newItems = [...form.items];
    newItems[index][field] = value;
    formSetter[formType]({ ...form, items: newItems });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      let endpoint = "";
      let payload = {};

      if (activeTab === "receipt") {
        endpoint = "/ops/receipts";
        payload = receiptForm;
      } else if (activeTab === "delivery") {
        endpoint = "/ops/deliveries";
        payload = deliveryForm;
      } else if (activeTab === "transfer") {
        endpoint = "/ops/transfers";
        payload = transferForm;
      } else if (activeTab === "adjustment") {
        endpoint = "/ops/adjustments";
        payload = {
          reason: adjustmentForm.reason,
          productId: adjustmentForm.items[0].productId,
          locationId: adjustmentForm.items[0].locationId,
          countedQuantity: adjustmentForm.items[0].newQuantity,
        };
      }

      await api.post(endpoint, payload);
      setSuccessMessage("Operation completed successfully");

      // reset
      setReceiptForm({ supplier: "", items: [{ productId: "", quantity: "", locationId: "" }] });
      setDeliveryForm({ customer: "", items: [{ productId: "", quantity: "", locationId: "" }] });
      setTransferForm({ items: [{ productId: "", quantity: "", fromLocationId: "", toLocationId: "" }] });
      setAdjustmentForm({ reason: "", items: [{ productId: "", locationId: "", newQuantity: "" }] });

      const historyRes = await api.get("/ops/history");
      setMoveHistory(historyRes.data);
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.error || "Operation failed");
    }

    setIsSubmitting(false);
  };

  const tabs = [
    { id: "receipt", label: "Stock In", icon: ArrowDownLeft },
    { id: "delivery", label: "Stock Out", icon: ArrowUpRight },
    { id: "transfer", label: "Transfer", icon: ArrowRightLeft },
    { id: "adjustment", label: "Adjustment", icon: AlertTriangle },
    { id: "history", label: "History", icon: History },
  ];

  return (
    <Layout>
      <div className="space-y-10">
        <h1 className="page-title">Operations</h1>

        {/* tabs */}
        <div className="flex space-x-2 bg-slate-900 p-2 rounded-2xl w-fit">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={clsx(
                "px-5 py-2 rounded-xl flex items-center gap-2",
                activeTab === tab.id ? "bg-indigo-600 text-white" : "text-gray-400"
              )}
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
            </button>
          ))}
        </div>

        <AnimatePresence mode="wait">
          {activeTab === "history" ? (
            <div className="glass-card p-6">
              <table className="w-full text-sm">
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Type</th>
                    <th>Product</th>
                    <th>Qty</th>
                    <th>From</th>
                    <th>To</th>
                  </tr>
                </thead>
                <tbody>
                  {moveHistory.map((m) => (
                    <tr key={m.id}>
                      <td>{new Date(m.createdAt).toLocaleString()}</td>
                      <td>{m.type}</td>
                      <td>{m.productId}</td>
                      <td>{m.quantity}</td>
                      <td>{m.fromLocationId || "-"}</td>
                      <td>{m.toLocationId || "-"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="glass-card p-6">
              {successMessage && (
                <div className="p-3 bg-green-600/20 border border-green-400 rounded-lg mb-4 text-green-300">
                  {successMessage}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-6">
                {/* COMMON UI FOR ITEMS */}
                {(activeTab === "receipt"
                  ? receiptForm.items
                  : activeTab === "delivery"
                  ? deliveryForm.items
                  : activeTab === "transfer"
                  ? transferForm.items
                  : adjustmentForm.items
                ).map((item, index) => (
                  <div key={index} className="grid grid-cols-1 md:grid-cols-4 gap-4 bg-slate-800 p-4 rounded-xl">

                    {/* PRODUCT */}
                    <div>
                      <label>Product</label>
                      <select
                        required
                        value={item.productId}
                        onChange={(e) => handleItemChange(activeTab, index, "productId", e.target.value)}
                        className="input-field"
                      >
                        <option value="">Select product</option>
                        {products.map((p) => (
                          <option key={p.id} value={p.id}>
                            {p.name} ({p.sku})
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* QTY */}
                    <div>
                      <label>Quantity</label>
                      <input
                        type="number"
                        required
                        value={item.quantity || item.newQuantity}
                        onChange={(e) =>
                          handleItemChange(
                            activeTab,
                            index,
                            activeTab === "adjustment" ? "newQuantity" : "quantity",
                            e.target.value
                          )
                        }
                        className="input-field"
                      />
                    </div>

                    {/* LOCATION FIELDS */}
                    {activeTab === "transfer" ? (
                      <>
                        <div>
                          <label>From Location</label>
                          <select
                            required
                            value={item.fromLocationId}
                            onChange={(e) => handleItemChange(activeTab, index, "fromLocationId", e.target.value)}
                            className="input-field"
                          >
                            <option value="">Select Location</option>
                            {locations.map((loc) => (
                              <option key={loc.id} value={loc.id}>
                                {loc.name}
                              </option>
                            ))}
                          </select>
                        </div>

                        <div>
                          <label>To Location</label>
                          <select
                            required
                            value={item.toLocationId}
                            onChange={(e) => handleItemChange(activeTab, index, "toLocationId", e.target.value)}
                            className="input-field"
                          >
                            <option value="">Select Location</option>
                            {locations.map((loc) => (
                              <option key={loc.id} value={loc.id}>
                                {loc.name}
                              </option>
                            ))}
                          </select>
                        </div>
                      </>
                    ) : (
                      <div>
                        <label>Location</label>
                        <select
                          required
                          value={item.locationId}
                          onChange={(e) => handleItemChange(activeTab, index, "locationId", e.target.value)}
                          className="input-field"
                        >
                          <option value="">Select Location</option>
                          {locations.map((loc) => (
                            <option key={loc.id} value={loc.id}>
                              {loc.name}
                            </option>
                          ))}
                        </select>
                      </div>
                    )}
                  </div>
                ))}

                <button
                  type="button"
                  onClick={() => handleAddItem(activeTab)}
                  className="px-3 py-2 bg-blue-700 rounded-lg text-white"
                >
                  <Plus className="w-4 h-4 inline" /> Add Item
                </button>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="btn-primary w-full mt-4"
                >
                  {isSubmitting ? <Loader2 className="animate-spin" /> : "Submit Operation"}
                </button>
              </form>
            </div>
          )}
        </AnimatePresence>
      </div>
    </Layout>
  );
};

export default Operations;
