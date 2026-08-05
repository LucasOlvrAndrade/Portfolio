# Portfólio — Lucas Andrade

Site portfólio pessoal que lista os repositórios do GitHub automaticamente
via API. Projeto novo no GitHub aparece no site sozinho, sem editar código.

**Stack:** Next.js 16 (App Router) · TypeScript · Tailwind CSS v4 · Vercel

---

## Como rodar local

Requisitos: **Node.js 20+** e npm.

```bash
# 1. instalar dependências
npm install

# 2. criar o arquivo de variáveis de ambiente
cp .env.example .env.local

# 3. subir o servidor de desenvolvimento
npm run dev
```

Abra <http://localhost:3000>.

O site **funciona sem nenhuma configuração adicional** — o `.env.example` já
vem com o username preenchido e o token é opcional.

### Scripts

| Comando         | O que faz                                   |
| --------------- | ------------------------------------------- |
| `npm run dev`   | Servidor de desenvolvimento com hot reload  |
| `npm run build` | Build de produção                           |
| `npm start`     | Sobe o build de produção localmente         |
| `npm run lint`  | ESLint                                      |

---

## Variáveis de ambiente

### `NEXT_PUBLIC_GITHUB_USER` (obrigatória)

Username do GitHub que alimenta o site. É público por natureza.

```
NEXT_PUBLIC_GITHUB_USER=LucasOlvrAndrade
```

### `GITHUB_TOKEN` (opcional)

Personal Access Token. **O site funciona sem ele.** Serve só para elevar o
rate limit da API do GitHub de **60 req/h por IP** para **5.000 req/h**.

Por que isso importa em produção: a Vercel roda o build a partir de IPs
compartilhados com outros projetos. Sem token, o limite de 60 req/h é
disputado com terceiros e pode estourar. Com token, o limite é seu.

> [!IMPORTANT]
> Esta variável **não** tem o prefixo `NEXT_PUBLIC_`. Isso é intencional:
> ela só existe no servidor e nunca entra no JavaScript enviado ao
> navegador. **Nunca renomeie para `NEXT_PUBLIC_GITHUB_TOKEN`** — isso
> publicaria o token para qualquer visitante do site.

**Como gerar (escopo mínimo):**

1. <https://github.com/settings/personal-access-tokens/new>
2. Name: `portfolio-site-readonly` · Expiration: 90 dias
3. Repository access: **Public Repositories (read-only)**
4. Permissions: **não marque nada** — os dados consumidos são todos públicos
5. Generate token e copie (o GitHub mostra o valor uma única vez)

Cole em `.env.local`:

```
GITHUB_TOKEN=github_pat_...
```

O `.gitignore` ignora todo `.env*`, então esse arquivo nunca é commitado.

---

## Deploy na Vercel — passo a passo

### 1. Subir o código para o GitHub

```bash
git init
git add .
git commit -m "Portfólio pessoal com integração à API do GitHub"
git branch -M main
git remote add origin https://github.com/LucasOlvrAndrade/portfolio.git
git push -u origin main
```

Crie o repositório `portfolio` em <https://github.com/new> antes do `push`.

> Confira que `.env.local` **não** aparece em `git status`. Se aparecer,
> pare e verifique o `.gitignore` antes de commitar.

### 2. Importar na Vercel

1. Acesse <https://vercel.com/new>
2. Entre com a conta do GitHub e autorize o acesso
3. Selecione o repositório `portfolio` → **Import**
4. A Vercel detecta Next.js sozinha — não mude nenhuma configuração de build

### 3. Configurar as variáveis de ambiente

Ainda na tela de import, abra **Environment Variables** e adicione:

| Name                      | Value              | Environments        |
| ------------------------- | ------------------ | ------------------- |
| `NEXT_PUBLIC_GITHUB_USER` | `LucasOlvrAndrade` | Production, Preview |
| `GITHUB_TOKEN`            | *(seu token)*      | Production, Preview |

### 4. Deploy

Clique em **Deploy** e aguarde ~1 minuto. O site sobe em
`portfolio-<hash>.vercel.app`.

### 5. Ajustar o domínio

1. **Settings → Domains** → edite para `lucasolvrandrade.vercel.app`
2. Atualize `url` em `src/config/site.ts` para o domínio final —
   ele alimenta as tags canônicas e de Open Graph
