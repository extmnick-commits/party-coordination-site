"use server";

import { Resend } from "resend";

// Initialize Resend SDK. It will automatically use process.env.RESEND_API_KEY 
// from your .env.local locally, and from your Vercel environment variables in production.
const resend = new Resend(process.env.RESEND_API_KEY);

export async function sendInquiryEmail(data: {
  name: string | null;
  email: string | null;
  phone: string | null;
  date: string | null;
  details: string | null;
}) {
  try {
    const { data: resData, error } = await resend.emails.send({
      from: "Roni's Event Planning <inquiry@roniseventplanning.com>",
      to: ["roniseventplanning@gmail.com"],
      subject: `New Event Inquiry from ${data.name || "a Client"}`,
      html: `
        <p><strong>You have a new inquiry!</strong></p>
        <p><strong>Name:</strong> ${data.name || "N/A"}</p>
        <p><strong>Email:</strong> ${data.email || "N/A"}</p>
        <p><strong>Phone:</strong> ${data.phone || "N/A"}</p>
        <p><strong>Date:</strong> ${data.date || "N/A"}</p>
        <p><strong>Details:</strong><br/>${data.details || "N/A"}</p>
      `,
    });

    if (error) {
      console.error("Resend API Error:", error);
      return { success: false, error };
    }

    return { success: true, data: resData };
  } catch (err) {
    console.error("Error sending email:", err);
    return { success: false, error: err };
  }
}