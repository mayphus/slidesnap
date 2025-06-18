export interface SocialTemplate {
  id: string;
  name: string;
  width: number;
  height: number;
  minHeight?: number;
  maxHeight?: number;
  dynamicHeight?: boolean;
  backgroundColor: string;
  textColor: string;
  fontSize: number;
  fontFamily: string;
  padding: number;
  lineHeight: number;
  maxLines?: number;
}

export const socialTemplates: Record<string, SocialTemplate> = {
  twitter: {
    id: 'twitter',
    name: 'X/Twitter Post',
    width: 1200,
    height: 675,
    backgroundColor: '#ffffff',
    textColor: '#000000',
    fontSize: 48,
    fontFamily: 'Arial, sans-serif',
    padding: 60,
    lineHeight: 1.4,
    maxLines: 8
  },
  
  instagram_post: {
    id: 'instagram_post',
    name: 'Instagram Post',
    width: 1080,
    height: 1080,
    backgroundColor: '#ffffff',
    textColor: '#000000',
    fontSize: 42,
    fontFamily: 'Arial, sans-serif',
    padding: 80,
    lineHeight: 1.5,
    maxLines: 12
  },
  
  instagram_story: {
    id: 'instagram_story',
    name: 'Instagram Story',
    width: 1080,
    height: 1920,
    backgroundColor: '#ffffff',
    textColor: '#000000',
    fontSize: 48,
    fontFamily: 'Arial, sans-serif',
    padding: 100,
    lineHeight: 1.4,
    maxLines: 20
  },
  
  facebook: {
    id: 'facebook',
    name: 'Facebook Post',
    width: 1200,
    height: 630,
    backgroundColor: '#ffffff',
    textColor: '#000000',
    fontSize: 46,
    fontFamily: 'Arial, sans-serif',
    padding: 60,
    lineHeight: 1.4,
    maxLines: 7
  },
  
  rednote: {
    id: 'rednote',
    name: 'RedNote/XiaoHongShu',
    width: 1080,
    height: 1080,
    minHeight: 600,
    maxHeight: 20000,
    dynamicHeight: true,
    backgroundColor: '#ffffff',
    textColor: '#000000',
    fontSize: 42,
    fontFamily: 'Arial, sans-serif',
    padding: 80,
    lineHeight: 1.5
  },

  article: {
    id: 'article',
    name: 'Long Article',
    width: 1200,
    height: 800,
    minHeight: 600,
    maxHeight: 25000,
    dynamicHeight: true,
    backgroundColor: '#ffffff',
    textColor: '#000000',
    fontSize: 36,
    fontFamily: 'Arial, sans-serif',
    padding: 80,
    lineHeight: 1.6
  }
};

export function getTemplate(templateId: string): SocialTemplate | null {
  return socialTemplates[templateId] || null;
}

export function getAllTemplates(): SocialTemplate[] {
  return Object.values(socialTemplates);
}