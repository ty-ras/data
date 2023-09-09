# Typesafe REST API Specification - Protocol

This package contains type definitions that are to be used in protocol constructs in Typesafe REST API Specification (TyRAS) package family.

Notice that this module does not have runtime specification - it only is useable during TypeScript compilation.
This is why `import type` syntax must be used when importing this module:
```ts
import type * as protocol from "@ty-ras/protocol";
```

This way, there will be no `import`/`require` statement emitted for the result `.js` file, thus avoiding runtime errors.
