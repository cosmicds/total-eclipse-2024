/* eslint-disable @typescript-eslint/naming-convention */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable prefer-const */
/* eslint-disable @typescript-eslint/no-explicit-any */
// Javascript Solar Eclipse Explorer
//
// This code is being released under the terms of the GNU General Public
// License (http://www.gnu.org/copyleft/gpl.html) with the request that if
// you do improve on it or use it in your own site, please let us know at
// chris@obyrne.com  and  fred.espenak@nasa.gov    Thanks!
//
//http://eclipse.gsfc.nasa.gov/JSEX/JSEX-index.html
//
/*
Javascript Solar Eclipse Explorer
Version 1 by Chris O'Byrne and Fred Espenak - 2007.
(based on "Eclipse Calculator" by Chris O'Byrne and Stephen McCann - 2003)

This program is free software; you can redistribute it and/or
modify it under the terms of the GNU General Public License
as published by the Free Software Foundation; either version 2
of the License, or (at your option) any later version.

This program is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
GNU General Public License for more details.


Typescript version by John Arban Lewis 2024
Github: @johnarban
https://github.com/johnarban/eclipse_explorer
(Based on the Javascript Solar Eclipse Explorer by Chris O'Byrne and Fred Espenak - 2007)
This is released under the same terms as the original code.
This version is a direct port of the original code to typescript with minimal changes and retains
the original comments and structure. The original code can be found at:
https://eclipse.gsfc.nasa.gov/JSEX/program.js
The major changes include:
  - Removing all references to the document object
     - The eclipseform is now an global object
  - Two new functions `recalculateForObserver` and `recalculcateForObserverUTC` have been added
     - These rely on the new `setObserver` and Observer class. The rest of the function continues to use the global observer array. 
        The Observer class is a convenient container and allowed easier abstraction of the observer data.
TODO:
  - The observer class should be used throughout the code
  - Remove reliance on global variables
  - Use Date objects to store the times (instead of strings)
  - Properly handle the timezone, or else always use UTC, and only convert to local time for display
*/


import { EclipseForm, Observer, SunBSR,BSRArray, EclipseData, NoEclipseData, PartialEclipseData, TotalAnnularEclipseData } from "./eclipse_types";
import { SE2026 } from "./SE2026";
// export { EclipseForm, Observer, SunBSR,BSRArray, EclipseData, SE2026 };
//
// Observer constants -
// (0) North Latitude (radians)
// (1) West Longitude (radians)
// (2) Altitude (metres)
// (3) West time zone (hours)
// (4) rho sin O'
// (5) rho cos O'
// (6) index into the elements array for the eclipse in question
//
// Note that correcting for refraction will involve creating a "virtual" altitude
// for each contact, and hence a different value of rho and O' for each contact!
//

const obsvconst: any[] = [];

//
// Eclipse circumstances
//  (0) Event type (C1=-2, C2=-1, Mid=0, C3=1, C4=2)
//  (1) t
// -- time-only dependent circumstances (and their per-hour derivatives) follow --
//  (2) x
//  (3) y
//  (4) d
//  (5) sin d
//  (6) cos d
//  (7) mu
//  (8) l1
//  (9) l2
// (10) dx
// (11) dy
// (12) dd
// (13) dmu
// (14) dl1
// (15) dl2
// -- time and location dependent circumstances follow --
// (16) h
// (17) sin h
// (18) cos h
// (19) xi
// (20) eta
// (21) zeta
// (22) dxi
// (23) deta
// (24) u
// (25) v
// (26) a
// (27) b
// (28) l1'
// (29) l2'
// (30) n^2
// -- observational circumstances follow --
// (31) p
// (32) alt
// (33) q
// (34) v
// (35) azi
// (36) m (mid eclipse only) or limb correction applied (where available!)
// (37) magnitude (mid eclipse only)
// (38) moon/sun (mid eclipse only)
// (39) calculated local event type for a transparent earth (mid eclipse only)
//      (0 = none, 1 = partial, 2 = annular, 3 = total)
// (40) event visibility
//      (0 = above horizon, 1 = below horizon, 2 = sunrise, 3 = sunset, 4 = below horizon, disregard)
//

const c1: number[] = [];
const c2: number[] = [];
const mid: number[] = [];
const c3: number[] = [];
const c4: number[] = [];



let eclipseform = {
  latd: 32,
  latm: 42,
  lats: 0,
  lond: 117,
  lonm: 9,
  lons: 0,
  alt: 4,
  tzh: {
    selectedIndex: 8,
    options: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14],
  },
  tzm: {
    selectedIndex: 0,
    options: [0, 15, 35],
  },
  tzx: {
    selectedIndex: 'W',
    options: { "W": 1 , "E": -1 },
  },
  latx: {
    selectedIndex: 'N',
    options: { "N": 1 , "S": -1 },
  },
  lonx: {
    selectedIndex: 'W',
    options: { "W": 1 , "E": -1 },
  },
  cityndx: {
    selectedIndex: 0,
    value: undefined,
  },
  loc_name: "San Diego",
} as EclipseForm;




