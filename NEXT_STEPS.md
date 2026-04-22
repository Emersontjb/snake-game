# O que falta (prioridades)

Data: 2026-04-22

## 1) Definir uma única versão do jogo (mais urgente)
Atualmente existem duas implementações em paralelo:
- `index.html` com lógica inline completa;
- `src/` com arquitetura modular.

**Falta decidir** qual será a fonte oficial (recomendado: modular em `src/`) e descontinuar a outra.

## 2) Conectar bootstrap oficial no `index.html`
Se a opção for modular, o `index.html` precisa carregar explicitamente `src/main.js` como entrypoint e remover dependências de handlers globais legados.

## 3) Criar validação automática mínima
Adicionar scripts de qualidade no `package.json` para evitar regressões, por exemplo:
- lint básico;
- smoke check de carregamento;
- checklist de compatibilidade mobile.

## 4) Fechar lacunas de release
Antes de release, ainda falta:
- pipeline simples de build;
- testes manuais padronizados (desktop + mobile);
- checklist visual para efeitos (transição, sombras, contraste, performance).

## 5) Alinhar documentação
Atualizar `README.md` para refletir exatamente o fluxo oficial de execução escolhido e remover instruções ambíguas.
