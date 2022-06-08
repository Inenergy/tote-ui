#!/bin/bash

# MAIN APP INSTALLATION
npm i
npm run build

# MAIN APP AUTOSTART
chmod +x dist/tote-ui*.AppImage
mkdir ~/.inenergy
echo '{ "CRITICAL_CONCENTRATION": 75 }' > ~/.inenergy/config.json
echo "~/inenergy-gui/tote-ui/dist/tote-ui*.AppImage > ~/.inenergy/tote-ui.log"