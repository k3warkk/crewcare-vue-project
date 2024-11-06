<template>
    <ContextProvider>
        <router-view />
    </ContextProvider>
</template>

<script>
import { ContextProvider } from "../src/contexts/ContextProvider.vue";

export default {
    components: {
        ContextProvider,
    },
};
</script>

<style>
* {
    margin: 0;
    box-sizing: border-box;
    scroll-behavior: smooth;
}
</style>
