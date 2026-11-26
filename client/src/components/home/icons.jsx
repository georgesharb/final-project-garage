// Small line icons (SVG) for the Contact section. They take the text color (currentColor).
function Icon({ children }) {
  return (
    <svg className="icon" viewBox="0 0 24 24" width="22" height="22" fill="none"
      stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      {children}
    </svg>
  );
}

export const PinIcon = () => (
  <Icon><path d="M12 21s-7-6.2-7-11.5a7 7 0 0 1 14 0C19 14.8 12 21 12 21z" /><circle cx="12" cy="9.5" r="2.5" /></Icon>
);

export const ClockIcon = () => (
  <Icon><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 2" /></Icon>
);
