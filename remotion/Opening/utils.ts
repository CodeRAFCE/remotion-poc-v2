// Device detection utilities for optimization

export const isMobileDevice = (): boolean => {
  if (typeof window === "undefined") {
    return false;
  }

  // Check if it's a mobile device
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
    navigator.userAgent,
  );
};

export const isWebkit = (): boolean => {
  if (typeof window === "undefined") {
    return false;
  }

  // Check if browser is Safari/WebKit based
  return /^((?!chrome|android).)*safari/i.test(navigator.userAgent);
};

export const getAvatarImage = (login: string): string => {
  // GitHub provides user avatars at this URL
  return `https://github.com/${login}.png`;
};
