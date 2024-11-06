<template>
    <div>
        <router-link to="permitform"><button>Form</button></router-link>
        <router-link to="/"><button>Home</button></router-link>
        <h2>Job Permits</h2>

        <ul>
            <li v-for="permit in jobPermits" :key="permit.id">
                <h3>{{ permit.name }}</h3>
                <p>{{ permit.details }}</p>
                <p>
                    Start: {{ permit.job_start }} | Deadline:
                    {{ permit.job_deadline }}
                </p>
                <p>
                    Assigned Crew:
                    {{ permit.crews.map((c) => c.name).join(", ") }}
                </p>

                <button @click="editJobPermit(permit.id)">Edit</button>
            </li>
        </ul>
    </div>
</template>

<script>
import { ref, onMounted } from "vue";
import api from "../axios.js";
import { useRouter } from "vue-router"; // Import the router for navigation
import JobPermitForm from "./JobPermitForm.vue";

export default {
    components: {
        JobPermitForm,
    },
    setup() {
        const jobPermits = ref([]);
        const router = useRouter(); // Initialize router

        const loadJobPermits = async () => {
            try {
                const response = await api.get("/job-permits");
                jobPermits.value = response.data;
            } catch (error) {
                console.error("Error loading job permits:", error);
            }
        };

        onMounted(loadJobPermits);

        const editJobPermit = (id) => {
            console.log(id);
            router.push({ name: "JobPermitForm", query: { id } });
        };

        return { jobPermits, editJobPermit };
    },
};
</script>
