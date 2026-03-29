const { app } = require("@azure/functions");

/**
 * Business Report — fires every 2h starting 08:00 VN (01:00 UTC)
 *
 * Azure cron format: "seconds minutes hours day month weekday"
 * 0 0 1,3,5,7,9,11,13,15,17,19,21,23 * * *
 *   └─ at minute 0 of hours 1,3,5,...,23 UTC = 08,10,12,...,06 VN
 */
app.timer("sendBusinessReport", {
  schedule: "0 0 1,3,5,7,9,11,13,15,17,19,21,23 * * *",
  runOnStartup: false,

  handler: async (_timer, context) => {
    const endpoint = process.env.REPORT_ENDPOINT ?? "https://vp.edisonyang.store/api/send-report";
    const secret   = process.env.CRON_SECRET ?? "";

    context.log(`[sendBusinessReport] Calling ${endpoint}`);

    try {
      const res = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(secret ? { "x-cron-secret": secret } : {}),
        },
      });

      const body = await res.json().catch(() => ({}));

      if (!res.ok) {
        context.log.error("[sendBusinessReport] HTTP error:", res.status, body);
        throw new Error(`HTTP ${res.status}: ${JSON.stringify(body)}`);
      }

      context.log("[sendBusinessReport] Success:", body);
    } catch (err) {
      context.log.error("[sendBusinessReport] Failed:", err.message ?? err);
      throw err; // re-throw so Azure marks the run as failed
    }
  },
});
