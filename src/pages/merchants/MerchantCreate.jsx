import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
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
} from "lucide-react";
import { toast } from "react-toastify";
import { API } from "../../services/api_service";
import { APIROUTES } from "../../routes/api_routes";

const MerchantCreate = () => {
  const navigate = useNavigate();
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const payload = {
      businessname: formData.businessName,
      description: formData.description,
      phone: formData.mobileNumber.replace(/\D/g, ""),
      username: formData.ownerName,
      email: formData.email,
    };

    try {
      const response = await API.post(APIROUTES.ADDBUSINESS, payload);
      if (response.data && response.data.statusCode === 200) {
        toast.success(
          response.data.message || "Business created successfully!",
        );
        navigate("/merchants");
      } else {
        toast.error(response.data?.message || "Failed to create business.");
      }
    } catch (error) {
      console.error("Create business error:", error);
      if (!error.isToastShown) {
        toast.error("An unexpected error occurred during creation.");
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
            Create Merchant
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
              "Creating..."
            ) : (
              <>
                <Save className="w-4 h-4" /> Save Merchant
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default MerchantCreate;
