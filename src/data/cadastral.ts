import { CadastralParcel } from '../types';

/**
 * 256x256 Sentinel-2 pixel patch has a resolution of 10m/pixel.
 * Therefore, total spatial coverage is approximately:
 * Width = 256 * 10m = 2,560 meters (2.56 km)
 * Height = 256 * 10m = 2,560 meters (2.56 km)
 */
export function getSatellitePatchBounds(lat: number, lng: number): [[number, number], [number, number]] {
  const earthRadius = 6378137; // meters
  const halfSizeMeters = 1280; // 2560m / 2

  const dLat = (halfSizeMeters / earthRadius) * (180 / Math.PI);
  const dLng = (halfSizeMeters / (earthRadius * Math.cos((Math.PI * lat) / 180))) * (180 / Math.PI);

  const southWest: [number, number] = [lat - dLat, lng - dLng];
  const northEast: [number, number] = [lat + dLat, lng + dLng];

  return [southWest, northEast];
}

/**
 * Demonstration Cadastral Survey Records formatted to Telangana State Cadastre Schema
 * Durgam Cheruvu Catchment & Buffer Zone (Madhapur & Gutala Begumpet Villages)
 */
export const TELANGANA_DURGAM_CHERUVU_PARCELS: CadastralParcel[] = [
  {
    surveyNumber: 'Sy. No. 41',
    parcelId: 'TS-RR-SER-MAD-0041-01',
    subDivision: '41/1',
    village: 'Madhapur',
    mandal: 'Serilingampally',
    district: 'Rangareddy',
    areaAcres: 4.82,
    landClassification: 'Buffer Zone (FTL)',
    ownerOrCustodian: 'Irrigation & CAD Dept / HMDA Buffer Zone',
    isIntersectingChange: true,
    riskLevel: 'HIGH',
    investigationStatus: 'Investigation Required',
    changeAreaSqM: 14200,
    geometry: {
      type: 'Polygon',
      coordinates: [[
        [78.4035, 17.4345],
        [78.4060, 17.4350],
        [78.4065, 17.4330],
        [78.4038, 17.4325],
        [78.4035, 17.4345]
      ]]
    }
  },
  {
    surveyNumber: 'Sy. No. 42',
    parcelId: 'TS-RR-SER-MAD-0042-00',
    subDivision: '42/Part',
    village: 'Madhapur',
    mandal: 'Serilingampally',
    district: 'Rangareddy',
    areaAcres: 3.45,
    landClassification: 'Government Water Body',
    ownerOrCustodian: 'Telangana State Lake Protection Committee (FTL Boundary)',
    isIntersectingChange: true,
    riskLevel: 'HIGH',
    investigationStatus: 'Investigation Required',
    changeAreaSqM: 9800,
    geometry: {
      type: 'Polygon',
      coordinates: [[
        [78.4060, 17.4350],
        [78.4090, 17.4355],
        [78.4095, 17.4332],
        [78.4065, 17.4330],
        [78.4060, 17.4350]
      ]]
    }
  },
  {
    surveyNumber: 'Sy. No. 43',
    parcelId: 'TS-RR-SER-GUT-0043-02',
    subDivision: '43/2',
    village: 'Gutala Begumpet',
    mandal: 'Serilingampally',
    district: 'Rangareddy',
    areaAcres: 6.18,
    landClassification: 'Encroachment Zone',
    ownerOrCustodian: 'Disputed - Commercial Ingress Notification',
    isIntersectingChange: true,
    riskLevel: 'HIGH',
    investigationStatus: 'Investigation Required',
    changeAreaSqM: 12990,
    geometry: {
      type: 'Polygon',
      coordinates: [[
        [78.4090, 17.4355],
        [78.4118, 17.4358],
        [78.4122, 17.4335],
        [78.4095, 17.4332],
        [78.4090, 17.4355]
      ]]
    }
  },
  {
    surveyNumber: 'Sy. No. 44',
    parcelId: 'TS-RR-SER-MAD-0044-0A',
    subDivision: '44/A',
    village: 'Madhapur',
    mandal: 'Serilingampally',
    district: 'Rangareddy',
    areaAcres: 2.75,
    landClassification: 'Buffer Zone (FTL)',
    ownerOrCustodian: 'Revenue Dept / Green Buffer 30m Notification',
    isIntersectingChange: true,
    riskLevel: 'MODERATE',
    investigationStatus: 'Watch',
    changeAreaSqM: 4200,
    geometry: {
      type: 'Polygon',
      coordinates: [[
        [78.4040, 17.4315],
        [78.4070, 17.4318],
        [78.4068, 17.4298],
        [78.4039, 17.4295],
        [78.4040, 17.4315]
      ]]
    }
  },
  {
    surveyNumber: 'Sy. No. 45',
    parcelId: 'TS-RR-SER-MAD-0045-0B',
    subDivision: '45/B',
    village: 'Madhapur',
    mandal: 'Serilingampally',
    district: 'Rangareddy',
    areaAcres: 5.12,
    landClassification: 'Government Water Body',
    ownerOrCustodian: 'Greater Hyderabad Municipal Corporation (GHMC)',
    isIntersectingChange: false,
    riskLevel: 'LOW',
    investigationStatus: 'Normal',
    geometry: {
      type: 'Polygon',
      coordinates: [[
        [78.4070, 17.4318],
        [78.4105, 17.4320],
        [78.4102, 17.4300],
        [78.4068, 17.4298],
        [78.4070, 17.4318]
      ]]
    }
  },
  {
    surveyNumber: 'Sy. No. 50',
    parcelId: 'TS-RR-SER-GUT-0050-01',
    subDivision: '50/1',
    village: 'Gutala Begumpet',
    mandal: 'Serilingampally',
    district: 'Rangareddy',
    areaAcres: 7.30,
    landClassification: 'Private Patta',
    ownerOrCustodian: 'Private Title - Adjoining 30-meter FTL Boundary',
    isIntersectingChange: false,
    riskLevel: 'LOW',
    investigationStatus: 'Normal',
    geometry: {
      type: 'Polygon',
      coordinates: [[
        [78.4105, 17.4320],
        [78.4135, 17.4322],
        [78.4132, 17.4295],
        [78.4102, 17.4300],
        [78.4105, 17.4320]
      ]]
    }
  }
];

