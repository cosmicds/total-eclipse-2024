<template>
  <div class="map-container">
  </div>
</template>

<script lang="ts">
import L, { LeafletMouseEvent, Map, TileLayerOptions } from "leaflet";
import "leaflet/dist/leaflet.css";
import { notify } from "@kyvg/vue3-notification";
import { defineComponent, PropType } from "vue";

export interface LocationDeg {
  longitudeDeg: number;
  latitudeDeg: number;
}

interface MapOptions extends TileLayerOptions {
  templateUrl: string;
  initialLocation?: LocationDeg;
  initialZoom?: number;
}

interface GeoJSONProp {
  url?: string;
  geojson?: GeoJSON.FeatureCollection | GeoJSON.Feature | GeoJSON.GeometryCollection;
  style: Record<string,any>;  // eslint-disable-line @typescript-eslint/no-explicit-any
}

interface Place extends LocationDeg { 
  color?: string;
  fillColor?: string;
  fillOpacity?: number;
  radius?: number;
  name?: string;
}

const defaultMapOptions: MapOptions = {
  templateUrl: 'https://{s}.google.com/vt/lyrs=p&x={x}&y={y}&z={z}',
  minZoom: 1,
  maxZoom: 20,
  subdomains:['mt0','mt1','mt2','mt3'],
  attribution: `&copy <a href="https://www.google.com/maps">Google Maps</a>`,
  className: 'map-tiles'
};

interface CloudData {
  lat: number;
  lon: number;
  cloudCover: number;
}

