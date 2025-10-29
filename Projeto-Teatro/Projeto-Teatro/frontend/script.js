document.addEventListener('DOMContentLoaded', () => {
    // --- LÓGICA DE TEMA E ELEMENTOS GLOBAIS ---
    const themeSwitcher = document.getElementById('theme-switcher');
    const themeLink = document.getElementById('theme-link');
    const savedTheme = localStorage.getItem('theme');

    const applyTheme = (theme) => {
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
    let allUsers = JSON.parse(localStorage.getItem('allUsers')) || [
        { id: 'user001', name: "Carlos Andrade", cpf: "111.222.333-44", email: "carlos.andrade@email.com" }
    ];
    let allInscriptions = JSON.parse(localStorage.getItem('allInscriptions')) || [
        { userEmail: 'carlos.andrade@email.com', eventName: 'Workshop de Java Avançado', eventDate: '15 de Novembro de 2025', status: 'Inscrito' }
    ];

    const saveAllData = () => {
        localStorage.setItem('allUsers', JSON.stringify(allUsers));
        localStorage.setItem('allInscriptions', JSON.stringify(allInscriptions));
    };

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
    
    if (!loggedInUser && (window.location.pathname.includes('minhas_inscricoes.html'))) {
        window.location.href = 'index.html';
        return; 
    }

    // --- LÓGICA DA PÁGINA DE EVENTOS (index.html) ---

    // Referências do Cabeçalho
    const loginLink = document.getElementById('login-link');
    const minhasInscricoesLink = document.getElementById('minhas-inscricoes-link');
    const logoutLink = document.getElementById('logout-link');
    
    // NOVO ELEMENTO PARA O NOME
    const userGreeting = document.getElementById('user-greeting'); 

    // Referências do Modal de Login
    const openLoginModalBtn = document.getElementById('open-login-modal-btn');
    const loginModal = document.getElementById('login-modal');
    const loginForm = document.getElementById('login-form');

    // **FUNÇÃO DE UI ATUALIZADA**
    const updateHeaderUI = () => {
        if (loggedInUser) {
            // -- ESTADO LOGADO --
            if(loginLink) loginLink.classList.add('hidden');
            if(minhasInscricoesLink) minhasInscricoesLink.classList.remove('hidden');
            if(logoutLink) logoutLink.classList.remove('hidden');

            // MOSTRA O NOME NO LOCAL CORRETO
            if(userGreeting) {
                const firstName = loggedInUser.name.split(' ')[0]; 
                userGreeting.textContent = `Olá, ${firstName}`;
                userGreeting.classList.remove('hidden');
            }

            // Faz o botão "Sair" funcionar
            if(logoutLink) {
                logoutLink.addEventListener('click', (e) => {
                    e.preventDefault();
                    localStorage.removeItem('loggedInUserEmail');
                    window.location.reload(); 
                });
            }
        } else {
            // -- ESTADO DESLOGADO --
            if(loginLink) loginLink.classList.remove('hidden');
            if(minhasInscricoesLink) minhasInscricoesLink.classList.add('hidden');
            if(logoutLink) logoutLink.classList.add('hidden');

            // ESCONDE O NOME
            if(userGreeting) {
                userGreeting.textContent = '';
                userGreeting.classList.add('hidden');
            }
        }
    };

    // Lógica para ABRIR E FECHAR o modal de login
    if (loginModal) {
        const closeLoginModalBtn = loginModal.querySelector('.close-modal');

        if (openLoginModalBtn) {
            openLoginModalBtn.addEventListener('click', (e) => {
                e.preventDefault();
                loginModal.classList.remove('hidden');
            });
        }

        const closeModal = () => {
            loginModal.classList.add('hidden');
        };

        if(closeLoginModalBtn) closeLoginModalBtn.addEventListener('click', closeModal);
        
        loginModal.addEventListener('click', (e) => {
            if (e.target === loginModal) {
                closeModal();
            }
        });
    }

    // Lógica de SUBMISSÃO do formulário de login
    if (loginForm) {
        loginForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const email = document.getElementById('login-email').value;
            const userExists = allUsers.find(user => user.email === email);
            
            if (userExists) {
                localStorage.setItem('loggedInUserEmail', email);
                alert('Login bem-sucedido!');
                window.location.reload(); 
            } else {
                alert('Usuário não encontrado. Verifique o email ou cadastre-se.');
            }
        });
    }

    // --- LÓGICA DO MODAL DE INSCRIÇÃO (eventos.html / index.html) ---
    const subscribeButtons = document.querySelectorAll('.subscribe-btn');
    const modalOverlay = document.getElementById('registration-modal');
    
    if (subscribeButtons.length > 0 && modalOverlay) {
        const modalForm = document.getElementById('checkin-form');
        const closeModalBtn = modalOverlay.querySelector('.close-modal');
        const modalEventName = document.getElementById('modal-event-name');
        
        const checkinNameInput = document.getElementById('checkin-name');
        const checkinCpfInput = document.getElementById('checkin-cpf');
        const checkinEmailInput = document.getElementById('checkin-email');

        let currentEventName = '';
        let currentEventDate = '';

        subscribeButtons.forEach(button => {
            button.addEventListener('click', () => {
                
                // *** LÓGICA DE BLOQUEIO CORRETA ***
                if (!loggedInUser) {
                    if(loginModal) loginModal.classList.remove('hidden');
                    return; 
                }
                
                // Se estiver logado, continua para a inscrição
                currentEventName = button.getAttribute('data-event-name');
                const eventCard = button.parentElement;
                currentEventDate = eventCard.querySelector('p:nth-child(2)').textContent.replace('Data: ', '');

                modalEventName.textContent = currentEventName;

                checkinNameInput.value = loggedInUser.name;
                checkinCpfInput.value = loggedInUser.cpf;
                checkinEmailInput.value = loggedInUser.email;

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
                closeModal();
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

            alert('Inscrição realizada com sucesso! Verifique em "Minhas Inscrições".');
            closeModal();
        });
    }

   // --- LÓGICA DA PÁGINA "MINHAS INSCRIÇÕES" (minhas_inscricoes.html) ---
    const inscriptionsList = document.getElementById('my-inscriptions-list');
    if (inscriptionsList && loggedInUserEmail) {
        
        const renderInscriptions = () => {
            const myInscriptions = allInscriptions.filter(insc => insc.userEmail === loggedInUserEmail);
            inscriptionsList.innerHTML = ''; 

            if (myInscriptions.length === 0) {
                inscriptionsList.innerHTML = '<p style="text-align: center; margin-top: 20px;">Você ainda não se inscreveu em nenhum evento.</p>';
                return;
            }

            myInscriptions.forEach(inscription => {
                const card = document.createElement('li');
                card.className = 'event-card';
                
                card.innerHTML = `
                    <h3>${inscription.eventName}</h3>
                    <p>Data: ${inscription.eventDate}</p>
                    <p><strong>Status: ${inscription.status}</strong></p>
                    
                    <div class="card-actions">
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
        
        renderInscriptions();

        inscriptionsList.addEventListener('click', (e) => {
            const eventName = e.target.getAttribute('data-event-name');
            if (!eventName) return; 

            if (e.target.classList.contains('checkin-btn')) {
                const inscriptionToUpdate = allInscriptions.find(
                    insc => insc.userEmail === loggedInUserEmail && insc.eventName === eventName
                );
                if (inscriptionToUpdate && inscriptionToUpdate.status === 'Inscrito') {
                    inscriptionToUpdate.status = 'Presença Confirmada';
                    saveAllData(); 
                    renderInscriptions(); 
                    alert('Check-in realizado com sucesso!');
                }
            }

            if (e.target.classList.contains('cancel-btn')) {
                if (confirm(`Tem certeza que deseja cancelar a inscrição em "${eventName}"?`)) {
                    allInscriptions = allInscriptions.filter(
                        insc => !(insc.userEmail === loggedInUserEmail && insc.eventName === eventName)
                    );
                    saveAllData(); 
                    renderInscriptions(); 
                    alert('Inscrição cancelada.');
                }
            }
        });
    }
    
    // --- INICIALIZAÇÃO DA UI DO CABEÇALHO ---
    updateHeaderUI();

});