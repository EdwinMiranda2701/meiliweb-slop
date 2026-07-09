<template>
  <Slider v-model="value" class="meiliweb-slider w-full" :min :max :format />
</template>

<script setup lang="ts">
import Slider from '@vueform/slider'

type Props = {
  min: number
  max: number
  format?: <T>() => T
}

defineProps<Props>()
const value = defineModel()
</script>

<style>
.meiliweb-slider {
  --slider-connect-bg: #fa3a90;
  --slider-tooltip-bg: #fa3a90;
  --slider-handle-ring-color: rgb(250 58 144 / 30%);
}
</style>
