<template>
    <div>
        <p>User Token: {{ userToken }}</p>
        <button @click="logout">Logout</button>
        <router-link to="login"><button>Login</button></router-link>
        <router-link to="signup"><button>Signup</button></router-link>
        <router-link to="verify-ppe"><button>Verify</button></router-link>
        <router-link to="permits"><button>Permits</button></router-link>
        <div>
            <button @click="activateMotor(1)">Activate Motor 1</button>
            <button @click="activateMotor(2)">Activate Motor 2</button>
            <p v-if="message">{{ message }}</p>
        </div>
    </div>
</template>

<script>
import { inject, ref, watchEffect } from "vue";
import axiosClient from "../axios";
import { useRouter } from "vue-router";

export default {
    setup() {
        const router = useRouter();

        const stateContext = inject("stateContext");
        if (!stateContext) {
            throw new Error("StateContext is not provided");
        }

        const {
            userToken,
            setUserToken,
            currentUser,
            setCurrentUser,
            setUserRole,
        } = stateContext;

        const message = ref("");

        const logout = () => {
            axiosClient.post("/logout").then((res) => {
                setCurrentUser({});
                setUserToken(null);
                setUserRole(null);
            });
        };

        watchEffect(() => {
            if (!userToken.value) {
                router.push({ name: "Login" });
            }
        });

        const activateMotor = (motorId) => {
            axiosClient
                .post("/trigger-motor", { motor_id: motorId })
                .then((response) => {
                    message.value = response.data.message;
                })
                .catch((error) => {
                    message.value = "Error activating motor";
                });
        };

        return {
            currentUser,
            userToken,
            logout,
            activateMotor,
            message,
        };
    },
};
</script>

<style></style>
