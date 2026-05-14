import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Tag,
  Layers,
  Box,
  CheckCircle2,
  AlertCircle,
  Share2,
  Edit,
  Scale,
  Activity,
  Loader2,
  Info,
  Sparkles,
  Globe,
  Clock,
  ShieldCheck,
} from "lucide-react";
import Card, { CardContent } from "../../components/ui/Card";
import Button from "../../components/ui/Button";
import Badge from "../../components/ui/Badge";
import { toast } from "react-toastify";
import { API } from "../../services/api_service";
import { APIROUTES } from "../../routes/api_routes";

const ProductDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [detail, setDetail] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState(null);
  const [activeTab, setActiveTab] = useState("overview");

  const IMAGE_BASE = process.env.NEXT_PUBLIC_IMAGE_URL || "http://localhost:3003";

  useEffect(() => {
    const fetchDetail = async () => {
      setIsLoading(true);
      try {
        const response = await API.post(APIROUTES.PRODUCTDETAILS, {
          productid: parseInt(id),
          itemtype: "product",
        });
        if (response.data && response.data.statusCode === 200) {
          setDetail(response.data.data);
          if (response.data.data?.productdetail?.productimage) {
            setSelectedImage(response.data.data.productdetail.productimage);
          }
        } else {
          toast.error(response.data?.message || "Failed to fetch product detail");
        }
      } catch (error) {
        console.error("Fetch product detail error:", error);
      } finally {
        setIsLoading(false);
      }
    };
    if (id) {
      fetchDetail();
    }
  }, [id]);

  if (isLoading) {
    return (
      <div className="py-32 flex flex-col items-center justify-center gap-3">
        <Loader2 className="w-10 h-10 animate-spin text-primary" />
        <p className="text-sm font-bold text-gray-400 uppercase tracking-widest">
          Loading Product Specifications...
        </p>
      </div>
    );
  }

  const p = detail ? detail.productdetail : null;

  if (!p) {
    return (
      <div className="py-20 text-center space-y-3">
        <AlertCircle className="w-12 h-12 text-rose-500 mx-auto" />
        <p className="text-gray-600 font-bold text-base">Product not found.</p>
        <Button onClick={() => navigate(-1)} variant="outline" className="text-xs">
          Go Back
        </Button>
      </div>
    );
  }

  const displayImages = [p.productimage, p.image1, p.image2, p.image3, p.image4].filter(
    Boolean,
  );
  const currentDisplayImg = selectedImage ? `${IMAGE_BASE}${selectedImage}` : "https://picsum.photos/600";

  const discountPercent = p.sellingprice > 0 && p.sellingprice < p.price
    ? Math.round(((p.price - p.sellingprice) / p.price) * 100)
    : 0;

  return (
    <div className="max-w-5xl mx-auto space-y-6 animate-in fade-in duration-500 pb-12">
      {/* Top Header Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-4 rounded-xl shadow-xs border border-border">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-sm font-bold text-gray-600 hover:text-primary transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Products
        </button>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            className="h-9 text-xs rounded-lg font-bold"
            onClick={() => toast.info("Link shared successfully!")}
          >
            <Share2 className="w-3.5 h-3.5 mr-1.5" /> Share
          </Button>
          <Button
            variant="primary"
            className="h-9 text-xs rounded-lg shadow-2xs"
            onClick={() => toast.success("Edit specification trigger")}
          >
            <Edit className="w-3.5 h-3.5 mr-1.5" /> Edit Product
          </Button>
        </div>
      </div>

      {/* Main Content Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Gallery & Images (Cols 1-5) */}
        <div className="lg:col-span-5 space-y-4">
          <Card className="overflow-hidden p-2 shadow-xs border border-border rounded-xl">
            <div className="aspect-square rounded-lg overflow-hidden bg-gray-50 flex items-center justify-center relative">
              <img
                src={currentDisplayImg}
                alt={p.productname}
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = "https://picsum.photos/600";
                }}
              />
              <div className="absolute top-3 left-3 flex flex-col gap-1">
                <Badge variant="accent" className="text-[10px] font-bold px-2 py-0.5 shadow-xs">
                  {p.brandname || "Tradizions"}
                </Badge>
                {p.isFeatured && (
                  <Badge variant="warning" className="text-[10px] font-bold px-2 py-0.5 shadow-xs">
                    Featured
                  </Badge>
                )}
              </div>
            </div>

            {displayImages.length > 1 && (
              <div className="flex items-center gap-2 overflow-x-auto pt-2 custom-scrollbar">
                {displayImages.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setSelectedImage(img)}
                    className={`w-16 h-16 rounded-lg overflow-hidden shrink-0 border-2 transition-all cursor-pointer ${
                      selectedImage === img
                        ? "border-primary shadow-xs"
                        : "border-transparent opacity-70 hover:opacity-100"
                    }`}
                  >
                    <img
                      src={`${IMAGE_BASE}${img}`}
                      alt=""
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </Card>
        </div>

        {/* Specifications & Overview (Cols 6-12) */}
        <div className="lg:col-span-7 space-y-6">
          <div className="bg-white p-6 rounded-xl shadow-xs border border-border space-y-4">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                <Box className="w-4 h-4 text-primary" /> SKU: MT-00{p.productid}
              </div>
              <Badge
                variant={p.availablestock > 0 ? "success" : "danger"}
                className="text-xs font-bold px-2.5 py-1 rounded-md"
              >
                {p.availablestock > 0 ? `In Stock (${p.availablestock})` : "Out of Stock"}
              </Badge>
            </div>

            <div>
              <h1 className="text-2xl font-bold text-gray-900 tracking-tight">
                {p.productname}
              </h1>
              <p className="text-xs font-medium text-gray-500 uppercase tracking-wider mt-1 flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5 text-accent" /> {p.categoryname || "Category"} &bull; {p.subcategoryname || "Subcategory"}
              </p>
            </div>

            {/* Pricing Section matching Native App Theme */}
            <div className="bg-primary/5 border border-primary/20 p-4 rounded-xl flex items-center justify-between">
              <div>
                <span className="text-xs font-bold text-gray-500 uppercase tracking-wider block mb-0.5">
                  Selling Price
                </span>
                <div className="flex items-baseline gap-3">
                  <span className="text-2xl font-black text-primary">
                    ₹{p.sellingprice > 0 ? p.sellingprice : p.price}
                  </span>
                  {discountPercent > 0 && (
                    <span className="text-sm font-semibold text-gray-400 line-through">
                      ₹{p.price}
                    </span>
                  )}
                </div>
              </div>
              {discountPercent > 0 && (
                <Badge variant="accent" className="font-bold text-xs px-3 py-1 shadow-xs">
                  {discountPercent}% OFF
                </Badge>
              )}
            </div>

            {/* Micro Spec Cards */}
            <div className="grid grid-cols-3 gap-3 pt-2">
              <div className="bg-gray-50 p-3 rounded-lg border border-border flex flex-col justify-center">
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Weight</span>
                <span className="text-sm font-bold text-gray-800 mt-0.5">{p.weight} {p.unit}</span>
              </div>
              <div className="bg-gray-50 p-3 rounded-lg border border-border flex flex-col justify-center">
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Origin</span>
                <span className="text-sm font-bold text-gray-800 mt-0.5">{p.country || "India"}</span>
              </div>
              <div className="bg-gray-50 p-3 rounded-lg border border-border flex flex-col justify-center">
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Shelf Life</span>
                <span className="text-sm font-bold text-gray-800 mt-0.5">{p.shelflife || "12 Months"}</span>
              </div>
            </div>
          </div>

          {/* Interactive Navigation Tabs */}
          <div className="bg-white rounded-xl shadow-xs border border-border overflow-hidden">
            <div className="flex border-b border-border bg-gray-50/50 px-2 pt-2 gap-1">
              <button
                onClick={() => setActiveTab("overview")}
                className={`px-4 py-2.5 text-xs font-bold rounded-t-lg transition-all cursor-pointer flex items-center gap-2 ${
                  activeTab === "overview"
                    ? "bg-white text-primary border-t border-x border-border font-extrabold shadow-2xs"
                    : "text-gray-500 hover:text-gray-800"
                }`}
              >
                <Info className="w-3.5 h-3.5" /> Overview
              </button>
              <button
                onClick={() => setActiveTab("ingredients")}
                className={`px-4 py-2.5 text-xs font-bold rounded-t-lg transition-all cursor-pointer flex items-center gap-2 ${
                  activeTab === "ingredients"
                    ? "bg-white text-primary border-t border-x border-border font-extrabold shadow-2xs"
                    : "text-gray-500 hover:text-gray-800"
                }`}
              >
                <Sparkles className="w-3.5 h-3.5" /> Ingredients & Storage
              </button>
              <button
                onClick={() => setActiveTab("nutrition")}
                className={`px-4 py-2.5 text-xs font-bold rounded-t-lg transition-all cursor-pointer flex items-center gap-2 ${
                  activeTab === "nutrition"
                    ? "bg-white text-primary border-t border-x border-border font-extrabold shadow-2xs"
                    : "text-gray-500 hover:text-gray-800"
                }`}
              >
                <Activity className="w-3.5 h-3.5" /> Nutrition Facts
              </button>
            </div>

            <div className="p-6">
              {activeTab === "overview" && (
                <div className="space-y-3 animate-in fade-in duration-300">
                  <h3 className="text-xs font-bold text-gray-700 uppercase tracking-wider">
                    Product Description
                  </h3>
                  <p className="text-xs text-gray-600 leading-relaxed font-medium whitespace-pre-wrap">
                    {p.description || "No description provided."}
                  </p>
                </div>
              )}

              {activeTab === "ingredients" && (
                <div className="space-y-4 animate-in fade-in duration-300">
                  <div>
                    <span className="font-bold text-xs text-gray-700 uppercase tracking-wider block mb-1">
                      Ingredients
                    </span>
                    <p className="text-xs text-gray-600 font-medium bg-gray-50 p-3 rounded-lg border border-border">
                      {p.ingredients || "100% Premium Natural Whole Product."}
                    </p>
                  </div>

                  <div>
                    <span className="font-bold text-xs text-gray-700 uppercase tracking-wider block mb-1">
                      Storage Recommendations
                    </span>
                    <p className="text-xs text-gray-600 font-medium bg-gray-50 p-3 rounded-lg border border-border">
                      {p.storageinfo || "Store in a cool, dry place in an airtight container."}
                    </p>
                  </div>
                </div>
              )}

              {activeTab === "nutrition" && (
                <div className="space-y-4 animate-in fade-in duration-300">
                  <h3 className="text-xs font-bold text-gray-700 uppercase tracking-wider">
                    Nutrition Values (Per Serving)
                  </h3>
                  <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                    <div className="bg-primary/5 border border-primary/10 p-3 rounded-lg text-center">
                      <span className="text-[10px] font-bold text-gray-500 uppercase block mb-1">Calories</span>
                      <span className="text-base font-black text-primary block">{p.calories || 0}</span>
                      <span className="text-[9px] text-gray-400 font-bold block">kcal</span>
                    </div>
                    <div className="bg-gray-50 border border-border p-3 rounded-lg text-center">
                      <span className="text-[10px] font-bold text-gray-500 uppercase block mb-1">Protein</span>
                      <span className="text-base font-black text-gray-800 block">{p.protien || 0}g</span>
                    </div>
                    <div className="bg-gray-50 border border-border p-3 rounded-lg text-center">
                      <span className="text-[10px] font-bold text-gray-500 uppercase block mb-1">Fiber</span>
                      <span className="text-base font-black text-gray-800 block">{p.fibre || 0}g</span>
                    </div>
                    <div className="bg-gray-50 border border-border p-3 rounded-lg text-center">
                      <span className="text-[10px] font-bold text-gray-500 uppercase block mb-1">Fat</span>
                      <span className="text-base font-black text-gray-800 block">{p.fat || 0}g</span>
                    </div>
                    <div className="bg-gray-50 border border-border p-3 rounded-lg text-center sm:col-span-1 col-span-2">
                      <span className="text-[10px] font-bold text-gray-500 uppercase block mb-1">Carbs</span>
                      <span className="text-base font-black text-gray-800 block">{p.carbohydrates || 0}g</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetail;
