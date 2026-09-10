import React, { useRef } from 'react';
import {
  FileText,
  Printer,
  Download,
  Share2,
  Shield,
  MapPin,
  Calendar,
  Layers,
  Droplets,
  TrendingUp,
  AlertTriangle,
  ClipboardCheck,
  CheckCircle2,
  ExternalLink,
  Info
} from 'lucide-react';
import { useLake } from '../context/LakeContext';

export const Reports: React.FC = () => {
  const {
    currentLake,
    monitorRealData,
    monitorChangeData,
    riskAnalysis,
    cadastralParcels,
    lakeFieldLogs,
    lakeAlerts
  } = useLake();

  const reportRef = useRef<HTMLDivElement>(null);

  const reportId = `AS-DOSSIER-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;
  const generatedDate = new Date().toLocaleString();

  // Metrics
  const waterPct = monitorRealData ? monitorRealData.detected_water_percentage : 18.86;
  const waterPixels = monitorRealData ? monitorRealData.water_pixels : 12357;
  const totalPixels = monitorRealData ? monitorRealData.total_pixels : 65536;
  const beforePct = monitorChangeData ? monitorChangeData.before_water_percentage : 24.50;
  const afterPct = monitorChangeData ? monitorChangeData.after_water_percentage : waterPct;
  const changePct = monitorChangeData ? monitorChangeData.change_percentage : (riskAnalysis.waterLossPercentage || 5.64);
  const changeStatus = monitorChangeData ? monitorChangeData.change_status : (riskAnalysis.isWaterLoss ? `Water loss detected (-${changePct}%)` : 'Water extent variation');
  const beforeDate = monitorChangeData ? monitorChangeData.before_date : '2026-08-10';
  const afterDate = monitorChangeData ? monitorChangeData.after_date : '2026-09-06';

  const affectedParcels = cadastralParcels?.filter((p) => p.isIntersectingChange) || [];
  const latestFieldLog = lakeFieldLogs.find((l) => l.lakeName === currentLake.name) || lakeFieldLogs[0] || null;

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadJson = () => {
    const reportData = {
      reportId,
      generatedDate,
      lake: currentLake,
      satellite: {
        platform: monitorRealData?.satellite || 'Sentinel-2',
        imageDate: monitorRealData?.image_date || '2026-09-06',
        method: monitorRealData?.method || 'NDWI (Green - NIR)',
        waterPercentage: waterPct,
        waterPixels,
        totalPixels
      },
      changeDetection: {
        beforeDate,
        afterDate,
        beforeWaterPercentage: beforePct,
        afterWaterPercentage: afterPct,
        changePercentage: changePct,
        status: changeStatus
      },
      riskAssessment: riskAnalysis,
      cadastral: {
        available: !!cadastralParcels,
        totalParcels: cadastralParcels?.length || 0,
        affectedParcels: affectedParcels.map((p) => ({
          surveyNumber: p.surveyNumber,
          village: p.village,
          areaAcres: p.areaAcres,
          classification: p.landClassification
        }))
      },
      fieldInspection: latestFieldLog
    };

    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(reportData, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `${currentLake.name.replace(/\s+/g, '_')}_AQUA_SHIELD_Report.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  return (
    <div className="space-y-6 pb-16">
      {/* Action Bar (Hidden on Print) */}
      <div className="no-print bg-slate-900/60 p-5 rounded-2xl border border-slate-800 flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <h1 className="text-xl sm:text-2xl font-extrabold text-white">
              Environmental Intelligence Dossier
            </h1>
            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-cyan-950 text-cyan-400 border border-cyan-800">
              Audit Ready
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1 max-w-2xl">
            Decision-support dossier reconciling Sentinel-2 NDWI spectral telemetry, bi-temporal differential change, cadastral survey parcel overlap, and ground field verification logs.
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <button
            id="print-report-btn"
            onClick={handlePrint}
            className="flex items-center space-x-2 bg-gradient-to-r from-cyan-600 to-teal-600 hover:from-cyan-500 hover:to-teal-500 text-white font-semibold text-xs px-4 py-2.5 rounded-xl shadow-md shadow-cyan-600/30 transition-all"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Print Dossier / Save PDF</span>
          </button>

          <button
            id="download-report-json-btn"
            onClick={handleDownloadJson}
            className="flex items-center space-x-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold px-3.5 py-2.5 rounded-xl border border-slate-700 transition-colors"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Download JSON</span>
          </button>
        </div>
      </div>

      {/* Printable Report Sheet */}
      <div
        ref={reportRef}
        className="report-sheet bg-slate-900/90 border border-slate-800 rounded-3xl p-6 sm:p-10 shadow-2xl max-w-5xl mx-auto space-y-8 print:bg-white print:text-slate-900 print:border-none print:shadow-none print:p-0"
      >
        {/* Report Header */}
        <div className="border-b-2 border-cyan-500/40 pb-6 flex flex-wrap items-start justify-between gap-4">
          <div className="flex items-center space-x-4">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-cyan-500 to-teal-600 flex items-center justify-center shadow-lg text-white">
              <Shield className="w-8 h-8" />
            </div>
            <div>
              <div className="text-xs uppercase font-extrabold tracking-widest text-cyan-400 print:text-cyan-700">
                LAKEHEALTH ENVIRONMENTAL DOSSIER
              </div>
              <h2 className="text-2xl font-black text-white print:text-slate-900">
                Lake Surveillance & Encroachment Assessment
              </h2>
              <div className="text-xs text-slate-400 print:text-slate-600 mt-0.5">
                European Space Agency Sentinel-2 &bull; OpenStreetMap GIS &bull; State Cadastre
              </div>
            </div>
          </div>

          <div className="text-right text-xs space-y-1">
            <div className="font-mono text-cyan-300 print:text-cyan-800 font-bold">{reportId}</div>
            <div className="text-slate-400 print:text-slate-600">Generated: {generatedDate}</div>
            <div className="inline-block px-2 py-0.5 rounded text-[10px] font-bold bg-cyan-950 print:bg-cyan-100 text-cyan-300 print:text-cyan-800 border border-cyan-800">
              Environmental Intelligence Dossier
            </div>
          </div>
        </div>

        {/* Section 1: Geographic Target Profile */}
        <div className="space-y-3">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 print:text-slate-600 flex items-center gap-1.5 border-b border-slate-800 print:border-slate-300 pb-1">
            <MapPin className="w-3.5 h-3.5 text-cyan-400" />
            1. Geographic Target Profile
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
            <div className="p-3 rounded-xl bg-slate-950/60 print:bg-slate-100 border border-slate-800 print:border-slate-300">
              <span className="text-slate-400 print:text-slate-500 block text-[10px]">Water Body</span>
              <span className="font-bold text-white print:text-slate-900 text-sm">{currentLake.name}</span>
            </div>
            <div className="p-3 rounded-xl bg-slate-950/60 print:bg-slate-100 border border-slate-800 print:border-slate-300">
              <span className="text-slate-400 print:text-slate-500 block text-[10px]">Coordinates</span>
              <span className="font-mono font-bold text-cyan-300 print:text-cyan-700">
                {currentLake.latitude.toFixed(4)}°N, {currentLake.longitude.toFixed(4)}°E
              </span>
            </div>
            <div className="p-3 rounded-xl bg-slate-950/60 print:bg-slate-100 border border-slate-800 print:border-slate-300">
              <span className="text-slate-400 print:text-slate-500 block text-[10px]">Jurisdiction</span>
              <span className="font-semibold text-slate-200 print:text-slate-800">
                {currentLake.district || 'Custom'}, {currentLake.state || 'India'}
              </span>
            </div>
            <div className="p-3 rounded-xl bg-slate-950/60 print:bg-slate-100 border border-slate-800 print:border-slate-300">
              <span className="text-slate-400 print:text-slate-500 block text-[10px]">Analysis Bounding Box</span>
              <span className="font-semibold text-slate-200 print:text-slate-800">
                256 × 256 px (~2.56 km × 2.56 km)
              </span>
            </div>
          </div>
        </div>

        {/* Section 2: Sentinel-2 NDWI Spectral Observation */}
        <div className="space-y-3">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 print:text-slate-600 flex items-center gap-1.5 border-b border-slate-800 print:border-slate-300 pb-1">
            <Droplets className="w-3.5 h-3.5 text-cyan-400" />
            2. Satellite Telemetry & Water Detection
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
            <div className="p-3 rounded-xl bg-slate-950/60 print:bg-slate-100 border border-slate-800 print:border-slate-300">
              <span className="text-slate-400 print:text-slate-500 block text-[10px]">Constellation</span>
              <span className="font-bold text-white print:text-slate-900">{monitorRealData?.satellite || 'Sentinel-2 L2A'}</span>
            </div>
            <div className="p-3 rounded-xl bg-slate-950/60 print:bg-slate-100 border border-slate-800 print:border-slate-300">
              <span className="text-slate-400 print:text-slate-500 block text-[10px]">Acquisition Date</span>
              <span className="font-bold text-white print:text-slate-900">{monitorRealData?.image_date || '2026-09-06'}</span>
            </div>
            <div className="p-3 rounded-xl bg-slate-950/60 print:bg-slate-100 border border-slate-800 print:border-slate-300">
              <span className="text-slate-400 print:text-slate-500 block text-[10px]">Water Pixels</span>
              <span className="font-bold text-sky-400 print:text-sky-700">
                {waterPixels.toLocaleString()} / {totalPixels.toLocaleString()}
              </span>
            </div>
            <div className="p-3 rounded-xl bg-slate-950/60 print:bg-slate-100 border border-slate-800 print:border-slate-300">
              <span className="text-slate-400 print:text-slate-500 block text-[10px]">Water Extent in Patch</span>
              <span className="text-lg font-extrabold text-cyan-300 print:text-cyan-700">{waterPct}%</span>
            </div>
          </div>
          <div className="p-2.5 rounded-lg bg-cyan-950/30 print:bg-cyan-50 border border-cyan-800/50 print:border-cyan-200 text-[11px] text-cyan-300 print:text-cyan-900">
            <b>Disclaimer Notice:</b> The above percentage strictly describes the analyzed 256×256 satellite patch around the given coordinates, not the entirety of the water body.
          </div>
        </div>

        {/* Section 3: Bi-Temporal Change Detection */}
        <div className="space-y-3">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 print:text-slate-600 flex items-center gap-1.5 border-b border-slate-800 print:border-slate-300 pb-1">
            <TrendingUp className="w-3.5 h-3.5 text-cyan-400" />
            3. Bi-Temporal Differential Matrix Analysis
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
            <div className="p-3 rounded-xl bg-slate-950/60 print:bg-slate-100 border border-slate-800 print:border-slate-300">
              <span className="text-slate-400 print:text-slate-500 block text-[10px]">Baseline ({beforeDate})</span>
              <span className="text-base font-bold text-white print:text-slate-900">{beforePct}%</span>
              <span className="text-[10px] text-slate-400 print:text-slate-500 block">Initial water surface</span>
            </div>
            <div className="p-3 rounded-xl bg-slate-950/60 print:bg-slate-100 border border-slate-800 print:border-slate-300">
              <span className="text-slate-400 print:text-slate-500 block text-[10px]">Observed ({afterDate})</span>
              <span className="text-base font-bold text-cyan-300 print:text-cyan-700">{afterPct}%</span>
              <span className="text-[10px] text-slate-400 print:text-slate-500 block">Subsequent pass</span>
            </div>
            <div className="p-3 rounded-xl bg-slate-950/60 print:bg-slate-100 border border-slate-800 print:border-slate-300">
              <span className="text-slate-400 print:text-slate-500 block text-[10px]">Net Differential Shift</span>
              <span className="text-base font-bold text-white print:text-slate-900">{changePct}%</span>
              <span className="text-[10px] text-slate-400 print:text-slate-500 block">Classification: {changeStatus}</span>
            </div>
          </div>
        </div>

        {/* Section 4: Risk Scoring & Encroachment Assessment */}
        <div className="space-y-3">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 print:text-slate-600 flex items-center gap-1.5 border-b border-slate-800 print:border-slate-300 pb-1">
            <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
            4. Risk Scoring & Potential Encroachment Indices
          </h3>
          <div className="p-4 rounded-xl bg-slate-950/60 print:bg-slate-100 border border-slate-800 print:border-slate-300 space-y-2 text-xs">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-slate-300 print:text-slate-700">Calculated Vulnerability Index:</span>
              <span className="text-sm font-extrabold text-amber-400 print:text-amber-800">
                {riskAnalysis.riskScore}/100 &bull; {riskAnalysis.riskLevel} RISK
              </span>
            </div>
            <div className="text-slate-400 print:text-slate-600">
              <b>Identified Factors:</b> {riskAnalysis.riskFactors.join(' | ')}
            </div>
            <div className="text-[11px] text-slate-500 print:text-slate-600 italic">
              {riskAnalysis.disclaimer}
            </div>
          </div>
        </div>

        {/* Section 5: Cadastral Survey Findings */}
        <div className="space-y-3">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 print:text-slate-600 flex items-center gap-1.5 border-b border-slate-800 print:border-slate-300 pb-1">
            <Layers className="w-3.5 h-3.5 text-cyan-400" />
            5. Cadastral Survey & Revenue Department Findings
          </h3>
          {cadastralParcels ? (
            <div className="space-y-2 text-xs">
              <div className="text-slate-300 print:text-slate-800">
                Total Revenue Parcels in Analysis Area: <b>{cadastralParcels.length}</b> | Parcels Intersecting Detected Change: <b className="text-amber-400 print:text-amber-800">{affectedParcels.length}</b>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left border border-slate-800 print:border-slate-300 text-xs">
                  <thead className="bg-slate-950 print:bg-slate-200">
                    <tr>
                      <th className="p-2">Survey No.</th>
                      <th className="p-2">Village</th>
                      <th className="p-2">Area (Acres)</th>
                      <th className="p-2">Classification</th>
                      <th className="p-2">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800 print:divide-slate-300">
                    {cadastralParcels.map((p) => (
                      <tr key={p.surveyNumber}>
                        <td className="p-2 font-mono font-bold">{p.surveyNumber}</td>
                        <td className="p-2">{p.village}</td>
                        <td className="p-2 font-mono">{p.areaAcres}</td>
                        <td className="p-2">{p.landClassification}</td>
                        <td className="p-2 font-semibold">
                          {p.isIntersectingChange ? 'Intersecting Change Zone' : 'Clear'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ) : (
            <div className="p-3 rounded-xl bg-slate-950/60 print:bg-slate-100 text-xs text-slate-400 print:text-slate-600">
              Verified official cadastral records unavailable for these exact coordinates in open GIS. Prototype cadastral records or local revenue survey shapefiles can be uploaded via the GIS module.
            </div>
          )}
        </div>

        {/* Section 6: Field Ground-Truthing Record */}
        <div className="space-y-3">
          <div className="flex items-center justify-between border-b border-slate-800 print:border-slate-300 pb-1">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 print:text-slate-600 flex items-center gap-1.5">
              <ClipboardCheck className="w-3.5 h-3.5 text-teal-400" />
              6. Field Ground-Truthing & Inspection Record
            </h3>
            <span className="text-[10px] text-cyan-400 print:text-cyan-800 font-medium">
              Demonstration Ground-Truth Record
            </span>
          </div>
          {latestFieldLog ? (
            <div className="p-4 rounded-xl bg-slate-950/60 print:bg-slate-100 border border-slate-800 print:border-slate-300 text-xs space-y-2">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                <div>
                  <span className="text-slate-400 print:text-slate-500 block text-[10px]">Inspector</span>
                  <span className="font-bold text-white print:text-slate-900">{latestFieldLog.inspectorName}</span>
                </div>
                <div>
                  <span className="text-slate-400 print:text-slate-500 block text-[10px]">Designation</span>
                  <span className="font-medium text-slate-200 print:text-slate-800">{latestFieldLog.designation}</span>
                </div>
                <div>
                  <span className="text-slate-400 print:text-slate-500 block text-[10px]">Date Verified</span>
                  <span className="font-medium text-slate-200 print:text-slate-800">{latestFieldLog.inspectionDate}</span>
                </div>
                <div>
                  <span className="text-slate-400 print:text-slate-500 block text-[10px]">Determination</span>
                  <span className="font-bold text-cyan-400 print:text-cyan-800">{latestFieldLog.status}</span>
                </div>
              </div>
              <div className="text-slate-300 print:text-slate-800 pt-1 border-t border-slate-800 print:border-slate-200">
                <b>Field Notes:</b> {latestFieldLog.notes}
              </div>
            </div>
          ) : (
            <div className="p-3 rounded-xl bg-slate-950/60 print:bg-slate-100 text-xs text-slate-400 print:text-slate-600">
              No ground inspection logs recorded yet for this lake.
            </div>
          )}
        </div>

        {/* Section 7: Multi-Source Evidence Reconciliation & Case Status */}
        <div className="space-y-3">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 print:text-slate-600 flex items-center gap-1.5 border-b border-slate-800 print:border-slate-300 pb-1">
            <Layers className="w-3.5 h-3.5 text-cyan-400" />
            7. Multi-Source Evidence Reconciliation & Overall Case Status
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 text-xs">
            <div className="p-3 rounded-xl bg-slate-950/60 print:bg-slate-100 border border-slate-800 print:border-slate-300">
              <span className="text-slate-400 print:text-slate-500 block text-[10px]">Satellite Priority</span>
              <span className="font-bold text-white print:text-slate-900">{riskAnalysis.riskLevel}</span>
              <span className="text-[10px] text-slate-400 print:text-slate-500 block">Score: {riskAnalysis.riskScore}/100</span>
            </div>
            <div className="p-3 rounded-xl bg-slate-950/60 print:bg-slate-100 border border-slate-800 print:border-slate-300">
              <span className="text-slate-400 print:text-slate-500 block text-[10px]">Cadastral Cadastre</span>
              <span className="font-bold text-white print:text-slate-900">
                {affectedParcels.length > 0 ? `${affectedParcels.length} Parcels In Buffer` : 'Clear / Unaffected'}
              </span>
              <span className="text-[10px] text-slate-400 print:text-slate-500 block">Survey Overlap</span>
            </div>
            <div className="p-3 rounded-xl bg-slate-950/60 print:bg-slate-100 border border-slate-800 print:border-slate-300">
              <span className="text-slate-400 print:text-slate-500 block text-[10px]">Ground-Truth Finding</span>
              <span className="font-bold text-white print:text-slate-900">
                {latestFieldLog ? latestFieldLog.status.toUpperCase() : 'PENDING'}
              </span>
              <span className="text-[10px] text-slate-400 print:text-slate-500 block">Field Inspection</span>
            </div>
            <div className="p-3 rounded-xl bg-slate-950/60 print:bg-slate-100 border border-slate-800 print:border-slate-300">
              <span className="text-slate-400 print:text-slate-500 block text-[10px]">Overall Case Status</span>
              <span className="font-extrabold text-cyan-400 print:text-cyan-800">
                {(() => {
                  const isHigh = riskAnalysis.riskLevel === 'HIGH';
                  const fStatus = latestFieldLog?.status;
                  if (!fStatus || fStatus === 'Pending') return 'UNDER INVESTIGATION';
                  if (isHigh && fStatus === 'Verified') return 'CONFIRMED VIOLATION';
                  if (isHigh && fStatus === 'Rejected') return 'REVIEW REQUIRED (DISCREPANCY)';
                  if (!isHigh && fStatus === 'Verified') return 'GROUND VIOLATION (HIGH REVIEW)';
                  if (fStatus === 'Inconclusive') return 'FURTHER SURVEY NEEDED';
                  return 'CLEARED / ROUTINE PATROL';
                })()}
              </span>
              <span className="text-[10px] text-slate-400 print:text-slate-500 block">Reconciled Finding</span>
            </div>
          </div>
        </div>

        {/* Section 8: Recommended Action Checklist */}
        <div className="space-y-3">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 print:text-slate-600 flex items-center gap-1.5 border-b border-slate-800 print:border-slate-300 pb-1">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
            8. Prioritized Recommended Action Checklist
          </h3>
          <div className="p-4 rounded-xl bg-slate-950/60 print:bg-slate-100 border border-slate-800 print:border-slate-300 text-xs space-y-2">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-slate-300 print:text-slate-800">
              <div className="flex items-start gap-2">
                <span className="w-4 h-4 rounded-full bg-cyan-950 text-cyan-300 border border-cyan-800 flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5">1</span>
                <span>Recommended: Initiate formal inquiry under State Lake Protection Act framework with identified survey parcel owners.</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="w-4 h-4 rounded-full bg-cyan-950 text-cyan-300 border border-cyan-800 flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5">2</span>
                <span>Dispatch joint ground verification team (Revenue Inspector + Irrigation Engineer) for Differential GPS (DGPS) peg marking.</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="w-4 h-4 rounded-full bg-cyan-950 text-cyan-300 border border-cyan-800 flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5">3</span>
                <span>Periodic Sentinel-2 monitoring recommended for flagged buffer perimeter coordinates.</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="w-4 h-4 rounded-full bg-cyan-950 text-cyan-300 border border-cyan-800 flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5">4</span>
                <span>Submit decision-support investigation dossier to District Lake Committee for review and field action.</span>
              </div>
            </div>
          </div>
        </div>

        {/* Decision-Support Footer / Sign-off */}
        <div className="pt-6 border-t border-slate-800 print:border-slate-300 flex flex-wrap items-center justify-between text-[11px] text-slate-500 print:text-slate-600 gap-4">
          <div>
            LakeHealth Automated Geospatial Surveillance Engine &bull; Copernicus Sentinel-2
          </div>
          <div className="font-mono text-[10px]">
            Investigation Dossier ID: {reportId} &bull; Generated via LakeHealth Decision-Support System
          </div>
        </div>
      </div>
    </div>
  );
};
