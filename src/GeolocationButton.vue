<template>
  <span :id="`geolocation-wrapper+${id}`" class="geolocation">
    <span v-if="showPermissions">Geolocation {{ permissions }} </span>
    <span v-if="showPermissions">location {{ geolocation }} </span>
    <span v-if="showPermissions">counter {{ counter }} </span>
    <p v-if="showPermissions" v-html=msg> </p>
    <v-btn 
      v-if="!hideButton"
      class="geolocation-button"
      :density="density"
      :size="size"
      :variant="geolocation ? (useTextButton ? 'tonal' : 'flat') : 'outlined'"
      :elevation="elevation"
      :loading="loading"
      :icon="useTextButton ? undefined : icon"
      :prepend-icon="useTextButton ? icon : undefined"
      :color="geolocationError ? 'red' : color"
      @click="getLocation" 
      :text="useTextButton ? label : undefined"
    />


    <span v-if="(showTextProgress || showProgressCircle) && loading && hideButton && permissionGranted">
      <v-progress-circular
        v-if="showProgressCircle"
        :size="progressCircleSize"
        :width="2"
        :color="color"
        indeterminate
      ></v-progress-circular> 
      <span v-if="showTextProgress">Fetching location</span>
    </span>

    <span v-if="(showTextProgress ) && loaded">
      <span v-if="showTextProgress"><v-icon size="small" icon="mdi-check-circle-outline"></v-icon> Using your location</span>
    </span>

    <span class="geolocation-text" v-if="showTextLabel && !useTextButton">
      <slot>
      {{ label }}
      </slot>
    </span>
    
    <span class="geolocation-coords" v-if="showCoords">
      <p>Latitude: {{ geolocation?.latitude }}</p>
      <p>Longitude: {{ geolocation?.longitude }}</p>
    </span>
    
  </span>
  

</template>


<script lang="ts">
import { defineComponent } from 'vue';
import { VBtn } from 'vuetify/components/VBtn';
import { VProgressCircular } from 'vuetify/lib/components/index.mjs';

type Density = null | 'default' | 'comfortable' | 'compact';

