import React, { useState, useEffect } from "react";
import TablePagination from "../../components/ui/TablePagination";
import Card from "../../components/ui/Card";
import Badge from "../../components/ui/Badge";
import Button from "../../components/ui/Button";
import { Star, Trash2, Loader2 } from "lucide-react";
import { toast } from "react-toastify";
import { API } from "../../services/api_service";
import { APIROUTES } from "../../routes/api_routes";

const ReviewList = () => {
  const [reviews, setReviews] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  const fetchReviews = async () => {
    setIsLoading(true);
    try {
      const response = await API.post(APIROUTES.GETALLREVIEWS);
      if (response.data && response.data.statusCode === 200) {
        setReviews(response.data.data || []);
      } else {
        toast.error(response.data?.message || "Failed to fetch reviews");
      }
    } catch (error) {
      console.error("Fetch reviews error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchReviews();
  }, []);

  const paginatedReviews = reviews.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage,
  );

  const toggleStatus = async (reviewid, currentIsActive) => {
    const newIsActive = !currentIsActive;
    try {
      // Optimistic update
      setReviews((prev) =>
        prev.map((r) =>
          r.reviewid === reviewid ? { ...r, isActive: newIsActive } : r,
        ),
      );

      const response = await API.post(APIROUTES.ACTIVEREVIEW, {
        reviewid,
        isActive: newIsActive,
      });

      if (response.data && response.data.statusCode === 200) {
        toast.success(response.data.message || `Review status updated`);
      } else {
        // Revert on error
        setReviews((prev) =>
          prev.map((r) =>
            r.reviewid === reviewid ? { ...r, isActive: currentIsActive } : r,
          ),
        );
        toast.error(response.data?.message || "Failed to update review status");
      }
    } catch (error) {
      console.error("Toggle review status error:", error);
      setReviews((prev) =>
        prev.map((r) =>
          r.reviewid === reviewid ? { ...r, isActive: currentIsActive } : r,
        ),
      );
      toast.error("Error updating review status");
    }
  };

  const handleDelete = async (reviewid, username) => {
    if (
      !window.confirm(
        `Are you sure you want to delete review by ${username || "this user"}?`,
      )
    )
      return;

    try {
      const response = await API.post(APIROUTES.DELETEREVIEW, { reviewid });
      if (response.data && response.data.statusCode === 200) {
        toast.success(response.data.message || "Review deleted successfully");
        setReviews((prev) => prev.filter((r) => r.reviewid !== reviewid));
      } else {
        toast.error(response.data?.message || "Failed to delete review");
      }
    } catch (error) {
      console.error("Delete review error:", error);
      toast.error("Error deleting review");
    }
  };

  return (
    <div className="space-y-6 animate-in slide-in-from-bottom-4 duration-500">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 tracking-tight">
          Website Reviews
        </h1>
      </div>

      <Card>
        {isLoading ? (
          <div className="py-20 flex flex-col items-center justify-center gap-3">
            <Loader2 className="w-10 h-10 animate-spin text-primary" />
            <p className="text-sm font-bold text-gray-400 uppercase tracking-widest">
              Loading Reviews...
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
                    User Info
                  </th>
                  <th className="px-4 py-3 text-[10px] font-bold text-gray-500 uppercase tracking-wider">
                    Rating
                  </th>
                  <th className="px-4 py-3 text-[10px] font-bold text-gray-500 uppercase tracking-wider">
                    Comment
                  </th>
                  <th className="px-4 py-3 text-[10px] font-bold text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-4 py-3 text-[10px] font-bold text-gray-500 uppercase tracking-wider text-right">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {paginatedReviews.map((review, index) => (
                  <tr
                    key={review.reviewid}
                    className="hover:bg-gray-50/50 transition-colors"
                  >
                    <td className="px-4 py-3 text-xs font-semibold text-gray-600">
                      {(currentPage - 1) * itemsPerPage + index + 1}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-[10px] bg-primary/10 flex items-center justify-center text-primary font-bold text-xs shrink-0 uppercase">
                          {(review.username || "U").charAt(0)}
                        </div>
                        <div>
                          <p className="font-bold text-xs text-gray-900">
                            {review.username || "Anonymous"}
                          </p>
                          <p className="text-[10px] text-gray-500">
                            {review.email || "No email"}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className={`w-3.5 h-3.5 ${
                              i < Math.floor(review.rating || 0)
                                ? "text-accent fill-accent"
                                : "text-gray-200"
                            }`}
                          />
                        ))}
                        <span className="text-xs font-bold text-gray-600 ml-1">
                          {review.rating || 0}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <p
                        className="text-xs text-gray-600 max-w-xs xl:max-w-md truncate"
                        title={review.review}
                      >
                        {review.review || "—"}
                      </p>
                    </td>
                    <td className="px-4 py-3">
                      <Badge
                        variant={review.isActive ? "success" : "gray"}
                        className="py-0 px-1.5 text-[9px] rounded-[10px]"
                      >
                        {review.isActive ? "Active" : "Inactive"}
                      </Badge>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-3">
                        <button
                          type="button"
                          onClick={() =>
                            toggleStatus(review.reviewid, review.isActive)
                          }
                          className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                            review.isActive ? "bg-emerald-500" : "bg-gray-200"
                          }`}
                          title={
                            review.isActive
                              ? "Deactivate Review"
                              : "Activate Review"
                          }
                        >
                          <span
                            className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                              review.isActive
                                ? "translate-x-4"
                                : "translate-x-0"
                            }`}
                          />
                        </button>

                        <button
                          className="w-7 h-7 rounded-[10px] text-gray-400 hover:text-red-600 hover:bg-red-50 transition-all flex items-center justify-center cursor-pointer"
                          onClick={() =>
                            handleDelete(review.reviewid, review.username)
                          }
                          title="Delete Review"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {reviews.length === 0 && (
                  <tr>
                    <td
                      colSpan="6"
                      className="px-4 py-8 text-center text-xs text-gray-500"
                    >
                      No reviews found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
        <TablePagination
          dataLength={reviews.length}
          currentPage={currentPage}
          setCurrentPage={setCurrentPage}
          itemsPerPage={itemsPerPage}
          setItemsPerPage={setItemsPerPage}
        />
      </Card>
    </div>
  );
};

export default ReviewList;
