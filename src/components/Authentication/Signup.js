import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Form from "./Form";
import Particle from "../Particle";
import { ACCESS_TOKEN } from "../../constant";

const SignUp = () => {
  // const [username, setUsername] = useState("");
  // const [email, setEmail] = useState("");
  // const [password, setPassword] = useState("");
  // const [confirmPassword, setConfirmPassword] = useState("");
  // const [error, setError] = useState("");
  const navigate = useNavigate();

  // const handleSignUp = (e) => {
  //   e.preventDefault();

  //   // Simulate sign-up logic
  //   if (password !== confirmPassword) {
  //     setError("Passwords do not match. Please try again.");
  //   } else {
  //     localStorage.setItem("userId", 8); // Set some user ID for the session
  //     navigate(`/tutor/profile/8`);
  //   }
  // };

  useEffect(() => {
    if (localStorage.getItem(ACCESS_TOKEN)) {
      navigate("/profile");
    }
  }, []);

  return (
    <div className="signup-section">
      <Particle />
      <div className="signup-form" style={{ zIndex: "1000" }}>
        <div className="signup-items">
          {/* Title */}
          <h2 className="createYourAccount">Create Your Account</h2>
          <p className="startOurPlatform">
            Sign up to start using our platform.
          </p>

          {/* Form */}
          <Form route="/api/user/register/" method="signup" />

          {/* Login Redirect */}
          <p className="username">
            Already have an account?{" "}
            <button className="loginButton" onClick={() => navigate("/login")}>
              Log In
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};

export default SignUp;
