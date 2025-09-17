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
    searchBar: document.getElementById('search') // Adicione esta linha
};

const ProfessorManager = {
  professores: [],
  professorParaEditar: null,

  init() {
    this.carregar();
    this.render();
  },

  salvar() {
    localStorage.setItem('professores', JSON.stringify(this.professores));
  },

  carregar() {
    const data = localStorage.getItem('professores');
    if (data) this.professores = JSON.parse(data);
  },

  adicionarOuAtualizar(prof) {
    if (this.professorParaEditar !== null) {
      this.professores[this.professorParaEditar] = prof;
      this.professorParaEditar = null;
    } else {
      this.professores.push(prof);
    }
    this.salvar();
    this.render();
  },

  excluir(i) {
    this.professores.splice(i, 1);
    this.salvar();
    this.render();
  },

  iniciarEdicao(i) {
    const p = this.professores[i];
    DOM.nomeInput.value = p.nome;
    DOM.materiaInput.value = p.materia;
    DOM.emailInput.value = p.email;
    this.professorParaEditar = i;
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
    DOM.form.addEventListener('submit', e => {
      e.preventDefault();
      const nome = DOM.nomeInput.value.trim();
      const materia = DOM.materiaInput.value.trim();
      const email = DOM.emailInput.value.trim();
      if (!nome || !materia || !email) {
        alert('Preencha todos os campos.');
        return;
      }
      ProfessorManager.adicionarOuAtualizar({ nome, materia, email });
      ProfessorManager.reset();
       // Evento para a barra de pesquisa
        DOM.searchBar.addEventListener('input', e => {
            const query = e.target.value;
            ProfessorManager.render(query);
        });
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

document.addEventListener('DOMContentLoaded', () => {
  ProfessorManager.init();
  Events.init();
});
