import { useState, useContext } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FaBars, FaTimes } from "react-icons/fa";
import UserContext from "../../contexts/userContext";
import {axiosInstance} from "../../axiosInstance";
import toast from "react-hot-toast";

function Header() {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const { user, setUser } = useContext(UserContext);
    const navigate = useNavigate();

    const handleLogout = async () => {
        try {
            await axiosInstance.post("/user/logout");
            setUser(null);
            toast.success("Logged out successfully");
            navigate("/");
        } catch (error) {
            console.log(error);
            toast.error("Logout failed. Please try again.");
        }
    };

    return (
        <header className="bg-[#2C2B28] text-[#afa18f] shadow-lg">
            <div className="container mx-auto px-4 py-6 flex justify-between items-center">
                <div className="flex items-center">
                    <Link to="/" className="text-2xl font-bold text-[#ec4e39]">
                        Mystic Feedback
                    </Link>
                </div>

                <div className="hidden md:flex items-center justify-center flex-grow">
                    {user && (
                        <span className="text-lg font-semibold text-[#afa18f]">
                            Welcome, {user.username}
                        </span>
                    )}
                </div>

                <nav className="hidden md:flex items-center space-x-6">
                    {user ? (
                        <button
                            onClick={handleLogout}
                            className="bg-[#ec4e39] hover:bg-[#d43d2a] text-[#262622] font-bold py-2 px-4 rounded-full transition duration-300"
                        >
                            Logout
                        </button>
                    ) : (
                        <>
                            <Link
                                to="/login"
                                className="text-[#afa18f] hover:text-[#ec4e39] transition duration-300 font-medium"
                            >
                                Login
                            </Link>
                            <Link
                                to="/signup"
                                className="bg-[#ec4e39] hover:bg-[#d43d2a] text-[#262622] font-bold py-2 px-4 rounded-full transition duration-300"
                            >
                                Get Started
                            </Link>
                        </>
                    )}
                </nav>

                <div className="md:hidden">
                    <button
                        onClick={() => setIsMenuOpen(!isMenuOpen)}
                        className="focus:outline-none text-[#ec4e39] hover:text-[#d43d2a] transition duration-300"
                    >
                        {isMenuOpen ? (
                            <FaTimes size={24} />
                        ) : (
                            <FaBars size={24} />
                        )}
                    </button>
                </div>
            </div>

            <nav
                className={`md:hidden bg-[#2C2B28] overflow-hidden transition-all duration-300 ease-in-out ${
                    isMenuOpen ? "max-h-48 opacity-100" : "max-h-0 opacity-0"
                }`}
            >
                <div className="container mx-auto px-4 py-4 flex flex-col space-y-4">
                    {user ? (
                        <button
                            onClick={handleLogout}
                            className="bg-[#ec4e39] hover:bg-[#d43d2a] text-[#262622] font-bold py-2 px-4 rounded-full transition duration-300 w-full"
                        >
                            Logout
                        </button>
                    ) : (
                        <>
                            <Link
                                to="/login"
                                className="bg-transparent hover:bg-[#393937] text-[#afa18f] font-semibold hover:text-[#ec4e39] py-2 px-4 border border-[#ec4e39] hover:border-transparent rounded-full transition duration-300 text-center"
                            >
                                Login
                            </Link>
                            <Link
                                to="/signup"
                                className="bg-[#ec4e39] hover:bg-[#d43d2a] text-[#262622] font-bold py-2 px-4 rounded-full transition duration-300 text-center"
                            >
                                Get Started
                            </Link>
                        </>
                    )}
                </div>
            </nav>
        </header>
    );
}

export default Header;
