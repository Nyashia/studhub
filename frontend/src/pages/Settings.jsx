import React, { useEffect, useRef, useState } from "react";
import DashboardLayout from "../components/layout/DashboardLayout";
import styles from "../styles/settings.module.css";

function Settings() {
  // ==========================================
  // USER STATE
  // ==========================================

  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [message, setMessage] = useState({
    text: "",
    type: ""
  });

  const [formData, setFormData] = useState({
    name: "",
    email: ""
  });

  const [profilePicture, setProfilePicture] = useState("");
  const fileInputRef = useRef(null);

  // ==========================================
  // PASSWORD STATE
  // ==========================================

  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: ""
  });

  const [passwordMessage, setPasswordMessage] = useState({
    text: "",
    type: ""
  });

  const [passwordLoading, setPasswordLoading] = useState(false);

  const token = localStorage.getItem("token");

  // ==========================================
  // LOAD USER
  // ==========================================

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await fetch("http://localhost:5000/users/me", {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });

        const data = await response.json();

        if (response.ok) {
          setUser(data);

          setFormData({
            name: data.name || "",
            email: data.email || ""
          });

          setProfilePicture(data.profilePicture || "");
        } else {
          setMessage({
            text: data.message || "Failed to load profile.",
            type: "error"
          });
        }
      } catch (error) {
        setMessage({
          text: "Failed to load profile.",
          type: "error"
        });
      } finally {
        setLoading(false);
      }
    };

    if (token) {
      fetchUser();
    } else {
      setMessage({
        text: "You must be logged in.",
        type: "error"
      });

      setLoading(false);
    }
  }, [token]);

  // ==========================================
  // PROFILE FORM HANDLING
  // ==========================================

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((previousData) => ({
      ...previousData,
      [name]: value
    }));
  };

  // ==========================================
  // UPDATE PROFILE
  // ==========================================

  const handleSubmit = async (e) => {
    e.preventDefault();

    setSaving(true);

    setMessage({
      text: "",
      type: ""
    });

    try {
      const response = await fetch("http://localhost:5000/users/me", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      });

      const data = await response.json();

      if (response.ok) {
        setUser(data);

        setFormData({
          name: data.name || "",
          email: data.email || ""
        });

        setMessage({
          text: "Profile updated successfully!",
          type: "success"
        });

        localStorage.setItem("userName", data.name);
      } else {
        setMessage({
          text: data.message || "Failed to update profile.",
          type: "error"
        });
      }
    } catch (error) {
      setMessage({
        text: "Something went wrong.",
        type: "error"
      });
    } finally {
      setSaving(false);
    }
  };

  // ==========================================
  // PROFILE PICTURE
  // ==========================================

  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0];

    if (!file) {
      return;
    }

    const imageFormData = new FormData();
    imageFormData.append("image", file);

    try {
      const response = await fetch(
        "http://localhost:5000/api/upload/profile-picture",
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`
          },
          body: imageFormData
        }
      );

      const data = await response.json();

      if (response.ok) {
        setProfilePicture(data.profilePicture);

        setMessage({
          text: "Profile picture updated!",
          type: "success"
        });
      } else {
        setMessage({
          text: data.error || "Upload failed.",
          type: "error"
        });
      }
    } catch (error) {
      setMessage({
        text: "Upload failed.",
        type: "error"
      });
    }

    // Allow the same file to be selected again.
    e.target.value = "";
  };

  const handleDeletePicture = async () => {
    const confirmed = window.confirm(
      "Are you sure you want to remove your profile picture?"
    );

    if (!confirmed) {
      return;
    }

    try {
      const response = await fetch(
        "http://localhost:5000/api/upload/profile-picture",
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      const data = await response.json();

      if (response.ok) {
        setProfilePicture("");

        setMessage({
          text: "Profile picture removed.",
          type: "success"
        });
      } else {
        setMessage({
          text: data.error || "Failed to remove profile picture.",
          type: "error"
        });
      }
    } catch (error) {
      setMessage({
        text: "Failed to remove profile picture.",
        type: "error"
      });
    }
  };

  // ==========================================
  // PASSWORD FORM HANDLING
  // ==========================================

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;

    setPasswordData((previousData) => ({
      ...previousData,
      [name]: value
    }));
  };

  // ==========================================
  // CHANGE PASSWORD
  // ==========================================

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();

    setPasswordMessage({
      text: "",
      type: ""
    });

    // Password must be at least 8 characters.
    if (passwordData.newPassword.length < 8) {
      setPasswordMessage({
        text: "Password must be at least 8 characters.",
        type: "error"
      });

      return;
    }

    // Passwords must match.
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setPasswordMessage({
        text: "Passwords do not match.",
        type: "error"
      });

      return;
    }

    setPasswordLoading(true);

    try {
      const response = await fetch(
        "http://localhost:5000/users/change-password",
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`
          },
          body: JSON.stringify({
            currentPassword: passwordData.currentPassword,
            newPassword: passwordData.newPassword
          })
        }
      );

      const data = await response.json();

      if (response.ok) {
        setPasswordMessage({
          text: "Password updated successfully!",
          type: "success"
        });

        setPasswordData({
          currentPassword: "",
          newPassword: "",
          confirmPassword: ""
        });
      } else {
        setPasswordMessage({
          text: data.message || "Failed to update password.",
          type: "error"
        });
      }
    } catch (error) {
      setPasswordMessage({
        text: "Something went wrong.",
        type: "error"
      });
    } finally {
      setPasswordLoading(false);
    }
  };

  // ==========================================
  // LOADING
  // ==========================================

  if (loading) {
    return (
      <DashboardLayout>
        <div className={styles.loading}>
          Loading profile...
        </div>
      </DashboardLayout>
    );
  }

  // ==========================================
  // UI
  // ==========================================

  return (
    <DashboardLayout>
      <div className={styles.container}>
        {/* Header */}
        <div className={styles.header}>
          <h1>⚙️ Settings</h1>
          <p>Manage your profile and preferences</p>
        </div>

        <div className={styles.card}>
          {/* Profile Section */}
          <div className={styles.profileSection}>
            <div className={styles.avatarContainer}>
              {profilePicture ? (
                <img
                  src={profilePicture}
                  alt="Profile"
                  className={styles.avatar}
                />
              ) : (
                <div className={styles.avatarPlaceholder}>
                  {user?.name?.[0]?.toUpperCase() || "?"}
                </div>
              )}
            </div>

            <div className={styles.avatarActions}>
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className={styles.uploadBtn}
              >
                Upload Picture
              </button>

              {profilePicture && (
                <button
                  type="button"
                  onClick={handleDeletePicture}
                  className={styles.removeBtn}
                >
                  Remove
                </button>
              )}

              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileUpload}
                accept="image/*"
                style={{ display: "none" }}
              />
            </div>
          </div>

          {/* Profile Message */}
          {message.text && (
            <div
              className={`${styles.message} ${styles[message.type]}`}
            >
              {message.text}
            </div>
          )}

          {/* Profile Form */}
          <form onSubmit={handleSubmit} className={styles.form}>
            <div className={styles.formGroup}>
              <label htmlFor="name">Full Name</label>

              <input
                id="name"
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
              />
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="email">Email Address</label>

              <input
                id="email"
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
              />
            </div>

            <button
              type="submit"
              disabled={saving}
              className={styles.saveBtn}
            >
              {saving ? "Saving..." : "Save Changes"}
            </button>
          </form>

          {/* Divider */}
          <div className={styles.divider}></div>

          {/* Change Password Section */}
          <h3 className={styles.passwordSectionTitle}>
            Change Password
          </h3>

          {/* Password Message */}
          {passwordMessage.text && (
            <div
              className={`${styles.message} ${styles[passwordMessage.type]}`}
            >
              {passwordMessage.text}
            </div>
          )}

          {/* Password Form */}
          <form
            onSubmit={handlePasswordSubmit}
            className={styles.form}
          >
            <div className={styles.formGroup}>
              <label htmlFor="currentPassword">
                Current Password
              </label>

              <input
                id="currentPassword"
                type="password"
                name="currentPassword"
                placeholder="Enter current password"
                value={passwordData.currentPassword}
                onChange={handlePasswordChange}
                required
              />
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="newPassword">
                New Password
              </label>

              <input
                id="newPassword"
                type="password"
                name="newPassword"
                placeholder="Enter new password (min 8 characters)"
                value={passwordData.newPassword}
                onChange={handlePasswordChange}
                minLength={8}
                required
              />
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="confirmPassword">
                Confirm New Password
              </label>

              <input
                id="confirmPassword"
                type="password"
                name="confirmPassword"
                placeholder="Confirm new password"
                value={passwordData.confirmPassword}
                onChange={handlePasswordChange}
                minLength={8}
                required
              />
            </div>

            <button
              type="submit"
              disabled={passwordLoading}
              className={styles.saveBtn}
            >
              {passwordLoading
                ? "Updating..."
                : "Update Password"}
            </button>
          </form>
        </div>
      </div>
    </DashboardLayout>
  );
}

export default Settings;