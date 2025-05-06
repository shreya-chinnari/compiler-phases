// Define the structure for a token identified by the lexer
export interface Token {
  token: string; // The actual lexeme (e.g., "if", "myVariable", "+")
  type: TokenType; // The category of the token (e.g., KEYWORD, IDENTIFIER)
  line: number; // The line number where the token starts
  column: number; // The column number where the token starts
  message?: string; // Optional message, primarily for errors
}

// Define the possible types a token can have
export type TokenType =
  | 'KEYWORD'
  | 'IDENTIFIER'
  | 'LITERAL_STRING'
  | 'LITERAL_NUMBER'
  | 'LITERAL_BOOLEAN'
  | 'LITERAL_CHAR'
  | 'OPERATOR'
  | 'PUNCTUATION' // Includes separators like ;, ,, (, ), {, }, [, ]
  | 'COMMENT_SINGLE'
  | 'COMMENT_MULTI'
  | 'WHITESPACE' // Usually ignored but can be useful
  | 'ERROR'; // For unrecognized or malformed tokens

// Define the structure for an entry in the symbol table
export interface SymbolTableEntry {
  identifier: string; // The name of the identifier
  type: string | null; // The data type (e.g., "int", "String", "float") - might be null initially
  scope: string | null; // The scope where the identifier is defined (e.g., "global", "methodName")
  lineDefined: number; // The line number where the identifier was first declared/encountered
}

// Define the structure for lexeme statistics
export interface LexemeStat {
  type: TokenType; // The type of lexeme being counted
  count: number; // The number of times this type of lexeme appeared
  frequency: number; // The percentage frequency of this lexeme type (count / total tokens)
}

// Define the overall result structure returned by the lexer
export interface LexerResult {
  tokens: Token[]; // List of all valid tokens found
  errors: Token[]; // List of all errors/invalid tokens found
  symbolTable: SymbolTableEntry[]; // The generated symbol table
  lexemeStats: LexemeStat[]; // Statistics about lexeme types
}
