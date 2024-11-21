<template>
  <div>
    <p>User Token: {{ userToken }}</p>
    <p>Current User: {{ currentUser }}</p>
    <button @click="logout">Logout</button>
    <router-link to="verify-ppe"><button>Verify</button></router-link>
    <router-link to="permits"><button>Permits</button></router-link>
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

    return {
      currentUser,
      userToken,
      logout,
    };
  },
};
</script>

<style></style>
