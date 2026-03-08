// State
let currentSong = null;
let isPlaying = false;
let songs = [];

// DOM Elements
const audioPlayer = document.getElementById('audio-player');
const playPauseBtn = document.getElementById('play-pause-btn');
const progress = document.getElementById('progress');
const progressContainer = document.getElementById('progress-container');
const currentTimeSpan = document.getElementById('current-time');
const totalTimeSpan = document.getElementById('total-time');
const nowPlayingCover = document.getElementById('now-playing-cover');
const nowPlayingTitle = document.getElementById('now-playing-title');
const nowPlayingArtist = document.getElementById('now-playing-artist');
const songsGrid = document.getElementById('songs-grid');
const popularList = document.getElementById('popular-list');
const lyricsModal = document.getElementById('lyrics-modal');
const lyricsContent = document.getElementById('lyrics-content');
const lyricsSongTitle = document.getElementById('lyrics-song-title');
const showLyricsBtn = document.getElementById('show-lyrics-btn');
const closeLyricsBtn = document.getElementById('close-lyrics');

// Fetch songs dari backend
async function fetchSongs() {
    try {
        const response = await fetch('/api/songs');
        songs = await response.json();
        displaySongs();
        displayPopularSongs();
    } catch (error) {
        console.error('Error fetching songs:', error);
    }
}

// Display songs di grid
function displaySongs() {
    songsGrid.innerHTML = songs.map(song => `
        <div class="song-card" onclick="playSong(${song.id})">
            <img src="${song.cover || 'https://via.placeholder.com/200'}" alt="${song.title}" class="song-cover">
            <h4>${song.title}</h4>
            <p>${song.artist}</p>
        </div>
    `).join('');
}

// Display popular songs
function displayPopularSongs() {
    popularList.innerHTML = songs.map(song => `
        <div class="popular-item" onclick="playSong(${song.id})">
            <img src="${song.cover || 'https://via.placeholder.com/40'}" alt="${song.title}">
            <div class="popular-item-info">
                <h4>${song.title}</h4>
                <p>${song.artist}</p>
            </div>
        </div>
    `).join('');
}

// Play song
async function playSong(songId) {
    const song = songs.find(s => s.id === songId);
    if (!song) return;

    currentSong = song;
    
    // Update UI
    nowPlayingCover.src = song.cover || 'https://via.placeholder.com/56';
    nowPlayingTitle.textContent = song.title;
    nowPlayingArtist.textContent = song.artist;
    
    // Set audio source
    audioPlayer.src = song.audio;
    
    // Play audio
    try {
        await audioPlayer.play();
        isPlaying = true;
        playPauseBtn.innerHTML = '<i class="fas fa-pause"></i>';
    } catch (error) {
        console.error('Error playing audio:', error);
    }
}

// Toggle play/pause
function togglePlay() {
    if (!currentSong) {
        // Play first song if none selected
        if (songs.length > 0) {
            playSong(songs[0].id);
        }
        return;
    }

    if (isPlaying) {
        audioPlayer.pause();
        playPauseBtn.innerHTML = '<i class="fas fa-play"></i>';
    } else {
        audioPlayer.play();
        playPauseBtn.innerHTML = '<i class="fas fa-pause"></i>';
    }
    isPlaying = !isPlaying;
}

// Update progress bar
function updateProgress() {
    if (audioPlayer.duration) {
        const progressPercent = (audioPlayer.currentTime / audioPlayer.duration) * 100;
        progress.style.width = `${progressPercent}%`;
        
        // Update time
        currentTimeSpan.textContent = formatTime(audioPlayer.currentTime);
        totalTimeSpan.textContent = formatTime(audioPlayer.duration);
    }
}

// Format time (detik ke menit:detik)
function formatTime(seconds) {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
}

// Set progress bar saat diklik
function setProgress(e) {
    const width = this.clientWidth;
    const clickX = e.offsetX;
    const duration = audioPlayer.duration;
    audioPlayer.currentTime = (clickX / width) * duration;
}

// Show lyrics
async function showLyrics() {
    if (!currentSong) {
        alert('Pilih lagu terlebih dahulu');
        return;
    }

    try {
        const response = await fetch(`/api/songs/${currentSong.id}/lyrics`);
        const data = await response.json();
        
        lyricsSongTitle.textContent = `${currentSong.title} - ${currentSong.artist}`;
        lyricsContent.textContent = data.lyrics || 'Lirik tidak tersedia';
        lyricsModal.style.display = 'block';
    } catch (error) {
        console.error('Error fetching lyrics:', error);
        lyricsContent.textContent = 'Gagal memuat lirik';
        lyricsModal.style.display = 'block';
    }
}

// Event Listeners
playPauseBtn.addEventListener('click', togglePlay);
audioPlayer.addEventListener('timeupdate', updateProgress);
audioPlayer.addEventListener('ended', () => {
    isPlaying = false;
    playPauseBtn.innerHTML = '<i class="fas fa-play"></i>';
    progress.style.width = '0%';
    currentTimeSpan.textContent = '0:00';
});

progressContainer.addEventListener('click', setProgress);
showLyricsBtn.addEventListener('click', showLyrics);
closeLyricsBtn.addEventListener('click', () => {
    lyricsModal.style.display = 'none';
});

window.addEventListener('click', (e) => {
    if (e.target === lyricsModal) {
        lyricsModal.style.display = 'none';
    }
});

// Inisialisasi
fetchSongs();

// Keyboard shortcuts
document.addEventListener('keydown', (e) => {
    if (e.code === 'Space') {
        e.preventDefault();
        togglePlay();
    }
});