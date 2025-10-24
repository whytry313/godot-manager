<template>
	<div id="leftPannel">
		<div class="floatBlock nobg">
			<div class="pad-block" style="position: sticky; top: 0; background-color: var(--background); z-index: 2;">
				<div style="display: flex; gap: 7px">
					<router-link class="btn round textmini" to="/" style="align-self: center;">
						<i class="fas fa-arrow-left"></i>
					</router-link>
					<h4 style="margin: 4px; align-self: center;"><i class="fas fa-microchip"></i> Assets manager</h4>
				</div>
			</div>
			<div class="list">
				<div class="program" v-if="projects" v-for="project in projects"
					@click="(e) => { selectedID = project.id; }"
					style="overflow: hidden; text-overflow: ellipsis;"
				:class="{ active: selectedID && (selectedID === project.id) }">
					<span><i class="fas fa-file"></i> {{ project.nbAssets }} &bull; {{ project.name }}</span>
					<br>
					<span style="white-space: nowrap; opacity: 0.5;" class="isPath"><i class="fas fa-folder"></i> {{ project.path }}</span>
				</div>
			</div>
		</div>
	</div>
</template>

<script>
	export default {
		name: "LeftPanel",
		props: { projects: Array },
		data() { return { selectedID: null }; },
		watch: {
			selectedID() { this.$emit("updateID", this.selectedID); }
		}
	}
</script>