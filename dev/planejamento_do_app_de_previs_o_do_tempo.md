# Planejamento de Projeto: ClimaBrasil (clima.franklem.com)

Este documento detalha a arquitetura, funcionalidades, escolha de APIs, diretrizes de design (*Mobile-First*), **SEO Técnico (Google Search Central)** e **Core Web Vitals** para o desenvolvimento da aplicação web de previsão do tempo exclusiva para o território brasileiro em **`https://clima.franklem.com`**, otimizada para hospedagem no plano **Hostinger Business** utilizando **Node.js**.

---

## 1. Visão Geral e Escopo do Produto

* **URL Oficial (Subdomínio):** `https://clima.franklem.com`
* **Objetivo:** Fornecer previsão do tempo precisa (atual e para os próximos 7 dias) para qualquer localidade do Brasil (via geolocalização automática, nome da cidade ou CEP), acompanhada de recomendações inteligentes de saúde, fases da lua e integração com o ecossistema de conteúdo de **Franklin Martins**.
* **Público-Alvo:** Usuários brasileiros em dispositivos móveis e desktops que buscam informações rápidas, práticas e orientadas ao bem-estar diário.
* **Autoria e Ecossistema de Domínios:**
  * **Aplicação de Clima:** [clima.franklem.com](https://clima.franklem.com)
  * **Página Pessoal / Portfólio:** [franklem.com](https://franklem.com)
  * **Portal de Notícias (Iframe):** [blog.franklem.com](https://blog.franklem.com)

---

## 2. Arquitetura Técnica e Hospedagem (Hostinger Business)

O plano **Hostinger Business** oferece suporte nativo a aplicações Node.js através do gerenciador **Phusion Passenger** integrado ao hPanel, permitindo apontar diretamente o subdomínio `clima.franklem.com` para a aplicação.

### Stack Tecnológica Recomendada
* **Configuração de Subdomínio no hPanel:** Criar o subdomínio `clima.franklem.com` com SSL (HTTPS Let's Encrypt ativo e redirecionamento forçado HTTP $\rightarrow$ HTTPS).
* **Backend:** Node.js (versão LTS v20.x ou v22.x) com **Express.js** + middleware `compression` (Gzip/Brotli).
  * *Por que Express com SSR leve?* Para que o Googlebot indexe URLs parametrizadas ou amigáveis em `https://clima.franklem.com/?q=Ribeirao+Preto`, o Node.js pode injetar meta tags dinâmicas no HTML antes de entregá-lo ao navegador, garantindo indexação perfeita no Google.
* **Frontend:** HTML5 Semântico, **Tailwind CSS** (compilado e minificado para produção) e JavaScript Vanilla (ES6+).
* **Gerenciamento de Cache:** `node-cache` no backend para armazenar respostas da API por 15 a 30 minutos (reduz o *Time to First Byte - TTFB* para menos de $50\text{ ms}$).

---

## 3. Ecossistema de APIs Públicas e Gratuitas (Sem necessidade de Cartão)

Para atender ao requisito de buscar tanto por **CEP** quanto por **Cidade** (restrito ao Brasil) e obter dados meteorológicos de 7 dias + fases da lua, utilizaremos uma combinação de APIs gratuitas:

1. **Busca por CEP: BrasilAPI (ou ViaCEP)**
   * **Endpoint:** `https://brasilapi.com.br/api/cep/v2/{cep}`
   * **Vantagem:** O endpoint `v2` da BrasilAPI já retorna a cidade, estado e coordenadas geográficas (`latitude` e `longitude`) diretamente, acelerando a consulta do clima.
2. **Busca por Nome da Cidade (Geocoding): Open-Meteo Geocoding API**
   * **Endpoint:** `https://geocoding-api.open-meteo.com/v1/search?name={cidade}&language=pt&countryCode=BR`
   * **Vantagem:** O parâmetro `countryCode=BR` garante que **apenas cidades do Brasil** sejam retornadas, cumprindo rigorosamente a regra de negócio.
3. **Dados Meteorológicos (Atual + 7 Dias): Open-Meteo Forecast API**
   * **Endpoint:** `https://api.open-meteo.com/v1/forecast`
   * **Parâmetros Solicitados:**
     * *Atuais (`current`):* `temperature_2m` ($^\circ\text{C}$), `relative_humidity_2m` ($\%$), `surface_pressure` ($\text{hPa}$), `wind_speed_10m` ($\text{km/h}$), `apparent_temperature` (Sensação Térmica), `weather_code`.
     * *Diários (`daily` - 7 dias):* `temperature_2m_max`, `temperature_2m_min`, `precipitation_probability_max`, `weather_code`.
4. **Fases da Lua:**
   * **Solução Nativa (Zero Latência):** Cálculo astronômico direto no código (algoritmo de ciclo sinódico lunar de $29.53$ dias). Evita depender de mais uma API externa e garante $100\%$ de precisão.

---

## 4. Fluxo de Experiência do Usuário (UX) e Layout Mobile-First

### Comportamento de Inicialização (On Load)
1. Ao abrir `https://clima.franklem.com`, o layout já apresenta os esqueletos de dimensões fixas (evitando *Layout Shift*) e solicita permissão via `navigator.geolocation.getCurrentPosition()`.
2. **Se permitido:** Captura latitude/longitude, utiliza geocodificação reversa para exibir o nome da cidade atual e carrega imediatamente o clima.
3. **Se negado ou em caso de falha:** Carrega uma localização padrão brasileira (ex: Ribeirão Preto - SP ou São Paulo - SP), mantendo o app sempre funcional e indexável pelo Googlebot (que não compartilha GPS).

### Estrutura Visual da Página (De cima para baixo)

```text
+---------------------------------------------------+
| [Header <header>] clima.franklem.com | Franklin   |
+---------------------------------------------------+
| [Card Principal <section aria-live="polite">]     |
| 📍 Ribeirão Preto, SP (Localização Atual)         |
| ☀️ 31°C (Sensação: 33°C) - Céu Limpo              |
|                                                   |
| [Grid de Indicadores Atuais (2x2 no Mobile)]      |
| 💧 Umidade: 28%         💨 Vento: 14 km/h         |
| 🧭 Pressão: 1012 hPa    ☔ Chuva: 10%             |
+---------------------------------------------------+
| [Banner Dinâmico de Saúde & Bem-Estar]            |
| ⚠️ Alerta de Baixa Umidade e Calor!               |
| "Beba bastante água hoje e evite exercícios ao    |
|  ar livre entre 10h e 16h."                       |
+---------------------------------------------------+
| [Barra de Pesquisa Inteligente <search>]          |
| [ 🔍 Digite a cidade ou CEP (Ex: 14000-000) ] [Ir]|
+---------------------------------------------------+
| [Previsão para os Próximos 7 Dias]                |
| Sex: ☀️ 19°C - 32°C | ☔ 5%                       |
| Sáb: ⛅ 20°C - 29°C | ☔ 30%                      |
| Dom: 🌧️ 18°C - 24°C | ☔ 80%                      |
| (... até 7 dias)                                  |
+---------------------------------------------------+
| [Card Astral: Fase da Lua Hoje]                   |
| 🌔 Lua Crescente (Iluminação: 68%)                |
+---------------------------------------------------+
| [Seção de Notícias - Iframe Integrado Lazy Load]  |
| 📰 Últimas Atualizações do Blog                   |
| +-----------------------------------------------+ |
| |        <iframe> blog.franklem.com </iframe>   | |
| +-----------------------------------------------+ |
+---------------------------------------------------+
| [Footer <footer>]                                 |
| Desenvolvido por Franklin Martins (franklem.com)  |
| Subdomínio oficial: clima.franklem.com            |
+---------------------------------------------------+
```

---

## 5. Diretrizes de SEO do Google (Google Search Central)

Para garantir máxima visibilidade orgânica de `https://clima.franklem.com` nas buscas por previsão do tempo no Brasil e fortalecer a autoridade do domínio principal de **Franklin Martins (`franklem.com`)**, a aplicação segue rigorosamente a documentação oficial do Google:

### 5.1. Meta Tags Essenciais e Indexação Mobile-First
O Google utiliza o **Mobile-First Indexing** por padrão. Portanto, todo o conteúdo principal, links estruturais e metadados estarão presentes na versão mobile:
* **Title Tag Otimizada ($50\text{–}60$ caracteres):** `ClimaBrasil | Previsão do Tempo 7 Dias por Cidade e CEP - Franklin Martins`
* **Meta Description ($140\text{–}160$ caracteres):** `Consulte em clima.franklem.com a previsão do tempo para 7 dias em qualquer cidade ou CEP do Brasil. Temperatura, chuva, umidade, saúde e lua por Franklin Martins.`
* **Canonical Tag (`rel="canonical"`):** Apontando explicitamente para `https://clima.franklem.com/`, evitando conteúdo duplicado quando parâmetros de busca (`?q=...`) são adicionados à URL.
* **Open Graph & WhatsApp Preview:** Configuração completa (`og:url="https://clima.franklem.com/"`, `og:title`, `og:description`, `og:type`, `og:locale="pt_BR"`) para geração de cards ricos no WhatsApp e redes sociais.

### 5.2. Dados Estruturados (Schema.org em JSON-LD)
Configurados com `@id` e `url` apontando para `https://clima.franklem.com/`:
* **`WebApplication` Schema:** Identifica `https://clima.franklem.com/` como um aplicativo web meteorológico gratuito voltado ao Brasil.
* **`Person` (Autoria explícita - E-E-A-T):** Vincula diretamente a criação da aplicação a **Franklin Martins**, conectando os três endereços do ecossistema (`https://franklem.com`, `https://blog.franklem.com` e `https://clima.franklem.com`).
* **`WebSite` + `SearchAction`:** Configura a URL de busca estruturada como `https://clima.franklem.com/?q={search_term_string}`.

### 5.3. Configuração de `robots.txt` e `sitemap.xml` para `clima.franklem.com`

#### Arquivo `https://clima.franklem.com/robots.txt`
Permite o rastreamento de todos os recursos visuais (CSS/JS) para que o Google renderize a página corretamente, bloqueando apenas rotas internas de API pura para economizar *Crawl Budget*:

```txt
User-agent: *
Allow: /
Disallow: /api/

# Sitemap oficial do subdomínio
Sitemap: https://clima.franklem.com/sitemap.xml
```

#### Arquivo `https://clima.franklem.com/sitemap.xml`
Servido pelo Node.js com cabeçalho `Content-Type: application/xml`, incluindo a raiz de `clima.franklem.com`, consultas estratégicas de cidades brasileiras e a interligação com `franklem.com` e `blog.franklem.com`:

```xml
<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>https://clima.franklem.com/</loc>
    <lastmod>2026-10-16</lastmod>
    <changefreq>hourly</changefreq>
    <priority>1.0</priority>
  </url>
  <url>
    <loc>https://clima.franklem.com/?q=Ribeirao+Preto</loc>
    <lastmod>2026-10-16</lastmod>
    <changefreq>daily</changefreq>
    <priority>0.8</priority>
  </url>
  <url>
    <loc>https://clima.franklem.com/?q=Sao+Paulo</loc>
    <lastmod>2026-10-16</lastmod>
    <changefreq>daily</changefreq>
    <priority>0.8</priority>
  </url>
  <url>
    <loc>https://clima.franklem.com/?q=Curitiba</loc>
    <lastmod>2026-10-16</lastmod>
    <changefreq>daily</changefreq>
    <priority>0.8</priority>
  </url>
  <url>
    <loc>https://clima.franklem.com/?q=Manaus</loc>
    <lastmod>2026-10-16</lastmod>
    <changefreq>daily</changefreq>
    <priority>0.8</priority>
  </url>
</urlset>
```

---

## 6. Otimização de Core Web Vitals (Métricas Oficiais do Google)

| Métrica | Meta do Google (Bom) | Estratégia de Implementação em `clima.franklem.com` |
| :--- | :--- | :--- |
| **LCP** (*Largest Contentful Paint*) | $\le 2.5\text{ segundos}$ | 1. Renderizar o bloco principal de clima imediatamente no HTML inicial sem bloquear a tela esperando o GPS.<br>2. Usar `<link rel="preconnect">` para as APIs (`api.open-meteo.com`, `brasilapi.com.br`) e para `blog.franklem.com`.<br>3. Leitura automática do parâmetro `?q=` na URL para carregamento direto. |
| **INP** (*Interaction to Next Paint*) | $\le 200\text{ milissegundos}$ | 1. Feedback visual imediato ($< 16\text{ ms}$) ao clicar em "Buscar" ou nos botões de teste rápido.<br>2. Uso de `AbortController` nas buscas para cancelar requisições antigas se o usuário digitar rápido.<br>3. Atualização limpa da URL via `history.replaceState` sem recarregar a página. |
| **CLS** (*Cumulative Layout Shift*) | $\le 0.1$ | 1. **Reserva de espaço estrita (`min-height`)** para o card principal e para as 7 linhas da previsão de 7 dias.<br>2. Altura fixa (`height="440"`) e contêiner travado para o `<iframe>` do `blog.franklem.com`. |

---

## 7. Motor de Regras: Dicas de Saúde Inteligentes

| Condição Climática | Regra de Disparo | Dica de Saúde Exibida |
| :--- | :--- | :--- |
| **Muito Seco (Alerta Laranja)** | Umidade $\le 30\%$ | *"Ar muito seco! Hidrate-se constantemente, umedeça ambientes e evite atividades físicas intensas ao ar livre entre 10h e 16h."* |
| **Calor Intenso** | Temperatura $\ge 31^\circ\text{C}$ | *"Dia muito quente! Beba muita água, use roupas leves, aplique protetor solar e busque locais arejados."* |
| **Frio Intenso** | Temperatura $\le 15^\circ\text{C}$ | *"Temperatura baixa! Agasalhe-se bem para evitar choques térmicos, proteja as extremidades e mantenha a hidratação."* |
| **Alta Chance de Chuva** | Prob. Chuva $\ge 60\%$ | *"Alta probabilidade de chuva hoje! Não esqueça o guarda-chuva ou capa e redobre a atenção em pistas molhadas."* |
| **Vento Forte** | Vento $\ge 35\text{ km/h}$ | *"Ventos fortes na região. Evite permanecer embaixo de árvores ou estruturas metálicas instáveis."* |
| **Clima Agradável (Padrão)** | Condições normais | *"Condições climáticas equilibradas! Excelente dia para atividades ao ar livre, mantendo sempre a hidratação."* |

---

## 8. Estrutura de Diretórios para Deploy na Hostinger (`clima.franklem.com`)

```text
clima.franklem.com/
├── package.json          # Dependências (express, compression, node-cache, cors)
├── app.js                # Entry point configurado no Phusion Passenger (hPanel)
├── public/               # Arquivos estáticos com Cache-Control otimizado
│   ├── index.html        # Interface Mobile-First + JSON-LD + Preconnects
│   ├── robots.txt        # https://clima.franklem.com/robots.txt
│   ├── sitemap.xml       # https://clima.franklem.com/sitemap.xml
│   └── manifest.json     # Web App Manifest para instalação no celular
└── src/
    ├── routes/
    │   ├── seo.js        # Rotas dinâmicas /sitemap.xml e /robots.txt
    │   └── weather.js    # Proxy de API com cache em memória (TTFB < 50ms)
    └── services/
        ├── brasilApi.js  # Resolução de CEP e validação Brasil
        └── openMeteo.js  # Coleta de dados de 7 dias
```