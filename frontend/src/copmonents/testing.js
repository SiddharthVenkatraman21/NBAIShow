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
    
                // Set the podcasts state with the fetched data
                setPodcasts(podcastsData);
    
                // Initialize the state arrays for the audio players
                setCurrentTime(new Array(podcastsData.length).fill(0));
                setDuration(new Array(podcastsData.length).fill(0));
                setIsPlaying(new Array(podcastsData.length).fill(false));
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
        const audio = audioRefs.current[index];
        const isCurrentlyPlaying = isPlaying[index];

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
        <div className="min-h-screen bg-gray-100 flex flex-col">
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
  <div className="flex-none bg-gray-800 text-white flex flex-col justify-center items-center p-6"style={{ height: '28rem' }}>
    
    {/* Title for Latest Podcast */}
    <h2 className="text-5xl font-extrabold text-indigo-600 mb-6 tracking-tight leading-tight text-center">
  Latest Episode
</h2> {/* Stylish title */}


    <h3 className="text-3xl font-bold mb-4">
      {formatDateAndDescription(podcasts[0].timestamp, podcasts[0].Description)}
    </h3>

    {/* Custom Audio Player */}
    <div className="w-full max-w-lg bg-gray-700 rounded-lg shadow-lg p-4">
      <div className="flex items-center space-x-4">
        {/* Play/Pause Button */}
        <button
          onClick={() => handlePlayButtonClick(0)}
          className="w-10 h-10 flex items-center justify-center bg-indigo-500 hover:bg-indigo-600 text-white rounded-full shadow transition-transform transform hover:scale-110"
        >
          {isPlaying[0] ? (
            <div className="w-3 h-3 bg-white rounded-md"></div> // Pause Icon
          ) : (
            <div className="w-0 h-0 border-t-4 border-r-4 border-transparent border-t-white border-r-white transform rotate-45"></div> // Play Icon
          )}
        </button>

        {/* Progress Bar */}
        <input
          type="range"
          value={(currentTime[0] || 0) / (duration[0] || 1) * 100}
          onChange={(e) => handleProgressBarChange(0, e)}
          className="w-full h-2 bg-gray-500 rounded-lg cursor-pointer hover:bg-gray-400 appearance-none"
        />

        {/* Time Display */}
        <span className="text-sm text-gray-300">
          {formatDuration(currentTime[0] || 0)} / {formatDuration(duration[0] || 0)}
        </span>
      </div>
    </div>

    {/* Hidden audio element */}
    <audio
      ref={el => (audioRefs.current[0] = el)}
      className="hidden"
      onTimeUpdate={() => handleTimeUpdate(0)}
    >
      <source src={podcasts[0].S3Url} type="audio/mpeg" />
    </audio>
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
