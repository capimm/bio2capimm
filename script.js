// Smooth scrolling for navigation links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        document.querySelector(this.getAttribute('href')).scrollIntoView({
            behavior: 'smooth'
        });
    });
});

// Intersection Observer for animations
const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('animate');
        }
    });
}, observerOptions);

// Observe all elements with animate-on-scroll class
document.querySelectorAll('.animate-on-scroll').forEach(el => {
    observer.observe(el);
});

// Enhanced scroll effects
let lastScrollY = window.scrollY;

window.addEventListener('scroll', () => {
    const scrolled = window.pageYOffset;
    const rate = scrolled * -0.5;

    // Parallax effect for sections
    document.querySelectorAll('.section').forEach((section, index) => {
        const speed = (index + 1) * 0.1;
        section.style.transform = `translateY(${rate * speed}px)`;
    });

    // Dynamic header opacity based on scroll direction
    const header = document.querySelector('header');
    if (scrolled > lastScrollY && scrolled > 100) {
        header.style.transform = 'translateY(-100%)';
    } else {
        header.style.transform = 'translateY(0)';
    }
    lastScrollY = scrolled;

    // Scale effect on cards based on scroll
    const cards = document.querySelectorAll('.card');
    cards.forEach(card => {
        const rect = card.getBoundingClientRect();
        const centerY = rect.top + rect.height / 2;
        const windowCenter = window.innerHeight / 2;
        const distance = Math.abs(centerY - windowCenter);
        const scale = Math.max(0.8, 1 - distance / window.innerHeight);
        card.style.transform = `scale(${scale})`;
    });
});

// Header background change on scroll
window.addEventListener('scroll', () => {
    const header = document.querySelector('header');
    if (window.scrollY > 100) {
        header.style.background = 'rgba(0, 0, 0, 1)';
    } else {
        header.style.background = 'rgba(0, 0, 0, 0.9)';
    }
});

// Typing effect for the welcome message
const welcomeText = "Bem-vinda a Minha Bio :D";
const welcomeElement = document.querySelector('#inicio h1');
let i = 0;

function typeWriter() {
    if (i < welcomeText.length) {
        welcomeElement.innerHTML += welcomeText.charAt(i);
        i++;
        setTimeout(typeWriter, 100);
    }
}

// Start typing effect when page loads
window.addEventListener('load', () => {
    setTimeout(() => {
        document.getElementById('loading').classList.add('hidden');
        setTimeout(() => {
            document.getElementById('loading').style.display = 'none';
        }, 500);
    }, 2000); // Show loading for 2 seconds

    welcomeElement.innerHTML = '';
    typeWriter();
    loadPortfolioData();
});

function loadPortfolioData() {
    const data = JSON.parse(localStorage.getItem('portfolioData'));
    if (data) {
        document.getElementById('inicio-text').textContent = data.inicio.text;
        document.getElementById('inicio-img').src = data.inicio.img;

        for (let i = 1; i <= 3; i++) {
            document.getElementById(`projeto${i}-title`).textContent = data.projetos[i-1].title;
            document.getElementById(`projeto${i}-desc`).textContent = data.projetos[i-1].desc;
            document.getElementById(`projeto${i}-img`).src = data.projetos[i-1].img;
            document.getElementById(`projeto${i}-link`).href = data.projetos[i-1].link;

            // Make the card clickable
            const card = document.getElementById(`projeto${i}-link`).parentElement;
            card.style.cursor = 'pointer';
            card.onclick = () => window.open(data.projetos[i-1].link, '_blank');
        }

        if (data.contatos) {
            // Footer links
            document.getElementById('discord-link-footer').href = data.contatos.discord.startsWith('http') ? data.contatos.discord : `https://discord.gg/${data.contatos.discord}`;
            document.getElementById('tiktok-link-footer').href = data.contatos.tiktok.startsWith('http') ? data.contatos.tiktok : `https://tiktok.com/@${data.contatos.tiktok}`;
            document.getElementById('email-link-footer').href = `mailto:${data.contatos.email}`;
            document.getElementById('youtube-link-footer').href = data.contatos.youtube.startsWith('http') ? data.contatos.youtube : `https://youtube.com/@${data.contatos.youtube}`;
        }
    }
}

// Mouse follow effect for cards
document.addEventListener('mousemove', (e) => {
    const cards = document.querySelectorAll('.card');
    cards.forEach(card => {
        const rect = card.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        card.style.setProperty('--mouse-x', `${x}px`);
        card.style.setProperty('--mouse-y', `${y}px`);
    });
});

// Particle effect (simple)
function createParticle() {
    const particle = document.createElement('div');
    particle.className = 'particle';
    particle.style.left = Math.random() * 100 + 'vw';
    particle.style.animationDuration = Math.random() * 3 + 2 + 's';
    document.body.appendChild(particle);

    setTimeout(() => {
        particle.remove();
    }, 5000);
}

setInterval(createParticle, 200);

// Custom cursor trail
const cursorTrail = document.createElement('div');
cursorTrail.className = 'cursor-trail';
document.body.appendChild(cursorTrail);

let trailX = 0;
let trailY = 0;

document.addEventListener('mousemove', (e) => {
    trailX = e.clientX;
    trailY = e.clientY;
});

function updateCursorTrail() {
    cursorTrail.style.left = trailX - 2.5 + 'px';
    cursorTrail.style.top = trailY - 2.5 + 'px';

    requestAnimationFrame(updateCursorTrail);
}

updateCursorTrail();

