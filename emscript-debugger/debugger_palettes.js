//

$(function(){
	let $tab = $('main > [name=palettes]');
	
	for (let i = 0; i < 32; i++) {
		let $parent = $tab.find(`#swatch${i<16?1:2}`);
		let $pt = $(`<swatch>`).attr('name',`${i}`);
		for (let j = 0; j < 16; j++) {
			$(`<span>`)
				.attr('name',`${i}.${j}.u`)
				.attr('color','#000000')
				.appendTo($pt);
		}
		for (let j = 0; j < 16; j++) {
			$(`<span>`)
				.attr('name',`${i}.${j}.f`)
				.attr('color','#000000')
				.appendTo($pt);
		}
		$pt.appendTo($parent);
	}
});

function update_palettes() {
	emulator.readSymbols(
		'gPlttBufferUnfaded', 'gPlttBufferFaded', 
	).then(palettes_fillInSymbols);
	
	
	let ptr = emulator._resolveSymbol('gSaveBlock1Ptr');
	emulator
		.queryEmulator(`/ReadByteRange/*${ptr.addr}+C70/${(300+(256*2)).toString(16)}`, 'data')
		.then(fillFromFlagBlock);
}

function palettes_fillInSymbols(dataList) {
	for (let data of dataList) {
		switch (data.name) {
			case 'gPlttBufferUnfaded':
				break;
			case 'gPlttBufferFaded':
				break;
		}
	}
}