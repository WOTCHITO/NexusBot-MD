import axios from 'axios';
import fetch from 'node-fetch';

let handler = async (m, {
  conn,
  text,
  usedPrefix,
  command
}) => {
  if (!text) {
    return conn.reply(m.chat, "📱 *¿Qué aplicación quieres buscar?*\n\nEjemplo: .apk whatsapp", m, rcanal);
  }
  
  await m.react(rwait);
  conn.reply(m.chat, '🔍 *Buscando aplicación...*', m, {
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
    // Buscar en la API de Aptoide
    let { data } = await axios.get(`https://ws75.aptoide.com/api/7/apps/search/query=${encodeURIComponent(text)}/limit=1`);
    
    if (!data.datalist || !data.datalist.list || data.datalist.list.length === 0) {
      await m.react('❌');
      return conn.reply(m.chat, `❌ No se encontró ninguna aplicación con el nombre: *${text}*`, m);
    }

    let app = data.datalist.list[0];
    
    // Información de la app
    let info = `
╭━━━⬣ *APK DOWNLOADER* ⬣━━━╮
┃
┃ 📱 *Nombre:* ${app.name}
┃ 📦 *Package:* ${app.package}
┃ 🏷️ *Versión:* ${app.file.vername}
┃ 📊 *Tamaño:* ${(app.size / 1024 / 1024).toFixed(2)} MB
┃ ⭐ *Rating:* ${app.stats.rating.avg} (${app.stats.rating.total} votos)
┃ 💾 *Descargas:* ${app.stats.downloads.toLocaleString()}
┃ 👨‍💻 *Desarrollador:* ${app.developer.name}
┃ 📅 *Actualizado:* ${app.updated.split(' ')[0]}
┃ 🔒 *Seguridad:* ${app.file.malware.rank}
┃
╰━━━━━━━━━━━━━━━━━━━━━╯

⏳ *Descargando APK...*
`.trim();

    // Enviar información con imagen
    await conn.sendFile(m.chat, app.icon, 'icon.png', info, m);

    // Descargar el APK
    let apkUrl = app.file.path;
    let apkBuffer = await fetch(apkUrl).then(res => res.buffer());

    // Enviar el APK
    await conn.sendMessage(m.chat, {
      document: apkBuffer,
      mimetype: 'application/vnd.android.package-archive',
      fileName: `${app.name}.apk`,
      caption: `✅ *${app.name}*\n📦 Versión: ${app.file.vername}\n💾 Tamaño: ${(app.size / 1024 / 1024).toFixed(2)} MB`
    }, { quoted: m });

    await m.react(done);

  } catch (error) {
    console.error('Error en APK search:', error);
    await m.react('❌');
    
    if (error.response) {
      return conn.reply(m.chat, `❌ Error al buscar la aplicación. Código: ${error.response.status}`, m);
    } else if (error.message.includes('fetch')) {
      return conn.reply(m.chat, '❌ Error al descargar el APK. El archivo puede ser demasiado grande o la URL no está disponible.', m);
    } else {
      return conn.reply(m.chat, '❌ Ocurrió un error inesperado. Intenta de nuevo.', m);
    }
  }
};

handler.help = ["apk"];
handler.tags = ["downloader"];
handler.estrellas = 2;
handler.command = ['apk', 'apkdl', 'aptoide'];

export default handler;
