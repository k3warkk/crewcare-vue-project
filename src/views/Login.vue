<template>
    <div>
        <h1>login</h1>
        <router-link to="signup">
            <button>Sign Up</button>
        </router-link>
        <router-link to="login-rfid">
            <button>USE RFID</button>
        </router-link>
        <form action="#" method="POST" @submit.prevent="onSubmit">
            <div>
                <label for="email">Email:</label>
                <input
                    type="email"
                    name="email"
                    id="email"
                    required
                    placeholder="Email"
                    autocomplete="email"
                    v-model="email"
                />
            </div>
            <div>
                <label for="password">Password:</label>
                <input
                    type="password"
                    name="password"
                    id="password"
                    required
                    placeholder="Password"
                    autocomplete="current-password"
                    v-model="password"
                />
            </div>
            <button>Login</button>
        </form>
        <div v-if="error.value">{{ error.value }}</div>
    </div>
</template>

<script>
import { inject, ref } from "vue";
import axiosClient from "../axios.js";
import { useRouter } from "vue-router";

export default {
    setup() {
        const stateContext = inject("stateContext");
        if (!stateContext) {
            throw new Error("StateContext is not provided");
        }

        const { setCurrentUser, setUserToken, setUserRole } = stateContext;

        const router = useRouter();

        const email = ref("");
        const password = ref("");
        const error = ref("");

        const onSubmit = () => {
            error.value = "";

            axiosClient
                .post("/login", {
                    email: email.value,
                    password: password.value,
                })
                .then((response) => {
                    if (response.status === 200) {
                        // Check if the status code is 200 (OK)
                        setCurrentUser(response.data.user);
                        setUserToken(response.data.token);
                        setUserRole(response.data.role);
                        router.push({ path: "/" }); // Redirect to Dashboard
                    }
                })
                .catch((err) => {
                    if (err.response) {
                        error.value = err.response.data.error;
                    } else {
                        console.error(err);
                    }
                });
        };

        return {
            email,
            password,
            onSubmit,
            error,
        };
    },
};
</script>

<style></style>
