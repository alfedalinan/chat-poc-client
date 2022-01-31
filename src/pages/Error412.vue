<template>
  <div class="fullscreen bg-primary text-white text-center q-pa-md flex flex-center">
    <div>
      <div style="font-size: 10vh">
        Auth Error
      </div>

      <div class="text-small" style="opacity:.4">
        Try clicking the button below. If this error persists, send an e-mail to the support at support@minichatpoc.com
      </div>

      <q-btn
        class="q-mt-xl"
        color="white"
        text-color="blue"
        unelevated
        to="/"
        label="Return"
        no-caps
      />
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from '@vue/composition-api';

export default defineComponent({
  name: 'Error412',
});
</script>