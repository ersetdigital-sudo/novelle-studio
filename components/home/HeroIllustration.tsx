/** Ilustrasi flat vector hero (murni SVG, tanpa foto) — ringan & tetap tajam di semua layar. */
export function HeroIllustration({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 520 440"
      role="img"
      aria-label="Ilustrasi transaksi digital: ponsel, kartu, kode QR, dan koin"
      className={className}
    >
      <circle cx="270" cy="215" r="180" fill="#D8F5F0" />
      <path
        d="M95 330c40-26 60 22 104 2s52-70 106-58 60 78 112 60"
        stroke="#0FB9A8"
        strokeWidth="3"
        strokeDasharray="9 11"
        fill="none"
        opacity=".55"
      />
      <rect x="58" y="70" width="46" height="46" rx="14" fill="#FF7A2F" transform="rotate(-16 81 93)" />
      <circle cx="452" cy="106" r="20" fill="#FFC93C" />
      <circle cx="70" cy="258" r="12" fill="#0FB9A8" />

      {/* kartu belakang */}
      <g transform="rotate(-10 330 150)">
        <rect x="282" y="96" width="200" height="124" rx="20" fill="#12332F" />
        <rect x="282" y="126" width="200" height="20" fill="#0A8E80" />
        <rect x="300" y="166" width="74" height="10" rx="5" fill="#5C7B77" />
        <rect x="300" y="186" width="42" height="8" rx="4" fill="#3E5F5A" />
        <circle cx="444" cy="188" r="16" fill="#FF7A2F" />
        <circle cx="424" cy="188" r="16" fill="#FFC93C" opacity=".85" />
      </g>

      {/* ponsel */}
      <rect x="148" y="58" width="196" height="330" rx="34" fill="#12332F" />
      <rect x="158" y="68" width="176" height="310" rx="27" fill="#FFF6EC" />
      <rect x="212" y="78" width="68" height="11" rx="5.5" fill="#12332F" />
      <rect x="158" y="96" width="176" height="66" fill="#0FB9A8" />
      <circle cx="182" cy="122" r="11" fill="#FFF6EC" />
      <rect x="200" y="114" width="64" height="8" rx="4" fill="#FFFFFF" opacity=".95" />
      <rect x="200" y="128" width="40" height="7" rx="3.5" fill="#FFFFFF" opacity=".6" />
      <rect x="172" y="146" width="148" height="34" rx="12" fill="#FFFFFF" />
      <rect x="184" y="158" width="58" height="9" rx="4.5" fill="#0A8E80" />
      <rect x="276" y="155" width="32" height="15" rx="7.5" fill="#FF7A2F" />

      {/* grid ikon di layar */}
      <g>
        <rect x="174" y="196" width="42" height="42" rx="13" fill="#D8F5F0" />
        <rect x="188" y="208" width="14" height="18" rx="3" fill="#0FB9A8" />
        <rect x="224" y="196" width="42" height="42" rx="13" fill="#FFE7D6" />
        <path d="M247 206l-10 14h8l-3 12 11-15h-8z" fill="#FF7A2F" />
        <rect x="274" y="196" width="42" height="42" rx="13" fill="#FFF3CC" />
        <circle cx="295" cy="217" r="10" fill="none" stroke="#E8A80C" strokeWidth="4" />
        <rect x="174" y="246" width="42" height="42" rx="13" fill="#E4E7FB" />
        <rect x="185" y="259" width="20" height="16" rx="4" fill="#5C6BC0" />
        <rect x="224" y="246" width="42" height="42" rx="13" fill="#D8F5F0" />
        <path d="M235 267h20M245 257v20" stroke="#0FB9A8" strokeWidth="4" strokeLinecap="round" />
        <rect x="274" y="246" width="42" height="42" rx="13" fill="#FFE7D6" />
        <rect x="285" y="258" width="20" height="18" rx="4" fill="none" stroke="#FF7A2F" strokeWidth="4" />
      </g>
      <rect x="174" y="304" width="142" height="40" rx="14" fill="#FF7A2F" />
      <rect x="206" y="319" width="78" height="10" rx="5" fill="#fff" opacity=".95" />

      {/* QR mengambang */}
      <g transform="rotate(9 96 196)">
        <rect x="48" y="152" width="96" height="96" rx="20" fill="#fff" stroke="#12332F" strokeWidth="4" />
        <rect x="64" y="168" width="24" height="24" rx="6" fill="#12332F" />
        <rect x="104" y="168" width="24" height="24" rx="6" fill="#0FB9A8" />
        <rect x="64" y="208" width="24" height="24" rx="6" fill="#FF7A2F" />
        <rect x="106" y="210" width="9" height="9" fill="#12332F" />
        <rect x="120" y="210" width="9" height="9" fill="#12332F" />
        <rect x="106" y="224" width="9" height="9" fill="#12332F" />
      </g>

      {/* koin */}
      <circle cx="400" cy="300" r="34" fill="#FFC93C" />
      <circle cx="400" cy="300" r="24" fill="#F0AE12" />
      <path
        d="M400 288v24M394 294h9a5 5 0 010 10h-9"
        stroke="#fff"
        strokeWidth="3.4"
        strokeLinecap="round"
        fill="none"
      />
      <circle cx="356" cy="352" r="20" fill="#FFC93C" />
      <circle cx="356" cy="352" r="13" fill="#F0AE12" />
      <path d="M118 108c10-16 30-16 38-4" stroke="#FF7A2F" strokeWidth="4" strokeLinecap="round" fill="none" />
    </svg>
  );
}
