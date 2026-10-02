// HENU MAIL - Master Visual Email Block Definitions
// Organization: HENU OS Private Limited
// Inspired by Zoho Campaigns & Enterprise Visual Email Builders

export type EmailBlockType =
  | 'heading'
  | 'paragraph'
  | 'button'
  | 'image'
  | 'video'
  | 'divider'
  | 'spacer'
  | 'social'
  | 'header'
  | 'footer'
  | 'product'
  | 'product_list'
  | 'columns'
  | 'quote'
  | 'signature'
  | 'html'
  | 'unsubscribe';

export interface SocialLinkItem {
  platform: 'instagram' | 'facebook' | 'twitter' | 'youtube' | 'linkedin';
  url: string;
  enabled: boolean;
}

export interface ProductItem {
  id: string;
  title: string;
  description: string;
  price: string;
  originalPrice?: string;
  badge?: string;
  imageUrl: string;
  buttonText: string;
  buttonUrl: string;
}

export interface EmailCanvasStyle {
  primaryColor: string;
  secondaryColor: string;
  fontFamily: string;
  emailBackground: string;
  contentBackground: string;
  widthPx: number; // 600, 700, 800, 900
  textDirection: 'ltr' | 'rtl';
  lineHeight: string;
  borderRadiusPx: number;
}

export interface EmailBlock {
  id: string;
  type: EmailBlockType;
  mobileScale?: boolean;
  content: {
    // Text / Heading
    text?: string;
    level?: 'h1' | 'h2' | 'h3';
    fontSize?: string;
    textColor?: string;
    align?: 'left' | 'center' | 'right' | 'justify';

    // Button
    buttonText?: string;
    buttonUrl?: string;
    buttonColor?: string;
    buttonTextColor?: string;
    buttonBorderRadius?: number;
    linkType?: 'url' | 'email' | 'phone';
    emailSubject?: string;
    emailBody?: string;
    phoneNumber?: string;

    // Image
    imageUrl?: string;
    imageAlt?: string;
    imageWidth?: string;
    imageLinkUrl?: string;

    // Video
    videoUrl?: string;
    videoThumbnailUrl?: string;
    videoTitle?: string;

    // Spacing & Layout
    spaceHeight?: number;
    dividerColor?: string;
    dividerStyle?: 'solid' | 'dashed' | 'dotted';

    // Social Links
    socialLinks?: SocialLinkItem[];

    // Header & Footer
    logoUrl?: string;
    logoAlt?: string;
    slogan?: string;
    companyName?: string;
    physicalAddress?: string;
    copyrightText?: string;

    // Ecommerce & Products
    product?: ProductItem;
    products?: ProductItem[];
    productColumns?: 1 | 2 | 3 | 4;

    // Quotes & Signatures
    quoteAuthor?: string;
    quoteSource?: string;
    senderName?: string;
    senderTitle?: string;

    // Multi-column
    columns?: {
      col1: string;
      col2: string;
      col3?: string;
    };

    // Custom Code
    customHtml?: string;
  };
}

export const DEFAULT_CANVAS_STYLE: EmailCanvasStyle = {
  primaryColor: '#7c3aed',
  secondaryColor: '#38bdf8',
  fontFamily: 'Arial, sans-serif',
  emailBackground: '#f1f5f9',
  contentBackground: '#ffffff',
  widthPx: 600,
  textDirection: 'ltr',
  lineHeight: '1.6',
  borderRadiusPx: 8,
};

