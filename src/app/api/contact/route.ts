import { NextResponse } from "next/server";
import nodemailer from "nodemailer";

export async function POST(req: Request) {
  try {
    const { name, email, message } = await req.json();

    // 1. Create a transporter using Gmail SMTP
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER, // Your rolu7063@gmail.com
        pass: process.env.EMAIL_PASS, // Your 16-character App Password
      },
    });

    // 2. Set up the email options
    const mailOptions = {
      from: email, // The user's email from the form
      to: "rolu7063@gmail.com", // Where YOU want to receive the mail
      replyTo: email,
      subject: `New Contact Form Message from ${name}`,
      text: message,
      html: `
        <h3>New Message from ROLU Contact Form</h3>
        <p><strong>Name:</strong> ${name}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Message:</strong></p>
        <p>${message}</p>
      `,
    };

    // 3. Send the email
    await transporter.sendMail(mailOptions);

    return NextResponse.json({ success: true, message: "Email sent successfully!" }, { status: 200 });
  } catch (error: any) {
    console.error("Email Error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
