

// make working with ordered pairs a little bit easier
export type OrderedPair<T=number, R=number> = { x: T;y: R;};
type OrderedPairs<T=number,R=number> = OrderedPair<T,R>[];

/** Checks if a value is a number */

export function isNumber(n: unknown): n is number{
  const isnum = typeof n === 'number';
  const isfinite = isnum && isFinite(n);
  const notnan = isnum && !isNaN(n);
  return isnum && isfinite && notnan;
}

/** Converts two arrays into an array of ordered pairs [ {'x': x[i], 'y' : y[i]} , ... ] . */
export function toOrderedPairs<T,R>(x: T[], y: R[]): OrderedPairs<T,R> {
  return x.map((x, i) => ({ x, y: y[i] }));
}

/** Get the arrays from an OrderedPair[] */
export function fromOrderedPairs<T,R>(pairs: OrderedPairs<T,R>): [T[], R[]] {
  return [pairs.map((pair) => pair.x), pairs.map((pair) => pair.y)];
}


/** apply a function to an array and get back the order pairs */
export function elementWise<Input=number, Output=number>(array: Input[], operation: (x: Input) => Output): OrderedPairs<Input,Output> {
  return array.map((x) => ({ x, y: operation(x) }));
}



// Functions just for testing

function _noise(x: number, n: number): number {
  return x + Math.random() * n - n / 2;
}


// TimeSeries equations
function fractionalYear(date: Date): number {
  // get fractional year
  const year = date.getFullYear();
  const start = new Date(year, 0, 0);
  const end = new Date(year, 11, 31, 23, 59, 59, 999);
  const diff = date.getTime() - start.getTime();
  const total = end.getTime() - start.getTime();
  return year + diff / total;
}



// function generate a fake time series and one with and without noise
export function generateFakeTimeSeries(start: Date, end: Date, n: number, noise: number = 0): OrderedPairs<Date> {
  // get a list of dates
  const dates = Array.from({ length: n }, (_, i) => start.getTime() + (end.getTime() - start.getTime()) * i / (n - 1));
  // get the sine of the fractional year. We want a 1 year period for test data
  const sine = dates.map( (date) => Math.sin(fractionalYear(new Date(date)) * 2 * Math.PI));
  // add noise if requested
  const out = noise ? sine.map(s => _noise(s,1)) : sine;
  // return the ordered pairs
  return toOrderedPairs(dates.map((d) => new Date(d)), out);
}


export function roundToNearest(val: number, nearest: number) {
  return Math.round(val / nearest) * nearest;
}

export function roundToNearestHalf(val: number) {
  return roundToNearest(val, 0.5);
}





// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function deepMerge(target: {[key: string]: any}, source: {[key: string]: any}): {[key: string]: any} {
  // copilot
  for (const key in source) {
    if (source[key] instanceof Object) {
      Object.assign(source[key], deepMerge(target[key], source[key]));
    }
  }
  Object.assign(target || {}, source);
  return target;
}




// eslint-disable-next-line @typescript-eslint/no-explicit-any
/**
 * Simple object check.
 * @param item
 * @returns {boolean}
 */
export function isObject<T>(item: T): boolean {
  return (item && typeof item === 'object' && !Array.isArray(item));
}

/**
 * Deep merge two objects.
 * @param target
 * @param ...sources
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function mergeDeep(target: any, ...sources: any) {
  if (!sources.length) return target;
  const source = sources.shift();

  if (isObject(target) && isObject(source)) {
    for (const key in source) {
      if (isObject(source[key])) {
        if (!target[key]) Object.assign(target, { [key]: {} });
        mergeDeep(target[key], source[key]);
      } else {
        Object.assign(target, { [key]: source[key] });
      }
    }
  }

  return mergeDeep(target, ...sources);
}



/** MAPBOX RELATED FUNCTIONS. PULLED FROM SolarEclipse2024.vue Mar6'24 (original by Jon Carifio) */

// The field names here come from MapBox
export interface MapBoxFeature {
  // eslint-disable-next-line @typescript-eslint/naming-convention
  place_type: string[];
  text: string;
  // eslint-disable-next-line @typescript-eslint/naming-convention
  properties: { short_code: string; };
}

