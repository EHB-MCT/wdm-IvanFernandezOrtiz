# C# Coding and Naming Standards

## Identifier Names

### Naming Rules

Valid identifiers must follow these rules.
If a rule is violated, the C# compiler will produce an error.

| Rule                   | Description                                                                                          |
| ---------------------- | ---------------------------------------------------------------------------------------------------- |
| **Start character**    | Must begin with a **letter** or **underscore (`_`)**.                                                |
| **Allowed characters** | Unicode letters, digits, connecting, combining, or formatting characters.                            |
| **Escaping keywords**  | Prefix with `@` to use a keyword as an identifier. Example: `@if` declares an identifier named `if`. |

> Verbatim identifiers (with `@`) are mostly for interoperability with other languages.

---

### Naming Conventions

These are **recommended patterns** used throughout .NET.
They improve consistency and readability, but are **not compiler-enforced**.

#### General Conventions

| Element                                 | Convention    | Example         |
| --------------------------------------- | ------------- | --------------- |
| **Types / Namespaces / Public members** | PascalCase    | `CustomerOrder` |
| **Local variables / Parameters**        | camelCase     | `orderCount`    |
| **Private instance fields**             | `_camelCase`  | `_orderCount`   |
| **Static fields**                       | `s_camelCase` | `s_cacheSize`   |
| **Thread-static fields**                | `t_camelCase` | `t_buffer`      |
| **Constants**                           | PascalCase    | `MaxRetries`    |

#### Interface & Attribute Naming

* **Interfaces** → Prefix with `I` (e.g., `IEnumerable`, `IService`).
* **Attributes** → Suffix with `Attribute` (e.g., `SerializableAttribute`).
* **Enums** →

  * Singular noun for non-flags: `Color`
  * Plural noun for flags: `FileAccessModes`

#### Best Practices

* Avoid two consecutive underscores (`__`) — reserved for compiler use.
* Prefer **clarity over brevity**.
* Avoid obscure abbreviations (use only common ones like `Html`, `IO`).
* Use **meaningful namespaces** (reverse domain style, e.g., `Company.Product.Module`).
* Choose **assembly names** that reflect purpose.

#### Single-letter Names (for syntax examples only)

| Use              | Letter |
| ---------------- | ------ |
| Structs          | `S`    |
| Classes          | `C`    |
| Methods          | `M`    |
| Variables        | `v`    |
| Parameters       | `p`    |
| `ref` Parameters | `r`    |

---

<details>
<summary> Pascal Case Guidelines</summary>

Use **PascalCasing** when naming:

* Classes
* Interfaces (prefixed with `I`)
* Structs
* Delegates
* Public members (fields, properties, events, methods, local functions)
* Record parameters (become public properties)

Example:

```csharp
public class OrderProcessor
{
    public int OrderId { get; set; }
    public void ProcessOrder() { }
}
```

</details>

---

<details>
<summary> Camel Case Guidelines</summary>

Use **camelCasing** for:

* Private/internal fields (prefixed with `_`)
* Local variables
* Method parameters
* Primary constructor parameters (class/struct)
* Static fields → `s_`, Thread-static → `t_`

Example:

```csharp
private int _orderCount;
public void AddOrder(int orderQuantity)
{
    var totalOrders = _orderCount + orderQuantity;
}
```

</details>

---

<details>
<summary> Type Parameter Naming</summary>

| Guideline                            | Example                              |
| ------------------------------------ | ------------------------------------ |
| Descriptive name (prefixed with `T`) | `TItem`, `TSession`                  |
| Single-letter if clear               | `T`                                  |
| Reflect constraints in name          | `TSession` for `ISession` constraint |

Example:

```csharp
public interface IRepository<TItem> { }
```

</details>

---

<details>
<summary> Extra Naming Guidelines</summary>

* If examples omit `using` directives, use fully qualified namespaces.
* Break long qualified names after a dot (`.`).
* Don’t rename auto-generated objects from Visual Studio.

</details>

---

## Coding Conventions

### Language Guidelines

* Use **modern C# features** and syntax.
* Avoid catching `System.Exception` directly.
* Use **specific exception types** for clarity.
* Prefer **LINQ** for readable collection logic.
* Use **async/await** for I/O-bound operations.
* Be mindful of deadlocks (`ConfigureAwait`).
* Use **C# keywords** (`int`, `string`) instead of framework types.
* Prefer `int` over unsigned types.
* Use `var` **only when the type is obvious**.
* Write simple, clear, and maintainable code.

