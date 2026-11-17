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

Publicação automática pelo workflow `Release` (npm Trusted Publishing via OIDC do GitHub, com proveniência; sem token, senha ou OTP). PRs não mudam `version`. **Todo push na `main` publica sozinho; ninguém precisa aprovar nem disparar.**

Como o workflow escolhe a versão (`scripts/release-plan.mjs`, olhando os commits desde a última tag `v*`):

1. Se nada em `src/`, `scripts/check-standards.mjs` ou `components.json` mudou (só docs, CI, catálogo, starter), **não publica**.
2. Qualquer commit `feat:`/`feat(escopo):` → **minor**.
3. Caso contrário (`fix:`, sem prefixo, etc.) → **patch**.
4. `feat!:` ou `BREAKING CHANGE:` → o workflow **falha** com aviso: major nunca é automático. Com a aprovação do responsável, rode `gh workflow run release.yml -f bump=major`.

Use prefixos de conventional commits nos commits do PR para forçar o minor. Os commits `release: v…` são ignorados, então a publicação não se repete. Execuções são serializadas (`concurrency: release`) e sempre partem da `main` mais recente, então um release manual feito antes não é duplicado.

O workflow sobe a versão, valida a biblioteca e o starter contra o pacote empacotado, publica no npm (pulando se a versão já existe), fixa o starter na versão publicada (`npm run test:starter`), cria o commit `release: v<versão>`, a tag e a release no GitHub. Apps fixam a versão exata (`--save-exact`) e atualizam por PR. Para forçar um número: `gh workflow run release.yml -f bump=<patch|minor|major>`.

O vínculo de confiança do pacote é configurado uma vez por quem tem acesso de publicação: `npm trust github @majapisoftwares/ui --repo majapisoftwares/ui --file release.yml --allow-publish`.
