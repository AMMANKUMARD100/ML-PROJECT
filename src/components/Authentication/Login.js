import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Form from "./Form";
import "./Form.css";
import Particle from "../Particle";
import { ACCESS_TOKEN } from "../../constant";

const LogIn = (props) => {
  // const [email, setEmail] = useState("");
  // const [password, setPassword] = useState("");
  // const [error, setError] = useState("");
  const navigate = useNavigate();

  // const handleLogin = (e) => {
  //   e.preventDefault();

  //   // Simulate login logic
  //   if (email === "user@example.com" && password === "password") {
  //     localStorage.setItem("userId", 8);
  //     navigate(`/tutor/profile/8`);
  //   } else {
  //     setError("Invalid email or password. Please try again.");
  //   }
  // };

  useEffect(() => {
    if (localStorage.getItem(ACCESS_TOKEN)) {
      navigate("/profile");
    }
  }, []);

  const handleSignup = () => {
    navigate("/signup");
  };

  return (
    <div className="signup-section">
      <Particle />
      <div className="signup-form" style={{ zIndex: "1000" }}>
        {/* Toast "Bread" */}
        <div className="signup-items">
          {/* Title */}
          <h2 className="creatYourAccount">Welcome Back!</h2>
          <p className="startOurPlatform">
            Log in to your account to continue.
          </p>

          {/* Form */}
          <Form
            route="/api/token/"
            method="login"
            setIsLoggedIn={props.setIsLoggedIn}
          />

          {/* Sign Up Redirect */}
          <p className="startOurPlatform">
            Don’t have an account?{" "}
            <button className="loginButton" onClick={handleSignup}>
              Sign Up
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};

export default LogIn;
