export function DataTurfWordmark({ className }: { className?: string }) {
  return (
    <svg
      aria-hidden="true"
      focusable="false"
      className={className}
      viewBox="0 0 230 38"
      width="230"
      height="38"
      fill="currentColor"
    >
      <path
        fill="var(--brand-accent, #b8f76d)"
        d="M7 0h32v25L26 38H0V7L7 0Z"
      />
      <path
        fill="var(--brand-cutout, #141a16)"
        fillRule="evenodd"
        d="M6 10h9l5 5v8l-5 5H6V10Zm4 4v10h3l3-3v-4l-3-3h-3ZM21 10h13v4h-5v14h-4V14h-4v-4Z"
      />
      <g transform="translate(48 6)">
        <path fillRule="evenodd" d="M0 0h14l7 7v12l-7 7H0V0Zm6 5v16h6l3-3V8l-3-3H6Z" />
        <path fillRule="evenodd" d="M30 0h8l7 26h-6l-2-7h-7l-2 7h-6L30 0Zm1 14h5l-2.5-9-2.5 9Z" />
        <path d="M45 0h20v5h-7v21h-6V5h-7V0Z" />
        <path fillRule="evenodd" d="M73 0h8l7 26h-6l-2-7h-7l-2 7h-6L73 0Zm1 14h5l-2.5-9-2.5 9Z" />
        <g fill="var(--brand-accent, #b8f76d)">
          <path d="M91 0h20v5h-7v21h-6V5h-7V0ZM114 0h6v18l3 3h4l3-3V0h6v20l-6 6h-10l-6-6V0Z" />
          <path fillRule="evenodd" d="M140 0h14l6 6v8l-5 4 6 8h-7l-6-8h-2v8h-6V0Zm6 5v8h6l2-2V7l-2-2h-6Z" />
          <path d="M164 0h18v5h-12v6h10v5h-10v10h-6V0Z" />
        </g>
      </g>
    </svg>
  );
}
