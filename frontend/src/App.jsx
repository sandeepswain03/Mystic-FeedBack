import { Routes, Route } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import AuthLayout from "./components/Authlayout";
import Layout from "./Layout";
import Home from "./components/Home/Home";
import Login from "./components/Auth/Login";
import Signup from "./components/Auth/Signup";
import Dashboard from "./components/Dashboard/Dashboard";
import SendMessage from "./pages/SendMessage";

function App() {
  return (
    <>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route
            path=""
            element={
              <AuthLayout authentication={false}>
                <Home />
              </AuthLayout>
            }
          />
          <Route
            path="login"
            element={
              <AuthLayout authentication={false}>
                <Login />
              </AuthLayout>
            }
          />
          <Route
            path="signup"
            element={
              <AuthLayout authentication={false}>
                <Signup />
              </AuthLayout>
            }
          />
          <Route
            path="dashboard"
            element={
              <AuthLayout authentication={true}>
                <Dashboard />
              </AuthLayout>
            }
          />
        </Route>
        <Route path="profile/:questionId" element={<SendMessage />} />
      </Routes>
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 3000,
          style: {
            background: "#333",
            color: "#fff",
            borderRadius: "10px",
            padding: "16px",
          },
          success: {
            iconTheme: {
              primary: "#4CAF50",
              secondary: "#fff",
            },
          },
          error: {
            iconTheme: {
              primary: "#F44336",
              secondary: "#fff",
            },
          },
        }}
      />
    </>
  );
}

export default App;