//
// Populate the circumstances array with the time-only dependent circumstances (x, y, d, m, ...)
function timedependent(elements: number[], circumstances: any[]) {
  consoleDebug("timedependent");
  let type, index, t, ans;

  t = circumstances[1];
  index = obsvconst[6];
  // Calculate x
  ans = elements[9 + index] * t + elements[8 + index];
  ans = ans * t + elements[7 + index];
  ans = ans * t + elements[6 + index];
  circumstances[2] = ans;
  // Calculate dx
  ans = 3.0 * elements[9 + index] * t + 2.0 * elements[8 + index];
  ans = ans * t + elements[7 + index];
  circumstances[10] = ans;
  // Calculate y
  ans = elements[13 + index] * t + elements[12 + index];
  ans = ans * t + elements[11 + index];
  ans = ans * t + elements[10 + index];
  circumstances[3] = ans;
  // Calculate dy
  ans = 3.0 * elements[13 + index] * t + 2.0 * elements[12 + index];
  ans = ans * t + elements[11 + index];
  circumstances[11] = ans;
  // Calculate d
  ans = elements[16 + index] * t + elements[15 + index];
  ans = ans * t + elements[14 + index];
  ans = (ans * Math.PI) / 180.0;
  circumstances[4] = ans;
  // sin d and cos d
  circumstances[5] = Math.sin(ans);
  circumstances[6] = Math.cos(ans);
  // Calculate dd
  ans = 2.0 * elements[16 + index] * t + elements[15 + index];
  ans = (ans * Math.PI) / 180.0;
  circumstances[12] = ans;
  // Calculate m
  ans = elements[19 + index] * t + elements[18 + index];
  ans = ans * t + elements[17 + index];
  if (ans >= 360.0) {
    ans = ans - 360.0;
  }
  ans = (ans * Math.PI) / 180.0;
  circumstances[7] = ans;
  // Calculate dm
  ans = 2.0 * elements[19 + index] * t + elements[18 + index];
  ans = (ans * Math.PI) / 180.0;
  circumstances[13] = ans;
  // Calculate l1 and dl1
  type = circumstances[0];
  if (type == -2 || type == 0 || type == 2) {
    ans = elements[22 + index] * t + elements[21 + index];
    ans = ans * t + elements[20 + index];
    circumstances[8] = ans;
    circumstances[14] = 2.0 * elements[22 + index] * t + elements[21 + index];
  }
  // Calculate l2 and dl2
  if (type == -1 || type == 0 || type == 1) {
    ans = elements[25 + index] * t + elements[24 + index];
    ans = ans * t + elements[23 + index];
    circumstances[9] = ans;
    circumstances[15] = 2.0 * elements[25 + index] * t + elements[24 + index];
  }
  return circumstances;
}

//
// Populate the circumstances array with the time and location dependent circumstances
function timelocdependent(elements: number[], circumstances: any[]) {
  consoleDebug("timelocdependent");
  let index, type;

  timedependent(elements, circumstances);
  index = obsvconst[6];
  // Calculate h, sin h, cos h
  circumstances[16] =
    circumstances[7] - obsvconst[1] - elements[index + 5] / 13713.44;
  circumstances[17] = Math.sin(circumstances[16]);
  circumstances[18] = Math.cos(circumstances[16]);
  // Calculate xi
  circumstances[19] = obsvconst[5] * circumstances[17];
  // Calculate eta
  circumstances[20] =
    obsvconst[4] * circumstances[6] -
    obsvconst[5] * circumstances[18] * circumstances[5];
  // Calculate zeta
  circumstances[21] =
    obsvconst[4] * circumstances[5] +
    obsvconst[5] * circumstances[18] * circumstances[6];
  // Calculate dxi
  circumstances[22] = circumstances[13] * obsvconst[5] * circumstances[18];
  // Calculate deta
  circumstances[23] =
    circumstances[13] * circumstances[19] * circumstances[5] -
    circumstances[21] * circumstances[12];
  // Calculate u
  circumstances[24] = circumstances[2] - circumstances[19];
  // Calculate v
  circumstances[25] = circumstances[3] - circumstances[20];
  // Calculate a
  circumstances[26] = circumstances[10] - circumstances[22];
  // Calculate b
  circumstances[27] = circumstances[11] - circumstances[23];
  // Calculate l1'
  type = circumstances[0];
  if (type == -2 || type == 0 || type == 2) {
    circumstances[28] =
      circumstances[8] - circumstances[21] * elements[26 + index];
  }
  // Calculate l2'
  if (type == -1 || type == 0 || type == 1) {
    circumstances[29] =
      circumstances[9] - circumstances[21] * elements[27 + index];
  }
  // Calculate n^2
  circumstances[30] =
    circumstances[26] * circumstances[26] +
    circumstances[27] * circumstances[27];
  return circumstances;
}

