// Brenda TenantUserDashboard.js
import React, { useEffect, useMemo, useState } from "react";
import {
  Search,
  MapPin,
  ChevronDown,
  X,
  CalendarDays,
  Gauge,
  Cog,
  Fuel,
  Users,
  ChevronLeft,
  ChevronRight,
  CreditCard,
  Star,
} from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { useTenantSettings } from "../../context/TenantSettingsContext";
import { createBooking } from "../../api/bookingApi";
import { getAddons } from "../../api/addonApi";
import { getMyDriverLicense } from "../../api/driverLicenseApi";
import { payForBooking } from "../../api/paymentApi";
import { getVehicleReviews } from "../../api/reviewApi";
import { getVehicles } from "../../api/vehicleApi";
import { getMyProfile } from "../../api/userProfileApi";
import { useIsCompactLayout } from "../../hooks/useIsCompactLayout";
import { formatCurrencyAmount, formatCurrencyPerDay } from "../../utils/currency";
import { resolveMediaUrl } from "../../utils/media";

const fallbackImage =
  "https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=1200&q=80";
const DEFAULT_LOCATION = "Pristina";

export default function TenantUserDashboard() {
  const { user } = useAuth();
  const { settings: tenantSettings } = useTenantSettings();
  const { tenantSlug } = useParams();
  const navigate = useNavigate();
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [selectedLocation, setSelectedLocation] = useState(DEFAULT_LOCATION);
  const [detailsVehicle, setDetailsVehicle] = useState(null);
  const [profile, setProfile] = useState(null);

  useEffect(() => {
    const loadVehicles = async (keyword = "") => {
      try {
        setLoading(true);
        const response = await getVehicles(keyword);
        setVehicles(Array.isArray(response.data) ? response.data : []);
        setError("");
      } catch (err) {
        console.error("Failed to load vehicles", err);
        setError("Failed to load vehicles.");
      } finally {
        setLoading(false);
      }
    };

    const delayDebounceFn = setTimeout(() => {
      loadVehicles(search.trim());
    }, 500);

    return () => clearTimeout(delayDebounceFn);
  }, [search]);

  useEffect(() => {
    let active = true;

    getMyProfile()
      .then((response) => {
        if (active) {
          setProfile(response.data);
        }
      })
      .catch((err) => {
        console.error("Failed to load profile avatar", err);
      });

    return () => {
      active = false;
    };
  }, []);

  const locations = useMemo(() => {
    const uniqueNames = [
      ...new Set(vehicles.map((vehicle) => vehicle.locationName).filter(Boolean)),
    ];
    uniqueNames.sort((a, b) => a.localeCompare(b));
    return uniqueNames;
  }, [vehicles]);

  useEffect(() => {
    if (locations.length === 0) return;

    const defaultLocation = locations.find(
      (locationName) =>
        locationName.toLowerCase() === DEFAULT_LOCATION.toLowerCase()
    );

    if (defaultLocation) {
      setSelectedLocation((current) =>
        current && current.toLowerCase() === defaultLocation.toLowerCase()
          ? current
          : defaultLocation
      );
      return;
    }

    setSelectedLocation((current) =>
      current && locations.includes(current) ? current : locations[0]
    );
  }, [locations]);

  const filteredVehicles = useMemo(() => {
    return vehicles.filter((vehicle) => {
      const matchesLocation =
        !selectedLocation || vehicle.locationName === selectedLocation;
      return matchesLocation;
    });
  }, [vehicles, selectedLocation]);

  const heroVehicle = filteredVehicles[0] || vehicles[0] || null;
  const featuredVehicles = filteredVehicles.slice(0, 6);
  const avatarUrl =
    resolveMediaUrl(profile?.avatarUrl) ||
    `https://i.pravatar.cc/100?u=${user?.email || "user"}`;

  return (
    <div style={ds.container}>
      <header style={ds.topbar}>
        <div>
          <h1 style={ds.title}>Dashboard</h1>
          <p style={ds.subtitle}>Welcome back, {user?.email}</p>
        </div>

        <div style={ds.actions}>
          <div style={ds.searchBox}>
            <Search size={18} color="#64748b" />
            <input
              type="text"
              placeholder="Search car..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={ds.searchInput}
            />
          </div>

          <div style={ds.selectWrap}>
            <MapPin size={18} color="#3b82f6" />
            <select
              value={selectedLocation}
              onChange={(e) => setSelectedLocation(e.target.value)}
              style={ds.locationSelect}
            >
              {locations.length === 0 ? (
                <option value={DEFAULT_LOCATION}>{DEFAULT_LOCATION}</option>
              ) : (
                locations.map((locationName) => (
                  <option key={locationName} value={locationName}>
                    {locationName}
                  </option>
                ))
              )}
            </select>
            <ChevronDown size={15} color="#3b82f6" style={ds.selectChevron} />
          </div>

          <button
            type="button"
            style={ds.avatarButton}
            onClick={() => navigate(`/t/${tenantSlug}/profile`)}
            aria-label="Open profile"
          >
            <img
              src={avatarUrl}
              alt="avatar"
              style={ds.avatar}
            />
          </button>
        </div>
      </header>

      <section style={ds.hero}>
        <div>
          <h2 style={ds.heroTitle}>
            {heroVehicle
              ? `${heroVehicle.make} ${heroVehicle.model}`
              : "RENT THE CAR OF YOUR DREAMS"}
          </h2>
          <p style={ds.heroText}>
            {heroVehicle
              ? buildHeroSummary(heroVehicle, tenantSettings)
              : "Choose from premium vehicles with fast delivery."}
          </p>
          {heroVehicle ? (
            <button
              style={ds.heroBtn}
              type="button"
              onClick={() => setDetailsVehicle(heroVehicle)}
            >
              View Details
            </button>
          ) : (
            <button
              style={{ ...ds.heroBtn, opacity: 0.6, cursor: "not-allowed" }}
              type="button"
              disabled
            >
              Book Now
            </button>
          )}
        </div>

        <img
          src={
            heroVehicle
              ? resolveMediaUrl(
                  heroVehicle.primaryImageUrl || heroVehicle.imageUrls?.[0]
                ) || fallbackImage
              : fallbackImage
          }
          alt={heroVehicle ? `${heroVehicle.make} ${heroVehicle.model}` : "car"}
          style={ds.heroImg}
        />
      </section>

      {error ? <div style={ds.errorBanner}>{error}</div> : null}

      {!loading && !error ? (
        <div style={ds.resultsSummary}>
          Showing {featuredVehicles.length} of {filteredVehicles.length} matching
          vehicles{selectedLocation ? ` in ${selectedLocation}` : ""}.
        </div>
      ) : null}

      <div style={ds.grid}>
        {loading ? (
          <div style={{ color: "#94a3b8" }}>Loading vehicles...</div>
        ) : featuredVehicles.length === 0 ? (
          <div style={ds.emptyState}>
            <strong>No vehicles match your filters.</strong>
            <span>Try another location or search term.</span>
          </div>
        ) : (
          featuredVehicles.map((vehicle) => (
            <CarCard
              key={vehicle.id}
              vehicle={vehicle}
              currencySettings={tenantSettings}
              onDetails={() => setDetailsVehicle(vehicle)}
            />
          ))
        )}
      </div>

      {detailsVehicle ? (
        <VehicleDetailsModal
          vehicle={detailsVehicle}
          currencySettings={tenantSettings}
          onBookingSaved={() => {
            setDetailsVehicle(null);
            navigate(`/t/${tenantSlug}/payments`);
          }}
          onProfileRequired={() => {
            setDetailsVehicle(null);
            navigate(`/t/${tenantSlug}/profile`);
          }}
          onClose={() => setDetailsVehicle(null)}
        />
      ) : null}
    </div>
  );
}

