import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  CheckCircle,
  XCircle,
  User,
  Mail,
  Phone,
  Calendar,
  Building2,
  MapPin,
  CreditCard,
  ShoppingBag,
  Gift,
  ExternalLink,
  Loader2,
} from "lucide-react";
import Card, { CardHeader, CardContent } from "../../components/ui/Card";
import Button from "../../components/ui/Button";
import Badge from "../../components/ui/Badge";
import { API } from "../../services/api_service";
import { APIROUTES } from "../../routes/api_routes";
import { toast } from "react-toastify";
import { clsx } from "clsx";

const MerchantDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("basic");

  // Detail API States
  const [basicInfo, setBasicInfo] = useState(null);
  const [businessInfo, setBusinessInfo] = useState(null);
  const [addressInfo, setAddressInfo] = useState(null);
  const [bankInfo, setBankInfo] = useState(null);
  const [products, setProducts] = useState([]);
  const [gifts, setGifts] = useState([]);
  const [loading, setLoading] = useState(true);

  const IMAGE_BASE =
    process.env.NEXT_PUBLIC_IMAGE_URL || "http://localhost:3003";

  useEffect(() => {
    const loadMerchantDetails = async () => {
      setLoading(true);
      const payload = { bid: parseInt(id) };

      try {
        // Fetch all sub-endpoints concurrently in POST method
        const [
          basicRes,
          businessRes,
          addressRes,
          bankRes,
          productsRes,
          giftsRes,
        ] = await Promise.all([
          API.post(APIROUTES.GETBASICINFO, payload).catch((err) => ({
            error: err,
          })),
          API.post(APIROUTES.GETBUSINESSINFO, payload).catch((err) => ({
            error: err,
          })),
          API.post(APIROUTES.GETADDRESSINFO, payload).catch((err) => ({
            error: err,
          })),
          API.post(APIROUTES.GETBANKINFO, payload).catch((err) => ({
            error: err,
          })),
          API.post(APIROUTES.GETPRODUCTS, payload).catch((err) => ({
            error: err,
          })),
          API.post(APIROUTES.GETGIFTS, payload).catch((err) => ({
            error: err,
          })),
        ]);

        if (basicRes && !basicRes.error && basicRes.data?.statusCode === 200) {
          setBasicInfo(basicRes.data.data);
        }
        if (
          businessRes &&
          !businessRes.error &&
          businessRes.data?.statusCode === 200
        ) {
          setBusinessInfo(businessRes.data.data);
        }
        if (
          addressRes &&
          !addressRes.error &&
          addressRes.data?.statusCode === 200
        ) {
          setAddressInfo(addressRes.data.data);
        }
        if (bankRes && !bankRes.error && bankRes.data?.statusCode === 200) {
          setBankInfo(bankRes.data.data);
        }
        if (
          productsRes &&
          !productsRes.error &&
          productsRes.data?.statusCode === 200
        ) {
          setProducts(productsRes.data.data || []);
        }
        if (giftsRes && !giftsRes.error && giftsRes.data?.statusCode === 200) {
          setGifts(giftsRes.data.data || []);
        }
      } catch (err) {
        console.error("Error loading merchant details:", err);
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      loadMerchantDetails();
    }
  }, [id]);

  if (loading) {
    return (
      <div className="h-[60vh] flex flex-col items-center justify-center space-y-3">
        <Loader2 className="w-12 h-12 animate-spin text-primary" />
        <p className="text-sm font-bold text-gray-400 uppercase tracking-widest">
          Retrieving Merchant Dossier...
        </p>
      </div>
    );
  }

  // Active sub-navigation tabs (excluding KYC details entirely)
  const tabs = [
    { id: "basic", label: "Basic Details", icon: User },
    { id: "business", label: "Business Info", icon: Building2 },
    { id: "address", label: "Address Details", icon: MapPin },
    { id: "bank", label: "Bank Account", icon: CreditCard },
    {
      id: "products",
      label: "Products",
      icon: ShoppingBag,
      count: products.length,
    },
    { id: "giftcards", label: "Gift Cards", icon: Gift, count: gifts.length },
  ];

  const handleApprove = () => {
    toast.success("Merchant approved successfully!");
  };

  const handleBlock = () => {
    toast.error("Merchant has been blocked.");
  };

  const businessDisplayName =
    businessInfo?.businessname || basicInfo?.ownername || "Merchant details";

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Header Section */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <button
            onClick={() => navigate("/merchants")}
            className="flex items-center gap-2 text-sm font-bold text-gray-500 hover:text-primary transition-colors"
          >
            <ArrowLeft className="w-4 h-4" /> Back to Merchants
          </button>
        </div>

        <Card className="border-l-4 border-l-primary shadow-sm">
          <CardContent className="p-4">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary text-xl font-bold shrink-0">
                {businessDisplayName.charAt(0).toUpperCase()}
              </div>
              <div>
                <h1 className="text-lg font-bold text-gray-900 leading-tight">
                  {businessDisplayName}
                </h1>
                <div className="flex items-center gap-2 mt-1">
                  <Badge variant="success" className="text-[10px] py-0 px-2">
                    Active
                  </Badge>
                  <span className="text-gray-300 text-xs">|</span>
                  <span className="text-[10px] font-bold text-gray-400 uppercase tracking-tighter">
                    {basicInfo?.designation || "Onboarded Business Owner"}
                  </span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs Navigation */}
      <div className="flex flex-col space-y-6">
        <div className="flex items-center gap-1 border-b border-border overflow-x-auto pb-[1px] scrollbar-hide">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={clsx(
                "flex items-center gap-2 px-6 py-4 text-sm font-bold transition-all duration-200 border-b-2 whitespace-nowrap",
                activeTab === tab.id
                  ? "text-accent border-accent bg-accent/5"
                  : "text-gray-500 border-transparent hover:text-gray-700 hover:border-gray-300",
              )}
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
              {tab.count !== undefined && tab.count > 0 && (
                <span className="ml-1 px-1.5 py-0.5 bg-gray-100 text-gray-600 rounded text-[10px]">
                  {tab.count}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div className="animate-in fade-in slide-in-from-top-2 duration-300">
          {activeTab === "basic" && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              <DetailCard
                icon={User}
                label="Owner Name"
                value={basicInfo?.ownername}
              />
              <DetailCard
                icon={Building2}
                label="Designation"
                value={basicInfo?.designation}
              />
              <DetailCard
                icon={Mail}
                label="Email Address"
                value={basicInfo?.email}
              />
              <DetailCard
                icon={Phone}
                label="Mobile Number"
                value={basicInfo?.mobile}
              />
              <DetailCard
                icon={Phone}
                label="WhatsApp"
                value={basicInfo?.whatsapp}
              />
              <DetailCard
                icon={Calendar}
                label="Created Date"
                value={
                  basicInfo?.createdAt
                    ? new Date(basicInfo.createdAt).toLocaleDateString()
                    : "—"
                }
              />
            </div>
          )}

          {activeTab === "business" && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {businessInfo?.businessimage && (
                <div className="sm:col-span-2 lg:col-span-3 flex flex-col gap-2">
                  <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">
                    Business Cover Image
                  </span>
                  <img
                    src={`${IMAGE_BASE}${businessInfo.businessimage}`}
                    alt="Cover"
                    className="w-full max-w-lg h-56 object-cover rounded-2xl border border-border shadow-sm hover:shadow-md transition-shadow"
                  />
                </div>
              )}
              <DetailCard
                icon={Building2}
                label="Business Name"
                value={businessInfo?.businessname}
              />
              <DetailCard
                icon={Building2}
                label="Legal Business Name"
                value={businessInfo?.legalbusinessname}
              />
              <DetailCard
                icon={Calendar}
                label="Operating Hours"
                value={
                  businessInfo?.opentime && businessInfo?.closetime
                    ? `${businessInfo.opentime} - ${businessInfo.closetime}`
                    : "—"
                }
              />
              <div className="lg:col-span-3">
                <DetailCard
                  icon={Building2}
                  label="Description"
                  value={businessInfo?.description}
                />
              </div>
            </div>
          )}

          {activeTab === "address" && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="sm:col-span-2 lg:col-span-2">
                <DetailCard
                  icon={MapPin}
                  label="Street Address"
                  value={addressInfo?.addressline}
                />
              </div>
              <DetailCard
                icon={MapPin}
                label="Landmark"
                value={addressInfo?.landmark}
              />
              <DetailCard
                icon={MapPin}
                label="City"
                value={addressInfo?.city}
              />
              <DetailCard
                icon={MapPin}
                label="District"
                value={addressInfo?.district}
              />
              <DetailCard
                icon={MapPin}
                label="State"
                value={addressInfo?.state}
              />
              <DetailCard
                icon={MapPin}
                label="Country"
                value={addressInfo?.country}
              />
              <DetailCard
                icon={MapPin}
                label="Pincode"
                value={addressInfo?.pincode}
              />
              <DetailCard
                icon={MapPin}
                label="Coordinates (Lat/Long)"
                value={
                  addressInfo?.latitude && addressInfo?.longitude
                    ? `${addressInfo.latitude} / ${addressInfo.longitude}`
                    : "—"
                }
              />
            </div>
          )}

          {activeTab === "bank" && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {bankInfo?.passbook && (
                <div className="sm:col-span-2 lg:col-span-3 flex flex-col gap-2">
                  <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">
                    Passbook / Statement Copy
                  </span>
                  <img
                    src={`${IMAGE_BASE}${bankInfo.passbook}`}
                    alt="Passbook Document"
                    className="w-full max-w-lg h-56 object-cover rounded-2xl border border-border shadow-sm hover:shadow-md transition-shadow"
                  />
                </div>
              )}
              <DetailCard
                icon={User}
                label="Account Holder"
                value={bankInfo?.accountholdername}
              />
              <DetailCard
                icon={CreditCard}
                label="Account Number"
                value={bankInfo?.accountnumber}
              />
              <DetailCard
                icon={Building2}
                label="Bank Name"
                value={bankInfo?.bankname}
              />
              <DetailCard
                icon={Building2}
                label="Branch Name"
                value={bankInfo?.branchname}
              />
              <DetailCard
                icon={CreditCard}
                label="IFSC Code"
                value={bankInfo?.ifsc}
              />
            </div>
          )}

          {activeTab === "products" && (
            <Card>
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="bg-gray-50 border-b border-border">
                      <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase">
                        Product
                      </th>
                      <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase">
                        Weight / Unit
                      </th>
                      <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase">
                        Price
                      </th>
                      <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase">
                        Stock
                      </th>
                      <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase">
                        Action
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {products.length > 0 ? (
                      products.map((product) => (
                        <tr
                          key={product.productid}
                          className="hover:bg-gray-50/50 transition-colors group"
                        >
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-4">
                              <img
                                src={`${IMAGE_BASE}${product.productimage}`}
                                alt=""
                                className="w-10 h-10 rounded-lg object-cover border border-border"
                                onError={(e) => {
                                  e.target.src =
                                    "https://placehold.co/40x40?text=Product";
                                }}
                              />
                              <div>
                                <p className="text-sm font-bold text-gray-900 group-hover:text-primary transition-colors">
                                  {product.productname}
                                </p>
                                <p className="text-xs text-gray-400">
                                  {product.categoryname || "Generic"}
                                </p>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 text-sm font-semibold text-gray-600">
                            {product.weight} {product.unit}
                          </td>
                          <td className="px-6 py-4 text-sm font-bold text-gray-900">
                            {product.discount > 0 && (
                              <span className="text-xs line-through text-gray-400 mr-2">
                                ₹{product.price}
                              </span>
                            )}
                            ₹{product.sellingprice || product.price}
                          </td>
                          <td className="px-6 py-4 text-sm font-semibold text-gray-600">
                            {product.availablestock} Units
                          </td>
                          <td className="px-6 py-4">
                            <button
                              onClick={() =>
                                navigate(`/products/${product.productid}`)
                              }
                              className="p-2 hover:bg-gray-100 rounded-lg text-gray-400 hover:text-primary transition-all cursor-pointer"
                            >
                              <ExternalLink className="w-4 h-4" />
                            </button>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td
                          colSpan="5"
                          className="px-6 py-12 text-center text-gray-500 font-semibold"
                        >
                          No products uploaded by this merchant.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </Card>
          )}

          {activeTab === "giftcards" && (
            <Card>
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="bg-gray-50 border-b border-border">
                      <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase">
                        Gift Card
                      </th>
                      <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase">
                        Packing Type
                      </th>
                      <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase">
                        Price
                      </th>
                      <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase">
                        Stock
                      </th>
                      <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase">
                        Assorted Products
                      </th>
                      <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase text-right">
                        Action
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {gifts.length > 0 ? (
                      gifts.map((gc) => (
                        <tr
                          key={gc.giftid}
                          className="hover:bg-gray-50/50 transition-colors group"
                        >
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-4">
                              <img
                                src={`${IMAGE_BASE}${gc.giftimage}`}
                                alt=""
                                className="w-10 h-10 rounded-lg object-cover border border-border"
                                onError={(e) => {
                                  e.target.src =
                                    "https://placehold.co/40x40?text=Gift";
                                }}
                              />
                              <div>
                                <p className="text-sm font-bold text-gray-900 group-hover:text-primary transition-colors">
                                  {gc.giftname}
                                </p>
                                <p className="text-xs text-gray-400">
                                  {gc.categoryname || "Bundle"}
                                </p>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 text-sm font-semibold text-gray-600">
                            {gc.packingtype || "Standard Box"}
                          </td>
                          <td className="px-6 py-4 text-sm font-bold text-gray-900">
                            {gc.giftprice > gc.giftsellingprice && (
                              <span className="text-xs line-through text-gray-400 mr-2">
                                ₹{gc.giftprice}
                              </span>
                            )}
                            ₹{gc.giftsellingprice || gc.giftprice}
                          </td>
                          <td className="px-6 py-4 text-sm font-semibold text-gray-600">
                            {gc.stock} Units
                          </td>
                          <td className="px-6 py-4 text-xs font-semibold text-gray-500 max-w-xs truncate">
                            {gc.productlist
                              ? gc.productlist.map((p) => p.name).join(", ")
                              : "—"}
                          </td>
                          <td className="px-6 py-4 text-right">
                            <button
                              onClick={() =>
                                navigate(`/giftcards/${gc.giftid}`)
                              }
                              className="p-2 hover:bg-gray-100 rounded-lg text-gray-400 hover:text-primary transition-all cursor-pointer"
                            >
                              <ExternalLink className="w-4 h-4" />
                            </button>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td
                          colSpan="6"
                          className="px-6 py-12 text-center text-gray-500"
                        >
                          <div className="flex flex-col items-center justify-center">
                            <div className="w-12 h-12 bg-gray-50 rounded-full flex items-center justify-center mb-3">
                              <Gift className="w-6 h-6 text-gray-300" />
                            </div>
                            <p className="text-sm font-semibold text-gray-400">
                              No gift cards cataloged.
                            </p>
                          </div>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

const DetailCard = ({ icon: Icon, label, value }) => (
  <Card className="bg-gray-50/50 border-gray-100 shadow-none">
    <CardContent className="p-4 flex items-start gap-4">
      <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center text-primary shadow-sm border border-gray-100 shrink-0">
        <Icon className="w-5 h-5" />
      </div>
      <div className="min-w-0">
        <p className="text-[10px] uppercase tracking-wider text-gray-400 font-bold">
          {label}
        </p>
        <p className="text-sm font-semibold text-gray-900 mt-0.5 break-words">
          {value || "—"}
        </p>
      </div>
    </CardContent>
  </Card>
);

export default MerchantDetail;
