<script setup lang="ts">
import { ref } from 'vue'

const msg = ref('Hello World')

const toggle = ref(true)

const date = ref('init')

function handleClick() {
  const curDate = new Date()
  date.value = `${curDate.toLocaleTimeString()}.${curDate.getTime() % 1000}`
  toggle.value = !toggle.value
}
</script>

<template>
  <div class="mx-auto container grid gap-4 text-5xl py-12">
    <input v-model="msg" type="text">
    <h3>{{ date }}</h3>
    <button style="background-color: antiquewhite;" @click="handleClick">
      Click me
    </button>
    <!-- <div v-lazy-show="toggle">lazy-show</div> -->
    <div v-ken="toggle">
      ken
    </div>
  </div>
</template>
