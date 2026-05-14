import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import Card, { CardHeader } from "../../components/ui/Card";
import Button from "../../components/ui/Button";
import Badge from "../../components/ui/Badge";
import { merchantOrders } from "../../data/mockData";
import {
  Search,
  Filter,
  ShoppingCart,
  Store,
  ExternalLink,
  Download,
} from "lucide-react";

const OrderList = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");

  const filteredOrders = merchantOrders.filter(
    (order) =>
      order.merchant.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.id.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  return (
    <div className="space-y-6 animate-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">
            Orders
          </h1>
        </div>
        <Button
          variant="outline"
          className="text-primary border-primary/20 hover:bg-primary/5"
        >
          <Download className="w-4 h-4" /> Export All Orders
        </Button>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col md:flex-row items-center gap-4 w-full">
            <div className="relative w-full sm:w-72">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search by Order ID or Merchant Name..."
                className="w-full pl-11 pr-4 py-2 bg-gray-50 border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all duration-200"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <Button variant="outline">
              <Filter className="w-4 h-4" /> Group By Merchant
            </Button>
          </div>
        </CardHeader>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-gray-50 border-b border-border">
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase">
                  Order Details
                </th>
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase">
                  Merchant
                </th>
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase">
                  Amount
                </th>
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase">
                  Status
                </th>
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase">
                  Action
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filteredOrders.map((order) => (
                <tr
                  key={order.id}
                  className="hover:bg-gray-50/50 transition-colors group"
                >
                  <td className="px-6 py-4">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <ShoppingCart className="w-4 h-4 text-accent" />
                        <p className="text-sm font-bold text-gray-900">
                          {order.id}
                        </p>
                      </div>
                      <p className="text-xs text-gray-500 ml-6 truncate max-w-[200px]">
                        {order.items}
                      </p>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-primary/5 flex items-center justify-center text-primary">
                        <Store className="w-4 h-4" />
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-gray-800">
                          {order.merchant}
                        </p>
                        <p className="text-[10px] uppercase tracking-tighter text-gray-400 font-bold">
                          To: {order.customer}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <p className="text-sm font-black text-gray-900">
                      {order.amount}
                    </p>
                    <p className="text-[10px] text-gray-400">{order.date}</p>
                  </td>
                  <td className="px-6 py-4">
                    <Badge
                      variant={
                        order.status === "Delivered"
                          ? "success"
                          : order.status === "Processing"
                            ? "warning"
                            : order.status === "Cancelled"
                              ? "danger"
                              : "accent"
                      }
                    >
                      {order.status}
                    </Badge>
                  </td>
                  <td className="px-6 py-4">
                    <button
                      onClick={() => navigate(`/orders/${order.id}`)}
                      className="p-2 hover:bg-gray-100 rounded-lg text-gray-400 hover:text-primary transition-all"
                    >
                      <ExternalLink className="w-5 h-5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
};

export default OrderList;
