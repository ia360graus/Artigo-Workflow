import json
from flask import Flask, render_template, request, jsonify
import requests
from requests.auth import HTTPBasicAuth

app = Flask(__name__)

# Carregar os prompts do arquivo prompts.json
with open('prompts.json', 'r') as f:
    prompts = json.load(f)

def create_wordpress_post(title, slug, meta_description, content, domain, username, password):
    
    # URL da API para criar um post
    url = f"{domain}/wp-json/wp/v2/posts"

    # Dados do post
    data = {
        "title": title,
        "slug": slug,
        "content": content,
        "status": "draft",  # publicar imediatamente
        "rank_math_description": meta_description
    }

    response = requests.post(url, json=data, auth=HTTPBasicAuth(username, password))
    response.raise_for_status()  # Isso irá lançar um erro se a requisição não for bem-sucedida

    return response.json()

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/copy-prompt', methods=['POST'])
def copy_prompt():
    data = request.json
    prompt_type = data['type']

    # Use get para pegar 'palavraChave' e fornecer um valor padrão de '' se não estiver presente
    palavra_chave = data.get('palavraChave', '')
    urls = data.get('urls', '')
    palavras_lsi_nlp = data.get('palavrasLSINLP', '')
    esboco = data.get('esboco')

    prompt_text = prompts[prompt_type].replace('{palavraChave}', palavra_chave).replace('{palavrasLSINLP}', palavras_lsi_nlp)
    if prompt_type in ['promptLSI', 'promptEsboco']:
        prompt_text = f"{urls}\n\n{prompt_text}"

    if prompt_type in ['promptArtigo']:
        prompt_text = f"{esboco}\n\n{prompt_text}"

    return jsonify({'prompt_text': prompt_text})

@app.route('/conclusao')
def conclusao():
    return render_template('conclusao.html')

@app.route('/publish-to-wordpress', methods=['POST'])
def publish_to_wordpress():
    title = request.form.get("tituloPrincipal")
    slug = request.form.get("slug")
    meta_description = request.form.get("metaDescricao")
    content = request.form.get("content")  # Este é o conteúdo do CKEditor
    
    # Valores para a autenticação e domínio - substitua por seus próprios valores
    DOMAIN = ""
    USERNAME = ""
    PASSWORD = ""

    response = create_wordpress_post(title, slug, meta_description, content, DOMAIN, USERNAME, PASSWORD)
    return jsonify(response)

if __name__ == '__main__':
    app.run(debug=True)
