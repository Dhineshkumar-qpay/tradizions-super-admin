import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Card, { CardHeader, CardContent } from "../../components/ui/Card";
import Button from "../../components/ui/Button";
import Badge from "../../components/ui/Badge";
import {
  ArrowLeft,
  ShoppingCart,
  Store,
  User,
  MapPin,
  CreditCard,
  Calendar,
  Printer,
  Package,
  Truck,
  CheckCircle2,
  Download,
  ExternalLink,
  Mail,
  Phone,
  PackageCheck,
  Clock,
  FileText,
  Loader2,
  XCircle,
} from "lucide-react";
import { API } from "../../services/api_service";
import { APIROUTES } from "../../routes/api_routes";
import { toast } from "react-toastify";

const OrderDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [orderData, setOrderData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrderDetails = async () => {
      try {
        const res = await API.post(APIROUTES.ORDERDETAILS, {
          orderid: parseInt(id) || id,
        });
        if (res.data?.statusCode === 200 || res.status === 200) {
          setOrderData(res.data.data || res.data);
        }
      } catch (err) {
        console.error(err);
        toast.error("Failed to fetch order details");
      } finally {
        setLoading(false);
      }
    };

    if (id) fetchOrderDetails();
  }, [id]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh]">
        <Loader2 className="w-10 h-10 animate-spin text-[var(--color-primary)]" />
        <p className="mt-4 text-gray-500 font-bold tracking-widest uppercase text-sm">
          Loading Order Details...
        </p>
      </div>
    );
  }

  if (!orderData) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh]">
        <Package className="w-16 h-16 text-gray-300 mb-4" />
        <h3 className="text-xl font-bold text-gray-900">Order Not Found</h3>
        <p className="mt-2 text-gray-500 font-medium">
          The order you are looking for does not exist or has been removed.
        </p>
        <Button
          onClick={() => navigate(-1)}
          className="mt-6 bg-[#4C6B35] hover:bg-[#3d562b] text-white"
        >
          <ArrowLeft className="w-4 h-4 mr-2" /> Back to Orders
        </Button>
      </div>
    );
  }

  const order = orderData?.order;
  const items = orderData?.items || [];

  const globalStatus = order?.orderstatus || "pending";
  const globalTotal = order?.totalamount || 0;

  const getStatusColor = (s) => {
    if (!s) return "status-pending";
    const lowerS = s.toLowerCase();
    if (['delivered', 'confirmed', 'pending', 'shipped', 'cancelled'].includes(lowerS)) {
      return `status-${lowerS}`;
    }
    if (lowerS === "completed") return "status-delivered";
    if (lowerS === "processing") return "status-confirmed";
    return "status-pending";
  };

  const getImageUrl = (path) => {
    if (!path) return "";
    const baseUrl = process.env.NEXT_PUBLIC_API_URL
      ? process.env.NEXT_PUBLIC_API_URL.replace("/api", "")
      : "";
    return baseUrl + path;
  };

  const renderStepper = (status) => {
    const currentStatus = status?.toLowerCase() || "pending";
    const isCancelled = currentStatus === "cancelled";

    const statuses = ["pending", "confirmed", "shipped", "delivered"];
    const currentIndex = statuses.indexOf(currentStatus);

    const isActive = (step) => {
      if (isCancelled) return step === "pending";
      const stepIndex = statuses.indexOf(step);
      return stepIndex <= currentIndex && currentIndex !== -1;
    };

    return (
      <div className="relative space-y-6">
        <div className="absolute left-3.5 top-2 bottom-4 w-px bg-gray-200" />

        {/* Step 1: Pending */}
        <div className="flex gap-4 relative z-10">
          <div className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 shadow-sm ${isActive("pending") || isCancelled ? "bg-[#4C6B35] text-white" : "bg-white border-2 border-gray-300 text-gray-400"}`}>
            <CheckCircle2 className="w-4 h-4" />
          </div>
          <div>
            <p className={`text-sm font-bold ${isActive("pending") || isCancelled ? "text-gray-900" : "text-gray-500"}`}>Pending</p>
          </div>
        </div>

        {/* Step 2: Confirmed */}
        {!isCancelled && (
          <div className="flex gap-4 relative z-10">
            <div className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 shadow-sm ${isActive("confirmed") ? "bg-[#4C6B35] text-white" : "bg-white border-2 border-gray-300 text-gray-400"}`}>
              <CheckCircle2 className="w-4 h-4" />
            </div>
            <div>
              <p className={`text-sm font-bold ${isActive("confirmed") ? "text-gray-900" : "text-gray-500"}`}>Confirmed</p>
            </div>
          </div>
        )}

        {/* Step 3: Shipped */}
        {!isCancelled && (
          <div className="flex gap-4 relative z-10">
            <div className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 shadow-sm ${isActive("shipped") ? "bg-[#4C6B35] text-white" : "bg-white border-2 border-gray-300 text-gray-400"}`}>
              <CheckCircle2 className="w-4 h-4" />
            </div>
            <div>
              <p className={`text-sm font-bold ${isActive("shipped") ? "text-gray-900" : "text-gray-500"}`}>Shipped</p>
            </div>
          </div>
        )}

        {/* Step 4: Delivered */}
        {!isCancelled && (
          <div className="flex gap-4 relative z-10">
            <div className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 shadow-sm ${(isActive("delivered") || currentStatus === "completed") ? "bg-[#4C6B35] text-white" : "bg-white border-2 border-gray-300 text-gray-400"}`}>
              <CheckCircle2 className="w-4 h-4" />
            </div>
            <div>
              <p className={`text-sm font-bold ${(isActive("delivered") || currentStatus === "completed") ? "text-gray-900" : "text-gray-500"}`}>Delivered</p>
            </div>
          </div>
        )}

        {/* Cancelled */}
        {isCancelled && (
          <div className="flex gap-4 relative z-10">
            <div className="w-7 h-7 rounded-full bg-red-500 text-white flex items-center justify-center shrink-0 shadow-sm">
              <XCircle className="w-4 h-4" />
            </div>
            <div>
              <p className="text-sm font-bold text-gray-900">Cancelled</p>
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500 font-sans max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight">
            Order Details
          </h1>
          <span className="text-sm font-semibold text-gray-500 mt-1">
            Order ID:{" "}
            <span className="font-bold text-gray-900">
              #ORD{order?.orderid}
            </span>
          </span>
          <Badge
            variant={getStatusColor(globalStatus)}
            className="capitalize mt-1 px-3 py-1"
          >
            {globalStatus}
          </Badge>
        </div>
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            className="h-10 px-4 font-bold text-gray-700 border-gray-200 bg-white"
          >
            <Printer className="w-4 h-4 mr-2" /> Print Invoice
          </Button>
          <Button
            onClick={() => navigate(-1)}
            className="h-10 px-4 bg-[#4C6B35] hover:bg-[#3d562b] text-white font-bold shadow-sm"
          >
            <ArrowLeft className="w-4 h-4 mr-2" /> Back to Orders
          </Button>
        </div>
      </div>

      {/* Global Order Summary */}
      <Card className="border border-gray-200 shadow-sm">
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div>
              <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Total Amount</p>
              <p className="text-xl font-black text-[#4C6B35]">₹{globalTotal?.toLocaleString(undefined, { minimumFractionDigits: 2 })}</p>
            </div>
            <div>
              <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Payment Method</p>
              <Badge
                variant={
                  order?.paymentstatus?.toLowerCase() === "paid"
                    ? "payment-paid"
                    : order?.paymentstatus?.toLowerCase() === "failed"
                      ? "payment-failed"
                      : "payment-pending"
                }
                className="capitalize px-3 py-1"
              >
                {order?.paymentstatus || "Pending"}
              </Badge>
            </div>
            <div>
              <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Order Type</p>
              <p className="text-sm font-bold text-gray-900 capitalize">{order?.ordertype || "Normal"}</p>
            </div>
            <div>
              <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Items Count</p>
              <p className="text-sm font-bold text-gray-900">{items.length}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Items List */}
      <div className="space-y-6">
        <h3 className="text-xl font-bold text-gray-900">Ordered Items</h3>
        {items.map((item, index) => (
          <Card key={item.orderitemid} className="border border-gray-200 shadow-sm overflow-hidden">
            <CardHeader className="bg-gray-50/50 border-b border-gray-100 pb-4 pt-4 px-6 flex flex-row items-center justify-between">
              <div className="flex items-center gap-3">
                <Package className="w-5 h-5 text-gray-500" />
                <h4 className="text-lg font-bold text-gray-900">Item #{index + 1}</h4>
              </div>
              <Badge variant={getStatusColor(item.itemstatus)} className="capitalize px-3 py-1">
                {item.itemstatus}
              </Badge>
            </CardHeader>
            <CardContent className="p-6">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                {/* Column 1: Product Information */}
                <div className="space-y-4">
                  <h5 className="text-xs font-bold text-gray-500 uppercase tracking-wider flex items-center gap-2">
                    <ShoppingCart className="w-4 h-4" /> Product Details
                  </h5>
                  <div className="flex items-start gap-4 mt-2">
                    <div className="w-20 h-20 rounded-lg overflow-hidden border border-gray-200 bg-white flex-shrink-0 p-1">
                      <img
                        src={getImageUrl(item.product?.productimage)}
                        alt={item.product?.productname}
                        className="w-full h-full object-cover rounded-md"
                      />
                    </div>
                    <div className="space-y-1">
                      <p className="font-bold text-base text-gray-900 leading-snug">{item.product?.productname}</p>
                      <p className="text-sm font-semibold text-gray-500">Qty: {item.quantity}</p>
                      <p className="text-sm font-bold text-gray-900">₹{item.price?.toLocaleString(undefined, { minimumFractionDigits: 2 })} / each</p>
                      <p className="text-sm font-black text-[#4C6B35] pt-1">Total: ₹{item.totalprice?.toLocaleString(undefined, { minimumFractionDigits: 2 })}</p>


                    </div>
                  </div>
                </div>

                {/* Column 2: Shipping Address */}
                <div className="space-y-4 border-t lg:border-t-0 lg:border-l border-gray-100 pt-6 lg:pt-0 lg:pl-8">
                  <h5 className="text-xs font-bold text-gray-500 uppercase tracking-wider flex items-center gap-2">
                    <MapPin className="w-4 h-4" /> Delivery Address
                  </h5>
                  <div className="space-y-2 mt-2">
                    <p className="text-sm font-bold text-gray-900">{item.address?.fullname}</p>
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Mail className="w-3.5 h-3.5" />
                      <span className="font-medium">{item.address?.email}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Phone className="w-3.5 h-3.5" />
                      <span className="font-medium">{item.address?.mobilenumber}</span>
                    </div>
                    <p className="text-sm font-medium text-gray-600 leading-relaxed pt-2">
                      {item.address?.addressline}{item.address?.landmark ? `, ${item.address?.landmark}` : ''}<br />
                      {item.address?.city}, {item.address?.district}<br />
                      {item.address?.state} - {item.address?.pincode}
                    </p>
                  </div>
                </div>

                {/* Column 3: Order Timeline */}
                {(item.ordertype !== 'monthly') ? (
                  <div className="space-y-4 border-t lg:border-t-0 lg:border-l border-gray-100 pt-6 lg:pt-0 lg:pl-8">
                    <h5 className="text-xs font-bold text-gray-500 uppercase tracking-wider flex items-center gap-2">
                      <Clock className="w-4 h-4" /> Status Timeline
                    </h5>
                    <div className="mt-4">
                      {renderStepper(item.itemstatus)}
                    </div>
                  </div>
                ) : <>

                  <div className="mt-4 bg-gray-50 p-3.5 rounded-lg border border-gray-200 shadow-sm space-y-2 w-full">
                    <p className="text-xs font-bold text-[var(--color-primary)] uppercase tracking-wider mb-2 border-b border-gray-200 pb-1.5">Monthly Subscription</p>
                    <div className="grid grid-cols-2 gap-x-4 gap-y-3">
                      <div className="flex flex-col">
                        <span className="text-[10px] font-bold text-gray-500 uppercase">Grams/Day</span>
                        <span className="text-sm font-bold text-gray-900">{item.gramsperday}g</span>
                      </div>
                      <div className="flex flex-col">
                        <span className="text-[10px] font-bold text-gray-500 uppercase">Days/Month</span>
                        <span className="text-sm font-bold text-gray-900">{item.dayspermonth} Days</span>
                      </div>
                      <div className="flex flex-col">
                        <span className="text-[10px] font-bold text-gray-500 uppercase">Family Members</span>
                        <span className="text-sm font-bold text-gray-900">{item.familymembers}</span>
                      </div>
                      <div className="flex flex-col">
                        <span className="text-[10px] font-bold text-gray-500 uppercase">Qty/Person</span>
                        <span className="text-sm font-bold text-gray-900">{item.quantitypersonkg} kg</span>
                      </div>
                      <div className="col-span-2 flex items-center justify-between pt-2 border-t border-gray-200 mt-1">
                        <span className="text-xs font-bold text-gray-600 uppercase">Total Monthly Qty</span>
                        <span className="text-sm font-black text-[var(--color-primary)]">{item.totalquantitykg} kg</span>
                      </div>
                    </div>
                  </div>
                </>}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );


};

export default OrderDetail;
