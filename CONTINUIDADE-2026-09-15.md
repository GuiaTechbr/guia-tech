# Continuidade técnica — 15/09/2026

## Trabalho pronto para publicação autorizada

Admin: orientação de nomes sem cor, indicação de alterações não salvas e confirmação de descarte. Categorias: consulta compartilhada com os metadados, tratamento de nomes reservados e descrições de cinco categorias. Navegação de categorias/ofertas identificada em português.

Validação na etapa anterior: lint e build passaram; testes locais de categorias e ofertas passaram; formulário testado no navegador com respostas simuladas, incluindo erro ao salvar e confirmação de descarte. Não repetidos nesta etapa de preparação de textos.

## Auditoria somente de leitura do catálogo

Quatro produtos: IDs 1, 2, 4 e 7. Campos de conteúdo preenchidos; três imagens locais existem. O produto 7 usa imagem externa, cuja disponibilidade não foi verificada, e possui espaço no final do nome. Os quatro links apontam para www.amazon.com.br e contêm tag; isso não comprova a titularidade da tag nem a correspondência do modelo na página de destino. Nenhum registro alterado.

## Banco de produção: diagnóstico confirmado no código

src/lib/prisma.ts abre prisma/dev.db via better-sqlite3. O schema usa SQLite. Não existe neste arquivo conexão com banco remoto. Não foi acessada a configuração privada de produção. A documentação da Vercel explica por que SQLite local não serve como banco persistente das Functions. Assim, o código atual não oferece uma base adequada para manter cadastros feitos no Admin público entre execuções e publicações.

Fonte: https://vercel.com/kb/guide/is-sqlite-supported-in-vercel

Próxima implementação, após definir serviço e acesso: provisionar banco persistente; fazer cópia consistente e privada do SQLite; adaptar Prisma; migrar preservando IDs, relações e contas; conferir totais e dados; validar CRUD em ambiente de teste; configurar variáveis na Vercel; publicar e testar persistência após nova publicação. Guardar plano de retorno. Não colocar banco, hashes de senha ou credenciais em relatórios/novos commits. Nenhum serviço contratado nem migração executada nesta etapa.

## Pendências comerciais encontradas

Os preços atuais do site são cadastros manuais. Revisar sua exibição conforme as regras do programa antes de ampliar a divulgação; a integração autorizada ainda não está disponível. Os novos anúncios não incluem preço. Verificar origem/permissão das imagens existentes e titularidade das tags.

As categorias Áudio e Informática serão necessárias para parte do lote; estão apenas sugeridas nos arquivos. Ampliar a seleção e a navegação em uma alteração de código dedicada. Não forçar categoria incorreta para publicar mais rápido.

## Próximas ações

1. Usuário completa links SiteStripe/modelos e imagens autorizadas do lote.
2. Revisar exibição dos preços e adicionar categorias para o cadastro.
3. Revalidar busca, favoritos e comparação no celular após a próxima mudança nesses componentes. Esta revisão ampla ainda não foi feita nesta etapa.
4. Definir conta/serviço do banco persistente e executar a migração em teste.
5. Publicar somente após autorização e conferir Search Console/produção.
