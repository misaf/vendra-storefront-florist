"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { LocateFixed, Loader2 } from "lucide-react";
import type { Locale } from "@/shared/i18n/routing";
import {
  getMapProvider,
  getEffectiveTileProvider,
  getNeshanMapKey,
  getNeshanMapType,
} from "@/shared/lib/map-config";
import { useProperty } from "@/shared/property/property-provider";

/** The slice of a resolved pin the checkout form cares about. */
export interface ResolvedLocation {
  address: string;
  city: string;
  country: string;
  latitude: number;
  longitude: number;
}

interface AddressMapPickerProps {
  /** Last confirmed coordinate, used to centre the map on revisit. */
  value?: { latitude: number; longitude: number } | null;
  onResolve: (location: ResolvedLocation) => void;
  locale: Locale;
  t: (key: string) => string;
}

type Status = "idle" | "moving" | "loading" | "ready" | "error";

/**
 * The handful of Leaflet methods this picker needs. Both the bundled OSM
 * Leaflet and Neshan's CDN Leaflet build satisfy this shape, so the pin +
 * event logic stays identical across providers.
 */
interface LeafletLikeMap {
  on(type: string, fn: () => void): unknown;
  getCenter(): { lat: number; lng: number };
  setView(center: [number, number], zoom?: number): unknown;
  whenReady(fn: () => void): unknown;
  remove(): void;
}

// Last-resort opening view when the property's pin is a place query rather
// than coordinates. Tehran, matching the fleet's primary market.
const FALLBACK_CENTER: [number, number] = [35.6892, 51.389];

/** The property's own pin when it is "lat,lng"; otherwise the fallback. */
function parseMapCenter(mapQuery: string): [number, number] {
  const [lat, lng] = mapQuery.split(",").map((part) => Number(part.trim()));

  return Number.isFinite(lat) && Number.isFinite(lng)
    ? [lat, lng]
    : FALLBACK_CENTER;
}
const DEFAULT_ZOOM = 12;
const RESOLVED_ZOOM = 16;
const SETTLE_DELAY = 700;
const OSM_TILES = "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png";
const NESHAN_SDK_URL = "https://static.neshan.org/sdk/leaflet/1.4.0/leaflet.js";

/** Inject Neshan's Leaflet build once and resolve when `window.L` is ready. */
function loadNeshanSdk(): Promise<void> {
  return new Promise((resolve, reject) => {
    const w = window as unknown as { L?: { Map?: unknown } };
    if (w.L?.Map) return resolve();

    const existing = document.querySelector<HTMLScriptElement>(
      "script[data-neshan-sdk]"
    );
    if (existing) {
      existing.addEventListener("load", () => resolve());
      existing.addEventListener("error", () => reject(new Error("Neshan SDK")));
      return;
    }
    const script = document.createElement("script");
    script.src = NESHAN_SDK_URL;
    script.async = true;
    script.dataset.neshanSdk = "true";
    script.onload = () => resolve();
    script.onerror = () => reject(new Error("Failed to load Neshan SDK"));
    document.body.appendChild(script);
  });
}

/**
 * The Neshan SDK stamps its attribution with inline `!important` styles — 11px
 * in a pale grey that measures ~3.3:1, under the 4.5:1 floor — and places it
 * outside `.leaflet-control-attribution`, so neither specificity nor our
 * stylesheet can reach it. The attribution itself must stay (it is a licence
 * condition), so this only raises what the SDK left below our floors: text
 * size, contrast, and the 24px minimum target height its links owe under WCAG
 * 2.5.8. Nothing is hidden, unlinked or reworded.
 */
function makeAttributionAccessible(container: HTMLElement) {
  const color = getComputedStyle(container)
    .getPropertyValue("--muted-foreground")
    .trim();

  container.querySelectorAll<HTMLElement>("a, span").forEach((node) => {
    const style = getComputedStyle(node);
    const isUndersizedText = parseFloat(style.fontSize) < 12;
    const rect = node.getBoundingClientRect();
    const isUndersizedTarget =
      node.tagName === "A" && (rect.height < 24 || rect.width < 24);

    if (!isUndersizedText && !isUndersizedTarget) return;

    if (isUndersizedText) {
      node.style.setProperty("font-size", "0.75rem", "important");
      if (color) node.style.setProperty("color", color, "important");
    }

    if (node.tagName === "A") {
      // `padding` is locked by the SDK's inline `!important`, so the target is
      // grown with box metrics it does not set.
      node.style.setProperty("display", "inline-flex", "important");
      node.style.setProperty("align-items", "center", "important");
      node.style.setProperty("justify-content", "center", "important");
      node.style.setProperty("min-height", "1.5rem", "important");
      // Logo links carry an <img>, not text, and can be narrower than they are
      // tall — the 24px minimum applies to both axes.
      node.style.setProperty("min-width", "1.5rem", "important");
    }
  });
}

