package com.local.localservice.service;

import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;

@Service
public class EmailService {

    @Autowired
    private JavaMailSender mailSender;

    public void sendEmail(String to, String subject, String body) {
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true);

            helper.setTo(to);
            helper.setSubject(subject);
            helper.setText(body, true);

            mailSender.send(message);
        } catch (MessagingException e) {
            e.printStackTrace();

        }
    }

    public void sendVerificationEmail(String to, String name) {
        String subject = "Profile Verified - MediBook";
        String content = "<div style='text-align: center; margin-bottom: 24px;'>"
                + "<div style='background-color: #dcfce7; color: #166534; width: 60px; height: 60px; border-radius: 50%; display: inline-flex; align-items: center; justify-content: center; margin-bottom: 16px; font-size: 24px;'>✓</div>"
                + "<h2 style='margin: 0; color: #111827; font-size: 24px; font-weight: 700;'>Profile Verified</h2>"
                + "</div>"
                + "<p style='color: #4b5563; font-size: 16px; line-height: 24px; margin-bottom: 24px;'>Hello " + name + ",</p>"
                + "<p style='color: #4b5563; font-size: 16px; line-height: 24px; margin-bottom: 32px;'>Great news! Your doctor profile has been reviewed and <strong style='color: #059669;'>verified</strong> by our admin team. You can now log in and start accepting appointments.</p>"
                + "<div style='text-align: center; margin-bottom: 32px;'>"
                + "<a href='http://localhost:5173/login' style='background-color: #4f46e5; color: white; padding: 14px 28px; text-decoration: none; border-radius: 12px; font-weight: 600; font-size: 16px; display: inline-block; box-shadow: 0 4px 6px -1px rgba(79, 70, 229, 0.2);'>Go to Dashboard</a>"
                + "</div>";
        sendEmail(to, subject, getHtmlTemplate(subject, content));
    }
    
    public void sendRejectionEmail(String to, String name) {
        String subject = "Profile Update - MediBook";
        String content = "<div style='text-align: center; margin-bottom: 24px;'>"
                + "<div style='background-color: #fee2e2; color: #991b1b; width: 60px; height: 60px; border-radius: 50%; display: inline-flex; align-items: center; justify-content: center; margin-bottom: 16px; font-size: 24px;'>✕</div>"
                + "<h2 style='margin: 0; color: #111827; font-size: 24px; font-weight: 700;'>Application Declined</h2>"
                + "</div>"
                + "<p style='color: #4b5563; font-size: 16px; line-height: 24px; margin-bottom: 24px;'>Hello " + name + ",</p>"
                + "<p style='color: #4b5563; font-size: 16px; line-height: 24px; margin-bottom: 24px;'>We regret to inform you that your doctor profile application has been <strong>rejected</strong> at this time.</p>"
                + "<p style='color: #6b7280; font-size: 14px; line-height: 20px; font-style: italic;'>If you believe this is a mistake, please contact support.</p>";
        sendEmail(to, subject, getHtmlTemplate(subject, content));
    }

    public void sendAccountDeletedEmail(String to, String name) {
        String subject = "Account Deleted - MediBook";
        String content = "<div style='text-align: center; margin-bottom: 24px;'>"
                + "<div style='background-color: #f3f4f6; color: #374151; width: 60px; height: 60px; border-radius: 50%; display: inline-flex; align-items: center; justify-content: center; margin-bottom: 16px; font-size: 24px;'>🗑️</div>"
                + "<h2 style='margin: 0; color: #111827; font-size: 24px; font-weight: 700;'>Account Deleted</h2>"
                + "</div>"
                + "<p style='color: #4b5563; font-size: 16px; line-height: 24px; margin-bottom: 24px;'>Hello " + name + ",</p>"
                + "<p style='color: #4b5563; font-size: 16px; line-height: 24px; margin-bottom: 24px;'>Your account has been permanently deleted by the administrator.</p>"
                + "<p style='color: #4b5563; font-size: 16px; line-height: 24px;'>We are sorry to see you go.</p>";
        sendEmail(to, subject, getHtmlTemplate(subject, content));
    }

    public void sendAppointmentCompletedEmailProvider(String to, String providerName, String serviceTitle, String earnings, String date) {
        String subject = "Appointment Completed & Payout Processed - " + serviceTitle;
        String content = "<div style='text-align: center; margin-bottom: 24px;'>"
                + "<div style='background-color: #dcfce7; color: #166534; width: 60px; height: 60px; border-radius: 50%; display: inline-flex; align-items: center; justify-content: center; margin-bottom: 16px; font-size: 24px;'>💰</div>"
                + "<h2 style='margin: 0; color: #111827; font-size: 24px; font-weight: 700;'>Payout Processed!</h2>"
                + "</div>"
                + "<p style='color: #4b5563; font-size: 16px; line-height: 24px; margin-bottom: 24px;'>Hello Dr. " + providerName + ",</p>"
                + "<p style='color: #4b5563; font-size: 16px; line-height: 24px; margin-bottom: 24px;'>Excellent work! Your consultation for <strong>" + serviceTitle + "</strong> has been completed successfully.</p>"
                + "<div style='background-color: #f8fafc; border-radius: 12px; padding: 20px; text-align: center; margin-bottom: 24px; border: 1px solid #e2e8f0;'>"
                + "<p style='margin: 0; color: #64748b; font-size: 12px; font-weight: 600; text-transform: uppercase; letter-spacing: 1px;'>Total Earnings</p>"
                + "<p style='margin: 8px 0 0; color: #0f172a; font-size: 32px; font-weight: 800;'>" + earnings + "</p>"
                + "<p style='margin: 8px 0 0; color: #64748b; font-size: 14px;'>Date: " + date + "</p>"
                + "</div>"
                + "<p style='color: #4b5563; font-size: 16px; line-height: 24px; margin-bottom: 32px;'>The amount has been credited to your linked wallet account.</p>"
                + "<div style='text-align: center; margin-bottom: 32px;'>"
                + "<a href='http://localhost:5173/dashboard' style='background-color: #4f46e5; color: white; padding: 14px 28px; text-decoration: none; border-radius: 12px; font-weight: 600; font-size: 16px; display: inline-block; box-shadow: 0 4px 6px -1px rgba(79, 70, 229, 0.2);'>View Wallet</a>"
                + "</div>";
        sendEmail(to, subject, getHtmlTemplate(subject, content));
    }

    public void sendAppointmentCompletedEmailCustomer(String to, String customerName, String serviceTitle, String date) {
        String subject = "Appointment Completed - " + serviceTitle;
        String content = "<div style='text-align: center; margin-bottom: 24px;'>"
                + "<div style='background-color: #dbeafe; color: #1e40af; width: 60px; height: 60px; border-radius: 50%; display: inline-flex; align-items: center; justify-content: center; margin-bottom: 16px; font-size: 24px;'>🩺</div>"
                + "<h2 style='margin: 0; color: #111827; font-size: 24px; font-weight: 700;'>Consultation Complete</h2>"
                + "</div>"
                + "<p style='color: #4b5563; font-size: 16px; line-height: 24px; margin-bottom: 24px;'>Hello " + customerName + ",</p>"
                + "<p style='color: #4b5563; font-size: 16px; line-height: 24px; margin-bottom: 24px;'>We hope you had a great experience! Your appointment for <strong>" + serviceTitle + "</strong> on <strong>" + date + "</strong> has been marked as completed.</p>"
                + "<p style='color: #4b5563; font-size: 16px; line-height: 24px; margin-bottom: 32px;'>If you have any follow-up questions, you can continue to chat with your doctor through the dashboard.</p>"
                + "<div style='text-align: center; margin-bottom: 32px;'>"
                + "<a href='http://localhost:5173/dashboard' style='background-color: #4f46e5; color: white; padding: 14px 28px; text-decoration: none; border-radius: 12px; font-weight: 600; font-size: 16px; display: inline-block; box-shadow: 0 4px 6px -1px rgba(79, 70, 229, 0.2);'>View Appointment Details</a>"
                + "</div>";
        sendEmail(to, subject, getHtmlTemplate(subject, content));
    }

    private String getHtmlTemplate(String title, String content) {
        return "<!DOCTYPE html>"
                + "<html>"
                + "<head>"
                + "<meta charset='utf-8'>"
                + "<meta name='viewport' content='width=device-width, initial-scale=1.0'>"
                + "<title>" + title + "</title>"
                + "</head>"
                + "<body style='margin: 0; padding: 0; background-color: #f8fafc; font-family: -apple-system, BlinkMacSystemFont, \"Segoe UI\", Roboto, Helvetica, Arial, sans-serif;'>"
                + "<table role='presentation' border='0' cellpadding='0' cellspacing='0' width='100%'>"
                + "<tr>"
                + "<td style='padding: 40px 20px;' align='center'>"
                + "<!-- Card -->"
                + "<table role='presentation' border='0' cellpadding='0' cellspacing='0' width='100%' style='max-width: 500px; background-color: #ffffff; border-radius: 20px; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06); overflow: hidden;'>"
                + "<!-- Header -->"
                + "<tr>"
                + "<td style='background-color: #ffffff; padding: 30px 40px; text-align: center; border-bottom: 1px solid #f1f5f9;'>"
                + "<h1 style='margin: 0; font-size: 20px; font-weight: 800; color: #4f46e5; letter-spacing: -0.5px;'>MediBook<span style='color: #0891b2;'>.</span></h1>"
                + "</td>"
                + "</tr>"
                + "<!-- Content -->"
                + "<tr>"
                + "<td style='padding: 40px;'>"
                + content
                + "</td>"
                + "</tr>"
                + "<!-- Footer -->"
                + "<tr>"
                + "<td style='background-color: #f8fafc; padding: 24px; text-align: center; border-top: 1px solid #f1f5f9;'>"
                + "<p style='margin: 0; font-size: 12px; color: #94a3b8;'>&copy; 2026 MediBook Healthcare. All rights reserved.</p>"
                + "<p style='margin: 8px 0 0; font-size: 12px; color: #cbd5e1;'>Automated notification. Please do not reply.</p>"
                + "</td>"
                + "</tr>"
                + "</table>"
                + "</td>"
                + "</tr>"
                + "</table>"
                + "</body>"
                + "</html>";
    }
}
