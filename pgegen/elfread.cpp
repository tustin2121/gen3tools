//

#include "global.hpp"
#include "elfread.hpp"
#include "elf.h"

using namespace std;

bool findSymbols()
{
	ifstream eFile;
	eFile.open(*symFilename, ios::in | ios::binary);
	if (!eFile.is_open())
	{
		cerr << "Error opening elf file!" << endl;
		return false;
	}
	
	constexpr int WORKING_NUM = 32; //number of symbols to work on in chunks
	Elf32_Ehdr elfHeader;
	Elf32_Shdr *sectionTable;
	const char *stringTable; 
	eFile.read(reinterpret_cast<char*>(&elfHeader), sizeof(Elf32_Ehdr));
	
	// Check magic number
	if (strncmp(reinterpret_cast<const char*>(elfHeader.e_ident), ELF_MAGIC, 4) != 0) 
	{
		cerr << "Symbol file is not an ELF file!" << endl;
		goto error;
	}
	if (elfHeader.e_ident[EI_CLASS] != 1 || elfHeader.e_ident[EI_DATA] != ELFDATA2LSB || elfHeader.e_version != EV_CURRENT)
	{
		cerr << "Symbol file is of an unsupported type!" << endl;
		goto error;
	}
	if (elfHeader.e_shnum == 0 || elfHeader.e_shoff == 0)
	{
		cerr << "Symbol file has no section table!" << endl;
		goto error;
	}
	if (elfHeader.e_shstrndx == 0)
	{
		cerr << "Symbol file has no section string table!" << endl;
		goto error;
	}
	if (elfHeader.e_shentsize != sizeof(Elf32_Shdr))
	{
		cerr << "Assertion failed: section table entry size mismatch!" << endl;
		goto error;
	}
	
	// Head to the section table now and read the section table into memory
	sectionTable = new Elf32_Shdr[elfHeader.e_shnum]; //owner
	Elf32_Shdr *shstrtab, *strtab, *symtab; //references
	
	eFile.seekg(elfHeader.e_shoff);
	eFile.read(reinterpret_cast<char*>(sectionTable), elfHeader.e_shnum * elfHeader.e_shentsize);
	shstrtab = &sectionTable[elfHeader.e_shstrndx];
	
	// Look up names for each section now to see if its the section we want
	for (int i = 0; i < elfHeader.e_shnum; i++)
	{
		if (sectionTable[i].sh_type == SHT_SYMTAB && !symtab)
		{
			symtab = &sectionTable[i];
		}
		else if (sectionTable[i].sh_type == SHT_STRTAB && !strtab)
		{
			// There can be many string tables, so we have to loop up the section name in 
			// the string table to see if it's the string table we want.
			// It's just as convoluted as it sounds, don't worry.
			char secName[10]; //big enough to hold any single string we want to look at here.
			eFile.seekg(shstrtab->sh_offset + sectionTable[i].sh_name);
			eFile.read(secName, sizeof(secName));
			if (strncmp(secName, ".symtab", 8) == 0)
			{
				strtab = &sectionTable[i];
			}
		}
	}
	
	if (!strtab || !symtab)
	{
		cerr << "Symbol file has no symbol table!" << endl;
		goto error;
	}
	if (symtab->sh_size == 0 || symtab->sh_offset == 0 || strtab->sh_size == 0 || strtab->sh_offset == 0)
	{
		cerr << "Symbol file has empty symbol or string table!" << endl;
		goto error;
	}
	if (symtab->sh_entsize != sizeof(Elf32_Sym))
	{
		cerr << "Assertion failed: symbol table entry size mismatch!" << endl;
		goto error;
	}
	
	// Load the string table into memory for fast lookup
	stringTable = new char[strtab->sh_size];
	eFile.seekg(strtab->sh_offset);
	eFile.read(const_cast<char*>(stringTable), strtab->sh_size);
	
	// Now to go through the symbol table, finally
	{
		eFile.seekg(symtab->sh_offset);
		
		const int NUM_ENTRIES = symtab->sh_size / symtab->sh_entsize;
		Elf32_Sym *workingSymTable = new Elf32_Sym[WORKING_NUM];
		string symName;
		symName.reserve(32);
		
		if (!gQuiet) cerr << "Reading symbols...";
		for (int i = 0, n = WORKING_NUM; i < NUM_ENTRIES; i += n)
		{
			// Read WORKING_NUM entries, or the remaining entries in the table
			n = min(WORKING_NUM, NUM_ENTRIES-i);
			eFile.read(reinterpret_cast<char*>(workingSymTable), n * symtab->sh_entsize);
			
			// Work through this loaded chunk of the symbol table
			for (int j = 0; j < n; j++)
			{
				Elf32_Sym *sym = &workingSymTable[j];
				// Check if the symbol name is in the map we want
				symName.assign(&stringTable[sym->st_name]);
				
				auto entry = symbolMap.find(symName);
				if (entry != symbolMap.end())
				{
					symbolMap[symName] = sym->st_value;
					if (sym->st_value != 0)
					{
						symName += "&";
						symbolMap[symName] = sym->st_size;
					}
					continue; //move to the next symbol now
				}
			}
			if (!gQuiet && i % (WORKING_NUM*WORKING_NUM) == 0) cerr << ".";
		}
		delete workingSymTable;
		if (!gQuiet) cerr << "done" << endl;
	}

	delete sectionTable;
	delete stringTable;
	eFile.close();
	return true;
	
error:
	delete sectionTable;
	delete stringTable;
	eFile.close();
	return false;
}
