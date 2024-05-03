
<template>
<div :id="id" class="colorbar-container">
  <div 
    :style="{'--background-color': backgroundColor}"
    class="colorbar">
  </div>
  <div class="colorbar-labels"> {{ label }} </div>
</div>
</template>



<script lang="ts">
import { defineComponent, PropType } from 'vue';

// type for a function that maps to either a  (color, opacity) pair or just a color
type ColorFunction = (x: number) => [string, number] | string;

export default defineComponent({
  name: 'ColorBar',
  props: {
    
    name: {
      type: String,
      default: null
    },
    
    nsteps: {
      type: Number,
      default: 20
    },
    label: {
      type: String,
      default: 'Colorbar'
    },
    
    cmap: {
      type: Function as PropType<ColorFunction>,
      default: (x: number) => `rgb(255,0,${x * 255})`
    },
    
    backgroundColor: {
      type: String,
      default: '#5c5229'
    }
    
  },
  
  
  mounted() {
    this.colorbarGradient();
  },
  
  computed: {
    id() {
      return this.name ? `colorbar-${this.name}` : `colorbar-${Math.random().toString(36).slice(2)}`;
    }
  },
  
  
  
  methods: {
    colorbarGradient() {
      const colorbar = document.querySelector('#' + this.id + '> .colorbar');
      if (!colorbar) {
        return;
      }
      // remove all the children of the colorbar
      while (colorbar.firstChild) {
        colorbar.removeChild(colorbar.firstChild);
      }
      const n = this.nsteps;
      for (let i=n; i >= 0; i--) {
        const co = this.cmap(i/n);
        const [color, opacity] = Array.isArray(co) ? co : [co,1];
        const div = document.createElement('div');
        // add a class name to the div
        div.className = 'colorbar-chunk';
        div.style.backgroundColor = color;
        div.style.opacity = opacity.toString();
        div.style.height = `${100/(n+1)}%`;
        colorbar.appendChild(div);
      }
    },
  },
  
  watch: {
    nsteps() {
      this.colorbarGradient();
    },
    cmap() {
      this.colorbarGradient();
    }
  }
  
});
</script>

<style scoped>
.colorbar-container {
  position: relative;
  display: inline-block;
  --width: 1.25em;
  width: fit-content;
  margin-left: 5px;
  margin-right: 1em;
  background: var(--background-color);
  user-select: none;
}

.colorbar {
  height: 100%;
  width: var(--width);
  outline: 1px solid white;
  margin-left: 5px;
  margin-right: 1em;
  background: var(--background-color);
}

.colorbar:before {
  content:"100%";
  position: absolute;
  top: 0.5em;
  right: 2em;
  transform-origin: bottom center;
  color: black;
  transform: translateX(calc(2*var(--width))) rotate(-90deg);
  z-index: 1;
}

.colorbar:after {
  content:"0%";
  position: absolute;
  bottom: 0.5em;
  right: 2em;
  color: white;
  transform-origin: center;
  transform: translateX(calc(var(--width))) rotate(-90deg);
}

.colorbar-labels {
  position: absolute;
  width: max-content;
  height: max-content;
  top: 50%;
  /* right: -1.5ch; */
  transform-origin: top center;
  transform: rotate(180deg) translate(-150%,-50%);
  writing-mode: vertical-rl;
  }
</style>
