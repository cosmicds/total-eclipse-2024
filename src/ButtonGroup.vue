<template>
  <div class="awv-button-group d-flex flex-wrap" style="gap:6px;">
    <v-btn
      class="awv-button-group-button"
      v-for="[key, val] of optionsMap" :key="key"
      v-model="value"
      :value="key"
      rounded="md"
      density="compact"
      :color="color"
      :variant="value == key ? 'tonal' : 'outlined'"
      @click="value = key"
      > {{ val }} </v-btn>
  </div>
</template>
    

<script lang="ts">
import { defineComponent, PropType } from "vue";
import { VBtn } from 'vuetify/components/VBtn';
import { VCheckbox } from 'vuetify/components/VCheckbox';

export default defineComponent({
  name: "ButtonGroup",
  inheritAttrs: false,
  emits: ['update:modelValue'],
  components: {
    // eslint-disable-next-line vue/no-unused-components
    'v-btn': VBtn,
    // eslint-disable-next-line vue/no-unused-components
    'v-checkbox': VCheckbox,
  },
  props: {
    optionsMap: {
      type: Object as PropType<Map<string, string>>,
      required: true,
    },
    modelValue: {
      type: String,
      required: true,
    },
    color: {
      type: String,
      required: false,
      default: "#eac402",
    },
  },
  
  computed: {
    value: {
      get() {
        return this.modelValue;
      },
      set(value: string) {
        this.$emit('update:modelValue', value);
      }
    }
  }
});
</script>