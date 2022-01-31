import { RouteConfig } from 'vue-router';
import Default from 'pages/Default.vue';
import Login from 'pages/Login.vue';
import Chat from "pages/Chat.vue";
import SignUp from "pages/SignUp.vue";
import Contacts from "pages/Contacts.vue";
import MyInfo from "pages/MyInfo.vue";
import Error412 from "pages/Error412.vue";

import DefaultLayout from "layouts/DefaultLayout.vue";
import SignUpLayout from "layouts/SignUpLayout.vue";
import LoginLayout from "layouts/LoginLayout.vue";

const routes: RouteConfig[] = [
  {
    path: '/',
    component: DefaultLayout,
    children: [
      { path: '', component: Default, name: 'Messages' }
    ],
    meta: { title: 'Messages' },
  },
  {
    path: '/contacts',
    component: DefaultLayout,
    children: [
      { path: '', component: Contacts, name: 'Contacts'  } 
    ]
  },
  {
    path: '/sign-up',
    component: SignUpLayout,
    children: [
      { path: '', component: SignUp, name: 'SignUp' }
    ],
    meta: { title: 'SignUp' }
  },
  {
    path: '/login',
    component: LoginLayout,
    children: [
      { path: '', component: Login, name: 'Login' }
    ],
    meta: { title: 'Login' }
  },
  {
    path: '/chat',
    component: DefaultLayout,
    children: [
      { path: '', component: Chat, name: 'Chat' }
    ],
    meta: { title: 'Chat' }
  },
  {
    path: '/my-info',
    component: DefaultLayout,
    children: [
      { path: '', component: MyInfo, name: 'MyInfo' }
    ]
  },

  // Always leave this as last one,
  // but you can also remove it
  {
    path: "/err-412",
    name: "Error412",
    component: Error412
  },
  {
    path: '*',
    name: 'Error',
    component: () => import('pages/Error404.vue')
  }
];

export default routes;
