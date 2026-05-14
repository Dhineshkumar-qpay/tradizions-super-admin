import React, { useState } from "react";
import Card, { CardHeader, CardContent } from "../../components/ui/Card";
import { stats, recentOrders } from "../../data/mockData";
import {
  Users,
  Store,
  ShoppingBag,
  DollarSign,
  ArrowUpRight,
  ArrowDownRight,
  MoreHorizontal,
  ExternalLink,
  BarChart3,
  Gift,
  ChevronRight,
  Search,
  Bell,
  LogOut,
  User,
  Moon,
  Sun,
  Calendar,
  Layers,
  Box,
  CheckCircle2,
  AlertCircle,
  Share2,
  Edit,
  Tag,
  ShieldCheck,
  Clock,
  Trash2,
  TrendingUp,
  AlertTriangle,
  RotateCcw,
  Plus,
  Sliders,
  CheckSquare,
  Square,
  Package,
} from "lucide-react";
import Badge from "../../components/ui/Badge";
import Button from "../../components/ui/Button";
import { toast } from "react-toastify";

const iconMap = {
  Users: Users,
  Store: Store,
  ShoppingBag: ShoppingBag,
  DollarSign: DollarSign,
};

const initialInventory = [
  {
    id: 101,
    name: "Organic Pearl Millet (Bajra)",
    sku: "MT-101",
    batchNo: "BATCH-2026-A1",
    expiryDate: "2026-12-30",
    stock: 120,
    soldDaily: 14,
    soldWeekly: 85,
    soldMonthly: 340,
    threshold: 20,
    price: "₹120",
    image: "https://picsum.photos/seed/bajra/100/100",
  },
  {
    id: 102,
    name: "Finger Millet (Ragi)",
    sku: "MT-102",
    batchNo: "BATCH-2026-B2",
    expiryDate: "2026-10-15",
    stock: 12,
    soldDaily: 28,
    soldWeekly: 140,
    soldMonthly: 520,
    threshold: 25,
    price: "₹150",
    image: "https://picsum.photos/seed/ragi/100/100",
  },
  {
    id: 103,
    name: "Foxtail Millet Packs",
    sku: "MT-103",
    batchNo: "BATCH-2026-C3",
    expiryDate: "2026-08-20",
    stock: 0,
    soldDaily: 5,
    soldWeekly: 45,
    soldMonthly: 180,
    threshold: 15,
    price: "₹180",
    image: "https://picsum.photos/seed/foxtail/100/100",
  },
  {
    id: 104,
    name: "Premium Millet Cookies",
    sku: "MT-104",
    batchNo: "BATCH-2026-D4",
    expiryDate: "2026-07-10",
    stock: 8,
    soldDaily: 35,
    soldWeekly: 210,
    soldMonthly: 890,
    threshold: 30,
    price: "₹90",
    image: "https://picsum.photos/seed/cookies/100/100",
  },
  {
    id: 105,
    name: "Little Millet Grains",
    sku: "MT-105",
    batchNo: "BATCH-2026-E5",
    expiryDate: "2027-01-12",
    stock: 95,
    soldDaily: 10,
    soldWeekly: 60,
    soldMonthly: 250,
    threshold: 20,
    price: "₹160",
    image: "https://picsum.photos/seed/little/100/100",
  },
];

const bestSellersMock = [
  {
    name: "Finger Millet (Ragi)",
    sales: "520 Units Sold",
    revenue: "₹78,000",
    trend: "+24%",
  },
  {
    name: "Organic Pearl Millet",
    sales: "340 Units Sold",
    revenue: "₹40,800",
    trend: "+18%",
  },
  {
    name: "Premium Millet Cookies",
    sales: "890 Units Sold",
    revenue: "₹80,100",
    trend: "+42%",
  },
];

