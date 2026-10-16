/**
 * Servidor Node.js Ultra-Otimizado para Core Web Vitals (clima.franklem.com)
 * Desenvolvido por Franklin Martins (https://franklem.com)
 * Hospedagem: Hostinger Business (Node.js / Phusion Passenger)
 */

const express = require('express');
const compression = require('compression');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Desabilita cabeçalho x-powered-by por segurança e menor payload
app.disable('x-powered-by');

// Ativa compressão Gzip/Brotli máxima para HTML, CSS, JS e XML
app.use(compression({ level: 6, threshold: 512 }));
app.use(cors());
app.use(express.json());

// Carrega o template HTML em memória na inicialização (TTFB < 5ms, zero leitura de disco por requisição)
const indexPath = path.join(__dirname, 'public', 'index.html');
let indexHtmlCache = '';
try {
    indexHtmlCache = fs.readFileSync(indexPath, 'utf8');
} catch (err) {
    console.error('Aviso: public/index.html ainda não encontrado na inicialização.', err.message);
}

// Rota principal "/" com SSR instantâneo para SEO (Zero Redirects)
app.get('/', (req, res) => {
    const html = indexHtmlCache || fs.readFileSync(indexPath, 'utf8');
    const query = req.query.q || req.query.cidade;

    // Cabeçalho de cache inteligente para velocidade e atualização
    res.setHeader('Cache-Control', 'public, max-age=300, stale-while-revalidate=86400');
    res.setHeader('Content-Type', 'text/html; charset=utf-8');

    if (!query) {
        return res.send(html);
    }

    // Sanitiza o termo pesquisado e injeta diretamente no HTML sem redirecionar (resolve "Avoid multiple page redirects")
    const cleanQuery = String(query).replace(/[<>"'&]/g, '').trim();
    const customTitle = `Clima em ${cleanQuery} | Previsão 7 Dias - clima.franklem.com`;
    const customDesc = `Confira a previsão do tempo para os próximos 7 dias em ${cleanQuery} no ClimaBrasil (clima.franklem.com). Temperatura, chuva, umidade e dicas de saúde por Franklin Martins.`;
    const canonicalUrl = `https://clima.franklem.com/?q=${encodeURIComponent(cleanQuery)}`;

    const dynamicHtml = html
        .replace(/<title>.*?<\/title>/i, `<title>${customTitle}</title>`)
        .replace(/<meta name="description" content=".*?">/i, `<meta name="description" content="${customDesc}">`)
        .replace(/<link rel="canonical" href=".*?">/i, `<link rel="canonical" href="${canonicalUrl}">`);

    return res.send(dynamicHtml);
});

// Servir robots.txt e sitemap.xml com Cache-Control longo
app.get('/robots.txt', (req, res) => {
    res.setHeader('Cache-Control', 'public, max-age=86400');
    res.sendFile(path.join(__dirname, 'public', 'robots.txt'));
});

app.get('/sitemap.xml', (req, res) => {
    res.setHeader('Cache-Control', 'public, max-age=86400');
    res.setHeader('Content-Type', 'application/xml; charset=utf-8');
    res.sendFile(path.join(__dirname, 'public', 'sitemap.xml'));
});

// Demais arquivos estáticos com cache de 1 ano (resolve "Use efficient cache lifetimes")
app.use(express.static(path.join(__dirname, 'public'), {
    maxAge: '365d',
    immutable: true,
    etag: true
}));

app.listen(PORT, () => {
    console.log(`ClimaBrasil otimizado rodando na porta ${PORT} (https://clima.franklem.com)`);
});