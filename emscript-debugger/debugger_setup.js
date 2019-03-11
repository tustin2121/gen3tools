//

$(function(){
	let $tab = $('main > [name=setup]');
	
	$tab.find('.file').on('dblclick', function(){
		let chooser = $('#fileChooser');
		chooser.unbind('change').val('').on('change', ()=>{
			let file = chooser.val();
			$(this).val(file);
			if ($(this).attr('name') === 'fileSym' || $(this).attr('name') === 'filePge') {
				if (!$tab.find('input[name=fileAutofind]').is(':checked')) return;
				fillFilePaths(file);
			}
		});
		chooser.trigger('click');
	});
	$tab.find('button[name=loadFiles]').on('click', function(){
		const fs = require('fs');
		
		let symfile = $tab.find('input[name=fileSym]').val();
		if (!symfile || !fs.accessSync(symfile)) {
			symfile = $tab.find('input[name=filePge]').val();
		}
		if (!symfile || !fs.accessSync(symfile)) { 
			alert("Must have a valid sym or pge.ini file specified.");
			return; 
		}
		let all = [];
		all.push(emulator.loadRomSymbolFile(symfile));
		{
			let file = $tab.find('input[name=fileFlags]').val();
			if (file) all.push(emulator.loadRomVarNameFile(file));
		}{
			let file = $tab.find('input[name=fileVars]').val();
			if (file) all.push(emulator.loadRomVarNameFile(file));
		}
		Promise.all(all).then(()=>alert('Symbols loaded.'));
	});
});


function fillFilePaths(file0) {
	if (typeof file0 !== 'string' || !file0) return;
	const PATH = require('path');
	
	$('input[name=fileFlags]').val(PATH.join(PATH.dirname(file0), 'include/constants/flags.h'));
	$('input[name=fileVars]').val(PATH.join(PATH.dirname(file0), 'include/constants/vars.h'));
}