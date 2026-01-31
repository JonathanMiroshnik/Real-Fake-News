## **🟢 HIGH PRIORITY: MUST FOLLOW**

### **1. SIZE LIMITS**
- **Functions/Methods:** Never write longer than 40-60 lines. If it gets longer, break it into smaller functions.
- **Files:** Never write longer than 300 lines. Split into multiple files if needed.
- **Arguments:** Functions should have 3 or fewer arguments. If you need more, create a parameter object.

### **2. NAMING RULES**
- **Functions:** Start with a verb: `calculateTotal()`, `fetchData()`, `validateInput()`
- **Variables:** Start with a noun: `userEmail`, `isLoading`, `retryCount`
- **Classes:** Start with a capital letter and noun: `CustomerService`, `FileParser`
- **Constants:** Use UPPERCASE_SNAKE_CASE: `MAX_RETRIES = 3`, `API_TIMEOUT = 5000`
- **Booleans:** Start with `is`, `has`, `can`, or `should`: `isValid`, `hasPermission`, `canExecute`

### **3. FUNCTION DESIGN**
- **One job only:** Each function does exactly ONE thing.
- **Check inputs first:** Validate all inputs at the VERY BEGINNING of the function.
- **Fail fast:** If something is wrong, exit immediately (return early or throw error).
- **Flat structure:** Avoid deep nesting. Use early returns instead.

**BAD:**
```javascript
function processData(data) {
  if (data) {
    // lots of nested code here...
  }
}
```

**GOOD:**
```javascript
function processData(data) {
  if (!data) return null;  // Early return - flat structure
  
  // Rest of function here...
}
```

### **4. READABILITY TRICKS**
- **Explain conditionals:** Create boolean variables with clear names:

**BAD:**
```javascript
if (age > 18 && hasLicense && !isExpired) {
```

**GOOD:**
```javascript
const isEligibleToDrive = age > 18 && hasLicense && !isExpired;
if (isEligibleToDrive) {
```

- **Use guard clauses:** Check for bad conditions FIRST, then handle normal flow.
- **Avoid magic numbers/strings:** Use named constants instead.

## **🟡 MEDIUM PRIORITY: SHOULD FOLLOW**

### **5. CODE ORGANIZATION**
- **Top-down reading:** Put high-level logic at the top, details at the bottom.
- **Group related code:** Keep code that changes together in the same place.
- **Declare close to use:** Define variables where they're first used, not all at the top.

### **6. ERROR HANDLING**
- **Be specific:** Throw/catch specific error types, not generic ones.
- **Don't ignore errors:** Never leave empty catch blocks.
- **Validate early:** Check function arguments and object states immediately.

### **7. COMMENTS & DOCS**
- **Explain WHY, not WHAT:** Code shows what it does. Comments explain why it does it.
- **Delete dead code:** Remove commented-out code. Git keeps history if needed.
- **Document public APIs:** Write brief docstrings for functions others will use.

## **🔵 LANGUAGE-SPECIFIC RULES**

### **For TYPED languages (TypeScript, Java, C#, etc.):**
- **Always declare types:** Don't use `any` or implicit typing.
- **Use strict mode:** Enable strict type checking.

### **For UNTYPED languages (JavaScript, Python, etc.):**
- **Add type hints:** Use JSDoc (JS) or type hints (Python 3.5+).
- **Be defensive:** Add extra validation for critical inputs.

### **For ALL languages:**
- **Use auto-formatter:** Follow standard style (Prettier, Black, gofmt, etc.)
- **Immutability first:** Use `const` or `final` whenever possible.

## **⚙️ QUICK DECISION GUIDE**

When writing code, ask:

1. **"Will future me understand this in 6 months?"** If no, simplify.
2. **"Is this doing more than one thing?"** If yes, split it.
3. **"Will this break silently?"** If yes, add validation.
4. **"Am I repeating myself?"** If yes, create a function.
5. **"Is the name obvious?"** If no, rename it.

## **🎯 SIMPLE CHECKLIST BEFORE FINISHING**

For every piece of code you write:

- [ ] Function is under 60 lines
- [ ] Function has 3 or fewer arguments
- [ ] Function does ONE thing only
- [ ] Inputs are validated at start
- [ ] Meaningful names for functions/variables
- [ ] No deep nesting (max 2-3 levels)
- [ ] Magic numbers replaced with constants
- [ ] Complex conditionals explained with variables
- [ ] No commented-out code left behind
- [ ] Early returns used where possible

## **⚠️ WHEN TO BREAK THE RULES**

Only break these rules if:
1. Performance is critically measured and impacted
2. Framework/library requires it
3. Team standards differ (check existing codebase)

**If you break a rule:** Add a one-line comment explaining why:
```javascript
// Optimization: single function for performance-critical loop
function longProcessingFunction() { ... }
```

## **🏆 GOLDEN RULE**

**Write for the READER, not the writer.** The next person (probably you in 6 months) should understand your code quickly and easily. Clarity beats cleverness every time.

---

*Remember: These rules serve the code, not the other way around. When in doubt, choose the option that makes the code most readable and maintainable.*