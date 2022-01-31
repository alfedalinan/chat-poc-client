<template>
  <q-item clickable tag="a" :href="link">

    <q-item-section v-if="icon" avatar>
        <q-icon :name="icon" />
    </q-item-section>

    <q-item-section>
        <q-item-label>{{ title }}</q-item-label>
        <q-item-label caption>
            {{ caption }}    
        </q-item-label>
    </q-item-section>

  </q-item>
</template>

<script>
import { defineComponent } from "@vue/composition-api";

export default defineComponent({
    name: "DefaultLink",
    props: {
        title: {
            type: String,
            required: true,
            default: ""
        },
        icon: {
            type: String,
            default: ""
        },
        link: {
            type: String,
            default: ""
        },
        caption: {
            type: String,
            default: ''
        }
    }
})
</script>

<style>

</style>