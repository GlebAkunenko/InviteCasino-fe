document.addEventListener("DOMContentLoaded", () => {
    let balance = 1000;
    let bet = 10;

    const balanceInput = document.getElementById('balance');
    const betInput = document.getElementById('bet');
    const playButton = document.getElementById('playButton');
    const carousel = document.getElementById('carousel');

    balanceInput.value = balance;

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
        let speed = 20; // Начальная скорость прокрутки (меньше - быстрее)
        let position = 0;

        // Функция, которая прокручивает карточки
        const moveCards = () => {
            position -= speed; // смещение карточек
            carousel.style.transform = `translateX(${position}px)`;

            speed *= 0.99
            // Если прокрутка не завершена, продолжаем анимацию
            if (speed > 0.5) {
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


    // Обработчик для кнопки "Играть"
    playButton.addEventListener('click', () => {
        const bet = parseInt(betInput.value)
        if (bet > balance) {
            alert('Недостаточно средств для ставки');
            return;
        }

        // Отправка ставки на сервер (API)
        fetch(`http://localhost:8000/play?bet=${bet}`, { // Замените на ваш endpoint
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


});
