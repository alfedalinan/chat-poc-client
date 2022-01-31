<template>
  <div class="q-pa-md" style="max-width: 100%" >
      <q-page >
        <!-- <transition v-if="contacts.length > 0" appear enter-active-class="animated fadeIn" leave-active-class="animated fadeOut">     -->
            <q-list transition-hide="slide-left" bordered separator class="contact-list-item" v-for="contact in contacts" :key="contact.id">
                <q-item>
                    <q-item-section avatar>
                        <q-icon color="primary" name="person_pin" />
                    </q-item-section>
                    <q-item-section v-if="contact.first_name == '' || contact.last_name == ''">{{ contact.username }}</q-item-section>

                    <q-item-section v-if="contact.first_name != '' || contact.last_name != ''">{{ contact.first_name }} {{ contact.last_name }}</q-item-section>

                    <q-item clickable v-ripple @click="viewMessage(contact)">
                        <q-badge color="secondary" v-if="contact.unread_messages > 0" floating>{{ contact.unread_messages }}</q-badge>
                        <q-icon name="message" color="primary" size="sm" title="View Message" />
                    </q-item>
                    <q-item clickable v-ripple @click="showDialog(contact)">
                        <q-icon name="delete" size="sm" color="negative" title="Delete Conversation" />
                    </q-item>
                </q-item>
            </q-list>

            <!-- <q-list bordered separator>
            <q-item>
                <q-item-section avatar>
                    <q-icon color="primary" name="person_pin" />
                </q-item-section>
                <q-item-section>User Two</q-item-section>
                <q-item clickable v-ripple v-on:click="viewMessage(1, 'User Two')">
                    <q-icon name="message" color="primary" size="sm" title="View Message" />
                </q-item>
                <q-item clickable v-ripple>
                    <q-icon name="delete" size="sm" color="negative" title="Delete Conversation" />
                </q-item>
            </q-item>
            </q-list> -->
        <!-- </transition> -->

        <q-list bordered v-if="contacts.length == 0">
              <q-item class="q-my-sm" v-ripple>
                <q-item-section avatar>
                    <q-avatar color="primary" text-color="white">
                        <q-icon name="warning"></q-icon>
                    </q-avatar>
                </q-item-section>

                <q-item-section>
                    <q-item-label></q-item-label>
                    <q-item-label caption lines="1">No conversations as of now</q-item-label>
                    </q-item-section>

                    <q-item-section side>
                </q-item-section>
                <q-separator />
            </q-item>
          </q-list>

        <q-page-sticky position="bottom-right" :offset="[18, 18]">
            <q-btn fab icon="add" color="accent" @click="newConvo = true" />
        </q-page-sticky>

        <q-dialog v-model="confirm" persistent>
            <q-card>
                <q-card-section class="row items-center">
                <q-avatar icon="warning" color="warning" text-color="white" />
                <span class="q-ml-sm">Are you sure you want to delete this conversation? You cannot retreive messages after this.</span>
                </q-card-section>

                <q-card-actions align="right">
                <q-btn flat label="No" color="primary" v-close-popup />
                <q-btn flat label="Yes" color="primary" @click="removeMessage(selected)" v-close-popup />
                </q-card-actions>
            </q-card>
        </q-dialog>

        <q-dialog 
            v-model="newConvo" 
            persistent
            :maximized="true"
            transition-show="slide-up"
            transition-hide="slide-down"
        >
            <q-card>
                <q-card-section>
                    <div class="text-h6">
                        <q-avatar>
                            <q-icon name="message" color="primary"></q-icon>
                        </q-avatar>
                        Send New Message
                    </div>
                </q-card-section>
                <q-card-section class="row items-center">
                    <q-select
                        clearable
                        v-model="userContact"
                        use-input
                        input-debounce="0"
                        label="Select from contacts"
                        :options="contactList"
                        @filter="filterFn"
                        style="width: 100%;"
                        behavior="menu"
                        :option-label="'username'"
                        :option-value="'contact_id'"
                        :rules="[val => !!val || 'Field is required']"
                    >
                        <template v-slot:no-option>
                        <q-item>
                            <q-item-section class="text-grey">
                            No results
                            </q-item-section>
                        </q-item>
                        </template>
                    </q-select>
                </q-card-section>
                <q-card-section>
                    <q-input
                        v-model="text"
                        type="textarea"
                        label="Type your message here"
                        />
                </q-card-section>

                <q-card-actions align="right">
                <q-btn label="Cancel" color="info" v-close-popup />
                <q-btn label="Send" icon-right="send" color="primary" @click="sendMessage()" v-close-popup />
                </q-card-actions>
            </q-card>
        </q-dialog>
    </q-page>
  </div>
