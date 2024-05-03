<template>
  <div id="eclipse-timer-container" class="info-overlay-container">
    <h1>Eclipse Timer</h1>
    <div v-if="showTimer" class="eclipse-countdown">
      <div v-if="!noEclipse" class="ec-timer">{{ timeToShow }}</div>
      <div v-if="!noEclipse">
        {{ timeText }} {{ location !== '' ? 'at ' + location : '' }}
      </div>
    </div>
<!--     
    print out the time conditions as a table
    <table>
      <tr>
        <td>Before Max:</td>
        <td>{{ beforeMax() }}</td>
      </tr>
      <tr>
        <td>After Max:</td>
        <td>{{ afterMax() }}</td>
      </tr>
      <tr>
        <td>Before End Partial:</td>
        <td>{{ beforeEndPartial() }}</td>
      </tr>
      <tr>
        <td>Before Totality:</td>
        <td>{{ beforeTotality() }}</td>
      </tr>
      <tr>
        <td>In Totality:</td>
        <td>{{ inTotality() }}</td>
      </tr>
    </table> -->

    <div v-if="noEclipse">
      <p>No eclipse is predicted for this location.</p>
    </div>
    <div v-else>
      <h2 class="mb-4"> {{ type }} Eclipse</h2>
    </div>
    <div v-if="!noEclipse" :class="['eclipse-icon', `eclipse-icon-${type.toLowerCase()}`]">
    </div>
    <div class="eclipse-data-list" v-if="!noEclipse">
      <table id="eclipse-values">
        <tr>
          <td>
            <define-term
              term="Max Eclipsed"
              definition="The fraction (percentage) of the Sun covered by the Moon."
              underlined
              />:
          </td>
          <td> {{ coverage < 0.01 ? '<1' :(coverage*100).toFixed(0) }}% </td>
        </tr>
        <tr v-if="isTotal">
          <td>Totality Duration:</td>
          <td> {{ totalityDuration }}</td>
        </tr>
        <tr v-if="eclipseDuration != ''">
          <td>Eclipse Duration:</td>
          <td> {{ eclipseDuration }}</td>
        </tr>
      </table>
      <hr class="eclipse-timer-dividier"/>
      <table id="time-container">
        <tr class="time">
          <td class="time-label">Partial Start</td>
          <td class="time-value">{{ partialStart[1] === '' ? timeString(partialStart[0]) : 'Sun below Horizon' }}</td>
        </tr>
        <tr class="time" v-if="isTotal">
          <td class="time-label">Totality Start</td>
          <td class="time-value">{{ centralStart[1] === '' ? timeString(centralStart[0]) : 'Sun below Horizon' }}</td>
        </tr>
        <tr class="time">
          <td class="time-label">Max Eclipse</td>
          <td class="time-value">{{ maxTime[1] === '' ? timeString(maxTime[0]) : 'Sun below Horizon' }}</td>
        </tr>
        <tr class="time" v-if="isTotal">
          <td class="time-label">Totality End</td>
          <td class="time-value">{{ centralEnd[1] === '' ? timeString(centralEnd[0]) : 'Sun below Horizon' }}</td>
        </tr>
        <tr class="time">
          <td class="time-label">Partial End</td>
          <td class="time-value">{{ partialEnd[1] === '' ? timeString(partialEnd[0]) : 'Sun below Horizon' }}</td>
        </tr>
      </table>
      <hr class="mt-4" style="width:100%">
    </div>
    <!-- utc/local time preference switch -->
    <v-btn-toggle 
      class="mt-2"
      v-model="tzPref"  
      :color="color" 
      divided 
      mandatory 
      hide-details
      variant="outlined"
      >
      <v-btn value="UTC" size="small" height="2em" >UTC</v-btn>
      <v-btn value="Local" size="small" height="2em" >Local ({{ tzCode }})</v-btn>
    </v-btn-toggle>
  </div>
</template>

<script lang="ts">
import { defineComponent, PropType } from 'vue';
import { EclipseData, BSRArray } from './eclipse_types';
import { formatInTimeZone } from "date-fns-tz";
import { VBtnToggle } from 'vuetify/components/VBtnToggle';
import { VBtn } from 'vuetify/components/VBtn';
import DefineTerm from './DefineTerm.vue';
import { toHMS, spaceHMS } from './utils';

const dayInMs = 1000 * 60 * 60 * 24;
const hourInMs = 1000 * 60 * 60;
const minuteInMs = 1000 * 60;
const secondInMs = 1000;