//
// Iterate on C1 or C4
function c1c4iterate(elements: any, circumstances: any[]) {
  consoleDebug("c1c4iterate");
  let sign, iter, tmp, n;

  timelocdependent(elements, circumstances);
  if (circumstances[0] < 0) {
    sign = -1.0;
  } else {
    sign = 1.0;
  }
  tmp = 1.0;
  iter = 0;
  while ((tmp > 0.000001 || tmp < -0.000001) && iter < 50) {
    n = Math.sqrt(circumstances[30]);
    tmp =
      circumstances[26] * circumstances[25] -
      circumstances[24] * circumstances[27];
    tmp = tmp / n / circumstances[28];
    tmp = (sign * Math.sqrt(1.0 - tmp * tmp) * circumstances[28]) / n;
    tmp =
      (circumstances[24] * circumstances[26] +
        circumstances[25] * circumstances[27]) /
        circumstances[30] -
      tmp;
    circumstances[1] = circumstances[1] - tmp;
    timelocdependent(elements, circumstances);
    iter++;
  }
  return circumstances;
}

//
// Get C1 and C4 data
//   Entry conditions -
//   1. The mid array must be populated
//   2. The magnitude at mid eclipse must be > 0.0
function getc1c4(elements: any) {
  consoleDebug("getc1c4");
  let tmp, n;

  n = Math.sqrt(mid[30]);
  tmp = mid[26] * mid[25] - mid[24] * mid[27];
  tmp = tmp / n / mid[28];
  tmp = (Math.sqrt(1.0 - tmp * tmp) * mid[28]) / n;
  c1[0] = -2;
  c4[0] = 2;
  c1[1] = mid[1] - tmp;
  c4[1] = mid[1] + tmp;
  c1c4iterate(elements, c1);
  c1c4iterate(elements, c4);
}

//
// Iterate on C2 or C3
function c2c3iterate(elements: any, circumstances: any[]) {
  consoleDebug("c2c3iterate");
  let sign, iter, tmp, n;

  timelocdependent(elements, circumstances);
  if (circumstances[0] < 0) {
    sign = -1.0;
  } else {
    sign = 1.0;
  }
  if (mid[29] < 0.0) {
    sign = -sign;
  }
  tmp = 1.0;
  iter = 0;
  while ((tmp > 0.000001 || tmp < -0.000001) && iter < 50) {
    n = Math.sqrt(circumstances[30]);
    tmp =
      circumstances[26] * circumstances[25] -
      circumstances[24] * circumstances[27];
    tmp = tmp / n / circumstances[29];
    tmp = (sign * Math.sqrt(1.0 - tmp * tmp) * circumstances[29]) / n;
    tmp =
      (circumstances[24] * circumstances[26] +
        circumstances[25] * circumstances[27]) /
        circumstances[30] -
      tmp;
    circumstances[1] = circumstances[1] - tmp;
    timelocdependent(elements, circumstances);
    iter++;
  }
  return circumstances;
}

//
// Get C2 and C3 data
//   Entry conditions -
//   1. The mid array must be populated
//   2. There must be either a total or annular eclipse at the location!
function getc2c3(elements: any) {
  consoleDebug("getc2c3");
  let tmp, n;

  n = Math.sqrt(mid[30]);
  tmp = mid[26] * mid[25] - mid[24] * mid[27];
  tmp = tmp / n / mid[29];
  tmp = (Math.sqrt(1.0 - tmp * tmp) * mid[29]) / n;
  c2[0] = -1;
  c3[0] = 1;
  if (mid[29] < 0.0) {
    c2[1] = mid[1] + tmp;
    c3[1] = mid[1] - tmp;
  } else {
    c2[1] = mid[1] - tmp;
    c3[1] = mid[1] + tmp;
  }
  c2c3iterate(elements, c2);
  c2c3iterate(elements, c3);
}

