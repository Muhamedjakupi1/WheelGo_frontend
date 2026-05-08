import { useEffect, useMemo, useState } from "react";
import {
  createAdminVehicleImage,
  deleteAdminVehicleImage,
  getAdminVehicleImages,
  getAdminVehicles,
  uploadAdminVehicleImage,
  updateAdminVehicleImage,
} from "../../api/adminApi";
import { badge, button, card, emptyState, form, grid, layout, palette, table } from "./adminStyles";
import { resolveMediaUrl } from "../../utils/media";

const defaultForm = { vehicleId: "", url: "", isPrimary: false };

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
      url: image.url || "",
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
        await updateAdminVehicleImage(selectedId, { url: formData.url, isPrimary: formData.isPrimary });
        setSuccess("Vehicle image updated successfully.");
      } else {
        if (selectedFile) {
          const multipart = new FormData();
          multipart.append("vehicleId", formData.vehicleId);
          multipart.append("file", selectedFile);
          multipart.append("isPrimary", String(formData.isPrimary));
          await uploadAdminVehicleImage(multipart);
        } else {
          await createAdminVehicleImage({ vehicleId: formData.vehicleId, url: formData.url, primary: formData.isPrimary });
        }
        setSuccess("Vehicle image created successfully.");
      }

      await loadData();
      resetForm();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to save vehicle image.");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this image?")) return;
    try {
      await deleteAdminVehicleImage(id);
      if (selectedId === id) resetForm();
      await loadData();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to delete vehicle image.");
    }
  };

  return (
    <div style={layout.contentStack}>
      <section style={card.panel}>
        <h1 style={{ margin: 0, fontSize: "1.9rem", color: palette.text }}>Vehicle Images</h1>
        <p style={card.subtitle}>Attach media to vehicles and mark one image as primary when needed.</p>
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
                    <th style={table.headCell}>Image URL</th>
                    <th style={table.headCell}>Primary</th>
                    <th style={table.headCell}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {images.map((image) => (
                    <tr key={image.id}>
                      <td style={table.cell}>{image.vehicleLabel || "-"}</td>
                      <td style={table.cell}>
                        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                          <img
                            src={resolveMediaUrl(image.url)}
                            alt={image.vehicleLabel || "Vehicle"}
                            style={{ width: "56px", height: "40px", objectFit: "cover", borderRadius: "10px", border: `1px solid ${palette.border}` }}
                          />
                          <a href={resolveMediaUrl(image.url)} target="_blank" rel="noreferrer" style={{ color: palette.primary }}>
                            {image.url}
                          </a>
                        </div>
                      </td>
                      <td style={table.cell}><span style={badge((image.primary ?? image.isPrimary) ? "success" : "default")}>{(image.primary ?? image.isPrimary) ? "Primary" : "Secondary"}</span></td>
                      <td style={table.cell}>
                        <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
                          <button style={button.ghost} onClick={() => handleEdit(image)}>Edit</button>
                          <button style={button.danger} onClick={() => handleDelete(image.id)}>Delete</button>
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
          <h2 style={card.title}>{isEditing ? "Edit Vehicle Image" : "Create Vehicle Image"}</h2>
          <p style={card.subtitle}>Choose the linked vehicle and either upload an image from your computer or save a direct image URL.</p>

          {error && <div style={{ ...badge("danger"), marginTop: "16px", justifyContent: "center" }}>{error}</div>}
          {success && <div style={{ ...badge("success"), marginTop: "16px", justifyContent: "center" }}>{success}</div>}

          <form onSubmit={handleSubmit} style={{ ...form.stack, marginTop: "18px" }}>
            {!isEditing && (
              <div style={form.field}>
                <label style={form.label}>Vehicle</label>
                <select style={form.input} value={formData.vehicleId} onChange={(e) => setFormData({ ...formData, vehicleId: e.target.value })} required>
                  <option value="">Select vehicle</option>
                  {vehicles.map((vehicle) => (
                    <option key={vehicle.id} value={vehicle.id}>{vehicle.make} {vehicle.model} ({vehicle.plateNumber})</option>
                  ))}
                </select>
              </div>
            )}

            <div style={form.field}>
              <label style={form.label}>Image URL</label>
              <input
                style={form.input}
                value={formData.url}
                onChange={(e) => setFormData({ ...formData, url: e.target.value })}
                required={!selectedFile}
                disabled={!isEditing && Boolean(selectedFile)}
                placeholder={selectedFile ? "Using uploaded file" : "https://example.com/car.png"}
              />
            </div>

            {!isEditing && (
              <div style={form.field}>
                <label style={form.label}>Browse Image From Computer</label>
                <input
                  style={form.input}
                  type="file"
                  accept="image/png,image/jpeg,image/jpg,image/webp,image/gif"
                  onChange={(e) => setSelectedFile(e.target.files?.[0] ?? null)}
                />
              </div>
            )}

            {!isEditing && selectedFile && (
              <div style={{ ...badge("default"), justifyContent: "center" }}>
                Selected file: {selectedFile.name}
              </div>
            )}

            <label style={{ ...form.label, display: "flex", alignItems: "center", gap: "10px", color: palette.text }}>
              <input type="checkbox" checked={formData.isPrimary} onChange={(e) => setFormData({ ...formData, isPrimary: e.target.checked })} />
              Mark as primary image
            </label>

            <div style={form.actions}>
              <button type="submit" style={button.primary} disabled={saving || (!isEditing && vehicles.length === 0)}>{saving ? "Saving..." : isEditing ? "Update Image" : "Create Image"}</button>
              <button type="button" style={button.secondary} onClick={resetForm}>Reset</button>
            </div>
          </form>
        </article>
      </section>
    </div>
  );
}

