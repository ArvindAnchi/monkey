type TokenType = String

export class Token {
	Type: TokenType
	Literal: string

	keywords: Record<string, string>

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

		this.keywords = {
			'fn': Token.FUNCTION,
			'let': Token.LET
		}
	}

	lookupIdent(ident: string) {
		if (Object.keys(this.keywords).includes(ident)) {
			return this.keywords[ident]
		}

		return Token.IDENT
	}
}

