# 🌤️ ClimaBrasil (`clima.franklem.com`)

[![Website Status](https://img.shields.io/badge/Website-clima.franklem.com-22d3ee?style=for-the-badge&logo=googlechrome&logoColor=0f172a)](https://clima.franklem.com)
[![Node.js](https://img.shields.io/badge/Node.js-LTS-339933?style=for-the-badge&logo=nodedotjs&logoColor=white)](https://nodejs.org/)
[![Express.js](https://img.shields.io/badge/Express.js-4.x-000000?style=for-the-badge&logo=express&logoColor=white)](https://expressjs.com/)
[![Core Web Vitals](https://img.shields.io/badge/Core_Web_Vitals-Otimizado-10b981?style=for-the-badge&logo=lighthouse&logoColor=white)](https://clima.franklem.com)
[![Autor](https://img.shields.io/badge/Autor-Franklin_Martins-3b82f6?style=for-the-badge)](https://franklem.com)

Aplicação web **Mobile-First** de previsão do tempo exclusiva para o território brasileiro, desenvolvida em **Node.js (Express)** e otimizada para máxima performance nos **Google Core Web Vitals (LCP, INP e CLS)** e **SEO Técnico (Google Search Central)**.

🔗 **Acesse em produção:** [https://clima.franklem.com](https://clima.franklem.com)  
📦 **Repositório Oficial:** [https://github.com/franklinlem/clima-brasil](https://github.com/franklinlem/clima-brasil)

---

## ✨ Funcionalidades Principais

* 📍 **Clima do Local Atual (Geolocalização Automática):** Detecta automaticamente a posição do usuário ao abrir a página (com *fallback* instantâneo para carregamento sem bloqueio de LCP).
* 🔍 **Busca Inteligente por Cidade ou CEP (Apenas Brasil):**
  * **Por CEP (8 dígitos):** Consulta direta na **BrasilAPI v2** retornando bairro, cidade, UF e coordenadas geográficas.
  * **Por Nome da Cidade:** Geocodificação restrita ao Brasil (`countryCode=BR`) via **Open-Meteo Geocoding API**.
* 🌡️ **Indicadores Meteorológicos Completos:**
  * Temperatura atual ($^\circ\text{C}$) e Sensação Térmica;
  * Umidade relativa do ar ($\%$);
  * Probabilidade de chuva diária ($\%$);
  * Velocidade do vento ($\text{km/h}$);
  * Pressão atmosférica superficial ($\text{hPa}$).
* 📅 **Previsão para os Próximos 7 Dias:** Temperaturas mínimas, máximas, condição climática (WMO Code) e probabilidade de chuva diária.
* 🩺 **Motor de Dicas de Saúde & Bem-Estar:** Recomendações dinâmicas geradas em tempo real conforme faixas de temperatura, baixa umidade do ar ($\le 30\%$), ventos fortes ou alta probabilidade de chuva.
* 🌔 **Astronomia Nativa (Fases da Lua):** Cálculo astronômico local do ciclo sinódico lunar ($29.53$ dias) e percentual de iluminação do disco lunar sem latência de API externa.
* 📲 **Compartilhamento Rápido no WhatsApp:** Geração automática de boletim meteorológico resumido + dica de saúde com link parametrizado (`https://clima.franklem.com/?q=Cidade`).
* 📰 **Integração com Portal de Notícias:** Carregamento diferido (*IntersectionObserver*) do portal [blog.franklem.com](https://blog.franklem.com) via `<iframe>` sem impactar o carregamento inicial no celular.

---

## 🚀 Performance, SEO & Core Web Vitals

O projeto foi arquitetado seguindo rigorosamente a documentação do **Google Search Central** para atingir notas entre **95 e 100** tanto no Desktop quanto no Mobile:

1. **Zero Render-Blocking Resources:** CSS crítico puro embutido diretamente no documento (`<style>`) e ícones em **SVG inline**, eliminando requisições bloqueantes de folhas de estilo ou fontes externas.
2. **SSR Leve em Memória (`app.js`):** O template HTML é mantido em buffer na memória RAM pelo Node.js ($\text{TTFB} < 5\text{ ms}$) e injeta dinamicamente `<title>`, `<meta name="description">` e `<link rel="canonical">` para URLs parametrizadas (`/?q=Curitiba`), sem redirecionamentos.
3. **Cumulative Layout Shift ($\text{CLS} \le 0.05$):** Alturas mínimas reservadas (`min-height`) para o card principal, métricas, dicas de saúde e as 7 linhas da previsão semanal.
4. **Dados Estruturados (`Schema.org` JSON-LD):** Grafo completo com `WebApplication`, `WebSite` (`SearchAction`) e `Person` vinculando a autoria a **Franklin Martins**.
5. **Compressão & Cache HTTP:** Compressão Gzip/Brotli ativa via middleware `compression` e políticas `Cache-Control` otimizadas (`stale-while-revalidate` para documento e `max-age=31536000, immutable` para estáticos).

---

## 🛠️ Stack Tecnológica e APIs Utilizadas

* **Backend:** Node.js (LTS v20/v22), Express.js, `compression`, `cors`, `node-cache`.
* **Frontend:** HTML5 Semântico, CSS3 Moderno (Custom Properties, Grid/Flexbox, Glassmorphism), Vanilla JavaScript (ES6+ com `AbortController` e `IntersectionObserver`).
* **APIs Públicas (Gratuitas e Sem Chave):**
  * [Open-Meteo Forecast API](https://open-meteo.com/) — Dados meteorológicos atuais e previsão de 7 dias.
  * [Open-Meteo Geocoding API](https://open-meteo.com/en/docs/geocoding-api) — Busca de municípios brasileiros (`countryCode=BR`).
  * [BrasilAPI CEP v2](https://brasilapi.com.br/) — Consulta de CEPs brasileiros e coordenadas.
  * [BigDataCloud Reverse Geocoding](https://www.bigdatacloud.com/) — Conversão das coordenadas GPS do navegador em nome da cidade/UF.

---

## 📂 Estrutura de Arquivos do Projeto

```text
clima-brasil/
├── app.js                            # Servidor Node.js/Express (SSR de Meta Tags, Compressão e Cache)
├── package.json                      # Dependências e scripts de inicialização
├── planejamento_clima_franklin.md    # Documentação de arquitetura, regras de negócio e SEO
├── .gitignore                        # Arquivos ignorados pelo Git (node_modules, .env, logs)
├── README.md                         # Documentação principal do repositório
└── public/                           # Arquivos públicos e de indexação
    ├── index.html                    # Interface Mobile-First ultra-otimizada + JSON-LD + SVGs inline
    ├── robots.txt                    # Diretrizes de rastreamento para Googlebot
    └── sitemap.xml                   # Mapa de URLs oficial de clima.franklem.com
```

---

## 💻 Como Executar Localmente

### Pré-requisitos
* **Node.js** (versão 18.x, 20.x ou superior)
* **npm** (instalado junto com o Node.js)

### Passo a Passo

```bash
# 1. Clone o repositório privado
git clone https://github.com/franklinlem/clima-brasil.git

# 2. Acesse a pasta do projeto
cd clima-brasil

# 3. Instale as dependências
npm install

# 4. Inicie o servidor local
npm start
```

O servidor estará disponível em: **`http://localhost:3000`**  
Você também pode testar a injeção dinâmica de SEO acessando: **`http://localhost:3000/?q=Ribeirao+Preto`**

---

## ☁️ Deploy na Hostinger (Plano Business - Node.js Web Apps)

1. Acesse o painel **hPanel** da Hostinger e certifique-se de que o subdomínio **`clima.franklem.com`** está criado e com SSL (**HTTPS**) ativo.
2. Envie os arquivos do repositório (ou conecte diretamente via integração Git do hPanel ao repositório `franklinlem/clima-brasil`).
3. No menu **Avançado > Node.js**:
   * **Versão do Node.js:** `20.x` (ou superior)
   * **Modo da aplicação:** `Production`
   * **Raiz da aplicação:** diretório correspondente a `clima.franklem.com`
   * **Arquivo de inicialização da aplicação:** `app.js`
4. Clique em **NPM Install** (caso envie via gerenciador de arquivos) e em **Reiniciar Aplicação**.

---

## 👨‍💻 Autor e Ecossistema

Desenvolvido por **Franklin Martins**. Conheça mais conteúdos e projetos oficiais:

* 🌐 **Página Pessoal & Portfólio:** [https://franklem.com](https://franklem.com)
* 📰 **Portal de Notícias & Blog:** [https://blog.franklem.com](https://blog.franklem.com)
* ☀️ **ClimaBrasil Web App:** [https://clima.franklem.com](https://clima.franklem.com)
* 🐙 **GitHub:** [@franklinlem](https://github.com/franklinlem)

---

## 📄 Licença

Este projeto está sob a licença **MIT**. Desenvolvido por [Franklin Martins](https://franklem.com).
