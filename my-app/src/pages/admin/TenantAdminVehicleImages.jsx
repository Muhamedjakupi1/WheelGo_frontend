import { useEffect, useMemo, useState } from "react";
import {
  deleteAdminVehicleImage,
  getAdminVehicleImages,
  getAdminVehicles,
  uploadAdminVehicleImage,
  updateAdminVehicleImage,
} from "../../api/adminApi";
import { badge, button, card, emptyState, form, grid, layout, palette, table } from "./adminStyles";
import AdminConfirmModal from "./AdminConfirmModal";
import { resolveMediaUrl } from "../../utils/media";

const defaultForm = { vehicleId: "", isPrimary: false };

function fileNameFromStoredPath(path) {
  if (!path || typeof path !== "string") return "—";
  const parts = path.split("/").filter(Boolean);
  const segment = parts.length ? parts[parts.length - 1] : path;
  return segment.length > 42 ? `${segment.slice(0, 20)}…${segment.slice(-12)}` : segment;
}

export default function TenantAdminVehicleImages() {
  const [images, setImages] = useState([]);
  const [vehicles, setVehicles] = useState([]);
  const [formData, setFormData] = useState(defaultForm);
  const [selectedId, setSelectedId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [selectedFile, setSelectedFile] = useState(null);
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [confirmLoading, setConfirmLoading] = useState(false);
  const [confirmError, setConfirmError] = useState("");

  const isEditing = useMemo(() => selectedId !== null, [selectedId]);

  const loadData = async () => {
    try {
      setLoading(true);
      setError("");
      const [imagesRes, vehiclesRes] = await Promise.all([getAdminVehicleImages(), getAdminVehicles()]);
      setImages(imagesRes.data);
      setVehicles(vehiclesRes.data);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load vehicle images.");
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
    setSelectedFile(null);
    setSuccess("");
    setError("");
  };

  const handleEdit = (image) => {
    setSelectedId(image.id);
    setFormData({
      vehicleId: image.vehicleId || "",
      isPrimary: image.primary ?? image.isPrimary ?? false,
    });
    setSuccess("");
    setError("");
    setSelectedFile(null);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    try {
      setSaving(true);
      setError("");
      setSuccess("");

      if (isEditing) {
        const patch = new FormData();
        patch.append("isPrimary", String(formData.isPrimary));
        if (selectedFile) {
          patch.append("file", selectedFile);
        }
        await updateAdminVehicleImage(selectedId, patch);
        setSuccess("Vehicle image updated successfully.");
      } else {
        if (!selectedFile) {
          setError("Please upload a photo from your computer.");
          setSaving(false);
          return;
        }
        if (!formData.vehicleId) {
          setError("Select which vehicle this photo belongs to.");
          setSaving(false);
          return;
        }
        const multipart = new FormData();
        multipart.append("vehicleId", formData.vehicleId);
        multipart.append("file", selectedFile);
        multipart.append("isPrimary", String(formData.isPrimary));
        await uploadAdminVehicleImage(multipart);
        setSuccess("Vehicle image uploaded successfully.");
      }

      await loadData();
      resetForm();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to save vehicle image.");
    } finally {
      setSaving(false);
    }
  };

  const openDeleteModal = (image) => {
    setConfirmError("");
    setConfirmDelete({
      id: image.id,
      label: image.vehicleLabel || "Vehicle image",
    });
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
      await deleteAdminVehicleImage(confirmDelete.id);
      if (selectedId === confirmDelete.id) resetForm();
      setConfirmDelete(null);
      await loadData();
      setSuccess("Image deleted.");
    } catch (err) {
      const msg =
        err.response?.data?.message ||
        err.response?.data?.detail ||
        "Failed to delete vehicle image.";
      setConfirmError(msg);
    } finally {
      setConfirmLoading(false);
    }
  };

  const createDisabled = saving || vehicles.length === 0 || !selectedFile || !formData.vehicleId;

  return (
    <div style={layout.contentStack}>
      <section style={card.panel}>
        <h1 style={{ margin: 0, fontSize: "1.9rem", color: palette.text }}>Vehicle Images</h1>
        <p style={card.subtitle}>Upload photos from your computer. Only the stored file path is saved in the database.</p>
      </section>

      <section style={grid.two}>
        <article style={card.panel}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "18px" }}>
            <div>
              <h2 style={card.title}>Image Library</h2>
              <p style={card.subtitle}>{images.length} records</p>
            </div>
            <div style={badge("warning")}>{loading ? "Loading" : "Media ready"}</div>
          </div>

          {loading ? (
            <div style={emptyState}>Loading images...</div>
          ) : images.length === 0 ? (
            <div style={emptyState}>No vehicle images created yet.</div>
          ) : (
            <div style={table.wrapper}>
              <table style={table.table}>
                <thead>
                  <tr>
                    <th style={table.headCell}>Vehicle</th>
                    <th style={table.headCell}>Photo</th>
                    <th style={table.headCell}>Primary</th>
                    <th style={table.headCell}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {images.map((image) => (
                    <tr key={image.id}>
                      <td style={{ ...table.cell, verticalAlign: "middle" }}>{image.vehicleLabel || "-"}</td>
                      <td style={table.cell}>
                        <div style={{ display: "flex", alignItems: "center", gap: "12px", flexWrap: "wrap" }}>
                          <img
                            src={resolveMediaUrl(image.url)}
                            alt={image.vehicleLabel || "Vehicle"}
                            style={{
                              width: "72px",
                              height: "48px",
                              objectFit: "cover",
                              borderRadius: "10px",
                              border: `1px solid ${palette.border}`,
                              flexShrink: 0,
                            }}
                          />
                          <span style={{ color: palette.muted, fontSize: "0.82rem", wordBreak: "break-all" }}>
                            {fileNameFromStoredPath(image.url)}
                          </span>
                        </div>
                      </td>
                      <td style={{ ...table.cell, verticalAlign: "middle" }}>
                        <span style={badge((image.primary ?? image.isPrimary) ? "success" : "default")}>
                          {(image.primary ?? image.isPrimary) ? "Primary" : "Secondary"}
                        </span>
                      </td>
                      <td style={{ ...table.cell, verticalAlign: "middle" }}>
                        <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
                          <button type="button" style={button.ghost} onClick={() => handleEdit(image)}>
                            Edit
                          </button>
                          <button type="button" style={button.danger} onClick={() => openDeleteModal(image)}>
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
          <h2 style={card.title}>{isEditing ? "Edit vehicle photo" : "Upload vehicle photo"}</h2>
          <p style={card.subtitle}>
            {isEditing
              ? "Optionally replace the file from your machine, or only change whether this is the primary photo."
              : "Choose the vehicle and a single image file. The server saves the file and stores its path."}
          </p>

          {error && <div style={{ ...badge("danger"), marginTop: "16px", justifyContent: "center" }}>{error}</div>}
          {success && <div style={{ ...badge("success"), marginTop: "16px", justifyContent: "center" }}>{success}</div>}

          <form onSubmit={handleSubmit} style={{ ...form.stack, marginTop: "18px" }}>
            {!isEditing && (
              <div style={form.field}>
                <label style={form.label}>Vehicle</label>
                <select
                  style={form.input}
                  value={formData.vehicleId}
                  onChange={(e) => setFormData({ ...formData, vehicleId: e.target.value })}
                  required
                >
                  <option value="">Select vehicle</option>
                  {vehicles.map((vehicle) => (
                    <option key={vehicle.id} value={vehicle.id}>
                      {vehicle.make} {vehicle.model} ({vehicle.plateNumber})
                    </option>
                  ))}
                </select>
              </div>
            )}

            <div style={form.field}>
              <label style={form.label}>{isEditing ? "Replace photo (optional)" : "Upload photo"}</label>
              <input
                style={form.input}
                type="file"
                accept="image/png,image/jpeg,image/jpg,image/webp,image/gif"
                onChange={(e) => setSelectedFile(e.target.files?.[0] ?? null)}
              />
              {!isEditing && (
                <p style={{ margin: "8px 0 0", color: palette.muted, fontSize: "0.85rem", lineHeight: 1.45 }}>
                  Required for a new image. JPG, PNG, WebP or GIF.
                </p>
              )}
              {isEditing && (
                <p style={{ margin: "8px 0 0", color: palette.muted, fontSize: "0.85rem", lineHeight: 1.45 }}>
                  Leave empty to keep the current file; submit to update primary only.
                </p>
              )}
            </div>

            {selectedFile && (
              <div style={{ ...badge("default"), justifyContent: "center" }}>Selected: {selectedFile.name}</div>
            )}

            <label style={{ ...form.label, display: "flex", alignItems: "center", gap: "10px", color: palette.text }}>
              <input
                type="checkbox"
                checked={formData.isPrimary}
                onChange={(e) => setFormData({ ...formData, isPrimary: e.target.checked })}
              />
              Mark as primary image
            </label>

            <div style={form.actions}>
              <button type="submit" style={button.primary} disabled={isEditing ? saving : createDisabled}>
                {saving ? "Saving..." : isEditing ? "Update" : "Upload photo"}
              </button>
              <button type="button" style={button.secondary} onClick={resetForm}>
                Reset
              </button>
            </div>
          </form>
        </article>
      </section>

      <AdminConfirmModal
        open={Boolean(confirmDelete)}
        title="Delete vehicle image?"
        description={
          confirmDelete ? `Remove this image for ${confirmDelete.label}. This cannot be undone.` : ""
        }
        error={confirmError}
        loading={confirmLoading}
        confirmLabel="Delete image"
        onCancel={closeDeleteModal}
        onConfirm={handleConfirmDelete}
      />
    </div>
  );
}
