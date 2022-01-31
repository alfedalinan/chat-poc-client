<template>
  <q-layout view="lHh Lpr lFf">
    <q-header elevated>
      <q-toolbar>
        <q-btn
          flat
          dense
          round
          icon="menu"
          aria-label="Menu"
          @click="leftDrawerOpen = !leftDrawerOpen"
        />

        <q-toolbar-title>
          {{ this.$route.name ? this.$route.name : '' }}
        </q-toolbar-title>

      </q-toolbar>
      <q-toolbar style="background-color: #FFF; color: #000;">
        <q-item>
          <q-item-section avatar>
            <q-icon color="primary" name="person_pin" /> 
          </q-item-section>
          <q-item-section>
            Jane Doe
          </q-item-section>
        </q-item>
      </q-toolbar>
    </q-header>

    <q-drawer
      v-model="leftDrawerOpen"
      show-if-above
      bordered
      content-class="bg-grey-1"
    >
      <q-list>
        <q-item-label
          header
          class="text-grey-8"
        >
          My Navigation
        </q-item-label>

        <DefaultLink v-for="link in defaultLinks" :key="link.title" v-bind="link" />
        <q-separator />
         <q-item clickable tag="a" href="#">
            <q-item-section avatar>
                <q-icon name="logout" />
            </q-item-section>

            <q-item-section>
                <q-item-label>Logout</q-item-label>
                
            </q-item-section>
        </q-item>
      </q-list>
    </q-drawer>

    <!-- PAGE - ROUTER VIEW -->
    <q-page-container>
      <router-view />
    </q-page-container>
  </q-layout>
</template>

<script lang="ts">
import DefaultLink from "../components/DefaultLink.vue";

const linksData = [
  {
    title: 'Messages',
    icon: 'message',
    link: '#',
    caption: 'Check your inbox for new messages'
  },
  {
    title: 'Contacts',
    icon: 'contact_page',
    link: '#',
    caption: 'See your list of contacts here'
  },
  {
    title: 'Your Information',
    icon: 'perm_identity',
    link: '#',
    caption: 'Update your personal information'
  }
];

import { defineComponent, ref } from '@vue/composition-api';

export default defineComponent({
  name: 'ChatLayout',
  components: { DefaultLink },
  setup() {
    const leftDrawerOpen = ref(false);
    const defaultLinks = ref(linksData);

    return {leftDrawerOpen, defaultLinks}
  }
});
</script>
