export type ReconStatus = "verified" | "pending" | "flagged";
export type ZoneHealth = "healthy" | "low" | "offline" | "pending";
export type Severity = "critical" | "warning" | "info";
export type AlertType = "low_stock" | "camera_offline" | "anomaly";

export interface Product {
  sku: string;
  name: string;
  zone: string;
  count: number; // verified, committed
  observed: number | null; // pending observation not yet reconciled
  threshold: number;
  status: ReconStatus;
  updatedMin: number;
  history: number[];
}

export interface Zone {
  id: string;
  aisle: string;
  label: string;
  health: ZoneHealth;
  skus: number;
  confidence: number;
  camera: string;
}

export interface Camera {
  id: string;
  name: string;
  location: string;
  online: boolean;
  heartbeatSec: number;
  fps: number;
  zones: string[];
}

export interface FeedEvent {
  id: string;
  zone: string;
  product: string;
  from: number;
  to: number;
  confidence: number;
  minAgo: number;
}

export interface Alert {
  id: string;
  type: AlertType;
  severity: Severity;
  title: string;
  detail: string;
  zone: string;
  sku?: string;
  minAgo: number;
  acknowledged: boolean;
}

const hist = (end: number, drift: number[]) => {
  const out: number[] = [];
  let v = end;
  for (let i = drift.length - 1; i >= 0; i--) {
    out.unshift(v);
    v += drift[i];
  }
  return out;
};

