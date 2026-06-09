import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import {
  Phone,
  ArrowRight,
  ChevronLeft,
  Loader2,
  KeyRound,
  ShieldCheck,
} from "lucide-react";
import { API } from "../../services/api_service";
import { APIROUTES } from "../../routes/api_routes";
import { toast } from "react-toastify";
import AppLogo from "../../assets/app-logo.png";

const Login = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState("phone"); // 'phone' | 'otp'
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [isLoading, setIsLoading] = useState(false);
  const [timer, setTimer] = useState(30);
  const [canResend, setCanResend] = useState(false);

  const otpRefs = useRef([]);

  // Countdown timer for Resend OTP
  useEffect(() => {
    let interval;
    if (step === "otp" && timer > 0) {
      interval = setInterval(() => {
        setTimer((prev) => prev - 1);
      }, 1000);
    } else if (timer === 0) {
      setCanResend(true);
    }
    return () => clearInterval(interval);
  }, [step, timer]);

  // Handle phone number submission
  const handlePhoneSubmit = async (e) => {
    if (e) e.preventDefault();

    if (!phone || phone.length < 10) {
      toast.error("Please enter a valid 10-digit mobile number");
      return;
    }

    setIsLoading(true);
    try {
      const response = await API.post(APIROUTES.SENDOTP, { phone });

      if (response.data && response.data.statusCode === 200) {
        toast.success(response.data.data || "OTP sent successfully!");
        setStep("otp");
        setTimer(30);
        setCanResend(false);
        setTimeout(() => {
          if (otpRefs.current[0]) otpRefs.current[0].focus();
        }, 150);
      } else {
        toast.error(
          response.data?.message || "Failed to send OTP. Please try again.",
        );
      }
    } catch (error) {
      console.error("Send OTP error:", error);
      if (!error.isToastShown) {
        const errorMsg =
          error.response?.data?.message ||
          error.message ||
          "An error occurred. Please try again.";
        toast.error(errorMsg);
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Handle OTP Resend
  const handleResendOtp = async () => {
    if (!canResend) return;
    setIsLoading(true);
    try {
      const response = await API.post(APIROUTES.SENDOTP, { phone });
      if (response.data && response.data.statusCode === 200) {
        toast.success(response.data.data || "OTP resent successfully!");
        setTimer(30);
        setCanResend(false);
        setOtp(["", "", "", "", "", ""]);
        if (otpRefs.current[0]) otpRefs.current[0].focus();
      } else {
        toast.error(response.data?.message || "Failed to resend OTP.");
      }
    } catch (error) {
      console.error("Resend OTP error:", error);
      if (!error.isToastShown) {
        toast.error(error.response?.data?.message || "An error occurred.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  // OTP Input field handlers
  const handleOtpChange = (index, value) => {
    if (value && isNaN(value)) return;

    const newOtp = [...otp];
    newOtp[index] = value.slice(-1);
    setOtp(newOtp);

    if (value && index < 5) {
      otpRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.key === "Backspace") {
      if (!otp[index] && index > 0) {
        const newOtp = [...otp];
        newOtp[index - 1] = "";
        setOtp(newOtp);
        otpRefs.current[index - 1]?.focus();
      } else {
        const newOtp = [...otp];
        newOtp[index] = "";
        setOtp(newOtp);
      }
    } else if (e.key === "ArrowLeft" && index > 0) {
      otpRefs.current[index - 1]?.focus();
    } else if (e.key === "ArrowRight" && index < 5) {
      otpRefs.current[index + 1]?.focus();
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData("text").trim();
    if (!/^\d{6}$/.test(pastedData)) {
      toast.warning("Please paste a valid 6-digit OTP code");
      return;
    }

    const digits = pastedData.split("");
    setOtp(digits);
    otpRefs.current[5]?.focus();
  };

  // Handle OTP verification
  const handleOtpVerify = async (e) => {
    if (e) e.preventDefault();
    const otpString = otp.join("");

    if (otpString.length < 6) {
      toast.error("Please enter the complete 6-digit OTP");
      return;
    }

    setIsLoading(true);
    try {
      const payload = {
        phone,
        otp: parseInt(otpString, 10),
      };

      const response = await API.post(APIROUTES.VERIFYOTP, payload);

      if (response.data && response.data.statusCode === 200) {
        const { token, role, userid } = response.data.data;

        localStorage.setItem("token", token);
        if (role) localStorage.setItem("role", role);
        if (userid) localStorage.setItem("userid", userid.toString());

        toast.success("Verification successful! Opening dashboard...");

        setTimeout(() => {
          navigate("/dashboard");
        }, 800);
      } else {
        toast.error(
          response.data?.message || "Invalid OTP code. Please try again.",
        );
      }
    } catch (error) {
      console.error("Verify OTP error:", error);
      if (!error.isToastShown) {
        const errorMsg =
          error.response?.data?.message ||
          error.message ||
          "Invalid OTP code or verification failed.";
        toast.error(errorMsg);
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex font-sans bg-gray-50 select-none">
      {/* Left Side - Hero / Branding (Hidden on mobile) */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden bg-gray-900 justify-center items-center">
        {/* Gradient Background */}
        <div className="absolute inset-0 bg-gradient-to-br from-[#556B2F] via-[#2F3E18] to-gray-950 z-0"></div>
        {/* Decorative Blobs */}
        <div className="absolute top-[-15%] left-[-15%] w-[600px] h-[600px] bg-white/5 blur-[100px] rounded-full z-0 pointer-events-none"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] bg-[#FF8C00]/20 blur-[100px] rounded-full z-0 pointer-events-none"></div>

        <div className="relative z-10 p-12 text-center text-white max-w-xl animate-in fade-in slide-in-from-bottom-8 duration-700">
          <div className="mb-8 flex justify-center">
            <div className="w-40 h-20 bg-white backdrop-blur-xl rounded-xl border border-white/20 flex items-center justify-center shadow-2xl">
              <img src={AppLogo} alt="app-logo" />
            </div>
          </div>
          <h1 className="text-4xl lg:text-5xl font-black mb-6 tracking-tight leading-tight">
            Tradizions <br /> Master Admin
          </h1>
          <p className="text-lg text-white/70 font-medium leading-relaxed max-w-md mx-auto">
            Securely manage your entire business operations, merchants, analytics, and orders from one unified platform.
          </p>
        </div>
      </div>

      {/* Right Side - Login Form */}
      <div className="flex-1 flex flex-col justify-center py-12 px-6 sm:px-12 lg:px-20 xl:px-32 relative bg-white shadow-[-20px_0_40px_rgba(0,0,0,0.05)] z-10 lg:rounded-l-[2.5rem] lg:-ml-6">

        {/* Mobile Background Elements */}
        <div className="lg:hidden absolute top-[-20%] left-[-10%] w-[400px] h-[400px] rounded-full bg-primary/5 blur-3xl pointer-events-none" />
        <div className="lg:hidden absolute bottom-[-20%] right-[-10%] w-[400px] h-[400px] rounded-full bg-accent/5 blur-3xl pointer-events-none" />

        <div className="w-full max-w-sm mx-auto relative z-10">

          {/* Mobile Logo (Visible only on mobile/tablet) */}
          <div className="lg:hidden flex justify-center mb-10">
            <img
              src={AppLogo}
              alt="Tradizions Logo"
              className="h-16 w-auto object-contain"
              onError={(e) => {
                e.target.style.display = "none";
                e.target.parentNode.innerHTML = `<span class="text-3xl font-black text-primary tracking-tight">Tradizions</span>`;
              }}
            />
          </div>

          <div className="mb-8 text-center lg:text-left">
            <h2 className="text-3xl font-black text-gray-900 tracking-tight mb-2">
              {step === "phone" ? "Welcome back" : "Verify account"}
            </h2>
            <p className="text-sm font-medium text-gray-500">
              {step === "phone"
                ? "Enter your mobile number to securely sign in to your dashboard."
                : <span>We've sent a code to <b className="text-gray-900">+91 {phone}</b></span>}
            </p>
          </div>

          {step === "phone" ? (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
              <form onSubmit={handlePhoneSubmit} className="space-y-6">
                <div>
                  <div className="flex justify-between items-center mb-2 px-1">
                    <label htmlFor="phone" className="block text-[13px] font-bold text-gray-700 uppercase tracking-wider">
                      Mobile Number
                    </label>
                    {phone.length > 0 && (
                      <span className={`text-[11px] font-bold uppercase tracking-wider ${phone.length === 10 ? "text-primary" : "text-gray-400"}`}>
                        {phone.length} / 10
                      </span>
                    )}
                  </div>
                  <div className="relative group">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <Phone className="h-5 w-5 text-gray-400 group-focus-within:text-primary transition-colors duration-300" />
                    </div>
                    <span className="absolute inset-y-0 left-11 pl-1 flex items-center pointer-events-none text-gray-500 font-bold">
                      +91
                    </span>
                    <input
                      type="tel"
                      name="phone"
                      id="phone"
                      autoComplete="tel"
                      required
                      value={phone}
                      onChange={(e) => {
                        const val = e.target.value.replace(/\D/g, "");
                        if (val.length <= 10) setPhone(val);
                      }}
                      className="w-full pl-[4.5rem] pr-4 py-3.5 bg-gray-50/50 border border-gray-200 rounded-xl focus:outline-none focus:ring-4 focus:ring-primary/10 focus:border-primary focus:bg-white transition-all duration-300 text-lg font-bold text-gray-900 placeholder-gray-400"
                      placeholder="9876543210"
                      disabled={isLoading}
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full bg-[#556B2F] hover:bg-[#3d4d22] text-white py-4 rounded-xl font-bold shadow-lg shadow-[#556B2F]/20 hover:shadow-xl hover:shadow-[#556B2F]/30 active:scale-[0.98] transition-all duration-300 disabled:opacity-70 flex items-center justify-center cursor-pointer"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="h-5 w-5 animate-spin mr-2" />
                      Sending OTP...
                    </>
                  ) : (
                    <>
                      Continue securely
                      <ArrowRight className="h-5 w-5 ml-2" />
                    </>
                  )}
                </button>
              </form>
            </div>
          ) : (
            <div className="animate-in fade-in slide-in-from-right-8 duration-500">
              <form onSubmit={handleOtpVerify} className="space-y-6">
                <div>
                  <label className="block text-[13px] font-bold text-gray-700 uppercase tracking-wider mb-3 px-1 text-center lg:text-left">
                    6-Digit Security Code
                  </label>
                  <div
                    className="flex justify-between gap-2"
                    onPaste={handlePaste}
                  >
                    {otp.map((digit, index) => (
                      <input
                        key={index}
                        ref={(el) => (otpRefs.current[index] = el)}
                        type="text"
                        inputMode="numeric"
                        pattern="[0-9]*"
                        maxLength="1"
                        value={digit}
                        onChange={(e) => handleOtpChange(index, e.target.value)}
                        onKeyDown={(e) => handleKeyDown(index, e)}
                        className="w-12 h-14 sm:w-14 sm:h-16 text-center text-2xl font-black text-gray-900 border border-gray-200 rounded-xl focus:outline-none focus:ring-4 focus:ring-primary/10 focus:border-primary transition-all duration-300 bg-gray-50 focus:bg-white"
                        disabled={isLoading}
                      />
                    ))}
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full bg-[#556B2F] hover:bg-[#3d4d22] text-white py-4 rounded-xl font-bold shadow-lg shadow-[#556B2F]/20 hover:shadow-xl hover:shadow-[#556B2F]/30 active:scale-[0.98] transition-all duration-300 disabled:opacity-70 flex items-center justify-center cursor-pointer mt-8"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="h-5 w-5 animate-spin mr-2" />
                      Verifying...
                    </>
                  ) : (
                    <>
                      <ShieldCheck className="h-5 w-5 mr-2" />
                      Verify & Access Dashboard
                    </>
                  )}
                </button>

                <div className="flex flex-col items-center justify-center gap-3 pt-6 border-t border-gray-100">
                  <div className="flex items-center justify-center text-sm font-medium">
                    <span className="text-gray-500 mr-2">Didn't receive code?</span>
                    {timer > 0 ? (
                      <span className="text-gray-400">
                        Resend in <span className="font-bold text-[#556B2F]">{timer}s</span>
                      </span>
                    ) : (
                      <button
                        type="button"
                        onClick={handleResendOtp}
                        disabled={isLoading || !canResend}
                        className="text-[#556B2F] font-bold hover:text-[#3d4d22] transition-colors cursor-pointer"
                      >
                        Resend OTP
                      </button>
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={() => setStep("phone")}
                    className="inline-flex items-center text-sm font-bold text-gray-500 hover:text-gray-900 transition-colors cursor-pointer group"
                    disabled={isLoading}
                  >
                    <ChevronLeft className="h-4 w-4 mr-1 group-hover:-translate-x-1 transition-transform" />
                    Change Mobile Number
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Login;
