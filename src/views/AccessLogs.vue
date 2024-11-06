<template>
    <div class="access-logs">
        <router-link to="/"><button>Home</button></router-link>
        <h2>Access Logs</h2>

        <!-- Filter controls -->
        <div class="filters">
            <label>
                Location:
                <select v-model="selectedLocation">
                    <option value="">All Locations</option>
                    <option
                        v-for="location in uniqueLocations"
                        :key="location"
                        :value="location"
                    >
                        {{ location }}
                    </option>
                </select>
            </label>

            <label>
                Crew Member:
                <select v-model="selectedCrewMember">
                    <option value="">All Crew Members</option>
                    <option
                        v-for="member in uniqueCrewMembers"
                        :key="member"
                        :value="member"
                    >
                        {{ member }}
                    </option>
                </select>
            </label>

            <label>
                <input type="checkbox" v-model="showSuspiciousOnly" />
                Show Suspicious Activity Only
            </label>
        </div>

        <!-- Display loading state -->
        <div v-if="loading">Loading access logs...</div>

        <!-- Display error state -->
        <div v-if="error">{{ error }}</div>

        <!-- Display access logs -->
        <table v-if="!loading && !error">
            <thead>
                <tr>
                    <th>User Name</th>
                    <th>Location</th>
                    <th>Check-in Time</th>
                    <th>Check-out Time</th>
                    <th>Status</th>
                </tr>
            </thead>
            <tbody>
                <tr v-for="log in filteredLogs" :key="log.id">
                    <td>{{ log.user.name }}</td>
                    <td>{{ log.location.name }}</td>
                    <td>{{ new Date(log.checkin).toLocaleString() }}</td>
                    <td>
                        <p v-if="log.checkout">
                            {{ new Date(log.checkout).toLocaleString() }}
                        </p>
                        <p v-else>Not checked out</p>
                    </td>
                    <td>
                        <span v-if="isSuspicious(log)">
                            Suspicious Activity
                        </span>
                    </td>
                </tr>
            </tbody>
        </table>
    </div>
</template>

<script>
import { ref, computed, onMounted } from "vue";
import apiClient from "../axios.js";

export default {
    setup() {
        const accessLogs = ref([]);
        const loading = ref(false);
        const error = ref(null);

        const selectedLocation = ref("");
        const selectedCrewMember = ref("");
        const showSuspiciousOnly = ref(false);

        const fetchAccessLogs = async () => {
            loading.value = true;
            error.value = null;

            try {
                const response = await apiClient.get("/access-logs");
                accessLogs.value = response.data;
            } catch (err) {
                error.value = "Failed to load access logs";
            } finally {
                loading.value = false;
            }
        };

        const isSuspicious = (log) => {
            const sixHours = 6 * 60 * 60 * 1000;
            const checkinTime = new Date(log.checkin).getTime();
            const currentTime = new Date().getTime();
            return !log.checkout && currentTime - checkinTime > sixHours;
        };

        const uniqueLocations = computed(() => {
            return [
                ...new Set(accessLogs.value.map((log) => log.location.name)),
            ];
        });

        const uniqueCrewMembers = computed(() => {
            return [...new Set(accessLogs.value.map((log) => log.user.name))];
        });

        const filteredLogs = computed(() => {
            return accessLogs.value.filter((log) => {
                const matchesLocation = selectedLocation.value
                    ? log.location.name === selectedLocation.value
                    : true;
                const matchesCrewMember = selectedCrewMember.value
                    ? log.user.name === selectedCrewMember.value
                    : true;
                const matchesSuspicious = showSuspiciousOnly.value
                    ? isSuspicious(log)
                    : true;
                return (
                    matchesLocation && matchesCrewMember && matchesSuspicious
                );
            });
        });

        onMounted(fetchAccessLogs);

        return {
            accessLogs,
            loading,
            error,
            selectedLocation,
            selectedCrewMember,
            showSuspiciousOnly,
            uniqueLocations,
            uniqueCrewMembers,
            filteredLogs,
            isSuspicious,
        };
    },
};
</script>

<style scoped>
.access-logs {
    max-width: 800px;
    margin: 0 auto;
    padding: 20px;
}

table {
    width: 100%;
    border-collapse: collapse;
}

th,
td {
    padding: 10px;
    border: 1px solid #ddd;
    text-align: left;
}

th {
    background-color: #f4f4f4;
}

td span {
    color: red;
    font-weight: bold;
}

.filters {
    margin-bottom: 15px;
}

.filters label {
    margin-right: 10px;
}
</style>
