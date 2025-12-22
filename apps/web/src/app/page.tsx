import HealthCheckMonitor from "@/components/health-check-monitor";
import Hero from "@/components/hero/hero";

/**
 * Home page - Server Component for optimal performance.
 * Health check monitoring is handled by a separate client component.
 */
export default function Home() {
  return (
    <>
      <HealthCheckMonitor />
      <Hero />
    </>
  );
}
