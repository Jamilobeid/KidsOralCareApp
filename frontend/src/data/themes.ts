import { ThemeName } from '../types/app';

export const themes: Record<ThemeName, { background: string; primary: string; secondary: string; accent: string; text: string; card: string; gradient: [string, string, string] }> = {
  ocean: { background: '#E8F8FF', primary: '#1D9BF0', secondary: '#7BDFF2', accent: '#FFB703', text: '#17324D', card: '#FFFFFF', gradient: ['#44D0C4', '#E4F8F5', '#FFFFFF'] },
  sunny: { background: '#FFF6D9', primary: '#FF9F1C', secondary: '#FFD166', accent: '#2EC4B6', text: '#3B2C14', card: '#FFFFFF', gradient: ['#FFD166', '#FFF6D9', '#FFFFFF'] },
  mint: { background: '#E9FFF1', primary: '#22C55E', secondary: '#A7F3D0', accent: '#F15BB5', text: '#173D35', card: '#FFFFFF', gradient: ['#7CFFB2', '#DFFFEA', '#FFFFFF'] },
  berry: { background: '#FFF0F6', primary: '#F15BB5', secondary: '#F8A5C2', accent: '#00BBF9', text: '#461A33', card: '#FFFFFF', gradient: ['#F8A5C2', '#FFF0F6', '#FFFFFF'] }
};
