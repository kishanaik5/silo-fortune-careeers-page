const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
    service: 'gmail', // Or use host/port for other providers
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
    },
});

async function sendEmail(to, subject, text, html) {
    try {
        const mailOptions = {
            from: '"Silo Fortune Careers" <ravikumar@silofortune.com>',
            to,
            subject,
            text,
            html,
        };

        const info = await transporter.sendMail(mailOptions);
        console.log('Message sent: %s', info.messageId);
        return info;
    } catch (error) {
        console.error('Error sending email:', error);
        // Don't throw, just log. Setup might not be complete.
        return null;
    }
}

async function sendRejectionEmail(applicant) {
    const subject = 'Update on your application at Silo Fortune';
    const text = `Dear ${applicant.name},\n\nThank you for your interest in the position. After careful review, we have decided to move forward with other candidates.\n\nBest regards,\nSilo Fortune HR`;
    const html = `<p>Dear ${applicant.name},</p><p>Thank you for your interest in the position. After careful review, we have decided to move forward with other candidates.</p><p>Best regards,<br>Silo Fortune HR</p>`;
    return sendEmail(applicant.email, subject, text, html);
}

async function sendShortlistedEmail(applicant) {
    const subject = 'Congratulations! You have been shortlisted';
    const text = `Dear ${applicant.name},\n\nWe are pleased to inform you that your application for ${applicant.role} has been shortlisted.\n\nOur HR team will contact you shortly regarding the next steps.\n\nBest regards,\nSilo Fortune HR`;
    const html = `<p>Dear ${applicant.name},</p><p>We are pleased to inform you that your application for <strong>${applicant.role}</strong> has been shortlisted.</p><p>Our HR team will contact you shortly regarding the next steps.</p><p>Best regards,<br>Silo Fortune HR</p>`;
    return sendEmail(applicant.email, subject, text, html);
}

async function sendSelectedEmail(applicant, customBody, customSubject) {
    const subject = customSubject || 'Congratulations! You have been selected';
    // Use custom body if provided, otherwise default
    const text = customBody || `Dear ${applicant.name},\n\nWe are pleased to inform you that you have been selected for the position of ${applicant.role}.\n\nOur HR team will send the offer letter shortly.\n\nBest regards,\nSilo Fortune HR`;

    // Simple HTML conversion for custom body (replace newlines with <br>)
    const htmlBody = customBody ? customBody.replace(/\n/g, '<br>') : `<p>Dear ${applicant.name},</p><p>We are pleased to inform you that you have been selected for the position of <strong>${applicant.role}</strong>.</p><p>Our HR team will send the offer letter shortly.</p><p>Best regards,<br>Silo Fortune HR</p>`;

    return sendEmail(applicant.email, subject, text, htmlBody);
}

async function sendOTPEmail(email, otp) {
    const subject = 'Your Verification Code - Silo Fortune Careers';
    const text = `Your verification code is: ${otp}\n\nThis code will expire in 10 minutes.\n\nIf you did not request this, please ignore this email.`;
    const html = `<p>Your verification code is: <strong>${otp}</strong></p><p>This code will expire in 10 minutes.</p><p>If you did not request this, please ignore this email.</p>`;
    return sendEmail(email, subject, text, html);
}

const sendApplicationReceivedEmail = async (email, name, jobTitle, jobId) => {
    const subject = `Application Received: ${jobTitle} - Silo Fortune`;
    const text = `Dear ${name},\n\nThank you for applying for the position of ${jobTitle} (Job ID: ${jobId}) at Silo Fortune.\n\nWe have successfully received your application. Our team will review your profile and get back to you shortly.\n\nBest Regards,\nHR Team\nSilo Fortune`;

    await sendEmail(email, subject, text);
};

const sendEventRegistrationEmail = async (email, name, eventTitle, ticketCount) => {
    const subject = `Event Registration Confirmed: ${eventTitle} - Silo Fortune`;
    const text = `Dear ${name},\n\nThis is to confirm your registration for "${eventTitle}".\n\nNumber of Tickets: ${ticketCount}\n\nWe look forward to seeing you there!\n\nBest Regards,\nEvents Team\nSilo Fortune`;

    await sendEmail(email, subject, text);
};

module.exports = { sendRejectionEmail, sendShortlistedEmail, sendSelectedEmail, sendOTPEmail, sendApplicationReceivedEmail, sendEventRegistrationEmail };
