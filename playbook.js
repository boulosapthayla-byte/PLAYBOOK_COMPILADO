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
    // Playbook Trilha 1
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

    // Playbook Trilha 2
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


    // 3. LÓGICA DE INTERAÇÃO E SALVAMENTO DE CADA FLASHCARD INDIVIDUAL
    const wrappers = document.querySelectorAll('.flashcard-wrapper');

    wrappers.forEach((wrapper, index) => {
        const idCard = index + 1; // Sequência dinâmica: fc1, fc2, fc3, fc4, fc5...
        const innerCard = wrapper.querySelector('.flashcard-card');
        const btnVirarList = wrapper.querySelectorAll('.btn-virar-card');
        
        // Seleção estrita por ID para garantir o isolamento total dos campos
        const textarea = wrapper.querySelector(`#resposta-fc${idCard}`);
        const btnSalvar = wrapper.querySelector(`#btn-salvar-fc${idCard}`);
        const message = wrapper.querySelector(`#mensagem-sucesso-fc${idCard}`);
        const statusTxt = wrapper.querySelector(`#status-salvo-fc${idCard}`);
        
        const KEY = `flashcard_resposta_v${idCard}`;

        function atualizaStatusVisual(val) {
            if (statusTxt) {
                if (val && val.trim() !== '') {
                    statusTxt.innerHTML = 'Status: <span style="color: #00ff66; font-weight: 600;">Respondido ✓</span>';
                } else {
                    statusTxt.innerHTML = 'Status: <span style="color: rgba(255,255,255,0.4);">Pendente</span>';
                }
            }
        }

        // Recupera e injeta o dado salvo específico deste ID
        if (textarea) {
            const salvo = localStorage.getItem(KEY);
            if (salvo) {
                textarea.value = salvo;
                atualizaStatusVisual(salvo);
            }
        }

        // Vira o card de forma isolada
        btnVirarList.forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation(); 
                if (innerCard) innerCard.classList.toggle('flipped');
            });
        });

        // Salva a resposta de forma isolada usando a chave única (KEY)
        if (btnSalvar && textarea) {
            btnSalvar.addEventListener('click', (e) => {
                e.stopPropagation();
                
                // Grava o valor exato digitado no LocalStorage
                localStorage.setItem(KEY, textarea.value);
                atualizaStatusVisual(textarea.value);
                
                if (message) {
                    message.classList.add('visible');
                    setTimeout(() => { message.classList.remove('visible'); }, 2500);
                }
            });
        }
    });


    // 4. LÓGICA DE NAVEGAÇÃO POR SETAS (TRILHA 3)
    let paginaAtual = 1;
    const totalPaginas = 3;
    
    const paginas = document.querySelectorAll('.t3-pagina');
    const btnPrev = document.querySelector('.id-btn-prev');
    const btnNext = document.querySelector('.id-btn-next');
    const indicadorNum = document.querySelector('.num-pag-atual');

    function gerenciarNavegacaoTelas(novaPagina) {
        if (novaPagina < 1 || novaPagina > totalPaginas) return;
        
        paginaAtual = novaPagina;

        paginas.forEach(p => {
            p.classList.remove('active');
            if (parseInt(p.getAttribute('data-page')) === paginaAtual) {
                p.classList.add('active');
            }
        });

        if (indicadorNum) indicadorNum.textContent = paginaAtual;
        if (btnPrev) btnPrev.disabled = (paginaAtual === 1);
        if (btnNext) btnNext.disabled = (paginaAtual === totalPaginas);
    }

    if (btnPrev && btnNext) {
        btnPrev.addEventListener('click', () => gerenciarNavegacaoTelas(paginaAtual - 1));
        btnNext.addEventListener('click', () => gerenciarNavegacaoTelas(paginaAtual + 1));
    }
});
