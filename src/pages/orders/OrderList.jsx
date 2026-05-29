import React, { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import Card, { CardContent } from "../../components/ui/Card";
import Button from "../../components/ui/Button";
import Badge from "../../components/ui/Badge";
import {
  ShoppingBag,
  Package,
  RotateCw,
  CheckCircle2,
  XCircle,
  Eye,
  ChevronLeft,
  ChevronRight,
  Loader2,
  Calendar as CalendarIcon,
  RefreshCw,
  Filter,
  Download,
} from "lucide-react";
import { API } from "../../services/api_service";
import { APIROUTES } from "../../routes/api_routes";
import { toast } from "react-toastify";

const OrderList = () => {
  const navigate = useNavigate();
  const [merchants, setMerchants] = useState([]);
  const [selectedMerchant, setSelectedMerchant] = useState("");
  const [dateFilter, setDateFilter] = useState("all");
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingMerchants, setLoadingMerchants] = useState(true);

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 20;

  useEffect(() => {
    fetchMerchants();
  }, []);

  const fetchMerchants = async () => {
    try {
      const res = await API.post(APIROUTES.GETBUSINESS);
      if (res.data?.statusCode === 200) {
        const data = res.data.data || [];
        setMerchants(data);
        if (data.length > 0) {
          setSelectedMerchant(data[0].bid.toString());
        }
      }
    } catch (err) {
      console.error(err);
      toast.error("Failed to fetch merchants");
    } finally {
      setLoadingMerchants(false);
    }
  };

  useEffect(() => {
    if (selectedMerchant) {
      fetchOrders();
    }
  }, [selectedMerchant]);

  const fetchOrders = async () => {
    if (!selectedMerchant) {
      toast.warning("Please select a merchant first");
      return;
    }
    setLoading(true);
    try {
      const payload = {
        bid: parseInt(selectedMerchant),
        date: dateFilter,
      };

      const res = await API.post(APIROUTES.MERCHANTORDERS, payload);
      if (res.data?.statusCode === 200) {
        setOrders(res.data.data || []);
        setCurrentPage(1);
      }
    } catch (err) {
      console.error(err);
      toast.error("Failed to fetch merchant orders");
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setDateFilter("all");
    if (selectedMerchant) fetchOrders();
  };

  // KPIs Calculation
  const totalOrders = orders.length;
  const pendingOrders = orders.filter(
    (o) => o.orderstatus?.toLowerCase() === "pending",
  ).length;
  const shippedOrders = orders.filter(
    (o) => o.orderstatus?.toLowerCase() === "shipped",
  ).length;
  const completedOrders = orders.filter(
    (o) =>
      o.orderstatus?.toLowerCase() === "delivered" ||
      o.orderstatus?.toLowerCase() === "completed",
  ).length;
  const cancelledOrders = orders.filter(
    (o) => o.orderstatus?.toLowerCase() === "cancelled",
  ).length;

  const calcPercentage = (count) =>
    totalOrders > 0 ? ((count / totalOrders) * 100).toFixed(2) + "%" : "0.00%";

  // Pagination Logic
  const totalPages = Math.ceil(orders.length / itemsPerPage) || 1;
  const paginatedOrders = orders.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage,
  );

  const selectedMerchantName =
    merchants.find((m) => m.bid.toString() === selectedMerchant)
      ?.businessname || "";

  return (
    <div className="space-y-6 animate-in slide-in-from-bottom-4 duration-500 font-sans">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">
            Merchant Orders
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            View and manage orders of all merchants
          </p>
        </div>
      </div>

      <Card className="border border-gray-200 shadow-sm">
        <CardContent className="p-6">
          <div className="flex flex-col lg:flex-row items-end gap-4">
            <div className="w-full lg:w-1/3">
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
                Select Merchant
              </label>
              <select
                value={selectedMerchant}
                onChange={(e) => setSelectedMerchant(e.target.value)}
                className="w-full h-11 px-4 bg-gray-50 border border-gray-200 rounded-lg text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                disabled={loadingMerchants}
              >
                <option value="">Select a Merchant</option>
                {merchants.map((m) => (
                  <option key={m.bid} value={m.bid}>
                    {m.businessname}
                  </option>
                ))}
              </select>
            </div>

            <div className="w-full lg:w-1/4">
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
                Date Range
              </label>
              <select
                value={dateFilter}
                onChange={(e) => setDateFilter(e.target.value)}
                className="w-full h-11 px-4 bg-gray-50 border border-gray-200 rounded-lg text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
              >
                <option value="all">All Time</option>
                <option value="last7days">Last 7 Days</option>
                <option value="last1month">Last 1 Month</option>
                <option value="last6months">Last 6 Months</option>
              </select>
            </div>

            <div className="w-full lg:w-auto flex items-center gap-3 mt-4 lg:mt-0">
              <Button
                onClick={handleReset}
                variant="outline"
                className="h-11 px-6 border-gray-200 text-gray-700 font-bold hover:bg-gray-50"
              >
                <RefreshCw className="w-4 h-4 mr-2" /> Reset
              </Button>
              <Button
                onClick={fetchOrders}
                className="h-11 px-8 bg-[#4C6B35] hover:bg-[#3d562b] text-white font-bold"
              >
                <Filter className="w-4 h-4 mr-2" /> Filter
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        {/* KPI Cards */}
        <Card className="border border-gray-200 shadow-sm">
          <CardContent className="p-5 flex items-start gap-4">
            <div className="w-12 h-12 rounded-xl bg-gray-100 flex items-center justify-center text-gray-600 shrink-0">
              <ShoppingBag className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">
                Total Orders
              </p>
              <h3 className="text-2xl font-black text-gray-900">
                {totalOrders}
              </h3>
              <p className="text-[10px] text-gray-400 font-semibold mt-1">
                All Orders
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="border border-gray-200 shadow-sm">
          <CardContent className="p-5 flex items-start gap-4">
            <div className="w-12 h-12 rounded-xl bg-orange-50 flex items-center justify-center text-orange-500 shrink-0">
              <Package className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">
                Pending
              </p>
              <h3 className="text-2xl font-black text-gray-900">
                {pendingOrders}
              </h3>
              <p className="text-[10px] text-gray-400 font-semibold mt-1">
                {calcPercentage(pendingOrders)}
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="border border-gray-200 shadow-sm">
          <CardContent className="p-5 flex items-start gap-4">
            <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center text-blue-500 shrink-0">
              <RotateCw className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">
                Shipped
              </p>
              <h3 className="text-2xl font-black text-gray-900">
                {shippedOrders}
              </h3>
              <p className="text-[10px] text-gray-400 font-semibold mt-1">
                {calcPercentage(shippedOrders)}
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="border border-gray-200 shadow-sm">
          <CardContent className="p-5 flex items-start gap-4">
            <div className="w-12 h-12 rounded-xl bg-green-50 flex items-center justify-center text-green-500 shrink-0">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">
                Completed
              </p>
              <h3 className="text-2xl font-black text-gray-900">
                {completedOrders}
              </h3>
              <p className="text-[10px] text-gray-400 font-semibold mt-1">
                {calcPercentage(completedOrders)}
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="border border-gray-200 shadow-sm">
          <CardContent className="p-5 flex items-start gap-4">
            <div className="w-12 h-12 rounded-xl bg-red-50 flex items-center justify-center text-red-500 shrink-0">
              <XCircle className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">
                Cancelled
              </p>
              <h3 className="text-2xl font-black text-gray-900">
                {cancelledOrders}
              </h3>
              <p className="text-[10px] text-gray-400 font-semibold mt-1">
                {calcPercentage(cancelledOrders)}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="border border-gray-200 shadow-sm overflow-hidden">
        <div className="p-6 bg-white border-b border-gray-100 flex items-center justify-between">
          <h3 className="text-lg font-bold text-gray-900">
            Orders List {selectedMerchantName && `(${selectedMerchantName})`}
          </h3>
          <Button
            variant="outline"
            className="text-gray-600 border-gray-200 font-bold hover:bg-gray-50"
          >
            <Download className="w-4 h-4 mr-2" /> Export
          </Button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-max">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100">
                <th className="px-5 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider w-16">
                  S.No
                </th>
                <th className="px-5 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">
                  Order ID
                </th>
                <th className="px-5 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">
                  Products
                </th>
                <th className="px-5 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">
                  Products
                </th>
                <th className="px-5 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">
                  Order Type
                </th>
                <th className="px-5 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">
                  Order Date
                </th>
                <th className="px-5 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">
                  Total Amount
                </th>
                <th className="px-5 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">
                  Payment Status
                </th>
                <th className="px-5 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-5 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider text-center">
                  Action
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                <tr>
                  <td colSpan="9" className="py-12 text-center text-gray-400">
                    <Loader2 className="w-8 h-8 animate-spin mx-auto text-[var(--color-primary)]" />
                  </td>
                </tr>
              ) : orders.length === 0 ? (
                <tr>
                  <td
                    colSpan="9"
                    className="py-12 text-center text-sm font-semibold text-gray-500"
                  >
                    {selectedMerchant
                      ? "No orders found for this merchant."
                      : "Please select a merchant to view orders."}
                  </td>
                </tr>
              ) : (
                paginatedOrders.map((order, index) => {
                  const sNo = (currentPage - 1) * itemsPerPage + index + 1;
                  const itemStatus = order.orderstatus?.toLowerCase();
                  const firstItem =
                    order.items && order.items.length > 0
                      ? order.items[0]
                      : null;

                  return (
                    <tr
                      key={order.orderid}
                      className="hover:bg-gray-50/50 transition-colors group"
                    >
                      <td className="px-5 py-5 align-middle text-sm font-bold text-gray-500">
                        {sNo}
                      </td>
                      <td className="px-5 py-5 align-middle">
                        <span className="font-bold text-gray-900">
                          ORD-{order.orderid}
                        </span>
                      </td>
                      <td className="px-5 py-5 align-middle">
                        {order.items &&
                          order.items.map((item, idx) => (
                            <span
                              key={idx}
                              className="block text-sm font-semibold text-gray-700"
                            >
                              {item.productname}
                            </span>
                          ))}
                      </td>
                      <td className="px-5 py-5 align-middle">
                        <div className="flex items-center gap-2">
                          <div className="w-10 h-10 rounded-lg overflow-hidden border border-gray-200 flex-shrink-0">
                            {firstItem?.productimage ? (
                              <img
                                src={
                                  process.env.NEXT_PUBLIC_API_URL?.replace(
                                    "/api",
                                    "",
                                  ) + firstItem.productimage ||
                                  firstItem.productimage
                                }
                                alt=""
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <div className="w-full h-full bg-gray-100 flex items-center justify-center">
                                <Package className="w-4 h-4 text-gray-400" />
                              </div>
                            )}
                          </div>
                          {order.items && order.items.length > 1 && (
                            <div className="w-8 h-8 rounded-lg bg-gray-50 border border-gray-200 flex items-center justify-center text-xs font-bold text-gray-500">
                              +{order.items.length - 1}
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-5 py-5 align-middle">
                        <span className="text-sm font-semibold text-gray-700">
                          {order.ordertype.charAt(0).toUpperCase() + order.ordertype.slice(1) || "N/A"}
                        </span>
                      </td>
                      <td className="px-5 py-5 align-middle">
                        <span className="text-sm font-semibold text-gray-700">
                          {order.createdAt}
                        </span>
                      </td>
                      <td className="px-5 py-5 align-middle">
                        <span className="font-bold text-gray-900">
                          ₹
                          {order.totalamount?.toLocaleString(undefined, {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2,
                          })}
                        </span>
                      </td>
                      <td className="px-5 py-5 align-middle">
                        <Badge
                          variant={
                            order.paymentstatus?.toLowerCase() === "paid"
                              ? "payment-paid"
                              : order.paymentstatus?.toLowerCase() === "failed"
                                ? "payment-failed"
                                : "payment-pending"
                          }
                          className="capitalize px-3 py-1 text-xs"
                        >
                          {order.paymentstatus || "pending"}
                        </Badge>
                      </td>
                      <td className="px-5 py-5 align-middle">
                        <Badge
                          variant={
                            ['delivered', 'confirmed', 'pending', 'shipped', 'cancelled'].includes(itemStatus)
                              ? `status-${itemStatus}`
                              : itemStatus === "completed"
                                ? "status-delivered"
                                : itemStatus === "processing"
                                  ? "status-confirmed"
                                  : "status-pending"
                          }
                          className="capitalize px-3 py-1 text-xs"
                        >
                          {order.orderstatus}
                        </Badge>
                      </td>
                      <td className="px-5 py-5 align-middle text-center">
                        <button
                          onClick={() => navigate(`/orders/${order.orderid}`)}
                          className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-gray-100 text-gray-400 hover:text-gray-900 transition-colors mx-auto"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Controls */}
        {orders.length > 0 && (
          <div className="p-4 border-t border-gray-100 flex flex-col sm:flex-row items-center justify-between gap-4 bg-gray-50/30">
            <span className="text-sm font-semibold text-gray-500">
              Showing {(currentPage - 1) * itemsPerPage + 1} to{" "}
              {Math.min(currentPage * itemsPerPage, orders.length)} of{" "}
              {orders.length} orders
            </span>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                disabled={currentPage === 1}
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                className="w-8 h-8 p-0 border-gray-200 text-gray-600 bg-white"
              >
                <ChevronLeft className="w-4 h-4" />
              </Button>

              {/* Simple page numbers */}
              {Array.from({ length: totalPages })
                .map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setCurrentPage(i + 1)}
                    className={`w-8 h-8 rounded-lg text-sm font-bold transition-colors ${currentPage === i + 1
                        ? "bg-[#4C6B35] text-white"
                        : "bg-white border border-gray-200 text-gray-600 hover:bg-gray-50"
                      }`}
                  >
                    {i + 1}
                  </button>
                ))
                .slice(0, 5)}
              {totalPages > 5 && (
                <span className="text-gray-400 mx-1">...</span>
              )}

              <Button
                variant="outline"
                size="sm"
                disabled={currentPage === totalPages}
                onClick={() =>
                  setCurrentPage((p) => Math.min(totalPages, p + 1))
                }
                className="w-8 h-8 p-0 border-gray-200 text-gray-600 bg-white"
              >
                <ChevronRight className="w-4 h-4" />
              </Button>

              <select className="ml-4 h-8 px-2 bg-white border border-gray-200 rounded-lg text-sm font-semibold focus:outline-none">
                <option>20 / page</option>
              </select>
            </div>
          </div>
        )}
      </Card>
    </div>
  );
};

export default OrderList;
