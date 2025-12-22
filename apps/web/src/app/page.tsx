import HealthCheckMonitor from "@/components/health-check-monitor";
import Hero from "@/components/hero/hero";

/**
 * Home page - Server Component for optimal performance.
 * Health check monitoring is handled by a separate client component.
 * 
 * Note: The hero image is automatically preloaded via Next.js Image component's
 * priority prop, which adds the necessary preload hints to the document head.
 */
export default function Home() {
	return (
		<>
			<HealthCheckMonitor />
			<Hero />
		</>
	);
}
