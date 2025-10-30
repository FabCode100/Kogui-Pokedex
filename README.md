# 🎮 Pokédex FullStack

> Uma Pokédex moderna e interativa desenvolvida com **Angular** (frontend) e **Django REST Framework** (backend), totalmente integrada à **PokeAPI**.  
> Permite visualizar, filtrar e organizar Pokémons, marcar favoritos, montar equipes de batalha e gerenciar seu perfil de usuário.  
> Tudo isso com **autenticação JWT**, **reset de senha por e-mail** e **UI dinâmica com modal e efeitos de loading.**

---

## 🧭 Índice

1. [✨ Visão Geral](#-visão-geral)
2. [🌟 Funcionalidades](#-funcionalidades)
3. [🧱 Stack Tecnológica](#-stack-tecnológica)
4. [📂 Estrutura do Projeto](#-estrutura-do-projeto)
5. [⚙️ Backend - Django](#️-backend---django)
6. [💻 Frontend - Angular](#-frontend---angular)
7. [🐳 Executando com Docker](#-executando-com-docker)
8. [🔗 Endpoints Principais](#-endpoints-principais)
9. [🏠 Página Home](#-página-home)
10. [💡 Observações](#-observações)
11. [🧠 Autor](#-autor)

---

## ✨ Visão Geral

A **Pokédex FullStack** é uma aplicação completa que une **tecnologia moderna e design responsivo**.  
Com ela, o usuário pode:
- Autenticar-se e acessar suas listas personalizadas;
- Explorar Pokémons com filtros avançados;
- Montar uma equipe de batalha com limite de 6;
- Favoritar e visualizar detalhes completos de cada Pokémon;
- Gerenciar conta e redefinir senha via e-mail.

Frontend e backend se comunicam por API REST, e toda a aplicação pode ser executada com **Docker Compose**.

---

## 🌟 Funcionalidades

### 🔍 Explorar Pokémons
- Lista todos os Pokémons com:
  - Nome, geração e status (HP, Attack, Defense, etc.)
  - Tipos com **badges coloridas em inglês**
  - Barras de progresso dinâmicas
- Modal detalhado com **efeito de loading** ao carregar dados

### 🧩 Filtros avançados
- Por **nome**
- Por **tipo**
- Por **geração**
- Por **favoritos**

### ⚔️ Equipe de Batalha
- Adicione até **6 Pokémons**
- Cores dinâmicas com base no tipo principal
- Sistema bloqueia novas adições ao atingir o limite

### 💖 Favoritos
- Adicione/remova Pokémons dos seus favoritos
- Persistência via API autenticada

### 🔐 Autenticação e Usuários
- Registro e login com JWT
- Proteção de rotas via **AuthGuard**
- Edição de perfil e logout seguro
- **Reset de senha via e-mail** com confirmação por token

---

## 🧱 Stack Tecnológica

![Angular](https://img.shields.io/badge/Angular-18-DD0031?style=for-the-badge&logo=angular&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-5.4-3178C6?style=for-the-badge&logo=typescript&logoColor=white)
![SCSS](https://img.shields.io/badge/SCSS-CC6699?style=for-the-badge&logo=sass&logoColor=white)
![Angular Material](https://img.shields.io/badge/Angular%20Material-20232A?style=for-the-badge&logo=angular&logoColor=61DAFB)
![Django](https://img.shields.io/badge/Django-5.0-092E20?style=for-the-badge&logo=django&logoColor=white)
![Django REST](https://img.shields.io/badge/Django%20REST-API-ff1709?style=for-the-badge&logo=django&logoColor=white)
![SQLite](https://img.shields.io/badge/SQLite-07405E?style=for-the-badge&logo=sqlite&logoColor=white)
![JWT](https://img.shields.io/badge/JWT-Auth-000000?style=for-the-badge&logo=jsonwebtokens&logoColor=white)
![PokeAPI](https://img.shields.io/badge/PokeAPI-FFCB05?style=for-the-badge&logo=pokemon&logoColor=black)
![Docker](https://img.shields.io/badge/Docker-Compose-2496ED?style=for-the-badge&logo=docker&logoColor=white)

---

## 📂 Estrutura do Projeto

```

📦 pokedex-fullstack
├── backend/
│   ├── pokemons/
│   │   ├── models.py          # Modelos: Pokémon, Tipo, Favoritos, Equipe
│   │   ├── serializers.py     # Serializadores DRF
│   │   ├── views.py           # Endpoints REST
│   │   └── services.py        # Integração com a PokeAPI
│   ├── users/
│   │   ├── views.py           # Registro, Perfil e Reset de Senha
│   ├── manage.py
│   └── settings.py
│
├── frontend/
│   └── src/app/
│       ├── Models/
│       │   └── pokemon.model.ts
│       ├── components/
│       │   ├── header/
│       │   ├── pokemon-card/
│       │   ├── pokemon-list/
│       │   ├── filter/
│       │   └── stats-bar/
│       ├── pages/
│       │   ├── home/                  # Página inicial (visão geral)
│       │   ├── pokedex/
│       │   ├── favoritos/
│       │   ├── batalha/
│       │   ├── login/
│       │   ├── register/
│       │   ├── reset-password/
│       │   └── reset-password-confirm/
│       ├── app.routes.ts
│       └── app.component.html
│
├── docker-compose.yml
├── Dockerfile.backend
└── Dockerfile.frontend

````

---

## ⚙️ Backend - Django

### 1️⃣ Criar ambiente virtual
```bash
python -m venv venv
source venv/bin/activate  # Linux/Mac
venv\Scripts\activate     # Windows
````

### 2️⃣ Instalar dependências

```bash
pip install -r requirements.txt
```

### 3️⃣ Rodar migrações

```bash
python manage.py makemigrations
python manage.py migrate
```

### 4️⃣ Rodar servidor

```bash
python manage.py runserver
```

🟢 **Acesse:** [http://localhost:8000](http://localhost:8000)

---

## 💻 Frontend - Angular

### 1️⃣ Instalar dependências

```bash
npm install
```

### 2️⃣ Configurar ambiente

Arquivo `src/environments/environment.ts`:

```ts
export const environment = {
  production: false,
  apiBase: 'http://localhost:8000/api'
};
```

### 3️⃣ Rodar aplicação

```bash
ng serve
```

🟢 **Acesse:** [http://localhost:4200](http://localhost:4200)

---

## 🐳 Executando com Docker

### 📦 Subir containers

```bash
docker compose up --build
```

### 🌐 Acessos

* **Frontend:** [http://localhost:4200](http://localhost:4200)
* **Backend:** [http://localhost:8000](http://localhost:8000)

Containers criados:

* 🐍 `django_backend`
* ⚡ `angular_frontend`

---

## 🔗 Endpoints Principais

| Método   | Endpoint                                    | Descrição                 |
| -------- | ------------------------------------------- | ------------------------- |
| **GET**  | `/pokemons/`                                | Lista Pokémons            |
| **GET**  | `/pokemons/<id>/`                           | Detalhes de um Pokémon    |
| **GET**  | `/favoritos/`                               | Lista favoritos           |
| **POST** | `/favoritos/`                               | Marca/desmarca favorito   |
| **GET**  | `/batalha/`                                 | Lista equipe              |
| **POST** | `/batalha/`                                 | Adiciona/remove da equipe |
| **POST** | `/register/`                                | Cria novo usuário         |
| **POST** | `/token/`                                   | Autenticação JWT          |
| **POST** | `/token/refresh/`                           | Atualiza token            |
| **GET**  | `/profile/`                                 | Perfil do usuário         |
| **POST** | `/reset-password/`                          | Envia e-mail de reset     |
| **POST** | `/reset-password-confirm/<uidb64>/<token>/` | Redefine senha            |

---

## 🏠 Página Home

A **Home Page** (`/`) é o ponto inicial da aplicação, apresentando:

* O **header principal** (`<app-header>`)
* Um resumo dos recursos disponíveis
* Acesso rápido à Pokédex, Favoritos e Batalha
* Design responsivo e integração total com o restante da UI

Ideal para usuários autenticados e novos visitantes explorarem o sistema.

---

## 💡 Observações

* A **equipe de batalha** tem limite de **6 Pokémons**.
* Os **tipos** são exibidos em **inglês**, e a cor vem do tipo principal.
* **Modal** exibe um **efeito de loading** enquanto busca os dados do backend.
* O **AuthGuard** protege rotas privadas: `/pokemons`, `/favoritos`, `/batalha`.
* O backend usa **SQLite** por padrão (sem configuração adicional).

---

## 🧠 Autor

👨‍💻 **Fabricio Bastos Cardoso**
🎓 Estudante de Engenharia da Computação
💼 Desenvolvedor FullStack — Django & Angular
💬 “Busco unir tecnologia, design e experiência para criar soluções que realmente encantem.”

📫 **Contato:**
[LinkedIn](https://linkedin.com/in/fabricio-bastos-cardoso) • [GitHub](https://github.com/)

---

> 💡 *“Treine como Ash, pense como Oak e codifique como um verdadeiro Mestre Pokémon.”* 🧠⚡

```

