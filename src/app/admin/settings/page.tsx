import { prisma } from "../../../lib/prisma";
import { requireOwner } from "../../../lib/auth-helpers";

export default async function AdminSettings() {
  await requireOwner();
  const settings = await prisma.setting.findMany();
  const map = Object.fromEntries(settings.map((s) => [s.key, s.value]));
  const hours: any = map["shop.hours"] || {};
  const delivery: any = map["shop.delivery"] || {};

  return (
    <div className="ad-page">
      <div className="ad-page-head">
        <div className="ad-page-head-text">
          <span className="ad-eyebrow">Configuration</span>
          <h1 className="ad-h1">Settings</h1>
          <p className="ad-h1-sub">Owner-only. Shop hours, delivery windows, integrations.</p>
        </div>
      </div>

      <div className="ad-form-section">
        <h3>Opening hours</h3>
        <div style={{ display: "grid", gridTemplateColumns: "120px 1fr 1fr auto", gap: 10, alignItems: "center" }}>
          {["mon","tue","wed","thu","fri","sat","sun"].map((day) => (
            <React.Fragment key={day}>
              <span style={{ fontSize: 13, textTransform: "capitalize" }}>{day}</span>
              <input className="ad-input" defaultValue={hours[day]?.open || "—"} disabled={!hours[day]?.on} />
              <input className="ad-input" defaultValue={hours[day]?.close || "—"} disabled={!hours[day]?.on} />
              <label style={{ display: "inline-flex", alignItems: "center", gap: 6, fontSize: 12, color: "var(--ad-ink-mute)" }}>
                <input type="checkbox" defaultChecked={!!hours[day]?.on} /> open
              </label>
            </React.Fragment>
          ))}
        </div>
      </div>

      <div className="ad-form-section">
        <h3>Same-day delivery</h3>
        <div className="ad-form-row-2">
          <div className="ad-form-row" style={{ marginBottom: 0 }}>
            <label>Order before</label>
            <input className="ad-input" defaultValue={delivery.sameDayCutoff || "12:00"} />
          </div>
          <div className="ad-form-row" style={{ marginBottom: 0 }}>
            <label>Last slot</label>
            <input className="ad-input" defaultValue={delivery.lastSlot || "18:00"} />
          </div>
        </div>
        <div className="ad-form-row" style={{ marginTop: 14 }}>
          <label>Delivery windows</label>
          <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
            {(delivery.windows || []).map((s: string) => (
              <span key={s} className="ad-pill ad-pill--ready" style={{ padding: "5px 10px", fontSize: 11 }}>{s}</span>
            ))}
          </div>
        </div>
      </div>

      <p style={{ color: "var(--ad-ink-mute)", fontSize: 13, marginTop: 16 }}>
        Saving wiring (PATCH /api/admin/settings) is the next-pass task — values shown here are read from the seed.
      </p>
    </div>
  );
}

import React from "react";
