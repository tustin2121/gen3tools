#pragma once
#include <vector>

enum TokenType : unsigned char {
	Group,
	Constant10,
	Constant16,
	Symbol,
	AddOp,
	SubOp,
	MulOp,
	DivOp,
};

struct ExpressionToken {
	ExpressionToken(TokenType t) : type(t) {};
	~ExpressionToken()
	{
		for (auto val : subTokens)
		{
			delete val;
		}
	}
	
	TokenType type;
	long value;
	std::vector<ExpressionToken*> subTokens;
};

class ExpressionParser {
private:
	const char* const m_expr;
	const int m_exprLength;
	const std::unordered_map<std::string, uint64_t> *m_symbolMap; //unowned
	
	ExpressionToken *m_mainToken;
	
	const char* m_ptr;
	const char* workingExpr = nullptr;
	ExpressionToken *workingToken = nullptr;
	
	const char* m_errorState = nullptr;
public:
	ExpressionParser(std::string *expr, std::unordered_map<std::string, uint64_t> *map);
	~ExpressionParser();
	
	void parse();
	long resolve();
	const char* getErrorState();

private:
	long parseInt(const char* start, const char* end, int base);
	long resolveSymbol(const char* sym, int len);
	void pushWorkingToken(ExpressionToken *group);
	ExpressionToken* parseGroup();
};


void findSymbolsInExpression(std::string expr, std::unordered_map<std::string, uint64_t> *map);
std::string resolveExpression(std::string expr, std::unordered_map<std::string, uint64_t> *map);
