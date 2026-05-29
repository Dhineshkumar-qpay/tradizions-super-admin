import React, { useState, useEffect, useRef } from "react";
import Card, { CardHeader, CardContent } from "../../components/ui/Card";
import Button from "../../components/ui/Button";
import TablePagination from "../../components/ui/TablePagination";
import {
  Search,
  Plus,
  Trash2,
  X,
  Activity,
  Image as ImageIcon,
  Loader2,
} from "lucide-react";
import { toast } from "react-toastify";
import { API } from "../../services/api_service";
import { APIROUTES } from "../../routes/api_routes";

const HealthGoalList = () => {
  const [healthGoals, setHealthGoals] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [isAdding, setIsAdding] = useState(false);
  const [formData, setFormData] = useState({ goalname: "", description: "" });
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);

  const fileInputRef = useRef(null);

  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  const fetchHealthGoals = async () => {
    setIsLoading(true);
    try {
      const response = await API.post(APIROUTES.GETHEALTHGOALS);
      if (response.data && response.data.statusCode === 200) {
        setHealthGoals(response.data.data || []);
      } else {
        toast.error(response.data?.message || "Failed to fetch Health Goals");
      }
    } catch (error) {
      console.error("Fetch health goals error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchHealthGoals();
  }, []);

  const filteredGoals = healthGoals.filter(
    (item) =>
      (item.goalname &&
        item.goalname.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (item.description &&
        item.description.toLowerCase().includes(searchTerm.toLowerCase())),
  );

  const paginatedGoals = filteredGoals.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage,
  );

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.goalname.trim() || !formData.description.trim() || !imageFile) {
      toast.error("Please fill in all fields and upload an image.");
      return;
    }

    const data = new FormData();
    data.append("goalimage", imageFile);
    data.append("goalname", formData.goalname);
    data.append("description", formData.description);
    console.log(JSON.stringify(data));

    try {
      const response = await API.post(APIROUTES.ADDHEALTHGOAL, data, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      if (response.data && response.data.statusCode === 200) {
        toast.success(response.data.data || "Health goal added successfully!");
        fetchHealthGoals();
        handleCancel();
      } else {
        toast.error(response.data?.message || "Failed to add health goal");
      }
    } catch (error) {
      console.error("Add health goal error:", error);
      toast.error("An error occurred while adding the health goal.");
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this Health Goal?")) {
      try {
        const response = await API.post(APIROUTES.DELETEHEALTHGOAL, { goalid: id });
        if (response.data && response.data.statusCode === 200) {
          toast.success(response.data.data || "Health goal deleted successfully");
          fetchHealthGoals();
        } else {
          toast.error(response.data?.message || "Failed to delete health goal");
        }
      } catch (error) {
        console.error("Delete health goal error:", error);
        toast.error("An error occurred while deleting the health goal.");
      }
    }
  };

  const handleCancel = () => {
    setIsAdding(false);
    setFormData({ goalname: "", description: "" });
    setImageFile(null);
    setImagePreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const SERVER_URL = process.env.NEXT_PUBLIC_IMAGE_URL; // Assuming typical VITE_API_URL setup

  // Helper to format image URL if needed
  const getImageUrl = (path) => {
    if (!path) return "";
    if (path.startsWith("http")) return path;
    // Attempting to use a base URL or just the path if the server handles it relatively
    // If the image server base isn't available, we rely on the path from the server
    return `${SERVER_URL}${path}`;
  };

  return (
    <div className="space-y-6 animate-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight flex items-center gap-2">
            <Activity className="w-6 h-6 text-primary" /> Health Goals
          </h1>
        </div>
        {!isAdding && (
          <Button onClick={() => setIsAdding(true)} variant="accent">
            <Plus className="w-4 h-4" /> Add Goal
          </Button>
        )}
      </div>

      {isAdding && (
        <Card className="border-accent/30 bg-accent/5 overflow-hidden animate-in slide-in-from-top-4 duration-300">
          <CardHeader
            title="Add New Health Goal"
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
                <div className="space-y-3">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-gray-600 uppercase">
                      Goal Name
                    </label>
                    <input
                      required
                      type="text"
                      value={formData.goalname}
                      onChange={(e) =>
                        setFormData({ ...formData, goalname: e.target.value })
                      }
                      className="w-full px-3 py-2 text-xs bg-white border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all font-medium leading-relaxed"
                      placeholder="e.g. Diabetes, Weight Management..."
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-gray-600 uppercase">
                      Description
                    </label>
                    <textarea
                      required
                      rows={4}
                      value={formData.description}
                      onChange={(e) =>
                        setFormData({ ...formData, description: e.target.value })
                      }
                      className="w-full px-3 py-2 text-xs bg-white border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all font-medium leading-relaxed"
                      placeholder="Enter description..."
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-gray-600 uppercase">
                    Goal Image
                  </label>
                  <div
                    className="mt-1 border-2 border-dashed border-border rounded-xl flex flex-col items-center justify-center bg-white cursor-pointer hover:bg-gray-50 transition-colors relative overflow-hidden"
                    style={{ height: "160px" }}
                    onClick={() => fileInputRef.current?.click()}
                  >
                    {imagePreview ? (
                      <img
                        src={imagePreview}
                        alt="Preview"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="flex flex-col items-center text-gray-400">
                        <ImageIcon className="w-8 h-8 mb-2 opacity-50" />
                        <span className="text-xs font-semibold">Click to upload image</span>
                      </div>
                    )}
                    <input
                      type="file"
                      ref={fileInputRef}
                      onChange={handleImageChange}
                      accept="image/*"
                      className="hidden"
                    />
                  </div>
                  {imageFile && (
                    <p className="text-[10px] text-gray-500 mt-1 truncate">
                      {imageFile.name}
                    </p>
                  )}
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
                  Save Goal
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
                placeholder="Search health goals..."
                className="w-full pl-11 pr-4 py-2 bg-gray-50 border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-xs"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <span className="text-xs font-bold text-gray-400 uppercase tracking-widest sm:ml-auto">
              Total {filteredGoals.length} Goals
            </span>
          </div>
        </CardHeader>

        {isLoading ? (
          <div className="py-20 flex flex-col items-center justify-center gap-3">
            <Loader2 className="w-10 h-10 animate-spin text-primary" />
            <p className="text-sm font-bold text-gray-400 uppercase tracking-widest">
              Loading Health Goals...
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
                  <th className="px-4 py-3 text-[10px] font-bold text-gray-500 uppercase tracking-wider w-24">
                    Image
                  </th>
                  <th className="px-4 py-3 text-[10px] font-bold text-gray-500 uppercase tracking-wider w-1/4">
                    Goal Name
                  </th>
                  <th className="px-4 py-3 text-[10px] font-bold text-gray-500 uppercase tracking-wider w-1/2">
                    Description
                  </th>
                  <th className="px-4 py-3 text-[10px] font-bold text-gray-500 uppercase tracking-wider text-right">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {paginatedGoals.map((item, index) => (
                  <tr
                    key={item.goalid}
                    className="hover:bg-gray-50/50 transition-colors group"
                  >
                    <td className="px-4 py-3 text-xs font-semibold text-gray-600 align-middle">
                      {(currentPage - 1) * itemsPerPage + index + 1}
                    </td>
                    <td className="px-4 py-3 align-middle">
                      <div className="w-12 h-12 rounded-lg border border-border overflow-hidden bg-white flex-shrink-0">
                        {item.goalimage ? (
                          <img
                            src={getImageUrl(item.goalimage)}
                            alt={item.goalname}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              e.target.onerror = null;
                              e.target.src = "https://placehold.co/100x100?text=No+Image";
                            }}
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center bg-gray-50">
                            <ImageIcon className="w-5 h-5 text-gray-300" />
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3 align-middle">
                      <p className="font-bold text-xs text-gray-900 leading-normal">
                        {item.goalname}
                      </p>
                    </td>
                    <td className="px-4 py-3 align-middle">
                      <p className="text-xs text-gray-600 font-medium leading-relaxed">
                        {item.description}
                      </p>
                    </td>
                    <td className="px-4 py-3 text-right align-middle">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => handleDelete(item.goalid)}
                          className="w-7 h-7 rounded-[10px] text-gray-400 hover:text-red-600 hover:bg-red-50 transition-all flex items-center justify-center cursor-pointer"
                          title="Delete Goal"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {filteredGoals.length === 0 && (
                  <tr>
                    <td
                      colSpan="5"
                      className="px-4 py-8 text-center text-xs text-gray-500"
                    >
                      No Health Goals found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}

        <TablePagination
          dataLength={filteredGoals.length}
          currentPage={currentPage}
          setCurrentPage={setCurrentPage}
          itemsPerPage={itemsPerPage}
          setItemsPerPage={setItemsPerPage}
        />
      </Card>
    </div>
  );
};

export default HealthGoalList;
