import React, { useState, useEffect } from 'react';
import { Search, Navigation, Compass, Sparkles, AlertCircle, CheckCircle2 } from 'lucide-react';
import { useLake } from '../context/LakeContext';
import { PRESET_LAKES } from '../data/lakes';

export const LakeSelectorBar: React.FC = () => {
  const { currentLake, setLakeCoordinates, selectPresetLake, isLoadingMonitor, isLoadingChange } = useLake();

  const [inputName, setInputName] = useState(currentLake.name);
  const [inputLat, setInputLat] = useState(currentLake.latitude.toString());
  const [inputLng, setInputLng] = useState(currentLake.longitude.toString());
  const [validationError, setValidationError] = useState<string | null>(null);
  const [isSuccessFeedback, setIsSuccessFeedback] = useState(false);

  useEffect(() => {
    setInputName(currentLake.name);
    setInputLat(currentLake.latitude.toString());
    setInputLng(currentLake.longitude.toString());
  }, [currentLake]);

  const handleApplyCoordinates = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setValidationError(null);

    const lat = parseFloat(inputLat);
    const lng = parseFloat(inputLng);

    if (isNaN(lat) || lat < -90 || lat > 90) {
      setValidationError('Please enter a valid Latitude between -90.0000 and 90.0000');
      return;
    }

    if (isNaN(lng) || lng < -180 || lng > 180) {
      setValidationError('Please enter a valid Longitude between -180.0000 and 180.0000');
      return;
    }

    const trimmedName = inputName.trim() || `Lake (${lat.toFixed(3)}, ${lng.toFixed(3)})`;
    setLakeCoordinates(trimmedName, lat, lng);

    setIsSuccessFeedback(true);
    setTimeout(() => setIsSuccessFeedback(false), 2500);
  };

  const handleSelectPreset = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedName = e.target.value;
    const found = PRESET_LAKES.find((l) => l.name === selectedName);
    if (found) {
      selectPresetLake(found);
    }
  };

  const handleUseCurrentLocation = () => {
    if (!navigator.geolocation) {
      setValidationError('Geolocation is not supported by your browser');
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setInputLat(pos.coords.latitude.toFixed(4));
        setInputLng(pos.coords.longitude.toFixed(4));
        setInputName('Nearby Water Body');
        setLakeCoordinates('Nearby Water Body', pos.coords.latitude, pos.coords.longitude);
      },
      (err) => {
        setValidationError(`GPS error: ${err.message}`);
      }
    );
  };

  const isBusy = isLoadingMonitor || isLoadingChange;

  return (
    <div className="bg-slate-900/90 border-b border-slate-800/80 px-4 py-3 shadow-inner">
      <div className="max-w-7xl mx-auto">
        <form onSubmit={handleApplyCoordinates} className="flex flex-wrap items-center gap-3">
          {/* Preset Quick Dropdown */}
          <div className="w-full sm:w-auto flex items-center space-x-2">
            <span className="text-xs text-slate-400 font-medium flex items-center gap-1">
              <Compass className="w-3.5 h-3.5 text-cyan-400" />
              Presets:
            </span>
            <select
              id="lake-preset-dropdown"
              value={PRESET_LAKES.some((l) => l.name === currentLake.name) ? currentLake.name : ''}
              onChange={handleSelectPreset}
              className="bg-slate-800 text-slate-200 text-xs rounded-lg px-2.5 py-1.5 border border-slate-700 focus:outline-none focus:border-cyan-500 transition-colors"
            >
              <option value="" disabled>
                -- Choose or Enter Below --
              </option>
              {PRESET_LAKES.map((lake) => (
                <option key={lake.name} value={lake.name}>
                  {lake.name} ({lake.state})
                </option>
              ))}
            </select>
          </div>

          <div className="hidden sm:block h-6 w-[1px] bg-slate-800" />

          {/* Lake Name Input */}
          <div className="flex-1 min-w-[160px]">
            <label htmlFor="lake-name-input" className="sr-only">
              Lake Name
            </label>
            <div className="relative">
              <input
                id="lake-name-input"
                type="text"
                value={inputName}
                onChange={(e) => setInputName(e.target.value)}
                placeholder="Lake Name (e.g. Durgam Cheruvu)"
                className="w-full bg-slate-950/80 text-white placeholder-slate-500 text-xs rounded-lg pl-3 pr-3 py-1.5 border border-slate-700/80 focus:outline-none focus:border-cyan-500"
              />
            </div>
          </div>

          {/* Latitude */}
          <div className="w-28">
            <label htmlFor="latitude-input" className="sr-only">
              Latitude
            </label>
            <input
              id="latitude-input"
              type="number"
              step="any"
              value={inputLat}
              onChange={(e) => setInputLat(e.target.value)}
              placeholder="Latitude"
              className="w-full bg-slate-950/80 text-white font-mono placeholder-slate-500 text-xs rounded-lg px-2.5 py-1.5 border border-slate-700/80 focus:outline-none focus:border-cyan-500"
            />
          </div>

          {/* Longitude */}
          <div className="w-28">
            <label htmlFor="longitude-input" className="sr-only">
              Longitude
            </label>
            <input
              id="longitude-input"
              type="number"
              step="any"
              value={inputLng}
              onChange={(e) => setInputLng(e.target.value)}
              placeholder="Longitude"
              className="w-full bg-slate-950/80 text-white font-mono placeholder-slate-500 text-xs rounded-lg px-2.5 py-1.5 border border-slate-700/80 focus:outline-none focus:border-cyan-500"
            />
          </div>

          {/* Action: Apply & Run Satellite Analysis */}
          <button
            id="apply-coordinates-btn"
            type="submit"
            disabled={isBusy}
            className="flex items-center space-x-1.5 bg-gradient-to-r from-cyan-600 to-teal-600 hover:from-cyan-500 hover:to-teal-500 text-white text-xs font-semibold px-3.5 py-1.5 rounded-lg shadow-sm shadow-cyan-600/30 transition-all disabled:opacity-50"
          >
            {isBusy ? (
              <>
                <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                <span>Analyzing Patch...</span>
              </>
            ) : isSuccessFeedback ? (
              <>
                <CheckCircle2 className="w-3.5 h-3.5 text-white" />
                <span>Updated!</span>
              </>
            ) : (
              <>
                <Search className="w-3.5 h-3.5" />
                <span>Analyze Satellite</span>
              </>
            )}
          </button>

          {/* Optional GPS Location */}
          <button
            type="button"
            id="gps-location-btn"
            onClick={handleUseCurrentLocation}
            title="Use current device GPS location"
            className="p-1.5 rounded-lg border border-slate-800 text-slate-400 hover:text-cyan-400 hover:bg-slate-800 transition-colors"
          >
            <Navigation className="w-3.5 h-3.5" />
          </button>
        </form>

        {/* Validation or Hint */}
        {validationError && (
          <div className="mt-2 text-xs text-rose-400 flex items-center space-x-1">
            <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
            <span>{validationError}</span>
          </div>
        )}
      </div>
    </div>
  );
};
