import { redirect } from 'next/navigation';
import LandingPage from './landing-page';
import { legacyDiscoveryPath } from '../lib/navigation';

export default async function Home({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const destination = legacyDiscoveryPath(await searchParams);
  if (destination) redirect(destination);
  return <LandingPage />;
}
