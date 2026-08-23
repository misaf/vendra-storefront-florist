function profileSegment(value: string): string {
  return encodeURIComponent(value.trim().replace(/^@+/, ""));
}

export function instagramProfileUrl(username: string): string {
  return `https://www.instagram.com/${profileSegment(username)}`;
}

export function telegramProfileUrl(username: string): string {
  return `https://t.me/${profileSegment(username)}`;
}

export function whatsappUrl(phone: string, message?: string): string {
  const number = phone.replace(/\D/g, "");
  return `https://wa.me/${number}${
    message ? `?text=${encodeURIComponent(message)}` : ""
  }`;
}
