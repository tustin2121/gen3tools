#pragma once

void findSymbolsInExpression(string expr, unordered_map<string, uint64_t> *map);
string resolveExpression(string expr, unordered_map<string, uint64_t> *map);
