import type { SVGProps } from 'react';

const PATHS: Record<string, React.ReactNode> = {
  dashboard: (<><rect x="3" y="3" width="7.5" height="7.5" rx="2" /><rect x="13.5" y="3" width="7.5" height="7.5" rx="2" /><rect x="3" y="13.5" width="7.5" height="7.5" rx="2" /><rect x="13.5" y="13.5" width="7.5" height="7.5" rx="2" /></>),
  wallet: (<><path d="M20 7H4a2 2 0 0 1-2-2 2 2 0 0 1 2-2h13" /><path d="M2 5v14a2 2 0 0 0 2 2h15a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2H4" /><circle cx="16" cy="14" r="1.4" /></>),
  send: (<><path d="M22 2 11 13" /><path d="M22 2 15 22l-4-9-9-4z" /></>),
  receipt: (<><path d="M5 3h14a1 1 0 0 1 1 1v17l-3-2-2 2-2-2-2 2-2-2-3 2V4a1 1 0 0 1 1-1z" /><path d="M9 8h6M9 12h6M9 16h3" /></>),
  card: (<><rect x="2.5" y="5.5" width="19" height="13" rx="2.5" /><path d="M2.5 10h19" /><path d="M6.5 15h4" /></>),
  transactions: (<><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3.2 2" /></>),
  users: (<><circle cx="9" cy="8" r="3.4" /><path d="M2.8 20c.7-3.4 3.2-5 6.2-5s5.5 1.6 6.2 5" /><path d="M16 5.2a3.4 3.4 0 0 1 0 5.6" /><path d="M19 15.4c1.3.9 2 2.2 2.2 4.6" /></>),
  bell: (<><path d="M6 9a6 6 0 0 1 12 0c0 5 2 6 2 6H4s2-1 2-6" /><path d="M10.3 20a2 2 0 0 0 3.4 0" /></>),
  settings: (<><circle cx="12" cy="12" r="3" /><path d="M19.4 15a1.7 1.7 0 0 0 .34 1.87l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.7 1.7 0 0 0-1.87-.34 1.7 1.7 0 0 0-1.03 1.56V21a2 2 0 1 1-4 0v-.09a1.7 1.7 0 0 0-1.11-1.56 1.7 1.7 0 0 0-1.87.34l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.7 1.7 0 0 0 .34-1.87 1.7 1.7 0 0 0-1.56-1.03H3a2 2 0 1 1 0-4h.09a1.7 1.7 0 0 0 1.56-1.11 1.7 1.7 0 0 0-.34-1.87l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.7 1.7 0 0 0 1.87.34h.08A1.7 1.7 0 0 0 10 3.09V3a2 2 0 1 1 4 0v.09a1.7 1.7 0 0 0 1.03 1.56 1.7 1.7 0 0 0 1.87-.34l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.7 1.7 0 0 0-.34 1.87v.08a1.7 1.7 0 0 0 1.56 1.03H21a2 2 0 1 1 0 4h-.09a1.7 1.7 0 0 0-1.56 1.03z" /></>),
  logout: (<><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" /><path d="m16 17 5-5-5-5" /><path d="M21 12H9" /></>),
  eye: (<><path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7z" /><circle cx="12" cy="12" r="3" /></>),
  eyeOff: (<><path d="M3 3l18 18" /><path d="M10.6 5.1A9.8 9.8 0 0 1 12 5c6.5 0 10 7 10 7a17.9 17.9 0 0 1-2.9 3.9M6.6 6.6A17.9 17.9 0 0 0 2 12s3.5 7 10 7a9.7 9.7 0 0 0 5.4-1.6" /><path d="M9.9 9.9a3 3 0 0 0 4.2 4.2" /></>),
  copy: (<><rect x="9" y="9" width="12" height="12" rx="2" /><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" /></>),
  check: (<path d="M4.5 12.5 10 18 19.5 6.5" />),
  checkCircle: (<><circle cx="12" cy="12" r="9.5" /><path d="m8 12.5 2.7 2.7L16.5 9" /></>),
  chevronDown: (<path d="m6 9 6 6 6-6" />),
  chevronRight: (<path d="m9 6 6 6-6 6" />),
  chevronLeft: (<path d="m15 6-6 6 6 6" />),
  plus: (<path d="M12 5v14M5 12h14" />),
  minus: (<path d="M5 12h14" />),
  search: (<><circle cx="11" cy="11" r="7" /><path d="m21 21-4.35-4.35" /></>),
  x: (<path d="M18 6 6 18M6 6l12 12" />),
  alert: (<><path d="M12 3 2.5 20h19L12 3z" /><path d="M12 9.5v4.5" /><circle cx="12" cy="17" r="0.6" /></>),
  shield: (<><path d="M12 2.5 4.5 5.5v6c0 4.6 3.2 8.1 7.5 9.5 4.3-1.4 7.5-4.9 7.5-9.5v-6L12 2.5z" /><path d="m9 11.5 2.2 2.2L15.5 9" /></>),
  lock: (<><rect x="4.5" y="10.5" width="15" height="10" rx="2" /><path d="M8 10.5V7a4 4 0 0 1 8 0v3.5" /><circle cx="12" cy="15.5" r="1.2" /></>),
  arrowUpRight: (<path d="M7 17 17 7M8 7h9v9" />),
  arrowDownLeft: (<path d="M17 7 7 17M16 17H7V8" />),
  download: (<><path d="M12 3v11" /><path d="m7 10 5 5 5-5" /><path d="M4 20h16" /></>),
  menu: (<path d="M4 7h16M4 12h16M4 17h16" />),
  home: (<><path d="m3 10.5 9-7.5 9 7.5" /><path d="M5 9v11h14V9" /></>),
  dots: (<><circle cx="5" cy="12" r="1.3" /><circle cx="12" cy="12" r="1.3" /><circle cx="19" cy="12" r="1.3" /></>),
  calendar: (<><rect x="3.5" y="5" width="17" height="15.5" rx="2.5" /><path d="M3.5 10h17M8 2.8V7M16 2.8V7" /></>),
  zap: (<path d="M13 2.5 4.5 13.5H11l-1 8 8.5-11H12l1-8z" />),
  wifi: (<><path d="M2.5 8.5a15 15 0 0 1 19 0" /><path d="M5.5 12a10.5 10.5 0 0 1 13 0" /><path d="M8.5 15.5a6 6 0 0 1 7 0" /><circle cx="12" cy="19" r="1.1" /></>),
  tv: (<><rect x="2.5" y="7" width="19" height="12" rx="2" /><path d="M8.5 2.8 12 7l3.5-4.2" /></>),
  droplet: (<path d="M12 3s6.5 6.8 6.5 11a6.5 6.5 0 0 1-13 0C5.5 9.8 12 3 12 3z" />),
  briefcase: (<><rect x="3" y="7.5" width="18" height="13" rx="2" /><path d="M8.5 7.5V5.5a2 2 0 0 1 2-2h3a2 2 0 0 1 2 2v2M3 12.5h18" /></>),
  phone: (<><rect x="7" y="2.5" width="10" height="19" rx="2.5" /><path d="M11 18.5h2" /></>),
  bank: (<><path d="M3 10.5 12 4l9 6.5" /><path d="M5 10v8M9.5 10v8M14.5 10v8M19 10v8" /><path d="M3 20.5h18" /></>),
  snowflake: (<><path d="M12 2.5v19" /><path d="m5 7 7 4.5L19 7M5 17l7-4.5 7 4.5" /><path d="m8.5 4.5 3.5 2.5 3.5-2.5M8.5 19.5l3.5-2.5 3.5 2.5" /></>),
  unlock: (<><rect x="4.5" y="10.5" width="15" height="10" rx="2" /><path d="M8 10.5V7a4 4 0 0 1 7.8-1.3" /><circle cx="12" cy="15.5" r="1.2" /></>),
  refresh: (<><path d="M20 11.5A8 8 0 0 0 6 7.2L4 9" /><path d="M4 4v5h5" /><path d="M4 12.5a8 8 0 0 0 14 4.3l2-1.8" /><path d="M20 20v-5h-5" /></>),
  pin: (<><path d="M12 17v4M8 21h8" /><path d="m9 9-5.5 5.5V16h17v-1.5L15 9" /><path d="M9 9V5.5a3 3 0 0 1 6 0V9" /></>),
  info: (<><circle cx="12" cy="12" r="9.5" /><path d="M12 11v5" /><circle cx="12" cy="8" r="0.7" /></>),
  gift: (<><rect x="3.5" y="8" width="17" height="4" rx="1" /><path d="M5 12v8.5h14V12M12 8v12.5" /><path d="M12 8s-4.5-4.8-7-1.2c-1.6 2.2.7 3.7 2.5 2.2 1-.8 2-1 4.5-1zM12 8s4.5-4.8 7-1.2c1.6 2.2-.7 3.7-2.5 2.2-1-.8-2-1-4.5-1z" /></>),
  plane: (<><path d="M3.5 11 12 8l8.5-3-2.5 7.5-6-1.5V17l-2 2-1-5.5-5.5-2.5z" /></>),
  trending: (<><path d="M3 17.5 9.5 11l4 4L21 7.5" /><path d="M15.5 7.5H21V13" /></>),
  percentage: (<><path d="M19 5 5 19" /><circle cx="7" cy="7" r="2.4" /><circle cx="17" cy="17" r="2.4" /></>),
  globe: (<><circle cx="12" cy="12" r="9.5" /><path d="M2.5 12h19" /><path d="M12 2.5c2.8 2.6 4.2 5.9 4.2 9.5s-1.4 6.9-4.2 9.5c-2.8-2.6-4.2-5.9-4.2-9.5S9.2 5.1 12 2.5z" /></>),
  fingerprint: (<><path d="M12 11a2.5 2.5 0 0 1 2.5 2.5c0 2.6-.4 5.1-1.2 7.5M7.5 13.5a4.5 4.5 0 0 1 9 0c0 2.6-.3 5-.9 7M5 13.5c0 3.1.3 5.9.9 8.5" /><path d="M12 6.5a7 7 0 0 1 7 7M5 20.5V13.5c0-1.4.4-2.7 1-3.8M8.5 6.2A7 7 0 0 1 17.8 9" /></>),
  device: (<><rect x="5" y="2.5" width="14" height="19" rx="2.5" /><path d="M10.5 18h3" /></>),
  shieldOff: (<><path d="M12 2.5 4.5 5.5v6c0 4.6 3.2 8.1 7.5 9.5 1.6-.5 3-1.4 4.2-2.5" /><path d="M4.5 2.5l15 19" /></>),
  moon: (<path d="M20.5 14.5A8.5 8.5 0 0 1 9.5 3.5a8.5 8.5 0 1 0 11 11z" />),
  sun: (<><circle cx="12" cy="12" r="4.2" /><path d="M12 2.5v2.5M12 19v2.5M2.5 12H5M19 12h2.5M4.9 4.9 6.7 6.7M17.3 17.3l1.8 1.8M4.9 19.1l1.8-1.8M17.3 6.7l1.8-1.8" /></>),
  trash: (<><path d="M4 6.5h16" /><path d="M9 6.5V5a1.5 1.5 0 0 1 1.5-1.5h3A1.5 1.5 0 0 1 15 5v1.5" /><path d="M6.5 6.5 7.5 21h9l1-14.5" /></>),
  edit: (<><path d="M4 20h4l11-11-4-4L4 16v4z" /><path d="m13.5 6.5 4 4" /></>),
  arrowRight: (<path d="M4 12h16M13 5l7 7-7 7" />),
  arrowLeft: (<path d="M20 12H4M11 5l-7 7 7 7" />),
  clock: (<><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3.2 2" /></>),
  pause: (<><rect x="6" y="4.5" width="4" height="15" rx="1.5" /><rect x="14" y="4.5" width="4" height="15" rx="1.5" /></>),
  play: (<path d="M7 4.5v15l13-7.5z" />),
};

export interface IconProps extends Omit<SVGProps<SVGSVGElement>, 'name'> {
  name: keyof typeof PATHS | string;
  size?: number;
}

export default function Icon({ name, size = 20, ...rest }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.8}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
      {...rest}
    >
      {PATHS[name] ?? PATHS.info}
    </svg>
  );
}
