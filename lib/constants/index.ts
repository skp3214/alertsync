
export function getEmailBody(otpCode: string) {
    return `<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                    <h2 style="color: #667eea;">Email Verification</h2>
                    <p>Welcome to AlertSync! Please verify your email address to complete your registration.</p>
                    <p>Your verification code is:</p>
                    <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 20px; text-align: center; border-radius: 8px; margin: 20px 0; font-size: 24px; font-weight: bold; letter-spacing: 2px;">
                        ${otpCode}
                    </div>
                    <p><strong>This code will expire in 10 minutes.</strong></p>
                    <p>If you didn't create an account with AlertSync, please ignore this email.</p>
                    <hr style="margin: 30px 0; border: none; border-top: 1px solid #eee;">
                    <p style="color: #999; font-size: 12px;">This is an automated email from AlertSync. Please do not reply.</p>
                </div>
            `
}