// Add particle styles dynamically
const particleStyle = document.createElement('style');
particleStyle.textContent = `
    .particle {
        position: absolute;
        width: 4px;
        height: 4px;
        background: rgba(0, 255, 0, 0.5);
        border-radius: 50%;
        pointer-events: none;
        animation: float 5s linear infinite;
        top: 100vh;
    }

    @keyframes float {
        to {
            transform: translateY(-100vh);
        }
    }

    .card {
        background: radial-gradient(circle at var(--mouse-x, 50%) var(--mouse-y, 50%), rgba(0, 255, 0, 0.1), rgba(0, 0, 0, 0.8));
    }
`;
document.head.appendChild(particleStyle);

// Fetch a random quote from an API
async function fetchQuote() {
    try {
        const response = await fetch('https://api.quotable.io/random');
        const data = await response.json();
        document.getElementById('quote-text').textContent = `"${data.content}"`;
        document.getElementById('quote-author').textContent = `- ${data.author}`;
    } catch (error) {
        console.error('Erro ao buscar citação:', error);
        document.getElementById('quote-text').textContent = '"A vida é o que acontece enquanto você está ocupado fazendo outros planos."';
        document.getElementById('quote-author').textContent = '- John Lennon';
    }
}

// Back to Top Button
const backToTopButton = document.getElementById('back-to-top');

window.addEventListener('scroll', () => {
    if (window.pageYOffset > 300) {
        backToTopButton.classList.add('show');
    } else {
        backToTopButton.classList.remove('show');
    }
});

backToTopButton.addEventListener('click', () => {
    window.scrollTo({
        top: 0,
        behavior: 'smooth'
    });
});

// Projects data with ngc property
const projects = [
    { id: 1, title: 'Meu server de Mine - Ta32', desc: 'O meu server de mine é um diferenciado, ele tem varios modos como 1-Rei da colina \' 2-Stick nock \' 3-Pega bloco , e mais alguns.', img: 'https://i.pinimg.com/1200x/f1/48/27/f14827c3b348d5416b6c354a5c2363b8.jpg', link: 'https://fogao0.github.io/Ta32', ngc: true },
    { id: 2, title: 'Projeto 2', desc: 'Embreve o projeto 2.', img: 'https://via.placeholder.com/300x200?text=Projeto+2', link: '#', ngc: true },
    { id: 3, title: 'Projeto 3', desc: 'Embreve o projeto 3.', img: 'https://via.placeholder.com/300x200?text=Projeto+3', link: '#', ngc: true },
    { id: 4, title: 'Projeto 4', desc: 'Descrição breve do projeto 4.', img: 'https://via.placeholder.com/300x200?text=Projeto+4', link: '#', ngc: true },
    { id: 5, title: 'Projeto 5', desc: 'Descrição breve do projeto 5.', img: 'https://via.placeholder.com/300x200?text=Projeto+5', link: '#', ngc: true },
    { id: 6, title: 'Projeto 6', desc: 'Descrição breve do projeto 6.', img: 'https://via.placeholder.com/300x200?text=Projeto+6', link: '#', ngc: false },
    { id: 7, title: 'Projeto 7', desc: 'Descrição breve do projeto 7.', img: 'https://via.placeholder.com/300x200?text=Projeto+7', link: '#', ngc: true },
    { id: 8, title: 'Projeto 8', desc: 'Descrição breve do projeto 8.', img: 'https://via.placeholder.com/300x200?text=Projeto+8', link: '#', ngc: true },
    { id: 9, title: 'Projeto 9', desc: 'Descrição breve do projeto 9.', img: 'https://via.placeholder.com/300x200?text=Projeto+9', link: '#', ngc: false },
    { id: 10, title: 'Projeto 10', desc: 'Descrição breve do projeto 10.', img: 'https://via.placeholder.com/300x200?text=Projeto+10', link: '#', ngc: true },
    { id: 11, title: 'Projeto 11', desc: 'Descrição breve do projeto 11.', img: 'https://via.placeholder.com/300x200?text=Projeto+11', link: '#', ngc: true },
    { id: 12, title: 'Projeto 12', desc: 'Descrição breve do projeto 12.', img: 'https://via.placeholder.com/300x200?text=Projeto+12', link: '#', ngc: true },
    { id: 13, title: 'Projeto 13', desc: 'Descrição breve do projeto 13.', img: 'https://via.placeholder.com/300x200?text=Projeto+13', link: '#', ngc: true }
];

const maxProjects = 4; // Número de 1 a 500 que define o máximo de projetos a aparecer
const availableProjects = projects.filter(p => p.ngc).slice(0, maxProjects);

// Infinite Scrolling
let loadedCount = 3; // Starting with 3 projects already loaded in HTML

function loadMoreProjects() {
    if (loadedCount >= availableProjects.length) return; // Stop if all available projects are loaded

    const projetosSection = document.getElementById('projetos');
    const cardsContainer = projetosSection.querySelector('.cards-container');

    const projectsToLoad = Math.min(3, availableProjects.length - loadedCount); // Load up to 3 or remaining

    for (let i = 0; i < projectsToLoad; i++) {
        const project = availableProjects[loadedCount];
        loadedCount++;
        const newCard = document.createElement('div');
        newCard.className = 'card animate-on-scroll';
        newCard.innerHTML = `
            <img src="${project.img}" alt="${project.title}">
            <h3>${project.title}</h3>
            <p>${project.desc}</p>
            <a href="${project.link}" class="btn" target="_blank">Ver Projeto</a>
        `;
        cardsContainer.appendChild(newCard);
    }

    // Re-observe new cards for animations
    document.querySelectorAll('.animate-on-scroll').forEach(el => {
        observer.observe(el);
    });
}

window.addEventListener('scroll', () => {
    if (window.innerHeight + window.pageYOffset >= document.body.offsetHeight - 100) {
        loadMoreProjects();
    }
});

// Call the function when the page loads
window.addEventListener('load', () => {
    // fetchQuote(); // Removed as per user request
});


