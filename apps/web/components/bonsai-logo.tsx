type BonsaiLogoProps = {
  className?: string;
};

export function BonsaiLogo({ className }: BonsaiLogoProps) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="15 18 96 96"
      fill="none"
      role="img"
      aria-label="Bonsai Bot"
      className={className}
    >
      <g
        stroke="#C08552"
        strokeWidth={7}
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M64 90 C64 80 53 76 57 66 S70 54 62 42" />
        <path d="M57 66 Q47 64 39 60" strokeWidth={5} />
        <path d="M62 48 Q74 54 86 53" strokeWidth={5} />
      </g>

      <ellipse cx="38" cy="58" rx="17" ry="9.5" fill="#22C55E" />
      <ellipse cx="88" cy="53" rx="19" ry="10.5" fill="#22C55E" />
      <ellipse cx="61" cy="37" rx="28" ry="14" fill="#4ADE80" />

      <rect x="34" y="87" width="60" height="7" rx="3.5" fill="#E2E8F0" />
      <path
        d="M39 94 H89 L83 108 Q82 110 80 110 H48 Q46 110 45 108 Z"
        fill="#CBD5E1"
      />

      <g>
        <circle cx="56" cy="101" r="3" fill="#0F1F17" />
        <circle cx="72" cy="101" r="3" fill="#0F1F17" />
      </g>
    </svg>
  );
}
