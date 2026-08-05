export function getBaseEmailLayout(title: string, content: string): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title}</title>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
      background-color: #0b0f19;
      color: #f3f4f6;
      margin: 0;
      padding: 0;
      -webkit-font-smoothing: antialiased;
    }
    .container {
      max-width: 600px;
      margin: 40px auto;
      background: #111827;
      border-radius: 12px;
      border: 1px solid #1f2937;
      overflow: hidden;
      box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.5), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
    }
    .header {
      background: linear-gradient(135deg, #1e1b4b 0%, #312e81 50%, #4338ca 100%);
      padding: 32px 24px;
      text-align: center;
      border-bottom: 1px solid #3730a3;
    }
    .logo {
      font-size: 24px;
      font-weight: 800;
      letter-spacing: -0.025em;
      color: #ffffff;
      margin: 0;
      text-transform: uppercase;
    }
    .tagline {
      font-size: 13px;
      color: #c7d2fe;
      margin-top: 4px;
    }
    .body {
      padding: 32px 24px;
      font-size: 15px;
      line-height: 1.6;
      color: #d1d5db;
    }
    .button {
      display: inline-block;
      background: linear-gradient(135deg, #4f46e5 0%, #6366f1 100%);
      color: #ffffff !important;
      font-weight: 600;
      padding: 14px 28px;
      border-radius: 8px;
      text-decoration: none;
      margin: 24px 0;
      text-align: center;
      box-shadow: 0 4px 6px -1px rgba(79, 70, 229, 0.4);
    }
    .code-box {
      background: #1f2937;
      border: 1px solid #374151;
      border-radius: 8px;
      padding: 20px;
      text-align: center;
      font-size: 32px;
      font-weight: 800;
      letter-spacing: 8px;
      color: #818cf8;
      margin: 24px 0;
      font-family: monospace;
    }
    .footer {
      background: #0f172a;
      padding: 24px;
      text-align: center;
      font-size: 12px;
      color: #6b7280;
      border-top: 1px solid #1e293b;
    }
    .footer a {
      color: #818cf8;
      text-decoration: none;
    }
    .card {
      background: #1e293b;
      border: 1px solid #334155;
      border-radius: 8px;
      padding: 16px;
      margin: 16px 0;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <div class="logo">⚡ HQ AI OS</div>
      <div class="tagline">Your Autonomous Executive AI Command Center</div>
    </div>
    <div class="body">
      ${content}
    </div>
    <div class="footer">
      <p>&copy; ${new Date().getFullYear()} HQ AI OS. All rights reserved.</p>
      <p>Need support? Contact us at <a href="mailto:support@netify.ng">support@netify.ng</a></p>
    </div>
  </div>
</body>
</html>`;
}

export function getWelcomeEmailTemplate(name: string): { subject: string; html: string } {
  const subject = 'Welcome to HQ AI OS - Your Autonomous Command Center';
  const content = `
    <h2>Welcome aboard, ${name}! 👋</h2>
    <p>We are thrilled to welcome you to <strong>HQ AI OS</strong>, your enterprise platform for autonomous AI executive management, strategic planning, and automated workflow execution.</p>
    
    <div class="card">
      <h4 style="margin:0 0 8px 0; color:#f3f4f6;">🚀 What you can do right now:</h4>
      <ul style="margin:0; padding-left:20px; color:#9ca3af;">
        <li>Deploy AI Executives for Finance, Engineering, and Growth</li>
        <li>Launch strategic missions and brief your board</li>
        <li>Integrate seamlessly with Slack, GitHub, and Jira</li>
      </ul>
    </div>

    <p style="text-align: center;">
      <a href="https://hq.netify.ng/dashboard" class="button">Access Your Command Center</a>
    </p>

    <p>If you have any questions, our support team is standing by 24/7 to assist you.</p>
    <p>Best regards,<br><strong>The HQ AI OS Executive Team</strong></p>
  `;
  return { subject, html: getBaseEmailLayout(subject, content) };
}

export function getOtpEmailTemplate(
  name: string,
  otpCode: string,
  expiresInMinutes: number = 10,
): { subject: string; html: string } {
  const subject = `${otpCode} is your HQ AI OS Verification Code`;
  const content = `
    <h2>Security Verification Code</h2>
    <p>Hello ${name},</p>
    <p>Use the following 6-digit verification code to complete your security authentication or email verification request:</p>
    
    <div class="code-box">${otpCode}</div>

    <p style="font-size: 13px; color: #9ca3af;">
      ⏱️ This code will expire in <strong>${expiresInMinutes} minutes</strong>. For security reasons, do not share this code with anyone.
    </p>

    <p>If you did not request this verification code, please ignore this email or contact security support.</p>
  `;
  return { subject, html: getBaseEmailLayout(subject, content) };
}

export function getPasswordResetEmailTemplate(
  name: string,
  resetUrl: string,
): { subject: string; html: string } {
  const subject = 'Reset Your HQ AI OS Password';
  const content = `
    <h2>Password Reset Request</h2>
    <p>Hello ${name},</p>
    <p>We received a request to reset the password for your HQ AI OS account.</p>

    <p style="text-align: center;">
      <a href="${resetUrl}" class="button">Reset Your Password</a>
    </p>

    <p style="font-size: 13px; color: #9ca3af;">
      If the button above doesn't work, copy and paste this link into your browser:<br>
      <a href="${resetUrl}" style="color:#818cf8; word-break:break-all;">${resetUrl}</a>
    </p>

    <p style="font-size: 13px; color: #ef4444; margin-top: 20px;">
      🔒 If you did not request a password reset, please secure your account immediately or notify us.
    </p>
  `;
  return { subject, html: getBaseEmailLayout(subject, content) };
}

export function getSecurityLoginNoticeEmailTemplate(
  name: string,
  ipAddress: string,
  userAgent: string,
  time: string,
): { subject: string; html: string } {
  const subject = 'Security Alert: New Login to HQ AI OS';
  const content = `
    <h2>Security Alert: New Sign-In Detected</h2>
    <p>Hello ${name},</p>
    <p>We detected a new login to your HQ AI OS account with the following details:</p>

    <div class="card">
      <p style="margin: 4px 0;"><strong>Timestamp:</strong> ${time}</p>
      <p style="margin: 4px 0;"><strong>IP Address:</strong> ${ipAddress}</p>
      <p style="margin: 4px 0;"><strong>Device / Browser:</strong> ${userAgent}</p>
    </div>

    <p>If this was you, no action is required.</p>
    <p style="color: #ef4444;">If you did not initiate this login, please change your password and revoke active sessions immediately.</p>
  `;
  return { subject, html: getBaseEmailLayout(subject, content) };
}

export function getTeamInvitationEmailTemplate(
  name: string,
  inviterName: string,
  companyName: string,
  inviteUrl: string,
): { subject: string; html: string } {
  const subject = `${inviterName} invited you to join ${companyName} on HQ AI OS`;
  const content = `
    <h2>You've been invited! 🏢</h2>
    <p>Hello ${name},</p>
    <p><strong>${inviterName}</strong> has invited you to join <strong>${companyName}</strong> on HQ AI OS.</p>

    <p style="text-align: center;">
      <a href="${inviteUrl}" class="button">Accept Invitation</a>
    </p>

    <p style="font-size: 13px; color: #9ca3af;">
      Invitation Link:<br>
      <a href="${inviteUrl}" style="color:#818cf8; word-break:break-all;">${inviteUrl}</a>
    </p>
  `;
  return { subject, html: getBaseEmailLayout(subject, content) };
}

export function getTransactionReceiptEmailTemplate(
  name: string,
  amountFormatted: string,
  gateway: string,
  reference: string,
  vendorOrPlan: string,
  executiveRole?: string,
): { subject: string; html: string } {
  const subject = `🧾 Transaction Receipt: ${reference.slice(0, 16)} — HQ AI OS`;
  const content = `
    <h2>Transaction Receipt 🧾</h2>
    <p>Hello ${name},</p>
    <p>This email confirms a successful financial settlement processed through HQ AI OS.</p>

    <div class="card">
      <p style="margin: 6px 0; font-size: 20px; font-weight: bold; color: #10b981;">
        ${amountFormatted}
      </p>
      <p style="margin: 4px 0;"><strong>Transaction Hash / Ref:</strong> <code style="color:#38bdf8;">${reference}</code></p>
      <p style="margin: 4px 0;"><strong>Gateway / Protocol:</strong> ${gateway}</p>
      <p style="margin: 4px 0;"><strong>Item / Service:</strong> ${vendorOrPlan}</p>
      ${executiveRole ? `<p style="margin: 4px 0;"><strong>Authorized By:</strong> ${executiveRole}</p>` : ''}
      <p style="margin: 4px 0;"><strong>Date & Time:</strong> ${new Date().toUTCString()}</p>
      <p style="margin: 4px 0;"><strong>Settlement Status:</strong> <span style="color:#10b981; font-weight:bold;">COMPLETED / SETTLED</span></p>
    </div>

    <p style="font-size: 13px; color: #9ca3af; margin-top: 20px;">
      You can review your full transaction audit ledger anytime in your <a href="https://hq.netify.ng/billing" style="color:#38bdf8;">HQ Billing & Treasury Hub</a>.
    </p>
  `;
  return { subject, html: getBaseEmailLayout(subject, content) };
}