export default defineComponent({
  
  name: 'GeolocationButton',


  components: {
    'v-btn': VBtn,
    'v-progress-circular': VProgressCircular,
  },

  props: {
    color: {
      type: String,
      default: 'white',
    },
    debug: {
      type: Boolean,
      default: false,
    },


    disabled: {
      type: Boolean,
      default: false,
    },

    size: {
      type: String,
      default: 'small',
    },

    density: {
      type: String as () => Density,
      default: 'comfortable',
    },


    elevation: {
      type: String,
      default: "2",
    },

    hideButton: {
      type: Boolean,
      default: false,
    },

    showTextLabel: {
      type: Boolean,
      default: false,
    },

    showCoords: {
      type: Boolean,
      default: false,
    },

    showTextProgress: {
      type: Boolean,
      default: false,
    },
    
    showProgressCircle: {
      type: Boolean,
      default: true,
    },

    useTextButton: {
      type: Boolean,
      default: false,
    },

    progressCircleSize: {
      type: Number,
      default: 12,
    },
      

    label: {
      type: String,
      default: 'My Location',
    },

    id: {
      type: String,
      default: null,
    },

    trueIcon: {
      type: String,
      default: 'mdi-crosshairs-gps',
    },

    falseIcon: {
      type: String,
      default: 'mdi-crosshairs',
    },
    
    backgroundColor: {
      type: String,
      default: 'black',
    },
    
    showPermissions: {
      type: Boolean,
      default: false,
    },
    
  },

  emits: {
    // declare emits but w/o any verification. -_- 
    geolocation: (_payload: GeolocationCoordinates) => true,
    error: (_payload: GeolocationPositionError) => true,
    permission: (_payload: boolean | string) => true,
    permissionDenied: (_payload: boolean) => true,
  },
  
  data() {
    return {
      geolocation: null as GeolocationCoordinates | null,
      geolocationError: null as GeolocationPositionError | null,
      permissions: '',
      permissionGranted: false,
      loading: false,
      loaded: false,
      emitLocation: false,
      noPermissionsApi: false,
      counter: 0,
      msg: ''
    };
  },
  
  created() {
  },
  
  mounted() {
    
    // Check the Permissions API to see if the user has
    // granted the browser permission to access their location
    if (!navigator.permissions) {
      console.error('Permissions API not supported');
      this.noPermissionsApi = true;
      this.$emit('permission', 'denied');
      return;
    }
    const query = navigator.permissions.query({ name: 'geolocation' });
    query.then((result) => {
      this.handlePermission(result);
      result.onchange= () => {
        this.handlePermission(result);
      };
    });
    
    
  },

  computed: {
    icon() {
      return this.geolocation ? this.trueIcon : this.falseIcon;
    },
  },

  methods: {
    
    handlePermission(result: PermissionStatus) { 
      
      if (result.state === 'granted') {
        this.permissionGranted = true;
        this.debugmsg('Permission granted');
        
      } else if (result.state === 'prompt') {
        
        this.debugmsg('Permission prompt');
        
      } else if (result.state === 'denied') {

        this.debugmsg('Permission denied');

      }
      this.permissions = result.state;
    },
    
    
    handlePosition(position: GeolocationPosition) {
      // Handle the position
      this.geolocation = position.coords;
      this.geolocationError = null;
    },
    
    handleGeolocationError(error: GeolocationPositionError) {
      // Handle the error
      
      console.error('Geolocation error:', error);
      
      if (this.permissions === 'prompt') {
        const url = "https://www.lifewire.com/turn-on-mobile-location-services-4156232";
        this.geolocationError = {
          code: 1,
          message: `Location access was denied. Try enabling location services for your browser in system settings. (This feature might not work on Safari on some iPhones). <a href="${url}" target="_blank" rel="noopener noreferrer">Help</a>`,
        } as GeolocationPositionError;
      } else {
        this.geolocationError = error;
      }
      
    },
    
    geolocate(showLoading=true) {
      
      if (this.geolocation) {
        this.$emit('geolocation', this.geolocation);
        return;
      }
      
      const options = {
        enableHighAccuracy: true,
        timeout: 60 * 1000, // 1 minute
        maximumAge: 0,
      };
      
      
      if (navigator.geolocation) {
        this.loading = showLoading;  
        this.debugmsg('Getting location');
        navigator.geolocation.getCurrentPosition(
          (position) => {
            this.handlePosition(position);
            this.loading = false;
            this.debugmsg('Got location');
            this.loaded = true;
            setTimeout(() => {
              this.loaded = false; 
            }, 5000); // 5 seconds

          },
          
          (error) => {
            this.handleGeolocationError(error);
            this.loading = false;
            this.debugmsg(`Error: ${error.message}`);
          },
          options
        );
      } 
        
    },
    
    getLocation() {
      // Get the users location, and emit and event with
      // the coordinates or the error
      console.log(this.showTextProgress, this.showTextLabel, this.useTextButton, this.showCoords, this.hideButton);
      this.emitLocation = true;
      this.geolocate();
      
    },
    
    debugmsg(msg: string) {
      console.log(msg);
      // append msg to the debug message
      if (this.showPermissions) {
        this.msg = this.msg + '<br>' + msg;
      }
    },
  },

  watch: {
    
    permissions(val: string) {
      this.debugmsg(`Permission: ${val}`);
      this.$emit('permission', val);
    },
    
    geolocation(val: GeolocationCoordinates) {
      if (this.emitLocation) {
        // on Safari, the Permissions API is not supported, but still works
        // make sure the frontend knows the permissions were "granted"
        if (this.permissions != 'granted') {
          this.permissions = 'granted';
        }
        this.$emit('geolocation', val);
      }
    },
    
    geolocationError(val: GeolocationPositionError) {
      if (val) {
        this.$emit('error', val);
      }
    },
    
  }
  
});

</script>
