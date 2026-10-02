// HENU MAIL - Master Production Template Library
// Organization: HENU OS Private Limited

export interface PrebuiltTemplate {
  id: string;
  name: string;
  category: string;
  outreachType:
    | 'introduction'
    | 'service_specific'
    | 'follow_up'
    | 'consultation_invitation'
    | 'proposal_followup'
    | 're_engagement'
    | 'business_occasion'
    | 'product_announcement'
    | 'investor_startup'
    | 'cross_sell';
  subject: string;
  bodyHtml: string;
  bodyText: string;
  description: string;
  variables: string[];
}

export const HENU_OS_PREBUILT_TEMPLATES: PrebuiltTemplate[] = [
  // MASTER DIGITAL MARKETING TEMPLATE (RESPONSIVE FOR MOBILE & DESKTOP)
  {
    id: "henu-digital-marketing-master",
    name: "HENU OS — Digital Marketing Meta Ads 10-Days Pack (₹8,689/-)",
    category: "Digital Marketing",
    outreachType: "product_announcement",
    subject: "Dikhaiye Apna Brand, Badhaaiye Apna Business — HENU OS",
    description: "Official HENU OS Digital Marketing template with custom branded poster visual, Meta Ads 10-Day Growth Pack, WhatsApp direct CTA, and responsive mobile/desktop layout.",
    variables: ["client_name", "first_name", "company_name"],
    bodyHtml: `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    body { margin: 0; padding: 0; background-color: #f1f5f9; -webkit-text-size-adjust: 100%; -ms-text-size-adjust: 100%; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; }
    table { border-collapse: collapse; mso-table-lspace: 0pt; mso-table-rspace: 0pt; }
    img { border: 0; outline: none; text-decoration: none; -ms-interpolation-mode: bicubic; }
    
    /* Responsive Mobile Styles */
    @media only screen and (max-width: 600px) {
      .email-container { width: 100% !important; max-width: 100% !important; border-radius: 0 !important; }
      .content-padding { padding: 18px 16px !important; }
      .stack-column { display: block !important; width: 100% !important; max-width: 100% !important; box-sizing: border-box !important; }
      .stack-column-left { border-right: none !important; border-bottom: 1px solid #e2e8f0 !important; padding-right: 0 !important; padding-bottom: 16px !important; margin-bottom: 16px !important; }
      .stack-column-right { padding-left: 0 !important; }
      .btn-responsive { display: block !important; width: 90% !important; margin: 10px auto !important; padding: 14px 12px !important; text-align: center !important; font-size: 13px !important; }
      .hero-image { width: 100% !important; height: auto !important; max-height: none !important; }
      .header-title { font-size: 14px !important; }
    }
  </style>
</head>
<body style="margin: 0; padding: 12px 0; background-color: #f1f5f9;">
  <div class="email-container" style="max-width: 600px; margin: 0 auto; background: #ffffff; border: 1px solid #e2e8f0; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.06);">
    
    <!-- [HEADER] -->
    <div style="padding: 18px 24px; border-bottom: 1px solid #f1f5f9; background: #ffffff;">
      <table style="width: 100%; border-collapse: collapse;">
        <tr>
          <td style="vertical-align: middle;">
            <div style="display: flex; align-items: center; gap: 12px;">
              <div style="display: inline-block; vertical-align: middle;">
                <img src="http://localhost:3000/logo.png" alt="HENU Logo" style="width: 42px; height: 42px; object-fit: contain; border-radius: 50%;" />
              </div>
              <div style="display: inline-block; vertical-align: middle; margin-left: 12px;">
                <div class="header-title" style="font-size: 16px; font-weight: 900; color: #0f172a; letter-spacing: 0.5px;">HENU OS PRIVATE LIMITED</div>
                <div style="font-size: 11px; font-weight: 600; color: #64748b; letter-spacing: 0.5px;">Transform Your Tech</div>
              </div>
            </div>
          </td>
        </tr>
      </table>
    </div>

    <!-- [PHOTO / POSTER BANNER] -->
    <div style="background: #ffffff; text-align: center; border-bottom: 1px solid #f1f5f9;">
      <img class="hero-image" src="http://localhost:3000/template-1-image.png" alt="HENU OS Digital Marketing Growth & Meta Ads 10 Days Pack" style="width: 100%; max-width: 600px; height: auto; display: block; margin: 0 auto;" />
    </div>

    <!-- [BODY SECTION] -->
    <div class="content-padding" style="padding: 24px 24px 20px 24px; color: #334155; font-size: 14px; line-height: 1.6;">
      <div style="font-size: 16px; font-weight: 800; color: #0f172a; margin-bottom: 12px;">
        Hi {{client_name | default: first_name | default: 'there'}},
      </div>
      
      <p style="margin: 0 0 12px 0; font-size: 15px; font-weight: 600; color: #0f172a;">
        Ready to turn clicks into paying customers?
      </p>

      <p style="margin: 0 0 20px 0;">
        At <strong>HENU OS Private Limited</strong>, we deliver high-performing digital marketing designed to scale your business fast.
      </p>

      <!-- Special Meta Ads 10-Day Growth Pack Box -->
      <div style="background: linear-gradient(135deg, #fffbeb 0%, #fdf4ff 100%); border: 2px dashed #a855f7; border-radius: 12px; padding: 18px; margin-bottom: 20px;">
        <div style="font-size: 15px; font-weight: 900; color: #7c3aed; margin-bottom: 8px;">
          🔥 Special Meta Ads 10-Day Growth Pack
        </div>
        <ul style="margin: 0 0 8px 0; padding-left: 20px; font-size: 13px; line-height: 1.8; color: #1e293b;">
          <li><strong>Offer Price:</strong> Just <span style="font-size: 16px; font-weight: 900; color: #7c3aed;">₹8,689/-</span></li>
          <li><strong>What's Included:</strong> Targeted Meta Ad setup, promo video creatives, daily optimization, and performance tracking.</li>
          <li><strong>Our Promise:</strong> <em style="color: #7c3aed; font-weight: 700;">HENU OS Ka Vaada, Result Pakka!</em></li>
        </ul>
      </div>

      <!-- Primary CTA: WhatsApp Direct Action -->
      <div style="text-align: center; margin: 20px 0 12px 0;">
        <a class="btn-responsive" href="https://wa.me/918094100513?text=Hi%20HENU%20OS%20Team%2C%20I%20want%20to%20claim%20the%20Special%20Meta%20Ads%2010-Day%20Pack%20(%E2%82%B98%2C689%2F-)" style="display: inline-block; background: #22c55e; color: #ffffff; font-size: 14px; font-weight: 800; text-decoration: none; padding: 14px 28px; border-radius: 30px; text-transform: uppercase; letter-spacing: 0.5px; box-shadow: 0 4px 16px rgba(34,197,94,0.35);">
          👉 CLAIM YOUR 10-DAY PACK ON WHATSAPP
        </a>
      </div>

      <!-- Secondary Promise Button -->
      <div style="text-align: center; margin: 0 0 18px 0;">
        <a class="btn-responsive" href="https://henu-build.netlify.app/services" style="display: inline-block; background: linear-gradient(90deg, #06b6d4 0%, #7c3aed 100%); color: #ffffff; font-size: 12px; font-weight: 800; text-decoration: none; padding: 10px 24px; border-radius: 20px; text-transform: uppercase; letter-spacing: 0.5px; box-shadow: 0 4px 12px rgba(124,58,237,0.25);">
          HENU OS KA VAADA, RESULT PAKKA!
        </a>
      </div>

      <p style="margin: 0 0 8px 0; font-size: 13px; color: #475569; text-align: center;">
        Have questions? Simply reply to this email, or call our team directly!
      </p>

      <div style="text-align: center; font-size: 12px; font-weight: 600; color: #64748b; margin-bottom: 20px;">
        <a href="https://henu-build.netlify.app/services" style="color: #7c3aed; text-decoration: underline;">Learn More</a> &nbsp;&nbsp;|&nbsp;&nbsp; 
        <a href="https://henu-build.netlify.app/contact" style="color: #7c3aed; text-decoration: underline;">Contact Us</a>
      </div>

      <!-- Team Sign-off Details -->
      <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 14px 18px; font-size: 12px; line-height: 1.7; color: #334155; margin-bottom: 16px;">
        <div style="font-weight: 800; color: #0f172a; margin-bottom: 2px;">Best regards,</div>
        <div style="font-size: 13px; font-weight: 800; color: #7c3aed; margin-bottom: 4px;">TEAM HENU OS</div>
        <div><strong>Phone:</strong> +91 8094100513 | +91 8155077057</div>
        <div><strong>Email:</strong> info@henuos.in | support.henuos@gmail.com</div>
        <div><strong>Contact Us:</strong> <a href="https://henu-build.netlify.app/contact" style="color: #0284c7; text-decoration: underline;">https://henu-build.netlify.app/contact</a></div>
      </div>
    </div>

    <!-- [WHAT WE DO vs WHY CHOOSE HENU OS GRID (STACKS CLEANLY ON MOBILE)] -->
    <div class="content-padding" style="padding: 20px 24px; background: #fafafa; border-top: 1px solid #e2e8f0; border-bottom: 1px solid #e2e8f0;">
      <table style="width: 100%; border-collapse: collapse;">
        <tr>
          <!-- Left: WHAT WE DO -->
          <td class="stack-column stack-column-left" style="width: 50%; vertical-align: top; padding-right: 12px; border-right: 1px solid #e2e8f0;">
            <div style="font-size: 11px; font-weight: 900; color: #7c3aed; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 8px;">
              &bull; WHAT WE DO &bull;
            </div>
            <ol style="margin: 0; padding-left: 18px; font-size: 11px; font-weight: 700; color: #1e293b; line-height: 1.8;">
              <li>STRATEGIC AD PLANNING</li>
              <li>TARGETED AUDIENCE REACH</li>
              <li>PROMO VIDEO CREATION</li>
              <li>ENGAGEMENT BOOST</li>
              <li>PERFORMANCE TRACKING</li>
            </ol>
          </td>

          <!-- Right: WHY CHOOSE HENU OS -->
          <td class="stack-column stack-column-right" style="width: 50%; vertical-align: top; padding-left: 12px;">
            <div style="font-size: 11px; font-weight: 900; color: #7c3aed; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 8px;">
              &bull; WHY CHOOSE HENU OS? &bull;
            </div>
            <ul style="margin: 0; padding-left: 16px; font-size: 11px; font-weight: 700; color: #1e293b; line-height: 1.8; list-style-type: square;">
              <li>RESULT FOCUSED APPROACH</li>
              <li>CREATIVE THAT CONVERTS</li>
              <li>TRANSPARENT & HONEST WORK</li>
              <li>DAILY MONITORING & OPTIMIZATION</li>
              <li>BETTER ROI, MAXIMUM IMPACT</li>
            </ul>
          </td>
        </tr>
      </table>
    </div>

    <!-- [QUICK LINKS] -->
    <div class="content-padding" style="padding: 14px 20px; text-align: center; background: #ffffff; font-size: 12px; font-weight: 700; border-bottom: 1px solid #f1f5f9;">
      <span style="color: #64748b; font-size: 11px; text-transform: uppercase; margin-right: 6px;">Quick Links:</span>
      <a href="https://henu-build.netlify.app/services" style="color: #7c3aed; text-decoration: none;">Services</a> &nbsp;|&nbsp;
      <a href="https://wa.me/918094100513" style="color: #22c55e; text-decoration: none;">WhatsApp</a> &nbsp;|&nbsp;
      <a href="https://henu-build.netlify.app/social" style="color: #7c3aed; text-decoration: none;">Socials</a> &nbsp;|&nbsp;
      <a href="https://henu-build.netlify.app/privacy-policy" style="color: #7c3aed; text-decoration: none;">Privacy Policy</a>
    </div>

    <!-- [FOOTER] -->
    <div class="content-padding" style="background: #0f172a; color: #94a3b8; padding: 24px 20px; text-align: center; font-size: 11px; line-height: 1.6;">
      <div style="color: #ffffff; font-weight: 800; margin-bottom: 6px;">
        HENU OS PRIVATE LIMITED
      </div>
      <div style="color: #94a3b8; margin-bottom: 6px;">
        <a href="https://henu-build.netlify.app" style="color: #38bdf8; text-decoration: none;">https://henu-build.netlify.app</a> &bull; Bangalore, India &bull; All rights reserved.
      </div>
      <div style="color: #64748b; margin-bottom: 8px;">
        <a href="{{unsubscribe_url}}" style="color: #38bdf8; text-decoration: underline;">Unsubscribe</a> &nbsp;|&nbsp; 
        <a href="https://henu-build.netlify.app/privacy-policy" style="color: #38bdf8; text-decoration: underline;">Privacy Policy</a>
      </div>
      <div style="border-top: 1px solid #1e293b; padding-top: 8px; font-size: 11px; color: #cbd5e1;">
        <strong>Reply to this Email directly to talk to a product specialist!</strong>
      </div>
    </div>

  </div>
</body>
</html>`,
    bodyText: `Subject: Dikhaiye Apna Brand, Badhaaiye Apna Business — HENU OS

Hi {{client_name | default: first_name | default: 'there'}},

Ready to turn clicks into paying customers?

At HENU OS Private Limited, we deliver high-performing digital marketing designed to scale your business fast.

🔥 Special Meta Ads 10-Day Growth Pack
• Offer Price: Just ₹8,689/-
• What's Included: Targeted Meta Ad setup, promo video creatives, daily optimization, and performance tracking.
• Our Promise: HENU OS Ka Vaada, Result Pakka!

👉 CLAIM YOUR 10-DAY PACK ON WHATSAPP: https://wa.me/918094100513

Have questions? Simply reply to this email, or call our team directly!

Best regards,
TEAM HENU OS
Phone: +91 8094100513 | +91 8155077057
Email: info@henuos.in | support.henuos@gmail.com
Contact Us: https://henu-build.netlify.app/contact

Quick Links:
Services (https://henu-build.netlify.app/services) | WhatsApp (https://wa.me/918094100513) | Socials (https://henu-build.netlify.app/social) | Privacy Policy (https://henu-build.netlify.app/privacy-policy)

• WHAT WE DO •
1. STRATEGIC AD PLANNING
2. TARGETED AUDIENCE REACH
3. PROMO VIDEO CREATION
4. ENGAGEMENT BOOST
5. PERFORMANCE TRACKING

• WHY CHOOSE HENU OS? •
• RESULT FOCUSED APPROACH
• CREATIVE THAT CONVERTS
• TRANSPARENT & HONEST WORK
• DAILY MONITORING & OPTIMIZATION
• BETTER ROI, MAXIMUM IMPACT

HENU OS PRIVATE LIMITED | https://henu-build.netlify.app | All rights reserved.
Unsubscribe: {{unsubscribe_url}} | Privacy Policy: https://henu-build.netlify.app/privacy-policy
Reply to this Email directly to talk to a product specialist!`,
  },
];
