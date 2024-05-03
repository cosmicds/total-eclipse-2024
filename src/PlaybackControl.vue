<template>
  <div id="enclosing-playback-container" :style="cssVars">
    
    <!-- add a close box -->
    <div v-if="(inline && inlineButton) || showCloseButton" id="playback-close-button" @click="$emit('close')">
        <v-icon :color="color" size="18">mdi-close</v-icon>
    </div>
    
    <div v-if="!inline || inlineButton" id="playback-play-pause-button">
      <icon-button
        :md-icon="isPaused ? 'mdi-play' : 'mdi-pause'"
        @activate="isPaused = !isPaused"
        :color="color"
        :focus-color="color"
        tooltip-text="Play/Pause"
        tooltip-location="top"
        tooltip-offset="5px"
        md-size="18"
      ></icon-button>

      <div v-if="!inline || inlineButton" id="playback-reverse-time">
        <icon-button
          @activate="reverseTime = !reverseTime"
          :md-icon="reverseTime ? 'mdi-step-forward-2' : 'mdi-step-backward-2'"
          :color="color"
          :focus-color="color"
          tooltip-text="Forward/Reverse"
          tooltip-location="top"
          tooltip-offset="5px"
          md-size="18"
        >
        </icon-button>
        <span id="reverse-button-text">{{ reverseTime ? 'Forward' : 'Reverse' }}</span>
      </div>
    </div>
    
    <div id="playback-slider-container">
      
      <div id="tick-container">
        <div v-for="val in index" :key="val" v-bind="options(val)" class="tick">
          <span class="tick-label"> {{ valueToMark(val) }} </span>
        </div>
      </div>
      
      <v-slider
        ref="slider"
        hide-details
        v-model="value"
        :max="max ?? index[index.length - 1]"
        :min="min ?? index[0]"
        :thumb-size="16"
        color="white"
        track-color="white"
        track-fill-color="white"
        thumb-color="blue"
        track-size="8"
        :step="step"
        :show-ticks="useBuiltInTicks ? 'always' : false"
        :ticks="useBuiltInTicks ? marks : undefined"
        >
      </v-slider>
    </div>

    
  </div>

  
</template>


<script lang="ts">
import { defineComponent } from 'vue';
// import VueSlider from 'vue-slider-component';
import { VSlider } from 'vuetify/components/VSlider';
import { SymmetricalLogTransform, symmLinspace } from './symlog';

const symLog = new SymmetricalLogTransform(10);

