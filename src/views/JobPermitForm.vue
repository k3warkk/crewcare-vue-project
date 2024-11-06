<template>
    <div>
        <router-link to="/permitlist"><button>List</button></router-link>
        <h2>{{ isEdit ? "Edit Job Permit" : "Create Job Permit" }}</h2>

        <form @submit.prevent="submitForm">
            <div>
                <label for="name">Job Name</label>
                <input type="text" v-model="form.name" required />
            </div>

            <div>
                <label for="details">Job Details</label>
                <textarea v-model="form.details"></textarea>
            </div>

            <div>
                <label for="job_start">Start Date</label>
                <input type="date" v-model="form.job_start" required />
            </div>

            <div>
                <label for="job_deadline">Deadline</label>
                <input type="date" v-model="form.job_deadline" required />
            </div>

            <div>
                <label for="location_id">Job Location</label>
                <select v-model="form.location_id" required>
                    <option value="" disabled>Select a location</option>
                    <option
                        v-for="location in locations"
                        :value="location.id"
                        :key="location.id"
                    >
                        {{ location.name }}
                    </option>
                </select>
            </div>

            <div>
                <label for="crew_ids">Assign Crew</label>
                <select v-model="form.crew_ids" multiple>
                    <option
                        v-for="crew in crewMembers"
                        :value="crew.id"
                        :key="crew.id"
                    >
                        {{ crew.name }}
                    </option>
                </select>
            </div>

            <button type="submit">{{ isEdit ? "Update" : "Create" }}</button>
        </form>
    </div>
</template>

<script>
import { ref, onMounted, inject } from "vue";
import axiosClient from "../axios.js";

export default {
    props: {
        jobPermitId: { type: Number, default: null },
    },
    setup(props) {
        const stateContext = inject("stateContext");
        if (!stateContext) {
            throw new Error("StateContext is not provided");
        }

        const { currentUser, setCurrentUser } = stateContext;

        const form = ref({
            name: "",
            details: "",
            job_start: "",
            job_deadline: "",
            location_id: "", // To hold the selected location ID
            crew_ids: [], // To hold selected crew member IDs
        });
        const crewMembers = ref([]); // To load available crew members
        const locations = ref([]); // To load available locations
        const isEdit = ref(false); // Check if it's an edit or create action

        // Function to load the current logged-in admin's data
        const loadCurrentUser = async () => {
            try {
                const response = await axiosClient.get("/user"); // Fetch current user
                setCurrentUser(response.data); // Update the state with the fetched user
            } catch (error) {
                console.error("Error fetching current user:", error);
            }
        };

        // Load crew members and job permit data if editing
        const loadFormData = async () => {
            // Fetch all crew members
            try {
                const response = await axiosClient.get("/crew-members");
                crewMembers.value = response.data;

                // Fetch all locations
                const locationResponse = await axiosClient.get("/locations");
                locations.value = locationResponse.data;

                // If editing, fetch the current job permit details
                if (props.jobPermitId) {
                    isEdit.value = true;
                    const { data } = await axiosClient.get(
                        `/job-permits/${props.jobPermitId}`
                    );
                    form.value = {
                        name: data.name,
                        details: data.details,
                        job_start: data.job_start,
                        job_deadline: data.job_deadline,
                        location_id: data.location_id, // Preselect location
                        crew_ids: data.crews.map((crew) => crew.id), // Map assigned crew members' IDs
                    };
                }
            } catch (error) {
                console.error("Error loading form data:", error);
            }
        };

        onMounted(async () => {
            console.log(props.jobPermitId);
            await loadCurrentUser(); // Load current admin's data
            await loadFormData(); // Load form data (crew members, locations, etc.)
        });

        // Submit form for either creating or updating job permit
        const submitForm = async () => {
            try {
                const url = isEdit.value
                    ? `/job-permits/${props.jobPermitId}`
                    : "/job-permits";
                const method = isEdit.value ? "put" : "post";

                await axiosClient[method](url, {
                    ...form.value,
                    crew_ids: form.value.crew_ids, // Send selected crew member IDs
                    admin_id: currentUser.value.id, // Pass the current admin's ID
                });

                alert(
                    `Job permit ${
                        isEdit.value ? "updated" : "created"
                    } successfully`
                );
            } catch (error) {
                console.error("Error submitting form:", error);
            }
        };

        return {
            form,
            crewMembers,
            locations,
            isEdit,
            submitForm,
            currentUser,
        };
    },
};
</script>
