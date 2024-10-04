import { useState, useContext } from "react";
import { useForm } from "react-hook-form";
import { Link, useNavigate } from "react-router-dom";
import { axiosInstance } from "../../axiosInstance.js";
import toast from "react-hot-toast";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import UserContext from "../../contexts/userContext.js";
import useMousePosition from "../../utils/useMousePostion.js";
import mask from "../../../public/mask.svg";
import { motion } from "framer-motion";

function Login() {
    // Initialize form handling using react-hook-form
    const {
        register,
        handleSubmit,
        formState: { errors }
    } = useForm();
    const [showPassword, setShowPassword] = useState(false);
    const navigate = useNavigate();
    const { setUser } = useContext(UserContext);
    const { x, y } = useMousePosition();
    const size = 40;

    // Handle form submission and user authentication
    const onSubmit = async (data) => {
        try {
            const finalData = { ...data, username: data.email };
            const response = await axiosInstance.post("/user/login", finalData);
            if (response.status === 200) {
                const { user } = response.data.data;
                setUser(user);
                toast.success("Logged in successfully!");
                navigate("/dashboard");
            } else {
                throw new Error("Unexpected response status");
            }
        } catch (error) {
            const errorMessage =
                error.response?.data?.message ||
                "Something went wrong. Please try again.";
            toast.error(errorMessage);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-[#2C2B28] px-4 sm:px-6 lg:px-8 relative">
            <motion.div
                className="absolute inset-0 bg-[#ec4e39] z-0 hidden md:block"
                animate={{
                    WebkitMaskPosition: `${x - size / 2}px ${y - size / 2}px`,
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
            <div className="max-w-xl w-full space-y-8 bg-[#262622] p-10 rounded-xl shadow-2xl border border-[#393937] relative z-10">
                <div>
                    <h2 className="mt-6 text-center text-4xl font-extrabold text-[#ec4e39]">
                        Welcome Back
                    </h2>
                    <p className="mt-2 text-center text-sm text-[#afa18f]">
                        Sign in to your account
                    </p>
                </div>
                <form
                    className="mt-8 space-y-6"
                    onSubmit={handleSubmit(onSubmit)}
                >
                    <div className="rounded-md shadow-sm -space-y-px">
                        {/* Email/Username Input */}
                        <div className="mb-6">
                            <label htmlFor="email-address" className="sr-only">
                                Email address or Username
                            </label>
                            <div className="relative">
                                <input
                                    id="email-address"
                                    name="email"
                                    type="text"
                                    autoComplete="email"
                                    {...register("email", {
                                        required:
                                            "Email or username is required" // Validation message
                                    })}
                                    className="appearance-none rounded-lg relative block w-full px-4 py-3 border border-[#393937] placeholder-[#afa18f] text-[#afa18f] bg-[#2C2B28] focus:outline-none focus:ring-2 focus:ring-[#ec4e39] focus:border-[#ec4e39] focus:z-10 sm:text-sm transition duration-300"
                                    placeholder="Email address or Username"
                                />
                            </div>
                            {errors.email && (
                                <p className="mt-2 text-sm text-[#ec4e39]">
                                    {errors.email.message}{" "}
                                    {/* Show validation error message */}
                                </p>
                            )}
                        </div>
                        {/* Password Input */}
                        <div className="mb-6">
                            <label htmlFor="password" className="sr-only">
                                Password
                            </label>
                            <div className="relative">
                                <input
                                    id="password"
                                    name="password"
                                    type={showPassword ? "text" : "password"} // Toggle password visibility
                                    autoComplete="current-password"
                                    {...register("password", {
                                        required: "Password is required" // Validation message
                                    })}
                                    className="appearance-none rounded-lg relative block w-full px-4 py-3 border border-[#393937] placeholder-[#afa18f] text-[#afa18f] bg-[#2C2B28] focus:outline-none focus:ring-2 focus:ring-[#ec4e39] focus:border-[#ec4e39] focus:z-10 sm:text-sm transition duration-300"
                                    placeholder="Password"
                                />
                                {/* Show/Hide Password Button */}
                                <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                                    <button
                                        type="button"
                                        onClick={() =>
                                            setShowPassword(!showPassword)
                                        } // Toggle function
                                        className="text-[#afa18f] focus:outline-none hover:text-[#ec4e39] transition duration-300"
                                    >
                                        {showPassword ? (
                                            <FaEyeSlash className="h-5 w-5" />
                                        ) : (
                                            <FaEye className="h-5 w-5" />
                                        )}
                                    </button>
                                </div>
                            </div>
                            {errors.password && (
                                <p className="mt-2 text-sm text-[#ec4e39]">
                                    {errors.password.message}{" "}
                                    {/* Show validation error message */}
                                </p>
                            )}
                        </div>
                    </div>

                    {/* Submit Button */}
                    <div>
                        <button
                            type="submit"
                            className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-bold rounded-full text-[#262622] bg-[#ec4e39] hover:bg-[#d43d2a] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#ec4e39] transition duration-300 ease-in-out transform hover:scale-105"
                        >
                            Sign in
                        </button>
                    </div>
                </form>
                {/* Sign-up Redirect */}
                <div className="text-center">
                    <p className="text-sm text-[#afa18f]">
                        Don&apos;t have an account?{" "}
                        <Link
                            to="/signup"
                            className="font-medium text-[#ec4e39] hover:text-[#d43d2a] transition duration-300"
                        >
                            Sign up
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
}

export default Login;