export default function AddressMapPicker({
  value,
  onResolve,
  locale,
  t,
}: AddressMapPickerProps) {
  const defaultCenter = parseMapCenter(useProperty().contact.mapQuery);
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<LeafletLikeMap | null>(null);
  const settleTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const attributionObserver = useRef<MutationObserver | null>(null);
  const requestId = useRef(0);

  // Tiles and geocoding are chosen independently: Neshan tiles need a browser
  // map key, while Neshan geocoding only needs the (server-side) service key.
  const tileProvider = getEffectiveTileProvider();
  const geocodeProvider = getMapProvider();

  const [status, setStatus] = useState<Status>("idle");
  const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(
    value ? { lat: value.latitude, lng: value.longitude } : null
  );
  const [locating, setLocating] = useState(false);

  // Reverse-geocode the pinned point. Neshan runs through our server route
  // (keeps the service key private); OSM hits Nominatim straight from here.
  const resolve = useCallback(
    async (lat: number, lng: number) => {
      const id = ++requestId.current;
      setStatus("loading");
      setCoords({ lat, lng });
      try {
        let address = "";
        let city = "";
        let country = "";

        if (geocodeProvider === "neshan") {
          const res = await fetch(
            `/api/geocode/reverse?lat=${lat}&lng=${lng}&locale=${locale}`
          );
          if (!res.ok) throw new Error(`Reverse failed: ${res.status}`);
          const data = await res.json();
          if (id !== requestId.current) return;
          address = data.address ?? "";
          city = data.city ?? "";
          country = data.country ?? "";
        } else {
          const url =
            `https://nominatim.openstreetmap.org/reverse?format=jsonv2` +
            `&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1` +
            `&accept-language=${locale}`;
          const res = await fetch(url, { headers: { Accept: "application/json" } });
          if (!res.ok) throw new Error(`Reverse failed: ${res.status}`);
          const data = await res.json();
          if (id !== requestId.current) return;

          const a = data.address ?? {};
          const sep = locale === "fa" ? "، " : ", ";
          const streetLine = [a.road, a.house_number, a.neighbourhood ?? a.suburb ?? a.quarter]
            .filter(Boolean)
            .join(sep);
          address = streetLine || data.name || data.display_name || "";
          city = a.city ?? a.town ?? a.village ?? a.county ?? a.state ?? "";
          country = a.country ?? (data.display_name?.split(",").pop()?.trim() ?? "");
        }

        onResolve({ address, city, country, latitude: lat, longitude: lng });
        setStatus("ready");
      } catch {
        if (id !== requestId.current) return;
        setStatus("error");
      }
    },
    [locale, onResolve, geocodeProvider]
  );

  // Boot the map on the client only; both providers touch `window`.
  useEffect(() => {
    let cancelled = false;

    const wireUp = (map: LeafletLikeMap) => {
      if (cancelled) {
        map.remove();
        return;
      }
      mapRef.current = map;

      map.on("movestart zoomstart", () => {
        if (settleTimer.current) clearTimeout(settleTimer.current);
        setStatus("moving");
      });
      map.on("moveend", () => {
        if (settleTimer.current) clearTimeout(settleTimer.current);
        const c = map.getCenter();
        settleTimer.current = setTimeout(() => resolve(c.lat, c.lng), SETTLE_DELAY);
      });
      // Resolve the opening view so the buyer gets immediate feedback.
      map.whenReady(() => {
        const c = map.getCenter();
        resolve(c.lat, c.lng);

        const container = containerRef.current;
        if (!container) return;
        makeAttributionAccessible(container);
        // Tile providers re-render their attribution as the view changes, so
        // the fix is re-applied rather than run once.
        attributionObserver.current?.disconnect();
        const observer = new MutationObserver(() => makeAttributionAccessible(container));
        observer.observe(container, { childList: true, subtree: true });
        attributionObserver.current = observer;
      });
    };

    (async () => {
      if (!containerRef.current || mapRef.current) return;
      const start: [number, number] = value
        ? [value.latitude, value.longitude]
        : defaultCenter;
      const zoom = value ? RESOLVED_ZOOM : DEFAULT_ZOOM;

      try {
        if (tileProvider === "neshan") {
          await loadNeshanSdk();
          if (cancelled || !containerRef.current) return;
          const w = window as unknown as {
            L?: { Map: new (el: HTMLElement, opts: Record<string, unknown>) => LeafletLikeMap };
          };
          if (!w.L?.Map) throw new Error("Neshan SDK unavailable");
          const isDark = document.documentElement.classList.contains("dark");
          const maptype =
            getNeshanMapType() || (isDark ? "standard-night" : "standard-day");
          wireUp(
            new w.L.Map(containerRef.current, {
              key: getNeshanMapKey(),
              maptype,
              poi: true,
              traffic: false,
              center: start,
              zoom,
            })
          );
        } else {
          const L = (await import("leaflet")).default;
          if (cancelled || !containerRef.current) return;
          const map = L.map(containerRef.current, {
            center: start,
            zoom,
            zoomControl: true,
            attributionControl: true,
          });
          L.tileLayer(OSM_TILES, {
            maxZoom: 19,
            attribution: "© OpenStreetMap",
          }).addTo(map);
          wireUp(map as unknown as LeafletLikeMap);
        }
      } catch {
        if (!cancelled) setStatus("error");
      }
    })();

    return () => {
      cancelled = true;
      if (settleTimer.current) clearTimeout(settleTimer.current);
      attributionObserver.current?.disconnect();
      attributionObserver.current = null;
      mapRef.current?.remove();
      mapRef.current = null;
    };
    // `value` seeds the opening view only; it is intentionally read once here
    // rather than tracked as a dependency.
  }, [resolve, tileProvider]);

  const handleLocate = useCallback(() => {
    if (!navigator.geolocation || !mapRef.current) return;
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLocating(false);
        mapRef.current?.setView(
          [pos.coords.latitude, pos.coords.longitude],
          RESOLVED_ZOOM
        );
      },
      () => {
        setLocating(false);
        setStatus("error");
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  }, []);

  const statusText =
    status === "moving" || status === "loading"
      ? t("checkout.findingAddress")
      : status === "error"
        ? t("checkout.geocodeError")
        : t("checkout.pinHint");

  return (
    <div className="space-y-2.5">
      <div className="flex items-end justify-between gap-3">
        <div>
          <span className="font-mono text-xs uppercase tracking-[0.18em] text-muted-foreground">
            {t("checkout.dropPinEyebrow")}
          </span>
          <p className="text-sm font-medium text-foreground">
            {t("checkout.deliveryLocation")}
          </p>
        </div>
        <button
          type="button"
          onClick={handleLocate}
          disabled={locating}
          className="inline-flex min-h-11 shrink-0 items-center gap-1.5 rounded-full border border-border bg-card px-3 py-1.5 text-xs font-medium text-foreground transition-colors hover:bg-secondary disabled:opacity-60"
        >
          {locating ? (
            <Loader2 className="size-3.5 animate-spin" aria-hidden="true" />
          ) : (
            <LocateFixed className="size-3.5" aria-hidden="true" />
          )}
          {locating ? t("checkout.locating") : t("checkout.useMyLocation")}
        </button>
      </div>

      <div
        data-provider={tileProvider}
        className="golzar-pinmap relative overflow-hidden rounded-xl border border-border bg-muted"
      >
        <div
          ref={containerRef}
          dir="ltr"
          className="h-64 w-full sm:h-80"
          aria-label={t("checkout.deliveryLocation")}
          role="application"
        />

        {/* The single ink accent: a petal-pin fixed at map centre. */}
        <div
          className="golzar-pin"
          data-moving={status === "moving"}
          aria-hidden="true"
        >
          <span className="golzar-pin__shadow" />
          <span className="golzar-pin__drop">
            <span className="golzar-pin__dot" />
          </span>
        </div>

        {/* Live coordinate read-out — data set in mono, design-system style. */}
        {coords && (
          <div className="pointer-events-none absolute bottom-2 left-2 z-[1000] rounded-md bg-card/85 px-2 py-1 font-mono text-xs tracking-wider text-muted-foreground backdrop-blur-sm">
            {coords.lat.toFixed(4)}, {coords.lng.toFixed(4)}
          </div>
        )}
      </div>

      <p
        className="flex items-center gap-1.5 text-xs text-muted-foreground"
        role="status"
        aria-live="polite"
      >
        {(status === "moving" || status === "loading") && (
          <Loader2 className="size-3 animate-spin" aria-hidden="true" />
        )}
        {statusText}
      </p>
    </div>
  );
}
