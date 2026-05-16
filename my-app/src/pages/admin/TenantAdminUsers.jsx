import { useEffect, useMemo, useState } from "react";
import { Trash2 } from "lucide-react";
import { deleteAdminUser, getAdminUsers, updateAdminUser } from "../../api/adminApi";
import { useAuth } from "../../context/AuthContext";
import { useIsCompactLayout } from "../../hooks/useIsCompactLayout";
import AdminConfirmModal from "./AdminConfirmModal";
import { badge, button, card, emptyState, form, layout, palette, table, getReadHeavyTwoColumnLayout } from "./adminStyles";

const defaultForm = { email: "", password: "", role: "USER", isActive: true };

export default function TenantAdminUsers() {
  const { user: currentUser } = useAuth();
  const isCompact = useIsCompactLayout(1100);
  const isWide = useIsCompactLayout(1500);
  const [users, setUsers] = useState([]);
  const [formData, setFormData] = useState(defaultForm);
  const [selectedId, setSelectedId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleteState, setDeleteState] = useState({ open: false, id: null, label: "" });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const workspaceGrid = getReadHeavyTwoColumnLayout(isCompact, isWide);

  const roleOptions = useMemo(
    () => (currentUser?.role === "SUPER_ADMIN" ? ["USER", "ADMIN", "SUPER_ADMIN"] : ["USER", "ADMIN"]),
    [currentUser?.role]
  );

  const selectedUser = useMemo(
    () => users.find((user) => user.id === selectedId) || null,
    [users, selectedId]
  );

  const loadData = async () => {
    try {
      setLoading(true);
      setError("");
      const response = await getAdminUsers();
      setUsers(Array.isArray(response.data) ? response.data : []);
      setSuccess("");
    } catch (err) {
      setSuccess("");
      setError(err.response?.data?.message || "Failed to load users.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const resetForm = () => {
    setSelectedId(null);
    setFormData(defaultForm);
    setError("");
  };

  const handleEdit = (user) => {
    setSelectedId(user.id);
    setFormData({
      email: user.email || "",
      password: "",
      role: user.role || "USER",
      isActive: user.active ?? user.isActive ?? true,
    });
    setSuccess("");
    setError("");
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!selectedId) return;

    try {
      setSaving(true);
      setError("");
      setSuccess("");

      const payload = {
        email: formData.email,
        role: formData.role,
        isActive: formData.isActive,
      };

      if (formData.password) {
        payload.password = formData.password;
      }

      await updateAdminUser(selectedId, payload);
      await loadData();
      setSuccess("User updated successfully.");
      resetForm();
    } catch (err) {
      setSuccess("");
      setError(err.response?.data?.message || "Failed to update user.");
    } finally {
      setSaving(false);
    }
  };

  const openDeleteModal = (user) => {
    setDeleteState({
      open: true,
      id: user.id,
      label: user.email || "this user",
    });
    setSuccess("");
    setError("");
  };

  const handleDelete = async () => {
    if (!deleteState.id) return;

    try {
      setSaving(true);
      setError("");
      setSuccess("");
      await deleteAdminUser(deleteState.id);
      await loadData();
      if (selectedId === deleteState.id) {
        resetForm();
      }
      setDeleteState({ open: false, id: null, label: "" });
      setSuccess("User deleted successfully.");
    } catch (err) {
      setError(err.response?.data?.message || "Failed to delete user.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div style={layout.contentStack}>
      <section style={card.panel}>
        <h1 style={{ margin: 0, fontSize: "1.9rem", color: palette.text }}>Tenant Users</h1>
        <p style={card.subtitle}>Review user accounts, update access, and delete accounts that should no longer exist.</p>
      </section>

      <section style={workspaceGrid}>
        <article style={card.panel}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "18px" }}>
            <div>
              <h2 style={card.title}>Users</h2>
              <p style={card.subtitle}>{users.length} records</p>
            </div>
            <div style={badge("danger")}>{loading ? "Loading" : "Access control"}</div>
          </div>

          {loading ? (
            <div style={emptyState}>Loading users...</div>
          ) : users.length === 0 ? (
            <div style={emptyState}>No users found for this tenant.</div>
          ) : (
            <div style={table.wrapper}>
              <table style={table.table}>
                <thead>
                  <tr>
                    <th style={table.headCell}>Email</th>
                    <th style={table.headCell}>Role</th>
                    <th style={table.headCell}>Status</th>
                    <th style={table.headCell}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((user) => {
                    const active = user.active ?? user.isActive ?? false;
                    return (
                      <tr key={user.id}>
                        <td style={table.cell}>
                          <div style={{ fontWeight: 700 }}>{user.email}</div>
                          <div style={{ color: palette.muted, fontSize: "0.85rem", marginTop: "4px" }}>
                            Created: {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : "-"}
                          </div>
                        </td>
                        <td style={table.cell}>
                          <span style={badge(user.role === "ADMIN" ? "warning" : user.role === "SUPER_ADMIN" ? "danger" : "default")}>{user.role}</span>
                        </td>
                        <td style={table.cell}>
                          <span style={badge(active ? "success" : "danger")}>{active ? "Active" : "Inactive"}</span>
                        </td>
                        <td style={table.cell}>
                          <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
                            <button style={button.ghost} onClick={() => handleEdit(user)}>Edit</button>
                            <button style={button.danger} onClick={() => openDeleteModal(user)}>Delete</button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </article>

        <article style={card.panel}>
          <h2 style={card.title}>{selectedId ? "Edit User" : "Select a User"}</h2>
          <p style={card.subtitle}>{selectedId ? "Update this tenant user account." : "Pick a user from the list to start editing."}</p>

          {error && <div style={{ ...badge("danger"), marginTop: "16px", justifyContent: "center" }}>{error}</div>}
          {success && <div style={{ ...badge("success"), marginTop: "16px", justifyContent: "center" }}>{success}</div>}

          {!selectedId ? (
            <div style={{ ...emptyState, marginTop: "18px" }}>Choose a user to edit account details.</div>
          ) : (
            <form onSubmit={handleSubmit} style={{ ...form.stack, marginTop: "18px" }}>
              <div style={form.field}>
                <label style={form.label}>Email</label>
                <input style={form.input} type="email" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} required />
              </div>

              <div style={form.field}>
                <label style={form.label}>New Password</label>
                <input style={form.input} type="password" value={formData.password} onChange={(e) => setFormData({ ...formData, password: e.target.value })} placeholder="Leave blank to keep current password" />
              </div>

              <div style={form.field}>
                <label style={form.label}>Role</label>
                <select style={form.input} value={formData.role} onChange={(e) => setFormData({ ...formData, role: e.target.value })}>
                  {roleOptions.map((role) => <option key={role} value={role}>{role}</option>)}
                </select>
              </div>

              <label style={{ ...form.label, display: "flex", alignItems: "center", gap: "10px", color: palette.text }}>
                <input type="checkbox" checked={formData.isActive} onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })} />
                Account is active
              </label>

              <div style={form.actions}>
                <button type="submit" style={button.primary} disabled={saving}>{saving ? "Saving..." : "Update User"}</button>
                <button type="button" style={button.secondary} onClick={resetForm} disabled={saving}>Reset</button>
                {selectedUser ? (
                  <button
                    type="button"
                    style={{ ...button.danger, display: "inline-flex", alignItems: "center", gap: "8px" }}
                    onClick={() => openDeleteModal(selectedUser)}
                    disabled={saving}
                  >
                    <Trash2 size={16} />
                    Delete
                  </button>
                ) : null}
              </div>
            </form>
          )}
        </article>
      </section>

      <AdminConfirmModal
        open={deleteState.open}
        title="Delete this user?"
        description={`This permanently removes ${deleteState.label}, including their bookings, tickets, reviews, and related tenant data.`}
        error={error}
        confirmLabel="Delete user"
        loading={saving}
        onConfirm={handleDelete}
        onCancel={() => setDeleteState({ open: false, id: null, label: "" })}
      />
    </div>
  );
}
