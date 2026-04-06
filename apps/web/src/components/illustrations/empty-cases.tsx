export function EmptyCasesIllustration({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 240 200"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
    >
      {/* Desk surface */}
      <ellipse cx="120" cy="170" rx="100" ry="12" fill="#F5F5F4" />

      {/* Back folder */}
      <rect x="70" y="62" width="80" height="100" rx="4" fill="#E7E5E4" />
      <rect x="70" y="62" width="80" height="12" rx="4" fill="#D6D3D1" />

      {/* Main document */}
      <rect x="82" y="50" width="76" height="104" rx="3" fill="white" stroke="#D6D3D1" strokeWidth="1.5" />

      {/* Document lines */}
      <rect x="94" y="68" width="40" height="3" rx="1.5" fill="#E7E5E4" />
      <rect x="94" y="78" width="52" height="3" rx="1.5" fill="#E7E5E4" />
      <rect x="94" y="88" width="36" height="3" rx="1.5" fill="#E7E5E4" />
      <rect x="94" y="98" width="48" height="3" rx="1.5" fill="#E7E5E4" />
      <rect x="94" y="108" width="28" height="3" rx="1.5" fill="#E7E5E4" />

      {/* Shield with checkmark */}
      <g transform="translate(104, 118)">
        <path
          d="M16 2L4 8V16C4 22.6 9.2 28.7 16 30C22.8 28.7 28 22.6 28 16V8L16 2Z"
          fill="#EEF2FF"
          stroke="#818CF8"
          strokeWidth="1.5"
        />
        <path
          d="M12 16L15 19L21 13"
          stroke="#818CF8"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </g>

      {/* Small decorative elements */}
      <circle cx="56" cy="90" r="3" fill="#F5F5F4" />
      <circle cx="184" cy="80" r="4" fill="#F5F5F4" />
      <circle cx="176" cy="100" r="2.5" fill="#F5F5F4" />
    </svg>
  )
}
