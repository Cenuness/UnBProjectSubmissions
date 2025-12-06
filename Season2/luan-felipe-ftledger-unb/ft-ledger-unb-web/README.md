# FT-Ledger UnB – Academic Repository (Season 2)

Protótipo de repositório acadêmico descentralizado que utiliza a rede **CESS** como camada de armazenamento distribuído e um portal web para envio e verificação de arquivos acadêmicos.

Projeto desenvolvido para a **FT/UnB**, em parceria com a **CESS**, como demonstração de um fluxo completo de upload, verificação de integridade (SHA-256) e armazenamento distribuído de artefatos de engenharia.

---

## 🇧🇷 Português

### 1. Visão geral

O **FT-Ledger UnB** é um protótipo de repositório acadêmico que permite:

- cadastro e login de usuários;
- envio de arquivos acadêmicos por meio de um **portal web**;
- cálculo de hash **SHA-256** do arquivo no navegador, antes do envio;
- armazenamento do arquivo na rede **CESS** via **DeOSS Gateway**;
- exibição do identificador único (**FID/ID**) retornado pela CESS;
- visualização de um **histórico de envios**, associado ao usuário autenticado e organizado por tipo de artefato (CAD, relatório, experimento, código-fonte etc.).

O foco é servir como prova de conceito em ambiente de laboratório, explorando como um repositório acadêmico pode se beneficiar de armazenamento distribuído.

---

### 2. Funcionalidades implementadas

- Tela de **cadastro** de usuário.
- Tela de **login** com autenticação básica (email/senha).
- Área autenticada com:
  - formulário de envio de arquivos;
  - seleção do **tipo de artefato** (CAD, relatório, experimento, código-fonte, etc.);
  - cálculo do **hash SHA-256** do arquivo no frontend;
  - envio do arquivo e metadados para o backend.
- Integração do backend com o **DeOSS Gateway da CESS**, realizando o upload do arquivo.
- Exibição para o usuário de:
  - hash **SHA-256** calculado;
  - identificador **FID/ID** retornado pela CESS;
  - mensagem de sucesso ou erro.
- **Histórico de envios** na interface, vinculado ao usuário autenticado, contendo:
  - tipo de artefato;
  - nome do arquivo;
  - hash SHA-256;
  - FID/ID retornado.

---

### 3. Arquitetura do sistema

O sistema é organizado em três camadas principais:

**Frontend (React + Vite)**  
Responsável por:

- interface web com o usuário;
- fluxo de cadastro e login;
- seleção do arquivo e do tipo de artefato;
- cálculo de SHA-256 no navegador;
- envio dos dados para o backend;
- exibição de hash, FID/ID, status de operação e histórico de envios.

**Backend (Node.js + Express)**  
Responsável por:

- receber o arquivo e metadados enviados pelo frontend;
- validar a requisição de um usuário autenticado;
- realizar a integração com o **DeOSS Gateway da CESS**;
- tratar o retorno (FID/ID, mensagens de erro etc.);
- enviar de volta para o frontend um JSON com o resultado.

**CESS / DeOSS Gateway**  
Responsável por:

- armazenar o arquivo em infraestrutura distribuída;
- retornar um **identificador único (FID/ID)** para o upload realizado.

Fluxo simplificado (texto):

1. Usuário faz **login**.
2. Na área autenticada, escolhe tipo de artefato e arquivo.
3. O frontend calcula o **SHA-256** do arquivo.
4. O frontend envia o arquivo e metadados ao backend.
5. O backend envia o arquivo ao **DeOSS Gateway da CESS**.
6. A CESS retorna um **FID/ID**.
7. O backend devolve o resultado ao frontend.
8. O frontend:
   - exibe hash + FID/ID + status;
   - registra o envio no **histórico** do usuário.

---

### 4. Tecnologias utilizadas

**Frontend**

- React (Vite)
- HTML, CSS, JavaScript
- APIs do navegador para cálculo de **SHA-256**

**Backend**

- Node.js
- Express
- Integração HTTP com o **CESS DeOSS Gateway**

**Outros conceitos**

