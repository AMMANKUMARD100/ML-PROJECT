import { useState, useEffect } from "react";
import api from "../../api"; // Your Axios instance
import { ACCESS_TOKEN, REFRESH_TOKEN } from "../../constant";
import "./Profile.css"; // CSS file for styles
import Particle from "../Particle";
import DetectionDocuments from "../SaveResults/UserResultDocs";

const Profile = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const res = await api.get("/api/user/profile/");
        setUser(res.data);
      } catch (error) {
        setError("Failed to fetch user profile.");
      } finally {
        setLoading(false);
      }
    };
    fetchUserProfile();
  }, []);

  const handleLogout = () => {
    localStorage.removeItem(ACCESS_TOKEN);
    localStorage.removeItem(REFRESH_TOKEN);
    localStorage.removeItem("username");
    window.location.href = "/"; // Simple redirect
  };

  if (loading) {
    return (
      <div className="loading-screen">
        <div className="loading-text">Loading...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="error-screen">
        <div className="error-text">{error}</div>
      </div>
    );
  }

  return (
    <div className="profile-container">
      <Particle />
      <div className="profile-card" style={{ zIndex: "1000" }}>
        <h1 className="profile-title">User Profile</h1>
        <div className="profile-details">
          <p>
            <span className="label">User ID:</span> {user?.id}
          </p>
          <p>
            <span className="label">Username:</span> {user?.username}
          </p>
          <p>
            <span className="label">Email:</span> {user?.email}
          </p>
        </div>
        <button className="logout-button" onClick={handleLogout}>
          Log out
        </button>
      </div>
      <DetectionDocuments source="profile" />
    </div>
  );
};

export default Profile;
