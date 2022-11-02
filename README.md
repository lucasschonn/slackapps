## SlackApps
Repositório de experimentos com a API do Slack :)

## Google Apps Script & Slack API

### Criando um aplicativo Slack usando o Google Apps Script

O Google Apps Script é uma ferramenta extremamente interessante para se construir pequenas aplicações. Até pouco tempo desconhecia a existência desta preciosidade e quando descobri deixei engavetado por algum tempo até que pudesse estudar melhor, e quando a hora chegou fui surpreendido pelas suas funcionalidades e pela facilidade de se usar.

O Google Apps Script (também conhecido como GAS) é uma espécie de linguagem derivada do JavaScript. A sintaxe básica da linguagem é extremamente similar ao queridinho dos programadores front-end com o adicional de contar com diversas classes utilitárias que vão descomplicar e muito a criação de soluções de maneira ágil.

### A proposta

Há cerca de três meses comecei a criar um aplicativo super básico para turbinar a workspace do Slack. Baseado na documentação da Slack API e com um final de semana consegui construir uma aplicação RestAPI escrito em Java utilizando Spring. Após algum tempo de pesquisa experimentei os serviços do Google Cloud, onde minha aplicação foi armazenada (e até aí tudo eram flores).

A medida que os dias passavam minha assinatura de avaliação do Google Cloud se aproximava de expirar, e com isso a preocupação de encontrar uma alternativa. Com a ajuda dos meus amigos no trabalho cogitamos alternativas, algumas até foram testadas (como o Ngrok e alguns servidores improvisados), mas o problema persistia. Foi aí que resolvi dar uma estudada no que seria o GAS, e aí o sol voltou a brilhar.

Meu aplicativo envolvia processamento básico, consistindo de alguns condicionais, algumas requisições e uma resposta, tudo o que pode ser feito com o Google Apps Script, e com algumas horas consegui migrar o aplicativo Java para o GAS.

### Mãos a obra

Se você já está habituado ao JavaScript e teve contato com frameworks, este “guia” vai ser mamão com açúcar, mas caso ainda esteja aprendendo vou tentar ser bem claro em explicar o básico do básico da API do Slack e do Google Apps Script.

Acessando a página de [documentação da API do Slack](https://api.slack.com/tutorials) nós temos acesso a alguns tutoriais que são extremamente úteis na criação de um aplicativo para o Slack.

1. Acesse a [página de apps do Slack](https://api.slack.com/apps/) e clique em **Create New App**.
2. Escolha uma opção de como configurar seu aplicativo, aqui vamos escolher a primeira opção **From Scratch.**
3. Escolha um **nome** e uma **workspace** para começar a criar seu app.

Após criado a página de controle de seu app será exibido, nela algumas informações úteis sobre credenciais e outras informações estarão presentes (muito cuidado com os dados desta página, usuários com este tipo de dados podem ter acesso ao seu app).

Por enquanto vamos ignorar estes dados e vamos criar nosso token de segurança, é ele que vai ser nosso passaporte para trilhar o caminho do desenvolvimento de seu app.

4. Vá na sua barra lateral na seção **Features** e em seguida em ****OAuth & Permissions.****

Para que possamos obter o token de segurança precisamos primeiramente instalar o aplicativo em seu workspace, mas não podemos fazer isto antes de atribuir algum escopo as configurações. Em outras palavras isto define as permissões que seu aplicativo vai ter sobre o workspace (ler, gerenciar, escrever etc).

5. Navegue até a seção **Scopes** e em **Bot Token Scopes** e vamos adicionar o escopo **commands**.
