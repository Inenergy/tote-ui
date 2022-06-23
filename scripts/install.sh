cd "$( dirname "$0" )/.."

# MAIN APP INSTALLATION
npm i
npm run build

# MAIN APP AUTOSTART
chmod +x dist/hydrogen-energy-ui*.AppImage
mkdir -p ~/inenergy-gui/dist
cp dist/hydrogen-energy-ui*.AppImage ~/inenergy-gui/dist/
mkdir ~/.inenergy
echo '~/inengergy-gui/dist/hydrogen-energy-ui*.AppImage > ~/.inenergy/hydrogen-energy-ui.log' > ~/.config/openbox/autostart
echo '{"CRITICAL_CONCENTRATION": 75}' > ~/.inenergy/config.json