document.addEventListener("DOMContentLoaded", () => {
    
    // 1. MEMÓRIA LOCAL DE QUESTÕES
    let questoesMatrix = JSON.parse(localStorage.getItem("playbook_questions")) || [];

    // 2. ELEMENTOS DA TELA
    const btnTabFabrica = document.getElementById("tab-fabrica");
    const btnTabMatriz = document.getElementById("tab-matriz");
    const btnTabConfig = document.getElementById("tab-config");
    
    const secFabrica = document.getElementById("section-fabrica");
    const secMatriz = document.getElementById("section-matriz");
    const secConfig = document.getElementById("section-config");
    
    const formConteudo = document.getElementById("form-conteudo");
    const txtPergunta = document.getElementById("txt-pergunta");
    const txtResposta = document.getElementById("txt-resposta");
    
    const matrixTbody = document.getElementById("matrix-tbody");
    const matrixCounter = document.getElementById("matrix-counter");
    
    const inputImportar = document.getElementById("input-importar");
    const btnSincronizarGithub = document.getElementById("btn-sincronizar-github");
    
    const cfgUsuario = document.getElementById("cfg-usuario");
    const cfgRepositorio = document.getElementById("cfg-repositorio");
    const cfgArquivo = document.getElementById("cfg-arquivo");
    const cfgToken = document.getElementById("cfg-token");
    const btnSalvarConfig = document.getElementById("btn-salvar-config");

    // Inicializa carregando os inputs salvos do GitHub
    carregarConfiguracoes();

    // 3. ALTERNADOR DE ABAS
    btnTabFabrica.addEventListener("click", () => alternarAba("fabrica"));
    btnTabMatriz.addEventListener("click", () => alternarAba("matriz"));
    btnTabConfig.addEventListener("click", () => alternarAba("config"));

    function alternarAba(abaAlvo) {
        btnTabFabrica.classList.remove("active");
        btnTabMatriz.classList.remove("active");
        btnTabConfig.classList.remove("active");
        secFabrica.classList.remove("active");
        secMatriz.classList.remove("active");
        secConfig.classList.remove("active");

        if (abaAlvo === "fabrica") {
            btnTabFabrica.classList.add("active");
            secFabrica.classList.add("active");
        } else if (abaAlvo === "matriz") {
            btnTabMatriz.classList.add("active");
            secMatriz.classList.add("active");
            renderizarGradeMatriz();
        } else {
            btnTabConfig.classList.add("active");
            secConfig.classList.add("active");
        }
    }

    // 4. SALVAR PERGUNTA (MANUAL)
    formConteudo.addEventListener("submit", (e) => {
        e.preventDefault();
        const novaQuestao = {
            id: questoesMatrix.length + 1,
            pergunta: txtPergunta.value.trim(),
            resposta: txtResposta.value.trim()
        };
        questoesMatrix.push(novaQuestao);
        localStorage.setItem("playbook_questions", JSON.stringify(questoesMatrix));
        formConteudo.reset();
        alert("Salvo localmente com sucesso!");
        alternarAba("matriz");
    });

    // 5. IMPORTAR JSON EXTERNO PARA A MATRIZ
    inputImportar.addEventListener("change", (e) => {
        const arquivo = e.target.files[0];
        if (!arquivo) return;

        const leitor = new FileReader();
        leitor.onload = (evento) => {
            try {
                const dados = JSON.parse(evento.target.result);
                if (Array.isArray(dados)) {
                    questoesMatrix = dados.map((item, i) => ({
                        id: i + 1,
                        pergunta: item.pergunta || "",
                        resposta: item.resposta || ""
                    }));
                    localStorage.setItem("playbook_questions", JSON.stringify(questoesMatrix));
                    renderizarGradeMatriz();
                    alert("JSON carregado na Matriz!");
                } else {
                    alert("Formato inválido. O arquivo JSON deve ser uma lista [].");
                }
            } catch (err) {
                alert("Erro ao ler o arquivo JSON.");
            }
        };
        leitor.readAsText(arquivo);
        inputImportar.value = ""; 
    });

    // 6. CONSTRUIR E EXIBIR A MATRIZ (COM EXPANSÃO)
    function renderizarGradeMatriz() {
        matrixTbody.innerHTML = "";
        matrixCounter.textContent = `${questoesMatrix.length} itens salvos`;

        if (questoesMatrix.length === 0) {
            matrixTbody.innerHTML = `<tr><td colspan="3" style="text-align: center; padding: 2rem; color: var(--texto-secundario);">Grade vazia. Adicione ou importe perguntas.</td></tr>`;
            return;
        }

        questoesMatrix.forEach((item, index) => {
            const idLinha = `resp-${index}`;
            const trPergunta = document.createElement("tr");
            trPergunta.className = "row-pergunta";
            trPergunta.setAttribute("data-target", idLinha);
            trPergunta.innerHTML = `
                <td><div class="id-cell"><span class="setinha">▶</span>#${index + 1}</div></td>
                <td>${escaparHTML(item.pergunta)}</td>
                <td class="actions-cell"><button class="btn-danger btn-delete" data-index="${index}" type="button">Excluir</button></td>
            `;

            const trResposta = document.createElement("tr");
            trResposta.className = "row-resposta";
            trResposta.id = idLinha;
            trResposta.innerHTML = `<td></td><td colspan="2"><div class="resposta-box">${escaparHTML(item.resposta)}</div></td>`;

            matrixTbody.appendChild(trPergunta);
            matrixTbody.appendChild(trResposta);
        });

        configurarCliquesMatriz();
    }

    function escaparHTML(texto) {
        return texto.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
    }

    function configurarCliquesMatriz() {
        // Expandir / Encolher a resposta ao clicar na linha
        document.querySelectorAll(".row-pergunta").forEach(linha => {
            linha.addEventListener("click", (e) => {
                if (e.target.classList.contains("btn-delete")) return;
                const targetId = alignment = linha.getAttribute("data-target");
                const linhaResposta = document.getElementById(targetId);
                linha.classList.toggle("aberta");
                linhaResposta.classList.toggle("aberta");
            });
        });

        // Apagar pergunta individualmente
        document.querySelectorAll(".btn-delete").forEach(botao => {
            botao.addEventListener("click", (e) => {
                const idx = parseInt(e.target.getAttribute("data-index"));
                if (confirm("Apagar permanentemente este item?")) {
                    questoesMatrix.splice(idx, 1);
                    questoesMatrix = questoesMatrix.map((item, i) => ({ ...item, id: i + 1 }));
                    localStorage.setItem("playbook_questions", JSON.stringify(questoesMatrix));
                    renderizarGradeMatriz();
                }
            });
        });
    }

    // 7. GRAVAR CONFIGURAÇÕES DO GITHUB
    btnSalvarConfig.addEventListener("click", () => {
        const configs = {
            usuario: cfgUsuario.value.trim(),
            repositorio: cfgRepositorio.value.trim(),
            arquivo: cfgArquivo.value.trim(),
            token: cfgToken.value.trim()
        };
        localStorage.setItem("matrix_github_cfg", JSON.stringify(configs));
        alert("Configurações salvas!");
        alternarAba("matriz");
    });

    function carregarConfiguracoes() {
        const configs = JSON.parse(localStorage.getItem("matrix_github_cfg"));
        if (configs) {
            cfgUsuario.value = configs.usuario || "";
            cfgRepositorio.value = configs.repositorio || "";
            cfgArquivo.value = configs.arquivo || "questoes_playbook.json";
            cfgToken.value = configs.token || "";
        }
    }

   // 8. EXPORTAR / SUBIR PARA O GITHUB
    btnSincronizarGithub.addEventListener("click", async () => {
        const configs = JSON.parse(localStorage.getItem("matrix_github_cfg"));
        if (!configs || !configs.usuario || !configs.repositorio || !configs.token || !configs.arquivo) {
            alert("Configure os dados da conexão na aba 3 primeiro!");
            alternarAba("config");
            return;
        }

        if (questoesMatrix.length === 0) return alert("A Matrix está vazia localmente para subir!");

        btnSincronizarGithub.textContent = "Sincronizando...";
        btnSincronizarGithub.disabled = true;

        const urlAPI = `https://api.github.com/repos/${configs.usuario}/${configs.repositorio}/contents/${configs.arquivo}`;
        const conteudoJSON = JSON.stringify(questoesMatrix, null, 2);
        const conteudoBase64 = btoa(unescape(encodeURIComponent(conteudoJSON)));

        try {
            let sha = null;

            // Tenta ver se o arquivo já existe para coletar o SHA (Substituição)
            const checagem = await fetch(urlAPI, {
                method: "GET",
                headers: { "Authorization": `token ${configs.token}` }
            });

            if (checagem.status === 200) {
                const dadosArquivo = await checagem.json();
                sha = dadosArquivo.sha; 
            }

            // Faz o commit de criação ou substituição
            const corpoCommit = {
                message: `Update via Matrix Generator: ${configs.arquivo}`,
                content: conteudoBase64
            };
            if (sha) corpoCommit.sha = sha;

            const resposta = await fetch(urlAPI, {
                method: "PUT",
                headers: {
                    "Authorization": `token ${configs.token}`,
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(corpoCommit)
            });

            if (resposta.status === 200 || resposta.status === 201) {
                alert(`Salvo com sucesso! Arquivo '${configs.arquivo}' sincronizado no GitHub.`);
            } else {
                const erro = await resposta.json();
                alert(`Erro no GitHub: ${erro.message}`);
            }

        } catch (err) {
            alert("Erro de rede ao conectar com o GitHub.");
        } finally {
            btnSincronizarGithub.textContent = "Subir pro GitHub";
            btnSincronizarGithub.disabled = false;
        }
    });

    // 9. NOVO: IMPORTAR / BAIXAR AUTOMATICAMENTE DO GITHUB
    const btnPuxarGit = document.getElementById("btn-puxar-git");
    if (btnPuxarGit) {
        btnPuxarGit.addEventListener("click", async () => {
            const configs = JSON.parse(localStorage.getItem("matrix_github_cfg"));
            if (!configs || !configs.usuario || !configs.repositorio || !configs.token || !configs.arquivo) {
                alert("Configure os dados da conexão na aba 3 primeiro!");
                alternarAba("config");
                return;
            }

            btnPuxarGit.textContent = "Baixando...";
            btnPuxarGit.disabled = true;

            const urlAPI = `https://api.github.com/repos/${configs.usuario}/${configs.repositorio}/contents/${configs.arquivo}`;

            try {
                const resposta = await fetch(urlAPI, {
                    method: "GET",
                    headers: { 
                        "Authorization": `token ${configs.token}`,
                        "Accept": "application/vnd.github.v3+json"
                    }
                });

                if (resposta.status === 404) {
                    alert(`O arquivo '${configs.arquivo}' não foi encontrado no repositório. Certifique-se de preencher o nome correto ou subir um arquivo primeiro.`);
                    return;
                }

                if (!resposta.ok) {
                    throw new Error(`Erro: ${resposta.statusText}`);
                }

                const dadosArquivo = await resposta.json();
                // Decodifica a string em Base64 vinda do GitHub tratando caracteres especiais
                const conteudoDecodificado = decodeURIComponent(escape(atob(dadosArquivo.content)));
                const dadosJSON = JSON.parse(conteudoDecodificado);

                if (Array.isArray(dadosJSON)) {
                    questoesMatrix = dadosJSON.map((item, i) => ({
                        id: i + 1,
                        pergunta: item.pergunta || "",
                        resposta: item.resposta || ""
                    }));
                    
                    // Salva na memória do navegador e atualiza a interface
                    localStorage.setItem("playbook_questions", JSON.stringify(questoesMatrix));
                    renderizarGradeMatriz();
                    alert(`Sucesso! ${questoesMatrix.length} perguntas carregadas da nuvem diretamente na sua tela.`);
                } else {
                    alert("O arquivo no GitHub não está no formato de lista válido [].");
                }

            } catch (err) {
                console.error(err);
                alert("Erro ao conectar ou ler os dados da nuvem do GitHub.");
            } finally {
                btnPuxarGit.textContent = "Puxar dados do GitHub";
                btnPuxarGit.disabled = false;
            }
        });
    }

    renderizarGradeMatriz();
});
