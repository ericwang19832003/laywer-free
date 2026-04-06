const shared = 'w-full h-auto'

export function CreateCaseIllustration({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 200 160" fill="none" xmlns="http://www.w3.org/2000/svg" className={`${shared} ${className ?? ''}`} aria-hidden="true">
      {/* Background blob */}
      <ellipse cx="100" cy="85" rx="75" ry="60" fill="#E0E7FF" opacity="0.4" />
      {/* Clipboard body */}
      <rect x="58" y="30" width="70" height="95" rx="6" fill="white" stroke="#A5B4FC" strokeWidth="2" />
      {/* Clipboard clip */}
      <rect x="80" y="22" width="26" height="16" rx="4" fill="#818CF8" />
      <rect x="86" y="26" width="14" height="8" rx="2" fill="white" />
      {/* Checklist lines */}
      <rect x="72" y="52" width="10" height="10" rx="2" fill="#C7D2FE" />
      <path d="M74 57.5L76.5 60L80 54.5" stroke="#818CF8" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      <rect x="88" y="54" width="30" height="4" rx="2" fill="#E0E7FF" />
      <rect x="72" y="70" width="10" height="10" rx="2" fill="#C7D2FE" />
      <path d="M74 75.5L76.5 78L80 72.5" stroke="#818CF8" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      <rect x="88" y="72" width="24" height="4" rx="2" fill="#E0E7FF" />
      <rect x="72" y="88" width="10" height="10" rx="2" fill="#E0E7FF" />
      <rect x="88" y="90" width="28" height="4" rx="2" fill="#E0E7FF" />
      {/* Decorative sparkles */}
      <circle cx="142" cy="42" r="3" fill="#C7D2FE" />
      <circle cx="148" cy="56" r="2" fill="#E0E7FF" />
      <path d="M46 65L48 60L50 65L48 70Z" fill="#C7D2FE" />
    </svg>
  )
}

export function EvidenceVaultIllustration({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 200 160" fill="none" xmlns="http://www.w3.org/2000/svg" className={`${shared} ${className ?? ''}`} aria-hidden="true">
      {/* Background blob */}
      <ellipse cx="100" cy="85" rx="75" ry="60" fill="#FEF3C7" opacity="0.4" />
      {/* Folder back */}
      <path d="M40 55C40 51.686 42.686 49 46 49H80L88 57H150C153.314 57 156 59.686 156 63V120C156 123.314 153.314 126 150 126H46C42.686 126 40 123.314 40 120V55Z" fill="#FDE68A" />
      {/* Folder front */}
      <path d="M40 70H156V120C156 123.314 153.314 126 150 126H46C42.686 126 40 123.314 40 120V70Z" fill="#FCD34D" />
      {/* Documents peeking out */}
      <rect x="60" y="42" width="40" height="50" rx="3" fill="white" stroke="#D6D3D1" strokeWidth="1" />
      <rect x="68" y="52" width="24" height="3" rx="1.5" fill="#E7E5E4" />
      <rect x="68" y="60" width="18" height="3" rx="1.5" fill="#E7E5E4" />
      {/* Magnifying glass */}
      <circle cx="135" cy="48" r="16" stroke="#818CF8" strokeWidth="2.5" fill="white" fillOpacity="0.8" />
      <line x1="146" y1="60" x2="158" y2="72" stroke="#818CF8" strokeWidth="2.5" strokeLinecap="round" />
      <circle cx="135" cy="48" r="6" fill="#E0E7FF" />
      {/* Sparkles */}
      <circle cx="168" cy="40" r="2.5" fill="#C7D2FE" />
      <circle cx="30" cy="80" r="3" fill="#FDE68A" />
    </svg>
  )
}

export function UploadDocumentIllustration({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 200 160" fill="none" xmlns="http://www.w3.org/2000/svg" className={`${shared} ${className ?? ''}`} aria-hidden="true">
      {/* Background blob */}
      <ellipse cx="100" cy="85" rx="75" ry="60" fill="#EDE9FE" opacity="0.4" />
      {/* Document */}
      <rect x="55" y="28" width="68" height="100" rx="5" fill="white" stroke="#C4B5FD" strokeWidth="2" />
      {/* Document fold */}
      <path d="M103 28V48H123" fill="#F5F3FF" />
      <path d="M103 28L123 48" stroke="#C4B5FD" strokeWidth="2" />
      <path d="M103 28V44C103 46.2 104.8 48 107 48H123" stroke="#C4B5FD" strokeWidth="2" />
      {/* Lines on doc */}
      <rect x="68" y="60" width="36" height="3" rx="1.5" fill="#E0E7FF" />
      <rect x="68" y="70" width="44" height="3" rx="1.5" fill="#E0E7FF" />
      <rect x="68" y="80" width="28" height="3" rx="1.5" fill="#E0E7FF" />
      <rect x="68" y="90" width="40" height="3" rx="1.5" fill="#E0E7FF" />
      {/* Upload arrow */}
      <circle cx="138" cy="100" r="22" fill="#818CF8" />
      <path d="M138 112V90" stroke="white" strokeWidth="2.5" strokeLinecap="round" />
      <path d="M130 97L138 89L146 97" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
      {/* Sparkles */}
      <circle cx="44" cy="50" r="3" fill="#C4B5FD" />
      <circle cx="160" cy="60" r="2" fill="#E0E7FF" />
      <path d="M170 76L172 71L174 76L172 81Z" fill="#C4B5FD" />
    </svg>
  )
}

