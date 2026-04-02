const storageKeys = {
  webhookUrl: "fuel-companion-webhook-url",
  agentKey: "fuel-companion-agent-key",
  country: "fuel-companion-country",
  fuelType: "fuel-companion-fuel-type",
  fuelRemainingPercent: "fuel-companion-fuel-remaining-percent",
  distanceRemainingMiles: "fuel-companion-distance-remaining-miles",
  requireOpenNow: "fuel-companion-require-open-now"
};

const elements = {
  webhookUrl: document.getElementById("webhookUrl"),
  agentKey: document.getElementById("agentKey"),
  country: document.getElementById("country"),
  fuelType: document.getElementById("fuelType"),
  fuelRemainingPercent: document.getElementById("fuelRemainingPercent"),
  distanceRemainingMiles: document.getElementById("distanceRemainingMiles"),
  requireOpenNow: document.getElementById("requireOpenNow"),
  quickLat: document.getElementById("quickLat"),
  quickLng: document.getElementById("quickLng"),
  tripLat: document.getElementById("tripLat"),
  tripLng: document.getElementById("tripLng"),
  destinationLabel: document.getElementById("destinationLabel"),
  destinationPreset: document.getElementById("destinationPreset"),
  destinationSearch: document.getElementById("destinationSearch"),
  destinationSearchButton: document.getElementById("destinationSearchButton"),
  destinationLat: document.getElementById("destinationLat"),
  destinationLng: document.getElementById("destinationLng"),
  quickGeoButton: document.getElementById("quickGeoButton"),
  tripGeoButton: document.getElementById("tripGeoButton"),
  quickSendButton: document.getElementById("quickSendButton"),
  tripSendButton: document.getElementById("tripSendButton"),
  statusBanner: document.getElementById("statusBanner"),
  searchBanner: document.getElementById("searchBanner"),
  resultMessage: document.getElementById("resultMessage"),
  resultJson: document.getElementById("resultJson")
};

function loadSavedSettings() {
  elements.webhookUrl.value = localStorage.getItem(storageKeys.webhookUrl) || "https://tobya.app.n8n.cloud/webhook-test/fuel-companion-router-v1";
  elements.agentKey.value = localStorage.getItem(storageKeys.agentKey) || "";
  elements.country.value = localStorage.getItem(storageKeys.country) || "uk";
  elements.fuelType.value = localStorage.getItem(storageKeys.fuelType) || "diesel";
  elements.fuelRemainingPercent.value = localStorage.getItem(storageKeys.fuelRemainingPercent) || "50";
  elements.distanceRemainingMiles.value = localStorage.getItem(storageKeys.distanceRemainingMiles) || "45";
  elements.requireOpenNow.checked = (localStorage.getItem(storageKeys.requireOpenNow) ?? "true") === "true";
}

function saveSettings() {
  localStorage.setItem(storageKeys.webhookUrl, elements.webhookUrl.value.trim());
  localStorage.setItem(storageKeys.agentKey, elements.agentKey.value.trim());
  localStorage.setItem(storageKeys.country, elements.country.value);
  localStorage.setItem(storageKeys.fuelType, elements.fuelType.value);
  localStorage.setItem(storageKeys.fuelRemainingPercent, elements.fuelRemainingPercent.value);
  localStorage.setItem(storageKeys.distanceRemainingMiles, elements.distanceRemainingMiles.value);
  localStorage.setItem(storageKeys.requireOpenNow, String(elements.requireOpenNow.checked));
}

function setStatus(message, tone = "neutral") {
  elements.statusBanner.textContent = message;
  elements.statusBanner.className = `status-banner ${tone}`;
}

function setButtonsDisabled(disabled) {
  [
    elements.quickGeoButton,
    elements.tripGeoButton,
    elements.quickSendButton,
    elements.tripSendButton,
    elements.destinationSearchButton
  ].forEach((button) => {
    button.disabled = disabled;
  });
}

