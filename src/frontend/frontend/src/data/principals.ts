export interface PrincipalAccount {
  id: string;
  name: string;
  password: string;
}

export const PRINCIPALS: PrincipalAccount[] = [
  { id: "p1", name: "Lords School Churu", password: "principal1" },
  { id: "p2", name: "Lords School Sadulpur", password: "principal2" },
  { id: "p3", name: "Lords School Taranagar", password: "principal3" },
  { id: "p4", name: "Principal 4", password: "principal4" },
  { id: "p5", name: "Principal 5", password: "principal5" },
];
