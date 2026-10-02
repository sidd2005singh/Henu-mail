// HENU MAIL - Master Client-Safe HTML Email Generator
// Organization: HENU OS Private Limited
// Production HTML rendering with cross-client support (Gmail, Apple Mail, Outlook, Yahoo)

import { EmailBlock, EmailCanvasStyle, DEFAULT_CANVAS_STYLE } from './block-types';

export function generateHtmlFromBlocks(
  blocks: EmailBlock[],
  canvasStyle: EmailCanvasStyle = DEFAULT_CANVAS_STYLE
): string {
  const renderedBlocks = blocks.map((block) => {
    const { content } = block;

    switch (block.type) {
      case 'header': {
        return `
          <tr>
            <td align="${content.align || 'center'}" style="padding: 24px 16px; border-bottom: 1px solid #f1f5f9;">
              ${content.logoUrl ? `<img src="${content.logoUrl}" alt="${content.logoAlt || 'Logo'}" style="max-height: 48px; width: auto; margin-bottom: 8px; border-radius: 4px;" />` : ''}
              ${content.slogan ? `<div style="font-size: 13px; color: #64748b; font-family: ${canvasStyle.fontFamily}; font-style: italic;">${content.slogan}</div>` : ''}
            </td>
          </tr>
        `;
      }

      case 'heading': {
        const tag = content.level || 'h2';
        const fontSize = content.fontSize || (tag === 'h1' ? '26px' : tag === 'h2' ? '20px' : '16px');
        const color = content.textColor || '#0f172a';
        return `
          <tr>
            <td align="${content.align || 'left'}" style="padding: 12px 16px;">
              <${tag} style="margin: 0; color: ${color}; font-family: ${canvasStyle.fontFamily}; font-size: ${fontSize}; font-weight: 800; line-height: 1.3;">
                ${content.text || ''}
              </${tag}>
            </td>
          </tr>
        `;
      }

      case 'paragraph': {
        const formatted = (content.text || '').replace(/\n/g, '<br/>');
        const color = content.textColor || '#334155';
        return `
          <tr>
            <td align="${content.align || 'left'}" style="padding: 8px 16px; color: ${color}; font-family: ${canvasStyle.fontFamily}; font-size: 14px; line-height: ${canvasStyle.lineHeight};">
              <p style="margin: 0;">${formatted}</p>
            </td>
          </tr>
        `;
      }

      case 'button': {
        let href = content.buttonUrl || '#';
        if (content.linkType === 'email' && content.emailSubject) {
          href = `mailto:${content.buttonUrl || ''}?subject=${encodeURIComponent(content.emailSubject)}&body=${encodeURIComponent(content.emailBody || '')}`;
        } else if (content.linkType === 'phone' && content.phoneNumber) {
          href = `tel:${content.phoneNumber}`;
        }

        const btnColor = content.buttonColor || canvasStyle.primaryColor;
        const btnTextColor = content.buttonTextColor || '#ffffff';
        const radius = content.buttonBorderRadius !== undefined ? content.buttonBorderRadius : 6;

        return `
          <tr>
            <td align="${content.align || 'center'}" style="padding: 20px 16px;">
              <table border="0" cellspacing="0" cellpadding="0" style="margin: ${content.align === 'center' ? '0 auto' : content.align === 'right' ? '0 0 0 auto' : '0'};">
                <tr>
                  <td align="center" style="border-radius: ${radius}px; background-color: ${btnColor};">
                    <a href="${href}" target="_blank" style="font-family: ${canvasStyle.fontFamily}; font-size: 14px; font-weight: 700; color: ${btnTextColor}; text-decoration: none; padding: 12px 28px; border-radius: ${radius}px; display: inline-block;">
                      ${content.buttonText || 'Click Here'}
                    </a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        `;
      }

      case 'image': {
        const img = `<img src="${content.imageUrl || ''}" alt="${content.imageAlt || ''}" width="${content.imageWidth || '100%'}" style="display: block; max-width: 100%; height: auto; border-radius: 6px; margin: 0 auto;" />`;
        return `
          <tr>
            <td align="${content.align || 'center'}" style="padding: 12px 16px;">
              ${content.imageLinkUrl ? `<a href="${content.imageLinkUrl}" target="_blank" style="text-decoration: none;">${img}</a>` : img}
              ${content.imageAlt ? `<div style="font-size: 11px; color: #94a3b8; margin-top: 4px; font-family: ${canvasStyle.fontFamily};">${content.imageAlt}</div>` : ''}
            </td>
          </tr>
        `;
      }

      case 'video': {
        const thumb = content.videoThumbnailUrl || 'https://images.unsplash.com/photo-1574717024653-61fd2cf4d44d?w=800&auto=format&fit=crop&q=60';
        return `
          <tr>
            <td align="${content.align || 'center'}" style="padding: 16px;">
              <a href="${content.videoUrl || 'https://youtube.com'}" target="_blank" style="display: block; position: relative; text-decoration: none; border-radius: 8px; overflow: hidden; max-width: 100%;">
                <img src="${thumb}" alt="${content.videoTitle || 'Watch Video'}" style="width: 100%; height: auto; display: block; border-radius: 8px;" />
                <div style="background: rgba(15, 23, 42, 0.7); padding: 8px 14px; border-radius: 6px; color: #ffffff; font-size: 12px; font-weight: 700; font-family: ${canvasStyle.fontFamily}; margin-top: 6px; text-align: center;">
                  ▶ Play Video: ${content.videoTitle || 'Watch Preview'}
                </div>
              </a>
            </td>
          </tr>
        `;
      }

      case 'divider': {
        const borderStyle = content.dividerStyle || 'solid';
        const borderColor = content.dividerColor || '#e2e8f0';
        return `
          <tr>
            <td style="padding: 16px;">
              <hr style="border: none; border-top: 1px ${borderStyle} ${borderColor}; margin: 0;" />
            </td>
          </tr>
        `;
      }

      case 'spacer': {
        return `
          <tr>
            <td height="${content.spaceHeight || 24}" style="font-size: 0; line-height: 0;">&nbsp;</td>
          </tr>
        `;
      }

      case 'social': {
        const links = content.socialLinks || [];
        const activeLinks = links.filter((l) => l.enabled);
        const iconsHtml = activeLinks
          .map((l) => {
            const label = l.platform.toUpperCase();
            return `
              <td style="padding: 0 8px;">
                <a href="${l.url}" target="_blank" style="display: inline-block; padding: 6px 12px; background: #f1f5f9; border-radius: 20px; font-size: 11px; font-weight: 700; color: ${canvasStyle.primaryColor}; text-decoration: none; font-family: ${canvasStyle.fontFamily};">
                  ${label}
                </a>
              </td>
            `;
          })
          .join('');

        return `
          <tr>
            <td align="${content.align || 'center'}" style="padding: 18px 16px;">
              <table border="0" cellspacing="0" cellpadding="0" style="margin: 0 auto;">
                <tr>
                  ${iconsHtml}
                </tr>
              </table>
            </td>
          </tr>
        `;
      }

      case 'product': {
        const prod = content.product;
        if (!prod) return '';
        return `
          <tr>
            <td style="padding: 16px;">
              <table width="100%" border="0" cellspacing="0" cellpadding="0" style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; overflow: hidden;">
                <tr>
                  ${prod.imageUrl ? `
                  <td width="35%" valign="middle" style="padding: 12px;">
                    <img src="${prod.imageUrl}" alt="${prod.title}" style="width: 100%; height: auto; border-radius: 6px; display: block;" />
                  </td>` : ''}
                  <td valign="middle" style="padding: 16px; font-family: ${canvasStyle.fontFamily};">
                    ${prod.badge ? `<span style="background: #e11d48; color: #ffffff; font-size: 10px; font-weight: 800; padding: 2px 8px; border-radius: 4px; text-transform: uppercase;">${prod.badge}</span>` : ''}
                    <h3 style="font-size: 16px; font-weight: 800; color: #0f172a; margin: 6px 0 4px 0;">${prod.title}</h3>
                    <p style="font-size: 12px; color: #64748b; margin: 0 0 10px 0; line-height: 1.4;">${prod.description}</p>
                    <div style="font-size: 20px; font-weight: 900; color: ${canvasStyle.primaryColor}; margin-bottom: 10px;">
                      ${prod.price} ${prod.originalPrice ? `<span style="font-size: 12px; color: #94a3b8; text-decoration: line-through; font-weight: 500;">${prod.originalPrice}</span>` : ''}
                    </div>
                    <a href="${prod.buttonUrl}" target="_blank" style="display: inline-block; background: ${canvasStyle.primaryColor}; color: #ffffff; font-size: 12px; font-weight: 700; text-decoration: none; padding: 8px 18px; border-radius: 4px;">
                      ${prod.buttonText} &rarr;
                    </a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        `;
      }

      case 'product_list': {
        const prods = content.products || [];
        const cols = content.productColumns || 2;
        const colWidth = Math.floor(100 / cols);

        const cells = prods
          .map((p) => `
            <td width="${colWidth}%" valign="top" style="padding: 8px;">
              <table width="100%" border="0" cellspacing="0" cellpadding="0" style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 6px; padding: 12px; text-align: center; font-family: ${canvasStyle.fontFamily};">
                <tr>
                  <td>
                    ${p.imageUrl ? `<img src="${p.imageUrl}" alt="${p.title}" style="width: 100%; max-height: 120px; object-fit: cover; border-radius: 4px; margin-bottom: 8px;" />` : ''}
                    ${p.badge ? `<div style="display: inline-block; background: #7c3aed; color: #ffffff; font-size: 9px; font-weight: 800; padding: 2px 6px; border-radius: 3px; margin-bottom: 4px;">${p.badge}</div>` : ''}
                    <div style="font-size: 13px; font-weight: 700; color: #0f172a; margin-bottom: 4px;">${p.title}</div>
                    <div style="font-size: 16px; font-weight: 800; color: ${canvasStyle.primaryColor}; margin-bottom: 8px;">${p.price}</div>
                    <a href="${p.buttonUrl}" target="_blank" style="display: inline-block; background: ${canvasStyle.primaryColor}; color: #ffffff; font-size: 11px; font-weight: 700; text-decoration: none; padding: 6px 14px; border-radius: 4px;">
                      ${p.buttonText}
                    </a>
                  </td>
                </tr>
              </table>
            </td>
          `)
          .join('');

        return `
          <tr>
            <td style="padding: 12px 8px;">
              <table width="100%" border="0" cellspacing="0" cellpadding="0">
                <tr>
                  ${cells}
                </tr>
              </table>
            </td>
          </tr>
        `;
      }

      case 'quote': {
        return `
          <tr>
            <td style="padding: 14px 16px;">
              <blockquote style="margin: 0; padding: 14px 18px; border-left: 4px solid ${canvasStyle.primaryColor}; background-color: #f8fafc; color: #334155; font-style: italic; font-family: ${canvasStyle.fontFamily}; font-size: 14px; border-radius: 0 6px 6px 0;">
                ${content.text || ''}
                ${content.quoteAuthor ? `<div style="font-style: normal; font-weight: 700; font-size: 12px; margin-top: 6px; color: ${canvasStyle.primaryColor};">— ${content.quoteAuthor}</div>` : ''}
              </blockquote>
            </td>
          </tr>
        `;
      }

      case 'columns': {
        return `
          <tr>
            <td style="padding: 14px 16px;">
              <table width="100%" border="0" cellspacing="0" cellpadding="0">
                <tr>
                  <td width="48%" valign="top" style="padding: 12px; background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 6px; font-family: ${canvasStyle.fontFamily}; font-size: 13px; line-height: 1.5; color: #334155;">
                    ${content.columns?.col1 || ''}
                  </td>
                  <td width="4%">&nbsp;</td>
                  <td width="48%" valign="top" style="padding: 12px; background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 6px; font-family: ${canvasStyle.fontFamily}; font-size: 13px; line-height: 1.5; color: #334155;">
                    ${content.columns?.col2 || ''}
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        `;
      }

      case 'signature': {
        return `
          <tr>
            <td style="padding: 16px; color: #334155; font-family: ${canvasStyle.fontFamily}; font-size: 14px; line-height: 1.5;">
              <div style="font-weight: 800; color: #0f172a;">${content.senderName || 'Vikram Sharma'}</div>
              <div style="color: #64748b; font-size: 12px;">${content.senderTitle || 'Solutions Architect'} &bull; ${content.companyName || 'HENU OS Private Limited'}</div>
            </td>
          </tr>
        `;
      }

      case 'html': {
        return `
          <tr>
            <td style="padding: 12px 16px;">
              ${content.customHtml || ''}
            </td>
          </tr>
        `;
      }

      case 'footer': {
        return `
          <tr>
            <td align="center" style="padding: 24px 16px 12px 16px; color: #94a3b8; font-family: ${canvasStyle.fontFamily}; font-size: 11px; line-height: 1.5; border-top: 1px solid #f1f5f9;">
              <div style="font-weight: 700; color: #64748b; margin-bottom: 4px;">${content.companyName || 'HENU OS PRIVATE LIMITED'}</div>
              ${content.physicalAddress ? `<div>${content.physicalAddress}</div>` : ''}
              ${content.copyrightText ? `<div style="margin-top: 4px;">${content.copyrightText}</div>` : ''}
              ${content.text ? `<div style="margin-top: 8px;">${content.text}</div>` : ''}
            </td>
          </tr>
        `;
      }

      case 'unsubscribe': {
        return `
          <tr>
            <td align="center" style="padding: 10px 16px 20px 16px; color: #94a3b8; font-family: ${canvasStyle.fontFamily}; font-size: 11px; line-height: 1.4;">
              <p style="margin: 0;">${content.text || 'To opt out of future messages, <a href="{{unsubscribe_url}}" style="color: #7c3aed; text-decoration: underline;">unsubscribe here</a>.'}</p>
            </td>
          </tr>
        `;
      }

      default:
        return '';
    }
  }).join('\n');

  return `<!DOCTYPE html>
<html lang="en" dir="${canvasStyle.textDirection}">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
  <title>HENU MAIL Master Dispatch</title>
</head>
<body style="margin: 0; padding: 0; background-color: ${canvasStyle.emailBackground}; -webkit-font-smoothing: antialiased; direction: ${canvasStyle.textDirection}; font-family: ${canvasStyle.fontFamily};">
  <center style="width: 100%; background-color: ${canvasStyle.emailBackground}; padding: 24px 0;">
    <table border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: ${canvasStyle.widthPx}px; background-color: ${canvasStyle.contentBackground}; border: 1px solid #e2e8f0; border-radius: ${canvasStyle.borderRadiusPx}px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.04);">
      ${renderedBlocks}
    </table>
  </center>
</body>
</html>`;
}