//
// Get the observational circumstances
function observational(circumstances: any[]) {
  consoleDebug("observational");
  let contacttype, coslat, sinlat;

  // We are looking at an "external" contact UNLESS this is a total eclipse AND we are looking at
  // c2 or c3, in which case it is an INTERNAL contact! Note that if we are looking at mid eclipse,
  // then we may not have determined the type of eclipse (mid[39]) just yet!
  if (circumstances[0] == 0) {
    contacttype = 1.0;
  } else {
    if (mid[39] == 3 && (circumstances[0] == -1 || circumstances[0] == 1)) {
      contacttype = -1.0;
    } else {
      contacttype = 1.0;
    }
  }
  // Calculate p
  circumstances[31] = Math.atan2(
    contacttype * circumstances[24],
    contacttype * circumstances[25]
  );
  // Calculate alt
  sinlat = Math.sin(obsvconst[0]);
  coslat = Math.cos(obsvconst[0]);
  circumstances[32] = Math.asin(
    circumstances[5] * sinlat + circumstances[6] * coslat * circumstances[18]
  );
  // Calculate q
  circumstances[33] = Math.asin(
    (coslat * circumstances[17]) / Math.cos(circumstances[32])
  );
  if (circumstances[20] < 0.0) {
    circumstances[33] = Math.PI - circumstances[33];
  }
  // Calculate v
  circumstances[34] = circumstances[31] - circumstances[33];
  // Calculate azi
  circumstances[35] = Math.atan2(
    -1.0 * circumstances[17] * circumstances[6],
    circumstances[5] * coslat - circumstances[18] * sinlat * circumstances[6]
  );
  // Calculate visibility
  if (circumstances[32] > -0.00524) {
    circumstances[40] = 0;
  } else {
    circumstances[40] = 1;
  }
}

//
// Get the observational circumstances for mid eclipse
function midobservational() {
  consoleDebug("midobservational");
  observational(mid);
  // Calculate m, magnitude and moon/sun
  mid[36] = Math.sqrt(mid[24] * mid[24] + mid[25] * mid[25]);
  mid[37] = (mid[28] - mid[36]) / (mid[28] + mid[29]);
  mid[38] = (mid[28] - mid[29]) / (mid[28] + mid[29]);
}

//
// Calculate mid eclipse
function getmid(elements: any) {
  consoleDebug("getmid");
  let iter, tmp;

  mid[0] = 0;
  mid[1] = 0.0;
  iter = 0;
  tmp = 1.0;
  timelocdependent(elements, mid);
  while ((tmp > 0.000001 || tmp < -0.000001) && iter < 50) {
    tmp = (mid[24] * mid[26] + mid[25] * mid[27]) / mid[30];
    mid[1] = mid[1] - tmp;
    iter++;
    timelocdependent(elements, mid);
  }
}

//
// Calculate the time of sunrise or sunset
function getsunriset(elements: any, circumstances: number[], riset: number) {
  consoleDebug("getsunriset");
  let h0, diff, iter;

  diff = 1.0;
  iter = 0;
  while (diff > 0.00001 || diff < -0.00001) {
    iter++;
    if (iter == 4) return;
    h0 = Math.acos(
      (Math.sin(-0.00524) - Math.sin(obsvconst[0]) * circumstances[5]) /
        Math.cos(obsvconst[0]) /
        circumstances[6]
    );
    diff = (riset * h0 - circumstances[16]) / circumstances[13];
    while (diff >= 12.0) diff -= 24.0;
    while (diff <= -12.0) diff += 24.0;
    circumstances[1] += diff;
    timelocdependent(elements, circumstances);
  }
}

//
// Calculate the time of sunrise
function getsunrise(elements: any, circumstances: any[]) {
  consoleDebug("getsunrise");
  getsunriset(elements, circumstances, -1.0);
}

//
// Calculate the time of sunset
function getsunset(elements: any, circumstances: any[]) {
  consoleDebug("getsunset");
  getsunriset(elements, circumstances, 1.0);
}

//
// Copy a set of circumstances
function copycircumstances(circumstancesfrom: any[], circumstancesto: any[]) {
  consoleDebug("copycircumstances");
  let i;

  for (i = 1; i < 41; i++) {
    circumstancesto[i] = circumstancesfrom[i];
  }
}

