import React, { useState } from "react";
import api from "../../api";
import { useNavigate } from "react-router-dom";
import { ACCESS_TOKEN, REFRESH_TOKEN } from "../../constant";

const AccountDeletion = (props) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleDeleteAccount = async () => {
    const confirmation = window.confirm(
      "Are you sure you want to delete your account? This action cannot be undone."
    );

    if (!confirmation) return;

    setIsLoading(true);
    try {
      await api.delete("/api/user/delete/");
      alert("Account deleted successfully.");
      // Clear tokens and redirect
      localStorage.removeItem(ACCESS_TOKEN);
      localStorage.removeItem(REFRESH_TOKEN);
      localStorage.removeItem("username");
      navigate("/"); // Redirect to home or another appropriate route
    } catch (error) {
      setError(
        error.response?.data?.message || "Failed to delete your account. Please try again."
      );
    } finally {
      // props.setIsAuthorized(false);
      setIsLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-6">
      <h2 className="text-2xl font-bold text-red-700 mb-4">Delete Your Account</h2>
      <p className="text-gray-700 mb-6">
        Deleting your account is permanent. This action cannot be undone.
      </p>
      {error && <p className="text-red-500 mb-4">{error}</p>}
      <button
        onClick={handleDeleteAccount}
        className="px-4 py-2 bg-red-600 text-white rounded shadow hover:bg-red-700"
        disabled={isLoading}
      >
        {isLoading ? "Processing..." : "Delete Account"}
      </button>
    </div>
  );
};

export default AccountDeletion;
