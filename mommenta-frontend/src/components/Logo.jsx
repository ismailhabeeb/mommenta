export default function LogoAnimated({ size = 260, strokeWidth = 40 }) {
  return (
    <div className="flex items-center justify-center p-6">
      <svg
        width={size}
        height={size}
        viewBox="0 0 500 500"
        fill="none"
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        className="overflow-visible"
      >
        {/* OUTER CIRCLES */}
        <circle
          cx="150"
          cy="180"
          r="120"
          stroke="#7C3AED"
          className="animate-draw"
        />
        <circle
          cx="350"
          cy="330"
          r="120"
          stroke="#7C3AED"
          className="animate-draw"
        />

        {/* PROFILE 1 (HEAD + SHOULDERS) */}
        <circle cx="150" cy="160" r="45" fill="#EC4899" />

        {/* shoulders adjusted upward slightly to TOUCH the circle */}
        <path
          d="M110 245 Q150 205 190 245"
          fill="#EC4899"
        />

        {/* PROFILE 2 (HEAD + SHOULDERS) */}
        <circle cx="350" cy="310" r="45" fill="#EC4899" />

        {/* shoulders adjusted upward to match circle edge */}
        <path
          d="M310 395 Q350 355 390 395"
          fill="#EC4899"
        />

        {/* OUTER FLOATING DOTS */}
        <circle
          cx="380"
          cy="120"
          r="40"
          fill="#EC4899"
          stroke="#EC4899"
          className="animate-draw"
        />
        
        <circle
          cx="140"
          cy="380"
          r="40"
          fill="#EC4899"
          stroke="#EC4899"
            className="animate-draw"
        />
      </svg>
    </div>
  );
}
