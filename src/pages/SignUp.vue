<template>
    <div class="q-pa-md" style="max-width: 100%">
        <div class="form-title">Sign up for a new Mini-Chat account</div>
        <q-form>
            <q-input label="Username" v-model="username" ref="usernameInput" :rules="requiredFields" square></q-input>
            <br>
            <q-input label="First Name" v-model="firstName" square></q-input><br>
            <q-input label="Last Name" v-model="lastName" square></q-input><br>
            <q-input label="Email" v-model="email" ref="emailInput" :rules="requiredFields" square></q-input>
            <q-input label="Password" type="password" ref="passwordInput" :rules="requiredFields" v-model="password" v-on:keyup="checkPasswords()" square></q-input>
            <q-input label="Confirm Password" type="password" ref="confirmInput" :rules="confirmPasswords" v-model="confirmPassword" v-on:keyup="checkPasswords()" square></q-input>
        </q-form>
        <br/>
        <q-btn color="primary" @click="submit()" style="width: 100%;" label="Submit"  />
    </div>
</template>

<script>
import { defineComponent } from "@vue/composition-api";
import { encryptText, consumeApi } from "../utils/helper";

export default defineComponent({
    name: 'SignUp',
    components: {},
    data() {
        return {
            username: '',
            password: '',
            firstName: '',
            lastName: '',
            email: '',
            confirmPassword: '',
            passwordsMatch: true,
        }
    },
    computed: {
        confirmPasswords() {
            return [
                (val) => !!val || 'Field is required',
                (val) => val == this.$refs.passwordInput.value || 'Passwords do not match'
            ];
        },
        requiredFields() {
            return [
                (val) => !!val || 'Field is required'
            ];
        }
    },
    methods: {
       checkPasswords() {

           if (this.password != this.confirmPassword) {
               this.passwordsMatch = false
           }
           else {
               this.passwordsMatch = true;
           }

       },
       submit() {

           if (this.$refs.usernameInput.hasError || this.$refs.passwordInput.hasError || this.$refs.confirmInput.hasError || this.$refs.emailInput.hassError) {
               this.$q.notify({
                   color: "negative",
                   message: "Please fill in the required fields",
                   timeout: 1500
               });
           }
           else if (this.username == "" || this.password == "" || this.confirmPassword == "") {
               this.$q.notify({
                   color: "negative",
                   message: "Please fill in the required fields",
                   timeout: 1500
               });
           }
           else if (!this.passwordsMatch) {
               this.$q.notify({
                   color: "negative",
                   message: "Your passwords do not match",
                   timeout: 1500
               });
           }
           else {

               let opts = {
                    axios: this.$axios,
                    router: this.$router,
                    method: 'post',
                    url: `${process.env.API}/user`,
                    notify: this.$q.notify,
                    data:  {
                        username: this.username,
                        password: encryptText(this.password.trim()),
                        first_name: this.firstName,
                        last_name: this.lastName,
                        email: this.email
                    }
                };

               //Signing up...
               consumeApi(opts)
               .then((response) => {

                    let result = response.data;

                    if (result.status == 200) {
                        this.$q.notify({
                            color: "positive",
                            message: "Your account has been created successfully",
                            timeout: 1500
                        });

                        setTimeout(() => {
                            this.$router.push({ name: 'Login' })
                        }, 2000);
                    }
                    else {

                        this.$q.notify({
                            color: "negative",
                            message: result.data.msg,
                            timeout: 1500
                        });

                    }
               })
               .catch((error) => {

               });
           }
       } 
    }
})
</script>

<style>

</style>