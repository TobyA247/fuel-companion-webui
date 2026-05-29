const storageKeys = {
  webhookUrl: "fuel-companion-webhook-url",
  agentKey: "fuel-companion-agent-key",
  country: "fuel-companion-country",
  fuelType: "fuel-companion-fuel-type",
  fuelRemainingPercent: "fuel-companion-fuel-remaining-percent",
  distanceRemainingMiles: "fuel-companion-distance-remaining-miles",
  requireOpenNow: "fuel-companion-require-open-now",
  originLabel: "fuel-companion-origin-label",
  originLat: "fuel-companion-origin-lat",
  originLng: "fuel-companion-origin-lng",
  destinationLabel: "fuel-companion-destination-label",
  destinationLat: "fuel-companion-destination-lat",
  destinationLng: "fuel-companion-destination-lng",
  deCooldownUntil: "fuel-companion-de-cooldown-until"
};

const defaultWebhookUrl = "";

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
  scenarioPreset: document.getElementById("scenarioPreset"),
  originLabel: document.getElementById("originLabel"),
  originSearch: document.getElementById("originSearch"),
  originSearchButton: document.getElementById("originSearchButton"),
  originLat: document.getElementById("originLat"),
  originLng: document.getElementById("originLng"),
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
  nearbyFuelButton: document.getElementById("nearbyFuelButton"),
  pingFuelButton: document.getElementById("pingFuelButton"),
  saveDestinationButton: document.getElementById("saveDestinationButton"),
  saveSettingsButton: document.getElementById("saveSettingsButton"),
  rateLimitBanner: document.getElementById("rateLimitBanner"),
  statusBanner: document.getElementById("statusBanner"),
  searchBanner: document.getElementById("searchBanner"),
  activeDestinationSummary: document.getElementById("activeDestinationSummary"),
  resultMessage: document.getElementById("resultMessage"),
  resultJson: document.getElementById("resultJson"),
  resultCards: document.getElementById("resultCards"),
  resultDelta: document.getElementById("resultDelta"),
  motorwayCard: document.getElementById("motorwayCard"),
  offMotorwayCard: document.getElementById("offMotorwayCard"),
  nearbyThirdCard: document.getElementById("nearbyThirdCard"),
  motorwayTitle: document.getElementById("motorwayTitle"),
  offMotorwayTitle: document.getElementById("offMotorwayTitle"),
  motorwayPrice: document.getElementById("motorwayPrice"),
  motorwayName: document.getElementById("motorwayName"),
  motorwayMeta: document.getElementById("motorwayMeta"),
  motorwayAddress: document.getElementById("motorwayAddress"),
  motorwayNote: document.getElementById("motorwayNote"),
  offMotorwayPrice: document.getElementById("offMotorwayPrice"),
  offMotorwayName: document.getElementById("offMotorwayName"),
  offMotorwayMeta: document.getElementById("offMotorwayMeta"),
  offMotorwayAddress: document.getElementById("offMotorwayAddress"),
  offMotorwayNote: document.getElementById("offMotorwayNote"),
  nearbyThirdTitle: document.getElementById("nearbyThirdTitle"),
  nearbyThirdPrice: document.getElementById("nearbyThirdPrice"),
  nearbyThirdName: document.getElementById("nearbyThirdName"),
  nearbyThirdMeta: document.getElementById("nearbyThirdMeta"),
  nearbyThirdAddress: document.getElementById("nearbyThirdAddress"),
  nearbyThirdNote: document.getElementById("nearbyThirdNote")
};

const deCooldownMs = 5 * 60 * 1000;
let inFlightRequest = false;
let deCooldownTimer = null;

