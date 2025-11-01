import axios from 'axios';
const {
  generateWAMessageContent,
  generateWAMessageFromContent,
  proto
} = (await import("@whiskeysockets/baileys"))["default"];

let handler = async (m, {
  conn,
  text,
  usedPrefix,
  command
}) => {
  if (!text) {
    return conn.reply(m.chat, "🍟 *¿Qué quieres buscar en Pinterest?*", m, rcanal);
  }
  
  await m.react(rwait);
  conn.reply(m.chat, '🚩 *Buscando imágenes...*', m, {
    contextInfo: { 
      externalAdReply: {
        mediaUrl: null, 
        mediaType: 1, 
        showAdAttribution: true,
        title: packname,
        body: wm,
        previewType: 0, 
        thumbnail: icons,
        sourceUrl: channel 
      }
    }
  });

  try {
    let { data } = await axios.get(`https://pinscrapper.vercel.app/api/pinterest/search?q=${encodeURIComponent(text)}&limit=5`);
    if (!data.success || !data.images || data.images.length === 0) {
      await m.react('❌');
      return conn.reply(m.chat, '❌ No se encontraron resultados para: ' + text, m);
    }

    async function createImage(url) {
      const { imageMessage } = await generateWAMessageContent({
        image: { url }
      }, {
        upload: conn.waUploadToServer
      });
      return imageMessage;
    }

    let cards = [];
    let counter = 1;
    
    for (let img of data.images) {
      cards.push({
        body: proto.Message.InteractiveMessage.Body.fromObject({
          text: `Imagen ${counter++}\n${img.title || 'Sin título'}`
        }),
        footer: proto.Message.InteractiveMessage.Footer.fromObject({
          text: textbot
        }),
        header: proto.Message.InteractiveMessage.Header.fromObject({
          title: '',
          hasMediaAttachment: true,
          imageMessage: await createImage(img.imageUrl)
        }),
        nativeFlowMessage: proto.Message.InteractiveMessage.NativeFlowMessage.fromObject({
          buttons: [{
            name: "cta_url",
            buttonParamsJson: JSON.stringify({
              display_text: "Ver en Pinterest 📌",
              url: img.originalUrl,
              merchant_url: img.originalUrl
            })
          }]
        })
      });
    }

    const carouselMessage = generateWAMessageFromContent(m.chat, {
      viewOnceMessage: {
        message: {
          messageContextInfo: {
            deviceListMetadata: {},
            deviceListMetadataVersion: 2
          },
          interactiveMessage: proto.Message.InteractiveMessage.fromObject({
            body: proto.Message.InteractiveMessage.Body.create({
              text: `🔍 Resultados de: ${text}\n📊 Total: ${data.count} imágenes`
            }),
            footer: proto.Message.InteractiveMessage.Footer.create({
              text: "🔎 Pinterest - Búsquedas"
            }),
            header: proto.Message.InteractiveMessage.Header.create({
              hasMediaAttachment: false
            }),
            carouselMessage: proto.Message.InteractiveMessage.CarouselMessage.fromObject({
              cards: cards
            })
          })
        }
      }
    }, {
      quoted: m
    })

    await m.react(done);
    await conn.relayMessage(m.chat, carouselMessage.message, {
      messageId: carouselMessage.key.id
    })
  } catch (error) {
    console.error('Error en Pinterest search:', error)
    await m.react('❌')
    return conn.reply(m.chat, '❌ Ocurrió un error al buscar en Pinterest. Intenta de nuevo.', m);}}

handler.help = ["pinterest"]
handler.tags = ["buscador"]
handler.estrellas = 1
handler.group = true
handler.register = true
handler.command = ['pinterest']
export default handler
