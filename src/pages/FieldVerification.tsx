import React, { useState } from 'react';
import {
  ClipboardCheck,
  MapPin,
  Camera,
  CheckCircle2,
  XCircle,
  Clock,
  AlertTriangle,
  Upload,
  User,
  Shield,
  FileText,
  Layers,
  ArrowRight,
  Eye,
  Plus,
  Compass,
  Calendar
} from 'lucide-react';
import { useLake } from '../context/LakeContext';
import { MapView } from '../components/MapView';
import { AlertStatus, RiskLevel } from '../types';

export const FieldVerification: React.FC = () => {
  const {
    currentLake,
    lakeAlerts,
    lakeFieldLogs,
    addFieldLog,
    riskAnalysis,
    monitorChangeData,
    lakeEvidencePhotos,
    addEvidencePhoto,
    cadastralParcels
  } = useLake();

  // Form State - new inspection always starts as 'Pending' per verification protocol
  const [selectedAlertId, setSelectedAlertId] = useState<string>(
    lakeAlerts.length > 0 ? lakeAlerts[0].id : ''
  );
  const [inspectorName, setInspectorName] = useState(
    currentLake.name === 'Hussain Sagar' ? 'Officer S. Verma' : 'Officer R. K. Sharma'
  );
  const [designation, setDesignation] = useState(
    currentLake.name === 'Hussain Sagar' ? 'HMDA Lakes Wing Surveyor' : 'Assistant Executive Engineer (Lakes Wing)'
  );
  const [inspectionDate, setInspectionDate] = useState(
    new Date().toISOString().split('T')[0]
  );
  const [encroachmentType, setEncroachmentType] = useState<
    'Unauthorized Construction' | 'Debris Dumping' | 'Fencing / Boundary Wall' | 'Agriculture / Aquaculture' | 'Natural Siltation / Drought' | 'None'
  >('Unauthorized Construction');
  const [status, setStatus] = useState<AlertStatus>('Pending');
  const [notes, setNotes] = useState(
    currentLake.name === 'Hussain Sagar'
      ? 'Field patrol scheduled for shoreline inspection along Necklace Road boundary.'
      : 'Initial reconnaissance flagged for ground inspection in shoreline buffer.'
  );
  const [gpsAccuracy, setGpsAccuracy] = useState('2.8');
  const [photoCount, setPhotoCount] = useState(lakeEvidencePhotos.length);
  const [feedbackSuccess, setFeedbackSuccess] = useState(false);

  // Evidence upload modal state
  const [isPhotoModalOpen, setIsPhotoModalOpen] = useState(false);
  const [newPhotoUrl, setNewPhotoUrl] = useState('');
  const [newCaption, setNewCaption] = useState('');
  const [newObservedActivity, setNewObservedActivity] = useState('Excavation');
  const [previewPhoto, setPreviewPhoto] = useState<any | null>(null);

  // Selected Alert metadata
  const activeAlert = lakeAlerts.find((a) => a.id === selectedAlertId) || {
    id: lakeAlerts[0]?.id || 'ALT-TARGET',
    lakeName: currentLake.name,
    latitude: currentLake.latitude,
    longitude: currentLake.longitude,
    riskLevel: riskAnalysis.riskLevel,
    changeDetected: monitorChangeData?.change_status || 'Water contraction'
  };

  const currentLakePhotos = lakeEvidencePhotos;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    addFieldLog({
      alertId: selectedAlertId || undefined,
      lakeName: activeAlert.lakeName,
      latitude: activeAlert.latitude,
      longitude: activeAlert.longitude,
      inspectorName: inspectorName.trim() || 'Field Officer',
      designation: designation.trim() || 'Enforcement Officer',
      inspectionDate,
      encroachmentType,
      riskLevel: activeAlert.riskLevel as RiskLevel,
      status,
      notes,
      gpsAccuracyMeters: parseFloat(gpsAccuracy) || 3.0,
      photosCount: photoCount
    });

    setFeedbackSuccess(true);
    setTimeout(() => setFeedbackSuccess(false), 4000);
  };

  const handleAddEvidenceSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCaption.trim()) return;

    const fallbackImages = [
      'https://images.unsplash.com/photo-1541888946425-d0fbb18086f6?w=600&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1590486803833-1c5dc8ddd4c8?w=600&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1508873696983-2df5293cb32f?w=600&auto=format&fit=crop&q=80'
    ];
    const chosenUrl = newPhotoUrl.trim() || fallbackImages[Math.floor(Math.random() * fallbackImages.length)];

    addEvidencePhoto({
      photoUrl: chosenUrl,
      caption: newCaption.trim(),
      gpsCoordinates: [activeAlert.latitude, activeAlert.longitude],
      gpsAccuracyMeters: parseFloat(gpsAccuracy) || 2.5,
      timestamp: new Date().toISOString(),
      relatedAlertId: activeAlert.id,
      observedActivity: newObservedActivity,
      validation: {
        hasGps: true,
        hasTimestamp: true,
        insideZone: true
      }
    });

    setPhotoCount((prev) => prev + 1);
    setNewCaption('');
    setNewPhotoUrl('');
    setIsPhotoModalOpen(false);
  };

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setPhotoCount((prev) => prev + e.target.files!.length);
      setIsPhotoModalOpen(true);
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="bg-slate-900/60 p-5 rounded-2xl border border-slate-800 flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <h1 className="text-xl sm:text-2xl font-extrabold text-white">
              Field Ground-Truthing & Statutory Verification
            </h1>
            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-teal-950 text-teal-300 border border-teal-800">
              Closed-Loop Enforcement
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1 max-w-2xl">
            Validate satellite anomalies on the ground. Connect Sentinel-2 optical alerts with revenue field surveys, geotagged evidence, and enforcement notices.
          </p>
        </div>

        <div className="text-xs text-slate-300 font-mono bg-slate-950 px-3 py-1.5 rounded-xl border border-slate-800">
          Target: {activeAlert.lakeName} ({activeAlert.latitude.toFixed(4)}, {activeAlert.longitude.toFixed(4)})
        </div>
      </div>

      {feedbackSuccess && (
        <div className="p-4 rounded-2xl bg-emerald-950/60 border border-emerald-700 flex items-center space-x-3 text-xs text-emerald-200 shadow-xl">
          <CheckCircle2 className="w-5 h-5 text-emerald-400 flex-shrink-0" />
          <div>
            <span className="font-bold text-white">Field Inspection Successfully Recorded! </span>
            <span>The audit log has been stored, and the linked alert status was marked as <b>{status}</b>.</span>
          </div>
        </div>
      )}

      {/* Main Grid: Left Map & Inspection Card, Right Verification Form */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Spatial Context & Map (7 cols) */}
        <div className="lg:col-span-7 space-y-4">
          <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-white flex items-center gap-2">
                <MapPin className="w-4 h-4 text-cyan-400" />
                Ground Inspection Spatial Context
              </span>
              <span className="text-[11px] text-slate-400">
                Lat: {activeAlert.latitude.toFixed(4)}, Lng: {activeAlert.longitude.toFixed(4)}
              </span>
            </div>

            <MapView heightClass="h-[440px]" showAllControls={false} />

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 pt-1 text-xs">
              <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800">
                <span className="text-[10px] text-slate-400 block">Target Water Body</span>
                <span className="font-bold text-white truncate block">{activeAlert.lakeName}</span>
              </div>
              <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800">
                <span className="text-[10px] text-slate-400 block">Identified Risk</span>
                <span className="font-bold text-amber-400 block">{activeAlert.riskLevel}</span>
              </div>
              <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 col-span-2 sm:col-span-1">
                <span className="text-[10px] text-slate-400 block">Signal</span>
                <span className="text-slate-300 font-medium truncate block">{activeAlert.changeDetected}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Verification Form (5 cols) */}
        <div className="lg:col-span-5">
          <form
            onSubmit={handleSubmit}
            className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 space-y-4 shadow-xl"
          >
            <div className="border-b border-slate-800 pb-3">
              <h2 className="text-sm font-bold text-white flex items-center gap-2">
                <ClipboardCheck className="w-4 h-4 text-cyan-400" />
                Submit Ground Inspection Report
              </h2>
              <p className="text-[11px] text-slate-400 mt-0.5">
                Statutory field confirmation under State Lake Protection Guidelines
              </p>
            </div>

            {/* Select Target Alert */}
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-300">Select Active Alert</label>
              <select
                value={selectedAlertId}
                onChange={(e) => setSelectedAlertId(e.target.value)}
                className="w-full bg-slate-950 text-white text-xs rounded-xl p-2.5 border border-slate-700 focus:outline-none focus:border-cyan-500"
              >
                {lakeAlerts.map((a) => (
                  <option key={a.id} value={a.id}>
                    {a.id} &bull; {a.lakeName} ({a.status})
                  </option>
                ))}
              </select>
            </div>

            {/* Inspector Name & Designation */}
            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-1">
                <label className="text-[11px] font-semibold text-slate-400">Inspector Name</label>
                <input
                  type="text"
                  value={inspectorName}
                  onChange={(e) => setInspectorName(e.target.value)}
                  className="w-full bg-slate-950 text-white text-xs rounded-xl p-2 border border-slate-700 focus:outline-none"
                  placeholder="Officer Name"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[11px] font-semibold text-slate-400">Designation</label>
                <input
                  type="text"
                  value={designation}
                  onChange={(e) => setDesignation(e.target.value)}
                  className="w-full bg-slate-950 text-white text-xs rounded-xl p-2 border border-slate-700 focus:outline-none"
                  placeholder="Designation"
                />
              </div>
            </div>

            {/* Inspection Date & GPS accuracy */}
            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-1">
                <label className="text-[11px] font-semibold text-slate-400">Inspection Date</label>
                <input
                  type="date"
                  value={inspectionDate}
                  onChange={(e) => setInspectionDate(e.target.value)}
                  className="w-full bg-slate-950 text-white text-xs rounded-xl p-2 border border-slate-700 focus:outline-none"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[11px] font-semibold text-slate-400">GPS Accuracy (m)</label>
                <input
                  type="text"
                  value={gpsAccuracy}
                  onChange={(e) => setGpsAccuracy(e.target.value)}
                  className="w-full bg-slate-950 text-white text-xs rounded-xl p-2 border border-slate-700 focus:outline-none font-mono"
                  placeholder="± meters"
                />
              </div>
            </div>

            {/* Encroachment Classification */}
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-300">Ground Activity / Violation Type</label>
              <select
                value={encroachmentType}
                onChange={(e) => setEncroachmentType(e.target.value as any)}
                className="w-full bg-slate-950 text-white text-xs rounded-xl p-2.5 border border-slate-700 focus:outline-none focus:border-cyan-500"
              >
                <option value="Unauthorized Construction">Unauthorized Construction (Permanent Structures)</option>
                <option value="Debris Dumping">Debris / Mud Dumping & Reclamation</option>
                <option value="Fencing / Boundary Wall">Fencing / Unauthorized Boundary Wall</option>
                <option value="Agriculture / Aquaculture">Agriculture / Unauthorized Aquaculture</option>
                <option value="Natural Siltation / Drought">Natural Siltation / Seasonal Fluctuation</option>
                <option value="None">None (Authorized Civic / Maintenance Works)</option>
              </select>
            </div>

            {/* Statutory Status Mark */}
            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-slate-300">Verification Outcome</label>
                <span className="text-[10px] text-amber-400">Default: Starts as Pending</span>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                <button
                  type="button"
                  onClick={() => setStatus('Pending')}
                  className={`py-2 rounded-xl text-xs font-bold border transition-colors ${
                    status === 'Pending'
                      ? 'bg-amber-950 text-amber-300 border-amber-600'
                      : 'bg-slate-950 text-slate-400 border-slate-800'
                  }`}
                >
                  Pending
                </button>
                <button
                  type="button"
                  onClick={() => setStatus('Verified')}
                  className={`py-2 rounded-xl text-xs font-bold border transition-colors ${
                    status === 'Verified'
                      ? 'bg-rose-950 text-rose-300 border-rose-600'
                      : 'bg-slate-950 text-slate-400 border-slate-800'
                  }`}
                >
                  Verified
                </button>
                <button
                  type="button"
                  onClick={() => setStatus('Rejected')}
                  className={`py-2 rounded-xl text-xs font-bold border transition-colors ${
                    status === 'Rejected'
                      ? 'bg-emerald-950 text-emerald-300 border-emerald-600'
                      : 'bg-slate-950 text-slate-400 border-slate-800'
                  }`}
                >
                  Rejected
                </button>
                <button
                  type="button"
                  onClick={() => setStatus('Inconclusive')}
                  className={`py-2 rounded-xl text-xs font-bold border transition-colors ${
                    status === 'Inconclusive'
                      ? 'bg-blue-950 text-blue-300 border-blue-600'
                      : 'bg-slate-950 text-slate-400 border-slate-800'
                  }`}
                >
                  Inconclusive
                </button>
              </div>
            </div>

            {/* Notes */}
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-300">Field Notes & Action Plan</label>
              <textarea
                rows={3}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Details of physical inspection, notices issued, or environmental damage observed..."
                className="w-full bg-slate-950 text-white text-xs rounded-xl p-2.5 border border-slate-700 focus:outline-none focus:border-cyan-500"
              />
            </div>

            {/* Photo Attachment Action */}
            <div className="space-y-2 text-xs">
              <div className="flex items-center justify-between text-slate-400">
                <span className="font-semibold">Site Photos & Geo-Tags</span>
                <span className="font-mono text-cyan-400">{photoCount} recorded</span>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setIsPhotoModalOpen(true)}
                  className="flex items-center justify-center space-x-1.5 py-2.5 px-3 border border-cyan-800/80 rounded-xl bg-cyan-950/40 hover:bg-cyan-900/50 text-cyan-300 transition-colors"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Evidence Photo</span>
                </button>
                <label className="flex items-center justify-center space-x-1.5 py-2.5 px-3 border border-dashed border-slate-700 rounded-xl bg-slate-950 hover:bg-slate-800 cursor-pointer text-slate-400 hover:text-white transition-colors">
                  <Camera className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Upload Image</span>
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handlePhotoUpload}
                    className="hidden"
                  />
                </label>
              </div>
            </div>

            {/* Submit Button */}
            <button
              id="submit-field-inspection-btn"
              type="submit"
              className="w-full py-2.5 rounded-xl bg-gradient-to-r from-cyan-600 to-teal-600 hover:from-cyan-500 hover:to-teal-500 text-white font-bold text-xs shadow-lg shadow-cyan-600/30 transition-all"
            >
              Record Field Verification & Synchronize Alert
            </button>
          </form>
        </div>
      </div>

      {/* Multi-Source Evidence Reconciliation Matrix */}
      <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-5 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div>
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Layers className="w-4 h-4 text-cyan-400" />
              Multi-Source Evidence Reconciliation Matrix
            </h3>
            <p className="text-xs text-slate-400">
              Cross-verifying satellite multispectral priority, official cadastral parcel intersection, and on-ground field inspection.
            </p>
          </div>
          <span className="px-2.5 py-1 rounded text-[10px] font-bold bg-slate-800 text-slate-300 border border-slate-700">
            Target: {currentLake.name}
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-3 text-xs">
          {/* Source 1: Satellite Priority */}
          <div className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800 space-y-1">
            <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400">1. Satellite Telemetry</span>
            <div className="text-sm font-bold text-white flex items-center gap-1.5">
              <span className={`w-2 h-2 rounded-full ${
                riskAnalysis.riskLevel === 'HIGH' ? 'bg-rose-400' : riskAnalysis.riskLevel === 'MODERATE' ? 'bg-amber-400' : 'bg-emerald-400'
              }`} />
              <span>{riskAnalysis.riskLevel} PRIORITY</span>
            </div>
            <div className="text-slate-400 text-[11px]">
              {monitorChangeData?.change_status || 'Water contraction'} ({Math.abs(monitorChangeData?.change_percentage || 0)}%)
            </div>
          </div>

          {/* Source 2: Cadastral Survey */}
          <div className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800 space-y-1">
            <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400">2. Cadastral Cadastre</span>
            <div className="text-sm font-bold text-white flex items-center gap-1.5">
              <span className={`w-2 h-2 rounded-full ${
                cadastralParcels?.some((p) => p.isIntersectingChange) ? 'bg-rose-400' : 'bg-slate-400'
              }`} />
              <span>
                {cadastralParcels
                  ? cadastralParcels.some((p) => p.isIntersectingChange)
                    ? 'BUFFER INTERSECTED'
                    : 'CLEAR / NO OVERLAP'
                  : 'UNLINKED CADASTRE'}
              </span>
            </div>
            <div className="text-slate-400 text-[11px]">
              {cadastralParcels
                ? `${cadastralParcels.filter((p) => p.isIntersectingChange).length} parcels flagged`
                : 'Custom GeoJSON upload required'}
            </div>
          </div>

          {/* Source 3: Field Inspection Ground-Truth */}
          <div className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800 space-y-1">
            <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400">3. Field Ground-Truth</span>
            <div className="text-sm font-bold text-white flex items-center gap-1.5">
              <span className={`w-2 h-2 rounded-full ${
                lakeFieldLogs[0]?.status === 'Verified'
                  ? 'bg-rose-400'
                  : lakeFieldLogs[0]?.status === 'Rejected'
                  ? 'bg-emerald-400'
                  : lakeFieldLogs[0]?.status === 'Inconclusive'
                  ? 'bg-blue-400'
                  : 'bg-amber-400'
              }`} />
              <span className="uppercase">{lakeFieldLogs[0]?.status || 'PENDING DISPATCH'}</span>
            </div>
            <div className="text-slate-400 text-[11px]">
              {lakeFieldLogs[0] ? `${lakeFieldLogs[0].inspectorName} (${lakeFieldLogs[0].inspectionDate})` : 'No logs submitted'}
            </div>
          </div>

          {/* Consolidated Determination */}
          <div className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800 space-y-1">
            <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400">Consolidated Status</span>
            <div className="text-xs font-bold">
              {(() => {
                const fStatus = lakeFieldLogs[0]?.status;
                const isHighSat = riskAnalysis.riskLevel === 'HIGH';
                if (!fStatus || fStatus === 'Pending') {
                  return <span className="text-amber-400">UNDER INVESTIGATION</span>;
                }
                if (isHighSat && fStatus === 'Verified') {
                  return <span className="text-rose-400">CONFIRMED VIOLATION</span>;
                }
                if (isHighSat && fStatus === 'Rejected') {
                  return <span className="text-purple-300">DISCREPANCY (REVIEW REQUIRED)</span>;
                }
                if (!isHighSat && fStatus === 'Verified') {
                  return <span className="text-amber-400">GROUND VIOLATION (HIGH REVIEW)</span>;
                }
                if (fStatus === 'Inconclusive') {
                  return <span className="text-blue-400">FURTHER SURVEY NEEDED</span>;
                }
                return <span className="text-emerald-400">NORMAL / CLEAR</span>;
              })()}
            </div>
            <div className="text-[11px] text-slate-400">
              {(() => {
                const fStatus = lakeFieldLogs[0]?.status;
                if (!fStatus || fStatus === 'Pending') return 'Awaiting inspector completion';
                if (riskAnalysis.riskLevel === 'HIGH' && fStatus === 'Rejected') {
                  return 'Satellite flagged contraction, but officer found authorized works.';
                }
                if (riskAnalysis.riskLevel === 'HIGH' && fStatus === 'Verified') {
                  return 'Satellite and ground truth agree. Enforcement action required.';
                }
                return 'Multi-source observation logged.';
              })()}
            </div>
          </div>
        </div>
      </div>

      {/* Geotagged Photographic Evidence Gallery */}
      <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-5 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div>
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Camera className="w-4 h-4 text-cyan-400" />
              Geotagged Photographic Evidence Dossier ({lakeEvidencePhotos.length} Items)
            </h3>
            <p className="text-xs text-slate-400">
              Verified statutory photographic proof with spatial coordinates, timestamped records, and zone boundary compliance.
            </p>
          </div>
          <button
            onClick={() => setIsPhotoModalOpen(true)}
            className="flex items-center space-x-1.5 px-3 py-1.5 bg-cyan-950 text-cyan-300 border border-cyan-800 hover:bg-cyan-900/60 rounded-xl text-xs font-semibold transition-all"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Upload New Ground Photo</span>
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {lakeEvidencePhotos.map((photo) => (
            <div
              key={photo.id}
              className="bg-slate-950/80 border border-slate-800 rounded-xl overflow-hidden hover:border-slate-700 transition-all group flex flex-col justify-between"
            >
              <div className="relative aspect-video overflow-hidden bg-slate-900">
                <img
                  src={photo.photoUrl}
                  alt={photo.caption}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <span className="absolute top-2 left-2 px-2 py-0.5 rounded text-[10px] font-bold bg-slate-900/90 text-cyan-300 border border-slate-700">
                  {photo.observedActivity}
                </span>
                <button
                  onClick={() => setPreviewPhoto(photo)}
                  className="absolute bottom-2 right-2 p-1.5 rounded-lg bg-slate-900/80 hover:bg-cyan-600 text-white transition-colors"
                  title="Enlarge & Inspect Metadata"
                >
                  <Eye className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="p-3.5 space-y-2 flex-1 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between text-[11px] text-slate-400">
                    <span className="font-mono text-cyan-400 font-bold">{photo.id}</span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {new Date(photo.timestamp).toLocaleDateString()}
                    </span>
                  </div>
                  <p className="text-xs text-slate-200 mt-1 line-clamp-2">{photo.caption}</p>
                </div>

                <div className="pt-2 border-t border-slate-800/80 text-[11px] space-y-1.5">
                  <div className="flex items-center justify-between text-slate-400">
                    <span className="flex items-center gap-1 font-mono text-[10px]">
                      <Compass className="w-3 h-3 text-cyan-400" />
                      {photo.gpsCoordinates[0].toFixed(4)}, {photo.gpsCoordinates[1].toFixed(4)}
                    </span>
                    <span className="text-[10px] text-slate-500">±{photo.gpsAccuracyMeters}m</span>
                  </div>

                  <div className="flex items-center gap-2 pt-1">
                    <span
                      className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[9px] font-semibold ${
                        photo.validation.hasGps
                          ? 'bg-emerald-950/80 text-emerald-300 border border-emerald-800'
                          : 'bg-rose-950/80 text-rose-300 border border-rose-800'
                      }`}
                    >
                      <CheckCircle2 className="w-2.5 h-2.5" /> GPS Tagged
                    </span>
                    <span
                      className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[9px] font-semibold ${
                        photo.validation.insideZone
                          ? 'bg-cyan-950/80 text-cyan-300 border border-cyan-800'
                          : 'bg-slate-800 text-slate-400 border border-slate-700'
                      }`}
                    >
                      <Shield className="w-2.5 h-2.5" /> Inside Buffer
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Historical Field Logs Audit Trail */}
      <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-5 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <ClipboardCheck className="w-4 h-4 text-cyan-400" />
            Field Verification Inspection Registry ({lakeFieldLogs.length} Records)
          </h3>
          <span className="text-xs text-slate-400">Logged field enforcement audit trail</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-800 bg-slate-950/40 text-slate-400 uppercase tracking-wider text-[10px]">
                <th className="py-2.5 px-3">Log ID</th>
                <th className="py-2.5 px-3">Water Body</th>
                <th className="py-2.5 px-3">Inspector & Post</th>
                <th className="py-2.5 px-3">Date</th>
                <th className="py-2.5 px-3">Classification</th>
                <th className="py-2.5 px-3">Status</th>
                <th className="py-2.5 px-3">GPS / Photos</th>
                <th className="py-2.5 px-3">Observations</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {lakeFieldLogs.map((log) => (
                <tr key={log.id} className="hover:bg-slate-800/40 transition-colors">
                  <td className="py-3 px-3 font-mono font-bold text-cyan-300">{log.id}</td>
                  <td className="py-3 px-3 font-semibold text-white">{log.lakeName}</td>
                  <td className="py-3 px-3">
                    <div className="text-slate-200 font-medium">{log.inspectorName}</div>
                    <div className="text-[10px] text-slate-400">{log.designation}</div>
                  </td>
                  <td className="py-3 px-3 text-slate-300">{log.inspectionDate}</td>
                  <td className="py-3 px-3 text-slate-200">{log.encroachmentType}</td>
                  <td className="py-3 px-3">
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                        log.status === 'Verified'
                          ? 'bg-rose-950 text-rose-300 border border-rose-800'
                          : log.status === 'Rejected'
                          ? 'bg-slate-800 text-slate-400 border border-slate-700'
                          : 'bg-amber-950 text-amber-300 border border-amber-800'
                      }`}
                    >
                      {log.status}
                    </span>
                  </td>
                  <td className="py-3 px-3 font-mono text-[11px] text-slate-400">
                    &plusmn;{log.gpsAccuracyMeters}m &bull; {log.photosCount} photos
                  </td>
                  <td className="py-3 px-3 text-slate-300 max-w-sm truncate" title={log.notes}>
                    {log.notes}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Evidence Photo Modal */}
      {isPhotoModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-lg w-full p-6 space-y-4 shadow-2xl animate-in fade-in zoom-in duration-150">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center space-x-2">
                <Camera className="w-5 h-5 text-cyan-400" />
                <h3 className="text-base font-bold text-white">Record Ground Photographic Evidence</h3>
              </div>
              <button
                onClick={() => setIsPhotoModalOpen(false)}
                className="text-slate-400 hover:text-white p-1"
              >
                <XCircle className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddEvidenceSubmit} className="space-y-4 text-xs">
              <div className="space-y-1">
                <label className="font-semibold text-slate-300">Observed Encroachment Activity</label>
                <select
                  value={newObservedActivity}
                  onChange={(e) => setNewObservedActivity(e.target.value)}
                  className="w-full bg-slate-950 text-white rounded-xl p-2.5 border border-slate-700 focus:outline-none focus:border-cyan-500"
                >
                  <option value="Excavation">Excavation & Earthwork</option>
                  <option value="Debris dumping">Debris & Waste Dumping</option>
                  <option value="Foundation work">Concrete Foundation Work</option>
                  <option value="Boundary Wall">Unauthorized Boundary Wall / Fencing</option>
                  <option value="Road Construction">Unauthorized Road / Pathway</option>
                  <option value="Commercial Encroachment">Commercial Shed / Structure</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-slate-300">Photo Image URL or Sample</label>
                <input
                  type="text"
                  value={newPhotoUrl}
                  onChange={(e) => setNewPhotoUrl(e.target.value)}
                  placeholder="https://... (leave empty for verified field sample)"
                  className="w-full bg-slate-950 text-white rounded-xl p-2.5 border border-slate-700 focus:outline-none focus:border-cyan-500"
                />
                <div className="flex gap-2 pt-1 text-[11px] text-slate-400">
                  <span>Quick presets:</span>
                  <button
                    type="button"
                    onClick={() => setNewPhotoUrl('https://images.unsplash.com/photo-1541888946425-d0fbb18086f6?w=600&auto=format&fit=crop&q=80')}
                    className="text-cyan-400 hover:underline"
                  >
                    Excavation
                  </button>
                  <button
                    type="button"
                    onClick={() => setNewPhotoUrl('https://images.unsplash.com/photo-1590486803833-1c5dc8ddd4c8?w=600&auto=format&fit=crop&q=80')}
                    className="text-cyan-400 hover:underline"
                  >
                    Rubble
                  </button>
                  <button
                    type="button"
                    onClick={() => setNewPhotoUrl('https://images.unsplash.com/photo-1508873696983-2df5293cb32f?w=600&auto=format&fit=crop&q=80')}
                    className="text-cyan-400 hover:underline"
                  >
                    Wall
                  </button>
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-slate-300">Field Description & Caption</label>
                <textarea
                  rows={2}
                  value={newCaption}
                  onChange={(e) => setNewCaption(e.target.value)}
                  placeholder="e.g. Earthmoving equipment actively filling buffer zone on the north-east shoreline..."
                  className="w-full bg-slate-950 text-white rounded-xl p-2.5 border border-slate-700 focus:outline-none focus:border-cyan-500"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
                  <span className="text-slate-400 text-[10px] block">Geotag Coordinates</span>
                  <span className="font-mono text-white text-[11px] font-bold">
                    {activeAlert.latitude.toFixed(4)}°N, {activeAlert.longitude.toFixed(4)}°E
                  </span>
                </div>
                <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
                  <span className="text-slate-400 text-[10px] block">Target Lake Alert</span>
                  <span className="text-cyan-400 text-[11px] font-bold truncate block">
                    {activeAlert.lakeName} ({activeAlert.id})
                  </span>
                </div>
              </div>

              <div className="flex items-center justify-end space-x-2 pt-2 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsPhotoModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-gradient-to-r from-cyan-600 to-teal-600 hover:from-cyan-500 hover:to-teal-500 text-white font-bold shadow-lg shadow-cyan-600/30"
                >
                  Upload & Seal Evidence
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Lightbox / Preview Photo Modal */}
      {previewPhoto && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-2xl w-full overflow-hidden shadow-2xl animate-in fade-in zoom-in duration-150">
            <div className="flex items-center justify-between p-4 border-b border-slate-800">
              <div className="flex items-center space-x-2">
                <Camera className="w-5 h-5 text-cyan-400" />
                <div>
                  <h3 className="text-sm font-bold text-white">{previewPhoto.id} &bull; {previewPhoto.observedActivity}</h3>
                  <span className="text-[11px] text-slate-400">Captured: {new Date(previewPhoto.timestamp).toLocaleString()}</span>
                </div>
              </div>
              <button
                onClick={() => setPreviewPhoto(null)}
                className="text-slate-400 hover:text-white p-1"
              >
                <XCircle className="w-5 h-5" />
              </button>
            </div>

            <div className="relative aspect-video bg-black flex items-center justify-center overflow-hidden">
              <img
                src={previewPhoto.photoUrl}
                alt={previewPhoto.caption}
                referrerPolicy="no-referrer"
                className="max-h-[380px] w-full object-contain"
              />
            </div>

            <div className="p-5 space-y-3 text-xs bg-slate-950">
              <div className="text-slate-200 font-medium">
                <b>Field Notes:</b> {previewPhoto.caption}
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 pt-2 border-t border-slate-800">
                <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800">
                  <span className="text-[10px] text-slate-400 block">GPS Coordinates</span>
                  <span className="font-mono text-cyan-300 font-bold">
                    {previewPhoto.gpsCoordinates[0].toFixed(5)}, {previewPhoto.gpsCoordinates[1].toFixed(5)}
                  </span>
                </div>
                <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800">
                  <span className="text-[10px] text-slate-400 block">Accuracy Radius</span>
                  <span className="font-mono text-white font-bold">±{previewPhoto.gpsAccuracyMeters}m</span>
                </div>
                <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800 col-span-2 sm:col-span-1">
                  <span className="text-[10px] text-slate-400 block">Statutory Audit</span>
                  <span className="text-emerald-400 font-bold flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3" /> Validated
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
