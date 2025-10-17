document.addEventListener('DOMContentLoaded', () => {
    // --- LÓGICA DE TEMA E ELEMENTOS GLOBAIS ---
    const themeSwitcher = document.getElementById('theme-switcher');
    const themeLink = document.getElementById('theme-link');
    const savedTheme = localStorage.getItem('theme');

    const applyTheme = (theme) => {
        // Verifica se o link do tema existe na página antes de tentar usá-lo
        if (themeLink) {
            themeLink.href = `tema/${theme}-theme.css`;
        }
        if (themeSwitcher) {
            themeSwitcher.checked = (theme === 'light');
        }
    };

    if (savedTheme) { applyTheme(savedTheme); } else { applyTheme('dark'); }

    if (themeSwitcher) {
        themeSwitcher.addEventListener('change', () => {
            const newTheme = themeSwitcher.checked ? 'light' : 'dark';
            localStorage.setItem('theme', newTheme);
            applyTheme(newTheme);
        });
    }

    // --- SIMULAÇÃO DE BANCO DE DADOS (localStorage) ---
    // Simula todos os usuários cadastrados no sistema
    let allUsers = JSON.parse(localStorage.getItem('allUsers')) || [
        { id: 'user001', name: "Carlos Andrade", cpf: "111.222.333-44", email: "carlos.andrade@email.com" }
    ];
    // Simula todas as inscrições.
    let allInscriptions = JSON.parse(localStorage.getItem('allInscriptions')) || [
        { userEmail: 'carlos.andrade@email.com', eventName: 'Workshop de Java Avançado', eventDate: '15 de Novembro de 2025', status: 'Inscrito' }
    ];

    const saveAllData = () => {
        localStorage.setItem('allUsers', JSON.stringify(allUsers));
        localStorage.setItem('allInscriptions', JSON.stringify(allInscriptions));
    };

    // --- LÓGICA DE LOGIN (index.html) ---
    const loginForm = document.getElementById('login-form');
    if (loginForm) {
        loginForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const email = document.getElementById('login-email').value;
            
            const userExists = allUsers.find(user => user.email === email);
            if (userExists) {
                console.log("LOGIN BEM-SUCEDIDO:", userExists);
                // Salva o email do usuário logado para ser usado em outras páginas
                localStorage.setItem('loggedInUserEmail', email);
                // Redireciona para a página de eventos
                window.location.href = 'eventos.html';
            } else {
                alert('Usuário não encontrado. Verifique o email e tente novamente.');
            }
        });
    }

    // --- LÓGICA DE CADASTRO (cadastro.html) ---
    const registrationForm = document.getElementById('registration-form');
    if (registrationForm) {
        registrationForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const name = document.getElementById('reg-name').value;
            const email = document.getElementById('reg-email').value;
            const cpf = document.getElementById('cpf').value;
            
            const userExists = allUsers.find(user => user.email === email || user.cpf === cpf);
            if (userExists) {
                alert('Email ou CPF já cadastrado no sistema.');
                return;
            }

            const newUser = {
                id: 'user' + Date.now(),
                name: name,
                cpf: cpf,
                email: email
            };

            allUsers.push(newUser);
            saveAllData();

            alert('Cadastro realizado com sucesso! Você será redirecionado para o login.');
            window.location.href = 'index.html';
        });
    }

    // --- PROTEÇÃO DE PÁGINAS LOGADAS E DADOS DO USUÁRIO ---
    const loggedInUserEmail = localStorage.getItem('loggedInUserEmail');
    let loggedInUser = null;
    if (loggedInUserEmail) {
        loggedInUser = allUsers.find(user => user.email === loggedInUserEmail);
    }
    
    // Se a página tem o menu principal, significa que ela é protegida
    if (document.querySelector('.main-nav')) { 
        if (!loggedInUser) {
            alert('Você não está logado. Redirecionando para a página de login.');
            window.location.href = 'index.html';
        }
    }

    // --- LÓGICA DA PÁGINA DE EVENTOS (eventos.html) ---
    const subscribeButtons = document.querySelectorAll('.subscribe-btn');
    const modalOverlay = document.getElementById('registration-modal');
    
    if (subscribeButtons.length > 0 && modalOverlay) {
        const modalForm = document.getElementById('checkin-form');
        const closeModalBtn = document.querySelector('.close-modal');
        const modalEventName = document.getElementById('modal-event-name');
        
        const checkinNameInput = document.getElementById('checkin-name');
        const checkinCpfInput = document.getElementById('checkin-cpf');
        const checkinEmailInput = document.getElementById('checkin-email');

        let currentEventName = '';
        let currentEventDate = '';

        subscribeButtons.forEach(button => {
            button.addEventListener('click', () => {
                currentEventName = button.getAttribute('data-event-name');
                const eventCard = button.parentElement;
                currentEventDate = eventCard.querySelector('p').textContent.replace('Data: ', '');

                modalEventName.textContent = currentEventName;

                if (loggedInUser) {
                    checkinNameInput.value = loggedInUser.name;
                    checkinCpfInput.value = loggedInUser.cpf;
                    checkinEmailInput.value = loggedInUser.email;
                }

                modalOverlay.classList.remove('hidden');
            });
        });

        const closeModal = () => {
            modalOverlay.classList.add('hidden');
        };
        closeModalBtn.addEventListener('click', closeModal);
        modalOverlay.addEventListener('click', (e) => {
            if (e.target === modalOverlay) {
                closeModal();
            }
        });

        modalForm.addEventListener('submit', (e) => {
            e.preventDefault();

            const alreadySubscribed = allInscriptions.find(insc => 
                insc.userEmail === loggedInUser.email && insc.eventName === currentEventName
            );

            if (alreadySubscribed) {
                alert('Você já está inscrito neste evento.');
                return;
            }

            const newInscription = {
                userEmail: loggedInUser.email,
                eventName: currentEventName,
                eventDate: currentEventDate,
                status: 'Inscrito'
            };

            allInscriptions.push(newInscription);
            saveAllData();

            alert('Inscrição realizada com sucesso!');
            console.log("NOVA INSCRIÇÃO:", newInscription);
            closeModal();
        });
    }

   // --- LÓGICA DA PÁGINA "MINHAS INSCRIÇÕES" (minhas-inscricoes.html) ---
    const inscriptionsList = document.getElementById('my-inscriptions-list');
    if (inscriptionsList) {
        
        const renderInscriptions = () => {
            // Filtra as inscrições do usuário logado no momento da renderização
            const myInscriptions = allInscriptions.filter(insc => insc.userEmail === loggedInUserEmail);
            inscriptionsList.innerHTML = ''; // Limpa a lista antes de redesenhar

            if (myInscriptions.length === 0) {
                inscriptionsList.innerHTML = '<p>Você ainda não se inscreveu em nenhum evento.</p>';
                return;
            }

            myInscriptions.forEach(inscription => {
                const card = document.createElement('li');
                card.className = 'event-card';

                // Bloco HTML atualizado com os dois botões
                card.innerHTML = `
                    <h3>${inscription.eventName}</h3>
                    <p>Data: ${inscription.eventDate}</p>
                    <p><strong>Status: ${inscription.status}</strong></p>
                    
                    <div class="card-actions" style="display: flex; gap: 10px; margin-top: 20px;">
                        <button 
                            class="checkin-btn" 
                            data-event-name="${inscription.eventName}" 
                            ${inscription.status === 'Presença Confirmada' ? 'disabled' : ''}>
                            Fazer Check-in
                        </button>
                        <button 
                            class="cancel-btn" 
                            data-event-name="${inscription.eventName}">
                            Cancelar Inscrição
                        </button>
                    </div>
                `;
                inscriptionsList.appendChild(card);
            });
        };
        
        // Chama a função para desenhar os cards na tela
        renderInscriptions();

        // Adiciona a lógica para os cliques nos botões da lista
        inscriptionsList.addEventListener('click', (e) => {
            const eventName = e.target.getAttribute('data-event-name');
            if (!eventName) return; // Se clicou em algo que não é um botão, para aqui

            // Lógica para o botão FAZER CHECK-IN
            if (e.target.classList.contains('checkin-btn')) {
                const inscriptionToUpdate = allInscriptions.find(
                    insc => insc.userEmail === loggedInUserEmail && insc.eventName === eventName
                );

                if (inscriptionToUpdate && inscriptionToUpdate.status === 'Inscrito') {
                    inscriptionToUpdate.status = 'Presença Confirmada';
                    saveAllData(); // Salva a mudança no localStorage
                    renderInscriptions(); // Redesenha a tela para refletir a mudança
                    alert('Check-in realizado com sucesso!');
                }
            }

            // Lógica para o botão CANCELAR INSCRIÇÃO
            if (e.target.classList.contains('cancel-btn')) {
                // Pede confirmação ao usuário
                if (confirm(`Tem certeza que deseja cancelar a inscrição em "${eventName}"?`)) {
                    // Recria a lista de inscrições, removendo a que foi cancelada
                    allInscriptions = allInscriptions.filter(
                        insc => !(insc.userEmail === loggedInUserEmail && insc.eventName === eventName)
                    );
                    saveAllData(); // Salva a nova lista no localStorage
                    renderInscriptions(); // Redesenha a tela
                    alert('Inscrição cancelada.');
                }
            }
        });
    }

    // --- LÓGICA DA PÁGINA DE CHECK-IN (checkin.html) ---
    const searchBtn = document.getElementById('search-btn');
    if (searchBtn) {
        const searchInput = document.getElementById('search-participant');
        const participantInfoDiv = document.getElementById('participant-info');
        const searchMsg = document.getElementById('search-result-msg');
        let foundInscription = null;

        searchBtn.addEventListener('click', () => {
            const searchTerm = searchInput.value.trim();
            participantInfoDiv.classList.add('hidden');
            searchMsg.textContent = '';
            foundInscription = null;
            
            foundInscription = allInscriptions.find(insc => insc.userEmail === searchTerm);

            if (foundInscription) {
                const participant = allUsers.find(user => user.email === foundInscription.userEmail);
                document.getElementById('participant-name').textContent = participant.name;
                document.getElementById('participant-event').textContent = foundInscription.eventName;
                document.getElementById('participant-status').textContent = foundInscription.status;
                participantInfoDiv.classList.remove('hidden');
            } else {
                searchMsg.textContent = 'Nenhuma inscrição encontrada para este participante.';
            }
        });

        const checkinBtn = document.getElementById('checkin-btn');
        checkinBtn.addEventListener('click', () => {
            if (foundInscription) {
                if (foundInscription.status === 'Inscrito') {
                    foundInscription.status = 'Presença Confirmada';
                    saveAllData();
                    document.getElementById('participant-status').textContent = 'Presença Confirmada';
                    alert('Presença registrada com sucesso!');
                    console.log("CHECK-IN REALIZADO:", foundInscription);
                } else {
                    alert(`Não é possível registrar presença. Status atual: ${foundInscription.status}`);
                }
            }
        });
    }
});