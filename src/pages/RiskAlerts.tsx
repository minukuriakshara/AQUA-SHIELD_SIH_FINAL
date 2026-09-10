import React, { useState } from 'react';
import {
  AlertTriangle,
  ShieldAlert,
  Search,
  Filter,
  CheckCircle2,
  XCircle,
  Clock,
  ExternalLink,
  PlusCircle,
  Download,
  Info,
  MapPin,
  ArrowRight
} from 'lucide-react';
import { useLake } from '../context/LakeContext';
import { AlertStatus, RiskLevel, AlertItem } from '../types';
import { CaseIntelligence } from '../components/CaseIntelligence';

interface RiskAlertsProps {
  setActiveTab: (tab: string) => void;
}

export const RiskAlerts: React.FC<RiskAlertsProps> = ({ setActiveTab }) => {
  const {
    currentLake,
    alerts,
    lakeAlerts,
    updateAlertStatus,
    addAlert,
    assignOfficerToAlert,
    riskAnalysis,
    monitorChangeData
  } = useLake();

  const [searchQuery, setSearchQuery] = useState('');
  const [lakeScope, setLakeScope] = useState<'CURRENT' | 'ALL'>('CURRENT');
  const [statusFilter, setStatusFilter] = useState<'ALL' | AlertStatus>('ALL');
  const [riskFilter, setRiskFilter] = useState<'ALL' | RiskLevel>('ALL');
  const [notesModalAlert, setNotesModalAlert] = useState<AlertItem | null>(null);
  const [modalNotes, setModalNotes] = useState('');
  const [modalStatus, setModalStatus] = useState<AlertStatus>('Verified');
  const [selectedCaseAlert, setSelectedCaseAlert] = useState<AlertItem | null>(null);

  // Officer Assignment Modal State
  const [assignModalAlert, setAssignModalAlert] = useState<AlertItem | null>(null);
  const [assignOfficerName, setAssignOfficerName] = useState('Officer R. K. Sharma');
  const [assignDesignation, setAssignDesignation] = useState('Assistant Executive Engineer (Lakes Wing)');
  const [assignTargetDate, setAssignTargetDate] = useState(new Date().toISOString().split('T')[0]);
  const [assignInstructions, setAssignInstructions] = useState('Conduct on-site boundary demarcations at suspected shoreline buffer zone; cross-reference cadastral survey numbers.');

  const alertsSource = lakeScope === 'CURRENT' ? lakeAlerts : alerts;

  const filteredAlerts = alertsSource.filter((alert) => {
    const matchesSearch =
      alert.lakeName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      alert.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      alert.reason.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus = statusFilter === 'ALL' || alert.status === statusFilter;
    const matchesRisk = riskFilter === 'ALL' || alert.riskLevel === riskFilter;

    return matchesSearch && matchesStatus && matchesRisk;
  });

  const handleCreateAlertFromCurrent = () => {
    const isLoss = riskAnalysis.isWaterLoss;
    addAlert({
      caseId: `CASE-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`,
      lakeName: currentLake.name,
      latitude: currentLake.latitude,
      longitude: currentLake.longitude,
      date: new Date().toISOString().split('T')[0],
      changeDetected: monitorChangeData?.change_status || (isLoss ? 'Shoreline water retreat' : 'Hydrological extent variation'),
      changePercentage: monitorChangeData?.change_percentage || (isLoss ? riskAnalysis.waterLossPercentage : 0),
      isLoss,
      affectedAreaSqM: riskAnalysis.detectedChangeAreaSqM,
      affectedAreaHectares: riskAnalysis.detectedChangeAreaHectares,
      riskLevel: riskAnalysis.riskLevel,
      riskScore: riskAnalysis.riskScore,
      confidence: riskAnalysis.confidenceScore,
      reason: riskAnalysis.riskFactors.join('; ') || 'Automated spectral NDWI change anomaly',
      whyFlagged: riskAnalysis.riskFactors,
      recommendedAction: riskAnalysis.recommendedAction.primary,
      actionChecklist: riskAnalysis.recommendedAction.details,
      status: 'Pending'
    });
  };

  const openStatusModal = (alert: AlertItem, targetStatus: AlertStatus) => {
    setNotesModalAlert(alert);
    setModalStatus(targetStatus);
    setModalNotes(alert.verificationNotes || '');
  };

  const submitStatusUpdate = () => {
    if (notesModalAlert) {
      updateAlertStatus(notesModalAlert.id, modalStatus, modalNotes);
      setNotesModalAlert(null);
    }
  };

  const openAssignModal = (alert: AlertItem) => {
    setAssignModalAlert(alert);
    setAssignOfficerName(alert.assignedOfficer || 'Officer R. K. Sharma');
  };

  const submitAssignOfficer = () => {
    if (assignModalAlert) {
      assignOfficerToAlert(
        assignModalAlert.id,
        assignOfficerName,
        assignDesignation,
        assignTargetDate,
        assignInstructions
      );
      setAssignModalAlert(null);
    }
  };

  const exportAlertsJson = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(alerts, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `aqua_shield_alerts_${new Date().toISOString().split('T')[0]}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const getRiskBadgeColor = (level: RiskLevel) => {
    switch (level) {
      case 'HIGH':
        return 'bg-rose-950 text-rose-300 border-rose-800';
      case 'MODERATE':
        return 'bg-amber-950 text-amber-300 border-amber-800';
      default:
        return 'bg-emerald-950 text-emerald-300 border-emerald-800';
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {selectedCaseAlert && (
        <CaseIntelligence
          alert={selectedCaseAlert}
          onClose={() => setSelectedCaseAlert(null)}
          setActiveTab={setActiveTab}
          onAssignOfficer={openAssignModal}
          onUpdateStatus={openStatusModal}
        />
      )}

      {/* Header */}
      <div className="bg-slate-900/60 p-5 rounded-2xl border border-slate-800 flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <h1 className="text-xl sm:text-2xl font-extrabold text-white">
              Encroachment Risk & Alerts Management
            </h1>
            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-950 text-rose-300 border border-rose-800">
              Active Monitoring
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1 max-w-2xl">
            Prioritized catalog of environmental alarms triggered by bi-temporal Sentinel-2 spectral shifts and revenue boundary violations.
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <button
            id="create-alert-from-current-btn"
            onClick={handleCreateAlertFromCurrent}
            className="flex items-center space-x-2 bg-gradient-to-r from-rose-600 to-amber-600 hover:from-rose-500 hover:to-amber-500 text-white font-semibold text-xs px-3.5 py-2 rounded-xl shadow-md shadow-rose-600/20 transition-all"
          >
            <PlusCircle className="w-3.5 h-3.5" />
            <span>Generate Alert for {currentLake.name}</span>
          </button>

          <button
            onClick={exportAlertsJson}
            className="flex items-center space-x-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold px-3 py-2 rounded-xl border border-slate-700 transition-colors"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export JSON</span>
          </button>
        </div>
      </div>

      {/* Current Lake Live Risk Assessment Card */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800 pb-3">
          <div className="flex items-center space-x-2">
            <ShieldAlert className="w-5 h-5 text-cyan-400" />
            <h2 className="text-sm font-bold text-white">
              Target Water Body Assessment: <span className="text-cyan-300">{currentLake.name}</span>
            </h2>
          </div>
          <div className="flex items-center space-x-3">
            <div className="text-right">
              <span className="text-sm sm:text-base font-black text-white flex items-center gap-1.5">
                {riskAnalysis.riskLevel === 'HIGH' ? '🔴 HIGH PRIORITY' : riskAnalysis.riskLevel === 'MODERATE' ? '🟠 MODERATE PRIORITY' : '🟢 LOW PRIORITY'} — {riskAnalysis.riskScore}/100
              </span>
              <span className="text-[10px] text-slate-400 block font-normal">
                AI-assisted/automated risk assessment — field verification required.
              </span>
            </div>
            <span
              className={`px-2.5 py-1 rounded text-xs font-bold border ${getRiskBadgeColor(
                riskAnalysis.riskLevel
              )}`}
            >
              {riskAnalysis.riskLevel} RISK
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-xs">
          <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
            <span className="text-slate-400 block text-[11px]">Suspected Footprint</span>
            <span className="text-base font-bold text-white">
              {riskAnalysis.detectedChangeAreaHectares} Ha
            </span>
            <span className="text-[11px] text-slate-400 block">
              {(riskAnalysis.detectedChangeAreaHectares * 2.471).toFixed(2)} Acres suspected
            </span>
          </div>

          <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
            <span className="text-slate-400 block text-[11px]">Water Extent Shift</span>
            <span className="text-base font-bold text-cyan-300">
              {riskAnalysis.waterLossPercentage > 0
                ? `-${riskAnalysis.waterLossPercentage}% Contraction`
                : `${monitorChangeData?.change_percentage ?? 0}% Shift`}
            </span>
            <span className="text-[11px] text-slate-400 block truncate">
              {monitorChangeData?.change_status || 'Observation baseline'}
            </span>
          </div>

          <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
            <span className="text-slate-400 block text-[11px]">Screening Confidence</span>
            <span className="text-base font-bold text-emerald-400">
              {riskAnalysis.confidenceScore}% (Screening Confidence)
            </span>
            <span className="text-[11px] text-slate-400 block">
              Multi-band NDWI spectral indexing
            </span>
          </div>

          <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
            <span className="text-slate-400 block text-[11px]">Recommended Directive</span>
            <span className="text-xs font-semibold text-amber-300 block leading-tight">
              {riskAnalysis.recommendedAction.primary}
            </span>
            <span className="text-[10px] text-slate-400 block">
              Automated operational protocol
            </span>
          </div>
        </div>

        {/* Why Flagged & Next Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2">
          <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800/80 space-y-1.5">
            <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
              <span>Why Was It Flagged?</span>
            </div>
            <ul className="space-y-1 text-xs text-slate-300">
              {riskAnalysis.riskFactors.map((factor, idx) => (
                <li key={idx} className="flex items-start gap-1.5">
                  <span className="text-rose-400 font-bold">•</span>
                  <span>{factor}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800/80 space-y-1.5">
            <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
              <span>What Should The Officer Do Next?</span>
            </div>
            <ul className="space-y-1 text-xs text-slate-300">
              {riskAnalysis.recommendedAction.details.map((action, idx) => (
                <li key={idx} className="flex items-start gap-1.5">
                  <span className="text-cyan-400 font-bold">✓</span>
                  <span>{action}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Case Intelligence Launch Action */}
        <div className="pt-2 flex flex-wrap items-center justify-between gap-2 border-t border-slate-800/80 text-xs">
          <span className="text-slate-400 text-[11px]">
            View multi-sensor Sentinel-2 evidence, 30m cadastral FTL buffer, and 11-stage chronological timeline.
          </span>
          <button
            onClick={() => {
              const targetAlert = lakeAlerts[0] || alerts[0];
              setSelectedCaseAlert(targetAlert);
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            className="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-semibold text-xs shadow-md shadow-cyan-600/30 flex items-center gap-1.5 transition-all"
          >
            <span>Open Case Intelligence Screen</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Scope Toggle & Filter Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-900/50 p-3 rounded-2xl border border-slate-800">
        <div className="flex items-center space-x-2">
          <div className="bg-slate-950 p-1 rounded-xl border border-slate-800 flex items-center text-xs">
            <button
              onClick={() => setLakeScope('CURRENT')}
              className={`px-3 py-1 rounded-lg font-semibold transition-all ${
                lakeScope === 'CURRENT'
                  ? 'bg-cyan-500 text-slate-950 shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Current Lake ({currentLake.name})
            </button>
            <button
              onClick={() => setLakeScope('ALL')}
              className={`px-3 py-1 rounded-lg font-semibold transition-all ${
                lakeScope === 'ALL'
                  ? 'bg-cyan-500 text-slate-950 shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              All Monitored Lakes ({alerts.length})
            </button>
          </div>

          <div className="flex items-center space-x-2 flex-1 min-w-[180px] bg-slate-950 px-3 py-1.5 rounded-xl border border-slate-800">
            <Search className="w-3.5 h-3.5 text-slate-500" />
            <input
              type="text"
              placeholder="Search alerts by ID, lake, reason..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-transparent text-xs text-white placeholder-slate-500 focus:outline-none"
            />
          </div>
        </div>

        <div className="flex items-center space-x-3 text-xs">
          <div className="flex items-center space-x-1.5">
            <Filter className="w-3.5 h-3.5 text-slate-400" />
            <span className="text-slate-400">Status:</span>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as any)}
              className="bg-slate-800 text-slate-200 rounded-lg px-2 py-1 border border-slate-700 focus:outline-none text-xs"
            >
              <option value="ALL">All Statuses</option>
              <option value="Pending">Pending</option>
              <option value="Verified">Verified</option>
              <option value="Rejected">Rejected</option>
            </select>
          </div>

          <div className="flex items-center space-x-1.5">
            <span className="text-slate-400">Risk:</span>
            <select
              value={riskFilter}
              onChange={(e) => setRiskFilter(e.target.value as any)}
              className="bg-slate-800 text-slate-200 rounded-lg px-2 py-1 border border-slate-700 focus:outline-none text-xs"
            >
              <option value="ALL">All Levels</option>
              <option value="HIGH">High</option>
              <option value="MODERATE">Moderate</option>
              <option value="LOW">Low</option>
            </select>
          </div>
        </div>
      </div>

      {/* Alerts Table */}
      <div className="bg-slate-900/60 border border-slate-800 rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-800 bg-slate-950/40 text-slate-400 uppercase tracking-wider text-[10px]">
                <th className="py-3 px-4">Case / Alert ID</th>
                <th className="py-3 px-4">Lake & Coordinates</th>
                <th className="py-3 px-4">Observation Date</th>
                <th className="py-3 px-4">Suspected Area & Shift</th>
                <th className="py-3 px-4">Priority & Score</th>
                <th className="py-3 px-4">Assigned Officer</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {filteredAlerts.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-slate-500">
                    No alerts found for current criteria.
                  </td>
                </tr>
              ) : (
                filteredAlerts.map((alert) => (
                  <tr key={alert.id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="py-3.5 px-4">
                      <div className="font-mono font-bold text-cyan-300">{alert.id}</div>
                      {alert.caseId && (
                        <div className="text-[10px] font-mono text-slate-500">{alert.caseId}</div>
                      )}
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="font-semibold text-white">{alert.lakeName}</div>
                      <div className="text-[10px] font-mono text-slate-400">
                        {alert.latitude.toFixed(4)}, {alert.longitude.toFixed(4)}
                      </div>
                    </td>
                    <td className="py-3.5 px-4 text-slate-300">{alert.date}</td>
                    <td className="py-3.5 px-4">
                      <div className="text-slate-200 font-medium">
                        {alert.affectedAreaHectares ? `${alert.affectedAreaHectares} Ha` : alert.changeDetected}
                      </div>
                      <div className="text-[10px] text-cyan-400 font-mono">
                        {alert.changePercentage}% {alert.isLoss ? 'retreat' : 'variance'}
                      </div>
                    </td>
                    <td className="py-3.5 px-4">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold border ${getRiskBadgeColor(
                          alert.riskLevel
                        )}`}
                      >
                        {alert.riskLevel} ({alert.riskScore}/100)
                      </span>
                    </td>
                    <td className="py-3.5 px-4">
                      {alert.assignedOfficer ? (
                        <div>
                          <div className="font-medium text-slate-200">{alert.assignedOfficer}</div>
                          <div className="text-[10px] text-slate-500">Due: {alert.assignedDate || 'ASAP'}</div>
                        </div>
                      ) : (
                        <button
                          onClick={() => openAssignModal(alert)}
                          className="text-[11px] text-cyan-400 hover:text-cyan-300 underline font-medium"
                        >
                          + Assign Officer
                        </button>
                      )}
                    </td>
                    <td className="py-3.5 px-4">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                          alert.status === 'Verified'
                            ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                            : alert.status === 'Rejected'
                            ? 'bg-slate-800 text-slate-400 border border-slate-700'
                            : 'bg-amber-950 text-amber-300 border border-amber-800'
                        }`}
                      >
                        {alert.status}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right space-x-1.5 whitespace-nowrap">
                      <button
                        onClick={() => openAssignModal(alert)}
                        className="px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 text-[11px] transition-colors"
                        title="Assign or reassign officer"
                      >
                        Assign
                      </button>
                      {alert.status === 'Pending' ? (
                        <>
                          <button
                            onClick={() => openStatusModal(alert, 'Verified')}
                            className="px-2 py-1 rounded bg-emerald-950 hover:bg-emerald-900 text-emerald-300 border border-emerald-800 transition-colors font-medium text-[11px]"
                            title="Verify Encroachment"
                          >
                            Verify
                          </button>
                          <button
                            onClick={() => openStatusModal(alert, 'Rejected')}
                            className="px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition-colors font-medium text-[11px]"
                            title="Reject / False Alarm"
                          >
                            Reject
                          </button>
                        </>
                      ) : (
                        <button
                          onClick={() => openStatusModal(alert, alert.status === 'Verified' ? 'Rejected' : 'Verified')}
                          className="px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-cyan-300 text-[11px] transition-colors"
                        >
                          Status
                        </button>
                      )}
                      <button
                        onClick={() => {
                          setSelectedCaseAlert(alert);
                          window.scrollTo({ top: 0, behavior: 'smooth' });
                        }}
                        className="px-2 py-1 rounded bg-cyan-900/60 hover:bg-cyan-800 text-cyan-200 border border-cyan-700 text-[11px] transition-colors font-medium"
                        title="Open full Case Intelligence Screen"
                      >
                        Intelligence
                      </button>
                      <button
                        onClick={() => setActiveTab('field')}
                        className="px-2 py-1 rounded bg-cyan-950 hover:bg-cyan-900 text-cyan-300 border border-cyan-800 text-[11px] transition-colors"
                        title="Open in Field Verification"
                      >
                        Inspect
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Verification Status Modal */}
      {notesModalAlert && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="font-bold text-white text-base">
                Update Status: <span className="text-cyan-300">{notesModalAlert.id}</span>
              </h3>
              <button
                onClick={() => setNotesModalAlert(null)}
                className="text-slate-400 hover:text-white"
              >
                &times;
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-400 mb-1">Target Water Body</label>
                <div className="font-bold text-white">{notesModalAlert.lakeName}</div>
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Investigation Status</label>
                <select
                  value={modalStatus}
                  onChange={(e) => setModalStatus(e.target.value as AlertStatus)}
                  className="w-full bg-slate-950 text-white rounded-lg p-2 border border-slate-700 focus:outline-none"
                >
                  <option value="Pending">Pending Investigation</option>
                  <option value="Verified">Verified Encroachment (Confirmed on Ground)</option>
                  <option value="Rejected">Rejected (Natural Seasonal Fluctuation / Permitted Work)</option>
                  <option value="Inconclusive">Inconclusive (Requires Further Survey)</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Field Inspection Remarks</label>
                <textarea
                  rows={3}
                  value={modalNotes}
                  onChange={(e) => setModalNotes(e.target.value)}
                  placeholder="Enter ground inspection remarks, survey findings, or order reference..."
                  className="w-full bg-slate-950 text-white rounded-lg p-2.5 border border-slate-700 focus:outline-none"
                />
              </div>
            </div>

            <div className="flex justify-end space-x-2 pt-2 border-t border-slate-800">
              <button
                onClick={() => setNotesModalAlert(null)}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold"
              >
                Cancel
              </button>
              <button
                onClick={submitStatusUpdate}
                className="px-4 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-semibold shadow-md shadow-cyan-600/30"
              >
                Save Status
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Assign Officer Modal */}
      {assignModalAlert && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="font-bold text-white text-base">
                Assign Field Enforcement Officer
              </h3>
              <button
                onClick={() => setAssignModalAlert(null)}
                className="text-slate-400 hover:text-white"
              >
                &times;
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-400 mb-1">Target Case / Lake</label>
                <div className="font-bold text-cyan-300">{assignModalAlert.lakeName} ({assignModalAlert.id})</div>
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Officer Name</label>
                <input
                  type="text"
                  value={assignOfficerName}
                  onChange={(e) => setAssignOfficerName(e.target.value)}
                  placeholder="e.g. Officer R. K. Sharma"
                  className="w-full bg-slate-950 text-white rounded-lg p-2 border border-slate-700 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Designation / Department</label>
                <input
                  type="text"
                  value={assignDesignation}
                  onChange={(e) => setAssignDesignation(e.target.value)}
                  placeholder="e.g. Assistant Executive Engineer (Lakes Wing)"
                  className="w-full bg-slate-950 text-white rounded-lg p-2 border border-slate-700 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Target Inspection Date</label>
                <input
                  type="date"
                  value={assignTargetDate}
                  onChange={(e) => setAssignTargetDate(e.target.value)}
                  className="w-full bg-slate-950 text-white rounded-lg p-2 border border-slate-700 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Field Inspection Directive</label>
                <textarea
                  rows={3}
                  value={assignInstructions}
                  onChange={(e) => setAssignInstructions(e.target.value)}
                  placeholder="Specific tasks: GPS geotagging, cross-referencing survey numbers, notice delivery..."
                  className="w-full bg-slate-950 text-white rounded-lg p-2.5 border border-slate-700 focus:outline-none"
                />
              </div>
            </div>

            <div className="flex justify-end space-x-2 pt-2 border-t border-slate-800">
              <button
                onClick={() => setAssignModalAlert(null)}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold"
              >
                Cancel
              </button>
              <button
                onClick={submitAssignOfficer}
                className="px-4 py-2 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white text-xs font-semibold shadow-md shadow-cyan-600/30"
              >
                Dispatch Assignment
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
