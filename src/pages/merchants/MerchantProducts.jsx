import React, { useState, useEffect } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { ArrowLeft, Loader2, Package, Edit, ChevronLeft, ChevronRight } from "lucide-react";
import Card, { CardContent } from "../../components/ui/Card";
import Button from "../../components/ui/Button";
import { API } from "../../services/api_service";
import { APIROUTES, IMAGE_URL } from "../../routes/api_routes";
import { toast } from "react-toastify";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from "recharts";

const MerchantProducts = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const merchantName = location.state?.merchant?.businessname || "Merchant";

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("inStock"); // inStock, lowStock, outOfStock
  const [currentPage, setCurrentPage] = useState(1);
  const [editingStockId, setEditingStockId] = useState(null);
  const [newStockValue, setNewStockValue] = useState("");
  const itemsPerPage = 20;

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const res = await API.post(APIROUTES.PRODUCTSTOCKS || "/home/product-stocks", { bid: parseInt(id) });
          const data = res.data.data || {};
          const allProducts = [
            ...(data.instock || []),
            ...(data.lowstock || []),
            ...(data.outofstock || [])
          ];
          setProducts(allProducts);
      } catch (error) {
        console.error("Fetch error:", error);
        toast.error("Failed to fetch merchant products");
      } finally {
        setLoading(false);
      }
    };
    if (id) fetchProducts();
  }, [id]);

  const handleUpdateStock = async (productId, value) => {
    const numericVal = parseInt(value);
    if (isNaN(numericVal) || numericVal < 0) {
      toast.error("Please enter a valid stock quantity");
      return;
    }
    try {
      const res = await API.post(APIROUTES.UPDATEPRODUCTSTOCK || "/home/update-product-stock", {
        bid: parseInt(id),
        productid: productId,
        availablestock: numericVal,
      });
      if (res.data?.statusCode === 200 || res.status === 200) {
        setProducts((prev) =>
          prev.map((p) => (p.productid === productId ? { ...p, availablestock: numericVal } : p))
        );
        toast.success("Stock updated successfully");
        setEditingStockId(null);
      } else {
        toast.error("Failed to update stock");
      }
    } catch (error) {
      console.error(error);
      toast.error("Failed to update stock");
    }
  };

  const inStock = products.filter((p) => p.availablestock > 10);
  const lowStock = products.filter((p) => p.availablestock > 0 && p.availablestock <= 10);
  const outOfStock = products.filter((p) => p.availablestock === 0);

  const chartData = [
    { name: "In Stock", value: inStock.length, color: "#10B981" },
    { name: "Low Stock", value: lowStock.length, color: "#F59E0B" },
    { name: "Out of Stock", value: outOfStock.length, color: "#F43F5E" },
  ];

  let currentList = inStock;
  if (activeTab === "lowStock") currentList = lowStock;
  if (activeTab === "outOfStock") currentList = outOfStock;

  const totalPages = Math.ceil(currentList.length / itemsPerPage) || 1;
  const paginatedData = currentList.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    setCurrentPage(1);
    setEditingStockId(null);
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh]">
        <Loader2 className="w-10 h-10 animate-spin text-[var(--color-primary)]" />
        <p className="mt-4 text-gray-500 font-bold tracking-widest uppercase text-sm">Loading Products...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex items-center gap-4">
        <Button onClick={() => navigate(-1)} variant="outline" className="text-gray-600 bg-white shadow-sm border-gray-200 hover:text-gray-900 font-bold">
          <ArrowLeft className="w-4 h-4 mr-2" /> Back
        </Button>
        <h1 className="text-2xl font-bold text-gray-900 tracking-tight">{merchantName} Products</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        <Card className="lg:col-span-1 border-0 shadow-sm ring-1 ring-gray-200 bg-white sticky top-24">
          <CardContent className="p-6">
            <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider text-center mb-4">Stock Overview</h3>
            <div className="h-64 w-full relative">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={chartData}
                    cx="50%"
                    cy="50%"
                    innerRadius={65}
                    outerRadius={85}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {chartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ borderRadius: "12px", border: "none", boxShadow: "0 10px 15px -3px rgba(0,0,0,0.1)" }}
                    itemStyle={{ fontWeight: "bold" }}
                  />
                  <Legend verticalAlign="bottom" height={36} wrapperStyle={{ fontSize: "12px", fontWeight: "bold" }}/>
                </PieChart>
              </ResponsiveContainer>
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none pb-8">
                <div className="text-center">
                  <span className="block text-3xl font-black text-gray-900">{products.length}</span>
                  <span className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-1">Total</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="lg:col-span-2 border-0 shadow-sm ring-1 ring-gray-200 bg-white flex flex-col overflow-hidden">
          <div className="flex border-b border-gray-100 overflow-x-auto">
            <button
              onClick={() => handleTabChange("inStock")}
              className={`flex-1 py-4 px-6 text-sm font-bold text-center border-b-2 transition-colors whitespace-nowrap ${
                activeTab === "inStock" ? "border-emerald-500 text-emerald-600 bg-emerald-50/50" : "border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-50"
              }`}
            >
              In Stock ({inStock.length})
            </button>
            <button
              onClick={() => handleTabChange("lowStock")}
              className={`flex-1 py-4 px-6 text-sm font-bold text-center border-b-2 transition-colors whitespace-nowrap ${
                activeTab === "lowStock" ? "border-amber-500 text-amber-600 bg-amber-50/50" : "border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-50"
              }`}
            >
              Low Stock ({lowStock.length})
            </button>
            <button
              onClick={() => handleTabChange("outOfStock")}
              className={`flex-1 py-4 px-6 text-sm font-bold text-center border-b-2 transition-colors whitespace-nowrap ${
                activeTab === "outOfStock" ? "border-rose-500 text-rose-600 bg-rose-50/50" : "border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-50"
              }`}
            >
              Out of Stock ({outOfStock.length})
            </button>
          </div>

          <div className="flex-1 overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50/80 border-b border-gray-100">
                  <th className="px-5 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider w-16 text-center">S.No</th>
                  <th className="px-5 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Product Image</th>
                  <th className="px-5 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Product Name</th>
                  <th className="px-5 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider text-center">Current Stock</th>
                  <th className="px-5 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider text-right">Update Option</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {paginatedData.map((item, index) => (
                  <tr key={item.productid} className="hover:bg-gray-50/50 transition-colors group">
                    <td className="px-5 py-4 align-middle text-center font-bold text-gray-400 text-sm">
                      {(currentPage - 1) * itemsPerPage + index + 1}
                    </td>
                    <td className="px-5 py-4 align-middle">
                      <div className="w-12 h-12 rounded-xl overflow-hidden bg-gray-100 ring-1 ring-gray-200">
                        {item.productimage ? (
                          <img
                            src={IMAGE_URL + item.productimage}
                            alt={item.productname}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <Package className="w-6 h-6 text-gray-300 m-3" />
                        )}
                      </div>
                    </td>
                    <td className="px-5 py-4 align-middle">
                      <span className="font-bold text-sm text-gray-900 group-hover:text-[var(--color-primary)] transition-colors">{item.productname}</span>
                    </td>
                    <td className="px-5 py-4 text-center align-middle">
                      <span
                        className={`text-base font-black ${
                          item.availablestock === 0 ? "text-rose-600" : item.availablestock <= 10 ? "text-amber-600" : "text-emerald-600"
                        }`}
                      >
                        {item.availablestock} <span className="text-xs font-bold text-gray-400">u</span>
                      </span>
                    </td>
                    <td className="px-5 py-4 text-right align-middle">
                      {editingStockId === item.productid ? (
                        <div className="flex items-center justify-end gap-2">
                          <input
                            type="number"
                            min="0"
                            value={newStockValue}
                            onChange={(e) => setNewStockValue(e.target.value)}
                            className="w-16 px-2 py-1.5 text-sm ring-2 ring-indigo-500 rounded-lg font-bold text-center outline-none shadow-sm"
                            autoFocus
                          />
                          <Button
                            onClick={() => handleUpdateStock(item.productid, newStockValue)}
                            className="px-3 py-1.5 text-xs h-auto bg-gray-900 hover:bg-gray-800 text-white rounded-lg font-bold"
                          >
                            Save
                          </Button>
                        </div>
                      ) : (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setEditingStockId(item.productid);
                            setNewStockValue(item.availablestock.toString());
                          }}
                          className="h-9 px-3 text-xs font-bold border-gray-200 text-gray-700 hover:bg-gray-50 hover:text-[var(--color-primary)]"
                        >
                          <Edit className="w-3.5 h-3.5 mr-1.5" /> Update
                        </Button>
                      )}
                    </td>
                  </tr>
                ))}
                {paginatedData.length === 0 && (
                  <tr>
                    <td colSpan="5" className="py-12 text-center text-sm text-gray-500 font-semibold">
                      No products found in this category.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {totalPages > 1 && (
            <div className="p-4 border-t border-gray-100 flex items-center justify-between bg-gray-50/50">
              <span className="text-sm font-semibold text-gray-500">
                Page <span className="text-gray-900">{currentPage}</span> of <span className="text-gray-900">{totalPages}</span>
              </span>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  className="h-8 w-8 p-0 border-gray-200 text-gray-600 hover:text-[var(--color-primary)]"
                >
                  <ChevronLeft className="w-4 h-4" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={currentPage === totalPages}
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  className="h-8 w-8 p-0 border-gray-200 text-gray-600 hover:text-[var(--color-primary)]"
                >
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
};

export default MerchantProducts;
