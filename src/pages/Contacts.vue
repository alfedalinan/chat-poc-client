<template>
  <div class="q-pa-md" style="max-width: 100%;">
      <q-page>
        <transition appear enter-active-class="animated fadeIn" leave-active-class="animated fadeOut">  
          <q-list bordered separator v-if="contacts.length > 0">
            <q-item v-for="contact in contacts" :key="contact.id" class="q-my-sm">
                <q-item-section avatar>
                    <q-avatar color="primary" text-color="white">
                        {{ contact.username.substr(0, 1).toUpperCase() }}
                    </q-avatar>
                </q-item-section>

                <q-item-section>
                    <q-item-label v-if="contact.display_first_name != '' || contact.display_last_name != ''">{{ contact.display_first_name }} {{ contact.display_last_name }}</q-item-label>
                    <q-item-label v-if="contact.display_first_name == '' || contact.display_last_name == ''">{{ contact.username }}</q-item-label>
                    <q-item-label caption lines="1">{{ contact.email }}</q-item-label>
                </q-item-section>

                <q-item-section side>
                    <q-btn @click="showDialog(contact, 'edit')" >
                      <q-icon name="mode_edit" color="primary"  />
                    </q-btn>
                </q-item-section>
                <q-item-section side>
                    <q-btn @click="showDialog(contact, 'delete')">
                      <q-icon name="delete" color="negative"  />
                    </q-btn>
                </q-item-section>
                <q-separator />
            </q-item>
          </q-list>

          <q-list bordered v-if="contacts.length == 0">
              <q-item class="q-my-sm" v-ripple>
                <q-item-section avatar>
                    <q-avatar color="primary" text-color="white">
                        <q-icon name="warning"></q-icon>
                    </q-avatar>
                </q-item-section>

                <q-item-section>
                    <q-item-label></q-item-label>
                    <q-item-label caption lines="1">No contacts found in your record</q-item-label>
                    </q-item-section>

                    <q-item-section side>
                </q-item-section>
                <q-separator />
            </q-item>
          </q-list>
        </transition>

          <q-page-sticky position="bottom-right" :offset="[25, 25]">
              <q-btn fab icon="add" color="accent" @click="newContact = true" />
          </q-page-sticky>

          <!-- NEW CONTACT DIALOG -->
          <q-dialog 
            v-model="newContact" 
            persistent
            :maximized="true"
            transition-show="slide-up"
            transition-hide="slide-down"
          >
              <q-card>
                  <q-card-section>
                      <div class="text-h6">
                          <q-avatar>
                              <q-icon name="perm_identity" color="primary"></q-icon>
                          </q-avatar>
                          Add New Contact
                      </div>
                  </q-card-section>
                  <q-card-section class="row items-center">
                       <q-select
                        filled
                        v-model="userId"
                        :options="users"
                        :option-label="'username'"
                        :option-value="'id'"
                        label="Type any username to search"
                        emit-value
                        use-input
                        clearable
                        @filter="filterFn"
                        input-debounce="0"
                        map-options
                        style="width:100%;"
                        :rules="[val => !!val || 'Field is required']"
                      />
                  </q-card-section>
                  <q-card-actions align="right">
                  <q-btn label="Cancel" color="info" v-close-popup @click="userId = ''" />
                  <q-btn label="Add Contact" icon-right="add" color="primary" @click="addContact()" />
                  </q-card-actions>
              </q-card>
          </q-dialog>
          <!-- // END - NEW CONTACT DIALOG -->

          <!-- EDIT CONTACT DIALOG -->
          <q-dialog 
            v-model="editContact" 
            persistent
            :maximized="true"
            transition-show="slide-up"
            transition-hide="slide-down"
          >
              <q-card>
                  <q-card-section>
                      <div class="text-h6">
                          <q-avatar>
                              <q-icon name="perm_identity" color="primary"></q-icon>
                          </q-avatar>
                          Update Contact Details
                      </div>
                  </q-card-section>
                  <q-card-section class="row items-center">
                    <q-input style="width: 100%" label="Display First Name" v-model="displayNames.firstName" ></q-input>
                  </q-card-section>
                  <q-card-section class="row items-center">
                    <q-input style="width: 100%" label="Display Last Name" v-model="displayNames.lastName" ></q-input>
                  </q-card-section>
                  <q-card-actions align="right">
                  <q-btn label="Cancel" color="info" v-close-popup />
                  <q-btn label="Update" icon-right="update" color="primary" @click="updateContact()" />
                  </q-card-actions>
              </q-card>
          </q-dialog>
          <!-- // END - EDIT CONTACT DIALOG -->

          <q-dialog v-model="confirm" persistent>
            <q-card>
                <q-card-section class="row items-center">
                <q-avatar icon="warning" color="warning" text-color="white" />
                <span class="q-ml-sm">Are you sure you want to delete this contact?</span>
                </q-card-section>

                <q-card-actions align="right">
                <q-btn flat label="No" color="primary" v-close-popup />
                <q-btn flat label="Yes" color="primary" @click="removeContact(selectedContact)" v-close-popup />
                </q-card-actions>
            </q-card>
        </q-dialog>
      </q-page>
  </div>