//
// Populate the c1, c2, mid, c3 and c4 arrays
function getall(elements: any) {
  consoleDebug("getall");
  let pattern;

  getmid(elements);
  midobservational();
  if (mid[37] > 0.0) {
    getc1c4(elements);
    if (mid[36] < mid[29] || mid[36] < -mid[29]) {
      getc2c3(elements);
      if (mid[29] < 0.0) {
        mid[39] = 3; // Total eclipse
      } else {
        mid[39] = 2; // Annular eclipse
      }
      observational(c1);
      observational(c2);
      observational(c3);
      observational(c4);
      c2[36] = 999.9;
      c3[36] = 999.9;
      // Calculate how much of the eclipse is above the horizon
      pattern = 0;
      if (c1[40] == 0) {
        pattern += 10000;
      }
      if (c2[40] == 0) {
        pattern += 1000;
      }
      if (mid[40] == 0) {
        pattern += 100;
      }
      if (c3[40] == 0) {
        pattern += 10;
      }
      if (c4[40] == 0) {
        pattern += 1;
      }
      // Now, time to make sure that all my observational[39] and observational[40] are OK
      if (pattern == 11110) {
        getsunset(elements, c4);
        observational(c4);
        c4[40] = 3;
      } else if (pattern == 11100) {
        getsunset(elements, c3);
        observational(c3);
        c3[40] = 3;
        copycircumstances(c3, c4);
      } else if (pattern == 11000) {
        c3[40] = 4;
        getsunset(elements, mid);
        midobservational();
        mid[40] = 3;
        copycircumstances(mid, c4);
      } else if (pattern == 10000) {
        mid[39] = 1;
        getsunset(elements, mid);
        midobservational();
        mid[40] = 3;
        copycircumstances(mid, c4);
      } else if (pattern == 1111) {
        getsunrise(elements, c1);
        observational(c1);
        c1[40] = 2;
      } else if (pattern == 111) {
        getsunrise(elements, c2);
        observational(c2);
        c2[40] = 2;
        copycircumstances(c2, c1);
      } else if (pattern == 11) {
        c2[40] = 4;
        getsunrise(elements, mid);
        midobservational();
        mid[40] = 2;
        copycircumstances(mid, c1);
      } else if (pattern == 1) {
        mid[39] = 1;
        getsunrise(elements, mid);
        midobservational();
        mid[40] = 2;
        copycircumstances(mid, c1);
      } else if (pattern == 0) {
        mid[39] = 0;
      }
      // There are other patterns, but those are the only ones we're covering!
    } else {
      mid[39] = 1; // Partial eclipse
      pattern = 0;
      observational(c1);
      observational(c4);
      if (c1[40] == 0) {
        pattern += 100;
      }
      if (mid[40] == 0) {
        pattern += 10;
      }
      if (c4[40] == 0) {
        pattern += 1;
      }
      if (pattern == 110) {
        getsunset(elements, c4);
        observational(c4);
        c4[40] = 3;
      } else if (pattern == 100) {
        getsunset(elements, mid);
        midobservational();
        mid[40] = 3;
        copycircumstances(mid, c4);
      } else if (pattern == 11) {
        getsunrise(elements, c1);
        observational(c1);
        c1[40] = 2;
      } else if (pattern == 1) {
        getsunrise(elements, mid);
        midobservational();
        mid[40] = 2;
        copycircumstances(mid, c1);
      } else if (pattern == 0) {
        mid[39] = 0;
      }
      // There are other patterns, but those are the only ones we're covering!
    }
  } else {
    mid[39] = 0; // No eclipse
  }
  // Magnitude for total and annular eclipse is moon/sun ratio
  if (mid[39] == 2 || mid[39] == 3) {
    mid[37] = mid[38];
  }
}

function parseFloat(value: string | number) {
  consoleDebug("parseFloat");
  return Number(value);
}

// get the latitude
function getLatitude() {
  consoleDebug("getLatitude");
  let o = eclipseform.latd + eclipseform.latm / 60 + eclipseform.lats / 3600;
  o = o * eclipseform.latx.options[eclipseform.latx.selectedIndex];
  return o;
}

// get the longitude
function getLongitude() {
  consoleDebug("getLongitude");
  let o = eclipseform.lond + eclipseform.lonm / 60 + eclipseform.lons / 3600;
  o = o * eclipseform.lonx.options[eclipseform.lonx.selectedIndex];
  return o;
}

// get the timezone
function getTimezone() {
  consoleDebug("getTimezone");
  let o = eclipseform.tzm.options[eclipseform.tzm.selectedIndex];
  o = eclipseform.tzh.options[eclipseform.tzh.selectedIndex] + o / 60.0;
  o = eclipseform.tzx.options[eclipseform.tzx.selectedIndex] * o;
  return o;
}

// observer type

// set the observer values
function setObserver(latDeg: number, lonDeg: number, altm: number, tz: number) {
  consoleDebug("setObserver");
  const observer = new Observer(latDeg, lonDeg, altm, tz);
  observer.getObserverConstants().forEach((value, index) => {
    obsvconst[index] = value;
  });
}



//
// Read the data that's in the form, and populate the obsvconst array
function readform() {
  consoleDebug("readform");

  // Write back to the form what we are parsing
  eclipseform.latd = Math.abs(parseFloat(eclipseform.latd));
  eclipseform.latm = Math.abs(parseFloat(eclipseform.latm));
  eclipseform.lats = Math.abs(parseFloat(eclipseform.lats));
  eclipseform.lond = Math.abs(parseFloat(eclipseform.lond));
  eclipseform.lonm = Math.abs(parseFloat(eclipseform.lonm));
  eclipseform.lons = Math.abs(parseFloat(eclipseform.lons));
  eclipseform.alt = Math.abs(parseFloat(eclipseform.alt));

  // Get the latitude
  const latDeg = getLatitude();

  // Get the longitude
  const lonDeg = getLongitude();

  // Get the altitude
  const alt = parseFloat(eclipseform.alt);

  // Get the time zone
  const tz = getTimezone();

  // Set the observer
  setObserver(latDeg, lonDeg, alt, tz);

  // The index of the selected eclipse...
  //obsvconst[6] = 28 * (parseInt(eclipseform.index.options[eclipseform.index.selectedIndex].value) + 65)
}

