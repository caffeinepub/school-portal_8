export interface PrincipalAccount {
  id: string;
  name: string;
  password: string;
}

export const PRINCIPALS: PrincipalAccount[] = [
  { id: "p1", name: "Principal 1", password: "principal1" },
  { id: "p2", name: "Principal 2", password: "principal2" },
  { id: "p3", name: "Principal 3", password: "principal3" },
  { id: "p4", name: "Principal 4", password: "principal4" },
  { id: "p5", name: "Principal 5", password: "principal5" },
];
