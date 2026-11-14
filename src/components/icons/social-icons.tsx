type IconProps = React.SVGProps<SVGSVGElement>;

export function FacebookIcon(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden {...props}>
      <path d="M13.5 21v-7.5h2.5l.4-3h-2.9V8.6c0-.87.25-1.46 1.5-1.46H16.6V4.46A21 21 0 0 0 14.3 4.3c-2.28 0-3.84 1.39-3.84 3.95v2.25H8v3h2.46V21h3.04Z" />
    </svg>
  );
}

export function TiktokIcon(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden {...props}>
      <path d="M16.6 5.82A4.28 4.28 0 0 1 15.54 3h-3.09v12.4a2.59 2.59 0 0 1-2.59 2.5 2.6 2.6 0 0 1-2.6-2.6 2.6 2.6 0 0 1 3.37-2.48V9.66a5.7 5.7 0 0 0-.77-.05A5.73 5.73 0 0 0 4.13 15.3 5.73 5.73 0 0 0 9.86 21a5.73 5.73 0 0 0 5.73-5.7V9.01a7.35 7.35 0 0 0 4.3 1.38V7.3a4.3 4.3 0 0 1-3.29-1.48Z" />
    </svg>
  );
}

export function ZaloIcon(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden {...props}>
      <path
        d="M12 3.5c-5 0-9 3.4-9 7.7 0 2.4 1.3 4.6 3.4 6l-.6 2.9 3.1-1.6c1 .3 2 .4 3.1.4 5 0 9-3.4 9-7.7S17 3.5 12 3.5Z"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
      <text x="12" y="13.4" textAnchor="middle" fontSize="5.4" fontWeight="700" fontFamily="Arial, sans-serif" fill="currentColor">
        Zalo
      </text>
    </svg>
  );
}
