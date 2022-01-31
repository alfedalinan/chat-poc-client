<template>
  <q-page>
    <div class="q-pa-md" style="max-width: 100%;">
        <q-infinite-scroll :offset="5" reverse class="chat-scroll-view">
            <!-- <template slot="loading" v-if="true">
                <div class="row justify-center q-my-md">
                    <q-spinner color="primary" name="dots" size="40px" />
                </div>
            </template> -->

            <q-chat-message
                v-for="message in messages"
                :key="message.id"
                :name="(message.first_name == '' || message.last_name == '') ? message.username : message.first_name + ' ' + message.last_name"
                :text="[`${message.text}`]"
                bg-color="bg-primary"
                :stamp="message.created_at"
                :sent=message.sent
            />

        </q-infinite-scroll>
    </div>
    <!-- <div style="height: 75px;"></div> -->
    <div style="position: sticky; bottom: 0;" class="row">
        <div class="col" style="padding-bottom: 10px; padding-left: 25px; padding-right: 25px; background-color: #b5bdb5;">
            <!-- <q-input v-model="text" style="width: 100%;" /> -->
            <q-input v-model="text" @keyup="sendMessage($event)">
                <template v-slot:after>
                    <q-btn round dense flat icon="send" @click="sendMessage($event)" />
                </template>
            </q-input>
        </div>
    </div>
  </q-page>
</template>

<script>
import { defineComponent, ref } from "@vue/composition-api";
import { toChatDateFormat, scrollToBottom, resizeWindow, consumeApi } from "../utils/helper";
import { v4 as uuidv4 } from "uuid";

export default defineComponent({
    name: 'Chat',
    components: {},
    data() {
        return {
            messages: [],
            text: '',
            userDetails: JSON.parse(localStorage.getItem(process.env.USER_PREF_KEY) || '{}'),
        }
    }, 
    methods: {
        async getMessages() {
            
            let opts = {
                axios: this.$axios,
                router: this.$router,
                method: 'get',
                url: `${process.env.API}/message/${this.$route.params.conversationId}`,
                notify: this.$q.notify
            };

            await consumeApi(opts)
                .then((response) => {
                    let result = response.data;

                    for (let i = 0; i < result.data.length; i++) {

                        result.data[i].created_at = toChatDateFormat(new Date(result.data[i].created_at));

                        if (result.data[i].from_member == this.userDetails.id) {
                            result.data[i]['sent'] = false
                            
                        }
                        else {
                            result.data[i]['sent'] = true;
                        }
                    }

                    this.messages = result.data;
                    // this.$store.state.messages = this.messages;
                    this.$store.commit('assignMessages', this.messages);

                })
                .catch((error) => {

                });
            
            this.setReadStatus();
        },
        sendMessage(event) {
            
            // If user pressed ENTER key or clicked the send button
            if ( (event.type == "keyup" && event.keyCode == 13) || event.type == "click") {
                this.$socket.emit("message.send:send", {
                    msg_uuid: uuidv4(),
                    conversation_id: this.$route.params.conversationId,
                    text: this.text,
                    sender_user_id: this.$route.params.sender_user_id,
                    sender_register_id: this.$route.params.sender_register_id,
                    receiver_user_id: this.$route.params.receiver_user_id,
                    receiver_register_id: this.$route.params.receiver_register_id,
                    sender_first_name: this.userDetails.first_name,
                    sender_last_name: this.userDetails.last_name,
                    sender_username: this.userDetails.username
                });
                event.preventDefault();

                this.text = '';
                scrollToBottom('q-infinite-scroll');
            }

        },
        setReadStatus() {
            this.$socket.emit("message.status.read:set", {
                user_id: this.userDetails.id,
                conversation_id: this.$route.params.conversationId
            });

        }
    },
    mounted() {
        
        scrollToBottom('q-infinite-scroll');

        window.setTimeout(() => {
            resizeWindow(document, 'q-infinite-scroll');
        }, 20);

        window.onresize = () => {
            window.setTimeout(() => {
                resizeWindow(document, 'q-infinite-scroll');
            }, 20);
        } 
        
        this.getMessages();
    }
})
</script>

<style>

</style>