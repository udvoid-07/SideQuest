export function SideQuestIcon({
  size = 32,
  className,
}: {
  size?: number
  className?: string
}) {
  return (
    <svg
      width={size}
      height={Math.round(size * 1.15)}
      viewBox="0 0 100 115"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      {/* Location pin outline */}
      <path
        d="M50 5 C27 5 9 23 9 45 C9 68 50 110 50 110 C50 110 91 68 91 45 C91 23 73 5 50 5 Z"
        fill="rgba(255,255,255,0.07)"
        stroke="rgba(255,255,255,0.88)"
        strokeWidth="3.5"
        strokeLinejoin="round"
      />
      {/* Inner hollow ring */}
      <circle
        cx="50"
        cy="42"
        r="13"
        fill="rgba(255,255,255,0.10)"
        stroke="rgba(255,255,255,0.38)"
        strokeWidth="2"
      />
      {/* Green terrain — back layer */}
      <polygon points="19,80 31,60 40,70 28,87" fill="#2E7D32" opacity="0.82" />
      {/* Green terrain — front layer */}
      <polygon points="23,74 37,51 47,64 33,80" fill="#43A047" />
      {/* Golden quest path (zigzag S) */}
      <polyline
        points="42,83 55,63 43,50 62,36 74,27"
        fill="none"
        stroke="#F5A623"
        strokeWidth="4.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* Flag pole */}
      <line x1="74" y1="27" x2="74" y2="15" stroke="#F5A623" strokeWidth="3.5" strokeLinecap="round" />
      {/* Flag pennant */}
      <polygon points="74,15 87,20 74,25" fill="#F5A623" />
      {/* Path start dot */}
      <circle cx="42" cy="83" r="4" fill="#F5A623" />
    </svg>
  )
}
