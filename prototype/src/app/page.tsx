import { getAppData } from "@/lib/data";
import SplitSmart from "@/app/splitsmart";

export const dynamic = "force-dynamic";

export default async function Home() {
  const data = await getAppData();
  return <SplitSmart initialData={data} />;
}
