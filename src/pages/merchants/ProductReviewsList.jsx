import React, { useState, useEffect } from "react";
import Card, { CardHeader } from "../../components/ui/Card";
import Badge from "../../components/ui/Badge";
import Button from "../../components/ui/Button";
import TablePagination from "../../components/ui/TablePagination";
import {
  Star,
  Search,
  ShoppingBag,
  Store,
  Loader2,
  Calendar,
  Mail,
} from "lucide-react";
import { toast } from "react-toastify";
import { API } from "../../services/api_service";
import { APIROUTES } from "../../routes/api_routes";

const ProductReviewsList = () => {
  const [businesses, setBusinesses] = useState([]);
  const [selectedBid, setSelectedBid] = useState("");
  const [reviews, setReviews] = useState([]);
  const [isLoadingBusinesses, setIsLoadingBusinesses] = useState(true);
  const [isLoadingReviews, setIsLoadingReviews] = useState(false);

  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  // Fetch all businesses on component mount
  useEffect(() => {
    const fetchBusinesses = async () => {
      setIsLoadingBusinesses(true);
      try {
        const response = await API.post(APIROUTES.GETBUSINESS);
        if (response.data && response.data.statusCode === 200) {
          const list = response.data.data || [];
          setBusinesses(list);
          if (list.length > 0) {
            setSelectedBid(list[0].bid);
          }
        } else {
          toast.error(response.data?.message || "Failed to fetch businesses");
        }
      } catch (error) {
        console.error("Fetch businesses error:", error);
      } finally {
        setIsLoadingBusinesses(false);
      }
    };

    fetchBusinesses();
  }, []);

  // Fetch ratings whenever selectedBid changes
  useEffect(() => {
    const fetchRatings = async () => {
      if (!selectedBid) return;
      setIsLoadingReviews(true);
      try {
        const response = await API.post(APIROUTES.PRODUCTRATINGS, {
          bid: parseInt(selectedBid),
        });
        if (response.data && response.data.statusCode === 200) {
          setReviews(response.data.data || []);
        } else {
          toast.error(response.data?.message || "Failed to fetch ratings");
        }
      } catch (error) {
        console.error("Fetch ratings error:", error);
      } finally {
        setIsLoadingReviews(false);
      }
    };

    fetchRatings();
  }, [selectedBid]);

  // Handle status update via ACTIVERATINGSTATUS API using toggle switch button
  const handleStatusToggle = async (item) => {
    const toggledStatus = item.status === "active" ? "inactive" : "active";

    // Optimistically update UI
    setReviews((prev) =>
      prev.map((r) =>
        r.reviewid === item.reviewid ? { ...r, status: toggledStatus } : r,
      ),
    );

    try {
      const response = await API.post(APIROUTES.ACTIVERATINGSTATUS, {
        bid: parseInt(item.bid),
        productid: parseInt(item.productid),
        status: toggledStatus,
      });

      if (response.data && response.data.statusCode === 200) {
        toast.success(`Review status updated to ${toggledStatus}`);
      } else {
        toast.error(response.data?.message || "Failed to update review status");
        // Revert on API failure
        setReviews((prev) =>
          prev.map((r) =>
            r.reviewid === item.reviewid ? { ...r, status: item.status } : r,
          ),
        );
      }
    } catch (error) {
      console.error("Status toggle error:", error);
      // Revert on network error
      setReviews((prev) =>
        prev.map((r) =>
          r.reviewid === item.reviewid ? { ...r, status: item.status } : r,
        ),
      );
    }
  };

  // Search filtering
  const filteredReviews = reviews.filter(
    (review) =>
      (review.name && review.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (review.productname && review.productname.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (review.review && review.review.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (review.title && review.title.toLowerCase().includes(searchTerm.toLowerCase())),
  );

  // Pagination
  const paginatedReviews = filteredReviews.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage,
  );

  return (
    <div className="space-y-6 animate-in slide-in-from-bottom-4 duration-500 max-w-7xl mx-auto">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 tracking-tight">
          Product Ratings & Reviews
        </h1>
        <p className="text-xs text-gray-500 mt-0.5">
          Select a business to view and manage customer feedback and active ratings.
        </p>
      </div>

      {/* Segmented Selection Tabbar - Only showing Products tab */}
      <div className="flex bg-white border border-border p-1.5 rounded-xl w-full sm:w-60 shadow-xs">
        <button className="flex-1 py-2 text-xs font-black bg-primary text-white shadow-2xs rounded-lg flex items-center justify-center gap-2 cursor-default select-none">
          <ShoppingBag className="w-4 h-4" />
          Products ({reviews.length})
        </button>
      </div>

      {/* Main Table Card */}
      <Card className="shadow-xs border border-border rounded-xl overflow-hidden">
        <CardHeader className="p-4 bg-white border-b border-border">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4 w-full">
            <div className="flex flex-col sm:flex-row items-center gap-3 w-full md:w-auto">
              {/* Business Dropdown Selector */}
              <div className="relative w-full sm:w-64">
                <div className="absolute left-3 top-1/2 -translate-y-1/2 text-primary">
                  <Store className="w-4 h-4" />
                </div>
                <select
                  value={selectedBid}
                  onChange={(e) => {
                    setSelectedBid(e.target.value);
                    setCurrentPage(1);
                  }}
                  disabled={isLoadingBusinesses}
                  className="w-full pl-9 pr-8 py-2 bg-gray-50 border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-xs font-bold text-gray-800 cursor-pointer appearance-none"
                >
                  {isLoadingBusinesses ? (
                    <option>Loading businesses...</option>
                  ) : businesses.length === 0 ? (
                    <option>No businesses available</option>
                  ) : (
                    businesses.map((b) => (
                      <option key={b.bid} value={b.bid}>
                        {b.businessname || `Business #${b.bid}`}
                      </option>
                    ))
                  )}
                </select>
                <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </div>

              {/* Standard search bar */}
              <div className="relative w-full sm:w-64">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Search reviews..."
                  className="w-full pl-9 pr-4 py-2 bg-gray-50 border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-xs font-medium"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>

            <div className="text-xs font-bold text-gray-400 uppercase tracking-widest self-start md:self-center">
              Total Reviews: {filteredReviews.length}
            </div>
          </div>
        </CardHeader>

        {/* Reviews Table View */}
        {isLoadingReviews ? (
          <div className="py-24 flex flex-col items-center justify-center gap-3">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">
              Fetching Business Ratings...
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-gray-50 border-b border-border">
                  <th className="px-5 py-3 text-[10px] font-bold text-gray-500 uppercase tracking-wider w-12">
                    S.No
                  </th>
                  <th className="px-5 py-3 text-[10px] font-bold text-gray-500 uppercase tracking-wider">
                    Customer Details
                  </th>
                  <th className="px-5 py-3 text-[10px] font-bold text-gray-500 uppercase tracking-wider">
                    Product Item
                  </th>
                  <th className="px-5 py-3 text-[10px] font-bold text-gray-500 uppercase tracking-wider">
                    Rating
                  </th>
                  <th className="px-5 py-3 text-[10px] font-bold text-gray-500 uppercase tracking-wider w-1/3">
                    Feedback / Review
                  </th>
                  <th className="px-5 py-3 text-[10px] font-bold text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-5 py-3 text-[10px] font-bold text-gray-500 uppercase tracking-wider text-right w-24">
                    Visibility
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {paginatedReviews.map((review, index) => (
                  <tr
                    key={review.reviewid || index}
                    className="hover:bg-gray-50/50 transition-colors"
                  >
                    <td className="px-5 py-4 text-xs font-semibold text-gray-600 align-top">
                      {(currentPage - 1) * itemsPerPage + index + 1}
                    </td>

                    {/* User Details */}
                    <td className="px-5 py-4 align-top">
                      <div className="flex items-start gap-3">
                        <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary font-black text-xs shrink-0 uppercase mt-0.5">
                          {(review.name || "U").charAt(0)}
                        </div>
                        <div className="space-y-0.5">
                          <p className="font-bold text-xs text-gray-900">
                            {review.name || "Anonymous"}
                          </p>
                          {review.email && (
                            <p className="text-[10px] text-gray-500 font-medium flex items-center gap-1">
                              <Mail className="w-3 h-3 text-gray-400" /> {review.email}
                            </p>
                          )}
                          <p className="text-[10px] text-gray-400 font-medium flex items-center gap-1">
                            <Calendar className="w-3 h-3" />{" "}
                            {review.createdAt
                              ? new Date(review.createdAt).toLocaleDateString()
                              : "—"}
                          </p>
                        </div>
                      </div>
                    </td>

                    {/* Product Name */}
                    <td className="px-5 py-4 align-top">
                      <p className="font-bold text-xs text-gray-800">
                        {review.productname || `Product #${review.productid}`}
                      </p>
                    </td>

                    {/* Rating Stars */}
                    <td className="px-5 py-4 align-top">
                      <div className="flex items-center gap-0.5">
                        {[...Array(5)].map((_, i) => (
                          <Star
 maintained
                            key={i}
                            className={`w-3.5 h-3.5 ${
                              i < (review.rating || 0)
                                ? "text-accent fill-accent"
                                : "text-gray-200"
                            }`}
                          />
                        ))}
                      </div>
                      {review.title && (
                        <p className="text-[10px] font-bold text-gray-700 mt-1 italic">
                          "{review.title}"
                        </p>
                      )}
                    </td>

                    {/* Review Text */}
                    <td className="px-5 py-4 align-top">
                      <p className="text-xs text-gray-600 leading-relaxed font-medium">
                        {review.review || "No written review provided."}
                      </p>
                    </td>

                    {/* Status Badge */}
                    <td className="px-5 py-4 align-top">
                      <Badge
                        variant={review.status === "active" ? "success" : "gray"}
                        className="py-0.5 px-2 text-[10px] rounded-md font-bold uppercase tracking-wider"
                      >
                        {review.status || "inactive"}
                      </Badge>
                    </td>

                    {/* Action Toggle Switch Button */}
                    <td className="px-5 py-4 text-right align-top">
                      <button
                        onClick={() => handleStatusToggle(review)}
                        className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                          review.status === "active"
                            ? "bg-primary"
                            : "bg-gray-200"
                        }`}
                        title={
                          review.status === "active"
                            ? "Deactivate Review"
                            : "Activate Review"
                        }
                      >
                        <span
                          className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                            review.status === "active"
                              ? "translate-x-4"
                              : "translate-x-0"
                          }`}
                        />
                      </button>
                    </td>
                  </tr>
                ))}

                {filteredReviews.length === 0 && (
                  <tr>
                    <td
                      colSpan="7"
                      className="px-5 py-12 text-center text-xs text-gray-500 font-medium"
                    >
                      No product ratings found for this business.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* Shared Pagination component */}
        <TablePagination
          dataLength={filteredReviews.length}
          currentPage={currentPage}
          setCurrentPage={setCurrentPage}
          itemsPerPage={itemsPerPage}
          setItemsPerPage={setItemsPerPage}
        />
      </Card>
    </div>
  );
};

export default ProductReviewsList;
