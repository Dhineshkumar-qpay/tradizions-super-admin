import React, { useState, useEffect } from "react";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import Card, { CardHeader, CardContent } from "../../components/ui/Card";
import Button from "../../components/ui/Button";
import {
  ArrowLeft,
  Save,
  Building2,
  User,
  Mail,
  Phone,
  FileText,
  Check,
  ChevronDown,
  ChevronRight,
} from "lucide-react";
import { toast } from "react-toastify";
import { API } from "../../services/api_service";
import { APIROUTES } from "../../routes/api_routes";

const MerchantCreate = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const location = useLocation();
  const isEditMode = !!id;
  const editMerchantData = location.state?.merchant || null;
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    businessName: "",
    description: "",
    ownerName: "",
    email: "",
    mobileNumber: "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const [menus, setMenus] = useState([]);
  const [selectedMenus, setSelectedMenus] = useState(new Set());
  const [expandedMenus, setExpandedMenus] = useState(new Set());

  useEffect(() => {
    fetchMenus();
    if (isEditMode && editMerchantData) {
      setFormData({
        businessName: editMerchantData.businessname || "",
        description: editMerchantData.description || "",
        ownerName: editMerchantData.username || "",
        email: editMerchantData.email || "",
        mobileNumber: editMerchantData.phone || "",
      });
      if (editMerchantData.children && Array.isArray(editMerchantData.children)) {
        const preSelected = new Set(editMerchantData.children.map(child => child.menuid));
        setSelectedMenus(preSelected);
      }
    }
  }, [isEditMode, editMerchantData]);

  const fetchMenus = async () => {
    try {
      const response = await API.post(APIROUTES.ALLMENUS);
      if (response.data && response.data.statusCode === 200) {
        setMenus(response.data.data);
        const allIds = response.data.data.map((m) => m.menuid);
        setExpandedMenus(new Set(allIds));
      }
    } catch (error) {
      console.error("Failed to fetch menus", error);
    }
  };

  const toggleExpand = (menuid) => {
    const newExpanded = new Set(expandedMenus);
    if (newExpanded.has(menuid)) {
      newExpanded.delete(menuid);
    } else {
      newExpanded.add(menuid);
    }
    setExpandedMenus(newExpanded);
  };

  const handleMenuSelect = (menu, isChecked) => {
    const newSelected = new Set(selectedMenus);

    const updateSelection = (item, checked) => {
      if (checked) {
        newSelected.add(item.menuid);
      } else {
        newSelected.delete(item.menuid);
      }
      if (item.children && item.children.length > 0) {
        item.children.forEach((child) => updateSelection(child, checked));
      }
    };

    updateSelection(menu, isChecked);

    if (menu.parentid) {
      const parent = menus.find((m) => m.menuid === menu.parentid);
      if (parent) {
        const allChildrenSelected = parent.children.every((child) =>
          newSelected.has(child.menuid)
        );
        if (allChildrenSelected) {
          newSelected.add(parent.menuid);
        } else {
          newSelected.delete(parent.menuid);
        }
      }
    }

    setSelectedMenus(newSelected);
  };

  const renderMenuNode = (menu, isChild = false) => {
    const hasChildren = menu.children && menu.children.length > 0;
    const isExpanded = expandedMenus.has(menu.menuid);
    const isSelected = selectedMenus.has(menu.menuid);

    let isIndeterminate = false;
    if (hasChildren && !isSelected) {
      const someChildrenSelected = menu.children.some((child) =>
        selectedMenus.has(child.menuid)
      );
      if (someChildrenSelected) {
        isIndeterminate = true;
      }
    }

    return (
      <div key={menu.menuid} className={`flex flex-col ${isChild ? "ml-5 mt-1" : "mt-2"}`}>
        <div className="flex items-center gap-2 p-1.5 hover:bg-gray-50 rounded-md transition-colors border border-transparent hover:border-gray-200">
          {hasChildren ? (
            <button
              type="button"
              onClick={() => toggleExpand(menu.menuid)}
              className="p-1 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded"
            >
              {isExpanded ? (
                <ChevronDown className="w-3.5 h-3.5" />
              ) : (
                <ChevronRight className="w-3.5 h-3.5" />
              )}
            </button>
          ) : (
            <div className="w-5" /> // spacer
          )}

          <div
            className="flex items-center gap-2 cursor-pointer select-none flex-1"
            onClick={() => handleMenuSelect(menu, !isSelected)}
          >
            <div
              className={`w-4 h-4 flex items-center justify-center border rounded transition-colors ${
                isSelected
                  ? "bg-primary border-primary text-white"
                  : isIndeterminate
                  ? "bg-primary/20 border-primary text-primary"
                  : "bg-white border-gray-300"
              }`}
            >
              {isSelected && <Check className="w-3 h-3" />}
              {isIndeterminate && <div className="w-2 h-2 bg-primary rounded-sm" />}
            </div>

            {menu.icon && (
              <img src={menu.icon} alt={menu.menuname} className="w-4 h-4 object-contain opacity-70" />
            )}
            <span className={`text-xs ${isChild ? "text-gray-600" : "font-semibold text-gray-800"}`}>
              {menu.menuname}
            </span>
          </div>
        </div>

        {hasChildren && isExpanded && (
          <div className="border-l border-gray-200 ml-2.5 pl-2.5">
            {menu.children.map((child) => renderMenuNode(child, true))}
          </div>
        )}
      </div>
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const payload = {
      businessname: formData.businessName,
      description: formData.description,
      phone: formData.mobileNumber.replace(/\D/g, ""),
      username: formData.ownerName,
      email: formData.email,
      menuids: Array.from(selectedMenus),
    };

    if (isEditMode) {
      payload.bid = parseInt(id, 10);
    }

    try {
      const apiRoute = isEditMode ? APIROUTES.EDITBUSINESS : APIROUTES.ADDBUSINESS;
      const response = await API.post(apiRoute, payload);
      if (response.data && response.data.statusCode === 200) {
        toast.success(
          response.data.message || `Business ${isEditMode ? "updated" : "created"} successfully!`,
        );
        navigate("/merchants");
      } else {
        toast.error(response.data?.message || `Failed to ${isEditMode ? "update" : "create"} business.`);
      }
    } catch (error) {
      console.error(`${isEditMode ? "Update" : "Create"} business error:`, error);
      if (!error.isToastShown) {
        toast.error(`An unexpected error occurred during ${isEditMode ? "update" : "creation"}.`);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-in slide-in-from-right-4 duration-500">
      <div className="flex items-center gap-4">
        <button
          onClick={() => navigate(-1)}
          className="p-2 hover:bg-gray-100 rounded-xl text-gray-500 transition-all border border-transparent hover:border-border"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">
            {isEditMode ? "Edit Merchant" : "Create Merchant"}
          </h1>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <Card>
          <CardHeader
            title="Business Information"
            description="Basic details about the merchant's business."
          />
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-bold text-gray-700 flex items-center gap-2">
                  <Building2 className="w-4 h-4 text-primary" /> Business Name
                </label>
                <input
                  type="text"
                  name="businessName"
                  required
                  className="input-field"
                  placeholder="e.g. Green Earth Organics"
                  value={formData.businessName}
                  onChange={handleChange}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-bold text-gray-700 flex items-center gap-2">
                  <User className="w-4 h-4 text-primary" /> Owner Name
                </label>
                <input
                  type="text"
                  name="ownerName"
                  required
                  className="input-field"
                  placeholder="e.g. Arun Kumar"
                  value={formData.ownerName}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-bold text-gray-700 flex items-center gap-2">
                <FileText className="w-4 h-4 text-primary" /> Description
              </label>
              <textarea
                name="description"
                rows="4"
                required
                className="input-field resize-none"
                placeholder="Briefly describe the business and its products..."
                value={formData.description}
                onChange={handleChange}
              ></textarea>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-bold text-gray-700 flex items-center gap-2">
                  <Mail className="w-4 h-4 text-primary" /> Business Email
                </label>
                <input
                  type="email"
                  name="email"
                  required
                  className="input-field"
                  placeholder="e.g. contact@business.com"
                  value={formData.email}
                  onChange={handleChange}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-bold text-gray-700 flex items-center gap-2">
                  <Phone className="w-4 h-4 text-primary" /> Mobile Number
                </label>
                <input
                  type="tel"
                  name="mobileNumber"
                  required
                  className="input-field"
                  placeholder="e.g. +91 98765 43210"
                  value={formData.mobileNumber}
                  onChange={handleChange}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader
            title="Merchant Access Menus"
            description="Select the menus and subcategories to assign access to this merchant."
          />
          <CardContent>
            <div className="bg-white border rounded-lg p-3 shadow-sm">
              {menus.length > 0 ? (
                <div className="space-y-0.5">
                  {menus.map((menu) => renderMenuNode(menu))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500 text-sm">
                  Loading menus...
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <div className="flex items-center justify-end gap-4">
          <Button type="button" variant="outline" onClick={() => navigate(-1)}>
            Cancel
          </Button>
          <Button
            type="submit"
            variant="primary"
            className="px-8"
            disabled={loading}
          >
            {loading ? (
              isEditMode ? "Updating..." : "Creating..."
            ) : (
              <>
                <Save className="w-4 h-4" /> {isEditMode ? "Update Merchant" : "Save Merchant"}
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default MerchantCreate;
