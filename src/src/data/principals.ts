export interface PrincipalAccount {
  id: string;
  name: string;
  password: string;
}

export const PRINCIPALS: PrincipalAccount[] = [
  { id: "p1", name: "Lords School Churu", password: "Lordschuru@2026" },
  { id: "p2", name: "Lords School Sadulpur", password: "Lordssadulpur@2026" },
  { id: "p3", name: "Lords School Taranagar", password: "Lordstaranagar@2026" },
  { id: "p4", name: "Principal 4", password: "principal4" },
  { id: "p5", name: "Principal 5", password: "principal5" },
];