export const DEFAULT_BLOCK_TEMPLATES: Record<EmailBlockType, Partial<EmailBlock['content']>> = {
  heading: {
    text: 'Dikhaiye Apna Brand, Badhaaiye Apna Business',
    level: 'h2',
    fontSize: '22px',
    textColor: '#0f172a',
    align: 'left',
  },
  paragraph: {
    text: 'Hello {{first_name | default: "there"}},\n\nWe noticed {{company_name | default: "your company"}} is scaling rapidly. Our digital marketing and AI growth engine delivers targeted reach, conversion-focused creatives, and guaranteed ROI.',
    textColor: '#334155',
    align: 'left',
  },
  button: {
    buttonText: 'Book 10-Days Pack (₹8,689/-)',
    buttonUrl: 'mailto:henuospvtltd@gmail.com?subject=Meta%20Ads%2010%20Days%20Pack',
    buttonColor: '#7c3aed',
    buttonTextColor: '#ffffff',
    buttonBorderRadius: 6,
    linkType: 'url',
    align: 'center',
  },
  image: {
    imageUrl: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&auto=format&fit=crop&q=60',
    imageAlt: 'HENU OS Digital Marketing Growth & Creative Package',
    imageWidth: '100%',
    align: 'center',
  },
  video: {
    videoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
    videoThumbnailUrl: 'https://images.unsplash.com/photo-1574717024653-61fd2cf4d44d?w=800&auto=format&fit=crop&q=60',
    videoTitle: 'HENU OS — Growth & Marketing Showcase',
    align: 'center',
  },
  divider: {
    dividerColor: '#e2e8f0',
    dividerStyle: 'solid',
  },
  spacer: {
    spaceHeight: 24,
  },
  social: {
    socialLinks: [
      { platform: 'instagram', url: 'https://www.instagram.com/henuos', enabled: true },
      { platform: 'facebook', url: 'https://www.facebook.com/henuos', enabled: true },
      { platform: 'twitter', url: 'https://www.twitter.com/henuos', enabled: true },
      { platform: 'youtube', url: 'https://www.youtube.com/@henuos', enabled: true },
      { platform: 'linkedin', url: 'https://www.linkedin.com/company/henuos', enabled: true },
    ],
    align: 'center',
  },
  header: {
    logoUrl: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=200&auto=format&fit=crop&q=60',
    logoAlt: 'HENU OS Logo',
    slogan: 'One OS. Infinite Possibilities.',
    align: 'center',
  },
  footer: {
    companyName: 'HENU OS PRIVATE LIMITED',
    physicalAddress: 'Plot 42, Okhla Industrial Area Phase 3, New Delhi, DL 110020 IN',
    copyrightText: '© 2026 HENU OS Private Limited. All rights reserved.',
    text: 'If you prefer not to receive promotional updates, <a href="{{unsubscribe_url}}" style="color: #7c3aed; text-decoration: underline;">unsubscribe here</a>.',
  },
  product: {
    product: {
      id: 'prod-meta-10',
      title: 'Meta Ads 10-Days Pack',
      description: 'Strategic Ad Planning, Targeted Reach, Promo Video & Professional Logo Design.',
      price: '₹8,689/-',
      originalPrice: '₹14,999/-',
      badge: 'SPECIAL OFFER',
      imageUrl: 'https://images.unsplash.com/photo-1557838923-2985c318be48?w=600&auto=format&fit=crop&q=60',
      buttonText: 'Claim Offer Now',
      buttonUrl: 'mailto:henuospvtltd@gmail.com?subject=Meta%20Ads%20Claim',
    },
  },
  product_list: {
    productColumns: 2,
    products: [
      {
        id: 'prod-1',
        title: 'Meta Ads 10-Days Pack',
        description: 'Complete campaign launch with high ROI targeting.',
        price: '₹8,689/-',
        originalPrice: '₹14,999/-',
        badge: 'POPULAR',
        imageUrl: 'https://images.unsplash.com/photo-1557838923-2985c318be48?w=400&auto=format&fit=crop&q=60',
        buttonText: 'Order Now',
        buttonUrl: 'mailto:henuospvtltd@gmail.com',
      },
      {
        id: 'prod-2',
        title: 'AI Automation Suite',
        description: 'Automated CRM pipelines and email sequences.',
        price: '₹18,500/-',
        originalPrice: '₹29,000/-',
        badge: 'ENTERPRISE',
        imageUrl: 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=400&auto=format&fit=crop&q=60',
        buttonText: 'Consult Us',
        buttonUrl: 'mailto:henuospvtltd@gmail.com',
      },
    ],
  },
  columns: {
    columns: {
      col1: '<strong>🎯 Strategic Planning</strong><br/><span style="color: #64748b; font-size: 12px;">Audience segmentation & funnels.</span>',
      col2: '<strong>🎬 Creative Video Ads</strong><br/><span style="color: #64748b; font-size: 12px;">Reels & promos that convert.</span>',
    },
  },
  quote: {
    text: '"HENU OS ka vaada, Result Pakka! Soch Badlo, Business Badhega!"',
    quoteAuthor: 'Growth Guarantee Program',
  },
  signature: {
    senderName: 'HENU OS Executive Team',
    senderTitle: 'Growth & Marketing Intelligence',
    companyName: 'HENU OS Private Limited',
  },
  html: {
    customHtml: '<div style="background: #fdf4ff; border: 2px dashed #a855f7; border-radius: 8px; padding: 16px; text-align: center;"><strong style="color: #7c3aed; font-size: 16px;">✨ SPECIAL 10-DAYS PROMOTION ACTIVE</strong><div style="font-size: 12px; color: #64748b; margin-top: 4px;">Exclusive for verified enterprise partners.</div></div>',
  },
  unsubscribe: {
    text: 'To opt out of future updates, <a href="{{unsubscribe_url}}" style="color: #7c3aed; text-decoration: underline;">click here to unsubscribe</a>.',
  },
};
