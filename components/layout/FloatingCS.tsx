import { WhatsAppIcon } from "@/lib/icons";
import { getCachedContent } from "@/lib/store/cache";

export async function FloatingCS() {
  const { content } = await getCachedContent();
  const { whatsapp, name } = content.settings;

  return (
    <a
      href={whatsapp}
      target="_blank"
      rel="noopener"
      className="cs-float"
      aria-label={`Chat CS ${name} via WhatsApp`}
    >
      <WhatsAppIcon />
      CS Online
    </a>
  );
}