const scenarioPresets = {
  "uk-dover-m20-live": {
    country: "uk",
    originLat: 51.468,
    originLng: 0.192,
    originLabel: "M20 near Dartford",
    point1Lat: 51.468,
    point1Lng: 0.192,
    point2Lat: 51.485,
    point2Lng: 0.26,
    destinationLat: 51.129,
    destinationLng: 1.308,
    destinationLabel: "Dover"
  },
  "uk-leeds-m1-woolley-edge": {
    country: "uk",
    originLat: 53.5536,
    originLng: -1.5669,
    originLabel: "M1 near Barnsley",
    point1Lat: 53.5536,
    point1Lng: -1.5669,
    point2Lat: 53.5758,
    point2Lng: -1.5602,
    destinationLat: 53.797418,
    destinationLng: -1.543794,
    destinationLabel: "Leeds"
  },
  "be-antwerp-rotterdam": {
    country: "be",
    originLat: 51.2194,
    originLng: 4.4025,
    originLabel: "Antwerp",
    point1Lat: 51.2194,
    point1Lng: 4.4025,
    point2Lat: 51.5,
    point2Lng: 4.44,
    destinationLat: 51.9244,
    destinationLng: 4.4777,
    destinationLabel: "Rotterdam"
  },
  "de-kassel-wuerzburg": {
    country: "de",
    originLat: 51.26762,
    originLng: 9.51833,
    originLabel: "Kassel Ost",
    point1Lat: 51.26762,
    point1Lng: 9.51833,
    point2Lat: 51.18,
    point2Lng: 9.62,
    destinationLat: 49.7913,
    destinationLng: 9.9534,
    destinationLabel: "Wuerzburg"
  },
  "fr-angres-reims": {
    country: "fr",
    originLat: 50.418,
    originLng: 2.72,
    originLabel: "Aire d'Angres",
    point1Lat: 50.418,
    point1Lng: 2.72,
    point2Lat: 50.35,
    point2Lng: 2.86,
    destinationLat: 49.2583,
    destinationLng: 4.0317,
    destinationLabel: "Reims"
  }
};

