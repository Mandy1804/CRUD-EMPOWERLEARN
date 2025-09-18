function validarEmail(email) {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(String(email).toLowerCase());
}
const DOM = {
  form: document.getElementById('professorForm'),
  nomeInput: document.getElementById('nome'),
  materiaInput: document.getElementById('materia'),
  emailInput: document.getElementById('email'),
  submitBtn: document.getElementById('submitBtn'),
  tabelaBody: document.querySelector('#professoresTabela tbody'),
  searchBar: document.getElementById('search')
};

const ProfessorManager = {
  professores: [],
  professorParaEditar: null, // guardará o objeto professor (com id) que está sendo editado

  async init() {
    await this.carregar();
  },

  async carregar() {
    try {
      const response = await fetch('http://localhost:8080/api/professores');
      if (!response.ok) throw new Error('Erro ao buscar professores');
      const data = await response.json();
      this.professores = data;
      this.render();
    } catch (error) {
      console.error('Erro ao carregar professores da API:', error);
      alert('Não foi possível carregar os professores do servidor.');
    }
  },

  async adicionarOuAtualizar(prof) {
    try {
      if (this.professorParaEditar !== null) {
        // Atualizar
        const id = this.professorParaEditar.id;
        const response = await fetch(`http://localhost:8080/api/professores/${id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(prof),
        });
        if (!response.ok) throw new Error('Erro ao atualizar professor');
        const atualizado = await response.json();

        // Atualiza localmente o array (substitui o professor editado)
        const index = this.professores.findIndex(p => p.id === id);
        if (index !== -1) this.professores[index] = atualizado;

        this.professorParaEditar = null;
      } else {
        // Adicionar
        const response = await fetch('http://localhost:8080/api/professores', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(prof),
        });
        if (!response.ok) throw new Error('Erro ao adicionar professor');
        const novoProf = await response.json();
        this.professores.push(novoProf);
      }
      this.render();
    } catch (error) {
      console.error(error);
      alert('Erro ao salvar o professor no servidor.');
    }
  },

  async excluir(i) {
    try {
      const id = this.professores[i].id;
      const response = await fetch(`http://localhost:8080/api/professores/${id}`, {
        method: 'DELETE',
      });
      if (!response.ok) throw new Error('Erro ao excluir professor');

      this.professores.splice(i, 1);
      this.render();
    } catch (error) {
      console.error(error);
      alert('Erro ao excluir professor do servidor.');
    }
  },

  iniciarEdicao(i) {
    const p = this.professores[i];
    DOM.nomeInput.value = p.nome;
    DOM.materiaInput.value = p.materia;
    DOM.emailInput.value = p.email;
    this.professorParaEditar = p; // guarda o objeto completo (com id)
    DOM.submitBtn.textContent = 'Atualizar Professor';
  },

  reset() {
    DOM.form.reset();
    this.professorParaEditar = null;
    DOM.submitBtn.textContent = 'Adicionar Professor';
  },

  render(query = '') {
    const professoresFiltrados = this.professores.filter(p =>
      p.nome.toLowerCase().includes(query.toLowerCase()) ||
      p.materia.toLowerCase().includes(query.toLowerCase()) ||
      p.email.toLowerCase().includes(query.toLowerCase())
    );

    DOM.tabelaBody.innerHTML = professoresFiltrados
      .map((p, i) => `
        <tr>
          <td>${p.nome}</td>
          <td>${p.materia}</td>
          <td>${p.email}</td>
          <td class="acoes">
            <button class="editar-btn" data-index="${i}">Editar</button>
            <button class="excluir-btn" data-index="${i}">Excluir</button>
          </td>
        </tr>
      `).join('');
  }
};

const Events = {
  init() {
    DOM.form.addEventListener('submit', async e => {
      e.preventDefault();

      const nome = DOM.nomeInput.value.trim();
      const materia = DOM.materiaInput.value.trim();
      const email = DOM.emailInput.value.trim();

      if (!nome || !materia || !email) {
        alert('Preencha todos os campos.');
        return;
      }

      if (!validarEmail(email)) {
        alert('Por favor, insira um e-mail válido.');
        return;
      }

      await ProfessorManager.adicionarOuAtualizar({ nome, materia, email });
      ProfessorManager.reset();
    });

    DOM.searchBar.addEventListener('input', e => {
      const query = e.target.value;
      ProfessorManager.render(query);
    });

    DOM.tabelaBody.addEventListener('click', e => {
      const btn = e.target;
      const idx = btn.dataset.index;

      if (btn.classList.contains('editar-btn')) {
        ProfessorManager.iniciarEdicao(idx);
      } else if (btn.classList.contains('excluir-btn')) {
        if (confirm('Deseja excluir este professor?')) {
          ProfessorManager.excluir(idx);
        }
      }
    });
  }
};

document.addEventListener('DOMContentLoaded', async () => {
  await ProfessorManager.init();
  Events.init();
});
