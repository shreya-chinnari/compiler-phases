import type { Token, TokenType, LexerResult, SymbolTableEntry, LexemeStat } from './types';

// --- Language Specific Definitions ---

const javaKeywords = new Set([
  'abstract', 'assert', 'boolean', 'break', 'byte', 'case', 'catch', 'char', 'class', 'const',
  'continue', 'default', 'do', 'double', 'else', 'enum', 'extends', 'final', 'finally', 'float',
  'for', 'goto', 'if', 'implements', 'import', 'instanceof', 'int', 'interface', 'long', 'native',
  'new', 'package', 'private', 'protected', 'public', 'return', 'short', 'static', 'strictfp',
  'super', 'switch', 'synchronized', 'this', 'throw', 'throws', 'transient', 'try', 'void',
  'volatile', 'while', 'true', 'false', 'null'
]);

const cppKeywords = new Set([
    'alignas', 'alignof', 'and', 'and_eq', 'asm', 'atomic_cancel', 'atomic_commit', 'atomic_noexcept',
    'auto', 'bitand', 'bitor', 'bool', 'break', 'case', 'catch', 'char', 'char8_t', 'char16_t',
    'char32_t', 'class', 'compl', 'concept', 'const', 'consteval', 'constexpr', 'constinit', 'const_cast',
    'continue', 'co_await', 'co_return', 'co_yield', 'decltype', 'default', 'delete', 'do', 'double',
    'dynamic_cast', 'else', 'enum', 'explicit', 'export', 'extern', 'false', 'float', 'for', 'friend',
    'goto', 'if', 'inline', 'int', 'long', 'mutable', 'namespace', 'new', 'noexcept', 'not', 'not_eq',
    'nullptr', 'operator', 'or', 'or_eq', 'private', 'protected', 'public', 'reflexpr', 'register',
    'reinterpret_cast', 'requires', 'return', 'short', 'signed', 'sizeof', 'static', 'static_assert',
    'static_cast', 'struct', 'switch', 'synchronized', 'template', 'this', 'thread_local', 'throw',
    'true', 'try', 'typedef', 'typeid', 'typename', 'union', 'unsigned', 'using', 'virtual', 'void',
    'volatile', 'wchar_t', 'while', 'xor', 'xor_eq'
    // Common types often used like keywords
    , 'string', 'vector', 'map', 'set', 'cout', 'cin', 'endl', 'std'
]);

const operators = new Set([
  '+', '-', '*', '/', '%', // Arithmetic
  '++', '--',             // Increment/Decrement
  '==', '!=', '>', '<', '>=', '<=', // Relational
  '&&', '||', '!',         // Logical
  '&', '|', '^', '~', '<<', '>>', // Bitwise (C++ includes >>> for Java's unsigned right shift)
  '=', '+=', '-=', '*=', '/=', '%=', '&=', '|=', '^=', '<<=', '>>=', '>>>=', // Assignment
  '?', ':',               // Ternary
  '.', '->',              // Member access (C++)
  '::',                   // Scope resolution (C++)
  ',',                    // Comma
  // Java specific might need separate handling if logic differs significantly
]);

const punctuation = new Set([';', '{', '}', '(', ')', '[', ']', '<', '>']); // Note: < and > overlap with operators, context needed


// --- Regular Expressions ---

// More robust regex, handles various number formats and edge cases
const numberRegex = /^(?:0[xX][0-9a-fA-F]+(?:[uUL]|lu|ul|LU|UL)?|0[0-7]*(?:[uUL]|lu|ul|LU|UL)?|(?:[0-9]+\.?[0-9]*|\.[0-9]+)(?:[eE][+-]?[0-9]+)?[fFdD]?|[0-9]+(?:[uUL]|lu|ul|LU|UL)?)/;
const identifierRegex = /^[a-zA-Z_$][a-zA-Z0-9_$]*/;
const stringLiteralRegex = /^"(?:[^"\\]|\\.)*"/; // Handles escaped quotes
const charLiteralRegex = /^'(?:[^'\\]|\\.)'/; // Handles escaped characters

const whitespaceRegex = /^\s+/;
const singleLineCommentRegexJava = /^\/\/.*/;
const multiLineCommentRegexJava = /^\/\*[\s\S]*?\*\//; // Non-greedy match

const singleLineCommentRegexCpp = /^\/\/.*/;
const multiLineCommentRegexCpp = /^\/\*[\s\S]*?\*\//; // Same as Java for basic C-style comments


// --- Lexer Core Function ---

