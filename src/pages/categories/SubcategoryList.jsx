import React, { useState, useEffect } from "react";
import TablePagination from "../../components/ui/TablePagination";
import Card, { CardHeader, CardContent } from "../../components/ui/Card";
import Button from "../../components/ui/Button";
import Badge from "../../components/ui/Badge";
import {
  Search,
  Plus,
  Edit,
  Trash2,
  X,
  Layers,
  Filter,
  Loader2,
} from "lucide-react";
import { toast } from "react-toastify";
import { API } from "../../services/api_service";
import { APIROUTES } from "../../routes/api_routes";

const SubcategoryList = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterCategory, setFilterCategory] = useState("All");
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [newSub, setNewSub] = useState({
    name: "",
    categoryId: "",
    status: "Active",
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  const [categories, setCategories] = useState([]);
  const [subcategories, setSubcategories] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchSubcategories = async (
    cats = categories,
    catId = filterCategory,
  ) => {
    setIsLoading(true);
    try {
      if (catId === "All") {
        const promises = cats.map((c) =>
          API.post(APIROUTES.GETALLSUBCATEGORIES, {
            categoryid: c.categoryid,
          }).catch(() => null),
        );
        const results = await Promise.all(promises);
        const allSubs = [];
        results.forEach((res) => {
          if (
            res &&
            res.data &&
            res.data.statusCode === 200 &&
            Array.isArray(res.data.data)
          ) {
            allSubs.push(...res.data.data);
          }
        });
        setSubcategories(allSubs);
      } else {
        const res = await API.post(APIROUTES.GETALLSUBCATEGORIES, {
          categoryid: parseInt(catId),
        });
        if (res.data && res.data.statusCode === 200) {
          setSubcategories(res.data.data || []);
        } else {
          setSubcategories([]);
        }
      }
    } catch (error) {
      console.error("Fetch subcategories error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const loadInitialData = async () => {
      setIsLoading(true);
      try {
        const catRes = await API.post(APIROUTES.GETALLCATEGORIES,{type:"all"});
        if (catRes.data && catRes.data.statusCode === 200) {
          const fetchedCats = catRes.data.data || [];
          setCategories(fetchedCats);

          const promises = fetchedCats.map((c) =>
            API.post(APIROUTES.GETALLSUBCATEGORIES, {
              categoryid: c.categoryid,
            }).catch(() => null),
          );
          const results = await Promise.all(promises);
          const allSubs = [];
          results.forEach((res) => {
            if (
              res &&
              res.data &&
              res.data.statusCode === 200 &&
              Array.isArray(res.data.data)
            ) {
              allSubs.push(...res.data.data);
            }
          });
          setSubcategories(allSubs);
        }
      } catch (error) {
        console.error("Load initial data error:", error);
        toast.error("Failed to load categories data");
      } finally {
        setIsLoading(false);
      }
    };
    loadInitialData();
  }, []);

  useEffect(() => {
    if (categories.length === 0) return;
    fetchSubcategories(categories, filterCategory);
  }, [filterCategory]);

  const filteredSubs = subcategories.filter(
    (sub) =>
      (filterCategory === "All" ||
        sub.categoryid.toString() === filterCategory.toString()) &&
      (sub.subcategoryname || "")
        .toLowerCase()
        .includes(searchTerm.toLowerCase()),
  );

  const paginatedSubs = filteredSubs.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage,
  );

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (editingId) {
      toast.success("Subcategory updated!");
      setIsAdding(false);
      setEditingId(null);
      setNewSub({ name: "", categoryId: "", status: "Active" });
      return;
    }

    const selectedCat = categories.find(
      (c) => c.categoryid.toString() === newSub.categoryId.toString(),
    );
    const categoryName = selectedCat ? selectedCat.categoryname : "";

    try {
      const payload = {
        categoryid: parseInt(newSub.categoryId),
        categoryname: categoryName,
        subcategoryname: newSub.name,
      };

      const response = await API.post(APIROUTES.ADDSUBCATEGORY, payload);
      if (response.data && response.data.statusCode === 200) {
        toast.success(`Subcategory "${newSub.name}" created successfully!`);
        setIsAdding(false);
        setNewSub({ name: "", categoryId: "", status: "Active" });
        fetchSubcategories(categories, filterCategory);
      } else {
        toast.error(response.data?.message || "Failed to create subcategory");
      }
    } catch (error) {
      console.error("Add subcategory error:", error);
    }
  };

  const handleEdit = (sub) => {
    setEditingId(sub.subcategoryid);
    setNewSub({
      name: sub.subcategoryname,
      categoryId: sub.categoryid.toString(),
      status: sub.status || "Active",
    });
    setIsAdding(true);
  };

  const handleDelete = (name) => {
    if (window.confirm(`Delete subcategory ${name}?`)) {
      toast.error(`Deleted ${name}`);
    }
  };

  const handleCancel = () => {
    setIsAdding(false);
    setEditingId(null);
    setNewSub({ name: "", categoryId: "", status: "Active" });
  };

  return (
    <div className="space-y-6 animate-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">
            Subcategories
          </h1>
        </div>
        {!isAdding && (
          <Button onClick={() => setIsAdding(true)} variant="accent">
            <Plus className="w-4 h-4" /> Add Subcategory
          </Button>
        )}
      </div>

      {isAdding && (
        <Card className="border-accent/30 bg-accent/5 overflow-hidden animate-in slide-in-from-top-4 duration-300">
          <CardHeader
            title={editingId ? "Edit Subcategory" : "Create Subcategory"}
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
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-gray-600 uppercase">
                    Subcategory Name
                  </label>
                  <input
                    type="text"
                    required
                    value={newSub.name}
                    onChange={(e) =>
                      setNewSub({ ...newSub, name: e.target.value })
                    }
                    className="w-full px-3 py-1.5 text-sm bg-white border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                    placeholder="e.g. Pearl Millet"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-gray-600 uppercase">
                    Parent Category
                  </label>
                  <select
                    required
                    value={newSub.categoryId}
                    onChange={(e) =>
                      setNewSub({ ...newSub, categoryId: e.target.value })
                    }
                    className="w-full px-3 py-1.5 text-sm bg-white border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                  >
                    <option value="">Select Category...</option>
                    {categories.map((cat) => (
                      <option key={cat.categoryid} value={cat.categoryid}>
                        {cat.categoryname}
                      </option>
                    ))}
                  </select>
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

      <Card>
        <CardHeader>
          <div className="flex flex-col md:flex-row items-center gap-4 w-full">
            <div className="relative w-full sm:w-72">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search subcategories..."
                className="w-full pl-11 pr-4 py-2 bg-gray-50 border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="relative w-full md:w-64">
              <Filter className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
              <select
                className="w-full pl-11 pr-4 py-2 bg-gray-50 border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all appearance-none"
                value={filterCategory}
                onChange={(e) => setFilterCategory(e.target.value)}
              >
                <option value="All">All Categories</option>
                {categories.map((cat) => (
                  <option key={cat.categoryid} value={cat.categoryid}>
                    {cat.categoryname}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </CardHeader>

        {isLoading ? (
          <div className="py-20 flex flex-col items-center justify-center gap-3">
            <Loader2 className="w-10 h-10 animate-spin text-primary" />
            <p className="text-sm font-bold text-gray-400 uppercase tracking-widest">
              Loading Subcategories...
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
                    Subcategory
                  </th>
                  <th className="px-4 py-3 text-[10px] font-bold text-gray-500 uppercase tracking-wider">
                    Parent Category
                  </th>
                  <th className="px-4 py-3 text-[10px] font-bold text-gray-500 uppercase tracking-wider text-right">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {paginatedSubs.map((sub, index) => (
                  <tr
                    key={sub.subcategoryid}
                    className="hover:bg-gray-50/50 transition-colors group cursor-pointer"
                    onClick={() => handleEdit(sub)}
                  >
                    <td className="px-4 py-3 text-xs font-semibold text-gray-600">
                      {(currentPage - 1) * itemsPerPage + index + 1}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <span className="font-bold text-xs text-gray-900 group-hover:text-primary transition-colors">
                          {sub.subcategoryname}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1.5 text-xs text-gray-600 font-medium">
                        {sub.categoryname}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex justify-end gap-1 transition-opacity">
                        <button
                          className="w-7 h-7 rounded-[10px] text-gray-400 hover:text-accent hover:bg-accent/10 transition-all flex items-center justify-center cursor-pointer"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleEdit(sub);
                          }}
                        >
                          <Edit className="w-3.5 h-3.5" />
                        </button>
                        <button
                          className="w-7 h-7 rounded-[10px] text-gray-400 hover:text-red-600 hover:bg-red-50 transition-all flex items-center justify-center cursor-pointer"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDelete(sub.subcategoryname);
                          }}
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {filteredSubs.length === 0 && (
                  <tr>
                    <td
                      colSpan="5"
                      className="px-4 py-8 text-center text-xs text-gray-500"
                    >
                      No subcategories found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
        <TablePagination
          dataLength={filteredSubs.length}
          currentPage={currentPage}
          setCurrentPage={setCurrentPage}
          itemsPerPage={itemsPerPage}
          setItemsPerPage={setItemsPerPage}
        />
      </Card>
    </div>
  );
};

export default SubcategoryList;
