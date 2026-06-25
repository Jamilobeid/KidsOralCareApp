import { ThemeName } from '../types/app';

export const themes: Record<ThemeName, { background: string; primary: string; secondary: string; accent: string; text: string; card: string }> = {
  ocean: { background: '#E8F8FF', primary: '#1D9BF0', secondary: '#7BDFF2', accent: '#FFB703', text: '#17324D', card: '#FFFFFF' },
  sunny: { background: '#FFF6D9', primary: '#FF9F1C', secondary: '#FFD166', accent: '#2EC4B6', text: '#3B2C14', card: '#FFFFFF' },
  mint: { background: '#EAFBF3', primary: '#2EC4B6', secondary: '#B8F2E6', accent: '#F15BB5', text: '#173D35', card: '#FFFFFF' },
  berry: { background: '#FFF0F6', primary: '#F15BB5', secondary: '#F8A5C2', accent: '#00BBF9', text: '#461A33', card: '#FFFFFF' }
};
