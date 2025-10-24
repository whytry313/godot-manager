const preset = {};
preset.project = {};
preset.project.header = `; Engine configuration file.
; It's best edited using the editor UI and not directly,
; since the parameters that go here are not all obvious.
;
; Format:
;   [section] ; section goes between []
;   param=value ; assign values to parameters

[application]
config/name="%APP_NAME"`;
preset.project.modes  = [ "Forward Plus", "Compatibility", "Mobile" ];

module.exports = preset;