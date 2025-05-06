import type { Token, TacInstruction } from './types';

let tempCounter = 1;
let labelCounter = 1;

function getNextTemp(): string {
    return `t${tempCounter++}`;
}

function getNextLabel(): string {
    return `L${labelCounter++}`;
}

// Basic TAC generation - focused on simple assignments and arithmetic
export function generateTAC(tokens: Token[]): string[] {
    const tacInstructions: string[] = [];
    tempCounter = 1; // Reset temp counter for each generation
    labelCounter = 1; // Reset label counter

    let i = 0;
    while (i < tokens.length) {
        const currentToken = tokens[i];

        // Basic Assignment: IDENTIFIER = EXPRESSION ;
        if (currentToken.type === 'IDENTIFIER' && tokens[i + 1]?.token === '=') {
            const variable = currentToken.token;
            let expressionTokens: Token[] = [];
            let j = i + 2;
            while (tokens[j] && tokens[j].token !== ';') {
                expressionTokens.push(tokens[j]);
                j++;
            }

            if (expressionTokens.length > 0) {
                 const expressionResult = generateExpressionTAC(expressionTokens, tacInstructions);
                 tacInstructions.push(`${variable} = ${expressionResult}`);
            } else {
                 // Handle assignment like 'x = ;' - potentially an error or simple assignment
                 console.warn(`Warning: Assignment without expression for ${variable} at line ${currentToken.line}`);
            }
             i = j + 1; // Move past the semicolon
        }
        // Basic If statement: if ( CONDITION )
        else if (currentToken.token === 'if' && tokens[i+1]?.token === '(') {
             let j = i + 2; // Start after '('
             let conditionTokens: Token[] = [];
             let parenDepth = 1;
             while(tokens[j]) {
                 if(tokens[j].token === '(') parenDepth++;
                 if(tokens[j].token === ')') parenDepth--;
                 if(parenDepth === 0) break; // Found matching ')'
                 conditionTokens.push(tokens[j]);
                 j++;
             }

             if(parenDepth !== 0 || conditionTokens.length === 0) {
                 console.error(`Error: Malformed if statement at line ${currentToken.line}`);
                 i++; // Skip the 'if' token
                 continue;
             }

             const conditionResult = generateExpressionTAC(conditionTokens, tacInstructions);
             const labelFalse = getNextLabel();
             tacInstructions.push(`if_false ${conditionResult} goto ${labelFalse}`);

             // We only handle the 'if' condition here. Generating TAC for the body
             // requires parsing the block structure ({...}), which is beyond basic TAC generation.
             // For now, we just mark the potential jump point.
             // A full implementation would recursively call generateTAC on the body tokens
             // and place the label appropriately.

             tacInstructions.push(`${labelFalse}:`); // Placeholder label for skipping the if-block

             i = j + 1; // Move past the closing ')' of the condition

        }
        // Placeholder for other statements (loops, function calls, etc.)
        // Add more complex statement handlers here

        else {
            // If the token doesn't start a recognized TAC pattern, just move to the next
            i++;
        }
    }

    return tacInstructions;
}


// Generates TAC for a simple arithmetic/relational expression (no operator precedence yet)
// Returns the variable/temporary holding the final result of the expression.
function generateExpressionTAC(expressionTokens: Token[], tacInstructions: string[]): string {
    if (expressionTokens.length === 0) {
        console.error("Error: Empty expression for TAC generation.");
        return "ERROR_EMPTY_EXPRESSION";
    }
    if (expressionTokens.length === 1) {
        // Simple variable or literal
        return expressionTokens[0].token;
    }

    // Very basic left-to-right evaluation without precedence
    let leftOperand = expressionTokens[0].token;
    let i = 1;
    while (i < expressionTokens.length) {
        const operator = expressionTokens[i]?.token;
        const rightOperand = expressionTokens[i + 1]?.token;

        if (!operator || !rightOperand || !isValidOperator(operator)) {
            // If it's just the left operand remaining, or invalid format
            if(i === 1) return leftOperand; // Return the single operand if that's all
             console.error(`Error: Malformed expression near '${leftOperand}'`);
             return "ERROR_MALFORMED_EXPRESSION";
        }

        const tempVar = getNextTemp();
        tacInstructions.push(`${tempVar} = ${leftOperand} ${operator} ${rightOperand}`);
        leftOperand = tempVar; // Result becomes the left operand for the next operation
        i += 2; // Move past operator and right operand
    }

    return leftOperand; // The last temporary holds the final result
}

function isValidOperator(op: string): boolean {
    // Add more valid operators as needed
    return ['+', '-', '*', '/', '==', '!=', '<', '>', '<=', '>='].includes(op);
}
