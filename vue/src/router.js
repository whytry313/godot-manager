import Home     from "./Pages/Home.vue";
import Download from "./Pages/Download.vue";
import Assets    from "./Pages/Assets.vue";
import { createWebHashHistory, createRouter } from "vue-router";

const routes = [
	{ path: "/", component: Home },
	{ path: "/download", component: Download },
	{ path: "/assets",   component: Assets },
];


const router = createRouter({
	history: createWebHashHistory(),
	routes: routes,
});

export default router;