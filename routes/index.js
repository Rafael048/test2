var express = require('express');
var router = express.Router();
const youtubedl = require('youtube-dl-exec');
const path = require('path');
const fs = require('fs');
/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index');
});

  router.post('/', async (req, res) => {
    console.log("LLamada a la api")
    const body = req.body
    const url = body.url;
    const name = `${body.name}.mp3` || 'audio.mp3'; // Nombre de archivo por defecto si no se proporciona
  
    if (!url) {
      return res.status(400).send('URL is required');
    }
  
    const outputFilePath = path.join(__dirname, `${name}`);
  
    try {
      // Debug: Mostrar el comando ejecutado y salida
      console.log(`Downloading audio from URL: ${url}`);
      console.log(`Saving audio as: ${outputFilePath}`);
  
      const output = await youtubedl(url, {
        extractAudio: true,
        audioFormat: 'mp3',
        o: outputFilePath // Especificar explícitamente la salida
      });
  
      // Debug: Mostrar la salida de youtube-dl-exec
      console.log('youtube-dl-exec output:', output);
  
      // Verificar que el archivo exista
      if (!fs.existsSync(outputFilePath)) {
        console.error('File does not exist');
        return res.status(500).send('Error processing request');
      }
  
      res.download(outputFilePath, name, (err) => {
        if (err) {
          console.error('Error downloading file:', err);
          return res.status(500).send('Error downloading file');
        } else {
          console.log('File sent');
          // Eliminar el archivo después de enviarlo
          fs.unlink(outputFilePath, (err) => {
            if (err) {
              console.error('Error deleting file:', err);
            } else {
              console.log('File deleted');
            }
          });
        }
      });
    } catch (err) {
      console.error('Error processing request:', err);
      if (!res.headersSent) {
        res.status(500).send('Error processing request');
      }
    }
  });

module.exports = router;
