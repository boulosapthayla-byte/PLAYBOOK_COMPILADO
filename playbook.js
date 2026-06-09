document.addEventListener('DOMContentLoaded', () => {

    // 1. LÓGICA DO EXPANSÍVEL (COLLAPSIBLE)
    const triggers = document.querySelectorAll('.collapsible-trigger');
    triggers.forEach(trigger => {
        trigger.addEventListener('click', () => {
            const content = trigger.nextElementSibling;
            const isExpanded = trigger.getAttribute('aria-expanded') === 'true';
            trigger.setAttribute('aria-expanded', !isExpanded);
            content.classList.toggle('open');
        });
    });

    // 2. LÓGICA DOS QUESTIONÁRIOS TRADICIONAIS
    const btnSalvarT1 = document.getElementById('btn-salvar-resposta');
    if(btnSalvarT1) {
        btnSalvarT1.addEventListener('click', () => {
            const txt = document.getElementById('campo-resposta').value;
            localStorage.setItem('playbook_resposta_t1', txt);
            const msg = document.getElementById('mensagem-sucesso');
            msg.classList.add('visible');
            setTimeout(() => msg.classList.remove('visible'), 2500);
        });
        document.getElementById('campo-resposta').value = localStorage.getItem('playbook_resposta_t1') || '';
    }

    const btnSalvarT2 = document.getElementById('btn-salvar-resposta-t2');
    if(btnSalvarT2) {
        btnSalvarT2.addEventListener('click', () => {
            const txt = document.getElementById('campo-resposta-t2').value;
            localStorage.setItem('playbook_resposta_t2', txt);
            const msg = document.getElementById('mensagem-sucesso-t2');
            msg.classList.add('visible');
            setTimeout(() => msg.classList.remove('visible'), 2500);
        });
        document.getElementById('campo-resposta-t2').value = localStorage.getItem('playbook_resposta_t2') || '';
    }

    // 3. FLASHCARDS
    const wrappers = document.querySelectorAll('.flashcard-wrapper');
    wrappers.forEach((wrapper, index) => {
        const idCard = index + 1;
        const innerCard = wrapper.querySelector('.flashcard-card');
        const btnVirarList = wrapper.querySelectorAll('.btn-virar-card');
        const textarea = wrapper.querySelector(`#resposta-fc${idCard}`);
        const btnSalvar = wrapper.querySelector(`#btn-salvar-fc${idCard}`);
        const message = wrapper.querySelector(`#mensagem-sucesso-fc${idCard}`);
        const statusTxt = wrapper.querySelector(`#status-salvo-fc${idCard}`);
        const KEY = `flashcard_resposta_v${idCard}`;

        function atualizaStatusVisual(val) {
            if (statusTxt) {
                statusTxt.innerHTML = (val && val.trim() !== '') ? 
                    'Status: <span style="color: #00ff66; font-weight: 600;">Respondido ✓</span>' : 
                    'Status: <span style="color: rgba(255,255,255,0.4);">Pendente</span>';
            }
        }

        if (textarea) {
            const salvo = localStorage.getItem(KEY);
            if (salvo) { textarea.value = salvo; atualizaStatusVisual(salvo); }
        }

        btnVirarList.forEach(btn => {
            btn.addEventListener('click', (e) => { e.stopPropagation(); if (innerCard) innerCard.classList.toggle('flipped'); });
        });

        if (btnSalvar && textarea) {
            btnSalvar.addEventListener('click', (e) => {
                e.stopPropagation();
                localStorage.setItem(KEY, textarea.value);
                atualizaStatusVisual(textarea.value);
                if (message) { message.classList.add('visible'); setTimeout(() => { message.classList.remove('visible'); }, 2500); }
            });
        }
    });

    // 4. NAVEGAÇÃO TRILHA 3
    let paginaAtual = 1;
    const totalPaginas = 3;
    const paginas = document.querySelectorAll('.t3-pagina');
    const btnPrev = document.querySelector('.id-btn-prev');
    const btnNext = document.querySelector('.id-btn-next');
    const indicadorNum = document.querySelector('.num-pag-atual');

    function gerenciarNavegacaoTelas(novaPagina) {
        if (novaPagina < 1 || novaPagina > totalPaginas) return;
        paginaAtual = novaPagina;
        paginas.forEach(p => { p.classList.remove('active'); if (parseInt(p.getAttribute('data-page')) === paginaAtual) p.classList.add('active'); });
        if (indicadorNum) indicadorNum.textContent = paginaAtual;
        if (btnPrev) btnPrev.disabled = (paginaAtual === 1);
        if (btnNext) btnNext.disabled = (paginaAtual === totalPaginas);
    }
    if (btnPrev && btnNext) {
        btnPrev.addEventListener('click', () => gerenciarNavegacaoTelas(paginaAtual - 1));
        btnNext.addEventListener('click', () => gerenciarNavegacaoTelas(paginaAtual + 1));
    }

    // 5. NAVEGAÇÃO TRILHA 4
    let paginaAtualT4 = 1;
    const totalPaginasT4 = 7;
    const paginasT4 = document.querySelectorAll('.t4-pagina');
    const btnPrevT4 = document.querySelector('.t4-btn-prev');
    const btnNextT4 = document.querySelector('.t4-btn-next');
    const indicadorNumT4 = document.querySelector('.t4-txt-atual');

    function gerenciarNavegacaoT4(novaPagina) {
        if (novaPagina < 1 || novaPagina > totalPaginasT4) return;
        paginaAtualT4 = novaPagina;
        paginasT4.forEach(p => { p.classList.remove('active'); if (parseInt(p.getAttribute('data-page-index')) === paginaAtualT4) p.classList.add('active'); });
        if (indicadorNumT4) indicadorNumT4.textContent = paginaAtualT4;
        if (btnPrevT4) btnPrevT4.disabled = (paginaAtualT4 === 1);
        if (btnNextT4) btnNextT4.disabled = (paginaAtualT4 === totalPaginasT4);
    }
    if (btnPrevT4 && btnNextT4) {
        btnPrevT4.addEventListener('click', () => gerenciarNavegacaoT4(paginaAtualT4 - 1));
        btnNextT4.addEventListener('click', () => gerenciarNavegacaoT4(paginaAtualT4 + 1));
    }

  // 5.5. LÓGICA DE SALVAR E VALIDAR (TRILHA 4)
    document.querySelectorAll('.btn-salvar').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            
            const container = btn.closest('.conteudo-questionario');
            if (!container) return;

            const acao = btn.getAttribute('data-btn-acao') || '';
            const feedback = container.querySelector('.status-mensagem');
            if (!feedback) return;

            // Se for botão de salvar dissertativa (Páginas 2 e 4)
            if (acao.startsWith('salvar-t4')) {
                const textarea = container.querySelector('.resposta-textarea');
                if (!textarea) return;
                
                const idInput = textarea.getAttribute('data-input-id') || '';
                
                if (textarea.value.trim() !== "") {
                    localStorage.setItem(`playbook_${idInput}`, textarea.value);
                    feedback.textContent = "Resposta salva com sucesso!";
                    feedback.style.color = "#00ff66";
                    feedback.classList.add('visible'); // Ativa o efeito do CSS
                } else {
                    alert("Por favor, digite uma resposta antes de salvar.");
                    return;
                }
            } 
            // Se for o botão de validar múltipla escolha (Página 6)
            else if (acao.startsWith('validar-t4')) {
                const selecao = container.querySelector('input[name="pergunta_t4_objetiva"]:checked');
                
                if (!selecao) {
                    alert("Selecione uma opção antes de validar.");
                    return;
                } 
                
                if (selecao.value === "B") {
                    localStorage.setItem('playbook_t4_objetiva', selecao.value);
                    feedback.textContent = "Correto! Resposta salva.";
                    feedback.style.color = "#00ff66";
                } else {
                    feedback.textContent = "Incorreto. Tente novamente.";
                    feedback.style.color = "#ff4444";
                }
                feedback.classList.add('visible'); // Ativa o efeito do CSS
            }

            // Esconde a mensagem suavemente após 2.5 segundos
            setTimeout(() => { 
                feedback.classList.remove('visible');
            }, 2500);
        });
    });

    // 6. QUESTIONÁRIO MÚLTIPLA ESCOLHA (RESPOSTA NA C)
    const questoes = document.querySelectorAll('.questao-container');
    questoes.forEach(container => {
        const opcoes = container.querySelectorAll('.opcao');
        const feedback = container.querySelector('.feedback-msg');
        opcoes.forEach((opcao, index) => {
            opcao.addEventListener('click', () => {
                if (index === 2) { 
                    opcao.style.backgroundColor = '#00ff66';
                    if (feedback) { feedback.textContent = "Correto!"; feedback.style.color = "#00ff66"; }
                } else {
                    opcao.style.backgroundColor = '#ff4444';
                    if (feedback) { feedback.textContent = "Incorreto, tente novamente."; feedback.style.color = "#ff4444"; }
                }
            });
        });
    });

});
