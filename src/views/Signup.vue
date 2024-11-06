<template>
    <div>
        <h1>signup</h1>
        <router-link to="login"><button>Login</button></router-link>
        <form action="#" method="POST" @submit.prevent="onSubmit">
            <div>
                <label for="fullName">Full Name:</label>
                <input
                    type="text"
                    name="fullName"
                    id="fullName"
                    required
                    placeholder="Full Name"
                    v-model="fullName"
                />
            </div>
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
            <div>
                <label for="password-confirmation">Confirm Password:</label>
                <input
                    type="password"
                    name="password_confirmation"
                    id="password-confirmation"
                    required
                    placeholder="Confirm Password"
                    v-model="passwordConfirmation"
                />
            </div>
            <div>
                <label for="role">Role:</label>
                <select id="role" v-model="role_id" required>
                    <option disabled value="">Please select one</option>
                    <option
                        v-for="role in roles"
                        :key="role.id"
                        :value="role.id"
                    >
                        {{ role.name }}
                    </option>
                </select>
            </div>
            <button>Sign Up</button>
        </form>
        <div v-for="(error, index) in error" :key="index">{{ error }}</div>
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

        const { setUserToken, setCurrentUser, setUserRole } = stateContext;

        const router = useRouter();

        const fullName = ref("");
        const email = ref("");
        const password = ref("");
        const passwordConfirmation = ref("");
        const role_id = ref("");
        const error = ref([]);
        const roles = ref([
            { id: 1, name: "Admin" },
            { id: 2, name: "Crew" },
        ]);

        const onSubmit = () => {
            error.value = [];

            axiosClient
                .post("/signup", {
                    name: fullName.value,
                    email: email.value,
                    password: password.value,
                    password_confirmation: passwordConfirmation.value,
                    role_id: role_id.value,
                })
                .then((response) => {
                    if (response.status === 200) {
                        setCurrentUser(response.data.user);
                        setUserToken(response.data.token);
                        const selectedRole = roles.value.find(
                            (role) => role.id === parseInt(role_id.value)
                        );
                        setUserRole(selectedRole.name); // Call setUserRole with the role name
                        router.push({ path: "/" }); // Redirect to Dashboard
                    }
                })
                .catch((err) => {
                    if (err.response) {
                        const finalErrors = Object.values(
                            err.response.data.errors
                        ).reduce((accum, next) => [...accum, ...next], []);
                        console.log(finalErrors);
                        error.value = finalErrors;
                    } else {
                        console.error(err);
                    }
                });
        };

        return {
            fullName,
            email,
            password,
            passwordConfirmation,
            error,
            onSubmit,
            role_id,
            roles,
        };
    },
};
</script>

<style></style>
