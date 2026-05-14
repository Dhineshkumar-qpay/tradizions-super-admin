import React, { useState, useEffect } from "react";
import Card, { CardHeader, CardContent } from "../../components/ui/Card";
import Button from "../../components/ui/Button";
import TablePagination from "../../components/ui/TablePagination";
import {
  Search,
  Plus,
  Trash2,
  Edit,
  X,
  BookOpen,
  Quote,
  Loader2,
} from "lucide-react";
import { toast } from "react-toastify";
import { API } from "../../services/api_service";
import { APIROUTES } from "../../routes/api_routes";

const KuralList = () => {
  const [kurals, setKurals] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({ kural: "", meaning: "" });

  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  const fetchKurals = async () => {
    setIsLoading(true);
    try {
      const response = await API.post(APIROUTES.GETKURALS);
      if (response.data && response.data.statusCode === 200) {
        setKurals(response.data.data || []);
      } else {
        toast.error(response.data?.message || "Failed to fetch Kurals");
      }
    } catch (error) {
      console.error("Fetch kurals error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchKurals();
  }, []);

  const filteredKurals = kurals.filter(
    (item) =>
      (item.kural &&
        item.kural.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (item.meaning &&
        item.meaning.toLowerCase().includes(searchTerm.toLowerCase())),
  );

  const paginatedKurals = filteredKurals.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage,
  );

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.kural.trim() || !formData.meaning.trim()) {
      toast.error("Please fill in both Kural and Meaning fields.");
      return;
    }

    if (editingId) {
      setKurals(
        kurals.map((item) =>
          item.kuralid === editingId ? { ...item, ...formData } : item,
        ),
      );
      toast.success("Thinam Oru Kural updated successfully!");
    } else {
      const newKural = {
        kuralid: Date.now(),
        kural: formData.kural,
        meaning: formData.meaning,
        createdAt: new Date().toISOString(),
      };
      setKurals([newKural, ...kurals]);
      toast.success("Thinam Oru Kural added successfully!");
    }

    setFormData({ kural: "", meaning: "" });
    setIsAdding(false);
    setEditingId(null);
  };

  const handleEdit = (item) => {
    setFormData({ kural: item.kural, meaning: item.meaning });
    setEditingId(item.kuralid);
    setIsAdding(true);
  };

  const handleDelete = (id) => {
    if (window.confirm("Are you sure you want to delete this Kural?")) {
      setKurals(kurals.filter((item) => item.kuralid !== id));
      toast.error("Kural removed successfully.");
    }
  };

  const handleCancel = () => {
    setIsAdding(false);
    setEditingId(null);
    setFormData({ kural: "", meaning: "" });
  };

  return (
    <div className="space-y-6 animate-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight flex items-center gap-2">
            <BookOpen className="w-6 h-6 text-primary" /> Thinam Oru Kural
          </h1>
        </div>
        {!isAdding && (
          <Button onClick={() => setIsAdding(true)} variant="accent">
            <Plus className="w-4 h-4" /> Add Kural
          </Button>
        )}
      </div>

      {isAdding && (
        <Card className="border-accent/30 bg-accent/5 overflow-hidden animate-in slide-in-from-top-4 duration-300">
          <CardHeader
            title={editingId ? "Edit Kural" : "Add New Kural"}
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
                    Kural Verse (குறள்)
                  </label>
                  <textarea
                    required
                    rows={3}
                    value={formData.kural}
                    onChange={(e) =>
                      setFormData({ ...formData, kural: e.target.value })
                    }
                    className="w-full px-3 py-2 text-xs bg-white border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all font-medium leading-relaxed"
                    placeholder="Enter 2-line Thirukkural verse..."
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-gray-600 uppercase">
                    Meaning (விளக்கம்)
                  </label>
                  <textarea
                    required
                    rows={3}
                    value={formData.meaning}
                    onChange={(e) =>
                      setFormData({ ...formData, meaning: e.target.value })
                    }
                    className="w-full px-3 py-2 text-xs bg-white border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all font-medium leading-relaxed"
                    placeholder="Enter Kural explanation / meaning..."
                  />
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
                  {editingId ? "Update" : "Save Kural"}
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
                placeholder="Search kurals or meanings..."
                className="w-full pl-11 pr-4 py-2 bg-gray-50 border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-xs"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <span className="text-xs font-bold text-gray-400 uppercase tracking-widest sm:ml-auto">
              Total {filteredKurals.length} Kurals
            </span>
          </div>
        </CardHeader>

        {isLoading ? (
          <div className="py-20 flex flex-col items-center justify-center gap-3">
            <Loader2 className="w-10 h-10 animate-spin text-primary" />
            <p className="text-sm font-bold text-gray-400 uppercase tracking-widest">
              Loading Daily Kurals...
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
                  <th className="px-4 py-3 text-[10px] font-bold text-gray-500 uppercase tracking-wider w-1/3">
                    Kural (குறள்)
                  </th>
                  <th className="px-4 py-3 text-[10px] font-bold text-gray-500 uppercase tracking-wider w-1/2">
                    Meaning (விளக்கம்)
                  </th>
                  <th className="px-4 py-3 text-[10px] font-bold text-gray-500 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-4 py-3 text-[10px] font-bold text-gray-500 uppercase tracking-wider text-right">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {paginatedKurals.map((item, index) => (
                  <tr
                    key={item.kuralid}
                    className="hover:bg-gray-50/50 transition-colors group"
                  >
                    <td className="px-4 py-3 text-xs font-semibold text-gray-600 align-top">
                      {(currentPage - 1) * itemsPerPage + index + 1}
                    </td>
                    <td className="px-4 py-3 align-top">
                      <div className="flex gap-2">
                        <Quote className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                        <p className="font-bold text-xs text-gray-900 whitespace-pre-line leading-normal">
                          {item.kural}
                        </p>
                      </div>
                    </td>
                    <td className="px-4 py-3 align-top">
                      <p className="text-xs text-gray-600 font-medium leading-relaxed">
                        {item.meaning}
                      </p>
                    </td>
                    <td className="px-4 py-3 text-xs text-gray-400 font-semibold align-top whitespace-nowrap">
                      {item.createdAt
                        ? new Date(item.createdAt).toLocaleDateString()
                        : "—"}
                    </td>
                    <td className="px-4 py-3 text-right align-top">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => handleEdit(item)}
                          className="w-7 h-7 rounded-[10px] text-gray-400 hover:text-accent hover:bg-accent/10 transition-all flex items-center justify-center cursor-pointer"
                          title="Edit Kural"
                        >
                          <Edit className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDelete(item.kuralid)}
                          className="w-7 h-7 rounded-[10px] text-gray-400 hover:text-red-600 hover:bg-red-50 transition-all flex items-center justify-center cursor-pointer"
                          title="Delete Kural"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {filteredKurals.length === 0 && (
                  <tr>
                    <td
                      colSpan="5"
                      className="px-4 py-8 text-center text-xs text-gray-500"
                    >
                      No Kurals found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}

        <TablePagination
          dataLength={filteredKurals.length}
          currentPage={currentPage}
          setCurrentPage={setCurrentPage}
          itemsPerPage={itemsPerPage}
          setItemsPerPage={setItemsPerPage}
        />
      </Card>
    </div>
  );
};

export default KuralList;
