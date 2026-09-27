import { Router, type IRouter } from "express";
import { Resend } from "resend";
import { logger } from "../lib/logger";


const router: IRouter = Router();

// const FROM = "Veltix Agency<team@veltix.in>"; // change to a verified domain sender in production
const FROM = "Veltix Agency<veltixagency@gmail.com>"; // change to a verified domain sender in production
const ADMIN = "veltixagency@gmail.com";
const resend = new Resend(process.env.RESEND_API_KEY);



interface ContactPayload {
  name: string;
  email: string;
  project: string;
  budget: string;
  message: string;
}

function validate(body: Partial<ContactPayload>): string | null {
  const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!body.name?.trim()) return "Name is required.";
  if (!body.email || !emailRe.test(body.email)) return "Valid email required.";
  if (!body.project) return "Project type is required.";
  if (!body.budget) return "Budget is required.";
  if (!body.message?.trim()) return "Message is required.";
  if (body.message.trim().length < 20)
    return "Message must be at least 20 characters.";
  return null;
}

function adminHtml(p: ContactPayload, submittedAt: string): string {
  return `<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#080808;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" style="background:#080808;padding:40px 20px;">
<tr><td align="center">
<table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;background:#111;border-radius:16px;overflow:hidden;border:1px solid #1a1a1a;">

  <!-- Header -->
  <tr><td style="background:linear-gradient(135deg,#0a1628 0%,#0d1f3c 50%,#111827 100%);padding:36px 40px;border-bottom:1px solid #1e3a5f;">
    <table width="100%" cellpadding="0" cellspacing="0"><tr>
      <td>
        <div style="font-size:26px;font-weight:900;color:#4F8CFF;letter-spacing:-1px;">VELTIX</div>
        <div style="margin-top:4px;font-size:11px;color:#6b7280;letter-spacing:3px;text-transform:uppercase;">New Project Inquiry</div>
      </td>
      <td align="right">
        <span style="background:#4F8CFF;color:#000;font-size:10px;font-weight:800;padding:7px 16px;border-radius:20px;letter-spacing:1px;text-transform:uppercase;">Inbound Lead 🚀</span>
      </td>
    </tr></table>
  </td></tr>

  <!-- Body -->
  <tr><td style="padding:36px 40px;">
    <p style="margin:0 0 8px;color:#9ca3af;font-size:13px;">A new project inquiry was submitted via the VELTIX website contact form.</p>
    <p style="margin:0 0 28px;color:#4b5563;font-size:12px;">Submitted: ${submittedAt}</p>

    <!-- Details table -->
    <table width="100%" cellpadding="0" cellspacing="0" style="border-radius:12px;overflow:hidden;border:1px solid #222;">
      <tr style="background:#0d0d0d;">
        <td style="padding:14px 20px;color:#6b7280;font-size:11px;letter-spacing:1.5px;text-transform:uppercase;width:140px;border-right:1px solid #1e1e1e;">Name</td>
        <td style="padding:14px 20px;color:#f9fafb;font-size:15px;">${p.name}</td>
      </tr>
      <tr style="background:#111;">
        <td style="padding:14px 20px;color:#6b7280;font-size:11px;letter-spacing:1.5px;text-transform:uppercase;width:140px;border-right:1px solid #1e1e1e;">Email</td>
        <td style="padding:14px 20px;font-size:15px;"><a href="mailto:${p.email}" style="color:#4F8CFF;text-decoration:none;">${p.email}</a></td>
      </tr>
      <tr style="background:#0d0d0d;">
        <td style="padding:14px 20px;color:#6b7280;font-size:11px;letter-spacing:1.5px;text-transform:uppercase;width:140px;border-right:1px solid #1e1e1e;">Project Type</td>
        <td style="padding:14px 20px;color:#f9fafb;font-size:15px;">${p.project}</td>
      </tr>
      <tr style="background:#111;">
        <td style="padding:14px 20px;color:#6b7280;font-size:11px;letter-spacing:1.5px;text-transform:uppercase;width:140px;border-right:1px solid #1e1e1e;">Budget</td>
        <td style="padding:14px 20px;color:#f9fafb;font-size:15px;">${p.budget}</td>
      </tr>
      <tr style="background:#0d0d0d;">
        <td style="padding:14px 20px;color:#6b7280;font-size:11px;letter-spacing:1.5px;text-transform:uppercase;width:140px;border-right:1px solid #1e1e1e;vertical-align:top;">Message</td>
        <td style="padding:14px 20px;color:#f9fafb;font-size:15px;line-height:1.7;">${p.message.replace(/\n/g, "<br />")}</td>
      </tr>
    </table>

    <div style="margin-top:32px;text-align:center;">
      <a href="mailto:${p.email}" style="display:inline-block;background:#4F8CFF;color:#fff;font-size:14px;font-weight:600;padding:14px 36px;border-radius:8px;text-decoration:none;">Reply to ${p.name} →</a>
    </div>
  </td></tr>

  <tr><td style="padding:20px 40px;border-top:1px solid #1a1a1a;text-align:center;">
    <p style="margin:0;color:#374151;font-size:12px;">Automated notification · VELTIX Contact Form</p>
  </td></tr>
</table>
</td></tr>
</table>
</body></html>`;
}

