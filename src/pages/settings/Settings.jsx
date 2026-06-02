import React from "react";
import { useNavigate } from "react-router-dom";
import Card, { CardContent } from "../../components/ui/Card";
import {
  User,
  Phone,
  Mail,
  LogOut,
  ShieldCheck,
  CheckCircle2,
  Clock,
  Activity,
  Building,
} from "lucide-react";
import { toast } from "react-toastify";

const Settings = () => {
  const navigate = useNavigate();

  const profile = {
    name: "Super Admin",
    phone: "+91 98765 43210",
    email: "admin@tradizions.com",
    role: "Super Administrator",
    department: "Corporate Management",
    lastLogin: "May 06, 2026 - 16:11",
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    localStorage.removeItem("userid");
    toast.info("Logged out successfully!");
    navigate("/login", { replace: true });
  };


  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in duration-500">
      {/* Header Panel */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 tracking-tight">
          Account Profile
        </h1>
        <p className="text-gray-500 mt-1">
          Manage and audit your super-administrator security information.
        </p>
      </div>

      {/* Main Two-Column Premium Layout */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Left Column: Visual Avatar Card */}
        <div className="md:col-span-1 space-y-6">
          <Card className="shadow-sm border-none ring-1 ring-gray-100 bg-white overflow-hidden">
            {/* Soft decorative gradient header */}
            <div className="relative h-24 bg-gradient-to-br from-primary to-primary/80">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.1),transparent)]"></div>
            </div>

            <CardContent className="p-6 relative -mt-12 text-center">
              {/* Profile Image Circle */}
              <div className="inline-flex p-1 bg-white rounded-full shadow-md">
                <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center text-primary font-black text-2xl border border-primary/20">
                  {profile.name.charAt(0)}
                </div>
              </div>

              {/* Basic Meta */}
              <div className="mt-3 space-y-1">
                <h3 className="text-lg font-black text-gray-900 leading-snug">
                  {profile.name}
                </h3>

                <div className="pt-2 flex justify-center">
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-[10px] bg-emerald-50 text-[10px] font-bold text-emerald-600 border border-emerald-100">
                    <CheckCircle2 className="w-3 h-3" /> Verified Admin
                  </span>
                </div>
              </div>

              {/* Quick Logout */}
              <div className="mt-6">
                <button
                  onClick={handleLogout}
                  className="w-full py-2.5 bg-rose-50 hover:bg-rose-100 text-rose-600 font-bold text-xs rounded-[10px] flex items-center justify-center gap-2 cursor-pointer transition-all border border-rose-100"
                >
                  <LogOut className="w-3.5 h-3.5" /> Sign Out from App
                </button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column: Information details */}
        <div className="md:col-span-2 space-y-6">
          <Card className="shadow-sm border-none ring-1 ring-gray-100 bg-white">
            <CardContent className="p-6 space-y-6">
              {/* Profile Details Header */}
              <div>
                <h4 className="text-sm font-bold text-gray-900 uppercase tracking-wider border-b border-gray-50 pb-2 flex items-center gap-2">
                  <User className="w-4 h-4 text-primary" /> Profile Credentials
                </h4>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Full Name */}
                <div className="p-4 bg-gray-50 rounded-[10px] border border-gray-100/60 space-y-1">
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest flex items-center gap-1.5">
                    <User className="w-3 h-3" /> Full Name
                  </p>
                  <p className="text-sm font-bold text-gray-800">
                    {profile.name}
                  </p>
                </div>

                {/* Mobile Phone */}
                <div className="p-4 bg-gray-50 rounded-[10px] border border-gray-100/60 space-y-1">
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest flex items-center gap-1.5">
                    <Phone className="w-3 h-3" /> Phone Number
                  </p>
                  <p className="text-sm font-bold text-gray-800">
                    {profile.phone}
                  </p>
                </div>

                {/* Email Address */}
                <div className="p-4 bg-gray-50 rounded-[10px] border border-gray-100/60 space-y-1 sm:col-span-2">
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest flex items-center gap-1.5">
                    <Mail className="w-3 h-3" /> Email Address
                  </p>
                  <p className="text-sm font-bold text-gray-800">
                    {profile.email}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Settings;