// --------------------------------------------------------------
// CarCard – komponenti i vogël për kartelën e makinës
// --------------------------------------------------------------
function CarCard({ vehicle, onDetails, currencySettings }) {
  const isAvailable = vehicle.status === "AVAILABLE";
  const name = `${vehicle.make} ${vehicle.model}`;
  const price = vehicle.dailyRate;
  const img =
    resolveMediaUrl(vehicle.primaryImageUrl || vehicle.imageUrls?.[0]) ||
    fallbackImage;

  return (
    <div style={ds.card}>
      <div style={ds.cardHeader}>
        <h3 style={ds.cardTitle}>{name}</h3>
        <span style={ds.statusBadge}>{formatEnumLabel(vehicle.status)}</span>
      </div>
      <p style={ds.cardMeta}>
        {vehicle.categoryName || "Vehicle"}
        {vehicle.locationName ? ` • ${vehicle.locationName}` : ""}
      </p>

      <img src={img} alt={name} style={ds.cardImg} />

      <div style={ds.cardSpecs}>
        <SpecPill icon={<CalendarDays size={14} />} label={vehicle.year || "N/A"} />
        <SpecPill
          icon={<Cog size={14} />}
          label={formatEnumLabel(vehicle.transmission)}
        />
        <SpecPill
          icon={<Fuel size={14} />}
          label={formatEnumLabel(vehicle.fuelType)}
        />
      </div>

      <div style={ds.cardBottom}>
        <span>
          <strong style={{ fontSize: "22px" }}>{formatCurrencyAmount(price, currencySettings, { tight: true })}</strong>/day
        </span>
        <div style={{ display: "grid", justifyItems: "end", gap: "6px" }}>
          <button style={ds.detailsBtn} type="button" onClick={onDetails}>
            Details
          </button>
          {!isAvailable && vehicle.statusMessage ? (
            <span style={ds.rentedMeta}>{vehicle.statusMessage}</span>
          ) : null}
        </div>
      </div>
    </div>
  );
}

