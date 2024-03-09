type TokenType = String

export class Token {
	Type: TokenType
	Literal: string

	static ILLEGAL = 'ILLEGAL'
	static EOF = 'EOF'

	static IDENT = 'IDENT'
	static INT = 'INT'

	static ASSIGN = '='
	static PLUS = '+'

	static COMMA = ','
	static SEMICOLON = ';'

	static LPAREN = '('
	static RPAREN = ')'
	static LBRACE = '{'
	static RBRACE = '}'

	static FUNCTION = 'FUNCTION'
	static LET = 'LET'

	constructor() {
		this.Type = ''
		this.Literal = ''
	}
}

