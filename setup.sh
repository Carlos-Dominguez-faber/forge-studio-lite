#!/usr/bin/env bash
# forge-studio-lite — setup. Idempotente: seguro re-correr.
set -euo pipefail
REPO_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$REPO_DIR"

bold(){ printf '\033[1m%s\033[0m\n' "$*"; }
info(){ printf '\033[34m▸\033[0m %s\n' "$*"; }
ok(){   printf '\033[32m✓\033[0m %s\n' "$*"; }
warn(){ printf '\033[33m!\033[0m %s\n' "$*"; }
fail(){ printf '\033[31m✗\033[0m %s\n' "$*" >&2; exit 1; }

bold "forge-studio-lite — setup"

# 1. Node >= 18 (necesita fetch global + --env-file)
command -v node >/dev/null 2>&1 || fail "Node.js no encontrado. Instala Node 18+ desde https://nodejs.org"
NODE_MAJOR="$(node -p 'process.versions.node.split(".")[0]')"
[ "$NODE_MAJOR" -ge 18 ] || fail "Node $NODE_MAJOR encontrado; se necesita >= 18."
ok "Node $(node -v)"

# 2. Dependencias
info "Instalando dependencias npm…"
npm install
ok "Dependencias instaladas"

# 3. Playwright Chromium (el único navegador que el renderer necesita)
info "Instalando Playwright Chromium…"
npx playwright install chromium
ok "Chromium listo"
warn "Si el launch falla en Linux, corre: npx playwright install-deps chromium"

# 4. .env (tsx --env-file=.env requiere que el archivo exista)
if [ -f .env ]; then
  ok ".env ya existe (no se toca)"
else
  cp .env.example .env
  ok "Creado .env desde .env.example (todas las keys son opcionales)"
fi

# 5. Próximos pasos
bold "Listo. Pruébalo:"
cat <<'EOF'
  npm run carrusel -- examples/carousel-typographic
  # → PNGs en examples/carousel-typographic/slides/slide-NN.png (1080×1080)

  Personaliza brand/brand.json + brand/voice.json + brand/brand.css,
  y luego pídele a Claude Code:  /carrusel <tu tema>
  La variante (c) stock necesita una key gratis de Pexels/Unsplash en .env.
EOF
