<template>
    <div>
        <h1>RFID Login</h1>
        <router-link to="login">
            <button>Back to Login</button>
        </router-link>
        <p v-if="error">{{ error }}</p>
        <div>
            <button @click="startPolling" :disabled="polling">
                {{ polling ? "Polling..." : "Start Polling" }}
            </button>
        </div>
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
        const error = ref("");
        const polling = ref(false);
        const kioskId = 1; // Set this to the current kiosk ID where the scan is happening
        let pollingInterval = null;

        const startPolling = () => {
            polling.value = true;
            error.value = "";

            const startTime = new Date(); // Store the start time

            pollingInterval = setInterval(() => {
                checkRFID(startTime);
            }, 1000); // Check every 1 seconds

            // Stop polling after 1 minute (60000 ms)
            setTimeout(() => {
                stopPolling();
            }, 60000);
        };

        const stopPolling = () => {
            polling.value = false; // Set polling to false
            clearInterval(pollingInterval); // Clear the interval
        };

        const checkRFID = (startTime) => {
            const startTimeCarbon = startTime.toISOString();

            axiosClient
                .get(`/check-rfid/${kioskId}`)
                .then((response) => {
                    if (response.status === 200) {
                        const { rfid_tag } = response.data;
                        if (response.data.created_at >= startTimeCarbon) {
                            loginWithRFID(rfid_tag);
                        }
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

        const loginWithRFID = (rfidTag) => {
            axiosClient
                .post("/login-rfid", {
                    rfid_tag: rfidTag,
                    kiosk_id: kioskId, // Send the kiosk ID along with the RFID tag for validation
                })
                .then((response) => {
                    if (response.status === 200) {
                        // Process response as needed
                        setCurrentUser(response.data.user);
                        setUserToken(response.data.token);
                        setUserRole(response.data.role);
                        stopPolling(); // Stop polling after request
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
            error,
            polling,
            startPolling,
        };
    },
};
</script>

<style>
/* Add your styles here */
</style>
