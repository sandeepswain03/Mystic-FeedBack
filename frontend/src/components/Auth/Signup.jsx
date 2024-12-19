import { useState, useContext, useEffect } from "react";
import { useForm } from "react-hook-form";
import { Link, useNavigate } from "react-router-dom";
import { axiosInstance } from "../../axiosInstance.js";
import toast from "react-hot-toast";
import UserContext from "../../contexts/userContext.js";
import useMousePosition from "../../utils/useMousePostion.js";
import mask from "../../../public/mask.svg";
import { motion } from "framer-motion";

function Signup() {
    const {
        register,
        handleSubmit,
        formState: { errors }
    } = useForm();
    const [showPassword, setShowPassword] = useState(false);
    const [otp, setOtp] = useState("");
    const [otpSent, setOtpSent] = useState(false);
    const [isVerified, setIsVerified] = useState(false);
    const [email, setEmail] = useState("");
    const [timer, setTimer] = useState(120); // 2 minutes timer
    // const [resendAvailable, setResendAvailable] = useState(false);
    const navigate = useNavigate();
    const { setUser } = useContext(UserContext);
    const { x, y } = useMousePosition();
    const size = 40;

    // Start timer when OTP is sent
    useEffect(() => {
        if (otpSent && timer > 0) {
            const interval = setInterval(() => {
                setTimer((prev) => prev - 1);
            }, 1000);

            return () => clearInterval(interval);
        }
    }, [otpSent, timer]);

    const handleSendOtp = async () => {
        try {
            // Call the backend to send OTP
            const response = await axiosInstance.get("/user/send-otp", {
                params: { email }
            });

            if (response.status === 200) {
                setOtp(response.data.data.otp);
                setOtpSent(true);
                // setResendAvailable(false);
                setTimer(120); // Reset timer to 2 minutes
                toast.success("OTP sent successfully!");
            }
        } catch (error) {
            toast.error("Error sending OTP. Please try again." + error);
        }
    };

    const handleVerifyOtp = async () => {
        try {
            if (otp === "") {
                toast.error("Please enter OTP");
            } else if (otp !== otp) {
                toast.error("Invalid OTP");
            } else {
                setIsVerified(true);
                setOtpSent(false);
                toast.success("OTP verified Successfully");
            }
        } catch (error) {
            toast.error("Invalid OTP. Please try again." + error);
        }
    };

    const handleSignup = async (data) => {
        try {
            const response = await axiosInstance.post("/user/register", {
                username: data.username.toLowerCase(),
                email: data.email,
                password: data.password,
                isVerified: true
            });
            if (response.status === 201) {
                const { user } = response.data.data;
                setUser(user);
                toast.success("User registered successfully");
                navigate("/dashboard");
            } else {
                toast.error("Unexpected error occurred");
            }
        } catch (error) {
            console.log(error);

            toast.error("Error registering user. Please try again.");
        }
    };

    const onSubmit = (data) => {
        if (isVerified) {
            handleSignup(data);
        } else {
            handleSendOtp(data);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-[#2C2B28] px-4 sm:px-6 lg:px-8 relative">
            <motion.div
                className="absolute inset-0 bg-[#ec4e39] z-0 hidden md:block"
                animate={{
                    WebkitMaskPosition: `${x - size / 3 - 3}px ${y - size - 37}px`,
                    WebkitMaskSize: `${size}px`
                }}
                transition={{
                    type: "tween",
                    ease: "backOut",
                    duration: 0.5
                }}
                style={{
                    WebkitMaskImage: `url(${mask})`,
                    WebkitMaskRepeat: "no-repeat",
                    WebkitMaskSize: `${size}px`
                }}
            />
            <div className="max-w-lg w-full space-y-8 bg-[#262622] p-6 sm:p-8 md:p-10 rounded-xl shadow-2xl border border-[#393937] relative z-10">
                <div>
                    <h2 className="mt-6 text-center text-3xl sm:text-4xl font-extrabold text-[#ec4e39]">
                        Join Mystic Feedback
                    </h2>
                    <p className="mt-2 text-center text-sm text-[#afa18f]">
                        Create your account and start your journey
                    </p>
                </div>

                <form
                    className="mt-8 space-y-6"
                    onSubmit={handleSubmit(onSubmit)}
                >
                    <div className="rounded-md shadow-sm space-y-6">
                        {/* Username input field */}
                        <div>
                            <label htmlFor="username" className="sr-only">
                                Username
                            </label>
                            <input
                                id="username"
                                name="username"
                                type="text"
                                autoComplete="username"
                                {...register("username", {
                                    required: "Username is required",
                                    minLength: {
                                        value: 3,
                                        message:
                                            "Username must be at least 3 characters"
                                    }
                                })}
                                className="appearance-none rounded-lg relative block w-full px-3 py-2 sm:px-4 sm:py-3 border border-[#393937] placeholder-[#afa18f] text-[#afa18f] bg-[#2C2B28] focus:outline-none focus:ring-2 focus:ring-[#ec4e39] focus:border-[#ec4e39] focus:z-10 text-sm sm:text-base transition duration-300"
                                placeholder="Username"
                            />
                            {errors.username && (
                                <p className="mt-2 text-xs sm:text-sm text-[#ec4e39]">
                                    {errors.username.message}
                                </p>
                            )}
                        </div>

                        {/* Email input field */}
                        <div>
                            <label htmlFor="email-address" className="sr-only">
                                Email address
                            </label>
                            <input
                                id="email-address"
                                name="email"
                                type="email"
                                autoComplete="email"
                                {...register("email", {
                                    required: "Email is required",
                                    pattern: {
                                        value: /^\S+@\S+$/i,
                                        message: "Invalid email address"
                                    }
                                })}
                                className="appearance-none rounded-lg relative block w-full px-3 py-2 sm:px-4 sm:py-3 border border-[#393937] placeholder-[#afa18f] text-[#afa18f] bg-[#2C2B28] focus:outline-none focus:ring-2 focus:ring-[#ec4e39] focus:border-[#ec4e39] focus:z-10 text-sm sm:text-base transition duration-300"
                                placeholder="Email address"
                                onChange={(e) => setEmail(e.target.value)}
                            />
                            {errors.email && (
                                <p className="mt-2 text-xs sm:text-sm text-[#ec4e39]">
                                    {errors.email.message}
                                </p>
                            )}
                        </div>

                        {/* OTP input field */}
                        {otpSent && !isVerified && (
                            <div>
                                <label htmlFor="otp" className="sr-only">
                                    OTP
                                </label>
                                <input
                                    id="otp"
                                    name="otp"
                                    type="text"
                                    onChange={(e) => setOtp(e.target.value)}
                                    className="appearance-none rounded-lg relative block w-full px-3 py-2 sm:px-4 sm:py-3 border border-[#393937] placeholder-[#afa18f] text-[#afa18f] bg-[#2C2B28] focus:outline-none focus:ring-2 focus:ring-[#ec4e39] focus:border-[#ec4e39] focus:z-10 text-sm sm:text-base transition duration-300"
                                    placeholder="Enter OTP"
                                />
                            </div>
                        )}

                        {/* Password input field */}
                        <div>
                            <label htmlFor="password" className="sr-only">
                                Password
                            </label>
                            <div className="relative">
                                <input
                                    id="password"
                                    name="password"
                                    type={showPassword ? "text" : "password"}
                                    autoComplete="new-password"
                                    {...register("password", {
                                        required: "Password is required",
                                        minLength: {
                                            value: 6,
                                            message:
                                                "Password must be at least 6 characters"
                                        }
                                    })}
                                    className="appearance-none rounded-lg relative block w-full px-3 py-2 sm:px-4 sm:py-3 border border-[#393937] placeholder-[#afa18f] text-[#afa18f] bg-[#2C2B28] focus:outline-none focus:ring-2 focus:ring-[#ec4e39] focus:border-[#ec4e39] focus:z-10 text-sm sm:text-base transition duration-300"
                                    placeholder="Password"
                                />
                            </div>
                            {errors.password && (
                                <p className="mt-2 text-xs sm:text-sm text-[#ec4e39]">
                                    {errors.password.message}
                                </p>
                            )}
                        </div>

                        {/* OTP action button */}
                        <div className="flex justify-between">
                            {otpSent && !isVerified && (
                                <button
                                    type="button"
                                    onClick={handleVerifyOtp}
                                    className="group relative w-full py-2 px-4 border border-transparent text-sm sm:text-base font-bold rounded-full text-[#262622] bg-[#ec4e39] hover:bg-[#d43d2a] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#ec4e39] transition duration-300 ease-in-out"
                                >
                                    Verify OTP
                                </button>
                            )}
                            {!otpSent && !isVerified && (
                                <button
                                    type="button"
                                    onClick={handleSendOtp}
                                    className="group relative w-full py-2 px-4 border border-transparent text-sm sm:text-base font-bold rounded-full text-[#262622] bg-[#ec4e39] hover:bg-[#d43d2a] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#ec4e39] transition duration-300 ease-in-out"
                                >
                                    Send OTP
                                </button>
                            )}

                            {/* Resend OTP Button */}
                            {otpSent && timer === 0 && (
                                <button
                                    type="button"
                                    onClick={handleSendOtp}
                                    className="group relative w-full py-2 px-4 border border-transparent text-sm sm:text-base font-bold rounded-full text-[#262622] bg-[#ec4e39] hover:bg-[#d43d2a] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#ec4e39] transition duration-300 ease-in-out"
                                >
                                    Resend OTP
                                </button>
                            )}
                        </div>
                    </div>
                    {/* Show sign-up button only after OTP is verified */}
                    {isVerified && (
                        <div>
                            <button
                                type="submit"
                                className="group relative w-full flex justify-center py-2 px-4 sm:py-3 sm:px-6 border border-transparent text-sm sm:text-base font-bold rounded-full text-[#262622] bg-[#ec4e39] hover:bg-[#d43d2a] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#ec4e39] transition duration-300 ease-in-out transform hover:scale-105"
                            >
                                Sign up
                            </button>
                        </div>
                    )}
                </form>

                <div className="text-center">
                    <p className="text-xs sm:text-sm text-[#afa18f]">
                        Already have an account?{" "}
                        <Link
                            to="/login"
                            className="font-medium text-[#ec4e39] hover:text-[#d43d2a] transition duration-300"
                        >
                            Sign in
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
}

export default Signup;