export const products: Product[] = [
  { sku: "BEV-1042", name: "Coca-Cola Classic 330ml Can", zone: "A-1", count: 48, observed: null, threshold: 20, status: "verified", updatedMin: 2, history: hist(48, [0, 2, 3, 0, 4, 1, 2, 0, 3, 1, 2, 3]) },
  { sku: "BEV-1077", name: "Nestlé Pure Life 1.5L", zone: "A-1", count: 9, observed: null, threshold: 15, status: "verified", updatedMin: 4, history: hist(9, [1, 2, 0, 3, 2, 1, 2, 0, 3, 1, 1, 3]) },
  { sku: "BEV-1103", name: "Red Bull Energy 250ml", zone: "A-2", count: 31, observed: 28, threshold: 12, status: "pending", updatedMin: 1, history: hist(31, [0, 1, 0, 2, 1, 0, 1, 2, 0, 1, 0, 1]) },
  { sku: "BEV-1130", name: "Lipton Iced Tea Peach 500ml", zone: "A-2", count: 22, observed: null, threshold: 10, status: "verified", updatedMin: 11, history: hist(22, [1, 0, 1, 1, 0, 2, 0, 1, 0, 0, 1, 1]) },
  { sku: "SNK-2011", name: "Lay's Classic Salted 52g", zone: "A-3", count: 9, observed: null, threshold: 18, status: "verified", updatedMin: 3, history: hist(9, [2, 3, 1, 2, 0, 3, 2, 1, 2, 3, 0, 3]) },
  { sku: "SNK-2034", name: "Pringles Sour Cream 165g", zone: "A-3", count: 14, observed: 11, threshold: 10, status: "pending", updatedMin: 0, history: hist(14, [0, 1, 1, 0, 2, 0, 1, 0, 1, 1, 0, 0]) },
  { sku: "SNK-2058", name: "Oreo Original 133g", zone: "A-4", count: 37, observed: null, threshold: 15, status: "verified", updatedMin: 7, history: hist(37, [1, 0, 2, 1, 0, 1, 1, 0, 2, 0, 1, 1]) },
  { sku: "SNK-2090", name: "KitKat 4-Finger 41.5g", zone: "A-4", count: 6, observed: 2, threshold: 20, status: "flagged", updatedMin: 5, history: hist(6, [3, 2, 4, 1, 3, 2, 0, 3, 2, 4, 0, 4]) },
  { sku: "DRY-3005", name: "Basmati Rice Premium 5kg", zone: "B-1", count: 18, observed: null, threshold: 8, status: "verified", updatedMin: 14, history: hist(18, [0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1]) },
  { sku: "DRY-3021", name: "Barilla Spaghetti No.5 500g", zone: "B-1", count: 42, observed: null, threshold: 20, status: "verified", updatedMin: 9, history: hist(42, [1, 1, 0, 2, 1, 0, 1, 1, 0, 1, 2, 0]) },
  { sku: "DRY-3044", name: "Quaker Oats Rolled 1kg", zone: "B-2", count: 4, observed: null, threshold: 12, status: "verified", updatedMin: 6, history: hist(4, [2, 1, 2, 3, 1, 2, 2, 1, 3, 2, 1, 2]) },
  { sku: "DRY-3067", name: "Nescafé Classic Jar 200g", zone: "B-2", count: 16, observed: 13, threshold: 8, status: "pending", updatedMin: 1, history: hist(16, [0, 1, 0, 0, 1, 1, 0, 0, 1, 0, 1, 0]) },
  { sku: "DRY-3089", name: "Tapal Danedar Tea 950g", zone: "B-3", count: 27, observed: null, threshold: 10, status: "verified", updatedMin: 22, history: hist(27, [0, 1, 0, 1, 1, 0, 0, 1, 0, 1, 0, 0]) },
  { sku: "DRY-3102", name: "Heinz Tomato Ketchup 570g", zone: "B-3", count: 11, observed: null, threshold: 10, status: "verified", updatedMin: 18, history: hist(11, [1, 0, 1, 0, 1, 0, 1, 1, 0, 0, 1, 0]) },
  { sku: "DAI-4012", name: "Olper's Full Cream Milk 1L", zone: "C-1", count: 0, observed: null, threshold: 24, status: "flagged", updatedMin: 41, history: hist(0, [4, 3, 5, 2, 4, 3, 2, 4, 3, 2, 5, 3]) },
  { sku: "DAI-4033", name: "Nurpur Butter Salted 200g", zone: "C-1", count: 13, observed: null, threshold: 6, status: "verified", updatedMin: 41, history: hist(13, [0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 0, 1]) },
  { sku: "DAI-4050", name: "Activia Yogurt Strawberry 4pk", zone: "C-2", count: 20, observed: 17, threshold: 10, status: "pending", updatedMin: 2, history: hist(20, [1, 0, 1, 1, 0, 1, 0, 1, 1, 0, 1, 0]) },
  { sku: "DAI-4071", name: "Kraft Cheddar Slices 200g", zone: "C-2", count: 25, observed: null, threshold: 10, status: "verified", updatedMin: 12, history: hist(25, [0, 1, 1, 0, 1, 0, 1, 0, 0, 1, 1, 0]) },
  { sku: "HHC-5008", name: "Ariel Matic Detergent 2kg", zone: "D-1", count: 15, observed: null, threshold: 6, status: "verified", updatedMin: 31, history: hist(15, [0, 0, 1, 0, 1, 0, 0, 0, 1, 0, 0, 1]) },
  { sku: "HHC-5026", name: "Dettol Antiseptic Liquid 500ml", zone: "D-1", count: 8, observed: null, threshold: 10, status: "verified", updatedMin: 8, history: hist(8, [1, 0, 1, 1, 0, 1, 1, 0, 1, 0, 1, 1]) },
  { sku: "HHC-5049", name: "Colgate Max Fresh 150g", zone: "D-2", count: 34, observed: null, threshold: 12, status: "verified", updatedMin: 16, history: hist(34, [1, 0, 1, 0, 1, 1, 0, 1, 0, 1, 0, 1]) },
  { sku: "HHC-5063", name: "Head & Shoulders Shampoo 400ml", zone: "D-2", count: 19, observed: 21, threshold: 8, status: "flagged", updatedMin: 3, history: hist(19, [0, 1, 0, 1, 0, 0, 1, 0, 1, 0, 0, 1]) },
  { sku: "HHC-5081", name: "Safeguard Soap Pure White 3pk", zone: "D-3", count: 29, observed: null, threshold: 10, status: "verified", updatedMin: 25, history: hist(29, [0, 1, 0, 1, 1, 0, 0, 1, 0, 1, 0, 0]) },
  { sku: "HHC-5097", name: "Lifebuoy Hand Wash 200ml", zone: "D-4", count: 12, observed: null, threshold: 8, status: "verified", updatedMin: 19, history: hist(12, [0, 1, 0, 0, 1, 0, 1, 0, 0, 1, 0, 1]) },
];

