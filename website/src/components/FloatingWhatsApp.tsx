import { whatsappLink, WHATSAPP_DEFAULT_MSG } from "../data/site";
import { WhatsAppIcon } from "./Icons";

export default function FloatingWhatsApp() {
  return (
    <a
      className="floating-whatsapp"
      href={whatsappLink(WHATSAPP_DEFAULT_MSG)}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="שלחו לנו הודעה בוואטסאפ"
    >
      <WhatsAppIcon size={30} />
    </a>
  );
}
