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
    <div className="min-h-screen bg-background flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative overflow-hidden select-none animate-in fade-in duration-350">
      {/* Background Decorative Blobs */}
      <div className="absolute top-[-20%] left-[-10%] w-[600px] h-[600px] rounded-full bg-primary/5 blur-3xl pointer-events-none" />
      <div className="absolute bottom-[-20%] right-[-10%] w-[600px] h-[600px] rounded-full bg-accent/5 blur-3xl pointer-events-none" />

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md relative z-10 px-4 sm:px-0">
        <div className="bg-white py-10 px-6 sm:px-10 rounded-2xl shadow-soft border border-border/80 backdrop-blur-md relative overflow-hidden animate-in fade-in">
          <img
            src="/src/assets/app-logo.png"
            alt="Tradizions Logo"
            className="h-14 w-auto object-contain"
            onError={(e) => {
              e.target.style.display = "none";
              e.target.parentNode.innerHTML = `<span class="text-2xl font-bold text-primary tracking-wider">Tradizions</span>`;
            }}
          />
          {/* Top colored accent line */}
          <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-primary via-accent to-primary" />
          <div style={{ height: "20px" }}></div>
          {step === "phone" ? (
            <div className="animate-in fade-in duration-300 space-y-6">
              <div>
                <h3 className="text-xl font-bold text-gray-950">
                  Welcome back
                </h3>
                <p className="text-sm text-gray-500 mt-1">
                  Enter your registered mobile number to receive a secure login
                  OTP.
                </p>
              </div>

              <form onSubmit={handlePhoneSubmit} className="space-y-6">
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <label
                      htmlFor="phone"
                      className="block text-sm font-semibold text-gray-700"
                    >
                      Mobile Number
                    </label>
                    {phone.length > 0 && (
                      <span
                        className={`text-[10px] font-bold uppercase tracking-wider ${phone.length === 10 ? "text-primary" : "text-gray-400"}`}
                      >
                        {phone.length} / 10 digits
                      </span>
                    )}
                  </div>
                  <div className="relative rounded-lg shadow-sm">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                      <Phone className="h-5 w-5 text-gray-400" />
                    </div>
                    <span className="absolute inset-y-0 left-10 pl-1 flex items-center pointer-events-none text-gray-400 text-sm font-medium">
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
                      className="w-full pl-20 pr-4 py-3 border border-border rounded-xl focus:outline-none focus:ring-4 focus:ring-primary/15 focus:border-primary transition-all duration-200 text-base placeholder-gray-400 tracking-wide font-medium"
                      placeholder="9876543210"
                      disabled={isLoading}
                    />
                  </div>
                </div>

                <div>
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full btn-primary py-3.5 text-base rounded-xl font-semibold shadow-md shadow-primary/10 hover:shadow-lg active:scale-[0.98] transition-all duration-200 disabled:opacity-50 cursor-pointer"
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="h-5 w-5 animate-spin" />
                        Sending Secure OTP...
                      </>
                    ) : (
                      <>
                        Send OTP
                        <ArrowRight className="h-5 w-5 ml-1" />
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          ) : (
            <div className="animate-in fade-in duration-300 space-y-6">
              <button
                type="button"
                onClick={() => setStep("phone")}
                className="inline-flex items-center text-sm font-semibold text-primary hover:text-primary-dark transition-colors mb-2 cursor-pointer group"
                disabled={isLoading}
              >
                <ChevronLeft className="h-4 w-4 mr-1 group-hover:-translate-x-0.5 transition-transform" />
                Change Mobile Number
              </button>

              <div className="mb-6">
                <div className="flex items-center gap-2">
                  <KeyRound className="h-5 w-5 text-accent animate-pulse" />
                  <h3 className="text-xl font-bold text-gray-950">
                    Verification Required
                  </h3>
                </div>
                <p className="text-sm text-gray-500 mt-2">
                  We've sent a 6-digit verification code to{" "}
                  <span className="font-bold text-gray-800">+91 {phone}</span>.
                  Please enter it below.
                </p>
              </div>

              <form onSubmit={handleOtpVerify} className="space-y-6">
                <div>
                  <div className="flex justify-between items-center mb-3">
                    <label className="block text-sm font-semibold text-gray-700">
                      6-Digit Security Code
                    </label>
                    <span
                      className={`text-[10px] font-bold uppercase tracking-wider ${otp.join("").length === 6 ? "text-accent" : "text-gray-400"}`}
                    >
                      {otp.join("").length} / 6 digits
                    </span>
                  </div>
                  <div
                    className="flex justify-between gap-2 sm:gap-3"
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
                        className="w-12 h-12 sm:w-14 sm:h-14 text-center text-xl font-bold border border-border rounded-xl focus:outline-none focus:ring-4 focus:ring-primary/20 focus:border-primary transition-all duration-200 bg-gray-50 focus:bg-white"
                        disabled={isLoading}
                      />
                    ))}
                  </div>
                </div>

                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-500">
                    Didn't receive the code?
                  </span>
                  {timer > 0 ? (
                    <span className="text-gray-400 font-medium">
                      Resend in{" "}
                      <span className="font-bold text-primary">{timer}s</span>
                    </span>
                  ) : (
                    <button
                      type="button"
                      onClick={handleResendOtp}
                      disabled={isLoading || !canResend}
                      className="text-primary font-bold hover:text-primary-dark transition-colors cursor-pointer disabled:opacity-50"
                    >
                      Resend Code
                    </button>
                  )}
                </div>

                <div>
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full btn-primary py-3.5 text-base rounded-xl font-semibold shadow-md shadow-primary/10 hover:shadow-lg active:scale-[0.98] transition-all duration-200 disabled:opacity-50 cursor-pointer"
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="h-5 w-5 animate-spin" />
                        Verifying...
                      </>
                    ) : (
                      <>
                        <ShieldCheck className="h-5 w-5 mr-1.5" />
                        Verify & Login
                      </>
                    )}
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
