export interface DemoRecord {
  id: string;
  name: string;
  region: string;
  state: "running" | "stopped";
}
// Replace this illustrative dataset with authorized server-side data in the product.
export const demoRecords: DemoRecord[] = [
  { id: "dev", name: "development", region: "sa-east-1", state: "running" },
  { id: "review", name: "review", region: "sa-east-1", state: "stopped" },
  { id: "worker", name: "worker", region: "us-east-1", state: "running" },
];