export default defineComponent({
  name: 'PlaybackControl',

  components: {
    'v-slider': VSlider,
  },
  
  emits: ['update:modelValue', 'paused', 'close'],

  props: {
    // Define the props here
    modelValue: {
      type: Number,
      default: 1,
    },
    maxPower: {
      type: Number,
      default: 3,
    },
    paused: {
      type: Boolean,
      default: true,
    },
    
    max: {
      type: Number,
      default: null,
    },
    
    min: {
      type: Number,
      default: null,
    },
    
    color: {
      type: String,
      default: 'white',
    },
    smallScreen: {
      type: Boolean,
      default: false,
    },
    
    inline: {
      type: Boolean,
      default: true,
    },
    inlineButton: {
      type: Boolean,
      default: false,
    },
    showCloseButton: {
      type: Boolean,
      default: false,
    },
    
  },

  mounted() {
    // Do something when the component is mounted
    // get height of v-input_container
    const container = document.getElementById('playback-slider-container');
    if (container) {
      // query container for the v-slider
      const input = container.querySelector(' .v-slider__container');
      if (input) {
        // get the height of the v-slider
        const height = input.clientHeight;
        // set the height of the tick-container
        container.style.setProperty('--v-slider-height', `${height}px`);
      }
    }
    
    // create a resize observer for enclosing-playback-container
    // that adjusts it's scale relative to a certain width
    const resizeObserver = new ResizeObserver((entries) => {
      for (const _entry of entries) {
        
        const track = document.querySelector('.v-slider-track') as HTMLElement;
        const container = document.getElementById('enclosing-playback-container') as HTMLElement;
        if (container) {
          const input = container.querySelector('.v-slider__container');
          const tickContainer = document.querySelector('#tick-container') as HTMLElement;
        
          const psc = document.querySelector('#playback-slider-container') as HTMLElement;
          if (track && container) {
            const s = track.scrollWidth;
            container.style.setProperty('--track-width', `${s}px`);
          }
          if (tickContainer && input && psc) {
            psc.style.setProperty('--v-slider-height', `${input.clientHeight}px`);
          }
          
          if (this.inline && container) {
            container.classList.add('inset');
          } else {
            container.classList.remove('inset');
          }
        }
        
        // if container width is more than 300px use .normal-screen on psc
        // if (container.clientWidth <= 300) {
        //   psc.classList.add('small-screen');
        // } else {
        //   psc.classList.remove('small-screen');
        // }
        
      }
    });
    resizeObserver.observe(document.getElementById('enclosing-playback-container')!);
    
  },



  data() {
    return {
      // Define the data here
      data: ['a', 'b', 'c'],
      symlog: symLog,
      index: symLog.sequence(this.maxPower).filter(v => v > 0),
      myTicks: symmLinspace(1, Math.pow(10,this.maxPower), 2).map((val) => symLog.toSymlogIndex(val)),
      useBuiltInTicks: true,
    };
  },

  methods: {

    // Define the methods here
    valueToMark(value: number): number | string {
      if (value === 0) return 'Pause';
      const pre = this.reverseTime ? -1 : 1;
      return (pre * symLog.fromSymLogIndex(value)).toString() + 'x';
    },

    options(val: number) {
      const min = this.min ?? this.index[0];
      const max = this.max ?? this.index[this.index.length - 1];
      const pos = (val - min) / (max - min) * 100;
      return {
        style: {
          left: pos + '%',
        },
      };
    },

  },

  computed: {
    
    cssVars() {
      return {
        '--color': this.color,
      };
    },
    
    isPaused: {
      get() {
        console.log('PBC: isPaused get',this.paused);
        return this.paused;
      },
      set(val: boolean) {
        console.log('PBC: isPaused set',val);
        this.$emit('paused', val);
      }
    },
    
    // Define the computed properties here
    marks(): Record<number, string> {
      const marks: Record<number, string> = {};
      this.index.forEach((value) => {
        const pre = this.reverseTime ? -1 : 1;
        marks[value] = value === 0 ? '' : (pre * symLog.fromSymLogIndex(value)).toString();
      });
      

      return marks;
    },

    step(): number {
      const val = Math.abs(this.value) <= 1 ? 1 : 0.1;
      return val;
    },
    
    value: {
      get() {
        return Math.abs(symLog.toSymlogIndex(this.modelValue));
      },
      
      set(val: number) {
        const abs = symLog.fromSymLogIndex(val);
        const sign = this.reverseTime ? -1 : 1;
        this.$emit('update:modelValue', sign * abs);
      }
    },
    
    reverseTime: {
      get() {
        return this.modelValue < 0;
      },
      set(rt: boolean) {
        const val = symLog.fromSymLogIndex(this.value);
        this.$emit('update:modelValue', rt ? -val : val);
      }
    },



  }
});

</script>

<style lang="less">
// Define the styles here


