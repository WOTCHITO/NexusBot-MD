import axios from 'axios';

let handler = async (m, { conn, args, usedPrefix, command }) => {
  if (!args[0]) {
    return conn.reply(m.chat, 
      `📁 *Ingrese un enlace de MediaFire*\n\n` +
      `Ejemplo:\n` +
      `${usedPrefix}mediafire https://www.mediafire.com/file/xxxxx`, 
      m, rcanal
    );
  }

  const url = args[0];
  
  if (!url.includes('mediafire.com')) {
    return conn.reply(m.chat, '❌ Por favor ingresa un link válido de MediaFire.', m);
  }

  await m.react(rwait);
  
  conn.reply(m.chat, '📥 *Obteniendo información del archivo...*', m, {
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
    const apiUrl = `https://delirius-apiofc.vercel.app/download/mediafire?url=${encodeURIComponent(url)}`;
    const response = await axios.get(apiUrl, {
      timeout: 30000
    });

    const data = response.data;
    
    if (!data || !data.data || !data.data[0]) {
      await m.react('❌');
      return conn.reply(m.chat, 
        '❌ No se pudo obtener información del enlace.\n\n' +
        '💡 *Tip:* Verifica que sea un link válido de MediaFire.', 
        m
      );
    }

    const file = data.data[0];
    
    if (!file.link) {
      await m.react('❌');
      return conn.reply(m.chat, '❌ No se pudo obtener el enlace de descarga.', m);
    }

    const caption = `
╭━━━⬣ *MEDIAFIRE* ⬣━━━╮
┃
┃ 📄 *Nombre:* ${file.nama || 'Desconocido'}
┃ 📊 *Peso:* ${file.size || 'N/A'}
┃ 📝 *Tipo:* ${file.mime || 'N/A'}
┃
╰━━━━━━━━━━━━━━━━━━━╯
    `.trim();

    conn.reply(m.chat, caption + '\n\n⏳ *Descargando archivo...*', m);

    try {
      const fileResponse = await axios.get(file.link, {
        responseType: 'arraybuffer',
        timeout: 60000,
        maxContentLength: 100 * 1024 * 1024 // 100MB máximo
      });

      const buffer = Buffer.from(fileResponse.data);
      if (file.mime?.includes('image')) {
        await conn.sendMessage(m.chat, {
          image: buffer,
          caption: caption,
          fileName: file.nama || 'imagen'
        }, { quoted: m });
      } else if (file.mime?.includes('video')) {
        await conn.sendMessage(m.chat, {
          video: buffer,
          caption: caption,
          fileName: file.nama || 'video.mp4',
          mimetype: file.mime
        }, { quoted: m });
      } else if (file.mime?.includes('audio')) {
        await conn.sendMessage(m.chat, {
          audio: buffer,
          fileName: file.nama || 'audio.mp3',
          mimetype: file.mime
        }, { quoted: m });
      } else {
        await conn.sendMessage(m.chat, {
          document: buffer,
          caption: caption,
          fileName: file.nama || 'archivo',
          mimetype: file.mime || 'application/octet-stream'
        }, { quoted: m });
      }

      await m.react(done);
      
    } catch (downloadError) {
      console.error('Error al descargar archivo:', downloadError);
      await m.react('❌');
      
      if (downloadError.code === 'ECONNABORTED' || downloadError.message?.includes('timeout')) {
        return conn.reply(m.chat, 
          '❌ El archivo es demasiado grande o la descarga tardó mucho.\n\n' +
          '💡 *Tip:* Intenta con archivos más pequeños.', 
          m
        );
      }
      
      return conn.reply(m.chat, 
        '❌ Error al descargar el archivo.\n\n' +
        '💡 *Tip:* El archivo puede ser demasiado grande o el enlace ha expirado.', 
        m
      );
    }

  } catch (error) {
    console.error('Error en comando mediafire:', error);
    await m.react('❌');
    
    let errorMessage = '❌ Error al procesar el enlace de MediaFire.';
    
    if (error.code === 'ECONNABORTED' || error.code === 'ETIMEDOUT') {
      errorMessage = '❌ La solicitud tardó demasiado. Intenta de nuevo.';
    } else if (error.response?.status === 404) {
      errorMessage = '❌ El archivo no fue encontrado o el enlace es inválido.';
    } else if (error.response?.status === 400) {
      errorMessage = '❌ URL inválida. Verifica el enlace.';
    } else if (error.response?.status === 429) {
      errorMessage = '❌ Demasiadas solicitudes. Espera unos momentos.';
    } else if (!error.response) {
      errorMessage = '❌ No se pudo conectar con el servicio de descarga.';
    }
    
    return conn.reply(m.chat, 
      `${errorMessage}\n\n💡 *Tip:* Asegúrate de que el enlace de MediaFire sea válido y público.`, 
      m
    );
  }
};

handler.help = ['mediafire'];
handler.tags = ['descargas'];
handler.command = /^(mediafire|mdfire|mf)$/i;
handler.register = true;
handler.group = true;
handler.estrellas = 1;

export default handler;
