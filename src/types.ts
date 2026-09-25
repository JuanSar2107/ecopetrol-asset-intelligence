export type UserRole = 'operator' | 'admin';

export interface UserProfile {
  id: string;
  name: string;
  documentId: string;
  email?: string;
  password?: string;
  role: UserRole;
  roleTitle: string;
  avatar: string;
  shift: string;
}

export interface CategoryOption {
  id: string;
  label: string;
  isCustom?: boolean;
}

export type AssetCategory = 
  | 'heavy-machinery'         // Maquinaria Pesada & Construcción
  | 'industrial-equipment'    // Equipos Industriales & Generadores
  | 'tools-machining'         // Herramientas, Fresado & Mecanizado CNC
  | 'hydraulics-pneumatics'   // Bombas & Sistemas Hidráulicos
  | 'motors-power'            // Motores Eléctricos & Transmisión
  | 'parts-spares'            // Repuestos, Rodamientos & Filtros
  | 'supplies-safety'         // Insumos Industriales & Seguridad
  | 'spare-parts'
  | 'safety-protection'
  | 'supplies-hardware'
  | 'logistics-handling'
  | (string & {});

export type AssetStatus = 
  | 'In Stock'
  | 'Deployed'
  | 'Low Stock'
  | 'Maintenance';

export interface MovementHistoryItem {
  id: string;
  date: string;
  action: string;
  location: string;
  operator: string;
  status: 'Available' | 'In Transit' | 'Operating' | 'New' | 'Maintenance' | 'Inspecting';
  reason?: string;
}

export interface ToolAsset {
  id: string;
  name: string;
  modelNumber: string; // P/N, Referencia o Código de Modelo
  category: AssetCategory;
  size?: string;
  type?: string;
  aircraftCompatibility?: string; // Sector, Aplicación o Compatibilidad Técnica (ej: Construcción, Minería, Metalmecánica, Universal)
  applicationSector?: string;
  destinationProject?: string;
  quantity: number;
  minQuantity: number;
  location: string; // Ejemplo: Bodega Principal, Almacén A, Taller de Servicio, En Cliente/Obra
  status: AssetStatus;
  image: string;
  barcode: string;
  manufacturer: string;
  serialNumber?: string;
  weight?: string;
  operatingHours?: number;
  description: string;
  history?: MovementHistoryItem[];
}

export interface MovementTransaction {
  id: string;
  type: 'IN' | 'OUT'; // OUT = Salida / Despacho a Obra o Cliente; IN = Ingreso / Devolución a Bodega
  assetId: string;
  assetName: string;
  quantity: number;
  operator: string;
  operatorName?: string;
  operatorDocument?: string;
  operatorId?: string;
  location: string;
  aircraftTail?: string; // Destino, Proyecto, Cliente u Obra
  destinationProject?: string;
  timestamp: string;
  status: 'Active' | 'Inspecting' | 'Stored' | 'Completed';
  workOrder?: string;
  notes?: string;
  withdrawalReason?: string;
}

export type AppView = 'login' | 'dashboard' | 'catalog' | 'detail' | 'transactions' | 'admin-audit';

