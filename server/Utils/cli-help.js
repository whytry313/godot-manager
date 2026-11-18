module.exports = () => {
    console.log(`
Usage: godot-manager [file.project]

Options:
    -h, --help       Displays this help
    --native-window  Uses the system's window decorator

Tip:
    Set this program as defaul "Open with..." for .project files,
    the program will run the project with its matching program version.
    `.trim());
    process.exit();
}
