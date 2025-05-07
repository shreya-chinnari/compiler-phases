import type { Token, TokenType, LexerResult, SymbolTableEntry, LexemeStat, TacInstruction } from './types';
import { generateTAC } from './tac-generator'; // Import the TAC generator

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
]);

const punctuation = new Set([';', '{', '}', '(', ')', '[', ']', ':']); // Added ':' for labels/ternary


// --- Regular Expressions ---
const numberRegex = /^(?:0[xX][0-9a-fA-F]+(?:[uUL]|lu|ul|LU|UL)?|0[0-7]*(?:[uUL]|lu|ul|LU|UL)?|(?:[0-9]+\.?[0-9]*|\.[0-9]+)(?:[eE][+-]?[0-9]+)?[fFdD]?|[0-9]+(?:[uUL]|lu|ul|LU|UL)?)/;
const identifierRegex = /^[a-zA-Z_$][a-zA-Z0-9_$]*/;
const stringLiteralRegex = /^"(?:[^"\\]|\\.)*"/;
const charLiteralRegex = /^'(?:[^'\\]|\\.)'/;
const whitespaceRegex = /^\s+/;
const singleLineCommentRegexJava = /^\/\/.*/;
const multiLineCommentRegexJava = /^\/\*[\s\S]*?\*\//;
const singleLineCommentRegexCpp = /^\/\/.*/;
const multiLineCommentRegexCpp = /^\/\*[\s\S]*?\*\//;
const cppPreprocessorDirectiveRegex = /^#.*/; // For C++ preprocessor directives

// --- Lexer Core Function ---