function setSearchBanner(message = "", visible = false) {
  elements.searchBanner.textContent = message;
  elements.searchBanner.classList.toggle("hidden", !visible);
}

function formatCoordinate(value) {
  return Number(value).toFixed(6);
}

function getCurrentLocation() {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error("Geolocation is not available in this browser."));
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        resolve({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
          accuracy: position.coords.accuracy
        });
      },
      (error) => {
        reject(new Error(error.message || "Location request failed."));
      },
      {
        enableHighAccuracy: true,
        timeout: 15000,
        maximumAge: 60000
      }
    );
  });
}

function populateOrigin(lat, lng) {
  const latText = formatCoordinate(lat);
  const lngText = formatCoordinate(lng);
  elements.quickLat.value = latText;
  elements.quickLng.value = lngText;
  elements.tripLat.value = latText;
  elements.tripLng.value = lngText;
}

function readSharedSettings() {
  const webhookUrl = elements.webhookUrl.value.trim();
  const agentKey = elements.agentKey.value.trim();

  if (!webhookUrl) {
    throw new Error("Enter your webhook URL first.");
  }

  if (!agentKey) {
    throw new Error("Enter your agent key first.");
  }

  saveSettings();

  return {
    webhookUrl,
    agentKey,
    country: elements.country.value,
    fuel_type: elements.fuelType.value,
    require_open_now: elements.requireOpenNow.checked,
    fuel_remaining_percent: Number(elements.fuelRemainingPercent.value || 0),
    distance_remaining_miles: Number(elements.distanceRemainingMiles.value || 0)
  };
}

function numberFromField(element, label) {
  const rawValue = String(element.value ?? "").trim();
  if (!rawValue) {
    throw new Error(`${label} is required.`);
  }

  const value = Number(rawValue);
  if (Number.isNaN(value)) {
    throw new Error(`${label} must be numeric.`);
  }
  return value;
}

async function sendPayload(payload) {
  const { webhookUrl } = readSharedSettings();

  setButtonsDisabled(true);
  setStatus("Sending request to webhook...", "neutral");

  try {
    const response = await fetch(webhookUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Accept": "application/json"
      },
      body: JSON.stringify(payload)
    });

    const data = await response.json();
    const message = data.message || data.carplay_response?.short_message || data.carplay_response?.speak_message || "No message returned.";

    elements.resultMessage.value = message;
    elements.resultJson.textContent = JSON.stringify(data, null, 2);
    setStatus(data.ok ? "Request completed successfully." : "Workflow returned an error.", data.ok ? "ok" : "error");
  } catch (error) {
    elements.resultMessage.value = "";
    elements.resultJson.textContent = JSON.stringify({ error: error.message }, null, 2);
    setStatus(error.message || "Request failed.", "error");
  } finally {
    setButtonsDisabled(false);
  }
}

async function handleQuickFuel() {
  try {
    const shared = readSharedSettings();
    const payload = {
      agent_key: shared.agentKey,
      lat: numberFromField(elements.quickLat, "Quick latitude"),
      lng: numberFromField(elements.quickLng, "Quick longitude"),
      country: shared.country,
      fuel_type: shared.fuel_type,
      trip_mode: "nearby_now",
      require_open_now: shared.require_open_now,
      fuel_remaining_percent: shared.fuel_remaining_percent,
      distance_remaining_miles: shared.distance_remaining_miles
    };
    await sendPayload(payload);
  } catch (error) {
    setStatus(error.message, "error");
  }
}

async function handleTripFuel() {
  try {
    const shared = readSharedSettings();
    const payload = {
      agent_key: shared.agentKey,
      lat: numberFromField(elements.tripLat, "Origin latitude"),
      lng: numberFromField(elements.tripLng, "Origin longitude"),
      destination_lat: numberFromField(elements.destinationLat, "Destination latitude"),
      destination_lng: numberFromField(elements.destinationLng, "Destination longitude"),
      destination: elements.destinationLabel.value.trim() || "Destination",
      country: shared.country,
      fuel_type: shared.fuel_type,
      trip_mode: "prefer_motorway",
      require_open_now: shared.require_open_now,
      fuel_remaining_percent: shared.fuel_remaining_percent,
      distance_remaining_miles: shared.distance_remaining_miles
    };
    await sendPayload(payload);
  } catch (error) {
    setStatus(error.message, "error");
  }
}

