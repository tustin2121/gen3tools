#include "global.hpp"
#include "symbols.hpp"

#include <regex>

using namespace std;

static const regex REGEX_SYMBOL = regex("\\b[a-zA-Z_][a-zA-Z0-9_]+\\b", regex::ECMAScript | regex::icase);

inline bool isDigit(char c)
{
	return (c >= '0' && c <= '9');
}
inline bool isAlpha(char c)
{
	return (c >= 'a' && c <= 'z') || (c >= 'A' && c <= 'Z');
}
inline bool isHexDigit(char c)
{
	return (c >= '0' && c <= '9') || (c >= 'a' && c <= 'f') || (c >= 'A' && c <= 'F');
}
inline bool isStartingSymbolChar(char c)
{
	return isAlpha(c) || (c == '_');
}
inline bool isSymbolChar(char c)
{
	return isAlpha(c) || isDigit(c) || (c == '_');
}


ExpressionParser::ExpressionParser(string *expr, unordered_map<string, uint64_t> *map) 
	: m_expr(expr->c_str()), m_exprLength(expr->length()), m_symbolMap(map)
{
	m_ptr = m_expr;
}

ExpressionParser::~ExpressionParser()
{
	delete m_expr;
	delete m_mainToken;
	delete workingToken;
}

void ExpressionParser::parse()
{
	m_mainToken = parseGroup();
}

long ExpressionParser::resolve()
{
	
}

const char* ExpressionParser::getErrorState()
{
	return m_errorState;
}


long ExpressionParser::parseInt(const char* start, const char* end, int base)
{
	long val = 0;
	while (start < end)
	{
		switch (*start)
		{
			case '0': val = (val * base) + 0; break;
			case '1': val = (val * base) + 1; break;
			case '2': val = (val * base) + 2; break;
			case '3': val = (val * base) + 3; break;
			case '4': val = (val * base) + 4; break;
			case '5': val = (val * base) + 5; break;
			case '6': val = (val * base) + 6; break;
			case '7': val = (val * base) + 7; break;
			case '8': val = (val * base) + 8; break;
			case '9': val = (val * base) + 9; break;
			case 'a': case 'A': val = (val * base) + 10; break;
			case 'b': case 'B': val = (val * base) + 11; break;
			case 'c': case 'C': val = (val * base) + 12; break;
			case 'd': case 'D': val = (val * base) + 13; break;
			case 'e': case 'E': val = (val * base) + 14; break;
			case 'f': case 'F': val = (val * base) + 15; break;
		}
		start++;
	}
	return val;
}

long ExpressionParser::resolveSymbol(const char* sym, int len)
{
	string str(sym, len);
	auto entry = m_symbolMap->find(str);
	if (entry == m_symbolMap->end())
	{
		m_errorState = "Symbol not found!";
		return 0;
	}
	return entry->second;
}

void ExpressionParser::pushWorkingToken(ExpressionToken *group)
{
	if (!workingToken) return;
	switch (workingToken->type) {
		case Constant10: 
			workingToken->value = parseInt(workingExpr, m_ptr, 10);
			break;
		case Constant16:
			workingToken->value = parseInt(workingExpr, m_ptr, 16);
			break;
		case Symbol:
			workingToken->value = resolveSymbol(workingExpr, m_ptr - workingExpr);
			break;
	}
	group->subTokens.push_back(workingToken); 
	workingToken = nullptr; 
	workingExpr = nullptr; 
}

ExpressionToken* ExpressionParser::parseGroup() 
{
	ExpressionToken *group = new ExpressionToken(Group);
	
	while (m_ptr < m_expr + m_exprLength)
	{
		if (*m_ptr == 0 || *m_ptr == ')')
		{
			pushWorkingToken(group);
			if (group->subTokens.size() == 0)
			{
				m_errorState = "Empty group!";
			}
			m_ptr++;
			return group;
		}
		if (*m_ptr == '(')
		{
			pushWorkingToken(group);
			workingToken = parseGroup();
			if (m_errorState != nullptr) goto error;
			group->subTokens.push_back(workingToken);
			workingToken = nullptr;
			goto loop;
		}
		if (*m_ptr == ' ')
		{
			pushWorkingToken(group);
			goto loop;
		}
		
		if (*m_ptr == '+')
		{
			pushWorkingToken(group);
			group->subTokens.push_back(new ExpressionToken(AddOp)); m_ptr++;
			goto loop;
		}
		if (*m_ptr == '-')
		{
			pushWorkingToken(group);
			group->subTokens.push_back(new ExpressionToken(SubOp)); m_ptr++;
			goto loop;
		}
		if (*m_ptr == '*')
		{
			pushWorkingToken(group);
			group->subTokens.push_back(new ExpressionToken(MulOp)); m_ptr++;
			goto loop;
		}
		if (*m_ptr == '/')
		{
			pushWorkingToken(group);
			group->subTokens.push_back(new ExpressionToken(DivOp)); m_ptr++;
			goto loop;
		}
		if (!workingToken)
		{
			// Check for `0x `
			if (*m_ptr == '0' && m_ptr+2 < m_expr + m_exprLength && *(m_ptr+1) == 'x')
			{
				workingToken = new ExpressionToken(Constant16);
				workingExpr = m_ptr+2;
				m_ptr++;
				goto loop;
			}
			if (isDigit(*m_ptr))
			{
				workingToken = new ExpressionToken(Constant10);
				workingExpr = m_ptr;
				goto loop;
			}
			if (isStartingSymbolChar(*m_ptr))
			{
				workingToken = new ExpressionToken(Symbol);
				workingExpr = m_ptr;
				goto loop;
			}
		}
		else
		{
			if (workingToken->type == Constant10 && !isDigit(*m_ptr))
			{
				m_errorState = "Error parsing base10 constant!";
				goto error;
			}
			if (workingToken->type == Constant16 && !isHexDigit(*m_ptr))
			{
				m_errorState = "Error parsing base16 constant!";
				goto error;
			}
			if (workingToken->type == Symbol && !isSymbolChar(*m_ptr))
			{
				m_errorState = "Error parsing symbol!";
				goto error;
			}
		}	
	loop:
		m_ptr++;
	}
error:
	delete workingToken;
	return group;
}





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
	ExpressionParser parser(&expr, map);
	parser.parse();
	if (parser.getErrorState())
	{
		//TODO
	}
	
	string errComment = ";Not yet implemented";
	return "0";
}