export default defineComponent({

  emits: ["place", "update:modelValue", "error", "dataclick", "finishLoading"],

  props: {
    activatorColor: {
      type: String,
      default: "#ffffff"
    },
    showCloudCover: {
      type: Boolean,
      default: false
    },
    detectLocation: {
      type: Boolean,
      default: true
    },
    modelValue: {
      type: Object as PropType<LocationDeg>,
      default() {
        return {
          latitudeDeg: 42.3814,
          longitudeDeg: -71.1281
        };
      }
    },
    mapOptions: {
      type: Object as PropType<MapOptions>,
      default() {
        return defaultMapOptions;
      }
    },
    initialPlace: {
      type: Object as PropType<Place>,
      default: null
    },
    places: {
      type: Array as PropType<Place[]>,
      default() {
        return [];
      }
    },
    placeCircleOptions: {
      type: Object as PropType<Record<string, any>>,  // eslint-disable-line @typescript-eslint/no-explicit-any
      default() {
        return {
          color: "#0000FF",
          fillColor: "#3333FF",
          fillOpacity: 0.5,
          radius: 150 
        };
      }
    },
    placeSelectable: {
      type: Boolean,
      default: true
    },
    selectable: {
      type: Boolean,
      default: true
    },
    selectedCircleOptions: {
      type: Object as PropType<Record<string,any>>,  // eslint-disable-line @typescript-eslint/no-explicit-any
      default() {
        return {
          color: "#FF0000",
          fillColor: "#FF0033",
          fillOpacity: 0.5,
          radius: 200
        };
      }
    },
    selectionEvent: {
      type: String as PropType<'click' | 'dblclick'>,
      default: 'click'
    },
    worldRadii: {
      type: Boolean,
      default: false
    },
    
    geoJsonFiles: {
      type: Array as PropType<GeoJSONProp[]>,
      default: () => []
    },
    
    selectedCloudCover: {
      type:  Array as PropType<CloudData[]>,
      default: null
    },
    
    cloudCoverOpacityFunction: {
      type: Function,
      default: (c: number) => c >= 0.05 ? 0.2 + Math.pow(c,1.5) * .8 : c
    },
    
    rectangleDegrees: {
      type: Number,
      default: 1
    }
  },

  mounted() {
    if (this.initialPlace) {
      this.selectedPlace = this.initialPlace;
    }
    if (this.detectLocation) {
      this.getLocation(true);
    }
    this.setup(true);

    // We shouldn't need to ever reset this,
    // unlike the regular setup which can get called again
    this.setupResizeObserver();
  },

  data() {
    return {
      resizeObserver: null as ResizeObserver | null,
      eclipsePath: [] as L.GeoJSON[],
      placeCircles: [] as L.CircleMarker[],
      hoveredPlace: null as Place | null,
      selectedCircle: null as L.CircleMarker | null,
      selectedPlace: null as Place | null,
      selectedPlaceCircle: null as L.CircleMarker | null,
      cloudCoverRectangles: L.layerGroup(),
      map: null as Map | null,
      basemap: null as L.TileLayer | null,
      fromInside: null as boolean | null,
      rectanglesCreated: false,
      index: {} as { [key: string]: number }
    };
  },

  methods: {

    setupResizeObserver() {
      const container = document.querySelector("#map-container") as HTMLDivElement;
      this.resizeObserver = new ResizeObserver(() => {
        this.map?.invalidateSize();
      });
      this.resizeObserver.observe(container);
    },
    
    // eslint-disable-next-line @typescript-eslint/naming-convention
    parseResult(result: CloudData[]) {
      if (this.cloudCoverRectangles === null) {
        return;
      }

      // Create an index mapping indices to rectangle layers
      this.index = {};

      result.forEach((row: {'lat': number, 'lon': number, 'cloudCover': number}, index: number) => {
        const lat = row.lat;
        const lon = row.lon;
        const cloudCover = row.cloudCover;

        if (isNaN(lat) || isNaN(lon) || isNaN(cloudCover)) {
          return;
        }

        // Construct index key
        const key = `${lat},${lon}`;

        // Store cloudCover value in index
        this.index[key] = index;

        const rect = this.createRectangle(lat, lon, cloudCover, index);
        if (rect) {
          this.cloudCoverRectangles.addLayer(rect);
        }
      });

      // Add rectangles to the map
      if (this.map !== null) {
        this.cloudCoverRectangles.addTo(this.map as Map);
      } else {
        return;
      }

      this.$emit('finishLoading');
    },

    
    createRectangle(lat: number, lon: number, cloudCover: number, index: number): L.Rectangle {
      const color = this.getColor(cloudCover);
      
      const rect = L.rectangle([
        [lat + this.rectangleDegrees / 2, lon - this.rectangleDegrees / 2],
        [lat - this.rectangleDegrees / 2, lon + this.rectangleDegrees / 2],
      ], {
        stroke: true,
        color: color,
        weight: .01,
        opacity: cloudCover,
        fillColor: color,
        fillOpacity: this.cloudCoverOpacityFunction(cloudCover)
      });
      rect.on('click', () => {
        console.log('dataclick', { lat, lon, cloudCover, index});
        this.$emit('dataclick', { lat, lon, cloudCover, index});
      });
      return rect;
    },
    
    sigmoid(val: number | null): number {
      if (val === null) {
        return 0;
      }
      // return sigmoid
      const y = (val - 0.5) / .12;
      const z = Math.exp(y);
      return z / (1 + z);
    },
    

    getColor(_cloudCover:number) {
      // Calculate HSL color based on a gradient
      const hue = 0;
      const saturation = '0%';
      const lightness = '100%'; // 50% to 100%

      return `hsla(${hue}, ${saturation}, ${lightness},.9)`;
    },    
    
    getLocation(startup=false) {
      const options = { timeout: 10000, enableHighAccuracy: true };

      navigator.geolocation.getCurrentPosition(
        (position) => {
          this.updateValue({
            longitudeDeg: position.coords.longitude,
            latitudeDeg: position.coords.latitude
          });

          if (this.map) {
            this.map.setView([position.coords.latitude, position.coords.longitude], this.map.getZoom());
          }
        },
        (_error) => {
          const msg = "Unable to autodetect location. Location will default to Cambridge, MA, USA, or you can\nuse the location selector to manually input a location.";
          if (startup) {
            notify({
              group: "startup-location",
              type: "error",
              text: msg,
              duration: 4500
            });
          } else {
            this.$emit("error", msg);
          }
        },
        options
      );
    },
    
    sameLoc(loc1: LocationDeg, loc2: LocationDeg): boolean {
      return loc1.latitudeDeg === loc2.latitudeDeg && loc1.longitudeDeg === loc2.longitudeDeg;
    },

    circleForLocation(location: LocationDeg, circleOptions: Record<string,any>): L.CircleMarker {  // eslint-disable-line @typescript-eslint/no-explicit-any
      return this.circleMaker([location.latitudeDeg, location.longitudeDeg], circleOptions);
    },

    circleForSelection() : L.CircleMarker | null {
      if (this.selectedPlace) {
        return null;
      }
      const circle = this.circleForLocation(this.modelValue, { ...this.selectedCircleOptions, interactive: false });
      circle.bringToFront();
      return circle;
    },

    circleForPlace(place: Place): L.CircleMarker {
      const options = (place === this.selectedPlace) ? this.selectedCircleOptions : this.placeCircleOptions;
      const circle = this.circleForLocation(place, options);
      if (place.name) {
        circle.bindTooltip(place.name);
      }
      return circle;
    },

    onPlaceSelect(place: Place) {
      this.fromInside = true;
      this.updateValue({
        longitudeDeg: place.longitudeDeg,
        latitudeDeg: place.latitudeDeg
      });
      this.$emit('place', place);
      this.selectedPlace = place;
    },

    onMapSelect(event: LeafletMouseEvent) {
      this.fromInside = true;
      let longitudeDeg = event.latlng.lng + 180;
      longitudeDeg = ((longitudeDeg % 360) + 360) % 360;  // We want modulo, but JS % operator is remainder
      longitudeDeg -= 180;
      this.selectedPlace = null;
      this.updateValue({
        latitudeDeg: event.latlng.lat,
        longitudeDeg
      });
    },

    setup(initial=false) {
      console.log('setup', initial);
      const mapContainer = this.$el as HTMLDivElement;
      const location: L.LatLngExpression = initial && this.mapOptions.initialLocation ?
        this.locationToLatLng(this.mapOptions.initialLocation) :
        this.latLng;

      const initialZoom = this.mapOptions.initialZoom ?? 4;
      const zoom = initial ? initialZoom : (this.map?.getZoom() ?? initialZoom);
      const map = L.map(mapContainer, {renderer: new L.Canvas()}).setView(location, zoom);

      const options = { ...defaultMapOptions, ...this.mapOptions };
      this.basemap = L.tileLayer(options.templateUrl, options);
      this.basemap.addTo(map);


      this.placeCircles = this.places.map(place => this.circleForPlace(place));
      this.placeCircles.forEach((circle, index) => {
        circle.on('mouseover', () => {
          const place = this.places[index];
          this.hoveredPlace = place;
          circle.openTooltip([place.latitudeDeg, place.longitudeDeg]);
        });

        if (this.placeSelectable) {
          circle.on('click', () => {
            this.onPlaceSelect(this.places[index]);
          });
        }

        circle.on('mouseout', () => {
          this.hoveredPlace = null;
        });

        circle.addTo(map);
      });

      this.selectedCircle = this.circleForSelection();
      this.selectedCircle?.addTo(map);

      map.doubleClickZoom.disable();
      if (this.selectable) {
        map.on(this.selectionEvent, this.onMapSelect);
      }

      map.attributionControl.setPrefix('<a href="https://leafletjs.com" title="A JavaScript library for interactive maps" target="_blank" rel="noopener noreferrer" >Leaflet</a>');
      
      // show the geojson files
      this.geoJsonFiles.forEach((geojsonrecord) => {
        const url = geojsonrecord.url;
        const geo = geojsonrecord.geojson;
        const style = geojsonrecord.style;
        if (url) {
          fetch(url)
            .then((response) => response.json())
            .then((data) => {
              const geoJSON = L.geoJSON(data, { style }).addTo(map);
              if (url.includes("center")) {
                geoJSON.bringToFront();
                this.eclipsePath.push(geoJSON);
              }
            })
            .catch((error) => {
              console.error('Error:', error);
            }); 
        } else if (geo) {
          L.geoJSON(geo, {
            style: style,
            pointToLayer: function (feature, latlng) {
              if (feature.properties.absoluteRadius) {
                style.radius = feature.properties.absoluteRadius;
                return L.circle(latlng, style);
              } else {
                return L.circleMarker(latlng, style);
              }
              
            },
            onEachFeature: function (feature, layer) {
              if (feature.properties && feature.properties.popupContent) {
                layer.bindPopup(feature.properties.popupContent);
              }
            }
          }).addTo(map);
        }
      });

      this.eclipsePath.map(g => g.bringToFront());
      this.selectedCircle?.bringToFront();
      
      this.map = map;
      
      this.updateCloudCover(this.showCloudCover);
      this.bringLocationAndPathToFront();
    },

    updateValue(value: LocationDeg) {
      this.$emit('update:modelValue', value);
    },

    updateCircle() {
      if (this.map) {
        this.selectedCircle?.remove();
        this.selectedCircle = this.circleForSelection();
        if (this.selectedCircle) {
          this.selectedCircle.addTo(this.map as Map); // Not sure why, but TS is cranky w/o the Map cast
          this.bringLocationAndPathToFront();
        }
      }
    },

    bringLocationAndPathToFront() {
      this.eclipsePath.map(g => g.bringToFront());
      this.selectedCircle?.bringToFront();
    },

    locationToLatLng(location: LocationDeg): L.LatLngExpression {
      return [location.latitudeDeg, location.longitudeDeg];
    },

    updateRectangleIntensity(val: number | null = null): void {
      (this.cloudCoverRectangles as L.LayerGroup<L.Rectangle>).eachLayer((layer) => {
        if (layer instanceof L.Rectangle) {
          const latLng = layer.getBounds().getCenter();
          const lat = latLng.lat;
          const lon = latLng.lng;
          const key = `${lat},${lon}`;

          const cloudCover = val ?? this.selectedCloudCover[this.index[key]]?.cloudCover;
          if (cloudCover !== undefined) {
            layer.setStyle({fillOpacity: this.cloudCoverOpacityFunction(cloudCover), opacity: cloudCover });
          }
        }
      });
      this.$emit('finishLoading');
    },


    updateCloudCover(value: boolean) {
      if (value) {
        // If rectangles have been created already, update their intensity
        if (this.rectanglesCreated) {
          this.updateRectangleIntensity();
        } else {
          // If rectangles haven't been created yet, run parseResult to create them
          this.parseResult(this.selectedCloudCover);
          this.rectanglesCreated = true; // Set the flag to true
        }
      } else {
        // Clear cloud cover rectangles if value is false
        // this.cloudCoverRectangles.clearLayers();
        // this.rectanglesCreated = false; // Reset the flag
        // set opacity to 0 instead of clearing re: J.C.
        this.updateRectangleIntensity(0);
      }
    },

  },

  computed: {
    circleMaker(): (latlng: L.LatLngExpression, options: L.CircleMarkerOptions) => L.CircleMarker {
      return this.worldRadii ? L.circle : L.circleMarker;
    },
    latLng(): L.LatLngExpression {
      return this.locationToLatLng(this.modelValue);
    },
    
    pixelSize(): number {
      // not used but eventually
      if (this.selectedCloudCover === null) {
        return 0;
      }
      const lats = Array.from(new Set(this.selectedCloudCover?.map((row) => row.lat))).sort();
      const lons = Array.from(new Set(this.selectedCloudCover?.map((row) => row.lon))).sort();
      // get difference between consecutive latitudes
      // average of the differences is the pixel size
      const latDiff = lats.map((val, index, arr) => index === 0 ? 0 : val - arr[index - 1]);
      const lonDiff = lons.map((val, index, arr) => index === 0 ? 0 : val - arr[index - 1]);
      const latAvg = latDiff.reduce((a, b) => a + b, 0) / latDiff.length;
      const lonAvg = lonDiff.reduce((a, b) => a + b, 0) / lonDiff.length;
      return (latAvg + lonAvg) / 2;
    }
  },

  watch: {

    selectedCloudCover(val: CloudData[] | null) {
      if (val !== null && val !== undefined) {
        //this.updateRectangleIntensity();
        this.updateCloudCover(this.showCloudCover);
        this.bringLocationAndPathToFront();
      }
    },
    
    modelValue(loc: LocationDeg, oldLoc: LocationDeg) {
      this.updateCircle();
      const needZoom = !this.fromInside && !this.sameLoc(loc, oldLoc);
      if (this.map && (!this.map.getBounds().contains(this.latLng) || needZoom)) {
        this.map.setView(this.latLng, needZoom ? 6 : this.map.getZoom());
      }
      this.fromInside = false;
    },
    
    mapOptions(newOptions: MapOptions, oldOptions: MapOptions) {
      if (oldOptions === null || newOptions === null) {
        return;
      }
      if (newOptions.templateUrl !== oldOptions.templateUrl) {
        this.basemap?.setUrl(newOptions.templateUrl ?? defaultMapOptions.templateUrl);
      }
    },
    
    
    showCloudCover(value: boolean) {
      this.updateCloudCover(value);
      this.bringLocationAndPathToFront();
    },
    places() {
      this.map?.remove();
      this.setup();
    },
    selectedPlace(newPlace) {
      const index = this.places.indexOf(newPlace);
      const oldSelectedCircle = this.selectedPlaceCircle;
      this.selectedPlaceCircle = this.placeCircles[index];

      oldSelectedCircle?.setStyle(this.placeCircleOptions);
      this.selectedPlaceCircle?.setStyle(this.selectedCircleOptions);
    }
  }
  
});
</script>

<style lang="less">
.map-container {
  height: 100%;
  width: 100%;
  margin: auto;
  padding: 0;
  border-radius: 5px;

  .leaflet-control-container {
    height: 100%;
    position: relative;
  }
  
  .leaflet-bottom.leaflet-right::before {
    content: " Credit: © Leaflet.js";
    top: 100%;
    left: 100%;
    transform: translate(-100%, -100%);
    pointer-events: auto;
  }

  .leaflet-bottom.leaflet-right::before {
    /* match formatting for actual attribution */
    color: #0078a8;
    background-color: rgba(255,255,255,0.8);
    font-size: 0.75em;
    padding-inline: 0.5em;
    padding-block: 0.3em;
  }

  .leaflet-bottom.leaflet-right:hover::before {
    content: "";
    background-color: transparent;
  }

  .leaflet-bottom.leaflet-right:hover > .leaflet-control-attribution {
    display: block;
  }


  .leaflet-control-attribution {
    display: none;
  }

  path.leaflet-interactive:focus {
    outline: none;
  }

  path.leaflet-interactive:focus-visible {
    outline: auto 5px black;
  }

  
}
</style>
