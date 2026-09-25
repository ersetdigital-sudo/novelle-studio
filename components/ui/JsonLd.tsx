/** Menyisipkan structured data JSON-LD ke dalam halaman (SEO + AI friendly). */
export function JsonLd({ data }: { data: Record<string, unknown> }) {
  return (
    <script
      type="application/ld+json"
      // JSON.stringify aman di sini: data selalu berasal dari konstanta internal, bukan input user.
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}