//
// Get the local date of an event
function getdate(elements: number[], circumstances: any[]) {
  consoleDebug("getdate");
  let t, ans, jd, a, b, c, d, e, index;

  index = obsvconst[6];
  // Calculate the JD for noon (TDT) the day before the day that contains T0
  jd = Math.floor(elements[index] - elements[1 + index] / 24.0);
  // Calculate the local time (ie the offset in hours since midnight TDT on the day containing T0).
  t =
    circumstances[1] +
    elements[1 + index] -
    obsvconst[3] -
    (elements[4 + index] - 0.5) / 3600.0;
  if (t < 0.0) {
    jd--;
  }
  if (t >= 24.0) {
    jd++;
  }
  if (jd >= 2299160.0) {
    a = Math.floor((jd - 1867216.25) / 36524.25);
    a = jd + 1 + a - Math.floor(a / 4);
  } else {
    a = jd;
  }
  b = a + 1525.0;
  c = Math.floor((b - 122.1) / 365.25);
  d = Math.floor(365.25 * c);
  e = Math.floor((b - d) / 30.6001);
  d = b - d - Math.floor(30.6001 * e);
  if (e < 13.5) {
    e = e - 1;
  } else {
    e = e - 13;
  }
  if (e > 2.5) {
    ans = c - 4716 + "-";
  } else {
    ans = c - 4715 + "-";
  }
  if (e < 10) {
    ans += "0";
  }
  ans += e + "-";
  if (d < 10) {
    ans = ans + "0";
  }
  ans = ans + d;
  return ans;
}

//
// Get the local time of an event
function gettime(elements: number[], circumstances: any[]): [string, SunBSR] {
  consoleDebug("gettime");
  let t, ans, index;

  ans = "";
  index = obsvconst[6];
  t =
    circumstances[1] +
    elements[1 + index] -
    obsvconst[3] -
    (elements[4 + index] - 0.5) / 3600.0;
  if (t < 0.0) {
    t = t + 24.0;
  }
  if (t >= 24.0) {
    t = t - 24.0;
  }
  if (t < 10.0) {
    ans = ans + "0";
  }
  ans = ans + Math.floor(t) + ":";
  t = t * 60.0 - 60.0 * Math.floor(t);
  if (t < 10.0) {
    ans = ans + "0";
  }
  ans = ans + Math.floor(t);
  // return the full time even if circumstances are b, s, r
  // modern js Date requires a seconds value
  // if (circumstances[40] <= 1) {
  //   // not sunrise or sunset
  //   ans = ans + ":";
  //   t = t * 60.0 - 60.0 * Math.floor(t);
  //   if (t < 10.0) {
  //     ans = ans + "0";
  //   }
  //   ans = ans + Math.floor(t);
  // }
  ans = ans + ":";
  t = t * 60.0 - 60.0 * Math.floor(t);
  if (t < 10.0) {
    ans = ans + "0";
  }
  ans = ans + Math.floor(t);
  if (circumstances[40] == 1) {
    // below horizon
    return [ans,'b'];
  } else if (circumstances[40] == 2) {
    // during sunrise
    return [ans,'r'];
  } else if (circumstances[40] == 3) {
    // during sunset
    return [ans,'s'];
  } else {
    return [ans,null];
  }
}

//
// Get the altitude
function getalt(circumstances: any[]): [number, SunBSR]{
  consoleDebug("getalt");
  let t, ans;

  if (circumstances[40] == 2) {
    return [0,'r'];
  }
  if (circumstances[40] == 3) {
    return [0,'s'];
  }
  if (circumstances[32] < 0.0 && circumstances[32] >= -0.00524) {
    // Crude correction for refraction (and for consistency's sake)
    t = 0.0;
  } else {
    t = (circumstances[32] * 180.0) / Math.PI;
  }
  if (t < 0.0) {
    ans = -1;
    t = -t;
  } else {
    ans = 1;
  }
  t = Math.floor(t + 0.5);
  if (t < 10.0) {
    // don't neet to zero pad
    // ans = ans + "0";
  }
  ans = ans * t;
  if (circumstances[40] == 1) {
    // below horizon
    return [ans,'b'];
  } else {
    return [ans,null];
  }
}