function autoReplyHtml(p: ContactPayload): string {
  const year = new Date().getFullYear();
  return `<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#080808;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" style="background:#080808;padding:40px 20px;">
<tr><td align="center">
<table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;background:#111;border-radius:16px;overflow:hidden;border:1px solid #1a1a1a;">

  <!-- Header -->
  <tr><td style="background:linear-gradient(135deg,#0a1628 0%,#0d1f3c 50%,#111827 100%);padding:48px 40px;text-align:center;border-bottom:1px solid #1e3a5f;">
    <div style="width:64px;height:64px;background:#4F8CFF;border-radius:16px;margin:0 auto 20px;line-height:64px;text-align:center;font-size:30px;font-weight:900;color:#fff;">V</div>
    <div style="font-size:28px;font-weight:900;color:#fff;letter-spacing:-1px;">VELTIX</div>
    <div style="margin-top:6px;color:#4F8CFF;font-size:12px;letter-spacing:3px;text-transform:uppercase;">We Build Websites That Win.</div>
  </td></tr>

  <!-- Body -->
  <tr><td style="padding:48px 40px;">
    <h2 style="margin:0 0 20px;font-size:22px;font-weight:700;color:#fff;">Hi ${p.name},</h2>
    <p style="margin:0 0 16px;color:#d1d5db;font-size:16px;line-height:1.7;">Thank you for contacting <strong style="color:#4F8CFF;">VELTIX</strong>.</p>
    <p style="margin:0 0 16px;color:#d1d5db;font-size:16px;line-height:1.7;">We've successfully received your project inquiry.</p>
    <p style="margin:0 0 28px;color:#d1d5db;font-size:16px;line-height:1.7;">Our team will carefully review your requirements. We'll contact you within the next <strong style="color:#4F8CFF;">4 hours</strong> to discuss:</p>

    <!-- Bullet list -->
    <table cellpadding="0" cellspacing="0" style="margin:0 0 36px;">
      <tr><td style="padding:7px 0;color:#9ca3af;font-size:15px;"><span style="color:#4F8CFF;font-weight:700;margin-right:10px;">•</span>Project scope</td></tr>
      <tr><td style="padding:7px 0;color:#9ca3af;font-size:15px;"><span style="color:#4F8CFF;font-weight:700;margin-right:10px;">•</span>Timeline</td></tr>
      <tr><td style="padding:7px 0;color:#9ca3af;font-size:15px;"><span style="color:#4F8CFF;font-weight:700;margin-right:10px;">•</span>Pricing</td></tr>
      <tr><td style="padding:7px 0;color:#9ca3af;font-size:15px;"><span style="color:#4F8CFF;font-weight:700;margin-right:10px;">•</span>Next steps</td></tr>
    </table>

    <!-- Form summary card -->
    <div style="background:#0d1f3c;border:1px solid #1e3a5f;border-radius:12px;padding:24px 28px;margin-bottom:36px;">
      <div style="font-size:11px;color:#6b7280;letter-spacing:2px;text-transform:uppercase;margin-bottom:16px;">Your Submission Summary</div>
      <table width="100%" cellpadding="0" cellspacing="0" style="border-radius:8px;overflow:hidden;border:1px solid #1e3a5f;">
        <tr style="background:#0a1628;">
          <td style="padding:12px 16px;color:#6b7280;font-size:11px;letter-spacing:1.5px;text-transform:uppercase;width:130px;border-right:1px solid #1e3a5f;">Project Type</td>
          <td style="padding:12px 16px;color:#f9fafb;font-size:14px;">${p.project}</td>
        </tr>
        <tr style="background:#0d1f3c;">
          <td style="padding:12px 16px;color:#6b7280;font-size:11px;letter-spacing:1.5px;text-transform:uppercase;width:130px;border-right:1px solid #1e3a5f;">Budget</td>
          <td style="padding:12px 16px;color:#f9fafb;font-size:14px;">${p.budget}</td>
        </tr>
        <tr style="background:#0a1628;">
          <td style="padding:12px 16px;color:#6b7280;font-size:11px;letter-spacing:1.5px;text-transform:uppercase;width:130px;border-right:1px solid #1e3a5f;vertical-align:top;">Message</td>
          <td style="padding:12px 16px;color:#f9fafb;font-size:14px;line-height:1.6;">${p.message.replace(/\n/g, "<br />")}</td>
        </tr>
      </table>
    </div>

    <!-- Sign-off -->
    <p style="margin:0 0 4px;color:#d1d5db;font-size:15px;">Regards,</p>
    <p style="margin:0 0 4px;color:#fff;font-size:17px;font-weight:700;">Team VELTIX</p>
    <p style="margin:0;color:#4F8CFF;font-size:13px;letter-spacing:1px;font-style:italic;">We Build Websites That Win.</p>
  </td></tr>

  <tr><td style="padding:0 40px;"><hr style="border:none;border-top:1px solid #1a1a1a;margin:0;"></td></tr>
  <tr><td style="padding:24px 40px;text-align:center;">
    <p style="margin:0 0 4px;color:#f9fafb;font-size:14px;font-weight:700;letter-spacing:-0.3px;">VELTIX</p>
    <p style="margin:0 0 16px;color:#4F8CFF;font-size:11px;letter-spacing:2px;text-transform:uppercase;">We Build Websites That Win.</p>
    <p style="margin:0;color:#374151;font-size:12px;line-height:1.6;">You received this because you submitted the contact form on the VELTIX website.<br>&copy; ${year} VELTIX. All rights reserved.</p>
  </td></tr>
</table>
</td></tr>
</table>
</body></html>`;
}

