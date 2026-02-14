import { useContext, useState } from "react";
import { useNavigate } from "react-router-dom";
import Layout from "../../Components/Layout";
import { ShoppingCartContext } from "../../Context";
import { updateUserProfile, changeUserPassword } from "../../services/api";

function MyAccount() {
  const context = useContext(ShoppingCartContext);
  const navigate = useNavigate();
  const [isEditing, setIsEditing] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    street: "",
    city: "",
    state: "",
    zipCode: "",
    country: "India",
  });
  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [message, setMessage] = useState({ type: "", text: "" });
  const [loading, setLoading] = useState(false);

  const handleSignOut = () => {
    context.handleSignOut();
    navigate("/sign-in");
  };

  if (!context.isUserAuthenticated) {
    navigate("/sign-in");
    return null;
  }

  if (context.isLoading) {
    return (
      <Layout>
        <div className="animate-pulse p-8">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
          <div className="space-y-4">
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
            <div className="h-4 bg-gray-200 rounded w-2/3"></div>
          </div>
        </div>
      </Layout>
    );
  }

  const handleEditClick = () => {
    setFormData({
      name: context.account?.name || "",
      phone: context.account?.phone || "",
      street: context.account?.address?.street || "",
      city: context.account?.address?.city || "",
      state: context.account?.address?.state || "",
      zipCode: context.account?.address?.zipCode || "",
      country: context.account?.address?.country || "India",
    });
    setIsEditing(true);
    setMessage({ type: "", text: "" });
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setFormData({
      name: "",
      phone: "",
      street: "",
      city: "",
      state: "",
      zipCode: "",
      country: "India",
    });
    setMessage({ type: "", text: "" });
  };

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handlePasswordChange = (e) => {
    setPasswordData({
      ...passwordData,
      [e.target.name]: e.target.value,
    });
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ type: "", text: "" });

    try {
      const token = localStorage.getItem("token");
      const updateData = {
        name: formData.name,
        phone: formData.phone,
        address: {
          street: formData.street,
          city: formData.city,
          state: formData.state,
          zipCode: formData.zipCode,
          country: formData.country,
        },
      };

      const response = await updateUserProfile(token, updateData);
      console.log("Profile update response:", response.data);

      const updatedUser = response.data.user;
      context.setAccount(updatedUser);
      localStorage.setItem("account", JSON.stringify(updatedUser));

      setMessage({ type: "success", text: "Profile updated successfully!" });
      setIsEditing(false);
    } catch (error) {
      console.error("Profile update error:", error);
      setMessage({
        type: "error",
        text: error.response?.data?.message || "Failed to update profile",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ type: "", text: "" });

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setMessage({ type: "error", text: "New passwords do not match" });
      setLoading(false);
      return;
    }

    // Password validation
    const password = passwordData.newPassword;
    if (password.length < 8) {
      setMessage({
        type: "error",
        text: "Password must be at least 8 characters long",
      });
      setLoading(false);
      return;
    }
    if (!/[A-Z]/.test(password)) {
      setMessage({
        type: "error",
        text: "Password must contain at least one uppercase letter",
      });
      setLoading(false);
      return;
    }
    if (!/[a-z]/.test(password)) {
      setMessage({
        type: "error",
        text: "Password must contain at least one lowercase letter",
      });
      setLoading(false);
      return;
    }
    if (!/[0-9]/.test(password)) {
      setMessage({
        type: "error",
        text: "Password must contain at least one number",
      });
      setLoading(false);
      return;
    }
    if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
      setMessage({
        type: "error",
        text: 'Password must contain at least one special character (!@#$%^&*(),.?":{}|<>)',
      });
      setLoading(false);
      return;
    }

    try {
      const token = localStorage.getItem("token");
      await changeUserPassword(
        token,
        passwordData.currentPassword,
        passwordData.newPassword,
      );
      setMessage({ type: "success", text: "Password changed successfully!" });
      setPasswordData({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
      setIsChangingPassword(false);
    } catch (error) {
      setMessage({
        type: "error",
        text: error.response?.data?.message || "Failed to change password",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
      <div className="max-w-2xl mx-auto p-8">
        <h1 className="text-2xl font-bold mb-6">My Account</h1>

        {message.text && (
          <div
            className={`mb-4 p-4 rounded-lg ${message.type === "success" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}
          >
            {message.text}
          </div>
        )}

        <div className="bg-white shadow rounded-lg p-6 mb-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">Profile Information</h2>
            {!isEditing && (
              <button
                onClick={handleEditClick}
                className="text-blue-600 hover:text-blue-800 font-medium"
              >
                Edit Profile
              </button>
            )}
          </div>

          {!isEditing ? (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-600">
                  Name
                </label>
                <p className="mt-1 text-gray-900">
                  {context.account?.name || "Not provided"}
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-600">
                  Email
                </label>
                <p className="mt-1 text-gray-900">
                  {context.account?.email || "Not provided"}
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-600">
                  Phone
                </label>
                <p className="mt-1 text-gray-900">
                  {context.account?.phone || "Not provided"}
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-600">
                  Address
                </label>
                <p className="mt-1 text-gray-900">
                  {context.account?.address?.street ? (
                    <>
                      {context.account.address.street}
                      <br />
                      {context.account.address.city},{" "}
                      {context.account.address.state}{" "}
                      {context.account.address.zipCode}
                      <br />
                      {context.account.address.country}
                    </>
                  ) : (
                    "Not provided"
                  )}
                </p>
              </div>
            </div>
          ) : (
            <form onSubmit={handleUpdateProfile} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Name *
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                  className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Phone
                </label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Street Address
                </label>
                <input
                  type="text"
                  name="street"
                  value={formData.street}
                  onChange={handleInputChange}
                  className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    City
                  </label>
                  <input
                    type="text"
                    name="city"
                    value={formData.city}
                    onChange={handleInputChange}
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    State
                  </label>
                  <input
                    type="text"
                    name="state"
                    value={formData.state}
                    onChange={handleInputChange}
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    ZIP Code
                  </label>
                  <input
                    type="text"
                    name="zipCode"
                    value={formData.zipCode}
                    onChange={handleInputChange}
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Country
                  </label>
                  <input
                    type="text"
                    name="country"
                    value={formData.country}
                    onChange={handleInputChange}
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
              <div className="flex gap-4">
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 bg-black text-white rounded-lg py-2 px-4 hover:bg-gray-800 transition-colors disabled:bg-gray-400"
                >
                  {loading ? "Saving..." : "Save Changes"}
                </button>
                <button
                  type="button"
                  onClick={handleCancelEdit}
                  className="flex-1 bg-gray-200 text-gray-700 rounded-lg py-2 px-4 hover:bg-gray-300 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </form>
          )}
        </div>

        <div className="bg-white shadow rounded-lg p-6 mb-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">Security</h2>
            {!isChangingPassword && (
              <button
                onClick={() => {
                  setIsChangingPassword(true);
                  setMessage({ type: "", text: "" });
                }}
                className="text-blue-600 hover:text-blue-800 font-medium"
              >
                Change Password
              </button>
            )}
          </div>

          {isChangingPassword ? (
            <form onSubmit={handleChangePassword} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Current Password *
                </label>
                <input
                  type="password"
                  name="currentPassword"
                  value={passwordData.currentPassword}
                  onChange={handlePasswordChange}
                  required
                  className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  New Password *
                </label>
                <input
                  type="password"
                  name="newPassword"
                  value={passwordData.newPassword}
                  onChange={handlePasswordChange}
                  required
                  minLength={8}
                  className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <p className="mt-2 text-xs text-gray-600">
                  Password must contain:
                  <br />• At least 8 characters
                  <br />• One uppercase letter (A-Z)
                  <br />• One lowercase letter (a-z)
                  <br />• One number (0-9)
                  <br />• One special character
                  (!@#$%^&*(),.?":&#123;&#125;|&lt;&gt;)
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Confirm New Password *
                </label>
                <input
                  type="password"
                  name="confirmPassword"
                  value={passwordData.confirmPassword}
                  onChange={handlePasswordChange}
                  required
                  className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div className="flex gap-4">
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 bg-black text-white rounded-lg py-2 px-4 hover:bg-gray-800 transition-colors disabled:bg-gray-400"
                >
                  {loading ? "Changing..." : "Change Password"}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setIsChangingPassword(false);
                    setPasswordData({
                      currentPassword: "",
                      newPassword: "",
                      confirmPassword: "",
                    });
                    setMessage({ type: "", text: "" });
                  }}
                  className="flex-1 bg-gray-200 text-gray-700 rounded-lg py-2 px-4 hover:bg-gray-300 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </form>
          ) : (
            <p className="text-gray-600">••••••••</p>
          )}
        </div>

        <button
          onClick={handleSignOut}
          className="w-full bg-black text-white rounded-lg py-2 px-4 hover:bg-gray-800 transition-colors"
        >
          Sign Out
        </button>
      </div>
    </Layout>
  );
}

export default MyAccount;