const Dashboard = () => {
  const [activeTab, setActiveTab] = useState("overview"); // overview, inventory
  const [inventory, setInventory] = useState(initialInventory);
  const [stockFilter, setStockFilter] = useState("all"); // all, inStock, outOfStock, lowStock
  const [selectedProducts, setSelectedProducts] = useState([]);
  const [editingStockId, setEditingStockId] = useState(null);
  const [newStockValue, setNewStockValue] = useState("");

  const handleSimulateOrder = (id) => {
    setInventory((prev) =>
      prev.map((item) => {
        if (item.id === id) {
          const reducedStock = Math.max(0, item.stock - 1);
          const increasedDaily = item.soldDaily + 1;
          const increasedWeekly = item.soldWeekly + 1;
          const increasedMonthly = item.soldMonthly + 1;
          if (reducedStock === 0) {
            toast.error(`Auto alert: ${item.name} is now Out of Stock!`);
          } else if (reducedStock <= item.threshold) {
            toast.warn(`Low stock trigger: ${item.name} dropped to ${reducedStock} units.`);
          }
          return {
            ...item,
            stock: reducedStock,
            soldDaily: increasedDaily,
            soldWeekly: increasedWeekly,
            soldMonthly: increasedMonthly,
          };
        }
        return item;
      }),
    );
    toast.success("Simulated Order: Automatic stock deduction applied.");
  };

  const handleUpdateStock = (id, value) => {
    const numericVal = parseInt(value);
    if (isNaN(numericVal) || numericVal < 0) {
      toast.error("Please enter a valid stock quantity");
      return;
    }
    setInventory((prev) =>
      prev.map((item) => (item.id === id ? { ...item, stock: numericVal } : item)),
    );
    toast.success("Manual stock quantity updated successfully");
    setEditingStockId(null);
    setNewStockValue("");
  };

  const handleBulkAddStock = () => {
    if (selectedProducts.length === 0) {
      toast.error("Please select at least one product for bulk stock refill.");
      return;
    }
    setInventory((prev) =>
      prev.map((item) =>
        selectedProducts.includes(item.id)
          ? { ...item, stock: item.stock + 50 }
          : item,
      ),
    );
    toast.success(`Successfully refilled +50 units to ${selectedProducts.length} selected batches.`);
    setSelectedProducts([]);
  };

  const toggleSelectAll = () => {
    if (selectedProducts.length === inventory.length) {
      setSelectedProducts([]);
    } else {
      setSelectedProducts(inventory.map((item) => item.id));
    }
  };

  const toggleSelectProduct = (id) => {
    if (selectedProducts.includes(id)) {
      setSelectedProducts(selectedProducts.filter((pid) => pid !== id));
    } else {
      setSelectedProducts([...selectedProducts, id]);
    }
  };

  const filteredInventory = inventory.filter((item) => {
    if (stockFilter === "inStock") return item.stock > item.threshold;
    if (stockFilter === "lowStock") return item.stock > 0 && item.stock <= item.threshold;
    if (stockFilter === "outOfStock") return item.stock === 0;
    return true;
  });

  const lowStockItems = inventory.filter(
    (item) => item.stock > 0 && item.stock <= item.threshold,
  );
  const outOfStockItems = inventory.filter((item) => item.stock === 0);

  return (
    <div className="space-y-6 animate-in fade-in duration-500 pb-12">
      {/* Top Header & Tab Controllers */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-4 rounded-xl shadow-xs border border-border">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">
            Dashboard & Real-time Operations
          </h1>
          <p className="text-xs text-gray-500 mt-0.5 font-medium">
            Master KPI analytics, sales tracking, and real-time batch-wise inventory.
          </p>
        </div>

        {/* View Switch Buttons */}
        <div className="flex bg-gray-50 p-1 rounded-lg border border-border gap-1">
          <button
            onClick={() => setActiveTab("overview")}
            className={`px-4 py-2 text-xs font-bold rounded-md transition-all cursor-pointer flex items-center gap-1.5 ${activeTab === "overview"
                ? "bg-primary text-white shadow-xs"
                : "text-gray-600 hover:text-primary"
              }`}
          >
            <BarChart3 className="w-3.5 h-3.5" /> Dashboard Overview
          </button>
          <button
            onClick={() => setActiveTab("inventory")}
            className={`px-4 py-2 text-xs font-bold rounded-md transition-all cursor-pointer flex items-center gap-1.5 ${activeTab === "inventory"
                ? "bg-primary text-white shadow-xs"
                : "text-gray-600 hover:text-primary"
              }`}
          >
            <Package className="w-3.5 h-3.5" /> Stock & Inventory Management
            {(lowStockItems.length > 0 || outOfStockItems.length > 0) && (
              <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping"></span>
            )}
          </button>
        </div>
      </div>

      {activeTab === "overview" && (
        <div className="space-y-6 animate-in fade-in duration-300">
          {/* Main 4 KPI Stat Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {stats.map((item, index) => {
              const Icon = iconMap[item.icon] || Users;
              const isPositive = item.change.startsWith("+");
              return (
                <Card
                  key={index}
                  className="hover:border-primary/30 transition-colors shadow-xs"
                >
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                        <Icon className="w-5 h-5" />
                      </div>
                      <div
                        className={`flex items-center text-[10px] font-bold px-2 py-0.5 rounded-full ${isPositive
                            ? "bg-emerald-50 text-emerald-600"
                            : "bg-rose-50 text-rose-600"
                          }`}
                      >
                        {item.change}
                        {isPositive ? (
                          <ArrowUpRight className="w-3 h-3 ml-0.5" />
                        ) : (
                          <ArrowDownRight className="w-3 h-3 ml-0.5" />
                        )}
                      </div>
                    </div>
                    <div>
                      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                        {item.label}
                      </p>
                      <h3 className="text-xl font-black text-gray-900 mt-0.5">
                        {item.value}
                      </h3>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* Left Column: Best Sellers & Low Stock Alerts (Cols 1-5) */}
            <div className="lg:col-span-5 space-y-6">
              {/* Best Selling Products Card */}
              <Card className="shadow-xs border border-border">
                <CardHeader
                  title="Best-Selling Products"
                  description="Top volume generators by sales revenue"
                  className="p-4 border-b border-border bg-gray-50/50"
                />
                <div className="p-4 divide-y divide-border">
                  {bestSellersMock.map((prod, idx) => (
                    <div
                      key={idx}
                      className="py-3 flex items-center justify-between group"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center font-bold text-xs text-primary shrink-0">
                          #{idx + 1}
                        </div>
                        <div>
                          <p className="font-bold text-xs text-gray-900 group-hover:text-primary transition-colors">
                            {prod.name}
                          </p>
                          <p className="text-[10px] font-semibold text-gray-500">
                            {prod.sales}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-black text-xs text-primary">
                          {prod.revenue}
                        </p>
                        <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded">
                          {prod.trend}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>

              {/* Low Stock Alerts Card */}
              <Card className="shadow-xs border border-rose-100 bg-rose-50/10">
                <div className="p-4 bg-rose-50/80 border-b border-rose-100 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 text-rose-600 animate-pulse" />
                    <h3 className="text-xs font-bold text-rose-900 uppercase tracking-wider">
                      Low Stock Alerts ({lowStockItems.length + outOfStockItems.length})
                    </h3>
                  </div>
                  <Button
                    onClick={() => setActiveTab("inventory")}
                    variant="ghost"
                    size="sm"
                    className="text-[10px] text-rose-700 hover:bg-rose-100"
                  >
                    View All Stock
                  </Button>
                </div>

                <div className="p-4 divide-y divide-rose-100/60">
                  {outOfStockItems.map((item) => (
                    <div
                      key={item.id}
                      className="py-2.5 flex items-center justify-between"
                    >
                      <div>
                        <p className="text-xs font-bold text-gray-900">
                          {item.name}
                        </p>
                        <p className="text-[10px] text-gray-500 font-semibold">
                          Batch: {item.batchNo}
                        </p>
                      </div>
                      <Badge variant="danger" className="text-[9px] font-bold py-0.5 px-2">
                        Out of Stock (0)
                      </Badge>
                    </div>
                  ))}

                  {lowStockItems.map((item) => (
                    <div
                      key={item.id}
                      className="py-2.5 flex items-center justify-between"
                    >
                      <div>
                        <p className="text-xs font-bold text-gray-900">
                          {item.name}
                        </p>
                        <p className="text-[10px] text-gray-500 font-semibold">
                          Batch: {item.batchNo}
                        </p>
                      </div>
                      <Badge variant="warning" className="text-[9px] font-bold py-0.5 px-2">
                        Low Stock ({item.stock})
                      </Badge>
                    </div>
                  ))}

                  {lowStockItems.length === 0 && outOfStockItems.length === 0 && (
                    <div className="py-6 text-center text-xs text-emerald-600 font-bold">
                      All inventory batches are optimally stocked!
                    </div>
                  )}
                </div>
              </Card>
            </div>

            {/* Right Column: Quick Actions & Recent Orders Table (Cols 6-12) */}
            <div className="lg:col-span-7 space-y-6">
              <Card className="shadow-xs border border-border">
                <CardHeader
                  title="Quick Actions"
                  description="Common administrative tasks"
                  className="p-4 border-b border-border bg-gray-50/50"
                />
                <CardContent className="p-4 space-y-3">
                  <button className="w-full flex items-center justify-between p-3 rounded-lg border border-border hover:border-accent hover:bg-accent/5 transition-all group text-left cursor-pointer">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-accent/10 flex items-center justify-center text-accent">
                        <Store className="w-4 h-4" />
                      </div>
                      <div>
                        <p className="font-bold text-xs text-gray-900 group-hover:text-accent transition-colors">
                          Approve Merchants
                        </p>
                        <p className="text-[10px] text-gray-500 font-semibold">
                          3 pending onboarding applications
                        </p>
                      </div>
                    </div>
                    <ChevronRight className="w-4 h-4 text-gray-300 group-hover:text-accent" />
                  </button>
                  <button className="w-full flex items-center justify-between p-3 rounded-lg border border-border hover:border-primary hover:bg-primary/5 transition-all group text-left cursor-pointer">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                        <Gift className="w-4 h-4" />
                      </div>
                      <div>
                        <p className="font-bold text-xs text-gray-900 group-hover:text-primary transition-colors">
                          Create Gift Hamper
                        </p>
                        <p className="text-[10px] text-gray-500 font-semibold">
                          Design seasonal combo offerings
                        </p>
                      </div>
                    </div>
                    <ChevronRight className="w-4 h-4 text-gray-300 group-hover:text-primary" />
                  </button>
                  <button className="w-full flex items-center justify-between p-3 rounded-lg border border-border hover:border-blue-600 hover:bg-blue-50 transition-all group text-left cursor-pointer">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center text-blue-600">
                        <BarChart3 className="w-4 h-4" />
                      </div>
                      <div>
                        <p className="font-bold text-xs text-gray-900 group-hover:text-blue-600 transition-colors">
                          View Reports & Analytics
                        </p>
                        <p className="text-[10px] text-gray-500 font-semibold">
                          Monthly sales and audit logs
                        </p>
                      </div>
                    </div>
                    <ChevronRight className="w-4 h-4 text-gray-300 group-hover:text-blue-600" />
                  </button>
                </CardContent>
              </Card>

              {/* Recent Orders Table */}
              <Card className="shadow-xs border border-border">
                <CardHeader
                  title="Recent Orders"
                  description="Latest transaction logs"
                  className="p-4 border-b border-border bg-gray-50/50"
                >
                  <Button variant="ghost" size="sm" className="h-8 text-xs font-bold">
                    View All
                  </Button>
                </CardHeader>
                <div className="overflow-x-auto">
                  <table className="w-full text-left">
                    <thead>
                      <tr className="bg-gray-50 border-b border-border">
                        <th className="px-4 py-3 text-[10px] font-bold text-gray-500 uppercase tracking-wider">
                          Order ID
                        </th>
                        <th className="px-4 py-3 text-[10px] font-bold text-gray-500 uppercase tracking-wider">
                          User
                        </th>
                        <th className="px-4 py-3 text-[10px] font-bold text-gray-500 uppercase tracking-wider">
                          Amount
                        </th>
                        <th className="px-4 py-3 text-[10px] font-bold text-gray-500 uppercase tracking-wider">
                          Status
                        </th>
                        <th className="px-4 py-3 text-[10px] font-bold text-gray-500 uppercase tracking-wider text-right">
                          Action
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                      {recentOrders.slice(0, 4).map((order) => (
                        <tr
                          key={order.id}
                          className="hover:bg-gray-50/50 transition-colors"
                        >
                          <td className="px-4 py-3 text-xs font-bold text-gray-900">
                            {order.id}
                          </td>
                          <td className="px-4 py-3 text-xs text-gray-600 font-semibold">
                            {order.user}
                          </td>
                          <td className="px-4 py-3 text-xs font-bold text-gray-900">
                            {order.amount}
                          </td>
                          <td className="px-4 py-3">
                            <Badge
                              className="text-[10px] px-2 py-0.5 font-bold"
                              variant={
                                order.status === "Delivered"
                                  ? "success"
                                  : order.status === "Processing"
                                    ? "warning"
                                    : order.status === "Cancelled"
                                      ? "danger"
                                      : "gray"
                              }
                            >
                              {order.status}
                            </Badge>
                          </td>
                          <td className="px-4 py-3 text-right">
                            <button className="p-1 hover:bg-gray-100 rounded text-gray-400 hover:text-primary transition-all cursor-pointer">
                              <ExternalLink className="w-3.5 h-3.5" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </Card>
            </div>
          </div>
        </div>
      )}

      {activeTab === "inventory" && (
        <div className="space-y-6 animate-in fade-in duration-300">
          {/* Inventory Summary Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <Card className="bg-white shadow-xs border border-border">
              <CardContent className="p-4 flex items-center justify-between">
                <div>
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                    Total Tracked Batches
                  </p>
                  <h3 className="text-xl font-black text-gray-900 mt-1">
                    {inventory.length}
                  </h3>
                </div>
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                  <Box className="w-5 h-5" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white shadow-xs border border-border">
              <CardContent className="p-4 flex items-center justify-between">
                <div>
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                    In-Stock Batches
                  </p>
                  <h3 className="text-xl font-black text-emerald-600 mt-1">
                    {inventory.filter((i) => i.stock > i.threshold).length}
                  </h3>
                </div>
                <div className="w-10 h-10 rounded-lg bg-emerald-50 flex items-center justify-center text-emerald-600">
                  <CheckCircle2 className="w-5 h-5" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white shadow-xs border border-border">
              <CardContent className="p-4 flex items-center justify-between">
                <div>
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                    Low Stock Alerts
                  </p>
                  <h3 className="text-xl font-black text-amber-600 mt-1">
                    {lowStockItems.length}
                  </h3>
                </div>
                <div className="w-10 h-10 rounded-lg bg-amber-50 flex items-center justify-center text-amber-600">
                  <AlertTriangle className="w-5 h-5" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white shadow-xs border border-border">
              <CardContent className="p-4 flex items-center justify-between">
                <div>
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                    Out of Stock Batches
                  </p>
                  <h3 className="text-xl font-black text-rose-600 mt-1">
                    {outOfStockItems.length}
                  </h3>
                </div>
                <div className="w-10 h-10 rounded-lg bg-rose-50 flex items-center justify-center text-rose-600">
                  <AlertCircle className="w-5 h-5" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Interactive Inventory Table Card */}
          <Card className="shadow-xs border border-border">
            <div className="p-4 bg-white border-b border-border flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0">
                <button
                  onClick={() => setStockFilter("all")}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${stockFilter === "all"
                      ? "bg-primary text-white shadow-2xs font-extrabold"
                      : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                    }`}
                >
                  All Batches ({inventory.length})
                </button>
                <button
                  onClick={() => setStockFilter("inStock")}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${stockFilter === "inStock"
                      ? "bg-emerald-600 text-white shadow-2xs font-extrabold"
                      : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                    }`}
                >
                  Sufficient ({inventory.filter((i) => i.stock > i.threshold).length})
                </button>
                <button
                  onClick={() => setStockFilter("lowStock")}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${stockFilter === "lowStock"
                      ? "bg-amber-500 text-white shadow-2xs font-extrabold"
                      : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                    }`}
                >
                  Low Stock ({lowStockItems.length})
                </button>
                <button
                  onClick={() => setStockFilter("outOfStock")}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${stockFilter === "outOfStock"
                      ? "bg-rose-600 text-white shadow-2xs font-extrabold"
                      : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                    }`}
                >
                  Out of Stock ({outOfStockItems.length})
                </button>
              </div>

              {selectedProducts.length > 0 && (
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-gray-500">
                    {selectedProducts.length} selected
                  </span>
                  <Button
                    onClick={handleBulkAddStock}
                    variant="accent"
                    size="sm"
                    className="text-xs font-bold h-8"
                  >
                    <Plus className="w-3.5 h-3.5 mr-1" /> Bulk Refill (+50 Units)
                  </Button>
                </div>
              )}
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-gray-50 border-b border-border">
                    <th className="px-4 py-3 w-10 text-center">
                      <button
                        onClick={toggleSelectAll}
                        className="text-gray-400 hover:text-primary cursor-pointer"
                      >
                        {selectedProducts.length === inventory.length ? (
                          <CheckSquare className="w-4 h-4 text-primary" />
                        ) : (
                          <Square className="w-4 h-4" />
                        )}
                      </button>
                    </th>
                    <th className="px-4 py-3 text-[10px] font-bold text-gray-500 uppercase tracking-wider">
                      Product Info
                    </th>
                    <th className="px-4 py-3 text-[10px] font-bold text-gray-500 uppercase tracking-wider">
                      Batch & Expiry Tracking
                    </th>
                    <th className="px-4 py-3 text-[10px] font-bold text-gray-500 uppercase tracking-wider text-center">
                      Products Sold (D / W / M)
                    </th>
                    <th className="px-4 py-3 text-[10px] font-bold text-gray-500 uppercase tracking-wider w-36 text-center">
                      Available Quantity
                    </th>
                    <th className="px-4 py-3 text-[10px] font-bold text-gray-500 uppercase tracking-wider text-right">
                      Simulate & Manage
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {filteredInventory.map((item) => (
                    <tr
                      key={item.id}
                      className="hover:bg-gray-50/50 transition-colors"
                    >
                      <td className="px-4 py-4 text-center align-middle">
                        <button
                          onClick={() => toggleSelectProduct(item.id)}
                          className="text-gray-400 hover:text-primary cursor-pointer"
                        >
                          {selectedProducts.includes(item.id) ? (
                            <CheckSquare className="w-4 h-4 text-primary" />
                          ) : (
                            <Square className="w-4 h-4" />
                          )}
                        </button>
                      </td>
                      <td className="px-4 py-4 align-middle">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-lg overflow-hidden bg-gray-100 border border-border shrink-0">
                            <img
                              src={item.image}
                              alt={item.name}
                              className="w-full h-full object-cover"
                            />
                          </div>
                          <div>
                            <p className="font-bold text-xs text-gray-900">
                              {item.name}
                            </p>
                            <p className="text-[10px] text-gray-500 font-semibold">
                              SKU: {item.sku} &bull; {item.price}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-4 align-middle space-y-0.5">
                        <p className="text-xs font-bold text-gray-800 flex items-center gap-1.5">
                          <Tag className="w-3 h-3 text-accent" /> {item.batchNo}
                        </p>
                        <p className="text-[10px] font-semibold text-gray-500 flex items-center gap-1.5">
                          <Clock className="w-3 h-3 text-gray-400" /> Exp:{" "}
                          <span className="font-bold text-gray-700">{item.expiryDate}</span>
                        </p>
                      </td>
                      <td className="px-4 py-4 text-center align-middle">
                        <div className="inline-flex bg-gray-50 p-1 rounded-lg border border-border gap-2 text-[11px] font-bold text-gray-700">
                          <span title="Daily Sales">{item.soldDaily}</span>
                          <span className="text-gray-300">|</span>
                          <span title="Weekly Sales" className="text-primary">{item.soldWeekly}</span>
                          <span className="text-gray-300">|</span>
                          <span title="Monthly Sales" className="text-accent">{item.soldMonthly}</span>
                        </div>
                      </td>
                      <td className="px-4 py-4 text-center align-middle">
                        {editingStockId === item.id ? (
                          <div className="flex items-center justify-center gap-1">
                            <input
                              type="number"
                              min="0"
                              value={newStockValue}
                              onChange={(e) => setNewStockValue(e.target.value)}
                              className="w-16 px-2 py-1 text-xs border border-primary rounded font-bold text-center"
                              autoFocus
                            />
                            <Button
                              onClick={() => handleUpdateStock(item.id, newStockValue)}
                              variant="primary"
                              size="sm"
                              className="px-2 py-1 text-[10px] h-7"
                            >
                              Save
                            </Button>
                          </div>
                        ) : (
                          <div className="flex flex-col items-center gap-1">
                            <div className="flex items-center gap-1.5">
                              <span
                                className={`text-sm font-black ${item.stock === 0
                                    ? "text-rose-600"
                                    : item.stock <= item.threshold
                                      ? "text-amber-600"
                                      : "text-emerald-600"
                                  }`}
                              >
                                {item.stock} Units
                              </span>
                              <button
                                onClick={() => {
                                  setEditingStockId(item.id);
                                  setNewStockValue(item.stock.toString());
                                }}
                                className="text-gray-400 hover:text-primary p-0.5"
                                title="Manual Stock Update"
                              >
                                <Edit className="w-3 h-3" />
                              </button>
                            </div>
                            <Badge
                              variant={
                                item.stock === 0
                                  ? "danger"
                                  : item.stock <= item.threshold
                                    ? "warning"
                                    : "success"
                              }
                              className="text-[9px] py-0 px-1.5 font-bold"
                            >
                              {item.stock === 0
                                ? "Out of Stock"
                                : item.stock <= item.threshold
                                  ? "Low Stock"
                                  : "In Stock"}
                            </Badge>
                          </div>
                        )}
                      </td>
                      <td className="px-4 py-4 text-right align-middle">
                        <Button
                          onClick={() => handleSimulateOrder(item.id)}
                          variant="outline"
                          size="sm"
                          className="h-8 text-[10px] font-bold border-gray-200 hover:bg-gray-50"
                          title="Simulates automatic stock deduction after an order"
                        >
                          <RotateCcw className="w-3 h-3 mr-1 text-primary" /> Simulate Order
                        </Button>
                      </td>
                    </tr>
                  ))}
                  {filteredInventory.length === 0 && (
                    <tr>
                      <td
                        colSpan="6"
                        className="px-4 py-8 text-center text-xs text-gray-500 font-semibold"
                      >
                        No batches matched the current filter status.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