---

### String Data

* Use **string interpolation** (`$"..."`) instead of concatenation.
* For loops or large string building, use `StringBuilder`.
* Prefer **raw string literals** over escape sequences.
* Use **expression-based interpolation** instead of positional.

Example:

```csharp
var message = $"User {user.Name} logged in at {DateTime.Now}.";
```

---

### Constructors & Initialization

| Type               | Naming for Primary Constructor Parameters |
| ------------------ | ----------------------------------------- |
| **Record**         | PascalCase                                |
| **Class / Struct** | camelCase                                 |

Use **required properties** instead of constructors for mandatory initialization.

---

### Arrays & Collections

* Use **collection expressions** for initialization.

```csharp
var numbers = [1, 2, 3, 4];
```

---

### Delegates

Prefer built-in generic delegates:

```csharp
Action<string> print = Console.WriteLine;
Func<int, int, int> add = (a, b) => a + b;
```

Use concise syntax:

```csharp
Del exampleDel = DelMethod;
exampleDel("Hey");
```

---

### Exception Handling

* Use `try-catch` for recoverable exceptions.
* Use `using` instead of `try-finally` for disposing resources.

```csharp
using var file = File.OpenRead(path);
```

---

### Operators

Use:

* `&&` instead of `&`
* `||` instead of `|`

---

### Object Instantiation

Use concise syntax and initializers:

```csharp
Customer c = new() { Name = "Alice" };
```

---

### Event Handling

Use **lambdas** for event handlers that don’t need removal:

```csharp
button.Click += (sender, e) => DoSomething();
```

---

### Static Members

* Call static members using the **class name**:

  ```csharp
  Math.Abs(value);
  ```
* Don’t qualify base class static members with derived class names.

---

<details>
<summary> LINQ Query Guidelines</summary>

* Use **meaningful query variable names**.
* Use **PascalCase** for anonymous type properties.
* Rename ambiguous fields (`CustomerName`, not `Name`).
* Use **implicit typing (`var`)** for query results.
* Align query clauses under the `from` clause.
* Place `where` clauses early.
* Use multiple `from` clauses instead of `join`.

Example:

```csharp
var highScores =
    from student in students
    from score in student.Scores
    where score > 90
    select new { student.LastName, score };
```

</details>

---

<details>
<summary> Implicitly Typed Variables (`var`)</summary>

| Rule                                               | Example                                        |
| -------------------------------------------------- | ---------------------------------------------- |
| Use `var` when type is **obvious**                 | `var stream = new FileStream(...);`            |
| Avoid when type is unclear                         | NOT `var data = GetData();`                    |
| Don’t encode type in variable name                 | BUT `string userName` not `string userString`  |
| Use `dynamic` only for runtime type inference      |                                                |
| `for` loops → ok; `foreach` → avoid (unless clear) |                                                |
| LINQ queries → always use `var` (anonymous types)  |                                                |

</details>

---

### File-Scoped Namespaces

Use file-scoped namespaces for single-namespace files:

```csharp
namespace MySampleCode;
```

Place `using` directives **outside** the namespace for clarity.

---

### Style Guidelines

| Style       | Rule                                       |
| ----------- | ------------------------------------------ |
| Indentation | 4 spaces, no tabs                          |
| Line length | ≤ 65 characters for readability            |
| Brace style | Allman (`{` on new line)                   |
| Line breaks | Before binary operators                    |
| Formatting  | One statement and one declaration per line |

Example:

```csharp
if (isValid)
{
    ProcessOrder();
}
else
{
    LogError();
}
```

---

### Comment Style

| Rule                                       | Example                                                |
| ------------------------------------------ | ------------------------------------------------------ |
| Use single-line comments (`//`)            | `// Process the customer order.`                       |
| Avoid multi-line (`/* ... */`) comments    |                                                        |
| XML comments for public APIs               | `/// <summary>Initializes a new instance...</summary>` |
| Separate line for comments                 |   not inline                                           |
| Capitalize first letter, end with a period |                                                        |
| One space after `//`                       |                                                        |

---

### Layout Conventions

* Use **default Visual Studio formatting** (4-space indents, smart indenting).
* One **statement** and **declaration** per line.
* Add a **blank line** between methods and properties.
* Indent continuation lines one tab stop.
* Use parentheses to clarify complex expressions.

---
