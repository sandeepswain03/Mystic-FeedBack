import { useContext } from "react";
import { useNavigate } from "react-router-dom";
import UserContext from "../contexts/userContext";
import PropTypes from "prop-types";

function AuthLayout({ children, authentication }) {
  const { user, isLoading } = useContext(UserContext);
  const navigate = useNavigate();

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (authentication && !user) {
    navigate("/login");
    return null;
  } else if (!authentication && user) {
    navigate("/dashboard");
    return null;
  }

  return children;
}

AuthLayout.propTypes = {
  children: PropTypes.node.isRequired,
  authentication: PropTypes.bool.isRequired,
};

export default AuthLayout;
