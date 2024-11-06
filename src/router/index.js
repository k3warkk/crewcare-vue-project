import { createRouter, createWebHistory } from "vue-router";
import AdminHome from "../views/AdminHome.vue";
import CrewHome from "../views/CrewHome.vue";
import Login from "../views/Login.vue";
import Signup from "../views/Signup.vue";
import JobPermitForm from "../views/JobPermitForm.vue";
import JobPermitList from "../views/JobPermitList.vue";
import AdminLayout from "../layouts/AdminLayout.vue";
import CrewLayout from "../layouts/CrewLayout.vue";
import PpeScan from "../views/PpeScan.vue";
import CrewPermitList from "../views/CrewPermitList.vue";
import AccessLogs from "../views/AccessLogs.vue";
import LoginRFID from "../views/LoginRFID.vue";

const routes = [
    {
        path: "/login",
        name: "Login",
        component: Login,
    },
    {
        path: "/login-rfid",
        name: "LoginRFID",
        component: LoginRFID,
    },
    {
        path: "/signup",
        name: "Signup",
        component: Signup,
    },
    {
        path: "/",
        name: "AdminLayout",
        component: AdminLayout, // Parent layout for Admin routes
        children: [
            {
                path: "",
                name: "AdminHome",
                component: AdminHome,
            },
            {
                path: "/permitform/:id?",
                name: "JobPermitForm",
                component: JobPermitForm,
                props: true, // Pass the `id` as a prop
            },
            {
                path: "/permitlist",
                name: "JobPermitList",
                component: JobPermitList,
            },
            {
                path: "/access-logs",
                name: "AccessLogs",
                component: AccessLogs,
            },
        ],
        meta: { requiresAuth: true, role: "Admin" },
    },
    {
        path: "/",
        name: "CrewLayout",
        component: CrewLayout, // Parent layout for Crew routes
        children: [
            {
                path: "",
                name: "CrewHome",
                component: CrewHome,
            },
            {
                path: "/verify-ppe",
                name: "PpeScan",
                component: PpeScan,
            },
            {
                path: "/permits",
                name: "CrewPermitList",
                component: CrewPermitList,
            },
        ],
        meta: { requiresAuth: true, role: "Crew" },
    },
];

const router = createRouter({
    history: createWebHistory(),
    routes,
});

router.beforeEach((to, from, next) => {
    const userToken = localStorage.getItem("userToken"); // Get token from localStorage
    const userRole = localStorage.getItem("userRole"); // Get user role from localStorage

    if (to.meta.requiresAuth && !userToken) {
        if (to.name === "Login" || to.name === "Signup") {
            next(); // Allow access to login or signup pages if not logged in
        } else {
            next({ name: "Login" }); // Redirect to login if no token and trying to access a protected route
        }
    } else if (userToken && (to.name === "Login" || to.name === "Signup")) {
        // Prevent access to login/signup pages if user is already logged in
        next({ path: "/" }); // Redirect to a protected route like dashboard
    } else if (to.meta.role && userRole !== null && userRole !== to.meta.role) {
        // Check if user role matches the required role for the route
        if (userRole === "Admin") {
            next({ name: "AdminHome" }); // Redirect to AdminHome if user is Admin
        } else if (userRole === "Crew") {
            next({ name: "CrewHome" }); // Redirect to CrewHome if user is Crew
        } else {
            next({ name: "Login" }); // Redirect to login if user role does not match
        }
    } else {
        next(); // Allow normal navigation
    }
});

export default router;
