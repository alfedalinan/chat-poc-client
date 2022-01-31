<template>
  <div id="q-app">
    <router-view />
  </div>
</template>
<script lang="ts">
import { defineComponent } from '@vue/composition-api';
import { store } from 'quasar/wrappers';
import { toChatDateStringFormat, scrollToBottom } from "./utils/helper";

export default defineComponent({
  name: 'App',
  data() {
    return {
      userDetails: JSON.parse( localStorage.getItem(process.env.USER_PREF_KEY) || '{}')
    }
  },
  mounted() {
    console.log(this.$store.state);
    this.$socket.off('message.send:ack');
    this.$socket.off('message.receive:send');
    this.$socket.off('user.register:ack');

    // SENDING ACKNOWLEDGED
    this.$socket.on('message.send:ack', (data) => {
      
      switch (this.$route.name) {
        case 'Chat':

            this.$store.commit('pushMessage', {
              conversation_id: data.conversation_id,
              created_at: toChatDateStringFormat(data.created_at),
              from_member: data.sender_user_id,
              id: data.msg_id,
              status: data.status,
              text: data.text,
              to_member: data.receiver_user_id,
              updated_at: data.updated_at,
              sent: false,
              first_name: data.additional.sender_first_name,
              last_name: data.additional.sender_last_name,
              username: data.additional.sender_username,
            });

          break;
        case 'Messages':
          this.$store.commit('pushConversation', {
             conversation_id: data.conversation_id,
             deleted: false,
             first_name: this.$store.state.convReceiverDetails.firstName,
             last_name: this.$store.state.convReceiverDetails.lastName,
             register_id: data.receiver_register_id,
             id: data.receiver_user_id,
             unread_messages: 0,
             username: this.$store.state.convReceiverDetails.username
           });

          break;

        default:
          break;
      }

    });

    // RECEIVING MESSAGE
    this.$socket.on('message.receive:send', (data) => {

      switch (this.$route.name) {
        case 'Chat':
            this.$store.commit('pushMessage', {
              conversation_id: data.conversation_id,
              created_at: toChatDateStringFormat(data.created_at),
              from_member: data.sender_user_id,
              id: data.msg_id,
              status: data.status,
              text: data.text,
              to_member: data.receiver_user_id,
              updated_at: data.updated_at,
              sent: true,
              first_name: data.additional.receiver_first_name,
              last_name: data.additional.receiver_last_name,
              username: data.additional.receiver_username,
            });

            setTimeout(() => {
              this.$socket.emit('message.status.read:send', data);
              scrollToBottom('q-infinite-scroll');
            }, 800);

          break;
        case 'Messages':

          if (this.$store.state.contacts.length > 0) {

            let isNotifPushed = false;

            this.$store.state.contacts.forEach((item: any, index: number) => {
              if (item.conversation_id == data.conversation_id) {
                this.$store.commit('incrementUnread', index);
                isNotifPushed = true;
              }
            });

            // isNotifPushed is true if a new message is already delivered
            // else, we will consider this as new message and add it to the list
            if (!isNotifPushed) {
              this.$store.commit('pushConversation', {
                  conversation_id: data.conversation_id,
                  deleted: false,
                  first_name: data.additional.receiver_first_name,
                  last_name: data.additional.receiver_last_name,
                  register_id: data.sender_register_id,
                  id: data.sender_user_id,
                  unread_messages: 1,
                  username: data.additional.receiver_username
              });

            }
          }
          else {

            this.$store.commit('pushConversation', {
                conversation_id: data.conversation_id,
                deleted: false,
                first_name: data.additional.receiver_first_name,
                last_name: data.additional.receiver_last_name,
                register_id: data.sender_register_id,
                id: data.sender_user_id,
                unread_messages: 1,
                username: data.additional.receiver_username
            });

          }

          setTimeout(() => {
            this.$socket.emit('message.status.delivered:send', data);
            scrollToBottom('q-page');
          }, 800);          
          break;
        default:
          break;
      }

    });

    this.$socket.on('user.register:ack', (data) => {



      if (data.userId == this.userDetails.id) {

        this.userDetails = {
          id: data.userId,
          username: data.username,
          register_id: data.register_id,
          session_id: data.session_id,
          first_name: data.first_name,
          last_name: data.last_name,
          email: data.email
        };

        localStorage.removeItem(process.env.USER_PREF_KEY)
        localStorage.setItem(process.env.USER_PREF_KEY, JSON.stringify(this.userDetails));

      }
      else {

        switch (this.$route.name) {
          case 'Messages':
            
              this.$store.state.contacts.forEach((item: any, index: number) => {
                
                if (item.id == data.userId) {
                  
                  this.$store.commit('setRegisterId', { index: index, register_id: data.register_id })
                  return;
                }

              })

            break;
          
          case 'Chat':

            if (typeof this.$route.params != "undefined") {

              this.$route.params.receiver_user_id = data.userId;
              this.$route.params.receiver_register_id = data.register_id;

            }

            break;
        
          default:
            break;
        }

      }

    });
  }
});
</script>