function loadSavedSettings() {
  const savedWebhookUrl = localStorage.getItem(storageKeys.webhookUrl) || defaultWebhookUrl;
  elements.webhookUrl.value = savedWebhookUrl.replace("/webhook-test/", "/webhook/");
  elements.agentKey.value = localStorage.getItem(storageKeys.agentKey) || "";
  elements.country.value = localStorage.getItem(storageKeys.country) || "auto";
  elements.fuelType.value = localStorage.getItem(storageKeys.fuelType) || "diesel";
  elements.fuelRemainingPercent.value = localStorage.getItem(storageKeys.fuelRemainingPercent) || "50";
  elements.distanceRemainingMiles.value = localStorage.getItem(storageKeys.distanceRemainingMiles) || "45";
  elements.requireOpenNow.checked = (localStorage.getItem(storageKeys.requireOpenNow) ?? "true") === "true";
  elements.originLabel.value = localStorage.getItem(storageKeys.originLabel) || elements.originLabel.value;
  elements.originLat.value = localStorage.getItem(storageKeys.originLat) || elements.originLat.value;
  elements.originLng.value = localStorage.getItem(storageKeys.originLng) || elements.originLng.value;
  elements.destinationLabel.value = localStorage.getItem(storageKeys.destinationLabel) || elements.destinationLabel.value;
  elements.destinationLat.value = localStorage.getItem(storageKeys.destinationLat) || elements.destinationLat.value;
  elements.destinationLng.value = localStorage.getItem(storageKeys.destinationLng) || elements.destinationLng.value;
  renderActiveDestination();
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

function saveDestination() {
  const originLabel = elements.originLabel.value.trim();
  const originLat = numberFromField(elements.originLat, "Start latitude");
  const originLng = numberFromField(elements.originLng, "Start longitude");
  const label = elements.destinationLabel.value.trim();
  const lat = numberFromField(elements.destinationLat, "Destination latitude");
  const lng = numberFromField(elements.destinationLng, "Destination longitude");
  if (!originLabel) {
    throw new Error("Start name is required.");
  }
  if (!label) {
    throw new Error("Destination name is required.");
  }
  localStorage.setItem(storageKeys.originLabel, originLabel);
  localStorage.setItem(storageKeys.originLat, formatCoordinate(originLat));
  localStorage.setItem(storageKeys.originLng, formatCoordinate(originLng));
  localStorage.setItem(storageKeys.destinationLabel, label);
  localStorage.setItem(storageKeys.destinationLat, formatCoordinate(lat));
  localStorage.setItem(storageKeys.destinationLng, formatCoordinate(lng));
  elements.originLat.value = formatCoordinate(originLat);
  elements.originLng.value = formatCoordinate(originLng);
  elements.destinationLat.value = formatCoordinate(lat);
  elements.destinationLng.value = formatCoordinate(lng);
  renderActiveDestination();
}

function handleSaveDestination() {
  try {
    saveDestination();
    setStatus("Route saved on this device.", "ok");
  } catch (error) {
    setStatus(error.message, "error");
  }
}

function handleSaveSettings() {
  saveSettings();
  setStatus("Settings saved on this device.", "ok");
}

function setStatus(message, tone = "neutral") {
  elements.statusBanner.textContent = message;
  elements.statusBanner.className = `status-banner ${tone}`;
}

function setButtonsDisabled(disabled) {
  [
    elements.quickGeoButton,
    elements.tripGeoButton,
    elements.originSearchButton,
    elements.destinationSearchButton,
    elements.nearbyFuelButton,
    elements.pingFuelButton,
    elements.saveDestinationButton
  ].forEach((button) => {
    if (button) {
      button.disabled = disabled;
    }
  });
}

function getDeCooldownUntil() {
  const rawValue = localStorage.getItem(storageKeys.deCooldownUntil);
  const value = Number(rawValue || 0);
  return Number.isFinite(value) ? value : 0;
}

function setDeCooldownUntil(timestamp) {
  if (!timestamp) {
    localStorage.removeItem(storageKeys.deCooldownUntil);
    return;
  }
  localStorage.setItem(storageKeys.deCooldownUntil, String(timestamp));
}

function formatRemainingCooldown(ms) {
  const totalSeconds = Math.max(0, Math.ceil(ms / 1000));
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
}

function renderDeCooldown() {
  const cooldownUntil = getDeCooldownUntil();
  const remaining = cooldownUntil - Date.now();
  const active = remaining > 0;

  elements.rateLimitBanner.classList.toggle("hidden", !active);
  elements.quickSendButton.disabled = inFlightRequest || active;
  elements.tripSendButton.disabled = inFlightRequest || active;

  if (!active) {
    elements.rateLimitBanner.textContent = "";
    if (deCooldownTimer) {
      window.clearTimeout(deCooldownTimer);
      deCooldownTimer = null;
    }
    return;
  }

  elements.rateLimitBanner.textContent = `Germany live pricing is rate-limited to one request every 5 minutes. Next DE lookup available in ${formatRemainingCooldown(remaining)}.`;
  deCooldownTimer = window.setTimeout(renderDeCooldown, 1000);
}

function startDeCooldown() {
  setDeCooldownUntil(Date.now() + deCooldownMs);
  renderDeCooldown();
}

function setSearchBanner(message = "", visible = false) {
  elements.searchBanner.textContent = message;
  elements.searchBanner.classList.toggle("hidden", !visible);
}

function formatCoordinate(value) {
  return Number(value).toFixed(6);
}

function wait(ms) {
  return new Promise((resolve) => window.setTimeout(resolve, ms));
}

function renderActiveDestination() {
  const originLabel = elements.originLabel.value.trim();
  const originLat = elements.originLat.value.trim();
  const originLng = elements.originLng.value.trim();
  const label = elements.destinationLabel.value.trim();
  const lat = elements.destinationLat.value.trim();
  const lng = elements.destinationLng.value.trim();
  if (!originLabel || !originLat || !originLng || !label || !lat || !lng) {
    elements.activeDestinationSummary.textContent = "No complete route saved yet.";
    elements.activeDestinationSummary.classList.remove("hidden");
    return;
  }
  elements.activeDestinationSummary.textContent = `Active route: ${originLabel} to ${label}`;
  elements.activeDestinationSummary.classList.remove("hidden");
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
    country: elements.country.value === "auto" ? null : elements.country.value,
    fuel_type: elements.fuelType.value,
    require_open_now: elements.requireOpenNow.checked,
    fuel_remaining_percent: Number(elements.fuelRemainingPercent.value || 0),
    distance_remaining_miles: Number(elements.distanceRemainingMiles.value || 0)
  };
}