async function fillLocationForAll() {
  setStatus("Requesting current location from your device...", "neutral");
  try {
    const location = await getCurrentLocation();
    populateOrigin(location.lat, location.lng);
    setStatus(`Location updated. Accuracy about ${Math.round(location.accuracy)} metres.`, "ok");
  } catch (error) {
    setStatus(error.message, "error");
  }
}

function applyPreset() {
  const value = elements.destinationPreset.value;
  if (!value) {
    return;
  }

  const [country, lat, lng, label] = value.split(":");
  elements.country.value = country;
  elements.destinationLat.value = lat;
  elements.destinationLng.value = lng;
  elements.destinationLabel.value = label;
  saveSettings();
  setSearchBanner(`Preset loaded: ${label}.`, true);
}

function mapCountryCode(countryCode) {
  const code = String(countryCode || "").trim().toLowerCase();
  const mapping = {
    gb: "uk",
    uk: "uk",
    fr: "fr",
    be: "be",
    nl: "nl",
    de: "de"
  };
  return mapping[code] || "";
}

async function searchDestination() {
  const query = elements.destinationSearch.value.trim();
  if (!query) {
    setStatus("Enter a destination search first.", "error");
    return;
  }

  if (query.length < 3) {
    setStatus("Destination search must be at least 3 characters.", "error");
    return;
  }

  setButtonsDisabled(true);
  setStatus("Searching destination...", "neutral");
  setSearchBanner("", false);

  try {
    const url = new URL("https://nominatim.openstreetmap.org/search");
    url.searchParams.set("q", query);
    url.searchParams.set("format", "jsonv2");
    url.searchParams.set("limit", "1");
    url.searchParams.set("addressdetails", "1");

    const response = await fetch(url, {
      headers: {
        "Accept": "application/json"
      }
    });

    if (!response.ok) {
      throw new Error("Destination search failed.");
    }

    const results = await response.json();
    if (!Array.isArray(results) || results.length === 0) {
      throw new Error("No destination match found.");
    }

    const match = results[0];
    elements.destinationLat.value = Number(match.lat).toFixed(6);
    elements.destinationLng.value = Number(match.lon).toFixed(6);
    elements.destinationLabel.value = match.display_name || query;

    const resolvedCountry = mapCountryCode(match.address?.country_code);
    if (resolvedCountry) {
      elements.country.value = resolvedCountry;
      saveSettings();
    }

    const summary = [
      match.display_name || query,
      resolvedCountry ? `country set to ${resolvedCountry.toUpperCase()}` : null
    ].filter(Boolean).join(" | ");

    setSearchBanner(summary, true);
    setStatus("Destination found.", "ok");
  } catch (error) {
    setSearchBanner("", false);
    setStatus(error.message || "Destination search failed.", "error");
  } finally {
    setButtonsDisabled(false);
  }
}

[
  elements.webhookUrl,
  elements.agentKey,
  elements.country,
  elements.fuelType,
  elements.fuelRemainingPercent,
  elements.distanceRemainingMiles,
  elements.requireOpenNow
].forEach((element) => {
  element.addEventListener("change", saveSettings);
});

elements.destinationPreset.addEventListener("change", applyPreset);
elements.destinationSearchButton.addEventListener("click", searchDestination);
elements.quickGeoButton.addEventListener("click", fillLocationForAll);
elements.tripGeoButton.addEventListener("click", fillLocationForAll);
elements.quickSendButton.addEventListener("click", handleQuickFuel);
elements.tripSendButton.addEventListener("click", handleTripFuel);

loadSavedSettings();
setStatus("Ready. Add your webhook URL and agent key, then use your location or type coordinates.", "neutral");
