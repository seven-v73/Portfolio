type Token = number | "+" | "-" | "*" | "/" | "%" | "(" | ")";

const precedence: Record<string, number> = {
  "+": 1,
  "-": 1,
  "*": 2,
  "/": 2,
  "%": 2,
};

function tokenize(expression: string): Token[] | null {
  const rawTokens = expression.match(/\d+(?:\.\d+)?|[+\-*/()%]/g);
  if (!rawTokens) return null;

  const compactInput = expression.replace(/\s+/g, "");
  if (rawTokens.join("") !== compactInput) return null;

  return rawTokens.map((token) => {
    const value = Number(token);
    return Number.isNaN(value) ? token as Token : value;
  });
}

function toRpn(tokens: Token[]) {
  const output: Token[] = [];
  const operators: Token[] = [];

  for (const token of tokens) {
    if (typeof token === "number") {
      output.push(token);
      continue;
    }

    if (token === "(") {
      operators.push(token);
      continue;
    }

    if (token === ")") {
      while (operators.length && operators[operators.length - 1] !== "(") {
        output.push(operators.pop() as Token);
      }
      if (operators.pop() !== "(") return null;
      continue;
    }

    while (
      operators.length &&
      operators[operators.length - 1] !== "(" &&
      precedence[operators[operators.length - 1] as string] >= precedence[token]
    ) {
      output.push(operators.pop() as Token);
    }
    operators.push(token);
  }

  while (operators.length) {
    const operator = operators.pop() as Token;
    if (operator === "(" || operator === ")") return null;
    output.push(operator);
  }

  return output;
}

export function evaluateSimpleMath(expression: string): number | "NaN" {
  const tokens = tokenize(expression);
  const rpn = tokens ? toRpn(tokens) : null;
  if (!rpn) return "NaN";

  const stack: number[] = [];
  for (const token of rpn) {
    if (typeof token === "number") {
      stack.push(token);
      continue;
    }

    const right = stack.pop();
    const left = stack.pop();
    if (left === undefined || right === undefined) return "NaN";

    if (token === "+") stack.push(left + right);
    if (token === "-") stack.push(left - right);
    if (token === "*") stack.push(left * right);
    if (token === "/") stack.push(right === 0 ? Number.NaN : left / right);
    if (token === "%") stack.push(right === 0 ? Number.NaN : left % right);
  }

  const result = stack[0];
  return stack.length === 1 && Number.isFinite(result) ? result : "NaN";
}
