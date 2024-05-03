<template>
  <svg :style="style" xmlns="http://www.w3.org/2000/svg" viewBox="-1 -4 63 70">
    <path d="M2 65Q2 15 46.5 7.6" fill="none" stroke-width="6" stroke-miterlimit="10" pointer-events="stroke"/>
    <path d="M55.4 6.1 44.5 14l2-6.4-4-5.4Z" stroke-width="6" stroke-miterlimit="10" pointer-events="all"/>
  </svg>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
export default defineComponent({
  name: 'ArrowSvg',
  props: {
    color: {
      type: String,
      default: 'currentColor'
    },
    width: {
      type: String,
      default: "50px"
    },
  },
  
  computed: {
    style() {
      return {
        stroke: this.color,
        width: this.width
      };
    }
  }
  
});
</script>