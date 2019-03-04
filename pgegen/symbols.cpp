#include "global.hpp"
#include "symbols.hpp"

#include <regex>

using namespace std;

static const regex REGEX_SYMBOL = regex("\\b[a-zA-Z_][a-zA-Z0-9_]+\\b", regex::ECMAScript | regex::icase);

void findSymbolsInExpression(string expr, unordered_map<string, uint64_t> *map) 
{
   smatch match;
   while (regex_search(expr, match, REGEX_SYMBOL))
   {
      map->emplace(match[0], 0);
      expr = match.suffix().str();
   }
}

string resolveExpression(string expr, unordered_map<string, uint64_t> *map)
{
   string errComment = ";Not yet implemented";
   return "0";
}