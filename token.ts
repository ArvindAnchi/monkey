export type TokenType = String

export class Token {
	Type: TokenType
	Literal: string

	static ILLEGAL = 'ILLEGAL'
	static EOF = 'EOF'

	static IDENT = 'IDENT'
	static INT = 'INT'

	static ASSIGN = '='
	static PLUS = '+'
	static MINUS = "-"
	static BANG = "!"
	static ASTERISK = "*"
	static SLASH = "/"

	static LT = "<"
	static GT = ">"
	static EQ = "=="
	static NOT_EQ = "!="

	static COMMA = ','
	static SEMICOLON = ';'

	static LPAREN = '('
	static RPAREN = ')'
	static LBRACE = '{'
	static RBRACE = '}'

	static FUNCTION = 'FUNCTION'
	static LET = 'LET'
	static TRUE = "TRUE"
	static FALSE = "FALSE"
	static IF = "IF"
	static ELSE = "ELSE"
	static RETURN = "RETURN"

	constructor() {
		this.Type = ''
		this.Literal = ''
	}

	lookupIdent(ident: string) {
		const keywords: Record<string, string> = {
			'fn': Token.FUNCTION,
			'let': Token.LET,
			"true": Token.TRUE,
			"false": Token.FALSE,
			"if": Token.IF,
			"else": Token.ELSE,
			"return": Token.RETURN,
		}

		if (Object.keys(keywords).includes(ident)) {
			return keywords[ident]
		}

		return Token.IDENT
	}
}

