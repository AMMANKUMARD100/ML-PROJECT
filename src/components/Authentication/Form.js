import { useState } from "react";
import api from "../../api";
import { useNavigate } from "react-router-dom";
import { ACCESS_TOKEN, REFRESH_TOKEN } from "../../constant";
import "./Form.css";
function Form({ route, method, setIsLoggedIn, isLoggedIn }) {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const name = method == "login" ? "Log In" : "Sign Up";

  const handleSubmit = async (e) => {
    setLoading(true);
    e.preventDefault();

    if (method === "signup" && password !== confirmPassword) {
      setError("Passwords do not match.");
      setLoading(false);
      return;
    }

    try {
      const res = await api.post(route, { username, password, email });
      if (method === "login") {
        localStorage.setItem(ACCESS_TOKEN, res.data.access);
        localStorage.setItem(REFRESH_TOKEN, res.data.refresh);
        localStorage.setItem("username", username);
        setIsLoggedIn(true);
        alert("Successfully Logged In!");
        // setIsAuthorized(true);
        navigate("/profile");
      } else {
        alert("Successfully Signed Up!");
        navigate("/login");
      }
    } catch (error) {
      // alert(error);
      setError(
        error.response?.data?.email?.[0] ||
          "An error occurred. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      {/* Username Input */}
      <div>
        <label htmlFor="username">Username</label>
        <input
          type="username"
          id="username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          placeholder="e.g., Toast Dough"
          required
        />
      </div>

      {/* Email Input */}
      {method === "signup" ? (
        <div>
          <label htmlFor="email">Email</label>
          <input
            type="email"
            id="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="e.g., yourname@example.com"
            required
          />
        </div>
      ) : null}

      {/* Password Input */}
      <div>
        <label htmlFor="password">Password</label>
        <input
          type="password"
          id="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Enter your password"
          required
        />
      </div>

      {/* Confirm Password Input */}
      {method === "signup" ? (
        <div>
          <label htmlFor="confirmPassword">Confirm Password</label>
          <input
            type="password"
            id="confirmPassword"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder="Confirm your password"
            required
          />
        </div>
      ) : null}

      {/* Error Message */}
      {error && <p>{error}</p>}

      {/* Submit Button */}
      <button className="submitButton" type="submit">
        {name}
      </button>
    </form>
  );
}

export default Form;
