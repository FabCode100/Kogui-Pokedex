# 🐾 Pokédex FullStack

Uma Pokédex moderna desenvolvida em **Angular** (frontend) e **Django REST Framework** (backend), integrada a **API do PokeAPI**. Permite visualizar, filtrar e organizar Pokémons, além de marcar favoritos e montar equipes de batalha. Nesta versão, a exibição é **somente com badges de tipos**, sem imagens de Pokémons.

---

## 🌟 Funcionalidades

* Listar todos os Pokémons e seus detalhes:

  * Código e nome
  * Tipos com **badges coloridas**
  * Status (HP, Attack, Defense, etc.) com barra de progresso
  * Geração
* Filtragem avançada:

  * Por nome
  * Por tipo
  * Por geração
* Favoritar Pokémons
* Adicionar Pokémons à equipe de batalha (até 6)
* Autenticação de usuários (registro, login, perfil)
* Reset de senha via email
* Integração com backend para sincronização com PokeAPI

---

## 🛠️ Tecnologias

* **Frontend**: Angular (Standalone Components), TypeScript, HTML, SCSS, Angular Material
* **Backend**: Django, Django REST Framework, Python
* **Banco de dados**: MongoDB
* **Autenticação**: Django Custom User, JWT (opcional)
* **Integração externa**: [PokeAPI](https://pokeapi.co/)
* **Email**: Django `send_mail` para reset de senha

---

## 📁 Estrutura do Projeto

```
/backend
│
├─ /pokemons
│   ├─ models.py        # Modelos de Pokemon, Tipo e Usuário
│   ├─ serializers.py   # Serializers para API
│   ├─ views.py         # Views e endpoints
│   ├─ services.py      # Funções de integração com PokeAPI
│
├─ manage.py
└─ settings.py
/frontend
│
├─ /src/app
│   ├─ /Models
│   │   └─ pokemon.model.ts
│   ├─ /pages/pokedex
│   │   ├─ pokedex.component.ts
│   │   ├─ pokedex.component.html
│   │   └─ pokedex.component.scss
│   ├─ /pages/favoritos
│   │   ├─ favoritos.component.ts
│   │   ├─ favoritos.component.html
│   │   └─ favoritos.component.scss
│   ├─ /components
│   │   ├─ header/
│   │   ├─ pokemon-card/
│   │   ├─ pokemon-list/
│   │   ├─ filter/
│   │   └─ stats-bar/
│   └─ app.module.ts
```

---

## ⚙️ Backend - Configuração

1. Criar ambiente virtual:

```bash
python -m venv venv
source venv/bin/activate  # Linux/Mac
venv\Scripts\activate     # Windows
```

2. Instalar dependências:

```bash
pip install -r requirements.txt
```

3. Configurar banco de dados no `settings.py` (MongoDB ou outro).

4. Rodar migrações:

```bash
python manage.py makemigrations
python manage.py migrate
```

5. Rodar servidor:

```bash
python manage.py runserver
```

---

## ⚙️ Frontend - Configuração

1. Instalar dependências:

```bash
npm install
```

2. Configurar `environment.ts` com a URL do backend:

```ts
export const environment = {
  production: false,
  apiBase: 'http://localhost:8000/api'
};
```

3. Rodar aplicação:

```bash
ng serve
```

Acesse em: `http://localhost:4200`

---

## 🔗 Endpoints Principais

| Método | Endpoint                  | Descrição                          |
| ------ | ------------------------- | ---------------------------------- |
| GET    | `/pokemons/`              | Lista todos os Pokémons do usuário |
| GET    | `/pokemons/<id>/`         | Detalhes de um Pokémon             |
| GET    | `/favoritos/`             | Lista Pokémons favoritos           |
| POST   | `/favoritos/`             | Marcar ou desmarcar favorito       |
| GET    | `/batalha/`               | Lista Pokémons da equipe           |
| POST   | `/batalha/`               | Adicionar ou remover da equipe     |
| POST   | `/auth/register/`         | Registrar usuário                  |
| GET    | `/auth/profile/`          | Perfil do usuário                  |
| POST   | `/auth/password-reset/`   | Solicitar reset de senha via email |
| POST   | `/auth/password-confirm/` | Confirmar reset de senha           |

---

## 💡 Observações

* O backend fornece todos os dados necessários para o frontend: nome, código, tipos, status, geração e flags de favorito/equipe.
* Tipos de Pokémon são exibidos como **badges coloridas**.
* Status do Pokémon possuem barra de progresso com **nome à esquerda e valor à direita**.
* Equipe de batalha é limitada a **6 pokémons** por usuário.
* Não há imagens de Pokémons nesta versão; a visualização é baseada em **nome e badges**.

---

## 🖌️ Frontend - Detalhes de Components

* **HeaderComponent**: cabeçalho da Pokédex
* **StatsBarComponent**: exibe total de Pokémons, tipos e gerações
* **FilterComponent**: filtros por tipo, nome e geração
* **PokemonListComponent**: lista de cards de Pokémon
* **PokemonCardComponent**: card individual com **badges de tipos, status e botões de favorito/equipe**
