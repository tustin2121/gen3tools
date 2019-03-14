#include "global.hpp"
#include "optparse.hpp"
#include <cstring>

using namespace std;
extern int runSelfTest();

static const char SOPT_TEMPLATE[] = { "-t" };
static const char FOPT_TEMPLATE[] = { "--template" };
static const char SOPT_ELF[] = { "-e" };
static const char FOPT_ELF[] = { "--elf" };

static const char FOPT_SELFTEST[] = { "--selftest" };

#define TESTOPTION(option) \
	((strncmp(argv[i], SOPT_##option, sizeof(SOPT_##option)) == 0 || strncmp(argv[i], FOPT_##option, sizeof(FOPT_##option)) == 0) && i+1 < argc)

void printHelp()
{
	cout << "pgegen -t <template.ini> -e <file.elf>" << endl;
	cout << "This program outputs to stdout. If you wish to put it to a file, make sure to redirect it." << endl;
	cout << "  " << SOPT_TEMPLATE << " " << FOPT_TEMPLATE << " <template.ini>" << endl;
	cout << "    " << "Passes in the .ini file which will be filled in by this program." << endl;
	cout << "  " << SOPT_ELF << " " << FOPT_ELF << " <file.elf>" << endl;
	cout << "    " << "Passes in the .elf file which will be parsed to retrieve the data needed." << endl;
}

bool parseOptions(int argc, char* argv[])
{
	int i;
	for (i = 1; i < argc; i++)
	{
		if (strncmp(argv[i], FOPT_SELFTEST, sizeof(FOPT_SELFTEST)) == 0)
		{
			runSelfTest();
         exit(0);
         return false;
		}
		if (TESTOPTION(TEMPLATE))
		{
			templateFilename = new string(argv[++i]);
			continue;
		}
		if (TESTOPTION(ELF))
		{
			symFilename = new string(argv[++i]);
			continue;
		}
	}
	return templateFilename != nullptr && symFilename != nullptr;
}