</template>

<script lang="ts">
import { defineComponent } from '@vue/composition-api';
import { log } from 'console';
import { v4 as uuidv4 } from "uuid";
import { resizeWindow, consumeApi } from "../utils/helper";

export default defineComponent({
  name: 'Default',
  components: { },
  data() {
      return {
        contacts: [],
        userDetails: JSON.parse(localStorage.getItem(process.env.USER_PREF_KEY) || '{}'),
        contactList: [],
        contactOptions: [],
        confirm: false,
        newConvo: false,
        text: "",
        selected: {},
        userContact: null 
      }
  },
  methods: {
      viewMessage(contact: any) {
          this.$router.push({ 
              name: 'Chat', 
              params: { 
                  conversationId: contact.conversation_id.toString(), 
                  username: contact.username,
                  receiver_register_id: contact.register_id,
                  receiver_user_id: contact.id,
                  sender_user_id: this.userDetails.id,
                  sender_register_id: this.userDetails.register_id 
              } 
           });

      },
      removeMessage(contact: any) {

          let opts = {
              axios: this.$axios,
              router: this.$router,
              method: 'delete',
              url: `${process.env.API}/conversation/${contact.conversation_id}`,
              notify: this.$q.notify
          };

          consumeApi(opts)
            .then((response) => {
                
                let result = response.data;
                
                if (result.status == 200) {
                    this.contacts.splice( this.contacts.indexOf(<never>contact), 1 );
                }

            })
            .catch((error) => {

            });
          
      },
      sendMessage() {
            console.log(this.contacts);
            console.log(this.userContact);

            let conversationExists: boolean = false;
            let conversationFound: any = null;

            for (let i = 0; i < this.contacts.length; i++) {
                const item = this.contacts[i];
                
                if (item['id'] == this.userContact!['contact_id']) {
                    conversationExists = true;
                    conversationFound = item;
                    break;
                }
            }
            
            if (!conversationExists) {

                let opts = {
                    axios: this.$axios,
                    router: this.$router,
                    method: 'post',
                    url: `${process.env.API}/conversation`,
                    data: {
                        name: '',
                        members: [this.userDetails.id, this.userContact!['contact_id']]
                    },
                    notify: this.$q.notify
                };

                consumeApi(opts)
                .then(response => {
                    
                    let result = response.data;

                    let senderRegisterId: string = this.userDetails.register_id;
                    let receiverRegisterId: string = "";
                    
                    let senderDetails: any = {};
                    let receiverDetails: any = {};

                    senderDetails['register_id'] = this.userDetails.register_id;

                    /**
                     * data: msg_uuid, 
                            conversation_id, 
                            text, 
                            sender_user_id, 
                            receiver_user_id,
                            sender_register_id,
                            receiver_register_id
                    */
                    for (let i = 0; i < result.data.users.length; i++) {
                        
                        // receiver
                        if (result.data.users[i].register_id != senderRegisterId) {
                            receiverRegisterId = result.data.users[i].register_id;

                            receiverDetails = {
                                firstName: result.data.users[i].first_name,
                                lastName: result.data.users[i].last_name,
                                username: result.data.users[i].username,
                                email: result.data.users[i].email
                            };

                            this.$store.state.convReceiverDetails = receiverDetails;

                        }
                        else {
                            // sender
                            senderDetails['firstName'] = result.data.users[i].first_name;
                            senderDetails['lastName'] = result.data.users[i].last_name;
                            senderDetails['username'] = result.data.users[i].username;
                            senderDetails['email'] = result.data.users[i].email;

                            // this.$store.convSenderDetails = senderDetails;
                        }

                    }

                    this.$socket.emit("message.send:send", {
                        msg_uuid: uuidv4(),
                        conversation_id: result.data.conversation_id,
                        text: this.text,
                        sender_user_id: this.userDetails.id,
                        receiver_user_id: this.userContact!['contact_id'],
                        sender_register_id: senderRegisterId,
                        receiver_register_id: receiverRegisterId,
                        sender_first_name: senderDetails.firstName,
                        sender_last_name: senderDetails.lastName,
                        sender_username: senderDetails.username,
                        sender_email: senderDetails.email,
                        receiver_first_name: receiverDetails.firstName,
                        receiver_last_name: receiverDetails.lastName,
                        receiver_username: receiverDetails.username
                    });
                })
                .catch();
            }
            else {
                console.log(`Conversation exists`, conversationFound);
                
                let opts = {
                    axios: this.$axios,
                    router: this.$router,
                    method: 'get',
                    url: `${process.env.API}/conversation/${conversationFound!['conversation_id']},${conversationFound!['id']}`,
                    data: {},
                    notify: this.$q.notify
                };

                consumeApi(opts)
                .then((response) => {

                    let result = response.data;

                    this.$socket.emit("message.send:send", {
                        msg_uuid: uuidv4(),
                        conversation_id: conversationFound.conversation_id,
                        text: this.text,
                        sender_user_id: this.userDetails.id,
                        receiver_user_id: conversationFound.id,
                        sender_register_id: this.userDetails.register_id,
                        receiver_register_id: result[0].register_id,
                        sender_first_name: this.userDetails.firstName,
                        sender_last_name: this.userDetails.lastName,
                        sender_username: this.userDetails.username,
                        sender_email: this.userDetails.email,
                        receiver_first_name: conversationFound.first_name,
                        receiver_last_name: conversationFound.last_name,
                        receiver_username: conversationFound.username
                    });

                    this.viewMessage(conversationFound);

                })
                .catch();
            }
      },
      filterFn (val: String, update: Function, abort: Function) {
        
        if (val.length < 2) {
          abort()
          return
        }
        
        if (val === '') {
            update(() => {
            this.contactList = this.contactOptions;
            })
            return
        }

        update(() => {
            const needle = val.toLowerCase()
            this.contactList = this.contactOptions.filter((v: any) => v.username.toLowerCase().indexOf(needle) > -1)
        })
      },
      showDialog(contact: any) {
          this.confirm = true;
          this.selected = contact;
      },
      populateMessages() {
          
          if (this.userDetails.hasOwnProperty('id')) {
              
            let opts = {
                axios: this.$axios,
                router: this.$router,
                method: 'get',
                url: `${process.env.API}/conversation?id=${this.userDetails.id}`,
                notify: this.$q.notify
            };

              consumeApi(opts)
                .then((response) => {
                    this.contacts = response.data.data;
                    // this.$store.state.contacts = this.contacts;
                    this.$store.commit('assignConversations', this.contacts);
                })
                .catch((error) => {

                });
          }

      },
      populateContacts() {

        let opts = {
            axios: this.$axios,
            router: this.$router,
            method: 'get',
            url: `${process.env.API}/user_contact/${this.userDetails.id}`,
            notify: this.$q.notify
        };

          consumeApi(opts)
            .then(response => {
                this.contactList = response.data.data;
                this.contactOptions = this.contactList;
            })
            .catch(error => {

            })
      }
  },
  mounted() {
        this.populateMessages();
        this.populateContacts();

        resizeWindow(document, 'q-page');

        this.$socket.emit(`user.register:send`, {
            userId: this.userDetails.id,
            username: this.userDetails.username,
            register_id: this.userDetails.register_id,
            first_name: this.userDetails.first_name,
            last_name: this.userDetails.last_name,
            email: this.userDetails.email
        });
  }
  
});
</script>

<style>
.contact-list-item {
    margin-top: 5px;
    margin-bottom: 5px;
}


</style>
