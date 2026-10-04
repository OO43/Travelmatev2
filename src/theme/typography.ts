/**
 * Shared text styles.
 *
 * React Native uses the device's system font by default. Add `fontFamily`
 * here later if TravelMate adopts a bundled brand font.
 */
export const TYPOGRAPHY = {
  display: {
    fontSize: 15,
    lineHeight: 41,
    fontWeight: '900',
    letterSpacing: -0.9,
  },
  screenTitle: {
    fontSize: 25,
    lineHeight: 31,
    fontWeight: '900',
    letterSpacing: -0.5,
  },
  sectionTitle: {
    fontSize: 22,
    lineHeight: 28,
    fontWeight: '900',
  },
  cardTitle: {
    fontSize: 18,
    lineHeight: 24,
    fontWeight: '900',
  },
  body: {
    fontSize: 14,
    lineHeight: 21,
    fontWeight: '400',
  },
  bodySmall: {
    fontSize: 13,
    lineHeight: 19,
    fontWeight: '400',
  },
  caption: {
    fontSize: 12,
    lineHeight: 17,
    fontWeight: '400',
  },
  eyebrow: {
    fontSize: 10,
    lineHeight: 14,
    fontWeight: '900',
    letterSpacing: 1.2,
  },
  button: {
    fontSize: 15,
    lineHeight: 20,
    fontWeight: '800',
  },
} as const;

