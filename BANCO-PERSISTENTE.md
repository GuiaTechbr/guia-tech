# Banco persistente do Guia Tech — atualização em 23/09/2026

## Estado atual

O catálogo continua em `prisma/dev.db`, com 17 produtos e uma conta administrativa. Não houve transferência de dados, criação de serviço, alteração de credenciais ou publicação. O banco real foi comparado com o backup desta etapa e continua igual.

O bloqueio anterior de instalação foi superado: `@prisma/adapter-libsql@7.9.1` e `@libsql/client@0.17.0` estão instalados e registrados no lockfile. A opção de conexão com Turso está implementada e compilada; a conta e o banco de destino ainda não foram informados/configurados. Não há conexão remota real validada.

O conector libSQL foi testado contra bancos temporários locais, confirmando preservação de todos os campos, IDs, datas, conta administrativa e sequências, além de criação/edição/exclusão após reconexão. Isso confirma compatibilidade entre os conectores, mas não comprova conexão, permissões ou durabilidade de um serviço online.

## Modos e proteção contra uso do banco errado

| Configuração | Leitura | Cadastro/edição/exclusão pela API |
| --- | --- | --- |
| SQLite local, fora da Vercel | Arquivo local existente | Permitidos após login |
| SQLite na Vercel | Arquivo local em modo somente leitura | Bloqueados |
| Turso configurado, sem liberação de escrita | Banco online | Bloqueados |
| Turso configurado e `GUIA_TURSO_WRITE_ENABLED=1` | Banco online | Permitidos após login |
| Configuração desconhecida, incompleta ou misturada | Falha explícita | Bloqueados |

O modo padrão permanece SQLite. `GUIA_DATABASE_MODE=turso` seleciona a conexão remota e exige URL e token. Não há retorno automático para SQLite quando o serviço online falha. URLs remotas exigem HTTPS/libSQL com TLS, sem senha, parâmetros ou caminhos embutidos.

A liberação de gravação do Turso protege as rotas de produtos da aplicação. Ela não muda as permissões do token do provedor e não impede comandos externos executados diretamente com esse token. O comando de conferência abaixo executa somente consultas, independentemente dessa liberação.

O aviso no Admin permanece visível quando cadastros estão bloqueados. Após alterações autorizadas, páginas do catálogo e sitemap continuam sendo atualizados.

## Backup e restauração

Na pasta `C:\Projetos\guia-tech`, com Node.js 24:

```bat
npm run banco:backup
npm run banco:backup -- --verificar "CAMINHO_COMPLETO_DO_BACKUP\catalogo.db"
```

O backup inclui dados confirmados no WAL e verifica integridade, contagens e SHA-256. Não sobrescreve cópias anteriores. A cópia atual conferida está em `backups/guia-tech-2f9j9b/catalogo.db`, com manifesto na mesma pasta, 17 produtos e uma conta. Criar outra cópia se o catálogo for editado antes da migração.

A cópia contém dados de acesso. Não enviar por chat, colocar em `public` ou incluir no GitHub. `backups` é ignorada pelo Git, mas isso não substitui criptografia ou uma cópia privada fora deste computador.

Para restaurar, parar os processos que editam o banco, verificar a cópia e preservar o banco atual e seus arquivos auxiliares antes de substituí-lo. Não misturar WAL/SHM antigos com um arquivo restaurado. Nenhuma restauração foi realizada nesta etapa; os testes usam dados fictícios.

## Configuração privada para uma cópia de teste online

Depois de definir a conta e o destino, configurar estas variáveis privadas no ambiente de teste, sem enviá-las por chat:

```dotenv
GUIA_DATABASE_MODE=turso
TURSO_DATABASE_URL=libsql://NOME-DO-BANCO.turso.io
TURSO_AUTH_TOKEN=TOKEN_PRIVADO
GUIA_TURSO_WRITE_ENABLED=0
```

Esses valores são exemplos. Não foram inseridos no `.env` atual. O código carrega as variáveis privadas pelo Next.js; não usar o prefixo `NEXT_PUBLIC_`. No comando de conferência, a precedência é a do ambiente de produção do Next.js, incluindo `.env.production.local`, `.env.local`, `.env.production` e `.env`, quando existirem. Variáveis já definidas no processo têm prioridade.

Preview e Production na Vercel devem apontar para bancos distintos durante a validação. Não definir as variáveis de produção antes de conferir a cópia online. `DATABASE_URL` não seleciona o modo desta aplicação; `prisma.config.ts` continua apontando para o SQLite local para evitar aplicar migrations diretamente ao destino remoto.

## Transferência e conferência — pendentes de um destino

