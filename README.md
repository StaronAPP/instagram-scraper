# Instagram Profile Scraper (Puppeteer)

Este projeto roda um servidor Express com Puppeteer que acessa um perfil público do Instagram e retorna o link da imagem de perfil em alta resolução.

### Como usar

1. Suba este projeto no GitHub.
2. Crie uma conta gratuita em https://railway.app
3. Conecte o repositório e clique em "Deploy".
4. Acesse a API com:
   ```
   https://seuapp.up.railway.app/?username=neymarjr
   ```

### Resposta

```json
{
  "image": "https://instagram.fxyz.net/..."
}
```