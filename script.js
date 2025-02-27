const API = "localhost:8000"

document.addEventListener("DOMContentLoaded", () => {
    let balance = 0;
    let userName = '';

    let balanceInput, playButton, betInput;
    const nameInput = document.getElementById('name');
    const authButton = document.getElementById('authButton');

    authButton.addEventListener('click', () => {
        nameInput.disabled = true;
        userName = nameInput.value.trim();
        fetch(`http://${API}/user?user=${userName}`, { // Замените на ваш endpoint
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            }
        })
            .then(response => {
                const block = document.createElement('div');
                block.innerHTML = `
                    <div class="input-group">
                        <label for="balance">Баланс: </label>
                        <input type="text" id="balance" value="0" disabled>
                    </div>
                    <div class="input-group">
                        <label for="bet">Ставка: </label>
                        <input type="number" id="bet" value="0">
                    </div>
                `;
                document.getElementById("panel").appendChild(block);
                playButton = document.createElement('button');
                playButton.classList.add('button');
                playButton.textContent = 'Играть';
                playButton.addEventListener('click', () => {
                    const bet = parseInt(betInput.value)
                    if (bet > balance) {
                        alert('Недостаточно средств для ставки');
                        return;
                    }

                    // Отправка ставки на сервер (API)
                    fetch(`http://${API}/play?user=${userName}&bet=${bet}`, { // Замените на ваш endpoint
                        method: 'GET',
                        headers: {
                            'Content-Type': 'application/json',
                        }
                    })
                        .then(response => response.json())
                        .then(data => {
                            createCards(data.slots);
                            playButton.disabled = true; // Отключаем кнопку
                            startScrolling(data.win); // Запускаем анимацию прокрутки
                        })
                        .catch(error => {
                            console.error('Ошибка:', error);
                        });

                    // Уменьшаем баланс на ставку
                    balance -= bet;
                    balanceInput.value = balance;
                });

                function updateBalance() {
                    if (!playButton.disabled) {
                        fetchBalance();
                    }
                }

                updateBalance();
                setInterval(updateBalance, 1000);

                document.getElementById('playButtonPlace').appendChild(playButton);
                authButton.remove();

                balanceInput = document.getElementById('balance');
                betInput = document.getElementById('bet');
            })
            .catch(error => {
                console.error('Ошибка:', error);
            });
    });

    function fetchBalance() {
        fetch(`http://${API}/balance?user=${userName}`, { // Замените на ваш endpoint
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            }
        })
            .then(response => response.text()).then(data => {
                balance = parseInt(data);
                balanceInput.value = data;
            })
            .catch(error => {
                console.error('Ошибка:', error);
            });
    }


    function createCards(cardsData) {
        while (carousel.firstChild) {
            carousel.removeChild(carousel.firstChild);
        }
        cardsData.forEach(card => {
            const cardElement = document.createElement('div');
            cardElement.classList.add('card');
            cardElement.classList.add(card.style)
            cardElement.textContent = card.value > 0 ? `+${card.value}`  : card.value;
            carousel.appendChild(cardElement);
        });
    }

    // Функция для анимации прокрутки
    function startScrolling(win) {
        // Время для прокрутки, которое будет уменьшаться
        let speed = 25; // Начальная скорость прокрутки (меньше - быстрее)
        let position = 0;

        // Функция, которая прокручивает карточки
        const moveCards = () => {
            position -= speed; // смещение карточек
            carousel.style.transform = `translateX(${position}px)`;

            speed *= 0.996
            // Если прокрутка не завершена, продолжаем анимацию
            if (speed > 0.35) {
                requestAnimationFrame(moveCards);
            } else {
                playButton.disabled = false;
                speed = 0;
                balance += win;
                balanceInput.value = balance;
            }
        };

        // Запуск прокрутки
        moveCards();
    }



});
