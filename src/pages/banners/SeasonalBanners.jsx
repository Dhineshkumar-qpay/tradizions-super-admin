import React, { useState } from "react";
import Card, { CardHeader, CardContent } from "../../components/ui/Card";
import Button from "../../components/ui/Button";
import Badge from "../../components/ui/Badge";
import TablePagination from "../../components/ui/TablePagination";
import {
  Search,
  Plus,
  Trash2,
  Edit,
  X,
  Image as ImageIcon,
  Upload,
  CheckCircle,
} from "lucide-react";
import { toast } from "react-toastify";
import { API } from "../../services/api_service";
import { APIROUTES, IMAGE_URL } from "../../routes/api_routes";

const mockBanners = [
  {
    id: 1,
    image: "https://picsum.photos/seed/ban1/800/400",
    name: "Pongal Special Offers",
    description:
      "Exclusive discount banners for traditional millet festival packs and gift boxes.",
    status: "Active",
    date: "2026-01-10",
  },
  {
    id: 2,
    image: "https://picsum.photos/seed/ban2/800/400",
    name: "Diwali Dry Fruit Hampers",
    description:
      "Premium assorted dry fruit gift packs promotional seasonal banner.",
    status: "Active",
    date: "2025-10-15",
  },
];

const SeasonalBanners = () => {
  const [banners, setBanners] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [file, setFile] = useState(null);

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    imagePreview: null,
  });

  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  const fetchBanners = async () => {
    setIsLoading(true);
    try {
      const response = await API.post(APIROUTES.GETALLBANNER);
      if (response.data && response.data.statusCode === 200) {
        setBanners(response.data.data || []);
      } else {
        toast.error("Failed to fetch banners");
      }
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  React.useEffect(() => {
    fetchBanners();
  }, []);

  const filteredBanners = banners.filter(
    (item) =>
      (item.bannername && item.bannername.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (item.description && item.description.toLowerCase().includes(searchTerm.toLowerCase())),
  );

  const paginatedBanners = filteredBanners.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage,
  );

  const handleImageChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      setFile(selectedFile);
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData((prev) => ({ ...prev, imagePreview: reader.result }));
      };
      reader.readAsDataURL(selectedFile);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.description.trim()) {
      toast.error("Please provide both Banner Name and Description.");
      return;
    }

    if (editingId) {
      const formDataToSend = new FormData();
      if (file) formDataToSend.append("bannerimage", file);
      formDataToSend.append("bannername", formData.name);
      formDataToSend.append("description", formData.description);
      formDataToSend.append("bannerid", editingId);

      try {
        const response = await API.post(APIROUTES.UPDATEBANNER, formDataToSend, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        if (response.data && response.data.statusCode === 200) {
          toast.success("Seasonal Banner updated successfully!");
          fetchBanners();
        } else {
          toast.error("Failed to update banner");
        }
      } catch (error) {
        console.error(error);
        toast.error("Error updating banner");
      }
    } else {
      if (!file) {
        toast.error("Please select a banner image.");
        return;
      }
      const formDataToSend = new FormData();
      formDataToSend.append("bannerimage", file);
      formDataToSend.append("bannername", formData.name);
      formDataToSend.append("description", formData.description);

      try {
        const response = await API.post(APIROUTES.ADDBANNER, formDataToSend, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        if (response.data && response.data.statusCode === 200) {
          toast.success("Seasonal Banner created successfully!");
          fetchBanners();
        } else {
          toast.error("Failed to add banner");
        }
      } catch (error) {
        console.error(error);
        toast.error("Error adding banner");
      }
    }

    setFormData({ name: "", description: "", imagePreview: null });
    setFile(null);
    setIsAdding(false);
    setEditingId(null);
  };

  const handleEdit = (item) => {
    setFormData({
      name: item.bannername,
      description: item.description,
      imagePreview: item.bannerimage,
    });
    setEditingId(item.bannerid);
    setIsAdding(true);
  };

  const handleDelete = async (id) => {
    if (
      window.confirm("Are you sure you want to delete this seasonal banner?")
    ) {
      try {
        const response = await API.post(APIROUTES.DELETEBANNER, { bannerid: id });
        if (response.data && response.data.statusCode === 200) {
          toast.error("Banner removed successfully.");
          fetchBanners();
        } else {
          toast.error("Failed to delete banner");
        }
      } catch (error) {
        console.error(error);
        toast.error("Error deleting banner");
      }
    }
  };

  const toggleStatus = async (id) => {
    const banner = banners.find((b) => b.bannerid === id);
    if (!banner) return;
    const newStatus = banner.status === "Active" || banner.status === "active" ? "inactive" : "active";

    try {
      const response = await API.post(APIROUTES.UPDATEBANNERSTATUS, {
        bannerid: id,
        status: newStatus,
      });
      if (response.data && response.data.statusCode === 200) {
        toast.success("Banner visibility status updated");
        fetchBanners();
      } else {
        toast.error("Failed to update banner status");
      }
    } catch (error) {
      console.error(error);
      toast.error("Error updating banner status");
    }
  };

  const handleCancel = () => {
    setIsAdding(false);
    setEditingId(null);
    setFormData({ name: "", description: "", imagePreview: null });
    setFile(null);
  };

  return (
    <div className="space-y-6 animate-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight flex items-center gap-2">
            <ImageIcon className="w-6 h-6 text-primary" /> Seasonal Banners
          </h1>
        </div>
        {!isAdding && (
          <Button onClick={() => setIsAdding(true)} variant="primary">
            <Plus className="w-4 h-4 mr-1" /> Add Banner
          </Button>
        )}
      </div>

      {isAdding && (
        <Card className="border-primary/20 bg-primary/5 overflow-hidden animate-in slide-in-from-top-4 duration-300">
          <CardHeader
            title={
              editingId ? "Edit Seasonal Banner" : "Add New Seasonal Banner"
            }
            className="p-4 border-b border-gray-100 bg-white"
          >
            <button
              onClick={handleCancel}
              className="p-1.5 hover:bg-gray-100 rounded-[10px] transition-colors cursor-pointer"
            >
              <X className="w-4 h-4 text-gray-400" />
            </button>
          </CardHeader>
          <CardContent className="p-6 bg-white">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Image Upload Area */}
                <div className="space-y-2 md:col-span-1">
                  <label className="text-xs font-bold text-gray-700 block">
                    Banner Graphic
                  </label>
                  <label className="border-2 border-dashed border-gray-200 hover:border-primary rounded-2xl p-4 flex flex-col items-center justify-center gap-2 cursor-pointer transition-colors bg-gray-50/50 aspect-[2/1] group overflow-hidden relative">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageChange}
                      className="hidden"
                    />
                    {formData.imagePreview ? (
                      <img
                        src={formData.imagePreview}
                        alt="Preview"
                        className="w-full h-full object-cover absolute inset-0"
                      />
                    ) : (
                      <div className="text-center space-y-1 py-4">
                        <Upload className="w-8 h-8 text-gray-400 mx-auto group-hover:text-primary transition-colors" />
                        <p className="text-xs font-bold text-gray-600">
                          Upload Banner Image
                        </p>
                        <p className="text-[10px] text-gray-400 font-medium">
                          PNG, JPG up to 5MB
                        </p>
                      </div>
                    )}
                    {formData.imagePreview && (
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                        <p className="text-white text-xs font-bold flex items-center gap-1">
                          <Upload className="w-3.5 h-3.5" /> Change Image
                        </p>
                      </div>
                    )}
                  </label>
                </div>

                {/* Text Form Inputs */}
                <div className="space-y-4 md:col-span-2 flex flex-col justify-center">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-gray-700 block">
                      Banner Name / Title
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.name}
                      onChange={(e) =>
                        setFormData({ ...formData, name: e.target.value })
                      }
                      className="w-full px-4 py-2.5 text-xs bg-gray-50/50 border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all font-semibold"
                      placeholder="e.g. Diwali Super Saver Hampers"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-gray-700 block">
                      Description / Promotion Note
                    </label>
                    <textarea
                      rows={3}
                      required
                      value={formData.description}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          description: e.target.value,
                        })
                      }
                      className="w-full px-4 py-2.5 text-xs bg-gray-50/50 border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all font-medium"
                      placeholder="Describe the promotional campaign, validity, or targeted product category..."
                    />
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-4 border-t border-gray-100">
                <Button
                  type="button"
                  variant="outline"
                  className="h-9 text-xs rounded-xl font-bold"
                  onClick={handleCancel}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="primary"
                  className="h-9 text-xs rounded-xl font-bold shadow-2xs"
                >
                  {editingId ? "Update Banner" : "Save Banner"}
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
                placeholder="Search banners..."
                className="w-full pl-11 pr-4 py-2 bg-gray-50 border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-xs"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <span className="text-xs font-bold text-gray-400 uppercase tracking-widest sm:ml-auto">
              Total {filteredBanners.length} Banners
            </span>
          </div>
        </CardHeader>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-gray-50 border-b border-border">
                <th className="px-4 py-3 text-[10px] font-bold text-gray-500 uppercase tracking-wider w-12">
                  S.No
                </th>
                <th className="px-4 py-3 text-[10px] font-bold text-gray-500 uppercase tracking-wider w-36">
                  Preview
                </th>
                <th className="px-4 py-3 text-[10px] font-bold text-gray-500 uppercase tracking-wider">
                  Banner Details
                </th>
                <th className="px-4 py-3 text-[10px] font-bold text-gray-500 uppercase tracking-wider w-24">
                  Status
                </th>
                <th className="px-4 py-3 text-[10px] font-bold text-gray-500 uppercase tracking-wider text-right w-28">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {isLoading ? (
                <tr>
                  <td colSpan="5" className="px-4 py-8 text-center text-xs text-gray-500">
                    Loading banners...
                  </td>
                </tr>
              ) : paginatedBanners.map((item, index) => (
                <tr
                  key={item.bannerid}
                  className="hover:bg-gray-50/50 transition-colors group"
                >
                  <td className="px-4 py-4 text-xs font-semibold text-gray-600 align-middle">
                    {(currentPage - 1) * itemsPerPage + index + 1}
                  </td>
                  <td className="px-4 py-4 align-middle">
                    <div className="aspect-[2/1] w-28 rounded-lg overflow-hidden bg-gray-100 border border-border shadow-2xs">
                      <img
                        src={IMAGE_URL + item.bannerimage}
                        alt={item.bannername}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  </td>
                  <td className="px-4 py-4 align-middle space-y-1">
                    <p className="font-bold text-sm text-gray-900 tracking-tight">
                      {item.bannername}
                    </p>
                    <p className="text-xs text-gray-500 font-medium leading-relaxed max-w-xl">
                      {item.description}
                    </p>
                  </td>
                  <td className="px-4 py-4 align-middle">
                    <Badge
                      variant={item.status === "active" ? "success" : "red"}
                      className="font-bold text-[10px] py-0.5 px-2 rounded-md"
                    >
                      {item.status.charAt(0).toUpperCase() + item.status.slice(1) || "Inactive"}
                    </Badge>
                  </td>
                  <td className="px-4 py-4 text-right align-middle">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => toggleStatus(item.bannerid)}
                        className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${item.status === "active" || !item.status
                          ? "bg-primary"
                          : "bg-gray-200"
                          }`}
                        title={
                          item.status === "active" || !item.status
                            ? "Deactivate Banner"
                            : "Activate Banner"
                        }
                      >
                        <span
                          className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${item.status === "active" || !item.status
                            ? "translate-x-4"
                            : "translate-x-0"
                            }`}
                        />
                      </button>

                      <button
                        onClick={() => handleEdit(item)}
                        className="w-7 h-7 rounded-[10px] text-gray-400 hover:text-primary hover:bg-primary/10 transition-all flex items-center justify-center cursor-pointer"
                        title="Edit Banner"
                      >
                        <Edit className="w-3.5 h-3.5" />
                      </button>

                      <button
                        onClick={() => handleDelete(item.bannerid)}
                        className="w-7 h-7 rounded-[10px] text-gray-400 hover:text-red-600 hover:bg-red-50 transition-all flex items-center justify-center cursor-pointer"
                        title="Delete Banner"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {filteredBanners.length === 0 && (
                <tr>
                  <td
                    colSpan="5"
                    className="px-4 py-8 text-center text-xs text-gray-500 font-medium"
                  >
                    No Seasonal Banners found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <TablePagination
          dataLength={filteredBanners.length}
          currentPage={currentPage}
          setCurrentPage={setCurrentPage}
          itemsPerPage={itemsPerPage}
          setItemsPerPage={setItemsPerPage}
        />
      </Card>
    </div>
  );
};

export default SeasonalBanners;