#enclosing-playback-container {
  // modify the Vuetify slifer properties
  contain: layout;
  display: flex;
  flex-grow: 1;
  align-items: center;
  width: 100%;
  padding-left: 0.5rem;
  padding-right: 0.25rem;
  padding-block-start: 0.25rem;
  padding-block-end: 0.75rem;
  border-radius: 0.5rem;
  border: 1px solid white;
  // min-width: 200px;
  max-width: 510px;
  background-color: #272727;
  font-size: 0.7rem;
  --track-wdith: 0px; // get set by the resize observer to the actual track width
  --min-tick-gap: 0.2rem;
  --tick-color: #ddd;
  --track-color: white;
  --tick-font-size: 1em;
  
  // no close button normally
  #playback-close-button {
    position: absolute;
    right: 0;
    top: 0;
    transform: translate(125%, 0);
    
    border-radius: 50%;
    padding: 2px;

    pointer-events: auto;
    
    display: flex;
    align-items: center;
    justify-content: center;
    border: 1px solid var(--color);
    background-color: black;
    color: var(--color);
  }
    
  // #playback-close-button {
  //   display: none;
  // }
  
  &.inset {
    padding: 0;
    padding-inline-start: 0.25rem;
    padding-block-end: 0.5em;
    background-color: black;
    
    border: 2px solid var(--color);
    transform: translateY(25%);
    
    --tick-font-size: clamp(10px, 1.5vw, 1em);
    
    i.v-icon {
      font-size: clamp(1vw, 1em, 18px) !important;
      width: 1em !important;
      height: 1em !important;
    }
    
    #playback-slider-container {
      
      padding-inline-start: 0.5rem;
    }
    
    
    
  }
  
  #playback-play-pause-button {
    display: flex;
    margin-inline-end: 0.5rem;
    flex-direction: row;
    align-items: center;
    gap: 0.5em;
    
    #playback-reverse-time {
      position: relative;
      #reverse-button-text {
        position: absolute;
        font-size: var(--tick-font-size);
        left: -25%;
      }
      .icon-wrapper {
        border-radius: 2em;
      }
    }

  }
  
  #playback-slider-container {
    flex-grow: 1;
  }
  

  #playback-slider-container {
    display: flex;
    flex-direction: column;
    position: relative;
    padding-left: 0.5rem;
    --v-slider-height: 32px;
    --psc-offset: calc(-1*var(--tick-font-size)/2);

    height: calc(var(--v-slider-height) + var(--tick-font-size));
        
    .v-slider-track__ticks {
      border-radius: calc(var(--v-slider-height) / 2);
    }
    
    .v-slider-track__tick-label {
      display: none;
    }
    
    
    .track-tick-size {
      font-size: var(--v-slider-track-size);
      --avail-space: calc((var(--track-width) - 18 * var(--min-tick-gap)) / 9);
      --v-slider-tick-size: clamp(1em, var(--avail-space), 3em); // scale with track size
      border-radius: 50%;
    }
    
    .pause-color {
      --pause-color: rebeccaPurple !important;
      background-color: var(--pause-color);
      &.v-slider-track__tick--filled {
        background-color: var(--pause-color);
      }
    }
    
    // the zero tick mark
    .v-slider-track__tick[style="inset-inline-start: 50%;"] {
      .track-tick-size();
      width: calc(var(--v-slider-tick-size) * 2);
      height: calc(var(--v-slider-tick-size) * 2);
      transform: translate(-50%, -50%);
      --pause-gap: 0.5rem;
      .pause-color();
      
      // create tringle play psueo element
      
      
      &::before,
      &::after {
        content: '';
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        width: 6px;
        height: 50%;
        background-color: white;
        
      }

      &::before {
        left: calc(50% - var(--pause-gap));
      }

      &::after {
        left: calc(50% + var(--pause-gap));
      }
    }
    
    // push the track to the back
    .v-slider-track * {
        opacity: 1;
        background-color: var(--track-color);
      }

    // show no progress fill
    .v-slider-track__fill {
      opacity: 0;
    }
    
    .v-slider-track__tick {
      .track-tick-size();
      
      background-color: var(--tick-color);
      
      &.v-slider-track__tick--filled {
        // margin-inline-start: calc(100% - var(--v-slider-tick-size) - 1px); // default
        background-color: var(--tick-color);
      }
      
      &.v-slider-track__tick--first {
        // margin-inline-start: calc(var(--v-slider-tick-size) + 1px); // default
        margin-inline-start: 0px;
      }
      
      &.v-slider-track__tick--last {
        // margin-inline-start: calc(100% - var(--v-slider-tick-size) - 1px); // default
        margin-inline-start: 100%;
      }
    
    }
      
    @media (max-width: 500px){
      .v-slider-track__tick[style="inset-inline-start: 50%;"] {
        width: calc(var(--v-slider-tick-size) * 2.5);
        height: calc(var(--v-slider-tick-size) * 2.5);
        .pause-color();
        --pause-gap: 0.25rem;
        &::before,
        &::after {
          width: 3px;
        }
        &::before {
        left: calc(50% - var(--pause-gap));
      }

      &::after {
        left: calc(50% + var(--pause-gap));
      }
      }
      
      .v-slider-track__tick {
        --v-slider-tick-size: 2em;
      }
      
    }
      
    
  }
  
  .icon-wrapper {
    pointer-events: auto;
  }
  
      
      
  


    #tick-container {
      --height: 0px;
      --position: calc(var(--v-slider-height) + var(--height));
      margin-inline: 8px;
      position: relative;
      height: var(--height);
      transform: translateY(var(--position));
      
      @media (max-width: 500px) {
        --position: calc(var(--v-slider-height) - 0.5em);
        transform: translateY(--position);
      }

      .tick {
        position: absolute;
        transform: translateX(-50%);
      }
      
      .tick[style="left: 50%;"] {
        margin-top: 0.5em;
      }

      .tick-label {
        font-size: var(--tick-font-size);
        color: white;
      }

    }
  }


</style>