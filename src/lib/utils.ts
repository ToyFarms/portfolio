import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export type Options = {
  locale?: string | string[];
  now?: Date;
  showTimeForYesterday?: boolean;
  maxDaysForRelative?: number;
  timeFormat?: Intl.DateTimeFormatOptions;
  dateFormatSameYear?: Intl.DateTimeFormatOptions;
  dateFormatWithYear?: Intl.DateTimeFormatOptions;
};

export function formatVariablePrecisionDate(
  input: Date | number,
  opts: Partial<Options> = {},
): string {
  const date =
    typeof input === "number" ? new Date(input) : input;
  const now = opts.now ?? new Date();
  const locale = opts.locale;

  const msPerDay = 24 * 60 * 60 * 1000;
  const startOfDay = (d: Date) =>
    new Date(d.getFullYear(), d.getMonth(), d.getDate());

  const timeFormatter = new Intl.DateTimeFormat(
    locale,
    opts.timeFormat ?? { hour: "numeric", minute: "2-digit" },
  );
  const dateFmtSameYear = new Intl.DateTimeFormat(
    locale,
    opts.dateFormatSameYear ?? { month: "short", day: "numeric" },
  );
  const dateFmtWithYear = new Intl.DateTimeFormat(
    locale,
    opts.dateFormatWithYear ?? {
      month: "short",
      day: "numeric",
      year: "numeric",
    },
  );

  if (startOfDay(now).getTime() === startOfDay(date).getTime()) {
    return timeFormatter.format(date);
  }

  const daysDiff = Math.round(
    (startOfDay(date).getTime() - startOfDay(now).getTime()) / msPerDay,
  );
  const maxRel = opts.maxDaysForRelative ?? 6;
  const rtf = new Intl.RelativeTimeFormat(locale, { numeric: "auto" });

  if (Math.abs(daysDiff) <= maxRel) {
    const rel = rtf.format(daysDiff, "day");
    if (opts.showTimeForYesterday && Math.abs(daysDiff) === 1) {
      return `${rel} at ${timeFormatter.format(date)}`;
    }
    return rel;
  }

  if (now.getFullYear() === date.getFullYear()) {
    return dateFmtSameYear.format(date);
  }
  return dateFmtWithYear.format(date);
}
