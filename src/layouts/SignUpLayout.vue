<template>
  <q-layout view="lHh Lpr lFf">
    <q-header elevated>
      <q-toolbar>
        <q-btn
          flat
          dense
          round
          icon="keyboard_backspace"
          aria-label="Back"
          v-on:click="backToPrev()"
        />

      </q-toolbar>
    </q-header>
    <!-- PAGE - ROUTER VIEW -->
    <q-page-container>
      <router-view />
    </q-page-container>
  </q-layout>
</template>

<script lang="ts">
import DefaultLink from "../components/DefaultLink.vue";

import { defineComponent, ref } from '@vue/composition-api';

export default defineComponent({
  name: 'SignUpLayout',
  components: { DefaultLink },
  methods: {
    backToPrev() {
      this.$router.push({ name: 'Login' }); // <---- go back to previous page
    }
  }
});
</script>
