import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import TablePagination from "../../components/ui/TablePagination";
import Card, { CardHeader } from "../../components/ui/Card";
import Button from "../../components/ui/Button";
import { Search, Filter, Plus, Eye, Trash2, Loader2 } from "lucide-react";
import { API } from "../../services/api_service";
import { APIROUTES } from "../../routes/api_routes";
import { toast } from "react-toastify";

const MerchantList = ({ type }) => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [merchants, setMerchants] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch businesses from GETBUSINESS API
  const fetchMerchants = async () => {
    setIsLoading(true);
    try {
      const response = await API.post(APIROUTES.GETBUSINESS);
      if (response.data && response.data.statusCode === 200) {
        setMerchants(response.data.data || []);
      } else {
        toast.error(response.data?.message || "Failed to fetch merchants");
      }
    } catch (error) {
      console.error("Fetch merchants error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchMerchants();
  }, []);

  // Handle Active/Inactive status toggle via ACTIVEBUSINESS API
  const handleStatusToggle = async (bid, currentStatus) => {
    const toggledStatus = currentStatus === "active" ? "inactive" : "active";

    // Optimistic state update for fluid UI experience
    setMerchants((prev) =>
      prev.map((m) => (m.bid === bid ? { ...m, status: toggledStatus } : m)),
    );

    try {
      const response = await API.post(APIROUTES.ACTIVEBUSINESS, {
        bid,
        status: toggledStatus,
      });

      if (response.data && response.data.statusCode === 200) {
        toast.success(`Business status updated to ${toggledStatus}!`);
      } else {
        toast.error(response.data?.message || "Failed to update status");
        // Revert state on API failure
        setMerchants((prev) =>
          prev.map((m) =>
            m.bid === bid ? { ...m, status: currentStatus } : m,
          ),
        );
      }
    } catch (error) {
      console.error("Status toggle error:", error);
      // Revert state on connection error
      setMerchants((prev) =>
        prev.map((m) => (m.bid === bid ? { ...m, status: currentStatus } : m)),
      );
    }
  };

  // Handle business deletion via DELETEBUSINESS API
  const handleDelete = async (bid) => {
    if (!window.confirm("Are you sure you want to delete this business?"))
      return;

    try {
      const response = await API.post(APIROUTES.DELETEBUSINESS, { bid });
      if (response.data.statusCode === 200) {
        toast.success(`${response.data.message}`);
        setMerchants((prev) => prev.filter((m) => m.bid !== bid));
      } else {
        toast.error(response.data?.message || "Failed to delete business");
      }
    } catch (error) {
      console.error("Delete business error:", error);
    }
  };

  const filteredMerchants = merchants.filter(
    (merchant) =>
      (merchant.businessname || "")
        .toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      (merchant.phone || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      (merchant.username || "")
        .toLowerCase()
        .includes(searchTerm.toLowerCase()),
  );

  const paginatedMerchants = filteredMerchants.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage,
  );

  return (
    <div className="space-y-6 animate-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">
            Merchants
          </h1>
        </div>
        <Button onClick={() => navigate("/merchants/create")} variant="accent">
          <Plus className="w-4 h-4" /> Add New Merchant
        </Button>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col md:flex-row items-center gap-4 w-full">
            <div className="relative w-full sm:w-72">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search by name, phone, email..."
                className="w-full pl-11 pr-4 py-2 bg-gray-50 border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all duration-200"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="flex items-center gap-2">
              <div className="text-sm text-gray-500 whitespace-nowrap">
                Showing <strong>{filteredMerchants.length}</strong> merchants
              </div>
            </div>
          </div>
        </CardHeader>

        {isLoading ? (
          <div className="py-20 flex flex-col items-center justify-center gap-3">
            <Loader2 className="w-10 h-10 animate-spin text-primary" />
            <p className="text-sm font-bold text-gray-400 uppercase tracking-widest">
              Loading Merchants...
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-gray-50 border-b border-border">
                  <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase">
                    Business Details
                  </th>
                  <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase">
                    Name
                  </th>
                  <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase">
                    Phone Number
                  </th>
                  <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase">
                    Update Status
                  </th>
                  <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase text-right">
                    Action
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {paginatedMerchants.length === 0 ? (
                  <tr>
                    <td
                      colSpan="5"
                      className="px-6 py-12 text-center text-sm font-semibold text-gray-400"
                    >
                      No merchants found matching search criteria.
                    </td>
                  </tr>
                ) : (
                  paginatedMerchants.map((merchant) => (
                    <tr
                      key={merchant.bid}
                      className="hover:bg-gray-50/50 transition-colors group cursor-pointer"
                      onClick={() => navigate(`/merchants/${merchant.bid}`)}
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary font-bold">
                            {(merchant.businessname || "M")
                              .charAt(0)
                              .toUpperCase()}
                          </div>
                          <div>
                            <p className="text-sm font-bold text-gray-900 group-hover:text-primary transition-colors">
                              {merchant.businessname}
                            </p>
                            <p className="text-xs text-gray-500 truncate max-w-[200px]">
                              {merchant.description}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-sm text-gray-600 font-bold">
                          {merchant.username || "—"}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-sm text-gray-600 font-semibold">
                          {merchant.phone || "—"}
                        </span>
                      </td>
                      <td
                        className="px-6 py-4"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <div className="flex items-center gap-2.5">
                          <button
                            onClick={() =>
                              handleStatusToggle(merchant.bid, merchant.status)
                            }
                            className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                              merchant.status === "active"
                                ? "bg-primary"
                                : "bg-gray-200"
                            }`}
                          >
                            <span
                              className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                                merchant.status === "active"
                                  ? "translate-x-5"
                                  : "translate-x-0"
                              }`}
                            />
                          </button>
                          <span
                            className={`text-xs font-bold uppercase tracking-wider ${
                              merchant.status === "active"
                                ? "text-primary"
                                : "text-gray-400"
                            }`}
                          >
                            {merchant.status === "active"
                              ? "Active"
                              : "Inactive"}
                          </span>
                        </div>
                      </td>
                      <td
                        className="px-6 py-4 text-right"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <div className="flex justify-end gap-1">
                          <button
                            className="w-7 h-7 rounded-[10px] text-gray-400 hover:text-primary hover:bg-primary/10 transition-all flex items-center justify-center cursor-pointer"
                            onClick={() =>
                              navigate(`/merchants/${merchant.bid}`)
                            }
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>
                          <button
                            className="w-7 h-7 rounded-[10px] text-gray-400 hover:text-red-600 hover:bg-red-50 transition-all flex items-center justify-center cursor-pointer"
                            onClick={() => handleDelete(merchant.bid)}
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}

        <TablePagination
          dataLength={filteredMerchants.length}
          currentPage={currentPage}
          setCurrentPage={setCurrentPage}
          itemsPerPage={itemsPerPage}
          setItemsPerPage={setItemsPerPage}
        />
      </Card>
    </div>
  );
};

export default MerchantList;