//
// Get the azimuth
function getazi(circumstances: any[]): number {
  consoleDebug("getazi");
  let t, ans;

  ans = "";
  t = (circumstances[35] * 180.0) / Math.PI;
  if (t < 0.0) {
    t = t + 360.0;
  }
  if (t >= 360.0) {
    t = t - 360.0;
  }
  t = Math.floor(t + 0.5);
  if (t < 100.0) {
    // don't need to zero pad
    // ans = ans + "0";
  }
  if (t < 10.0) {
    // don't need to zero pad
    // ans = ans + "0";
  }
  ans = ans + t;
  if (circumstances[40] == 1) {
    // below horizon
    return t;
  } else {
    return t;
  }
}

//
// Get the duration in mm:ss.s format
//
// Adapted from code written by Stephen McCann - 27/04/2001
function getduration() {
  consoleDebug("getduration");
  let tmp, ans;

  if (c3[40] == 4) {
    tmp = mid[1] - c2[1];
  } else if (c2[40] == 4) {
    tmp = c3[1] - mid[1];
  } else {
    tmp = c3[1] - c2[1];
  }
  if (tmp < 0.0) {
    tmp = tmp + 24.0;
  } else if (tmp >= 24.0) {
    tmp = tmp - 24.0;
  }
  tmp = tmp * 60.0 - 60.0 * Math.floor(tmp) + 0.05 / 60.0;
  ans = Math.floor(tmp) + "m";
  tmp = tmp * 60.0 - 60.0 * Math.floor(tmp);
  if (tmp < 10.0) {
    ans = ans + "0";
  }
  ans += Math.floor(tmp) + "s";
  return ans;
}

//
// Get the magnitude
function getmagnitude(): [number, SunBSR] {
  consoleDebug("getmagnitude");
  let a;

  a = Math.floor(1000.0 * mid[37] + 0.5) / 1000.0;
  if (mid[40] == 1) {
    // below horizon
    return [a,'b'];
  }
  if (mid[40] == 2) {
    // during sunrise
    return [a,'r'];
  }
  if (mid[40] == 3) {
    // during sunset
    return [a,'s'];
  }
  return [a,null];
}

//
// Get the coverage
function getcoverage(): [number, SunBSR]{
  consoleDebug("getcoverage");
  let a, b, c : number;

  if (mid[37] <= 0.0) {
    a = 0;
  } else if (mid[37] >= 1.0) {
    a = 1.000;
  } else {
    if (mid[39] == 2) {
      c = mid[38] * mid[38];
    } else {
      c = Math.acos(
        (mid[28] * mid[28] + mid[29] * mid[29] - 2.0 * mid[36] * mid[36]) /
          (mid[28] * mid[28] - mid[29] * mid[29])
      );
      b = Math.acos(
        (mid[28] * mid[29] + mid[36] * mid[36]) / mid[36] / (mid[28] + mid[29])
      );
      a = Math.PI - b - c;
      c = (mid[38] * mid[38] * a + b - mid[38] * Math.sin(c)) / Math.PI;
    }
    a = Math.floor(1000.0 * c + 0.5) / 1000.0;
  }
  if (mid[40] == 1) {
    // below horizon
    return [a,'b'];
  }
  if (mid[40] == 2) {
    // during sunrise
    a = [a,"r"];
  }
  if (mid[40] == 3) {
    // during sunset
    a = [a,"s"];
  }
  return [a as number,null];
}


