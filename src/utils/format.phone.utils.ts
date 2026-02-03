/**
 * Adds +52 to a phone number if missing.
 * Use this BEFORE sending data to the backend.
 * Input: "5512345678" -> Output: "+525512345678"
 */
export const formatMxPhone = (phone: string): string => {
  if (!phone) return "";
  const cleaned = phone.replace(/[\s\-()]/g, '');
  if (cleaned.startsWith('+52')) {
    return cleaned;
  }
  return `+52${cleaned}`;
};

/**
 * Removes +52 from a phone number.
 * Use this AFTER receiving data from the backend (for Edit Forms).
 * Input: "+525512345678" -> Output: "5512345678"
 */
export const stripMxPrefix = (phone: string): string => {
  if (!phone) return "";
  
  if (phone.startsWith('+52')) {
    return phone.slice(3); // Remove first 3 chars (+52)
  }
  return phone;
};