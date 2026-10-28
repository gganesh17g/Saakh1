/** Half-up nonnegative integer-paise rational arithmetic, without binary decimal division. */
export function roundedRatio(factors: number[], denominator: number) {
  if (
    !Number.isSafeInteger(denominator) ||
    denominator <= 0 ||
    factors.some((x) => !Number.isSafeInteger(x) || x < 0)
  )
    throw Error(
      "Money ratio requires safe nonnegative integers and positive divisor",
    );
  const n = factors.reduce((a, b) => a * BigInt(b), 1n),
    d = BigInt(denominator);
  const value = Number((n + d / 2n) / d);
  if (!Number.isSafeInteger(value))
    throw Error("Money exceeds safe integer range");
  return value;
}
