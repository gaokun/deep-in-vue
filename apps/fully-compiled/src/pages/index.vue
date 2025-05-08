<script setup lang="ts">
import MultipleComponent, { Happy, Sad } from '@/components/MultipleComponent.vue'
import { ref } from 'vue'

const msg = ref('Hello World')

const toggle = ref(false)

function handleClick(event: MouseEvent) {
  console.log('click', event)
  toggle.value = !toggle.value
}
</script>

<template>
  <div class="mx-auto container grid gap-4 text-5xl py-12">
    <input v-model="msg" type="text">
    <MultipleComponent :msg="msg" @click="handleClick">
      <template #default>
        <div class="border border-yellow-500">
          默认插槽
          {{ msg }}
        </div>
      </template>
    </MultipleComponent>
    <Happy :msg="msg" @click="handleClick">
      <template #default>
        <div class="border border-yellow-500">
          默认插槽
          {{ msg }}
        </div>
      </template>
    </Happy>
    <Sad v-show.lazy="toggle" :msg="msg" @click="handleClick">
      <template #default>
        <div class="border border-yellow-500">
          默认插槽
          {{ msg }}
        </div>
      </template>
    </Sad>
    <div v-show.lazy="toggle">
      my div
    </div>
    <div v-ken="toggle" />
  </div>
</template>
