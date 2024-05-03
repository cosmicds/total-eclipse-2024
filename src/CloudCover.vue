<script lang ="ts">
import { defineComponent, PropType } from "vue";
import { VIcon } from "vuetify/components/VIcon";
// import { VTooltip } from "vuetify/components/VTooltip";

export default defineComponent({
  name: 'CloudCover',
  
  components: {
    'v-icon':VIcon,
    // 'v-tooltip':VTooltip
  },
  
  props: {
    cloudCover: {
      type: null as unknown as PropType<number | null>,
      required: true,
      default: null
    }
  },
  
  
  computed: {
    cloudCoverFracToLabel() {
      if (this.cloudCover !== null) {
        return `${(this.cloudCover * 100).toFixed(0)}%`;
      }
      return 'No data';
    },
    
    cloudIcon() {
    
      if (this.cloudCover == null) {
        return 'mdi-cloud-cancel';
      } 
      else if (this.cloudCover < .25) {
        return 'mdi-weather-sunny';
      }
      else if (this.cloudCover < .5) {
        return 'mdi-weather-partly-cloudy';
      } 
      else if (this.cloudCover < 0.9) {
        return 'mdi-weather-cloudy';
      } 
      else {
        return 'mdi-clouds';
      } 
    }
  },

  
});


</script>


<template>
  <div class="cloud-cover-container my-2 py-1">
    <div> 
      <v-icon size="35">{{ cloudIcon }}</v-icon>
    </div>
    
    <div class="cloud-cover-label">
      <div class="cloud-cover-label-text"> Median historical<br>cloud cover: </div>
      <div class="cloud-cover-label-value">{{ cloudCoverFracToLabel }}</div>
    </div>
  
  </div>
    

</template>


<style>



.cloud-cover-container {
  display: flex;
  height: 100%;
  flex-direction: row;
  align-items: center;
  justify-content: center;
  outline: 1px solid var(--accent-color);
}

.cloud-cover-label {
  display: flex;
  align-items: center;
  padding-left: 10px;
}

.cloud-cover-label-text {
  font-size: calc(1.1 * var(--default-font-size));
  font-weight: normal;
  width: 70%;
  text-align: center;
}

.cloud-cover-label-value {
  font-size: calc(1.5 * var(--default-font-size));
  margin-left: 1rem;
  /* no text wrapping */
  white-space: nowrap;
  font-weight: bold;
  width: 30%;
}

</style>
