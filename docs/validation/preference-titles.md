# Saved-language titles

The initial preference state matched server HTML in English. Child title effects
ran before browser preferences were loaded, briefly writing the English title.
The pre-paint visibility mask also expired after two seconds, independently of
whether hydration had completed.

`Preferences` now exposes internal readiness to `useDocumentTitle`. Titles are
written only after the stored/browser language is resolved. The pre-paint mask
is removed only when React has committed that language. The public API remains
compatible, including `useDocumentTitle` outside Preferences.

The catalog and generated starter consume the shared implementation. Cloud and
the starter pin the corrected public Git source archive by its full commit SHA;
no registry authentication or mutable dependency ref is required.

Validation: Portuguese and English hydration tests record every document-title
write and verify that all writes use the selected language. Library typecheck,
lint, standards and build pass. Generated-starter lint, typecheck, UI standards
and build pass. Local Chrome refresh shows `Padrões · Majapi UI` and
`Repositórios · Majapi Cloud`, with visible Portuguese content and the button
`Conectar repositórios`. No production deployment was performed.
