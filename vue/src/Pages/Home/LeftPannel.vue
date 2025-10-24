<template>
	<div id="leftPannel">
		<div class="floatBlock">
			<div class="pad-block">
				<h4 style="margin-top: 4px; display: flex; justify-content: space-between;">
					<span style="align-self: center;"><i class="fas fa-microchip"></i> Programs</span>
					<router-link style="align-self: center;" to="/download" class="btn round mini ghost"> <i class="fas fa-download"></i> Get new</router-link></h4>
			</div>
		</div>
		<div class="pad-block" v-if="!programs || !programs.length">
			<p class="info">
				<i>No programs found... Make sure you added a folder to you programs location via the
				<i class="fas fa-folder"></i> folder icon on the right</i></p>
		</div>
		<div class="list">
			<div class="program" v-for="program in sortedPrograms"
				@click="(e) => { selectVersion(e, program); }"
				style="overflow: hidden; text-overflow: ellipsis;"
			:class="{ active: selectedVersion && (selectedVersion.path === program.path) }">
				<span>Version: <b>{{ program.tag }}</b></span>
				<br>
				<span style="white-space: nowrap; opacity: 0.5;" class="isPath"><i class="fas fa-folder"></i> {{ program.execName }}</span>
			</div>
		</div>
	</div>
</template>

<script>
	export default {
		name: "LeftPannel",
		props: { programs: Array, selectedVersion: Object },
		watch: {
			$props: {
				handler() { this.sortProgram(); },
				deep: true,
			}
		},
		mounted() {
			this.sortProgram();
		},
		data() { return { sortedPrograms: [] }; },
		methods: {
			sortProgram() {
				this.sortedPrograms = this.programs.sort((a,b) => a.tag > b.tag ? -1 : 0);
			},
			selectVersion(e, program) {
				if (e.shiftKey) { return this.onProgramFolder(program); }
				this.$emit("changeVersion", program ? { ...program } : null);
			},
			async onProgramFolder(program) {
				window._API_.post("/openFolder", { filepath: program.path });
			}
		}
	}
</script>

<style>
	.program {
		opacity: 0.5;
		display: block;
		padding: 15px 19px;
		cursor: pointer;
		user-select: none;
		border-bottom: 1px solid var(--border-color);
	}
	.program:hover {
		opacity: 0.75;
		background-color: var(--background);
		color: var(--accent);
	}
	.program.active {
		opacity: 1;
		font-weight: bold;
		color: var(--accent);
	}
</style>