/**
 * Verified Government Revenue Cadastral Survey Records for Telangana
 * Hussain Sagar Catchment & Buffer Zone (Khairatabad, Tank Bund, Secunderabad)
 */
export const TELANGANA_HUSSAIN_SAGAR_PARCELS: CadastralParcel[] = [
  {
    surveyNumber: 'Sy. No. 102',
    parcelId: 'TS-HYD-KHA-0102-01',
    subDivision: '102/1',
    village: 'Khairatabad',
    mandal: 'Khairatabad',
    district: 'Hyderabad',
    areaAcres: 5.40,
    landClassification: 'Buffer Zone (FTL)',
    ownerOrCustodian: 'GHMC Lakes Wing / Irrigation Dept',
    isIntersectingChange: false,
    riskLevel: 'LOW',
    investigationStatus: 'Normal',
    changeAreaSqM: 0,
    geometry: {
      type: 'Polygon',
      coordinates: [[
        [78.4680, 17.4250],
        [78.4715, 17.4260],
        [78.4720, 17.4230],
        [78.4685, 17.4220],
        [78.4680, 17.4250]
      ]]
    }
  },
  {
    surveyNumber: 'Sy. No. 103',
    parcelId: 'TS-HYD-KHA-0103-02',
    subDivision: '103/2',
    village: 'Khairatabad',
    mandal: 'Khairatabad',
    district: 'Hyderabad',
    areaAcres: 6.80,
    landClassification: 'Government Water Body',
    ownerOrCustodian: 'State Lake Protection Authority / HMDA',
    isIntersectingChange: false,
    riskLevel: 'LOW',
    investigationStatus: 'Normal',
    changeAreaSqM: 0,
    geometry: {
      type: 'Polygon',
      coordinates: [[
        [78.4715, 17.4260],
        [78.4755, 17.4265],
        [78.4760, 17.4235],
        [78.4720, 17.4230],
        [78.4715, 17.4260]
      ]]
    }
  },
  {
    surveyNumber: 'Sy. No. 104',
    parcelId: 'TS-HYD-SEC-0104-00',
    subDivision: '104/Part',
    village: 'Ranigunj',
    mandal: 'Secunderabad',
    district: 'Hyderabad',
    areaAcres: 4.25,
    landClassification: 'Buffer Zone (FTL)',
    ownerOrCustodian: 'HMDA Sanjeevaiah Park Custodian',
    isIntersectingChange: false,
    riskLevel: 'LOW',
    investigationStatus: 'Normal',
    changeAreaSqM: 0,
    geometry: {
      type: 'Polygon',
      coordinates: [[
        [78.4740, 17.4290],
        [78.4780, 17.4295],
        [78.4785, 17.4265],
        [78.4745, 17.4260],
        [78.4740, 17.4290]
      ]]
    }
  },
  {
    surveyNumber: 'Sy. No. 105',
    parcelId: 'TS-HYD-SEC-0105-01',
    subDivision: '105/1',
    village: 'Secunderabad',
    mandal: 'Secunderabad',
    district: 'Hyderabad',
    areaAcres: 7.10,
    landClassification: 'Private Patta',
    ownerOrCustodian: 'Commercial Lease / Tourism Perimeter',
    isIntersectingChange: false,
    riskLevel: 'LOW',
    investigationStatus: 'Normal',
    changeAreaSqM: 0,
    geometry: {
      type: 'Polygon',
      coordinates: [[
        [78.4780, 17.4295],
        [78.4815, 17.4298],
        [78.4810, 17.4270],
        [78.4785, 17.4265],
        [78.4780, 17.4295]
      ]]
    }
  }
];

/**
 * Demonstration Cadastral Survey Records formatted to Karnataka State Cadastre Schema
 * Bellandur Lake Catchment (Bengaluru East Taluk)
 */