export function analyzeCode(code: string, language: 'java' | 'cpp'): LexerResult {
  const tokens: Token[] = [];
  const errors: Token[] = [];
  const symbolTable = new Map<string, SymbolTableEntry>(); // Use Map for easier updates
  let currentScope: string | null = null; // Simple scope tracking for demo

  let remainingCode = code;
  let line = 1;
  let column = 1;

  const keywords = language === 'java' ? javaKeywords : cppKeywords;
  const singleLineCommentRegex = language === 'java' ? singleLineCommentRegexJava : singleLineCommentRegexCpp;
  const multiLineCommentRegex = language === 'java' ? multiLineCommentRegexJava : multiLineCommentRegexCpp;


  while (remainingCode.length > 0) {
    let match: RegExpMatchArray | null = null;
    let tokenType: TokenType | null = null;
    let tokenValue: string | null = null;

    // 1. Whitespace
    if ((match = remainingCode.match(whitespaceRegex))) {
      tokenType = 'WHITESPACE';
      tokenValue = match[0];
      // Update line/column count based on newlines in whitespace
      const lines = tokenValue.split('\n');
      if (lines.length > 1) {
        line += lines.length - 1;
        column = lines[lines.length - 1].length + 1;
      } else {
        column += tokenValue.length;
      }
      // Optionally add whitespace tokens if needed, otherwise just consume
      // tokens.push({ token: tokenValue, type: tokenType, line, column: column - tokenValue.length });
      remainingCode = remainingCode.substring(tokenValue.length);
      continue; // Move to next iteration
    }

    // 2. Comments
    if ((match = remainingCode.match(multiLineCommentRegex))) {
      tokenType = 'COMMENT_MULTI';
    } else if ((match = remainingCode.match(singleLineCommentRegex))) {
      tokenType = 'COMMENT_SINGLE';
    }
    if (match && tokenType?.startsWith('COMMENT')) {
        tokenValue = match[0];
        tokens.push({ token: tokenValue, type: tokenType, line, column });

        const lines = tokenValue.split('\n');
         if (lines.length > 1) {
            line += lines.length - 1;
             column = lines[lines.length - 1].length + 1;
        } else {
             column += tokenValue.length;
        }
        remainingCode = remainingCode.substring(tokenValue.length);
        continue;
    }


    // 3. Keywords, Identifiers, Literals
    if ((match = remainingCode.match(identifierRegex))) {
      tokenValue = match[0];
      if (keywords.has(tokenValue)) {
         if (tokenValue === 'true' || tokenValue === 'false') {
            tokenType = 'LITERAL_BOOLEAN';
         } else if (tokenValue === 'null') {
            // technically a literal, but often treated like a keyword
             tokenType = 'KEYWORD'; // Or a specific 'LITERAL_NULL' type
         }
         else {
           tokenType = 'KEYWORD';
         }
      } else {
        tokenType = 'IDENTIFIER';
        // Rudimentary symbol table update (only adds, doesn't track type/scope well yet)
        if (!symbolTable.has(tokenValue)) {
            symbolTable.set(tokenValue, {
                identifier: tokenValue,
                type: null, // Type inference is complex, requires parsing
                scope: currentScope,
                lineDefined: line,
            });
        }
      }
    } else if ((match = remainingCode.match(stringLiteralRegex))) {
      tokenType = 'LITERAL_STRING';
      tokenValue = match[0];
    } else if ((match = remainingCode.match(charLiteralRegex))) {
       tokenType = 'LITERAL_CHAR';
       tokenValue = match[0];
    } else if ((match = remainingCode.match(numberRegex))) {
      tokenType = 'LITERAL_NUMBER';
      tokenValue = match[0];
    }

    // 4. Operators and Punctuation (needs careful ordering)
    // Check for multi-character operators first
    let opMatch = false;
    for (const op of ['>>>=', '>>>', '<<=', '>>=', '->', '::', '++', '--', '==', '!=', '>=', '<=', '&&', '||', '+=', '-=', '*=', '/=', '%=', '&=', '|=', '^=']) {
       if (remainingCode.startsWith(op)) {
            tokenType = 'OPERATOR';
            tokenValue = op;
            opMatch = true;
            break;
       }
    }
    // Then single-character operators/punctuation
    if (!opMatch) {
        const char = remainingCode[0];
        if (operators.has(char)) {
            tokenType = 'OPERATOR';
            tokenValue = char;
        } else if (punctuation.has(char)) {
            tokenType = 'PUNCTUATION';
            tokenValue = char;

            // Basic scope tracking example
            if (tokenValue === '{') currentScope = `block@${line}:${column}`;
            if (tokenValue === '}') currentScope = null; // Very simplified, needs proper stack

        }
    }


    // --- Token Processing ---
    if (tokenValue) {
      tokens.push({ token: tokenValue, type: tokenType!, line, column });
      column += tokenValue.length;
      remainingCode = remainingCode.substring(tokenValue.length);
    } else {
      // No match found - ERROR
      const errorChar = remainingCode[0];
      errors.push({
        token: errorChar,
        type: 'ERROR',
        line,
        column,
        message: `Invalid character '${errorChar}'`,
      });
      column += 1;
      remainingCode = remainingCode.substring(1);
    }
  } // end while loop


  // --- Calculate Lexeme Stats ---
   const lexemeStats = calculateStats(tokens);


  return { tokens: tokens.filter(t => t.type !== 'WHITESPACE' && !t.type.startsWith('COMMENT')), // Optionally filter out whitespace/comments from final token list
            errors,
            symbolTable: Array.from(symbolTable.values()), // Convert Map back to Array
            lexemeStats };
}


function calculateStats(tokens: Token[]): LexemeStat[] {
    const counts: { [key in TokenType]?: number } = {};
    let totalTokens = 0;

    for (const token of tokens) {
        // Exclude whitespace/comments from stats if desired
        if (token.type === 'WHITESPACE' || token.type.startsWith('COMMENT')) {
            continue;
        }
        counts[token.type] = (counts[token.type] || 0) + 1;
        totalTokens++;
    }

     if (totalTokens === 0) return [];

    const stats: LexemeStat[] = Object.entries(counts)
        .map(([type, count]) => ({
            type: type as TokenType,
            count: count!,
            frequency: count! / totalTokens,
        }))
        .sort((a, b) => b.count - a.count); // Sort by count descending

    return stats;
}