// --------------------------------------------------------------
// VehicleDetailsModal – modal i detajuar me rezervim dhe addons
// --------------------------------------------------------------
function VehicleDetailsModal({
  vehicle,
  currencySettings,
  onBookingSaved,
  onProfileRequired,
  onClose,
}) {
  const isCompactBooking = useIsCompactLayout(1100);
  const isWideBooking = useIsCompactLayout(1450);
  const bookingModalGrid = isCompactBooking
    ? ds.modalContent
    : {
        display: "grid",
        gridTemplateColumns: isWideBooking
          ? "minmax(0, 1.7fr) minmax(340px, 0.85fr)"
          : "minmax(0, 1.45fr) minmax(320px, 0.95fr)",
        gap: "24px",
        alignItems: "start",
      };

  const name = `${vehicle.make} ${vehicle.model}`;
  const galleryImages = useMemo(() => {
    const rawImages = [
      vehicle.primaryImageUrl,
      ...(vehicle.imageUrls || []),
    ]
      .filter(Boolean)
      .map((image) => resolveMediaUrl(image) || fallbackImage);

    return rawImages.length > 0 ? [...new Set(rawImages)] : [fallbackImage];
  }, [vehicle]);

  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [panelMode, setPanelMode] = useState("details");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [addons, setAddons] = useState([]);
  const [addonQuantities, setAddonQuantities] = useState({});
  const [customRequest, setCustomRequest] = useState("");
  const [createdBooking, setCreatedBooking] = useState(null);
  const [paymentForm, setPaymentForm] = useState({
    method: "CARD",
    cardholderName: "",
    cardNumber: "",
    expiryMonth: "",
    expiryYear: "",
    cvv: "",
    promotionCode: "",
  });
  const [saveMessage, setSaveMessage] = useState({ type: "", text: "" });
  const [saving, setSaving] = useState(false);
  const [paying, setPaying] = useState(false);
  const [checkingLicense, setCheckingLicense] = useState(false);
  const [showLicensePrompt, setShowLicensePrompt] = useState(false);
  const [vehicleReviews, setVehicleReviews] = useState([]);
  const [reviewsLoading, setReviewsLoading] = useState(true);
  const [reviewsError, setReviewsError] = useState("");

  // Fetch addons nga API
  useEffect(() => {
    getAddons()
      .then((res) => {
        setAddons(Array.isArray(res.data) ? res.data : []);
      })
      .catch((err) => console.error("Gabim gjatë marrjes së addons:", err));
  }, []);

  useEffect(() => {
    let active = true;
    setReviewsLoading(true);
    setReviewsError("");

    getVehicleReviews(vehicle.id)
      .then((response) => {
        if (active) {
          setVehicleReviews(Array.isArray(response.data) ? response.data : []);
        }
      })
      .catch((error) => {
        if (active) {
          setVehicleReviews([]);
          setReviewsError(error?.response?.data?.message || "Failed to load reviews.");
        }
      })
      .finally(() => {
        if (active) {
          setReviewsLoading(false);
        }
      });

    return () => {
      active = false;
    };
  }, [vehicle.id]);

  const selectableAddons = useMemo(
    () => addons.filter((addon) => addon?.isActive),
    [addons]
  );
  const averageReviewRating = useMemo(() => {
    if (vehicleReviews.length === 0) {
      return null;
    }
    const total = vehicleReviews.reduce((sum, review) => sum + Number(review.rating || 0), 0);
    return (total / vehicleReviews.length).toFixed(1);
  }, [vehicleReviews]);

  const imageUrl = galleryImages[activeImageIndex] || fallbackImage;
  const canSlide = galleryImages.length > 1;
  const dailyRate = Number(vehicle.dailyRate || 0);
  const rentalDays = calculateRentalDays(startDate, endDate);
  const baseAmount = rentalDays * dailyRate;
  const addonsAmount = selectableAddons.reduce((total, addon) => {
    const quantity = Number(addonQuantities[addon.id] || 0);
    if (quantity <= 0) return total;
    const unitPrice = Number(addon.price || 0);
    const multiplier = addon.type === "DAILY" ? rentalDays || 1 : 1;
    return total + quantity * unitPrice * multiplier;
  }, 0);
  const finalAmount = baseAmount + addonsAmount;
  const today = getTodayDateString();
  const maintenanceAvailableFrom = vehicle.maintenanceUntil || "";
  const startDateMin = maintenanceAvailableFrom && maintenanceAvailableFrom > today ? maintenanceAvailableFrom : today;
  const canStartBooking = vehicle.status !== "INACTIVE";
  const unavailableLabel = vehicle.statusMessage || "Unavailable";

  const showPreviousImage = () => {
    setActiveImageIndex((current) =>
      current === 0 ? galleryImages.length - 1 : current - 1
    );
  };

  const showNextImage = () => {
    setActiveImageIndex((current) =>
      current === galleryImages.length - 1 ? 0 : current + 1
    );
  };

  const canSaveBooking =
    canStartBooking &&
    startDate &&
    endDate &&
    rentalDays > 0 &&
    new Date(endDate) >= new Date(startDate);
  const canPay =
    createdBooking &&
    (paymentForm.method === "CASH" ||
      (paymentForm.cardholderName.trim() &&
        paymentForm.cardNumber.replace(/\D/g, "").length >= 12 &&
        paymentForm.expiryMonth.trim() &&
        paymentForm.expiryYear.trim() &&
        paymentForm.cvv.replace(/\D/g, "").length >= 3));

  const ensureDriverLicenseVerified = async () => {
    try {
      setCheckingLicense(true);
      const response = await getMyDriverLicense();
      if (isDriverLicenseVerified(response.data)) {
        return true;
      }
      setShowLicensePrompt(true);
      return false;
    } catch {
      setShowLicensePrompt(true);
      return false;
    } finally {
      setCheckingLicense(false);
    }
  };

  const handleOpenBookingPanel = async () => {
    if (!canStartBooking || checkingLicense) return;
    const verified = await ensureDriverLicenseVerified();
    if (verified) {
      setPanelMode("book");
    }
  };

  const handleSaveDraft = async () => {
    if (!(await ensureDriverLicenseVerified())) {
      return;
    }

    if (!canSaveBooking) {
      setSaveMessage({
        type: "error",
        text: "Choose valid booking dates before saving.",
      });
      return;
    }

    setSaving(true);
    setSaveMessage({ type: "", text: "" });

    try {
      const response = await createBooking({
        vehicleId: vehicle.id,
        startDate,
        endDate,
        addons: selectableAddons
          .map((addon) => ({
            addonId: addon.id,
            quantity: Number(addonQuantities[addon.id] || 0),
          }))
          .filter((addon) => addon.quantity > 0),
        specialRequest: customRequest.trim() || null,
      });

      setSaveMessage({
        type: "success",
        text: "Booking saved. Complete the payment to finish.",
      });
      setCreatedBooking(response.data);
      if (bookingRequiresCash(response.data)) {
        setPaymentForm((current) => ({ ...current, method: "CASH" }));
      }
      setPanelMode("payment");
    } catch (error) {
      console.error("Failed to save booking", error);
      setSaveMessage({
        type: "error",
        text:
          error?.response?.data?.message ||
          error?.response?.data?.error ||
          "Something went wrong while saving the booking.",
      });
    } finally {
      setSaving(false);
    }
  };

  const updatePaymentField = (field, value) => {
    setPaymentForm((current) => ({ ...current, [field]: value }));
  };

  const handlePay = async () => {
    if (!canPay || paying) return;

    try {
      setPaying(true);
      setSaveMessage({ type: "", text: "" });
      const response = await payForBooking({
        bookingId: createdBooking.id,
        method: paymentForm.method,
        currency: currencySettings?.currency || "EUR",
        cardholderName: paymentForm.cardholderName.trim(),
        cardNumber: paymentForm.cardNumber,
        expiryMonth: paymentForm.expiryMonth,
        expiryYear: paymentForm.expiryYear,
        cvv: paymentForm.cvv,
        promotionCode: paymentForm.promotionCode.trim() || null,
      });

      setSaveMessage({
        type: "success",
        text:
          paymentForm.method === "CASH"
            ? "Cash payment selected. Booking is pending until admin confirmation."
            : `Payment completed. Invoice ${response.data?.invoiceNumber || ""} will be sent by email.`,
      });

      window.setTimeout(() => {
        onBookingSaved?.();
      }, 700);
    } catch (error) {
      setSaveMessage({
        type: "error",
        text:
          error?.response?.data?.message ||
          error?.response?.data?.error ||
          "Payment failed.",
      });
    } finally {
      setPaying(false);
    }
  };

  return (
    <div style={ds.modalOverlay} onClick={onClose}>
      <div style={ds.modalCard} onClick={(e) => e.stopPropagation()}>
        <div style={ds.modalHeader}>
          <div>
            <h2 style={ds.modalTitle}>{name}</h2>
            <p style={ds.modalSubtitle}>
              {vehicle.categoryName || "Vehicle"}
              {vehicle.locationName ? ` • ${vehicle.locationName}` : ""}
            </p>
          </div>

          <button
            type="button"
            style={ds.closeIconButton}
            onClick={onClose}
            aria-label="Close details"
          >
            <X size={18} />
          </button>
        </div>

        <div style={bookingModalGrid}>
          <div style={ds.galleryWrap}>
            <div style={ds.modalImageFrame}>
              <img src={imageUrl} alt={name} style={ds.modalImage} />

              {canSlide && (
                <>
                  <button
                    type="button"
                    style={{ ...ds.galleryArrow, ...ds.galleryArrowLeft }}
                    onClick={showPreviousImage}
                    aria-label="Show previous image"
                  >
                    <ChevronLeft size={22} />
                  </button>
                  <button
                    type="button"
                    style={{ ...ds.galleryArrow, ...ds.galleryArrowRight }}
                    onClick={showNextImage}
                    aria-label="Show next image"
                  >
                    <ChevronRight size={22} />
                  </button>
                </>
              )}

              <div style={ds.galleryCounter}>
                {activeImageIndex + 1}/{galleryImages.length}
              </div>
            </div>

            {canSlide && (
              <div style={ds.thumbnailRow}>
                {galleryImages.map((galleryImage, index) => (
                  <button
                    key={`${galleryImage}-${index}`}
                    type="button"
                    onClick={() => setActiveImageIndex(index)}
                    style={{
                      ...ds.thumbnailButton,
                      ...(index === activeImageIndex
                        ? ds.thumbnailButtonActive
                        : {}),
                    }}
                    aria-label={`Show image ${index + 1}`}
                  >
                    <img
                      src={galleryImage}
                      alt={`${name} ${index + 1}`}
                      style={ds.thumbnailImage}
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          <div style={ds.modalInfo}>
            <div style={ds.modalPriceRow}>
              <div style={ds.modalPrice}>
                <strong>{formatCurrencyAmount(dailyRate, currencySettings, { tight: true })}</strong>
                <span>/day</span>
              </div>

              {panelMode === "details" ? (
                <button
                  type="button"
                  style={{
                    ...ds.primaryActionBtn,
                    ...(canStartBooking && !checkingLicense ? {} : ds.disabledActionBtn),
                  }}
                  onClick={handleOpenBookingPanel}
                  disabled={!canStartBooking || checkingLicense}
                >
                  {checkingLicense ? "Checking..." : canStartBooking ? "Book" : unavailableLabel}
                </button>
              ) : panelMode === "payment" ? (
                <button type="button" style={ds.secondaryActionBtn} onClick={() => setPanelMode("book")}>
                  Back To Booking
                </button>
              ) : (
                <button
                  type="button"
                  style={ds.secondaryActionBtn}
                  onClick={() => setPanelMode("details")}
                >
                  Back To Details
                </button>
              )}
            </div>

            {panelMode === "details" ? (
              <>
                {vehicle.status === "MAINTENANCE" && vehicle.statusMessage ? (
                  <div style={{ ...ds.infoBannerCompact, marginBottom: "18px" }}>
                    {vehicle.statusMessage}. You can still book it for dates starting on or after that date.
                  </div>
                ) : null}

                <div style={ds.modalGrid}>
                  <DetailRow
                    icon={<CalendarDays size={16} />}
                    label="Year"
                    value={vehicle.year}
                  />
                  <DetailRow
                    icon={<Cog size={16} />}
                    label="Transmission"
                    value={formatEnumLabel(vehicle.transmission)}
                  />
                  <DetailRow
                    icon={<Fuel size={16} />}
                    label="Fuel"
                    value={formatEnumLabel(vehicle.fuelType)}
                  />
                  <DetailRow
                    icon={<Users size={16} />}
                    label="Seats"
                    value={vehicle.seats}
                  />
                  <DetailRow
                    icon={<Gauge size={16} />}
                    label="Mileage"
                    value={vehicle.mileage ? `${vehicle.mileage} km` : "-"}
                  />
                  <DetailRow
                    icon={<MapPin size={16} />}
                    label="Location"
                    value={vehicle.locationName || "-"}
                  />
                </div>

                <div style={ds.detailSection}>
                  <div style={ds.detailLabel}>Color</div>
                  <div style={ds.detailValue}>{vehicle.color || "-"}</div>
                </div>

                <div style={ds.detailSection}>
                  <div style={ds.detailLabel}>Plate Number</div>
                  <div style={ds.detailValue}>{vehicle.plateNumber || "-"}</div>
                </div>

                <div style={ds.detailSection}>
                  <div style={ds.detailLabel}>Status</div>
                  <div style={ds.detailValue}>
                    {formatEnumLabel(vehicle.status)}
                  </div>
                </div>

                <VehicleReviewList
                  reviews={vehicleReviews}
                  loading={reviewsLoading}
                  error={reviewsError}
                  averageRating={averageReviewRating}
                />
              </>
            ) : panelMode === "book" ? (
              <>
                {!canStartBooking && (
                  <div style={ds.errorBannerCompact}>
                    This vehicle is currently{" "}
                    {formatEnumLabel(vehicle.status).toLowerCase()} and cannot be
                    booked right now. {vehicle.statusMessage || ""}
                  </div>
                )}

                {canStartBooking && vehicle.status === "MAINTENANCE" && vehicle.statusMessage ? (
                  <div style={ds.infoBannerCompact}>
                    {vehicle.statusMessage}. Bookings starting on or after that date are allowed.
                  </div>
                ) : null}

                {saveMessage.text && (
                  <div
                    style={
                      saveMessage.type === "success"
                        ? ds.successBannerCompact
                        : ds.errorBannerCompact
                    }
                  >
                    {saveMessage.text}
                  </div>
                )}

                <div style={ds.bookingGrid}>
                  <label style={ds.fieldGroup}>
                    <span style={ds.fieldLabel}>Start Date</span>
                    <input
                      type="date"
                      min={startDateMin}
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                      style={ds.input}
                    />
                  </label>

                  <label style={ds.fieldGroup}>
                    <span style={ds.fieldLabel}>End Date</span>
                    <input
                      type="date"
                      min={startDate || startDateMin}
                      value={endDate}
                      onChange={(e) => setEndDate(e.target.value)}
                      style={ds.input}
                    />
                  </label>
                </div>

                <div style={ds.pricePanel}>
                  <PriceLine
                    label="Daily rate"
                    value={formatCurrencyAmount(dailyRate, currencySettings)}
                  />
                  <PriceLine
                    label="Rental days"
                    value={rentalDays > 0 ? `${rentalDays}` : "0"}
                  />
                  <PriceLine
                    label="Base amount"
                    value={formatCurrencyAmount(baseAmount, currencySettings)}
                  />

                  {selectableAddons.length === 0 ? (
                    <div style={{ color: "#94a3b8", fontSize: "0.92rem" }}>
                      No add-ons are available for this tenant right now.
                    </div>
                  ) : (
                    selectableAddons.map((addon) => (
                      <GenericAddonQuantityRow
                        key={addon.id}
                        label={addon.name || "Add-on"}
                        description={addon.description}
                        price={addon.price}
                        currencySettings={currencySettings}
                        available={addon.quantity}
                        type={addon.type}
                        value={Number(addonQuantities[addon.id] || 0)}
                        onChange={(nextValue) =>
                          setAddonQuantities((current) => ({
                            ...current,
                            [addon.id]: nextValue,
                          }))
                        }
                      />
                    ))
                  )}

                  <PriceLine
                    label="Add-ons"
                    value={formatCurrencyAmount(addonsAmount, currencySettings)}
                  />

                  <div style={ds.totalRow}>
                    <span>Final amount</span>
                    <strong>{formatCurrencyAmount(finalAmount, currencySettings)}</strong>
                  </div>
                </div>

                <label style={ds.fieldGroup}>
                  <span style={ds.fieldLabel}>Other special request</span>
                  <textarea
                    value={customRequest}
                    onChange={(e) => setCustomRequest(e.target.value)}
                    placeholder="Example: I need pickup at the airport, or I want a child booster seat."
                    style={ds.textarea}
                    rows={4}
                  />
                  <span style={ds.helperText}>
                    The admin can accept or refuse this request later.
                  </span>
                </label>

                <button
                  type="button"
                  style={{
                    ...ds.primaryActionBtn,
                    ...(canSaveBooking && !saving
                      ? {}
                      : ds.disabledActionBtn),
                  }}
                  onClick={handleSaveDraft}
                  disabled={!canSaveBooking || saving}
                >
                  {saving ? "Saving..." : "Save"}
                </button>
              </>
            ) : (
              <>
                {saveMessage.text && (
                  <div
                    style={
                      saveMessage.type === "success"
                        ? ds.successBannerCompact
                        : ds.errorBannerCompact
                    }
                  >
                    {saveMessage.text}
                  </div>
                )}

                <div style={ds.pricePanel}>
                  <div style={ds.paymentHeader}>
                    <CreditCard size={20} />
                    <div>
                      <div style={{ color: "#fff", fontWeight: 800 }}>Payment Details</div>
                      <div style={{ color: "#94a3b8", fontSize: "13px", marginTop: "4px" }}>
                        {createdBooking?.vehicleName || name}
                      </div>
                    </div>
                  </div>
                  <PriceLine label="Booking total" value={formatCurrencyAmount(createdBooking?.totalPrice || finalAmount, currencySettings)} />
                  <PriceLine label="Approved add-ons" value={formatCurrencyAmount(createdBooking?.addonPrice || addonsAmount, currencySettings)} />
                  {Number(createdBooking?.discountAmount || 0) > 0 ? (
                    <PriceLine label="Discount" value={`-${formatCurrencyAmount(createdBooking.discountAmount, currencySettings)}`} />
                  ) : null}
                  <PriceLine label="Payment method" value={paymentForm.method === "CASH" ? "Cash" : "Card"} />
                </div>

                {bookingRequiresCash(createdBooking) ? (
                  <div style={ds.infoBannerCompact}>
                    This booking has a special request, so only cash payment is allowed. The total above already includes any admin-approved special-request charge.
                  </div>
                ) : null}

                <label style={ds.fieldGroup}>
                  <span style={ds.fieldLabel}>Promotion Code</span>
                  <input
                    value={paymentForm.promotionCode}
                    onChange={(e) => updatePaymentField("promotionCode", e.target.value)}
                    style={ds.input}
                    placeholder="WheelGo-10"
                  />
                </label>

                <div style={ds.methodToggle}>
                  <button
                    type="button"
                    style={{
                      ...ds.methodBtn,
                      ...(paymentForm.method === "CARD" ? ds.methodBtnActive : {}),
                      ...(bookingRequiresCash(createdBooking) ? ds.disabledActionBtn : {}),
                    }}
                    onClick={() => {
                      if (!bookingRequiresCash(createdBooking)) {
                        updatePaymentField("method", "CARD");
                      }
                    }}
                    disabled={bookingRequiresCash(createdBooking)}
                  >
                    Card
                  </button>
                  <button
                    type="button"
                    style={{ ...ds.methodBtn, ...(paymentForm.method === "CASH" ? ds.methodBtnActive : {}) }}
                    onClick={() => updatePaymentField("method", "CASH")}
                  >
                    Cash
                  </button>
                </div>

                {paymentForm.method === "CARD" ? (
                  <>
                    <label style={ds.fieldGroup}>
                      <span style={ds.fieldLabel}>Cardholder Name</span>
                      <input
                        value={paymentForm.cardholderName}
                        onChange={(e) => updatePaymentField("cardholderName", e.target.value)}
                        style={ds.input}
                      />
                    </label>

                    <label style={ds.fieldGroup}>
                      <span style={ds.fieldLabel}>Card Number</span>
                      <input
                        inputMode="numeric"
                        placeholder="4242 4242 4242 4242"
                        value={paymentForm.cardNumber}
                        onChange={(e) => updatePaymentField("cardNumber", formatCardNumber(e.target.value))}
                        style={ds.input}
                      />
                    </label>

                    <div style={ds.bookingGrid}>
                      <label style={ds.fieldGroup}>
                        <span style={ds.fieldLabel}>Expiry Month</span>
                        <input
                          inputMode="numeric"
                          maxLength={2}
                          placeholder="12"
                          value={paymentForm.expiryMonth}
                          onChange={(e) => updatePaymentField("expiryMonth", onlyDigits(e.target.value).slice(0, 2))}
                          style={ds.input}
                        />
                      </label>

                      <label style={ds.fieldGroup}>
                        <span style={ds.fieldLabel}>Expiry Year</span>
                        <input
                          inputMode="numeric"
                          maxLength={4}
                          placeholder="2028"
                          value={paymentForm.expiryYear}
                          onChange={(e) => updatePaymentField("expiryYear", onlyDigits(e.target.value).slice(0, 4))}
                          style={ds.input}
                        />
                      </label>

                      <label style={ds.fieldGroup}>
                        <span style={ds.fieldLabel}>CVV</span>
                        <input
                          inputMode="numeric"
                          maxLength={4}
                          value={paymentForm.cvv}
                          onChange={(e) => updatePaymentField("cvv", onlyDigits(e.target.value).slice(0, 4))}
                          style={ds.input}
                        />
                      </label>
                    </div>

                    <span style={ds.helperText}>
                      Card details are used only to demonstrate payment validation and are not stored.
                    </span>
                  </>
                ) : (
                  <div style={ds.infoBannerCompact}>
                    Cash payment will keep the booking pending until admin confirmation.
                  </div>
                )}

                <button
                  type="button"
                  style={{
                    ...ds.primaryActionBtn,
                    ...(canPay && !paying ? {} : ds.disabledActionBtn),
                  }}
                  onClick={handlePay}
                  disabled={!canPay || paying}
                >
                  {paying ? "Processing..." : paymentForm.method === "CASH" ? "Choose Cash Payment" : "Pay"}
                </button>
              </>
            )}
          </div>
        </div>
      </div>

      {showLicensePrompt ? (
        <div style={ds.licensePromptOverlay} onClick={() => setShowLicensePrompt(false)}>
          <div style={ds.licensePromptCard} onClick={(event) => event.stopPropagation()}>
            <h3 style={ds.licensePromptTitle}>Driver license required</h3>
            <p style={ds.licensePromptText}>
              You cannot book a vehicle until your driver license is verified. Go to Profile and upload your driver license first.
            </p>
            <div style={ds.licensePromptActions}>
              <button type="button" style={ds.secondaryActionBtn} onClick={() => setShowLicensePrompt(false)}>
                Close
              </button>
              <button type="button" style={ds.primaryActionBtn} onClick={onProfileRequired}>
                Go to Profile
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}

// --------------------------------------------------------------
// Komponentë ndihmës
// --------------------------------------------------------------
function DetailRow({ icon, label, value }) {
  return (
    <div style={ds.detailRow}>
      <div style={ds.detailRowLabel}>
        {icon}
        <span>{label}</span>
      </div>
      <span style={ds.detailRowValue}>{value || "-"}</span>
    </div>
  );
}

function SpecPill({ icon, label }) {
  return (
    <div style={ds.specPill}>
      {icon}
      <span>{label || "N/A"}</span>
    </div>
  );
}

function PriceLine({ label, value }) {
  return (
    <div style={ds.priceLine}>
      <span>{label}</span>
      <span>{value}</span>
    </div>
  );
}

function VehicleReviewList({ reviews, loading, error, averageRating }) {
  return (
    <section style={ds.reviewSection}>
      <div style={ds.reviewSectionHeader}>
        <div>
          <div style={ds.detailLabel}>Reviews</div>
          <div style={ds.reviewSummary}>
            {averageRating ? `${averageRating} average from ${reviews.length} review(s)` : "Customer reviews for this car"}
          </div>
        </div>
        {averageRating ? <RatingStars value={Math.round(Number(averageRating))} /> : null}
      </div>

      {loading ? (
        <div style={ds.reviewEmpty}>Loading reviews...</div>
      ) : error ? (
        <div style={ds.reviewError}>{error}</div>
      ) : reviews.length === 0 ? (
        <div style={ds.reviewEmpty}>No reviews for this car yet.</div>
      ) : (
        <div style={ds.reviewList}>
          {reviews.slice(0, 4).map((review) => (
            <article key={review.id} style={ds.reviewItem}>
              <div style={ds.reviewItemHeader}>
                <div>
                  <div style={ds.reviewCustomer}>{review.customerEmail || "Customer"}</div>
                  <div style={ds.reviewDate}>{formatDateOnly(review.createdAt)}</div>
                </div>
                <RatingStars value={review.rating} />
              </div>
              <p style={ds.reviewComment}>{review.comment || "No comment added."}</p>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}

function RatingStars({ value }) {
  return (
    <div style={ds.reviewStars}>
      {[1, 2, 3, 4, 5].map((rating) => (
        <Star
          key={rating}
          size={15}
          fill={Number(value) >= rating ? "currentColor" : "none"}
        />
      ))}
    </div>
  );
}

function AddonQuantityRow({ label, price, available, value, onChange, currencySettings }) {
  const stock = Number(available ?? 0);

  const updateValue = (nextValue) => {
    const normalized = Math.max(0, Math.min(stock, Number(nextValue) || 0));
    onChange(normalized);
  };

  return (
    <div style={ds.addonQuantityRow}>
      <div>
        <div style={ds.addonQuantityLabel}>{label}</div>
        <div style={ds.addonQuantityMeta}>
          {formatCurrencyAmount(price, currencySettings)} each · {stock} available
        </div>
      </div>
      <div style={ds.quantityStepper}>
        <button
          type="button"
          style={ds.quantityButton}
          onClick={() => updateValue(value - 1)}
          disabled={value <= 0}
        >
          -
        </button>
        <input
          type="number"
          min="0"
          max={stock}
          value={value}
          onChange={(event) => updateValue(event.target.value)}
          style={ds.quantityInput}
        />
        <button
          type="button"
          style={ds.quantityButton}
          onClick={() => updateValue(Number(value) + 1)}
          disabled={Number(value) >= stock}
        >
          +
        </button>
      </div>
    </div>
  );
}

function GenericAddonQuantityRow({ label, description, price, available, type, value, onChange, currencySettings }) {
  const stock = Number(available ?? 0);

  const updateValue = (nextValue) => {
    const normalized = Math.max(0, Math.min(stock, Number(nextValue) || 0));
    onChange(normalized);
  };

  return (
    <div style={ds.addonQuantityRow}>
      <div>
        <div style={ds.addonQuantityLabel}>{label}</div>
        <div style={ds.addonQuantityMeta}>
          {formatCurrencyAmount(price, currencySettings)} {type === "DAILY" ? "per day" : "each"} · {stock} available
        </div>
        {description ? (
          <div style={{ color: "#64748b", fontSize: "12px", marginTop: "4px" }}>
            {description}
          </div>
        ) : null}
      </div>
      <div style={ds.quantityStepper}>
        <button
          type="button"
          style={ds.quantityButton}
          onClick={() => updateValue(value - 1)}
          disabled={value <= 0}
        >
          -
        </button>
        <input
          type="number"
          min="0"
          max={stock}
          value={value}
          onChange={(event) => updateValue(event.target.value)}
          style={ds.quantityInput}
        />
        <button
          type="button"
          style={ds.quantityButton}
          onClick={() => updateValue(Number(value) + 1)}
          disabled={Number(value) >= stock}
        >
          +
        </button>
      </div>
    </div>
  );
}

// --------------------------------------------------------------
// Funksione ndihmëse jashtë komponentëve
// --------------------------------------------------------------
function buildHeroSummary(vehicle, currencySettings) {
  return [
    vehicle.categoryName || "Vehicle",
    vehicle.year || null,
    formatCurrencyPerDay(vehicle.dailyRate, currencySettings),
    vehicle.locationName || "Location not set",
  ]
    .filter(Boolean)
    .join(" - ");
}

function formatEnumLabel(value) {
  if (!value) return "N/A";
  return value
    .toString()
    .toLowerCase()
    .split("_")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

function formatDateOnly(value) {
  if (!value) return "-";
  return new Date(value).toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function calculateRentalDays(startDate, endDate) {
  if (!startDate || !endDate) return 0;
  const start = new Date(startDate);
  const end = new Date(endDate);
  const msPerDay = 1000 * 60 * 60 * 24;
  const diff = Math.round((end - start) / msPerDay);
  if (isNaN(diff) || diff < 0) return 0;
  return Math.max(diff + 1, 1);
}

function onlyDigits(value) {
  return (value || "").replace(/\D/g, "");
}

function formatCardNumber(value) {
  return onlyDigits(value).slice(0, 19).replace(/(.{4})/g, "$1 ").trim();
}

function getTodayDateString() {
  return new Date().toISOString().split("T")[0];
}

function isDriverLicenseVerified(license) {
  return Boolean(license?.isVerified ?? license?.verified ?? license?.verifiedAt);
}

function bookingRequiresCash(booking) {
  return Boolean(booking?.specialRequest && String(booking.specialRequest).trim());
}

// --------------------------------------------------------------
// Stilet (ds)
// --------------------------------------------------------------
const ds = {
  container: { width: "100%", color: "white" },
  topbar: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "35px",
    gap: "20px",
    flexWrap: "wrap",
  },
  title: { fontSize: "30px", fontWeight: "700", margin: 0 },
  subtitle: { marginTop: "6px", color: "#94a3b8", fontSize: "14px" },
  actions: {
    display: "flex",
    alignItems: "center",
    gap: "15px",
    flexWrap: "wrap",
  },
  searchBox: {
    display: "flex",
    alignItems: "center",
    background: "#111827",
    padding: "12px 16px",
    borderRadius: "14px",
    width: "250px",
    border: "1px solid #1e293b",
  },
  searchInput: {
    background: "transparent",
    border: "none",
    outline: "none",
    color: "white",
    marginLeft: "10px",
    width: "100%",
  },
  selectWrap: {
    position: "relative",
    display: "flex",
    alignItems: "center",
    background: "#111827",
    border: "1px solid #1e293b",
    borderRadius: "14px",
    paddingLeft: "12px",
  },
  locationSelect: {
    appearance: "none",
    background: "transparent",
    border: "none",
    color: "#3b82f6",
    padding: "12px 34px 12px 8px",
    outline: "none",
    minWidth: "140px",
    cursor: "pointer",
    fontWeight: 600,
  },
  selectChevron: {
    position: "absolute",
    right: "12px",
    pointerEvents: "none",
  },
  iconButton: {
    width: "42px",
    height: "42px",
    borderRadius: "12px",
    background: "#111827",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    border: "1px solid #1e293b",
    color: "white",
    cursor: "pointer",
    position: "relative",
  },
  closeIconButton: {
    border: "none",
    background: "transparent",
    color: "#94a3b8",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  avatarButton: {
    border: "none",
    background: "transparent",
    padding: 0,
    borderRadius: "999px",
    cursor: "pointer",
  },
  avatar: {
    width: "42px",
    height: "42px",
    borderRadius: "50%",
    objectFit: "cover",
    border: "2px solid #3b82f6",
  },
  hero: {
    background: "#111827",
    borderRadius: "28px",
    padding: "40px",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "20px",
    border: "1px solid #1e293b",
    flexWrap: "wrap",
    gap: "20px",
  },
  heroTitle: { fontSize: "38px", fontWeight: "800", maxWidth: "500px", marginBottom: "15px" },
  heroText: { color: "#94a3b8", marginBottom: "20px", lineHeight: 1.5 },
  heroBtn: {
    background: "#3b82f6",
    color: "white",
    border: "none",
    padding: "14px 28px",
    borderRadius: "12px",
    cursor: "pointer",
    fontWeight: "600",
  },
  heroImg: {
    width: "420px",
    maxWidth: "100%",
    objectFit: "cover",
    borderRadius: "22px",
    minHeight: "220px",
  },
  errorBanner: {
    background: "rgba(127, 29, 29, 0.25)",
    color: "#fecaca",
    border: "1px solid #7f1d1d",
    borderRadius: "14px",
    padding: "12px 14px",
    marginBottom: "20px",
  },
  resultsSummary: {
    color: "#94a3b8",
    marginBottom: "20px",
    fontSize: "14px",
  },
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
    gap: "25px",
  },
  emptyState: {
    background: "#111827",
    borderRadius: "18px",
    border: "1px solid #1e293b",
    padding: "24px",
    color: "#94a3b8",
    display: "grid",
    gap: "8px",
  },
  card: { background: "#111827", borderRadius: "24px", padding: "25px", border: "1px solid #1e293b" },
  cardHeader: {
    display: "flex",
    justifyContent: "space-between",
    gap: "12px",
    alignItems: "center",
  },
  cardTitle: { marginBottom: "10px", marginTop: 0 },
  cardMeta: { color: "#94a3b8", marginTop: 0, marginBottom: "16px" },
  cardImg: { width: "100%", height: "190px", objectFit: "cover", borderRadius: "18px" },
  cardSpecs: { display: "flex", gap: "10px", flexWrap: "wrap", marginTop: "16px" },
  specPill: {
    display: "flex",
    alignItems: "center",
    gap: "6px",
    background: "#0f172a",
    border: "1px solid #1e293b",
    borderRadius: "999px",
    padding: "8px 10px",
    color: "#cbd5e1",
    fontSize: "12px",
  },
  cardBottom: { marginTop: "20px", display: "flex", justifyContent: "space-between", alignItems: "center" },
  rentedMeta: { color: "#fbbf24", fontSize: "11px", textAlign: "right", maxWidth: "160px", lineHeight: 1.4 },
  detailsBtn: {
    background: "#3b82f6",
    border: "none",
    color: "white",
    padding: "10px 20px",
    borderRadius: "10px",
    cursor: "pointer",
  },
  statusBadge: {
    background: "rgba(59,130,246,0.16)",
    color: "#60a5fa",
    padding: "6px 10px",
    borderRadius: "999px",
    fontSize: "12px",
    fontWeight: 700,
  },
  modalOverlay: {
    position: "fixed",
    inset: 0,
    background: "rgba(2, 6, 23, 0.72)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "24px",
    zIndex: 1000,
  },
  modalCard: {
    width: "min(1220px, 100%)",
    background: "#0f172a",
    border: "1px solid #1e293b",
    borderRadius: "28px",
    padding: "24px",
    boxShadow: "0 30px 70px rgba(0,0,0,0.45)",
    maxHeight: "90vh",
    overflowY: "auto",
  },
  modalHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: "16px",
    marginBottom: "18px",
  },
  modalTitle: { margin: 0, fontSize: "30px" },
  modalSubtitle: { marginTop: "8px", color: "#94a3b8" },
  modalContent: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 340px), 1fr))",
    gap: "24px",
    alignItems: "start",
  },
  galleryWrap: {
    display: "grid",
    gap: "14px",
  },
  modalImageFrame: {
    position: "relative",
    minHeight: "500px",
    borderRadius: "24px",
    overflow: "hidden",
    border: "1px solid #1e293b",
    background: "#111827",
  },
  modalImage: {
    width: "100%",
    height: "100%",
    minHeight: "500px",
    objectFit: "cover",
    display: "block",
  },
  galleryArrow: {
    position: "absolute",
    top: "50%",
    transform: "translateY(-50%)",
    width: "44px",
    height: "44px",
    borderRadius: "999px",
    border: "1px solid rgba(255,255,255,0.12)",
    background: "rgba(15, 23, 42, 0.78)",
    color: "#fff",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    cursor: "pointer",
    backdropFilter: "blur(6px)",
  },
  galleryArrowLeft: { left: "16px" },
  galleryArrowRight: { right: "16px" },
  galleryCounter: {
    position: "absolute",
    bottom: "16px",
    right: "16px",
    padding: "8px 12px",
    borderRadius: "999px",
    background: "rgba(15, 23, 42, 0.82)",
    border: "1px solid rgba(255,255,255,0.08)",
    color: "#e2e8f0",
    fontSize: "13px",
    fontWeight: 700,
  },
  thumbnailRow: {
    display: "flex",
    gap: "10px",
    flexWrap: "wrap",
  },
  thumbnailButton: {
    width: "92px",
    height: "68px",
    padding: "3px",
    borderRadius: "14px",
    border: "1px solid #1e293b",
    background: "#111827",
    cursor: "pointer",
    overflow: "hidden",
    opacity: 0.72,
  },
  thumbnailButtonActive: {
    border: "1px solid #3b82f6",
    opacity: 1,
    boxShadow: "0 0 0 1px rgba(59,130,246,0.25)",
  },
  thumbnailImage: {
    width: "100%",
    height: "100%",
    objectFit: "cover",
    borderRadius: "10px",
    display: "block",
  },
  modalInfo: { display: "grid", gap: "16px" },
  modalPriceRow: {
    display: "flex",
    justifyContent: "space-between",
    gap: "12px",
    alignItems: "center",
  },
  modalPrice: {
    display: "flex",
    alignItems: "baseline",
    gap: "6px",
    fontSize: "18px",
    color: "#cbd5e1",
  },
  primaryActionBtn: {
    background: "#2563eb",
    border: "none",
    color: "#fff",
    padding: "12px 18px",
    borderRadius: "12px",
    cursor: "pointer",
    fontWeight: 700,
  },
  secondaryActionBtn: {
    background: "transparent",
    border: "1px solid #334155",
    color: "#fff",
    padding: "12px 18px",
    borderRadius: "12px",
    cursor: "pointer",
    fontWeight: 600,
  },
  disabledActionBtn: {
    opacity: 0.55,
    cursor: "not-allowed",
  },
  modalGrid: { display: "grid", gap: "12px" },
  detailRow: {
    display: "flex",
    justifyContent: "space-between",
    gap: "12px",
    alignItems: "center",
    background: "#111827",
    border: "1px solid #1f2937",
    borderRadius: "14px",
    padding: "12px 14px",
  },
  detailRowLabel: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    color: "#94a3b8",
    fontSize: "14px",
  },
  detailRowValue: { fontWeight: 600, textAlign: "right" },
  detailSection: {
    background: "#111827",
    border: "1px solid #1f2937",
    borderRadius: "14px",
    padding: "14px",
  },
  detailLabel: { color: "#94a3b8", fontSize: "13px", marginBottom: "6px" },
  detailValue: { fontWeight: 600 },
  reviewSection: {
    background: "#111827",
    border: "1px solid #1f2937",
    borderRadius: "14px",
    padding: "14px",
    display: "grid",
    gap: "12px",
  },
  reviewSectionHeader: {
    display: "flex",
    justifyContent: "space-between",
    gap: "12px",
    alignItems: "flex-start",
  },
  reviewSummary: { color: "#cbd5e1", fontWeight: 700 },
  reviewList: { display: "grid", gap: "10px" },
  reviewItem: {
    background: "#0b1220",
    border: "1px solid #1f2937",
    borderRadius: "12px",
    padding: "12px",
  },
  reviewItemHeader: {
    display: "flex",
    justifyContent: "space-between",
    gap: "10px",
    alignItems: "flex-start",
  },
  reviewCustomer: { color: "#fff", fontWeight: 700, fontSize: "13px" },
  reviewDate: { color: "#64748b", fontSize: "12px", marginTop: "3px" },
  reviewStars: { display: "flex", gap: "2px", color: "#fbbf24" },
  reviewComment: { color: "#cbd5e1", lineHeight: 1.5, margin: "10px 0 0", fontSize: "13px" },
  reviewEmpty: { color: "#64748b", fontSize: "13px" },
  reviewError: { color: "#fecaca", fontSize: "13px" },
  bookingGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 220px), 1fr))",
    gap: "12px",
  },
  fieldGroup: {
    display: "grid",
    gap: "8px",
  },
  fieldLabel: {
    color: "#94a3b8",
    fontSize: "13px",
    fontWeight: 700,
  },
  input: {
    width: "100%",
    background: "#111827",
    border: "1px solid #334155",
    color: "#fff",
    borderRadius: "12px",
    padding: "12px 14px",
    outline: "none",
  },
  textarea: {
    width: "100%",
    resize: "vertical",
    background: "#111827",
    border: "1px solid #334155",
    color: "#fff",
    borderRadius: "12px",
    padding: "12px 14px",
    outline: "none",
    fontFamily: "inherit",
  },
  helperText: {
    color: "#64748b",
    fontSize: "12px",
    lineHeight: 1.4,
  },
  pricePanel: {
    background: "#111827",
    border: "1px solid #1f2937",
    borderRadius: "16px",
    padding: "16px",
    display: "grid",
    gap: "12px",
  },
  paymentHeader: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
    paddingBottom: "12px",
    borderBottom: "1px solid #334155",
  },
  methodToggle: {
    display: "grid",
    gridTemplateColumns: "repeat(2, 1fr)",
    gap: "10px",
  },
  methodBtn: {
    border: "1px solid #334155",
    background: "#111827",
    color: "#94a3b8",
    borderRadius: "12px",
    padding: "12px 14px",
    cursor: "pointer",
    fontWeight: 800,
  },
  methodBtnActive: {
    border: "1px solid rgba(96,165,250,0.55)",
    background: "rgba(37,99,235,0.22)",
    color: "#fff",
  },
  priceLine: {
    display: "flex",
    justifyContent: "space-between",
    gap: "12px",
    color: "#cbd5e1",
  },
  addonQuantityRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: "12px",
    padding: "12px",
    background: "#0b1220",
    border: "1px solid #1f2937",
    borderRadius: "12px",
    flexWrap: "wrap",
  },
  addonQuantityLabel: {
    color: "#fff",
    fontWeight: 700,
  },
  addonQuantityMeta: {
    color: "#94a3b8",
    fontSize: "12px",
    marginTop: "4px",
  },
  quantityStepper: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
  },
  quantityButton: {
    width: "34px",
    height: "34px",
    borderRadius: "10px",
    border: "1px solid #334155",
    background: "#111827",
    color: "#fff",
    fontWeight: 800,
    cursor: "pointer",
  },
  quantityInput: {
    width: "58px",
    height: "34px",
    borderRadius: "10px",
    border: "1px solid #334155",
    background: "#020617",
    color: "#fff",
    textAlign: "center",
  },
  totalRow: {
    display: "flex",
    justifyContent: "space-between",
    gap: "12px",
    paddingTop: "12px",
    borderTop: "1px solid #334155",
    fontSize: "16px",
  },
  successBannerCompact: {
    background: "rgba(20, 83, 45, 0.25)",
    color: "#bbf7d0",
    border: "1px solid #14532d",
    borderRadius: "14px",
    padding: "12px 14px",
  },
  errorBannerCompact: {
    background: "rgba(127, 29, 29, 0.25)",
    color: "#fecaca",
    border: "1px solid #7f1d1d",
    borderRadius: "14px",
    padding: "12px 14px",
  },
  infoBannerCompact: {
    background: "rgba(30, 64, 175, 0.18)",
    color: "#bfdbfe",
    border: "1px solid rgba(96, 165, 250, 0.45)",
    borderRadius: "14px",
    padding: "12px 14px",
  },
  licensePromptOverlay: {
    position: "fixed",
    inset: 0,
    background: "rgba(2, 6, 23, 0.78)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "24px",
    zIndex: 1100,
  },
  licensePromptCard: {
    width: "min(440px, 100%)",
    background: "#0f172a",
    border: "1px solid #334155",
    borderRadius: "20px",
    padding: "22px",
    boxShadow: "0 25px 70px rgba(0,0,0,0.45)",
  },
  licensePromptTitle: { margin: 0, color: "#fff", fontSize: "22px" },
  licensePromptText: { color: "#cbd5e1", lineHeight: 1.55, margin: "12px 0 18px" },
  licensePromptActions: { display: "flex", justifyContent: "flex-end", gap: "10px", flexWrap: "wrap" },
};








