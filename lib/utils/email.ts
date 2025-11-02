'use server'; 

import nodemailer from 'nodemailer';
import { OrganizationRole } from '@/lib/types/auth'; 

interface SendInvitationEmailParams {
  to: string;
  organizationName: string;
  invitationUrl: string;
  role: OrganizationRole;
  inviterEmail?: string;
}

export async function sendInvitationEmail({
  to,
  organizationName,
  invitationUrl,
  role,
  inviterEmail,
}: SendInvitationEmailParams): Promise<{ success: boolean; error?: string }> {
  try {
    // Create SMTP transporter with Gmail
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_APP_PASSWORD,
      },
      secure: true, // Use SSL/TLS
    });

    // Construct email content (simple HTML for better readability)
    const subject = `Invitation to Join ${organizationName}`;
    const htmlContent = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #ddd; border-radius: 8px;">
        <h2 style="color: #333;">You've Been Invited!</h2>
        <p>${inviterEmail ? `From: ${inviterEmail}<br>` : ''}You have been invited to join <strong>${organizationName}</strong> as a <strong>${role}</strong>.</p>
        <p>To accept, click the button below:</p>
        <a href="${invitationUrl}" style="display: inline-block; background-color: #007bff; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Accept Invitation</a>
        <p>If the button doesn't work, copy this link: ${invitationUrl}</p>
        <p>This invitation expires in 7 days.</p>
        <hr style="border-top: 1px solid #eee;">
        <p style="font-size: 12px; color: #666;">If you didn't expect this email, you can ignore it.</p>
      </div>
    `;

    // Send the email
    await transporter.sendMail({
      from: `"Organization Platform" <${process.env.GMAIL_USER}>`, // Sender address
      to,
      subject,
      html: htmlContent,
      text: `You've been invited to join ${organizationName} as ${role}. Accept here: ${invitationUrl}`, // Plain text fallback
    });

    return { success: true };
  } catch (error) {
    console.error('Email sending error:', error);
    return { success: false, error: (error as Error).message || 'Failed to send email' };
  }
}