</template>

<script>
import { defineComponent } from "@vue/composition-api";
import { resizeWindow, consumeApi } from "../utils/helper"

export default defineComponent({
    name: 'Contacts',
    components: {},
    setup() {
      return { }
    },
    data() {
      return {
        contacts: [],
        userDetails: JSON.parse( localStorage.getItem(process.env.USER_PREF_KEY) || '{}'),
        newContact: false,
        editContact: false,
        users: [],
        userOptions: [],
        userId: null,
        confirm: false,
        selectedContact: {},
        toUpdate: {},
        displayNames: {
          firstName: '',
          lastName: ''
        },
      }
    },
    methods: {
      filterFn (val, update, abort) {
        if (val == '') {
          this.users = this.userOptions;
        }

        if (val.length < 2) {
          abort()
          return
        }

        update(() => {
          const needle = val.toLowerCase()
          this.users = this.userOptions.filter(v => v.username.toLowerCase().indexOf(needle) > -1)
        })
      },
      addContact() { 
        
        let opts = {
          axios: this.$axios,
          router: this.$router,
          method: 'post',
          url: `${process.env.API}/user_contact`,
          data: {
            user_id: this.userDetails.id,
            contact_id: this.userId
          },
          notify: this.$q.notify
        };

        consumeApi(opts)
        .then(response => {

          let result = response.data;

          this.contacts.push({
            id: result.data.insertId,
            contact_id: result.data.insertData.contact_id,
            display_first_name: "",
            display_last_name: "",
            email: result.data.insertData.email,
            username: result.data.insertData.username
          })

          this.$q.notify({
            color: "primary",
            message: result.data.msg,
            timeout: 1500
          });

          this.newContact = false;
        })

      },
      updateContact() {

        let opts = {
          axios: this.$axios,
          router: this.$router,
          method: 'put',
          url: `${process.env.API}/user_contact/${this.toUpdate.id}`,
          data: {
            display_first_name: this.displayNames.firstName,
            display_last_name: this.displayNames.lastName
          },
          notify: this.$q.notify
        };

        consumeApi(opts)
          .then(response => {
            let result = response.data;

            this.contacts.forEach((item) => {

              if (item.contact_id == this.toUpdate.contact_id) {
                item.display_first_name = this.displayNames.firstName;
                item.display_last_name = this.displayNames.lastName;
                this.editContact = false;

                this.$q.notify({
                  color: "primary",
                  message: result.data.msg,
                  timeout: 1500
                });
              }

            });
          })
          .catch(error => {

          })

      },
      removeContact(selectedContact) {
        
        let opts = {
          axios: this.$axios,
          router: this.$router,
          method: 'delete',
          url: `${process.env.API}/user_contact/${selectedContact.id}`,
          notify: this.$q.notify
        };

        consumeApi(opts)
          .then(response => {

            this.contacts.forEach((item) => {
              
              if (item.id == selectedContact.id) {
                this.contacts.splice( this.contacts.indexOf(selectedContact), 1 );
                this.$q.notify({
                  color: "primary",
                  message: "Contact has been removed successfully",
                  timeout: 1500
                })
                return;
              }

            });

          })
          .catch()
      },
      showDialog(contact, mode) {
        
        switch (mode) {
          case "edit":
            this.editContact = true;
            this.toUpdate = contact;
            this.displayNames.firstName = contact.display_first_name;
            this.displayNames.lastName = contact.display_last_name;
            break;
          case "delete":
            this.confirm = true;
            this.selectedContact = contact;
          default:
            break;
        }
      }
    },
    mounted() {
      
      if (this.userDetails.hasOwnProperty('username')) {
        
        let opts = {
          axios: this.$axios,
          router: this.$router,
          method: 'get',
          url: `${process.env.API}/user?field=username&value=${this.userDetails.username}`,
          notify: this.$q.notify
        };

        consumeApi(opts)
          .then((response) => {

            let result = response.data;
            
            // add data to contact list
            
            this.userOptions = result.data;
            this.users = this.userOptions;
          })
          .catch((error) => {
            console.error(error);
          })

      }

      if (this.userDetails.hasOwnProperty('id')) {

        let opts = {
          axios: this.$axios,
          router: this.$router,
          method: 'get',
          url: `${process.env.API}/user_contact/${this.userDetails.id}`,
          notify: this.$q.notify
        };

        consumeApi(opts)
          .then(response => {

            let result = response.data;
            
            this.contacts = result.data;
            
          })
          .catch(error => {

          });

      }

      resizeWindow(document, 'q-page');

    }
});

</script>

<style>

</style>