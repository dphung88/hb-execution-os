import nodemailer from "nodemailer";

export function createMailTransport() {
  const user = process.env.GMAIL_USER;
  const pass = process.env.GMAIL_APP_PASSWORD;

  if (!user || !pass) {
    throw new Error("GMAIL_USER and GMAIL_APP_PASSWORD env vars are required");
  }

  return nodemailer.createTransport({
    service: "gmail",
    auth: { user, pass },
  });
}

export async function sendEmail(opts: {
  to: string;
  subject: string;
  html: string;
}) {
  const transporter = createMailTransport();
  const from = process.env.GMAIL_USER!;

  await transporter.sendMail({
    from: `"HB Execution OS" <${from}>`,
    to: opts.to,
    subject: opts.subject,
    html: opts.html,
  });
}
