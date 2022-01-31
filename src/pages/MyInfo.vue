<template>
    <div class="q-pa-md" style="max-width: 100%" >
        <q-page>
            <div class="row">
                <div class="text-h6 text-primary col-10">Basic Information</div>
                <div class="text-secondary col-2">
                    <q-item clickable @click="editInfo()">Edit</q-item>
                </div>
            </div>
            <q-form>
            <q-input
                label="Username"
                v-model="username"
                square
                filled
                readonly
            ></q-input>
            <br>
            <q-input
                label="First Name"
                v-model="firstName"
                square
                filled
                readonly
            ></q-input>
            <br>
            <q-input
                label="Last Name"
                v-model="lastName"
                square
                filled
                readonly
            ></q-input>
            <br>
            <q-input
                label="Email Address"
                v-model="email"
                square
                filled
                readonly
            >
            </q-input>
            <br>
            <!-- <div class="text-negative" v-if="restrictionLabel != ''" >{{ restrictionLabel }}</div> -->
            <q-dialog 
                v-model="editDialog" 
                persistent
                :maximized="true"
                transition-show="slide-up"
                transition-hide="slide-down"
            >
                <q-card>
                    <q-card-section>
                        <div class="text-h6 text-primary">
                            Update your Information
                        </div>
                    </q-card-section>
                    <q-card-section class="row items-center">
                        <q-input label="Username" v-model="usernameDialog" filled style="width: 100%;"></q-input>
                    </q-card-section>
                    <q-card-section class="row items-center">
                        <q-input label="First Name" v-model="firstNameDialog" filled style="width: 100%;"></q-input>
                    </q-card-section>
                    <q-card-section class="row items-center">
                        <q-input label="Last Name" v-model="lastNameDialog" filled style="width: 100%;"></q-input>
                    </q-card-section>
                    <q-card-section class="row items-center">
                        <q-input label="Email" v-model="emailDialog" filled style="width: 100%;"></q-input>
                    </q-card-section>

                    <q-card-actions align="right">
                    <q-btn label="Cancel" @click="reset()" color="info" v-close-popup />
                    <q-btn label="Update" @click="updateInfo()" icon-right="perm_identity" color="primary" />
                    </q-card-actions>
                </q-card>
            </q-dialog>
        </q-form>
        </q-page>
    </div>
</template>

<script>
import { defineComponent } from "@vue/composition-api";
import { consumeApi } from "../utils/helper";

export default defineComponent({
   name: 'MyInfo',
   data() {
       return {
            username: "",
            usernameDialog: "",
            firstName: "",
            firstNameDialog: "",
            lastName: "",
            lastNameDialog: "",
            email: "",
            emailDialog: "",
            disabled: true,
            editDialog: false,
            userDetails: JSON.parse( localStorage.getItem(process.env.USER_PREF_KEY) || '{}' )
       }
   },
   methods: {
       editInfo() {
           this.editDialog = true;
       },
       updateInfo() {

           let opts = {
                axios: this.$axios,
                router: this.$router,
                method: 'put',
                url: `${process.env.API}/user/${this.userDetails.id}`,
                data: {
                    username: this.usernameDialog,
                    first_name: this.firstNameDialog,
                    last_name: this.lastNameDialog,
                    email: this.emailDialog
                },
                notify: this.$q.notify
            };

            consumeApi(opts)
            .then(response => {
               let result = response.data;

               if (result.status == 200) {

                   this.$q.notify({
                       color: 'positive',
                       timeout: 1500,
                       message: result.data.msg
                   })
                   
                    this.username = this.usernameDialog;
                    this.firstName = this.firstNameDialog;
                    this.lastName = this.lastNameDialog;
                    this.email = this.emailDialog;

                   setTimeout(() => {
                       this.editDialog = false;
                   }, 500);
               }
               else {

                   this.$q.notify({
                       color: 'negative',
                       timeout: 1500,
                       message: result.data.msg
                   })

               }

           })
           .catch(error => {

           })

       },
       reset() {
           this.usernameDialog = this.username;
       }
   },
   mounted() {

       let opts = {
            axios: this.$axios,
            router: this.$router,
            method: 'get',
            url: `${process.env.API}/user/${this.userDetails.id}`,
            notify: this.$q.notify
        };

       consumeApi(opts)
        .then(response => {
            let result = response.data;

            this.username = result.data.username;
            this.usernameDialog = result.data.username;
            this.firstName = result.data.first_name;
            this.firstNameDialog = result.data.first_name;
            this.lastName = result.data.last_name;
            this.lastNameDialog = result.data.last_name;
            this.email = result.data.email;
            this.emailDialog = result.data.email;
        })
        .catch(error => {

        })
   }
});
</script>

<style>

</style>