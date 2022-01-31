// import something here
import { boot } from "quasar/wrappers";
import { io, Socket } from "socket.io-client";

// "async" is optional;
// more info on params: https://quasar.dev/quasar-cli/boot-files

declare module 'vue/types/vue' {
  interface Vue {
    $socket: Socket;
  }
}

export default boot(({ Vue }) => {
  // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
  Vue.prototype.$socket = io(`${process.env.API}/`);
  console.log(`{ Socket IO Client loaded. }`)
});