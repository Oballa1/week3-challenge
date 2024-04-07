
document.addEventListener('DOMContentLoaded', () => {
    // DOM elements
    const movieTitle = document.getElementById('films'); // Movie title list
    const poster = document.getElementById('poster'); // Film poster
    const title = document.getElementById('title'); // Film title
    const runtime = document.getElementById('runtime'); // Film runtime
    const description = document.getElementById('film-info'); // Film description
    const showtime = document.getElementById('showtime'); // Film showtime
    const ticketNum = document.getElementById('ticket-num'); // Number of available tickets
    const buyButton = document.getElementById('buy-ticket'); // Buy ticket button

    // Fetch films from server
    fetch('http://localhost:3000/films')
    .then(response => response.json())
    .then(films => {
        // Clear existing movie title list
        movieTitle.innerHTML = '';
        // Loop through each film
        films.forEach((film) => {
            // Create list item for film
            const li = document.createElement('li');
            li.classList.add('film', 'item'); // Add CSS classes
            li.textContent = film.title; // Set film title
            li.id = `film-${film.id}`; // Set unique ID
            movieTitle.appendChild(li); // Append to movie title list
            // Mark as sold out if no tickets left
            if (film.capacity - film.tickets_sold === 0) {
                li.classList.add('sold-out');
            }

            // Add event listener to display film details on click
            li.addEventListener('click', () => displayFilmDetails(film));

            // Add delete button next to each film
            const deleteButton = document.createElement('button');
            deleteButton.textContent = 'Delete';
            deleteButton.classList.add('delete-button');
            deleteButton.addEventListener('click', (event) => {
                event.stopPropagation(); // Prevent li click event
                deleteFilm(film.id);
            });
            li.appendChild(deleteButton);
        });
        // Display details of first film by default
        if (films.length > 0) {
            displayFilmDetails(films[0]);
        }
    })
    .catch(error => console.error('Error fetching films:', error));

    // Function to display film details
    function displayFilmDetails(film) {
        // Update UI with film details
        poster.src = film.poster;
        title.textContent = film.title;
        runtime.textContent = `${film.runtime} minutes`;
        description.textContent = film.description;
        showtime.textContent = film.showtime;
        ticketNum.textContent = film.capacity - film.tickets_sold;

        // Update buy button based on availability
        if (film.capacity - film.tickets_sold > 0) {
            buyButton.textContent = 'Buy Ticket';
            buyButton.disabled = false;
        } else {
            buyButton.textContent = 'Sold Out';
            buyButton.disabled = true;
        }

        // Add event listener to buy button
        buyButton.removeEventListener('click', buyTicket); // Remove previous event listener
        buyButton.addEventListener('click', () => buyTicket(film));
    };

    // Function to buy a ticket
    function buyTicket(film) {
        // Parse available ticket number
        let availableTickets = parseInt(ticketNum.textContent);
        // Check if tickets are available
        if (availableTickets > 0) {
            // Decrease available ticket count
            availableTickets--;
            ticketNum.textContent = availableTickets; // Update displayed ticket number
            // Update tickets_sold for the film
            fetch(`http://localhost:3000/films/${film.id}`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    tickets_sold: film.tickets_sold + 1
                })
            })
            .then(response => response.json())
            .then(updatedFilm => {
                film.tickets_sold = updatedFilm.tickets_sold; // Update film object
                console.log('Ticket purchased successfully!');

                // Update buy button based on availability
                if (availableTickets === 0) {
                    buyButton.textContent = 'Sold Out';
                    buyButton.disabled = true;
                }

            })
            .catch(error => console.error('Error purchasing ticket:', error));
        } else {
            alert('There are no available tickets for this film. Please try another film.');
        }
    }

    // Function to delete a film
    function deleteFilm(filmId) {
        fetch(`http://localhost:3000/films/${filmId}`, {
            method: 'DELETE'
        })
        .then(response => response.json())
        .then(() => {
            // Remove film from UI
            const filmItem = document.getElementById(`film-${filmId}`);
            if (filmItem) {
                filmItem.remove();
            }
            console.log('Film deleted successfully!');
        })
        .catch(error => console.error('Error deleting film:', error));
    }
});
