import { NextResponse } from "next/server";
import { google } from "googleapis";
import nodemailer from "nodemailer";

type EnquiryBody = {
  name: string;
  email: string;
  phone: string;
  message: string;
  type: string;
  company: string;
  service: string;
};

export async function POST(req: Request) {
  try {
    const body: EnquiryBody = await req.json();
    const { name, email, phone, message, type, company, service } = body;

    // =========================
    // GOOGLE SHEETS
    // =========================
    const auth = new google.auth.GoogleAuth({
      credentials: {
        client_email: process.env.GOOGLE_CLIENT_EMAIL,
        private_key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, "\n"),
      },
      scopes: ["https://www.googleapis.com/auth/spreadsheets"],
    });

    const sheets = google.sheets({ version: "v4", auth });

    await sheets.spreadsheets.values.append({
      spreadsheetId: process.env.GOOGLE_SHEET_ID!,
      range: "Sheet1!A:G",
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
            company,
            service,
            "website",
          ],
        ],
      },
    });

    // =========================
    // EMAIL (NodeMailer)
    // =========================
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    // Email to client
    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: process.env.CLIENT_EMAIL, // your team's email
      cc: ["manager@spec.com"],
      subject: `🚀 New Enquiry from ${name}`,
  html: `
    <div style="font-family: Arial, sans-serif; line-height: 1.6;">
      
      <h2 style="color:#0f172a;">New Enquiry Received</h2>
      
      <table style="border-collapse: collapse; width: 100%; margin-top: 10px;">
      <tr>
          <td style="padding: 8px; border: 1px solid #ddd;"><b>Time</b></td>
          <td style="padding: 8px; border: 1px solid #ddd;">${new Date().toLocaleString()}</td>
        </tr>  
      <tr>
          <td style="padding: 8px; border: 1px solid #ddd;"><b>Name</b></td>
          <td style="padding: 8px; border: 1px solid #ddd;">${name}</td>
        </tr>
        <tr>
          <td style="padding: 8px; border: 1px solid #ddd;"><b>Email</b></td>
          <td style="padding: 8px; border: 1px solid #ddd;">${email}</td>
        </tr>
        <tr>
          <td style="padding: 8px; border: 1px solid #ddd;"><b>Phone</b></td>
          <td style="padding: 8px; border: 1px solid #ddd;">${phone}</td>
        </tr>
        <tr>
          <td style="padding: 8px; border: 1px solid #ddd;"><b>Message</b></td>
          <td style="padding: 8px; border: 1px solid #ddd;">${message}</td>
        </tr>        
        <tr>
          <td style="padding: 8px; border: 1px solid #ddd;"><b>Type</b></td>
          <td style="padding: 8px; border: 1px solid #ddd;">${type}</td>
        </tr>
        <tr>
          <td style="padding: 8px; border: 1px solid #ddd;"><b>Company</b></td>
          <td style="padding: 8px; border: 1px solid #ddd;">${company}</td>
        </tr>        
        <tr>
          <td style="padding: 8px; border: 1px solid #ddd;"><b>Service</b></td>
          <td style="padding: 8px; border: 1px solid #ddd;">${service}</td>
        </tr>
        <tr>
          <td style="padding: 8px; border: 1px solid #ddd;"><b>Source</b></td>
          <td style="padding: 8px; border: 1px solid #ddd;">Website - Spec Engineers</td>
        </tr>
      </table>      
    </div>
      `,
    });

    // Auto reply to user (optional but recommended)
    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: email,
      subject: "We received your enquiry",
      html: `<p>Hi ${name}, we’ll get back to you shortly.</p>`,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("API ERROR:", error);
    return NextResponse.json({ success: false }, { status: 500 });
  }
}