import { site } from "@/data/site";
import { WhatsAppIcon } from "@/lib/icons";

export function FloatingCS() {
  return (
    <a
      href={site.contact.whatsapp}
      target="_blank"
      rel="noopener"
      className="cs-float"
      aria-label={`Chat CS ${site.name} via WhatsApp`}
    >
      <WhatsAppIcon />
      CS Online
    </a>
  );
}
