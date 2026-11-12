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

Publicação automática pelo workflow `Release` (npm Trusted Publishing via OIDC do GitHub, com proveniência; sem token, senha ou OTP). PRs não mudam `version`.

1. Escolha o número pela tabela acima e justifique no commit (`feat:` → minor, `fix:` → patch, `feat!:`/`BREAKING CHANGE:` → major).
2. Com as mudanças na `main`, rode `gh workflow run release.yml -f bump=<patch|minor|major>`.
3. O workflow sobe a versão, valida a biblioteca e o starter contra o pacote empacotado, publica no npm, fixa o starter na versão publicada (`npm run test:starter`), cria o commit `release: v<versão>`, a tag e a release no GitHub.
4. Registre a versão no plano.
5. Apps fixam a versão exata (`--save-exact`) e atualizam por PR.

O vínculo de confiança do pacote é configurado uma vez por quem tem acesso de publicação: `npm trust github @majapisoftwares/ui --repo majapisoftwares/ui --file release.yml --allow-publish`.
