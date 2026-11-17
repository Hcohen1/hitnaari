export const SITE = {
  name: "תיאטרון התנערי",
  tagline: "תיאטרון נשים – מצחיק, מרגש ומעורר השראה",
  contactName: "הודיה כהן",
  phoneDisplay: "054-6588573",
  phoneIntl: "972546588573",
  email: "hodayakors@gmail.com",
  facebook: "https://www.facebook.com/profile.php?id=100070978519202",
};

export function whatsappLink(message: string): string {
  return `https://wa.me/${SITE.phoneIntl}?text=${encodeURIComponent(message)}`;
}

export const WHATSAPP_DEFAULT_MSG =
  "שלום הודיה, אשמח לשמוע פרטים על המופעים של תיאטרון התנערי";
