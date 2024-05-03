
import { tooltip } from 'leaflet';
<template>
  <v-tooltip 
    class="define-term-tooltip"
    v-model="tooltip"
    :width="width"
    :open-on-click="!noClick"
    :open-on-hover="true"
    :open-on-focus="true"
    location-strategy="connected"
    location="bottom center"
    origin="top center"
    offset="-2"
    content-class="top-triangle"
    >
    <template v-slot:activator="{props}" >
        <slot name="term" v-bind="props" tabindex="0" :props="props">
          <span tabindex="0" :class="['define-term-tooltip', inline ? 'inline' : '', bold ? 'define-term-bold' : '', underlined ? 'define-term-underline' : '' ]" v-bind="props" > {{  term }} </span>
        </slot>
    </template>
    
    <slot name="definition">
      <div class="define-term-tooltip definition" v-html="definition">
      </div>
    </slot>

    </v-tooltip>
</template>
  

<script lang="ts">
import { defineComponent } from "vue";
import { VTooltip } from "vuetify/components/VTooltip";

export default defineComponent({
  name: 'DefineTerm',
  components: {
    'v-tooltip': VTooltip,
  },
  props: {
    term: {
      type: String,
      required: false
    },
    definition: {
      type: String,
      required: false
    },
    inline: {
      type: Boolean,
      default: true
    },
    
    width: {
      type: String,
      default: '25ch'
    },
    noClick: {
      type: Boolean,
      default: false
    },
    
    bold: {
      type: Boolean,
      default: true
    },
    
    underlined: {
      type: Boolean,
      default: false
    },
    
    showFor: {
      type: Number,
      default: 0,
      validator: (value: number) => value >= 0
    },
    
    tooltipLocation: {
      type: String || undefined,
      default: undefined
    }
  },
  
  data() {
    return {
      tooltip: false
    };
  },
  
  mounted() {
    if (this.showFor > 0) {
      this.timedShow();
    }
  },
  
  methods: {
    show() {
      this.tooltip = true;
    },
    hide() {
      this.tooltip = false;
    },
    
    timedShow() {
      this.show();
      setTimeout(() => {
        this.hide();
      }, this.showFor * 1000);
    }
    
  },
  
  watch: {
    showFor() {
      this.timedShow();
    }
  }
});


</script>

<style>

.v-tooltip > .v-overlay__content {
  background: #3b567f !important;
  color: white !important;
}

.define-term-tooltip.inline {
  display: inline;
  pointer-events: auto;
}

.define-term-bold {
  font-weight: bold;
}

.define-term-underline {
  text-decoration: underline;
  text-decoration-style: dotted;
}

.define-term-tooltip.definition {
  font-size: var(--default-font-size);
  color: white;
  padding-block: 0.5em;
}


</style>