import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import TablePagination from "../../components/ui/TablePagination";
import Card, { CardHeader, CardContent } from "../../components/ui/Card";
import Button from "../../components/ui/Button";
import Badge from "../../components/ui/Badge";
import {
  Search,
  Plus,
  Eye,
  Edit,
  Trash2,
  X,
  Upload,
  Layers,
  Info,
  Image,
  Calendar,
  Filter,
  Loader2,
} from "lucide-react";
import { toast } from "react-toastify";
import { API } from "../../services/api_service";
import { APIROUTES } from "../../routes/api_routes";

const CategoryList = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [newCategory, setNewCategory] = useState({
    name: "",
    description: "",
    image: null,
  });
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [categories, setCategories] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const IMAGE_BASE =
    process.env.NEXT_PUBLIC_IMAGE_URL || "http://localhost:3003";

  const fetchCategories = async () => {
    setIsLoading(true);
    try {
      const response = await API.post(APIROUTES.GETALLCATEGORIES);
      if (response.data && response.data.statusCode === 200) {
        setCategories(response.data.data || []);
      } else {
        toast.error(response.data?.message || "Failed to fetch categories");
      }
    } catch (error) {
      console.error("Fetch categories error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const filteredCategories = categories.filter((cat) =>
    (cat.categoryname || "").toLowerCase().includes(searchTerm.toLowerCase()),
  );

  const paginatedCategories = filteredCategories.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage,
  );

  const handleEdit = (cat) => {
    setEditingId(cat.categoryid);
    setNewCategory({
      name: cat.categoryname,
      description: cat.description || "",
      image: null,
    });
    setIsAdding(true);
    setSelectedCategory(null);
    document.querySelector("main")?.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (editingId) {
      toast.success(`Category updated successfully!`);
      setIsAdding(false);
      setEditingId(null);
      setNewCategory({ name: "", description: "", image: null });
      return;
    }

    try {
      const formData = new FormData();
      formData.append("categoryname", newCategory.name);
      formData.append("description", newCategory.description);
      if (newCategory.image) {
        formData.append("categoryimage", newCategory.image);
      }

      const response = await API.post(APIROUTES.ADDCATEGORY, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      if (response.data && response.data.statusCode === 200) {
        toast.success(`Category "${newCategory.name}" created successfully!`);
        setIsAdding(false);
        setNewCategory({ name: "", description: "", image: null });
        fetchCategories();
      } else {
        toast.error(response.data?.message || "Failed to create category");
      }
    } catch (error) {
      console.error("Add category error:", error);
    }
  };

  const handleDelete = (name) => {
    if (window.confirm(`Delete category "${name}"?`)) {
      toast.error(`Category ${name} removed`);
    }
  };

  const handleCancel = () => {
    setIsAdding(false);
    setEditingId(null);
    setNewCategory({ name: "", description: "", image: null });
  };

  return (
    <div className="space-y-6 animate-in slide-in-from-bottom-4 duration-500">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">
            Categories
          </h1>
        </div>
        {!isAdding && (
          <Button onClick={() => setIsAdding(true)} variant="accent">
            <Plus className="w-4 h-4" /> Add Category
          </Button>
        )}
      </div>

      {/* Form Section */}
      {isAdding && (
        <Card className="border-accent/30 bg-accent/5 overflow-hidden animate-in slide-in-from-top-4 duration-300">
          <CardHeader
            title={editingId ? "Edit Category" : "Create Category"}
            className="p-4 border-b border-gray-100"
          >
            <button
              onClick={handleCancel}
              className="p-1.5 hover:bg-gray-100 rounded-[10px] transition-colors cursor-pointer"
            >
              <X className="w-4 h-4 text-gray-400" />
            </button>
          </CardHeader>
          <CardContent className="p-4">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="flex gap-4 items-start">
                <div className="shrink-0 relative">
                  <div className="w-20 h-20 rounded-xl border-2 border-dashed border-gray-300 bg-gray-50 flex flex-col items-center justify-center gap-1 cursor-pointer hover:border-primary transition-all overflow-hidden group">
                    {newCategory.image ? (
                      <img
                        src={URL.createObjectURL(newCategory.image)}
                        alt="Preview"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <>
                        <Upload className="w-5 h-5 text-gray-400 group-hover:text-primary" />
                        <span className="text-[8px] font-bold text-gray-400 uppercase">
                          Upload
                        </span>
                      </>
                    )}
                    <input
                      type="file"
                      className="absolute inset-0 opacity-0 cursor-pointer"
                      onChange={(e) =>
                        setNewCategory({
                          ...newCategory,
                          image: e.target.files[0],
                        })
                      }
                    />
                  </div>
                </div>

                <div className="flex-1 space-y-3">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-gray-600 uppercase">
                      Category Name
                    </label>
                    <input
                      type="text"
                      className="w-full px-3 py-1.5 text-sm bg-white border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                      placeholder="e.g. Organic Millets"
                      required
                      value={newCategory.name}
                      onChange={(e) =>
                        setNewCategory({ ...newCategory, name: e.target.value })
                      }
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-gray-600 uppercase">
                      Short Description
                    </label>
                    <textarea
                      className="w-full px-3 py-1.5 text-sm bg-white border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all min-h-[60px] resize-none"
                      placeholder="Brief summary..."
                      value={newCategory.description}
                      onChange={(e) =>
                        setNewCategory({
                          ...newCategory,
                          description: e.target.value,
                        })
                      }
                    />
                  </div>
                </div>
              </div>
              <div className="flex justify-end gap-2 pt-3 border-t border-gray-50">
                <Button
                  type="button"
                  variant="outline"
                  className="h-8 text-xs rounded-[10px]"
                  onClick={handleCancel}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="primary"
                  className="h-8 text-xs rounded-[10px]"
                >
                  {editingId ? "Update" : "Save"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* List Section */}
      <Card>
        <CardHeader>
          <div className="flex flex-col md:flex-row items-center gap-4 w-full">
            <div className="relative w-full sm:w-72">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search categories..."
                className="w-full pl-11 pr-4 py-2 bg-gray-50 border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all duration-200"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
        </CardHeader>

        {isLoading ? (
          <div className="py-20 flex flex-col items-center justify-center gap-3">
            <Loader2 className="w-10 h-10 animate-spin text-primary" />
            <p className="text-sm font-bold text-gray-400 uppercase tracking-widest">
              Loading Categories...
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-gray-50 border-b border-border">
                  <th className="px-4 py-3 text-[10px] font-bold text-gray-500 uppercase tracking-wider w-12">
                    S.No
                  </th>
                  <th className="px-4 py-3 text-[10px] font-bold text-gray-500 uppercase tracking-wider">
                    Category
                  </th>
                  <th className="px-4 py-3 text-[10px] font-bold text-gray-500 uppercase tracking-wider">
                    Description
                  </th>
                  <th className="px-4 py-3 text-[10px] font-bold text-gray-500 uppercase tracking-wider">
                    Products
                  </th>

                  <th className="px-4 py-3 text-[10px] font-bold text-gray-500 uppercase tracking-wider text-right">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {paginatedCategories.map((cat, index) => (
                  <tr
                    key={cat.categoryid}
                    className="hover:bg-gray-50/50 transition-colors group cursor-pointer"
                    onClick={() => setSelectedCategory(cat)}
                  >
                    <td className="px-4 py-3 text-xs font-semibold text-gray-600">
                      {(currentPage - 1) * itemsPerPage + index + 1}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        {cat.categoryimage ? (
                          <img
                            src={`${IMAGE_BASE}${cat.categoryimage}`}
                            alt={cat.categoryname}
                            className="w-8 h-8 rounded-[10px] object-cover border border-border shrink-0"
                            onError={(e) => {
                              e.target.onerror = null;
                              e.target.style.display = "none";
                              e.target.nextSibling.style.display = "flex";
                            }}
                          />
                        ) : null}
                        <div
                          className="w-8 h-8 rounded-[10px] bg-primary/10 flex items-center justify-center text-primary font-bold text-xs shrink-0 uppercase"
                          style={{
                            display: cat.categoryimage ? "none" : "flex",
                          }}
                        >
                          {(cat.categoryname || "C").charAt(0)}
                        </div>
                        <span className="font-bold text-xs text-gray-900 group-hover:text-primary transition-colors">
                          {cat.categoryname}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <p className="text-xs text-gray-500 max-w-xs truncate">
                        {cat.description || "No description."}
                      </p>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1.5 text-xs text-gray-600 font-medium">
                        <Layers className="w-3.5 h-3.5 text-gray-400" />{" "}
                        {cat.products || 0}
                      </div>
                    </td>

                    <td className="px-4 py-3 text-right">
                      <div className="flex justify-end gap-1 transition-opacity">
                        <button
                          className="w-7 h-7 rounded-[10px] text-gray-400 hover:text-primary hover:bg-primary/10 transition-all flex items-center justify-center cursor-pointer"
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedCategory(cat);
                          }}
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </button>
                        <button
                          className="w-7 h-7 rounded-[10px] text-gray-400 hover:text-accent hover:bg-accent/10 transition-all flex items-center justify-center cursor-pointer"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleEdit(cat);
                          }}
                        >
                          <Edit className="w-3.5 h-3.5" />
                        </button>
                        <button
                          className="w-7 h-7 rounded-[10px] text-gray-400 hover:text-red-600 hover:bg-red-50 transition-all flex items-center justify-center cursor-pointer"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDelete(cat.categoryname);
                          }}
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {filteredCategories.length === 0 && (
                  <tr>
                    <td
                      colSpan="6"
                      className="px-4 py-8 text-center text-xs text-gray-500"
                    >
                      No categories found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
        <TablePagination
          dataLength={filteredCategories.length}
          currentPage={currentPage}
          setCurrentPage={setCurrentPage}
          itemsPerPage={itemsPerPage}
          setItemsPerPage={setItemsPerPage}
        />
      </Card>

      {/* Category View Sidebar Drawer */}
      {selectedCategory &&
        createPortal(
          <>
            <div
              className="fixed inset-0 z-[9999] bg-black/40 backdrop-blur-sm transition-opacity"
              onClick={() => setSelectedCategory(null)}
            />
            <div className="fixed inset-y-0 right-0 z-[10000] w-full sm:w-[420px] bg-white shadow-2xl flex flex-col animate-in slide-in-from-right duration-300">
              <div className="p-6 pb-4">
                <div className="flex justify-between items-start">
                  <div>
                    <h2 className="text-xl font-bold text-gray-900 tracking-tight">
                      Category Details
                    </h2>
                    <span className="inline-block mt-1.5 text-[10px] font-bold text-[#4c6b22] bg-[#4c6b22]/10 px-2 py-0.5 rounded-[6px]">
                      CAT-00{selectedCategory.categoryid}
                    </span>
                  </div>
                  <button
                    onClick={() => setSelectedCategory(null)}
                    className="w-8 h-8 rounded-full bg-white border border-gray-100 shadow-sm hover:shadow-md transition-all flex items-center justify-center cursor-pointer text-gray-400 hover:text-gray-600"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div className="px-6 py-5 flex items-center gap-4 border-b border-gray-50">
                <div className="w-16 h-16 rounded-[16px] bg-gray-50 border border-gray-100 flex items-center justify-center text-gray-400 overflow-hidden shrink-0">
                  {selectedCategory.categoryimage ? (
                    <img
                      src={`${IMAGE_BASE}${selectedCategory.categoryimage}`}
                      alt={selectedCategory.categoryname}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.style.display = "none";
                        e.target.nextSibling.style.display = "flex";
                      }}
                    />
                  ) : null}
                  <div
                    className="w-full h-full flex items-center justify-center"
                    style={{
                      display: selectedCategory.categoryimage ? "none" : "flex",
                    }}
                  >
                    <Image className="w-6 h-6 stroke-[1.5]" />
                  </div>
                </div>
                <div className="space-y-1 min-w-0">
                  <h3 className="text-lg font-bold text-gray-900 leading-tight truncate">
                    {selectedCategory.categoryname}
                  </h3>
                  <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-[#f0f9eb] text-[10px] font-bold text-[#67c23a]">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#67c23a]"></span>
                    {selectedCategory.status || "Active"}
                  </span>
                </div>
              </div>

              <div className="flex-1 overflow-y-auto p-6 space-y-6">
                <div className="space-y-2">
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest flex items-center gap-1.5">
                    <Filter className="w-3.5 h-3.5 text-gray-400" /> Description
                  </p>
                  <p className="text-sm font-semibold text-gray-800 leading-relaxed">
                    {selectedCategory.description ||
                      "No description provided for this category."}
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-6 pt-5 border-t border-gray-50">
                  <div className="space-y-1">
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest flex items-center gap-1.5">
                      <Layers className="w-3.5 h-3.5 text-gray-400" /> Products
                    </p>
                    <p className="text-sm font-bold text-gray-800">
                      {selectedCategory.products || 0} Items Linked
                    </p>
                  </div>
                </div>

                <div className="pt-6">
                  <button
                    onClick={() => {
                      handleEdit(selectedCategory);
                    }}
                    className="w-full flex items-center justify-center gap-2 py-3 bg-primary hover:bg-primary/95 text-white font-bold text-sm rounded-[10px] shadow-sm transition-all cursor-pointer"
                  >
                    <Edit className="w-4 h-4" /> Edit Category
                  </button>
                </div>
              </div>
            </div>
          </>,
          document.body,
        )}
    </div>
  );
};

export default CategoryList;
