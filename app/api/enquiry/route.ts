import { NextResponse } from "next/server";
import { google } from "googleapis";
import nodemailer from "nodemailer";

type EnquiryBody = {
  name: string;
  email: string;
  phone: string;
  message: string;
  type: string;
  company?: string | null;
  service: string;
};

// Target notification email recipients
const NOTIFICATION_RECIPIENTS = [
  "spec.engrs@gmail.com",
  "samsrthgarg2153@gmail.com",
];

export async function POST(req: Request) {
  try {
    const body: EnquiryBody = await req.json();
    const { name, email, phone, message, type, company, service } = body;

    // =========================
    // GOOGLE SHEETS (Optional / Fault-tolerant)
    // =========================
    if (
      process.env.GOOGLE_CLIENT_EMAIL &&
      process.env.GOOGLE_PRIVATE_KEY &&
      process.env.GOOGLE_SHEET_ID
    ) {
      try {
        const auth = new google.auth.GoogleAuth({
          credentials: {
            client_email: process.env.GOOGLE_CLIENT_EMAIL,
            private_key: process.env.GOOGLE_PRIVATE_KEY.replace(/\\n/g, "\n"),
          },
          scopes: ["https://www.googleapis.com/auth/spreadsheets"],
        });

        const sheets = google.sheets({ version: "v4", auth });

        await sheets.spreadsheets.values.append({
          spreadsheetId: process.env.GOOGLE_SHEET_ID,
          range: "Sheet1!A:H",
          valueInputOption: "USER_ENTERED",
          requestBody: {
            values: [
              [
                new Date().toISOString(),
                name,
                email,
                phone,
                message,
                type,
                company || "N/A",
                service,
                "website",
              ],
            ],
          },
        });
      } catch (sheetsError) {
        console.warn("Google Sheets logging warning:", sheetsError);
      }
    }

    // =========================
    // EMAIL (NodeMailer)
    // =========================
    const emailUser = process.env.EMAIL_USER;
    const emailPass = process.env.EMAIL_PASS;

    const isPlaceholderPass = !emailPass || emailPass.includes("your-") || emailPass.includes("placeholder");

    if (!emailUser || !emailPass || isPlaceholderPass) {
      console.warn(
        "EMAIL_USER or valid EMAIL_PASS not set in environment variables (.env.local). Please set a valid Gmail App Password."
      );
      return NextResponse.json({
        success: true,
        message: "Enquiry submitted successfully! (Email service pending Gmail App Password setup in .env.local)",
      });
    }

    try {
      const transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
          user: emailUser,
          pass: emailPass,
        },
      });

      // Prepare recipient list (combine configured list with any env CLIENT_EMAIL)
      const recipientList = [...NOTIFICATION_RECIPIENTS];
      if (process.env.CLIENT_EMAIL && !recipientList.includes(process.env.CLIENT_EMAIL)) {
        recipientList.push(process.env.CLIENT_EMAIL);
      }

      const htmlContent = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 8px;">
        <h2 style="color: #0f172a; border-bottom: 2px solid #2563eb; padding-bottom: 8px;">🚀 New Website Enquiry</h2>
        <p style="color: #475569; font-size: 14px;">A new enquiry has been submitted through the <b>SPEC ENGINEERS</b> website contact form.</p>
        
        <table style="border-collapse: collapse; width: 100%; margin-top: 16px; font-size: 14px;">
          <tr>
            <td style="padding: 10px; border: 1px solid #e2e8f0; background: #f8fafc; font-weight: bold; width: 35%;">Submission Time</td>
            <td style="padding: 10px; border: 1px solid #e2e8f0;">${new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })} (IST)</td>
          </tr>  
          <tr>
            <td style="padding: 10px; border: 1px solid #e2e8f0; background: #f8fafc; font-weight: bold;">Full Name</td>
            <td style="padding: 10px; border: 1px solid #e2e8f0;"><b>${name}</b></td>
          </tr>
          <tr>
            <td style="padding: 10px; border: 1px solid #e2e8f0; background: #f8fafc; font-weight: bold;">Email Address</td>
            <td style="padding: 10px; border: 1px solid #e2e8f0;"><a href="mailto:${email}">${email}</a></td>
          </tr>
          <tr>
            <td style="padding: 10px; border: 1px solid #e2e8f0; background: #f8fafc; font-weight: bold;">Phone Number</td>
            <td style="padding: 10px; border: 1px solid #e2e8f0;"><a href="tel:${phone}">${phone}</a></td>
          </tr>
          <tr>
            <td style="padding: 10px; border: 1px solid #e2e8f0; background: #f8fafc; font-weight: bold;">Type</td>
            <td style="padding: 10px; border: 1px solid #e2e8f0; text-transform: capitalize;">${type}</td>
          </tr>
          ${
            type === "company" && company
              ? `<tr>
                  <td style="padding: 10px; border: 1px solid #e2e8f0; background: #f8fafc; font-weight: bold;">Company Name</td>
                  <td style="padding: 10px; border: 1px solid #e2e8f0;">${company}</td>
                 </tr>`
              : ""
          }
          <tr>
            <td style="padding: 10px; border: 1px solid #e2e8f0; background: #f8fafc; font-weight: bold;">Service Interested In</td>
            <td style="padding: 10px; border: 1px solid #e2e8f0;"><span style="color: #2563eb; font-weight: bold;">${service}</span></td>
          </tr>
          <tr>
            <td style="padding: 10px; border: 1px solid #e2e8f0; background: #f8fafc; font-weight: bold;">Message</td>
            <td style="padding: 10px; border: 1px solid #e2e8f0; white-space: pre-wrap;">${message}</td>
          </tr>
        </table>

        <div style="margin-top: 24px; padding-top: 12px; border-top: 1px solid #e2e8f0; color: #94a3b8; font-size: 12px; text-align: center;">
          SPEC ENGINEERS — Engineering Excellence for Tomorrow's Challenges
        </div>
      </div>
      `;

      // Send notification email to team
      await transporter.sendMail({
        from: `"SPEC ENGINEERS Website" <${emailUser}>`,
        to: recipientList,
        subject: `📩 New Enquiry from ${name} (${service})`,
        html: htmlContent,
      });

      // Optional confirmation email to user
      try {
        await transporter.sendMail({
          from: `"SPEC ENGINEERS" <${emailUser}>`,
          to: email,
          subject: "Thank you for contacting SPEC ENGINEERS",
          html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; color: #334155;">
            <h2 style="color: #0f172a;">Dear ${name},</h2>
            <p>Thank you for reaching out to <b>SPEC ENGINEERS</b>.</p>
            <p>We have received your enquiry regarding <b>${service}</b> and our team will get back to you shortly.</p>
            <br/>
            <p>Best regards,<br/><b>SPEC ENGINEERS Team</b></p>
          </div>
          `,
        });
      } catch (clientEmailErr) {
        console.warn("Client auto-reply email warning:", clientEmailErr);
      }
    } catch (emailError) {
      console.error("Nodemailer Email Error:", emailError);
      return NextResponse.json({
        success: true,
        message: "Enquiry submitted! Note: Email notification failed due to invalid SMTP credentials.",
      });
    }

    return NextResponse.json({ success: true, message: "Enquiry submitted successfully!" });
  } catch (error) {
    console.error("API ERROR:", error);
    return NextResponse.json(
      { success: false, message: "Server error handling enquiry." },
      { status: 500 }
    );
  }
}
