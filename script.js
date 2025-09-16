const form = document.getElementById('professor-form');
const tableBody = document.querySelector('#professor-table tbody');

let professores = [];
let editIndex = -1;

// Função para validar idade mínima (exemplo: 18 anos)
function validarIdade(dataNascimento) {
  const hoje = new Date();
  const nascimento = new Date(dataNascimento);
  let idade = hoje.getFullYear() - nascimento.getFullYear();
  const m = hoje.getMonth() - nascimento.getMonth();
  if (m < 0 || (m === 0 && hoje.getDate() < nascimento.getDate())) {
    idade--;
  }
  return idade >= 18;
}

// Função para resetar o formulário e estado de edição
function resetForm() {
  form.reset();
  editIndex = -1;
  form.querySelector('button[type="submit"]').textContent = 'Salvar Professor';
}

// Função para renderizar a tabela de professores
function renderizarTabela() {
  tableBody.innerHTML = '';

  professores.forEach((prof, index) => {
    const row = document.createElement('tr');

    row.innerHTML = `
      <td>${prof.nome}</td>
      <td>${prof.email}</td>
      <td>${prof.area}</td>
      <td>${prof.experiencia} anos</td>
      <td class="actions">
        <button class="edit-btn" onclick="editarProfessor(${index})" aria-label="Editar professor ${prof.nome}">Editar</button>
        <button class="delete-btn" onclick="deletarProfessor(${index})" aria-label="Excluir professor ${prof.nome}">Excluir</button>
      </td>
    `;

    tableBody.appendChild(row);
  });
}

// Função para capturar os dados do formulário
function capturarDadosForm() {
  return {
    nome: form.nome.value.trim(),
    email: form.email.value.trim(),
    nascimento: form.nascimento.value,
    sexo: form.sexo.value,
    formacao: form.formacao.value.trim(),
    area: form.area.value.trim(),
    experiencia: Number(form.experiencia.value),
    linkedin: form.linkedin.value.trim(),
    bio: form.bio.value.trim(),
  };
}

// Função para validar o formulário antes de salvar
function validarForm(professor) {
  if (!professor.nome || !professor.email || !professor.nascimento || !professor.sexo || !professor.formacao || !professor.area || isNaN(professor.experiencia)) {
    alert('Por favor, preencha todos os campos obrigatórios.');
    return false;
  }

  if (!validarIdade(professor.nascimento)) {
    alert('O professor deve ter pelo menos 18 anos.');
    return false;
  }

  // Validação simples de URL LinkedIn (se preenchido)
  if (professor.linkedin && !/^https?:\/\/(www\.)?linkedin\.com\/.*$/i.test(professor.linkedin)) {
    alert('Informe uma URL válida do LinkedIn.');
    return false;
  }

  return true;
}

// Função para adicionar ou editar professor
form.addEventListener('submit', (e) => {
  e.preventDefault();

  const professor = capturarDadosForm();

  if (!validarForm(professor)) return;

  if (editIndex === -1) {
    professores.push(professor);
  } else {
    professores[editIndex] = professor;
  }

  resetForm();
  renderizarTabela();
});

// Função para editar professor
function editarProfessor(index) {
  const prof = professores[index];
  form.nome.value = prof.nome;
  form.email.value = prof.email;
  form.nascimento.value = prof.nascimento;
  form.sexo.value = prof.sexo;
  form.formacao.value = prof.formacao;
  form.area.value = prof.area;
  form.experiencia.value = prof.experiencia;
  form.linkedin.value = prof.linkedin;
  form.bio.value = prof.bio;

  editIndex = index;
  form.querySelector('button[type="submit"]').textContent = 'Atualizar Professor';
}

// Função para deletar professor
function deletarProfessor(index) {
  if (confirm(`Deseja realmente excluir o professor ${professores[index].nome}?`)) {
    professores.splice(index, 1);
    if (editIndex === index) resetForm();
    renderizarTabela();
  }
}

// Expor funções para o escopo global para serem usadas nos botões da tabela
window.editarProfessor = editarProfessor;
window.deletarProfessor = deletarProfessor;

// Inicializa a tabela vazia
renderizarTabela();
