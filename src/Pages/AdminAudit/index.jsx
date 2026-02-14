import { useEffect, useMemo, useState } from "react";
import Layout from "../../Components/Layout";
import AdminNav from "../../Components/AdminNav";
import {
  getAdminAuditLogs,
  getEmailLogs,
  retryEmailLog,
} from "../../services/api";
import "../AdminShared/styles.css";

const AdminAudit = () => {
  const [logs, setLogs] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [emailLogs, setEmailLogs] = useState([]);
  const [isEmailLoading, setIsEmailLoading] = useState(true);
  const [emailError, setEmailError] = useState("");
  const [emailSearch, setEmailSearch] = useState("");
  const [activeTab, setActiveTab] = useState("audit");

  useEffect(() => {
    loadLogs();
    loadEmailLogs();
  }, []);

  const loadLogs = async () => {
    try {
      setIsLoading(true);
      setError("");
      const token = localStorage.getItem("token");
      const response = await getAdminAuditLogs(token, 100);
      setLogs(response.data || []);
    } catch (err) {
      setError("Unable to load audit logs.");
    } finally {
      setIsLoading(false);
    }
  };

  const loadEmailLogs = async () => {
    try {
      setIsEmailLoading(true);
      setEmailError("");
      const token = localStorage.getItem("token");
      const response = await getEmailLogs(token, 100);
      setEmailLogs(response.data || []);
    } catch (err) {
      setEmailError("Unable to load email logs.");
    } finally {
      setIsEmailLoading(false);
    }
  };

  const filteredLogs = useMemo(() => {
    if (!search) return logs;
    const term = search.toLowerCase();
    return logs.filter((log) => {
      const actor = `${log.actor?.name || ""} ${log.actor?.email || ""}`;
      const meta = JSON.stringify(log.meta || {});
      return (
        log.action?.toLowerCase().includes(term) ||
        log.targetType?.toLowerCase().includes(term) ||
        log.targetId?.toLowerCase().includes(term) ||
        actor.toLowerCase().includes(term) ||
        meta.toLowerCase().includes(term)
      );
    });
  }, [logs, search]);

  const filteredEmailLogs = useMemo(() => {
    if (!emailSearch) return emailLogs;
    const term = emailSearch.toLowerCase();
    return emailLogs.filter((log) => {
      return (
        log.to?.toLowerCase().includes(term) ||
        log.subject?.toLowerCase().includes(term) ||
        log.status?.toLowerCase().includes(term) ||
        log.type?.toLowerCase().includes(term) ||
        log.error?.toLowerCase().includes(term)
      );
    });
  }, [emailLogs, emailSearch]);

  const handleRetryEmail = async (logId) => {
    try {
      setEmailError("");
      const token = localStorage.getItem("token");
      await retryEmailLog(token, logId);
      await loadEmailLogs();
    } catch (err) {
      setEmailError("Unable to retry email.");
    }
  };

  return (
    <Layout>
      <div className="admin-page">
        <AdminNav />
        <header className="admin-page-header">
          <div>
            <h1 className="admin-page-title">Audit Log</h1>
            <p className="admin-page-subtitle">
              Track admin actions across orders and users.
            </p>
          </div>
          <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
            <div style={{ display: "flex", gap: "8px" }}>
              <button
                onClick={() => setActiveTab("audit")}
                style={{
                  padding: "8px 12px",
                  borderRadius: "8px",
                  border: "1px solid #e2e8f0",
                  background: activeTab === "audit" ? "#0f172a" : "#fff",
                  color: activeTab === "audit" ? "#fff" : "#0f172a",
                  fontWeight: "600",
                  cursor: "pointer",
                }}
              >
                Audit
              </button>
              <button
                onClick={() => setActiveTab("email")}
                style={{
                  padding: "8px 12px",
                  borderRadius: "8px",
                  border: "1px solid #e2e8f0",
                  background: activeTab === "email" ? "#0f172a" : "#fff",
                  color: activeTab === "email" ? "#fff" : "#0f172a",
                  fontWeight: "600",
                  cursor: "pointer",
                }}
              >
                Email Logs
              </button>
            </div>
            <input
              className="admin-search"
              placeholder={
                activeTab === "audit"
                  ? "Search by action, actor, target"
                  : "Search by to, subject, status"
              }
              value={activeTab === "audit" ? search : emailSearch}
              onChange={(event) =>
                activeTab === "audit"
                  ? setSearch(event.target.value)
                  : setEmailSearch(event.target.value)
              }
            />
          </div>
        </header>

        {activeTab === "audit" ? (
          isLoading ? (
            <div className="admin-loading-state">Loading audit logs...</div>
          ) : (
            <>
              {error && <div className="admin-error-state">{error}</div>}
              {filteredLogs.length ? (
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>Action</th>
                      <th>Actor</th>
                      <th>Target</th>
                      <th>Meta</th>
                      <th>Time</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredLogs.map((log) => (
                      <tr key={log._id}>
                        <td>
                          <div>{log.action}</div>
                        </td>
                        <td>
                          <div>{log.actor?.name || "Admin"}</div>
                          <div className="admin-row-muted">
                            {log.actor?.email || "-"}
                          </div>
                        </td>
                        <td>
                          <div>{log.targetType}</div>
                          <div className="admin-row-muted">{log.targetId}</div>
                        </td>
                        <td>
                          <div
                            className="admin-row-muted"
                            style={{ fontSize: "11px" }}
                          >
                            {JSON.stringify(log.meta || {})}
                          </div>
                        </td>
                        <td>
                          <div>
                            {new Date(log.createdAt).toLocaleString("en-IN")}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <div className="admin-empty-state">No audit entries found.</div>
              )}
            </>
          )
        ) : isEmailLoading ? (
          <div className="admin-loading-state">Loading email logs...</div>
        ) : (
          <>
            {emailError && (
              <div className="admin-error-state">{emailError}</div>
            )}
            {filteredEmailLogs.length ? (
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Recipient</th>
                    <th>Subject</th>
                    <th>Status</th>
                    <th>Type</th>
                    <th>Error</th>
                    <th>Time</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredEmailLogs.map((log) => (
                    <tr key={log._id}>
                      <td>
                        <div>{log.to}</div>
                      </td>
                      <td>
                        <div>{log.subject}</div>
                      </td>
                      <td>
                        <div
                          style={{
                            display: "inline-block",
                            padding: "4px 10px",
                            borderRadius: "999px",
                            fontSize: "12px",
                            fontWeight: "600",
                            background:
                              log.status === "success"
                                ? "#dcfce7"
                                : log.status === "failed"
                                  ? "#fee2e2"
                                  : "#e2e8f0",
                            color:
                              log.status === "success"
                                ? "#16a34a"
                                : log.status === "failed"
                                  ? "#dc2626"
                                  : "#0f172a",
                          }}
                        >
                          {log.status}
                        </div>
                      </td>
                      <td>
                        <div>{log.type || "-"}</div>
                      </td>
                      <td>
                        <div
                          className="admin-row-muted"
                          style={{ fontSize: "11px" }}
                        >
                          {log.error || "-"}
                        </div>
                      </td>
                      <td>
                        <div>
                          {new Date(log.createdAt).toLocaleString("en-IN")}
                        </div>
                      </td>
                      <td>
                        <button
                          onClick={() => handleRetryEmail(log._id)}
                          disabled={log.status === "success"}
                          style={{
                            padding: "6px 12px",
                            borderRadius: "6px",
                            border: "none",
                            background:
                              log.status === "success" ? "#e2e8f0" : "#0f172a",
                            color:
                              log.status === "success" ? "#64748b" : "#fff",
                            cursor:
                              log.status === "success"
                                ? "not-allowed"
                                : "pointer",
                            fontSize: "12px",
                            fontWeight: "600",
                          }}
                        >
                          Retry
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <div className="admin-empty-state">No email logs found.</div>
            )}
          </>
        )}
      </div>
    </Layout>
  );
};

export default AdminAudit;
