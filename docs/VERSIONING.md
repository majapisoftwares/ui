# Versionamento

`@majapisoftwares/ui` segue [SemVer](https://semver.org) sobre a **API pública**: subpaths exportados no `package.json`, nomes de componentes, props e seus tipos, variantes, tokens CSS, classes documentadas (ex.: `orb-*`) e comportamento que um app possa ter usado.

## Qual número subir

| Mudança                                                                                                                                                                                       | Versão    |
| --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------- |
| Correção de bug, acessibilidade, tradução, ajuste visual que não muda a API                                                                                                                   | **patch** |
| Componente, padrão, export, prop opcional ou variante novos; mudança de visual padrão (preset, tokens) que não exige alteração no código do app; deprecação                                   | **minor** |
| Remover ou renomear export, componente, prop, variante ou token; tornar prop obrigatória; mudar o tipo ou o significado de uma prop; mudança de comportamento que obriga o app a mudar código | **major** |

Na dúvida, a pergunta é: **um app que compilava com a versão anterior continua compilando e funcionando sem alterações?** Se sim, não é major.

## Evitar majors

- Prefira mudanças aditivas: nova prop ao lado da antiga, novo componente em vez de mudar o existente.
- Para trocar uma API, mantenha a antiga funcionando, marque-a com `@deprecated` (JSDoc, com a alternativa) e só remova no próximo major planejado.
- Agrupe remoções num único major, com `docs/MIGRATION-<versão>.md` e os consumidores conhecidos atualizados em seguida.
- Um major precisa de aprovação explícita do responsável antes da publicação; o agente propõe e justifica.

## Publicar

1. Escolha o número pela tabela acima e justifique no commit (`feat:` → minor, `fix:` → patch, `feat!:`/`BREAKING CHANGE:` → major).
2. Atualize `version` no `package.json`; o starter acompanha a mesma versão no mesmo commit (`npm run test:starter` verifica).
3. Valide (typecheck, lint, check:standards, build, test:starter, starter contra o pacote empacotado).
4. `npm publish`, tag `v<versão>` no GitHub e registre no plano.
5. Apps fixam a versão exata (`--save-exact`) e atualizam por PR.