export default defineComponent({
  name: 'EclipseTimer',
  
  components: {
    'v-btn-toggle': VBtnToggle,
    'v-btn': VBtn,
    'define-term': DefineTerm,
  },
  
  props: {
    prediction: {
      type: Object as PropType<EclipseData<Date>>,
      required: true,
    },
    
    showTimer: {
      type: Boolean,
      default: false,
      required: false,
    },
    
    timezone: {
      type: String,
      default: 'UTC',
      required: false,
    },
    
    location: {
      type: String,
      default: '',
      required: false,
    },
    
    color: {
      type: String,
      default: 'white',
      required: false,
    },
  },
  
  mounted() {
    this.updateTimeData();
    
    setInterval(() => {
      this.updateTimeData();
    }, 1000);
  },
  
  data() {
    return {
      pred: this.prediction,
      tzPref: 'Local' as 'UTC' | 'Local',
      // partialStart: this.prediction.partialStart[0],
      // centralStart: this.prediction.centralStart[0],
      // maxTime: this.prediction.maxTime[0],
      // centralEnd: this.prediction.centralEnd[0],
      // partialEnd: this.prediction.partialEnd[0],
      // magnitude: this.prediction.magnitude[0],
      // coverage: this.prediction.coverage[0],
      // duration: this.prediction.duration,
      timeToEclipse: '',
      timeToEndPartial: '',
      timeToEndTotality: '',
      timeToStartTotality: '',
      timeText: '',
      timeToShow: '',
    };
  },
  
  
  computed: {
    type(): '' | 'Partial' | 'Annular' | 'Total' {
      switch (this.prediction.type) {
      case 'P':
        return 'Partial';
      case 'A':
        return 'Annular';
      case 'T':
        return 'Total';
      default:
        return '';
      }
    },
    
    noEclipse(): boolean {
      return this.prediction.type === '';
    },
    
    isTotal(): boolean {
      return this.prediction.type === 'T';
    },

    timeString(): (date: Date | null) => string {
      return (date: Date | null) => {
        if (date === null) return '';
        return this.tzPref === 'UTC' ? this.toUtcString(date) : this.toLocalString(date);
      };
    },
    
    tzCode(): string {
      return formatInTimeZone(new Date(), this.timezone, 'z');
    },
    
    partialStart() {
      return this.circumstance(this.prediction.partialStart, 'Partial Start');
    },
    
    partialEnd() {
      return this.circumstance(this.prediction.partialEnd, 'Partial End');
    },
    centralStart() {
      return this.circumstance(this.prediction.centralStart, 'Central Start');
    },
    centralEnd() {
      return this.circumstance(this.prediction.centralEnd, 'Central End');
    },
    maxTime() {
      return this.circumstance(this.prediction.maxTime, 'Max Eclipse');
    },
    magnitude(): number {
      return this.prediction.magnitude[0];
    },
    coverage(): number {
      return this.prediction.coverage[0];
    },
    
    eclipseDuration(): string {
      if (this.type === '') return '';
      const start = this.prediction.partialStart[0];
      const end = this.prediction.partialEnd[0];
      if (start === null || end === null) return '';
      const duration = end.getTime() - start.getTime();
      return spaceHMS(toHMS(duration));
    },
    
    totalityDuration(): string {
      return spaceHMS(this.prediction.duration);
    },
    

    
  },
  
  methods: {
    
    beforeMax(): boolean {
      if (this.type === '') return false;
      if (this.maxTime[0] === null) return false;
      return Date.now() <= this.maxTime[0].getTime();
    },  
    
    afterMax(): boolean {
      if (this.type === '') return false;
      if (this.maxTime[0] === null) return false;
      return Date.now() > this.maxTime[0].getTime();
    },
    
    beforeEndPartial(): boolean {
      if (this.type === '') return false;
      if (this.partialEnd[0] === null) return false;
      return Date.now() <= this.partialEnd[0].getTime();
    },

    afterEndPartial(): boolean {
      if (this.type === '') return false;
      if (this.partialEnd[0] === null) return false;
      return Date.now() > this.partialEnd[0].getTime();
    },
    
    beforeTotality(): boolean {
      if (this.type !== 'Total') return false;
      if (this.centralStart[0] === null) return false;
      return Date.now() < this.centralStart[0].getTime();
    },
    
    inTotality(): boolean {
      if (this.type !== 'Total') return false;
      if (this.centralStart[0] === null || this.centralEnd[0] === null) return false;
      const now = Date.now();
      return now >= this.centralStart[0].getTime() &&
             now <= this.centralEnd[0].getTime();
    },

    afterTotality(): boolean {
      if (this.type !== 'Total') return false;
      if (this.centralEnd[0] === null) return false;
      return Date.now() > this.centralEnd[0].getTime();
    },
    
    updateTimeConditions() {
      this.beforeMax();
      this.afterMax();
      this.beforeEndPartial();
      this.beforeTotality();
      this.inTotality();
    },
    
    toUtcString(date: Date | null): string {
      if (date === null) return '';
      try {
        return formatInTimeZone(date, 'UTC', 'h:mm:ss aaa' );
      } catch (e) {
        console.error(e);
        console.error(date);
        return '';
      }
    },
    
    toLocalString(date: Date | null): string {
      if (date === null) return '';
      try {
        return formatInTimeZone(date, this.timezone, 'h:mm:ss aaa' );
      } catch (e) {
        console.error(e);
        console.error(date);
        return '';
      }
    },
    
    circumstance(data: BSRArray<Date | null>, _normal = ''): [Date | null, string] {
      const [t, c] = data;
      if (c === 's') return [t, 'Sunset'];
      if (c === 'r') return [t, 'Sunrise'];
      if (c === 'b') return [t, 'Below Horizon'];
      return [t, ''];
    },
    
    msToTime(ms: number) {
      const days = Math.floor(ms / dayInMs);
      const hours = Math.floor((ms % dayInMs) / hourInMs);
      const minutes = Math.floor((ms % hourInMs) / minuteInMs);
      const seconds = Math.floor((ms % minuteInMs) / secondInMs);
      return `${days} days ${hours}h ${minutes}m ${seconds}s`;
    },
      
    getTimeToEclipse() {
      if (this.type === '') return '';
      if (this.maxTime[0] === null) return '';
      const timeToEclipse = this.maxTime[0].getTime() - Date.now();
      this.timeToEclipse = this.msToTime(timeToEclipse);
    },
    
    getTimeToStartTotality() {
      if (this.type !== 'Total') return '';
      if (this.centralStart[0] === null) return '';
      const timeToStart = this.centralStart[0].getTime() - Date.now();
      this.timeToStartTotality = this.msToTime(timeToStart);
    },
    
    getTimeToEndTotality() {
      if (this.type === '') return '';
      if (this.centralEnd[0] === null) return '';
      const timeToEnd = this.centralEnd[0].getTime() - Date.now();
      
      const minutes = Math.floor((timeToEnd % hourInMs) / minuteInMs);
      const seconds = Math.floor((timeToEnd % minuteInMs) / secondInMs);
      this.timeToEndTotality = `${minutes}m ${seconds}s`;
    },
    
    // get time left until end of eclipse (end of parital)
    getTimeToEndPartial() {
      if (this.type === '') return '';
      if (this.partialEnd[0] === null) return '';
      const timeToEnd = this.partialEnd[0].getTime() - Date.now();
      
      const hours = Math.floor((timeToEnd % dayInMs) / hourInMs);
      const minutes = Math.floor((timeToEnd % hourInMs) / minuteInMs);
      const seconds = Math.floor((timeToEnd % minuteInMs) / secondInMs);
      this.timeToEndPartial = `${hours}h ${minutes}m ${seconds}s`;
    },
    
    getTimeText(): string {
      if (this.type === '') return '';
      if (this.type === 'Total' && this.beforeTotality()) {
        return 'until totality';
      } else if (this.inTotality()) {
        return 'until end of totality';
      } else if (!this.isTotal && this.beforeMax()) {
        return 'until max eclipse';
      } else if ((this.afterMax() && this.beforeEndPartial()) || (this.afterTotality() && !this.afterEndPartial())) {
        return 'until end of partial eclipse';
      } else {
        return '';
      }
    },

    getTimeToShow(): string {
      // before totality or before max
      if (this.type === 'Total' && this.beforeTotality()) {
        return this.timeToStartTotality;
      }  else if (this.inTotality()) {
        return this.timeToEndTotality;
      } else if (!this.isTotal && this.beforeMax()) {
        return this.timeToEclipse;
      } else if ((this.afterMax() && this.beforeEndPartial()) || (this.afterTotality() && !this.afterEndPartial())) {
        return this.timeToEndPartial;
      } else {
        return 'The Eclipse has passed';
      }
    },
    
    updateTime() {
      this.getTimeToEclipse();
      this.getTimeToStartTotality();
      this.getTimeToEndTotality();
      this.getTimeToEndPartial();
    },

    updateTimeData() {
      if (this.showTimer) {
        this.updateTimeConditions();
        this.updateTime();
        this.timeText = this.getTimeText();
        this.timeToShow = this.getTimeToShow();
      }
    }
  },
  
  
  
  
});
</script>


