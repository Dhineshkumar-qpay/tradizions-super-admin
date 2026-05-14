import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import Card, { CardHeader } from "../../components/ui/Card";
import Badge from "../../components/ui/Badge";
import Button from "../../components/ui/Button";
import TablePagination from "../../components/ui/TablePagination";
import {
  Search,
  Mail,
  Phone,
  MessageSquare,
  Building,
  User,
  Calendar,
  Hash,
  Eye,
  Trash2,
  X,
  ArrowRight,
  ClipboardList,
  Loader2,
} from "lucide-react";
import { toast } from "react-toastify";
import { API } from "../../services/api_service";
import { APIROUTES } from "../../routes/api_routes";

const ContactsList = () => {
  const [activeTab, setActiveTab] = useState("normal"); // "normal" or "corporate"
  const [normalInquiries, setNormalInquiries] = useState([]);
  const [corporateInquiries, setCorporateInquiries] = useState([]);
  const [selectedInquiry, setSelectedInquiry] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  const fetchAllContacts = async () => {
    setIsLoading(true);
    try {
      const [normalRes, corporateRes] = await Promise.all([
        API.post(APIROUTES.GETCONTACTS, { type: "normal" }).catch(() => null),
        API.post(APIROUTES.GETCONTACTS, { type: "corporate" }).catch(
          () => null,
        ),
      ]);

      if (normalRes && normalRes.data && normalRes.data.statusCode === 200) {
        setNormalInquiries(normalRes.data.data || []);
      }
      if (
        corporateRes &&
        corporateRes.data &&
        corporateRes.data.statusCode === 200
      ) {
        setCorporateInquiries(corporateRes.data.data || []);
      }
    } catch (error) {
      console.error("Fetch contacts error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAllContacts();
  }, []);

  // Active dataset
  const activeList =
    activeTab === "normal" ? normalInquiries : corporateInquiries;

  // Filter logic
  const filteredInquiries = activeList.filter((item) => {
    const nameStr = (item.name || "").toLowerCase();
    const emailStr = (item.email || "").toLowerCase();
    const phoneStr = (item.phone || "").toLowerCase();
    const descStr = (item.description || "").toLowerCase();
    const qtyStr = (item.quantity || "").toLowerCase();

    return (
      nameStr.includes(searchTerm.toLowerCase()) ||
      emailStr.includes(searchTerm.toLowerCase()) ||
      phoneStr.includes(searchTerm.toLowerCase()) ||
      descStr.includes(searchTerm.toLowerCase()) ||
      qtyStr.includes(searchTerm.toLowerCase())
    );
  });

  // Paginated dataset
  const paginatedInquiries = filteredInquiries.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage,
  );

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    setSearchTerm("");
    setCurrentPage(1);
  };

  const handleDelete = async (id, e) => {
    e.stopPropagation();
    if (!window.confirm("Are you sure you want to delete this enquiry log?")) return;

    try {
      const response = await API.post(APIROUTES.DELETECONTACT, { contactid: id });
      if (response.data && response.data.statusCode === 200) {
        toast.success(response.data.message || "Enquiry log removed successfully.");
        if (activeTab === "normal") {
          setNormalInquiries((prev) => prev.filter((item) => item.contactid !== id));
        } else {
          setCorporateInquiries((prev) => prev.filter((item) => item.contactid !== id));
        }
      } else {
        toast.error(response.data?.message || "Failed to delete enquiry");
      }
    } catch (error) {
      console.error("Delete contact error:", error);
    }
  };

  return (
    <div className="space-y-6 animate-in slide-in-from-bottom-4 duration-500">
      {/* Page Title */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">
            Contact Enquiries
          </h1>
        </div>
      </div>

      {/* Segmented Selection Tabbar */}
      <div className="flex bg-gray-100 p-1.5 rounded-[10px] w-full sm:w-96">
        <button
          onClick={() => handleTabChange("normal")}
          className={`flex-1 py-2 text-xs font-black rounded-[8px] transition-all cursor-pointer flex items-center justify-center gap-2 ${
            activeTab === "normal"
              ? "bg-white text-primary shadow-sm"
              : "text-gray-500 hover:text-gray-900"
          }`}
        >
          <User className="w-4 h-4" />
          General Contacts ({normalInquiries.length})
        </button>
        <button
          onClick={() => handleTabChange("corporate")}
          className={`flex-1 py-2 text-xs font-black rounded-[8px] transition-all cursor-pointer flex items-center justify-center gap-2 ${
            activeTab === "corporate"
              ? "bg-white text-primary shadow-sm"
              : "text-gray-500 hover:text-gray-900"
          }`}
        >
          <Building className="w-4 h-4" />
          Bulk Orders / B2B ({corporateInquiries.length})
        </button>
      </div>

      {/* Main Table Card */}
      <Card>
        <CardHeader>
          <div className="flex flex-col md:flex-row items-center gap-4 w-full">
            <div className="relative w-full sm:w-72">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder={
                  activeTab === "normal"
                    ? "Search regular contacts..."
                    : "Search corporate enquiries..."
                }
                className="w-full pl-11 pr-4 py-2 bg-gray-50 border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all duration-200 text-xs"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <span className="text-xs font-bold text-gray-400 uppercase tracking-widest sm:ml-auto">
              Showing {filteredInquiries.length} Enquiries
            </span>
          </div>
        </CardHeader>

        {isLoading ? (
          <div className="py-20 flex flex-col items-center justify-center gap-3">
            <Loader2 className="w-10 h-10 animate-spin text-primary" />
            <p className="text-sm font-bold text-gray-400 uppercase tracking-widest">
              Loading Enquiries...
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                {activeTab === "normal" ? (
                  <tr className="bg-gray-50 border-b border-border">
                    <th className="px-4 py-3 text-[10px] font-bold text-gray-500 uppercase tracking-wider w-12">
                      S.No
                    </th>
                    <th className="px-4 py-3 text-[10px] font-bold text-gray-500 uppercase tracking-wider">
                      Contact Person
                    </th>
                    <th className="px-4 py-3 text-[10px] font-bold text-gray-500 uppercase tracking-wider">
                      Email Address
                    </th>
                    <th className="px-4 py-3 text-[10px] font-bold text-gray-500 uppercase tracking-wider">
                      Phone
                    </th>
                    <th className="px-4 py-3 text-[10px] font-bold text-gray-500 uppercase tracking-wider">
                      Description
                    </th>
                    <th className="px-4 py-3 text-[10px] font-bold text-gray-500 uppercase tracking-wider">
                      Submitted
                    </th>
                    <th className="px-4 py-3 text-[10px] font-bold text-gray-500 uppercase tracking-wider text-right">
                      Action
                    </th>
                  </tr>
                ) : (
                  <tr className="bg-gray-50 border-b border-border">
                    <th className="px-4 py-3 text-[10px] font-bold text-gray-500 uppercase tracking-wider w-12">
                      S.No
                    </th>
                    <th className="px-4 py-3 text-[10px] font-bold text-gray-500 uppercase tracking-wider">
                      Company & Client
                    </th>
                    <th className="px-4 py-3 text-[10px] font-bold text-gray-500 uppercase tracking-wider">
                      Target Qty
                    </th>
                    <th className="px-4 py-3 text-[10px] font-bold text-gray-500 uppercase tracking-wider">
                      Contact Info
                    </th>
                    <th className="px-4 py-3 text-[10px] font-bold text-gray-500 uppercase tracking-wider">
                      Requirements
                    </th>
                    <th className="px-4 py-3 text-[10px] font-bold text-gray-500 uppercase tracking-wider">
                      Submitted
                    </th>
                    <th className="px-4 py-3 text-[10px] font-bold text-gray-500 uppercase tracking-wider text-right">
                      Action
                    </th>
                  </tr>
                )}
              </thead>
              <tbody className="divide-y divide-border">
                {paginatedInquiries.map((item, index) => (
                  <tr
                    key={item.contactid}
                    onClick={() => setSelectedInquiry(item)}
                    className="hover:bg-gray-50/50 transition-colors group cursor-pointer"
                  >
                    <td className="px-4 py-3 text-xs font-semibold text-gray-600">
                      {(currentPage - 1) * itemsPerPage + index + 1}
                    </td>
                    {activeTab === "normal" ? (
                      <>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-[10px] bg-primary/10 flex items-center justify-center text-primary font-black text-xs shrink-0 uppercase">
                              {(item.name || "C").charAt(0)}
                            </div>
                            <span className="font-bold text-xs text-gray-900 group-hover:text-primary transition-colors">
                              {item.name || "—"}
                            </span>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-1.5 text-xs text-gray-600 font-medium">
                            <Mail className="w-3.5 h-3.5 text-gray-400" />
                            {item.email || "—"}
                          </div>
                        </td>
                        <td className="px-4 py-3 text-xs font-semibold text-gray-800 whitespace-nowrap">
                          {item.phone || "—"}
                        </td>
                        <td className="px-4 py-3">
                          <p
                            className="text-xs text-gray-500 max-w-xs xl:max-w-md truncate"
                            title={item.description}
                          >
                            {item.description || "—"}
                          </p>
                        </td>
                        <td className="px-4 py-3 text-xs text-gray-400 font-semibold whitespace-nowrap">
                          {item.createdAt
                            ? new Date(item.createdAt).toLocaleDateString()
                            : "—"}
                        </td>
                      </>
                    ) : (
                      <>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-[10px] bg-amber-50 border border-amber-100 flex items-center justify-center text-amber-600 font-black text-xs shrink-0 uppercase">
                              {(item.name || "C").charAt(0)}
                            </div>
                            <div>
                              <p className="font-bold text-xs text-gray-900 group-hover:text-primary transition-colors">
                                {item.name || "—"}
                              </p>
                              <p className="text-[10px] text-gray-400 font-semibold">
                                B2B Client
                              </p>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <Badge
                            variant="warning"
                            className="text-[9px] font-bold px-1.5 py-0.5 rounded-[10px]"
                          >
                            {item.quantity || "Bulk"}
                          </Badge>
                        </td>
                        <td className="px-4 py-3 space-y-1 whitespace-nowrap">
                          <div className="flex items-center gap-1.5 text-[11px] text-gray-600 font-medium">
                            <Mail className="w-3 h-3 text-gray-400" />
                            {item.email || "—"}
                          </div>
                          <div className="flex items-center gap-1.5 text-[11px] text-gray-600 font-medium">
                            <Phone className="w-3 h-3 text-gray-400" />
                            {item.phone || "—"}
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <p
                            className="text-xs text-gray-500 max-w-xs xl:max-w-md truncate"
                            title={item.description}
                          >
                            {item.description || "—"}
                          </p>
                        </td>
                        <td className="px-4 py-3 text-xs text-gray-400 font-semibold whitespace-nowrap">
                          {item.createdAt
                            ? new Date(item.createdAt).toLocaleDateString()
                            : "—"}
                        </td>
                      </>
                    )}

                    {/* Actions Column */}
                    <td
                      className="px-4 py-3 text-right"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <div className="flex justify-end gap-1">
                        <button
                          onClick={() => setSelectedInquiry(item)}
                          className="w-7 h-7 rounded-[10px] text-gray-400 hover:text-primary hover:bg-primary/10 transition-all flex items-center justify-center cursor-pointer"
                          title="View Details"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={(e) => handleDelete(item.contactid, e)}
                          className="w-7 h-7 rounded-[10px] text-gray-400 hover:text-red-600 hover:bg-red-50 transition-all flex items-center justify-center cursor-pointer"
                          title="Delete Enquiry"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}

                {filteredInquiries.length === 0 && (
                  <tr>
                    <td
                      colSpan={7}
                      className="px-4 py-8 text-center text-xs text-gray-500 font-medium"
                    >
                      No matching enquiries found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* Dynamic Pagination component */}
        <TablePagination
          dataLength={filteredInquiries.length}
          currentPage={currentPage}
          setCurrentPage={setCurrentPage}
          itemsPerPage={itemsPerPage}
          setItemsPerPage={setItemsPerPage}
        />
      </Card>

      {/* Inquiry Detail Sidebar Overlay Drawer */}
      {selectedInquiry &&
        createPortal(
          <>
            <div
              className="fixed inset-0 z-[9999] bg-black/40 backdrop-blur-sm transition-opacity"
              onClick={() => setSelectedInquiry(null)}
            />
            <div className="fixed inset-y-0 right-0 z-[10000] w-full sm:w-[460px] bg-white shadow-2xl flex flex-col animate-in slide-in-from-right duration-300">
              <div className="p-6 pb-4">
                <div className="flex justify-between items-start">
                  <div>
                    <h2 className="text-xl font-bold text-gray-900 tracking-tight">
                      Enquiry Specifications
                    </h2>
                    <span className="inline-block mt-1.5 text-[10px] font-bold text-primary bg-primary/10 px-2.5 py-0.5 rounded-[6px] uppercase tracking-wider">
                      {activeTab === "normal"
                        ? "General Contact"
                        : "B2B Bulk Request"}
                    </span>
                  </div>
                  <button
                    onClick={() => setSelectedInquiry(null)}
                    className="w-8 h-8 rounded-full bg-white border border-gray-100 shadow-sm hover:shadow-md transition-all flex items-center justify-center cursor-pointer text-gray-400 hover:text-gray-600"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div className="px-6 py-5 flex items-center gap-4 border-b border-gray-50 bg-gray-50/50">
                <div className="w-14 h-14 rounded-[14px] bg-primary/10 flex items-center justify-center text-primary font-black text-lg uppercase shrink-0">
                  {(selectedInquiry.name || "C").charAt(0)}
                </div>
                <div>
                  <h3 className="text-base font-black text-gray-900 leading-snug">
                    {selectedInquiry.name || "—"}
                  </h3>
                  <p className="text-xs text-gray-400 font-semibold flex items-center gap-1 mt-0.5">
                    <Calendar className="w-3.5 h-3.5" /> Date Logged:{" "}
                    {selectedInquiry.createdAt
                      ? new Date(selectedInquiry.createdAt).toLocaleDateString()
                      : "—"}
                  </p>
                </div>
              </div>

              <div className="flex-1 overflow-y-auto p-6 space-y-6">
                <div className="space-y-4">
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest flex items-center gap-1.5">
                    <User className="w-3.5 h-3.5 text-gray-400" /> Sender
                    Identification
                  </p>
                  <div className="grid grid-cols-1 gap-3">
                    <div className="p-3 bg-gray-50 border border-gray-100/60 rounded-[10px]">
                      <span className="block text-[9px] font-bold text-gray-400 uppercase tracking-wider">
                        Contact Name
                      </span>
                      <span className="text-xs font-black text-gray-800">
                        {selectedInquiry.name || "—"}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div className="p-3 bg-gray-50 border border-gray-100/60 rounded-[10px]">
                        <span className="block text-[9px] font-bold text-gray-400 uppercase tracking-wider">
                          Email
                        </span>
                        <span
                          className="text-xs font-bold text-gray-800 truncate block"
                          title={selectedInquiry.email}
                        >
                          {selectedInquiry.email || "—"}
                        </span>
                      </div>
                      <div className="p-3 bg-gray-50 border border-gray-100/60 rounded-[10px]">
                        <span className="block text-[9px] font-bold text-gray-400 uppercase tracking-wider">
                          Phone
                        </span>
                        <span className="text-xs font-bold text-gray-800 block">
                          {selectedInquiry.phone || "—"}
                        </span>
                      </div>
                    </div>

                    {activeTab === "corporate" && (
                      <div className="grid grid-cols-2 gap-3">
                        <div className="p-3 bg-gray-50 border border-gray-100/60 rounded-[10px]">
                          <span className="block text-[9px] font-bold text-gray-400 uppercase tracking-wider">
                            Client
                          </span>
                          <span className="text-xs font-bold text-gray-800 truncate block">
                            {selectedInquiry.name || "—"}
                          </span>
                        </div>
                        <div className="p-3 bg-amber-50/50 border border-amber-100/60 rounded-[10px]">
                          <span className="block text-[9px] font-bold text-amber-500 uppercase tracking-wider">
                            Quantity Target
                          </span>
                          <span className="text-xs font-black text-amber-700 block">
                            {selectedInquiry.quantity || "Bulk"}
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                <div className="space-y-2 pt-4 border-t border-gray-50">
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest flex items-center gap-1.5">
                    <MessageSquare className="w-3.5 h-3.5 text-gray-400" />{" "}
                    Inquiry Message Description
                  </p>
                  <div className="p-4 bg-gray-50 border border-gray-100 rounded-[10px] text-xs font-semibold text-gray-700 leading-relaxed whitespace-pre-wrap">
                    {selectedInquiry.description || "—"}
                  </div>
                </div>

                <div className="pt-6 border-t border-gray-100 flex gap-2">
                  <button
                    onClick={() => setSelectedInquiry(null)}
                    className="flex-1 py-3 border border-gray-200 hover:bg-gray-50 text-gray-500 font-bold text-xs rounded-[10px] transition-all cursor-pointer text-center"
                  >
                    Dismiss Drawer
                  </button>
                  <button
                    onClick={() => {
                      toast.success("Enquiry marked as read and archived.");
                      setSelectedInquiry(null);
                    }}
                    className="flex-1 py-3 bg-primary hover:bg-primary/95 text-white font-bold text-xs rounded-[10px] shadow-sm transition-all cursor-pointer text-center"
                  >
                    Resolve / Archive Log
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

export default ContactsList;
