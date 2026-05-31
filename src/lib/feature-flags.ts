function parseBooleanFlag(value: string | undefined): boolean {
  if (!value) {
    return false;
  }

  const normalized = value.trim().toLowerCase();
  return normalized === "1" || normalized === "true" || normalized === "yes" || normalized === "on";
}

export function isStudioEnabled(): boolean {
  const rawValue = process.env.ENABLE_STUDIO ?? process.env.NEXT_PUBLIC_ENABLE_STUDIO;
  return parseBooleanFlag(rawValue);
}