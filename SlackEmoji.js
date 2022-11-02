/** SlackEmoji.gs
 * 
 * @author <lucasschon@outlook.com>
 * @since 11/2022
 * 
 * Este aplicativo foi desenvolvivo em GAS (Google Apps Script), esta 
 * linguagem é baseada em JavaScript e fica armazenada em um repositório 
 * de execução do próprio Google, onde depois de implantada serve como 
 * uma RestAPI.
 * 
 * Este aplicativo simula o envio de figurinhas do Slack, uma vez implantado 
 * como um slash command ele passa a processar emojis enviados junto ao 
 * comando e devolve uma imagem do mesmo emoji em tamanho maior.
 * 
 * Exemplo: /comando :nome_emoji:
 * 
 * O aplicativo procura na lista de emojis do próprio workspace, e para emojis
 * nativos do aplicativo é necessário um JSON adicional, que deve ficar 
 * armazenado em sua conta do Google Drive (até o momento melhor solução 
 * encontrada). 
 * 
 * Este aplicativo foi originalmente escrito em Java e devido a 
 * problemas técnicos (avareza) ele foi reescrito em GAS. O Google Apps Script
 * trabalha muito bem com este tipo de script, não gerando custos e devolvendo
 * uma resposta razoavelmente rápida (média de 300ms).
 * 
 * 
 * IMPLANTAÇÃO:
 * 
 * - Antes de implantar é necessário aplicar seu token da API do Slack, é o que
 * garante que sua resposta possa ser enviada para o chat.
 * 
 * - É necessário o upload do mapeamento de emojis nativos em sua conta do Google 
 * Drive, bem como autorização do app para uso do mesmo.
 * 
 * */

const OAUTH_TOKEN = "xoxb-not-a-real-token-this-will-not-work";
const URL_EMOJI_LIST = "https://slack.com/api/emoji.list";
const URL_POST_MESSAGE = "https://slack.com/api/chat.postMessage";
const URL_USER_INFO = "https://slack.com/api/users.info";


function doPost(e) {
  /** Obtemos os parametros necessários. */
  let parametros = e.parameter;
  let emoji = parametros.text;
  let canal = parametros.channel_id;
  let idUsuario = parametros.user_id;

  /** Em seguida obtemos os dados do usuário. */
  let responseUsuario = getRequest(URL_USER_INFO + "?user=" + idUsuario);
  let dadosUsuario = JSON.parse(responseUsuario.getContentText());
  let usuario = obterUsuario(dadosUsuario.user);

  /** Aqui pesquisamos os emojis. */
  let responseEmoji = getRequest(URL_EMOJI_LIST);
  let emojiMap = JSON.parse(responseEmoji.getContentText());
  let urlEmoji = obterEmoji(emoji, emojiMap);

  if (!urlEmoji)
    return ContentService.createTextOutput('Emoji não encontrado.');

  /** Aqui ocorre a criação da resposta, esta que 
   * será enviada no chat como retorno do comando. 
   * */
  let mensagemResposta = obterMensagemBasica();
  mensagemResposta.channel = canal;
  mensagemResposta.username = usuario.nomeCompleto;
  mensagemResposta.icon_url = usuario.foto;
  mensagemResposta.blocks[0].title.text = emoji.replace(':', '');
  mensagemResposta.blocks[0].image_url = urlEmoji;

  postRequest(URL_POST_MESSAGE, mensagemResposta);

  /** Retorno de um HTTP 200 vazio. */
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


function getRequest(url) {
  var options = {
    "method": "get",
    "headers": {
      "Authorization": "Bearer " + OAUTH_TOKEN
    }
  };
  return UrlFetchApp.fetch(url, options);
}


function obterMensagemBasica() {
  let bloco = [{ title: { type: 'plain_text' }, type: 'image', alt_text: ' ' }];
  let mensagemResposta = {};
  mensagemResposta.text = " ";
  mensagemResposta.blocks = bloco;

  return mensagemResposta;
}


/** Extraímos todos os dados do retorno da pesquisa de usuário pela API,
 *  desta forma conseguimos simular a postagem no chat. 
 * */
function obterUsuario(user) {
  let profile = user.profile;
  let usuario = {};

  if (profile)
    usuario.foto = profile.image_original

  if (profile && profile.display_name && profile.display_name != '') {
    usuario.nomeCompleto = profile.real_name
    return usuario;
  }

  if (profile && profile.real_name && profile.real_name != '') {
    usuario.nomeCompleto = profile.real_name;
    return usuario;
  }

  if (user.real_name && user.real_name != '') {
    usuario.nomeCompleto = user.real_name;
    return usuario;
  }

  usuario.nomeCompleto = user.name;
  return usuario;
}


/** Removemos os dois pontos que vem junto ao emoji e 
 * tentamos encontrá-lo no map que retornou da API.
 * 
 * Aqui ainda há o caso onde pode vir um alias, isto é, 
 * uma referência a outro emoji, neste casos removemos 
 * o marcados e chamamos a pesquisa novamente.
 * 
 * Caso não encontrado buscamos nos emojis nativos.
 */
function obterEmoji(nome, map) {
  let emoji = nome.replaceAll(':', '');
  let emojiEncontrado = map.emoji[emoji];

  if (emojiEncontrado && emojiEncontrado.indexOf('alias:') >= 0) {
    emoji = emojiEncontrado.replace('alias:', '');
    return obterEmoji(emoji, map);
  }

  if (!emojiEncontrado) {
    return obterEmojiNativo(emoji);
  }

  return emojiEncontrado;
}

/** Carregamos o JSON pelo DriveApp e parseamos o texto em um novo map. */
function obterEmojiNativo(emoji) {
  let json = DriveApp.getFilesByName('emojis_nativos.json');

  if (json.hasNext()) {
    let data = json.next();
    let dataStr = data.getBlob().getDataAsString();
    let emojiMap = JSON.parse(dataStr);

    return urlEncontrada = emojiMap[emoji];
  }
}