export interface MapBoxFeatureCollection {
  type: "FeatureCollection";
  features: MapBoxFeature[];
}

const RELEVANT_FEATURE_TYPES = ["postcode", "place", "region", "country"];
const NA_COUNTRIES = ["United States", "Canada", "Mexico"];
const NA_ABBREVIATIONS = ["US-", "CA-", "MX-"];

function mapboxLocationText(location: MapBoxFeatureCollection): string {
  const relevantFeatures = location.features.filter(feature => RELEVANT_FEATURE_TYPES.some(type => feature.place_type.includes(type)));
  const placeFeature = relevantFeatures.find(feature => feature.place_type.includes("place")) ?? (relevantFeatures.find(feature => feature.place_type.includes("postcode")) ?? null);
  const pieces: string[] = [];
  if (placeFeature && placeFeature.text) {
    pieces.push(placeFeature.text);
  }
  const countryFeature = relevantFeatures.find(feature => feature.place_type.includes("country"));
  if (countryFeature) {
    let countryText: string | null = countryFeature.text;
    if (NA_COUNTRIES.includes(countryText)) {
      countryText = null;
      const regionFeature = relevantFeatures.find(feature => feature.place_type.includes("region"));
      if (regionFeature) {
        let stateCode = regionFeature.properties.short_code as string;
        if (stateCode) {
          if (NA_ABBREVIATIONS.some(abbr => stateCode.startsWith(abbr))) {
            stateCode = stateCode.substring(3);
          }
          pieces.push(stateCode);
        }
      }
    }
    if (countryText) {
      pieces.push(countryText);
    }
  }
  return pieces.join(", ");
}

export async function textForLocation(longitudeDeg: number, latitudeDeg: number): Promise<string> {
  const accessToken = process.env.VUE_APP_MAPBOX_ACCESS_TOKEN;
  const url = `https://api.mapbox.com/geocoding/v5/mapbox.places/${longitudeDeg},${latitudeDeg}.json?access_token=${accessToken}`;
  const mapBoxText = await fetch(url)
    .then(response => response.json())
    .then((result: MapBoxFeatureCollection) => {
      if (result.features.length === 0) {
        return null;
      }
      return mapboxLocationText(result);
    })
    .catch((_err) => null);
  if (mapBoxText) {
    return mapBoxText;
  } else {
    const ns = latitudeDeg >= 0 ? 'N' : 'S';
    const ew = longitudeDeg >= 0 ? 'E' : 'W';
    const lat = Math.abs(latitudeDeg).toFixed(3);
    const lon = Math.abs(longitudeDeg).toFixed(3);
    return `${lat}° ${ns}, ${lon}° ${ew}`;
  }
}

type Degrees = number;
export function sphereDistance(lat1: Degrees, lon1: Degrees, lat2: Degrees, lon2: Degrees): number {

  const φ1 = lat1 * Math.PI/180; // φ, λ in radians
  const φ2 = lat2 * Math.PI/180;
  const deltaPhi = (lat2-lat1) * Math.PI/180;
  const deltaLambda = (lon2-lon1) * Math.PI/180;

  const a = Math.sin(deltaPhi/2) * Math.sin(deltaPhi/2) +
            Math.cos(φ1) * Math.cos(φ2) *
            Math.sin(deltaLambda/2) * Math.sin(deltaLambda/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)); // angular distance
 
  return c;  
}


export function toHMS(milliseconds: number): string {
  const seconds = milliseconds / 1000;
  let dur = '';
  const h = Math.floor(seconds / 3600);
  dur += h > 0 ? h + 'h' : '';
  const m = Math.floor(seconds % 3600 / 60);
  dur += m > 0 ? m + 'm' : '';
  const s = Math.floor(seconds % 3600 % 60);
  dur += s > 0 ? s + 's' : '';
  return dur;
}

export function spaceHMS(hms: string): string {
  // take a string like 0h0m0s to 0h 0m 0s
  return hms.replace(/(\d)([hms])/g, '$1$2 ');
}