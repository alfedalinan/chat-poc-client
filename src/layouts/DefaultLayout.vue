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
          @click="openDrawer()"
          v-if="this.$route.name != 'Chat' && this.$route.name != 'Contacts' && this.$route.name != 'MyInfo'"
        />

        <q-btn
          flat
          dense
          round
          icon="keyboard_backspace"
          aria-label="Back"
          v-on:click="backToPrev()"
          v-if="this.$route.name == 'Chat' || this.$route.name == 'Contacts' || this.$route.name == 'MyInfo'"
        />

        <q-toolbar-title>
          {{ this.$route.name && this.$route.name != 'MyInfo' ? this.$route.name : '' }}
        </q-toolbar-title>

      </q-toolbar>
      <q-toolbar style="background-color: #FFF; color: #000;" v-if="this.$route.name == 'Chat'">
          <q-item>
            <q-item-section avatar>
              <q-icon color="primary" name="person_pin" /> 
            </q-item-section>
            <q-item-section>
              {{ this.$route.params.username }}
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
          Mini-Chat POC Menu
        </q-item-label>

        <DefaultLink v-for="link in defaultLinks" :key="link.title" v-bind="link" />
        <hr />
         <q-item clickable tag="a" href="#" @click="logout()">
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
    link: '#/',
    caption: 'Check your inbox for new messages'
  },
  {
    title: 'Contacts',
    icon: 'contact_page',
    link: '#/contacts',
    caption: 'See your list of contacts here'
  },
  {
    title: 'Your Information',
    icon: 'perm_identity',
    link: '#/my-info',
    caption: 'Update your personal information'
  }
];

import { defineComponent, ref } from '@vue/composition-api';

export default defineComponent({
  name: 'DefaultLayout',
  components: { DefaultLink },
  setup() {
    const leftDrawerOpen = ref(false);
    const defaultLinks = ref(linksData);
    const userDetails = JSON.parse( localStorage.getItem(process.env.USER_PREF_KEY) || '{}' );

    return {leftDrawerOpen, defaultLinks, userDetails }
  },
  methods: {
    openDrawer() {
      return this.leftDrawerOpen = !this.leftDrawerOpen;
    },
    logout() {

      this.$socket.emit('user.unregister:send', {
          userId: this.userDetails.id,
          register_id: this.userDetails.register_id
      });

      localStorage.removeItem(process.env.USER_PREF_KEY);
      localStorage.removeItem(process.env.TOKEN_PREF_KEY);

      this.$router.push({ 
        path: 'Login'
      });
    },
    backToPrev() {
      this.$router.go(-1);
    }
  },
  mounted() {

  }
});
</script>
