export const validateForbiddenChars = (value: string): boolean => {
  const forbidden = ['<', '>', "'"];
  return !forbidden.some(char => value.includes(char));
};

export const getForbiddenCharsError = (fieldName: string): string => {
  return `${fieldName} cannot contain the characters: < > '`;
};

export const sanitizeString = (value: string): string => {
  return value.trim().replace(/[<>'"]/g, '');
};

export const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export const validateMinLength = (value: string, minLength: number): boolean => {
  return value.trim().length >= minLength;
};

export const validateAlphaOnly = (value: string): boolean => {
  return /^[a-zA-Z]+$/.test(value.trim());
};
