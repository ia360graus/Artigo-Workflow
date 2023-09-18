function copiarParaClipboard(texto, buttonElement) {
    console.log("Função copiarParaClipboard foi chamada.");
    const el = document.createElement('textarea');
    el.value = texto;
    document.body.appendChild(el);
    el.select();
    document.execCommand('copy');
    document.body.removeChild(el);

    const mensagem = document.getElementById('mensagemCopiado');
    mensagem.style.display = 'block';
    setTimeout(() => {
        mensagem.style.display = 'none';
    }, 3000);

    markAsClicked(buttonElement);
}

function markAsClicked(buttonElement) {
    if (buttonElement && buttonElement.classList) {
        buttonElement.classList.add('clicked');
    } else {
        console.error("O elemento do botão não foi definido corretamente.");
    }
}

function exibirMensagemErro(mensagem) {
    const divErro = document.getElementById('mensagemErro');
    divErro.innerText = mensagem;
    divErro.style.display = 'block';
    setTimeout(() => {
        divErro.style.display = 'none';
    }, 3000);
}

async function copiarPrompt(type, buttonElement) {
    const palavraChave = document.getElementById('palavraChave').value;
    const urls = document.getElementById('urlsConcorrentes').value;
    const palavrasLSINLP = document.getElementById('palavrasLSINLP').value;
    const esboco = document.getElementById('esboco').value;

    if (!palavraChave.trim()) {
        return exibirMensagemErro("O campo 'Palavra-chave Principal' deve ser preenchido!");
    }
    if (type === 'promptLSI' && !urls.trim()) {
        return exibirMensagemErro(`O campo relevante para ${type} deve ser preenchido!`);
    }

    const response = await fetch('/copy-prompt', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ type, palavraChave, urls, palavrasLSINLP, esboco })
    });

    const data = await response.json();

    copiarParaClipboard(data.prompt_text, buttonElement);
}

async function copiarPromptIntroducao(buttonElement) {
    const type = 'promptIntroducao';
    const response = await fetch('/copy-prompt', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ type })
    });

    const data = await response.json();

    
    copiarParaClipboard(data.prompt_text, buttonElement);
}

async function copiarPromptConclusao(buttonElement) {
    const type = 'promptConclusao';
    const response = await fetch('/copy-prompt', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ type })
    });

    const data = await response.json();

    
    copiarParaClipboard(data.prompt_text, buttonElement);
}

async function copiarPromptMetaDescricao(buttonElement) {
    const type = 'promptMetadescricao';
    const response = await fetch('/copy-prompt', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ type })
    });

    const data = await response.json();

    
    copiarParaClipboard(data.prompt_text, buttonElement);
}


function gerarPrompts() {
    const esboco = document.getElementById('esboco').value;
    const h2Matches = esboco.match(/H2: (.*?)(\n|$)/g);

    if (!h2Matches) {
        return exibirMensagemErro('Não foram encontrados títulos H2 no esboço.');
    }

    const etapa5 = document.createElement('div');
    etapa5.id = 'etapa5';

    const h3 = document.createElement('h3');
    h3.innerText = 'Etapa 5: Escrever Seções';
    etapa5.appendChild(h3);


    for (let h2 of h2Matches) {
        const button = document.createElement('button');
        const h2Text = h2.replace('H2: ', '').trim();
        button.innerText = `Copiar Prompt para Escrever Seção: ${h2Text}`;
        button.onclick = (e) => {
            copiarParaClipboard(`Escreva a seção ${h2Text}, utilize no máximo uma única vez as seguintes formatações: listas, tabelas ou bullet points em toda a seção. Formate os títulos de acordo com o que foi indicado no esboço. Não adicione o título H1.`, e.target);
        };
        etapa5.appendChild(button);
    }

    const existingEtapa5 = document.getElementById('etapa5');
    if (existingEtapa5) {
        document.body.replaceChild(etapa5, existingEtapa5);
    } else {
        const h3Elements = document.querySelectorAll('h3');
        let h3Etapa6;
        for (let h3 of h3Elements) {
            if (h3.textContent.includes("Etapa 6: Gerar Conclusão")) {
                h3Etapa6 = h3;
                break;
            }
        }
        if (h3Etapa6) {
            h3Etapa6.parentNode.insertBefore(etapa5, h3Etapa6);
        }
    }
    
}

function criarSlug(string) {
    return string
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/\s+/g, '-')
        .toLowerCase()
        .replace(/[^a-z0-9\-]/g, '')
        .replace(/-+/g, '-')
        .trim();
}

function concluirEtapas() {
    const esboco = document.getElementById('esboco').value;
    const h1Match = esboco.match(/H1: (.*?)(\n|$)/);

    if (!h1Match) {
        return exibirMensagemErro('Não foi encontrado um título H1 no esboço.');
    }

    localStorage.setItem('tituloH1', h1Match[1].trim());

    const palavraChave = document.getElementById('palavraChave').value;
    localStorage.setItem('palavraChave', palavraChave);

    window.location.href = '/conclusao';
}

function publishToWordpress() {
    const title = document.getElementById("tituloPrincipal").value;
    const slug = document.getElementById("slug").value;
    const metaDescricao = document.getElementById("metaDescricao").value;
    const content = CKEDITOR.instances.htmlEditor.getData();

    fetch("/publish-to-wordpress", {
        method: "POST",
        headers: {
            "Content-Type": "application/x-www-form-urlencoded"
        },
        body: new URLSearchParams({
            tituloPrincipal: title,
            slug: slug,
            metaDescricao: metaDescricao,
            content: content
        })
    })
    .then(response => response.json())
    .then(data => {
        console.log(data);
        alert("Artigo publicado no WordPress!");
    })
    .catch(error => {
        console.error("Erro ao publicar o artigo:", error);
    });
}
