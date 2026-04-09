export interface MasterSubItem { id: number; name: string; }
export interface MasterItem { id: number; name: string; children: MasterSubItem[]; }

export const locationMaster: MasterItem[] = [
  { id: 1, name: "ภายในอาคาร", children: [
    { id: 1, name: "ชั้น 1" }, { id: 2, name: "ชั้น 2" }, { id: 3, name: "ชั้น 3" },
    { id: 4, name: "ห้องประชุม A" }, { id: 5, name: "ห้องประชุม B" }, { id: 6, name: "ห้องครัว" },
    { id: 7, name: "ห้องน้ำ" }, { id: 8, name: "ล็อบบี้" },
  ]},
  { id: 2, name: "ภายนอกอาคาร", children: [
    { id: 9, name: "ลานจอดรถ" }, { id: 10, name: "สวน/พื้นที่สีเขียว" },
    { id: 11, name: "ทางเดิน" }, { id: 12, name: "รั้ว/ประตูทางเข้า" },
  ]},
  { id: 3, name: "อาคาร B", children: [
    { id: 13, name: "ชั้น 1" }, { id: 14, name: "ชั้น 2" }, { id: 15, name: "ชั้น 3" },
  ]},
];

let nextMasterId = 4;
let nextSubId = 16;
export function getNextMasterId() { return nextMasterId++; }
export function getNextMasterSubId() { return nextSubId++; }
