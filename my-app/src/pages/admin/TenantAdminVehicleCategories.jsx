import { useEffect, useMemo, useState } from "react";
import {
  createAdminVehicleCategory,
  deleteAdminVehicleCategory,
  getAdminVehicleCategories,
  updateAdminVehicleCategory,
} from "../../api/adminApi";
import AdminConfirmModal from "./AdminConfirmModal";
import { badge, button, card, emptyState, form, grid, layout, palette, table } from "./adminStyles";

const defaultForm = { name: "", description: "" };
const CATEGORY_IN_USE_MESSAGE =
  "A vehicle is attached to this category. Delete or reassign those vehicles first.";

export default function TenantAdminVehicleCategories() {
  const [categories, setCategories] = useState([]);
  const [formData, setFormData] = useState(defaultForm);
  const [selectedId, setSelectedId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [confirmLoading, setConfirmLoading] = useState(false);
  const [confirmError, setConfirmError] = useState("");

  const isEditing = useMemo(() => selectedId !== null, [selectedId]);

  const loadData = async () => {
    try {
      setLoading(true);
      setError("");
      const response = await getAdminVehicleCategories();
      setCategories(response.data);
      setSuccess("Categories loaded successfully.");
    } catch (err) {
      setSuccess("");
      setError(err.response?.data?.message || "Failed to load categories.");
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

  const handleEdit = (category) => {
    setSelectedId(category.id);
    setFormData({
      name: category.name || "",
      description: category.description || "",
    });
    setSuccess("");
    setError("");
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    try {
      setSaving(true);
      setError("");
      setSuccess("");

      if (isEditing) {
        await updateAdminVehicleCategory(selectedId, formData);
        await loadData();
        setSuccess("Category updated successfully.");
      } else {
        await createAdminVehicleCategory(formData);
        await loadData();
        setSuccess("Category created successfully.");
      }
      resetForm();
    } catch (err) {
      setSuccess("");
      setError(err.response?.data?.message || "Failed to save category.");
    } finally {
      setSaving(false);
    }
  };

  const openDeleteModal = (category) => {
    setConfirmError("");
    setConfirmDelete({ id: category.id, name: category.name });
  };

  const closeDeleteModal = () => {
    if (confirmLoading) return;
    setConfirmDelete(null);
    setConfirmError("");
  };

  const handleConfirmDelete = async () => {
    if (!confirmDelete?.id) return;
    try {
      setConfirmLoading(true);
      setConfirmError("");
      await deleteAdminVehicleCategory(confirmDelete.id);
      if (selectedId === confirmDelete.id) resetForm();
      setConfirmDelete(null);
      await loadData();
      setSuccess("Category deleted successfully.");
    } catch (err) {
      setSuccess("");
      const rawMessage =
        err.response?.data?.message ||
        err.response?.data?.detail ||
        (typeof err.response?.data === "string" ? err.response.data : null) ||
        "Failed to delete category.";

      const normalizedMessage =
        rawMessage === "Full authentication is required to access this resource"
          ? CATEGORY_IN_USE_MESSAGE
          : rawMessage;

      setConfirmError(normalizedMessage);
    } finally {
      setConfirmLoading(false);
    }
  };

  return (
    <div style={layout.contentStack}>
      <section style={card.panel}>
        <h1 style={{ margin: 0, fontSize: "1.9rem", color: palette.text }}>
          Vehicle Categories
        </h1>
        <p style={card.subtitle}>
          Define the catalog structure before creating vehicles.
        </p>
      </section>

      <section style={grid.two}>
        <article style={card.panel}>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: "18px",
            }}
          >
            <div>
              <h2 style={card.title}>Categories</h2>
              <p style={card.subtitle}>{categories.length} records</p>
            </div>

            <div style={badge("success")}>
              {loading ? "Loading" : "Ready"}
            </div>
          </div>

          {loading ? (
            <div style={emptyState}>Loading categories...</div>
          ) : categories.length === 0 ? (
            <div style={emptyState}>No categories created yet.</div>
          ) : (
            <div style={table.wrapper}>
              <table style={table.table}>
                <thead>
                  <tr>
                    <th style={table.headCell}>Name</th>
                    <th style={table.headCell}>Description</th>
                    <th style={table.headCell}>Actions</th>
                  </tr>
                </thead>

                <tbody>
                  {categories.map((category) => (
                    <tr key={category.id}>
                      <td style={table.cell}>
                        <div style={{ fontWeight: 700 }}>
                          {category.name}
                        </div>
                      </td>

                      <td style={table.cell}>
                        {category.description || "-"}
                      </td>

                      <td style={table.cell}>
                        <div
                          style={{
                            display: "flex",
                            gap: "10px",
                            flexWrap: "wrap",
                          }}
                        >
                          <button
                            type="button"
                            style={button.ghost}
                            onClick={() => handleEdit(category)}
                          >
                            Edit
                          </button>

                          <button
                            type="button"
                            style={button.danger}
                            onClick={() => openDeleteModal(category)}
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </article>

        <article style={card.panel}>
          <h2 style={card.title}>
            {isEditing ? "Edit Category" : "Create Category"}
          </h2>

          <p style={card.subtitle}>
            Use clean names so admins can assign vehicles consistently.
          </p>

          {error && (
            <div
              style={{
                ...badge("danger"),
                marginTop: "16px",
                justifyContent: "center",
              }}
            >
              {error}
            </div>
          )}

          {success && (
            <div
              style={{
                ...badge("success"),
                marginTop: "16px",
                justifyContent: "center",
              }}
            >
              {success}
            </div>
          )}

          <form
            onSubmit={handleSubmit}
            style={{ ...form.stack, marginTop: "18px" }}
          >
            <div style={form.field}>
              <label style={form.label}>Name</label>

              <input
                style={form.input}
                value={formData.name}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    name: e.target.value,
                  })
                }
                required
              />
            </div>

            <div style={form.field}>
              <label style={form.label}>Description</label>

              <textarea
                style={form.textarea}
                value={formData.description}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    description: e.target.value,
                  })
                }
              />
            </div>

            <div style={form.actions}>
              <button
                type="submit"
                style={button.primary}
                disabled={saving}
              >
                {saving
                  ? "Saving..."
                  : isEditing
                  ? "Update Category"
                  : "Create Category"}
              </button>

              <button
                type="button"
                style={button.secondary}
                onClick={resetForm}
              >
                Reset
              </button>
            </div>
          </form>
        </article>
      </section>

      <AdminConfirmModal
        open={Boolean(confirmDelete)}
        title="Delete vehicle category?"
        description={
          confirmDelete
            ? `"${confirmDelete.name}" will be removed from the catalog. ${CATEGORY_IN_USE_MESSAGE}`
            : ""
        }
        error={confirmError}
        loading={confirmLoading}
        confirmLabel="Delete category"
        onCancel={closeDeleteModal}
        onConfirm={handleConfirmDelete}
      />
    </div>
  );
}
