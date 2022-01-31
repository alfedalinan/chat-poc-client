import { store } from 'quasar/wrappers';
import Vuex from 'vuex';

// import example from './module-example';
// import { ExampleStateInterface } from './module-example/state';

/*
 * If not building with SSR mode, you can
 * directly export the Store instantiation
 */

export interface StateInterface {
  // Define your own store structure, using submodules if needed
  // example: ExampleStateInterface;
  // Declared as unknown to avoid linting issue. Best to strongly type as per the line above.
  example: unknown;
}

export default store(function ({ Vue }) {
  Vue.use(Vuex);

  const Store = new Vuex.Store<any>({
    modules: {
      // example
    },

    // enable strict mode (adds overhead!)
    // for dev mode only
    strict: !!process.env.DEBUGGING,
    state: {
      messages: [],
      contacts: [],
      convReceiverDetails: {}
    },
    mutations: {
      // Component: Messages
      assignConversations(state, payload) {
        state.contacts = payload;
      },
      pushConversation(state, data) {
        state.contacts.push(data);
      },
      incrementUnread(state, index) {
        state.contacts[index].unread_messages += 1;
      },
      setRegisterId(state, data) {
        state.contacts[data.index].register_id = data.register_id;
      },
      // Component: Chat
      assignMessages(state, payload) {
        state.messages = payload;
      },
      pushMessage(state, data) {
        state.messages.push(data);
      }
    }
  });

  return Store;
});
