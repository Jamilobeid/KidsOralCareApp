export const getDisplayUsername = (nickname: string) => {
  const cleanNickname = nickname.trim();
  const emailSeparator = cleanNickname.indexOf('@');
  return emailSeparator > 0 ? cleanNickname.slice(0, emailSeparator) : cleanNickname;
};
