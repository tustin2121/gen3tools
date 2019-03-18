//

let gPlttBufferUnfaded, gPlttBufferFaded;
let $gPlttBufferUnfaded, $gPlttBufferFaded;

$(function(){
	let $tab = $('main > [name=palettes]');
	
	gPlttBufferUnfaded = new Uint16Array(0x200);
	gPlttBufferFaded = new Uint16Array(0x200);
	$gPlttBufferUnfaded = new Array(0x200);
	$gPlttBufferFaded = new Array(0x200);
	for (let i = 0; i < 32; i++) {
		let $parent = $tab.find(`#swatch${i<16?1:2}`);
		let $pt = $(`<swatch>`).attr('name',`${i}`);
		$pt.append('<span>U</span>');
		for (let j = 0; j < 16; j++) {
			$gPlttBufferUnfaded[i*16+j] = $(`<span>`)
				.attr('name',`${i}.${j}.u`)
				.appendTo($pt);
		}
		$pt.append('<span>F</span>');
		for (let j = 0; j < 16; j++) {
			$gPlttBufferFaded[i*16+j] = $(`<span>`)
				.attr('name',`${i}.${j}.f`)
				.appendTo($pt);
		}
		$pt.appendTo($parent);
	}
});

function convertToRGB(u16Val) {
	let r = ((((u16Val >>  0) & 0x1F) / 32) * 0xFF) & 0xFF;
	let g = ((((u16Val >>  5) & 0x1F) / 32) * 0xFF) & 0xFF;
	let b = ((((u16Val >> 10) & 0x1F) / 32) * 0xFF) & 0xFF;
	return `rgb(${r}, ${g}, ${b})`;
}

function update_palettes() {
	emulator.readSymbols(
		'gPlttBufferUnfaded', 'gPlttBufferFaded', 
	).then(palettes_fillInSymbols);
}

function palettes_fillInSymbols(dataList) {
	for (let data of dataList) {
		switch (data.name) {
			case 'gPlttBufferUnfaded':
				for (let i = 0; i < 0x200; i++) {
					let x = data.data.readUInt16LE(i*2);
					if (x !== gPlttBufferUnfaded[i]) {
						gPlttBufferUnfaded[i] = x;
						$gPlttBufferUnfaded[i].css('background-color', convertToRGB(x));
					}
				}
				break;
			case 'gPlttBufferFaded':
				for (let i = 0; i < 0x200; i++) {
					let x = data.data.readUInt16LE(i*2);
					if (x !== gPlttBufferFaded[i]) {
						gPlttBufferFaded[i] = x;
						$gPlttBufferFaded[i].css('background-color', convertToRGB(x));
					}
				}
				break;
		}
	}
}