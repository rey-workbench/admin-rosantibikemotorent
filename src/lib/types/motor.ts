export interface JenisMotor {
  id: string;
  merk: string;
  model: string;
  cc: number;
  hargaSewa: number;
  gambar?: string;
  slug: string;
  createdAt: string;
  updatedAt: string;
}

export interface UnitMotor {
  id: string;
  platNomor: string;
  jenisId: string;
  jenis?: JenisMotor;
  tahunPembuatan?: number;
  slug: string;
  createdAt: string;
  updatedAt: string;
}

export interface MotorStatusUpdate {
  id: string;
  platNomor: string;
  message: string;
}

export interface UnitMotorUpdate {
  action: "create" | "update" | "delete";
  data?: unknown;
  id?: string;
}

export interface AvailabilityCheckParams {
  startDate: string;
  endDate: string;
  unitId?: string;
}
