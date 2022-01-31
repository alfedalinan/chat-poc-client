<template>
  <q-layout view="lHh Lpr lFf">
    <q-header elevated>
      <!-- <q-toolbar class="bg-primary text-white rounded-borders">

        <q-toolbar-title>
          Mini-Chat POC
        </q-toolbar-title>

        <div>v{{ ver }}</div>
      </q-toolbar> -->
    </q-header>

    <q-page-container class="bg-app">
      <router-view />
    </q-page-container>
  </q-layout>
</template>

<script lang="ts">

import { defineComponent } from '@vue/composition-api';

export default defineComponent({
  name: 'LoginLayout',
  setup() {
    const ver = process.env.VERSION;

    return {ver}
  }
});
</script>
