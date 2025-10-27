import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

export async function sendEmail({
  to,
  subject,
  html,
}: {
  to: string
  subject: string
  html: string
}) {
  const from = process.env.RESEND_FROM_EMAIL || 'noreply@dar-ul-kutub.com'

  // In development, just log the email
  if (process.env.DEV_DISABLE_EMAIL === 'true') {
    console.log('📧 Email (not sent in dev mode):')
    console.log('To:', to)
    console.log('Subject:', subject)
    console.log('From:', from)
    console.log('---')
    console.log(html)
    console.log('---')
    return { id: 'dev-mode-email' }
  }

  try {
    const data = await resend.emails.send({
      from,
      to,
      subject,
      html,
    })

    return data
  } catch (error) {
    console.error('Failed to send email:', error)
    throw error
  }
}
