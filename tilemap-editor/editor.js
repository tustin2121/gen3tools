
const { app, Menu } = require("electron");

{
	let template = [];
	const isMac = process.platform === 'darwin';
	if (isMac) {
		template.push({ role: 'appMenu' });
	}
	template.push({
		label: 'File',
		submenu: [
			{ label: 'New', click: null }, //TODO
			{ label: 'Open', click: null }, //TODO
			{ label: 'Save', click: null }, //TODO
			{ type: 'separator' },
			{ label: 'Resize', click: null }, //TODO
		],
	});
	template.push({
		label: 'Edit',
		submenu: [
			{ role: 'undo' },
			{ role: 'redo' },
			// { type: 'separator' },
			// { role: 'cut' },
			// { role: 'copy' },
			// { role: 'paste' },
			// { type: 'separator' },
			
		],
	});
	template.push({ role:'viewMenu' });
	
	let menu = Menu.buildFromTemplate(template);
	Menu.setApplicationMenu(menu);
}

$(function(){
	// createMenubar();
	
	let $pal = $('main > #palette')
	for (let i = 0; i < 16; i++) {
		let $pt = $(`<swatch>`).attr('name', `${i.toString().toUpperCase()}`);
		for (let j = 0; j < 16; j++) {
			$pt.append(`<span>${j.toString(16).toUpperCase()}</span>`);
		}
	}
	
	
});

