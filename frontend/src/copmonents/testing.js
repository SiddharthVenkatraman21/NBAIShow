import React, { useEffect, useState, useRef } from 'react';
import axios from 'axios';

// Helper function to format duration in MM:SS format
const formatDuration = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    return `${minutes}:${remainingSeconds < 10 ? '0' : ''}${remainingSeconds}`;
};

function Testing() {
    const [podcasts, setPodcasts] = useState([]);
    const audioRefs = useRef([]); // Array of audio elements
    const [currentTime, setCurrentTime] = useState([]); // Store current time for progress bar
    const [duration, setDuration] = useState([]); // Store duration for progress bar
    const [isPlaying, setIsPlaying] = useState([]); // Store playing state for each podcast

    useEffect(() => {
        axios
            .get('https://mayeisk92c.execute-api.us-east-1.amazonaws.com/prod')
            .then(response => {
                const podcastsData = JSON.parse(response.data.body).map(podcast => {
                    if (podcast.S3Url && podcast.S3Url.endsWith('/')) {
                        podcast.S3Url = podcast.S3Url.slice(0, -1);
                    }
                    return podcast;
                });
    
                // Sort podcasts by timestamp in descending order
                const sortedPodcasts = podcastsData.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
    
                // Set the podcasts state with the sorted data
                setPodcasts(sortedPodcasts);
    
                // Initialize the state arrays for the audio players
                setCurrentTime(new Array(sortedPodcasts.length).fill(0));
                setDuration(new Array(sortedPodcasts.length).fill(0));
                setIsPlaying(new Array(sortedPodcasts.length).fill(false));
            })
            .catch(err => console.error(err));
    }, []);
    

    // Function to get the MP3 duration


    // Format date and description for the top podcast
    const formatDateAndDescription = (dateString, description) => {
        const options = { month: 'short', day: 'numeric' };
        const date = new Date(dateString);
        const formattedDate = new Intl.DateTimeFormat('en-US', options).format(date);
        return `${formattedDate}: ${description || 'No description available'}`;
    };

    const handlePlayButtonClick = (index) => {
        const audio = audioRefs.current[index]; // Get the current audio element for the clicked podcast
        const isCurrentlyPlaying = isPlaying[index]; // Get the current play state for this podcast
      
        // Pause any other playing podcast
        isPlaying.forEach((playing, i) => {
          if (playing && i !== index) {
            const otherAudio = audioRefs.current[i];
            if (otherAudio && !otherAudio.paused) {
              otherAudio.pause();
              setIsPlaying(prev => {
                const updated = [...prev];
                updated[i] = false;
                return updated;
              });
            }
          }
        });
      
        // Play or pause the clicked podcast
        if (audio) {
          if (isCurrentlyPlaying) {
            audio.pause();
            setIsPlaying(prev => {
              const updated = [...prev];
              updated[index] = false;
              return updated;
            });
          } else {
            audio.play();
            setIsPlaying(prev => {
              const updated = [...prev];
              updated[index] = true;
              return updated;
            });
          }
        }
      };
      

    const handleTimeUpdate = (index) => {
        const audio = audioRefs.current[index];
        if (audio) {
            setCurrentTime(prev => {
                const updated = [...prev];
                updated[index] = audio.currentTime;
                return updated;
            });
            setDuration(prev => {
                const updated = [...prev];
                updated[index] = audio.duration;
                return updated;
            });
        }
    };

    const handleProgressBarChange = (index, event) => {
        const audio = audioRefs.current[index];
        const newTime = (event.target.value / 100) * audio.duration;
        audio.currentTime = newTime; // Seek to new time position
    };

    return (
        <div className="min-h-screen bg-gray-100 flex flex-col max-w-full">
            <header className="w-full bg-gradient-to-r from-indigo-500 via-purple-500 to-indigo-600 text-white shadow-md">
              <div className="max-w-5xl mx-auto p-6 text-center">
                  <h1 className="text-4xl font-bold tracking-wide uppercase">
                      The NBAI Show
                  </h1>
                  <p className="text-lg text-gray-200 mt-2">
                      The basketball podcast entirely created and narrated by AI
                  </p>
              </div>
          </header>

          <div className="flex-1 flex flex-col">
              {/* Upper section: Latest Podcast */}
              {podcasts.length > 0 && (
  <div className="flex flex-col lg:flex-row bg-gray-800 text-white p-6 justify-center items-center lg:gap-16 gap-8 lg:h-[28rem] h-auto max-w-full">
    {/* Podcast Cover Art */}
    <div className="w-64 h-auto flex-none mb-6 lg:mb-0 lg:mr-8">
      <img
        src="/coverArt1.jpeg"
        alt="Podcast Cover Art"
        className="w-full h-full object-cover rounded-lg shadow-2xl transform hover:scale-105 transition duration-300 ease-in-out"
      />
    </div>

    {/* Right-side Content (Title, Description, Audio Player) */}
    <div className="flex-none w-full max-w-2xl mb-6 lg:mb-0">
      {/* Title for Latest Podcast */}
      <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-extrabold text-white mb-4 tracking-tight leading-tight text-center drop-shadow-lg">
        {new Date(podcasts[0].timestamp).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}
      </h2>

      {/* Podcast Info (Description only) */}
      <h3 className="text-xl sm:text-2xl font-semibold text-gray-300 text-center mb-6">
        {podcasts[0].Description}
      </h3>

      {/* Question (Subheading) */}
      {podcasts[0].Question && (
        <h4 className="text-lg sm:text-xl font-medium text-indigo-400 text-center italic mt-4 mb-6">
          "{podcasts[0].Question}"
        </h4>
      )}

      {/* Custom Audio Player */}
      <div className="w-full bg-gray-700 rounded-lg shadow-lg p-6 space-y-4 max-w-lg mx-auto">
        <div className="flex items-center justify-between space-x-6">
          {/* Play/Pause Button */}
          <button
          onClick={() => handlePlayButtonClick(0)}
          className="w-12 h-12 flex items-center justify-center bg-indigo-500 hover:bg-indigo-600 text-white rounded-full shadow-lg transition-transform transform hover:scale-110"
        >
          {isPlaying[0] ? (
            <div className="w-4 h-4 bg-white rounded-md"></div> // Pause Icon
          ) : (
            <div className="w-0 h-0 border-t-4 border-r-4 border-transparent border-t-white border-r-white transform rotate-45"></div> // Play Icon
          )}
        </button>

        {/* Progress Bar */}
        <input
          type="range"
          value={(currentTime[0] || 0) / (duration[0] || 1) * 100}
          onChange={(e) => handleProgressBarChange(0, e)}
          className="w-3/4 sm:w-2/3 md:w-1/2 lg:w-3/4 h-2 bg-gray-500 rounded-full cursor-pointer hover:bg-gray-400 transition duration-300"
        />


          {/* Time Display */}
          <span className="text-sm text-gray-300">
            {formatDuration(currentTime[0] || 0)} / {formatDuration(duration[0] || 0)}
          </span>
        </div>
      </div>
      <audio
      ref={el => (audioRefs.current[0] = el)}
      className="hidden"
      onTimeUpdate={() => handleTimeUpdate(0)}
    >
      <source src={podcasts[0].S3Url} type="audio/mpeg" />
    </audio>
    </div>
  </div>

)}






              {/* Bottom section: Podcast Queue */}
              <div className="flex-1 bg-gradient-to-r from-indigo-50 to-indigo-100 p-6 overflow-y-auto">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                      {podcasts.slice(1).map((podcast, index) => (
                          <div
                              key={podcast.podcast_id}
                              className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300 overflow-hidden"
                          >
                              {/* Card Content */}
                              <div className="flex items-center p-4">
                                  {/* Play Button */}
                                  <div
                                      onClick={() => handlePlayButtonClick(index + 1)}
                                      className="flex items-center justify-center w-12 h-12 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-full cursor-pointer shadow-md hover:scale-105 transform transition-transform"
                                  >
                                      {isPlaying[index + 1] ? (
                                          <div className="w-2.5 h-2.5 bg-white rounded-sm"></div> // Pause button
                                      ) : (
                                          <div className="w-4 h-4 border-t-8 border-r-8 border-transparent border-t-white border-r-white transform rotate-45"></div> // Play button
                                      )}
                                  </div>

                                  {/* Description */}
                                  <div className="ml-6">
                                      <p className="text-gray-900 font-extrabold text-xl leading-snug tracking-tight">
                                          {formatDateAndDescription(podcast.timestamp, podcast.Description)}
                                      </p>
                                      <p className="text-gray-600 text-sm mt-1 italic">
                                          {podcast.Question || "Will the Rockets bounce back?"}
                                      </p>
                                  </div>
                              </div>

                              {/* Progress Bar and Duration */}
                              <div className="px-4 pb-4">
                                  <div className="flex items-center space-x-4">
                                      <input
                                          type="range"
                                          value={(currentTime[index + 1] || 0) / (duration[index + 1] || 1) * 100}
                                          onChange={(e) => handleProgressBarChange(index + 1, e)}
                                          className="w-full h-2 bg-gray-300 rounded-lg cursor-pointer appearance-none"
                                      />
                                      <span className="text-sm text-gray-500">
                                          {formatDuration(currentTime[index + 1] || 0)} / {formatDuration(duration[index + 1] || 0)}
                                      </span>
                                  </div>
                              </div>

                              {/* Hidden audio element */}
                              <audio
                                  ref={el => (audioRefs.current[index + 1] = el)}
                                  className="hidden"
                                  onTimeUpdate={() => handleTimeUpdate(index + 1)}
                              >
                                  <source src={podcast.S3Url} type="audio/mpeg" />
                              </audio>
                          </div>
                      ))}
                  </div>
              </div>
          </div>
      </div>
  );
}

export default Testing;