import { NavLink } from "react-router-dom";
import "../../Pages/AdminShared/styles.css";

const AdminNav = () => {
  const linkClass = ({ isActive }) =>
    `admin-nav-link ${isActive ? "is-active" : ""}`;

  return (
    <nav className="admin-nav">
      <div className="admin-nav-brand">Admin</div>
      <div className="admin-nav-links">
        <NavLink to="/admin" className={linkClass}>
          Overview
        </NavLink>
        <NavLink to="/admin/orders" className={linkClass}>
          Orders
        </NavLink>
        <NavLink to="/admin/users" className={linkClass}>
          Users
        </NavLink>
        <NavLink to="/admin/products" className={linkClass}>
          Products
        </NavLink>
        <NavLink to="/admin/analytics" className={linkClass}>
          Analytics
        </NavLink>
        <NavLink to="/admin/audit" className={linkClass}>
          Audit Log
        </NavLink>
      </div>
    </nav>
  );
};

export default AdminNav;
