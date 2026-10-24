export interface DemoRecord {
  id: string;
  name: string;
  region: string;
  state: "running" | "stopped";
}
// Replace this illustrative dataset with authorized server-side data in the product.
export const demoRecords: DemoRecord[] = [
  {
    id: "dev",
    name: "Ambiente de desenvolvimento",
    region: "sa-east-1",
    state: "running",
  },
  {
    id: "review",
    name: "Ambiente de revisão",
    region: "sa-east-1",
    state: "stopped",
  },
  {
    id: "worker",
    name: "Worker de integração",
    region: "us-east-1",
    state: "running",
  },
];
