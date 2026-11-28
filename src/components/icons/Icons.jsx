function StrokeIcon({ className, children, viewBox = '0 0 20 20' }) {
  return (
    <svg
      viewBox={viewBox}
      fill="none"
      stroke="currentColor"
      strokeWidth="1.85"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className={className}
    >
      {children}
    </svg>
  );
}

export function CloseIcon({ className = 'w-5 h-5' }) {
  return (
    <StrokeIcon className={className}>
      <path d="M5 5l10 10M15 5L5 15" />
    </StrokeIcon>
  );
}

export function SearchIcon({ className = 'w-4 h-4' }) {
  return (
    <StrokeIcon className={className}>
      <circle cx="9" cy="9" r="6" />
      <path d="M13.5 13.5L17.5 17.5" />
    </StrokeIcon>
  );
}

export function UploadIcon({ className = 'w-5 h-5' }) {
  return (
    <StrokeIcon className={className}>
      <path d="M10 13V4" />
      <path d="M6.5 7.5L10 4l3.5 3.5" />
      <path d="M3.5 14v1.5a1 1 0 0 0 1 1h11a1 1 0 0 0 1-1V14" />
    </StrokeIcon>
  );
}

export function CheckIcon({ className = 'w-4 h-4' }) {
  return (
    <StrokeIcon viewBox="0 0 16 16" className={className}>
      <path d="M3.2 8.5l3 3 6.6-7" />
    </StrokeIcon>
  );
}

export function ChevronUpIcon({ className = 'w-4 h-4' }) {
  return (
    <StrokeIcon viewBox="0 0 16 16" className={className}>
      <path d="M4 10l4-4 4 4" />
    </StrokeIcon>
  );
}

export function ChevronDownIcon({ className = 'w-4 h-4' }) {
  return (
    <StrokeIcon viewBox="0 0 16 16" className={className}>
      <path d="M4 6l4 4 4-4" />
    </StrokeIcon>
  );
}

/**
 * Directional Forward arrow mirrored for RTL (points left toward reading continuation).
 */
export function ForwardArrowRtlIcon({ className = 'w-4 h-4' }) {
  return (
    <StrokeIcon viewBox="0 0 16 16" className={className}>
      <path d="M13 8H3" />
      <path d="M7 4L3 8l4 4" />
    </StrokeIcon>
  );
}

export function PhoneHardwareIcon({ className = 'w-4 h-4' }) {
  return (
    <StrokeIcon className={className}>
      <rect x="5" y="2.25" width="10" height="15.5" rx="2.4" />
      <circle cx="8" cy="5.5" r="0.7" fill="currentColor" stroke="none" />
      <path d="M9 14.75h2" />
    </StrokeIcon>
  );
}

export function CashCodIcon({ className = 'w-4 h-4' }) {
  return (
    <StrokeIcon className={className}>
      <rect x="2.25" y="5" width="15.5" height="10" rx="2" />
      <circle cx="10" cy="10" r="2.2" />
      <path d="M5.25 8v4M14.75 8v4" />
    </StrokeIcon>
  );
}

export function ClockIcon({ className = 'w-4 h-4' }) {
  return (
    <StrokeIcon className={className}>
      <circle cx="10" cy="10" r="7" />
      <path d="M10 6v4.2l2.8 1.8" />
    </StrokeIcon>
  );
}

export function AlertCircleIcon({ className = 'w-4 h-4' }) {
  return (
    <StrokeIcon className={className}>
      <circle cx="10" cy="10" r="7.2" />
      <path d="M10 6.3v4.3" />
      <circle cx="10" cy="13.7" r="0.65" fill="currentColor" stroke="none" />
    </StrokeIcon>
  );
}

export function PrinterIcon({ className = 'w-4 h-4' }) {
  return (
    <StrokeIcon className={className}>
      <path d="M5.5 7V3.5h9V7" />
      <rect x="3" y="7" width="14" height="6.5" rx="1.5" />
      <path d="M6 12v4.5h8V12" />
    </StrokeIcon>
  );
}

export function TruckIcon({ className = 'w-4 h-4' }) {
  return (
    <StrokeIcon className={className}>
      <path d="M12.5 5H3v8h9.5V5z" />
      <path d="M12.5 7.5h3.2L17.5 10v3h-5" />
      <circle cx="6.2" cy="14.5" r="1.5" />
      <circle cx="14.5" cy="14.5" r="1.5" />
    </StrokeIcon>
  );
}

export function LayersIcon({ className = 'w-4 h-4' }) {
  return (
    <StrokeIcon className={className}>
      <path d="M10 3L3 6.8 10 10.6 17 6.8 10 3z" />
      <path d="M3 10.4L10 14.2 17 10.4" />
      <path d="M3 13.8L10 17.6 17 13.8" />
    </StrokeIcon>
  );
}

export function SparkPenIcon({ className = 'w-4 h-4' }) {
  return (
    <StrokeIcon className={className}>
      <path d="M13.5 3.5l3 3L7 16H4v-3l9.5-9.5z" />
      <path d="M11.5 5.5l3 3" />
    </StrokeIcon>
  );
}

export function PhoneCallIcon({ className = 'w-4 h-4' }) {
  return (
    <StrokeIcon className={className}>
      <path d="M4.5 3.5h3l1.3 3.2-1.7 1.3a11 11 0 0 0 4.9 4.9l1.3-1.7 3.2 1.3v3a1.5 1.5 0 0 1-1.6 1.5A12.5 12.5 0 0 1 3 5.1 1.5 1.5 0 0 1 4.5 3.5z" />
    </StrokeIcon>
  );
}

export function WhatsappIcon({ className = 'w-4 h-4' }) {
  return (
    <StrokeIcon className={className}>
      <path d="M10 3a7 7 0 0 0-6.1 10.4L3 17l3.7-.9A7 7 0 1 0 10 3z" />
      <path d="M7.6 7.5c.3 1.7 1.8 3.3 3.6 3.7l1-.7 1.3.7v1c-2.5.4-5.5-2.6-5.1-5.1h1z" />
    </StrokeIcon>
  );
}
