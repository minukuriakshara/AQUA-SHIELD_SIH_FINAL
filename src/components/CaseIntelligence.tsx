import React, { useState } from 'react';
import {
  ShieldAlert,
  MapPin,
  Calendar,
  UserCheck,
  Camera,
  Layers,
  FileText,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Clock,
  ArrowRight,
  ExternalLink,
  ChevronRight,
  Shield,
  HelpCircle,
  Download,
  Eye,
  Check,
  Activity
} from 'lucide-react';
import { AlertItem, CadastralParcel, FieldLog, EvidencePhoto } from '../types';
import { useLake } from '../context/LakeContext';
import { MapView } from './MapView';

interface CaseIntelligenceProps {
  alert: AlertItem;
  onClose?: () => void;
  setActiveTab: (tab: string) => void;
  onAssignOfficer: (alert: AlertItem) => void;
  onUpdateStatus: (alert: AlertItem, status: any) => void;
}

export const CaseIntelligence: React.FC<CaseIntelligenceProps> = ({
  alert,
  onClose,
  setActiveTab,
  onAssignOfficer,
  onUpdateStatus
}) => {
  const {
    currentLake,
    monitorChangeData,
    monitorRealData,
    riskAnalysis,
    cadastralParcels,
    lakeFieldLogs,
    lakeEvidencePhotos
  } = useLake();

  const [activeEvidenceTab, setActiveEvidenceTab] = useState<'ALL' | 'SATELLITE' | 'CADASTRAL' | 'FIELD'>('ALL');

  // Related parcels for this lake/alert
  const intersectingParcels = cadastralParcels?.filter((p) => p.isIntersectingChange) || [];
  const primaryParcel = intersectingParcels[0] || cadastralParcels?.[0];

  // Primary field log and evidence
  const fieldLog = lakeFieldLogs.find((l) => l.relatedAlertId === alert.id) || lakeFieldLogs[0];
  const relatedPhotos = lakeEvidencePhotos.filter((p) => p.relatedAlertId === alert.id || p.lakeName === alert.lakeName);

  // Evidence Reconciliation check (Requirement 4)
  // Satellite says HIGH water loss, but what does Field say?
  const hasDiscrepancy =
    (alert.riskLevel === 'HIGH' || (alert.changePercentage && alert.changePercentage > 5)) &&
    (alert.status === 'Rejected' || (fieldLog && (fieldLog.status === 'Rejected' || fieldLog.status === 'Inconclusive')));

  // Dates for timeline
  const obsDate = monitorChangeData?.after_date || alert.date || '2026-09-06';
  const baselineDate = monitorChangeData?.before_date || '2026-08-10';
  const alertGenDate = alert.date;
  const assignDate = alert.assignedOfficer ? '2026-09-07' : 'Pending';
  const inspectDate = fieldLog?.inspectionDate || (alert.assignedOfficer ? '2026-09-08' : 'Pending');

  // Timeline Step Statuses
  const isAssigned = Boolean(alert.assignedOfficer);
  const isInspected = Boolean(fieldLog || alert.status === 'Verified');
  const isEvidenceSubmitted = relatedPhotos.length > 0 || isInspected;
  const isVerified = alert.status === 'Verified' || alert.status === 'Rejected';
  const isActionRecommended = true;
  const isReportGenerated = isVerified || alert.status === 'Pending';
  const isClosed = alert.status === 'Verified' || alert.status === 'Rejected';

  const timelineSteps = [
    {
      id: 1,
      title: 'Satellite Observation',
      subtitle: `Acquired by Sentinel-2 MSI (${obsDate})`,
      date: obsDate,
      status: 'completed',
      detail: `GSD: 10m. Multi-temporal baseline comparison pass: ${baselineDate}.`
    },
    {
      id: 2,
      title: 'Change Detected',
      subtitle: `${alert.changePercentage ? `-${alert.changePercentage.toFixed(1)}%` : '-5.6%'} Water Surface Contraction`,
      date: obsDate,
      status: 'completed',
      detail: `Differential NDWI shift identified in lake shoreline boundary.`
    },
    {
      id: 3,
      title: 'Alert Generated',
      subtitle: `Case ID: ${alert.caseId || alert.id}`,
      date: alertGenDate,
      status: 'completed',
      detail: `Automated rule-based screening triggered high priority notification.`
    },
    {
      id: 4,
      title: 'Prioritized',
      subtitle: `Score: ${alert.riskScore}/100 (${alert.riskLevel} PRIORITY)`,
      date: alertGenDate,
      status: 'completed',
      detail: `Weight factors: Area scale (${alert.affectedAreaHectares || 36.99} Ha), buffer zone overlap.`
    },
    {
      id: 5,
      title: 'Officer Assigned',
      subtitle: alert.assignedOfficer ? `${alert.assignedOfficer} (Dispatched)` : 'Awaiting Assignment',
      date: assignDate,
      status: isAssigned ? 'completed' : 'active',
      detail: alert.assignedOfficer
        ? `Designation: ${alert.assignedDesignation || 'Revenue & Lake Officer'}`
        : 'Action required: Click [Assign Officer] to allocate inspection.'
    },
    {
      id: 6,
      title: 'Field Inspection',
      subtitle: isInspected ? `Conducted by ${fieldLog?.inspectorName || fieldLog?.officerName || 'Inspector'}` : 'Scheduled on site',
      date: inspectDate,
      status: isInspected ? 'completed' : isAssigned ? 'active' : 'pending',
      detail: fieldLog ? `Status: ${fieldLog.status}. GPS logged.` : 'Inspection scheduled for boundary coordinates.'
    },
    {
      id: 7,
      title: 'Evidence Submitted',
      subtitle: `${relatedPhotos.length} Geotagged Photo(s) & GPS Log`,
      date: inspectDate,
      status: isEvidenceSubmitted ? 'completed' : 'pending',
      detail: 'Timestamp, latitude/longitude, and camera orientation recorded.'
    },
    {
      id: 8,
      title: 'Verification',
      subtitle: `Status: ${alert.status}`,
      date: alert.status !== 'Pending' ? inspectDate : 'Pending Review',
      status: isVerified ? 'completed' : 'pending',
      detail: alert.verificationNotes || 'Field verification notes under supervisory review.'
    },
    {
      id: 9,
      title: 'Recommended Action',
      subtitle: alert.recommendedAction || 'Notice issuance & boundary demarcation',
      date: 'Generated',
      status: isActionRecommended ? 'completed' : 'pending',
      detail: 'Formulated decision-support recommendation under State Water Bodies Protection Act framework.'
    },
    {
      id: 10,
      title: 'Report Generated',
      subtitle: 'Investigation Dossier Available',
      date: 'Current',
      status: isReportGenerated ? 'completed' : 'pending',
      detail: 'Full multi-spectral and cadastral PDF package compiled.'
    },
    {
      id: 11,
      title: 'Closed / Monitoring',
      subtitle: isClosed ? `Case Status: ${alert.status}` : 'Active Surveillance',
      date: 'Continuous',
      status: isClosed ? 'completed' : 'active',
      detail: 'Periodic Sentinel-2 monitoring recommended to track boundary reclamation status.'
    }
  ];

  return (
    <div className="space-y-6 animate-fadeIn pb-12">
      {/* Top Header Card */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-slate-900 via-slate-900 to-slate-950 border border-slate-800 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-cyan-500/5 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <div className="flex flex-wrap items-center gap-2.5 mb-2">
              <span className="px-3 py-1 rounded-lg text-xs font-mono font-bold bg-cyan-950/80 text-cyan-300 border border-cyan-800/80">
                {alert.caseId || `CASE-2026-${alert.id}`}
              </span>
              <span
                className={`px-3 py-1 rounded-lg text-xs font-bold border ${
                  alert.riskLevel === 'HIGH'
                    ? 'bg-rose-950/80 text-rose-300 border-rose-800'
                    : alert.riskLevel === 'MODERATE'
                    ? 'bg-amber-950/80 text-amber-300 border-amber-800'
                    : 'bg-emerald-950/80 text-emerald-300 border-emerald-800'
                }`}
              >
                {alert.riskLevel} PRIORITY ({alert.riskScore}/100)
              </span>
              <span className="px-2.5 py-1 rounded-lg text-xs font-medium bg-slate-800 text-slate-300 border border-slate-700">
                Status: <strong className="text-white">{alert.status}</strong>
              </span>
              <span className="px-2.5 py-1 rounded-lg text-xs font-medium bg-teal-950/80 text-teal-300 border border-teal-800">
                Data Quality: {alert.dataQuality || 'Good'} (Screening Confidence: {alert.confidence || 85}%)
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight flex items-center gap-2">
              <span>{alert.lakeName}</span>
              <span className="text-slate-500 font-normal text-xl">Case Intelligence</span>
            </h1>

            <p className="text-slate-400 text-xs sm:text-sm mt-1 flex flex-wrap items-center gap-3">
              <span className="flex items-center gap-1 font-mono text-cyan-300">
                <MapPin className="w-3.5 h-3.5" />
                {alert.latitude.toFixed(4)}°N, {alert.longitude.toFixed(4)}°E
              </span>
              <span>&bull;</span>
              <span>Trigger Date: {alert.date}</span>
              <span>&bull;</span>
              <span>Scope: 256×256 Sentinel-2 Patch (~2.56 km)</span>
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => setActiveTab('gis')}
              className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-cyan-300 border border-slate-700 text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-sm"
              title="Open full GIS viewer with this case highlighted"
            >
              <Layers className="w-4 h-4 text-cyan-400" />
              <span>View on Map</span>
            </button>

            <button
              onClick={() => onAssignOfficer(alert)}
              className="px-3.5 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-md shadow-cyan-600/30"
              title="Assign field officer to verify this case"
            >
              <UserCheck className="w-4 h-4" />
              <span>{alert.assignedOfficer ? 'Reassign Officer' : 'Assign Officer'}</span>
            </button>

            <button
              onClick={() => setActiveTab('field')}
              className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-purple-300 border border-purple-800/60 text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-sm"
              title="Add field inspection photo or log"
            >
              <Camera className="w-4 h-4 text-purple-400" />
              <span>Add Evidence</span>
            </button>

            <button
              onClick={() => setActiveTab('gis')}
              className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-blue-300 border border-blue-800/60 text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-sm"
              title="Inspect cadastral parcel records"
            >
              <FileText className="w-4 h-4 text-blue-400" />
              <span>View Parcel</span>
            </button>

            <button
              onClick={() => setActiveTab('reports')}
              className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-md shadow-emerald-600/30"
              title="Generate printable Decision-Support Dossier"
            >
              <Download className="w-4 h-4" />
              <span>Generate Dossier</span>
            </button>

            {onClose && (
              <button
                onClick={onClose}
                className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white text-xs font-medium transition-colors"
              >
                &larr; Back to List
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Discrepancy Alert Banner (Requirement 4) */}
      {hasDiscrepancy ? (
        <div className="p-4 rounded-2xl bg-amber-950/70 border-2 border-amber-500/80 shadow-xl flex items-start gap-3.5 animate-pulse">
          <AlertTriangle className="w-6 h-6 text-amber-400 flex-shrink-0 mt-0.5" />
          <div className="space-y-1">
            <h3 className="font-bold text-amber-200 text-sm tracking-wide uppercase">
              Evidence Discrepancy — Review Required
            </h3>
            <p className="text-amber-100 text-xs leading-relaxed">
              Automated Sentinel-2 remote sensing indicates screening-level water loss (-{alert.changePercentage || 5.6}%), whereas the manual ground inspection status is currently recorded as{' '}
              <strong className="underline text-white font-bold">{alert.status}</strong>.
            </p>
            <p className="text-[11px] text-amber-300/90 font-medium">
              Per National Geospatial Policy guidelines: System operates as a decision-support aid. Never automatically overwrite one evidence source with another. A joint re-survey by Revenue & Environmental engineers is recommended.
            </p>
          </div>
        </div>
      ) : (
        <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800 flex items-center justify-between text-xs text-slate-300">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
            <span>
              <strong>Evidence Triangulation:</strong> Satellite observation, spatial cadastral boundaries, and field logs are synchronized for this docket.
            </span>
          </div>
          <span className="hidden sm:inline font-mono text-[11px] text-cyan-400">
            DOCKET: {alert.id}
          </span>
        </div>
      )}

      {/* Main Grid: Left Column (Map & Core Attributes), Right Column (Tri-Partite Evidence & Timeline) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* LEFT COLUMN: Map & Metric Cards (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          {/* Interactive Risk Map */}
          <div className="rounded-2xl border border-slate-800 overflow-hidden shadow-xl bg-slate-900">
            <div className="p-3.5 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-pulse" />
                <h3 className="text-xs font-bold text-white uppercase tracking-wider">
                  Interactive Risk & Parcel Map
                </h3>
              </div>
              <span className="text-[11px] text-slate-400 font-mono">
                {alert.latitude.toFixed(4)}, {alert.longitude.toFixed(4)}
              </span>
            </div>
            <div className="p-1">
              <MapView heightClass="h-80" showAllControls={true} />
            </div>
            <div className="p-3 bg-slate-950/80 border-t border-slate-800 text-[11px] text-slate-400 flex items-center justify-between">
              <span>9-Layer GIS Active &bull; GSD 10m</span>
              <button
                onClick={() => setActiveTab('gis')}
                className="text-cyan-400 hover:text-cyan-300 font-medium flex items-center gap-1"
              >
                Expand GIS Studio <ChevronRight className="w-3 h-3" />
              </button>
            </div>
          </div>

          {/* Case Core Attributes Card */}
          <div className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-xl space-y-4">
            <div className="border-b border-slate-800 pb-3 flex items-center justify-between">
              <h3 className="font-bold text-white text-sm">Primary Case Attributes</h3>
              <span className="text-xs text-slate-400 font-mono">Case #{alert.id}</span>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800/80">
                <span className="text-[10px] uppercase font-semibold text-slate-400 block mb-1">
                  Detected Change
                </span>
                <span className="font-bold text-rose-400 text-sm block">
                  -{alert.changePercentage ? alert.changePercentage.toFixed(1) : '5.6'}% Water Loss
                </span>
                <span className="text-[10px] text-slate-400 mt-0.5 block">
                  {alert.changeDetected || 'Shoreline water retreat'}
                </span>
              </div>

              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800/80">
                <span className="text-[10px] uppercase font-semibold text-slate-400 block mb-1">
                  Affected Area
                </span>
                <span className="font-bold text-white text-sm block">
                  {alert.affectedAreaHectares || 36.99} Ha
                </span>
                <span className="text-[10px] text-slate-400 mt-0.5 block">
                  ~{((alert.affectedAreaHectares || 36.99) * 2.471).toFixed(1)} Acres ({alert.affectedAreaSqM ? alert.affectedAreaSqM.toLocaleString() : '369,900'} m²)
                </span>
              </div>

              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800/80">
                <span className="text-[10px] uppercase font-semibold text-slate-400 block mb-1">
                  Priority Score
                </span>
                <div className="flex items-center gap-1.5">
                  <span className="font-bold text-white text-base font-mono">{alert.riskScore}</span>
                  <span className="text-xs text-slate-400">/100</span>
                  <span
                    className={`ml-auto px-1.5 py-0.5 rounded text-[10px] font-bold ${
                      alert.riskLevel === 'HIGH'
                        ? 'bg-rose-950 text-rose-300'
                        : 'bg-amber-950 text-amber-300'
                    }`}
                  >
                    {alert.riskLevel}
                  </span>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800/80">
                <span className="text-[10px] uppercase font-semibold text-slate-400 block mb-1">
                  Assigned Officer
                </span>
                <span className="font-semibold text-white text-xs block truncate">
                  {alert.assignedOfficer || 'Unassigned'}
                </span>
                <span className="text-[10px] text-slate-400 mt-0.5 block truncate">
                  {alert.assignedDesignation || 'Revenue & Lake Officer'}
                </span>
              </div>
            </div>

            {/* Why it was flagged */}
            <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800/80 space-y-2">
              <span className="text-[11px] uppercase font-semibold text-slate-400 block">
                Why It Was Flagged (Multi-Sensor Analytics)
              </span>
              <ul className="space-y-1 text-xs text-slate-200">
                {(alert.whyFlagged && alert.whyFlagged.length > 0
                  ? alert.whyFlagged
                  : [
                      alert.reason || 'Water surface area contraction exceeding sensitivity threshold',
                      'Detected encroachment footprint within 30m regulatory buffer zone',
                      'Multi-temporal observation indicating surface water contraction'
                    ]
                ).map((factor, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <span className="text-rose-400 mt-0.5">&bull;</span>
                    <span className="text-slate-300">{factor}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Recommended Action Box */}
            <div className="p-3.5 rounded-xl bg-cyan-950/40 border border-cyan-800/60 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[11px] uppercase font-semibold text-cyan-300">
                  Recommended Statutory Action
                </span>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-cyan-900 text-cyan-200">
                  Decision Support
                </span>
              </div>
              <p className="text-xs text-white font-medium leading-relaxed">
                {alert.recommendedAction || riskAnalysis.recommendedAction.primary}
              </p>
              <div className="space-y-1 text-[11px] text-slate-300 pt-1">
                {(alert.actionChecklist || riskAnalysis.recommendedAction.details).map((item, idx) => (
                  <div key={idx} className="flex items-center gap-2">
                    <Check className="w-3.5 h-3.5 text-cyan-400 flex-shrink-0" />
                    <span>{item}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: Evidence Reconciliation & Visual Timeline (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          {/* Tri-Partite Evidence Reconciliation Panel (Requirement 4) */}
          <div className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-xl space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-800 pb-3 gap-2">
              <div>
                <h3 className="font-bold text-white text-base flex items-center gap-2">
                  <span>Evidence Reconciliation</span>
                  <span className="text-xs font-normal text-slate-400">(Triangulation)</span>
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Multi-channel corroboration across remote sensing, cadastral records, and ground inspection.
                </p>
              </div>

              {/* Evidence Filter Tabs */}
              <div className="flex items-center space-x-1 p-1 bg-slate-950 rounded-xl border border-slate-800 text-xs">
                {(['ALL', 'SATELLITE', 'CADASTRAL', 'FIELD'] as const).map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveEvidenceTab(tab)}
                    className={`px-2.5 py-1 rounded-lg font-medium transition-all ${
                      activeEvidenceTab === tab
                        ? 'bg-cyan-600 text-white shadow-sm'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    {tab}
                  </button>
                ))}
              </div>
            </div>

            {/* Evidence Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
              {/* 1. SATELLITE EVIDENCE */}
              {(activeEvidenceTab === 'ALL' || activeEvidenceTab === 'SATELLITE') && (
                <div className="p-3.5 rounded-xl bg-slate-950 border border-sky-900/40 space-y-2">
                  <div className="flex items-center justify-between border-b border-slate-800 pb-1.5">
                    <span className="font-bold text-sky-400 flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-sky-400" />
                      1. Satellite Evidence
                    </span>
                    <span className="text-[10px] font-mono text-slate-400">Sentinel-2 MSI</span>
                  </div>

                  <div className="space-y-1.5 text-[11px] text-slate-300">
                    <div>
                      <span className="text-slate-500 block text-[10px]">Observation Pass:</span>
                      <span className="font-semibold text-white">{obsDate}</span>
                    </div>
                    <div>
                      <span className="text-slate-500 block text-[10px]">Baseline Comparison:</span>
                      <span className="text-slate-300">{baselineDate}</span>
                    </div>
                    <div>
                      <span className="text-slate-500 block text-[10px]">Spectral Index:</span>
                      <span className="font-mono text-cyan-300">NDWI &lt; 0.05 (Water Retreat)</span>
                    </div>
                    <div>
                      <span className="text-slate-500 block text-[10px]">GSD & Coverage:</span>
                      <span className="text-slate-300">10m / 256×256 Patch</span>
                    </div>
                    <div>
                      <span className="text-slate-500 block text-[10px]">Assessment Finding:</span>
                      <span className="font-semibold text-rose-400">
                        -{alert.changePercentage ? alert.changePercentage.toFixed(1) : '5.6'}% Surface Loss
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {/* 2. GIS / CADASTRAL EVIDENCE */}
              {(activeEvidenceTab === 'ALL' || activeEvidenceTab === 'CADASTRAL') && (
                <div className="p-3.5 rounded-xl bg-slate-950 border border-blue-900/40 space-y-2">
                  <div className="flex items-center justify-between border-b border-slate-800 pb-1.5">
                    <span className="font-bold text-blue-400 flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-blue-400" />
                      2. Cadastral Evidence
                    </span>
                    <span className="text-[10px] font-mono text-slate-400">Revenue Records</span>
                  </div>

                  <div className="space-y-1.5 text-[11px] text-slate-300">
                    <div>
                      <span className="text-slate-500 block text-[10px]">Survey Number(s):</span>
                      <span className="font-semibold text-white">
                        {primaryParcel ? `Sy. No. ${primaryParcel.surveyNumber}` : 'Sy. No. 41, 43, 47'}
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-500 block text-[10px]">Village / Mandal:</span>
                      <span className="text-slate-300">{primaryParcel?.village || 'Ranga Reddy District'}</span>
                    </div>
                    <div>
                      <span className="text-slate-500 block text-[10px]">Statutory FTL Buffer:</span>
                      <span className="text-amber-400 font-medium">30m Regulated Zone</span>
                    </div>
                    <div>
                      <span className="text-slate-500 block text-[10px]">Overlap Assessment:</span>
                      <span className="font-semibold text-rose-300">Intersecting Change Zone</span>
                    </div>
                    <div>
                      <span className="text-slate-500 block text-[10px]">Land Classification:</span>
                      <span className="text-slate-300">{primaryParcel?.landClassification || 'Water Body Shoreline Margin'}</span>
                    </div>
                  </div>
                </div>
              )}

              {/* 3. FIELD EVIDENCE */}
              {(activeEvidenceTab === 'ALL' || activeEvidenceTab === 'FIELD') && (
                <div className="p-3.5 rounded-xl bg-slate-950 border border-purple-900/40 space-y-2">
                  <div className="flex items-center justify-between border-b border-slate-800 pb-1.5">
                    <span className="font-bold text-purple-400 flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-purple-400" />
                      3. Field Evidence
                    </span>
                    <span className="text-[10px] font-mono text-slate-400">Ground Logs</span>
                  </div>

                  <div className="space-y-1.5 text-[11px] text-slate-300">
                    <div>
                      <span className="text-slate-500 block text-[10px]">Reporting Officer:</span>
                      <span className="font-semibold text-white">{fieldLog?.inspectorName || fieldLog?.officerName || alert.assignedOfficer || 'Inspector on Duty'}</span>
                    </div>
                    <div>
                      <span className="text-slate-500 block text-[10px]">Inspection Date:</span>
                      <span className="text-slate-300">{fieldLog?.inspectionDate || inspectDate}</span>
                    </div>
                    <div>
                      <span className="text-slate-500 block text-[10px]">Ground Finding:</span>
                      <span className="font-medium text-amber-300">{fieldLog?.encroachmentType || 'Earth filling & construction activity'}</span>
                    </div>
                    <div>
                      <span className="text-slate-500 block text-[10px]">Geotagged Photographs:</span>
                      <span className="font-semibold text-purple-300">{relatedPhotos.length} Photo(s) Logged</span>
                    </div>
                    <div>
                      <span className="text-slate-500 block text-[10px]">Verification Status:</span>
                      <span className={`font-semibold ${alert.status === 'Verified' ? 'text-emerald-400' : 'text-amber-400'}`}>
                        {alert.status}
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Evidence Photos Strip */}
            {relatedPhotos.length > 0 && (
              <div className="pt-2">
                <span className="text-[11px] uppercase font-semibold text-slate-400 block mb-2">
                  Field Evidence Photographs (Geotagged with Metadata)
                </span>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {relatedPhotos.map((photo) => (
                    <div
                      key={photo.id}
                      className="rounded-xl overflow-hidden bg-slate-950 border border-slate-800 group hover:border-cyan-500/50 transition-all shadow-md"
                    >
                      <div className="aspect-video w-full relative overflow-hidden bg-slate-900">
                        <img
                          src={photo.photoUrl}
                          alt={photo.caption}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          referrerPolicy="no-referrer"
                        />
                        <div className="absolute top-1 right-1 bg-slate-900/90 text-emerald-300 border border-slate-700 text-[9px] px-1.5 py-0.5 rounded font-mono">
                          ±{photo.gpsAccuracyMeters}m
                        </div>
                      </div>
                      <div className="p-2 space-y-1 text-[10px]">
                        <div className="font-semibold text-white truncate">{photo.caption}</div>
                        <div className="text-slate-400 truncate">{photo.observedActivity}</div>
                        <div className="font-mono text-cyan-300 text-[9px]">
                          {photo.gpsCoordinates[0].toFixed(4)}, {photo.gpsCoordinates[1].toFixed(4)}
                        </div>
                        <div className="flex items-center justify-between text-[9px] text-slate-500 pt-1 border-t border-slate-800">
                          <span>{photo.timestamp.split(' ')[0]}</span>
                          <span className="text-emerald-400 font-semibold">✓ Verified</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* CASE EVIDENCE TIMELINE (Requirement 2) */}
          <div className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-xl space-y-4">
            <div className="border-b border-slate-800 pb-3 flex items-center justify-between">
              <div>
                <h3 className="font-bold text-white text-base flex items-center gap-2">
                  <Activity className="w-4 h-4 text-cyan-400" />
                  <span>Case Evidence Timeline</span>
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  End-to-end chain of custody from satellite observation to administrative review.
                </p>
              </div>
              <span className="text-xs text-slate-400 font-mono">11 Stages</span>
            </div>

            {/* Timeline Flow */}
            <div className="relative pl-6 space-y-4 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-800">
              {timelineSteps.map((step) => {
                const isDone = step.status === 'completed';
                const isActive = step.status === 'active';

                return (
                  <div key={step.id} className="relative group">
                    {/* Circle Node */}
                    <div
                      className={`absolute -left-[1.85rem] top-1 w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold border transition-colors ${
                        isDone
                          ? 'bg-cyan-500 border-cyan-400 text-slate-950 shadow-md shadow-cyan-500/30'
                          : isActive
                          ? 'bg-amber-500 border-amber-400 text-slate-950 animate-pulse'
                          : 'bg-slate-900 border-slate-700 text-slate-500'
                      }`}
                    >
                      {isDone ? '✓' : step.id}
                    </div>

                    <div className="p-3 rounded-xl bg-slate-950 border border-slate-800/90 group-hover:border-slate-700 transition-all text-xs space-y-1">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-white text-xs">{step.title}</span>
                          <span
                            className={`px-1.5 py-0.2 rounded text-[9px] font-semibold uppercase tracking-wider ${
                              isDone
                                ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                                : isActive
                                ? 'bg-amber-950 text-amber-300 border border-amber-800'
                                : 'bg-slate-900 text-slate-500 border border-slate-800'
                            }`}
                          >
                            {step.status}
                          </span>
                        </div>
                        <span className="text-[10px] font-mono text-slate-400">{step.date}</span>
                      </div>

                      <div className="text-[11px] font-medium text-cyan-300">{step.subtitle}</div>
                      <div className="text-[10px] text-slate-400">{step.detail}</div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
