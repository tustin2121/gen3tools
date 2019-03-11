#pragma once

void findSymbolsInExpression(std::string expr, std::unordered_map<std::string, uint64_t> *map);
std::string resolveExpression(std::string expr, std::unordered_map<std::string, uint64_t> *map);
