# Guia Tech — situação e prioridades em 20/09/2026

## Estado encontrado

Base local: `main`, commit `3d728b0` (corrige catálogo e remove duplicado), sincronizada com a referência local `origin/main`. Não foi feita consulta nova à Vercel nem confirmação de deploy nesta revisão. O arquivo não rastreado `src/app/favicon-backup.ico` já existia e foi preservado.

A base tem 16 produtos e uma conta administrativa, com integridade SQLite aprovada. O código contém catálogo, Admin, categorias, ofertas, busca, favoritos, comparação, compartilhamento, vídeos, metadados, sitemap, robots e dados estruturados. O teste anterior do Google reconheceu dados válidos de produto e breadcrumb; indexação atual e cobertura de todas as páginas não foram confirmadas nesta etapa.

## Concluído nesta etapa, salvo localmente

- Comando `npm run banco:backup`: backup consistente, sem sobrescrever cópias anteriores, com verificação de integridade, contagens e SHA-256.
- Comando `npm run banco:backup -- --verificar CAMINHO`: detecta cópia alterada ou divergente.
- Proteção na conexão SQLite e nos três métodos de gravação da API: em ambiente Vercel, somente consulta até a ativação de um banco persistente. O Admin mostra a explicação. Edições locais continuam permitidas.
- Invalidação das páginas públicas e sitemap após criação, edição e exclusão bem-sucedidas.
- Layout do Admin de produtos confirma a conta autenticada antes de renderizar a página.
- Backups e arquivos transitórios SQLite ignorados pelo Git. Isso não retira `prisma/dev.db` do histórico, que continua sendo uma pendência da migração.

Cópia real criada: `backups/guia-tech-vPXmwk/catalogo.db`, 16 produtos e uma conta. Cópia verificada novamente pelo manifesto. Contém dados de acesso: não compartilhar nem publicar. Nenhum produto ou conta foi alterado; o banco original não foi incluído em mudanças.

## Validações concluídas

- `npm run test:persistencia`: 2 testes passaram. Incluem WAL, restauração em cópia com dados fictícios, preservação de IDs/datas/campos, criação/edição/exclusão após reconexão, bloqueio de escrita e rejeição de backup adulterado.
- `npm run lint`: aprovado.
- `npm run build`: aprovado, incluindo TypeScript e geração das páginas.
- Versão compilada executada localmente com `VERCEL=1`: página inicial e API públicas HTTP 200, catálogo com 16 produtos; POST/PUT/DELETE sem login HTTP 401 e autenticados HTTP 503; aviso presente no Admin. SHA-256 do banco original permaneceu igual antes e depois. O servidor de teste foi encerrado.
- Não houve teste de banco remoto nem publicação na Vercel. A conferência HTTP não é uma auditoria visual completa.

## Próximas prioridades

1. **Banco persistente e proteção dos dados:** escolher/confirmar serviço, resolver instalação em rede com acesso, transferir cópia verificada em ambiente de teste, comparar todos os campos, testar persistência após reinício e nova publicação. Só depois ativar em produção e retirar o banco do versionamento. Ver `BANCO-PERSISTENTE.md`.
2. **Segurança do Admin:** revisar validade das sessões no servidor, limitação de tentativas de login e validação dos campos da API. Conferir exposição histórica de hashes antes de definir troca de senha/limpeza do Git. Não realizadas nesta etapa.
3. **Revisão comercial do catálogo:** confirmar modelos, links de afiliado e direito de uso das imagens; revisar exibição de preços manuais antes de ampliar divulgação. Os arquivos de anúncios preparados anteriormente são rascunhos; não comprovam publicação ou vendas.
4. **SEO e experiência em produção:** conferir Search Console, sitemap enviado, páginas indexadas, avisos de dados estruturados e uso real no celular. O teste anterior de resultados avançados não garante indexação.
5. **Medição e automação comercial:** planejar métricas de visitas e cliques e posterior integração Amazon quando a conta tiver acesso autorizado. Não há painel de vendas nem API Amazon ativa confirmado por esta revisão.

## Bloqueio encontrado

Duas tentativas de instalar `@prisma/adapter-libsql@7.9.1` retornaram timeout ao acessar o registro npm. O usuário informou que usa a rede Petrobras. A dependência não foi instalada e a aplicação não foi alterada para importá-la. Nenhuma credencial nova foi solicitada ou registrada. A próxima instalação deve ocorrer em conexão com acesso ao serviço.

## Publicação

Nenhum commit ou push desta etapa. Alterações salvas no computador; GitHub/Vercel exigem a etapa de publicação autorizada. Quando estas proteções forem publicadas, o Admin público ficará somente em consulta, até a migração remota. O cadastro pelo computador permanece disponível.