export function analyzeCode(code: string, language: 'java' | 'cpp'): Omit<LexerResult, 'errors'> {
  const tokens: Token[] = [];
  const symbolTable = new Map<string, SymbolTableEntry>(); // Rule 9: Use Map for efficient access
  const scopeStack: string[] = ['global']; // Rule 3: Stack for scope handling
  let lastKeywordType: string | null = null; // To help with type binding

  let remainingCode = code;
  let line = 1;
  let column = 1;

  const keywords = language === 'java' ? javaKeywords : cppKeywords;
  const singleLineCommentRegex = language === 'java' ? singleLineCommentRegexJava : singleLineCommentRegexCpp;
  const multiLineCommentRegex = language === 'java' ? multiLineCommentRegexJava : multiLineCommentRegexCpp;

  const getCurrentScope = () => scopeStack[scopeStack.length - 1];

  // Rule 1: Static initialization (add keywords to symbol table or a separate set)
  // For simplicity, we rely on the `keywords` set for lookup later.

  // Helper to check if a symbol exists in the current scope
  const existsInCurrentScope = (lexeme: string): boolean => {
    if (!symbolTable.has(lexeme)) return false;
    return symbolTable.get(lexeme)!.scope === getCurrentScope();
  };

  // Helper to find a symbol starting from current scope outwards
  const lookupSymbol = (lexeme: string): SymbolTableEntry | undefined => {
      for (let i = scopeStack.length - 1; i >= 0; i--) {
          const scope = scopeStack[i];
          // Simple lookup by lexeme name, refinement needed for scoped keys if Map stores per scope
          const entry = symbolTable.get(lexeme);
          // Check if entry exists AND belongs to the scope being checked
          if (entry && entry.scope === scope) {
              return entry;
          }
          // More robust: If map keys were "scope:lexeme", lookup would be direct:
          // const scopedKey = `${scope}:${lexeme}`;
          // if (symbolTable.has(scopedKey)) return symbolTable.get(scopedKey);
      }
      return undefined; // Not found in any accessible scope
  };


  // Helper to insert/update a symbol
  const addOrUpdateSymbol = (
      lexeme: string,
      tokenType: TokenType,
      dataType: string | null,
      line: number,
      isDeclaration: boolean = false,
      attributes?: SymbolTableEntry['attributes']
  ) => {
      const currentScope = getCurrentScope();
      const existingEntry = lookupSymbol(lexeme);

      // Rule 1 & 8: Check for redefinition in the *current* scope
      if (existingEntry && existingEntry.scope === currentScope && isDeclaration) {
          // Allow update if only line number changes, otherwise check type
          if (existingEntry.dataType && dataType && existingEntry.dataType !== dataType) {
              console.warn(`Symbol Table Info: Redefinition of '${lexeme}' with a different type ('${dataType}' vs '${existingEntry.dataType}') in scope '${currentScope}' at line ${line}. This might be an error or overloading.`);
              // For lexical analysis, we might still proceed, but semantic analysis should flag this.
              // Optionally, create a new entry for the overloaded version if language supports it or handle as an error.
          }
           // If not a redefinition error, update line number
          if (!existingEntry.lineNumbers.includes(line)) {
             existingEntry.lineNumbers.push(line);
          }
          // Rule 7: Update other attributes if needed
           if (dataType && !existingEntry.dataType) existingEntry.dataType = dataType; // Bind type if not already set
           if (attributes) existingEntry.attributes = { ...existingEntry.attributes, ...attributes };
          symbolTable.set(lexeme, existingEntry); // Update the map
      } else if (!existingEntry || existingEntry.scope !== currentScope) {
          // Not in current scope or doesn't exist: Insert new entry for current scope
          symbolTable.set(lexeme, {
              lexeme: lexeme,
              tokenType: tokenType,
              dataType: dataType,
              scope: currentScope,
              lineNumbers: [line],
              attributes: attributes || {}, // Initialize attributes
          });
      } else {
          // Exists in current scope, not a declaration - just update line number and possibly attributes
           if (!existingEntry.lineNumbers.includes(line)) {
               existingEntry.lineNumbers.push(line);
           }
           if (dataType && !existingEntry.dataType) existingEntry.dataType = dataType; // Try to bind type if encountered later (e.g. usage before full declaration seen)
           if (attributes) existingEntry.attributes = { ...existingEntry.attributes, ...attributes };
           symbolTable.set(lexeme, existingEntry); // Update the map
      }
  };


  while (remainingCode.length > 0) {
    let match: RegExpMatchArray | null = null;
    let tokenType: TokenType | null = null;
    let tokenValue: string | null = null;
    let isDeclaration = false; // Flag for symbol insertion logic

    // --- Whitespace and Comments Handling (as before) ---
    if ((match = remainingCode.match(whitespaceRegex))) {
      tokenType = 'WHITESPACE';
      tokenValue = match[0];
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
    if ((match = remainingCode.match(multiLineCommentRegex)) || (match = remainingCode.match(singleLineCommentRegex))) {
      tokenType = match[0].startsWith('/*') ? 'COMMENT_MULTI' : 'COMMENT_SINGLE';
      tokenValue = match[0];
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
    // C++ Preprocessor Directives
    if (language === 'cpp' && (match = remainingCode.match(cppPreprocessorDirectiveRegex))) {
        tokenValue = match[0];
        // Treat like a single line comment for advancing line/column
        const lines = tokenValue.split('\n');
        if (lines.length > 1) {
            line += lines.length - 1;
            column = lines[lines.length - 1].length + 1;
        } else {
            column += tokenValue.length;
        }
        remainingCode = remainingCode.substring(tokenValue.length);
        continue; // Skip adding as a token, or add as a specific PREPROCESSOR token if needed
    }


    // --- Token Identification and Symbol Table Interaction ---

    let currentTokenStartColumn = column; // Track start column for the current token

    // Keywords
     if ((match = remainingCode.match(identifierRegex))) {
       const potentialKeyword = match[0];
       if (keywords.has(potentialKeyword)) {
         tokenType = 'KEYWORD';
         tokenValue = potentialKeyword;
         // Rule 6: Potential Data Type Binding hint
         if (['int', 'float', 'double', 'char', 'boolean', 'void', 'string', 'auto', 'long', 'short', 'signed', 'unsigned', 'byte', 'wchar_t'].includes(tokenValue)) {
           lastKeywordType = tokenValue; // Remember the type keyword
         } else if (tokenValue !== 'static' && tokenValue !== 'final' && tokenValue !== 'const' && tokenValue !== 'public' && tokenValue !== 'private' && tokenValue !== 'protected') {
           // Reset if it's not a type keyword or a modifier that can precede a type
           lastKeywordType = null;
         }
       }
     }

     // Identifiers (only if not identified as a keyword)
    if (!tokenType && (match = remainingCode.match(identifierRegex))) {
      tokenType = 'IDENTIFIER';
      tokenValue = match[0];
      // Determine if this is a declaration by checking if lastKeywordType is set
      // A more robust check would involve looking at the parse tree or grammar rules
      const previousToken = tokens.length > 0 ? tokens[tokens.length - 1] : null;
      isDeclaration = !!lastKeywordType || (previousToken?.type === 'KEYWORD' && ['class', 'interface', 'enum', 'struct'].includes(previousToken.token));

      // Rule 2 & 6: Lookup or Insert Identifier
      // If lastKeywordType is set, this identifier is being declared with that type.
      // If not, lookup its type if it exists, otherwise, it's an unknown type or usage before declaration.
      const existingSymbol = lookupSymbol(tokenValue);
      let inferredDataType = lastKeywordType; // Default to last seen type keyword

      if (!isDeclaration && existingSymbol) {
          inferredDataType = existingSymbol.dataType; // Use existing type if not a new declaration
      }

      addOrUpdateSymbol(tokenValue, tokenType, inferredDataType, line, isDeclaration);
      if(isDeclaration && lastKeywordType) lastKeywordType = null; // Consume the type hint after a potential declaration part
    }
    // Literals
    else if ((match = remainingCode.match(stringLiteralRegex))) {
      tokenType = 'LITERAL_STRING';
      tokenValue = match[0];
       // Rule 5: Constant Management
       addOrUpdateSymbol(tokenValue, tokenType, (language === 'java' ? 'String' : 'string'), line, false, { isConstant: true, value: JSON.parse(tokenValue) }); // Store parsed value
      lastKeywordType = null;
    } else if ((match = remainingCode.match(charLiteralRegex))) {
        tokenType = 'LITERAL_CHAR';
        tokenValue = match[0];
        addOrUpdateSymbol(tokenValue, tokenType, 'char', line, false, { isConstant: true, value: tokenValue.slice(1, -1) }); // Store char value
        lastKeywordType = null;
    } else if ((match = remainingCode.match(numberRegex))) {
        tokenType = 'LITERAL_NUMBER';
        tokenValue = match[0];
         // Infer numeric type (simplified)
         let numType = 'int'; // default
         if (tokenValue.includes('.') || tokenValue.toLowerCase().includes('e')) {
            numType = tokenValue.toLowerCase().endsWith('f') ? 'float' : 'double';
         } else if (tokenValue.toLowerCase().endsWith('l')) {
            numType = 'long';
         } else if (tokenValue.toLowerCase().endsWith('s')) { // C++ short literal (less common, but for completeness)
            numType = 'short';
         }
         addOrUpdateSymbol(tokenValue, tokenType, numType, line, false, { isConstant: true, value: Number(tokenValue) }); // Store numeric value
        lastKeywordType = null;
     } else if (tokenType === 'KEYWORD' && (tokenValue === 'true' || tokenValue === 'false')) {
         tokenType = 'LITERAL_BOOLEAN';
         addOrUpdateSymbol(tokenValue, tokenType, 'boolean', line, false, { isConstant: true, value: tokenValue === 'true' });
         lastKeywordType = null;
    } else if (tokenType === 'KEYWORD' && tokenValue === 'null') {
        // 'null' is a literal keyword, usually its type is special (e.g. type of null)
        // For simplicity, we can assign it a 'null_type' or leave as null and let semantic analysis handle.
        addOrUpdateSymbol(tokenValue, tokenType, 'null', line, false, {isConstant: true, value: null});
        lastKeywordType = null;
    }


    // Operators
    if (!tokenType) { // Check only if not identified above
        const sortedOperators = Array.from(operators).sort((a, b) => b.length - a.length);
        for (const op of sortedOperators) {
          if (remainingCode.startsWith(op)) {
            tokenType = 'OPERATOR';
            tokenValue = op;
            lastKeywordType = null;
            break;
          }
        }
    }

    // Punctuation
    if (!tokenType) { // Check only if not identified above
        const char = remainingCode[0];
        if (punctuation.has(char)) {
            tokenType = 'PUNCTUATION';
            tokenValue = char;

            // Rule 3: Scope Handling
            if (tokenValue === '{') {
              const prevToken = tokens.length > 0 ? tokens[tokens.length - 1] : null;
              let scopeNamePrefix = 'block';
              // Try to infer if it's a function or class scope for better naming
              if (prevToken) {
                if(prevToken.type === 'IDENTIFIER' && tokens[tokens.length-2]?.token === '(') { // Likely function definition name
                    scopeNamePrefix = `function:${prevToken.token}`;
                } else if (prevToken.type === 'IDENTIFIER' && (tokens[tokens.length-2]?.token === 'class' || tokens[tokens.length-2]?.token === 'struct' || tokens[tokens.length-2]?.token === 'enum' || tokens[tokens.length-2]?.token === 'interface')) {
                    scopeNamePrefix = `${tokens[tokens.length-2].token}:${prevToken.token}`;
                } else if (prevToken.token === ')') { // After function parameters or if condition
                     // Look further back for function name
                     let k = tokens.length - 2;
                     while(k >= 0 && tokens[k].token !== '(') k--; // find opening paren
                     if(k > 0 && tokens[k-1]?.type === 'IDENTIFIER') {
                        scopeNamePrefix = `function:${tokens[k-1].token}`;
                     } else {
                        scopeNamePrefix = 'control_block'; // e.g. if, for, while block
                     }
                }
              }
              const newScopeName = `${getCurrentScope()}/${scopeNamePrefix}@L${line}C${column}`; // More specific scope name
              scopeStack.push(newScopeName);
            } else if (tokenValue === '}') {
              if (scopeStack.length > 1) { // Don't pop the global scope
                scopeStack.pop();
              } else {
                  // This is an error, but lexer should try to recover. Semantic analysis will catch it properly.
                  console.warn(`Lexer Warning: Unmatched '}' at Line ${line}, Column ${column}`);
              }
            }
            lastKeywordType = null; // Reset type hint on punctuation
        }
    }

    // --- Token Processing & Error Handling ---
    if (tokenValue && tokenType) {
      tokens.push({ token: tokenValue, type: tokenType, line, column: currentTokenStartColumn }); // Use start column
      column += tokenValue.length;
      remainingCode = remainingCode.substring(tokenValue.length);
    } else {
      // No match found - Error
      const errorChar = remainingCode[0];
      // console.error(`Lexer Error: Invalid character '${errorChar}' at Line ${line}, Column ${column}`);
      tokens.push({ token: errorChar, type: 'ERROR', line, column }); // Add error token
      column += 1;
      remainingCode = remainingCode.substring(1); // Skip the invalid character
      lastKeywordType = null; // Reset type hint on error
    }
  } // end while loop

  // --- Calculate Lexeme Stats ---
  const lexemeStats = calculateStats(tokens.filter(t => t.type !== 'WHITESPACE' && !t.type.startsWith('COMMENT') && t.type !== 'ERROR'));

  // --- Generate Three-Address Code ---
  const tac = generateTAC(tokens.filter(t => t.type !== 'WHITESPACE' && !t.type.startsWith('COMMENT'))); // Generate TAC from the filtered tokens

  // Rule 10: Exporting - Convert Map to Array for the result
  const finalSymbolTable = Array.from(symbolTable.values());

  // Post-process symbol table to infer data types better where 'auto' or generic types were used.
  // This is a simplified version. True type inference is complex.
  finalSymbolTable.forEach(entry => {
      if (entry.dataType === 'auto' && entry.attributes?.value !== undefined) {
          if (typeof entry.attributes.value === 'number') {
              entry.dataType = Number.isInteger(entry.attributes.value) ? 'int' : 'double';
          } else if (typeof entry.attributes.value === 'string') {
              entry.dataType = language === 'java' ? 'String' : 'string';
          } else if (typeof entry.attributes.value === 'boolean') {
              entry.dataType = 'boolean';
          }
      }
      // If dataType is still null after lexing, set to 'unknown'
      if (entry.dataType === null && entry.tokenType === 'IDENTIFIER') {
          entry.dataType = 'unknown';
      }
  });


  return {
      tokens: tokens.filter(t => t.type !== 'WHITESPACE' && !t.type.startsWith('COMMENT')), // Filter UI tokens
      symbolTable: finalSymbolTable,
      lexemeStats,
      tac // Include TAC in the result
  };
}


function calculateStats(tokens: Token[]): LexemeStat[] {
    const counts: { [key in TokenType]?: number } = {};
    let totalTokens = 0;

    for (const token of tokens) {
        if (token.type === 'ERROR') continue; // Do not count errors in stats
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
        .sort((a, b) => b.count - a.count);

    return stats;
}

    