import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { login } from "../services/api"; // Ensure this path is correct
import "../styles.css";

function Login({ setUser }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");

    try {
      const response = await login(username, password);
      const { access_token, user } = response.data;

      // Save token and user in localStorage
      localStorage.setItem("token", access_token);
      localStorage.setItem("user", JSON.stringify(user));

      setUser(user);

      // Redirect based on role
      switch (user.role) {
        case "citizen":
          navigate("/citizen");
          break;
        case "official":
          navigate("/official");
          break;
        case "distributor":
          navigate("/distributor");
          break;
            case "admin":
          navigate("/AdminDashboard");
          break;
        default:
          navigate("/login");
      }
    } catch (err) {
      console.error(err);
      const apiError = err.response?.data?.detail;

      if (Array.isArray(apiError)) {
        setError(apiError.map((e) => e.msg).join(", "));
      } else if (typeof apiError === "string") {
        setError(apiError);
      } else {
        setError("Login failed. Check your credentials.");
      }
    }
  };

  return (
    <div className="login-container">
      <div className="login-box">
        <h2>Digital Tracking Solution</h2>
        {error && <div className="error-message">{error}</div>}

        <form onSubmit={handleLogin}>
          <div className="form-group">
            <label htmlFor="username" className="required">
              Username
            </label>
            <input
              id="username"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Enter your username"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="password" className="required">
              Password
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              required
            />
          </div>

          <button type="submit" className="button">
            Login
          </button>
        </form>
      </div>
    </div>
  );
}

export default Login;