1. Definir a conta, o banco de teste, plano e região. Nenhum serviço externo foi criado.
2. Parar cadastros durante a cópia definitiva e criar um backup verificado.
3. Importar a cópia para um novo banco de teste. O procedimento oficial permite `turso db create NOME --from-file CAMINHO_DO_BACKUP`; isso transfere também a conta administrativa, portanto o destino precisa estar definido antes da execução. [Documentação de importação do Turso](https://docs.turso.tech/cli/db/create).
4. Configurar as variáveis privadas de teste com a escrita da aplicação bloqueada e executar:

```bat
npm run banco:verificar-online -- "CAMINHO_COMPLETO_DO_BACKUP\catalogo.db"
```

O comando valida o manifesto antes de conectar, compara todos os campos de Produto/Admin e as sequências de IDs, sem gravar no banco. Exibe apenas contagens e resultado. Em falhas, informa a etapa sem imprimir URLs, tokens, registros ou hashes de senha. Há limite de 45 segundos. Manter o banco de destino sem edições durante a comparação; as consultas não são uma captura atômica de um banco recebendo alterações.

5. Depois da comparação aprovada, liberar escrita apenas no ambiente de teste e verificar login, criação, edição e exclusão de dados fictícios; conferir após reinício e nova publicação de teste. Essa etapa em serviço remoto ainda não foi executada.
6. Preparar o corte para produção, plano de retorno e backup remoto. Só então liberar a escrita em produção e realizar a publicação autorizada.
7. Remover o SQLite do versionamento somente quando a aplicação publicada estiver independente dele. Retornos de versão devem manter a conexão remota para não ocultar cadastros mais recentes.

## Histórico de schema e acessos

As migrations antigas ainda não representam a tabela Admin e todos os campos atuais. Não executar `prisma migrate reset`, `db push` ou migrations antigas contra os bancos reais. Reconciliar o histórico antes de iniciar novas alterações estruturais; esta entrega não executou migrations.

`prisma/dev.db` já estava versionado e contém o hash administrativo. Conferir exposição histórica e planejar rotação dos acessos junto da migração. A limitação de tentativas de login em armazenamento compartilhado e a revogação individual de sessões continuam pendentes.

## Testes concluídos

- Compilação de produção e verificação de código aprovadas.
- Testes de segurança do Admin e de backup/persistência aprovados.
- Testes do conector libSQL com banco fictício aprovados: datas numéricas antigas e datas ISO, IDs, sequência acima do maior ID, todos os campos, reconexão, edição e exclusão. Diferenças em produtos, conta ou sequências são detectadas.
- O teste foi ajustado para aguardar a liberação de arquivos temporários no Windows durante a limpeza.
- Teste do comando de conferência aprovado: inicia no Node 24, trata argumentos/configuração/backup ausentes e não expõe um token fictício. Corrigida a importação do módulo CommonJS `@next/env`.
- Teste HTTP da aplicação compilada aprovado após incluir o conector: login, sessões inválidas, cadastro/edição/exclusão em base fictícia, reconexão, atualização de página e bloqueio de gravação na Vercel. Banco real inalterado; servidor e arquivos temporários encerrados/removidos.

O teste HTTP havia sido impedido pelo limite de uso da revisão automática. A repetição foi autorizada e concluída. Não houve publicação, commit, push ou consumo de crédito de renovação.

Comandos de repetição: `npm run test:admin`, `npm run test:persistencia`, `npm run test:banco-online`, `npm run lint`, `npm run build` e, após compilar, `npm run test:admin:http`.

Implementação baseada na API da versão instalada do conector e nas [orientações oficiais Prisma/Turso](https://docs.turso.tech/sdk/ts/orm/prisma). O schema permanece no formato Prisma 7; exemplos antigos com preview flags não foram aplicados.

## Continuidade em 29/09/2026 — migração em andamento

- Git status inspecionado antes de alterações. As modificações locais existentes foram preservadas; nenhum reset, checkout, commit, push ou migration foi executado.
- O banco atual contém 32 produtos e uma conta administrativa (o registro anterior de 17 produtos está desatualizado).
- Backup atualizado verificado: `backups/guia-tech-4Eyyqz/catalogo.db`, acompanhado de manifesto. Criado pela API de backup SQLite com conferência de integridade e contagens. Deve ser renovado se houver novas edições antes do corte definitivo.
- Testes repetidos: `test:admin` (5 aprovados) e `test:banco-online` (3 aprovados). Estes testes usam dados fictícios; não comprovam acesso a um banco remoto real.
- Destino de produção confirmado pelo usuário: `guia-tech.vercel.app`, projeto `guia-tech` da equipe `Guia Tech` na Vercel.
- Conta Turso acessível no navegador: `guiatechbr`. Importação do backup preparada com nome `guia-tech-preview-20260929`, região AWS US East (Virginia). A criação ainda NÃO foi confirmada; consultar a lista de bancos antes de repetir.
- Nenhuma configuração de produção alterada. Migração, comparação remota, login/CRUD online e teste no iPhone com PC desligado continuam pendentes.
- Turso CLI não instalado; WSL também não instalado. Não houve instalação do WSL.
