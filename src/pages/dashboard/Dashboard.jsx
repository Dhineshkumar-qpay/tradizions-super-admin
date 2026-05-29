import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Card, { CardHeader, CardContent } from "../../components/ui/Card";
import { motion, AnimatePresence } from "framer-motion";
import {
  Users,
  Store,
  ShoppingBag,
  DollarSign,
  ArrowUpRight,
  ArrowDownRight,
  BarChart3,
  Gift,
  ChevronRight,
  Search,
  Box,
  CheckCircle2,
  AlertCircle,
  Edit,
  ShieldCheck,
  Trash2,
  TrendingUp,
  AlertTriangle,
  RotateCcw,
  Plus,
  CheckSquare,
  Square,
  Package,
  ArrowLeft,
  Loader2,
} from "lucide-react";
import Button from "../../components/ui/Button";
import { toast } from "react-toastify";
import { API } from "../../services/api_service";
import { APIROUTES } from "../../routes/api_routes";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

const iconMap = {
  Users: Users,
  Store: Store,
  ShoppingBag: ShoppingBag,
  DollarSign: DollarSign,
};

const fadeIn = {
  hidden: { opacity: 0, y: 15 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: "easeOut" } },
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.1 } },
};

const Dashboard = () => {
  const [activeTab, setActiveTab] = useState("overview");

  const [dashboardCount, setDashboardCount] = useState(null);
  const [stockCount, setStockCount] = useState(null);
  const [merchants, setMerchants] = useState([]);
  const [selectedMerchant, setSelectedMerchant] = useState(null);
  const [productStocks, setProductStocks] = useState([]);
  const [isProductsLoading, setIsProductsLoading] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const [editingStockId, setEditingStockId] = useState(null);
  const [newStockValue, setNewStockValue] = useState("");

  useEffect(() => {
    const fetchDashboardCount = async () => {
      try {
        const res = await API.post(
          APIROUTES.DASHBOARDCOUNT || "/home/dashboardcount",
        );
        if (res.data?.statusCode === 200) {
          setDashboardCount(res.data.data);
        }
      } catch (err) {
        console.error("Dashboard count error:", err);
      }
    };
    fetchDashboardCount();
  }, []);

  useEffect(() => {
    if (activeTab === "inventory") {
      const fetchStockCount = async () => {
        try {
          const res = await API.post(
            APIROUTES.STOCKCOUNT || "/home/stockcount",
          );
          if (res.data?.statusCode === 200) {
            setStockCount(res.data.data);
          }
        } catch (err) {
          console.error(err);
        }
      };

      const fetchMerchants = async () => {
        setIsLoading(true);
        try {
          const res = await API.post(APIROUTES.GETBUSINESS);
          if (res.data?.statusCode === 200) {
            setMerchants(res.data.data || []);
          }
        } catch (err) {
          console.error(err);
        } finally {
          setIsLoading(false);
        }
      };

      fetchStockCount();
      if (merchants.length === 0) fetchMerchants();
    }
  }, [activeTab]);

  const navigate = useNavigate();

  const handleMerchantClick = (merchant) => {
    navigate(`/merchant-stocks/${merchant.bid}`, { state: { merchant } });
  };

  const displayStats = [
    {
      label: "Total Merchants",
      value: dashboardCount?.totalmerchants || 0,
      change: "+12%",
      icon: "Store",
    },
    {
      label: "Total Orders",
      value: dashboardCount?.totalorders || 0,
      change: "+5%",
      icon: "ShoppingBag",
    },
    {
      label: "Total Users",
      value: dashboardCount?.totalusers || 0,
      change: "+18%",
      icon: "Users",
    },
    {
      label: "Total Revenue",
      value: `₹${(dashboardCount?.totalrevenue || 0).toLocaleString()}`,
      change: "+24%",
      icon: "DollarSign",
    },
  ];

  return (
    <div className="space-y-8 pb-12 font-sans bg-gray-50/30 min-h-screen px-4 pt-4 sm:px-6">
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-6 border-b border-gray-200"
      >
        <div>
          <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-gray-900 via-gray-700 to-gray-900">
            Dashboard Overview
          </h1>
          <p className="text-sm text-gray-500 mt-1.5 font-medium max-w-xl leading-relaxed">
            Monitor real-time KPI analytics, streamline sales tracking, and
            manage your inventory with precision.
          </p>
        </div>

        <div className="flex bg-white p-1.5 rounded-xl border border-gray-200/60 shadow-sm gap-1.5 shrink-0">
          <button
            onClick={() => setActiveTab("overview")}
            className={`px-5 py-2.5 text-sm font-semibold rounded-lg transition-all cursor-pointer flex items-center gap-2 ${
              activeTab === "overview"
                ? "bg-[var(--color-primary)] text-white shadow-md ring-1 ring-gray-900/50"
                : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
            }`}
          >
            <BarChart3 className="w-4 h-4" /> Overview
          </button>
          <button
            onClick={() => setActiveTab("inventory")}
            className={`px-5 py-2.5 text-sm font-semibold rounded-lg transition-all cursor-pointer flex items-center gap-2 relative ${
              activeTab === "inventory"
                ? "bg-[var(--color-primary)] text-white shadow-md ring-1 ring-gray-900/50"
                : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
            }`}
          >
            <Package className="w-4 h-4" /> Inventory
          </button>
        </div>
      </motion.div>

      <AnimatePresence mode="wait">
        {activeTab === "overview" && (
          <motion.div
            key="overview"
            variants={staggerContainer}
            initial="hidden"
            animate="visible"
            exit={{ opacity: 0, y: -10 }}
            className="space-y-8"
          >
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {displayStats.map((item, index) => {
                const Icon = iconMap[item.icon] || Users;
                const isPositive = item.change.startsWith("+");
                return (
                  <motion.div variants={fadeIn} key={index}>
                    <Card className="relative overflow-hidden group hover:shadow-2xl hover:-translate-y-1 transition-all duration-500 border border-gray-100 shadow-md bg-white rounded-2xl">
                      {/* Gradient glow effect in background */}
                      <div className="absolute -right-8 -top-8 w-32 h-32 bg-gradient-to-br from-[var(--color-primary)]/10 to-transparent rounded-full blur-2xl group-hover:scale-150 transition-transform duration-700 ease-out" />

                      <CardContent className="p-6 relative z-10">
                        <div className="flex items-start justify-between mb-6">
                          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center text-gray-600 shadow-inner ring-1 ring-gray-900/5 group-hover:scale-110 group-hover:text-white group-hover:bg-gradient-to-br group-hover:from-[var(--color-primary)] group-hover:to-[var(--color-primary-dark)] group-hover:shadow-[var(--color-primary)]/30 transition-all duration-500">
                            <Icon className="w-6 h-6 stroke-[2]" />
                          </div>
                          <div
                            className={`flex items-center text-xs font-black px-3 py-1.5 rounded-full shadow-sm backdrop-blur-sm ${
                              isPositive
                                ? "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-600/20"
                                : "bg-rose-50 text-rose-700 ring-1 ring-rose-600/20"
                            }`}
                          >
                            {item.change}
                            {isPositive ? (
                              <ArrowUpRight className="w-3.5 h-3.5 ml-1 stroke-[3]" />
                            ) : (
                              <ArrowDownRight className="w-3.5 h-3.5 ml-1 stroke-[3]" />
                            )}
                          </div>
                        </div>
                        <div>
                          <p className="text-[11px] font-bold text-gray-400 uppercase tracking-[0.2em] mb-2">
                            {item.label}
                          </p>
                          <h3 className="text-2xl font-black text-gray-900 tracking-tight">
                            {item.value}
                          </h3>
                        </div>
                        {/* Subtle animated bottom border */}
                        <div className="absolute bottom-0 left-0 h-1 bg-[var(--color-primary)] w-0 group-hover:w-full transition-all duration-500 ease-out" />
                      </CardContent>
                    </Card>
                  </motion.div>
                );
              })}
            </div>
          </motion.div>
        )}

        {activeTab === "inventory" && (
          <motion.div
            key="inventory"
            variants={staggerContainer}
            initial="hidden"
            animate="visible"
            exit={{ opacity: 0, y: -10 }}
            className="space-y-8"
          >
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-5">
              <motion.div variants={fadeIn}>
                <Card className="border-0 shadow-sm ring-1 ring-blue-200/50 bg-white hover:shadow-md transition-shadow">
                  <CardContent className="p-5 flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-blue-50 flex items-center justify-center text-blue-600 shrink-0 ring-1 ring-blue-100">
                      <Store className="w-6 h-6 stroke-[1.5]" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-blue-700 uppercase tracking-wider mb-1">
                        All Products
                      </p>
                      <h3 className="text-2xl font-black text-gray-900 leading-none">
                        {stockCount?.totalshops || 0}
                      </h3>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>

              <motion.div variants={fadeIn}>
                <Card className="border-0 shadow-sm ring-1 ring-emerald-200/50 bg-white hover:shadow-md transition-shadow">
                  <CardContent className="p-5 flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-emerald-50 flex items-center justify-center text-emerald-600 shrink-0 ring-1 ring-emerald-100">
                      <Box className="w-6 h-6 stroke-[1.5]" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-emerald-700 uppercase tracking-wider mb-1">
                        In Stock Products
                      </p>
                      <h3 className="text-2xl font-black text-gray-900 leading-none">
                        {stockCount?.totalProducts || 0}
                      </h3>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>

              <motion.div variants={fadeIn}>
                <Card className="border-0 shadow-sm ring-1 ring-orange-200/50 bg-white hover:shadow-md transition-shadow">
                  <CardContent className="p-5 flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-orange-50 flex items-center justify-center text-orange-600 shrink-0 ring-1 ring-orange-100">
                      <CheckCircle2 className="w-6 h-6 stroke-[1.5]" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-orange-700 uppercase tracking-wider mb-1">
                        Low Stock
                      </p>
                      <h3 className="text-2xl font-black text-gray-900 leading-none">
                        {stockCount?.totalavailable || 0}
                      </h3>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>

              <motion.div variants={fadeIn}>
                <Card className="border-0 shadow-sm ring-1 ring-red-200/50 bg-white hover:shadow-md transition-shadow">
                  <CardContent className="p-5 flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-red-50 flex items-center justify-center text-red-600 shrink-0 ring-1 ring-red-100">
                      <AlertTriangle className="w-6 h-6 stroke-[1.5]" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-red-700 uppercase tracking-wider mb-1">
                        Out Of Stock
                      </p>
                      <h3 className="text-2xl font-black text-gray-900 leading-none">
                        {stockCount?.totallowstock || 0}
                      </h3>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            </div>

            <motion.div variants={fadeIn}>
              <Card className="border-0 shadow-md ring-1 ring-gray-200/60 overflow-hidden bg-white rounded-2xl">
                <div className="p-5 bg-white border-b border-gray-100 flex items-center justify-between">
                  <h3 className="text-lg font-bold text-gray-900">
                    Merchants List
                  </h3>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-gray-50/80 border-b border-gray-100">
                        <th className="px-5 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">
                          S.No
                        </th>
                        <th className="px-5 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">
                          Business Name
                        </th>
                        <th className="px-5 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">
                          Name
                        </th>
                        <th className="px-5 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">
                          Contact
                        </th>
                        <th className="px-5 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider text-right">
                          View Products
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {isLoading ? (
                        <tr>
                          <td
                            colSpan="5"
                            className="py-8 text-center text-gray-400"
                          >
                            <Loader2 className="w-6 h-6 animate-spin mx-auto" />
                          </td>
                        </tr>
                      ) : (
                        merchants.map((m, index) => (
                          <tr
                            key={m.bid}
                            onClick={() => handleMerchantClick(m)}
                            className="hover:bg-gray-50/80 transition-colors cursor-pointer group"
                          >
                            <td className="px-5 py-4 align-middle">
                              <p className="font-bold text-sm text-gray-900 group-hover:text-[var(--color-primary)] transition-colors bg-gray-100 h-10 flex items-center justify-center rounded-[10px]">
                                {index + 1}
                              </p>
                            </td>
                            <td className="px-5 py-4 align-middle">
                              <p className="font-bold text-sm text-gray-900 group-hover:text-[var(--color-primary)] transition-colors">
                                {m.businessname}
                              </p>
                            </td>
                            <td className="px-5 py-4 align-middle">
                              <p className="font-bold text-sm text-gray-900 group-hover:text-[var(--color-primary)] transition-colors">
                                {m.username || "—"}
                              </p>
                            </td>
                            <td className="px-5 py-4 align-middle">
                              <p className="text-xs text-gray-500 font-medium">
                                {m.phone || "—"}
                              </p>
                            </td>
                            <td className="px-5 py-4 text-right align-middle">
                              <ChevronRight className="w-5 h-5 text-gray-300 group-hover:text-[var(--color-primary)] inline-block transition-colors" />
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </Card>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Dashboard;