export const zones: Zone[] = [
  { id: "A-1", aisle: "A", label: "Beverages · Water & Soda", health: "low", skus: 14, confidence: 97, camera: "CAM-01" },
  { id: "A-2", aisle: "A", label: "Beverages · Energy & Tea", health: "pending", skus: 11, confidence: 82, camera: "CAM-01" },
  { id: "A-3", aisle: "A", label: "Snacks · Chips", health: "low", skus: 18, confidence: 94, camera: "CAM-02" },
  { id: "A-4", aisle: "A", label: "Snacks · Confectionery", health: "offline", skus: 22, confidence: 61, camera: "CAM-02" },
  { id: "B-1", aisle: "B", label: "Dry · Rice & Pasta", health: "healthy", skus: 16, confidence: 98, camera: "CAM-03" },
  { id: "B-2", aisle: "B", label: "Dry · Breakfast & Coffee", health: "low", skus: 13, confidence: 91, camera: "CAM-03" },
  { id: "B-3", aisle: "B", label: "Dry · Tea & Condiments", health: "healthy", skus: 19, confidence: 96, camera: "CAM-04" },
  { id: "B-4", aisle: "B", label: "Dry · Spices", health: "healthy", skus: 24, confidence: 99, camera: "CAM-04" },
  { id: "C-1", aisle: "C", label: "Dairy · Milk & Butter", health: "offline", skus: 9, confidence: 0, camera: "CAM-05" },
  { id: "C-2", aisle: "C", label: "Dairy · Yogurt & Cheese", health: "pending", skus: 12, confidence: 79, camera: "CAM-06" },
  { id: "C-3", aisle: "C", label: "Frozen · Ready Meals", health: "healthy", skus: 15, confidence: 95, camera: "CAM-06" },
  { id: "C-4", aisle: "C", label: "Frozen · Desserts", health: "healthy", skus: 10, confidence: 97, camera: "CAM-06" },
  { id: "D-1", aisle: "D", label: "Household · Laundry", health: "low", skus: 17, confidence: 93, camera: "CAM-07" },
  { id: "D-2", aisle: "D", label: "Personal · Oral & Hair", health: "pending", skus: 21, confidence: 84, camera: "CAM-07" },
  { id: "D-3", aisle: "D", label: "Personal · Bath", health: "healthy", skus: 14, confidence: 98, camera: "CAM-08" },
  { id: "D-4", aisle: "D", label: "Personal · Hand Care", health: "healthy", skus: 8, confidence: 99, camera: "CAM-08" },
];

export const cameras: Camera[] = [
  { id: "CAM-01", name: "Aisle A · North", location: "Floor 1 · Aisle A · Bay 1–2", online: true, heartbeatSec: 2, fps: 24, zones: ["A-1", "A-2"] },
  { id: "CAM-02", name: "Aisle A · South", location: "Floor 1 · Aisle A · Bay 3–4", online: true, heartbeatSec: 4, fps: 12, zones: ["A-3", "A-4"] },
  { id: "CAM-03", name: "Aisle B · North", location: "Floor 1 · Aisle B · Bay 1–2", online: true, heartbeatSec: 1, fps: 24, zones: ["B-1", "B-2"] },
  { id: "CAM-04", name: "Aisle B · South", location: "Floor 1 · Aisle B · Bay 3–4", online: true, heartbeatSec: 3, fps: 24, zones: ["B-3", "B-4"] },
  { id: "CAM-05", name: "Dairy Cooler", location: "Floor 1 · Aisle C · Cooler 1", online: false, heartbeatSec: 2460, fps: 0, zones: ["C-1"] },
  { id: "CAM-06", name: "Aisle C · Freezers", location: "Floor 1 · Aisle C · Bay 2–4", online: true, heartbeatSec: 2, fps: 18, zones: ["C-2", "C-3", "C-4"] },
  { id: "CAM-07", name: "Aisle D · North", location: "Floor 1 · Aisle D · Bay 1–2", online: true, heartbeatSec: 5, fps: 24, zones: ["D-1", "D-2"] },
  { id: "CAM-08", name: "Aisle D · South", location: "Floor 1 · Aisle D · Bay 3–4", online: true, heartbeatSec: 1, fps: 24, zones: ["D-3", "D-4"] },
];

