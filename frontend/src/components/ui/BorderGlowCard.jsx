import BorderGlow from './BorderGlow';

/**
 * Pre-configured BorderGlow card themed for the NovaPay dark-blue palette.
 * Drop-in wrapper: just pass children.
 */
export default function BorderGlowCard({ children, className = '', animated = false }) {
  return (
    <BorderGlow
      colors={['#0059FF', '#3B82F6', '#041A53']}
      backgroundColor="#041A53"
      glowColor="220 80 60"
      borderRadius={20}
      glowRadius={40}
      glowIntensity={1.0}
      coneSpread={25}
      animated={animated}
      className={className}
    >
      {children}
    </BorderGlow>
  );
}
