document.addEventListener('DOMContentLoaded', () => {
    // DOM elements
    const movieList = document.getElementById('films'); // Movie title list
    const moviePoster = document.getElementById('poster'); // Film poster
    const movieTitle = document.getElementById('title'); // Film title
    const movieRuntime = document.getElementById('runtime'); // Film runtime
    const movieDescription = document.getElementById('film-info'); // Film description
    const movieShowtime = document.getElementById('showtime'); // Film showtime
    const ticketCount = document.getElementById('ticket-num'); // Number of available tickets
    const buyTicketButton = document.getElementById('buy-ticket'); // Buy ticket button

    // Fetch films from server
    fetch('http://localhost:3000/films')
        .then(response => response.json())
        .then(films => {
            // Clear existing movie title list
            movieList.innerHTML = '';
            // Loop through each film
            films.forEach((film) => {
                // Create list item for film
                const listItem = document.createElement('li');
                listItem.classList.add('film', 'item'); // Add CSS classes
                listItem.textContent = film.title; // Set film title
                listItem.id = `film-${film.id}`; // Set unique ID
                movieList.appendChild(listItem); // Append to movie title list
                // Mark as sold out if no tickets left
                if (film.capacity - film.tickets_sold === 0) {
                    listItem.classList.add('sold-out');
                }

                // Add event listener to display film details on click
                listItem.addEventListener('click', () => displayFilmDetails(film));

                // Add delete button next to each film
                const deleteButton = document.createElement('button');
                deleteButton.textContent = 'Delete';
                deleteButton.classList.add('delete-button');
                deleteButton.addEventListener('click', (event) => {
                    event.stopPropagation(); // Prevent li click event
                    deleteFilm(film.id);
                });
                listItem.appendChild(deleteButton);
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
        moviePoster.src = film.poster;
        movieTitle.textContent = film.title;
        movieRuntime.textContent = `${film.runtime} minutes`;
        movieDescription.textContent = film.description;
        movieShowtime.textContent = film.showtime;
        ticketCount.textContent = film.capacity - film.tickets_sold;

        // Update buy button based on availability
        if (film.capacity - film.tickets_sold > 0) {
            buyTicketButton.textContent = 'Buy Ticket';
            buyTicketButton.disabled = false;
        } else {
            buyTicketButton.textContent = 'Sold Out';
            buyTicketButton.disabled = true;
        }

        // Add event listener to buy button
        buyTicketButton.removeEventListener('click', buyTicket); // Remove previous event listener
        buyTicketButton.addEventListener('click', () => buyTicket(film));
    };

    // Function to buy a ticket
    function buyTicket(film) {
        // Parse available ticket number
        let availableTickets = parseInt(ticketCount.textContent);
        // Check if tickets are available
        if (availableTickets > 0) {
            // Decrease available ticket count
            availableTickets--;
            ticketCount.textContent = availableTickets; // Update displayed ticket number
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
                        buyTicketButton.textContent = 'Sold Out';
                        buyTicketButton.disabled = true;
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
