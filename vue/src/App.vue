<template>
	<div class="main" :class="{ disableTips: !!disableTips }">
		<div id="header">
			<div class="grab">
				<p style="opacity: 0.3; margin: 0; margin-left: 15px;" class="tip">
					<i class="fas fa-info-circle"></i> Hold shift to open folder, either for programs or projects
				</p>
			</div>
			<div id="buttons">
				<div class="button minimize" @click="() => { action('minimize'); }"></div>
				<div class="button maximize" @click="() => { action('maximize'); }"></div>
				<div class="button close" @click="() => { action('close'); }"></div>
			</div>
		</div>
		<div :class="{ shiftHeld: isShiftHeld }">
			<router-view v-slot="{ Component }">
				<transition name="fade">
					<component :is="Component"
						:projects="projects"
						:programs="programs"
						:nbAssets="nbAssets"
						:selectedProgram="selectedProgram" 
						@openModal="openModal"
						@updateVar="updateVar"
					/>
				</transition>
			</router-view>
		</div>
		<transition name="fadetop">
			<FoldersModal v-if="modal  === 'folders'"  @openModal="openModal"/>
		</transition>
		<transition name="fadetop">
			<SettingModal v-if="modal === 'settings'" @openModal="openModal"/>
		</transition>
		<transition name="fadetop">
			<NewProjectModal v-if="modal === 'newproject'" @openModal="openModal" :selectedProgram="selectedProgram"/>
		</transition>
	</div>
</template>

<script>
	import LocalStorage from "./LocalStorage.js";
	import FoldersModal from "./Modals/Folders.vue";
	import SettingModal from "./Modals/Settings.vue";
	import NewProjectModal from "./Modals/NewProject.vue";

	export default {
		name: "App",
		data() {
			return {
				accentColor: LocalStorage.get("accent") || "#bbd141",
				disableTips: !!LocalStorage.get("disableTips"),
				accentColorTransparent: (LocalStorage.get("accent") || "#bbd141") + "42",
				modal: null,
				maxHeight: "80px",
				projects: [],
				programs: [],
				nbAssets: 0,
				selectedProgram: null,
				isShiftHeld: false,
			};
		},
		components: { FoldersModal, SettingModal, NewProjectModal },
		methods: {
			action(act) { window._API_.emit(act); },
			openModal(modalName) { this.modal = modalName; },
			updateVar(prop, value) { this[ prop ] = value; },
			updateMaxModalHeight() { this.maxHeight = (document.querySelector("BODY").offsetHeight - 120) + "px"; },
			async getProjects() { const allprojects = await window._API_.get("/projects"); this.projects = allprojects.projects; this.nbAssets = allprojects.nbAssets; console.log(this.projects); },
			async getPrograms() { this.programs = await window._API_.get("/programs"); },
			setDarkMode(toggle) { document.querySelector("BODY").classList[ toggle ? "add" : "remove" ]("dark"); },
			hideProjects(toggle) { document.querySelector("BODY").classList[ toggle ? "add" : "remove" ]("hideProjects"); },
			shiftHeld(evt) { this.isShiftHeld = evt.shiftKey; },
			unshiftHeld(evt) { this.isShiftHeld = false; },
			setAccent(col) { this.accentColor = col; this.accentColorTransparent = col + '42'; },
			toggleTips(toggle) { this.disableTips = toggle; }
		},
		async mounted() {
			this.updateMaxModalHeight();
			window.addEventListener("resize", this.updateMaxModalHeight);
			await this.getProjects();
			await this.getPrograms();
			window._API_.on("updateProjects", async () => { await this.getProjects(); });
			window._API_.on("updatePrograms", async () => { await this.getPrograms(); });

			if (LocalStorage.has("darkMode")) {
				this.setDarkMode(!!LocalStorage.get("darkMode"));
			} else if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
				this.setDarkMode(true); // Get theme from system's settings
			}

			LocalStorage.listen("darkMode", this.setDarkMode);
			LocalStorage.listen("accent", this.setAccent);
			LocalStorage.listen("disableTips", this.toggleTips);
			this.hideProjects(!!LocalStorage.get("hideProjects"));
			LocalStorage.listen("hideProjects", this.hideProjects);
			document.querySelector("BODY").addEventListener("keydown", this.shiftHeld);
			document.querySelector("BODY").addEventListener("keyup", this.unshiftHeld);
			window.addEventListener("blur", this.unshiftHeld);
		},
		unmounted() {
			document.querySelector("BODY").removeEventListener("keydown", this.shiftHeld);
			document.querySelector("BODY").removeEventListener("keyup", this.unshiftHeld);
			LocalStorage.unlisten("darkMode", this.setDarkMode);
			LocalStorage.unlisten("accent", this.setAccent);
			LocalStorage.unlisten("disableTips", this.toggleTips);
			LocalStorage.unlisten("hideProjects", this.hideProjects);
		}
	}