3. Commit e push (a Vercel redeploya sozinha)

### Deploys seguintes

Todo `git push` na branch `main` dispara um deploy automático.

---

## Manutenção

### Adicionar um projeto novo

Não faz nada. Crie o repositório no GitHub e ele aparece no site na próxima
revalidação (até 1 hora).

### Melhorar como um projeto aparece

Tudo vem da API — edite no próprio GitHub, não no código:

- **Descrição do card** → repositório → ⚙️ ao lado de *About* → *Description*
- **Link "Ver projeto no ar"** → mesmo lugar, campo *Website*
- **Rótulo quando não há linguagem detectada** → campo *Topics*

### `src/config/site.ts`

Único arquivo de configuração manual:

| Campo      | Para quê                                              |
| ---------- | ----------------------------------------------------- |
| `featured` | Repos em destaque — card largo, sempre no topo        |
| `hidden`   | Repos a ocultar (forks e arquivados já saem sozinhos) |
| `skills`   | Seção "Tecnologias"                                   |
| `contact`  | Email, LinkedIn, Instagram                            |
| `role`     | Linha acima do nome no Hero                           |
| `url`      | Domínio final, usado no SEO                           |

Exemplo — destacar dois projetos:

```ts
featured: ["Calculadora-java", "github-page"],
```

---

## Como funciona

### Busca de dados

Tudo acontece **no servidor**, em `src/lib/github.ts`:

| Endpoint                    | Alimenta                     |
| --------------------------- | ---------------------------- |
| `/users/{user}`             | Hero, bio, avatar, localização|
| `/users/{user}/repos`       | Cards de projeto             |
| `/repos/{user}/{user}/readme` | Seção "Sobre"              |

Todos são endpoints **públicos** — nenhum exige autenticação.

O arquivo é marcado com `import "server-only"`: se algum componente cliente
tentar importá-lo, o build falha em vez de vazar o token para o bundle.

### Cache

A página usa ISR com `revalidate = 3600`. O HTML é pré-renderizado e
reconstruído no máximo 1x por hora — a API do GitHub é chamada uma vez por
hora **no total**, não uma vez por visitante. Isso mantém o site rápido e
longe do rate limit.

### Tratamento de erro

Erros da API são tratados como valores (`Result<T>`), não exceções. Se a API
cair ou estourar o limite, a seção de Projetos mostra um aviso explicando o
que houve e um link direto para o GitHub — o resto da página segue normal.

### Tema claro/escuro

Um script inline no `<head>` aplica o tema antes da primeira pintura, então
não há flash de tema errado. Sem escolha manual salva, o site segue a
preferência do sistema. A escolha do toggle persiste em `localStorage`.

---

## Estrutura

```
src/
├── app/
│   ├── layout.tsx           Metadata, SEO, fontes, script de tema
│   ├── page.tsx             Composição das seções
│   ├── globals.css          Paleta e animações
│   ├── icon.tsx             Favicon gerado
│   └── opengraph-image.tsx  Imagem de compartilhamento
├── components/
│   ├── sections/            Hero · About · Projects · Skills · Contact
│   └── ui/                  Header · Footer · RepoCard · ThemeToggle · …
├── config/
│   └── site.ts              ← configuração manual
└── lib/
    ├── github.ts            Cliente da API (server-only)
    ├── languages.ts         Cores oficiais das linguagens
    ├── readme.ts            Extrai prosa do README de perfil
    └── types.ts
```

---

## Acessibilidade

- Contraste WCAG AA nos dois temas. Inclui o texto branco sobre o gradiente
  do botão "Ver todos no GitHub": todas as paradas do gradiente ficam em
  **5,36:1 ou mais**, tanto em repouso quanto no hover
- Navegação completa por teclado, com foco sempre visível
- Link "pular para o conteúdo"
- HTML semântico, `aria-label` nos controles, `alt` nas imagens
- Animações desligadas sob `prefers-reduced-motion` — inclui o spotlight dos
  cards de projeto, que também não roda em telas sem cursor

> [!WARNING]
> As variantes `default` e `variant` do `GradientButton` vieram do componente
> de origem e **reprovam em AA** com o texto branco — 3,22:1 e 1,07:1 nas
> piores paradas. Ficam no `globals.css` comentadas como referência; o site
> usa apenas `variant="brand"`. Se for reutilizar as outras, troque a cor do
> texto antes.
