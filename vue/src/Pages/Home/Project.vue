<template>
	<div class="project" v-if="project" :class="{ ...(classes || {}) }">
		<div class="project-image"
			:class="{ hasIcon: !!project.icon }"
			:style="{ backgroundImage: project.icon ? `url(icon://${ project.icon })`: 'none' }">
		</div>
		<div class="project-details">
			<p style="margin: 0;">
				<span class="projectName">
					{{ project.name }}
				</span>
				<span class="info-bubble tag" v-for="tag in project.tags">
					{{ tag }}
				</span>
				<span class="info-bubble plugin" v-if="project.nbPlugins" title="Enabled plugins" @click.stop.prevent="() => { $emit('showProjectAddons', project); }">
					<i class="fas fa-code-branch"></i> {{ project.nbPlugins }}
				</span>
				<span class="info-bubble terminal" title="Open in terminal" @click.stop.prevent="() => { $emit('openInTerminal', project); }">
					<i class="fas fa-terminal"></i>
				</span>
				<div class="sizes" v-if="project.size && project.size.folder > -1" :title="getSizes(project)">
					{{ size(project.size.folder) }}
				</div>
			</p>
			<p v-if="project.description" class="description-text">
				{{ project.description }}
			</p>
			<div class="folder isPath">
				<i class="fas fa-folder"></i> {{ project.path }}
			</div>
		</div>
		<div class="project-info">
			<div class="info-bubble">{{ project.version }}</div>
			<div class="btn info-bubble openAnyway" v-if="project.isUpgradable">Open with {{ selectedVersion.versionTag }}</div>
		</div>
	</div>
</template>

<script>
	import toHuman from "../../Utils/humanFileSize.js";
	export default {
		name: "Project",
		props: { classes: Object, project: Object, selectedVersion: Object },
		computed: {
		},
		methods: {
			getSizes(project) {
				const data = [];
				if (project.size.addons && project.size.addons > 0) {
					data.push("Addons: " + this.size(project.size.addons))
				}
				if (project.size.godot && project.size.godot > 0) {
					data.push(".godot: " + this.size(project.size.godot))
				}
				return data.join(" • ");
			},
			size(size) {
				return toHuman(size);
			},
		},
	}
</script>

<style scoped>
	.project {
		display: flex;
		cursor: pointer;
		text-align: left;
		user-select: none;
		align-items: center;
	}
	.project:hover {
		background-color: rgba(100,100,100,0.1);
	}
	.project.disabled { opacity: 0.5; cursor: default; }
	.hideProjects .project.disabled { display: none; }
	.project .project-image {
		display: inline-block;
		width: 54px;
		height: 54px;
		margin: 8px;
		border-radius: 10px;
/* 		background-color: var(--accent); */
		background-color: #f5f5f5;
		margin-left: 16px;
		margin-right: 16px;
		background-repeat: no-repeat;
		background-position: 50% 50%;
		background-size: cover;
		box-shadow: 0 1px 4px rgba(0,0,0,0.1);
	}
	.project .project-image.hasIcon {
		background-color: transparent;
	}
	.project .folder {
		margin: 0;
		display: inline-block;
		opacity: 0.25;
		cursor: pointer;
		transition: all 0.2s;
		font-size: 0.8em;
	}
	.project .folder:hover {
		opacity: 0.5;
	}
	.project .project-details {
		display: block;
		flex: 1;
	}
	.project .project-info {
		display: inline-block;
		padding: 0 12px;
		text-align: right;
	}
	.project .projectName {
		vertical-align: middle;
		font-weight: 600;
		font-size: 1.1em;
		color: var(--accent);
		margin-right: 12px;
	}
	.project.disabled .openAnyway:hover {
		background-color: #e43030;
		color: #FFF;
	}
	.project .description-text {
		margin: 0px;
		opacity: 0.7;
		text-overflow: ellipsis;
		display: -webkit-box;
		overflow: hidden;
		-webkit-line-clamp: 2;
		-webkit-box-orient: vertical;
	}
	.project .info-bubble.terminal {
		background: var(--accent-copy);
		display: none;
		color: #323232;
	}
	.shiftHeld .project .info-bubble.terminal {
		display: inline;
	}
	.project .sizes {
		display: inline;
		/*display: block;*/
		/*color: var(--accent);*/
		font-weight: bold;
		opacity: 0.7;
		margin-left: 7px;
		margin-top: 5px;
		vertical-align: middle;
	}
	.project .sizes .addons-size, .project .sizes .godot-size {
		margin-left: 4px;
	}
	.project .sizes .addons-size { color: darkorange; }
	.project .sizes .godot-size { opacity: 0.5; }
</style>