export function ReviewDeadlinesIllustration({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 200 160" fill="none" xmlns="http://www.w3.org/2000/svg" className={`${shared} ${className ?? ''}`} aria-hidden="true">
      {/* Background blob */}
      <ellipse cx="100" cy="85" rx="75" ry="60" fill="#FFEDD5" opacity="0.4" />
      {/* Calendar body */}
      <rect x="42" y="40" width="100" height="90" rx="6" fill="white" stroke="#FDBA74" strokeWidth="2" />
      {/* Calendar header */}
      <rect x="42" y="40" width="100" height="24" rx="6" fill="#FB923C" />
      <rect x="42" y="52" width="100" height="12" fill="#FB923C" />
      {/* Calendar rings */}
      <rect x="65" y="34" width="4" height="14" rx="2" fill="#9A3412" />
      <rect x="115" y="34" width="4" height="14" rx="2" fill="#9A3412" />
      {/* Calendar grid */}
      <rect x="52" y="72" width="12" height="10" rx="2" fill="#FFF7ED" />
      <rect x="70" y="72" width="12" height="10" rx="2" fill="#FFF7ED" />
      <rect x="88" y="72" width="12" height="10" rx="2" fill="#FFF7ED" />
      <rect x="106" y="72" width="12" height="10" rx="2" fill="#FFF7ED" />
      <rect x="124" y="72" width="12" height="10" rx="2" fill="#FFF7ED" />
      <rect x="52" y="88" width="12" height="10" rx="2" fill="#FFF7ED" />
      <rect x="70" y="88" width="12" height="10" rx="2" fill="#FED7AA" />
      <rect x="88" y="88" width="12" height="10" rx="2" fill="#FFF7ED" />
      <rect x="106" y="88" width="12" height="10" rx="2" fill="#FFF7ED" />
      <rect x="124" y="88" width="12" height="10" rx="2" fill="#FFF7ED" />
      <rect x="52" y="104" width="12" height="10" rx="2" fill="#FFF7ED" />
      <rect x="70" y="104" width="12" height="10" rx="2" fill="#FFF7ED" />
      <rect x="88" y="104" width="12" height="10" rx="2" fill="#FFF7ED" />
      {/* Checkmark badge */}
      <circle cx="148" cy="112" r="18" fill="#34D399" />
      <path d="M140 112L146 118L158 106" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
      {/* Sparkles */}
      <circle cx="168" cy="46" r="3" fill="#FDBA74" />
      <circle cx="30" cy="72" r="2.5" fill="#FDE68A" />
    </svg>
  )
}

export function SetupProfileIllustration({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 200 160" fill="none" xmlns="http://www.w3.org/2000/svg" className={`${shared} ${className ?? ''}`} aria-hidden="true">
      {/* Background blob */}
      <ellipse cx="100" cy="85" rx="75" ry="60" fill="#DCFCE7" opacity="0.4" />
      {/* Monitor */}
      <rect x="42" y="32" width="100" height="72" rx="6" fill="white" stroke="#86EFAC" strokeWidth="2" />
      {/* Screen content */}
      <rect x="50" y="40" width="84" height="54" rx="2" fill="#F0FDF4" />
      {/* Avatar placeholder on screen */}
      <circle cx="72" cy="58" r="10" fill="#BBF7D0" />
      <circle cx="72" cy="55" r="4" fill="#86EFAC" />
      <path d="M63 65C63 61 67 58 72 58C77 58 81 61 81 65" stroke="#86EFAC" strokeWidth="1.5" />
      {/* Form lines on screen */}
      <rect x="90" y="52" width="36" height="3" rx="1.5" fill="#BBF7D0" />
      <rect x="90" y="60" width="28" height="3" rx="1.5" fill="#BBF7D0" />
      <rect x="90" y="68" width="32" height="3" rx="1.5" fill="#BBF7D0" />
      {/* Button on screen */}
      <rect x="90" y="78" width="20" height="8" rx="3" fill="#22C55E" />
      {/* Monitor stand */}
      <rect x="84" y="104" width="16" height="6" rx="1" fill="#D1D5DB" />
      <rect x="76" y="108" width="32" height="4" rx="2" fill="#D1D5DB" />
      {/* Decorative person silhouette */}
      <circle cx="160" cy="68" r="10" fill="#BBF7D0" />
      <circle cx="160" cy="65" r="4.5" fill="#86EFAC" />
      <path d="M150 78C150 73 154.5 69 160 69C165.5 69 170 73 170 78" fill="#BBF7D0" />
      {/* Sparkles */}
      <circle cx="36" cy="56" r="2.5" fill="#BBF7D0" />
      <path d="M156 42L158 37L160 42L158 47Z" fill="#86EFAC" />
    </svg>
  )
}