- Hash **SHA-256** para verificação de integridade.
- Armazenamento distribuído (CESS / DeOSS).
- Associação de envios ao usuário autenticado.

---

### 5. Estrutura de pastas

Dentro do repositório `UnBProjectSubmissions`, este projeto está localizado em:

- `Season2/luan-felipe-ftledger-unb/frontend` → código do portal web (React)
- `Season2/luan-felipe-ftledger-unb/backend` → API em Node.js (integração com CESS)

---

### 6. Como executar o projeto

#### 6.1. Pré-requisitos

- Node.js (versão LTS)
- npm (ou yarn)
- Acesso a um **DeOSS Gateway** da CESS, com:
  - URL do gateway;
  - conta (endereço da wallet na CESS);
  - mensagem assinada;
  - assinatura em formato hexadecimal.

---

#### 6.2. Backend

1. Entrar na pasta do backend:

   ```bash
   cd Season2/luan-felipe-ftledger-unb/backend

    Instalar as dependências:

npm install

Criar um arquivo .env contendo, por exemplo:

DEOSS_GATEWAY_URL=https://deoss-fra.cess.network
DEOSS_TERRITORY=ftledger
DEOSS_ACCOUNT=SEU_ENDERECO_DA_CESS
DEOSS_MESSAGE=mensagem que foi assinada na wallet
DEOSS_SIGNATURE=assinatura_hex_da_mensagem

PORT=3001
CORS_ORIGIN=*
REQUEST_TIMEOUT_MS=60000

Iniciar o backend:

    npm run dev
    # ou
    npm start

6.3. Frontend

    Entrar na pasta do frontend:

cd Season2/luan-felipe-ftledger-unb/frontend

Instalar as dependências:

npm install

Se necessário, configurar a URL do backend (por exemplo, via variável de ambiente):

VITE_BACKEND_URL=http://localhost:3001

Iniciar o frontend:

    npm run dev

    Abrir o navegador no endereço exibido pelo Vite (por exemplo, http://localhost:5173).

7. Como usar o portal

    Acessar o endereço do frontend no navegador.

    Realizar cadastro (se ainda não tiver conta) e depois login.

    Na área autenticada:

        selecionar o tipo de artefato (CAD, relatório, experimento, código-fonte etc.);

        selecionar o arquivo a ser enviado.

    Confirmar o envio.

    O sistema:

        calcula o SHA-256 do arquivo;

        envia o arquivo e metadados ao backend;

        o backend encaminha para a CESS (DeOSS);

        recebe o FID/ID e o status da operação;

        registra o envio no histórico do usuário.

    A tela exibe:

        hash SHA-256;

        identificador FID/ID retornado pela CESS;

        mensagem de sucesso ou erro;

        o registro correspondente no histórico de envios.

8. Limitações atuais

    Protótipo voltado para ambiente de laboratório (não para produção).

    Não há, ainda, diferenciação avançada de perfis (por exemplo: aluno, professor, administrador com permissões distintas).

    Não há busca global por hash ou FID na interface; a visualização é focada no histórico do próprio usuário dentro da aplicação.

9. Possíveis evoluções

    Tela de busca por hash (SHA-256) ou FID/ID.

    Integração com smart contracts para registro de metadados na blockchain.

    Refinar controle de acesso por perfil (por exemplo, diferentes permissões para alunos, professores e administradores).

    Integração com repositórios institucionais já existentes.

10. Autor

    Luan Felipe Lopes Graciano

🇬🇧 English
1. Project overview

FT-Ledger UnB is a prototype of a decentralized academic repository built for the FT/UnB course, in collaboration with CESS.

It allows:

    user registration and login;

    upload of academic artifacts through a web portal;

    local computation of the file SHA-256 hash in the browser;

    storage of the file in the CESS network via the DeOSS Gateway;

    display of the unique identifier (FID/ID) returned by CESS;

    visualization of a submission history associated with the authenticated user, organized by artifact type (CAD, report, experiment, source code, etc.).

The prototype is intended for lab and academic demonstration purposes.
2. Implemented features

    User sign up and login (basic email/password authentication).

    Authenticated area with:

        academic file upload form;

        selection of artifact type (CAD, report, experiment, source code, etc.);

        computation of the file SHA-256 hash in the frontend;

        submission of file and metadata to the backend.

    Backend integration with the CESS DeOSS Gateway to upload the file.

    Display to the user of:

        the computed SHA-256 hash;

        the FID/ID returned by CESS;

        a success or error message.

    Submission history in the UI, linked to the authenticated user, including:

        artifact type;

        file name;

        SHA-256 hash;

        returned FID/ID.

3. System architecture

Frontend (React + Vite)

    Web interface.

    User sign up and login flow.

    File selection and artifact type selection.

    SHA-256 hash computation in the browser.

    Sending file and metadata to the backend.

    Display of hash, FID/ID, operation status and submission history.

Backend (Node.js + Express)

    Receives file and metadata from the frontend.

    Validates that the request comes from an authenticated user.

    Integrates with the CESS DeOSS Gateway to upload the file.

    Handles the response (FID/ID, success/error).

    Returns a JSON payload with the result to the frontend.

CESS / DeOSS Gateway

    Stores the file in a distributed storage layer.

    Returns a unique identifier (FID/ID) for the uploaded file.

4. Technologies

Frontend

    React (Vite)

    HTML, CSS, JavaScript

    Browser APIs for SHA-256 computation

Backend

    Node.js

    Express

    HTTP integration with the CESS DeOSS Gateway

Concepts

    File integrity via SHA-256.

    Distributed storage (CESS / DeOSS).

    Mapping submissions to an authenticated user.

5. Folder structure

Within the UnBProjectSubmissions repository, this project is located at:

    Season2/luan-felipe-ftledger-unb/frontend → web portal (React)

    Season2/luan-felipe-ftledger-unb/backend → API (Node.js, CESS integration)

6. How to run
6.1. Requirements

    Node.js (LTS)

    npm (or yarn)

    Access to a CESS DeOSS Gateway with:

        gateway URL;

        account address;

        signed message;

        hexadecimal signature.

6.2. Backend

    Go to the backend folder:

cd Season2/luan-felipe-ftledger-unb/backend

Install dependencies:

npm install

Create a .env file with values such as:

DEOSS_GATEWAY_URL=https://deoss-fra.cess.network
DEOSS_TERRITORY=ftledger
DEOSS_ACCOUNT=YOUR_CESS_ADDRESS
DEOSS_MESSAGE=message_used_in_signature
DEOSS_SIGNATURE=hex_signature

PORT=3001
CORS_ORIGIN=*
REQUEST_TIMEOUT_MS=60000

Start the backend:

    npm run dev
    # or
    npm start

6.3. Frontend

    Go to the frontend folder:

cd Season2/luan-felipe-ftledger-unb/frontend

Install dependencies:

npm install

If needed, configure the backend URL (for example, using an environment variable):

VITE_BACKEND_URL=http://localhost:3001

Start the frontend:

    npm run dev

    Open the browser at the URL provided by Vite (for example, http://localhost:5173).

7. Usage

    Open the web portal in your browser.

    Sign up (if you do not have an account yet) and then log in.

    In the authenticated area:

        select the artifact type (CAD, report, experiment, source code, etc.);

        choose the file to upload.

    Confirm the submission.

    The system will:

        compute the file SHA-256 hash;

        send the file and metadata to the backend;

        upload the file from the backend to CESS DeOSS;

        receive the FID/ID and operation status;

        record the submission in the user's history.

    The UI will show:

        the file SHA-256 hash;

        the FID/ID returned by CESS;

        a success or error message;

        the new entry in the submission history.

8. Current limitations

    Prototype aimed at lab and academic usage (not production-ready).

    No advanced role-based access control yet (no distinct permissions for teacher/admin vs. student).

    No global search screen by hash or FID; visualization is focused on the authenticated user's submission history.

9. Possible future work

    Search screen by hash (SHA-256) or FID/ID.

    Smart contract integration to register metadata on-chain.

    More advanced role-based access control (e.g., different permissions for students, professors and admins).

    Integration with existing institutional or academic repositories.

10. Author

    Luan Felipe Lopes Graciano