<style lang="less">

#eclipse-timer-container {
  width: max-content;
  padding: 0.5em;
}

.info-overlay-container {
  position: relative;
  margin: 0 auto;
  padding: 2%;
  
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;

  font-size: var(--default-font-size);
}

hr.eclipse-timer-dividier {
  width: 100%;
  margin: 1em 0;

}

.eclipse-icon {
  aspect-ratio: 1/1;
  width: 10em;
  background-size: contain;
}

.eclipse-icon-total {
  background-image: url('./assets/total.png');
}

.eclipse-icon-partial {
  background-image: url('./assets/partial.png');
}

.eclipse-icon-annular {
  background-image: url('./assets/annular.png');
}

.eclipse-icon- {
  background-image: url('./assets/none.png');
}

.eclipse-countdown {
  text-align: center;
  margin-bottom: 0.5em;
  min-width: 20em;
}

.ec-timer {
  font-size: 1.5em;
  font-family: Courier, monospace;
}

.eclipse-data-list{
  font-size: var(--default-font-size);
}

.v-btn {
  text-transform: none;
}

table#eclipse-values {
  width: 100%;
  border-collapse: collapse;
}

#eclipse-values tr {
  line-height: 1.75;
}

#eclipse-values td:nth-child(2) {
  text-align: right;
}

table#time-container {
  width: 100%;
  border-collapse: collapse;
  margin-top: 1em;
}



#time-container td {
  padding: 0.5em;
}

#time-container td.time-value {
  text-align: right;
}

label {
  display: block;
  font-size: 1.5em;
  margin-bottom: 0.5em;
  margin-inline: auto;
  
}

</style>
