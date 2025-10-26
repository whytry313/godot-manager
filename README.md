# Godot manager
<img width="100%" alt="godot_manager_01" src="https://github.com/user-attachments/assets/3d44780b-859a-40c3-8ce2-9f2f5131e25b" />

A simple launcher made with NodeJS Electron/Vue to manage Godot versions and Godot Projects (**Linux only**)

<br/>

## How it works
The launcher scans all programs and projects folders (set via 4), detects versions and matches projects with the Godot version selected

<img width="100%" alt="godot_manager_02" src="https://github.com/user-attachments/assets/2fb86661-a5ae-48a5-850a-be8cea08fede" />

Features include:
- **Version matching (7)** to quick open projects
- **Last opened project sorting** to get active projects first in the list
- **Addons listing (10)** allows to have an overview of the project dependencies
- **Terminal launcher** to debug projects crashing at startup - holding shift the icon will appear next to addons
- **Assets scanner (1)** with filesize limiter in the settings to browse and search files
- **Quick access (11)** to any resource holding Shift
- **Quick project upgrade (8)** - eg: Version 4.4 to 4.5 (backup recommended)
- **Version tolerance** eg: a project created with version 4.5.1 can still be opened with version 4.5.0
- **"Get new" button** to pull from Github new versions and build templates
- **Dark Mode (6) and custom accent color** in the settings to match your system colors

<br/>

## Notes
- **/!\ Important** About programs: Programs folders should only contain godot programs as version detection is done via CLI with `./godot_executable.x64 --version`
- About this repo: The repo uses a specific branch for `release`, fixes will be pushed into `master` until there's a fair amount of fixes to bump versions and create a build.
  If you need the lastest fixes, clone this repo, run `npm i` in the folder and `npm run buil` to create your builds in your `/build` folder
- About **Linux only**: This little tool was made for fun and shared because "why not?", as I don't currently own a Windows/Mac builds are made for my system but there's interest i'll create a VM to try to port it to those platforms
