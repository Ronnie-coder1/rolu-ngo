import { NextResponse } from "next/server";
import nodemailer from "nodemailer";

export async function POST(req: Request) {
  try {
    // 1. Get all data from the form
    const body = await req.json();
    const { name, email, message, ...extraData } = body;

    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    // 2. Create rows for extra data (phone, interest, etc.)
    const extraInfoHtml = Object.entries(extraData)
      .map(([key, value]) => `<p><strong>${key}:</strong> ${value}</p>`)
      .join("");

    // 3. Set up the email options
    const mailOptions = {
      from: email,
      to: "rolu7063@gmail.com",
      replyTo: email,
      // subject changes if it's a volunteer (extraData exists) or contact form
      subject: `ROLU Form: ${extraInfoHtml ? 'New Volunteer' : 'New Contact'} - ${name}`,
      text: `Name: ${name}\nEmail: ${email}\n${JSON.stringify(extraData)}\nMessage: ${message}`,
      html: `
        <h3>New Submission from ROLU Website</h3>
        <p><strong>Name:</strong> ${name}</p>
        <p><strong>Email:</strong> ${email}</p>
        ${extraInfoHtml} 
        <p><strong>Message:</strong></p>
        <p>${message || "No additional message provided."}</p>
      `,
    };

    await transporter.sendMail(mailOptions);

    return NextResponse.json({ success: true, message: "Email sent successfully!" }, { status: 200 });
  } catch (error: any) {
    console.error("Email Error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