</script>

<style>
	@font-face {
	  font-family: 'Work Sans';
	  src: url('/webfonts/WorkSans-VariableFont_wght.ttf') format('truetype');
	}
	:root {
		--header-height: 30px;
		--accent: #bbd141;
		--accent-copy: #bbd141;
		--accent-dark: #4a6900;
		--background: #FFF;
		--backgroundEnd: #f2f2f2;
		--backgroundTransparent: rgba(245,245,245,0.85);
		--textColor: #323232;
		--menu-width: 260px;
		--borderRadius: 5px;
		/*--border-color: rgba(85,85,85,0.12);*/
		--border-color: transparent;
	}
	html, body {
		min-height: 100%;
		margin: 0;
		padding: 0;
		height: 100%;
		font-family: "Work Sans", Open-Sans, Arial, sans-serif;
	}
	h1, h2, h3, h4, h5, h6 { margin: 12px 0; color: var(--accent); }
	hr { border-color: var(--border-color); border-bottom: none; margin: 0; }
	body { font-size: 12px; color: var(--textColor); }
	body.dark {
		--background: #212121;
		--backgroundEnd: #181818;
		--backgroundTransparent: rgba(32,32,32,0.85);
		--textColor: #FFF;
		/*--border-color: rgba(155,155,155,0.12);*/
	}
	.shiftHeld { --textColor: #87878887; --accent: var(--textColor); color: var(--textColor); opacity: 1; }
	.dark .shiftHeld { --textColor: #87878788; color: var(--textColor); }
	.isPath { transition: color 0.5s; }
	.shiftHeld .isPath { color: #212121; }
	.dark .shiftHeld .isPath { color: var(--accent-copy); opacity: 1 !important; }
	#app, .modal {
		position: fixed;
		left: 0; right: 0;
		top: 0; bottom: 0;
		overflow: hidden;
		border-radius: var(--borderRadius);
		background-color: var(--background);
	}
	#app {
		background: linear-gradient(var(--background) 0%, var(--backgroundEnd) 100%);
	}
	.main {
		--accent: v-bind(accentColor);
		--accent-copy: v-bind(accentColor);
		--accent-transparent: v-bind(accentColorTransparent);
	}


	/************************** Blocks **************************/
	.splitter {
		display: flex;
		gap: 7px;
		justify-content: space-between;
	}
	.splitter .btn { align-self: center; }

	.pad-block {
		display: block;
		padding: 12px 16px;
	}
	.info {
		opacity: 0.5;
		font-size: 12px;
	}
	.floatBlock {
		position: sticky;
		top: 0;
		background: var(--background);
		z-index: 2;
		border-bottom: 1px solid var(--border-color);
	}
	.floatBlock.nobg {
		background: transparent !important;
	}
	.input {
		display: flex;
		gap: 7px;
		padding: 4px;
		border-radius: 3px;
		border: 1px solid var(--accent-dark);
		background-color: var(--border-color);
	}
	.input input {
		width: 100%;
		display: inline-block;
		border: none;
		align-self: center;
		color: var(--textColor);
		background-color: transparent;
		outline: none;
	}
	.input .fas { align-self: center; }
	.input input:disabled { pointer-events: none; opacity: 0.5; }
	.input .container {
		display: block;
		width: auto;
		padding: 0 7px;
	}
	.input:focus-within { outline: 1px solid var(--accent); }
	.input .icon { float: left; margin: 3px 0px 3px 6px; }
	.input .icon + .container { margin-left: 16px; }
	.input.click { cursor: pointer; }


	/************************** Scrollbar **************************/
	/* width */
	::-webkit-scrollbar { width: 4px; }
	/* Track */
	::-webkit-scrollbar-track { background: transparent; }
	/* Handle */
	::-webkit-scrollbar-thumb { background: var(--accent); border-radius: 2px; }
	/* Handle on hover */
	::-webkit-scrollbar-thumb:hover { background: var(--accent); }



	/************************** Fade **************************/
	.fade-leave-active, .fade-enter-from {
		position: absolute; top: 0; right: 0px; left: 0px;
	}
	.fade-enter-active, .fade-leave-active {
		opacity: 1;
		z-index: 2;
		transition: opacity 0.3s ease;
	}
	.fade-enter-from, .fade-leave-to {
		opacity: 0;
		z-index: 1;
	}



	.fadetop-leave-active, .fadetop-enter-from {
		position: absolute; top: 0; right: 0; left: 0;
	}
	.fadetop-enter-active, .fadetop-leave-active {
		opacity: 1;
		z-index: 2;
		transition: opacity 0.3s ease;
	}
	.fadetop-enter-from, .fadetop-leave-to {
		opacity: 0;
		z-index: 1;
	}
	.modal.fadetop-enter-active .content, .modal.fadetop-leave-active .content {
		transform: translate(-50%, -50%);
		transition: transform 0.3s cubic-bezier(0.68, -0.55, 0.265, 1.55);
	}
	.modal.fadetop-leave-active .content, .modal.fadetop-enter-from .content {
		transform: translate(-50%, -250%);
		transition: transform 0.3s ease-in;
	}
	.modal.fadetop-enter-from .content, .modal.fadetop-leave-to .content {
		transform: translate(-50%, -250%);
	}

	/************************** Header **************************/ 
	#header {
		position: fixed;
		top: 0; left: var(--menu-width); right: 0;
		z-index: 10;
		display: flex;
		height: var(--header-height);
		line-height: var(--header-height);
	}
	#header .fill {
		flex: unset;
		pointer-events: none;
		width: var(--menu-width);
	}
	#header .grab {
		flex: 1;
		-webkit-user-select: none;
		-webkit-app-region: drag;
		border-bottom: 1px solid var(--border-color);
	}
	#header #buttons {
		display: inline-block;
		margin-right: 6px;
		border-bottom: 1px solid var(--border-color);
	}
	#header #buttons .button {
		display: inline-block;
		width: 12px;
		height: 12px;
		margin: 8px 2px;
		border-radius: 50%;
		cursor: pointer;
		opacity: 0.7;
		background-color: #e4e4e4;
	}
	#header #buttons .button.close { background-color: red; }
	#header #buttons .button.minimize { background-color: yellow; }
	#header #buttons .button.maximize { background-color: yellowgreen; }


	/************************** Buttons **************************/

	a { text-decoration: inherit; }
	.btn {
		display: inline-block;
		padding:  9px 12px;
		font-size: 12px;
		background-color: var(--accent);
		color: #FFF;
		font-weight: bold;
		text-align: center;
		border-radius: 5px;
		cursor: pointer;
		user-select: none;
		transition: all 0.2s;
	}
	.btn .fas { margin-right: 5px; }
	.btn:active { opacity: 0.75; }
	.dark .btn { color: var(--background); }
	.btn.dark { background-color: var(--border-color); color: var(--accent); }
	.btn.disabled { background-color: var(--border-color); color: var(--accent); opacity: 0.5; pointer-events: none; }
	.btn.round { border-radius: 15px; padding-left: 15px; padding-right: 15px; }
	.btn.mini { padding-top: 6px; padding-bottom: 6px; }
	.btn.textmini { padding: 2px 5px; align-self: center; padding-left: 7px; }
	.btn.ghost { background-color: transparent; border: 1px solid var(--accent-transparent); color: var(--accent); }
	.btn.ghost:hover { background-color: var(--accent); border: 1px solid var(--accent); color: var(--background); }

	/************************** Modals **************************/
	.modal {
		z-index: 5;
		background-color: var(--backgroundTransparent);
	}

	.modal .content {
		position: absolute;
		left: 50%; top: 50%;
		overflow: auto;
		display: block;
		width: 90%;
		transform: translate(-50%, -50%);
		max-height: v-bind(maxHeight);
		background-color: var(--background);
		padding: 18px 24px;
		max-width: 90%;
		border-radius: 12px;
		box-shadow: 0 1px 7px -1px rgba(0,0,0,0.2);
	}
	.modal .content .closeModal {
		position: absolute;
		top: 15px; right: 15px;
		background-color: #323232;
		color: #FFF;
		display: inline-block;
		width:  24px; height:  24px; line-height: 24px;
		font-weight: bold;
		cursor: pointer;
		border-radius: 50%;
		text-align: center;
		transform: rotate(0deg) scale(1.0);
		transition: all 0.2s;
	}
	.modal .content .closeModal:after {
		content: "X";
	}
	.modal .content .closeModal:hover {
		background-color: #e43030;
		transform: rotate(180deg) scale(1.1);
	}


	#pagePanel {
		position: fixed;
		top: 0;
		bottom: 0;
		left: 0;
		right: 0;
		border-radius: var(--borderRadius);
		overflow: hidden;
	}

	#leftPannel, #rightPannel {
		position: absolute;
		overflow: auto;
		bottom: 0;
		top: 0;
	}
	#leftPannel {
		z-index: 4;
		left: 0; width: var(--menu-width);
		border-right: 1px solid var(--border-color);
	}
	#rightPannel {
		top: var(--header-height);
		left: var(--menu-width); right: 0;
	}



	.info-bubble {
		vertical-align: middle;
		display: inline-block;
		font-size: 11px;
		padding: 3px 8px;
		background-color: var(--accent);
		color: #FFF;
		font-weight: 600;
		margin-left: 3px;
		border-radius: 12px;
	}
	.info-bubble.tag {
		background-color: purple;
	}
	.info-bubble.plugin {
		background-color: darkorange;
	}
	.info-bubble.plugin:hover {
		background-color: orange;
		/*color: #FFF;*/
	}
	.dark .info-bubble {
		color: var(--background);
	}
	.disableTips .tip { display: none !important; }
</style>