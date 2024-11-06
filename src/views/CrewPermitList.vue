<template>
    <div>
        <router-link to="/"><button>Home</button></router-link>
        <h2>Your Job Permits</h2>

        <!-- History Section -->
        <h3>History (Completed Permits)</h3>
        <ul v-if="historyPermits.length">
            <li v-for="permit in historyPermits" :key="permit.id">
                <strong>{{ permit.job_permit.name }}</strong>
                <p>{{ permit.job_permit.details }}</p>
                <p>Completed on: {{ permit.job_permit.job_finished }}</p>
            </li>
        </ul>
        <p v-else>No completed permits yet.</p>

        <!-- Working Section -->
        <h3>Working (Verified but Not Completed)</h3>
        <ul v-if="workingPermits.length">
            <li v-for="permit in workingPermits" :key="permit.id">
                <strong>{{ permit.job_permit.name }}</strong>
                <p>{{ permit.job_permit.details }}</p>
                <p>Verified by you on: {{ permit.verification_date }}</p>
                <button
                    @click="completePermit(permit.permit_id, permit.crew_id)"
                >
                    Mark as Completed
                </button>
            </li>
        </ul>
        <p v-else>No permits in progress.</p>

        <!-- Pending Section -->
        <h3>Pending (Not Verified)</h3>
        <ul v-if="pendingPermits.length">
            <li v-for="permit in pendingPermits" :key="permit.id">
                <strong>{{ permit.job_permit.name }}</strong>
                <p>{{ permit.job_permit.details }}</p>
                <p>Deadline: {{ permit.job_permit.job_deadline }}</p>
                <router-link
                    :to="{
                        name: 'PpeScan',
                        query: {
                            permit_id: permit.permit_id,
                            crew_id: permit.crew_id,
                        },
                    }"
                >
                    <button>Verify</button>
                </router-link>
            </li>
        </ul>
        <p v-else>No pending permits.</p>
    </div>
</template>

<script>
import { ref, onMounted } from "vue";
import axiosClient from "../axios.js";

export default {
    setup() {
        // Define reactive properties for the permit categories
        const historyPermits = ref([]);
        const workingPermits = ref([]);
        const pendingPermits = ref([]);

        // Function to load the permits for the crew member
        const loadPermits = async () => {
            try {
                const response = await axiosClient.get("/crew-permits");
                const permits = response.data;

                historyPermits.value = permits.completed || [];
                workingPermits.value = permits.working || [];
                pendingPermits.value = permits.pending || [];
            } catch (error) {
                console.error("Error loading job permits:", error);
            }
        };

        // Function to mark a permit as completed
        const completePermit = async (permitId, crewId) => {
            try {
                await axiosClient.put(
                    `/job-permits/${permitId}/crew/${crewId}/complete`
                );
                loadPermits();
            } catch (error) {
                console.error("Error completing job permit:", error);
            }
        };

        // Load permits on component mount
        onMounted(loadPermits);

        return {
            historyPermits,
            workingPermits,
            pendingPermits,
            completePermit,
        };
    },
};
</script>
