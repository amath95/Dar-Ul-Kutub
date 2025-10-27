export function vendorInviteEmail({
  inviteUrl,
  expiresInDays,
}: {
  inviteUrl: string
  expiresInDays: number
}) {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Vendor Invitation - Dar-Ul-Kutub</title>
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">

  <div style="text-align: center; margin-bottom: 30px;">
    <h1 style="color: #2d7738; margin: 0; font-size: 28px;">Dar-Ul-Kutub</h1>
    <p style="color: #666; margin: 5px 0; font-size: 18px; font-family: 'Amiri', serif;">دار الكتب</p>
  </div>

  <div style="background-color: #f9f9f9; border-radius: 8px; padding: 30px; margin-bottom: 20px;">
    <h2 style="color: #2d7738; margin-top: 0;">You've Been Invited to Join Dar-Ul-Kutub</h2>

    <p>As-salamu alaykum,</p>

    <p>You've been invited to become a vendor on <strong>Dar-Ul-Kutub</strong>, a trusted Islamic book marketplace connecting authentic Islamic books with readers across the United States.</p>

    <p>As a vendor, you'll be able to:</p>
    <ul style="margin: 15px 0;">
      <li>List and sell Islamic books</li>
      <li>Manage your inventory and pricing</li>
      <li>Process orders and print shipping labels</li>
      <li>Receive payouts directly to your bank account</li>
      <li>Access sales analytics and reports</li>
    </ul>

    <div style="text-align: center; margin: 30px 0;">
      <a href="${inviteUrl}" style="display: inline-block; background-color: #2d7738; color: white; padding: 14px 30px; text-decoration: none; border-radius: 5px; font-weight: bold; font-size: 16px;">
        Accept Invitation
      </a>
    </div>

    <p style="font-size: 14px; color: #666;">
      <strong>Important:</strong> This invitation link will expire in <strong>${expiresInDays} days</strong>.
      Please complete your registration before then.
    </p>

    <p style="font-size: 14px; color: #666;">
      If the button doesn't work, copy and paste this link into your browser:<br>
      <a href="${inviteUrl}" style="color: #2d7738; word-break: break-all;">${inviteUrl}</a>
    </p>
  </div>

  <div style="border-top: 1px solid #ddd; padding-top: 20px; font-size: 12px; color: #666; text-align: center;">
    <p>
      This invitation was sent to you by an administrator of Dar-Ul-Kutub.<br>
      If you did not expect this invitation, you can safely ignore this email.
    </p>
    <p style="margin-top: 15px;">
      Jazakum Allahu Khairan<br>
      <strong>Dar-Ul-Kutub Team</strong>
    </p>
  </div>

</body>
</html>
  `.trim()
}