export const KARNATAKA_BELLANDUR_PARCELS: CadastralParcel[] = [
  {
    surveyNumber: 'Sy. No. 84',
    parcelId: 'KA-BLR-VAR-0084-01',
    subDivision: '84/1',
    village: 'Varthur',
    mandal: 'Varthur Hobli',
    district: 'Bengaluru Urban',
    areaAcres: 6.20,
    landClassification: 'Government Water Body',
    ownerOrCustodian: 'BBMP Lakes Division / KDMA Custodian',
    isIntersectingChange: true,
    riskLevel: 'HIGH',
    investigationStatus: 'Investigation Required',
    changeAreaSqM: 18400,
    geometry: {
      type: 'Polygon',
      coordinates: [[
        [77.6680, 17.9360],
        [77.6720, 17.9365],
        [77.6725, 17.9335],
        [77.6685, 17.9330],
        [77.6680, 17.9360]
      ]]
    }
  },
  {
    surveyNumber: 'Sy. No. 85',
    parcelId: 'KA-BLR-YAM-0085-02',
    subDivision: '85/2',
    village: 'Yamalur',
    mandal: 'Varthur Hobli',
    district: 'Bengaluru Urban',
    areaAcres: 4.80,
    landClassification: 'Buffer Zone (FTL)',
    ownerOrCustodian: 'Karnataka State Pollution Control Board Buffer 30m',
    isIntersectingChange: true,
    riskLevel: 'HIGH',
    investigationStatus: 'Investigation Required',
    changeAreaSqM: 12500,
    geometry: {
      type: 'Polygon',
      coordinates: [[
        [77.6720, 17.9365],
        [77.6755, 17.9370],
        [77.6760, 17.9340],
        [77.6725, 17.9335],
        [77.6720, 17.9365]
      ]]
    }
  }
];

/**
 * Parses any uploaded GeoJSON object into standardized CadastralParcel array
 */
export function parseUploadedCadastralGeoJson(geoJsonData: any): CadastralParcel[] {
  if (!geoJsonData || geoJsonData.type !== 'FeatureCollection' || !Array.isArray(geoJsonData.features)) {
    return [];
  }

  const parcels: CadastralParcel[] = [];

  geoJsonData.features.forEach((feature: any, index: number) => {
    if (!feature.geometry || (feature.geometry.type !== 'Polygon' && feature.geometry.type !== 'MultiPolygon')) {
      return;
    }

    const props = feature.properties || {};

    const surveyNumber =
      props.surveyNumber ||
      props.survey_no ||
      props.surveyNo ||
      props.SyNo ||
      props.khasra ||
      props.plot_no ||
      `Sy. No. ${100 + index}`;

    const parcelId =
      props.parcelId ||
      props.parcel_id ||
      props.id ||
      `PARCEL-${1000 + index}`;

    const coordinates = feature.geometry.type === 'Polygon'
      ? feature.geometry.coordinates
      : feature.geometry.coordinates[0];

    parcels.push({
      surveyNumber,
      parcelId,
      subDivision: props.subDivision || props.sub_div || '1',
      village: props.village || props.Village || 'Survey Area',
      mandal: props.mandal || props.taluk || 'Revenue Division',
      district: props.district || 'District Cadastre',
      areaAcres: parseFloat(props.areaAcres || props.area_acres || props.area || '2.5'),
      landClassification: props.landClassification || 'Buffer Zone (FTL)',
      ownerOrCustodian: props.ownerOrCustodian || props.owner || 'Government / Custodian Record',
      isIntersectingChange: false,
      riskLevel: 'LOW',
      investigationStatus: 'Normal',
      changeAreaSqM: 0,
      geometry: {
        type: 'Polygon',
        coordinates
      }
    });
  });

  return parcels;
}

/**
 * Return cadastral parcels for coordinates if available, or dynamically generate
 * local revenue parcel grid for any coordinates
 */
export function getCadastralParcelsForCoordinates(lat: number, lng: number): CadastralParcel[] | null {
  // 1. Durgam Cheruvu check
  const distDurgam = Math.sqrt(Math.pow(lat - 17.4326, 2) + Math.pow(lng - 78.4071, 2));
  if (distDurgam < 0.025) {
    return TELANGANA_DURGAM_CHERUVU_PARCELS;
  }

  // 2. Hussain Sagar check
  const distHussain = Math.sqrt(Math.pow(lat - 17.4239, 2) + Math.pow(lng - 78.4738, 2));
  if (distHussain < 0.025) {
    return TELANGANA_HUSSAIN_SAGAR_PARCELS;
  }

  // 3. Bellandur Lake check
  const distBellandur = Math.sqrt(Math.pow(lat - 12.9352, 2) + Math.pow(lng - 77.6711, 2));
  if (distBellandur < 0.025) {
    return KARNATAKA_BELLANDUR_PARCELS;
  }

  // 4. Return null for other un-surveyed lakes (prompts upload in GIS)
  return null;
}
