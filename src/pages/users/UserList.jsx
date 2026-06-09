import React, { useState, useEffect } from "react";
import Card, { CardHeader } from "../../components/ui/Card";
import Button from "../../components/ui/Button";
import Badge from "../../components/ui/Badge";
import TablePagination from "../../components/ui/TablePagination";
import {
  Search,
  Filter,
  Eye,
  Edit,
  Trash2,
  UserPlus,
  Mail,
  Phone,
  Calendar,
  Loader2,
} from "lucide-react";
import { toast } from "react-toastify";
import { API } from "../../services/api_service";
import { APIROUTES, IMAGE_URL } from "../../routes/api_routes";

const UserList = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [users, setUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchUsers = async () => {
    setIsLoading(true);
    try {
      const response = await API.post(APIROUTES.GETALLUSERS);
      if (response.data && response.data.statusCode === 200) {
        setUsers(response.data.data || []);
      } else {
        toast.error(response.data?.message || "Failed to fetch users");
      }
    } catch (error) {
      console.error("Fetch users error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const filteredUsers = users.filter(
    (user) =>
      (user.username || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      (user.email || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      (user.phone || "").toLowerCase().includes(searchTerm.toLowerCase()),
  );

  const paginatedUsers = filteredUsers.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage,
  );

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1);
  };

  const handleDelete = (name) => {
    if (window.confirm(`Are you sure you want to delete ${name}?`)) {
      toast.error(`User ${name} deleted successfully`);
    }
  };

  return (
    <div className="space-y-6 animate-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">
            Tradizions Users
          </h1>
        </div>
        {/* <Button variant="accent">
          <UserPlus className="w-4 h-4" /> Register New User
        </Button> */}
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col md:flex-row items-center gap-4 w-full">
            <div className="relative w-full sm:w-72">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search by name, phone or email..."
                className="w-full pl-11 pr-4 py-2 bg-gray-50 border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all duration-200 text-xs"
                value={searchTerm}
                onChange={handleSearchChange}
              />
            </div>
            {/* <Button variant="outline">
              <Filter className="w-4 h-4" /> Filter
            </Button> */}
          </div>
        </CardHeader>

        {isLoading ? (
          <div className="py-20 flex flex-col items-center justify-center gap-3">
            <Loader2 className="w-10 h-10 animate-spin text-primary" />
            <p className="text-sm font-bold text-gray-400 uppercase tracking-widest">
              Loading Users...
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
                    Mobile Number
                  </th>
                  <th className="px-4 py-3 text-[10px] font-bold text-gray-500 uppercase tracking-wider">
                    Email
                  </th>
                  <th className="px-4 py-3 text-[10px] font-bold text-gray-500 uppercase tracking-wider">
                    Joined Date
                  </th>

                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {paginatedUsers.map((user, index) => (
                  <tr
                    key={user.userid}
                    className="hover:bg-gray-50/50 transition-colors group cursor-pointer"
                  >
                    <td className="px-4 py-3 text-xs font-semibold text-gray-600">
                      {(currentPage - 1) * itemsPerPage + index + 1}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        {user.profileimage ? (
                          <img
                            src={`${IMAGE_URL}${user.profileimage}`}
                            alt={user.username || "User"}
                            className="w-8 h-8 rounded-[10px] object-cover border border-border shrink-0"
                            onError={(e) => {
                              e.target.onerror = null;
                              e.target.style.display = "none";
                              e.target.nextSibling.style.display = "flex";
                            }}
                          />
                        ) : null}
                        <div
                          className="w-8 h-8 rounded-[10px] bg-primary/10 flex items-center justify-center text-primary font-black text-xs shrink-0 uppercase"
                          style={{
                            display: user.profileimage ? "none" : "flex",
                          }}
                        >
                          {(user.username || "U").charAt(0)}
                        </div>
                        <div>
                          <p className="font-bold text-xs text-gray-900 group-hover:text-primary transition-colors">
                            {user.username || "—"}
                          </p>
                          <p className="text-[10px] text-gray-400 font-semibold">
                            {user.ordercount || 0} Orders placed
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 space-y-1 whitespace-nowrap">
                      <div className="flex items-center gap-1.5 text-[11px] text-gray-600 font-medium">
                        {user.phone || "—"}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1.5 text-[11px] text-gray-600 font-medium">
                        {user.email || "—"}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-xs text-gray-400 font-semibold whitespace-nowrap">
                      <div className="flex items-center gap-1.5">
                        {user.createdAt
                          ? new Date(user.createdAt).toLocaleDateString()
                          : "—"}
                      </div>
                    </td>
                  </tr>
                ))}
                {filteredUsers.length === 0 && (
                  <tr>
                    <td
                      colSpan="6"
                      className="px-4 py-8 text-center text-xs text-gray-500"
                    >
                      No users found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}

        <TablePagination
          dataLength={filteredUsers.length}
          currentPage={currentPage}
          setCurrentPage={setCurrentPage}
          itemsPerPage={itemsPerPage}
          setItemsPerPage={setItemsPerPage}
        />
      </Card>
    </div>
  );
};

export default UserList;