router.post("/contact", async (req, res): Promise<void> => {
  const body = req.body as Partial<ContactPayload>;
  const validationErr = validate(body);
  if (validationErr) {
    res.status(400).json({ success: false, error: validationErr });
    return;
  }

  const { name, email, project, budget, message } = body as ContactPayload;
  const submittedAt = new Date().toLocaleString("en-IN", {
    timeZone: "Asia/Kolkata",
    dateStyle: "full",
    timeStyle: "short",
  });
const adminEmailHtml = adminHtml(
  {
    name,
    email,
    project,
    budget,
    message,
  },
  submittedAt
);

const autoReplyEmailHtml = autoReplyHtml({
  name,
  email,
  project,
  budget,
  message,
});

  try {
  // Frontend ko immediately success bhejo
  res.status(200).json({
    success: true,
    message: "Request received successfully.",
  });
  
// Start timer
const start = Date.now();

  // Background me emails send karo
  void Promise.all([
    resend.emails.send({
      from: FROM,
      to: ADMIN,
      replyTo: email,
      subject: "🚀 New VELTIX Project Inquiry",
      html: adminHtml(
        { name, email, project, budget, message },
        submittedAt
      ),
    }),

    resend.emails.send({
      from: FROM,
      to: email,
      replyTo: "veltixagency@gmail.com",
      subject: "✨ Thanks for contacting VELTIX",
      html: autoReplyHtml({
        name,
        email,
        project,
        budget,
        message,
      }),
    }),
  ])
    .then(() => {
  logger.info(
    {
      duration: `${Date.now() - start}ms`,
    },
    "Both emails sent successfully"
  );
})
    .catch((err) => {
      logger.error({ err }, "Background email sending failed");
    });

} catch (err) {
  req.log.error({ err }, "Unexpected error");
  res.status(500).json({
    success: false,
    error: "Failed to process request.",
  });
}
});

export default router;
