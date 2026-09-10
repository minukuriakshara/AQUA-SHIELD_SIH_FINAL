/**
 * LakeHealth Types & Interfaces
 */

export interface LakeLocation {
  name: string;
  latitude: number;
  longitude: number;
  state?: string;
  district?: string;
  description?: string;
}

export interface ApiHealthResponse {
  status: string;
}

export interface MonitorRealResponse {
  lake_name: string;
  latitude: number;
  longitude: number;
  satellite: string;
  image_date: string;
  method: string;
  water_pixels: number;
  total_pixels: number;
  detected_water_percentage: number;
  status: string;
  is_fallback?: boolean;
  data_source?: string;
}

export interface MonitorChangeResponse {
  lake_name: string;
  latitude: number;
  longitude: number;
  satellite: string;
  before_date: string;
  after_date: string;
  before_water_pixels: number;
  after_water_pixels: number;
  total_pixels: number;
  before_water_percentage: number;
  after_water_percentage: number;
  change_pixels: number;
  change_percentage: number;
  change_status: string;
  method: string;
  status: string;
  is_fallback?: boolean;
  data_source?: string;
}

export type RiskLevel = 'LOW' | 'MODERATE' | 'HIGH';

export type InvestigationStatus =
  | 'Normal'
  | 'Watch'
  | 'Investigation Required'
  | 'Verified'
  | 'Rejected'
  | 'Inconclusive';

export interface RiskAnalysis {
  riskScore: number; // 0 - 100
  riskLevel: RiskLevel;
  dataQuality?: 'Good' | 'Moderate' | 'Poor';
  riskFactors: string[];
  detectedChangeAreaHectares: number;
  detectedChangeAreaAcres: number;
  detectedChangeAreaSqM: number;
  waterLossPercentage: number;
  isWaterLoss: boolean;
  confidenceScore: number; // 0 - 100
  perimeterEncroachmentRisk: string;
  recommendedAction: {
    primary: string;
    details: string[];
  };
  disclaimer: string;
}

export type AlertStatus = 'Pending' | 'Verified' | 'Rejected' | 'Inconclusive';

export interface AlertItem {
  id: string;
  caseId?: string;
  lakeName: string;
  latitude: number;
  longitude: number;
  date: string;
  changeDetected: string;
  changePercentage: number;
  isLoss: boolean;
  affectedAreaSqM: number;
  affectedAreaHectares: number;
  riskLevel: RiskLevel;
  riskScore: number;
  confidence: number;
  dataQuality?: 'Good' | 'Moderate' | 'Poor';
  reason: string;
  whyFlagged: string[];
  recommendedAction: string;
  actionChecklist: string[];
  status: AlertStatus;
  assignedOfficer?: string;
  assignedDesignation?: string;
  assignedDate?: string;
  assignedInstructions?: string;
  verifiedBy?: string;
  verificationNotes?: string;
  verificationDate?: string;
}

export interface CadastralParcel {
  surveyNumber: string;
  parcelId?: string;
  subDivision?: string;
  village?: string;
  mandal?: string;
  district?: string;
  areaAcres: number;
  landClassification: 'Government Water Body' | 'Buffer Zone (FTL)' | 'Private Patta' | 'Assigned Land' | 'Encroachment Zone';
  ownerOrCustodian: string;
  isIntersectingChange: boolean;
  riskLevel?: RiskLevel;
  investigationStatus: InvestigationStatus;
  changeAreaSqM?: number;
  geometry: {
    type: 'Polygon';
    coordinates: number[][][]; // [lng, lat]
  };
}

export interface EvidencePhoto {
  id: string;
  photoUrl: string;
  caption: string;
  gpsCoordinates: [number, number];
  gpsAccuracyMeters: number;
  timestamp: string;
  relatedAlertId: string;
  lakeName?: string;
  observedActivity: string;
  validation: {
    hasGps: boolean;
    hasTimestamp: boolean;
    insideZone: boolean;
  };
}

export interface CaseRecord {
  caseId: string;
  alertId: string;
  lakeName: string;
  latitude: number;
  longitude: number;
  createdDate: string;
  stage: 'Detected' | 'Prioritized' | 'Assigned' | 'Inspected' | 'Evidence Submitted' | 'Verified' | 'Action Taken' | 'Closed';
  priorityScore: number;
  priorityLevel: RiskLevel;
  confidenceScore: number;
  changeDetectedDescription: string;
  affectedAreaHectares: number;
  assignedOfficer?: string;
  assignedDesignation?: string;
  assignedDate?: string;
  assignedInstructions?: string;
  fieldInspectionId?: string;
  evidencePhotoIds: string[];
  recommendedAction: string;
  administrativeStatus: string;
}

export interface SpatialLayersData {
  waterMaskGeoJson: GeoJSON.FeatureCollection | null;
  historicalWaterGeoJson?: GeoJSON.FeatureCollection | null;
  existingWaterGeoJson: GeoJSON.FeatureCollection | null;
  waterLossGeoJson: GeoJSON.FeatureCollection | null;
  potentialChangeGeoJson: GeoJSON.FeatureCollection | null;
  riskZonesGeoJson: GeoJSON.FeatureCollection | null;
  bufferZoneGeoJson?: GeoJSON.FeatureCollection | null;
}

export interface OpenGisBoundaryInfo {
  found: boolean;
  source?: string;
  name?: string;
  osmId?: number;
  osmType?: string;
  waterType?: string;
  geojson?: GeoJSON.Polygon | GeoJSON.MultiPolygon | null;
  message: string;
}

export type ObservedActivityType =
  | 'Permanent construction'
  | 'Temporary structure'
  | 'Debris dumping'
  | 'Land filling'
  | 'Excavation'
  | 'Vegetation clearing'
  | 'Road formation'
  | 'Other'
  | 'None / Seasonal Fluctuation';

export interface FieldInspectionLog {
  id: string;
  alertId?: string;
  relatedAlertId?: string;
  caseId?: string;
  lakeName: string;
  latitude: number;
  longitude: number;
  inspectorName: string;
  officerName?: string;
  designation: string;
  inspectionDate: string;
  encroachmentType: ObservedActivityType;
  riskLevel: RiskLevel;
  status: AlertStatus;
  notes: string;
  gpsAccuracyMeters: number;
  photosCount: number;
  photos?: EvidencePhoto[];
}

export type FieldLog = FieldInspectionLog;
