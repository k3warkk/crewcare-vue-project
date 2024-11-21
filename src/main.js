import { createApp } from "vue";
import App from "./App.vue";
import router from "./router";
import { createI18n } from "vue-i18n";
import translations from "./locales.js";

const i18n = createI18n({
  locale: "en",
  fallbackLocale: "en",
  messages: translations,
});

createApp(App).use(router).use(i18n).mount("#app");