// CALCULATE!
function calculatefor(el: number[]) {
  consoleDebug("calculatefor");
  
  let results = [] as EclipseData<string>[];

  const emptyEclipse = {
    date: "",            // ("Calendar Date"));
    type: "" as 'P' | 'A' | 'T' | "",               // ("Eclipse Type"));
    partialStart: ['', null] as BSRArray<string>,   // ("Partial Eclipse Begins"));
    sunAltStart: [0,null] as BSRArray<number>,      // ("Sun Alt"));
    centralStart: ['',null] as BSRArray<string>,     // ("A or T Eclipse Begins"));
    maxTime: ['',null] as BSRArray<string>,         // ("Maximum Eclipse"));
    maxAlt: [0,null] as BSRArray<number>,           // ("Sun Alt"));
    maxAzi: 0,                                      // ("Sun Azi"));
    centralEnd: ['',null] as BSRArray<string>,      // ("A or T Eclipse Ends"));
    partialEnd: ['',null] as BSRArray<string>,      // ("Partial Eclipse Ends"));
    sunAltEnd: [0,null] as BSRArray<number>,        // ("Sun Alt"));
    magnitude: [0,null] as BSRArray<number>,        // ("Eclipse Mag."));
    coverage: [0,null] as BSRArray<number>,         // ("Eclipse Obscuration"));
    duration: "",                                   // ("A or T Eclipse Duration"));
  } as EclipseData<string>;

  for (let i = 0; i < el.length; i += 28) {
    const o = {...emptyEclipse};
    obsvconst[6] = i;
    getall(el);
    // Is there an event...
    if (mid[39] > 0) {
      o.date = getdate(el, mid);
      if (mid[39] == 1) {
        o.type = "P";
      } else if (mid[39] == 2) {
        o.type = "A";
      } else {
        o.type = "T";
      }

      // Partial eclipse start
      if (c1[40] == 4) {
        continue;
      } else {
        // Partial eclipse start time
        o.partialStart = gettime(el, c1);
        o.sunAltStart = getalt(c1);
      }
      // Central eclipse time
      if (mid[39] > 1 && c2[40] != 4) {
        o.centralStart = gettime(el, c2);
      } else {
        o.centralStart = ['', null];
      }

      // Maximum eclipse time
      o.maxTime = gettime(el, mid);
      // Maximum eclipse alt
      o.maxAlt = getalt(mid);
      // Maximum eclipse azi
      o.maxAzi = getazi(mid);

      // Central eclipse ends
      if (mid[39] > 1 && c3[40] != 4) {
        // if we are in P, A, or T
        o.centralEnd = gettime(el, c3);
      } else {
        o.centralEnd = ["",null];
      }

      // Partial eclipse ends
      if (c4[40] == 4) {
        continue;
      } else {
        // Partial eclipse ends
        o.partialEnd = gettime(el, c4);
        o.sunAltEnd = getalt(c4);
      }
      // Eclipse magnitude
      o.magnitude = getmagnitude();
      // Eclipse coverage
      o.coverage = getcoverage();

      if (mid[39] > 1) {
        o.duration = getduration();
      } else {
        o.duration = "";
      }
    }
    results.push(o);
    consoleDebug(o);
  }
  return results;
}




function recalculate() {
  readform();
  const result = calculatefor(SE2026());
}

const DEBUG = false;
// create a wrapper for console.log with
function consoleDebug(...data: any[]) {
  if (DEBUG) {
    console.log(...data);
  }
}

// recalculate();

// the reads in data using the convention of the original form, and returns strings for the time.
export function recalculateForObserver(latDeg: number, latDir: 'N' | 'S', lonDeg: number, lonDir: 'E' | 'W', alt: number, tz: number = 0, tzDir: 'W' | 'E' = 'W') {
  // warning: the code uses the West positive convention for longitude
  // warning: the code does not account for daylight saving time. Use the appropriate timezone value (or 0 for UTC: default)
  const latSign = eclipseform.latx.options[latDir];
  const lonSign = eclipseform.lonx.options[lonDir];
  const tzSign = eclipseform.tzx.options[tzDir];
  setObserver(latSign * Math.abs(latDeg), lonSign * Math.abs(lonDeg), alt, tzSign * Math.abs(tz));
  const result = calculatefor(SE2026());
  return result;
}

/* ========================================================================== */
// The following section of code provides more modern outputs for the dates 
// and times using Date objects
// ========================================================================== */

function dateAndtTimeToDate(date: string | null, time: string | null) {
  // date is formatted as "YYYY-Mon-DD" and time is formatted as "HH:MM:SS" in UTC
  if (date === "" || time === "" || date === null || time === null) {
    return null;
  }
  const [year, month, day] = date.split('-');
  const [hour, minute, second] = time.split(':');
  const timestring = `${year}-${month}-${day}T${hour}:${minute}:${second}Z`;
  return new Date(timestring);
  
}


function convertEclipseData(value: EclipseData<string>): EclipseData<Date> {
  // make the type broader so we can reassign some values
  const out = {...value} as EclipseData<Date | string>;

  out.partialStart[0] = dateAndtTimeToDate(value.date, value.partialStart[0]);
  out.centralStart[0] = dateAndtTimeToDate(value.date, value.centralStart[0]);
  out.maxTime[0] = dateAndtTimeToDate(value.date, value.maxTime[0]);
  out.centralEnd[0] = dateAndtTimeToDate(value.date, value.centralEnd[0]);
  out.partialEnd[0] = dateAndtTimeToDate(value.date, value.partialEnd[0]);
  if (value.type === 'P') {
    return out as PartialEclipseData<Date>;
  } else if (value.type === 'A' || value.type === 'T') {
    return out as TotalAnnularEclipseData<Date>;
  } else {
    return out as NoEclipseData<Date>;
  }
}


// function to convert EclipseData<string> to EclipseData<Date>
function convertEclipseDataList(value: EclipseData<string>[]): EclipseData<Date>[] {
  return value.map(convertEclipseData);
}


export function recalculateForObserverUTC(latDeg: number, lonDeg: number, alt: number): EclipseData<Date>[] {
  // use UTC timezone and correct longitude for the the West positive convention used in the code
  setObserver(latDeg, -lonDeg, alt, 0);
  const result = calculatefor(SE2026());
  return convertEclipseDataList(result) as EclipseData<Date>[];
}
