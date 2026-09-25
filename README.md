# Novelle Studio — PPOB Landing & Transaksi

Landing page + alur transaksi PPOB, dikonversi dari HTML statis ke **Next.js (App Router) + TypeScript + Tailwind CSS**. SEO/GEO ready, guest checkout, pembayaran QRIS.

## Menjalankan

```bash
npm install
npm run dev        # http://localhost:3000
npm run build      # build produksi
npm run typecheck  # cek tipe tanpa emit
```

## Struktur

```
app/                     # routing App Router
├─ layout.tsx            # font lokal, metadata global, JSON-LD, Header/Footer
├─ page.tsx              # beranda: hero, kategori, kenapa kami, cara, promo, testimoni, FAQ
├─ produk/[kategori]/    # halaman pilih nominal (8 kategori, di-prerender)
├─ checkout/             # ringkasan + QRIS + timer
├─ status/               # status & struk transaksi
├─ cek-transaksi/        # pelacakan kode transaksi
├─ sitemap.ts, robots.ts, icon.svg, not-found.tsx
components/
├─ layout/               # Header (menu mobile), Footer, FloatingCS
├─ home/                 # Hero, ilustrasi SVG, CategoryGrid, WhyUs, Steps, Promos, Testimonials, FaqAccordion
├─ transaction/          # ProductPicker, ProviderChips, NominalGrid, CheckoutView, StatusView, CheckView
├─ ui/                   # Logo, Reveal (Framer Motion), FlowSteps, Breadcrumb, JsonLd
data/                    # catalog.ts, faqs.ts, promos.ts, testimonials.ts, site.ts
lib/                     # types, catalog helper, format rupiah/tanggal, history (localStorage), icons, seo
providers/               # TransactionProvider (state alur transaksi, persist di sessionStorage)
public/fonts/            # font lokal (Fredoka, Baloo 2)
legacy/index.html        # HTML asli sebelum konversi (referensi)
```

## Ubah konten

| Yang mau diubah | File |
| --- | --- |
| Harga, nominal, biaya admin, field form | `data/catalog.ts` |
| Nomor CS / WhatsApp, email, nama & tagline brand | admin → Konten Situs (`content.settings`, Supabase) |
| URL situs, QRIS placeholder | `data/site.ts` |
| FAQ, promo, testimoni | `data/faqs.ts`, `data/promos.ts`, `data/testimonials.ts` |
| Warna & tipografi | token di `app/globals.css` (`@theme`) |

## Yang masih perlu diisi manual

- **QRIS asli**: ganti `public/qris-placeholder.svg` dengan QRIS milik Anda, lalu update `site.qrisImage` di `data/site.ts` (disarankan PNG/JPG ≥ 500×500).
- **Nomor CS / WhatsApp & email**: ubah lewat admin → Konten Situs → Identitas & Kontak. Berlaku otomatis di footer, tombol CS melayang, link checkout/cek-transaksi, dan JSON-LD.
- **URL produksi**: set `NEXT_PUBLIC_SITE_URL` (dipakai untuk canonical, OG, sitemap, JSON-LD). Default `https://novellestudio.id`.
- **Backend**: alur transaksi masih simulasi di sisi klien (tanpa server). Riwayat disimpan di `localStorage`; ganti `lib/history.ts` (`findTransaction`) dengan panggilan API bila backend sudah tersedia. Pembayaran QRIS masih placeholder statis.
