import { useEffect, useMemo, useState } from "react";
import Layout from "../../Components/Layout";
import AdminNav from "../../Components/AdminNav";
import { getAdminUsers, updateAdminUserRole } from "../../services/api";
import "../AdminShared/styles.css";

const AdminUsers = () => {
  const [users, setUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [updatingUserId, setUpdatingUserId] = useState("");

  useEffect(() => {
    const loadUsers = async () => {
      try {
        setIsLoading(true);
        setError("");
        const token = localStorage.getItem("token");
        const response = await getAdminUsers(token);
        setUsers(response.data || []);
      } catch (err) {
        setError("Unable to load users.");
      } finally {
        setIsLoading(false);
      }
    };

    loadUsers();
  }, []);

  const handleRoleChange = async (userId, role) => {
    try {
      const currentUser = users.find((item) => item._id === userId);
      const previousRole = currentUser?.role || "user";
      if (previousRole === role) {
        return;
      }

      const confirmed = window.confirm(
        `Change role from ${previousRole} to ${role}?`,
      );
      if (!confirmed) {
        return;
      }

      setUpdatingUserId(userId);
      setError("");
      const token = localStorage.getItem("token");
      const response = await updateAdminUserRole(token, userId, role);
      const updatedUser = response.data;
      setUsers((prev) =>
        prev.map((user) => (user._id === userId ? updatedUser : user)),
      );
    } catch (err) {
      setError("Unable to update user role.");
    } finally {
      setUpdatingUserId("");
    }
  };

  const filteredUsers = useMemo(() => {
    if (!search) return users;
    const term = search.toLowerCase();
    return users.filter((user) => {
      return (
        user.name?.toLowerCase().includes(term) ||
        user.email?.toLowerCase().includes(term) ||
        user.role?.toLowerCase().includes(term) ||
        user._id?.toLowerCase().includes(term)
      );
    });
  }, [users, search]);

  return (
    <Layout>
      <div className="admin-page">
        <AdminNav />
        <header className="admin-page-header">
          <div>
            <h1 className="admin-page-title">Users</h1>
            <p className="admin-page-subtitle">
              Browse accounts and role access.
            </p>
          </div>
          <input
            className="admin-search"
            placeholder="Search by name, email, role"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
          />
        </header>

        {isLoading ? (
          <div className="admin-loading-state">Loading users...</div>
        ) : (
          <>
            {error && <div className="admin-error-state">{error}</div>}
            {filteredUsers.length ? (
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>User</th>
                    <th>Email</th>
                    <th>Role</th>
                    <th>Id</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredUsers.map((user) => (
                    <tr key={user._id}>
                      <td>
                        <div>{user.name}</div>
                      </td>
                      <td>
                        <div>{user.email}</div>
                      </td>
                      <td>
                        <select
                          className="admin-select"
                          value={user.role || "user"}
                          disabled={updatingUserId === user._id}
                          onChange={(event) =>
                            handleRoleChange(user._id, event.target.value)
                          }
                        >
                          <option value="user">User</option>
                          <option value="admin">Admin</option>
                        </select>
                      </td>
                      <td>
                        <div>{user._id?.slice(-6)}</div>
                        <div className="admin-row-muted">{user._id}</div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <div className="admin-empty-state">No users found.</div>
            )}
          </>
        )}
      </div>
    </Layout>
  );
};

export default AdminUsers;