function deriveWebhookUrl(path) {
  const rawUrl = elements.webhookUrl.value.trim();
  if (!rawUrl) {
    throw new Error("Enter your webhook URL first.");
  }

  try {
    const url = new URL(rawUrl);
    const prefix = url.pathname.includes("/webhook-test/") ? "/webhook-test/" : "/webhook/";
    const prefixIndex = url.pathname.indexOf(prefix);
    if (prefixIndex >= 0) {
      url.pathname = `${url.pathname.slice(0, prefixIndex)}${prefix}${path}`;
      return url.toString();
    }
  } catch {
    // Fall through to string replacement for partially-entered URLs.
  }

  return rawUrl
    .replace(/\/webhook-test\/[^/?#]+/, `/webhook-test/${path}`)
    .replace(/\/webhook\/[^/?#]+/, `/webhook/${path}`);
}

function readRouteContext() {
  return {
    origin_label: elements.originLabel.value.trim() || null,
    origin_lat: numberFromField(elements.originLat, "Start latitude"),
    origin_lng: numberFromField(elements.originLng, "Start longitude"),
    destination: elements.destinationLabel.value.trim() || "Destination",
    destination_lat: numberFromField(elements.destinationLat, "Destination latitude"),
    destination_lng: numberFromField(elements.destinationLng, "Destination longitude")
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

function clearOptionCard(prefix, fallbackTitle) {
  elements[`${prefix}Price`].textContent = "n/a";
  elements[`${prefix}Name`].textContent = fallbackTitle;
  elements[`${prefix}Meta`].textContent = "";
  elements[`${prefix}Address`].textContent = "";
  elements[`${prefix}Note`].textContent = "";
}

function setRouteResultLayout() {
  elements.motorwayCard.classList.remove("hidden");
  elements.offMotorwayCard.classList.remove("hidden");
  elements.nearbyThirdCard.classList.add("hidden");
  elements.motorwayTitle.textContent = "Motorway";
  elements.offMotorwayTitle.textContent = "Off motorway";
}

function setNearbyResultLayout() {
  elements.motorwayCard.classList.remove("hidden");
  elements.offMotorwayCard.classList.remove("hidden");
  elements.nearbyThirdCard.classList.remove("hidden");
  elements.motorwayTitle.textContent = "Nearby 1";
  elements.offMotorwayTitle.textContent = "Nearby 2";
  elements.nearbyThirdTitle.textContent = "Nearby 3";
}

function formatPrice(option) {
  if (!option || option.price === null || option.price === undefined) {
    return "n/a";
  }

  const amount = Number(option.price).toFixed(3);
  const currency = option.currency || "";
  const unit = option.price_unit || "";
  return `${amount} ${currency}/${unit}`.trim();
}

function formatOptionMeta(option) {
  if (!option) {
    return "";
  }

  const bits = [];
  if (option.brand) {
    bits.push(option.brand);
  }
  if (option.distance_km !== null && option.distance_km !== undefined) {
    bits.push(`${option.distance_km} km away`);
  }
  if (option.estimated_detour_km !== null && option.estimated_detour_km !== undefined) {
    const detourMiles = Number(option.estimated_detour_km) * 0.621371;
    bits.push(`${detourMiles.toFixed(1)} mi detour`);
  }
  if (option.distance_along_route_km !== null && option.distance_along_route_km !== undefined) {
    const routeMiles = Number(option.distance_along_route_km) * 0.621371;
    bits.push(`${routeMiles.toFixed(1)} mi ahead`);
  }
  if (option.price_age_hours !== null && option.price_age_hours !== undefined) {
    bits.push(`price age ${Number(option.price_age_hours).toFixed(1)} h`);
  }
  if (option.opening_status) {
    bits.push(String(option.opening_status).replaceAll("_", " "));
  }
  return bits.join(" | ");
}

function formatOneLineMessage(message) {
  return String(message || "")
    .replaceAll("Off motorway:", "Off M/way:")
    .replaceAll("Off motorway max:", "Off M/way max:");
}

function populateOptionCard(prefix, option, emptyMessage) {
  if (!option) {
    clearOptionCard(prefix, emptyMessage);
    return;
  }

  elements[`${prefix}Price`].textContent = formatPrice(option);
  elements[`${prefix}Name`].textContent = option.name || emptyMessage;
  elements[`${prefix}Meta`].textContent = formatOptionMeta(option);
  elements[`${prefix}Address`].textContent = option.address || "";
  elements[`${prefix}Note`].textContent = option.opening_note || option.selection_reason || "";
}

function renderNearbyResultDetails(data) {
  const nearbyOptions = data.nearby_options || data.carplay_response?.nearby_options || [];
  elements.resultCards.classList.remove("hidden");
  setNearbyResultLayout();
  populateOptionCard("motorway", nearbyOptions[0], "No nearby option returned.");
  populateOptionCard("offMotorway", nearbyOptions[1], "No second nearby option returned.");
  populateOptionCard("nearbyThird", nearbyOptions[2], "No third nearby option returned.");
  elements.resultDelta.textContent = nearbyOptions.length
    ? `${nearbyOptions.length} nearby option${nearbyOptions.length === 1 ? "" : "s"} returned.`
    : "";
  elements.resultDelta.classList.toggle("hidden", nearbyOptions.length === 0);
}

function renderResultDetails(data) {
  if (Array.isArray(data.nearby_options) || Array.isArray(data.carplay_response?.nearby_options)) {
    renderNearbyResultDetails(data);
    return;
  }

  const motorwayOption = data.motorway_option || data.carplay_response?.motorway_option || null;
  const offMotorwayOption = data.off_motorway_option || data.carplay_response?.off_motorway_option || null;
  const pricingModel = data.route_context?.pricing_model || null;

  elements.resultCards.classList.remove("hidden");
  setRouteResultLayout();
  populateOptionCard("motorway", motorwayOption, "No motorway option returned.");
  populateOptionCard("offMotorway", offMotorwayOption, "No off-motorway option returned.");

  if (pricingModel === "official_daily_maximum") {
    elements.resultDelta.textContent = "Belgium uses the official daily maximum price, so motorway and off-motorway values can match by design.";
    elements.resultDelta.classList.remove("hidden");
    return;
  }

  if (pricingModel === "official_weekly_average") {
    elements.resultDelta.textContent = "Netherlands uses an official average fallback, so motorway and off-motorway values can match by design.";
    elements.resultDelta.classList.remove("hidden");
    return;
  }

  const motorwayPrice = motorwayOption?.price;
  const offMotorwayPrice = offMotorwayOption?.price;
  if (motorwayPrice !== null && motorwayPrice !== undefined && offMotorwayPrice !== null && offMotorwayPrice !== undefined) {
    const delta = Number(motorwayPrice) - Number(offMotorwayPrice);
    if (!Number.isNaN(delta)) {
      if (delta === 0) {
        elements.resultDelta.textContent = "Motorway and off-motorway options are priced the same.";
      } else {
        const cheaperLabel = delta < 0 ? "Motorway is cheaper" : "Off motorway is cheaper";
        const deltaValue = Math.abs(delta).toFixed(3);
        const currency = motorwayOption?.currency || offMotorwayOption?.currency || "EUR";
        elements.resultDelta.textContent = `${cheaperLabel} by ${deltaValue} ${currency}/L.`;
      }
      elements.resultDelta.classList.remove("hidden");
      return;
    }
  }

  elements.resultDelta.textContent = "";
  elements.resultDelta.classList.add("hidden");
}

async function sendPayload(payload, options = {}) {
  const { webhookUrl } = readSharedSettings();
  const targetWebhookUrl = options.webhookUrl || webhookUrl;
  const cooldownUntil = getDeCooldownUntil();

  if (cooldownUntil > Date.now()) {
    renderDeCooldown();
    setStatus("Germany live lookup is cooling down. Please wait before sending another request.", "error");
    return;
  }

  inFlightRequest = true;
  renderDeCooldown();
  setButtonsDisabled(true);
  setStatus("Sending request to webhook...", "neutral");

  try {
    const response = await fetch(targetWebhookUrl, {
      method: "POST",
      headers: {
        "Accept": "application/json",
        "Content-Type": "text/plain;charset=UTF-8"
      },
      body: JSON.stringify(payload)
    });

    const data = await response.json();
    const message = formatOneLineMessage(
      data.message || data.carplay_response?.short_message || data.carplay_response?.speak_message || "No message returned."
    );

    elements.resultMessage.value = message;
    elements.resultJson.textContent = JSON.stringify(data, null, 2);
    renderResultDetails(data);
    if (options.notify) {
      await notifyDevice(message);
    }
    if (data.ok && String(data.request?.country || "").toLowerCase() === "de") {
      startDeCooldown();
    }
    setStatus(data.ok ? "Request completed successfully." : "Workflow returned an error.", data.ok ? "ok" : "error");
  } catch (error) {
    elements.resultMessage.value = "";
    elements.resultJson.textContent = JSON.stringify({ error: error.message }, null, 2);
    clearOptionCard("motorway", "No motorway option yet.");
    clearOptionCard("offMotorway", "No off-motorway option yet.");
    clearOptionCard("nearbyThird", "No nearby option yet.");
    elements.resultDelta.textContent = "";
    elements.resultDelta.classList.add("hidden");
    setStatus(error.message || "Request failed.", "error");
  } finally {
    inFlightRequest = false;
    renderDeCooldown();
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
      fuel_type: shared.fuel_type,
      trip_mode: "nearby_now",
      require_open_now: shared.require_open_now,
      fuel_remaining_percent: shared.fuel_remaining_percent,
      distance_remaining_miles: shared.distance_remaining_miles
    };
    if (shared.country) {
      payload.country = shared.country;
    }
    await sendPayload(payload);
  } catch (error) {
    setStatus(error.message, "error");
  }
}

async function handleNearbyFuel() {
  try {
    const shared = readSharedSettings();
    setStatus("Requesting current location for nearby fuel...", "neutral");
    setButtonsDisabled(true);
    const location = await getCurrentLocation();
    populateOrigin(location.lat, location.lng);

    const payload = {
      agent_key: shared.agentKey,
      lat: location.lat,
      lng: location.lng,
      fuel_type: shared.fuel_type,
      trip_mode: "nearby_now",
      require_open_now: shared.require_open_now,
      request_time_utc: new Date().toISOString()
    };
    if (shared.country) {
      payload.country = shared.country;
    } else {
      payload.country = "uk";
    }

    await sendPayload(payload, {
      webhookUrl: deriveWebhookUrl("fuel-companion-nearby-v1"),
      notify: true
    });
  } catch (error) {
    setStatus(error.message, "error");
  } finally {
    setButtonsDisabled(false);
  }
}

async function handleTripFuel() {
  try {
    const shared = readSharedSettings();
    const point1Lat = numberFromField(elements.tripLat, "GPS point 1 latitude");
    const point1Lng = numberFromField(elements.tripLng, "GPS point 1 longitude");
    const point2Lat = numberFromField(elements.quickLat, "GPS point 2 latitude");
    const point2Lng = numberFromField(elements.quickLng, "GPS point 2 longitude");
    const now = new Date();
    const firstTimestamp = new Date(now.getTime() - 30000).toISOString();
    const secondTimestamp = now.toISOString();

    const payload = {
      agent_key: shared.agentKey,
      lat: point2Lat,
      lng: point2Lng,
      ...readRouteContext(),
      gps_trace: [
        {
          lat: point1Lat,
          lng: point1Lng,
          timestamp_utc: firstTimestamp
        },
        {
          lat: point2Lat,
          lng: point2Lng,
          timestamp_utc: secondTimestamp
        }
      ],
      fuel_type: shared.fuel_type,
      trip_mode: "motorway_action_button",
      require_open_now: shared.require_open_now,
      fuel_remaining_percent: shared.fuel_remaining_percent,
      distance_remaining_miles: shared.distance_remaining_miles
    };
    if (shared.country) {
      payload.country = shared.country;
    }
    await sendPayload(payload);
  } catch (error) {
    setStatus(error.message, "error");
  }
}

async function handleFuelPing() {
  try {
    const shared = readSharedSettings();
    const route = readRouteContext();
    if (!route.destination) {
      throw new Error("Save an active destination before using Fuel Ping.");
    }

    setStatus("Collecting first GPS point for fuel ping...", "neutral");
    setButtonsDisabled(true);
    const firstLocation = await getCurrentLocation();
    setStatus("First GPS point captured. Waiting 30 seconds for direction...", "neutral");
    await wait(30000);
    setStatus("Collecting second GPS point for fuel ping...", "neutral");
    const secondLocation = await getCurrentLocation();
    populateOrigin(secondLocation.lat, secondLocation.lng);
    const now = new Date();
    const firstTimestamp = new Date(now.getTime() - 30000).toISOString();
    const secondTimestamp = now.toISOString();

    const payload = {
      agent_key: shared.agentKey,
      lat: secondLocation.lat,
      lng: secondLocation.lng,
      ...route,
      gps_trace: [
        {
          lat: firstLocation.lat,
          lng: firstLocation.lng,
          accuracy_m: firstLocation.accuracy,
          timestamp_utc: firstTimestamp
        },
        {
          lat: secondLocation.lat,
          lng: secondLocation.lng,
          accuracy_m: secondLocation.accuracy,
          timestamp_utc: secondTimestamp
        }
      ],
      fuel_type: shared.fuel_type,
      trip_mode: "motorway_action_button",
      require_open_now: shared.require_open_now,
      fuel_remaining_percent: shared.fuel_remaining_percent,
      distance_remaining_miles: shared.distance_remaining_miles
    };

    if (shared.country) {
      payload.country = shared.country;
    }

    await sendPayload(payload, { notify: true });
  } catch (error) {
    setStatus(error.message, "error");
  } finally {
    setButtonsDisabled(false);
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

  const [, lat, lng, label] = value.split(":");
  elements.destinationLat.value = lat;
  elements.destinationLng.value = lng;
  elements.destinationLabel.value = label;
  elements.destinationSearch.value = label;
  saveDestination();
  saveSettings();
  setSearchBanner(`Preset loaded: ${label}. Country stays on auto unless you override it.`, true);
}

function applyScenarioPreset() {
  const selectedScenario = scenarioPresets[elements.scenarioPreset.value];
  if (!selectedScenario) {
    return;
  }

  elements.country.value = "auto";
  elements.originLat.value = formatCoordinate(selectedScenario.originLat);
  elements.originLng.value = formatCoordinate(selectedScenario.originLng);
  elements.originLabel.value = selectedScenario.originLabel;
  elements.originSearch.value = selectedScenario.originLabel;
  elements.tripLat.value = formatCoordinate(selectedScenario.point1Lat);
  elements.tripLng.value = formatCoordinate(selectedScenario.point1Lng);
  elements.quickLat.value = formatCoordinate(selectedScenario.point2Lat);
  elements.quickLng.value = formatCoordinate(selectedScenario.point2Lng);
  elements.destinationLat.value = formatCoordinate(selectedScenario.destinationLat);
  elements.destinationLng.value = formatCoordinate(selectedScenario.destinationLng);
  elements.destinationLabel.value = selectedScenario.destinationLabel;
  elements.destinationSearch.value = selectedScenario.destinationLabel;
  saveDestination();
  saveSettings();
  setSearchBanner(`Scenario loaded: ${selectedScenario.destinationLabel}. GPS point 1 and point 2 will be sent as a trace.`, true);
}

async function geocodePlace(query, label) {
  if (!query) {
    throw new Error(`Enter a ${label} search first.`);
  }

  if (query.length < 3) {
    throw new Error(`${label} search must be at least 3 characters.`);
  }

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
    throw new Error(`${label} search failed.`);
  }

  const results = await response.json();
  if (!Array.isArray(results) || results.length === 0) {
    throw new Error(`No ${label} match found.`);
  }

  return results[0];
}

async function searchOrigin() {
  const query = elements.originSearch.value.trim();
  setButtonsDisabled(true);
  setStatus("Searching start...", "neutral");
  setSearchBanner("", false);

  try {
    const match = await geocodePlace(query, "start");
    elements.originLat.value = Number(match.lat).toFixed(6);
    elements.originLng.value = Number(match.lon).toFixed(6);
    elements.originLabel.value = match.display_name || query;
    saveDestination();

    setSearchBanner(`Start saved: ${match.display_name || query}`, true);
    setStatus("Start found and saved.", "ok");
  } catch (error) {
    setSearchBanner("", false);
    setStatus(error.message || "Start search failed.", "error");
  } finally {
    setButtonsDisabled(false);
  }
}

async function searchDestination() {
  const query = elements.destinationSearch.value.trim();
  setButtonsDisabled(true);
  setStatus("Searching destination...", "neutral");
  setSearchBanner("", false);

  try {
    const match = await geocodePlace(query, "destination");
    elements.destinationLat.value = Number(match.lat).toFixed(6);
    elements.destinationLng.value = Number(match.lon).toFixed(6);
    elements.destinationLabel.value = match.display_name || query;
    saveDestination();

    setSearchBanner(`Destination saved: ${match.display_name || query}`, true);
    setStatus("Destination found and saved.", "ok");
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
elements.scenarioPreset.addEventListener("change", applyScenarioPreset);
elements.originSearchButton.addEventListener("click", searchOrigin);
elements.destinationSearchButton.addEventListener("click", searchDestination);
elements.saveDestinationButton.addEventListener("click", handleSaveDestination);
elements.quickGeoButton.addEventListener("click", fillLocationForAll);
elements.tripGeoButton.addEventListener("click", fillLocationForAll);
elements.quickSendButton.addEventListener("click", handleQuickFuel);
elements.tripSendButton.addEventListener("click", handleTripFuel);
if (elements.nearbyFuelButton) {
  elements.nearbyFuelButton.addEventListener("click", handleNearbyFuel);
}
if (elements.pingFuelButton) {
  elements.pingFuelButton.addEventListener("click", handleFuelPing);
}
if (elements.saveSettingsButton) {
  elements.saveSettingsButton.addEventListener("click", handleSaveSettings);
}

loadSavedSettings();
clearOptionCard("motorway", "No motorway option yet.");
clearOptionCard("offMotorway", "No off-motorway option yet.");
clearOptionCard("nearbyThird", "No nearby option yet.");
renderDeCooldown();
setStatus("Ready. Paste the current webhook from the Pi helper and add your agent key.", "neutral");
