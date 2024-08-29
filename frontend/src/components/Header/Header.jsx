import { useState, useContext } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FaBars, FaTimes } from "react-icons/fa";
import UserContext from "../../contexts/userContext";
import axiosInstance from "../../axiosInstance";
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
    <header className="bg-gray-900 text-white shadow-lg">
      <div className="container mx-auto px-4 py-6 flex justify-between items-center">
        <div className="flex items-center">
          <Link to="/" className="text-2xl font-bold text-blue-400">
            Mystic Feedback
          </Link>
        </div>

        <div className="hidden md:flex items-center justify-center flex-grow">
          {user && (
            <span className="text-lg font-semibold bg-gradient-to-r from-blue-400 to-purple-500 text-transparent bg-clip-text">
              Welcome, {user.username}
            </span>
          )}
        </div>

        <nav className="hidden md:flex items-center space-x-6">
          {user ? (
            <Link
              to="/"
              onClick={handleLogout}
              className="relative overflow-hidden bg-gradient-to-r from-blue-500 to-purple-600 px-6 py-2 rounded-full text-white font-semibold transition duration-300 shadow-md hover:shadow-xl transform hover:scale-105 group"
            >
              <span className="relative z-10">Logout</span>
              <span className="absolute inset-0 bg-gradient-to-r from-blue-600 to-purple-700 opacity-0 group-hover:opacity-100 transition-opacity duration-300 ease-in-out"></span>
            </Link>
          ) : (
            <>
              <Link
                to="/login"
                className="relative text-gray-300 hover:text-blue-400 transition duration-300 font-medium group"
              >
                Login
                <span className="absolute inset-x-0 bottom-0 h-0.5 bg-blue-400 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 ease-in-out"></span>
              </Link>
              <Link
                to="/signup"
                className="relative overflow-hidden bg-gradient-to-r from-blue-500 to-purple-600 px-6 py-2 rounded-full text-white font-semibold transition duration-300 shadow-md hover:shadow-xl transform hover:scale-105 group"
              >
                <span className="relative z-10">Get Started</span>
                <span className="absolute inset-0 bg-gradient-to-r from-blue-600 to-purple-700 opacity-0 group-hover:opacity-100 transition-opacity duration-300 ease-in-out"></span>
              </Link>
            </>
          )}
        </nav>

        <div className="md:hidden">
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="focus:outline-none text-blue-400 hover:text-blue-300 transition duration-300"
          >
            {isMenuOpen ? <FaTimes size={24} /> : <FaBars size={24} />}
          </button>
        </div>
      </div>

      <nav
        className={`md:hidden bg-gray-900 overflow-hidden transition-all duration-300 ease-in-out ${
          isMenuOpen ? "max-h-48 opacity-100" : "max-h-0 opacity-0"
        }`}
      >
        <div className="container mx-auto px-4 py-4 flex flex-col space-y-4">
          {user ? (
            <button
              onClick={handleLogout}
              className="bg-transparent hover:bg-gray-700 text-white font-semibold hover:text-blue-400 py-3 px-6 border border-blue-400 hover:border-transparent rounded-full transition duration-300 flex items-center justify-center"
            >
              <span className="mr-2">Logout</span>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M3 3a1 1 0 00-1 1v12a1 1 0 102 0V4a1 1 0 00-1-1zm10.293 9.293a1 1 0 001.414 1.414l3-3a1 1 0 000-1.414l-3-3a1 1 0 10-1.414 1.414L14.586 9H7a1 1 0 100 2h7.586l-1.293 1.293z"
                  clipRule="evenodd"
                />
              </svg>
            </button>
          ) : (
            <>
              <Link
                to="/login"
                className="bg-transparent hover:bg-gray-700 text-white font-semibold hover:text-blue-400 py-3 px-6 border border-blue-400 hover:border-transparent rounded-full transition duration-300 flex items-center justify-center"
              >
                <span className="mr-2">Login</span>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M3 3a1 1 0 011 1v12a1 1 0 11-2 0V4a1 1 0 011-1zm7.707 3.293a1 1 0 010 1.414L9.414 9H17a1 1 0 110 2H9.414l1.293 1.293a1 1 0 01-1.414 1.414l-3-3a1 1 0 010-1.414l3-3a1 1 0 011.414 0z"
                    clipRule="evenodd"
                  />
                </svg>
              </Link>
              <Link
                to="/signup"
                className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-bold py-3 px-6 rounded-full shadow-lg hover:shadow-xl transition duration-300 transform hover:scale-105 flex items-center justify-center"
              >
                <span className="mr-2">Get Started</span>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z"
                    clipRule="evenodd"
                  />
                </svg>
              </Link>
            </>
          )}
        </div>
      </nav>
    </header>
  );
}

export default Header;
