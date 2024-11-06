<template></template>

<script>
import { ref, provide, onMounted } from "vue";

export default {};

// Define your state and provide function
export const useStateContext = () => {
    const currentUser = ref({});
    const userToken = ref(null);
    const userRole = ref(null);

    onMounted(() => {
        const storedToken = localStorage.getItem("userToken");
        const storedRole = localStorage.getItem("userRole");
        if (storedToken) {
            userToken.value = storedToken; // Load token from localStorage if exists
        }
        if (storedRole) {
            userRole.value = storedRole; // Load userRole from localStorage if exists
        }
    });

    const setCurrentUser = (user) => {
        currentUser.value = user;
    };

    // Update both the state and localStorage when setting the user token
    const setUserToken = (token) => {
        userToken.value = token;
        if (token) {
            localStorage.setItem("userToken", token); // Store token in localStorage
        } else {
            localStorage.removeItem("userToken"); // Clear token if set to null
            currentUser.value = {}; // Clear the current user when token is removed
        }
    };

    const setUserRole = (role) => {
        userRole.value = role;
        if (role) {
            localStorage.setItem("userRole", role); // Store userRole in localStorage
        } else {
            localStorage.removeItem("userRole"); // Clear userRole if set to null
        }
    };

    // Provide the state to child components
    provide("stateContext", {
        currentUser,
        setCurrentUser,
        userToken,
        setUserToken,
        setUserRole,
        userRole,
    });
};

// Use this in your root or parent component
export const ContextProvider = {
    setup(_, { slots }) {
        useStateContext();

        return () => slots.default();
    },
};
</script>

<style></style>
