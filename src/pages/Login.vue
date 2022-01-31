<template>
  <div class="q-pa-md" style="max-width: 100%">
        <div class="form-title">Login to your Mini-Chat Account</div>
        <q-form>
            <q-input
                label="Username"
                v-model="username"
                square
                ref="usernameLogin"
                :rules="requiredFields"
            ></q-input>
            <br>
            <q-input
                square
                type="password"
                label="Password"
                ref="passwordLogin"
                v-model="password"
                :rules="requiredFields"
            ></q-input>
            <br>
            <!-- <div class="text-negative" v-if="restrictionLabel != ''" >{{ restrictionLabel }}</div> -->
            <q-btn color="primary" id="login-btn" label="Login" v-on:click="initLogin()" />
        </q-form>
        <div class="q-pa-md text-center">
            <small>Not yet a member? Click <a :href="signUpLink">here</a> to sign up </small>
        </div>
    </div>
</template>

<script lang="ts">
import { defineComponent } from '@vue/composition-api';
import { v4 as uuidv4 } from "uuid";
import { encryptText, consumeApi } from "../utils/helper"

export default defineComponent({
  name: 'Login',
  components: {},
  data() {
    return {
      signUpLink: '#/sign-up',
      restrictionLabel: '',
      username: "",
      password: "",
      isUserIncorrect: false,
      isPasswordIncorrect: false
    }
  },
  computed: {
    requiredFields() {
        return [
            (val: any) => !!val || 'Field is required'
        ];
    }
  },
  methods: {
    initLogin() {

      if (this.username == "" || this.password == "") {
        this.$q.notify({
          color: 'negative',
          message: "Please fill in the required fields",
          timeout: 1500
        });
      }
      else {

        let loginData: Object = {
          username: this.username, 
          password: encryptText(this.password.trim())
        }

        
        let opts = {
            axios: this.$axios,
            router: this.$router,
            method: 'post',
            url: `${process.env.API}/login`,
            data: loginData,
            notify: this.$q.notify
        };

        consumeApi(opts)
          .then((response) => {
            let result = response.data;

            if (result.status == 200) {
              localStorage.clear();

              result.data.register_id = (result.data.register_id == null || result.data.register_id == "") ? uuidv4() : result.data.register_id;

              localStorage.setItem(process.env.TOKEN_PREF_KEY, JSON.stringify({ access_token: result.data.access_token, refresh_token: result.data.refresh_token }));

              delete result.data.refresh_token;
              delete result.data.access_token;

              localStorage.setItem(process.env.USER_PREF_KEY, JSON.stringify(result.data));

              this.$router.push({ path: '/'});
            }
            else {

              this.$q.notify({
                color: 'negative',
                message: `*${result.data.msg}`
              });
            }
            
          })
          .catch((error) => {

            this.$q.notify({
                color: 'negative',
                message: `*A server problem occured. Try again later`
              });
          })

      }

    }
  }
});
</script>

<style>
 #login-btn {
     width: 100%
 }
</style>