export const initialEvents: FeedEvent[] = [
  { id: "e1", zone: "A-3", product: "Lay's Classic Salted 52g", from: 12, to: 9, confidence: 96, minAgo: 3 },
  { id: "e2", zone: "A-1", product: "Coca-Cola Classic 330ml Can", from: 50, to: 48, confidence: 98, minAgo: 2 },
  { id: "e3", zone: "B-2", product: "Quaker Oats Rolled 1kg", from: 6, to: 4, confidence: 93, minAgo: 6 },
  { id: "e4", zone: "D-1", product: "Dettol Antiseptic Liquid 500ml", from: 9, to: 8, confidence: 91, minAgo: 8 },
  { id: "e5", zone: "B-1", product: "Barilla Spaghetti No.5 500g", from: 40, to: 42, confidence: 99, minAgo: 9 },
  { id: "e6", zone: "A-1", product: "Nestlé Pure Life 1.5L", from: 12, to: 9, confidence: 95, minAgo: 11 },
  { id: "e7", zone: "C-2", product: "Kraft Cheddar Slices 200g", from: 26, to: 25, confidence: 88, minAgo: 12 },
  { id: "e8", zone: "B-3", product: "Heinz Tomato Ketchup 570g", from: 12, to: 11, confidence: 94, minAgo: 18 },
].sort((a, b) => a.minAgo - b.minAgo);

export const initialAlerts: Alert[] = [
  { id: "al1", type: "camera_offline", severity: "critical", title: "CAM-05 Dairy Cooler offline", detail: "No heartbeat for 41 min. Zone C-1 counts frozen at last verified state.", zone: "C-1", minAgo: 41, acknowledged: false },
  { id: "al2", type: "low_stock", severity: "critical", title: "Out of stock: Olper's Full Cream Milk 1L", detail: "Last verified count 0 (threshold 24). Restock required.", zone: "C-1", sku: "DAI-4012", minAgo: 44, acknowledged: false },
  { id: "al3", type: "anomaly", severity: "warning", title: "Count increase without restock event", detail: "Head & Shoulders observed 21 vs verified 19. Possible misplaced item — flagged for review.", zone: "D-2", sku: "HHC-5063", minAgo: 3, acknowledged: false },
  { id: "al4", type: "anomaly", severity: "warning", title: "Rapid depletion: KitKat 4-Finger", detail: "Observed drop 6 → 2 in 4 min, exceeds typical sell-through 3×. Awaiting reconciliation.", zone: "A-4", sku: "SNK-2090", minAgo: 5, acknowledged: false },
  { id: "al5", type: "low_stock", severity: "warning", title: "Low stock: Lay's Classic Salted 52g", detail: "Verified count 9, below threshold 18.", zone: "A-3", sku: "SNK-2011", minAgo: 3, acknowledged: false },
  { id: "al6", type: "low_stock", severity: "warning", title: "Low stock: Quaker Oats Rolled 1kg", detail: "Verified count 4, below threshold 12.", zone: "B-2", sku: "DRY-3044", minAgo: 6, acknowledged: false },
  { id: "al7", type: "low_stock", severity: "warning", title: "Low stock: Nestlé Pure Life 1.5L", detail: "Verified count 9, below threshold 15.", zone: "A-1", sku: "BEV-1077", minAgo: 11, acknowledged: true },
  { id: "al8", type: "camera_offline", severity: "info", title: "CAM-02 frame rate degraded", detail: "Running at 12 fps (target 24). Detection confidence in A-4 reduced.", zone: "A-4", minAgo: 26, acknowledged: false },
  { id: "al9", type: "low_stock", severity: "info", title: "Approaching threshold: Dettol 500ml", detail: "Verified count 8, threshold 10.", zone: "D-1", sku: "HHC-5026", minAgo: 8, acknowledged: true },
];

export function ago(min: number) {
  if (min <= 0) return "just now";
  if (min < 60) return `${min}m ago`;
  const h = Math.floor(min / 60);
  return `${h}h ${min % 60}m ago`;
}

export function agoSec(sec: number) {
  if (sec < 60) return `${sec}s ago`;
  return ago(Math.floor(sec / 60));
}
