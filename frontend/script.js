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

    // --- LÓGICA DA PÁGINA "MINHAS INSCRIÇÕES" (minhas-inscricoes.html) ---
    const inscriptionsList = document.getElementById('my-inscriptions-list');
    if (inscriptionsList) {
        const myInscriptions = allInscriptions.filter(insc => insc.userEmail === loggedInUserEmail);
        const renderInscriptions = () => {
            inscriptionsList.innerHTML = '';
            if (myInscriptions.length === 0) {
                inscriptionsList.innerHTML = '<p>Você ainda não se inscreveu em nenhum evento.</p>';
                return;
            }
            myInscriptions.forEach(inscription => {
                const card = document.createElement('li');
                card.className = 'event-card';
                card.innerHTML = `
                    <h3>${inscription.eventName}</h3>
                    <p>Data: ${inscription.eventDate}</p>
                    <p><strong>Status: ${inscription.status}</strong></p>
                    <button class="cancel-btn" data-event-name="${inscription.eventName}">Cancelar Inscrição</button>
                `;
                inscriptionsList.appendChild(card);
            });
        };
        renderInscriptions();
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
            
            // Procura na lista de inscrições pelo email ou CPF
            foundInscription = allInscriptions.find(insc => insc.userEmail === searchTerm);
            // Poderia adicionar busca por CPF aqui...

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
                    saveAllData(); // Salva a alteração no localStorage
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