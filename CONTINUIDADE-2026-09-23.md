# Guia Tech — continuidade em 23/09/2026

## Entrega local: validade do login e proteção dos cadastros

O Admin usava um cookie assinado que identificava a conta, mas não continha prazo de expiração verificado pelo servidor. O navegador descartava o cookie após sete dias; uma cópia reenviada ainda podia ser aceita. Agora emissão e expiração fazem parte da assinatura, e o servidor recusa sessões vencidas, adulteradas, com datas futuras ou no formato antigo. O prazo continua sendo de sete dias desde o login. A proteção das páginas e a autorização das alterações usam a mesma leitura validada da sessão, e a conta precisa existir no banco.

Quando esta versão entrar em uso, será necessário fazer login novamente. Nenhuma senha foi alterada. Não há renovação automática da sessão nem revogação individual no banco nesta etapa.

Os cadastros agora são validados antes de chegar ao banco:

- Nome, marca e categoria obrigatórios, com limites de tamanho. Categorias personalizadas continuam aceitas.
- Textos opcionais vazios são salvos como nulos, mantendo os campos já usados pelo formulário.
- Preço opcional, zero ou positivo, finito e com até duas casas decimais; texto decimal aceita ponto ou vírgula. Valores ambíguos, tipos incorretos e valores acima de R$ 999.999.999,99 são recusados.
- Links de imagem, afiliado e vídeo exigem HTTP/HTTPS, sem credenciais embutidas ou espaços. Imagens também aceitam caminhos locais iniciados por uma única barra. Links executáveis e protocolos indevidos são recusados. Isso valida o formato; não confirma disponibilidade, conteúdo, procedência ou vínculo de afiliado.
- IDs de edição e exclusão devem ser inteiros positivos válidos. Campos extras não controlam IDs, datas ou outros dados protegidos.
- Requisições exigem JSON e têm limite de tamanho, inclusive sem Content-Length. JSON malformado retorna erro de formulário. Produtos que não existem retornam 404.
- Login valida email e tipo/tamanho da senha, sem remover espaços da senha. Cookies continuam HttpOnly, SameSite=Lax e Secure em produção.

Mantidas as proteções anteriores: confirmação da conta em cada alteração, Vercel em modo de consulta enquanto usa SQLite local, aviso no Admin e atualização das páginas públicas após salvar/excluir. A tela atual exibe as mensagens de erro e conserva o formulário quando o salvamento falha.

## Catálogo e backup

O banco encontrado nesta etapa já tinha 17 produtos e uma conta administrativa. O arquivo `prisma/dev.db` já estava modificado em relação ao Git antes deste trabalho; essa alteração do usuário foi preservada.

Nova cópia privada e verificada: `backups/guia-tech-2f9j9b/catalogo.db`, com manifesto na mesma pasta. Todos os 17 produtos passaram pelas novas validações. Integridade SQLite aprovada. Produtos e conta foram comparados em memória com a cópia desta etapa, sem diferenças e sem registrar credenciais nos relatórios.

## Verificação

- `npm run test:admin`: cinco testes aprovados, incluindo expiração exata em sete dias, alteração de assinatura/ID/prazo, cookies antigos, entradas inválidas, normalização de dados e limites de leitura JSON.
- `npm run build`: aprovado, com TypeScript e geração das páginas.
- `npm run lint`: aprovado para o código da aplicação. O novo teste HTTP também recebeu verificação específica após sua inclusão.
- `npm run test:admin:http`: aprovado na versão compilada, usando servidor e banco temporários com conta fictícia. Abrange login válido/inválido, atributos do cookie, acesso às páginas, bloqueio das três operações com sessão vencida/adulterada, conta inexistente, erros de formulário, criação/edição/exclusão, preservação após reinício, página atualizada após edição e Vercel em consulta. Os processos de teste foram encerrados e a pasta temporária foi removida. O arquivo real do banco teve SHA-256 comparado antes/depois, sem mudança durante o teste.

Para repetir o teste HTTP, executar `npm run build` antes de `npm run test:admin:http`. Ele copia os artefatos compilados e dependências para uma execução isolada, sem copiar `.env` ou contas reais. O Node 24 pode emitir o aviso MODULE_TYPELESS_PACKAGE_JSON nos testes que importam TypeScript diretamente; os testes e a compilação terminam com sucesso, e o tipo de módulo do projeto não foi alterado apenas para esconder o aviso.

## Próximas prioridades

1. Concluir o banco persistente remoto e sua migração validada, conforme `BANCO-PERSISTENTE.md`. As tentativas anteriores de instalar a dependência falharam por timeout, e o usuário informou uso da rede Petrobras. Não foi feita nova instalação nem criada conta em provedor nesta etapa. O Admin na Vercel permanece protegido contra gravações no SQLite quando estas mudanças forem publicadas.
2. Implementar limitação de tentativas de login em armazenamento compartilhado ou no provedor; um contador em memória não resolve sozinho múltiplas instâncias. Avaliar sessões revogáveis e rotação de acessos junto da migração. O hash administrativo ainda está no banco rastreado pelo Git, pendência já registrada anteriormente.
3. Revisar links, imagens e preços do catálogo, depois validar indexação e experiência móvel em produção.

Nenhum commit, push ou deploy foi feito nesta etapa. Os arquivos estão salvos localmente. Publicação na Vercel é uma etapa separada.


## Complemento: preparação do banco online concluída localmente

O bloqueio de instalação descrito anteriormente foi superado. Os conectores Turso/libSQL estão instalados, o modo remoto opcional está preparado e há um comando de conferência sem gravação. Banco local continua ativo, com os 17 produtos preservados; não houve transferência de dados ou publicação. Testes de compatibilidade, compilação e fluxo HTTP local foram aprovados. O comando de conferência teve uma falha de importação corrigida e ganhou teste de inicialização e sigilo dos erros.

Falta definir a conta/banco de destino para importar e validar uma cópia online. A limitação de tentativas de login e a revisão do histórico do banco continuam pendentes. Consulte `BANCO-PERSISTENTE.md` para os modos, variáveis privadas, resultados e passos restantes. Este complemento atualiza a situação da primeira prioridade descrita acima.
