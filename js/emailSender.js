// emailSender.js
export function sendEmail(shopName, mode) {
    const emails = 'tyler@kadingproperties.com,michael@kadingproperties.com';
    const date = new Date().toLocaleDateString().replace(/\//g, '-');
    const subject = `${shopName} | ${mode} Count | ${date}`;
    const body = `
Hello,

Attached is the ${mode.toLowerCase()} count file for ${shopName.replace(/_/g, ' ')}. This file was generated on ${date}.
Please find the Excel document attached.

Note: This is an automatic email sent from Inventory Verification.
Visit: https://adminkading.github.io/Inventory-Verification/

Best regards,
${shopName.replace(/_/g, ' ')}
    `.trim();

    const mailto = `mailto:${emails}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    window.location.href = mailto;

    alert('Email prepared. Please attach the downloaded Excel file before sending.');
}
