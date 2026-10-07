import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ACCESS_TOKEN, REFRESH_TOKEN } from "../../constant";

const Logout = (props) => {
  const navigate = useNavigate();

  useEffect(() => {
    localStorage.removeItem(ACCESS_TOKEN);
    localStorage.removeItem(REFRESH_TOKEN);
    localStorage.removeItem("username");
    props.setIsLoggedIn(false)
    navigate("/"); // Redirect to the login page or home page
  }, [navigate]);

  return null; // No UI is needed
};

export default Logout;
