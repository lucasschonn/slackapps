/** SlackEventos.gs
 * 
 * @author <lucasschon@outlook.com>
 * @since 11/2022
 * 
 * Este aplicativo foi desenvolvivo em GAS (Google Apps Script), esta 
 * linguagem é baseada em JavaScript e fica armazenada em um repositório 
 * de execução do próprio Google, onde depois de implantada serve como 
 * uma RestAPI.
 * 
 * Este aplicativo age como um aprimoramento do já existente SlackBot.
 * 
 * Quando implantado ele passa a ser uma escuta passiva de qualquer evento
 * ocorrido no chat onde o app esteja adicionado. Quando um gatilho é disparado
 * o aplicativo tenta encontrar alguma palavra chave na mensagem para devolver 
 * uma resposta mais apurada. Estes gatilhos e respostas podem ser configurados
 * no arquivo JSON que servirá de mapeamento para todas as funções.
 * 
 * Este aplicativo foi originalmente escrito em Java e devido a 
 * problemas técnicos (avareza) ele foi reescrito em GAS. O Google Apps Script
 * trabalha muito bem com este tipo de script, não gerando custos e devolvendo
 * uma resposta razoavelmente boa (média de 500ms).
 * 
 * 
 * IMPLANTAÇÃO:
 * 
 * - Antes de implantar é necessário aplicar seu token da API do Slack, é o que
 * garante que sua resposta possa ser enviada para o chat.
 * 
 * - É necessário o upload do mapeamento de ações no formato JSON em sua conta 
 * do Google Drive, bem como autorização do app para uso do mesmo.
 * 
 * */
  
  const OAUTH_TOKEN = "xoxb-not-a-real-token-this-will-not-work";
  const URL_POST_MESSAGE = "https://slack.com/api/chat.postMessage";
  const EVENT_HANDSHAKE = "url_verification";
  const EVENT_CALLBACK = "event_callback";
  const THREAD_SUBTYPE = "thread_broadcast";
  const RESPOSTA_BASICA = "BASICAS";
  
  
  function doPost(e) {
    /** Obtemos os parametros necessários. */
    let parametros = JSON.parse(e.postData.contents);
    let tipoEvento = parametros.type;
    let evento = parametros.event;
  
    /** Este evento é a validação do serviço do Slack chamado de 'desafio'.
     * API docs: https://api.slack.com/events/url_verification
     * 
     * Devemos responder a este tipo de evento com um HTTP 200 carregando o 
     * valor do challenge recebido no evento.
     */
    if (tipoEvento == EVENT_HANDSHAKE){
      return ContentService.createTextOutput(parametros.challenge);
    }
  
    /** Se o tipo de evento não for um evento de callback não fazemos nada. */
    if (tipoEvento != EVENT_CALLBACK){
      return ContentService.createTextOutput();
    }
  
    /** O subtipo thread_broadcast representam os fios de conversa, ou seja,
     * quando um usuário responde uma conversa, seja ela reenviada no canal ou não.
     * 
     * Nestes casos ignoramos os chamados (por enquanto...)
     */
    if (evento.subtype && evento.subtype == THREAD_SUBTYPE){
      return ContentService.createTextOutput();
    }
  
    let canal = evento.channel;
    let textoMensagem = evento.text;
  
    /** Deve ser impossível chegar até aqui sem que haja mensagem, mas 
     * caso venha retornamos, pois nada poderá ser feito.
     */
    if (!textoMensagem){
      return ContentService.createTextOutput();
    }
  
    /** Obtemos o mapa com as ações e extraímos a chave do bot. */
    textoMensagem = formatarString(textoMensagem);
    const powerbot = obterPowerBot();
    let chaveBot = matchMap(powerbot.mencao, textoMensagem);
  
    if (chaveBot) {

      /** Obtem o bot e a lista de respostas. */
      let bot = powerbot.bots[chaveBot];
      let chaveResposta = matchMap(bot.gatilhos, textoMensagem) || RESPOSTA_BASICA;
      let listaRespostas = bot.respostas[chaveResposta];
  
      /** Sorteia um número baseado no tamanho da lista. */
      let random = Math.floor(Math.random() * listaRespostas.length);
  
      /** Geramos a mensagem de resposta. */
      let mensagemResposta = {};
      mensagemResposta.channel = canal;
      mensagemResposta.username = bot.nome;
      mensagemResposta.icon_emoji = bot.foto;
      mensagemResposta.text = listaRespostas[random];
  
      postRequest(URL_POST_MESSAGE, mensagemResposta);
    }
  
    return ContentService.createTextOutput();
  }
  
  
  function postRequest(url, content) {
    var options = {
      "method": "post",
      "headers": {
        "Authorization": "Bearer " + OAUTH_TOKEN,
        "Content-Type": "application/json; charset=utf-8"
      },
      "payload": JSON.stringify(content)
    };
    return UrlFetchApp.fetch(url, options);
  }
  

  /** Adicionamos espaços para reduzir resultados irrelevantes. */
  function formatarString(string) {
    if (string)
      return ' ' + string.toLowerCase() + ' ';
  }
  
  
  /** Realiza uma busca no map por algum termo. */
  function matchMap(map, search) {
    for (const [key, value] of Object.entries(map)) {
      let gatilho = formatarString(key);
      if (search.indexOf(gatilho) >= 0) {
        return value;
      }
    }
  }
  
  
  /** Busca o JSON no Google Drive e converte em objeto. */
  function obterPowerBot() {
    let json = DriveApp.getFilesByName('powerbot.json');
  
    if (json.hasNext()) {
      let data = json.next();
      let dataStr = data.getBlob().getDataAsString();
      let emojiMap = JSON.parse(dataStr);
  
      return emojiMap;
    }
  }